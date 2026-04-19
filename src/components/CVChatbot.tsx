/**
 * CV Chatbot Component
 * Interactive AI chatbot for building CVs through conversation
 */

import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { Send, Sparkles, Download, Loader2, AlertCircle, CheckCircle2, X, ArrowLeft } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import api from '@/lib/api';
import { Button } from './ui/button';
import CompanyLogo from '@/assets/WhatsApp_Image_2025-10-17_at_13.05.55_6ba1ea04-removebg-preview (1).png';

interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
  id: string;
}

const CVChatbot: React.FC<{ onBack: () => void }> = ({ onBack }) => {
  const [sessionId, setSessionId] = useState<string>('');
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [completion, setCompletion] = useState(0);
  const [canGenerate, setCanGenerate] = useState(false);
  const [error, setError] = useState<string>('');
  const [isStarting, setIsStarting] = useState(true);
  const [isGenerating, setIsGenerating] = useState(false);
  const [showCompletionDialog, setShowCompletionDialog] = useState(false);
  const [hasShownCompletionDialog, setHasShownCompletionDialog] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const abortControllerRef = useRef<AbortController | null>(null);
  const completionRef = useRef(0);

  // Auto-scroll to bottom when new messages arrive (only if already at bottom)
  useEffect(() => {
    const container = messagesEndRef.current?.parentElement;
    if (container) {
      const isAtBottom = container.scrollHeight - container.scrollTop <= container.clientHeight + 150;
      if (isAtBottom) {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
      }
    }
  }, [messages]);

  // Smooth completion percentage animation
  useEffect(() => {
    const targetCompletion = completion;
    const startCompletion = completionRef.current;
    const duration = 500; // 500ms animation
    const startTime = Date.now();

    const animate = () => {
      const elapsed = Date.now() - startTime;
      const progress = Math.min(elapsed / duration, 1);
      
      // Ease-out animation
      const easeOut = 1 - Math.pow(1 - progress, 3);
      const currentCompletion = startCompletion + (targetCompletion - startCompletion) * easeOut;
      
      completionRef.current = currentCompletion;
      
      if (progress < 1) {
        requestAnimationFrame(animate);
      }
    };

    if (targetCompletion !== startCompletion) {
      requestAnimationFrame(animate);
    }
  }, [completion]);

  // Show completion dialog when progress hits 100% (only once)
  useEffect(() => {
    if (completion >= 100 && canGenerate && !hasShownCompletionDialog && !showCompletionDialog && !isGenerating) {
      // Small delay to ensure smooth transition
      const timer = setTimeout(() => {
        setShowCompletionDialog(true);
        setHasShownCompletionDialog(true);
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [completion, canGenerate, hasShownCompletionDialog, showCompletionDialog, isGenerating]);

  // Start session
  useEffect(() => {
    startChat();
    
    return () => {
      // Cleanup: abort any ongoing fetch requests
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
        abortControllerRef.current = null;
      }
    };
  }, []);

  const startChat = async () => {
    try {
      setIsStarting(true);
      setError('');
      
      const res = await api.post('/v1/chat/start', {
        initial_message: "Hi, I want to build my CV"
      });
      
      setSessionId(res.data.session_id);
      setMessages([
        { 
          role: 'assistant', 
          content: res.data.message,
          id: `msg-${Date.now()}`
        }
      ]);
      
      const initialCompletion = res.data.cv_completion || 0;
      completionRef.current = initialCompletion;
      setCompletion(initialCompletion);
      setCanGenerate(res.data.can_generate || false);
      setIsStarting(false);
    } catch (err: any) {
      console.error('Failed to start chat:', err);
      setError(err.response?.data?.detail || 'Failed to start chat. Please try again.');
      setIsStarting(false);
    }
  };

  const sendMessage = async () => {
    if (!input.trim() || loading || !sessionId) return;

    const userMessage = input.trim();
    const userMessageId = `msg-${Date.now()}`;
    
    setInput('');
    setError('');
    setMessages(prev => [...prev, { 
      role: 'user', 
      content: userMessage,
      id: userMessageId
    }]);
    setLoading(true);

    // Abort previous request if exists
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    // Create new AbortController for this request
    const abortController = new AbortController();
    abortControllerRef.current = abortController;

    try {

      // Get base URL from api instance
      const baseURL = api.defaults.baseURL || '';
      const token = localStorage.getItem('access_token');
      
      // Use fetch with POST method and proper headers
      const response = await fetch(`${baseURL}/v1/chat/message`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token || ''}`,
        },
        body: JSON.stringify({
          session_id: sessionId,
          message: userMessage,
        }),
        signal: abortController.signal,
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ detail: 'Request failed' }));
        throw new Error(errorData.detail || `HTTP error! status: ${response.status}`);
      }

      // Check if response is streaming (text/event-stream or text/plain)
      const contentType = response.headers.get('content-type') || '';
      const isStreaming = contentType.includes('text/event-stream') || contentType.includes('text/plain');

      if (isStreaming) {
        // Handle streaming response
        const reader = response.body?.getReader();
        const decoder = new TextDecoder();
        
        if (!reader) {
          throw new Error('No response body reader available');
        }

        let assistantMessage = '';
        let assistantMessageId = `msg-${Date.now() + 1}`;
        let hasStartedStreaming = false;
        let buffer = '';

        // Add assistant message placeholder
        setMessages(prev => [...prev, { 
          role: 'assistant', 
          content: '',
          id: assistantMessageId
        }]);
        hasStartedStreaming = true;

        while (true) {
          const { done, value } = await reader.read();
          
          if (done) break;

          buffer += decoder.decode(value, { stream: true });
          
          // Process complete lines (SSE format: "data: {...}\n\n")
          const lines = buffer.split('\n');
          buffer = lines.pop() || ''; // Keep incomplete line in buffer

          for (const line of lines) {
            if (line.startsWith('data: ')) {
              try {
                const data = JSON.parse(line.slice(6));
                
                if (data.type === 'message') {
                  assistantMessage += data.content || '';
                  setMessages(prev => prev.map(msg => 
                    msg.id === assistantMessageId
                      ? { ...msg, content: assistantMessage }
                      : msg
                  ));
                } else if (data.type === 'status') {
                  const newCompletion = data.completion || completion;
                  completionRef.current = newCompletion;
                  setCompletion(newCompletion);
                  setCanGenerate(data.can_generate || false);
                } else if (data.error) {
                  console.error('Server error:', data.error);
                  setError(data.error);
                }
              } catch (parseError) {
                console.error('Failed to parse SSE data:', parseError);
              }
            }
          }
        }

        // Process any remaining buffer
        if (buffer.trim()) {
          try {
            const data = JSON.parse(buffer);
            if (data.type === 'status') {
              const newCompletion = data.completion || completion;
              completionRef.current = newCompletion;
              setCompletion(newCompletion);
              setCanGenerate(data.can_generate || false);
            }
          } catch (e) {
            // Ignore parse errors for incomplete buffer
          }
        }

        setLoading(false);
      } else {
        // Handle non-streaming JSON response
        const data = await response.json();
        
        if (data.message) {
          setMessages(prev => [...prev, { 
            role: 'assistant', 
            content: data.message,
            id: `msg-${Date.now() + 1}`
          }]);
        }
        
        if (data.completion !== undefined) {
          completionRef.current = data.completion;
          setCompletion(data.completion);
        }
        
        if (data.can_generate !== undefined) {
          setCanGenerate(data.can_generate);
        }
        
        setLoading(false);
      }

      // Clear abort controller after request completes
      if (abortControllerRef.current === abortController) {
        abortControllerRef.current = null;
      }
    } catch (err: any) {
      // Ignore abort errors
      if (err.name === 'AbortError') {
        return;
      }
      console.error('Send message failed:', err);
      setError(err.message || err.response?.data?.detail || 'Failed to send message. Please try again.');
      setLoading(false);
      
      // Clear abort controller on error
      if (abortControllerRef.current === abortController) {
        abortControllerRef.current = null;
      }
    }
  };

  const base64ToBlob = (base64: string, type: string) => {
    const byteCharacters = atob(base64);
    const byteArrays = new Uint8Array(byteCharacters.length);
    for (let i = 0; i < byteCharacters.length; i++) {
      byteArrays[i] = byteCharacters.charCodeAt(i);
    }
    return new Blob([byteArrays], { type });
  };

  const generateCV = async () => {
    if (!sessionId || isGenerating) return;

    try {
      setIsGenerating(true);
      setError('');
      
      // Generate CV
      const res = await api.post('/v1/chat/generate-cv', { session_id: sessionId });
      
      // Store generated CV data
      const cvData = res.data.cv;
      if (cvData) {
        localStorage.setItem('generated_cv', JSON.stringify(cvData));
      } else {
        throw new Error('No CV data returned from server');
      }
      
      // Generate and download PDF
      const token = localStorage.getItem('access_token');
      const pdfRes = await api.post(
        '/build-cv/pdf',
        { cv: cvData },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        }
      );

      const pdfB64 = pdfRes.data?.pdf_base64;
      if (!pdfB64) {
        setError('PDF not returned from server');
        setIsGenerating(false);
        return;
      }

      // Convert base64 to blob and download
      const blob = base64ToBlob(pdfB64, 'application/pdf');
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${(cvData.name || cvData.personal_info?.full_name || 'CV').replace(/\s+/g, '_')}.pdf`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      ;
      setIsGenerating(false);
    } catch (err: any) {
      console.error('Generate CV failed:', err);
      setError(err.response?.data?.detail || err.message || 'Failed to generate CV. Please try again.');
      setIsGenerating(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  return (
    <div className="flex flex-col h-screen max-h-screen bg-white overflow-hidden font-sans">
      {/* Header */}
      <div className="px-6 py-4 flex items-center justify-between flex-shrink-0">
        <button 
          onClick={onBack}
          className="flex items-center gap-2 text-gray-900 font-bold hover:opacity-70 transition-opacity"
        >
          <div className="w-6 h-6 bg-blue-600 rounded-full flex items-center justify-center">
            <ArrowLeft className="w-4 h-4 text-white" strokeWidth={3} />
          </div>
          <span className="text-[14px]">Back</span>
        </button>
        
        <div className="flex items-center gap-2">
          <img src={CompanyLogo} alt="Scope AI" className="w-10 h-10 object-contain" />
          <span className="text-[24px] font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-blue-400 whitespace-nowrap">
            Scope AI
          </span>
        </div>

        <div className="text-[#3b82f6] text-[14px] font-bold">
          {Math.round(Math.min(completionRef.current, 100))}% Complete
        </div>
      </div>

      {/* Messages Container */}
      <div className="flex-1 overflow-y-auto px-6 py-8 space-y-8 bg-[#fcfdff]">
        {isStarting ? (
          <div className="flex flex-col items-center justify-center h-full gap-4">
            <div className="w-10 h-10 border-4 border-blue-600/20 border-t-blue-600 rounded-full animate-spin" />
            <p className="text-gray-400 font-medium text-[14px]">Initializing Scope Assistant...</p>
          </div>
        ) : (
          messages.map((msg, i) => (
            <div
              key={msg.id}
              className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'} items-start gap-3`}
            >
              {msg.role === 'assistant' && (
                <div className="w-8 h-8 rounded-lg bg-white border border-gray-100 flex items-center justify-center p-1 shadow-sm mt-1">
                  <img src={CompanyLogo} alt="AI" className="w-full h-full object-contain" />
                </div>
              )}
              
              <div className="flex flex-col gap-1 max-w-[80%] sm:max-w-xl">
                <div
                  className={`px-6 py-4 rounded-[22px] shadow-sm text-[14px] leading-relaxed font-medium ${
                    msg.role === 'user'
                      ? 'bg-[#f4f7f9] text-gray-600 rounded-tr-none'
                      : 'bg-white border border-gray-100 text-gray-700 rounded-tl-none'
                  }`}
                >
                  {msg.content}
                </div>
                {msg.role === 'assistant' && (
                  <span className="text-[11px] text-gray-300 font-medium ml-1">Scope Assistant</span>
                )}
              </div>
            </div>
          ))
        )}
        
        {/* Loading Indicator */}
        {loading && (
          <div className="flex justify-start items-start gap-3">
            <div className="w-8 h-8 rounded-lg bg-white border border-gray-100 flex items-center justify-center p-1 shadow-sm">
                <div className="w-4 h-4 border-2 border-blue-600/20 border-t-blue-600 rounded-full animate-spin" />
            </div>
            <div className="bg-white border border-gray-100 rounded-[22px] px-6 py-4 shadow-sm rounded-tl-none">
              <div className="flex gap-1.5 align-center">
                <div className="w-1.5 h-1.5 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                <div className="w-1.5 h-1.5 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                <div className="w-1.5 h-1.5 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
              </div>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="px-6 py-6 bg-white border-t border-gray-50 flex-shrink-0">
        <div className="max-w-5xl mx-auto relative flex items-center">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Type Your Message Here..."
            disabled={loading || isStarting || !sessionId}
            className="w-full bg-[#fcfdff] border border-gray-100 rounded-xl px-6 py-4 pr-16 text-[14px] font-medium focus:outline-none focus:border-blue-100 focus:shadow-[0_0_0_4px_rgba(59,130,246,0.03)] transition-all placeholder:text-gray-300"
          />
          <button
            onClick={sendMessage}
            disabled={loading || !input.trim() || isStarting || !sessionId}
            className="absolute right-3 bg-[#3b82f6] hover:bg-blue-600 text-white w-10 h-10 rounded-full flex items-center justify-center transition-all disabled:opacity-30 shadow-md shadow-blue-500/20"
          >
            {loading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Send className="w-4 h-4 fill-white" />
            )}
          </button>
        </div>
      </div>

      {/* Completion Dialog (Success Modal) */}
      <Dialog 
        open={showCompletionDialog} 
        onOpenChange={(open) => {
          setShowCompletionDialog(open);
          if (!open) {
            setHasShownCompletionDialog(true);
          }
        }}
      >
        <DialogContent className="sm:max-w-[420px] p-0 overflow-hidden rounded-[24px] border-none">
          <div className="bg-white p-10 flex flex-col items-center">
            <button 
              onClick={() => setShowCompletionDialog(false)}
              className="absolute top-5 right-5 text-gray-400 hover:text-gray-600 transition-colors"
            >
              <X className="w-6 h-6" />
            </button>

            {/* Custom Tick Markup Icon */}
            <div className="relative mb-6">
              <div className="w-[100px] h-[100px] flex items-center justify-center">
                {/* Wavy/Burst background */}
                <svg viewBox="0 0 100 100" className="absolute inset-0 w-full h-full text-[#22c55e]">
                   <path 
                    fill="currentColor" 
                    d="M50 0 L58 8 L69 4 L74 15 L85 15 L85 26 L96 31 L92 42 L100 50 L92 58 L96 69 L85 74 L85 85 L74 85 L69 96 L58 92 L50 100 L42 92 L31 96 L26 85 L15 85 L15 74 L4 69 L8 58 L0 50 L8 42 L4 31 L15 26 L15 15 L26 15 L31 4 L42 8 Z" 
                   />
                </svg>
                <motion.svg 
                  initial={{ pathLength: 0 }}
                  animate={{ pathLength: 1 }}
                  viewBox="0 0 50 50" 
                  className="w-12 h-12 text-white relative z-10"
                >
                  <motion.path 
                    d="M10 25 L20 35 L40 15" 
                    fill="none" 
                    stroke="currentColor" 
                    strokeWidth="6" 
                    strokeLinecap="round" 
                    strokeLinejoin="round" 
                  />
                </motion.svg>
              </div>
            </div>

            <h2 className="text-[20px] font-bold text-gray-900 mb-2">CV Complete!</h2>
            <p className="text-[13px] text-gray-400 font-medium text-center leading-relaxed mb-10 max-w-[280px]">
              Your CV Information Is Complete. You Can Now Generate And Download Your Professional CV.
            </p>

            <div className="grid grid-cols-1 gap-3 w-full">
              <Button
                variant="outline"
                onClick={() => setShowCompletionDialog(false)}
                className="w-full py-6 rounded-lg text-blue-500 border-blue-500 hover:bg-blue-50 font-bold text-[14px]"
              >
                Cancel
              </Button>
              <Button
                onClick={() => {
                  setShowCompletionDialog(false);
                  generateCV();
                }}
                className="w-full py-6 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-bold text-[14px] flex items-center justify-center gap-2"
              >
                <Sparkles className="w-4 h-4 fill-white" />
                Generate CV Now
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default CVChatbot;
