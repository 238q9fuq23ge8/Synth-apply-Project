import { useState, useRef, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { 
  Upload, 
  Plus, 
  Eye, 
  Trash2, 
  Target, 
  Brain, 
  FileText, 
  Loader2,
  ChevronRight,
  ClipboardList,
  Sparkles,
  Zap,
  X
} from "lucide-react";
import api from "@/lib/api";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";

const ExtractedFieldsModal = ({ 
  isOpen, 
  onClose, 
  data 
}: { 
  isOpen: boolean; 
  onClose: () => void; 
  data: any 
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-white rounded-xl shadow-2xl w-full max-w-lg overflow-hidden"
      >
        <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
          <h2 className="text-lg font-bold text-gray-900">Extracted Fields</h2>
          <button onClick={onClose} className="p-1 hover:bg-gray-100 rounded-full transition-colors">
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>
        <div className="p-6 max-h-[70vh] overflow-y-auto space-y-5">
          {[
            { label: "Name", value: data.name },
            { label: "Title", value: data.title },
            { label: "Location", value: data.location },
            { label: "Email", value: data.email },
            { label: "Phone", value: data.phone },
            { label: "Summary", value: data.summary },
          ].map((field, idx) => (
            <div key={idx}>
              <label className="block text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-1">
                {field.label}:
              </label>
              <p className="text-[14px] text-gray-700 leading-relaxed">
                {field.value || "Not found"}
              </p>
            </div>
          ))}
        </div>
        <div className="p-4 bg-gray-50 border-t border-gray-100">
          <Button 
            onClick={onClose}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white rounded-lg py-6 font-semibold"
          >
            Close
          </Button>
        </div>
      </motion.div>
    </div>
  );
};

const BuildCVChoice = ({ onSelectManual, onSelectAI }: { onSelectManual: () => void; onSelectAI: () => void }) => {
  return (
    <div className="mt-4">
      <h1 className="text-[#3b82f6] text-[2.2rem] font-bold tracking-tight mb-1.5">
        Build Your CV
      </h1>
      <p className="text-gray-500 text-[14px] font-medium mb-10">
        Choose The Method That Works Best For You. Either Take Full Control Manually Or Let Our AI Guide You Through The Process.
      </p>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Manual Build */}
        <Card className="bg-white rounded-xl shadow-[0_2px_15px_-3px_rgba(0,0,0,0.04)] border border-gray-100 hover:border-blue-200 transition-all p-8 flex flex-col items-start">
          <div className="w-12 h-12 bg-gray-50 rounded-lg flex items-center justify-center mb-6">
            <ClipboardList className="w-6 h-6 text-gray-400" />
          </div>
          <h3 className="text-[17px] font-bold text-gray-900 mb-3">Fill It Manually</h3>
          <p className="text-gray-400 text-[13px] font-medium leading-relaxed mb-10">
            A Guided Step-By-Step Form For Users Who Prefer Total Control And Already Have All Their Information Ready To Go.
          </p>
          <Button 
            onClick={onSelectManual}
            variant="outline" 
            className="w-full border-blue-500 text-blue-500 hover:bg-blue-50 rounded-lg py-5 font-semibold text-[13px]"
          >
            Start Manual Build
          </Button>
        </Card>

        {/* AI Build */}
        <Card className="bg-white rounded-xl shadow-[0_2px_15px_-3px_rgba(0,0,0,0.04)] border border-gray-100 hover:border-blue-200 transition-all p-8 flex flex-col items-start relative overflow-hidden">
          <div className="absolute top-4 right-4 bg-gradient-to-r from-purple-500 to-pink-500 text-white text-[10px] font-bold px-3 py-1 rounded-full uppercase">
            Recommended
          </div>
          <div className="w-12 h-12 bg-blue-50 rounded-lg flex items-center justify-center mb-6">
            <Sparkles className="w-6 h-6 text-blue-600" />
          </div>
          <h3 className="text-[17px] font-bold text-gray-900 mb-3">Build With AI Assistant</h3>
          <p className="text-gray-400 text-[13px] font-medium leading-relaxed mb-10">
            Interactive AI Conversation That Generates Content Faster And Helps You Stand Out To Top Recruiters.
          </p>
          <Button 
            onClick={onSelectAI}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white rounded-lg py-5 font-semibold text-[13px] flex items-center justify-center gap-2"
          >
            Start With AI <Zap className="w-4 h-4 fill-white" />
          </Button>
        </Card>
      </div>
    </div>
  );
};

