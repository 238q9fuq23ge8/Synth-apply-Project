// src/hooks/useAutomationSSE.tsx
import { useEffect, useRef, useCallback } from 'react';
import { EventSourcePolyfill } from 'event-source-polyfill';
import { useAutomation } from '@/contexts/AutomationContext';
import { toast } from 'sonner';

interface SSEMessage {
  type: string;
  msg?: string;
  user_id?: string;
  run_id?: string;
  url?: string;
  [key: string]: any;
}

interface UseAutomationSSEProps {
  onMessage?: (message: SSEMessage) => void;
  onComplete?: () => void;
  onError?: (error: any) => void;
  autoConnect?: boolean;
}

export function useAutomationSSE({
  onMessage,
  onComplete,
  onError,
  autoConnect = false
}: UseAutomationSSEProps = {}) {
  const eventSourceRef = useRef<EventSourcePolyfill | null>(null);
  const { status, clearRunning } = useAutomation();
  const isConnectedRef = useRef(false);

  const connect = useCallback(() => {
    // Don't connect if no automation running
    if (!status.is_running || !status.run_id) {
      console.log('⚠️ No active automation to connect to');
      return;
    }

    // Don't connect if already connected
    if (isConnectedRef.current && eventSourceRef.current) {
      console.log('⚠️ SSE already connected');
      return;
    }

    const token = localStorage.getItem('access_token');
    const userStr = localStorage.getItem('user');
    
    if (!token || !userStr) {
      console.error('❌ No auth credentials for SSE');
      return;
    }

    const user = JSON.parse(userStr);
    const userId = user?.id;

    if (!userId) {
      console.error('❌ No user ID for SSE');
      return;
    }

    const apiUrl = import.meta.env.VITE_API_URL || 'https://forestry-penguin-refine-relax.trycloudflare.com';
    const sseUrl = `${apiUrl}/v1/sse/stream?user_id=${userId}`;

    console.log(`🔌 Connecting to SSE for run: ${status.run_id}`);

    const headers: Record<string, string> = {
      'Authorization': `Bearer ${token}`,
    };

    if (apiUrl.includes('ngrok') || apiUrl.includes('trycloudflare')) {
      headers['ngrok-skip-browser-warning'] = '69420';
    }

    try {
      const evtSource = new EventSourcePolyfill(sseUrl, {
        headers,
        heartbeatTimeout: 120000,
        withCredentials: false,
      });

      evtSource.onopen = () => {
        console.log('✅ SSE Connected to automation stream');
        isConnectedRef.current = true;
        toast.success('Connected to automation stream', { duration: 2000 });
      };

      evtSource.onmessage = (event) => {
        try {
          const data: SSEMessage = JSON.parse(event.data);
          
          // Ignore pings and connections
          if (data.type === 'ping' || data.type === 'connected') {
            return;
          }

          // Filter by run_id to only get messages for current automation
          if (data.run_id && data.run_id !== status.run_id) {
            return;
          }

          console.log('📨 SSE Message:', data.type, data);

          // Call custom handler
          if (onMessage) {
            onMessage(data);
          }

          // Handle completion
          if (data.type === 'completion') {
            console.log('🎉 Automation completed via SSE');
            clearRunning();
            
            if (onComplete) {
              onComplete();
            }
            
            // Disconnect after completion
            disconnect();
          }

          // Handle errors
          if (data.type === 'error') {
            console.error('❌ Automation error via SSE:', data.msg);
            
            if (onError) {
              onError(data);
            }
          }
        } catch (err) {
          console.error('❌ SSE parse error:', err);
        }
      };

      evtSource.onerror = (err) => {
        console.error('❌ SSE error:', err);
        isConnectedRef.current = false;
        
        if (evtSource.readyState === 2) {
          console.log('🔌 SSE connection closed');
        }
      };

      eventSourceRef.current = evtSource;
    } catch (err) {
      console.error('❌ Failed to create SSE connection:', err);
      isConnectedRef.current = false;
    }
  }, [status, onMessage, onComplete, onError, clearRunning]);

  const disconnect = useCallback(() => {
    if (eventSourceRef.current) {
      console.log('🔌 Disconnecting SSE');
      eventSourceRef.current.close();
      eventSourceRef.current = null;
      isConnectedRef.current = false;
    }
  }, []);

  // Auto-connect if requested
  useEffect(() => {
    if (autoConnect && status.is_running) {
      connect();
    }

    return () => {
      disconnect();
    };
  }, [autoConnect, status.is_running, connect, disconnect]);

  return {
    connect,
    disconnect,
    isConnected: isConnectedRef.current,
  };
}