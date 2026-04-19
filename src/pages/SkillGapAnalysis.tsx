import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Upload,
  Search as SearchIcon,
  CheckCircle,
  ExternalLink,
  BookOpen,
  Target,
  Briefcase,
  Award,
  Info,
  ArrowRight,
  TrendingUp,
  AlertTriangle,
  Share2,
} from "lucide-react";
import api from "@/lib/api";
import { toast } from "sonner";


// Type definitions matching the API response
interface Course {
  name: string;
  platform: string;
  description: string;
}

interface MissingSkill {
  skill: string;
  priority: "high" | "medium" | "low";
  gap_basis: "target_role" | "industry_standard";
  reason: string;
  courses: Course[];
}

interface SkillGapAnalysisResponse {
  current_role: string;
  target_role: string | null;
  current_skills: string[];
  missing_skills: MissingSkill[];
  recommendations: string;
  credits_remaining: number;
}



export default function SkillGapAnalysis() {
  const navigate = useNavigate();
  const [cvId, setCvId] = useState<string | null>(null);
  const [targetRole, setTargetRole] = useState("");
  const [suggestedRoles, setSuggestedRoles] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [analysisResult, setAnalysisResult] = useState<SkillGapAnalysisResponse | null>(null);

  const [credits, setCredits] = useState<number>(65);
  const [daysLeft, setDaysLeft] = useState<number>(4);

  // Check for CV ID on mount and when storage changes
  useEffect(() => {
    const initPage = async () => {
      // 1. Fetch latest CV (R6)
      try {
        const res = await api.get("/v1/cvs/latest");
        const id = res.data?.cv_id || res.data?.id;
        if (id) {
          setCvId(id);
          localStorage.setItem("current_cv_id", id);
        }
      } catch (err) {
        console.error("Failed to fetch latest CV:", err);
      }

      // Suggested roles: no backend endpoint exists, use static fallback
      setSuggestedRoles([
        "Software Engineer", "Frontend Developer", "Backend Developer",
        "Full Stack Developer", "Data Scientist", "Product Manager",
        "UX Designer", "DevOps Engineer", "Machine Learning Engineer",
        "Mobile Developer",
      ]);

      // 3. Update credits and trial
      const storedCredits = localStorage.getItem("remaining_credits");
      if (storedCredits && !isNaN(Number(storedCredits))) setCredits(Number(storedCredits));
      
      const trialEnds = localStorage.getItem("trial_ends_at");
      if (trialEnds) {
        const end = new Date(trialEnds).getTime();
        const now = Date.now();
        const left = Math.max(0, Math.floor((end - now) / (1000 * 60 * 60 * 24)));
        setDaysLeft(left);
      }
    };

    initPage();
  }, []);

  // Fake progressive loading that stops at 99% until complete
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    let interval: any;
    if (loading) {
      setProgress(1);
      interval = setInterval(() => {
        setProgress((prev) => {
          if (prev >= 98) return prev;
          // Faster progress logic
          const increment = 2 + Math.random() * 3;
          const next = prev + increment;
          return next >= 99 ? 99 : Math.floor(next);
        });
      }, 60);
    } else {
      setProgress(100);
    }
    return () => clearInterval(interval);
  }, [loading]);

  const handleAnalyze = async () => {
    if (!cvId) {
      toast.error("Please upload your CV first");
      navigate("/upload-cv");
      return;
    }

    setLoading(true);
    setError(null);
    setAnalysisResult(null);

    try {
      const requestBody: { cv_id: string; target_role?: string } = {
        cv_id: cvId,
      };

      if (targetRole.trim()) {
        requestBody.target_role = targetRole.trim();
      }

      const response = await api.post<SkillGapAnalysisResponse>(
        "/v1/skill-gap/analyze",
        requestBody
      );

      if (response.data.credits_remaining !== undefined) {
        localStorage.setItem("remaining_credits", response.data.credits_remaining.toString());
        setCredits(response.data.credits_remaining);
      }

      setAnalysisResult(response.data);
      toast.success("Skill gap analysis completed!");
    } catch (err: any) {
      const errorMessage = err?.response?.data?.detail || "Failed to analyze skill gaps";
      setError(errorMessage);

      const status = err?.response?.status;
      if (status === 400) {
        toast.error("CV must be parsed first. Please parse your CV.", {
          action: { label: "Parse CV", onClick: () => navigate("/upload-cv") },
        });
      } else if (status === 402) {
        toast.error("Insufficient credits. Please upgrade your plan.", {
          action: { label: "View Plans", onClick: () => navigate("/plans") },
        });
      } else if (status === 403) {
        toast.error("You don't have access to this CV");
      } else if (status === 404) {
        toast.error("CV not found. Please upload a new CV.", {
          action: { label: "Upload CV", onClick: () => navigate("/upload-cv") },
        });
      } else if (status === 401) {
        toast.error("Session expired. Please log in again.");
        setTimeout(() => navigate("/login"), 2000);
      } else {
        toast.error(errorMessage);
      }
    } finally {
      setLoading(false);
    }
  };

  // Split missing_skills into two categories based on priority
  const highPrioritySkills = analysisResult?.missing_skills?.filter(s => s.priority === "high") || [];
  const improvableSkills = analysisResult?.missing_skills?.filter(s => s.priority !== "high") || [];

  // Generate learning path from all skills
  const generateLearningPath = () => {
    if (!analysisResult?.missing_skills) return [];
    const allSkills = [...highPrioritySkills, ...improvableSkills];
    return allSkills.map((skill, index) => {
      let title: string;
      let duration: string;

      if (skill.priority === "high") {
        title = index === 0 ? `Start With ${skill.skill} Fundamentals` : `Learn ${skill.skill}`;
        duration = "2-3 weeks";
      } else {
        title = `Advance ${skill.skill} Skills`;
        duration = "3-4 weeks";
      }

      return {
        title,
        description: skill.reason.length > 60 ? skill.reason.substring(0, 60) + "..." : skill.reason,
        duration,
      };
    });
  };

  const learningPath = generateLearningPath();

  return (
    <div className="min-h-screen bg-[#f8fafc] font-sans">

      <main className="w-full max-w-[1300px] mx-auto px-6 py-8">
        
        {/* Header Section */}
        <div>
           {/* Summary Info Bar */}
           <div className="flex flex-col md:flex-row justify-end items-center mb-8 gap-4 pt-4">
              <div className="bg-white border border-gray-100 rounded-lg py-2 px-4 shadow-sm flex flex-col justify-center min-w-[200px]">
                <div className="flex items-center gap-1.5 font-bold text-gray-800 text-[13px] mb-0.5">
                  <span className="text-yellow-400 text-[16px] leading-none">⚡</span>
                  <span><span className="text-[#3b82f6]">{credits}</span> Credits Left</span>
                </div>
                <div className="text-[11px] text-gray-400 font-medium ml-5">
                  Trial expires in {daysLeft} days
                </div>
              </div>
           </div>
        </div>

        {/* Dynamic State Content */}
        {!cvId ? (
          /* Missing CV State */
          <div>
            <h2 className="text-[1.15rem] font-bold text-gray-900 mb-4 tracking-tight">Upload Your CV</h2>
            <div className="bg-white rounded-xl shadow-[0_2px_15px_-3px_rgba(0,0,0,0.04)] py-[120px] flex flex-col items-center justify-center relative overflow-hidden">
              <div className="w-12 h-12 bg-gray-50 rounded-full flex items-center justify-center mb-5 border border-gray-100">
                <Upload className="w-5 h-5 text-gray-800" strokeWidth={2} />
              </div>
              <div className="text-gray-700 font-bold text-[15px] mb-2 z-10">
                Drag & Drop Your CV Or{" "}
                <span 
                  className="text-[#3b82f6] underline decoration-1 underline-offset-[3px] hover:text-blue-600 cursor-pointer" 
                  onClick={() => navigate("/upload-cv")}
                >
                  Choose File
                </span>{" "}
                To Upload
              </div>
              <div className="text-gray-400 text-[13px] font-medium z-10">
                Supported Formats: PDF, DOCX (Max 8MB)
              </div>
            </div>
          </div>
        ) : loading ? (
          /* Loading State */
          <div>
            <h2 className="text-[1.15rem] font-bold text-gray-900 mb-4 tracking-tight">Search By Target Role</h2>
            <div className="bg-white rounded-xl shadow-[0_2px_15px_-3px_rgba(0,0,0,0.04)] py-[120px] flex flex-col items-center justify-center">
              <h3 className="text-[1.15rem] font-bold text-gray-900 mb-2 tracking-tight">Building your growth plan...</h3>
              <p className="text-[#64748b] text-[13px] mb-8 font-medium">Analyzing Your Experience To Uncover The Skills That Will Move You Forward.</p>
              
              <div className="w-full max-w-[400px] flex items-center gap-3">
                <div className="flex-1 bg-gray-100 h-2.5 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-gradient-to-r from-blue-400 via-blue-600 to-blue-800 rounded-full transition-all duration-300 ease-out" 
                    style={{ width: `${progress}%` }} 
                  />
                </div>
                <span className="text-gray-600 font-medium text-xs w-8 whitespace-nowrap">{progress}%</span>
              </div>
            </div>
          </div>
        ) : (
          /* Form + Results State */
          <>
            {/* Search Form - Always visible */}
            <div>
              <h2 className="text-[1.15rem] font-bold text-gray-900 mb-4 tracking-tight">Search By Target Role</h2>
              <div className="bg-white rounded-[10px] shadow-[0_2px_15px_-3px_rgba(0,0,0,0.04)] p-8 py-10">
                <div className="text-gray-600 text-[14px] mb-6 font-medium">
                  Enter a target role (Optional) or analyze against industry standards.
                </div>
                
                <div className="flex flex-col md:flex-row gap-4 items-start">
                  <div className="flex-1 w-full">
                    <div className="relative group">
                      <SearchIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 group-focus-within:text-blue-500 transition-colors" />
                      <Input 
                        value={targetRole}
                        onChange={(e) => setTargetRole(e.target.value)}
                        className="w-full pl-11 py-[22px] bg-gray-50/50 border-gray-100 focus-visible:ring-1 focus-visible:ring-blue-500/30 focus-visible:border-blue-300 text-[14px] rounded-lg transition-all shadow-sm"
                        placeholder="E.G. Senior Full-Stack Developer..." 
                        list="suggested-roles"
                      />
                      <datalist id="suggested-roles">
                        {suggestedRoles.map((role) => (
                          <option key={role} value={role} />
                        ))}
                      </datalist>
                    </div>
                    <p className="text-gray-400 text-[12px] mt-2 ml-1 font-medium">Leave blank to analyze against industry standards only</p>
                  </div>
                  <Button 
                    onClick={handleAnalyze} 
                    className="bg-blue-600 hover:bg-blue-700 text-white px-7 py-[22px] rounded-lg font-medium text-[14px] w-full md:w-auto shadow-md shadow-blue-500/20 transition-all"
                  >
                    <SearchIcon className="w-4 h-4 mr-2" />
                    Analyze Skill Gap
                  </Button>
                </div>
              </div>
            </div>

            {/* Analysis Results */}
            {analysisResult && (
              <AnimatePresence mode="wait">
                <motion.div
                  key="results"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.4 }}
                  className="mt-10"
                >
                  {/* Analysis Header */}
                  <div className="mb-6">
                    <h3 className="text-[1.15rem] font-bold text-gray-900 tracking-tight">
                      Analysis For: {analysisResult.target_role || analysisResult.current_role || "Your Profile"}
                    </h3>
                    <p className="text-gray-400 text-[13px] font-medium mt-1">
                      Based on current market requirements and job postings
                    </p>
                  </div>

                  {/* Three Stat Cards */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-10">
                    {/* Skills You Have */}
                    <div className="bg-white rounded-xl border border-gray-100 shadow-[0_2px_12px_-3px_rgba(0,0,0,0.04)] py-7 px-6 text-center">
                      <div className="text-[2.2rem] font-bold text-[#22c55e] leading-tight">
                        {analysisResult.current_skills?.length || 0}
                      </div>
                      <div className="text-[#22c55e] text-[13px] font-semibold mt-1">
                        Skills You Have
                      </div>
                    </div>

                    {/* Skills To Improve */}
                    <div className="bg-white rounded-xl border border-gray-100 shadow-[0_2px_12px_-3px_rgba(0,0,0,0.04)] py-7 px-6 text-center">
                      <div className="text-[2.2rem] font-bold text-[#f59e0b] leading-tight">
                        {improvableSkills.length}
                      </div>
                      <div className="text-[#f59e0b] text-[13px] font-semibold mt-1">
                        Skills To Improve
                      </div>
                    </div>

                    {/* Missing Skills */}
                    <div className="bg-white rounded-xl border border-gray-100 shadow-[0_2px_12px_-3px_rgba(0,0,0,0.04)] py-7 px-6 text-center">
                      <div className="text-[2.2rem] font-bold text-[#ef4444] leading-tight">
                        {highPrioritySkills.length}
                      </div>
                      <div className="text-[#ef4444] text-[13px] font-semibold mt-1">
                        Missing Skills
                      </div>
                    </div>
                  </div>

                  {/* ⚠ Missing Skills Section */}
                  {highPrioritySkills.length > 0 && (
                    <div className="mb-10">
                      <div className="flex items-center gap-2 mb-5">
                        <AlertTriangle className="w-5 h-5 text-[#f59e0b]" />
                        <h3 className="text-[1.05rem] font-bold text-gray-900 tracking-tight">Missing Skills</h3>
                      </div>

                      <div className="space-y-0">
                        {highPrioritySkills.map((skill, idx) => (
                          <motion.div
                            key={`missing-${idx}`}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: idx * 0.1 }}
                            className="bg-white border border-gray-100 rounded-lg p-6 pb-5"
                            style={{ 
                              borderRadius: idx === 0 ? '10px 10px 0 0' : idx === highPrioritySkills.length - 1 ? '0 0 10px 10px' : '0',
                              borderTop: idx !== 0 ? 'none' : undefined
                            }}
                          >
                            <h4 className="text-[15px] font-bold text-gray-900 mb-1">{skill.skill}</h4>
                            <p className="text-gray-400 text-[13px] font-medium mb-5">{skill.reason}</p>

                            {/* Course Cards */}
                            {skill.courses && skill.courses.length > 0 && (
                              <div className="flex flex-wrap gap-4">
                                {skill.courses.map((course, courseIdx) => (
                                  <div
                                    key={courseIdx}
                                    className="bg-white border border-gray-100 rounded-lg p-4 pb-3 min-w-[220px] max-w-[280px] flex flex-col"
                                  >
                                    <h5 className="text-[13px] font-bold text-gray-900 mb-1 leading-snug">
                                      {course.name}
                                    </h5>
                                    <p className="text-gray-400 text-[12px] font-medium mb-4 leading-snug">
                                      {course.platform} • {course.description}
                                    </p>
                                    <button className="w-full border border-gray-200 rounded-md py-2 px-4 text-[#3b82f6] text-[13px] font-medium bg-white hover:bg-blue-50 hover:border-blue-200 transition-colors cursor-pointer">
                                      View Course
                                    </button>
                                  </div>
                                ))}
                              </div>
                            )}
                          </motion.div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* 📈 Skills To Improve Section */}
                  {improvableSkills.length > 0 && (
                    <div className="mb-10">
                      <div className="flex items-center gap-2 mb-5">
                        <TrendingUp className="w-5 h-5 text-[#f59e0b]" />
                        <h3 className="text-[1.05rem] font-bold text-gray-900 tracking-tight">Skills To Improve</h3>
                      </div>

                      <div className="space-y-5">
                        {improvableSkills.map((skill, idx) => (
                          <motion.div
                            key={`improve-${idx}`}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: idx * 0.1 + 0.2 }}
                            className="rounded-lg p-6 pb-5 border"
                            style={{
                              backgroundColor: "#fef9f3",
                              borderColor: "#fde8c8",
                            }}
                          >
                            <h4 className="text-[15px] font-bold text-gray-900 mb-1">{skill.skill}</h4>
                            <p className="text-gray-400 text-[13px] font-medium mb-5">{skill.reason}</p>

                            {/* Course Cards */}
                            {skill.courses && skill.courses.length > 0 && (
                              <div className="flex flex-wrap gap-4">
                                {skill.courses.map((course, courseIdx) => (
                                  <div
                                    key={courseIdx}
                                    className="bg-white border border-gray-100 rounded-lg p-4 pb-3 min-w-[220px] max-w-[280px] flex flex-col"
                                  >
                                    <h5 className="text-[13px] font-bold text-gray-900 mb-1 leading-snug">
                                      {course.name}
                                    </h5>
                                    <p className="text-gray-400 text-[12px] font-medium mb-4 leading-snug">
                                      {course.platform} • {course.description}
                                    </p>
                                    <button className="w-full border border-gray-200 rounded-md py-2 px-4 text-[#3b82f6] text-[13px] font-medium bg-white hover:bg-blue-50 hover:border-blue-200 transition-colors cursor-pointer">
                                      View Course
                                    </button>
                                  </div>
                                ))}
                              </div>
                            )}
                          </motion.div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* 🔗 Recommended Learning Path Section */}
                  {learningPath.length > 0 && (
                    <div className="mb-10">
                      <div className="flex items-center gap-2 mb-5">
                        <Share2 className="w-5 h-5 text-[#3b82f6]" />
                        <h3 className="text-[1.05rem] font-bold text-gray-900 tracking-tight">Recommended Learning Path</h3>
                      </div>

                      <div className="rounded-xl overflow-hidden border border-gray-100 bg-white shadow-[0_2px_12px_-3px_rgba(0,0,0,0.04)]">
                        {learningPath.map((step, idx) => (
                          <div
                            key={idx}
                            className={`flex items-center gap-4 px-5 py-4 ${
                              idx === 0
                                ? "bg-[#eef2ff] border-l-4 border-l-[#3b82f6]"
                                : "bg-white border-l-4 border-l-transparent"
                            } ${idx !== 0 ? "border-t border-gray-100" : ""}`}
                          >
                            {/* Number Circle */}
                            <div
                              className={`w-9 h-9 rounded-full flex items-center justify-center text-[14px] font-bold flex-shrink-0 ${
                                idx === 0
                                  ? "bg-[#3b82f6] text-white"
                                  : "bg-gray-200 text-gray-500"
                              }`}
                            >
                              {idx + 1}
                            </div>

                            {/* Text */}
                            <div className="flex-1 min-w-0">
                              <h4 className="text-[14px] font-bold text-gray-900 leading-snug">{step.title}</h4>
                              <p className="text-gray-400 text-[12px] font-medium mt-0.5">{step.description}</p>
                            </div>

                            {/* Duration */}
                            <div
                              className={`text-[13px] font-medium whitespace-nowrap ${
                                idx === 0 ? "text-[#3b82f6]" : "text-gray-400"
                              }`}
                            >
                              {step.duration}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Action Buttons */}
                  <div className="flex gap-4 pt-2 pb-10">
                    <Button
                      onClick={() => {
                        setAnalysisResult(null);
                        setError(null);
                        setTargetRole("");
                      }}
                      variant="outline"
                      className="border-gray-200 text-gray-700 hover:bg-gray-50 bg-white"
                    >
                      Analyze Again
                    </Button>
                    <Button
                      onClick={() => navigate("/job-search")}
                      className="bg-blue-600 hover:bg-blue-700 text-white shadow-md shadow-blue-500/20"
                    >
                      Find Jobs
                      <ArrowRight className="w-4 h-4 ml-2" />
                    </Button>
                  </div>
                </motion.div>
              </AnimatePresence>
            )}
          </>
        )}
      </main>
    </div>
  );
}