const UploadCV = () => {
  const [isUploading, setIsUploading] = useState(false);
  const [isParsing, setIsParsing] = useState(false);
  const [isBuildChoiceOpen, setIsBuildChoiceOpen] = useState(false);
  const [parsedData, setParsedData] = useState<any>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [cvId, setCvId] = useState<string | null>(null);
  const [parsedCvLocal, setParsedCvLocal] = useState<any>(null);
  
  const [credits, setCredits] = useState<number>(65);
  const [daysLeft, setDaysLeft] = useState<number>(4);
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const storedCvId = localStorage.getItem("current_cv_id");
    setCvId(storedCvId);

    const storedParsed = localStorage.getItem("parsed_cv");
    if (storedParsed) {
      setParsedCvLocal(JSON.parse(storedParsed));
    }

    const storedCredits = localStorage.getItem("remaining_credits");
    if (storedCredits && !isNaN(Number(storedCredits))) setCredits(Number(storedCredits));
    
    const trialEnds = localStorage.getItem("trial_ends_at");
    if (trialEnds) {
      const end = new Date(trialEnds).getTime();
      const now = Date.now();
      const left = Math.max(0, Math.floor((end - now) / (1000 * 60 * 60 * 24)));
      setDaysLeft(left);
    }
  }, []);

  const handleFileSelect = () => fileInputRef.current?.click();

  const processCvFile = async (file?: File) => {
    if (!file) return;

    const token = localStorage.getItem("access_token");
    if (!token) {
      toast.error("Please log in first.");
      return;
    }

    if (!["pdf", "docx"].some(ext => file.name.toLowerCase().endsWith(ext))) {
      toast.error("Only PDF or DOCX files are allowed.");
      return;
    }

    try {
      setIsUploading(true);
      const formData = new FormData();
      formData.append("file", file);

      // 1️⃣ Upload
      const uploadRes = await api.post("/v1/cv/upload", formData, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "multipart/form-data",
        },
      });

      const { cv_id } = uploadRes.data;
      localStorage.setItem("current_cv_id", cv_id);
      setCvId(cv_id);

      setIsParsing(true);
      setIsUploading(false);

      // 2️⃣ Parse
      const parseRes = await api.post(
        "/v1/ai/parse-cv",
        { cv_id },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (parseRes.data.remaining_credits !== undefined) {
        localStorage.setItem("remaining_credits", parseRes.data.remaining_credits);
        setCredits(parseRes.data.remaining_credits);
      }

      const parsed = parseRes.data.parsed || {};
      const extracted = {
        name: parsed.name || "",
        title: parsed.title || "",
        experience: Array.isArray(parsed.experience) ? parsed.experience : [],
        skills: Array.isArray(parsed.skills) ? parsed.skills : [],
        email: parsed.email || "",
        phone: parsed.phone || "",
        location: parsed.location || "",
        summary: parsed.summary || "",
      };

      localStorage.setItem("parsed_cv", JSON.stringify(extracted));
      setParsedCvLocal(extracted);
      setParsedData(extracted);
      setIsModalOpen(true);

    } catch (err: any) {
      console.error("❌ Upload or Parse failed:", err);
      toast.error(err?.response?.data?.detail || "Failed to upload or parse your CV.");
    } finally {
      setIsUploading(false);
      setIsParsing(false);
    }
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    await processCvFile(file);
  };

  const handleFileDrop = async (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    const file = e.dataTransfer.files?.[0];
    await processCvFile(file);
  };

  const handleDeleteCV = () => {
    if (window.confirm("Are you sure you want to delete your current CV?")) {
      localStorage.removeItem("current_cv_id");
      localStorage.removeItem("parsed_cv");
      setCvId(null);
      setParsedCvLocal(null);
      toast.success("CV removed successfully");
    }
  };

  if (isBuildChoiceOpen) {
    return (
      <div className="min-h-screen bg-[#f8fafc] font-sans">
        <main className="w-full max-w-[1300px] mx-auto px-6 py-8">
          <BuildCVChoice 
            onSelectManual={() => navigate("/cv-builder?mode=manual")}
            onSelectAI={() => navigate("/cv-builder?mode=ai")}
          />
          <div className="mt-8">
            <Button 
              variant="outline" 
              onClick={() => setIsBuildChoiceOpen(false)}
              className="border-gray-200 text-gray-500 hover:bg-gray-50"
            >
              Back to My CV
            </Button>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f8fafc] font-sans">
      <main className="w-full max-w-[1300px] mx-auto px-6 py-8">
        
        {/* Header Section */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
          <div>
            <h1 className="text-[#3b82f6] text-[2.2rem] font-bold tracking-tight mb-1.5">
              My CV
            </h1>
            <p className="text-gray-500 text-[14px] font-medium">
              Manage Your Resume Or Build It With AI, And Use It To Apply For Jobs.
            </p>
          </div>
          
          <div className="bg-gray-50/80 border border-gray-100 rounded-lg py-2 px-4 shadow-sm flex flex-col justify-center min-w-[200px]">
            <div className="flex items-center gap-1.5 font-bold text-gray-800 text-[13px] mb-0.5">
              <span className="text-yellow-400 text-[16px] leading-none">⚡</span>
              <span><span className="text-[#3b82f6]">{credits}</span> Credits Left</span>
            </div>
            <div className="text-[11px] text-gray-400 font-medium ml-5">
              Trial expires in {daysLeft} days
            </div>
          </div>
        </div>

        {/* Action Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
          {/* Upload Card */}
          <Card
            className="bg-white rounded-xl shadow-[0_2px_15px_-3px_rgba(0,0,0,0.04)] py-10 flex flex-col items-center justify-center relative overflow-hidden h-[220px] border-gray-100 cursor-pointer"
            onDragOver={(e) => {
              e.preventDefault();
              e.stopPropagation();
            }}
            onDrop={handleFileDrop}
            onClick={() => {
              if (!isUploading && !isParsing) handleFileSelect();
            }}
          >
            {isUploading || isParsing ? (
              <div className="flex flex-col items-center justify-center text-center px-6">
                <div className="relative w-14 h-14 mb-4 flex items-center justify-center">
                  {/* Custom Dot Spinner */}
                  <div className="absolute inset-0 flex items-center justify-center animate-spin">
                    {[...Array(8)].map((_, i) => (
                      <div
                        key={i}
                        className="absolute w-1.5 h-1.5 bg-blue-600 rounded-full"
                        style={{
                          transform: `rotate(${i * 45}deg) translateY(-20px)`,
                          opacity: 1 - i * 0.1,
                        }}
                      />
                    ))}
                  </div>
                </div>
                <h3 className="text-[17px] font-bold text-gray-900 mb-1">
                  {isUploading ? "Uploading Your CV..." : "Analyzing Your Resume..."}
                </h3>
                <p className="text-gray-400 text-[13px] font-medium max-w-[280px]">
                  {isUploading ? "Storing your file securely..." : "Extracting Name, Skills, Experience, And Contact Info."}
                </p>
              </div>
            ) : (
              <>
                <div className="w-12 h-12 bg-gray-50 rounded-full flex items-center justify-center mb-5 border border-gray-100">
                  <Upload className="w-5 h-5 text-gray-800" strokeWidth={2} />
                </div>
                <div className="text-gray-700 font-bold text-[15px] mb-2 z-10 text-center px-4">
                  Drag & Drop Your CV Or{" "}
                  <span 
                    className="text-[#3b82f6] underline decoration-1 underline-offset-[3px] hover:text-blue-600 cursor-pointer" 
                    onClick={handleFileSelect}
                  >
                    Choose File
                  </span>{" "}
                  To Upload
                </div>
                <div className="text-gray-400 text-[13px] font-medium z-10">
                  Supported Formats: PDF, DOCX (Max 8MB)
                </div>
              </>
            )}
            <input
              ref={fileInputRef}
              type="file"
              accept=".pdf,.docx"
              className="hidden"
              onChange={handleFileChange}
            />
          </Card>

          {/* AI Builder Card */}
          <Card 
            onClick={() => setIsBuildChoiceOpen(true)}
            className="bg-gradient-to-br from-blue-500 via-blue-600 to-blue-700 rounded-xl shadow-[0_8px_30px_rgb(59,130,246,0.2)] flex flex-col items-center justify-center p-8 h-[220px] cursor-pointer hover:scale-[1.01] transition-all group border-none"
          >
            <div className="w-14 h-14 bg-white/20 backdrop-blur-md rounded-2xl flex items-center justify-center mb-5 group-hover:scale-110 transition-transform">
              <Plus className="w-7 h-7 text-white" />
            </div>
            <h3 className="text-white text-[19px] font-bold mb-2">Build CV With AI</h3>
            <p className="text-blue-100 text-[13px] font-medium opacity-90">Create A Perfect Resume In Minutes Using AI</p>
          </Card>
        </div>

        {/* Lower Sections: Current Resume & Analyze Your CV */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
          
          {/* Left Column: Current Resume */}
          <div>
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-[1.05rem] font-bold text-gray-900 tracking-tight">Current Resume</h2>
              {cvId && <div className="text-[11px] text-gray-400 font-medium">Last Updated: 2 Hours Ago</div>}
            </div>
            
            {cvId && parsedCvLocal ? (
              <div className="bg-white rounded-xl shadow-[0_2px_15px_-3px_rgba(0,0,0,0.04)] border border-gray-100 p-4 py-5 flex items-center justify-between">
                <div className="flex items-center gap-4">
                  {/* Premium CV Preview Thumbnail */}
                  <div className="w-16 h-20 bg-white rounded-lg overflow-hidden border border-gray-100 flex flex-col shadow-sm group-hover:border-blue-200 transition-colors">
                    <div className="h-4 bg-blue-50 w-full flex items-center px-1.5 gap-1">
                      <div className="w-1 h-1 rounded-full bg-blue-400"></div>
                      <div className="w-6 h-[2px] bg-blue-100 rounded-full"></div>
                    </div>
                    <div className="p-2 space-y-1.5 flex-1">
                      <div className="h-[2px] bg-gray-100 w-full rounded-full"></div>
                      <div className="h-[2px] bg-gray-100 w-[80%] rounded-full"></div>
                      <div className="h-[2px] bg-gray-100 w-full rounded-full"></div>
                      <div className="h-[2px] bg-gray-100 w-[60%] rounded-full"></div>
                      <div className="mt-2 space-y-1">
                        <div className="h-[2px] bg-blue-50 w-[40%] rounded-full"></div>
                        <div className="h-[2px] bg-gray-50 w-full rounded-full"></div>
                      </div>
                    </div>
                  </div>
                  <div>
                    <h4 className="text-[14px] font-bold text-gray-900 mb-0.5">{parsedCvLocal.title || "Senior_UXDesigner_CV_2026"}.Pdf</h4>
                    <div className="flex flex-col gap-0.5">
                      <span className="text-gray-400 text-[11px] font-medium flex items-center gap-1">
                        <Upload className="w-3 h-3" /> Uploaded On Jan 15, 2024
                      </span>
                      <span className="text-gray-400 text-[11px] font-medium flex items-center gap-1">
                        <FileText className="w-3 h-3" /> 12 Job Applied
                      </span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Button 
                    variant="outline" 
                    size="icon" 
                    onClick={() => {
                      setParsedData(parsedCvLocal);
                      setIsModalOpen(true);
                    }}
                    className="rounded-lg border-blue-500/20 p-0 h-9 w-9 flex items-center justify-center group hover:bg-blue-50 hover:border-blue-300"
                  >
                    <Eye className="w-4 h-4 text-blue-500" />
                  </Button>
                  <Button 
                    variant="outline" 
                    size="icon" 
                    onClick={handleDeleteCV}
                    className="rounded-lg border-red-100 p-0 h-9 w-9 flex items-center justify-center hover:bg-red-50 hover:border-red-200"
                  >
                    <Trash2 className="w-4 h-4 text-red-500" />
                  </Button>
                </div>
              </div>
            ) : (
              <div className="bg-gray-50 border border-dashed border-gray-200 rounded-xl py-10 text-center">
                <p className="text-gray-400 text-[12px]">No resume uploaded yet.</p>
              </div>
            )}
          </div>

          {/* Right Column: Analyze Your CV */}
          <div>
            <h2 className="text-[1.05rem] font-bold text-gray-900 mb-5 tracking-tight">Analyze Your CV</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Match To Job */}
              <Card 
                onClick={() => navigate("/job-search")}
                className="bg-white rounded-xl shadow-[0_2px_15px_-3px_rgba(0,0,0,0.04)] border border-gray-100 p-5 flex flex-col items-start gap-4 cursor-pointer hover:border-blue-200 transition-all group h-full"
              >
                <div className="flex items-center justify-between w-full">
                  <div className="w-10 h-10 bg-blue-50 rounded-lg flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform">
                    <Target className="w-5 h-5 text-blue-600" />
                  </div>
                  <ChevronRight className="w-4 h-4 text-gray-200 group-hover:text-blue-500 group-hover:translate-x-1 transition-all" />
                </div>
                <div>
                  <h3 className="text-[15px] font-bold text-gray-900 mb-2">Match To Job</h3>
                  <p className="text-gray-400 text-[12px] font-medium leading-relaxed">
                    Run your current CV against thousands of open roles using AI.
                  </p>
                </div>
              </Card>

              {/* Skill Gap Analysis */}
              <Card 
                onClick={() => navigate("/skill-gap-analysis")}
                className="bg-white rounded-xl shadow-[0_2px_15px_-3px_rgba(0,0,0,0.04)] border border-gray-100 p-5 flex flex-col items-start gap-4 cursor-pointer hover:border-blue-200 transition-all group h-full"
              >
                <div className="flex items-center justify-between w-full">
                  <div className="w-10 h-10 bg-blue-50 rounded-lg flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform">
                    <Brain className="w-5 h-5 text-blue-600" />
                  </div>
                  <ChevronRight className="w-4 h-4 text-gray-200 group-hover:text-blue-500 group-hover:translate-x-1 transition-all" />
                </div>
                <div>
                  <h3 className="text-[15px] font-bold text-gray-900 mb-2">Skill Gap Analysis</h3>
                  <p className="text-gray-400 text-[12px] font-medium leading-relaxed">
                    Identify missing skills and get training recommendations.
                  </p>
                </div>
              </Card>
            </div>
          </div>
        </div>

        {/* Modal */}
        <ExtractedFieldsModal 
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          data={parsedData || parsedCvLocal || {}}
        />

      </main>
    </div>
  );
};

export default UploadCV;
