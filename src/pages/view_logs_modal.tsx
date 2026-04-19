// ✅ FIXED: View Logs component with proper existing automation support

"use client";

import { useEffect, useRef, useState } from "react";
import { 
  Loader2, X, CheckCircle2, AlertCircle, Clock, Eye,
  Zap, Trophy, Target, Award, Info, ExternalLink
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { toast } from "sonner";
import api from "@/lib/api";

interface AutomationLog {
  id: string;
  role: string;
  country: string;
  status: string;
  started_at: string;
  completed_at?: string;
  total_applied?: number;
  successful_applications?: number;
  failed_applications?: number;
  success_rate?: number;
  duration_seconds?: number;
  credits_used?: number;
}

interface SSEMessage {
  type: string;
  msg?: string;
  url?: string;
  ts: string;
  total_applied?: number;
  successful?: number;
  failed?: number;
  success_rate?: number;
  duration?: number;
  run_id?: string;
}

export default function ViewLogsModal() {
  const [open, setOpen] = useState(false);
  const [logs, setLogs] = useState<string[]>([]);
  const [proofs, setProofs] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [activeAutomation, setActiveAutomation] = useState<AutomationLog | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [completionStats, setCompletionStats] = useState<any>(null);
  
  const logBoxRef = useRef<HTMLDivElement | null>(null);
  const eventSourceRef = useRef<EventSource | null>(null);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const API_BASE = import.meta.env.VITE_API_URL?.replace(/\/+$/, "") || "http://127.0.0.1:8000";

  // Get user ID
  const getUserId = () => {
    try {
      const token = localStorage.getItem("access_token");
      if (!token) return null;
      
      const payload = JSON.parse(atob(token.split('.')[1]));
      return payload.sub;
    } catch (e) {
      console.error("Failed to decode token:", e);
      return null;
    }
  };

  // Add log message
  const addLog = (message: string) => {
    const timestamp = new Date().toLocaleTimeString();
    setLogs((prev) => {
      const newLog = `[${timestamp}] ${message}`;
      return [newLog, ...prev.slice(0, 99)];
    });
  };

  // Auto-scroll logs
  useEffect(() => {
    if (!logBoxRef.current) return;
    logBoxRef.current.scrollTop = logBoxRef.current.scrollHeight;
  }, [logs]);

  // ✅ FIXED: Check for existing automation when modal opens
  const checkActiveAutomation = async () => {
    try {
      setLoading(true);
      
      // Check automation status
      const statusResponse = await api.get("/v1/automation/status");
      
      if (statusResponse.data?.has_active) {
        const automation = statusResponse.data;
        setActiveAutomation(automation);
        
        addLog("🔍 Found active automation - connecting to live stream...");
        addLog(`📋 Role: "${automation.role}" in ${automation.country || 'Unknown'}`);
        addLog(`🚀 Started: ${new Date(automation.started_at).toLocaleTimeString()}`);
        addLog(`⚡ Status: ${automation.status}`);
        
        // Connect to SSE for live updates
        connectToSSE();
        
        return true;
      } else {
        // No active automation - load latest completed logs
        await loadLatestAutomationHistory();
        return false;
      }
      
    } catch (error: any) {
      console.error("Failed to check active automation:", error);
      addLog("❌ Failed to check automation status");
      
      // Fallback to loading history
      await loadLatestAutomationHistory();
      return false;
    } finally {
      setLoading(false);
    }
  };

  // ✅ Load latest automation history when no active automation
  const loadLatestAutomationHistory = async () => {
    try {
      addLog("📚 Loading latest automation history...");
      
      const historyResponse = await api.get("/v1/automation-logs/history?page=1&page_size=1");
      
      if (historyResponse.data?.logs && historyResponse.data.logs.length > 0) {
        const latestRun = historyResponse.data.logs[0];
        
        addLog(`📋 Latest Run: "${latestRun.role}" in ${latestRun.country}`);
        addLog(`📅 Started: ${new Date(latestRun.started_at).toLocaleString()}`);
        addLog(`⚡ Status: ${latestRun.status}`);
        
        if (latestRun.status === "completed") {
          addLog(`✅ Applied to ${latestRun.total_applied || 0} jobs`);
          addLog(`🎯 Success: ${latestRun.successful_applications || 0} jobs`);
          addLog(`❌ Failed: ${latestRun.failed_applications || 0} jobs`);
          addLog(`📊 Success Rate: ${latestRun.success_rate || 0}%`);
          
          if (latestRun.duration_seconds) {
            const minutes = Math.floor(latestRun.duration_seconds / 60);
            const seconds = latestRun.duration_seconds % 60;
            addLog(`⏱️ Duration: ${minutes}m ${seconds}s`);
          }
          
          // Set completion stats for display
          setCompletionStats({
            total_applied: latestRun.total_applied || 0,
            successful: latestRun.successful_applications || 0,
            failed: latestRun.failed_applications || 0,
            success_rate: latestRun.success_rate || 0,
            duration: latestRun.duration_seconds || 0
          });
          
        } else if (latestRun.status === "failed") {
          addLog(`❌ Automation failed: ${latestRun.error || "Unknown error"}`);
          addLog(`💳 Credits were automatically refunded`);
        } else {
          addLog(`ℹ️ Automation status: ${latestRun.status}`);
        }
        
        addLog("\n" + "=".repeat(50));
        addLog("💡 Start a new automation to see live progress!");
        addLog("=".repeat(50));
        
      } else {
        addLog("📭 No automation history found");
        addLog("💡 Start your first AI-powered job automation!");
      }
      
    } catch (error: any) {
      console.error("Failed to load automation history:", error);
      addLog("❌ Failed to load automation history");
      addLog("💡 Try starting a new automation to begin");
    }
  };

  // ✅ FIXED: SSE connection for live automation updates
  const connectToSSE = () => {
    const userId = getUserId();
    if (!userId) {
      addLog("❌ Authentication required");
      return;
    }

    // Cleanup existing connection
    if (eventSourceRef.current) {
      eventSourceRef.current.close();
      eventSourceRef.current = null;
    }

    try {
      addLog("📡 Connecting to automation stream...");
      
      const sseUrl = `${API_BASE}/v1/sse/stream?user_id=${userId}`;
      const eventSource = new EventSource(sseUrl);
      eventSourceRef.current = eventSource;

      eventSource.onopen = () => {
        setIsConnected(true);
        addLog("✅ Connected to live automation feed");
      };

      eventSource.onmessage = (event) => {
        try {
          const data: SSEMessage = JSON.parse(event.data);
          
          if (data.type === "connected") {
            setIsConnected(true);
            return;
          }
          
          if (data.type === "ping") {
            return;
          }

          // Handle different message types
          if (data.type === "proof" && data.url) {
            setProofs((p) => [...p, data.url]);
            addLog(`📸 ${data.msg || "Screenshot captured"}`);
          } 
          else if (data.type === "completion") {
            const stats = {
              total_applied: data.total_applied || 0,
              successful: data.successful || 0,
              failed: data.failed || 0,
              success_rate: data.success_rate || 0,
              duration: data.duration || 0
            };
            
            setCompletionStats(stats);
            setActiveAutomation(null);
            setIsConnected(false);
            
            addLog(`\n${"=".repeat(60)}`);
            addLog(`🎉 AI AUTOMATION COMPLETED!`);
            addLog(`${"=".repeat(60)}`);
            addLog(`📊 Results Summary:`);
            addLog(`   ✅ Successfully Applied: ${stats.successful} jobs`);
            addLog(`   ❌ Failed Applications: ${stats.failed} jobs`);
            addLog(`   📈 Success Rate: ${stats.success_rate}%`);
            addLog(`   ⏱️  Duration: ${Math.floor(stats.duration / 60)}m ${stats.duration % 60}s`);
            
            if (stats.failed > 0) {
              addLog(`   💳 Credits automatically refunded for ${stats.failed} failed applications`);
            }
            
            addLog(`${"=".repeat(60)}\n`);
            
            // Show success notification
            if (stats.failed === 0) {
              toast.success(`🎉 Perfect! Applied to all ${stats.successful} jobs!`, {
                description: `Success rate: 100% | Duration: ${Math.floor(stats.duration / 60)}m ${stats.duration % 60}s`,
                duration: 5000,
              });
            } else {
              toast.success(`🎉 Applied to ${stats.successful} jobs!`, {
                description: `${stats.failed} failed (credits refunded). Success rate: ${stats.success_rate}%`,
                duration: 5000,
              });
            }
            
            // Close SSE connection
            if (eventSourceRef.current) {
              eventSourceRef.current.close();
              eventSourceRef.current = null;
            }
          }
          else if (data.type === "done") {
            addLog(`✅ ${data.msg || "Automation completed"}`);
            setActiveAutomation(null);
            setIsConnected(false);
          } 
          else if (data.type === "error") {
            addLog(`❌ ${data.msg || "Automation error"}`);
            setActiveAutomation(null);
            setIsConnected(false);
            toast.error(`❌ Automation failed: ${data.msg}`);
          } 
          else if (data.type === "warning") {
            addLog(`⚠️ ${data.msg || "Warning"}`);
          }
          else if (data.msg) {
            addLog(data.msg);
          }
        } catch (e) {
          console.error("Failed to parse SSE message:", e);
          addLog("⚠️ Error parsing server message");
        }
      };

      eventSource.onerror = (error) => {
        console.error("SSE Connection error:", error);
        setIsConnected(false);
        addLog("⚠️ Connection to automation stream interrupted");
        
        if (eventSourceRef.current) {
          eventSourceRef.current.close();
          eventSourceRef.current = null;
        }

        // Try to reconnect for active automations
        if (activeAutomation) {
          addLog("🔄 Attempting to reconnect in 5 seconds...");
          reconnectTimeoutRef.current = setTimeout(() => {
            connectToSSE();
          }, 5000);
        }
      };
      
    } catch (error) {
      console.error("Failed to establish SSE connection:", error);
      addLog("❌ Failed to connect to automation stream");
    }
  };

  // ✅ Initialize when modal opens
  useEffect(() => {
    if (open) {
      setLogs([]);
      setProofs([]);
      setCompletionStats(null);
      setActiveAutomation(null);
      setIsConnected(false);
      
      checkActiveAutomation();
    } else {
      // Cleanup when modal closes
      if (eventSourceRef.current) {
        eventSourceRef.current.close();
        eventSourceRef.current = null;
      }
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
        reconnectTimeoutRef.current = null;
      }
    }
  }, [open]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (eventSourceRef.current) {
        eventSourceRef.current.close();
      }
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
      }
    };
  }, []);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" className="flex items-center gap-2">
          <Eye className="h-4 w-4" />
          View Logs
        </Button>
      </DialogTrigger>

      <DialogContent className="max-w-5xl max-h-[90vh] overflow-hidden flex flex-col">
        <div className="flex items-center gap-3 mb-4 flex-shrink-0">
          <div className="w-10 h-10 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
            <Eye className="h-5 w-5 text-white" />
          </div>
          <div className="flex-1">
            <DialogTitle className="text-xl font-bold">
              {activeAutomation ? "Live Automation Logs" : "Automation History"}
            </DialogTitle>
            <DialogDescription>
              {activeAutomation 
                ? `Real-time progress for "${activeAutomation.role}" automation`
                : "View latest automation logs and results"
              }
            </DialogDescription>
          </div>
          
          {/* Connection Status */}
          <div className="flex items-center gap-2 text-sm">
            {activeAutomation && (
              <>
                <div className={`w-2 h-2 rounded-full ${isConnected ? 'bg-green-500 animate-pulse' : 'bg-red-500'}`}></div>
                <span className={isConnected ? 'text-green-600' : 'text-red-600'}>
                  {isConnected ? 'Connected' : 'Disconnected'}
                </span>
              </>
            )}
          </div>
        </div>

        <div className="flex-1 overflow-hidden flex flex-col min-h-0">
          {/* Active Automation Info */}
          {activeAutomation && (
            <div className="bg-gradient-to-r from-blue-50 to-purple-50 border-2 border-blue-200 rounded-xl p-4 mb-4 flex-shrink-0">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full flex items-center justify-center animate-pulse">
                  <Zap className="h-5 w-5 text-white" />
                </div>
                <div className="flex-1">
                  <h4 className="font-semibold text-gray-900">
                    🚀 "{activeAutomation.role}" Automation Running
                  </h4>
                  <p className="text-sm text-gray-700">
                    Started {new Date(activeAutomation.started_at).toLocaleTimeString()} • 
                    Status: {activeAutomation.status} • 
                    {activeAutomation.country && `Location: ${activeAutomation.country}`}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Completion Stats */}
          {completionStats && (
            <div className="bg-gradient-to-br from-green-50 to-blue-50 border-2 border-green-200 rounded-xl p-6 mb-4 flex-shrink-0">
              <div className="flex items-center gap-4 mb-4">
                <div className="w-12 h-12 bg-gradient-to-r from-green-600 to-blue-600 rounded-2xl flex items-center justify-center">
                  <Trophy className="h-6 w-6 text-white" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-gray-900">Automation Completed! 🎉</h3>
                  <p className="text-sm text-gray-700">Latest automation results</p>
                </div>
              </div>
              
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="bg-white/70 rounded-lg p-3 text-center">
                  <div className="text-xl font-bold text-gray-900">{completionStats.total_applied}</div>
                  <div className="text-xs text-gray-600">Total Jobs</div>
                </div>
                <div className="bg-white/70 rounded-lg p-3 text-center">
                  <div className="text-xl font-bold text-green-600">{completionStats.successful}</div>
                  <div className="text-xs text-gray-600">Successful</div>
                </div>
                <div className="bg-white/70 rounded-lg p-3 text-center">
                  <div className="text-xl font-bold text-red-600">{completionStats.failed}</div>
                  <div className="text-xs text-gray-600">Failed</div>
                </div>
                <div className="bg-white/70 rounded-lg p-3 text-center">
                  <div className="text-xl font-bold text-purple-600">{completionStats.success_rate}%</div>
                  <div className="text-xs text-gray-600">Success Rate</div>
                </div>
              </div>
            </div>
          )}

          {/* Loading State */}
          {loading && (
            <div className="flex items-center justify-center py-8">
              <div className="flex items-center gap-3">
                <Loader2 className="h-6 w-6 animate-spin text-purple-600" />
                <span className="text-gray-700">Checking automation status...</span>
              </div>
            </div>
          )}

          {/* Logs Display */}
          <div className="flex-1 overflow-hidden flex flex-col min-h-0">
            <div className="flex items-center justify-between mb-3 flex-shrink-0">
              <h3 className="font-medium text-gray-900">
                {activeAutomation ? "Live Automation Logs" : "Latest Automation Logs"}
              </h3>
              {activeAutomation && (
                <Button
                  size="sm"
                  variant="outline"
                  onClick={connectToSSE}
                  disabled={isConnected}
                >
                  {isConnected ? "Connected" : "Reconnect"}
                </Button>
              )}
            </div>
            
            <div
              ref={logBoxRef}
              className="flex-1 bg-gray-900 text-green-400 p-4 rounded-lg font-mono text-xs overflow-y-auto"
            >
              {logs.length === 0 ? (
                <p className="text-gray-500">
                  {loading ? "Loading automation logs..." : "No recent automation logs found. Start an automation to see live progress!"}
                </p>
              ) : (
                logs.map((log, i) => (
                  <div key={i} className="mb-1 whitespace-pre-wrap">
                    {log}
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Proofs Gallery */}
          {proofs.length > 0 && (
            <div className="mt-4 flex-shrink-0">
              <h4 className="font-medium mb-2">Application Proofs ({proofs.length})</h4>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-2 max-h-32 overflow-y-auto">
                {proofs.map((proof, i) => (
                  <a
                    key={i}
                    href={proof}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block relative group"
                  >
                    <img
                      src={proof}
                      alt={`Application proof ${i + 1}`}
                      className="w-full h-20 object-cover rounded border hover:border-purple-400 transition-colors"
                    />
                    <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 transition-all duration-200 rounded flex items-center justify-center">
                      <ExternalLink className="h-4 w-4 text-white opacity-0 group-hover:opacity-100 transition-opacity" />
                    </div>
                  </a>
                ))}
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}