// ✅ UPDATED: AutomateModal with Scrollable Jobs + Purchase Button for Credits

// src/components/AutomateModal-Updated.tsx
"use client";

import { useNavigate } from "react-router-dom";
import { useEffect, useRef, useState, useMemo, useCallback } from "react";
import { useAutomationSSE } from "@/hooks/useAutomationSSE";
import { useAutomation } from "@/contexts/AutomationContext";
import {
  Loader2,
  Search,
  Sparkles,
  X,
  CheckCircle2,
  AlertCircle,
  Briefcase,
  MapPin,
  TrendingUp,
  ExternalLink,
  Check,
  PartyPopper,
  Clock,
  Target,
  Award,
  Info,
  Upload,
  Trophy,
  Star,
  Zap,
  Brain,
  BarChart3,
  ArrowRight,
  CreditCard,
  ShoppingCart,
  Activity,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { useAutomationStore } from "@/store/automationStore";

import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { toast } from "sonner";
import api from "@/lib/api";

const COUNTRIES = [
  "Argentina",
  "Australia",
  "Austria",
  "Bangladesh",
  "Belgium",
  "Brazil",
  "Canada",
  "Chile",
  "China",
  "Colombia",
  "Czech Republic",
  "Denmark",
  "Egypt",
  "Finland",
  "France",
  "Germany",
  "Greece",
  "Hong Kong",
  "Hungary",
  "India",
  "Indonesia",
  "Ireland",
  "Israel",
  "Italy",
  "Japan",
  "Kenya",
  "Kuwait",
  "Malaysia",
  "Mexico",
  "Morocco",
  "Netherlands",
  "New Zealand",
  "Nigeria",
  "Norway",
  "Pakistan",
  "Philippines",
  "Poland",
  "Portugal",
  "Qatar",
  "Romania",
  "Russia",
  "Saudi Arabia",
  "Serbia",
  "Singapore",
  "Slovakia",
  "South Africa",
  "Spain",
  "Sri Lanka",
  "Sweden",
  "Switzerland",
  "Taiwan",
  "Thailand",
  "Turkey",
  "Ukraine",
  "United Arab Emirates",
  "United Kingdom",
  "United States",
  "Uruguay",
  "Vietnam",
  "Zimbabwe",
  "Remote",
];

// ✅ FIXED: Lower match percentages for better results
const MATCH_PERCENTAGES = [
  "10",
  "15",
  "20",
  "25",
  "30",
  "35",
  "40",
  "50",
  "60",
  "70",
  "80",
];

type SSEMessage =
  | { type: "info"; msg: string; ts: string }
  | { type: "proof"; msg: string; url: string; ts: string }
  | { type: "done"; msg: string; ts: string }
  | {
    type: "completion";
    msg: string;
    run_id: string;
    total_applied: number;
    successful: number;
    failed: number;
    success_rate: number;
    duration: number;
    ts: string;
  }
  | {
    type: "warning";
    msg: string;
    refund_pending?: boolean;
    refund_issued?: boolean;
    ts: string;
  }
  | { type: "error"; msg: string; ts: string }
  | { type: "connected"; user_id: string; connection_id?: string; ts: string }
  | { type: "ping"; connection_id?: string; ts: string };

interface Job {
  id: string;
  title: string;
  company: string;
  location?: string;
  url: string;
  snippet?: string;
  score: number;
  source?: string;
  // Enhanced AI metadata
  quality?: "excellent" | "good" | "fair" | "poor";
  match_reasons?: string[];
  score_breakdown?: {
    semantic: number;
    keyword: number;
    title: number;
    context: number;
  };
}

interface AutomationStats {
  total_applied: number;
  successful: number;
  failed: number;
  success_rate: number;
  duration: number;
}

interface CVInfo {
  id: string;
  file_name: string;
  has_parsed_data: boolean;
  needs_parsing: boolean;
  validation_status: string;
}

interface AutomateModalProps {
  cvId?: string;
  token: string;
  onAutomationDone?: (finalLogs: string[], stats?: AutomationStats) => void;
}

// ✅ IMPROVED: Progress component with job count display
function JobSearchProgress({
  current,
  total,
  phase,
}: {
  current: number;
  total: number;
  phase: string;
}) {
  const percentage = total > 0 ? (current / total) * 100 : 0;
  const [messageIndex, setMessageIndex] = useState(0);

  const searchMessages = [
    "🔍 Scanning job boards across the web...",
    "🤖 AI analyzing job requirements...",
    "💼 Finding the best matches for you...",
    "🎯 Filtering jobs by your criteria...",
    "✨ Discovering opportunities...",
    "🚀 Almost there, hang tight!",
  ];

  useEffect(() => {
    if (percentage < 100) {
      const interval = setInterval(() => {
        setMessageIndex((prev) => (prev + 1) % searchMessages.length);
      }, 3000); // Change message every 3 seconds
      return () => clearInterval(interval);
    }
  }, [percentage]);

  return (
    <div className="space-y-3 p-4 bg-gradient-to-r from-blue-50 to-purple-50 border-2 border-blue-300 rounded-lg shadow-sm">
      <div className="flex items-center justify-between text-sm">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
          <span className="font-semibold text-gray-800">{phase}</span>
        </div>
        <span className="text-purple-600 font-bold text-base">
          {current}/{total}
        </span>
      </div>

      <div className="w-full bg-gray-200 rounded-full h-4 overflow-hidden shadow-inner">
        <div
          className="h-full bg-gradient-to-r from-purple-500 via-blue-500 to-purple-500 transition-all duration-500 ease-out rounded-full relative animate-pulse"
          style={{ width: `${percentage}%` }}
        >
          <div className="absolute inset-0 bg-white/30 animate-shimmer"></div>
        </div>
      </div>

      <div className="text-sm text-gray-700 text-center font-medium">
        {percentage < 100 ? (
          <div className="flex items-center justify-center gap-2">
            <Loader2 className="h-4 w-4 animate-spin text-purple-600" />
            <span className="animate-pulse">
              {searchMessages[messageIndex]}
            </span>
          </div>
        ) : (
          <div className="flex items-center justify-center gap-2">
            <CheckCircle2 className="h-4 w-4 text-green-600" />
            <span className="text-green-700 font-semibold">
              Analysis complete! ✨
            </span>
          </div>
        )}
      </div>

      {percentage < 100 && (
        <div className="text-xs text-center text-gray-500 italic">
          We're actively searching - this may take a moment
        </div>
      )}
    </div>
  );
}

// SSE Hook (keep the same - it's working)
function useSSEConnection(
  isRunning: boolean,
  userId: string | null,
  API_BASE: string,
  addLog: (msg: string) => void,
  setProofs: React.Dispatch<React.SetStateAction<string[]>>,
  setIsCompleted: React.Dispatch<React.SetStateAction<boolean>>,
  setIsRunning: React.Dispatch<React.SetStateAction<boolean>>,
  setIsFailed: React.Dispatch<React.SetStateAction<boolean>>,
  setError: React.Dispatch<React.SetStateAction<string>>,
  setCompletionStats: React.Dispatch<
    React.SetStateAction<AutomationStats | null>
  >,
  setMessage: React.Dispatch<React.SetStateAction<string>>,
  onAutomationDone?: (finalLogs: string[], stats?: AutomationStats) => void
) {
  const eventSourceRef = useRef<EventSource | null>(null);
  const connectionIdRef = useRef<string | null>(null);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const reconnectAttemptsRef = useRef(0);

  useEffect(() => {
    if (!isRunning || !userId) {
      return;
    }

    if (eventSourceRef.current) {
      console.log("⚠️ SSE connection already exists, skipping");
      return;
    }

    console.log("🔗 Creating SSE connection for automation tracking");
    addLog("📡 Connecting to automation stream...");

    const sseUrl = `${API_BASE}/v1/sse/stream?user_id=${userId}`;
    const evt = new EventSource(sseUrl);
    eventSourceRef.current = evt;

    evt.onopen = () => {
      addLog("✅ Connected to live automation feed");
      console.log("✅ SSE Connected for automation tracking");
      reconnectAttemptsRef.current = 0;
    };

    evt.onmessage = (event) => {
      try {
        const data: SSEMessage = JSON.parse(event.data);

        console.log("📨 Automation SSE event:", data.type);

        if (data.type === "connected") {
          console.log(`🔗 Connection confirmed (ID: ${data.connection_id})`);
          connectionIdRef.current = data.connection_id || null;
          return;
        }

        if (data.type === "ping") {
          return;
        }

        if (data.type === "proof" && data.url) {
          setProofs((p) => [...p, data.url]);
          addLog(`📸 ${data.msg}`);
        } else if (data.type === "completion") {
          const stats: AutomationStats = {
            total_applied: data.total_applied,
            successful: data.successful,
            failed: data.failed,
            success_rate: data.success_rate,
            duration: data.duration,
          };

          console.log("🎯 Automation completed:", stats);

          setCompletionStats(stats);
          setIsCompleted(true);
          setIsRunning(false);

          addLog(`\n${"=".repeat(60)}`);
          addLog(`🎉 AI-POWERED AUTOMATION COMPLETED!`);
          addLog(`${"=".repeat(60)}`);
          addLog(`📊 Results Summary:`);
          addLog(`   ✅ Successfully Applied: ${stats.successful} jobs`);
          addLog(`   ❌ Failed Applications: ${stats.failed} jobs`);
          addLog(`   📈 Success Rate: ${stats.success_rate}%`);
          addLog(
            `   ⏱️  Total Duration: ${Math.floor(stats.duration / 60)}m ${stats.duration % 60
            }s`
          );

          if (stats.failed > 0) {
            addLog(
              `   💳 Credits automatically refunded for ${stats.failed} failed applications`
            );
          }

          addLog(`${"=".repeat(60)}\n`);
          addLog(
            `💡 Tip: Check your dashboard for detailed application history`
          );

          setMessage("✅ AI-powered automation completed successfully!");

          if (onAutomationDone) {
            onAutomationDone([], stats);
          }

          localStorage.setItem("last_automation_stats", JSON.stringify(stats));

          // Enhanced success notifications
          if (stats.failed === 0) {
            toast.success(
              `🎉 Perfect! AI applied to all ${stats.successful} jobs!`,
              {
                description: `Success rate: 100% | Duration: ${Math.floor(
                  stats.duration / 60
                )}m ${stats.duration % 60}s`,
                duration: 5000,
              }
            );
          } else if (stats.success_rate >= 70) {
            toast.success(`🎉 AI applied to ${stats.successful} jobs!`, {
              description: `${stats.failed} failed (credits refunded). Success rate: ${stats.success_rate}%`,
              duration: 5000,
            });
          } else {
            toast.warning(
              `⚠️ AI applied to ${stats.successful} of ${stats.total_applied} jobs`,
              {
                description: `${stats.failed} failed. Credits refunded. Success rate: ${stats.success_rate}%`,
                duration: 6000,
              }
            );
          }

          setTimeout(() => {
            window.dispatchEvent(new Event("automation-completed"));
          }, 1000);
        } else if (data.type === "warning") {
          addLog(`⚠️ ${data.msg}`);

          if (data.refund_pending || data.refund_issued) {
            toast.info("💳 Credits will be refunded for failed applications");
          }
        } else if (data.type === "done") {
          addLog(`✅ ${data.msg}`);
          setIsCompleted(true);
          setIsRunning(false);
          toast.success("🎉 AI automation finished!");
        } else if (data.type === "error") {
          addLog(`❌ ${data.msg}`);
          setIsRunning(false);
          setIsFailed(true);
          setError(data.msg);
          toast.error(`❌ Automation failed: ${data.msg}`);
        } else if (data.msg) {
          addLog(data.msg);
        }
      } catch (e) {
        console.error("Failed to parse SSE message:", e);
        addLog("⚠️ Error parsing server message");
      }
    };

    evt.onerror = (error) => {
      console.error("❌ SSE Connection error:", error);
      addLog("⚠️ Connection to automation stream closed");

      if (eventSourceRef.current) {
        eventSourceRef.current.close();
        eventSourceRef.current = null;
      }

      if (isRunning && reconnectAttemptsRef.current < 3) {
        reconnectAttemptsRef.current++;
        console.log(
          `🔄 Retrying SSE connection (attempt ${reconnectAttemptsRef.current})`
        );
        addLog(
          `🔄 Reconnecting to automation stream (attempt ${reconnectAttemptsRef.current})...`
        );

        reconnectTimeoutRef.current = setTimeout(() => {
          setIsRunning((prev) => prev);
        }, 5000 * reconnectAttemptsRef.current);
      }
    };

    return () => {
      console.log(`🔌 Cleaning up automation SSE connection`);

      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
        reconnectTimeoutRef.current = null;
      }

      if (eventSourceRef.current) {
        eventSourceRef.current.close();
        eventSourceRef.current = null;
      }
      connectionIdRef.current = null;
    };
  }, [isRunning, userId, API_BASE]);

  useEffect(() => {
    return () => {
      if (eventSourceRef.current) {
        console.log("🔌 Component unmounting - closing automation SSE");
        eventSourceRef.current.close();
        eventSourceRef.current = null;
      }
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
      }
    };
  }, []);
}

export default function AutomateModal({
  cvId: propCvId,
  token,
  onAutomationDone,
}: AutomateModalProps) {
  // Modal state
  const [open, setOpen] = useState(false);
  const { status } = useAutomationStore();
  // ✅ ADD: Use automation context
  const { status: automationStatus, setRunning: setAutomationRunning } =
    useAutomation();

  const navigate = useNavigate();

  // CV state management
  const [currentCvId, setCurrentCvId] = useState<string>("");
  const [cvInfo, setCvInfo] = useState<CVInfo | null>(null);
  const [cvLoading, setCvLoading] = useState(false);
  const [cvError, setCvError] = useState("");

  // Form inputs
  const [role, setRole] = useState("");
  const [country, setCountry] = useState("");
  const [maxJobs, setMaxJobs] = useState("5");

  // AI Scoring Options
  const [useAIScoring, setUseAIScoring] = useState(true);
  const [useLLMBoost, setUseLLMBoost] = useState(false);

  // Workflow stages
  const [stage, setStage] = useState<"form" | "jobs" | "automation">("form");

  // Jobs state
  const [jobs, setJobs] = useState<Job[]>([]);
  const [selectedJobIds, setSelectedJobIds] = useState<Set<string>>(new Set());
  const [loadingJobs, setLoadingJobs] = useState(false);

  // Progress tracking
  const [jobSearchProgress, setJobSearchProgress] = useState({
    current: 0,
    total: 0,
    phase: "Initializing...",
  });

  // Automation state
  const [logs, setLogs] = useState<string[]>([]);
  const [proofs, setProofs] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [isRunning, setIsRunning] = useState(false);
  const [isCompleted, setIsCompleted] = useState(false);
  const [isFailed, setIsFailed] = useState(false);
  const [completionStats, setCompletionStats] =
    useState<AutomationStats | null>(null);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [runId, setRunId] = useState<string>("");
  const [actorRunId, setActorRunId] = useState<string>("");
  const [estimatedTimeRemaining, setEstimatedTimeRemaining] = useState<
    number | null
  >(null);
  const [automationStartTime, setAutomationStartTime] = useState<number | null>(
    null
  );
  const [progressMessage, setProgressMessage] = useState<string>("");

  const logBoxRef = useRef<HTMLDivElement | null>(null);

  const API_BASE =
    import.meta.env.VITE_API_URL?.replace(/\/+$/, "") ||
    "http://127.0.0.1:8000";

  // Progress messages to show automation is active
  const progressMessages = [
    "🔍 Analyzing job requirements and company culture...",
    "📝 Preparing tailored application materials...",
    "🤖 AI crafting personalized cover letters...",
    "✍️ Intelligently filling out application forms...",
    "📧 Submitting applications securely...",
    "✅ Verifying successful submissions...",
    "🔄 Processing next application in queue...",
    "💼 Matching your skills to job requirements...",
    "🎯 Optimizing application strategy for best results...",
    "🧠 AI reviewing job description for key points...",
    "💡 Highlighting your relevant experience...",
    "📊 Analyzing company needs vs. your profile...",
    "🚀 Automating repetitive form fields...",
    "🎨 Customizing your pitch for this role...",
    "⚡ Working through applications efficiently...",
  ];

  // Update progress message and ETA while automation is running
  useEffect(() => {
    if (!isRunning || isCompleted || isFailed) {
      return;
    }

    // Set start time when automation starts
    if (!automationStartTime) {
      setAutomationStartTime(Date.now());
    }

    const messageInterval = setInterval(() => {
      // Rotate through progress messages
      setProgressMessage(
        progressMessages[Math.floor(Math.random() * progressMessages.length)]
      );
    }, 4000); // Change message every 4 seconds

    const etaInterval = setInterval(() => {
      if (automationStartTime) {
        const elapsed = Date.now() - automationStartTime;
        // Estimate ~45 seconds per job on average
        const estimatedTotalTime = selectedJobIds.size * 45 * 1000;
        const remaining = Math.max(0, estimatedTotalTime - elapsed);
        setEstimatedTimeRemaining(remaining);
      }
    }, 1000); // Update ETA every second

    return () => {
      clearInterval(messageInterval);
      clearInterval(etaInterval);
    };
  }, [
    isRunning,
    isCompleted,
    isFailed,
    automationStartTime,
    selectedJobIds.size,
  ]);

  // Get user ID
  const userId = useMemo(() => {
    try {
      const token = localStorage.getItem("access_token");
      if (!token) return null;

      const payload = JSON.parse(atob(token.split(".")[1]));
      return payload.sub;
    } catch (e) {
      console.error("Failed to decode token:", e);
      return null;
    }
  }, []);

  // Stable addLog function
  const addLog = useCallback((message: string) => {
    const timestamp = new Date().toLocaleTimeString();
    setLogs((prev) => {
      const newLog = `[${timestamp}] ${message}`;
      const updatedLogs = [newLog, ...prev.slice(0, 99)];
      return updatedLogs;
    });
  }, []);

  // Use SSE hook
  useSSEConnection(
    isRunning,
    userId,
    API_BASE,
    addLog,
    setProofs,
    setIsCompleted,
    setIsRunning,
    setIsFailed,
    setError,
    setCompletionStats,
    setMessage,
    onAutomationDone
  );

  // Initialize CV from localStorage or props (same as before)
  useEffect(() => {
    const initializeCv = () => {
      const storedCvId = localStorage.getItem("current_cv_id");
      const targetCvId = propCvId || storedCvId;

      if (targetCvId && targetCvId !== "undefined" && targetCvId !== "null") {
        setCurrentCvId(targetCvId);
        loadCvInfo(targetCvId);
      } else {
        loadLatestCv();
      }
    };

    if (open) {
      initializeCv();
    }
  }, [open, propCvId]);

  // Load CV information (same as before)
  const loadCvInfo = async (cvId: string) => {
    if (!cvId || cvId === "undefined" || cvId === "null") {
      setCvError("No CV ID provided");
      return;
    }

    setCvLoading(true);
    setCvError("");

    try {
      console.log("📋 Loading CV info for:", cvId);

      const response = await api.get(`/v1/cv/${cvId}`);

      console.log("📄 Full CV response:", response.data); // Debug log

      const finalId = response.data?.id || response.data?.cv_id;
      if (finalId) {
        const cvData: CVInfo = {
          id: finalId,
          file_name: response.data.file_name || "Unknown CV",
          has_parsed_data: response.data.has_parsed_data || false,
          needs_parsing: response.data.needs_parsing || false,
          validation_status: response.data.validation_status || "unknown",
        };

        setCvInfo(cvData);
        setCurrentCvId(cvId);
        localStorage.setItem("current_cv_id", cvId);

        console.log("✅ CV loaded successfully:", cvData);

        // ✅ ENHANCED: Extract role from multiple possible sources
        let extractedRole = "";

        // First, try top-level fields from backend
        const topLevelFields = ["user_role", "role", "job_title", "title", "target_role", "desired_role", "professional_title"];
        for (const field of topLevelFields) {
          if (response.data[field] && typeof response.data[field] === 'string' && response.data[field].trim()) {
            extractedRole = response.data[field].trim();
            console.log(`✅ Found role in response.data.${field}:`, extractedRole);
            break;
          }
        }

        // If not found, try parsed_json object
        if (!extractedRole && response.data.parsed_json) {
          const parsedJson = response.data.parsed_json;
          const parsedFields = ["title", "current_role", "job_title", "position", "role"];

          for (const field of parsedFields) {
            if (parsedJson[field] && typeof parsedJson[field] === 'string' && parsedJson[field].trim()) {
              extractedRole = parsedJson[field].trim();
              console.log(`✅ Found role in parsed_json.${field}:`, extractedRole);
              break;
            }
          }
        }

        // Set the role if found
        if (extractedRole) {
          setRole(extractedRole);
          console.log("✅ Auto-populated role from CV:", extractedRole);
          toast.success(`✨ Auto-filled role: ${extractedRole}`, {
            description: "From your CV profile",
            duration: 3000,
          });
        } else {
          console.log("⚠️ No role found in CV response. Available data:", {
            topLevel: Object.keys(response.data),
            parsedJson: response.data.parsed_json ? Object.keys(response.data.parsed_json) : 'none'
          });
        }

        if (cvData.needs_parsing) {
          setCvError(
            "⚠️ CV is being processed. Please wait a moment and try again."
          );
        }
      } else {
        throw new Error("Invalid CV response");
      }
    } catch (err: any) {
      console.error("❌ CV loading failed:", err);
      const errorMsg =
        err?.response?.data?.detail || err.message || "Failed to load CV";
      setCvError(errorMsg);
      setCvInfo(null);

      if (localStorage.getItem("current_cv_id") === cvId) {
        localStorage.removeItem("current_cv_id");
      }
    } finally {
      setCvLoading(false);
    }
  };

  // Load latest CV (same as before)
  const loadLatestCv = async () => {
    setCvLoading(true);
    setCvError("");

    try {
      console.log("🔍 Loading latest CV...");

      const response = await api.get("/v1/cvs/latest");
      const cvId = response.data?.id || response.data?.cv_id;

      if (cvId) {
        const cvData: CVInfo = {
          id: cvId,
          file_name: response.data.file_name || "Latest CV",
          has_parsed_data: response.data.has_parsed_data || false,
          needs_parsing: response.data.needs_parsing || false,
          validation_status: response.data.validation_status || "valid",
        };

        setCvInfo(cvData);
        setCurrentCvId(cvData.id);
        localStorage.setItem("current_cv_id", cvData.id);

        console.log("✅ Latest CV loaded:", cvData);

        // ✅ ENHANCED: Extract role from multiple possible sources
        let extractedRole = "";

        // First, try top-level fields from backend
        const topLevelFields = ["user_role", "role", "job_title", "title"];
        for (const field of topLevelFields) {
          if (response.data[field] && typeof response.data[field] === 'string' && response.data[field].trim()) {
            extractedRole = response.data[field].trim();
            console.log(`✅ Found role in response.data.${field}:`, extractedRole);
            break;
          }
        }

        // If not found, try parsed_json object
        if (!extractedRole && response.data.parsed_json) {
          const parsedJson = response.data.parsed_json;
          const parsedFields = ["title", "current_role", "job_title", "position", "role"];

          for (const field of parsedFields) {
            if (parsedJson[field] && typeof parsedJson[field] === 'string' && parsedJson[field].trim()) {
              extractedRole = parsedJson[field].trim();
              console.log(`✅ Found role in parsed_json.${field}:`, extractedRole);
              break;
            }
          }
        }

        // Set the role if found
        if (extractedRole) {
          setRole(extractedRole);
          console.log("✅ Auto-populated role from CV:", extractedRole);
          toast.success(`✨ Auto-filled role: ${extractedRole}`, {
            description: "From your CV profile",
            duration: 3000,
          });
        } else {
          console.log("⚠️ No role found in CV response. Available data:", {
            topLevel: Object.keys(response.data),
            parsedJson: response.data.parsed_json ? Object.keys(response.data.parsed_json) : 'none'
          });
        }

        if (cvData.needs_parsing) {
          setCvError("⚠️ CV is being processed. Please wait and try again.");
        }
      } else {
        throw new Error("No CV found");
      }
    } catch (err: any) {
      console.error("❌ Latest CV loading failed:", err);
      setCvError("❌ No CV found. Please upload a CV first!");
      setCvInfo(null);
    } finally {
      setCvLoading(false);
    }
  };

  const refreshCvInfo = () => {
    if (currentCvId) {
      loadCvInfo(currentCvId);
    } else {
      loadLatestCv();
    }
  };

  useEffect(() => {
    if (!logBoxRef.current) return;
    logBoxRef.current.scrollTop = logBoxRef.current.scrollHeight;
  }, [logs]);

  useEffect(() => {
    if (!open) {
      setStage("form");
      setJobs([]);
      setSelectedJobIds(new Set());
      setLogs([]);
      setProofs([]);
      setError("");
      setMessage("");
      setRunId("");
      setActorRunId("");
      setIsRunning(false);
      setIsCompleted(false);
      setIsFailed(false);
      setCompletionStats(null);
      setCvError("");
      setJobSearchProgress({ current: 0, total: 0, phase: "Initializing..." });
      // ✅ Reset form fields when modal closes
      setRole("");
      setCountry("");
      setMaxJobs("5");
    }
  }, [open]);

  // ✅ ENHANCED: Job fetching with better progress tracking and error handling
  const fetchJobs = async () => {
    setLoadingJobs(true);
    setError("");
    setMessage("");
    setJobSearchProgress({
      current: 0,
      total: 100,
      phase: "Initializing search...",
    });

    if (!currentCvId || currentCvId === "undefined" || currentCvId === "null") {
      setError("❌ No CV selected. Please upload a CV first!");
      setLoadingJobs(false);
      return;
    }

    if (!cvInfo) {
      setError(
        "❌ CV information not loaded. Click 'Refresh CV' to try again."
      );
      setLoadingJobs(false);
      return;
    }

    if (cvInfo.needs_parsing) {
      setError(
        "❌ CV is still being processed. Please wait a moment and try again."
      );
      setLoadingJobs(false);
      return;
    }

    if (!role || !country) {
      setError("❌ Please fill in both role and country fields.");
      setLoadingJobs(false);
      return;
    }

    try {
      console.log("🧠 Fetching jobs with enhanced AI scoring:", {
        cv_id: currentCvId,
        role,
        country,
        maxJobs,
        ai_enhanced: useAIScoring,
        llm_boost: useLLMBoost,
      });

      setJobSearchProgress({
        current: 10,
        total: 100,
        phase: "🌍 Searching job boards...",
      });

      // Try enhanced endpoint first
      const endpoint = useAIScoring
        ? "/v1/jobs/fetch-and-score"
        : "/v1/jobs/fetch-and-score-enhanced";
      const payload = {
        cv_id: currentCvId,
        keywords: role,
        location: country,
        max_results: Number(maxJobs),
        ...(useAIScoring && {
          use_ai_scoring: true,
          use_llm_boost: useLLMBoost,
        }),
      };

      // Enhanced progress tracking during request
      const progressInterval = setInterval(() => {
        setJobSearchProgress((prev) => {
          const newCurrent = Math.min(prev.current + 8, 90);
          let newPhase = prev.phase;

          if (newCurrent < 30) {
            newPhase = "🔍 Searching multiple job boards...";
          } else if (newCurrent < 60) {
            newPhase = "📊 Analyzing job descriptions...";
          } else if (newCurrent < 85) {
            newPhase = "🧠 AI scoring job matches...";
          } else {
            newPhase = "✨ Finalizing results...";
          }

          return {
            ...prev,
            current: newCurrent,
            phase: newPhase,
          };
        });
      }, 800);

      let res;
      try {
        res = await api.post(endpoint, payload);
      } catch (enhancedError: any) {
        console.warn(
          "Enhanced scoring failed, falling back to basic scoring:",
          enhancedError
        );

        if (useAIScoring) {
          res = await api.post("/v1/jobs/fetch-and-score", {
            cv_id: currentCvId,
            keywords: role,
            location: country,
            max_results: Number(maxJobs),
          });
          toast.info(
            "Using basic scoring (enhanced AI temporarily unavailable)"
          );
        } else {
          throw enhancedError;
        }
      } finally {
        clearInterval(progressInterval);
        setJobSearchProgress({
          current: 100,
          total: 100,
          phase: "✅ Analysis complete!",
        });
      }

      if (res.data?.jobs) {
        setJobs(res.data.jobs);
        const allJobIds = new Set(res.data.jobs.map((j: Job) => j.id));
        setSelectedJobIds(allJobIds);
        setStage("jobs");

        // Enhanced success feedback with better insights
        const { total_matched, average_score, ai_enhanced, total_fetched } =
          res.data;
        const aiLabel = ai_enhanced ? " (AI-enhanced)" : "";

        console.log(
          `✅ Found ${res.data.jobs.length} jobs for "${role}"${aiLabel}`
        );

        // Smart success messages based on results
        if (res.data.jobs.length === 0) {
          // Extract min_match_score from response or use default fallback
          const minMatchScore = res.data.min_match_score || res.data.minMatch || payload.min_match_score || 60;
          toast.warning(
            `No "${role}" jobs found with ${minMatchScore}% match score`,
            {
              description:
                "Try lowering the match score or using broader keywords",
              duration: 5000,
            }
          );
          setError(`❌ No "${role}" jobs found with ${minMatchScore}% match score. Try:
• Lowering match score to 15-25%
• Using broader keywords (e.g., "developer" instead of "AI developer")
• Checking different countries
• Using AI scoring for better semantic matching`);
        } else if (res.data.jobs.length < 5) {
          toast.success(
            `Found ${res.data.jobs.length} high-quality "${role}" matches!`,
            {
              description: `Avg: ${average_score || "N/A"
                }% • Try lowering match score for more results`,
              duration: 5000,
            }
          );
        } else {
          toast.success(
            `🎉 Found ${res.data.jobs.length} AI-matched "${role}" jobs!`,
            {
              description: `Avg: ${average_score || "N/A"}% • Analyzed ${total_fetched || res.data.jobs.length
                } total jobs`,
              duration: 4000,
            }
          );
        }

        // Show insights to user
        if (res.data.insights) {
          setMessage(res.data.insights.join(". "));
        } else if (res.data.jobs.length > 0) {
          const avgScore =
            average_score ||
            Math.round(
              res.data.jobs.reduce(
                (acc: number, job: Job) => acc + job.score,
                0
              ) / res.data.jobs.length
            );
          setMessage(
            `✨ Found ${res.data.jobs.length} AI-matched jobs with ${avgScore}% average relevance for "${role}"`
          );
        }
      } else {
        setError(
          `❌ No "${role}" jobs found in ${country}. Try adjusting your search parameters.`
        );
      }
    } catch (err: any) {
      console.error("❌ Enhanced job fetch error:", err);
      const errorMsg =
        err?.response?.data?.detail || err.message || "Failed to fetch jobs";

      // Better error handling with suggestions
      if (err?.response?.data?.suggestions) {
        const suggestions = err.response.data.suggestions.join(", ");
        setError(`❌ ${errorMsg}. Suggestions: ${suggestions}`);
      } else if (err?.response?.status === 404) {
        setError(`❌ CV not found. Please refresh or upload a new CV.`);
      } else if (err?.response?.status === 402) {
        setError(`❌ Insufficient credits. Please purchase more credits.`);
      } else {
        setError(
          `❌ ${errorMsg}. Please try again or contact support if the issue persists.`
        );
      }

      // User-friendly error toasts
      if (err?.response?.status === 503) {
        toast.error("Job service temporarily unavailable", {
          description: "Please try again in a few moments",
          duration: 5000,
        });
      } else {
        toast.error(`Search failed: ${errorMsg.slice(0, 50)}...`);
      }
    } finally {
      setLoadingJobs(false);
      setTimeout(() => {
        setJobSearchProgress({ current: 0, total: 0, phase: "Ready" });
      }, 2000);
    }
  };
  const { connect: connectSSE, disconnect: disconnectSSE } = useAutomationSSE({
    onMessage: (message) => {
      if (message.msg) {
        addLog(message.msg);
      }

      if (message.type === "proof" && message.url) {
        setProofs((prev) => [...prev, message.url]);
      }
    },
    onComplete: () => {
      setIsCompleted(true);
      setIsRunning(false);
      toast.success("🎉 Automation completed!");
    },
    onError: (error) => {
      setError(error.msg || "Automation error");
      setIsFailed(true);
    },
    autoConnect: false, // manual control, connect via button
  });

  // Inside AutomateModal component

  // Enhanced automation start (same logic, improved error handling)
  // Enhanced automation start (same logic, improved error handling)
  const startAutomation = async () => {
    if (selectedJobIds.size === 0) {
      toast.error("Please select at least one job to apply.");
      return;
    }

    // ✅ ADD: Check if automation is already running
    if (automationStatus.is_running) {
      toast.error(
        "Automation is already running. Please wait for it to complete."
      );
      return;
    }

    if (selectedJobIds.size > 50) {
      toast.error(
        "Maximum 50 jobs allowed per automation run. Please deselect some jobs."
      );
      return;
    }

    if (!currentCvId || !cvInfo) {
      toast.error("❌ No valid CV found. Please upload a CV first.");
      return;
    }

    setLoading(true);
    setError("");
    setMessage("");
    setLogs([]);
    setProofs([]);
    setRunId("");
    setActorRunId("");
    setIsRunning(true);
    setIsCompleted(false);
    setIsFailed(false);
    setCompletionStats(null);
    setAutomationStartTime(Date.now());
    setEstimatedTimeRemaining(selectedJobIds.size * 45 * 1000);
    setProgressMessage("🚀 Initializing automation...");
    setStage("automation");

    try {
      const selectedJobs = jobs.filter((j) => selectedJobIds.has(j.id));

      addLog("🚀 Starting enhanced AI-powered job automation...");
      addLog(`📋 Using CV: ${cvInfo.file_name} (ID: ${currentCvId})`);
      addLog(`🎯 Target role: "${role}" in ${country}`);
      addLog(`📊 Applying to ${selectedJobs.length} carefully selected jobs`);

      let triggerRes;
      try {
        triggerRes = await api.post("/v1/automate-job-apply", {
          cv_id: currentCvId,
          role,
          country,
          max_jobs: selectedJobs.length,
          selected_jobs: selectedJobs,
        });
      } catch (enhancedError: any) {
        console.warn("Automation request failed:", enhancedError);
        throw enhancedError;
      }

      if (triggerRes.data?.ok) {
        const runId = triggerRes.data.run_id || "";
        setRunId(runId);
        setActorRunId(triggerRes.data.actor_run_id || "");

        // ✅ UPDATE: Set running in context (triggers banner)
        setAutomationRunning(runId);

        addLog("✅ AI automation started successfully!");
        addLog(`📝 Run ID: ${runId}`);

        if (triggerRes.data.actor_run_id) {
          addLog(`🤖 Automation Actor: ${triggerRes.data.actor_run_id}`);
        }

        if (triggerRes.data.credits_used) {
          addLog(`💳 Credits used: ${triggerRes.data.credits_used}`);
        }

        addLog(
          `📋 Processing ${selectedJobs.length} AI-selected "${role}" positions`
        );
        addLog("🔍 AI is now analyzing companies and crafting applications...");

        addLog("\n" + "=".repeat(60));
        addLog("ℹ️  IMPORTANT: You can safely close this modal!");
        addLog("   • AI automation continues in the background");
        addLog("   • Real-time notifications when complete");
        addLog("   • Failed applications are automatically refunded");
        addLog("   • Check your dashboard for live progress updates");
        addLog("=".repeat(60) + "\n");

        setMessage(
          "✅ AI automation is now running in the background. You can close this modal safely and receive notifications when complete."
        );

        toast.success(
          `🚀 AI automation started for ${selectedJobs.length} "${role}" jobs!`,
          {
            description:
              "Running in background. You'll be notified when complete.",
            duration: 4000,
          }
        );
      } else {
        throw new Error(
          triggerRes.data?.message || "Failed to start automation"
        );
      }
    } catch (err: any) {
      console.error("❌ Automation start error:", err);
      const errorMsg =
        err?.response?.data?.detail || err.message || "Unexpected error";

      setError(errorMsg);
      setIsRunning(false);
      setIsFailed(true);

      addLog(`❌ Automation Error: ${errorMsg}`);

      if (err?.response?.status === 402) {
        addLog(
          "💳 Insufficient credits. Please purchase more credits to continue."
        );
        toast.error("❌ Insufficient credits", {
          description: "Please add more credits to start automation",
          duration: 5000,
        });
      } else if (err?.response?.status === 404) {
        addLog("📄 CV not found. Please upload a new CV.");
        toast.error("❌ CV not found", {
          description: "Please upload a new CV and try again",
          duration: 5000,
        });
      } else {
        toast.error(`❌ Automation failed: ${errorMsg.slice(0, 50)}...`);
      }
    } finally {
      setLoading(false);
    }
  };

  // Enhanced job card (same as before but with better styling)
  const renderJobCard = (job: Job) => {
    const getQualityColor = (quality?: string) => {
      switch (quality) {
        case "excellent":
          return "text-green-600 bg-green-50 border-green-200";
        case "good":
          return "text-blue-600 bg-blue-50 border-blue-200";
        case "fair":
          return "text-yellow-600 bg-yellow-50 border-yellow-200";
        default:
          return "text-gray-600 bg-gray-50 border-gray-200";
      }
    };

    const getQualityIcon = (quality?: string) => {
      switch (quality) {
        case "excellent":
          return "🌟";
        case "good":
          return "✅";
        case "fair":
          return "⚡";
        default:
          return "📄";
      }
    };

    return (
      <div
        key={job.id}
        className={`border rounded-lg p-4 cursor-pointer transition-all duration-200 ${selectedJobIds.has(job.id)
          ? "border-2 border-purple-500 bg-purple-50 shadow-lg ring-1 ring-purple-200"
          : "border-gray-200 hover:border-gray-300 hover:shadow-sm"
          }`}
        onClick={() => toggleJobSelection(job.id)}
      >
        <div className="flex items-start gap-3">
          <Checkbox
            checked={selectedJobIds.has(job.id)}
            onChange={() => toggleJobSelection(job.id)}
            className="mt-1"
          />
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-2">
              <div className="flex-1 min-w-0">
                <h3 className="font-medium text-gray-900 truncate">
                  {job.title}
                </h3>
                <div className="flex items-center gap-3 text-sm text-gray-600 mt-1">
                  <div className="flex items-center gap-1">
                    <Briefcase className="h-3 w-3" />
                    <span className="truncate">{job.company}</span>
                  </div>
                  {job.location && (
                    <div className="flex items-center gap-1">
                      <MapPin className="h-3 w-3" />
                      <span className="truncate">{job.location}</span>
                    </div>
                  )}
                </div>

                {/* Enhanced AI match reasons */}
                {job.match_reasons && job.match_reasons.length > 0 && (
                  <div className="mt-2 text-xs text-gray-600 bg-gray-50 rounded p-2">
                    <strong className="text-purple-700">
                      🎯 Why it matches:
                    </strong>{" "}
                    {job.match_reasons[0]}
                    {job.match_reasons.length > 1 && (
                      <span className="text-gray-400">
                        {" "}
                        +{job.match_reasons.length - 1} more reason
                        {job.match_reasons.length > 2 ? "s" : ""}
                      </span>
                    )}
                  </div>
                )}

                {job.snippet && (
                  <p className="text-xs text-gray-500 mt-2 line-clamp-2">
                    {job.snippet}
                  </p>
                )}
              </div>
              <div className="flex items-center gap-2 flex-shrink-0">
                {/* Enhanced score display */}
                <div
                  className={`px-3 py-1 rounded-full text-xs font-medium border ${getQualityColor(
                    job.quality
                  )}`}
                >
                  {getQualityIcon(job.quality)} {job.score}%
                </div>
                <a
                  href={job.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:text-blue-800 transition-colors"
                  onClick={(e) => e.stopPropagation()}
                >
                  <ExternalLink className="h-4 w-4" />
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  // Job selection handlers (same as before)
  const toggleJobSelection = (jobId: string) => {
    const newSelected = new Set(selectedJobIds);
    if (newSelected.has(jobId)) {
      newSelected.delete(jobId);
    } else {
      newSelected.add(jobId);
    }
    setSelectedJobIds(newSelected);
  };

  const selectAllJobs = () => {
    const allJobIds = new Set(jobs.map((j) => j.id));
    setSelectedJobIds(allJobIds);
  };

  const deselectAllJobs = () => {
    setSelectedJobIds(new Set());
  };

  // ✅ NEW: Helper function to check if error is credit-related
  const isCreditError = (errorMsg: string) => {
    return (
      errorMsg.toLowerCase().includes("insufficient credits") ||
      (errorMsg.toLowerCase().includes("need") &&
        errorMsg.toLowerCase().includes("credits"))
    );
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 transition-all duration-200">
          <Sparkles className="mr-2 h-4 w-4" />
          Start AI Automation
        </Button>
      </DialogTrigger>

      {/* ✅ FIXED: Improved modal with better scrolling */}
      <DialogContent className="max-w-6xl max-h-[95vh] overflow-hidden flex flex-col">
        <div className="flex items-center gap-3 mb-4 flex-shrink-0">
          <div className="w-10 h-10 bg-gradient-to-r from-purple-600 to-pink-600 rounded-lg flex items-center justify-center">
            <Sparkles className="h-5 w-5 text-white" />
          </div>
          <div>
            <DialogTitle className="text-xl font-bold">
              {stage === "form" && "🚀 Configure AI Job Automation"}
              {stage === "jobs" &&
                `Review ${jobs.length} AI-Matched Jobs for "${role}" - ${selectedJobIds.size} Selected`}
              {stage === "automation" && `AI Automation Progress for "${role}"`}
            </DialogTitle>
            <DialogDescription>
              {stage === "form" &&
                "Set your job search preferences and AI scoring options"}
              {stage === "jobs" &&
                `Select which AI-matched "${role}" jobs to apply for`}
              {stage === "automation" &&
                (isCompleted
                  ? "AI automation completed successfully"
                  : isFailed
                    ? "AI automation encountered an error"
                    : `Real-time AI automation progress for "${role}" jobs`)}
            </DialogDescription>
          </div>
        </div>

        {/* ✅ FIXED: Scrollable content area */}
        <div className="flex-1 overflow-hidden flex flex-col min-h-0">
          {/* STAGE 1: FORM WITH ENHANCED SCROLLING */}
          {stage === "form" && (
            <div className="overflow-y-auto flex-1 pr-2">
              <div className="space-y-6 pb-4">
                {/* CV Status Display */}
                <div className="bg-gray-50 border rounded-lg p-4">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="text-sm font-medium text-gray-900">
                      Current CV
                    </h3>
                    <h4 className="green">
                      We use your CV to find relevant jobs for you!
                    </h4>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={refreshCvInfo}
                      disabled={cvLoading}
                    >
                      {cvLoading ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        "Refresh CV"
                      )}
                    </Button>
                  </div>

                  {cvLoading && (
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <Loader2 className="h-4 w-4 animate-spin" />
                      <span>Loading CV information...</span>
                    </div>
                  )}

                  {cvError && (
                    <div className="flex items-start gap-2 p-3 bg-red-50 border border-red-200 rounded-lg">
                      <AlertCircle className="h-4 w-4 text-red-600 mt-0.5 flex-shrink-0" />
                      <div className="flex-1">
                        <p className="text-sm text-red-800">{cvError}</p>
                        <Button
                          size="sm"
                          variant="link"
                          className="text-red-600 px-0 text-xs mt-1"
                          onClick={() => navigate("/upload-cv")}
                        >
                          <Upload className="h-3 w-3 mr-1" />
                          Upload New CV
                        </Button>
                      </div>
                    </div>
                  )}

                  {cvInfo && !cvLoading && !cvError && (
                    <div className="flex items-start gap-3 p-3 bg-green-50 border border-green-200 rounded-lg">
                      <CheckCircle2 className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                      <div className="flex-1">
                        <p className="text-sm font-medium text-green-900">
                          {cvInfo.file_name}
                        </p>
                        <p className="text-xs text-green-700 mt-1">
                          ID: {cvInfo.id.slice(0, 8)}... • Status:{" "}
                          {cvInfo.validation_status}
                          {cvInfo.has_parsed_data
                            ? " • ✅ Parsed"
                            : " • ⏳ Processing"}
                        </p>
                      </div>
                    </div>
                  )}

                  {!cvInfo && !cvLoading && !cvError && (
                    <div className="text-center py-3">
                      <p className="text-sm text-gray-500">No CV loaded</p>
                      <Button
                        size="sm"
                        variant="outline"
                        className="mt-2"
                        onClick={loadLatestCv}
                      >
                        Load Latest CV
                      </Button>
                    </div>
                  )}
                </div>

                {/* Enhanced Form Fields */}
                <div className="space-y-4">
                  {/* First Row: Job Role and Country */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium mb-2">
                        🎯 Job Role *{" "}
                        <span className="text-xs text-purple-600 font-medium">
                          ✨ Auto-filled from your CV
                        </span>
                      </label>
                      <div className="relative">
                        <Input
                          type="text"
                          placeholder="e.g., AI Developer"
                          value={role}
                          onChange={(e) => setRole(e.target.value)}
                          className="w-full"
                        />
                        {role && (
                          <div className="absolute right-3 top-1/2 -translate-y-1/2 text-green-600">
                            <CheckCircle2 className="h-4 w-4" />
                          </div>
                        )}
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium mb-2">
                        🌍 Country *
                        <span className="text-xs text-gray-500">
                          (Gulf regions may take more time)
                        </span>
                      </label>
                      <select
                        value={country}
                        onChange={(e) => setCountry(e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                      >
                        <option value="">Select Country</option>
                        {COUNTRIES.map((c) => (
                          <option key={c} value={c}>
                            {c}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  {/* Second Row: Max Jobs - Centered */}
                  <div className="flex justify-center">
                    <div className="w-full md:w-1/2">
                      <label className="block text-sm font-medium mb-2 text-center">
                        📊 Max Jobs (1-50)
                      </label>
                      <Input
                        type="number"
                        min="1"
                        max="50"
                        value={maxJobs}
                        onChange={(e) => setMaxJobs(e.target.value)}
                        className="w-full text-center"
                      />
                    </div>
                  </div>
                  {/* Enhanced AI Scoring Options */}
                  <div className="space-y-3 p-4 bg-gradient-to-r from-purple-50 to-blue-50 rounded-lg border border-purple-200">
                    <h4 className="font-medium text-purple-900 flex items-center gap-2">
                      <Brain className="h-4 w-4" />
                      🧠 AI Scoring Options
                    </h4>

                    <label className="flex items-center gap-2 text-sm">
                      <input
                        type="checkbox"
                        checked={useAIScoring}
                        onChange={(e) => setUseAIScoring(e.target.checked)}
                        className="rounded"
                      />
                      <span>
                        ✨ Use AI-powered semantic matching (recommended for
                        better results)
                      </span>
                    </label>

                    <label className="flex items-center gap-2 text-sm">
                      <input
                        type="checkbox"
                        checked={useLLMBoost}
                        onChange={(e) => setUseLLMBoost(e.target.checked)}
                        disabled={!useAIScoring}
                        className="rounded"
                      />
                      <span>
                        🚀 Enable LLM boost for edge cases (slower but more
                        thorough)
                      </span>
                    </label>

                    <p className="text-xs text-purple-700 bg-purple-100 rounded px-2 py-1">
                      💡 AI scoring analyzes job descriptions semantically and
                      finds better matches beyond just keyword matching. Great
                      for all job types!
                    </p>
                  </div>
                </div>

                {/* ✅ ENHANCED: Progress indicator with better styling */}
                {loadingJobs && jobSearchProgress.total > 0 && (
                  <JobSearchProgress
                    current={jobSearchProgress.current}
                    total={jobSearchProgress.total}
                    phase={jobSearchProgress.phase}
                  />
                )}

                {/* ✅ NEW: Enhanced error handling with credit purchase button */}
                {error && (
                  <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                    <div className="flex items-start gap-2">
                      <AlertCircle className="h-5 w-5 text-red-600 mt-0.5 flex-shrink-0" />
                      <div className="flex-1">
                        <p className="text-sm text-red-800 font-medium">
                          Search Error
                        </p>
                        <div className="text-sm text-red-700 mt-1 whitespace-pre-line">
                          {error}
                        </div>

                        {/* ✅ NEW: Show purchase button for credit errors */}
                        {isCreditError(error) && (
                          <div className="mt-3">
                            <Button
                              size="sm"
                              onClick={() => navigate("/plans")}
                              className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
                            >
                              <CreditCard className="h-4 w-4 mr-2" />
                              Purchase Credits
                            </Button>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                )}

                {message && (
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <div className="flex items-start gap-2">
                      <Info className="h-5 w-5 text-blue-600 mt-0.5 flex-shrink-0" />
                      <div className="flex-1">
                        <p className="text-sm text-blue-800">{message}</p>
                      </div>
                    </div>
                  </div>
                )}

                {/* ✅ FIXED: Sticky button area */}
                <div className="sticky bottom-0 bg-white border-t pt-4 mt-6">
                  <Button
                    onClick={fetchJobs}
                    disabled={
                      !role ||
                      !country ||
                      !cvInfo ||
                      cvError !== "" ||
                      loadingJobs
                    }
                    className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 w-full"
                    size="lg"
                  >
                    {loadingJobs ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        {useAIScoring
                          ? `🧠 AI Searching for "${role}"...`
                          : `🔍 Searching for "${role}"...`}
                      </>
                    ) : (
                      <>
                        {useAIScoring ? (
                          <Brain className="mr-2 h-4 w-4" />
                        ) : (
                          <Search className="mr-2 h-4 w-4" />
                        )}
                        {useAIScoring
                          ? `🧠 Find "${role}" Jobs with AI`
                          : `🔍 Find "${role}" Jobs`}
                      </>
                    )}
                  </Button>
                </div>
              </div>
            </div>
          )}

          {/* STAGE 2: JOB SELECTION (✅ NEW: Added scrollbar for jobs list) */}
          {stage === "jobs" && (
            <div className="flex flex-col h-full">
              <div className="flex items-center justify-between mb-4 p-4 bg-gray-50 rounded-lg flex-shrink-0">
                <div className="flex items-center gap-4">
                  <span className="text-base font-semibold px-3 py-1.5 bg-purple-100 text-purple-800 rounded-full">
                    {selectedJobIds.size} of {jobs.length} jobs selected
                  </span>
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={selectAllJobs}
                      className="text-xs bg-green-50 hover:bg-green-100 text-green-700 border-green-200"
                    >
                      ✓ Select All
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={deselectAllJobs}
                      className="text-xs bg-red-50 hover:bg-red-100 text-red-700 border-red-200"
                    >
                      ✕ Deselect All
                    </Button>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => setStage("form")}
                  >
                    Back
                  </Button>
                  <Button
                    onClick={startAutomation}
                    disabled={selectedJobIds.size === 0 || status.is_running}
                    className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
                  >
                    {automationStatus.is_running
                      ? "Automation Running..."
                      : `${useAIScoring ? "🚀 AI Apply to" : "Apply to"} ${selectedJobIds.size
                      } "${role}" Jobs`}
                  </Button>
                </div>
              </div>

              {/* ✅ NEW: Scrollable jobs list with max height and proper scrollbar */}
              <div
                className="flex-1 overflow-y-auto space-y-3 pr-2 max-h-[60vh]"
                style={{
                  scrollbarWidth: "thin",
                  scrollbarColor: "#9333ea #f3f4f6",
                }}
              >
                {jobs.map(renderJobCard)}
              </div>
            </div>
          )}

          {/* STAGE 3: AUTOMATION PROGRESS (enhanced with better scrolling) */}
          {stage === "automation" && (
            <div className="flex flex-col h-full">
              {/* Enhanced failure handling with purchase button */}
              {isFailed && (
                <div className="bg-red-50 border-2 border-red-200 rounded-xl p-6 mb-4 flex-shrink-0">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-12 h-12 bg-red-500 rounded-full flex items-center justify-center">
                      <AlertCircle className="h-6 w-6 text-white" />
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-red-900">
                        AI Automation Failed
                      </h3>
                      <p className="text-sm text-red-700">
                        The AI automation for "{role}" jobs encountered an error
                      </p>
                    </div>
                  </div>

                  {error && (
                    <div className="mt-4 p-3 bg-red-100 border border-red-200 rounded-lg">
                      <p className="text-sm text-red-800">{error}</p>
                    </div>
                  )}

                  <div className="mt-4 flex gap-2">
                    <Button
                      onClick={() => {
                        setStage("form");
                        setIsFailed(false);
                        setError("");
                      }}
                      variant="outline"
                      size="sm"
                    >
                      Try Again
                    </Button>

                    {/* ✅ NEW: Show purchase button for credit errors */}
                    {isCreditError(error) && (
                      <Button
                        onClick={() => navigate("/plans")}
                        size="sm"
                        className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
                      >
                        <ShoppingCart className="h-4 w-4 mr-2" />
                        Purchase Credits
                      </Button>
                    )}

                    <Button onClick={() => setOpen(false)} size="sm">
                      Close
                    </Button>
                  </div>
                </div>
              )}

              {/* Background Processing Notice */}
              {(isRunning || automationStatus.is_running) &&
                !isCompleted &&
                !isFailed && (
                  <div className="bg-gradient-to-r from-blue-50 to-purple-50 border-2 border-purple-200 rounded-xl p-4 mb-4 flex-shrink-0">
                    <div className="flex items-start gap-3">
                      <div className="w-10 h-10 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full flex items-center justify-center animate-pulse">
                        <Zap className="h-5 w-5 text-white" />
                      </div>
                      <div className="flex-1">
                        <h4 className="font-semibold text-gray-900 mb-1">
                          🚀 AI Automation Running for "{role}" Jobs
                        </h4>
                        <p className="text-sm text-gray-700 mb-3">
                          AI is processing your "{role}" job applications in the
                          background. You can safely close this modal. You'll
                          receive a notification when complete, and failed
                          applications will be automatically refunded.
                        </p>
                        <div className="flex items-center gap-2 text-xs text-purple-700">
                          <CheckCircle2 className="h-4 w-4" />
                          <span>
                            Check your dashboard for real-time progress updates
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

              {automationStatus.is_running && (
                <Button
                  onClick={connectSSE}
                  variant="outline"
                  size="sm"
                  className="mt-4"
                >
                  <Activity className="mr-2 h-4 w-4" />
                  Reconnect to Live Logs
                </Button>
              )}

              {/* Success UI - Enhanced for user search context */}
              {isCompleted && completionStats && (
                <div className="relative overflow-hidden bg-gradient-to-br from-purple-500/10 via-pink-500/10 to-blue-500/10 border-2 border-purple-200 rounded-2xl p-8 mb-4 flex-shrink-0">
                  {/* Decorative Background Elements */}
                  <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-purple-400/20 to-pink-400/20 rounded-full blur-3xl"></div>
                  <div className="absolute -bottom-4 -left-4 w-24 h-24 bg-gradient-to-br from-blue-400/20 to-purple-400/20 rounded-full blur-2xl"></div>

                  <div className="relative z-10">
                    {/* Header Section */}
                    <div className="flex items-center gap-4 mb-6">
                      <div className="w-16 h-16 bg-gradient-to-r from-purple-600 to-pink-600 rounded-2xl flex items-center justify-center shadow-lg">
                        {completionStats.failed === 0 ? (
                          <Trophy className="h-8 w-8 text-white" />
                        ) : (
                          <Star className="h-8 w-8 text-white" />
                        )}
                      </div>
                      <div>
                        <h3 className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                          {completionStats.failed === 0
                            ? "🎉 Perfect AI Automation!"
                            : "✅ AI Automation Complete!"}
                        </h3>
                        <p className="text-gray-600 font-medium">
                          {completionStats.failed === 0
                            ? `AI successfully applied to all ${completionStats.successful} "${role}" jobs!`
                            : `AI applied to ${completionStats.successful} "${role}" jobs • ${completionStats.failed} failed (refunded)`}
                        </p>
                      </div>
                    </div>

                    {/* Stats Grid */}
                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                      <div className="bg-white/70 backdrop-blur-sm border border-purple-200/50 rounded-xl p-4 text-center group hover:scale-105 transition-transform duration-200">
                        <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-500 rounded-lg flex items-center justify-center mx-auto mb-3 group-hover:rotate-12 transition-transform">
                          <Target className="h-5 w-5 text-white" />
                        </div>
                        <div className="text-2xl font-bold text-gray-900">
                          {completionStats.total_applied}
                        </div>
                        <div className="text-xs font-medium text-gray-600">
                          Total "{role}" Jobs
                        </div>
                      </div>

                      <div className="bg-white/70 backdrop-blur-sm border border-green-200/50 rounded-xl p-4 text-center group hover:scale-105 transition-transform duration-200">
                        <div className="w-10 h-10 bg-gradient-to-r from-green-500 to-emerald-500 rounded-lg flex items-center justify-center mx-auto mb-3 group-hover:rotate-12 transition-transform">
                          <CheckCircle2 className="h-5 w-5 text-white" />
                        </div>
                        <div className="text-2xl font-bold text-green-600">
                          {completionStats.successful}
                        </div>
                        <div className="text-xs font-medium text-gray-600">
                          Successful
                        </div>
                      </div>

                      <div className="bg-white/70 backdrop-blur-sm border border-red-200/50 rounded-xl p-4 text-center group hover:scale-105 transition-transform duration-200">
                        <div className="w-10 h-10 bg-gradient-to-r from-red-500 to-pink-500 rounded-lg flex items-center justify-center mx-auto mb-3 group-hover:rotate-12 transition-transform">
                          <AlertCircle className="h-5 w-5 text-white" />
                        </div>
                        <div className="text-2xl font-bold text-red-600">
                          {completionStats.failed}
                        </div>
                        <div className="text-xs font-medium text-gray-600">
                          Failed
                        </div>
                      </div>

                      <div className="bg-white/70 backdrop-blur-sm border border-purple-200/50 rounded-xl p-4 text-center group hover:scale-105 transition-transform duration-200">
                        <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg flex items-center justify-center mx-auto mb-3 group-hover:rotate-12 transition-transform">
                          <Award className="h-5 w-5 text-white" />
                        </div>
                        <div className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                          {completionStats.success_rate}%
                        </div>
                        <div className="text-xs font-medium text-gray-600">
                          Success Rate
                        </div>
                      </div>
                    </div>

                    {/* Duration & Actions */}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2 text-sm font-medium text-gray-700">
                        <Clock className="h-4 w-4" />
                        <span>
                          Completed in{" "}
                          {Math.floor(completionStats.duration / 60)}m{" "}
                          {completionStats.duration % 60}s
                        </span>
                      </div>

                      <Button
                        onClick={() =>
                          navigate("/my-applications")
                        }
                        className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white"
                      >
                        View Applications
                      </Button>
                    </div>

                    {/* Credit Refund Notice */}
                    {completionStats.failed > 0 && (
                      <div className="mt-4 p-4 bg-gradient-to-r from-blue-50 to-purple-50 border border-blue-200 rounded-xl">
                        <div className="flex items-start gap-3">
                          <Info className="h-5 w-5 text-blue-600 mt-0.5 flex-shrink-0" />
                          <div>
                            <p className="text-sm font-medium text-blue-900">
                              💳 Credits Automatically Refunded
                            </p>
                            <p className="text-xs text-blue-800 mt-1">
                              You've been refunded credits for the{" "}
                              {completionStats.failed} failed application
                              {completionStats.failed > 1 ? "s" : ""}. Check
                              your transaction history for details.
                            </p>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {error && !isFailed && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4 flex-shrink-0">
                  <div className="flex items-start gap-2">
                    <AlertCircle className="h-5 w-5 text-red-600 mt-0.5 flex-shrink-0" />
                    <div className="flex-1">
                      <p className="text-sm text-red-800">{error}</p>

                      {/* ✅ NEW: Show purchase button for credit errors */}
                      {isCreditError(error) && (
                        <div className="mt-3">
                          <Button
                            size="sm"
                            onClick={() => navigate("/plans")}
                            className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
                          >
                            <CreditCard className="h-4 w-4 mr-2" />
                            Purchase Credits
                          </Button>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {message && (
                <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-4 flex-shrink-0">
                  <div className="flex items-start gap-2">
                    <CheckCircle2 className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
                    <p className="text-sm text-green-800">{message}</p>
                  </div>
                </div>
              )}

              {/* ✅ ENHANCED: ETA and Progress Status */}
              {isRunning && !isFailed && !isCompleted && (
                <div className="bg-gradient-to-r from-blue-50 via-purple-50 to-blue-50 border-2 border-purple-300 rounded-xl p-5 mb-4 flex-shrink-0 shadow-md">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className="relative">
                        <Activity className="h-6 w-6 text-purple-600 animate-pulse" />
                        <div className="absolute -top-1 -right-1 w-3 h-3 bg-green-500 rounded-full animate-ping"></div>
                      </div>
                      <div>
                        <span className="font-bold text-gray-900 text-lg">
                          Automation Active
                        </span>
                        <p className="text-xs text-gray-600">
                          AI is working on your applications
                        </p>
                      </div>
                    </div>
                    {estimatedTimeRemaining !== null && (
                      <div className="bg-white/70 backdrop-blur-sm border border-purple-300 rounded-lg px-4 py-2 shadow-sm">
                        <div className="flex items-center gap-2 text-sm font-semibold text-purple-700">
                          <Clock className="h-5 w-5 animate-pulse" />
                          <div>
                            <div className="text-xs text-gray-600">
                              Estimated Time
                            </div>
                            <div className="text-base">
                              {Math.floor(estimatedTimeRemaining / 60000)}m{" "}
                              {Math.floor(
                                (estimatedTimeRemaining % 60000) / 1000
                              )}
                              s
                            </div>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                  {progressMessage && (
                    <div className="bg-white/50 backdrop-blur-sm border border-blue-200 rounded-lg p-3">
                      <div className="flex items-center gap-3 text-sm text-gray-800">
                        <div className="flex gap-1">
                          <div
                            className="w-2 h-2 bg-blue-500 rounded-full animate-bounce"
                            style={{ animationDelay: "0ms" }}
                          ></div>
                          <div
                            className="w-2 h-2 bg-purple-500 rounded-full animate-bounce"
                            style={{ animationDelay: "150ms" }}
                          ></div>
                          <div
                            className="w-2 h-2 bg-pink-500 rounded-full animate-bounce"
                            style={{ animationDelay: "300ms" }}
                          ></div>
                        </div>
                        <span className="font-medium flex-1">
                          {progressMessage}
                        </span>
                      </div>
                    </div>
                  )}
                  <div className="mt-3 text-xs text-center text-gray-500 italic">
                    ⚡ Processing is active - you can safely close this modal
                  </div>
                </div>
              )}

              {/* ✅ FIXED: Scrollable logs section */}
              <div className="flex-1 overflow-hidden flex flex-col min-h-0">
                <h3 className="font-medium mb-2 flex items-center gap-2 flex-shrink-0">
                  <span>Live AI Automation Logs</span>
                  {isRunning && !isFailed && (
                    <div className="flex items-center gap-1 text-xs text-green-600">
                      <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                      Running
                    </div>
                  )}
                  {isFailed && (
                    <div className="flex items-center gap-1 text-xs text-red-600">
                      <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                      Failed
                    </div>
                  )}
                </h3>
                <div
                  ref={logBoxRef}
                  className="flex-1 bg-gray-900 text-green-400 p-4 rounded-lg font-mono text-xs overflow-y-auto"
                >
                  {logs.length === 0 ? (
                    <p className="text-gray-500">
                      AI automation logs will appear here...
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

              {/* Proof Gallery */}
              {proofs.length > 0 && (
                <div className="mt-4 flex-shrink-0">
                  <h4 className="font-medium mb-2">
                    Application Proofs ({proofs.length})
                  </h4>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-2 max-h-32 overflow-y-auto">
                    {proofs.map((proof, i) => (
                      <a
                        key={i}
                        href={proof}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="block"
                      >
                        <img
                          src={proof}
                          alt={`Application proof ${i + 1}`}
                          className="w-full h-20 object-cover rounded border hover:border-purple-400 transition-colors"
                        />
                      </a>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
// // ✅ FIXED: AutomateModal with Scrolling and Better Job Finding

// // src/components/AutomateModal-Fixed-Scrolling.tsx
// "use client";

// import { useEffect, useRef, useState, useMemo, useCallback } from "react";
// import {
//   Loader2, Search, Sparkles, X, CheckCircle2, AlertCircle,
//   Briefcase, MapPin, TrendingUp, ExternalLink, Check, PartyPopper,
//   Clock, Target, Award, Info, Upload, Trophy, Star, Zap, Brain,
//   BarChart3, ArrowRight
// } from "lucide-react";
// import { Button } from "@/components/ui/button";
// import { Input } from "@/components/ui/input";
// import { Checkbox } from "@/components/ui/checkbox";
// import {
//   Dialog,
//   DialogTrigger,
//   DialogContent,
//   DialogTitle,
//   DialogDescription,
// } from "@/components/ui/dialog";
// import { toast } from "sonner";
// import api from "@/lib/api";

// const COUNTRIES = [
//   "Argentina", "Australia", "Austria", "Bangladesh", "Belgium", "Brazil", "Canada",
//   "Chile", "China", "Colombia", "Czech Republic", "Denmark", "Egypt", "Finland",
//   "France", "Germany", "Greece", "Hong Kong", "Hungary", "India", "Indonesia",
//   "Ireland", "Israel", "Italy", "Japan", "Kenya", "Kuwait", "Malaysia", "Mexico",
//   "Morocco", "Netherlands", "New Zealand", "Nigeria", "Norway", "Pakistan",
//   "Philippines", "Poland", "Portugal", "Qatar", "Romania", "Russia", "Saudi Arabia",
//   "Serbia", "Singapore", "Slovakia", "South Africa", "Spain", "Sri Lanka", "Sweden",
//   "Switzerland", "Taiwan", "Thailand", "Turkey", "Ukraine", "United Arab Emirates",
//   "United Kingdom", "United States", "Uruguay", "Vietnam", "Zimbabwe", "Remote",
// ];

// // ✅ FIXED: Lower match percentages for better results
// const MATCH_PERCENTAGES = ["10", "15", "20", "25", "30", "35", "40", "50", "60", "70", "80"];

// type SSEMessage =
//   | { type: "info"; msg: string; ts: string }
//   | { type: "proof"; msg: string; url: string; ts: string }
//   | { type: "done"; msg: string; ts: string }
//   | { type: "completion"; msg: string; run_id: string; total_applied: number; successful: number; failed: number; success_rate: number; duration: number; ts: string }
//   | { type: "warning"; msg: string; refund_pending?: boolean; refund_issued?: boolean; ts: string }
//   | { type: "error"; msg: string; ts: string }
//   | { type: "connected"; user_id: string; connection_id?: string; ts: string }
//   | { type: "ping"; connection_id?: string; ts: string };

// interface Job {
//   id: string;
//   title: string;
//   company: string;
//   location?: string;
//   url: string;
//   snippet?: string;
//   score: number;
//   source?: string;
//   // Enhanced AI metadata
//   quality?: "excellent" | "good" | "fair" | "poor";
//   match_reasons?: string[];
//   score_breakdown?: {
//     semantic: number;
//     keyword: number;
//     title: number;
//     context: number;
//   };
// }

// interface AutomationStats {
//   total_applied: number;
//   successful: number;
//   failed: number;
//   success_rate: number;
//   duration: number;
// }

// interface CVInfo {
//   id: string;
//   file_name: string;
//   has_parsed_data: boolean;
//   needs_parsing: boolean;
//   validation_status: string;
// }

// interface AutomateModalProps {
//   cvId?: string;
//   token: string;
//   onAutomationDone?: (finalLogs: string[], stats?: AutomationStats) => void;
// }

// // ✅ IMPROVED: Progress component with job count display
// function JobSearchProgress({
//   current,
//   total,
//   phase
// }: {
//   current: number;
//   total: number;
//   phase: string
// }) {
//   const percentage = total > 0 ? (current / total) * 100 : 0;

//   return (
//     <div className="space-y-3 p-4 bg-gradient-to-r from-blue-50 to-purple-50 border border-blue-200 rounded-lg">
//       <div className="flex items-center justify-between text-sm">
//         <span className="font-medium text-gray-700">{phase}</span>
//         <span className="text-purple-600 font-semibold">{current}/{total}</span>
//       </div>

//       <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
//         <div
//           className="h-full bg-gradient-to-r from-purple-500 to-blue-500 transition-all duration-300 ease-out rounded-full"
//           style={{ width: `${percentage}%` }}
//         />
//       </div>

//       <div className="text-xs text-gray-600 text-center">
//         {percentage < 100 ? (
//           <div className="flex items-center justify-center gap-2">
//             <Loader2 className="h-3 w-3 animate-spin text-purple-600" />
//             <span>AI analyzing jobs for better matches...</span>
//           </div>
//         ) : (
//           <div className="flex items-center justify-center gap-2">
//             <CheckCircle2 className="h-3 w-3 text-green-600" />
//             <span>Analysis complete! ✨</span>
//           </div>
//         )}
//       </div>
//     </div>
//   );
// }

// // SSE Hook (keep the same - it's working)
// function useSSEConnection(
//   isRunning: boolean,
//   userId: string | null,
//   API_BASE: string,
//   addLog: (msg: string) => void,
//   setProofs: React.Dispatch<React.SetStateAction<string[]>>,
//   setIsCompleted: React.Dispatch<React.SetStateAction<boolean>>,
//   setIsRunning: React.Dispatch<React.SetStateAction<boolean>>,
//   setIsFailed: React.Dispatch<React.SetStateAction<boolean>>,
//   setError: React.Dispatch<React.SetStateAction<string>>,
//   setCompletionStats: React.Dispatch<React.SetStateAction<AutomationStats | null>>,
//   setMessage: React.Dispatch<React.SetStateAction<string>>,
//   onAutomationDone?: (finalLogs: string[], stats?: AutomationStats) => void
// ) {
//   const eventSourceRef = useRef<EventSource | null>(null);
//   const connectionIdRef = useRef<string | null>(null);
//   const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);
//   const reconnectAttemptsRef = useRef(0);

//   useEffect(() => {
//     if (!isRunning || !userId) {
//       return;
//     }

//     if (eventSourceRef.current) {
//       console.log("⚠️ SSE connection already exists, skipping");
//       return;
//     }

//     console.log("🔗 Creating SSE connection for automation tracking");
//     addLog("📡 Connecting to automation stream...");

//     const sseUrl = `${API_BASE}/v1/sse/stream?user_id=${userId}`;
//     const evt = new EventSource(sseUrl);
//     eventSourceRef.current = evt;

//     evt.onopen = () => {
//       addLog("✅ Connected to live automation feed");
//       console.log("✅ SSE Connected for automation tracking");
//       reconnectAttemptsRef.current = 0;
//     };

//     evt.onmessage = (event) => {
//       try {
//         const data: SSEMessage = JSON.parse(event.data);

//         console.log("📨 Automation SSE event:", data.type);

//         if (data.type === "connected") {
//           console.log(`🔗 Connection confirmed (ID: ${data.connection_id})`);
//           connectionIdRef.current = data.connection_id || null;
//           return;
//         }

//         if (data.type === "ping") {
//           return;
//         }

//         if (data.type === "proof" && data.url) {
//           setProofs((p) => [...p, data.url]);
//           addLog(`📸 ${data.msg}`);
//         }
//         else if (data.type === "completion") {
//           const stats: AutomationStats = {
//             total_applied: data.total_applied,
//             successful: data.successful,
//             failed: data.failed,
//             success_rate: data.success_rate,
//             duration: data.duration
//           };

//           console.log("🎯 Automation completed:", stats);

//           setCompletionStats(stats);
//           setIsCompleted(true);
//           setIsRunning(false);

//           addLog(`\n${"=".repeat(60)}`);
//           addLog(`🎉 AI-POWERED AUTOMATION COMPLETED!`);
//           addLog(`${"=".repeat(60)}`);
//           addLog(`📊 Results Summary:`);
//           addLog(`   ✅ Successfully Applied: ${stats.successful} jobs`);
//           addLog(`   ❌ Failed Applications: ${stats.failed} jobs`);
//           addLog(`   📈 Success Rate: ${stats.success_rate}%`);
//           addLog(`   ⏱️  Total Duration: ${Math.floor(stats.duration / 60)}m ${stats.duration % 60}s`);

//           if (stats.failed > 0) {
//             addLog(`   💳 Credits automatically refunded for ${stats.failed} failed applications`);
//           }

//           addLog(`${"=".repeat(60)}\n`);
//           addLog(`💡 Tip: Check your dashboard for detailed application history`);

//           setMessage("✅ AI-powered automation completed successfully!");

//           if (onAutomationDone) {
//             onAutomationDone([], stats);
//           }

//           localStorage.setItem("last_automation_stats", JSON.stringify(stats));

//           // Enhanced success notifications
//           if (stats.failed === 0) {
//             toast.success(`🎉 Perfect! AI applied to all ${stats.successful} jobs!`, {
//               description: `Success rate: 100% | Duration: ${Math.floor(stats.duration / 60)}m ${stats.duration % 60}s`,
//               duration: 5000,
//             });
//           } else if (stats.success_rate >= 70) {
//             toast.success(`🎉 AI applied to ${stats.successful} jobs!`, {
//               description: `${stats.failed} failed (credits refunded). Success rate: ${stats.success_rate}%`,
//               duration: 5000,
//             });
//           } else {
//             toast.warning(`⚠️ AI applied to ${stats.successful} of ${stats.total_applied} jobs`, {
//               description: `${stats.failed} failed. Credits refunded. Success rate: ${stats.success_rate}%`,
//               duration: 6000,
//             });
//           }

//           setTimeout(() => {
//             window.dispatchEvent(new Event('automation-completed'));
//           }, 1000);
//         }
//         else if (data.type === "warning") {
//           addLog(`⚠️ ${data.msg}`);

//           if (data.refund_pending || data.refund_issued) {
//             toast.info("💳 Credits will be refunded for failed applications");
//           }
//         }
//         else if (data.type === "done") {
//           addLog(`✅ ${data.msg}`);
//           setIsCompleted(true);
//           setIsRunning(false);
//           toast.success("🎉 AI automation finished!");
//         }
//         else if (data.type === "error") {
//           addLog(`❌ ${data.msg}`);
//           setIsRunning(false);
//           setIsFailed(true);
//           setError(data.msg);
//           toast.error(`❌ Automation failed: ${data.msg}`);
//         }
//         else if (data.msg) {
//           addLog(data.msg);
//         }
//       } catch (e) {
//         console.error("Failed to parse SSE message:", e);
//         addLog("⚠️ Error parsing server message");
//       }
//     };

//     evt.onerror = (error) => {
//       console.error("❌ SSE Connection error:", error);
//       addLog("⚠️ Connection to automation stream closed");

//       if (eventSourceRef.current) {
//         eventSourceRef.current.close();
//         eventSourceRef.current = null;
//       }

//       if (isRunning && reconnectAttemptsRef.current < 3) {
//         reconnectAttemptsRef.current++;
//         console.log(`🔄 Retrying SSE connection (attempt ${reconnectAttemptsRef.current})`);
//         addLog(`🔄 Reconnecting to automation stream (attempt ${reconnectAttemptsRef.current})...`);

//         reconnectTimeoutRef.current = setTimeout(() => {
//           setIsRunning(prev => prev);
//         }, 5000 * reconnectAttemptsRef.current);
//       }
//     };

//     return () => {
//       console.log(`🔌 Cleaning up automation SSE connection`);

//       if (reconnectTimeoutRef.current) {
//         clearTimeout(reconnectTimeoutRef.current);
//         reconnectTimeoutRef.current = null;
//       }

//       if (eventSourceRef.current) {
//         eventSourceRef.current.close();
//         eventSourceRef.current = null;
//       }
//       connectionIdRef.current = null;
//     };
//   }, [isRunning, userId, API_BASE]);

//   useEffect(() => {
//     return () => {
//       if (eventSourceRef.current) {
//         console.log("🔌 Component unmounting - closing automation SSE");
//         eventSourceRef.current.close();
//         eventSourceRef.current = null;
//       }
//       if (reconnectTimeoutRef.current) {
//         clearTimeout(reconnectTimeoutRef.current);
//       }
//     };
//   }, []);
// }

// export default function AutomateModal({
//   cvId: propCvId,
//   token,
//   onAutomationDone,
// }: AutomateModalProps) {
//   // Modal state
//   const [open, setOpen] = useState(false);

//   // CV state management
//   const [currentCvId, setCurrentCvId] = useState<string>("");
//   const [cvInfo, setCvInfo] = useState<CVInfo | null>(null);
//   const [cvLoading, setCvLoading] = useState(false);
//   const [cvError, setCvError] = useState("");

//   // Form inputs
//   const [role, setRole] = useState("");
//   const [country, setCountry] = useState("");
//   const [maxJobs, setMaxJobs] = useState("5");
//   const [minMatch, setMinMatch] = useState("20"); // ✅ FIXED: Lower default

//   // AI Scoring Options
//   const [useAIScoring, setUseAIScoring] = useState(true);
//   const [useLLMBoost, setUseLLMBoost] = useState(false);

//   // Workflow stages
//   const [stage, setStage] = useState<"form" | "jobs" | "automation">("form");

//   // Jobs state
//   const [jobs, setJobs] = useState<Job[]>([]);
//   const [selectedJobIds, setSelectedJobIds] = useState<Set<string>>(new Set());
//   const [loadingJobs, setLoadingJobs] = useState(false);

//   // Progress tracking
//   const [jobSearchProgress, setJobSearchProgress] = useState({
//     current: 0,
//     total: 0,
//     phase: "Initializing..."
//   });

//   // Automation state
//   const [logs, setLogs] = useState<string[]>([]);
//   const [proofs, setProofs] = useState<string[]>([]);
//   const [loading, setLoading] = useState(false);
//   const [isRunning, setIsRunning] = useState(false);
//   const [isCompleted, setIsCompleted] = useState(false);
//   const [isFailed, setIsFailed] = useState(false);
//   const [completionStats, setCompletionStats] = useState<AutomationStats | null>(null);
//   const [message, setMessage] = useState("");
//   const [error, setError] = useState("");
//   const [runId, setRunId] = useState<string>("");
//   const [actorRunId, setActorRunId] = useState<string>("");

//   const logBoxRef = useRef<HTMLDivElement | null>(null);

//   const API_BASE =
//     import.meta.env.VITE_API_URL?.replace(/\/+$/, "") || "http://127.0.0.1:8000";

//   // Get user ID
//   const userId = useMemo(() => {
//     try {
//       const token = localStorage.getItem("access_token");
//       if (!token) return null;

//       const payload = JSON.parse(atob(token.split('.')[1]));
//       return payload.sub;
//     } catch (e) {
//       console.error("Failed to decode token:", e);
//       return null;
//     }
//   }, []);

//   // Stable addLog function
//   const addLog = useCallback((message: string) => {
//     const timestamp = new Date().toLocaleTimeString();
//     setLogs((prev) => {
//       const newLog = `[${timestamp}] ${message}`;
//       const updatedLogs = [newLog, ...prev.slice(0, 99)];
//       return updatedLogs;
//     });
//   }, []);

//   // Use SSE hook
//   useSSEConnection(
//     isRunning,
//     userId,
//     API_BASE,
//     addLog,
//     setProofs,
//     setIsCompleted,
//     setIsRunning,
//     setIsFailed,
//     setError,
//     setCompletionStats,
//     setMessage,
//     onAutomationDone
//   );

//   // Initialize CV from localStorage or props (same as before)
//   useEffect(() => {
//     const initializeCv = () => {
//       const storedCvId = localStorage.getItem("current_cv_id");
//       const targetCvId = propCvId || storedCvId;

//       if (targetCvId && targetCvId !== "undefined" && targetCvId !== "null") {
//         setCurrentCvId(targetCvId);
//         loadCvInfo(targetCvId);
//       } else {
//         loadLatestCv();
//       }
//     };

//     if (open) {
//       initializeCv();
//     }
//   }, [open, propCvId]);

//   // Load CV information (same as before)
//   const loadCvInfo = async (cvId: string) => {
//     if (!cvId || cvId === "undefined" || cvId === "null") {
//       setCvError("No CV ID provided");
//       return;
//     }

//     setCvLoading(true);
//     setCvError("");

//     try {
//       console.log("📋 Loading CV info for:", cvId);

//       const response = await api.get(`/v1/cvs/${cvId}`);

//       if (response.data?.ok && response.data?.id) {
//         const cvData: CVInfo = {
//           id: response.data.id,
//           file_name: response.data.file_name || "Unknown CV",
//           has_parsed_data: response.data.has_parsed_data || false,
//           needs_parsing: response.data.needs_parsing || false,
//           validation_status: response.data.validation_status || "unknown"
//         };

//         setCvInfo(cvData);
//         setCurrentCvId(cvId);
//         localStorage.setItem("current_cv_id", cvId);

//         console.log("✅ CV loaded successfully:", cvData);

//         if (cvData.needs_parsing) {
//           setCvError("⚠️ CV is being processed. Please wait a moment and try again.");
//         }
//       } else {
//         throw new Error("Invalid CV response");
//       }
//     } catch (err: any) {
//       console.error("❌ CV loading failed:", err);
//       const errorMsg = err?.response?.data?.detail || err.message || "Failed to load CV";
//       setCvError(errorMsg);
//       setCvInfo(null);

//       if (localStorage.getItem("current_cv_id") === cvId) {
//         localStorage.removeItem("current_cv_id");
//       }
//     } finally {
//       setCvLoading(false);
//     }
//   };

//   // Load latest CV (same as before)
//   const loadLatestCv = async () => {
//     setCvLoading(true);
//     setCvError("");

//     try {
//       console.log("🔍 Loading latest CV...");

//       const response = await api.get("/v1/cvs/latest");

//       if (response.data?.ok && response.data?.id) {
//         const cvData: CVInfo = {
//           id: response.data.id,
//           file_name: response.data.file_name || "Latest CV",
//           has_parsed_data: response.data.has_parsed_data || false,
//           needs_parsing: response.data.needs_parsing || false,
//           validation_status: response.data.validation_status || "valid"
//         };

//         setCvInfo(cvData);
//         setCurrentCvId(cvData.id);
//         localStorage.setItem("current_cv_id", cvData.id);

//         console.log("✅ Latest CV loaded:", cvData);

//         if (cvData.needs_parsing) {
//           setCvError("⚠️ CV is being processed. Please wait and try again.");
//         }
//       } else {
//         throw new Error("No CV found");
//       }
//     } catch (err: any) {
//       console.error("❌ Latest CV loading failed:", err);
//       setCvError("❌ No CV found. Please upload a CV first!");
//       setCvInfo(null);
//     } finally {
//       setCvLoading(false);
//     }
//   };

//   const refreshCvInfo = () => {
//     if (currentCvId) {
//       loadCvInfo(currentCvId);
//     } else {
//       loadLatestCv();
//     }
//   };

//   useEffect(() => {
//     if (!logBoxRef.current) return;
//     logBoxRef.current.scrollTop = logBoxRef.current.scrollHeight;
//   }, [logs]);

//   useEffect(() => {
//     if (!open) {
//       setStage("form");
//       setJobs([]);
//       setSelectedJobIds(new Set());
//       setLogs([]);
//       setProofs([]);
//       setError("");
//       setMessage("");
//       setRunId("");
//       setActorRunId("");
//       setIsRunning(false);
//       setIsCompleted(false);
//       setIsFailed(false);
//       setCompletionStats(null);
//       setCvError("");
//       setJobSearchProgress({ current: 0, total: 0, phase: "Initializing..." });
//     }
//   }, [open]);

//   // ✅ ENHANCED: Job fetching with better progress tracking and error handling
//   const fetchJobs = async () => {
//     setLoadingJobs(true);
//     setError("");
//     setMessage("");
//     setJobSearchProgress({ current: 0, total: 100, phase: "Initializing search..." });

//     if (!currentCvId || currentCvId === "undefined" || currentCvId === "null") {
//       setError("❌ No CV selected. Please upload a CV first!");
//       setLoadingJobs(false);
//       return;
//     }

//     if (!cvInfo) {
//       setError("❌ CV information not loaded. Click 'Refresh CV' to try again.");
//       setLoadingJobs(false);
//       return;
//     }

//     if (cvInfo.needs_parsing) {
//       setError("❌ CV is still being processed. Please wait a moment and try again.");
//       setLoadingJobs(false);
//       return;
//     }

//     if (!role || !country) {
//       setError("❌ Please fill in both role and country fields.");
//       setLoadingJobs(false);
//       return;
//     }

//     try {
//       console.log("🧠 Fetching jobs with enhanced AI scoring:", {
//         cv_id: currentCvId,
//         role,
//         country,
//         minMatch,
//         maxJobs,
//         ai_enhanced: useAIScoring,
//         llm_boost: useLLMBoost
//       });

//       setJobSearchProgress({ current: 10, total: 100, phase: "🌍 Searching job boards..." });

//       // Try enhanced endpoint first
//       const endpoint = useAIScoring ? "/v1/jobs/fetch-and-score-enhanced" : "/v1/jobs/fetch-and-score";
//       const payload = {
//         cv_id: currentCvId,
//         role,
//         country,
//         min_match_score: Number(minMatch),
//         max_jobs: Number(maxJobs),
//         ...(useAIScoring && {
//           use_ai_scoring: true,
//           use_llm_boost: useLLMBoost
//         })
//       };

//       // Enhanced progress tracking during request
//       const progressInterval = setInterval(() => {
//         setJobSearchProgress(prev => {
//           const newCurrent = Math.min(prev.current + 8, 90);
//           let newPhase = prev.phase;

//           if (newCurrent < 30) {
//             newPhase = "🔍 Searching multiple job boards...";
//           } else if (newCurrent < 60) {
//             newPhase = "📊 Analyzing job descriptions...";
//           } else if (newCurrent < 85) {
//             newPhase = "🧠 AI scoring job matches...";
//           } else {
//             newPhase = "✨ Finalizing results...";
//           }

//           return {
//             ...prev,
//             current: newCurrent,
//             phase: newPhase
//           };
//         });
//       }, 800);

//       let res;
//       try {
//         res = await api.post(endpoint, payload);
//       } catch (enhancedError: any) {
//         console.warn("Enhanced scoring failed, falling back to basic scoring:", enhancedError);

//         if (useAIScoring) {
//           res = await api.post("/v1/jobs/fetch-and-score", {
//             cv_id: currentCvId,
//             role,
//             country,
//             min_match_score: Number(minMatch),
//             max_jobs: Number(maxJobs),
//           });
//           toast.info("Using basic scoring (enhanced AI temporarily unavailable)");
//         } else {
//           throw enhancedError;
//         }
//       } finally {
//         clearInterval(progressInterval);
//         setJobSearchProgress({ current: 100, total: 100, phase: "✅ Analysis complete!" });
//       }

//       if (res.data?.jobs) {
//         setJobs(res.data.jobs);
//         const allJobIds = new Set(res.data.jobs.map((j: Job) => j.id));
//         setSelectedJobIds(allJobIds);
//         setStage("jobs");

//         // Enhanced success feedback with better insights
//         const { total_matched, average_score, ai_enhanced, total_fetched } = res.data;
//         const aiLabel = ai_enhanced ? " (AI-enhanced)" : "";

//         console.log(`✅ Found ${res.data.jobs.length} jobs for "${role}"${aiLabel}`);

//         // Smart success messages based on results
//         if (res.data.jobs.length === 0) {
//           toast.warning(`No "${role}" jobs found with ${minMatch}% match score`, {
//             description: "Try lowering the match score or using broader keywords",
//             duration: 5000,
//           });
//           setError(`❌ No "${role}" jobs found with ${minMatch}% match score. Try:
// • Lowering match score to 15-25%
// • Using broader keywords (e.g., "developer" instead of "AI developer")
// • Checking different countries
// • Using AI scoring for better semantic matching`);
//         } else if (res.data.jobs.length < 5) {
//           toast.success(`Found ${res.data.jobs.length} high-quality "${role}" matches!`, {
//             description: `Avg: ${average_score || 'N/A'}% • Try lowering match score for more results`,
//             duration: 5000,
//           });
//         } else {
//           toast.success(`🎉 Found ${res.data.jobs.length} AI-matched "${role}" jobs!`, {
//             description: `Avg: ${average_score || 'N/A'}% • Analyzed ${total_fetched || res.data.jobs.length} total jobs`,
//             duration: 4000,
//           });
//         }

//         // Show insights to user
//         if (res.data.insights) {
//           setMessage(res.data.insights.join(". "));
//         } else if (res.data.jobs.length > 0) {
//           const avgScore = average_score || Math.round(res.data.jobs.reduce((acc: number, job: Job) => acc + job.score, 0) / res.data.jobs.length);
//           setMessage(`✨ Found ${res.data.jobs.length} AI-matched jobs with ${avgScore}% average relevance for "${role}"`);
//         }
//       } else {
//         setError(`❌ No "${role}" jobs found in ${country}. Try adjusting your search parameters.`);
//       }
//     } catch (err: any) {
//       console.error("❌ Enhanced job fetch error:", err);
//       const errorMsg = err?.response?.data?.detail || err.message || "Failed to fetch jobs";

//       // Better error handling with suggestions
//       if (err?.response?.data?.suggestions) {
//         const suggestions = err.response.data.suggestions.join(", ");
//         setError(`❌ ${errorMsg}. Suggestions: ${suggestions}`);
//       } else if (err?.response?.status === 404) {
//         setError(`❌ CV not found. Please refresh or upload a new CV.`);
//       } else if (err?.response?.status === 402) {
//         setError(`❌ Insufficient credits. Please purchase more credits.`);
//       } else {
//         setError(`❌ ${errorMsg}. Please try again or contact support if the issue persists.`);
//       }

//       // User-friendly error toasts
//       if (err?.response?.status === 503) {
//         toast.error("Job service temporarily unavailable", {
//           description: "Please try again in a few moments",
//           duration: 5000,
//         });
//       } else {
//         toast.error(`Search failed: ${errorMsg.slice(0, 50)}...`);
//       }
//     } finally {
//       setLoadingJobs(false);
//       setTimeout(() => {
//         setJobSearchProgress({ current: 0, total: 0, phase: "Ready" });
//       }, 2000);
//     }
//   };

//   // Enhanced automation start (same logic, improved error handling)
//   const startAutomation = async () => {
//     if (selectedJobIds.size === 0) {
//       toast.error("Please select at least one job to apply.");
//       return;
//     }

//     if (selectedJobIds.size > 50) {
//       toast.error("Maximum 50 jobs allowed per automation run. Please deselect some jobs.");
//       return;
//     }

//     if (!currentCvId || !cvInfo) {
//       toast.error("❌ No valid CV found. Please upload a CV first.");
//       return;
//     }

//     setLoading(true);
//     setError("");
//     setMessage("");
//     setLogs([]);
//     setProofs([]);
//     setRunId("");
//     setActorRunId("");
//     setIsRunning(true);
//     setIsCompleted(false);
//     setIsFailed(false);
//     setCompletionStats(null);
//     setStage("automation");

//     try {
//       const selectedJobs = jobs.filter((j) => selectedJobIds.has(j.id));

//       addLog("🚀 Starting enhanced AI-powered job automation...");
//       addLog(`📋 Using CV: ${cvInfo.file_name} (ID: ${currentCvId})`);
//       addLog(`🎯 Target role: "${role}" in ${country}`);
//       addLog(`🧠 AI scoring: ${useAIScoring ? 'Enhanced' : 'Basic'} ${useLLMBoost ? '+ LLM boost' : ''}`);
//       addLog(`📊 Applying to ${selectedJobs.length} carefully selected jobs`);

//       if (selectedJobs.length > 0) {
//         const avgScore = Math.round(selectedJobs.reduce((acc, j) => acc + j.score, 0) / selectedJobs.length);
//         addLog(`📊 Average match score: ${avgScore}% (high relevance)`);
//       }

//       addLog("💳 Verifying credits and starting automation...");

//       let triggerRes;
//       try {
//         // First try enhanced endpoint
//         triggerRes = await api.post("/v1/automate-job-apply-enhanced", {
//           cv_id: currentCvId,
//           role,
//           country,
//           min_match_score: Number(minMatch),
//           max_jobs: selectedJobs.length,
//           selected_jobs: selectedJobs,
//           use_ai_scoring: useAIScoring,
//           use_llm_boost: useLLMBoost
//         });
//       } catch (enhancedError: any) {
//         console.warn("Enhanced automation failed, falling back to basic:", enhancedError);
//         addLog("⚠️ Enhanced automation unavailable, using standard automation...");

//         // Fallback to basic endpoint
//         triggerRes = await api.post("/v1/automate-job-apply", {
//           cv_id: currentCvId,
//           role,
//           country,
//           min_match_score: Number(minMatch),
//           max_jobs: selectedJobs.length,
//           selected_jobs: selectedJobs,
//         });
//       }

//       if (triggerRes.data?.ok) {
//         setRunId(triggerRes.data.run_id || "");
//         setActorRunId(triggerRes.data.actor_run_id || "");

//         addLog("✅ AI automation started successfully!");
//         addLog(`📝 Run ID: ${triggerRes.data.run_id}`);

//         if (triggerRes.data.actor_run_id) {
//           addLog(`🤖 Automation Actor: ${triggerRes.data.actor_run_id}`);
//         }

//         if (triggerRes.data.credits_used) {
//           addLog(`💳 Credits used: ${triggerRes.data.credits_used}`);
//         }

//         // Enhanced feedback with AI insights
//         const { ai_enhanced, scoring_insights } = triggerRes.data;

//         if (scoring_insights) {
//           addLog(`🧠 AI Analysis: ${scoring_insights.average_match} average match quality`);
//           if (scoring_insights.high_quality_matches > 0) {
//             addLog(`⭐ High-quality jobs: ${scoring_insights.high_quality_matches} excellent matches`);
//           }
//         }

//         addLog(`📋 Processing ${selectedJobs.length} AI-selected "${role}" positions`);
//         addLog("🔍 AI is now analyzing companies and crafting applications...");

//         addLog("\n" + "=".repeat(60));
//         addLog("ℹ️  IMPORTANT: You can safely close this modal!");
//         addLog("   • AI automation continues in the background");
//         addLog("   • Real-time notifications when complete");
//         addLog("   • Failed applications are automatically refunded");
//         addLog("   • Check your dashboard for live progress updates");
//         addLog("=".repeat(60) + "\n");

//         setMessage("✅ AI automation is now running in the background. You can close this modal safely and receive notifications when complete.");

//         toast.success(`🚀 AI automation started for ${selectedJobs.length} "${role}" jobs!`, {
//           description: "Running in background. You'll be notified when complete.",
//           duration: 4000,
//         });
//       } else {
//         throw new Error(triggerRes.data?.message || "Failed to start automation");
//       }
//     } catch (err: any) {
//       console.error("❌ Automation start error:", err);
//       const errorMsg = err?.response?.data?.detail || err.message || "Unexpected error";

//       setError(errorMsg);
//       setIsRunning(false);
//       setIsFailed(true);

//       addLog(`❌ Automation Error: ${errorMsg}`);

//       // Enhanced error handling
//       if (err?.response?.status === 402) {
//         addLog("💳 Insufficient credits. Please purchase more credits to continue.");
//         toast.error("❌ Insufficient credits", {
//           description: "Please add more credits to start automation",
//           duration: 5000,
//         });
//       } else if (err?.response?.status === 404) {
//         addLog("📄 CV not found. Please upload a new CV.");
//         toast.error("❌ CV not found", {
//           description: "Please upload a new CV and try again",
//           duration: 5000,
//         });
//       } else if (err?.response?.status === 500) {
//         addLog("🔧 Server error. Our team has been notified.");
//         toast.error("❌ Server error", {
//           description: "Please try again later or contact support",
//           duration: 5000,
//         });
//       } else {
//         toast.error(`❌ Automation failed: ${errorMsg.slice(0, 50)}...`);
//       }
//     } finally {
//       setLoading(false);
//     }
//   };

//   // Enhanced job card (same as before but with better styling)
//   const renderJobCard = (job: Job) => {
//     const getQualityColor = (quality?: string) => {
//       switch (quality) {
//         case "excellent": return "text-green-600 bg-green-50 border-green-200";
//         case "good": return "text-blue-600 bg-blue-50 border-blue-200";
//         case "fair": return "text-yellow-600 bg-yellow-50 border-yellow-200";
//         default: return "text-gray-600 bg-gray-50 border-gray-200";
//       }
//     };

//     const getQualityIcon = (quality?: string) => {
//       switch (quality) {
//         case "excellent": return "🌟";
//         case "good": return "✅";
//         case "fair": return "⚡";
//         default: return "📄";
//       }
//     };

//     return (
//       <div
//         key={job.id}
//         className={`border rounded-lg p-4 cursor-pointer transition-all duration-200 ${
//           selectedJobIds.has(job.id)
//             ? "border-purple-300 bg-purple-50 shadow-md"
//             : "border-gray-200 hover:border-gray-300 hover:shadow-sm"
//         }`}
//         onClick={() => toggleJobSelection(job.id)}
//       >
//         <div className="flex items-start gap-3">
//           <Checkbox
//             checked={selectedJobIds.has(job.id)}
//             onChange={() => toggleJobSelection(job.id)}
//             className="mt-1"
//           />
//           <div className="flex-1 min-w-0">
//             <div className="flex items-start justify-between gap-2">
//               <div className="flex-1 min-w-0">
//                 <h3 className="font-medium text-gray-900 truncate">
//                   {job.title}
//                 </h3>
//                 <div className="flex items-center gap-3 text-sm text-gray-600 mt-1">
//                   <div className="flex items-center gap-1">
//                     <Briefcase className="h-3 w-3" />
//                     <span className="truncate">{job.company}</span>
//                   </div>
//                   {job.location && (
//                     <div className="flex items-center gap-1">
//                       <MapPin className="h-3 w-3" />
//                       <span className="truncate">{job.location}</span>
//                     </div>
//                   )}
//                 </div>

//                 {/* Enhanced AI match reasons */}
//                 {job.match_reasons && job.match_reasons.length > 0 && (
//                   <div className="mt-2 text-xs text-gray-600 bg-gray-50 rounded p-2">
//                     <strong className="text-purple-700">🎯 Why it matches:</strong> {job.match_reasons[0]}
//                     {job.match_reasons.length > 1 && (
//                       <span className="text-gray-400"> +{job.match_reasons.length - 1} more reason{job.match_reasons.length > 2 ? 's' : ''}</span>
//                     )}
//                   </div>
//                 )}

//                 {job.snippet && (
//                   <p className="text-xs text-gray-500 mt-2 line-clamp-2">
//                     {job.snippet}
//                   </p>
//                 )}
//               </div>
//               <div className="flex items-center gap-2 flex-shrink-0">
//                 {/* Enhanced score display */}
//                 <div className={`px-3 py-1 rounded-full text-xs font-medium border ${getQualityColor(job.quality)}`}>
//                   {getQualityIcon(job.quality)} {job.score}%
//                 </div>
//                 <a
//                   href={job.url}
//                   target="_blank"
//                   rel="noopener noreferrer"
//                   className="text-blue-600 hover:text-blue-800 transition-colors"
//                   onClick={(e) => e.stopPropagation()}
//                 >
//                   <ExternalLink className="h-4 w-4" />
//                 </a>
//               </div>
//             </div>
//           </div>
//         </div>
//       </div>
//     );
//   };

//   // Job selection handlers (same as before)
//   const toggleJobSelection = (jobId: string) => {
//     const newSelected = new Set(selectedJobIds);
//     if (newSelected.has(jobId)) {
//       newSelected.delete(jobId);
//     } else {
//       newSelected.add(jobId);
//     }
//     setSelectedJobIds(newSelected);
//   };

//   const selectAllJobs = () => {
//     const allJobIds = new Set(jobs.map((j) => j.id));
//     setSelectedJobIds(allJobIds);
//   };

//   const deselectAllJobs = () => {
//     setSelectedJobIds(new Set());
//   };

//   return (
//     <Dialog open={open} onOpenChange={setOpen}>
//       <DialogTrigger asChild>
//         <Button className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 transition-all duration-200">
//           <Sparkles className="mr-2 h-4 w-4" />
//           Start AI Automation
//         </Button>
//       </DialogTrigger>

//       {/* ✅ FIXED: Improved modal with better scrolling */}
//       <DialogContent className="max-w-6xl max-h-[95vh] overflow-hidden flex flex-col">
//         <div className="flex items-center gap-3 mb-4 flex-shrink-0">
//           <div className="w-10 h-10 bg-gradient-to-r from-purple-600 to-pink-600 rounded-lg flex items-center justify-center">
//             <Sparkles className="h-5 w-5 text-white" />
//           </div>
//           <div>
//             <DialogTitle className="text-xl font-bold">
//               {stage === "form" && "🚀 Configure AI Job Automation"}
//               {stage === "jobs" && `Review AI-Matched Jobs for "${role}" (${selectedJobIds.size}/${jobs.length} selected)`}
//               {stage === "automation" && `AI Automation Progress for "${role}"`}
//             </DialogTitle>
//             <DialogDescription>
//               {stage === "form" && "Set your job search preferences and AI scoring options"}
//               {stage === "jobs" && `Select which AI-matched "${role}" jobs to apply for`}
//               {stage === "automation" && (
//                 isCompleted ? "AI automation completed successfully" :
//                 isFailed ? "AI automation encountered an error" :
//                 `Real-time AI automation progress for "${role}" jobs`
//               )}
//             </DialogDescription>
//           </div>
//         </div>

//         {/* ✅ FIXED: Scrollable content area */}
//         <div className="flex-1 overflow-hidden flex flex-col min-h-0">
//           {/* STAGE 1: FORM WITH ENHANCED SCROLLING */}
//           {stage === "form" && (
//             <div className="overflow-y-auto flex-1 pr-2">
//               <div className="space-y-6 pb-4">
//                 {/* CV Status Display */}
//                 <div className="bg-gray-50 border rounded-lg p-4">
//                   <div className="flex items-center justify-between mb-3">
//                     <h3 className="text-sm font-medium text-gray-900">Current CV</h3>
//                     <Button
//                       size="sm"
//                       variant="outline"
//                       onClick={refreshCvInfo}
//                       disabled={cvLoading}
//                     >
//                       {cvLoading ? (
//                         <Loader2 className="h-4 w-4 animate-spin" />
//                       ) : (
//                         "Refresh CV"
//                       )}
//                     </Button>
//                   </div>

//                   {cvLoading && (
//                     <div className="flex items-center gap-2 text-sm text-gray-600">
//                       <Loader2 className="h-4 w-4 animate-spin" />
//                       <span>Loading CV information...</span>
//                     </div>
//                   )}

//                   {cvError && (
//                     <div className="flex items-start gap-2 p-3 bg-red-50 border border-red-200 rounded-lg">
//                       <AlertCircle className="h-4 w-4 text-red-600 mt-0.5 flex-shrink-0" />
//                       <div className="flex-1">
//                         <p className="text-sm text-red-800">{cvError}</p>
//                         <Button
//                           size="sm"
//                           variant="link"
//                           className="text-red-600 px-0 text-xs mt-1"
//                           onClick={() => window.location.href = "/dashboard"}
//                         >
//                           <Upload className="h-3 w-3 mr-1" />
//                           Upload New CV
//                         </Button>
//                       </div>
//                     </div>
//                   )}

//                   {cvInfo && !cvLoading && !cvError && (
//                     <div className="flex items-start gap-3 p-3 bg-green-50 border border-green-200 rounded-lg">
//                       <CheckCircle2 className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
//                       <div className="flex-1">
//                         <p className="text-sm font-medium text-green-900">{cvInfo.file_name}</p>
//                         <p className="text-xs text-green-700 mt-1">
//                           ID: {cvInfo.id.slice(0, 8)}... • Status: {cvInfo.validation_status}
//                           {cvInfo.has_parsed_data ? " • ✅ Parsed" : " • ⏳ Processing"}
//                         </p>
//                       </div>
//                     </div>
//                   )}

//                   {!cvInfo && !cvLoading && !cvError && (
//                     <div className="text-center py-3">
//                       <p className="text-sm text-gray-500">No CV loaded</p>
//                       <Button
//                         size="sm"
//                         variant="outline"
//                         className="mt-2"
//                         onClick={loadLatestCv}
//                       >
//                         Load Latest CV
//                       </Button>
//                     </div>
//                   )}
//                 </div>

//                 {/* Enhanced Form Fields */}
//                 <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
//                   <div>
//                     <label className="block text-sm font-medium mb-2">
//                       🎯 Job Role * <span className="text-xs text-gray-500">(e.g., "AI Developer", "Software Engineer")</span>
//                     </label>
//                     <Input
//                       type="text"
//                       placeholder="e.g., AI Developer"
//                       value={role}
//                       onChange={(e) => setRole(e.target.value)}
//                       className="w-full"
//                     />
//                   </div>

//                   <div>
//                     <label className="block text-sm font-medium mb-2">🌍 Country *</label>
//                     <select
//                       value={country}
//                       onChange={(e) => setCountry(e.target.value)}
//                       className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
//                     >
//                       <option value="">Select Country</option>
//                       {COUNTRIES.map((c) => (
//                         <option key={c} value={c}>
//                           {c}
//                         </option>
//                       ))}
//                     </select>
//                   </div>

//                   <div>
//                     <label className="block text-sm font-medium mb-2">
//                       📊 Max Jobs (1-50)
//                     </label>
//                     <Input
//                       type="number"
//                       min="1"
//                       max="50"
//                       value={maxJobs}
//                       onChange={(e) => setMaxJobs(e.target.value)}
//                       className="w-full"
//                     />
//                   </div>

//                   <div>
//                     <label className="block text-sm font-medium mb-2">
//                       🎯 Min Match Score (10-100%)
//                       <span className="text-xs text-purple-600">• Lower = more jobs</span>
//                     </label>
//                     <select
//                       value={minMatch}
//                       onChange={(e) => setMinMatch(e.target.value)}
//                       className="w-full border rounded-lg px-3 py-2 text-sm"
//                     >
//                       <option value="">Select match %</option>
//                       {MATCH_PERCENTAGES.map((p) => (
//                         <option key={p} value={p}>
//                           {p}%
//                         </option>
//                       ))}
//                     </select>
//                   </div>

//                   {/* Enhanced AI Scoring Options */}
//                   <div className="col-span-full space-y-3 p-4 bg-gradient-to-r from-purple-50 to-blue-50 rounded-lg border border-purple-200">
//                     <h4 className="font-medium text-purple-900 flex items-center gap-2">
//                       <Brain className="h-4 w-4" />
//                       🧠 AI Scoring Options
//                     </h4>

//                     <label className="flex items-center gap-2 text-sm">
//                       <input
//                         type="checkbox"
//                         checked={useAIScoring}
//                         onChange={(e) => setUseAIScoring(e.target.checked)}
//                         className="rounded"
//                       />
//                       <span>✨ Use AI-powered semantic matching (recommended for better results)</span>
//                     </label>

//                     <label className="flex items-center gap-2 text-sm">
//                       <input
//                         type="checkbox"
//                         checked={useLLMBoost}
//                         onChange={(e) => setUseLLMBoost(e.target.checked)}
//                         disabled={!useAIScoring}
//                         className="rounded"
//                       />
//                       <span>🚀 Enable LLM boost for edge cases (slower but more thorough)</span>
//                     </label>

//                     <p className="text-xs text-purple-700 bg-purple-100 rounded px-2 py-1">
//                       💡 AI scoring analyzes job descriptions semantically and finds better matches beyond just keyword matching. Great for all job types!
//                     </p>
//                   </div>
//                 </div>

//                 {/* ✅ ENHANCED: Progress indicator with better styling */}
//                 {loadingJobs && jobSearchProgress.total > 0 && (
//                   <JobSearchProgress
//                     current={jobSearchProgress.current}
//                     total={jobSearchProgress.total}
//                     phase={jobSearchProgress.phase}
//                   />
//                 )}

//                 {error && (
//                   <div className="bg-red-50 border border-red-200 rounded-lg p-4">
//                     <div className="flex items-start gap-2">
//                       <AlertCircle className="h-5 w-5 text-red-600 mt-0.5 flex-shrink-0" />
//                       <div className="flex-1">
//                         <p className="text-sm text-red-800 font-medium">Search Error</p>
//                         <div className="text-sm text-red-700 mt-1 whitespace-pre-line">{error}</div>
//                       </div>
//                     </div>
//                   </div>
//                 )}

//                 {message && (
//                   <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
//                     <div className="flex items-start gap-2">
//                       <Info className="h-5 w-5 text-blue-600 mt-0.5 flex-shrink-0" />
//                       <div className="flex-1">
//                         <p className="text-sm text-blue-800">{message}</p>
//                       </div>
//                     </div>
//                   </div>
//                 )}

//                 {/* ✅ FIXED: Sticky button area */}
//                 <div className="sticky bottom-0 bg-white border-t pt-4 mt-6">
//                   <Button
//                     onClick={fetchJobs}
//                     disabled={!role || !country || !cvInfo || cvError !== "" || loadingJobs}
//                     className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 w-full"
//                     size="lg"
//                   >
//                     {loadingJobs ? (
//                       <>
//                         <Loader2 className="mr-2 h-4 w-4 animate-spin" />
//                         {useAIScoring ? `🧠 AI Searching for "${role}"...` : `🔍 Searching for "${role}"...`}
//                       </>
//                     ) : (
//                       <>
//                         {useAIScoring ? <Brain className="mr-2 h-4 w-4" /> : <Search className="mr-2 h-4 w-4" />}
//                         {useAIScoring ? `🧠 Find "${role}" Jobs with AI` : `🔍 Find "${role}" Jobs`}
//                       </>
//                     )}
//                   </Button>
//                 </div>
//               </div>
//             </div>
//           )}

//           {/* STAGE 2: JOB SELECTION (enhanced with better scrolling) */}
//           {stage === "jobs" && (
//             <div className="flex flex-col h-full">
//               <div className="flex items-center justify-between mb-4 p-4 bg-gray-50 rounded-lg flex-shrink-0">
//                 <div className="flex items-center gap-4">
//                   <span className="text-sm font-medium">
//                     {selectedJobIds.size} of {jobs.length} AI-matched "{role}" jobs selected
//                   </span>
//                   <div className="flex gap-2">
//                     <Button
//                       size="sm"
//                       variant="outline"
//                       onClick={selectAllJobs}
//                       className="text-xs"
//                     >
//                       Select All
//                     </Button>
//                     <Button
//                       size="sm"
//                       variant="outline"
//                       onClick={deselectAllJobs}
//                       className="text-xs"
//                     >
//                       Deselect All
//                     </Button>
//                   </div>
//                 </div>
//                 <div className="flex gap-2">
//                   <Button
//                     size="sm"
//                     variant="outline"
//                     onClick={() => setStage("form")}
//                   >
//                     Back
//                   </Button>
//                   <Button
//                     onClick={startAutomation}
//                     disabled={selectedJobIds.size === 0}
//                     className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
//                   >
//                     {useAIScoring ? "🚀 AI Apply to" : "Apply to"} {selectedJobIds.size} "{role}" Jobs
//                   </Button>
//                 </div>
//               </div>

//               <div className="flex-1 overflow-y-auto space-y-3 pr-2">
//                 {jobs.map(renderJobCard)}
//               </div>
//             </div>
//           )}

//           {/* STAGE 3: AUTOMATION PROGRESS (enhanced with better scrolling) */}
//           {stage === "automation" && (
//             <div className="flex flex-col h-full">
//               {/* Enhanced failure handling */}
//               {isFailed && (
//                 <div className="bg-red-50 border-2 border-red-200 rounded-xl p-6 mb-4 flex-shrink-0">
//                   <div className="flex items-center gap-3 mb-4">
//                     <div className="w-12 h-12 bg-red-500 rounded-full flex items-center justify-center">
//                       <AlertCircle className="h-6 w-6 text-white" />
//                     </div>
//                     <div>
//                       <h3 className="text-xl font-bold text-red-900">AI Automation Failed</h3>
//                       <p className="text-sm text-red-700">
//                         The AI automation for "{role}" jobs encountered an error
//                       </p>
//                     </div>
//                   </div>

//                   {error && (
//                     <div className="mt-4 p-3 bg-red-100 border border-red-200 rounded-lg">
//                       <p className="text-sm text-red-800">{error}</p>
//                     </div>
//                   )}

//                   <div className="mt-4 flex gap-2">
//                     <Button
//                       onClick={() => {
//                         setStage("form");
//                         setIsFailed(false);
//                         setError("");
//                       }}
//                       variant="outline"
//                       size="sm"
//                     >
//                       Try Again
//                     </Button>
//                     <Button
//                       onClick={() => setOpen(false)}
//                       size="sm"
//                     >
//                       Close
//                     </Button>
//                   </div>
//                 </div>
//               )}

//               {/* Background Processing Notice */}
//               {isRunning && !isCompleted && !isFailed && (
//                 <div className="bg-gradient-to-r from-blue-50 to-purple-50 border-2 border-purple-200 rounded-xl p-4 mb-4 flex-shrink-0">
//                   <div className="flex items-start gap-3">
//                     <div className="w-10 h-10 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full flex items-center justify-center animate-pulse">
//                       <Zap className="h-5 w-5 text-white" />
//                     </div>
//                     <div className="flex-1">
//                       <h4 className="font-semibold text-gray-900 mb-1">
//                         🚀 AI Automation Running for "{role}" Jobs
//                       </h4>
//                       <p className="text-sm text-gray-700 mb-3">
//                         AI is processing your "{role}" job applications in the background. You can safely close this modal.
//                         You'll receive a notification when complete, and failed applications will be automatically refunded.
//                       </p>
//                       <div className="flex items-center gap-2 text-xs text-purple-700">
//                         <CheckCircle2 className="h-4 w-4" />
//                         <span>Check your dashboard for real-time progress updates</span>
//                       </div>
//                     </div>
//                   </div>
//                 </div>
//               )}

//               {/* Success UI - Enhanced for user search context */}
//               {isCompleted && completionStats && (
//                 <div className="relative overflow-hidden bg-gradient-to-br from-purple-500/10 via-pink-500/10 to-blue-500/10 border-2 border-purple-200 rounded-2xl p-8 mb-4 flex-shrink-0">
//                   {/* Decorative Background Elements */}
//                   <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-purple-400/20 to-pink-400/20 rounded-full blur-3xl"></div>
//                   <div className="absolute -bottom-4 -left-4 w-24 h-24 bg-gradient-to-br from-blue-400/20 to-purple-400/20 rounded-full blur-2xl"></div>

//                   <div className="relative z-10">
//                     {/* Header Section */}
//                     <div className="flex items-center gap-4 mb-6">
//                       <div className="w-16 h-16 bg-gradient-to-r from-purple-600 to-pink-600 rounded-2xl flex items-center justify-center shadow-lg">
//                         {completionStats.failed === 0 ? (
//                           <Trophy className="h-8 w-8 text-white" />
//                         ) : (
//                           <Star className="h-8 w-8 text-white" />
//                         )}
//                       </div>
//                       <div>
//                         <h3 className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
//                           {completionStats.failed === 0 ? "🎉 Perfect AI Automation!" : "✅ AI Automation Complete!"}
//                         </h3>
//                         <p className="text-gray-600 font-medium">
//                           {completionStats.failed === 0
//                             ? `AI successfully applied to all ${completionStats.successful} "${role}" jobs!`
//                             : `AI applied to ${completionStats.successful} "${role}" jobs • ${completionStats.failed} failed (refunded)`
//                           }
//                         </p>
//                       </div>
//                     </div>

//                     {/* Stats Grid */}
//                     <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
//                       <div className="bg-white/70 backdrop-blur-sm border border-purple-200/50 rounded-xl p-4 text-center group hover:scale-105 transition-transform duration-200">
//                         <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-500 rounded-lg flex items-center justify-center mx-auto mb-3 group-hover:rotate-12 transition-transform">
//                           <Target className="h-5 w-5 text-white" />
//                         </div>
//                         <div className="text-2xl font-bold text-gray-900">{completionStats.total_applied}</div>
//                         <div className="text-xs font-medium text-gray-600">Total "{role}" Jobs</div>
//                       </div>

//                       <div className="bg-white/70 backdrop-blur-sm border border-green-200/50 rounded-xl p-4 text-center group hover:scale-105 transition-transform duration-200">
//                         <div className="w-10 h-10 bg-gradient-to-r from-green-500 to-emerald-500 rounded-lg flex items-center justify-center mx-auto mb-3 group-hover:rotate-12 transition-transform">
//                           <CheckCircle2 className="h-5 w-5 text-white" />
//                         </div>
//                         <div className="text-2xl font-bold text-green-600">{completionStats.successful}</div>
//                         <div className="text-xs font-medium text-gray-600">Successful</div>
//                       </div>

//                       <div className="bg-white/70 backdrop-blur-sm border border-red-200/50 rounded-xl p-4 text-center group hover:scale-105 transition-transform duration-200">
//                         <div className="w-10 h-10 bg-gradient-to-r from-red-500 to-pink-500 rounded-lg flex items-center justify-center mx-auto mb-3 group-hover:rotate-12 transition-transform">
//                           <AlertCircle className="h-5 w-5 text-white" />
//                         </div>
//                         <div className="text-2xl font-bold text-red-600">{completionStats.failed}</div>
//                         <div className="text-xs font-medium text-gray-600">Failed</div>
//                       </div>

//                       <div className="bg-white/70 backdrop-blur-sm border border-purple-200/50 rounded-xl p-4 text-center group hover:scale-105 transition-transform duration-200">
//                         <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg flex items-center justify-center mx-auto mb-3 group-hover:rotate-12 transition-transform">
//                           <Award className="h-5 w-5 text-white" />
//                         </div>
//                         <div className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
//                           {completionStats.success_rate}%
//                         </div>
//                         <div className="text-xs font-medium text-gray-600">Success Rate</div>
//                       </div>
//                     </div>

//                     {/* Duration & Actions */}
//                     <div className="flex items-center justify-between">
//                       <div className="flex items-center gap-2 text-sm font-medium text-gray-700">
//                         <Clock className="h-4 w-4" />
//                         <span>Completed in {Math.floor(completionStats.duration / 60)}m {completionStats.duration % 60}s</span>
//                       </div>

//                       <Button
//                         onClick={() => window.location.href = "/my-applications"}
//                         className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white"
//                       >
//                         View Applications
//                       </Button>
//                     </div>

//                     {/* Credit Refund Notice */}
//                     {completionStats.failed > 0 && (
//                       <div className="mt-4 p-4 bg-gradient-to-r from-blue-50 to-purple-50 border border-blue-200 rounded-xl">
//                         <div className="flex items-start gap-3">
//                           <Info className="h-5 w-5 text-blue-600 mt-0.5 flex-shrink-0" />
//                           <div>
//                             <p className="text-sm font-medium text-blue-900">💳 Credits Automatically Refunded</p>
//                             <p className="text-xs text-blue-800 mt-1">
//                               You've been refunded credits for the {completionStats.failed} failed application{completionStats.failed > 1 ? 's' : ''}.
//                               Check your transaction history for details.
//                             </p>
//                           </div>
//                         </div>
//                       </div>
//                     )}
//                   </div>
//                 </div>
//               )}

//               {error && !isFailed && (
//                 <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4 flex-shrink-0">
//                   <div className="flex items-start gap-2">
//                     <AlertCircle className="h-5 w-5 text-red-600 mt-0.5 flex-shrink-0" />
//                     <p className="text-sm text-red-800">{error}</p>
//                   </div>
//                 </div>
//               )}

//               {message && (
//                 <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-4 flex-shrink-0">
//                   <div className="flex items-start gap-2">
//                     <CheckCircle2 className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
//                     <p className="text-sm text-green-800">{message}</p>
//                   </div>
//                 </div>
//               )}

//               {/* ✅ FIXED: Scrollable logs section */}
//               <div className="flex-1 overflow-hidden flex flex-col min-h-0">
//                 <h3 className="font-medium mb-2 flex items-center gap-2 flex-shrink-0">
//                   <span>Live AI Automation Logs</span>
//                   {isRunning && !isFailed && (
//                     <div className="flex items-center gap-1 text-xs text-green-600">
//                       <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
//                       Running
//                     </div>
//                   )}
//                   {isFailed && (
//                     <div className="flex items-center gap-1 text-xs text-red-600">
//                       <div className="w-2 h-2 bg-red-500 rounded-full"></div>
//                       Failed
//                     </div>
//                   )}
//                 </h3>
//                 <div
//                   ref={logBoxRef}
//                   className="flex-1 bg-gray-900 text-green-400 p-4 rounded-lg font-mono text-xs overflow-y-auto"
//                 >
//                   {logs.length === 0 ? (
//                     <p className="text-gray-500">AI automation logs will appear here...</p>
//                   ) : (
//                     logs.map((log, i) => (
//                       <div key={i} className="mb-1 whitespace-pre-wrap">
//                         {log}
//                       </div>
//                     ))
//                   )}
//                 </div>
//               </div>

//               {/* Proof Gallery */}
//               {proofs.length > 0 && (
//                 <div className="mt-4 flex-shrink-0">
//                   <h4 className="font-medium mb-2">Application Proofs ({proofs.length})</h4>
//                   <div className="grid grid-cols-2 md:grid-cols-4 gap-2 max-h-32 overflow-y-auto">
//                     {proofs.map((proof, i) => (
//                       <a
//                         key={i}
//                         href={proof}
//                         target="_blank"
//                         rel="noopener noreferrer"
//                         className="block"
//                       >
//                         <img
//                           src={proof}
//                           alt={`Application proof ${i + 1}`}
//                           className="w-full h-20 object-cover rounded border hover:border-purple-400 transition-colors"
//                         />
//                       </a>
//                     ))}
//                   </div>
//                 </div>
//               )}
//             </div>
//           )}
//         </div>
//       </DialogContent>
//     </Dialog>
//   );
// }
// // src/components/AutomateModal-SSE-Fixed.tsx - FIXED SSE CONNECTION MANAGEMENT
// "use client";

// import { useEffect, useRef, useState, useMemo, useCallback } from "react";
// import {
//   Loader2, Search, Sparkles, X, CheckCircle2, AlertCircle,
//   Briefcase, MapPin, TrendingUp, ExternalLink, Check, PartyPopper,
//   Clock, Target, Award, Info, Upload, Trophy, Star, Zap
// } from "lucide-react";
// import { Button } from "@/components/ui/button";
// import { Input } from "@/components/ui/input";
// import { Checkbox } from "@/components/ui/checkbox";
// import {
//   Dialog,
//   DialogTrigger,
//   DialogContent,
//   DialogTitle,
//   DialogDescription,
// } from "@/components/ui/dialog";
// import { toast } from "sonner";
// import api from "@/lib/api";

// const COUNTRIES = [
//   "Argentina", "Australia", "Austria", "Bangladesh", "Belgium", "Brazil", "Canada",
//   "Chile", "China", "Colombia", "Czech Republic", "Denmark", "Egypt", "Finland",
//   "France", "Germany", "Greece", "Hong Kong", "Hungary", "India", "Indonesia",
//   "Ireland", "Israel", "Italy", "Japan", "Kenya", "Kuwait", "Malaysia", "Mexico",
//   "Morocco", "Netherlands", "New Zealand", "Nigeria", "Norway", "Pakistan",
//   "Philippines", "Poland", "Portugal", "Qatar", "Romania", "Russia", "Saudi Arabia",
//   "Serbia", "Singapore", "Slovakia", "South Africa", "Spain", "Sri Lanka", "Sweden",
//   "Switzerland", "Taiwan", "Thailand", "Turkey", "Ukraine", "United Arab Emirates",
//   "United Kingdom", "United States", "Uruguay", "Vietnam", "Zimbabwe", "Remote",
// ];
// const MATCH_PERCENTAGES = ["10", "20", "30", "40", "50", "60", "70", "80", "90"];

// type SSEMessage =
//   | { type: "info"; msg: string; ts: string }
//   | { type: "proof"; msg: string; url: string; ts: string }
//   | { type: "done"; msg: string; ts: string }
//   | { type: "completion"; msg: string; run_id: string; total_applied: number; successful: number; failed: number; success_rate: number; duration: number; ts: string }
//   | { type: "warning"; msg: string; refund_pending?: boolean; refund_issued?: boolean; ts: string }
//   | { type: "error"; msg: string; ts: string }
//   | { type: "connected"; user_id: string; connection_id?: string; ts: string }
//   | { type: "ping"; connection_id?: string; ts: string };

// interface Job {
//   id: string;
//   title: string;
//   company: string;
//   location?: string;
//   url: string;
//   snippet?: string;
//   score: number;
//   source?: string;
// }

// interface AutomationStats {
//   total_applied: number;
//   successful: number;
//   failed: number;
//   success_rate: number;
//   duration: number;
// }

// interface CVInfo {
//   id: string;
//   file_name: string;
//   has_parsed_data: boolean;
//   needs_parsing: boolean;
//   validation_status: string;
// }

// interface AutomateModalProps {
//   cvId?: string;
//   token: string;
//   onAutomationDone?: (finalLogs: string[], stats?: AutomationStats) => void;
// }

// // ✅ CUSTOM HOOK: Proper SSE Connection Management
// function useSSEConnection(
//   isRunning: boolean,
//   userId: string | null,
//   API_BASE: string,
//   addLog: (msg: string) => void,
//   setProofs: React.Dispatch<React.SetStateAction<string[]>>,
//   setIsCompleted: React.Dispatch<React.SetStateAction<boolean>>,
//   setIsRunning: React.Dispatch<React.SetStateAction<boolean>>,
//   setIsFailed: React.Dispatch<React.SetStateAction<boolean>>,
//   setError: React.Dispatch<React.SetStateAction<string>>,
//   setCompletionStats: React.Dispatch<React.SetStateAction<AutomationStats | null>>,
//   setMessage: React.Dispatch<React.SetStateAction<string>>,
//   onAutomationDone?: (finalLogs: string[], stats?: AutomationStats) => void
// ) {
//   const eventSourceRef = useRef<EventSource | null>(null);
//   const connectionIdRef = useRef<string | null>(null);

//   useEffect(() => {
//     // ✅ CRITICAL: Only create connection if we don't already have one
//     if (!isRunning || !userId || eventSourceRef.current) {
//       return;
//     }

//     console.log("🔗 Creating NEW SSE connection for user:", userId);
//     addLog("📡 Connecting to automation stream...");

//     const sseUrl = `${API_BASE}/v1/sse/stream?user_id=${userId}`;
//     const evt = new EventSource(sseUrl);
//     eventSourceRef.current = evt;

//     evt.onopen = () => {
//       addLog("✅ Connected to live automation feed");
//       console.log("✅ SSE Connected successfully");
//     };

//     evt.onmessage = (event) => {
//       try {
//         const data: SSEMessage = JSON.parse(event.data);

//         console.log("📨 Received SSE event:", data.type, data);

//         if (data.type === "connected") {
//           console.log(`🔗 Connection confirmed (ID: ${data.connection_id})`);
//           connectionIdRef.current = data.connection_id || null;
//           return;
//         }

//         if (data.type === "ping") {
//           // Just a heartbeat, ignore
//           return;
//         }

//         if (data.type === "proof" && data.url) {
//           setProofs((p) => [...p, data.url]);
//           addLog(`📸 ${data.msg}`);
//         }
//         else if (data.type === "completion") {
//           const stats: AutomationStats = {
//             total_applied: data.total_applied,
//             successful: data.successful,
//             failed: data.failed,
//             success_rate: data.success_rate,
//             duration: data.duration
//           };

//           console.log("🎯 Completion stats received:", stats);

//           setCompletionStats(stats);
//           setIsCompleted(true);
//           setIsRunning(false);

//           addLog(`\n${"=".repeat(60)}`);
//           addLog(`🎉 AUTOMATION COMPLETED!`);
//           addLog(`${"=".repeat(60)}`);
//           addLog(`📊 Results Summary:`);
//           addLog(`   ✅ Successfully Applied: ${stats.successful} jobs`);
//           addLog(`   ❌ Failed Applications: ${stats.failed} jobs`);
//           addLog(`   📈 Success Rate: ${stats.success_rate}%`);
//           addLog(`   ⏱️  Total Duration: ${Math.floor(stats.duration / 60)}m ${stats.duration % 60}s`);

//           if (stats.failed > 0) {
//             addLog(`   💳 Credits will be refunded for ${stats.failed} failed applications`);
//           }

//           addLog(`${"=".repeat(60)}\n`);
//           addLog(`💡 Tip: Check your dashboard for detailed application history`);

//           setMessage("✅ Automation completed successfully!");

//           if (onAutomationDone) {
//             onAutomationDone([], stats);
//           }

//           localStorage.setItem("last_automation_stats", JSON.stringify(stats));

//           if (stats.failed === 0) {
//             toast.success(`🎉 Perfect! Applied to all ${stats.successful} jobs!`, {
//               description: `Success rate: 100% | Duration: ${Math.floor(stats.duration / 60)}m ${stats.duration % 60}s`,
//               duration: 5000,
//             });
//           } else if (stats.success_rate >= 70) {
//             toast.success(`🎉 Applied to ${stats.successful} jobs!`, {
//               description: `${stats.failed} failed (credits refunded). Success rate: ${stats.success_rate}%`,
//               duration: 5000,
//             });
//           } else {
//             toast.warning(`⚠️ Applied to ${stats.successful} of ${stats.total_applied} jobs`, {
//               description: `${stats.failed} failed. Credits refunded. Success rate: ${stats.success_rate}%`,
//               duration: 6000,
//             });
//           }

//           setTimeout(() => {
//             window.dispatchEvent(new Event('automation-completed'));
//           }, 1000);
//         }
//         else if (data.type === "warning") {
//           addLog(`⚠️ ${data.msg}`);

//           if (data.refund_pending || data.refund_issued) {
//             toast.info("💳 Credits will be refunded for failed applications");
//           }
//         }
//         else if (data.type === "done") {
//           addLog(`✅ ${data.msg}`);
//           setIsCompleted(true);
//           setIsRunning(false);
//           toast.success("🎉 Automation finished!");
//         }
//         else if (data.type === "error") {
//           addLog(`❌ ${data.msg}`);
//           setIsRunning(false);
//           setIsFailed(true);
//           setError(data.msg);
//           toast.error(`❌ Automation failed: ${data.msg}`);
//         }
//         else if (data.msg) {
//           addLog(data.msg);
//         }
//       } catch (e) {
//         console.error("Failed to parse SSE message:", e);
//         addLog("⚠️ Error parsing server message");
//       }
//     };

//     evt.onerror = (error) => {
//       console.error("❌ SSE Connection error:", error);
//       addLog("⚠️ Connection to stream closed");

//       // ✅ IMPORTANT: Close and cleanup on error
//       if (eventSourceRef.current) {
//         eventSourceRef.current.close();
//         eventSourceRef.current = null;
//       }
//     };

//     // ✅ CLEANUP function
//     return () => {
//       console.log(`🔌 Cleaning up SSE connection (ID: ${connectionIdRef.current})`);
//       if (eventSourceRef.current) {
//         eventSourceRef.current.close();
//         eventSourceRef.current = null;
//       }
//       connectionIdRef.current = null;
//     };
//   }, [isRunning, userId, API_BASE]); // ✅ Stable dependencies only

//   // ✅ Cleanup when component unmounts
//   useEffect(() => {
//     return () => {
//       if (eventSourceRef.current) {
//         console.log("🔌 Component unmounting - closing SSE");
//         eventSourceRef.current.close();
//         eventSourceRef.current = null;
//       }
//     };
//   }, []);
// }

// export default function AutomateModal({
//   cvId: propCvId,
//   token,
//   onAutomationDone,
// }: AutomateModalProps) {
//   // Modal state
//   const [open, setOpen] = useState(false);

//   // CV state management with localStorage
//   const [currentCvId, setCurrentCvId] = useState<string>("");
//   const [cvInfo, setCvInfo] = useState<CVInfo | null>(null);
//   const [cvLoading, setCvLoading] = useState(false);
//   const [cvError, setCvError] = useState("");

//   // Form inputs
//   const [role, setRole] = useState("");
//   const [country, setCountry] = useState("");
//   const [maxJobs, setMaxJobs] = useState("5");
//   const [minMatch, setMinMatch] = useState("10");

//   // Workflow stages
//   const [stage, setStage] = useState<"form" | "jobs" | "automation">("form");

//   // Jobs state
//   const [jobs, setJobs] = useState<Job[]>([]);
//   const [selectedJobIds, setSelectedJobIds] = useState<Set<string>>(new Set());
//   const [loadingJobs, setLoadingJobs] = useState(false);

//   // Automation state
//   const [logs, setLogs] = useState<string[]>([]);
//   const [proofs, setProofs] = useState<string[]>([]);
//   const [loading, setLoading] = useState(false);
//   const [isRunning, setIsRunning] = useState(false);
//   const [isCompleted, setIsCompleted] = useState(false);
//   const [isFailed, setIsFailed] = useState(false);
//   const [completionStats, setCompletionStats] = useState<AutomationStats | null>(null);
//   const [message, setMessage] = useState("");
//   const [error, setError] = useState("");
//   const [runId, setRunId] = useState<string>("");
//   const [actorRunId, setActorRunId] = useState<string>("");

//   const logBoxRef = useRef<HTMLDivElement | null>(null);

//   const API_BASE =
//     import.meta.env.VITE_API_URL?.replace(/\/+$/, "") || "http://127.0.0.1:8000";

//   // ✅ Get user ID once and memoize it
//   const userId = useMemo(() => {
//     try {
//       const token = localStorage.getItem("access_token");
//       if (!token) return null;

//       const payload = JSON.parse(atob(token.split('.')[1]));
//       return payload.sub;
//     } catch (e) {
//       console.error("Failed to decode token:", e);
//       return null;
//     }
//   }, []);

//   // ✅ Stable addLog function
//   const addLog = useCallback((message: string) => {
//     const timestamp = new Date().toLocaleTimeString();
//     setLogs((prev) => [...prev, `[${timestamp}] ${message}`]);
//   }, []);

//   // ✅ Use the custom SSE hook
//   useSSEConnection(
//     isRunning,
//     userId,
//     API_BASE,
//     addLog,
//     setProofs,
//     setIsCompleted,
//     setIsRunning,
//     setIsFailed,
//     setError,
//     setCompletionStats,
//     setMessage,
//     onAutomationDone
//   );

//   // Initialize CV from localStorage or props
//   useEffect(() => {
//     const initializeCv = () => {
//       const storedCvId = localStorage.getItem("current_cv_id");
//       const targetCvId = propCvId || storedCvId;

//       console.log("🔍 CV Initialization:");
//       console.log("  Props CV ID:", propCvId);
//       console.log("  Stored CV ID:", storedCvId);
//       console.log("  Target CV ID:", targetCvId);

//       if (targetCvId && targetCvId !== "undefined" && targetCvId !== "null") {
//         setCurrentCvId(targetCvId);
//         loadCvInfo(targetCvId);
//       } else {
//         loadLatestCv();
//       }
//     };

//     if (open) {
//       initializeCv();
//     }
//   }, [open, propCvId]);

//   // Load CV information
//   const loadCvInfo = async (cvId: string) => {
//     if (!cvId || cvId === "undefined" || cvId === "null") {
//       setCvError("No CV ID provided");
//       return;
//     }

//     setCvLoading(true);
//     setCvError("");

//     try {
//       console.log("📋 Loading CV info for:", cvId);

//       const response = await api.get(`/v1/cvs/${cvId}`);

//       if (response.data?.ok && response.data?.id) {
//         const cvData: CVInfo = {
//           id: response.data.id,
//           file_name: response.data.file_name || "Unknown CV",
//           has_parsed_data: response.data.has_parsed_data || false,
//           needs_parsing: response.data.needs_parsing || false,
//           validation_status: response.data.validation_status || "unknown"
//         };

//         setCvInfo(cvData);
//         setCurrentCvId(cvId);

//         localStorage.setItem("current_cv_id", cvId);

//         console.log("✅ CV loaded successfully:", cvData);

//         if (cvData.needs_parsing) {
//           setCvError("⚠️ CV is being processed. Please wait a moment and try again.");
//         }
//       } else {
//         throw new Error("Invalid CV response");
//       }
//     } catch (err: any) {
//       console.error("❌ CV loading failed:", err);
//       const errorMsg = err?.response?.data?.detail || err.message || "Failed to load CV";
//       setCvError(errorMsg);
//       setCvInfo(null);

//       if (localStorage.getItem("current_cv_id") === cvId) {
//         localStorage.removeItem("current_cv_id");
//       }
//     } finally {
//       setCvLoading(false);
//     }
//   };

//   // Load latest CV when no specific CV is available
//   const loadLatestCv = async () => {
//     setCvLoading(true);
//     setCvError("");

//     try {
//       console.log("🔍 Loading latest CV...");

//       const response = await api.get("/v1/cvs/latest");

//       if (response.data?.ok && response.data?.id) {
//         const cvData: CVInfo = {
//           id: response.data.id,
//           file_name: response.data.file_name || "Latest CV",
//           has_parsed_data: response.data.has_parsed_data || false,
//           needs_parsing: response.data.needs_parsing || false,
//           validation_status: response.data.validation_status || "valid"
//         };

//         setCvInfo(cvData);
//         setCurrentCvId(cvData.id);
//         localStorage.setItem("current_cv_id", cvData.id);

//         console.log("✅ Latest CV loaded:", cvData);

//         if (cvData.needs_parsing) {
//           setCvError("⚠️ CV is being processed. Please wait and try again.");
//         }
//       } else {
//         throw new Error("No CV found");
//       }
//     } catch (err: any) {
//       console.error("❌ Latest CV loading failed:", err);
//       setCvError("❌ No CV found. Please upload a CV first!");
//       setCvInfo(null);
//     } finally {
//       setCvLoading(false);
//     }
//   };

//   // Refresh CV info
//   const refreshCvInfo = () => {
//     if (currentCvId) {
//       loadCvInfo(currentCvId);
//     } else {
//       loadLatestCv();
//     }
//   };

//   // Auto-scroll logs
//   useEffect(() => {
//     if (!logBoxRef.current) return;
//     logBoxRef.current.scrollTop = logBoxRef.current.scrollHeight;
//   }, [logs]);

//   // Reset state when modal closes
//   useEffect(() => {
//     if (!open) {
//       setStage("form");
//       setJobs([]);
//       setSelectedJobIds(new Set());
//       setLogs([]);
//       setProofs([]);
//       setError("");
//       setMessage("");
//       setRunId("");
//       setActorRunId("");
//       setIsRunning(false);
//       setIsCompleted(false);
//       setIsFailed(false);
//       setCompletionStats(null);
//       setCvError("");
//     }
//   }, [open]);

//   // Job fetching with proper CV validation
//   const fetchJobs = async () => {
//     setLoadingJobs(true);
//     setError("");
//     setMessage("");

//     if (!currentCvId || currentCvId === "undefined" || currentCvId === "null") {
//       setError("❌ No CV selected. Please upload a CV first!");
//       setLoadingJobs(false);
//       return;
//     }

//     if (!cvInfo) {
//       setError("❌ CV information not loaded. Click 'Refresh CV' to try again.");
//       setLoadingJobs(false);
//       return;
//     }

//     if (cvInfo.needs_parsing) {
//       setError("❌ CV is still being processed. Please wait a moment and try again.");
//       setLoadingJobs(false);
//       return;
//     }

//     if (!role || !country) {
//       setError("❌ Please fill in both role and country fields.");
//       setLoadingJobs(false);
//       return;
//     }

//     try {
//       console.log("🔍 Fetching jobs with params:", {
//         cv_id: currentCvId,
//         role,
//         country,
//         minMatch,
//         maxJobs
//       });

//       const res = await api.post("/v1/jobs/fetch-and-score", {
//         cv_id: currentCvId,
//         role,
//         country,
//         min_match_score: Number(minMatch),
//         max_jobs: Number(maxJobs),
//       });

//       if (res.data?.jobs) {
//         setJobs(res.data.jobs);
//         const allJobIds = new Set(res.data.jobs.map((j: Job) => j.id));
//         setSelectedJobIds(allJobIds);
//         setStage("jobs");

//         console.log(`✅ Found ${res.data.jobs.length} jobs`);
//         toast.success(`Found ${res.data.jobs.length} matching jobs!`);
//       } else {
//         setError("❌ No jobs found matching your criteria. Try adjusting your search parameters.");
//       }
//     } catch (err: any) {
//       console.error("❌ Job fetch error:", err);
//       const errorMsg = err?.response?.data?.detail || err.message || "Failed to fetch jobs";
//       setError(`❌ ${errorMsg}`);

//       if (err?.response?.status === 404) {
//         setError("❌ CV not found. Please refresh or upload a new CV.");
//       } else if (err?.response?.status === 402) {
//         setError("❌ Insufficient credits. Please purchase more credits.");
//       }
//     } finally {
//       setLoadingJobs(false);
//     }
//   };

//   // Automation start with better validation
//   const startAutomation = async () => {
//     if (selectedJobIds.size === 0) {
//       toast.error("Please select at least one job to apply.");
//       return;
//     }

//     if (selectedJobIds.size > 50) {
//       toast.error("Maximum 50 jobs allowed per automation run. Please deselect some jobs.");
//       return;
//     }

//     if (!currentCvId || !cvInfo) {
//       toast.error("❌ No valid CV found. Please upload a CV first.");
//       return;
//     }

//     setLoading(true);
//     setError("");
//     setMessage("");
//     setLogs([]);
//     setProofs([]);
//     setRunId("");
//     setActorRunId("");
//     setIsRunning(true);
//     setIsCompleted(false);
//     setIsFailed(false);
//     setCompletionStats(null);
//     setStage("automation");

//     try {
//       const selectedJobs = jobs.filter((j) => selectedJobIds.has(j.id));

//       addLog("🚀 Starting job automation...");
//       addLog(`📋 Using CV: ${cvInfo.file_name} (ID: ${currentCvId})`);
//       addLog(`🎯 Applying to ${selectedJobs.length} selected jobs`);
//       addLog(`📊 Average match score: ${(selectedJobs.reduce((acc, j) => acc + j.score, 0) / selectedJobs.length).toFixed(1)}%`);
//       addLog("💳 Checking credits...");

//       addLog("🔄 Initiating automation request...");
//       const triggerRes = await api.post("/v1/automate-job-apply", {
//         cv_id: currentCvId,
//         role,
//         country,
//         min_match_score: Number(minMatch),
//         max_jobs: selectedJobs.length,
//         selected_jobs: selectedJobs,
//       });

//       if (triggerRes.data?.ok) {
//         setRunId(triggerRes.data.run_id || "");
//         setActorRunId(triggerRes.data.actor_run_id || "");

//         addLog("✅ Automation started successfully!");
//         addLog(`📝 Run ID: ${triggerRes.data.run_id}`);

//         if (triggerRes.data.actor_run_id) {
//           addLog(`🤖 Actor ID: ${triggerRes.data.actor_run_id}`);
//         }

//         if (triggerRes.data.credits_used) {
//           addLog(`💳 Credits used: ${triggerRes.data.credits_used}`);
//         }

//         addLog(`📋 Processing ${selectedJobs.length} selected jobs`);
//         addLog("🔍 AI is now discovering companies and sending applications...");
//         addLog("\n" + "=".repeat(60));
//         addLog("ℹ️  IMPORTANT: You can close this modal safely!");
//         addLog("   • Automation continues running in the background");
//         addLog("   • You'll receive a notification when complete");
//         addLog("   • Failed applications will be refunded automatically");
//         addLog("   • Check dashboard for real-time progress");
//         addLog("=".repeat(60) + "\n");

//         setMessage("✅ Automation running in background. You can close this modal safely.");

//         toast.success("🚀 Automation started successfully!", {
//           description: "Running in background. You'll be notified when complete.",
//           duration: 4000,
//         });
//       } else {
//         throw new Error(triggerRes.data?.message || "Failed to start automation");
//       }
//     } catch (err: any) {
//       console.error("❌ Automation start error:", err);
//       const errorMsg = err?.response?.data?.detail || err.message || "Unexpected error";

//       setError(errorMsg);
//       setIsRunning(false);
//       setIsFailed(true);

//       addLog(`❌ Error: ${errorMsg}`);

//       if (err?.response?.status === 402) {
//         addLog("💳 Insufficient credits. Please purchase more credits.");
//         toast.error("❌ Insufficient credits");
//       } else if (err?.response?.status === 404) {
//         addLog("📄 CV not found. Please upload a CV first.");
//         toast.error("❌ CV not found");
//       } else if (err?.response?.status === 500) {
//         addLog("🔧 Server configuration error. Please contact support.");
//         toast.error("❌ Server error - please try again later");
//       } else {
//         toast.error(`❌ Automation failed: ${errorMsg}`);
//       }
//     } finally {
//       setLoading(false);
//     }
//   };

//   // Job selection handlers
//   const toggleJobSelection = (jobId: string) => {
//     const newSelected = new Set(selectedJobIds);
//     if (newSelected.has(jobId)) {
//       newSelected.delete(jobId);
//     } else {
//       newSelected.add(jobId);
//     }
//     setSelectedJobIds(newSelected);
//   };

//   const selectAllJobs = () => {
//     const allJobIds = new Set(jobs.map((j) => j.id));
//     setSelectedJobIds(allJobIds);
//   };

//   const deselectAllJobs = () => {
//     setSelectedJobIds(new Set());
//   };

//   return (
//     <Dialog open={open} onOpenChange={setOpen}>
//       <DialogTrigger asChild>
//         <Button className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700">
//           <Sparkles className="mr-2 h-4 w-4" />
//           Start Automation
//         </Button>
//       </DialogTrigger>

//       <DialogContent className="max-w-6xl max-h-[90vh] overflow-hidden flex flex-col">
//         <div className="flex items-center gap-3 mb-4">
//           <div className="w-10 h-10 bg-gradient-to-r from-purple-600 to-pink-600 rounded-lg flex items-center justify-center">
//             <Sparkles className="h-5 w-5 text-white" />
//           </div>
//           <div>
//             <DialogTitle className="text-xl font-bold">
//               {stage === "form" && "Configure Job Automation"}
//               {stage === "jobs" && `Review Jobs (${selectedJobIds.size}/${jobs.length} selected)`}
//               {stage === "automation" && "Automation Progress"}
//             </DialogTitle>
//             <DialogDescription>
//               {stage === "form" && "Set your job preferences and requirements"}
//               {stage === "jobs" && "Select which jobs to apply for"}
//               {stage === "automation" && (
//                 isCompleted ? "Automation completed" :
//                 isFailed ? "Automation failed" :
//                 "Real-time automation progress"
//               )}
//             </DialogDescription>
//           </div>
//         </div>

//         <div className="flex-1 overflow-hidden flex flex-col">
//           {/* STAGE 1: FORM WITH CV DISPLAY */}
//           {stage === "form" && (
//             <div className="space-y-6">
//               {/* CV Status Display */}
//               <div className="bg-gray-50 border rounded-lg p-4">
//                 <div className="flex items-center justify-between mb-3">
//                   <h3 className="text-sm font-medium text-gray-900">Current CV</h3>
//                   <Button
//                     size="sm"
//                     variant="outline"
//                     onClick={refreshCvInfo}
//                     disabled={cvLoading}
//                   >
//                     {cvLoading ? (
//                       <Loader2 className="h-4 w-4 animate-spin" />
//                     ) : (
//                       "Refresh CV"
//                     )}
//                   </Button>
//                 </div>

//                 {cvLoading && (
//                   <div className="flex items-center gap-2 text-sm text-gray-600">
//                     <Loader2 className="h-4 w-4 animate-spin" />
//                     <span>Loading CV information...</span>
//                   </div>
//                 )}

//                 {cvError && (
//                   <div className="flex items-start gap-2 p-3 bg-red-50 border border-red-200 rounded-lg">
//                     <AlertCircle className="h-4 w-4 text-red-600 mt-0.5 flex-shrink-0" />
//                     <div className="flex-1">
//                       <p className="text-sm text-red-800">{cvError}</p>
//                       <Button
//                         size="sm"
//                         variant="link"
//                         className="text-red-600 px-0 text-xs mt-1"
//                         onClick={() => window.location.href = "/dashboard"}
//                       >
//                         <Upload className="h-3 w-3 mr-1" />
//                         Upload New CV
//                       </Button>
//                     </div>
//                   </div>
//                 )}

//                 {cvInfo && !cvLoading && !cvError && (
//                   <div className="flex items-start gap-3 p-3 bg-green-50 border border-green-200 rounded-lg">
//                     <CheckCircle2 className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
//                     <div className="flex-1">
//                       <p className="text-sm font-medium text-green-900">{cvInfo.file_name}</p>
//                       <p className="text-xs text-green-700 mt-1">
//                         ID: {cvInfo.id.slice(0, 8)}... • Status: {cvInfo.validation_status}
//                         {cvInfo.has_parsed_data ? " • ✅ Parsed" : " • ⏳ Processing"}
//                       </p>
//                     </div>
//                   </div>
//                 )}

//                 {!cvInfo && !cvLoading && !cvError && (
//                   <div className="text-center py-3">
//                     <p className="text-sm text-gray-500">No CV loaded</p>
//                     <Button
//                       size="sm"
//                       variant="outline"
//                       className="mt-2"
//                       onClick={loadLatestCv}
//                     >
//                       Load Latest CV
//                     </Button>
//                   </div>
//                 )}
//               </div>

//               {/* Form Fields */}
//               <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
//                 <div>
//                   <label className="block text-sm font-medium mb-2">Job Role *</label>
//                   <Input
//                     type="text"
//                     placeholder="e.g., Software Engineer"
//                     value={role}
//                     onChange={(e) => setRole(e.target.value)}
//                     className="w-full"
//                   />
//                 </div>

//                 <div>
//                   <label className="block text-sm font-medium mb-2">Country *</label>
//                   <select
//                     value={country}
//                     onChange={(e) => setCountry(e.target.value)}
//                     className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
//                   >
//                     <option value="">Select Country</option>
//                     {COUNTRIES.map((c) => (
//                       <option key={c} value={c}>
//                         {c}
//                       </option>
//                     ))}
//                   </select>
//                 </div>

//                 <div>
//                   <label className="block text-sm font-medium mb-2">
//                     Max Jobs (1-50)
//                   </label>
//                   <Input
//                     type="number"
//                     min="1"
//                     max="50"
//                     value={maxJobs}
//                     onChange={(e) => setMaxJobs(e.target.value)}
//                     className="w-full"
//                   />
//                 </div>

//                 <div>
//                   <label className="block text-sm font-medium mb-2">
//                     Min Match Score (10-100%)
//                   </label>
//                   <select
//   value={minMatch}
//   onChange={(e) => setMinMatch(e.target.value)}
//   className="w-full border rounded-lg px-3 py-2 text-sm"
// >
//   <option value="">Select match %</option>
//   {MATCH_PERCENTAGES.map((p) => (
//     <option key={p} value={p}>
//       {p}%
//     </option>
//   ))}
// </select>

//                 </div>
//               </div>

//               {error && (
//                 <div className="bg-red-50 border border-red-200 rounded-lg p-4">
//                   <div className="flex items-start gap-2">
//                     <AlertCircle className="h-5 w-5 text-red-600 mt-0.5 flex-shrink-0" />
//                     <div className="flex-1">
//                       <p className="text-sm text-red-800 font-medium">Error</p>
//                       <p className="text-sm text-red-700 mt-1">{error}</p>
//                     </div>
//                   </div>
//                 </div>
//               )}

//               <div className="flex gap-3 pt-4">
//                 <Button
//                   onClick={fetchJobs}
//                   disabled={!role || !country || !cvInfo || cvError !== "" || loadingJobs}
//                   className="bg-blue-600 hover:bg-blue-700 flex-1"
//                 >
//                   {loadingJobs ? (
//                     <>
//                       <Loader2 className="mr-2 h-4 w-4 animate-spin" />
//                       Searching Jobs...
//                     </>
//                   ) : (
//                     <>
//                       <Search className="mr-2 h-4 w-4" />
//                       Find Jobs
//                     </>
//                   )}
//                 </Button>
//               </div>
//             </div>
//           )}

//           {/* STAGE 2: JOB SELECTION - Same as before */}
//           {stage === "jobs" && (
//             <div className="flex flex-col h-full">
//               <div className="flex items-center justify-between mb-4 p-4 bg-gray-50 rounded-lg">
//                 <div className="flex items-center gap-4">
//                   <span className="text-sm font-medium">
//                     {selectedJobIds.size} of {jobs.length} jobs selected
//                   </span>
//                   <div className="flex gap-2">
//                     <Button
//                       size="sm"
//                       variant="outline"
//                       onClick={selectAllJobs}
//                       className="text-xs"
//                     >
//                       Select All
//                     </Button>
//                     <Button
//                       size="sm"
//                       variant="outline"
//                       onClick={deselectAllJobs}
//                       className="text-xs"
//                     >
//                       Deselect All
//                     </Button>
//                   </div>
//                 </div>
//                 <div className="flex gap-2">
//                   <Button
//                     size="sm"
//                     variant="outline"
//                     onClick={() => setStage("form")}
//                   >
//                     Back
//                   </Button>
//                   <Button
//                     onClick={startAutomation}
//                     disabled={selectedJobIds.size === 0}
//                     className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
//                   >
//                     Apply to {selectedJobIds.size} Jobs
//                   </Button>
//                 </div>
//               </div>

//               <div className="flex-1 overflow-y-auto space-y-3">
//                 {jobs.map((job) => (
//                   <div
//                     key={job.id}
//                     className={`border rounded-lg p-4 cursor-pointer transition-all ${
//                       selectedJobIds.has(job.id)
//                         ? "border-purple-300 bg-purple-50"
//                         : "border-gray-200 hover:border-gray-300"
//                     }`}
//                     onClick={() => toggleJobSelection(job.id)}
//                   >
//                     <div className="flex items-start gap-3">
//                       <Checkbox
//                         checked={selectedJobIds.has(job.id)}
//                         onChange={() => toggleJobSelection(job.id)}
//                         className="mt-1"
//                       />
//                       <div className="flex-1 min-w-0">
//                         <div className="flex items-start justify-between gap-2">
//                           <div className="flex-1 min-w-0">
//                             <h3 className="font-medium text-gray-900 truncate">
//                               {job.title}
//                             </h3>
//                             <div className="flex items-center gap-3 text-sm text-gray-600 mt-1">
//                               <div className="flex items-center gap-1">
//                                 <Briefcase className="h-3 w-3" />
//                                 <span className="truncate">{job.company}</span>
//                               </div>
//                               {job.location && (
//                                 <div className="flex items-center gap-1">
//                                   <MapPin className="h-3 w-3" />
//                                   <span className="truncate">{job.location}</span>
//                                 </div>
//                               )}
//                             </div>
//                             {job.snippet && (
//                               <p className="text-xs text-gray-500 mt-2 line-clamp-2">
//                                 {job.snippet}
//                               </p>
//                             )}
//                           </div>
//                           <div className="flex items-center gap-2 flex-shrink-0">
//                             <div className="flex items-center gap-1 text-xs text-gray-600">
//                               <TrendingUp className="h-3 w-3" />
//                               <span>{job.score}%</span>
//                             </div>
//                             <a
//                               href={job.url}
//                               target="_blank"
//                               rel="noopener noreferrer"
//                               className="text-blue-600 hover:text-blue-800"
//                               onClick={(e) => e.stopPropagation()}
//                             >
//                               <ExternalLink className="h-4 w-4" />
//                             </a>
//                           </div>
//                         </div>
//                       </div>
//                     </div>
//                   </div>
//                 ))}
//               </div>
//             </div>
//           )}

//           {/* STAGE 3: AUTOMATION PROGRESS WITH MODERN SUCCESS UI */}
//           {stage === "automation" && (
//             <div className="flex flex-col h-full">
//               {/* Enhanced failure handling */}
//               {isFailed && (
//                 <div className="bg-red-50 border-2 border-red-200 rounded-xl p-6 mb-4">
//                   <div className="flex items-center gap-3 mb-4">
//                     <div className="w-12 h-12 bg-red-500 rounded-full flex items-center justify-center">
//                       <AlertCircle className="h-6 w-6 text-white" />
//                     </div>
//                     <div>
//                       <h3 className="text-xl font-bold text-red-900">Automation Failed</h3>
//                       <p className="text-sm text-red-700">
//                         The automation encountered an error and could not complete
//                       </p>
//                     </div>
//                   </div>

//                   {error && (
//                     <div className="mt-4 p-3 bg-red-100 border border-red-200 rounded-lg">
//                       <p className="text-sm text-red-800">{error}</p>
//                     </div>
//                   )}

//                   <div className="mt-4 flex gap-2">
//                     <Button
//                       onClick={() => {
//                         setStage("form");
//                         setIsFailed(false);
//                         setError("");
//                       }}
//                       variant="outline"
//                       size="sm"
//                     >
//                       Try Again
//                     </Button>
//                     <Button
//                       onClick={() => setOpen(false)}
//                       size="sm"
//                     >
//                       Close
//                     </Button>
//                   </div>
//                 </div>
//               )}

//               {/* Background Processing Notice */}
//               {isRunning && !isCompleted && !isFailed && (
//                 <div className="bg-gradient-to-r from-blue-50 to-purple-50 border-2 border-purple-200 rounded-xl p-4 mb-4">
//                   <div className="flex items-start gap-3">
//                     <div className="w-10 h-10 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full flex items-center justify-center animate-pulse">
//                       <Zap className="h-5 w-5 text-white" />
//                     </div>
//                     <div className="flex-1">
//                       <h4 className="font-semibold text-gray-900 mb-1">
//                         🚀 Automation Running in Background
//                       </h4>
//                       <p className="text-sm text-gray-700 mb-3">
//                         You can safely close this modal. The automation will continue processing, and you'll
//                         receive a notification when it's complete. Failed applications will be automatically
//                         refunded.
//                       </p>
//                       <div className="flex items-center gap-2 text-xs text-purple-700">
//                         <CheckCircle2 className="h-4 w-4" />
//                         <span>Check your dashboard for real-time progress updates</span>
//                       </div>
//                     </div>
//                   </div>
//                 </div>
//               )}

//               {/* ✅ MODERN SUCCESS UI - Same as before */}
//               {isCompleted && completionStats && (
//                 <div className="relative overflow-hidden bg-gradient-to-br from-purple-500/10 via-pink-500/10 to-blue-500/10 border-2 border-purple-200 rounded-2xl p-8 mb-4">
//                   {/* Decorative Background Elements */}
//                   <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-purple-400/20 to-pink-400/20 rounded-full blur-3xl"></div>
//                   <div className="absolute -bottom-4 -left-4 w-24 h-24 bg-gradient-to-br from-blue-400/20 to-purple-400/20 rounded-full blur-2xl"></div>

//                   <div className="relative z-10">
//                     {/* Header Section */}
//                     <div className="flex items-center gap-4 mb-6">
//                       <div className="w-16 h-16 bg-gradient-to-r from-purple-600 to-pink-600 rounded-2xl flex items-center justify-center shadow-lg">
//                         {completionStats.failed === 0 ? (
//                           <Trophy className="h-8 w-8 text-white" />
//                         ) : (
//                           <Star className="h-8 w-8 text-white" />
//                         )}
//                       </div>
//                       <div>
//                         <h3 className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
//                           {completionStats.failed === 0 ? "🎉 Perfect Automation!" : "✅ Automation Complete!"}
//                         </h3>
//                         <p className="text-gray-600 font-medium">
//                           {completionStats.failed === 0
//                             ? `Successfully applied to all ${completionStats.successful} jobs!`
//                             : `Applied to ${completionStats.successful} jobs • ${completionStats.failed} failed (refunded)`
//                           }
//                         </p>
//                       </div>
//                     </div>

//                     {/* Stats Grid */}
//                     <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
//                       <div className="bg-white/70 backdrop-blur-sm border border-purple-200/50 rounded-xl p-4 text-center group hover:scale-105 transition-transform duration-200">
//                         <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-500 rounded-lg flex items-center justify-center mx-auto mb-3 group-hover:rotate-12 transition-transform">
//                           <Target className="h-5 w-5 text-white" />
//                         </div>
//                         <div className="text-2xl font-bold text-gray-900">{completionStats.total_applied}</div>
//                         <div className="text-xs font-medium text-gray-600">Total Jobs</div>
//                       </div>

//                       <div className="bg-white/70 backdrop-blur-sm border border-green-200/50 rounded-xl p-4 text-center group hover:scale-105 transition-transform duration-200">
//                         <div className="w-10 h-10 bg-gradient-to-r from-green-500 to-emerald-500 rounded-lg flex items-center justify-center mx-auto mb-3 group-hover:rotate-12 transition-transform">
//                           <CheckCircle2 className="h-5 w-5 text-white" />
//                         </div>
//                         <div className="text-2xl font-bold text-green-600">{completionStats.successful}</div>
//                         <div className="text-xs font-medium text-gray-600">Successful</div>
//                       </div>

//                       <div className="bg-white/70 backdrop-blur-sm border border-red-200/50 rounded-xl p-4 text-center group hover:scale-105 transition-transform duration-200">
//                         <div className="w-10 h-10 bg-gradient-to-r from-red-500 to-pink-500 rounded-lg flex items-center justify-center mx-auto mb-3 group-hover:rotate-12 transition-transform">
//                           <AlertCircle className="h-5 w-5 text-white" />
//                         </div>
//                         <div className="text-2xl font-bold text-red-600">{completionStats.failed}</div>
//                         <div className="text-xs font-medium text-gray-600">Failed</div>
//                       </div>

//                       <div className="bg-white/70 backdrop-blur-sm border border-purple-200/50 rounded-xl p-4 text-center group hover:scale-105 transition-transform duration-200">
//                         <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg flex items-center justify-center mx-auto mb-3 group-hover:rotate-12 transition-transform">
//                           <Award className="h-5 w-5 text-white" />
//                         </div>
//                         <div className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
//                           {completionStats.success_rate}%
//                         </div>
//                         <div className="text-xs font-medium text-gray-600">Success Rate</div>
//                       </div>
//                     </div>

//                     {/* Duration & Actions */}
//                     <div className="flex items-center justify-between">
//                       <div className="flex items-center gap-2 text-sm font-medium text-gray-700">
//                         <Clock className="h-4 w-4" />
//                         <span>Completed in {Math.floor(completionStats.duration / 60)}m {completionStats.duration % 60}s</span>
//                       </div>

//                       <Button
//                         onClick={() => window.location.href = "/my-applications"}
//                         className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white"
//                       >
//                         View Applications
//                       </Button>
//                     </div>

//                     {/* Credit Refund Notice */}
//                     {completionStats.failed > 0 && (
//                       <div className="mt-4 p-4 bg-gradient-to-r from-blue-50 to-purple-50 border border-blue-200 rounded-xl">
//                         <div className="flex items-start gap-3">
//                           <Info className="h-5 w-5 text-blue-600 mt-0.5 flex-shrink-0" />
//                           <div>
//                             <p className="text-sm font-medium text-blue-900">💳 Credits Automatically Refunded</p>
//                             <p className="text-xs text-blue-800 mt-1">
//                               You've been refunded credits for the {completionStats.failed} failed application{completionStats.failed > 1 ? 's' : ''}.
//                               Check your transaction history for details.
//                             </p>
//                           </div>
//                         </div>
//                       </div>
//                     )}
//                   </div>
//                 </div>
//               )}

//               {error && !isFailed && (
//                 <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
//                   <div className="flex items-start gap-2">
//                     <AlertCircle className="h-5 w-5 text-red-600 mt-0.5 flex-shrink-0" />
//                     <p className="text-sm text-red-800">{error}</p>
//                   </div>
//                 </div>
//               )}

//               {message && (
//                 <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-4">
//                   <div className="flex items-start gap-2">
//                     <CheckCircle2 className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
//                     <p className="text-sm text-green-800">{message}</p>
//                   </div>
//                 </div>
//               )}

//               {/* Live Logs */}
//               <div className="flex-1 overflow-hidden flex flex-col">
//                 <h3 className="font-medium mb-2 flex items-center gap-2">
//                   <span>Live Automation Logs</span>
//                   {isRunning && !isFailed && (
//                     <div className="flex items-center gap-1 text-xs text-green-600">
//                       <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
//                       Running
//                     </div>
//                   )}
//                   {isFailed && (
//                     <div className="flex items-center gap-1 text-xs text-red-600">
//                       <div className="w-2 h-2 bg-red-500 rounded-full"></div>
//                       Failed
//                     </div>
//                   )}
//                 </h3>
//                 <div
//                   ref={logBoxRef}
//                   className="flex-1 bg-gray-900 text-green-400 p-4 rounded-lg font-mono text-xs overflow-y-auto"
//                 >
//                   {logs.length === 0 ? (
//                     <p className="text-gray-500">Logs will appear here...</p>
//                   ) : (
//                     logs.map((log, i) => (
//                       <div key={i} className="mb-1 whitespace-pre-wrap">
//                         {log}
//                       </div>
//                     ))
//                   )}
//                 </div>
//               </div>

//               {/* Proof Gallery */}
//               {proofs.length > 0 && (
//                 <div className="mt-4">
//                   <h4 className="font-medium mb-2">Application Proofs ({proofs.length})</h4>
//                   <div className="grid grid-cols-2 md:grid-cols-4 gap-2 max-h-32 overflow-y-auto">
//                     {proofs.map((proof, i) => (
//                       <a
//                         key={i}
//                         href={proof}
//                         target="_blank"
//                         rel="noopener noreferrer"
//                         className="block"
//                       >
//                         <img
//                           src={proof}
//                           alt={`Application proof ${i + 1}`}
//                           className="w-full h-20 object-cover rounded border hover:border-purple-400 transition-colors"
//                         />
//                       </a>
//                     ))}
//                   </div>
//                 </div>
//               )}
//             </div>
//           )}
//         </div>
//       </DialogContent>
//     </Dialog>
//   );
// }
// // src/components/AutomateModal-fixed.tsx - ENHANCED VERSION
// "use client";

// import { useEffect, useRef, useState } from "react";
// import {
//   Loader2, Search, Sparkles, X, CheckCircle2, AlertCircle,
//   Briefcase, MapPin, TrendingUp, ExternalLink, Check, PartyPopper,
//   Clock, Target, Award, Info, Upload
// } from "lucide-react";
// import { Button } from "@/components/ui/button";
// import { Input } from "@/components/ui/input";
// import { Checkbox } from "@/components/ui/checkbox";
// import {
//   Dialog,
//   DialogTrigger,
//   DialogContent,
//   DialogTitle,
//   DialogDescription,
// } from "@/components/ui/dialog";
// import { toast } from "sonner";
// import api from "@/lib/api";

// const COUNTRIES = [
//   "Argentina", "Australia", "Austria", "Bangladesh", "Belgium", "Brazil", "Canada",
//   "Chile", "China", "Colombia", "Czech Republic", "Denmark", "Egypt", "Finland",
//   "France", "Germany", "Greece", "Hong Kong", "Hungary", "India", "Indonesia",
//   "Ireland", "Israel", "Italy", "Japan", "Kenya", "Kuwait", "Malaysia", "Mexico",
//   "Morocco", "Netherlands", "New Zealand", "Nigeria", "Norway", "Pakistan",
//   "Philippines", "Poland", "Portugal", "Qatar", "Romania", "Russia", "Saudi Arabia",
//   "Serbia", "Singapore", "Slovakia", "South Africa", "Spain", "Sri Lanka", "Sweden",
//   "Switzerland", "Taiwan", "Thailand", "Turkey", "Ukraine", "United Arab Emirates",
//   "United Kingdom", "United States", "Uruguay", "Vietnam", "Zimbabwe", "Remote",
// ];

// type SSEMessage =
//   | { type: "info"; msg: string; ts: string }
//   | { type: "proof"; msg: string; url: string; ts: string }
//   | { type: "done"; msg: string; ts: string }
//   | { type: "completion"; msg: string; run_id: string; total_applied: number; successful: number; failed: number; success_rate: number; duration: number; ts: string }
//   | { type: "warning"; msg: string; refund_pending?: boolean; refund_issued?: boolean; ts: string }
//   | { type: "error"; msg: string; ts: string };

// interface Job {
//   id: string;
//   title: string;
//   company: string;
//   location?: string;
//   url: string;
//   snippet?: string;
//   score: number;
//   source?: string;
// }

// interface AutomationStats {
//   total_applied: number;
//   successful: number;
//   failed: number;
//   success_rate: number;
//   duration: number;
// }

// interface CVInfo {
//   id: string;
//   file_name: string;
//   has_parsed_data: boolean;
//   needs_parsing: boolean;
//   validation_status: string;
// }

// interface AutomateModalProps {
//   cvId?: string; // Make optional since we'll get from localStorage
//   token: string;
//   onAutomationDone?: (finalLogs: string[], stats?: AutomationStats) => void;
// }

// export default function AutomateModal({
//   cvId: propCvId,
//   token,
//   onAutomationDone,
// }: AutomateModalProps) {
//   // Modal state
//   const [open, setOpen] = useState(false);

//   // ✅ ENHANCED: CV state management with localStorage
//   const [currentCvId, setCurrentCvId] = useState<string>("");
//   const [cvInfo, setCvInfo] = useState<CVInfo | null>(null);
//   const [cvLoading, setCvLoading] = useState(false);
//   const [cvError, setCvError] = useState("");

//   // Form inputs
//   const [role, setRole] = useState("");
//   const [country, setCountry] = useState("");
//   const [maxJobs, setMaxJobs] = useState("5");
//   const [minMatch, setMinMatch] = useState("10");

//   // Workflow stages
//   const [stage, setStage] = useState<"form" | "jobs" | "automation">("form");

//   // Jobs state
//   const [jobs, setJobs] = useState<Job[]>([]);
//   const [selectedJobIds, setSelectedJobIds] = useState<Set<string>>(new Set());
//   const [loadingJobs, setLoadingJobs] = useState(false);

//   // Automation state
//   const [logs, setLogs] = useState<string[]>([]);
//   const [proofs, setProofs] = useState<string[]>([]);
//   const [loading, setLoading] = useState(false);
//   const [isRunning, setIsRunning] = useState(false);
//   const [isCompleted, setIsCompleted] = useState(false);
//   const [isFailed, setIsFailed] = useState(false);
//   const [completionStats, setCompletionStats] = useState<AutomationStats | null>(null);
//   const [message, setMessage] = useState("");
//   const [error, setError] = useState("");
//   const [runId, setRunId] = useState<string>("");
//   const [actorRunId, setActorRunId] = useState<string>("");

//   const logBoxRef = useRef<HTMLDivElement | null>(null);
//   const eventSourceRef = useRef<EventSource | null>(null);

//   const API_BASE =
//     import.meta.env.VITE_API_URL?.replace(/\/+$/, "") || "http://127.0.0.1:8000";

//   // ✅ ENHANCED: Initialize CV from localStorage or props
//   useEffect(() => {
//     const initializeCv = () => {
//       // Priority: 1. Props 2. localStorage
//       const storedCvId = localStorage.getItem("current_cv_id");
//       const targetCvId = propCvId || storedCvId;

//       console.log("🔍 CV Initialization:");
//       console.log("  Props CV ID:", propCvId);
//       console.log("  Stored CV ID:", storedCvId);
//       console.log("  Target CV ID:", targetCvId);

//       if (targetCvId && targetCvId !== "undefined" && targetCvId !== "null") {
//         setCurrentCvId(targetCvId);
//         loadCvInfo(targetCvId);
//       } else {
//         // Try to get latest CV
//         loadLatestCv();
//       }
//     };

//     if (open) {
//       initializeCv();
//     }
//   }, [open, propCvId]);

//   // ✅ NEW: Load CV information
//   const loadCvInfo = async (cvId: string) => {
//     if (!cvId || cvId === "undefined" || cvId === "null") {
//       setCvError("No CV ID provided");
//       return;
//     }

//     setCvLoading(true);
//     setCvError("");

//     try {
//       console.log("📋 Loading CV info for:", cvId);

//       const response = await api.get(`/v1/cvs/${cvId}`);

//       if (response.data?.ok && response.data?.id) {
//         const cvData: CVInfo = {
//           id: response.data.id,
//           file_name: response.data.file_name || "Unknown CV",
//           has_parsed_data: response.data.has_parsed_data || false,
//           needs_parsing: response.data.needs_parsing || false,
//           validation_status: response.data.validation_status || "unknown"
//         };

//         setCvInfo(cvData);
//         setCurrentCvId(cvId);

//         // ✅ ENHANCED: Store in localStorage for future use
//         localStorage.setItem("current_cv_id", cvId);

//         console.log("✅ CV loaded successfully:", cvData);

//         if (cvData.needs_parsing) {
//           setCvError("⚠️ CV is being processed. Please wait a moment and try again.");
//         }
//       } else {
//         throw new Error("Invalid CV response");
//       }
//     } catch (err: any) {
//       console.error("❌ CV loading failed:", err);
//       const errorMsg = err?.response?.data?.detail || err.message || "Failed to load CV";
//       setCvError(errorMsg);
//       setCvInfo(null);

//       // Clear invalid CV from localStorage
//       if (localStorage.getItem("current_cv_id") === cvId) {
//         localStorage.removeItem("current_cv_id");
//       }
//     } finally {
//       setCvLoading(false);
//     }
//   };

//   // ✅ NEW: Load latest CV when no specific CV is available
//   const loadLatestCv = async () => {
//     setCvLoading(true);
//     setCvError("");

//     try {
//       console.log("🔍 Loading latest CV...");

//       const response = await api.get("/v1/cvs/latest");

//       if (response.data?.ok && response.data?.id) {
//         const cvData: CVInfo = {
//           id: response.data.id,
//           file_name: response.data.file_name || "Latest CV",
//           has_parsed_data: response.data.has_parsed_data || false,
//           needs_parsing: response.data.needs_parsing || false,
//           validation_status: response.data.validation_status || "valid"
//         };

//         setCvInfo(cvData);
//         setCurrentCvId(cvData.id);
//         localStorage.setItem("current_cv_id", cvData.id);

//         console.log("✅ Latest CV loaded:", cvData);

//         if (cvData.needs_parsing) {
//           setCvError("⚠️ CV is being processed. Please wait and try again.");
//         }
//       } else {
//         throw new Error("No CV found");
//       }
//     } catch (err: any) {
//       console.error("❌ Latest CV loading failed:", err);
//       setCvError("❌ No CV found. Please upload a CV first!");
//       setCvInfo(null);
//     } finally {
//       setCvLoading(false);
//     }
//   };

//   // ✅ NEW: Refresh CV info
//   const refreshCvInfo = () => {
//     if (currentCvId) {
//       loadCvInfo(currentCvId);
//     } else {
//       loadLatestCv();
//     }
//   };

//   // Helper to add timestamped log
//   const addLog = (message: string) => {
//     const timestamp = new Date().toLocaleTimeString();
//     setLogs((prev) => [...prev, `[${timestamp}] ${message}`]);
//   };

//   // Auto-scroll logs
//   useEffect(() => {
//     if (!logBoxRef.current) return;
//     logBoxRef.current.scrollTop = logBoxRef.current.scrollHeight;
//   }, [logs]);

//   // ✅ ENHANCED: SSE Connection with better error handling
//   useEffect(() => {
//     if (!isRunning) {
//       if (eventSourceRef.current) {
//         eventSourceRef.current.close();
//         eventSourceRef.current = null;
//       }
//       return;
//     }

//     addLog("📡 Connecting to automation stream...");

//     const sseUrl = new URL(`${API_BASE}/v1/sse/stream`);
//     const token = localStorage.getItem("access_token");
//     if (token) {
//       sseUrl.searchParams.set("access_token", token);
//     }

//     const getCurrentUser = async () => {
//       try {
//         const response = await api.get("/v1/auth/me");
//         return response.data?.user?.id;
//       } catch {
//         return null;
//       }
//     };

//     getCurrentUser().then(userId => {
//       if (userId) {
//         sseUrl.searchParams.set("user_id", userId);
//       }

//       const evt = new EventSource(sseUrl.toString());
//       eventSourceRef.current = evt;

//       evt.onopen = () => {
//         addLog("✅ Connected to live automation feed");
//       };

//       evt.onmessage = (event) => {
//         try {
//           const data: SSEMessage = JSON.parse(event.data);

//           console.log("📨 Received SSE event:", data.type, data);

//           if (data.type === "proof" && data.url) {
//             setProofs((p) => [...p, data.url]);
//             addLog(`📸 ${data.msg}`);
//           }
//           else if (data.type === "completion") {
//             const stats: AutomationStats = {
//               total_applied: data.total_applied,
//               successful: data.successful,
//               failed: data.failed,
//               success_rate: data.success_rate,
//               duration: data.duration
//             };

//             console.log("🎯 Completion stats received:", stats);

//             setCompletionStats(stats);
//             setIsCompleted(true);
//             setIsRunning(false);

//             addLog(`\n${"=".repeat(60)}`);
//             addLog(`🎉 AUTOMATION COMPLETED!`);
//             addLog(`${"=".repeat(60)}`);
//             addLog(`📊 Results Summary:`);
//             addLog(`   ✅ Successfully Applied: ${stats.successful} jobs`);
//             addLog(`   ❌ Failed Applications: ${stats.failed} jobs`);
//             addLog(`   📈 Success Rate: ${stats.success_rate}%`);
//             addLog(`   ⏱️  Total Duration: ${Math.floor(stats.duration / 60)}m ${stats.duration % 60}s`);

//             if (stats.failed > 0) {
//               addLog(`   💳 Credits will be refunded for ${stats.failed} failed applications`);
//             }

//             addLog(`${"=".repeat(60)}\n`);
//             addLog(`💡 Tip: Check your dashboard for detailed application history`);

//             setMessage("✅ Automation completed successfully!");

//             if (onAutomationDone) {
//               onAutomationDone([...logs], stats);
//             }

//             localStorage.setItem("last_automation_stats", JSON.stringify(stats));
//             localStorage.setItem("automation_logs", JSON.stringify(logs));

//             if (stats.failed === 0) {
//               toast.success(`🎉 Perfect! Applied to all ${stats.successful} jobs!`, {
//                 description: `Success rate: 100% | Duration: ${Math.floor(stats.duration / 60)}m ${stats.duration % 60}s`,
//                 duration: 5000,
//               });
//             } else if (stats.success_rate >= 70) {
//               toast.success(`🎉 Applied to ${stats.successful} jobs!`, {
//                 description: `${stats.failed} failed (credits refunded). Success rate: ${stats.success_rate}%`,
//                 duration: 5000,
//               });
//             } else {
//               toast.warning(`⚠️ Applied to ${stats.successful} of ${stats.total_applied} jobs`, {
//                 description: `${stats.failed} failed. Credits refunded. Success rate: ${stats.success_rate}%`,
//                 duration: 6000,
//               });
//             }

//             setTimeout(() => {
//               window.dispatchEvent(new Event('automation-completed'));
//             }, 1000);
//           }
//           else if (data.type === "warning") {
//             addLog(`⚠️ ${data.msg}`);

//             if (data.refund_pending || data.refund_issued) {
//               toast.info("💳 Credits will be refunded for failed applications");
//             }
//           }
//           else if (data.type === "done") {
//             addLog(`✅ ${data.msg}`);
//             setIsCompleted(true);
//             setIsRunning(false);
//             toast.success("🎉 Automation finished!");
//           }
//           else if (data.type === "error") {
//             addLog(`❌ ${data.msg}`);
//             setIsRunning(false);
//             setIsFailed(true);
//             setError(data.msg);
//             toast.error(`❌ Automation failed: ${data.msg}`);
//           }
//           else if (data.msg) {
//             addLog(data.msg);
//           }
//         } catch (e) {
//           console.error("Failed to parse SSE message:", e);
//           addLog("⚠️ Error parsing server message");
//         }
//       };

//       evt.onerror = (error) => {
//         console.error("❌ SSE Connection error:", error);
//         addLog("⚠️ Connection to stream closed");

//         if (isRunning && !isCompleted && !isFailed) {
//           addLog("❌ Connection lost during automation");
//           addLog("🔄 Trying to reconnect...");

//           setTimeout(() => {
//             if (isRunning && !isCompleted) {
//               addLog("♻️ Attempting reconnection...");
//             }
//           }, 3000);
//         }
//       };
//     });

//     return () => {
//       console.log("🔌 Cleaning up SSE connection");
//       if (eventSourceRef.current) {
//         eventSourceRef.current.close();
//         eventSourceRef.current = null;
//       }
//     };
//   }, [isRunning, API_BASE, isCompleted, isFailed, logs, onAutomationDone]);

//   // Reset state when modal closes
//   useEffect(() => {
//     if (!open) {
//       setStage("form");
//       setJobs([]);
//       setSelectedJobIds(new Set());
//       setLogs([]);
//       setProofs([]);
//       setError("");
//       setMessage("");
//       setRunId("");
//       setActorRunId("");
//       setIsRunning(false);
//       setIsCompleted(false);
//       setIsFailed(false);
//       setCompletionStats(null);
//       setCvError("");
//     }
//   }, [open]);

//   // ✅ ENHANCED: Job fetching with proper CV validation
//   const fetchJobs = async () => {
//     setLoadingJobs(true);
//     setError("");
//     setMessage("");

//     // ✅ ENHANCED: CV validation with specific error messages
//     if (!currentCvId || currentCvId === "undefined" || currentCvId === "null") {
//       setError("❌ No CV selected. Please upload a CV first!");
//       setLoadingJobs(false);
//       return;
//     }

//     if (!cvInfo) {
//       setError("❌ CV information not loaded. Click 'Refresh CV' to try again.");
//       setLoadingJobs(false);
//       return;
//     }

//     if (cvInfo.needs_parsing) {
//       setError("❌ CV is still being processed. Please wait a moment and try again.");
//       setLoadingJobs(false);
//       return;
//     }

//     // Validate form inputs
//     if (!role || !country) {
//       setError("❌ Please fill in both role and country fields.");
//       setLoadingJobs(false);
//       return;
//     }

//     try {
//       console.log("🔍 Fetching jobs with params:", {
//         cv_id: currentCvId,
//         role,
//         country,
//         minMatch,
//         maxJobs
//       });

//       const res = await api.post("/v1/jobs/fetch-and-score", {
//         cv_id: currentCvId,
//         role,
//         country,
//         min_match_score: Number(minMatch),
//         max_jobs: Number(maxJobs),
//       });

//       if (res.data?.jobs) {
//         setJobs(res.data.jobs);
//         const allJobIds = new Set(res.data.jobs.map((j: Job) => j.id));
//         setSelectedJobIds(allJobIds);
//         setStage("jobs");

//         console.log(`✅ Found ${res.data.jobs.length} jobs`);
//         toast.success(`Found ${res.data.jobs.length} matching jobs!`);
//       } else {
//         setError("❌ No jobs found matching your criteria. Try adjusting your search parameters.");
//       }
//     } catch (err: any) {
//       console.error("❌ Job fetch error:", err);
//       const errorMsg = err?.response?.data?.detail || err.message || "Failed to fetch jobs";
//       setError(`❌ ${errorMsg}`);

//       if (err?.response?.status === 404) {
//         setError("❌ CV not found. Please refresh or upload a new CV.");
//       } else if (err?.response?.status === 402) {
//         setError("❌ Insufficient credits. Please purchase more credits.");
//       }
//     } finally {
//       setLoadingJobs(false);
//     }
//   };

//   // ✅ ENHANCED: Automation start with better validation
//   const startAutomation = async () => {
//     if (selectedJobIds.size === 0) {
//       toast.error("Please select at least one job to apply.");
//       return;
//     }

//     if (selectedJobIds.size > 50) {
//       toast.error("Maximum 50 jobs allowed per automation run. Please deselect some jobs.");
//       return;
//     }

//     // Final CV validation
//     if (!currentCvId || !cvInfo) {
//       toast.error("❌ No valid CV found. Please upload a CV first.");
//       return;
//     }

//     setLoading(true);
//     setError("");
//     setMessage("");
//     setLogs([]);
//     setProofs([]);
//     setRunId("");
//     setActorRunId("");
//     setIsRunning(true);
//     setIsCompleted(false);
//     setIsFailed(false);
//     setCompletionStats(null);
//     setStage("automation");

//     try {
//       const selectedJobs = jobs.filter((j) => selectedJobIds.has(j.id));

//       addLog("🚀 Starting job automation...");
//       addLog(`📋 Using CV: ${cvInfo.file_name} (ID: ${currentCvId})`);
//       addLog(`🎯 Applying to ${selectedJobs.length} selected jobs`);
//       addLog(`📊 Average match score: ${(selectedJobs.reduce((acc, j) => acc + j.score, 0) / selectedJobs.length).toFixed(1)}%`);
//       addLog("💳 Checking credits...");

//       addLog("🔄 Initiating automation request...");
//       const triggerRes = await api.post("/v1/automate-job-apply", {
//         cv_id: currentCvId,
//         role,
//         country,
//         min_match_score: Number(minMatch),
//         max_jobs: selectedJobs.length,
//         selected_jobs: selectedJobs,
//       });

//       if (triggerRes.data?.ok) {
//         setRunId(triggerRes.data.run_id || "");
//         setActorRunId(triggerRes.data.actor_run_id || "");

//         addLog("✅ Automation started successfully!");
//         addLog(`📝 Run ID: ${triggerRes.data.run_id}`);

//         if (triggerRes.data.actor_run_id) {
//           addLog(`🤖 Actor ID: ${triggerRes.data.actor_run_id}`);
//         }

//         if (triggerRes.data.credits_used) {
//           addLog(`💳 Credits used: ${triggerRes.data.credits_used}`);
//         }

//         addLog(`📋 Processing ${selectedJobs.length} selected jobs`);
//         addLog("🔍 AI is now discovering companies and sending applications...");
//         addLog("\n" + "=".repeat(60));
//         addLog("ℹ️  IMPORTANT: You can close this modal safely!");
//         addLog("   • Automation continues running in the background");
//         addLog("   • You'll receive a notification when complete");
//         addLog("   • Failed applications will be refunded automatically");
//         addLog("   • Check dashboard for real-time progress");
//         addLog("=".repeat(60) + "\n");

//         setMessage("✅ Automation running in background. You can close this modal safely.");

//         toast.success("🚀 Automation started successfully!", {
//           description: "Running in background. You'll be notified when complete.",
//           duration: 4000,
//         });
//       } else {
//         throw new Error(triggerRes.data?.message || "Failed to start automation");
//       }
//     } catch (err: any) {
//       console.error("❌ Automation start error:", err);
//       const errorMsg = err?.response?.data?.detail || err.message || "Unexpected error";

//       setError(errorMsg);
//       setIsRunning(false);
//       setIsFailed(true);

//       addLog(`❌ Error: ${errorMsg}`);

//       if (err?.response?.status === 402) {
//         addLog("💳 Insufficient credits. Please purchase more credits.");
//         toast.error("❌ Insufficient credits");
//       } else if (err?.response?.status === 404) {
//         addLog("📄 CV not found. Please upload a CV first.");
//         toast.error("❌ CV not found");
//       } else if (err?.response?.status === 500) {
//         addLog("🔧 Server configuration error. Please contact support.");
//         toast.error("❌ Server error - please try again later");
//       } else {
//         toast.error(`❌ Automation failed: ${errorMsg}`);
//       }
//     } finally {
//       setLoading(false);
//     }
//   };

//   // Job selection handlers
//   const toggleJobSelection = (jobId: string) => {
//     const newSelected = new Set(selectedJobIds);
//     if (newSelected.has(jobId)) {
//       newSelected.delete(jobId);
//     } else {
//       newSelected.add(jobId);
//     }
//     setSelectedJobIds(newSelected);
//   };

//   const selectAllJobs = () => {
//     const allJobIds = new Set(jobs.map((j) => j.id));
//     setSelectedJobIds(allJobIds);
//   };

//   const deselectAllJobs = () => {
//     setSelectedJobIds(new Set());
//   };

//   return (
//     <Dialog open={open} onOpenChange={setOpen}>
//       <DialogTrigger asChild>
//         <Button className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700">
//           <Sparkles className="mr-2 h-4 w-4" />
//           Start Automation
//         </Button>
//       </DialogTrigger>

//       <DialogContent className="max-w-6xl max-h-[90vh] overflow-hidden flex flex-col">
//         <div className="flex items-center gap-3 mb-4">
//           <div className="w-10 h-10 bg-gradient-to-r from-purple-600 to-pink-600 rounded-lg flex items-center justify-center">
//             <Sparkles className="h-5 w-5 text-white" />
//           </div>
//           <div>
//             <DialogTitle className="text-xl font-bold">
//               {stage === "form" && "Configure Job Automation"}
//               {stage === "jobs" && `Review Jobs (${selectedJobIds.size}/${jobs.length} selected)`}
//               {stage === "automation" && "Automation Progress"}
//             </DialogTitle>
//             <DialogDescription>
//               {stage === "form" && "Set your job preferences and requirements"}
//               {stage === "jobs" && "Select which jobs to apply for"}
//               {stage === "automation" && (
//                 isCompleted ? "Automation completed" :
//                 isFailed ? "Automation failed" :
//                 "Real-time automation progress"
//               )}
//             </DialogDescription>
//           </div>
//         </div>

//         <div className="flex-1 overflow-hidden flex flex-col">
//           {/* STAGE 1: ENHANCED FORM WITH CV DISPLAY */}
//           {stage === "form" && (
//             <div className="space-y-6">
//               {/* ✅ ENHANCED: CV Status Display */}
//               <div className="bg-gray-50 border rounded-lg p-4">
//                 <div className="flex items-center justify-between mb-3">
//                   <h3 className="text-sm font-medium text-gray-900">Current CV</h3>
//                   <Button
//                     size="sm"
//                     variant="outline"
//                     onClick={refreshCvInfo}
//                     disabled={cvLoading}
//                   >
//                     {cvLoading ? (
//                       <Loader2 className="h-4 w-4 animate-spin" />
//                     ) : (
//                       "Refresh CV"
//                     )}
//                   </Button>
//                 </div>

//                 {cvLoading && (
//                   <div className="flex items-center gap-2 text-sm text-gray-600">
//                     <Loader2 className="h-4 w-4 animate-spin" />
//                     <span>Loading CV information...</span>
//                   </div>
//                 )}

//                 {cvError && (
//                   <div className="flex items-start gap-2 p-3 bg-red-50 border border-red-200 rounded-lg">
//                     <AlertCircle className="h-4 w-4 text-red-600 mt-0.5 flex-shrink-0" />
//                     <div className="flex-1">
//                       <p className="text-sm text-red-800">{cvError}</p>
//                       <Button
//                         size="sm"
//                         variant="link"
//                         className="text-red-600 px-0 text-xs mt-1"
//                         onClick={() => window.location.href = "/dashboard"}
//                       >
//                         <Upload className="h-3 w-3 mr-1" />
//                         Upload New CV
//                       </Button>
//                     </div>
//                   </div>
//                 )}

//                 {cvInfo && !cvLoading && !cvError && (
//                   <div className="flex items-start gap-3 p-3 bg-green-50 border border-green-200 rounded-lg">
//                     <CheckCircle2 className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
//                     <div className="flex-1">
//                       <p className="text-sm font-medium text-green-900">{cvInfo.file_name}</p>
//                       <p className="text-xs text-green-700 mt-1">
//                         ID: {cvInfo.id.slice(0, 8)}... • Status: {cvInfo.validation_status}
//                         {cvInfo.has_parsed_data ? " • ✅ Parsed" : " • ⏳ Processing"}
//                       </p>
//                     </div>
//                   </div>
//                 )}

//                 {!cvInfo && !cvLoading && !cvError && (
//                   <div className="text-center py-3">
//                     <p className="text-sm text-gray-500">No CV loaded</p>
//                     <Button
//                       size="sm"
//                       variant="outline"
//                       className="mt-2"
//                       onClick={loadLatestCv}
//                     >
//                       Load Latest CV
//                     </Button>
//                   </div>
//                 )}
//               </div>

//               {/* Form Fields */}
//               <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
//                 <div>
//                   <label className="block text-sm font-medium mb-2">Job Role *</label>
//                   <Input
//                     type="text"
//                     placeholder="e.g., Software Engineer"
//                     value={role}
//                     onChange={(e) => setRole(e.target.value)}
//                     className="w-full"
//                   />
//                 </div>

//                 <div>
//                   <label className="block text-sm font-medium mb-2">Country *</label>
//                   <select
//                     value={country}
//                     onChange={(e) => setCountry(e.target.value)}
//                     className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
//                   >
//                     <option value="">Select Country</option>
//                     {COUNTRIES.map((c) => (
//                       <option key={c} value={c}>
//                         {c}
//                       </option>
//                     ))}
//                   </select>
//                 </div>

//                 <div>
//                   <label className="block text-sm font-medium mb-2">
//                     Max Jobs (1-50)
//                   </label>
//                   <Input
//                     type="number"
//                     min="1"
//                     max="50"
//                     value={maxJobs}
//                     onChange={(e) => setMaxJobs(e.target.value)}
//                     className="w-full"
//                   />
//                 </div>

//                 <div>
//                   <label className="block text-sm font-medium mb-2">
//                     Min Match Score (10-100%)
//                   </label>
//                   <Input
//                     type="number"
//                     min="10"
//                     max="100"
//                     value={minMatch}
//                     onChange={(e) => setMinMatch(e.target.value)}
//                     className="w-full"
//                   />
//                 </div>
//               </div>

//               {error && (
//                 <div className="bg-red-50 border border-red-200 rounded-lg p-4">
//                   <div className="flex items-start gap-2">
//                     <AlertCircle className="h-5 w-5 text-red-600 mt-0.5 flex-shrink-0" />
//                     <div className="flex-1">
//                       <p className="text-sm text-red-800 font-medium">Error</p>
//                       <p className="text-sm text-red-700 mt-1">{error}</p>
//                     </div>
//                   </div>
//                 </div>
//               )}

//               <div className="flex gap-3 pt-4">
//                 <Button
//                   onClick={fetchJobs}
//                   disabled={!role || !country || !cvInfo || cvError !== "" || loadingJobs}
//                   className="bg-blue-600 hover:bg-blue-700 flex-1"
//                 >
//                   {loadingJobs ? (
//                     <>
//                       <Loader2 className="mr-2 h-4 w-4 animate-spin" />
//                       Searching Jobs...
//                     </>
//                   ) : (
//                     <>
//                       <Search className="mr-2 h-4 w-4" />
//                       Find Jobs
//                     </>
//                   )}
//                 </Button>
//               </div>
//             </div>
//           )}

//           {/* STAGE 2 & 3: Keep existing job selection and automation code */}
//           {stage === "jobs" && (
//             <div className="flex flex-col h-full">
//               <div className="flex items-center justify-between mb-4 p-4 bg-gray-50 rounded-lg">
//                 <div className="flex items-center gap-4">
//                   <span className="text-sm font-medium">
//                     {selectedJobIds.size} of {jobs.length} jobs selected
//                   </span>
//                   <div className="flex gap-2">
//                     <Button
//                       size="sm"
//                       variant="outline"
//                       onClick={selectAllJobs}
//                       className="text-xs"
//                     >
//                       Select All
//                     </Button>
//                     <Button
//                       size="sm"
//                       variant="outline"
//                       onClick={deselectAllJobs}
//                       className="text-xs"
//                     >
//                       Deselect All
//                     </Button>
//                   </div>
//                 </div>
//                 <div className="flex gap-2">
//                   <Button
//                     size="sm"
//                     variant="outline"
//                     onClick={() => setStage("form")}
//                   >
//                     Back
//                   </Button>
//                   <Button
//                     onClick={startAutomation}
//                     disabled={selectedJobIds.size === 0}
//                     className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
//                   >
//                     Apply to {selectedJobIds.size} Jobs
//                   </Button>
//                 </div>
//               </div>

//               <div className="flex-1 overflow-y-auto space-y-3">
//                 {jobs.map((job) => (
//                   <div
//                     key={job.id}
//                     className={`border rounded-lg p-4 cursor-pointer transition-all ${
//                       selectedJobIds.has(job.id)
//                         ? "border-purple-300 bg-purple-50"
//                         : "border-gray-200 hover:border-gray-300"
//                     }`}
//                     onClick={() => toggleJobSelection(job.id)}
//                   >
//                     <div className="flex items-start gap-3">
//                       <Checkbox
//                         checked={selectedJobIds.has(job.id)}
//                         onChange={() => toggleJobSelection(job.id)}
//                         className="mt-1"
//                       />
//                       <div className="flex-1 min-w-0">
//                         <div className="flex items-start justify-between gap-2">
//                           <div className="flex-1 min-w-0">
//                             <h3 className="font-medium text-gray-900 truncate">
//                               {job.title}
//                             </h3>
//                             <div className="flex items-center gap-3 text-sm text-gray-600 mt-1">
//                               <div className="flex items-center gap-1">
//                                 <Briefcase className="h-3 w-3" />
//                                 <span className="truncate">{job.company}</span>
//                               </div>
//                               {job.location && (
//                                 <div className="flex items-center gap-1">
//                                   <MapPin className="h-3 w-3" />
//                                   <span className="truncate">{job.location}</span>
//                                 </div>
//                               )}
//                             </div>
//                             {job.snippet && (
//                               <p className="text-xs text-gray-500 mt-2 line-clamp-2">
//                                 {job.snippet}
//                               </p>
//                             )}
//                           </div>
//                           <div className="flex items-center gap-2 flex-shrink-0">
//                             <div className="flex items-center gap-1 text-xs text-gray-600">
//                               <TrendingUp className="h-3 w-3" />
//                               <span>{job.score}%</span>
//                             </div>
//                             <a
//                               href={job.url}
//                               target="_blank"
//                               rel="noopener noreferrer"
//                               className="text-blue-600 hover:text-blue-800"
//                               onClick={(e) => e.stopPropagation()}
//                             >
//                               <ExternalLink className="h-4 w-4" />
//                             </a>
//                           </div>
//                         </div>
//                       </div>
//                     </div>
//                   </div>
//                 ))}
//               </div>
//             </div>
//           )}

//           {/* STAGE 3: AUTOMATION PROGRESS - Keep existing automation code */}
//           {stage === "automation" && (
//             <div className="flex flex-col h-full">
//               {/* Enhanced failure handling */}
//               {isFailed && (
//                 <div className="bg-red-50 border-2 border-red-200 rounded-xl p-6 mb-4">
//                   <div className="flex items-center gap-3 mb-4">
//                     <div className="w-12 h-12 bg-red-500 rounded-full flex items-center justify-center">
//                       <AlertCircle className="h-6 w-6 text-white" />
//                     </div>
//                     <div>
//                       <h3 className="text-xl font-bold text-red-900">Automation Failed</h3>
//                       <p className="text-sm text-red-700">
//                         The automation encountered an error and could not complete
//                       </p>
//                     </div>
//                   </div>

//                   {error && (
//                     <div className="mt-4 p-3 bg-red-100 border border-red-200 rounded-lg">
//                       <p className="text-sm text-red-800">{error}</p>
//                     </div>
//                   )}

//                   <div className="mt-4 flex gap-2">
//                     <Button
//                       onClick={() => {
//                         setStage("form");
//                         setIsFailed(false);
//                         setError("");
//                       }}
//                       variant="outline"
//                       size="sm"
//                     >
//                       Try Again
//                     </Button>
//                     <Button
//                       onClick={() => setOpen(false)}
//                       size="sm"
//                     >
//                       Close
//                     </Button>
//                   </div>
//                 </div>
//               )}

//               {/* Background Processing Notice */}
//               {isRunning && !isCompleted && !isFailed && (
//                 <div className="bg-blue-50 border-2 border-blue-200 rounded-xl p-4 mb-4">
//                   <div className="flex items-start gap-3">
//                     <Info className="h-5 w-5 text-blue-600 mt-0.5 flex-shrink-0" />
//                     <div className="flex-1">
//                       <h4 className="font-semibold text-blue-900 mb-1">Automation Running in Background</h4>
//                       <p className="text-sm text-blue-800 mb-3">
//                         You can safely close this modal. The automation will continue processing, and you'll
//                         receive a notification when it's complete. Failed applications will be automatically
//                         refunded.
//                       </p>
//                       <div className="flex items-center gap-2 text-xs text-blue-700">
//                         <CheckCircle2 className="h-4 w-4" />
//                         <span>Check your dashboard for real-time progress updates</span>
//                       </div>
//                     </div>
//                   </div>
//                 </div>
//               )}

//               {/* Completion Stats Card */}
//               {isCompleted && completionStats && (
//                 <div className="bg-gradient-to-r from-green-50 to-emerald-50 border-2 border-green-200 rounded-xl p-6 mb-4">
//                   <div className="flex items-center gap-3 mb-4">
//                     <div className="w-12 h-12 bg-green-500 rounded-full flex items-center justify-center">
//                       {completionStats.failed === 0 ? (
//                         <PartyPopper className="h-6 w-6 text-white" />
//                       ) : (
//                         <CheckCircle2 className="h-6 w-6 text-white" />
//                       )}
//                     </div>
//                     <div>
//                       <h3 className="text-xl font-bold text-gray-900">
//                         {completionStats.failed === 0 ? "Perfect Run! 🎉" : "Automation Complete"}
//                       </h3>
//                       <p className="text-sm text-gray-600">
//                         {completionStats.failed === 0
//                           ? "All applications sent successfully!"
//                           : `${completionStats.failed} jobs failed - credits refunded`
//                         }
//                       </p>
//                     </div>
//                   </div>

//                   <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
//                     <div className="bg-white rounded-lg p-4 text-center">
//                       <Target className="h-5 w-5 text-blue-600 mx-auto mb-2" />
//                       <div className="text-2xl font-bold text-gray-900">{completionStats.total_applied}</div>
//                       <div className="text-xs text-gray-600">Total Jobs</div>
//                     </div>

//                     <div className="bg-white rounded-lg p-4 text-center">
//                       <CheckCircle2 className="h-5 w-5 text-green-600 mx-auto mb-2" />
//                       <div className="text-2xl font-bold text-green-600">{completionStats.successful}</div>
//                       <div className="text-xs text-gray-600">Successful</div>
//                     </div>

//                     <div className="bg-white rounded-lg p-4 text-center">
//                       <AlertCircle className="h-5 w-5 text-red-600 mx-auto mb-2" />
//                       <div className="text-2xl font-bold text-red-600">{completionStats.failed}</div>
//                       <div className="text-xs text-gray-600">Failed</div>
//                     </div>

//                     <div className="bg-white rounded-lg p-4 text-center">
//                       <Award className="h-5 w-5 text-purple-600 mx-auto mb-2" />
//                       <div className="text-2xl font-bold text-purple-600">{completionStats.success_rate}%</div>
//                       <div className="text-xs text-gray-600">Success Rate</div>
//                     </div>
//                   </div>

//                   <div className="mt-4 flex items-center justify-center gap-2 text-sm text-gray-600">
//                     <Clock className="h-4 w-4" />
//                     <span>Completed in {Math.floor(completionStats.duration / 60)}m {completionStats.duration % 60}s</span>
//                   </div>

//                   {completionStats.failed > 0 && (
//                     <div className="mt-3 p-3 bg-blue-50 border border-blue-200 rounded-lg">
//                       <div className="flex items-start gap-2">
//                         <Info className="h-4 w-4 text-blue-600 mt-0.5 flex-shrink-0" />
//                         <p className="text-xs text-blue-800">
//                           💳 <strong>Credit Refund:</strong> You've been automatically refunded credits for
//                           the {completionStats.failed} failed application{completionStats.failed > 1 ? 's' : ''}.
//                           Check your credit transaction history for details.
//                         </p>
//                       </div>
//                     </div>
//                   )}
//                 </div>
//               )}

//               {error && !isFailed && (
//                 <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
//                   <div className="flex items-start gap-2">
//                     <AlertCircle className="h-5 w-5 text-red-600 mt-0.5 flex-shrink-0" />
//                     <p className="text-sm text-red-800">{error}</p>
//                   </div>
//                 </div>
//               )}

//               {message && (
//                 <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-4">
//                   <div className="flex items-start gap-2">
//                     <CheckCircle2 className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
//                     <p className="text-sm text-green-800">{message}</p>
//                   </div>
//                 </div>
//               )}

//               {/* Live Logs */}
//               <div className="flex-1 overflow-hidden flex flex-col">
//                 <h3 className="font-medium mb-2 flex items-center gap-2">
//                   <span>Live Automation Logs</span>
//                   {isRunning && !isFailed && (
//                     <div className="flex items-center gap-1 text-xs text-green-600">
//                       <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
//                       Running
//                     </div>
//                   )}
//                   {isFailed && (
//                     <div className="flex items-center gap-1 text-xs text-red-600">
//                       <div className="w-2 h-2 bg-red-500 rounded-full"></div>
//                       Failed
//                     </div>
//                   )}
//                 </h3>
//                 <div
//                   ref={logBoxRef}
//                   className="flex-1 bg-gray-900 text-green-400 p-4 rounded-lg font-mono text-xs overflow-y-auto"
//                 >
//                   {logs.length === 0 ? (
//                     <p className="text-gray-500">Logs will appear here...</p>
//                   ) : (
//                     logs.map((log, i) => (
//                       <div key={i} className="mb-1 whitespace-pre-wrap">
//                         {log}
//                       </div>
//                     ))
//                   )}
//                 </div>
//               </div>

//               {/* Proof Gallery */}
//               {proofs.length > 0 && (
//                 <div className="mt-4">
//                   <h4 className="font-medium mb-2">Application Proofs ({proofs.length})</h4>
//                   <div className="grid grid-cols-2 md:grid-cols-4 gap-2 max-h-32 overflow-y-auto">
//                     {proofs.map((proof, i) => (
//                       <a
//                         key={i}
//                         href={proof}
//                         target="_blank"
//                         rel="noopener noreferrer"
//                         className="block"
//                       >
//                         <img
//                           src={proof}
//                           alt={`Application proof ${i + 1}`}
//                           className="w-full h-20 object-cover rounded border hover:border-blue-400 transition-colors"
//                         />
//                       </a>
//                     ))}
//                   </div>
//                 </div>
//               )}
//             </div>
//           )}
//         </div>
//       </DialogContent>
//     </Dialog>
//   );
// }
// // src/components/AutomateModal.tsx
// "use client";

// import { useEffect, useRef, useState } from "react";
// import {
//   Loader2, Search, Sparkles, X, CheckCircle2, AlertCircle,
//   Briefcase, MapPin, TrendingUp, ExternalLink, Check, PartyPopper,
//   Clock, Target, Award, Info
// } from "lucide-react";
// import { Button } from "@/components/ui/button";
// import { Input } from "@/components/ui/input";
// import { Checkbox } from "@/components/ui/checkbox";
// import {
//   Dialog,
//   DialogTrigger,
//   DialogContent,
//   DialogTitle,
//   DialogDescription,
// } from "@/components/ui/dialog";
// import { toast } from "sonner";
// import api from "@/lib/api";

// const COUNTRIES = [
//   "Argentina", "Australia", "Austria", "Bangladesh", "Belgium", "Brazil", "Canada",
//   "Chile", "China", "Colombia", "Czech Republic", "Denmark", "Egypt", "Finland",
//   "France", "Germany", "Greece", "Hong Kong", "Hungary", "India", "Indonesia",
//   "Ireland", "Israel", "Italy", "Japan", "Kenya", "Kuwait", "Malaysia", "Mexico",
//   "Morocco", "Netherlands", "New Zealand", "Nigeria", "Norway", "Pakistan",
//   "Philippines", "Poland", "Portugal", "Qatar", "Romania", "Russia", "Saudi Arabia",
//   "Serbia", "Singapore", "Slovakia", "South Africa", "Spain", "Sri Lanka", "Sweden",
//   "Switzerland", "Taiwan", "Thailand", "Turkey", "Ukraine", "United Arab Emirates",
//   "United Kingdom", "United States", "Uruguay", "Vietnam", "Zimbabwe", "Remote",
// ];

// type SSEMessage =
//   | { type: "info"; msg: string; ts: string }
//   | { type: "proof"; msg: string; url: string; ts: string }
//   | { type: "done"; msg: string; ts: string }
//   | { type: "completion"; msg: string; run_id: string; total_applied: number; successful: number; failed: number; success_rate: number; duration: number; ts: string }
//   | { type: "warning"; msg: string; refund_pending?: boolean; refund_issued?: boolean; ts: string }
//   | { type: "error"; msg: string; ts: string };

// interface Job {
//   id: string;
//   title: string;
//   company: string;
//   location?: string;
//   url: string;
//   snippet?: string;
//   score: number;
//   source?: string;
// }

// interface AutomationStats {
//   total_applied: number;
//   successful: number;
//   failed: number;
//   success_rate: number;
//   duration: number;
// }

// interface AutomateModalProps {
//   cvId: string;
//   token: string;
//   onAutomationDone?: (finalLogs: string[], stats?: AutomationStats) => void;
// }

// export default function AutomateModal({
//   cvId,
//   token,
//   onAutomationDone,
// }: AutomateModalProps) {
//   // Modal state
//   const [open, setOpen] = useState(false);

//   // Form inputs
//   const [role, setRole] = useState("");
//   const [country, setCountry] = useState("");
//   const [maxJobs, setMaxJobs] = useState("5");
//   const [minMatch, setMinMatch] = useState("10");

//   // Workflow stages
//   const [stage, setStage] = useState<"form" | "jobs" | "automation">("form");

//   // Jobs state
//   const [jobs, setJobs] = useState<Job[]>([]);
//   const [selectedJobIds, setSelectedJobIds] = useState<Set<string>>(new Set());
//   const [loadingJobs, setLoadingJobs] = useState(false);

//   // Automation state
//   const [logs, setLogs] = useState<string[]>([]);
//   const [proofs, setProofs] = useState<string[]>([]);
//   const [loading, setLoading] = useState(false);
//   const [isRunning, setIsRunning] = useState(false);
//   const [isCompleted, setIsCompleted] = useState(false);
//   const [completionStats, setCompletionStats] = useState<AutomationStats | null>(null);
//   const [message, setMessage] = useState("");
//   const [error, setError] = useState("");
//   const [runId, setRunId] = useState<string>("");
//   const [actorRunId, setActorRunId] = useState<string>("");

//   const logBoxRef = useRef<HTMLDivElement | null>(null);
//   const eventSourceRef = useRef<EventSource | null>(null);

//   const API_BASE =
//     import.meta.env.VITE_API_URL?.replace(/\/+$/, "") || "http://127.0.0.1:8000";

//   // Helper to add timestamped log
//   const addLog = (message: string) => {
//     const timestamp = new Date().toLocaleTimeString();
//     setLogs((prev) => [...prev, `[${timestamp}] ${message}`]);
//   };

//   // Auto-scroll logs
//   useEffect(() => {
//     if (!logBoxRef.current) return;
//     logBoxRef.current.scrollTop = logBoxRef.current.scrollHeight;
//   }, [logs]);

//   // Enhanced SSE Connection with improved completion handling
//   useEffect(() => {
//     if (!isRunning) {
//       if (eventSourceRef.current) {
//         eventSourceRef.current.close();
//         eventSourceRef.current = null;
//       }
//       return;
//     }

//     addLog("📡 Connecting to automation stream...");

//     // Add token to SSE connection
//     const sseUrl = new URL(`${API_BASE}/v1/automate-job-apply/stream`);
//     const token = localStorage.getItem("access_token");
//     if (token) sseUrl.searchParams.set("access_token", token);

//     const evt = new EventSource(sseUrl.toString());
//     eventSourceRef.current = evt;

//     evt.onopen = () => {
//       addLog("✅ Connected to live automation feed");
//     };

//     evt.onmessage = (event) => {
//       try {
//         const data: SSEMessage = JSON.parse(event.data);

//         console.log("📨 Received SSE event:", data.type, data);

//         if (data.type === "proof" && data.url) {
//           setProofs((p) => [...p, data.url]);
//           addLog(`📸 ${data.msg}`);
//         }
//         else if (data.type === "completion") {
//           // ✅ ENHANCED: Handle comprehensive completion with failure stats
//           const stats: AutomationStats = {
//             total_applied: data.total_applied,
//             successful: data.successful,
//             failed: data.failed,
//             success_rate: data.success_rate,
//             duration: data.duration
//           };

//           console.log("🎯 Completion stats received:", stats);

//           setCompletionStats(stats);
//           setIsCompleted(true);
//           setIsRunning(false);

//           // Enhanced completion logs
//           addLog(`\n${"=".repeat(60)}`);
//           addLog(`🎉 AUTOMATION COMPLETED!`);
//           addLog(`${"=".repeat(60)}`);
//           addLog(`📊 Results Summary:`);
//           addLog(`   ✅ Successfully Applied: ${stats.successful} jobs`);
//           addLog(`   ❌ Failed Applications: ${stats.failed} jobs`);
//           addLog(`   📈 Success Rate: ${stats.success_rate}%`);
//           addLog(`   ⏱️  Total Duration: ${Math.floor(stats.duration / 60)}m ${stats.duration % 60}s`);

//           // ✅ Show credit refund if failures occurred
//           if (stats.failed > 0) {
//             addLog(`   💳 Credits will be refunded for ${stats.failed} failed applications`);
//           }

//           addLog(`${"=".repeat(60)}\n`);
//           addLog(`💡 Tip: Check your dashboard for detailed application history`);

//           setMessage("✅ Automation completed successfully!");

//           // Callback with stats
//           if (onAutomationDone) {
//             onAutomationDone([...logs], stats);
//           }

//           // Save to localStorage
//           localStorage.setItem("last_automation_stats", JSON.stringify(stats));
//           localStorage.setItem("automation_logs", JSON.stringify(logs));

//           // ✅ Show appropriate toast based on success rate
//           if (stats.failed === 0) {
//             toast.success(`🎉 Perfect! Applied to all ${stats.successful} jobs!`, {
//               description: `Success rate: 100% | Duration: ${Math.floor(stats.duration / 60)}m ${stats.duration % 60}s`,
//               duration: 5000,
//             });
//           } else if (stats.success_rate >= 70) {
//             toast.success(`🎉 Applied to ${stats.successful} jobs!`, {
//               description: `${stats.failed} failed (credits refunded). Success rate: ${stats.success_rate}%`,
//               duration: 5000,
//             });
//           } else {
//             toast.warning(`⚠️ Applied to ${stats.successful} of ${stats.total_applied} jobs`, {
//               description: `${stats.failed} failed. Credits refunded. Success rate: ${stats.success_rate}%`,
//               duration: 6000,
//             });
//           }

//           // 🔄 Refresh dashboard data
//           setTimeout(() => {
//             window.dispatchEvent(new Event('automation-completed'));
//           }, 1000);
//         }
//         else if (data.type === "warning") {
//           // ✅ Handle failure warnings
//           addLog(`⚠️ ${data.msg}`);

//           if (data.refund_pending || data.refund_issued) {
//             toast.info("💳 Credits will be refunded for failed applications");
//           }
//         }
//         else if (data.type === "done") {
//           // Fallback for old completion format
//           addLog(`✅ ${data.msg}`);
//           setIsCompleted(true);
//           setIsRunning(false);
//           toast.success("🎉 Automation finished!");
//         }
//         else if (data.type === "error") {
//           addLog(`❌ ${data.msg}`);
//           setIsRunning(false);
//           setError(data.msg);
//           toast.error(`Error: ${data.msg}`);
//         }
//         else if (data.msg) {
//           addLog(data.msg);
//         }
//       } catch (e) {
//         console.error("Failed to parse SSE message:", e);
//       }
//     };

//     evt.onerror = (error) => {
//       console.error("❌ SSE Connection error:", error);
//       addLog("⚠️ Connection to stream closed");

//       // Only close if automation is truly done
//       if (!isCompleted) {
//         addLog("🔄 Attempting to reconnect...");
//         // Attempt reconnection after 3 seconds
//         setTimeout(() => {
//           if (isRunning) {
//             addLog("♻️ Reconnecting to stream...");
//           }
//         }, 3000);
//       }
//     };

//     return () => {
//       console.log("🔌 Cleaning up SSE connection");
//       evt.close();
//       eventSourceRef.current = null;
//     };
//   }, [isRunning, API_BASE, isCompleted, logs, onAutomationDone]);

//   // Reset state when modal closes
//   useEffect(() => {
//     if (!open) {
//       setStage("form");
//       setJobs([]);
//       setSelectedJobIds(new Set());
//       setLogs([]);
//       setProofs([]);
//       setError("");
//       setMessage("");
//       setRunId("");
//       setActorRunId("");
//       setIsRunning(false);
//       setIsCompleted(false);
//       setCompletionStats(null);
//     }
//   }, [open]);

//   // Step 1: Fetch and display jobs
//   const fetchJobs = async () => {
//     setLoadingJobs(true);
//     setError("");
//     setMessage("");

//     if (!cvId) {
//       setError("Please upload a CV first!");
//       setLoadingJobs(false);
//       return;
//     }

//     try {
//       const res = await api.post("/v1/jobs/fetch-and-score", {
//         cv_id: cvId,
//         role,
//         country,
//         min_match_score: Number(minMatch),
//         max_jobs: Number(maxJobs),
//       });

//       if (res.data?.jobs) {
//         setJobs(res.data.jobs);
//         // Auto-select all jobs initially
//         const allJobIds = new Set(res.data.jobs.map((j: Job) => j.id));
//         setSelectedJobIds(allJobIds);
//         setStage("jobs");
//       } else {
//         setError("No jobs found matching your criteria. Try adjusting your search parameters.");
//       }
//     } catch (err: any) {
//       console.error(err);
//       const errorMsg = err?.response?.data?.detail || err.message || "Failed to fetch jobs";
//       setError(errorMsg);
//     } finally {
//       setLoadingJobs(false);
//     }
//   };

//   // Step 2: Start automation with selected jobs
//   const startAutomation = async () => {
//     if (selectedJobIds.size === 0) {
//       toast.error("Please select at least one job to apply.");
//       return;
//     }

//     // ✅ Enforce 50 job limit
//     if (selectedJobIds.size > 50) {
//       toast.error("Maximum 50 jobs allowed per automation run. Please deselect some jobs.");
//       return;
//     }

//     setLoading(true);
//     setError("");
//     setMessage("");
//     setLogs([]);
//     setProofs([]);
//     setRunId("");
//     setActorRunId("");
//     setIsRunning(true);
//     setIsCompleted(false);
//     setCompletionStats(null);
//     setStage("automation");

//     try {
//       // Filter selected jobs
//       const selectedJobs = jobs.filter((j) => selectedJobIds.has(j.id));

//       addLog("🚀 Starting job automation...");
//       addLog(`🎯 Applying to ${selectedJobs.length} selected jobs`);
//       addLog(`📊 Average match score: ${(selectedJobs.reduce((acc, j) => acc + j.score, 0) / selectedJobs.length).toFixed(1)}%`);
//       addLog("💳 Checking credits...");

//       // ✅ Trigger automation with selected jobs (NO RE-FETCHING)
//       addLog("🔄 Initiating automation request...");
//       const triggerRes = await api.post("/v1/automate-job-apply", {
//         cv_id: cvId,
//         role,
//         country,
//         min_match_score: Number(minMatch),
//         max_jobs: selectedJobs.length,
//         selected_jobs: selectedJobs,  // ✅ Backend uses these
//       });

//       if (triggerRes.data?.ok) {
//         setRunId(triggerRes.data.run_id || "");
//         setActorRunId(triggerRes.data.actor_run_id || "");

//         addLog("✅ Automation started successfully!");
//         addLog(`📝 Run ID: ${triggerRes.data.run_id}`);
//         addLog(`🤖 Actor ID: ${triggerRes.data.actor_run_id}`);

//         if (triggerRes.data.credits_used) {
//           addLog(`💳 Credits used: ${triggerRes.data.credits_used}`);
//         }

//         addLog(`📋 Processing ${selectedJobs.length} selected jobs`);
//         addLog("🔍 AI is now discovering companies and sending applications...");
//         addLog("\n" + "=".repeat(60));
//         addLog("ℹ️  IMPORTANT: You can close this modal safely!");
//         addLog("   • Automation continues running in the background");
//         addLog("   • You'll receive a notification when complete");
//         addLog("   • Failed applications will be refunded automatically");
//         addLog("   • Check dashboard for real-time progress");
//         addLog("=".repeat(60) + "\n");

//         setMessage("✅ Automation running in background. You can close this modal safely.");

//         toast.success("🚀 Automation started successfully!", {
//           description: "Running in background. You'll be notified when complete.",
//           duration: 4000,
//         });
//       } else {
//         setError("Failed to start automation");
//         setIsRunning(false);
//         addLog("❌ Failed to start automation");
//       }
//     } catch (err: any) {
//       console.error(err);
//       const errorMsg =
//         err?.response?.data?.detail || err.message || "Unexpected error";
//       setError(errorMsg);
//       setIsRunning(false);
//       addLog(`❌ Error: ${errorMsg}`);

//       if (err?.response?.status === 402) {
//         addLog("💳 Insufficient credits. Please purchase more credits.");
//         toast.error("Insufficient credits");
//       }
//     } finally {
//       setLoading(false);
//     }
//   };

//   // Job selection handlers
//   const toggleJobSelection = (jobId: string) => {
//     const newSelected = new Set(selectedJobIds);
//     if (newSelected.has(jobId)) {
//       newSelected.delete(jobId);
//     } else {
//       newSelected.add(jobId);
//     }
//     setSelectedJobIds(newSelected);
//   };

//   const selectAllJobs = () => {
//     const allJobIds = new Set(jobs.map((j) => j.id));
//     setSelectedJobIds(allJobIds);
//   };

//   const deselectAllJobs = () => {
//     setSelectedJobIds(new Set());
//   };

//   return (
//     <Dialog open={open} onOpenChange={setOpen}>
//       <DialogTrigger asChild>
//         <Button className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700">
//           <Sparkles className="mr-2 h-4 w-4" />
//           Start Automation
//         </Button>
//       </DialogTrigger>

//       <DialogContent className="max-w-6xl max-h-[90vh] overflow-hidden flex flex-col">
//         <div className="flex items-center gap-3 mb-4">
//           <div className="w-10 h-10 bg-gradient-to-r from-purple-600 to-pink-600 rounded-lg flex items-center justify-center">
//             <Sparkles className="h-5 w-5 text-white" />
//           </div>
//           <div>
//             <DialogTitle className="text-xl font-bold">
//               {stage === "form" && "Configure Job Automation"}
//               {stage === "jobs" && `Review Jobs (${selectedJobIds.size}/${jobs.length} selected)`}
//               {stage === "automation" && "Automation in Progress"}
//             </DialogTitle>
//             <DialogDescription>
//               {stage === "form" && "Set your job preferences and requirements"}
//               {stage === "jobs" && "Select which jobs to apply for"}
//               {stage === "automation" && "Real-time automation progress"}
//             </DialogDescription>
//           </div>
//         </div>

//         <div className="flex-1 overflow-hidden flex flex-col">
//           {/* STAGE 1: FORM */}
//           {stage === "form" && (
//             <div className="space-y-6">
//               <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
//                 <div>
//                   <label className="block text-sm font-medium mb-2">Job Role</label>
//                   <Input
//                     type="text"
//                     placeholder="e.g., Software Engineer"
//                     value={role}
//                     onChange={(e) => setRole(e.target.value)}
//                     className="w-full"
//                   />
//                 </div>

//                 <div>
//                   <label className="block text-sm font-medium mb-2">Country</label>
//                   <select
//                     value={country}
//                     onChange={(e) => setCountry(e.target.value)}
//                     className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
//                   >
//                     <option value="">Select Country</option>
//                     {COUNTRIES.map((c) => (
//                       <option key={c} value={c}>
//                         {c}
//                       </option>
//                     ))}
//                   </select>
//                 </div>

//                 <div>
//                   <label className="block text-sm font-medium mb-2">
//                     Max Jobs (1-50)
//                   </label>
//                   <Input
//                     type="number"
//                     min="1"
//                     max="50"
//                     value={maxJobs}
//                     onChange={(e) => setMaxJobs(e.target.value)}
//                     className="w-full"
//                   />
//                 </div>

//                 <div>
//                   <label className="block text-sm font-medium mb-2">
//                     Min Match Score (10-100%)
//                   </label>
//                   <Input
//                     type="number"
//                     min="10"
//                     max="100"
//                     value={minMatch}
//                     onChange={(e) => setMinMatch(e.target.value)}
//                     className="w-full"
//                   />
//                 </div>
//               </div>

//               {error && (
//                 <div className="bg-red-50 border border-red-200 rounded-lg p-4">
//                   <div className="flex items-start gap-2">
//                     <AlertCircle className="h-5 w-5 text-red-600 mt-0.5 flex-shrink-0" />
//                     <p className="text-sm text-red-800">{error}</p>
//                   </div>
//                 </div>
//               )}

//               <div className="flex gap-3 pt-4">
//                 <Button
//                   onClick={fetchJobs}
//                   disabled={!role || !country || loadingJobs}
//                   className="bg-blue-600 hover:bg-blue-700 flex-1"
//                 >
//                   {loadingJobs ? (
//                     <>
//                       <Loader2 className="mr-2 h-4 w-4 animate-spin" />
//                       Searching Jobs...
//                     </>
//                   ) : (
//                     <>
//                       <Search className="mr-2 h-4 w-4" />
//                       Find Jobs
//                     </>
//                   )}
//                 </Button>
//               </div>
//             </div>
//           )}

//           {/* STAGE 2: JOB SELECTION */}
//           {stage === "jobs" && (
//             <div className="flex flex-col h-full">
//               <div className="flex items-center justify-between mb-4 p-4 bg-gray-50 rounded-lg">
//                 <div className="flex items-center gap-4">
//                   <span className="text-sm font-medium">
//                     {selectedJobIds.size} of {jobs.length} jobs selected
//                   </span>
//                   <div className="flex gap-2">
//                     <Button
//                       size="sm"
//                       variant="outline"
//                       onClick={selectAllJobs}
//                       className="text-xs"
//                     >
//                       Select All
//                     </Button>
//                     <Button
//                       size="sm"
//                       variant="outline"
//                       onClick={deselectAllJobs}
//                       className="text-xs"
//                     >
//                       Deselect All
//                     </Button>
//                   </div>
//                 </div>
//                 <div className="flex gap-2">
//                   <Button
//                     size="sm"
//                     variant="outline"
//                     onClick={() => setStage("form")}
//                   >
//                     Back
//                   </Button>
//                   <Button
//                     onClick={startAutomation}
//                     disabled={selectedJobIds.size === 0}
//                     className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
//                   >
//                     Apply to {selectedJobIds.size} Jobs
//                   </Button>
//                 </div>
//               </div>

//               <div className="flex-1 overflow-y-auto space-y-3">
//                 {jobs.map((job) => (
//                   <div
//                     key={job.id}
//                     className={`border rounded-lg p-4 cursor-pointer transition-all ${
//                       selectedJobIds.has(job.id)
//                         ? "border-purple-300 bg-purple-50"
//                         : "border-gray-200 hover:border-gray-300"
//                     }`}
//                     onClick={() => toggleJobSelection(job.id)}
//                   >
//                     <div className="flex items-start gap-3">
//                       <Checkbox
//                         checked={selectedJobIds.has(job.id)}
//                         onChange={() => toggleJobSelection(job.id)}
//                         className="mt-1"
//                       />
//                       <div className="flex-1 min-w-0">
//                         <div className="flex items-start justify-between gap-2">
//                           <div className="flex-1 min-w-0">
//                             <h3 className="font-medium text-gray-900 truncate">
//                               {job.title}
//                             </h3>
//                             <div className="flex items-center gap-3 text-sm text-gray-600 mt-1">
//                               <div className="flex items-center gap-1">
//                                 <Briefcase className="h-3 w-3" />
//                                 <span className="truncate">{job.company}</span>
//                               </div>
//                               {job.location && (
//                                 <div className="flex items-center gap-1">
//                                   <MapPin className="h-3 w-3" />
//                                   <span className="truncate">{job.location}</span>
//                                 </div>
//                               )}
//                             </div>
//                             {job.snippet && (
//                               <p className="text-xs text-gray-500 mt-2 line-clamp-2">
//                                 {job.snippet}
//                               </p>
//                             )}
//                           </div>
//                           <div className="flex items-center gap-2 flex-shrink-0">
//                             <div className="flex items-center gap-1 text-xs text-gray-600">
//                               <TrendingUp className="h-3 w-3" />
//                               <span>{job.score}%</span>
//                             </div>
//                             <a
//                               href={job.url}
//                               target="_blank"
//                               rel="noopener noreferrer"
//                               className="text-blue-600 hover:text-blue-800"
//                               onClick={(e) => e.stopPropagation()}
//                             >
//                               <ExternalLink className="h-4 w-4" />
//                             </a>
//                           </div>
//                         </div>
//                       </div>
//                     </div>
//                   </div>
//                 ))}
//               </div>
//             </div>
//           )}

//           {/* STAGE 3: AUTOMATION PROGRESS */}
//           {stage === "automation" && (
//             <div className="flex flex-col h-full">
//               {/* Enhanced Background Processing Notice */}
//               {isRunning && !isCompleted && (
//                 <div className="bg-blue-50 border-2 border-blue-200 rounded-xl p-4 mb-4">
//                   <div className="flex items-start gap-3">
//                     <Info className="h-5 w-5 text-blue-600 mt-0.5 flex-shrink-0" />
//                     <div className="flex-1">
//                       <h4 className="font-semibold text-blue-900 mb-1">Automation Running in Background</h4>
//                       <p className="text-sm text-blue-800 mb-3">
//                         You can safely close this modal. The automation will continue processing, and you'll
//                         receive a notification when it's complete. Failed applications will be automatically
//                         refunded.
//                       </p>
//                       <div className="flex items-center gap-2 text-xs text-blue-700">
//                         <CheckCircle2 className="h-4 w-4" />
//                         <span>Check your dashboard for real-time progress updates</span>
//                       </div>
//                     </div>
//                   </div>
//                 </div>
//               )}

//               {/* Enhanced Completion Stats Card */}
//               {isCompleted && completionStats && (
//                 <div className="bg-gradient-to-r from-green-50 to-emerald-50 border-2 border-green-200 rounded-xl p-6 mb-4">
//                   <div className="flex items-center gap-3 mb-4">
//                     <div className="w-12 h-12 bg-green-500 rounded-full flex items-center justify-center">
//                       {completionStats.failed === 0 ? (
//                         <PartyPopper className="h-6 w-6 text-white" />
//                       ) : (
//                         <CheckCircle2 className="h-6 w-6 text-white" />
//                       )}
//                     </div>
//                     <div>
//                       <h3 className="text-xl font-bold text-gray-900">
//                         {completionStats.failed === 0 ? "Perfect Run! 🎉" : "Automation Complete"}
//                       </h3>
//                       <p className="text-sm text-gray-600">
//                         {completionStats.failed === 0
//                           ? "All applications sent successfully!"
//                           : `${completionStats.failed} jobs failed - credits refunded`
//                         }
//                       </p>
//                     </div>
//                   </div>

//                   <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
//                     <div className="bg-white rounded-lg p-4 text-center">
//                       <Target className="h-5 w-5 text-blue-600 mx-auto mb-2" />
//                       <div className="text-2xl font-bold text-gray-900">{completionStats.total_applied}</div>
//                       <div className="text-xs text-gray-600">Total Jobs</div>
//                     </div>

//                     <div className="bg-white rounded-lg p-4 text-center">
//                       <CheckCircle2 className="h-5 w-5 text-green-600 mx-auto mb-2" />
//                       <div className="text-2xl font-bold text-green-600">{completionStats.successful}</div>
//                       <div className="text-xs text-gray-600">Successful</div>
//                     </div>

//                     <div className="bg-white rounded-lg p-4 text-center">
//                       <AlertCircle className="h-5 w-5 text-red-600 mx-auto mb-2" />
//                       <div className="text-2xl font-bold text-red-600">{completionStats.failed}</div>
//                       <div className="text-xs text-gray-600">Failed</div>
//                     </div>

//                     <div className="bg-white rounded-lg p-4 text-center">
//                       <Award className="h-5 w-5 text-purple-600 mx-auto mb-2" />
//                       <div className="text-2xl font-bold text-purple-600">{completionStats.success_rate}%</div>
//                       <div className="text-xs text-gray-600">Success Rate</div>
//                     </div>
//                   </div>

//                   <div className="mt-4 flex items-center justify-center gap-2 text-sm text-gray-600">
//                     <Clock className="h-4 w-4" />
//                     <span>Completed in {Math.floor(completionStats.duration / 60)}m {completionStats.duration % 60}s</span>
//                   </div>

//                   {/* ✅ Show credit refund info if failures */}
//                   {completionStats.failed > 0 && (
//                     <div className="mt-3 p-3 bg-blue-50 border border-blue-200 rounded-lg">
//                       <div className="flex items-start gap-2">
//                         <Info className="h-4 w-4 text-blue-600 mt-0.5 flex-shrink-0" />
//                         <p className="text-xs text-blue-800">
//                           💳 <strong>Credit Refund:</strong> You've been automatically refunded credits for
//                           the {completionStats.failed} failed application{completionStats.failed > 1 ? 's' : ''}.
//                           Check your credit transaction history for details.
//                         </p>
//                       </div>
//                     </div>
//                   )}
//                 </div>
//               )}

//               {error && (
//                 <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
//                   <div className="flex items-start gap-2">
//                     <AlertCircle className="h-5 w-5 text-red-600 mt-0.5 flex-shrink-0" />
//                     <p className="text-sm text-red-800">{error}</p>
//                   </div>
//                 </div>
//               )}

//               {message && (
//                 <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-4">
//                   <div className="flex items-start gap-2">
//                     <CheckCircle2 className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
//                     <p className="text-sm text-green-800">{message}</p>
//                   </div>
//                 </div>
//               )}

//               {/* Live Logs */}
//               <div className="flex-1 overflow-hidden flex flex-col">
//                 <h3 className="font-medium mb-2 flex items-center gap-2">
//                   <span>Live Automation Logs</span>
//                   {isRunning && (
//                     <div className="flex items-center gap-1 text-xs text-green-600">
//                       <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
//                       Running
//                     </div>
//                   )}
//                 </h3>
//                 <div
//                   ref={logBoxRef}
//                   className="flex-1 bg-gray-900 text-green-400 p-4 rounded-lg font-mono text-xs overflow-y-auto"
//                 >
//                   {logs.length === 0 ? (
//                     <p className="text-gray-500">Logs will appear here...</p>
//                   ) : (
//                     logs.map((log, i) => (
//                       <div key={i} className="mb-1 whitespace-pre-wrap">
//                         {log}
//                       </div>
//                     ))
//                   )}
//                 </div>
//               </div>

//               {/* Proof Gallery */}
//               {proofs.length > 0 && (
//                 <div className="mt-4">
//                   <h4 className="font-medium mb-2">Application Proofs ({proofs.length})</h4>
//                   <div className="grid grid-cols-2 md:grid-cols-4 gap-2 max-h-32 overflow-y-auto">
//                     {proofs.map((proof, i) => (
//                       <a
//                         key={i}
//                         href={proof}
//                         target="_blank"
//                         rel="noopener noreferrer"
//                         className="block"
//                       >
//                         <img
//                           src={proof}
//                           alt={`Application proof ${i + 1}`}
//                           className="w-full h-20 object-cover rounded border hover:border-blue-400 transition-colors"
//                         />
//                       </a>
//                     ))}
//                   </div>
//                 </div>
//               )}
//             </div>
//           )}
//         </div>
//       </DialogContent>
//     </Dialog>
//   );
// }
// // src/components/AutomateModal.tsx
// "use client";

// import { useEffect, useRef, useState } from "react";
// import {
//   Loader2, Search, Sparkles, X, CheckCircle2, AlertCircle,
//   Briefcase, MapPin, TrendingUp, ExternalLink, Check, PartyPopper,
//   Clock, Target, Award, Info
// } from "lucide-react";
// import { Button } from "@/components/ui/button";
// import { Input } from "@/components/ui/input";
// import { Checkbox } from "@/components/ui/checkbox";
// import {
//   Dialog,
//   DialogTrigger,
//   DialogContent,
//   DialogTitle,
//   DialogDescription,
// } from "@/components/ui/dialog";
// import { toast } from "sonner";
// import api from "@/lib/api";

// const COUNTRIES = [
//   "Argentina", "Australia", "Austria", "Bangladesh", "Belgium", "Brazil", "Canada",
//   "Chile", "China", "Colombia", "Czech Republic", "Denmark", "Egypt", "Finland",
//   "France", "Germany", "Greece", "Hong Kong", "Hungary", "India", "Indonesia",
//   "Ireland", "Israel", "Italy", "Japan", "Kenya", "Kuwait", "Malaysia", "Mexico",
//   "Morocco", "Netherlands", "New Zealand", "Nigeria", "Norway", "Pakistan",
//   "Philippines", "Poland", "Portugal", "Qatar", "Romania", "Russia", "Saudi Arabia",
//   "Serbia", "Singapore", "Slovakia", "South Africa", "Spain", "Sri Lanka", "Sweden",
//   "Switzerland", "Taiwan", "Thailand", "Turkey", "Ukraine", "United Arab Emirates",
//   "United Kingdom", "United States", "Uruguay", "Vietnam", "Zimbabwe", "Remote",
// ];

// type SSEMessage =
//   | { type: "info"; msg: string; ts: string }
//   | { type: "proof"; msg: string; url: string; ts: string }
//   | { type: "done"; msg: string; ts: string }
//   | { type: "completion"; msg: string; run_id: string; total_applied: number; successful: number; failed: number; success_rate: number; duration: number; ts: string }
//   | { type: "error"; msg: string; ts: string };

// interface Job {
//   id: string;
//   title: string;
//   company: string;
//   location?: string;
//   url: string;
//   snippet?: string;
//   score: number;
//   source?: string;
// }

// interface AutomationStats {
//   total_applied: number;
//   successful: number;
//   failed: number;
//   success_rate: number;
//   duration: number;
// }

// interface AutomateModalProps {
//   cvId: string;
//   token: string;
//   onAutomationDone?: (finalLogs: string[], stats?: AutomationStats) => void;
// }

// export default function AutomateModal({
//   cvId,
//   token,
//   onAutomationDone,
// }: AutomateModalProps) {
//   // Modal state
//   const [open, setOpen] = useState(false);

//   // Form inputs
//   const [role, setRole] = useState("");
//   const [country, setCountry] = useState("");
//   const [maxJobs, setMaxJobs] = useState("5");
//   const [minMatch, setMinMatch] = useState("10");

//   // Workflow stages
//   const [stage, setStage] = useState<"form" | "jobs" | "automation">("form");

//   // Jobs state
//   const [jobs, setJobs] = useState<Job[]>([]);
//   const [selectedJobIds, setSelectedJobIds] = useState<Set<string>>(new Set());
//   const [loadingJobs, setLoadingJobs] = useState(false);

//   // Automation state
//   const [logs, setLogs] = useState<string[]>([]);
//   const [proofs, setProofs] = useState<string[]>([]);
//   const [loading, setLoading] = useState(false);
//   const [isRunning, setIsRunning] = useState(false);
//   const [isCompleted, setIsCompleted] = useState(false);
//   const [completionStats, setCompletionStats] = useState<AutomationStats | null>(null);
//   const [message, setMessage] = useState("");
//   const [error, setError] = useState("");
//   const [runId, setRunId] = useState<string>("");
//   const [actorRunId, setActorRunId] = useState<string>("");

//   const logBoxRef = useRef<HTMLDivElement | null>(null);
//   const eventSourceRef = useRef<EventSource | null>(null);

//   const API_BASE =
//     import.meta.env.VITE_API_URL?.replace(/\/+$/, "") || "http://127.0.0.1:8000";

//   // Helper to add timestamped log
//   const addLog = (message: string) => {
//     const timestamp = new Date().toLocaleTimeString();
//     setLogs((prev) => [...prev, `[${timestamp}] ${message}`]);
//   };

//   // Auto-scroll logs
//   useEffect(() => {
//     if (!logBoxRef.current) return;
//     logBoxRef.current.scrollTop = logBoxRef.current.scrollHeight;
//   }, [logs]);

//   // SSE Connection - Only when automation is running
//   // Enhanced SSE Connection - FIXED VERSION
// useEffect(() => {
//   if (!isRunning) {
//     if (eventSourceRef.current) {
//       eventSourceRef.current.close();
//       eventSourceRef.current = null;
//     }
//     return;
//   }

//   addLog("📡 Connecting to automation stream...");

//   // Add token to SSE connection
//   const sseUrl = new URL(`${API_BASE}/v1/automate-job-apply/stream`);
//   const token = localStorage.getItem("access_token");
//   if (token) sseUrl.searchParams.set("access_token", token);

//   const evt = new EventSource(sseUrl.toString());

//   eventSourceRef.current = evt;

//   evt.onopen = () => {
//     addLog("✅ Connected to live automation feed");
//   };

//   evt.onmessage = (event) => {
//   try {
//     const data: SSEMessage = JSON.parse(event.data);

//     console.log("📨 Received SSE event:", data.type, data);

//     if (data.type === "proof" && data.url) {
//       setProofs((p) => [...p, data.url]);
//       addLog(`📸 ${data.msg}`);
//     }
//     else if (data.type === "completion") {
//       // ✅ ENHANCED: Handle comprehensive completion with failure stats
//       const stats: AutomationStats = {
//         total_applied: data.total_applied,
//         successful: data.successful,
//         failed: data.failed,
//         success_rate: data.success_rate,
//         duration: data.duration
//       };

//       console.log("🎯 Completion stats received:", stats);

//       setCompletionStats(stats);
//       setIsCompleted(true);
//       setIsRunning(false);

//       // Enhanced completion logs
//       addLog(`\n${"=".repeat(60)}`);
//       addLog(`🎉 AUTOMATION COMPLETED!`);
//       addLog(`${"=".repeat(60)}`);
//       addLog(`📊 Results Summary:`);
//       addLog(`   ✅ Successfully Applied: ${stats.successful} jobs`);
//       addLog(`   ❌ Failed Applications: ${stats.failed} jobs`);
//       addLog(`   📈 Success Rate: ${stats.success_rate}%`);
//       addLog(`   ⏱️  Total Duration: ${Math.floor(stats.duration / 60)}m ${stats.duration % 60}s`);

//       // ✅ Show credit refund if failures occurred
//       if (stats.failed > 0) {
//         addLog(`   💳 Credits will be refunded for ${stats.failed} failed applications`);
//       }

//       addLog(`${"=".repeat(60)}\n`);
//       addLog(`💡 Tip: Check your dashboard for detailed application history`);

//       setMessage("✅ Automation completed successfully!");

//       // Callback with stats
//       if (onAutomationDone) {
//         onAutomationDone([...logs], stats);
//       }

//       // Save to localStorage
//       localStorage.setItem("last_automation_stats", JSON.stringify(stats));
//       localStorage.setItem("automation_logs", JSON.stringify(logs));

//       // ✅ Show appropriate toast based on success rate
//       if (stats.failed === 0) {
//         toast.success(`🎉 Perfect! Applied to all ${stats.successful} jobs!`, {
//           description: `Success rate: 100% | Duration: ${Math.floor(stats.duration / 60)}m ${stats.duration % 60}s`,
//           duration: 5000,
//         });
//       } else if (stats.success_rate >= 70) {
//         toast.success(`🎉 Applied to ${stats.successful} jobs!`, {
//           description: `${stats.failed} failed (credits refunded). Success rate: ${stats.success_rate}%`,
//           duration: 5000,
//         });
//       } else {
//         toast.warning(`⚠️ Applied to ${stats.successful} of ${stats.total_applied} jobs`, {
//           description: `${stats.failed} failed. Credits refunded. Success rate: ${stats.success_rate}%`,
//           duration: 6000,
//         });
//       }

//       // 🔄 Refresh dashboard data
//       setTimeout(() => {
//         window.dispatchEvent(new Event('automation-completed'));
//       }, 1000);
//     }
//     else if (data.type === "warning") {
//       // ✅ Handle failure warnings
//       addLog(`⚠️ ${data.msg}`);

//       if (data.refund_pending || data.refund_issued) {
//         toast.info("💳 Credits will be refunded for failed applications");
//       }
//     }
//     else if (data.type === "done") {
//       // Fallback for old completion format
//       addLog(`✅ ${data.msg}`);
//       setIsCompleted(true);
//       setIsRunning(false);
//       toast.success("🎉 Automation finished!");
//     }
//     else if (data.type === "error") {
//       addLog(`❌ ${data.msg}`);
//       setIsRunning(false);
//       setError(data.msg);
//       toast.error(`Error: ${data.msg}`);
//     }
//     else if (data.msg) {
//       addLog(data.msg);
//     }
//   } catch (e) {
//     console.error("Failed to parse SSE message:", e);
//   }
// };

//   evt.onerror = (error) => {
//     console.error("❌ SSE Connection error:", error);
//     addLog("⚠️ Connection to stream closed");

//     // Only close if automation is truly done
//     if (!isCompleted) {
//       addLog("🔄 Attempting to reconnect...");
//       // Attempt reconnection after 3 seconds
//       setTimeout(() => {
//         if (isRunning) {
//           addLog("♻️ Reconnecting to stream...");
//         }
//       }, 3000);
//     }
//   };

//   return () => {
//     console.log("🔌 Cleaning up SSE connection");
//     evt.close();
//     eventSourceRef.current = null;
//   };
// }, [isRunning, API_BASE, isCompleted]);

//   // Reset state when modal closes
//   useEffect(() => {
//     if (!open) {
//       setStage("form");
//       setJobs([]);
//       setSelectedJobIds(new Set());
//       setLogs([]);
//       setProofs([]);
//       setError("");
//       setMessage("");
//       setRunId("");
//       setActorRunId("");
//       setIsRunning(false);
//       setIsCompleted(false);
//       setCompletionStats(null);
//     }
//   }, [open]);

//   // Step 1: Fetch and display jobs
//   const fetchJobs = async () => {
//     setLoadingJobs(true);
//     setError("");
//     setMessage("");

//     if (!cvId) {
//       setError("Please upload a CV first!");
//       setLoadingJobs(false);
//       return;
//     }

//     if (!role || !country) {
//       setError("Please fill in both Role and Country.");
//       setLoadingJobs(false);
//       return;
//     }

//     try {
//       toast.info("🔍 Searching for matching jobs Please wait...");

//       // Call backend to fetch and score jobs
//       const response = await api.post("/v1/jobs/fetch-and-score", {
//         cv_id: cvId,
//         role: role,
//         country: country,
//         min_match_score: Number(minMatch),
//         max_jobs: Number(maxJobs),
//       });

//       if (response.data?.ok) {
//         const fetchedJobs = response.data.jobs || [];

//         if (fetchedJobs.length === 0) {
//           setError(`No jobs found matching "${role}" in ${country} with ≥${minMatch}% match score.`);
//           setLoadingJobs(false);
//           return;
//         }

//         setJobs(fetchedJobs);

//         // Select all jobs by default
//         const allIds = new Set(fetchedJobs.map((j: Job) => j.id));
//         setSelectedJobIds(allIds);

//         setStage("jobs");

//         toast.success(`✅ Found ${fetchedJobs.length} matching jobs!`);
//       } else {
//         setError("Failed to fetch jobs. Please try again.");
//       }
//     } catch (err: any) {
//       console.error(err);
//       const errorMsg =
//         err?.response?.data?.detail || err.message || "Failed to fetch jobs";
//       setError(errorMsg);

//       if (err?.response?.status === 402) {
//         toast.error("💳 Insufficient credits. Please purchase more credits.");
//       }
//     } finally {
//       setLoadingJobs(false);
//     }
//   };

//   // Toggle job selection
//   const toggleJobSelection = (jobId: string) => {
//     setSelectedJobIds((prev) => {
//       const newSet = new Set(prev);
//       if (newSet.has(jobId)) {
//         newSet.delete(jobId);
//       } else {
//         newSet.add(jobId);
//       }
//       return newSet;
//     });
//   };

//   // Select/Deselect all
//   const selectAll = () => {
//     const allIds = new Set(jobs.map((j) => j.id));
//     setSelectedJobIds(allIds);
//   };

//   const deselectAll = () => {
//     setSelectedJobIds(new Set());
//   };

//   // Step 2: Start automation with selected jobs
//   const startAutomation = async () => {
//     if (selectedJobIds.size === 0) {
//       toast.error("Please select at least one job to apply.");
//       return;
//     }

//     // ✅ NEW: Enforce 50 job limit
//     if (selectedJobIds.size > 50) {
//       toast.error("Maximum 50 jobs allowed per automation run. Please deselect some jobs.");
//       return;
//     }

//     setLoading(true);
//     setError("");
//     setMessage("");
//     setLogs([]);
//     setProofs([]);
//     setRunId("");
//     setActorRunId("");
//     setIsRunning(true);
//     setIsCompleted(false);
//     setCompletionStats(null);
//     setStage("automation");

//     try {
//       // Filter selected jobs
//       const selectedJobs = jobs.filter((j) => selectedJobIds.has(j.id));

//       addLog("🚀 Starting job automation...");
//       addLog(`🎯 Applying to ${selectedJobs.length} selected jobs`);
//       addLog(`📊 Average match score: ${(selectedJobs.reduce((acc, j) => acc + j.score, 0) / selectedJobs.length).toFixed(1)}%`);
//       addLog("💳 Checking credits...");

//       // Trigger automation with selected jobs
//       addLog("🔄 Initiating automation request...");
//       const triggerRes = await api.post("/v1/automate-job-apply", {
//         cv_id: cvId,
//         role,
//         country,
//         min_match_score: Number(minMatch),
//         max_jobs: selectedJobs.length,
//         selected_jobs: selectedJobs,
//       });

//       if (triggerRes.data?.ok) {
//         setRunId(triggerRes.data.run_id || "");
//         setActorRunId(triggerRes.data.actor_run_id || "");

//         addLog("✅ Automation started successfully!");
//         addLog(`📝 Run ID: ${triggerRes.data.run_id}`);
//         addLog(`🤖 Actor ID: ${triggerRes.data.actor_run_id}`);

//         if (triggerRes.data.credits_used) {
//           addLog(`💳 Credits used: ${triggerRes.data.credits_used}`);
//         }

//         addLog(`📋 Processing ${selectedJobs.length} jobs`);
//         addLog("🔍 AI is now discovering companies and sending applications...");
//         addLog("\n" + "=".repeat(60));
//         addLog("ℹ️  IMPORTANT: You can close this modal safely!");
//         addLog("   • Automation continues running in the background");
//         addLog("   • You'll receive a notification when complete");
//         addLog("   • Check dashboard for real-time progress");
//         addLog("   • Reopen this modal anytime to view logs");
//         addLog("=".repeat(60) + "\n");

//         setMessage("✅ Automation running in background. You can close this modal safely.");

//         // Show notification with option to minimize
//         toast.success("🚀 Automation started successfully!", {
//           description: "Running in background. You'll be notified when complete.",
//           duration: 4000,
//         });
//       } else {
//         setError("Failed to start automation");
//         setIsRunning(false);
//         addLog("❌ Failed to start automation");
//       }
//     } catch (err: any) {
//       console.error(err);
//       const errorMsg =
//         err?.response?.data?.detail || err.message || "Unexpected error";
//       setError(errorMsg);
//       setIsRunning(false);
//       addLog(`❌ Error: ${errorMsg}`);

//       if (err?.response?.status === 402) {
//         addLog("💳 Insufficient credits. Please purchase more credits.");
//         toast.error("Insufficient credits");
//       }
//     } finally {
//       setLoading(false);
//     }
//   };

//   const stopAutomation = () => {
//     if (eventSourceRef.current) {
//       eventSourceRef.current.close();
//       eventSourceRef.current = null;
//     }
//     setIsRunning(false);
//     addLog("⚠️ Automation stopped by user");
//     setMessage("⚠️ Automation stopped by user");
//     toast.warning("Automation stopped");
//   };

//   const goBack = () => {
//     if (stage === "jobs") {
//       setStage("form");
//       setJobs([]);
//       setSelectedJobIds(new Set());
//     } else if (stage === "automation" && !isRunning) {
//       setStage("jobs");
//     }
//   };

//   const closeModal = () => {
//     if (isRunning) {
//       // Confirm before closing if automation is running
//       const shouldClose = window.confirm(
//         "Automation is still running. Closing this modal won't stop the automation. Continue?"
//       );
//       if (shouldClose) {
//         toast.info("Automation continues in background. Check dashboard for updates.");
//         setOpen(false);
//       }
//     } else {
//       setOpen(false);
//     }
//   };

//   return (
//     <Dialog open={open} onOpenChange={setOpen}>
//       <DialogTrigger asChild>
//         <Button
//           className="bg-gradient-to-r from-[#7C3AED] to-[#6366F1] text-white rounded-xl shadow-lg hover:opacity-90 transition-all"
//           onClick={() => setOpen(true)}
//         >
//           <Sparkles className="mr-2 h-4 w-4" /> Automate Job Apply
//         </Button>
//       </DialogTrigger>

//       <DialogContent className="p-6 rounded-2xl max-w-4xl bg-white text-gray-800 shadow-2xl max-h-[90vh] overflow-y-auto">
//         <div className="flex items-center justify-between mb-4">
//           <DialogTitle className="text-2xl font-bold bg-gradient-to-r from-[#7C3AED] to-[#6366F1] bg-clip-text text-transparent">
//             {stage === "form" && "AI Job Automation"}
//             {stage === "jobs" && `Found ${jobs.length} Matching Jobs`}
//             {stage === "automation" && (isCompleted ? "Automation Complete! 🎉" : "Automation in Progress")}
//           </DialogTitle>
//           <div className="flex gap-2">
//             {stage !== "form" && !isRunning && (
//               <Button
//                 variant="ghost"
//                 size="sm"
//                 onClick={goBack}
//                 className="text-gray-500 hover:text-gray-700"
//               >
//                 ← Back
//               </Button>
//             )}
//             {/* <Button
//               variant="ghost"
//               size="sm"
//               onClick={closeModal}
//               className="text-gray-500 hover:text-gray-700"
//             >
//               <X className="h-5 w-5" />
//             </Button> */}
//           </div>
//         </div>

//         <DialogDescription className="text-gray-500 text-sm mb-4">
//           {stage === "form" && "Set your preferences to find matching jobs"}
//           {stage === "jobs" && "Select the jobs you want to apply to (all selected by default)"}
//           {stage === "automation" && !isCompleted && "AI is applying to selected jobs - you can close this modal safely"}
//           {stage === "automation" && isCompleted && "View your automation results below"}
//         </DialogDescription>

//         {/* STAGE 1: FORM */}
//         {stage === "form" && (
//           <div className="space-y-4">
//             <div>
//               <label className="block text-sm font-medium text-gray-700 mb-1">
//                 Job Role *
//               </label>
//               <Input
//                 placeholder="e.g. Frontend Developer, Data Scientist"
//                 value={role}
//                 onChange={(e) => setRole(e.target.value)}
//                 disabled={loadingJobs}
//               />
//               <p className="text-xs text-gray-500 mt-1">
//                 We'll use your CV title if you leave this blank
//               </p>
//             </div>

//             <div>
//               <label className="block text-sm font-medium text-gray-700 mb-1">
//                 Country/Region *
//               </label>
//               <select
//                 value={country}
//                 onChange={(e) => setCountry(e.target.value)}
//                 disabled={loadingJobs}
//                 className="border border-gray-300 rounded-md p-2 w-full focus:ring-[#7C3AED] focus:border-[#7C3AED]"
//               >
//                 <option value="">🌎 Select Country</option>
//                 {COUNTRIES.map((c) => (
//                   <option key={c} value={c}>
//                     {c}
//                   </option>
//                 ))}
//               </select>
//             </div>

//             <div className="grid grid-cols-2 gap-4">
//               <div>
//                 <label className="block text-sm font-medium text-gray-700 mb-1">
//                   Max Jobs (Limit: 50)
//                 </label>
//                 <Input
//                   type="number"
//                   placeholder="e.g. 50"
//                   value={maxJobs}
//                   onChange={(e) => {
//                     const value = parseInt(e.target.value) || 0;
//                     setMaxJobs(Math.min(value, 50).toString());
//                   }}
//                   disabled={loadingJobs}
//                   min="1"
//                   max="50"
//                 />
//                 <p className="text-xs text-gray-500 mt-1">
//                   Maximum 50 jobs per automation run
//                 </p>
//               </div>
//               <div>
//                 <label className="block text-sm font-medium text-gray-700 mb-1">
//                   Min Match Score
//                 </label>
//                 <select
//                   value={minMatch}
//                   onChange={(e) => setMinMatch(e.target.value)}
//                   disabled={loadingJobs}
//                   className="border border-gray-300 rounded-md p-2 w-full focus:ring-[#7C3AED] focus:border-[#7C3AED]"
//                 >
//                   <option value="10">10% - Show all jobs</option>
//                   <option value="20">20% - Low match</option>
//                   <option value="30">30% - Fair match</option>
//                   <option value="40">40% - Good match</option>
//                   <option value="50">50% - Great match</option>
//                   <option value="60">60% - Excellent match</option>
//                   <option value="70">70% - Outstanding match</option>
//                 </select>
//                 <p className="text-xs text-gray-500 mt-1">
//                   Only show jobs with this match score or higher
//                 </p>
//               </div>
//             </div>

//             {error && (
//               <div className="flex items-start gap-2 p-3 bg-red-50 border border-red-200 rounded-lg">
//                 <AlertCircle className="h-5 w-5 text-red-600 mt-0.5" />
//                 <p className="text-sm text-red-700">{error}</p>
//               </div>
//             )}

//             <Button
//               onClick={fetchJobs}
//               disabled={loadingJobs || !role || !country}
//               className="w-full bg-gradient-to-r from-[#7C3AED] to-[#6366F1] text-white hover:opacity-90 transition-all"
//             >
//               {loadingJobs ? (
//                 <>
//                   <Loader2 className="animate-spin mr-2" /> Searching...
//                 </>
//               ) : (
//                 <>
//                   <Search className="mr-2 h-4 w-4" /> Find Matching Jobs
//                 </>
//               )}
//             </Button>
//           </div>
//         )}

//         {/* STAGE 2: JOB SELECTION */}
//         {stage === "jobs" && (
//           <div className="space-y-4">
//             {/* Selection Controls */}
//             <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
//               <div className="text-sm">
//                 <span className={`font-semibold ${selectedJobIds.size > 50 ? 'text-red-600' : ''}`}>
//                   {selectedJobIds.size}
//                 </span> of{" "}
//                 <span className="font-semibold">{jobs.length}</span> jobs selected
//                 {selectedJobIds.size > 50 && (
//                   <div className="text-xs text-red-600 mt-1">
//                     ⚠️ Maximum 50 jobs allowed. Please deselect {selectedJobIds.size - 50} jobs.
//                   </div>
//                 )}
//               </div>
//               <div className="flex gap-2">
//                 <Button
//                   variant="outline"
//                   size="sm"
//                   onClick={selectAll}
//                   disabled={selectedJobIds.size === jobs.length}
//                 >
//                   Select All
//                 </Button>
//                 <Button
//                   variant="outline"
//                   size="sm"
//                   onClick={deselectAll}
//                   disabled={selectedJobIds.size === 0}
//                 >
//                   Deselect All
//                 </Button>
//               </div>
//             </div>

//             {/* Job List */}
//             <div className="max-h-96 overflow-y-auto space-y-3">
//               {jobs.map((job) => {
//                 const isSelected = selectedJobIds.has(job.id);
//                 return (
//                   <div
//                     key={job.id}
//                     className={`border rounded-lg p-4 cursor-pointer transition-all ${
//                       isSelected
//                         ? "border-[#7C3AED] bg-purple-50"
//                         : "border-gray-200 hover:border-gray-300"
//                     }`}
//                     onClick={() => toggleJobSelection(job.id)}
//                   >
//                     <div className="flex items-start gap-3">
//                       <Checkbox
//                         checked={isSelected}
//                         onCheckedChange={() => toggleJobSelection(job.id)}
//                         className="mt-1"
//                       />
//                       <div className="flex-1">
//                         <div className="flex items-start justify-between">
//                           <div>
//                             <h4 className="font-semibold text-gray-900 flex items-center gap-2">
//                               {job.title}
//                               <a
//                                 href={job.url}
//                                 target="_blank"
//                                 rel="noopener noreferrer"
//                                 onClick={(e) => e.stopPropagation()}
//                                 className="text-[#7C3AED] hover:text-[#6366F1]"
//                               >
//                                 <ExternalLink className="h-4 w-4" />
//                               </a>
//                             </h4>
//                             <div className="flex items-center gap-3 mt-1 text-sm text-gray-600">
//                               <span className="flex items-center gap-1">
//                                 <Briefcase className="h-3 w-3" />
//                                 {job.company}
//                               </span>
//                               {job.location && (
//                                 <span className="flex items-center gap-1">
//                                   <MapPin className="h-3 w-3" />
//                                   {job.location}
//                                 </span>
//                               )}
//                             </div>
//                           </div>
//                           <div className="flex items-center gap-1 text-sm font-semibold text-[#7C3AED]">
//                             <TrendingUp className="h-4 w-4" />
//                             {job.score}%
//                           </div>
//                         </div>
//                         {job.snippet && (
//                           <p className="text-xs text-gray-500 mt-2 line-clamp-2">
//                             {job.snippet}
//                           </p>
//                         )}
//                       </div>
//                     </div>
//                   </div>
//                 );
//               })}
//             </div>

//             {/* Action Button */}
//             <Button
//               onClick={startAutomation}
//               disabled={selectedJobIds.size === 0 || selectedJobIds.size > 50 || loading}
//               className="w-full bg-gradient-to-r from-[#7C3AED] to-[#6366F1] text-white hover:opacity-90 transition-all disabled:opacity-50"
//             >
//               {loading ? (
//                 <>
//                   <Loader2 className="animate-spin mr-2" /> Starting...
//                 </>
//               ) : selectedJobIds.size > 50 ? (
//                 <>
//                   ⚠️ Too Many Jobs Selected (Max: 50)
//                 </>
//               ) : (
//                 <>
//                   <Sparkles className="mr-2 h-4 w-4" /> Apply to {selectedJobIds.size} Selected Jobs
//                 </>
//               )}
//             </Button>
//           </div>
//         )}

//         {/* STAGE 3: AUTOMATION */}
//         {stage === "automation" && (
//           <div className="space-y-4">
//             {/* Completion Stats Card */}
//             {isCompleted && completionStats && (
//               <div className="bg-gradient-to-r from-green-50 to-emerald-50 border-2 border-green-200 rounded-xl p-6 mb-4">
//                 <div className="flex items-center gap-3 mb-4">
//                   <div className="w-12 h-12 bg-green-500 rounded-full flex items-center justify-center">
//                     <PartyPopper className="h-6 w-6 text-white" />
//                   </div>
//                   <div>
//                     <h3 className="text-xl font-bold text-gray-900">Automation Complete!</h3>
//                     <p className="text-sm text-gray-600">All selected jobs have been processed</p>
//                   </div>
//                 </div>

//                 <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
//                   <div className="bg-white rounded-lg p-4 text-center">
//                     <Target className="h-5 w-5 text-blue-600 mx-auto mb-2" />
//                     <div className="text-2xl font-bold text-gray-900">{completionStats.total_applied}</div>
//                     <div className="text-xs text-gray-600">Total Jobs</div>
//                   </div>

//                   <div className="bg-white rounded-lg p-4 text-center">
//                     <CheckCircle2 className="h-5 w-5 text-green-600 mx-auto mb-2" />
//                     <div className="text-2xl font-bold text-green-600">{completionStats.successful}</div>
//                     <div className="text-xs text-gray-600">Successful</div>
//                   </div>

//                   <div className="bg-white rounded-lg p-4 text-center">
//                     <AlertCircle className="h-5 w-5 text-red-600 mx-auto mb-2" />
//                     <div className="text-2xl font-bold text-red-600">{completionStats.failed}</div>
//                     <div className="text-xs text-gray-600">Failed</div>
//                   </div>

//                   <div className="bg-white rounded-lg p-4 text-center">
//                     <Award className="h-5 w-5 text-purple-600 mx-auto mb-2" />
//                     <div className="text-2xl font-bold text-purple-600">{completionStats.success_rate}%</div>
//                     <div className="text-xs text-gray-600">Success Rate</div>
//                   </div>
//                 </div>

//                 <div className="mt-4 flex items-center justify-center gap-2 text-sm text-gray-600">
//                   <Clock className="h-4 w-4" />
//                   <span>Completed in {Math.floor(completionStats.duration / 60)}m {completionStats.duration % 60}s</span>
//                 </div>
//               </div>
//             )}

//             {/* Background Processing Notice */}
//             {isRunning && !isCompleted && (
//               <div className="bg-blue-50 border-2 border-blue-200 rounded-xl p-4 mb-4">
//                 <div className="flex items-start gap-3">
//                   <Info className="h-5 w-5 text-blue-600 mt-0.5 flex-shrink-0" />
//                   <div className="flex-1">
//                     <h4 className="font-semibold text-blue-900 mb-1">Automation Running in Background</h4>
//                     <p className="text-sm text-blue-800 mb-3">
//                       You can safely close this modal. The automation will continue processing, and you'll receive a notification when it's complete.
//                     </p>
//                     <div className="flex items-center gap-2 text-xs text-blue-700">
//                       <CheckCircle2 className="h-4 w-4" />
//                       <span>Check your dashboard for real-time progress updates</span>
//                     </div>
//                   </div>
//                 </div>
//               </div>
//             )}

//             {/* Run Info */}
//             {runId && (
//               <div className="bg-gray-50 p-3 rounded-lg text-xs space-y-1">
//                 <p className="text-gray-600">
//                   <span className="font-semibold">Run ID:</span>{" "}
//                   <span className="font-mono">{runId}</span>
//                 </p>
//                 {actorRunId && (
//                   <p className="text-gray-600">
//                     <span className="font-semibold">Actor ID:</span>{" "}
//                     <span className="font-mono">{actorRunId}</span>
//                   </p>
//                 )}
//               </div>
//             )}

//             {/* Status Messages */}
//             {error && (
//               <div className="flex items-start gap-2 p-3 bg-red-50 border border-red-200 rounded-lg">
//                 <AlertCircle className="h-5 w-5 text-red-600 mt-0.5" />
//                 <p className="text-sm text-red-700">{error}</p>
//               </div>
//             )}

//             {message && !error && !isCompleted && (
//               <div className="flex items-start gap-2 p-3 bg-green-50 border border-green-200 rounded-lg">
//                 <CheckCircle2 className="h-5 w-5 text-green-600 mt-0.5" />
//                 <p className="text-sm text-green-700">{message}</p>
//               </div>
//             )}

//             {/* Proof Gallery */}
//             {proofs.length > 0 && (
//               <div>
//                 <p className="text-sm font-semibold mb-2 text-gray-700">
//                   Application Proofs ({proofs.length})
//                 </p>
//                 <div className="grid grid-cols-3 gap-2 max-h-48 overflow-y-auto">
//                   {proofs.map((url, i) => (
//                     <a
//                       key={i}
//                       href={url}
//                       target="_blank"
//                       rel="noreferrer"
//                       className="relative group"
//                     >
//                       <img
//                         src={url}
//                         alt={`Proof ${i + 1}`}
//                         className="w-full h-24 object-cover rounded-md border border-gray-200 group-hover:border-[#7C3AED] transition-all"
//                       />
//                       <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 rounded-md transition-all flex items-center justify-center">
//                         <span className="text-white text-xs opacity-0 group-hover:opacity-100">
//                           View
//                         </span>
//                       </div>
//                     </a>
//                   ))}
//                 </div>
//               </div>
//             )}

//             {/* Logs */}
//             <div>
//               <p className="text-sm font-semibold mb-2 text-gray-700">
//                 Automation Logs {isRunning && <span className="text-green-500 animate-pulse">● Live</span>}
//               </p>
//               <div
//                 ref={logBoxRef}
//                 className="bg-gray-900 text-green-400 font-mono text-xs rounded-xl border border-gray-700 p-4 max-h-64 overflow-y-auto shadow-inner"
//               >
//                 {logs.length === 0 ? (
//                   <p className="text-gray-500 text-center">
//                     {isRunning ? "Waiting for logs..." : "No logs yet."}
//                   </p>
//                 ) : (
//                   logs.map((line, idx) => (
//                     <div key={idx} className="whitespace-pre-wrap mb-1 leading-relaxed">
//                       {line}
//                     </div>
//                   ))
//                 )}
//               </div>
//             </div>

//             {/* Action Buttons */}
//             <div className="flex gap-3">
//               {isRunning && !isCompleted && (
//                 <Button
//                   onClick={stopAutomation}
//                   variant="outline"
//                   className="flex-1 border-red-500 text-red-600 hover:bg-red-50"
//                 >
//                   Stop Automation
//                 </Button>
//               )}
//               <Button
//                 variant="outline"
//                 className="flex-1 border-gray-300 hover:bg-gray-100 text-gray-700"
//                 onClick={closeModal}
//               >
//                 {isRunning && !isCompleted ? "Minimize (Running in Background)" : "Close"}
//               </Button>
//               {isCompleted && (
//                 <Button
//                   className="flex-1 bg-gradient-to-r from-[#7C3AED] to-[#6366F1] text-white hover:opacity-90"
//                   onClick={() => {
//                     window.location.href = "/applications";
//                   }}
//                 >
//                   View Applications
//                 </Button>
//               )}
//             </div>
//           </div>
//         )}
//       </DialogContent>
//     </Dialog>
//   );
// }
// // src/components/AutomateModal.tsx
// "use client";

// import { useEffect, useRef, useState } from "react";
// import {
//   Loader2, Search, Sparkles, X, CheckCircle2, AlertCircle,
//   Briefcase, MapPin, TrendingUp, ExternalLink, Check, PartyPopper,
//   Clock, Target, Award, Info
// } from "lucide-react";
// import { Button } from "@/components/ui/button";
// import { Input } from "@/components/ui/input";
// import { Checkbox } from "@/components/ui/checkbox";
// import {
//   Dialog,
//   DialogTrigger,
//   DialogContent,
//   DialogTitle,
//   DialogDescription,
// } from "@/components/ui/dialog";
// import { toast } from "sonner";
// import api from "@/lib/api";

// const COUNTRIES = [
//   "Argentina", "Australia", "Austria", "Bangladesh", "Belgium", "Brazil", "Canada",
//   "Chile", "China", "Colombia", "Czech Republic", "Denmark", "Egypt", "Finland",
//   "France", "Germany", "Greece", "Hong Kong", "Hungary", "India", "Indonesia",
//   "Ireland", "Israel", "Italy", "Japan", "Kenya", "Kuwait", "Malaysia", "Mexico",
//   "Morocco", "Netherlands", "New Zealand", "Nigeria", "Norway", "Pakistan",
//   "Philippines", "Poland", "Portugal", "Qatar", "Romania", "Russia", "Saudi Arabia",
//   "Serbia", "Singapore", "Slovakia", "South Africa", "Spain", "Sri Lanka", "Sweden",
//   "Switzerland", "Taiwan", "Thailand", "Turkey", "Ukraine", "United Arab Emirates",
//   "United Kingdom", "United States", "Uruguay", "Vietnam", "Zimbabwe", "Remote",
// ];

// type SSEMessage =
//   | { type: "info"; msg: string; ts: string }
//   | { type: "proof"; msg: string; url: string; ts: string }
//   | { type: "done"; msg: string; ts: string }
//   | { type: "completion"; msg: string; run_id: string; total_applied: number; successful: number; failed: number; success_rate: number; duration: number; ts: string }
//   | { type: "error"; msg: string; ts: string };

// interface Job {
//   id: string;
//   title: string;
//   company: string;
//   location?: string;
//   url: string;
//   snippet?: string;
//   score: number;
//   source?: string;
// }

// interface AutomationStats {
//   total_applied: number;
//   successful: number;
//   failed: number;
//   success_rate: number;
//   duration: number;
// }

// interface AutomateModalProps {
//   cvId: string;
//   token: string;
//   onAutomationDone?: (finalLogs: string[], stats?: AutomationStats) => void;
// }

// export default function AutomateModal({
//   cvId,
//   token,
//   onAutomationDone,
// }: AutomateModalProps) {
//   // Modal state
//   const [open, setOpen] = useState(false);

//   // Form inputs
//   const [role, setRole] = useState("");
//   const [country, setCountry] = useState("");
//   // Find this line in your AutomateModal.tsx (around line 50-55)
// // Change from:

// // To:
//   const [minMatch, setMinMatch] = useState("10");

// // This sets the default minimum match score to 10%

//   // Workflow stages
//   const [stage, setStage] = useState<"form" | "jobs" | "automation">("form");

//   // Jobs state
//   const [jobs, setJobs] = useState<Job[]>([]);
//   const [selectedJobIds, setSelectedJobIds] = useState<Set<string>>(new Set());
//   const [loadingJobs, setLoadingJobs] = useState(false);

//   // Automation state
//   const [logs, setLogs] = useState<string[]>([]);
//   const [proofs, setProofs] = useState<string[]>([]);
//   const [loading, setLoading] = useState(false);
//   const [isRunning, setIsRunning] = useState(false);
//   const [isCompleted, setIsCompleted] = useState(false);
//   const [completionStats, setCompletionStats] = useState<AutomationStats | null>(null);
//   const [message, setMessage] = useState("");
//   const [error, setError] = useState("");
//   const [runId, setRunId] = useState<string>("");
//   const [actorRunId, setActorRunId] = useState<string>("");

//   const logBoxRef = useRef<HTMLDivElement | null>(null);
//   const eventSourceRef = useRef<EventSource | null>(null);

//   const API_BASE =
//     import.meta.env.VITE_API_URL?.replace(/\/+$/, "") || "http://127.0.0.1:8000";

//   // Helper to add timestamped log
//   const addLog = (message: string) => {
//     const timestamp = new Date().toLocaleTimeString();
//     setLogs((prev) => [...prev, `[${timestamp}] ${message}`]);
//   };

//   // Auto-scroll logs
//   useEffect(() => {
//     if (!logBoxRef.current) return;
//     logBoxRef.current.scrollTop = logBoxRef.current.scrollHeight;
//   }, [logs]);

//   // SSE Connection - Only when automation is running
//   // Enhanced SSE Connection - FIXED VERSION
// useEffect(() => {
//   if (!isRunning) {
//     if (eventSourceRef.current) {
//       eventSourceRef.current.close();
//       eventSourceRef.current = null;
//     }
//     return;
//   }

//   addLog("📡 Connecting to automation stream...");

//   // Add token to SSE connection
//   const sseUrl = new URL(`${API_BASE}/v1/automate-job-apply/stream`);
//   const token = localStorage.getItem("access_token");
//   if (token) sseUrl.searchParams.set("access_token", token);

//   const evt = new EventSource(sseUrl.toString());

//   eventSourceRef.current = evt;

//   evt.onopen = () => {
//     addLog("✅ Connected to live automation feed");
//   };

//   evt.onmessage = (event) => {
//     try {
//       const data: SSEMessage = JSON.parse(event.data);

//       console.log("📨 Received SSE event:", data.type, data);

//       if (data.type === "proof" && data.url) {
//         setProofs((p) => [...p, data.url]);
//         addLog(`📸 ${data.msg}`);
//       }
//       else if (data.type === "completion") {
//         // 🎉 Handle comprehensive completion
//         const stats: AutomationStats = {
//           total_applied: data.total_applied,
//           successful: data.successful,
//           failed: data.failed,
//           success_rate: data.success_rate,
//           duration: data.duration
//         };

//         console.log("🎯 Completion stats received:", stats);

//         setCompletionStats(stats);
//         setIsCompleted(true);
//         setIsRunning(false);

//         // Enhanced completion logs
//         addLog(`\n${"=".repeat(60)}`);
//         addLog(`🎉 AUTOMATION COMPLETED SUCCESSFULLY!`);
//         addLog(`${"=".repeat(60)}`);
//         addLog(`📊 Results Summary:`);
//         addLog(`   ✅ Successfully Applied: ${stats.successful} jobs`);
//         addLog(`   ❌ Failed Applications: ${stats.failed} jobs`);
//         addLog(`   📈 Success Rate: ${stats.success_rate}%`);
//         addLog(`   ⏱️  Total Duration: ${Math.floor(stats.duration / 60)}m ${stats.duration % 60}s`);
//         addLog(`${"=".repeat(60)}\n`);
//         addLog(`💡 Tip: Check your dashboard for detailed application history`);

//         setMessage("✅ Automation completed successfully!");

//         // Callback with stats
//         if (onAutomationDone) {
//           onAutomationDone([...logs], stats);
//         }

//         // Save to localStorage
//         localStorage.setItem("last_automation_stats", JSON.stringify(stats));
//         localStorage.setItem("automation_logs", JSON.stringify(logs));

//         // 🔔 Show success toast notification
//         toast.success(`🎉 Applied to ${stats.successful} jobs successfully!`, {
//           description: `Success rate: ${stats.success_rate}% | Duration: ${Math.floor(stats.duration / 60)}m ${stats.duration % 60}s`,
//           duration: 5000,
//         });

//         // 🔄 Refresh dashboard data
//         setTimeout(() => {
//           window.dispatchEvent(new Event('automation-completed'));
//         }, 1000);
//       }
//       else if (data.type === "done") {
//         // Fallback for old completion format
//         addLog(`✅ ${data.msg}`);
//         setIsCompleted(true);
//         setIsRunning(false);
//         toast.success("🎉 Automation finished!");
//       }
//       else if (data.type === "error") {
//         addLog(`❌ ${data.msg}`);
//         setIsRunning(false);
//         setError(data.msg);
//         toast.error(`Error: ${data.msg}`);
//       }
//       else if (data.msg) {
//         addLog(data.msg);
//       }
//     } catch (e) {
//       console.error("Failed to parse SSE message:", e);
//     }
//   };

//   evt.onerror = (error) => {
//     console.error("❌ SSE Connection error:", error);
//     addLog("⚠️ Connection to stream closed");

//     // Only close if automation is truly done
//     if (!isCompleted) {
//       addLog("🔄 Attempting to reconnect...");
//       // Attempt reconnection after 3 seconds
//       setTimeout(() => {
//         if (isRunning) {
//           addLog("♻️ Reconnecting to stream...");
//         }
//       }, 3000);
//     }
//   };

//   return () => {
//     console.log("🔌 Cleaning up SSE connection");
//     evt.close();
//     eventSourceRef.current = null;
//   };
// }, [isRunning, API_BASE, isCompleted]);

//   // Reset state when modal closes
//   useEffect(() => {
//     if (!open) {
//       setStage("form");
//       setJobs([]);
//       setSelectedJobIds(new Set());
//       setLogs([]);
//       setProofs([]);
//       setError("");
//       setMessage("");
//       setRunId("");
//       setActorRunId("");
//       setIsRunning(false);
//       setIsCompleted(false);
//       setCompletionStats(null);
//     }
//   }, [open]);

//   // Step 1: Fetch and display jobs
//   const fetchJobs = async () => {
//     setLoadingJobs(true);
//     setError("");
//     setMessage("");

//     if (!cvId) {
//       setError("Please upload a CV first!");
//       setLoadingJobs(false);
//       return;
//     }

//     if (!role || !country) {
//       setError("Please fill in both Role and Country.");
//       setLoadingJobs(false);
//       return;
//     }

//     try {
//       toast.info("🔍 Searching for matching jobs...");

//       // Call backend to fetch and score jobs
//       const response = await api.post("/v1/jobs/fetch-and-score", {
//         cv_id: cvId,
//         role: role,
//         country: country,
//         min_match_score: Number(minMatch),
//         max_jobs: Number(maxJobs),
//       });

//       if (response.data?.ok) {
//         const fetchedJobs = response.data.jobs || [];

//         if (fetchedJobs.length === 0) {
//           setError(`No jobs found matching "${role}" in ${country} with ≥${minMatch}% match score.`);
//           setLoadingJobs(false);
//           return;
//         }

//         setJobs(fetchedJobs);

//         // Select all jobs by default
//         const allIds = new Set(fetchedJobs.map((j: Job) => j.id));
//         setSelectedJobIds(allIds);

//         setStage("jobs");

//         toast.success(`✅ Found ${fetchedJobs.length} matching jobs!`);
//       } else {
//         setError("Failed to fetch jobs. Please try again.");
//       }
//     } catch (err: any) {
//       console.error(err);
//       const errorMsg =
//         err?.response?.data?.detail || err.message || "Failed to fetch jobs";
//       setError(errorMsg);

//       if (err?.response?.status === 402) {
//         toast.error("💳 Insufficient credits. Please purchase more credits.");
//       }
//     } finally {
//       setLoadingJobs(false);
//     }
//   };

//   // Toggle job selection
//   const toggleJobSelection = (jobId: string) => {
//     setSelectedJobIds((prev) => {
//       const newSet = new Set(prev);
//       if (newSet.has(jobId)) {
//         newSet.delete(jobId);
//       } else {
//         newSet.add(jobId);
//       }
//       return newSet;
//     });
//   };

//   // Select/Deselect all
//   const selectAll = () => {
//     const allIds = new Set(jobs.map((j) => j.id));
//     setSelectedJobIds(allIds);
//   };

//   const deselectAll = () => {
//     setSelectedJobIds(new Set());
//   };

//   // Step 2: Start automation with selected jobs
//   const startAutomation = async () => {
//     if (selectedJobIds.size === 0) {
//       toast.error("Please select at least one job to apply.");
//       return;
//     }

//     setLoading(true);
//     setError("");
//     setMessage("");
//     setLogs([]);
//     setProofs([]);
//     setRunId("");
//     setActorRunId("");
//     setIsRunning(true);
//     setIsCompleted(false);
//     setCompletionStats(null);
//     setStage("automation");

//     try {
//       // Filter selected jobs
//       const selectedJobs = jobs.filter((j) => selectedJobIds.has(j.id));

//       addLog("🚀 Starting job automation...");
//       addLog(`🎯 Applying to ${selectedJobs.length} selected jobs`);
//       addLog(`📊 Average match score: ${(selectedJobs.reduce((acc, j) => acc + j.score, 0) / selectedJobs.length).toFixed(1)}%`);
//       addLog("💳 Checking credits...");

//       // Trigger automation with selected jobs
//       addLog("🔄 Initiating automation request...");
//       const triggerRes = await api.post("/v1/automate-job-apply", {
//         cv_id: cvId,
//         role,
//         country,
//         min_match_score: Number(minMatch),
//         max_jobs: selectedJobs.length,
//         selected_jobs: selectedJobs,
//       });

//       if (triggerRes.data?.ok) {
//         setRunId(triggerRes.data.run_id || "");
//         setActorRunId(triggerRes.data.actor_run_id || "");

//         addLog("✅ Automation started successfully!");
//         addLog(`📝 Run ID: ${triggerRes.data.run_id}`);
//         addLog(`🤖 Actor ID: ${triggerRes.data.actor_run_id}`);

//         if (triggerRes.data.credits_used) {
//           addLog(`💳 Credits used: ${triggerRes.data.credits_used}`);
//         }

//         addLog(`📋 Processing ${selectedJobs.length} jobs`);
//         addLog("🔍 AI is now discovering companies and sending applications...");
//         addLog("\n" + "=".repeat(60));
//         addLog("ℹ️  IMPORTANT: You can close this modal safely!");
//         addLog("   • Automation continues running in the background");
//         addLog("   • You'll receive a notification when complete");
//         addLog("   • Check dashboard for real-time progress");
//         addLog("   • Reopen this modal anytime to view logs");
//         addLog("=".repeat(60) + "\n");

//         setMessage("✅ Automation running in background. You can close this modal safely.");

//         // Show notification with option to minimize
//         toast.success("🚀 Automation started successfully!", {
//           description: "Running in background. You'll be notified when complete.",
//           duration: 4000,
//         });
//       } else {
//         setError("Failed to start automation");
//         setIsRunning(false);
//         addLog("❌ Failed to start automation");
//       }
//     } catch (err: any) {
//       console.error(err);
//       const errorMsg =
//         err?.response?.data?.detail || err.message || "Unexpected error";
//       setError(errorMsg);
//       setIsRunning(false);
//       addLog(`❌ Error: ${errorMsg}`);

//       if (err?.response?.status === 402) {
//         addLog("💳 Insufficient credits. Please purchase more credits.");
//         toast.error("Insufficient credits");
//       }
//     } finally {
//       setLoading(false);
//     }
//   };

//   const stopAutomation = () => {
//     if (eventSourceRef.current) {
//       eventSourceRef.current.close();
//       eventSourceRef.current = null;
//     }
//     setIsRunning(false);
//     addLog("⚠️ Automation stopped by user");
//     setMessage("⚠️ Automation stopped by user");
//     toast.warning("Automation stopped");
//   };

//   const goBack = () => {
//     if (stage === "jobs") {
//       setStage("form");
//       setJobs([]);
//       setSelectedJobIds(new Set());
//     } else if (stage === "automation" && !isRunning) {
//       setStage("jobs");
//     }
//   };

//   const closeModal = () => {
//     if (isRunning) {
//       // Confirm before closing if automation is running
//       const shouldClose = window.confirm(
//         "Automation is still running. Closing this modal won't stop the automation. Continue?"
//       );
//       if (shouldClose) {
//         toast.info("Automation continues in background. Check dashboard for updates.");
//         setOpen(false);
//       }
//     } else {
//       setOpen(false);
//     }
//   };

//   return (
//     <Dialog open={open} onOpenChange={setOpen}>
//       <DialogTrigger asChild>
//         <Button
//           className="bg-gradient-to-r from-[#7C3AED] to-[#6366F1] text-white rounded-xl shadow-lg hover:opacity-90 transition-all"
//           onClick={() => setOpen(true)}
//         >
//           <Sparkles className="mr-2 h-4 w-4" /> Automate Job Apply
//         </Button>
//       </DialogTrigger>

//       <DialogContent className="p-6 rounded-2xl max-w-4xl bg-white text-gray-800 shadow-2xl max-h-[90vh] overflow-y-auto">
//         <div className="flex items-center justify-between mb-4">
//           <DialogTitle className="text-2xl font-bold bg-gradient-to-r from-[#7C3AED] to-[#6366F1] bg-clip-text text-transparent">
//             {stage === "form" && "AI Job Automation"}
//             {stage === "jobs" && `Found ${jobs.length} Matching Jobs`}
//             {stage === "automation" && (isCompleted ? "Automation Complete! 🎉" : "Automation in Progress")}
//           </DialogTitle>
//           <div className="flex gap-2">
//             {stage !== "form" && !isRunning && (
//               <Button
//                 variant="ghost"
//                 size="sm"
//                 onClick={goBack}
//                 className="text-gray-500 hover:text-gray-700"
//               >
//                 ← Back
//               </Button>
//             )}
//             <Button
//               variant="ghost"
//               size="sm"
//               onClick={closeModal}
//               className="text-gray-500 hover:text-gray-700"
//             >
//               <X className="h-5 w-5" />
//             </Button>
//           </div>
//         </div>

//         <DialogDescription className="text-gray-500 text-sm mb-4">
//           {stage === "form" && "Set your preferences to find matching jobs"}
//           {stage === "jobs" && "Select the jobs you want to apply to (all selected by default)"}
//           {stage === "automation" && !isCompleted && "AI is applying to selected jobs - you can close this modal safely"}
//           {stage === "automation" && isCompleted && "View your automation results below"}
//         </DialogDescription>

//         {/* STAGE 1: FORM */}
//         {stage === "form" && (
//           <div className="space-y-4">
//             <div>
//               <label className="block text-sm font-medium text-gray-700 mb-1">
//                 Job Role *
//               </label>
//               <Input
//                 placeholder="e.g. Frontend Developer, Data Scientist"
//                 value={role}
//                 onChange={(e) => setRole(e.target.value)}
//                 disabled={loadingJobs}
//               />
//               <p className="text-xs text-gray-500 mt-1">
//                 We'll use your CV title if you leave this blank
//               </p>
//             </div>

//             <div>
//               <label className="block text-sm font-medium text-gray-700 mb-1">
//                 Country/Region *
//               </label>
//               <select
//                 value={country}
//                 onChange={(e) => setCountry(e.target.value)}
//                 disabled={loadingJobs}
//                 className="border border-gray-300 rounded-md p-2 w-full focus:ring-[#7C3AED] focus:border-[#7C3AED]"
//               >
//                 <option value="">🌎 Select Country</option>
//                 {COUNTRIES.map((c) => (
//                   <option key={c} value={c}>
//                     {c}
//                   </option>
//                 ))}
//               </select>
//             </div>

//             <div className="grid grid-cols-2 gap-4">
//               <div>
//                 <label className="block text-sm font-medium text-gray-700 mb-1">
//                   Max Jobs (Limit: 50)
//                 </label>
//                 <Input
//                   type="number"
//                   placeholder="e.g. 50"
//                   value={maxJobs}
//                   onChange={(e) => {
//                     const value = parseInt(e.target.value) || 0;
//                     setMaxJobs(Math.min(value, 50).toString());
//                   }}
//                   disabled={loadingJobs}
//                   min="1"
//                   max="50"
//                 />
//                 <p className="text-xs text-gray-500 mt-1">
//                   Maximum 50 jobs per automation run
//                 </p>
//               </div>
//               <div>
//                 <label className="block text-sm font-medium text-gray-700 mb-1">
//                   Min Match Score
//                 </label>
//                 <select
//                   value={minMatch}
//                   onChange={(e) => setMinMatch(e.target.value)}
//                   disabled={loadingJobs}
//                   className="border border-gray-300 rounded-md p-2 w-full focus:ring-[#7C3AED] focus:border-[#7C3AED]"
//                 >
//                   <option value="10">10% - Show all jobs</option>
//                   <option value="20">20% - Low match</option>
//                   <option value="30">30% - Fair match</option>
//                   <option value="40">40% - Good match</option>
//                   <option value="50">50% - Great match</option>
//                   <option value="60">60% - Excellent match</option>
//                   <option value="70">70% - Outstanding match</option>
//                 </select>
//                 <p className="text-xs text-gray-500 mt-1">
//                   Only show jobs with this match score or higher
//                 </p>
//               </div>
//             </div>
//             {error && (
//               <div className="flex items-start gap-2 p-3 bg-red-50 border border-red-200 rounded-lg">
//                 <AlertCircle className="h-5 w-5 text-red-600 mt-0.5" />
//                 <p className="text-sm text-red-700">{error}</p>
//               </div>
//             )}

//             <Button
//               onClick={fetchJobs}
//               disabled={loadingJobs || !role || !country}
//               className="w-full bg-gradient-to-r from-[#7C3AED] to-[#6366F1] text-white hover:opacity-90 transition-all"
//             >
//               {loadingJobs ? (
//                 <>
//                   <Loader2 className="animate-spin mr-2" /> Searching...
//                 </>
//               ) : (
//                 <>
//                   <Search className="mr-2 h-4 w-4" /> Find Matching Jobs
//                 </>
//               )}
//             </Button>
//           </div>
//         )}

//         {/* STAGE 2: JOB SELECTION */}
//         {stage === "jobs" && (
//           <div className="space-y-4">
//             {/* Selection Controls */}
//             <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
//               <div className="text-sm">
//                 <span className="font-semibold">{selectedJobIds.size}</span> of{" "}
//                 <span className="font-semibold">{jobs.length}</span> jobs selected
//               </div>
//               <div className="flex gap-2">
//                 <Button
//                   variant="outline"
//                   size="sm"
//                   onClick={selectAll}
//                   disabled={selectedJobIds.size === jobs.length}
//                 >
//                   Select All
//                 </Button>
//                 <Button
//                   variant="outline"
//                   size="sm"
//                   onClick={deselectAll}
//                   disabled={selectedJobIds.size === 0}
//                 >
//                   Deselect All
//                 </Button>
//               </div>
//             </div>

//             {/* Job List */}
//             <div className="max-h-96 overflow-y-auto space-y-3">
//               {jobs.map((job) => {
//                 const isSelected = selectedJobIds.has(job.id);
//                 return (
//                   <div
//                     key={job.id}
//                     className={`border rounded-lg p-4 cursor-pointer transition-all ${
//                       isSelected
//                         ? "border-[#7C3AED] bg-purple-50"
//                         : "border-gray-200 hover:border-gray-300"
//                     }`}
//                     onClick={() => toggleJobSelection(job.id)}
//                   >
//                     <div className="flex items-start gap-3">
//                       <Checkbox
//                         checked={isSelected}
//                         onCheckedChange={() => toggleJobSelection(job.id)}
//                         className="mt-1"
//                       />
//                       <div className="flex-1">
//                         <div className="flex items-start justify-between">
//                           <div>
//                             <h4 className="font-semibold text-gray-900 flex items-center gap-2">
//                               {job.title}
//                               <a
//                                 href={job.url}
//                                 target="_blank"
//                                 rel="noopener noreferrer"
//                                 onClick={(e) => e.stopPropagation()}
//                                 className="text-[#7C3AED] hover:text-[#6366F1]"
//                               >
//                                 <ExternalLink className="h-4 w-4" />
//                               </a>
//                             </h4>
//                             <div className="flex items-center gap-3 mt-1 text-sm text-gray-600">
//                               <span className="flex items-center gap-1">
//                                 <Briefcase className="h-3 w-3" />
//                                 {job.company}
//                               </span>
//                               {job.location && (
//                                 <span className="flex items-center gap-1">
//                                   <MapPin className="h-3 w-3" />
//                                   {job.location}
//                                 </span>
//                               )}
//                             </div>
//                           </div>
//                           <div className="flex items-center gap-1 text-sm font-semibold text-[#7C3AED]">
//                             <TrendingUp className="h-4 w-4" />
//                             {job.score}%
//                           </div>
//                         </div>
//                         {job.snippet && (
//                           <p className="text-xs text-gray-500 mt-2 line-clamp-2">
//                             {job.snippet}
//                           </p>
//                         )}
//                       </div>
//                     </div>
//                   </div>
//                 );
//               })}
//             </div>

//             {/* Action Button */}
//             <Button
//               onClick={startAutomation}
//               disabled={selectedJobIds.size === 0 || loading}
//               className="w-full bg-gradient-to-r from-[#7C3AED] to-[#6366F1] text-white hover:opacity-90 transition-all"
//             >
//               {loading ? (
//                 <>
//                   <Loader2 className="animate-spin mr-2" /> Starting...
//                 </>
//               ) : (
//                 <>
//                   <Sparkles className="mr-2 h-4 w-4" /> Apply to {selectedJobIds.size} Selected Jobs
//                 </>
//               )}
//             </Button>
//           </div>
//         )}

//         {/* STAGE 3: AUTOMATION */}
//         {stage === "automation" && (
//           <div className="space-y-4">
//             {/* Completion Stats Card */}
//             {isCompleted && completionStats && (
//               <div className="bg-gradient-to-r from-green-50 to-emerald-50 border-2 border-green-200 rounded-xl p-6 mb-4">
//                 <div className="flex items-center gap-3 mb-4">
//                   <div className="w-12 h-12 bg-green-500 rounded-full flex items-center justify-center">
//                     <PartyPopper className="h-6 w-6 text-white" />
//                   </div>
//                   <div>
//                     <h3 className="text-xl font-bold text-gray-900">Automation Complete!</h3>
//                     <p className="text-sm text-gray-600">All selected jobs have been processed</p>
//                   </div>
//                 </div>

//                 <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
//                   <div className="bg-white rounded-lg p-4 text-center">
//                     <Target className="h-5 w-5 text-blue-600 mx-auto mb-2" />
//                     <div className="text-2xl font-bold text-gray-900">{completionStats.total_applied}</div>
//                     <div className="text-xs text-gray-600">Total Jobs</div>
//                   </div>

//                   <div className="bg-white rounded-lg p-4 text-center">
//                     <CheckCircle2 className="h-5 w-5 text-green-600 mx-auto mb-2" />
//                     <div className="text-2xl font-bold text-green-600">{completionStats.successful}</div>
//                     <div className="text-xs text-gray-600">Successful</div>
//                   </div>

//                   <div className="bg-white rounded-lg p-4 text-center">
//                     <AlertCircle className="h-5 w-5 text-red-600 mx-auto mb-2" />
//                     <div className="text-2xl font-bold text-red-600">{completionStats.failed}</div>
//                     <div className="text-xs text-gray-600">Failed</div>
//                   </div>

//                   <div className="bg-white rounded-lg p-4 text-center">
//                     <Award className="h-5 w-5 text-purple-600 mx-auto mb-2" />
//                     <div className="text-2xl font-bold text-purple-600">{completionStats.success_rate}%</div>
//                     <div className="text-xs text-gray-600">Success Rate</div>
//                   </div>
//                 </div>

//                 <div className="mt-4 flex items-center justify-center gap-2 text-sm text-gray-600">
//                   <Clock className="h-4 w-4" />
//                   <span>Completed in {Math.floor(completionStats.duration / 60)}m {completionStats.duration % 60}s</span>
//                 </div>
//               </div>
//             )}

//             {/* Background Processing Notice */}
//             {isRunning && !isCompleted && (
//               <div className="bg-blue-50 border-2 border-blue-200 rounded-xl p-4 mb-4">
//                 <div className="flex items-start gap-3">
//                   <Info className="h-5 w-5 text-blue-600 mt-0.5 flex-shrink-0" />
//                   <div className="flex-1">
//                     <h4 className="font-semibold text-blue-900 mb-1">Automation Running in Background</h4>
//                     <p className="text-sm text-blue-800 mb-3">
//                       You can safely close this modal. The automation will continue processing, and you'll receive a notification when it's complete.
//                     </p>
//                     <div className="flex items-center gap-2 text-xs text-blue-700">
//                       <CheckCircle2 className="h-4 w-4" />
//                       <span>Check your dashboard for real-time progress updates</span>
//                     </div>
//                   </div>
//                 </div>
//               </div>
//             )}

//             {/* Run Info */}
//             {runId && (
//               <div className="bg-gray-50 p-3 rounded-lg text-xs space-y-1">
//                 <p className="text-gray-600">
//                   <span className="font-semibold">Run ID:</span>{" "}
//                   <span className="font-mono">{runId}</span>
//                 </p>
//                 {actorRunId && (
//                   <p className="text-gray-600">
//                     <span className="font-semibold">Actor ID:</span>{" "}
//                     <span className="font-mono">{actorRunId}</span>
//                   </p>
//                 )}
//               </div>
//             )}

//             {/* Status Messages */}
//             {error && (
//               <div className="flex items-start gap-2 p-3 bg-red-50 border border-red-200 rounded-lg">
//                 <AlertCircle className="h-5 w-5 text-red-600 mt-0.5" />
//                 <p className="text-sm text-red-700">{error}</p>
//               </div>
//             )}

//             {message && !error && !isCompleted && (
//               <div className="flex items-start gap-2 p-3 bg-green-50 border border-green-200 rounded-lg">
//                 <CheckCircle2 className="h-5 w-5 text-green-600 mt-0.5" />
//                 <p className="text-sm text-green-700">{message}</p>
//               </div>
//             )}

//             {/* Proof Gallery */}
//             {proofs.length > 0 && (
//               <div>
//                 <p className="text-sm font-semibold mb-2 text-gray-700">
//                   Application Proofs ({proofs.length})
//                 </p>
//                 <div className="grid grid-cols-3 gap-2 max-h-48 overflow-y-auto">
//                   {proofs.map((url, i) => (
//                     <a
//                       key={i}
//                       href={url}
//                       target="_blank"
//                       rel="noreferrer"
//                       className="relative group"
//                     >
//                       <img
//                         src={url}
//                         alt={`Proof ${i + 1}`}
//                         className="w-full h-24 object-cover rounded-md border border-gray-200 group-hover:border-[#7C3AED] transition-all"
//                       />
//                       <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 rounded-md transition-all flex items-center justify-center">
//                         <span className="text-white text-xs opacity-0 group-hover:opacity-100">
//                           View
//                         </span>
//                       </div>
//                     </a>
//                   ))}
//                 </div>
//               </div>
//             )}

//             {/* Logs */}
//             <div>
//               <p className="text-sm font-semibold mb-2 text-gray-700">
//                 Automation Logs {isRunning && <span className="text-green-500 animate-pulse">● Live</span>}
//               </p>
//               <div
//                 ref={logBoxRef}
//                 className="bg-gray-900 text-green-400 font-mono text-xs rounded-xl border border-gray-700 p-4 max-h-64 overflow-y-auto shadow-inner"
//               >
//                 {logs.length === 0 ? (
//                   <p className="text-gray-500 text-center">
//                     {isRunning ? "Waiting for logs..." : "No logs yet."}
//                   </p>
//                 ) : (
//                   logs.map((line, idx) => (
//                     <div key={idx} className="whitespace-pre-wrap mb-1 leading-relaxed">
//                       {line}
//                     </div>
//                   ))
//                 )}
//               </div>
//             </div>

//             {/* Action Buttons */}
//             <div className="flex gap-3">
//               {isRunning && !isCompleted && (
//                 <Button
//                   onClick={stopAutomation}
//                   variant="outline"
//                   className="flex-1 border-red-500 text-red-600 hover:bg-red-50"
//                 >
//                   Stop Automation
//                 </Button>
//               )}
//               <Button
//                 variant="outline"
//                 className="flex-1 border-gray-300 hover:bg-gray-100 text-gray-700"
//                 onClick={closeModal}
//               >
//                 {isRunning && !isCompleted ? "Minimize (Running in Background)" : "Close"}
//               </Button>
//               {isCompleted && (
//                 <Button
//                   className="flex-1 bg-gradient-to-r from-[#7C3AED] to-[#6366F1] text-white hover:opacity-90"
//                   onClick={() => {
//                     window.location.href = "/applications";
//                   }}
//                 >
//                   View Applications
//                 </Button>
//               )}
//             </div>
//           </div>
//         )}
//       </DialogContent>
//     </Dialog>
//   );
// }
// // src/components/AutomateModal.tsx
// "use client";

// import { useEffect, useRef, useState } from "react";
// import {
//   Loader2, Search, Sparkles, X, CheckCircle2, AlertCircle,
//   Briefcase, MapPin, TrendingUp, ExternalLink, Check
// } from "lucide-react";
// import { Button } from "@/components/ui/button";
// import { Input } from "@/components/ui/input";
// import { Checkbox } from "@/components/ui/checkbox";
// import {
//   Dialog,
//   DialogTrigger,
//   DialogContent,
//   DialogTitle,
//   DialogDescription,
// } from "@/components/ui/dialog";
// import { toast } from "sonner";
// import api from "@/lib/api";

// const COUNTRIES = [
//   "Argentina", "Australia", "Austria", "Bangladesh", "Belgium", "Brazil", "Canada",
//   "Chile", "China", "Colombia", "Czech Republic", "Denmark", "Egypt", "Finland",
//   "France", "Germany", "Greece", "Hong Kong", "Hungary", "India", "Indonesia",
//   "Ireland", "Israel", "Italy", "Japan", "Kenya", "Kuwait", "Malaysia", "Mexico",
//   "Morocco", "Netherlands", "New Zealand", "Nigeria", "Norway", "Pakistan",
//   "Philippines", "Poland", "Portugal", "Qatar", "Romania", "Russia", "Saudi Arabia",
//   "Serbia", "Singapore", "Slovakia", "South Africa", "Spain", "Sri Lanka", "Sweden",
//   "Switzerland", "Taiwan", "Thailand", "Turkey", "Ukraine", "United Arab Emirates",
//   "United Kingdom", "United States", "Uruguay", "Vietnam", "Zimbabwe", "Remote",
// ];

// type SSEMessage =
//   | { type: "info"; msg: string; ts: string }
//   | { type: "proof"; msg: string; url: string; ts: string }
//   | { type: "done"; msg: string; ts: string }
//   | { type: "error"; msg: string; ts: string };

// interface Job {
//   id: string;
//   title: string;
//   company: string;
//   location?: string;
//   url: string;
//   snippet?: string;
//   score: number;
//   source?: string;
// }

// interface AutomateModalProps {
//   cvId: string;
//   token: string;
//   onAutomationDone?: (finalLogs: string[]) => void;
// }

// export default function AutomateModal({
//   cvId,
//   token,
//   onAutomationDone,
// }: AutomateModalProps) {
//   // Modal state
//   const [open, setOpen] = useState(false);

//   // Form inputs
//   const [role, setRole] = useState("");
//   const [country, setCountry] = useState("");
//   const [maxJobs, setMaxJobs] = useState("50");
//   const [minMatch, setMinMatch] = useState("40");

//   // Workflow stages
//   const [stage, setStage] = useState<"form" | "jobs" | "automation">("form");

//   // Jobs state
//   const [jobs, setJobs] = useState<Job[]>([]);
//   const [selectedJobIds, setSelectedJobIds] = useState<Set<string>>(new Set());
//   const [loadingJobs, setLoadingJobs] = useState(false);

//   // Automation state
//   const [logs, setLogs] = useState<string[]>([]);
//   const [proofs, setProofs] = useState<string[]>([]);
//   const [loading, setLoading] = useState(false);
//   const [isRunning, setIsRunning] = useState(false);
//   const [message, setMessage] = useState("");
//   const [error, setError] = useState("");
//   const [runId, setRunId] = useState<string>("");
//   const [actorRunId, setActorRunId] = useState<string>("");

//   const logBoxRef = useRef<HTMLDivElement | null>(null);
//   const eventSourceRef = useRef<EventSource | null>(null);

//   const API_BASE =
//     import.meta.env.VITE_API_URL?.replace(/\/+$/, "") || "http://127.0.0.1:8000";

//   // Helper to add timestamped log
//   const addLog = (message: string) => {
//     const timestamp = new Date().toLocaleTimeString();
//     setLogs((prev) => [...prev, `[${timestamp}] ${message}`]);
//   };

//   // Auto-scroll logs
//   useEffect(() => {
//     if (!logBoxRef.current) return;
//     logBoxRef.current.scrollTop = logBoxRef.current.scrollHeight;
//   }, [logs]);

//   // SSE Connection - Only when automation is running
//   useEffect(() => {
//     if (!isRunning) {
//       if (eventSourceRef.current) {
//         eventSourceRef.current.close();
//         eventSourceRef.current = null;
//       }
//       return;
//     }

//     addLog("📡 Connecting to automation stream...");
//     const evt = new EventSource(`${API_BASE}/v1/automate-job-apply/stream`);
//     eventSourceRef.current = evt;

//     evt.onopen = () => {
//       addLog("✅ Connected to live automation feed");
//     };

//     evt.onmessage = (event) => {
//       try {
//         const data: SSEMessage = JSON.parse(event.data);

//         if (data.type === "proof" && data.url) {
//           setProofs((p) => [...p, data.url]);
//           addLog(`📸 ${data.msg}`);
//         } else if (data.type === "done") {
//           addLog(`✅ ${data.msg}`);
//           addLog("🎉 Automation completed successfully!");
//           addLog("📊 Check your applied jobs in the dashboard");
//           setIsRunning(false);
//           setMessage("✅ Automation completed successfully!");

//           if (onAutomationDone) {
//             onAutomationDone([...logs, `✅ ${data.msg}`]);
//           }

//           localStorage.setItem("automation_logs", JSON.stringify([...logs, `✅ ${data.msg}`]));
//           toast.success("🎉 Automation finished! Check your applications.");
//         } else if (data.type === "error") {
//           addLog(`❌ ${data.msg}`);
//           setIsRunning(false);
//           setError(data.msg);
//         } else if (data.msg) {
//           addLog(data.msg);
//         }
//       } catch (e) {
//         // Ignore malformed messages
//       }
//     };

//     evt.onerror = () => {
//       addLog("⚠️ Connection to stream closed");
//       evt.close();
//       setIsRunning(false);
//     };

//     return () => {
//       evt.close();
//       eventSourceRef.current = null;
//     };
//   }, [isRunning, API_BASE]);

//   // Reset state when modal closes
//   useEffect(() => {
//     if (!open) {
//       setStage("form");
//       setJobs([]);
//       setSelectedJobIds(new Set());
//       setLogs([]);
//       setProofs([]);
//       setError("");
//       setMessage("");
//       setRunId("");
//       setActorRunId("");
//       setIsRunning(false);
//     }
//   }, [open]);

//   // Step 1: Fetch and display jobs
//   const fetchJobs = async () => {
//     setLoadingJobs(true);
//     setError("");
//     setMessage("");

//     if (!cvId) {
//       setError("Please upload a CV first!");
//       setLoadingJobs(false);
//       return;
//     }

//     if (!role || !country) {
//       setError("Please fill in both Role and Country.");
//       setLoadingJobs(false);
//       return;
//     }

//     try {
//       toast.info("🔍 Searching for matching jobs...");

//       // Call backend to fetch and score jobs
//       const response = await api.post("/v1/jobs/fetch-and-score", {
//         cv_id: cvId,
//         role: role,
//         country: country,
//         min_match_score: Number(minMatch),
//         max_jobs: Number(maxJobs),
//       });

//       if (response.data?.ok) {
//         const fetchedJobs = response.data.jobs || [];

//         if (fetchedJobs.length === 0) {
//           setError(`No jobs found matching "${role}" in ${country} with ≥${minMatch}% match score.`);
//           setLoadingJobs(false);
//           return;
//         }

//         setJobs(fetchedJobs);

//         // Select all jobs by default
//         const allIds = new Set(fetchedJobs.map((j: Job) => j.id));
//         setSelectedJobIds(allIds);

//         setStage("jobs");

//         toast.success(`✅ Found ${fetchedJobs.length} matching jobs!`);
//       } else {
//         setError("Failed to fetch jobs. Please try again.");
//       }
//     } catch (err: any) {
//       console.error(err);
//       const errorMsg =
//         err?.response?.data?.detail || err.message || "Failed to fetch jobs";
//       setError(errorMsg);

//       if (err?.response?.status === 402) {
//         toast.error("💳 Insufficient credits. Please purchase more credits.");
//       }
//     } finally {
//       setLoadingJobs(false);
//     }
//   };

//   // Toggle job selection
//   const toggleJobSelection = (jobId: string) => {
//     setSelectedJobIds((prev) => {
//       const newSet = new Set(prev);
//       if (newSet.has(jobId)) {
//         newSet.delete(jobId);
//       } else {
//         newSet.add(jobId);
//       }
//       return newSet;
//     });
//   };

//   // Select/Deselect all
//   const selectAll = () => {
//     const allIds = new Set(jobs.map((j) => j.id));
//     setSelectedJobIds(allIds);
//   };

//   const deselectAll = () => {
//     setSelectedJobIds(new Set());
//   };

//   // Step 2: Start automation with selected jobs
//   const startAutomation = async () => {
//     if (selectedJobIds.size === 0) {
//       toast.error("Please select at least one job to apply.");
//       return;
//     }

//     setLoading(true);
//     setError("");
//     setMessage("");
//     setLogs([]);
//     setProofs([]);
//     setRunId("");
//     setActorRunId("");
//     setIsRunning(true);
//     setStage("automation");

//     try {
//       // Filter selected jobs
//       const selectedJobs = jobs.filter((j) => selectedJobIds.has(j.id));

//       addLog("🚀 Starting job automation...");
//       addLog(`🎯 Applying to ${selectedJobs.length} selected jobs`);
//       addLog(`📊 Average match score: ${(selectedJobs.reduce((acc, j) => acc + j.score, 0) / selectedJobs.length).toFixed(1)}%`);
//       addLog("💳 Checking credits...");

//       // Trigger automation with selected jobs
//       addLog("🔄 Initiating automation request...");
//       const triggerRes = await api.post("/v1/automate-job-apply", {
//         cv_id: cvId,
//         role,
//         country,
//         min_match_score: Number(minMatch),
//         max_jobs: selectedJobs.length,
//         selected_jobs: selectedJobs, // Pass selected jobs
//       });

//       if (triggerRes.data?.ok) {
//         setRunId(triggerRes.data.run_id || "");
//         setActorRunId(triggerRes.data.actor_run_id || "");

//         addLog("✅ Automation started successfully!");
//         addLog(`📝 Run ID: ${triggerRes.data.run_id}`);
//         addLog(`🤖 Actor ID: ${triggerRes.data.actor_run_id}`);

//         if (triggerRes.data.credits_used) {
//           addLog(`💳 Credits used: ${triggerRes.data.credits_used}`);
//           addLog(`💰 Remaining credits: ${triggerRes.data.remaining_credits}`);
//         }

//         addLog(`📋 Processing ${selectedJobs.length} jobs`);

//         if (triggerRes.data.internal_applications > 0) {
//           addLog(`🏢 Applied to ${triggerRes.data.internal_applications} internal jobs`);
//         }

//         addLog("🔍 AI is now discovering companies and sending applications...");
//         addLog("⏳ This may take a few minutes. You can minimize this modal.");

//         setMessage("✅ Automation started! You can continue working - we'll notify you when done.");

//         // Show notification
//         toast.success("🚀 Automation running in background!");
//       } else {
//         setError("Failed to start automation");
//         setIsRunning(false);
//         addLog("❌ Failed to start automation");
//       }
//     } catch (err: any) {
//       console.error(err);
//       const errorMsg =
//         err?.response?.data?.detail || err.message || "Unexpected error";
//       setError(errorMsg);
//       setIsRunning(false);
//       addLog(`❌ Error: ${errorMsg}`);

//       if (err?.response?.status === 402) {
//         addLog("💳 Insufficient credits. Please purchase more credits.");
//         toast.error("Insufficient credits");
//       } else if (err?.response?.status === 404) {
//         addLog("❌ No matching jobs found. Try adjusting your criteria.");
//       }
//     } finally {
//       setLoading(false);
//     }
//   };

//   const stopAutomation = () => {
//     if (eventSourceRef.current) {
//       eventSourceRef.current.close();
//       eventSourceRef.current = null;
//     }
//     setIsRunning(false);
//     addLog("⚠️ Automation stopped by user");
//     setMessage("⚠️ Automation stopped by user");
//     toast.warning("Automation stopped");
//   };

//   const goBack = () => {
//     if (stage === "jobs") {
//       setStage("form");
//       setJobs([]);
//       setSelectedJobIds(new Set());
//     } else if (stage === "automation" && !isRunning) {
//       setStage("jobs");
//     }
//   };

//   return (
//     <Dialog open={open} onOpenChange={setOpen}>
//       <DialogTrigger asChild>
//         <Button
//           className="bg-gradient-to-r from-[#7C3AED] to-[#6366F1] text-white rounded-xl shadow-lg hover:opacity-90 transition-all"
//           onClick={() => setOpen(true)}
//         >
//           <Sparkles className="mr-2 h-4 w-4" /> Automate Job Apply
//         </Button>
//       </DialogTrigger>

//       <DialogContent className="p-6 rounded-2xl max-w-4xl bg-white text-gray-800 shadow-2xl max-h-[90vh] overflow-y-auto">
//         <div className="flex items-center justify-between mb-4">
//           <DialogTitle className="text-2xl font-bold bg-gradient-to-r from-[#7C3AED] to-[#6366F1] bg-clip-text text-transparent">
//             {stage === "form" && "AI Job Automation"}
//             {stage === "jobs" && `Found ${jobs.length} Matching Jobs`}
//             {stage === "automation" && "Automation in Progress"}
//           </DialogTitle>
//           <div className="flex gap-2">
//             {stage !== "form" && !isRunning && (
//               <Button
//                 variant="ghost"
//                 size="sm"
//                 onClick={goBack}
//                 className="text-gray-500 hover:text-gray-700"
//               >
//                 ← Back
//               </Button>
//             )}
//             <Button
//               variant="ghost"
//               size="sm"
//               onClick={() => setOpen(false)}
//               className="text-gray-500 hover:text-gray-700"
//             >
//               <X className="h-5 w-5" />
//             </Button>
//           </div>
//         </div>

//         <DialogDescription className="text-gray-500 text-sm mb-4">
//           {stage === "form" && "Set your preferences to find matching jobs"}
//           {stage === "jobs" && "Select the jobs you want to apply to (all selected by default)"}
//           {stage === "automation" && "AI is applying to selected jobs - you can close this modal"}
//         </DialogDescription>

//         {/* STAGE 1: FORM */}
//         {stage === "form" && (
//           <div className="space-y-4">
//             <div>
//               <label className="block text-sm font-medium text-gray-700 mb-1">
//                 Job Role *
//               </label>
//               <Input
//                 placeholder="e.g. Frontend Developer, Data Scientist"
//                 value={role}
//                 onChange={(e) => setRole(e.target.value)}
//                 disabled={loadingJobs}
//               />
//               <p className="text-xs text-gray-500 mt-1">
//                 We'll use your CV title if you leave this blank
//               </p>
//             </div>

//             <div>
//               <label className="block text-sm font-medium text-gray-700 mb-1">
//                 Country/Region *
//               </label>
//               <select
//                 value={country}
//                 onChange={(e) => setCountry(e.target.value)}
//                 disabled={loadingJobs}
//                 className="border border-gray-300 rounded-md p-2 w-full focus:ring-[#7C3AED] focus:border-[#7C3AED]"
//               >
//                 <option value="">🌎 Select Country</option>
//                 {COUNTRIES.map((c) => (
//                   <option key={c} value={c}>
//                     {c}
//                   </option>
//                 ))}
//               </select>
//             </div>

//             <div className="grid grid-cols-2 gap-4">
//               <div>
//                 <label className="block text-sm font-medium text-gray-700 mb-1">
//                   Max Jobs
//                 </label>
//                 <Input
//                   type="number"
//                   placeholder="e.g. 50"
//                   value={maxJobs}
//                   onChange={(e) => setMaxJobs(e.target.value)}
//                   disabled={loadingJobs}
//                 />
//               </div>
//               <div>
//                 <label className="block text-sm font-medium text-gray-700 mb-1">
//                   Min Match %
//                 </label>
//                 <Input
//                   type="number"
//                   placeholder="e.g. 40"
//                   value={minMatch}
//                   onChange={(e) => setMinMatch(e.target.value)}
//                   disabled={loadingJobs}
//                 />
//               </div>
//             </div>

//             {error && (
//               <div className="flex items-start gap-2 p-3 bg-red-50 border border-red-200 rounded-lg">
//                 <AlertCircle className="h-5 w-5 text-red-600 mt-0.5" />
//                 <p className="text-sm text-red-700">{error}</p>
//               </div>
//             )}

//             <Button
//               onClick={fetchJobs}
//               disabled={loadingJobs || !role || !country}
//               className="w-full bg-gradient-to-r from-[#7C3AED] to-[#6366F1] text-white hover:opacity-90 transition-all"
//             >
//               {loadingJobs ? (
//                 <>
//                   <Loader2 className="animate-spin mr-2" /> Searching...
//                 </>
//               ) : (
//                 <>
//                   <Search className="mr-2 h-4 w-4" /> Find Matching Jobs
//                 </>
//               )}
//             </Button>
//           </div>
//         )}

//         {/* STAGE 2: JOB SELECTION */}
//         {stage === "jobs" && (
//           <div className="space-y-4">
//             {/* Selection Controls */}
//             <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
//               <div className="text-sm">
//                 <span className="font-semibold">{selectedJobIds.size}</span> of{" "}
//                 <span className="font-semibold">{jobs.length}</span> jobs selected
//               </div>
//               <div className="flex gap-2">
//                 <Button
//                   variant="outline"
//                   size="sm"
//                   onClick={selectAll}
//                   disabled={selectedJobIds.size === jobs.length}
//                 >
//                   Select All
//                 </Button>
//                 <Button
//                   variant="outline"
//                   size="sm"
//                   onClick={deselectAll}
//                   disabled={selectedJobIds.size === 0}
//                 >
//                   Deselect All
//                 </Button>
//               </div>
//             </div>

//             {/* Job List */}
//             <div className="max-h-96 overflow-y-auto space-y-3">
//               {jobs.map((job) => {
//                 const isSelected = selectedJobIds.has(job.id);
//                 return (
//                   <div
//                     key={job.id}
//                     className={`border rounded-lg p-4 cursor-pointer transition-all ${
//                       isSelected
//                         ? "border-[#7C3AED] bg-purple-50"
//                         : "border-gray-200 hover:border-gray-300"
//                     }`}
//                     onClick={() => toggleJobSelection(job.id)}
//                   >
//                     <div className="flex items-start gap-3">
//                       <Checkbox
//                         checked={isSelected}
//                         onCheckedChange={() => toggleJobSelection(job.id)}
//                         className="mt-1"
//                       />
//                       <div className="flex-1">
//                         <div className="flex items-start justify-between">
//                           <div>
//                             <h4 className="font-semibold text-gray-900 flex items-center gap-2">
//                               {job.title}
//                               <a
//                                 href={job.url}
//                                 target="_blank"
//                                 rel="noopener noreferrer"
//                                 onClick={(e) => e.stopPropagation()}
//                                 className="text-[#7C3AED] hover:text-[#6366F1]"
//                               >
//                                 <ExternalLink className="h-4 w-4" />
//                               </a>
//                             </h4>
//                             <div className="flex items-center gap-3 mt-1 text-sm text-gray-600">
//                               <span className="flex items-center gap-1">
//                                 <Briefcase className="h-3 w-3" />
//                                 {job.company}
//                               </span>
//                               {job.location && (
//                                 <span className="flex items-center gap-1">
//                                   <MapPin className="h-3 w-3" />
//                                   {job.location}
//                                 </span>
//                               )}
//                             </div>
//                           </div>
//                           <div className="flex items-center gap-1 text-sm font-semibold text-[#7C3AED]">
//                             <TrendingUp className="h-4 w-4" />
//                             {job.score}%
//                           </div>
//                         </div>
//                         {job.snippet && (
//                           <p className="text-xs text-gray-500 mt-2 line-clamp-2">
//                             {job.snippet}
//                           </p>
//                         )}
//                       </div>
//                     </div>
//                   </div>
//                 );
//               })}
//             </div>

//             {/* Action Button */}
//             <Button
//               onClick={startAutomation}
//               disabled={selectedJobIds.size === 0 || loading}
//               className="w-full bg-gradient-to-r from-[#7C3AED] to-[#6366F1] text-white hover:opacity-90 transition-all"
//             >
//               {loading ? (
//                 <>
//                   <Loader2 className="animate-spin mr-2" /> Starting...
//                 </>
//               ) : (
//                 <>
//                   <Sparkles className="mr-2 h-4 w-4" /> Apply to {selectedJobIds.size} Selected Jobs
//                 </>
//               )}
//             </Button>
//           </div>
//         )}

//         {/* STAGE 3: AUTOMATION */}
//         {stage === "automation" && (
//           <div className="space-y-4">
//             {/* Run Info */}
//             {runId && (
//               <div className="bg-gray-50 p-3 rounded-lg text-xs space-y-1">
//                 <p className="text-gray-600">
//                   <span className="font-semibold">Run ID:</span>{" "}
//                   <span className="font-mono">{runId}</span>
//                 </p>
//                 {actorRunId && (
//                   <p className="text-gray-600">
//                     <span className="font-semibold">Actor ID:</span>{" "}
//                     <span className="font-mono">{actorRunId}</span>
//                   </p>
//                 )}
//               </div>
//             )}

//             {/* Status Messages */}
//             {error && (
//               <div className="flex items-start gap-2 p-3 bg-red-50 border border-red-200 rounded-lg">
//                 <AlertCircle className="h-5 w-5 text-red-600 mt-0.5" />
//                 <p className="text-sm text-red-700">{error}</p>
//               </div>
//             )}

//             {message && !error && (
//               <div className="flex items-start gap-2 p-3 bg-green-50 border border-green-200 rounded-lg">
//                 <CheckCircle2 className="h-5 w-5 text-green-600 mt-0.5" />
//                 <p className="text-sm text-green-700">{message}</p>
//               </div>
//             )}

//             {/* Proof Gallery */}
//             {proofs.length > 0 && (
//               <div>
//                 <p className="text-sm font-semibold mb-2 text-gray-700">
//                   Application Proofs ({proofs.length})
//                 </p>
//                 <div className="grid grid-cols-3 gap-2 max-h-48 overflow-y-auto">
//                   {proofs.map((url, i) => (
//                     <a
//                       key={i}
//                       href={url}
//                       target="_blank"
//                       rel="noreferrer"
//                       className="relative group"
//                     >
//                       <img
//                         src={url}
//                         alt={`Proof ${i + 1}`}
//                         className="w-full h-24 object-cover rounded-md border border-gray-200 group-hover:border-[#7C3AED] transition-all"
//                       />
//                       <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 rounded-md transition-all flex items-center justify-center">
//                         <span className="text-white text-xs opacity-0 group-hover:opacity-100">
//                           View
//                         </span>
//                       </div>
//                     </a>
//                   ))}
//                 </div>
//               </div>
//             )}

//             {/* Logs */}
//             <div>
//               <p className="text-sm font-semibold mb-2 text-gray-700">
//                 Automation Logs {isRunning && <span className="text-green-500 animate-pulse">● Live</span>}
//               </p>
//               <div
//                 ref={logBoxRef}
//                 className="bg-gray-900 text-green-400 font-mono text-xs rounded-xl border border-gray-700 p-4 max-h-64 overflow-y-auto shadow-inner"
//               >
//                 {logs.length === 0 ? (
//                   <p className="text-gray-500 text-center">
//                     {isRunning ? "Waiting for logs..." : "No logs yet."}
//                   </p>
//                 ) : (
//                   logs.map((line, idx) => (
//                     <div key={idx} className="whitespace-pre-wrap mb-1 leading-relaxed">
//                       {line}
//                     </div>
//                   ))
//                 )}
//               </div>
//             </div>

//             {/* Action Buttons */}
//             <div className="flex gap-3">
//               {isRunning && (
//                 <Button
//                   onClick={stopAutomation}
//                   variant="outline"
//                   className="flex-1 border-red-500 text-red-600 hover:bg-red-50"
//                 >
//                   Stop Automation
//                 </Button>
//               )}
//               <Button
//                 variant="outline"
//                 className="flex-1 border-gray-300 hover:bg-gray-100 text-gray-700"
//                 onClick={() => setOpen(false)}
//               >
//                 {isRunning ? "Minimize (Running in Background)" : "Close"}
//               </Button>
//             </div>
//           </div>
//         )}
//       </DialogContent>
//     </Dialog>
//   );
// }
