/**
 * Enhanced AI CV Builder - Comprehensive Input Collection
 * Collects all necessary details for a professional CV
 */

import React, { useState, useEffect, useRef } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import CVChatbot from "@/components/CVChatbot";
import {
  Sparkles,
  Briefcase,
  GraduationCap,
  Plus,
  X,
  User,
  Target,
  Trash2,
  CheckCircle2,
  Loader2,
  Calendar,
  Image as ImageIcon,
  ChevronDown,
  Globe,
  MapPin,
  Linkedin,
  Phone,
  Mail
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import api from "@/lib/api";
import "@/index.css";
import "@/App.css";
import { toast } from "sonner";

interface Experience {
  role: string;
  company: string;
  location: string;
  startDate: string;
  endDate: string;
  current: boolean;
  achievements: string[];
}

interface Education {
  degree: string;
  institution: string;
  location: string;
  startYear: string;
  endYear: string;
  gpa?: string;
  additionalDetails?: string;
}

interface Project {
  name: string;
  description: string;
  technologies: string;
  link?: string;
}

interface CVBuilderForm {
  mode: string;
  tone: string;
  fullName: string;
  email: string;
  phone: string;
  location: string;
  linkedinUrl: string;
  websiteUrl: string;
  careerGoal: string;
  professionalSummary: string;
  skills: string[];
  experiences: Experience[];
  education: Education[];
  certifications: string[];
  projects: Project[];
  languages: string[];
}

const CVBuilder: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const mode = searchParams.get("mode") || "manual";
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [currentSection, setCurrentSection] = useState(0);
  const [skillInput, setSkillInput] = useState("");
  const [certInput, setCertInput] = useState("");
  const [langInput, setLangInput] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [isGenerated, setIsGenerated] = useState(false);
  const [genProgress, setGenProgress] = useState(0);
  const [showPreview, setShowPreview] = useState(false);
  const [profilePictureUrl, setProfilePictureUrl] = useState<string>("");
  const [uploadLoading, setUploadLoading] = useState(false);

  const [form, setForm] = useState<CVBuilderForm>({
    mode: "Create New",
    tone: "Modern",
    fullName: "",
    email: "",
    phone: "",
    location: "",
    linkedinUrl: "",
    websiteUrl: "",
    careerGoal: "",
    professionalSummary: "",
    skills: [],
    experiences: [],
    education: [],
    certifications: [],
    projects: [],
    languages: [],
  });

  useEffect(() => {
    if (isGenerated && genProgress < 100) {
      const interval = setInterval(() => {
        setGenProgress(prev => {
          if (prev >= 100) {
            clearInterval(interval);
            return 100;
          }
          return prev + 1.5;
        });
      }, 50);
      return () => clearInterval(interval);
    }
  }, [isGenerated, genProgress]);

  const onSelectProfilePicture = async (file: File | null) => {
    if (!file) return;
    setUploadLoading(true);
    try {
      const formData = new FormData();
      formData.append('file', file);
      // Wait to simulate upload
      await new Promise(r => setTimeout(r, 800));
      setProfilePictureUrl(URL.createObjectURL(file));
      toast.success('Profile picture updated!');
    } catch (err: any) {
      toast.error('Failed to upload profile picture');
    } finally {
      setUploadLoading(false);
    }
  };

  const sections = ["Personal Info", "Career Goal", "Skills", "Experience", "Education", "Additional"];
  const sectionIcons = [
    <User className="w-5 h-5" />,
    <Target className="w-5 h-5" />,
    <Sparkles className="w-5 h-5" />,
    <Briefcase className="w-5 h-5" />,
    <GraduationCap className="w-5 h-5" />,
    <Plus className="w-5 h-5" />
  ];

  const sectionSubtitles = [
    "Introduce Yourself To Potential Employers.",
    "Describe Your Professional Goals And The Type Of Roles You're Aiming For.",
    "List Your Key Skills And Expertise To Show Recruiters What You Excel At.",
    "Add Your Work History, Including Job Titles, Companies, And Key Achievements.",
    "Add Your Degrees, GPA, And Graduation Years To Show Your Academic Background.",
    "Add Certifications, Projects, And Languages To Stand Out."
  ];

  const addExperience = () => {
    setForm({
      ...form,
      experiences: [
        ...form.experiences,
        { role: "", company: "", location: "", startDate: "", endDate: "", current: false, achievements: [""] },
      ],
    });
  };

  const updateExperience = (index: number, field: keyof Experience, value: any) => {
    const updated = [...form.experiences];
    updated[index] = { ...updated[index], [field]: value };
    setForm({ ...form, experiences: updated });
  };

  const removeExperience = (index: number) => {
    setForm({ ...form, experiences: form.experiences.filter((_, i) => i !== index) });
  };

  const addAchievement = (expIdx: number) => {
    const updated = [...form.experiences];
    updated[expIdx].achievements.push("");
    setForm({ ...form, experiences: updated });
  };

  const updateAchievement = (expIdx: number, achIdx: number, value: string) => {
    const updated = [...form.experiences];
    updated[expIdx].achievements[achIdx] = value;
    setForm({ ...form, experiences: updated });
  };

  const removeAchievement = (expIdx: number, achIdx: number) => {
    const updated = [...form.experiences];
    updated[expIdx].achievements = updated[expIdx].achievements.filter((_, i) => i !== achIdx);
    setForm({ ...form, experiences: updated });
  };

  const addEducation = () => {
    setForm({
      ...form,
      education: [
        ...form.education,
        { degree: "", institution: "", location: "", startYear: "", endYear: "", gpa: "", additionalDetails: "" },
      ],
    });
  };

  const updateEducation = (index: number, field: keyof Education, value: any) => {
    const updated = [...form.education];
    updated[index] = { ...updated[index], [field]: value };
    setForm({ ...form, education: updated });
  };

  const removeEducation = (index: number) => {
    setForm({ ...form, education: form.education.filter((_, i) => i !== index) });
  };

  const addProject = () => {
    setForm({
      ...form,
      projects: [...form.projects, { name: "", description: "", technologies: "", link: "" }],
    });
  };

  const updateProject = (index: number, field: keyof Project, value: any) => {
    const updated = [...form.projects];
    updated[index] = { ...updated[index], [field]: value };
    setForm({ ...form, projects: updated });
  };

  const removeProject = (index: number) => {
    setForm({ ...form, projects: form.projects.filter((_, i) => i !== index) });
  };

  const nextSection = () => {
    if (currentSection < sections.length - 1) {
      setCurrentSection(prev => prev + 1);
      scrollContainerRef.current?.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const prevSection = () => {
    if (currentSection > 0) {
      setCurrentSection(prev => prev - 1);
      scrollContainerRef.current?.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handleSubmit = async () => {
    if (!showPreview) {
      setShowPreview(true);
      return;
    }
    setSubmitting(true);
    await new Promise(r => setTimeout(r, 1200));
    setSubmitting(false);
    setIsGenerated(true);
  };

  if (mode === "ai") {
    return <CVChatbot onBack={() => navigate("/upload-cv")} />;
  }

  if (isGenerated) {
    return (
      <div className="min-h-screen bg-white flex flex-col items-center justify-center p-6 text-center font-sans overflow-hidden">
        <div className="relative mb-12">
           <div className="relative w-40 h-40 flex items-center justify-center">
              <motion.div initial={{ scale: 0, rotate: -45 }} animate={{ scale: 1, rotate: 0 }} transition={{ type: "spring", damping: 15 }} className="absolute inset-0">
                 <svg viewBox="0 0 100 100" className="w-full h-full text-[#4ade80]"><path fill="currentColor" d="M50 0 L58 8 L69 4 L74 15 L85 15 L85 26 L96 31 L92 42 L100 50 L92 58 L96 69 L85 74 L85 85 L74 85 L69 96 L58 92 L50 100 L42 92 L31 96 L26 85 L15 85 L15 74 L4 69 L8 58 L0 50 L8 42 L4 31 L15 26 L15 15 L26 15 L31 4 L42 8 Z" /></svg>
              </motion.div>
              <motion.div initial={{ opacity: 0, scale: 0.5 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.3 }} className="relative z-10 w-24 h-24 bg-white rounded-full flex items-center justify-center border-4 border-[#4ade80] shadow-xl">
                 <CheckCircle2 className="w-14 h-14 text-[#4ade80]" strokeWidth={3} />
              </motion.div>
           </div>
        </div>
        <h2 className="text-[32px] font-bold text-gray-900 mb-4 max-w-[600px] leading-tight">Wait A Moment While We Finalize Your CV</h2>
        <p className="text-[14px] text-gray-400 font-medium mb-12 max-w-[480px]">Our AI is organizing your information into a professional layout optimized for recruiters and ATS systems.</p>
        <div className="w-full max-w-[400px] h-3 bg-gray-100 rounded-full overflow-hidden relative mb-4">
           <motion.div className="absolute inset-y-0 left-0 bg-gradient-to-r from-blue-600 to-purple-600" initial={{ width: "0%" }} animate={{ width: `${genProgress}%` }}/>
        </div>
        <div className="text-[18px] font-bold text-blue-600 mb-12">%{Math.round(genProgress)}</div>
        {genProgress === 100 && (
          <motion.button initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} onClick={() => navigate("/my-cv")} className="h-14 px-12 rounded-[20px] bg-blue-600 text-white font-bold text-[16px] shadow-xl shadow-blue-600/20 hover:scale-105 transition-all">View My CV</motion.button>
        )}
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen bg-[#f9fafb] font-sans text-gray-900 overflow-x-hidden">
      <div className="flex-1 flex overflow-hidden">
        <div ref={scrollContainerRef} className="flex-1 overflow-y-auto custom-scrollbar">
          <div className="w-full">
            <div className="grid grid-cols-1 xl:grid-cols-[60%_40%] gap-0 min-h-screen">
              {/* Left Column: Form Section */}
              <div className="bg-white border-r border-gray-100 flex flex-col pt-10">
                <div className="w-full px-14 pb-20 flex-1 flex flex-col">
                  <div className="mb-10 text-left">
                    <h1 className="text-[32px] font-bold text-[#3b82f6] leading-tight mb-2">Build Your CV Manually</h1>
                    <p className="text-[16px] text-gray-400 font-medium tracking-tight">Fill In Your Details Step By Step And See Your CV Update In Real Time.</p>
                  </div>

                  {/* Stepper */}
                  <div className="flex items-center justify-between mb-12 relative px-4 text-center">
                    <div className="absolute top-[20px] left-[60px] right-[60px] h-[2px] bg-gray-100 z-0"></div>
                    {sections.map((section, idx) => {
                      const isActive = currentSection === idx;
                      const isCompleted = currentSection > idx;
                      return (
                        <div key={idx} className="flex flex-col items-center gap-3 z-10 relative">
                          <button onClick={() => isCompleted && setCurrentSection(idx)} className={`w-10 h-10 rounded-full flex items-center justify-center transition-all border-2 ${isActive ? 'bg-blue-600 border-blue-600 text-white shadow-lg shadow-blue-500/20' : isCompleted ? 'bg-blue-600 border-blue-600 text-white' : 'bg-white border-gray-100 text-gray-300'}`}>
                            {sectionIcons[idx]}
                          </button>
                          <span className={`text-[11px] font-bold tracking-wide ${isActive ? 'text-blue-600' : 'text-gray-300'}`}>{section}</span>
                        </div>
                      );
                    })}
                  </div>

                  <div className="mb-8 text-left">
                    <h2 className="text-[24px] font-bold text-gray-900 mb-1">{sections[currentSection]}</h2>
                    <p className="text-[14px] text-gray-400 font-medium">{sectionSubtitles[currentSection]}</p>
                  </div>

                  <div className="flex-1 min-h-[450px]">
                    <AnimatePresence mode="wait">
                      {currentSection === 0 && (
                        <motion.div key="s0" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-8 pb-10">
                          {/* Profile Picture Section */}
                          <div className="flex items-center justify-between bg-[#fcfdff] p-6 rounded-2xl border border-gray-100 shadow-sm">
                            <div className="flex items-center gap-5">
                              <div className="relative w-[72px] h-[72px]">
                                <div className="w-full h-full rounded-full bg-white border border-gray-100 flex items-center justify-center overflow-hidden shadow-inner">
                                  {profilePictureUrl ? <img src={profilePictureUrl} className="w-full h-full object-cover" /> : <User className="w-8 h-8 text-gray-200" />}
                                  {uploadLoading && <div className="absolute inset-0 bg-white/80 flex items-center justify-center"><Loader2 className="animate-spin text-blue-600 w-5 h-5" /></div>}
                                </div>
                                <div className="absolute bottom-0 right-0 w-6 h-6 bg-[#8C3AFF] rounded-full border-2 border-white flex items-center justify-center text-white cursor-pointer hover:bg-blue-600 transition-colors">
                                  <Plus className="w-3.5 h-3.5" />
                                </div>
                              </div>
                              <div className="text-left">
                                <h3 className="text-[17px] font-bold text-gray-900 mb-0.5">Profile Picture</h3>
                                <p className="text-[12px] text-gray-400 font-medium whitespace-nowrap">Accepted: JPG, JPEG, PNG, GIF, WEBP (Max 5MB)</p>
                              </div>
                            </div>
                            <label htmlFor="pfp-upload" className="h-[46px] px-6 bg-[#3b82f6] text-white font-bold rounded-xl flex items-center justify-center cursor-pointer hover:bg-blue-700 transition-all text-sm group whitespace-nowrap">
                              <Plus className="w-4 h-4 mr-2 group-hover:rotate-90 transition-transform flex-shrink-0" />
                              <span>Choose File</span>
                            </label>
                            <input type="file" id="pfp-upload" className="hidden" accept="image/*" onChange={(e) => onSelectProfilePicture(e.target.files?.[0] || null)} />
                          </div>

                          <div className="grid grid-cols-2 gap-x-12 gap-y-7">
                            <div className="space-y-2.5 text-left -ml-3">
                              <label className="text-[14px] font-bold text-gray-700">Full Name <span className="text-red-500">*</span></label>
                              <input value={form.fullName} onChange={(e) => setForm({ ...form, fullName: e.target.value })} className="w-full h-12 px-5 rounded-xl border border-gray-100 bg-[#f9fafb] text-[14px] outline-none focus:border-blue-300 focus:bg-white transition-all placeholder:text-gray-300" placeholder="Enter Your Full Name" />
                            </div>
                            <div className="space-y-2.5 text-left pl-3 mr-[-15px]">
                              <label className="text-[14px] font-bold text-gray-700">Email <span className="text-red-500">*</span></label>
                              <input value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} className="w-full h-12 px-5 rounded-xl border border-gray-100 bg-[#f9fafb] text-[14px] outline-none focus:border-blue-300 focus:bg-white transition-all placeholder:text-gray-300" placeholder="Enter Your Email" />
                            </div>
                            <div className="space-y-2.5 text-left -ml-3">
                              <label className="text-[14px] font-bold text-gray-700">Phone Number <span className="text-red-500">*</span></label>
                              <div className="flex gap-4">
                                <div className="h-12 px-2 rounded-xl border border-gray-100 bg-[#f9fafb] flex items-center gap-1 min-w-[72px] cursor-pointer">
                                  <img src="https://flagcdn.com/w20/jo.png" className="w-[18px] h-3 rounded-[1px]" alt="JO" />
                                  <span className="text-[13px] font-bold">+962</span>
                                  <ChevronDown className="w-3.5 h-3.5 text-gray-400" />
                                </div>
                                <input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} className="flex-1 h-12 px-5 rounded-xl border border-gray-100 bg-[#f9fafb] text-[14px] outline-none focus:border-blue-300 focus:bg-white transition-all" placeholder="Enter Phone Number" />
                              </div>
                            </div>
                            <div className="space-y-2.5 text-left pl-3 mr-[-15px]">
                              <label className="text-[14px] font-bold text-gray-700">Location <span className="text-red-500">*</span></label>
                              <input value={form.location} onChange={(e) => setForm({ ...form, location: e.target.value })} className="w-full h-12 px-5 rounded-xl border border-gray-100 bg-[#f9fafb] text-[14px] outline-none focus:border-blue-300 focus:bg-white transition-all placeholder:text-gray-300" placeholder="Enter Your Location" />
                            </div>
                            <div className="space-y-2.5 text-left -ml-3">
                              <label className="text-[14px] font-bold text-gray-700">LinkedIn URL</label>
                              <input value={form.linkedinUrl} onChange={(e) => setForm({ ...form, linkedinUrl: e.target.value })} className="w-full h-12 px-5 rounded-xl border border-gray-100 bg-[#f9fafb] text-[14px] outline-none focus:border-blue-300 focus:bg-white transition-all placeholder:text-gray-300" placeholder="https://linkedin.com/..." />
                            </div>
                            <div className="space-y-2.5 text-left pl-3 mr-[-15px]">
                              <label className="text-[14px] font-bold text-gray-700">Portfolio/Website</label>
                              <input value={form.websiteUrl} onChange={(e) => setForm({ ...form, websiteUrl: e.target.value })} className="w-full h-12 px-5 rounded-xl border border-gray-100 bg-[#f9fafb] text-[14px] outline-none focus:border-blue-300 focus:bg-white transition-all placeholder:text-gray-300" placeholder="https://..." />
                            </div>
                          </div>
                        </motion.div>
                      )}

                      {currentSection === 1 && (
                        <motion.div key="s1" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-7">
                          <div className="space-y-2.5 text-left">
                            <label className="text-[14px] font-bold text-gray-700">Career Goal / Title</label>
                            <input value={form.careerGoal} onChange={(e) => setForm({ ...form, careerGoal: e.target.value })} className="w-full h-12 px-5 rounded-xl border border-gray-100 bg-[#f9fafb] text-[14px] outline-none focus:border-blue-300 focus:bg-white transition-all" placeholder="e.g. Senior Software Engineer" />
                          </div>
                          <div className="space-y-2.5 text-left">
                            <label className="text-[14px] font-bold text-gray-700">Professional Summary</label>
                            <textarea value={form.professionalSummary} onChange={(e) => setForm({ ...form, professionalSummary: e.target.value })} className="w-full h-40 p-5 rounded-xl border border-gray-100 bg-[#f9fafb] text-[14px] outline-none focus:border-blue-300 focus:bg-white transition-all resize-none" placeholder="Briefly describe your professional background and key strengths..." />
                          </div>
                        </motion.div>
                      )}

                      {currentSection === 2 && (
                        <motion.div key="s2" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-7">
                          <div className="space-y-4 text-left">
                            <label className="text-[14px] font-bold text-gray-700">Core Skills</label>
                            <div className="flex gap-2">
                              <input value={skillInput} onChange={(e) => setSkillInput(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && !!skillInput.trim() && (setForm({...form, skills: [...form.skills, skillInput.trim()]}), setSkillInput(""))} className="flex-1 h-12 px-5 rounded-xl border border-gray-100 bg-[#f9fafb] text-[14px] outline-none" placeholder="e.g. React.js, Python, Sales" />
                              <button onClick={() => !!skillInput.trim() && (setForm({...form, skills: [...form.skills, skillInput.trim()]}), setSkillInput(""))} className="h-12 px-8 bg-blue-600 text-white font-bold rounded-xl shadow-lg shadow-blue-600/10 hover:bg-blue-700 transition-all">+ Add</button>
                            </div>
                            <div className="flex flex-wrap gap-2.5 pt-4">
                              {form.skills.map((skill, index) => (
                                <div key={index} className="px-4 py-2 bg-blue-50 text-blue-600 rounded-full text-[13px] font-bold flex items-center gap-2 group">
                                  {skill}
                                  <X className="w-3.5 h-3.5 cursor-pointer hover:text-red-500 transition-colors" onClick={() => setForm({...form, skills: form.skills.filter((_, i) => i !== index)})} />
                                </div>
                              ))}
                              {form.skills.length === 0 && <p className="text-[14px] text-gray-300 font-medium">No Skills Added Yet</p>}
                            </div>
                          </div>
                        </motion.div>
                      )}

                      {currentSection === 3 && (
                        <motion.div key="s3" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-6">
                           {form.experiences.map((exp, idx) => (
                             <div key={idx} className="p-8 rounded-3xl bg-[#fcfdff] border border-gray-100 text-left relative mb-6">
                                <button onClick={() => removeExperience(idx)} className="absolute top-6 right-6 text-gray-300 hover:text-red-500 transition-colors"><Trash2 className="w-5 h-5"/></button>
                                <div className="grid grid-cols-2 gap-6 mb-6">
                                   <div className="space-y-2">
                                      <label className="text-[13px] font-bold text-gray-600 uppercase">Role / Job Title</label>
                                      <input value={exp.role} onChange={(e) => updateExperience(idx, 'role', e.target.value)} className="w-full h-12 px-4 rounded-xl border border-gray-50 bg-white" placeholder="e.g. Project Manager" />
                                   </div>
                                   <div className="space-y-2">
                                      <label className="text-[13px] font-bold text-gray-600 uppercase">Company</label>
                                      <input value={exp.company} onChange={(e) => updateExperience(idx, 'company', e.target.value)} className="w-full h-12 px-4 rounded-xl border border-gray-50 bg-white" placeholder="e.g. Google" />
                                   </div>
                                </div>
                                <div className="flex gap-6 mb-6">
                                   <div className="flex-1 space-y-2">
                                      <label className="text-[13px] font-bold text-gray-600 uppercase">Location</label>
                                      <input value={exp.location} onChange={(e) => updateExperience(idx, 'location', e.target.value)} className="w-full h-12 px-4 rounded-xl border border-gray-50 bg-white" placeholder="e.g. Jordan, Amman" />
                                   </div>
                                   <div className="flex-1 space-y-2">
                                      <label className="text-[13px] font-bold text-gray-600 uppercase">Start Date</label>
                                      <input type="month" value={exp.startDate} onChange={(e) => updateExperience(idx, 'startDate', e.target.value)} className="w-full h-12 px-4 rounded-xl border border-gray-50 bg-white" />
                                   </div>
                                   <div className="flex-1 space-y-2">
                                      <label className="text-[13px] font-bold text-gray-600 uppercase"> {exp.current ? 'End Date' : 'End Date'}</label>
                                      <input type="month" disabled={exp.current} value={exp.endDate} onChange={(e) => updateExperience(idx, 'endDate', e.target.value)} className={`w-full h-12 px-4 rounded-xl border border-gray-50 bg-white ${exp.current ? 'opacity-50 grayscale' : ''}`} />
                                   </div>
                                </div>
                                <div className="flex items-center gap-2 mb-6">
                                   <input type="checkbox" checked={exp.current} onChange={(e) => updateExperience(idx, 'current', e.target.checked)} className="w-4 h-4 rounded" />
                                   <span className="text-[13px] font-bold text-gray-500">I Currently Work Here</span>
                                </div>
                                <div className="space-y-4">
                                   <label className="text-[13px] font-bold text-gray-600 uppercase">Key Achievements</label>
                                   {exp.achievements.map((ach, aIdx) => (
                                     <div key={aIdx} className="flex gap-2">
                                        <input value={ach} onChange={(e) => updateAchievement(idx, aIdx, e.target.value)} className="flex-1 h-11 px-4 rounded-lg border border-gray-50 bg-white text-[13.5px]" placeholder="Built a new feature that increased revenue by..." />
                                        <button onClick={() => removeAchievement(idx, aIdx)} className="p-2 text-gray-300 hover:text-red-500"><X className="w-4 h-4"/></button>
                                     </div>
                                   ))}
                                   <button onClick={() => addAchievement(idx)} className="text-[13px] font-bold text-[#3b82f6]">+ Add Achievement</button>
                                </div>
                             </div>
                           ))}
                           <button onClick={addExperience} className="w-full py-6 rounded-3xl border-2 border-dashed border-gray-100 text-gray-300 font-bold hover:border-[#3b82f6] hover:text-[#3b82f6] transition-all flex items-center justify-center gap-2">+ Add Experience</button>
                        </motion.div>
                      )}

                      {currentSection === 4 && (
                        <motion.div key="s4" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-6">
                           {form.education.map((edu, idx) => (
                             <div key={idx} className="p-8 rounded-3xl bg-[#fcfdff] border border-gray-100 text-left relative mb-6">
                                <button onClick={() => removeEducation(idx)} className="absolute top-6 right-6 text-gray-300 hover:text-red-500 transition-colors"><Trash2 className="w-5 h-5"/></button>
                                <div className="grid grid-cols-2 gap-6 mb-6">
                                   <div className="space-y-2">
                                      <label className="text-[13px] font-bold text-gray-600 uppercase">Degree/Qualification</label>
                                      <input value={edu.degree} onChange={(e) => updateEducation(idx, 'degree', e.target.value)} className="w-full h-12 px-4 rounded-xl border border-gray-50 bg-white" placeholder="e.g. Bachelor of CS" />
                                   </div>
                                   <div className="space-y-2">
                                      <label className="text-[13px] font-bold text-gray-600 uppercase">Institution</label>
                                      <input value={edu.institution} onChange={(e) => updateEducation(idx, 'institution', e.target.value)} className="w-full h-12 px-4 rounded-xl border border-gray-50 bg-white" placeholder="e.g. University of Jordan" />
                                   </div>
                                </div>
                                <div className="grid grid-cols-3 gap-6">
                                   <div className="space-y-2">
                                      <label className="text-[13px] font-bold text-gray-600 uppercase">Location</label>
                                      <input value={edu.location} onChange={(e) => updateEducation(idx, 'location', e.target.value)} className="w-full h-12 px-4 rounded-xl border border-gray-50 bg-white" placeholder="e.g. Amman" />
                                   </div>
                                   <div className="space-y-2">
                                      <label className="text-[13px] font-bold text-gray-600 uppercase">Start Year</label>
                                      <input placeholder="2018" value={edu.startYear} onChange={(e) => updateEducation(idx, 'startYear', e.target.value)} className="w-full h-12 px-4 rounded-xl border border-gray-50 bg-white" />
                                   </div>
                                   <div className="space-y-2">
                                      <label className="text-[13px] font-bold text-gray-600 uppercase">End Year</label>
                                      <input placeholder="2022" value={edu.endYear} onChange={(e) => updateEducation(idx, 'endYear', e.target.value)} className="w-full h-12 px-4 rounded-xl border border-gray-50 bg-white" />
                                   </div>
                                </div>
                             </div>
                           ))}
                           <button onClick={addEducation} className="w-full py-6 rounded-3xl border-2 border-dashed border-gray-100 text-gray-300 font-bold hover:border-[#3b82f6] hover:text-[#3b82f6] transition-all flex items-center justify-center gap-2">+ Add Education</button>
                        </motion.div>
                      )}

                      {currentSection === 5 && (
                        <motion.div key="s5" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-8 text-left pb-10">
                            <div className="space-y-4">
                              <label className="text-[14px] font-bold text-gray-700">Certifications</label>
                              <div className="flex gap-3">
                                <input value={certInput} onChange={(e) => setCertInput(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && !!certInput.trim() && (setForm({...form, certifications: [...form.certifications, certInput.trim()]}), setCertInput(""))} className="flex-1 h-12 px-5 rounded-xl border border-gray-100 bg-[#f9fafb] text-[14px]" placeholder="e.g. AWS Certified Architect" />
                                <button onClick={() => !!certInput.trim() && (setForm({...form, certifications: [...form.certifications, certInput.trim()]}), setCertInput(""))} className="px-8 bg-blue-600 text-white font-bold rounded-xl shadow-lg shadow-blue-600/10 hover:bg-blue-700 transition-all">+ Add</button>
                              </div>
                              <div className="flex flex-wrap gap-2 pt-2">
                                {form.certifications.map((c, i) => <div key={i} className="px-4 py-2 bg-blue-50 text-blue-700 rounded-lg text-[12px] font-bold flex items-center gap-2">{c} <X className="w-3.5 h-3.5 cursor-pointer" onClick={() => setForm({...form, certifications: form.certifications.filter((_, idx) => idx !== i)})} /></div>)}
                              </div>
                            </div>
                            <div className="space-y-4">
                              <label className="text-[14px] font-bold text-gray-700">Projects</label>
                              {form.projects.map((proj, idx) => (
                                <div key={idx} className="p-6 rounded-2xl bg-[#fcfdff] border border-gray-100 relative mb-4">
                                   <button onClick={() => removeProject(idx)} className="absolute top-4 right-4 text-gray-300 hover:text-red-500"><X /></button>
                                   <div className="space-y-4 pt-2">
                                      <input value={proj.name} onChange={(e) => updateProject(idx, 'name', e.target.value)} className="w-full h-11 px-4 rounded-xl border border-gray-50" placeholder="Project Name" />
                                      <textarea value={proj.description} onChange={(e) => updateProject(idx, 'description', e.target.value)} className="w-full h-20 p-4 rounded-xl border border-gray-50 resize-none" placeholder="Short Project Description" />
                                   </div>
                                </div>
                              ))}
                              <button onClick={addProject} className="w-full py-4 rounded-xl border-2 border-dashed border-gray-100 text-gray-300 font-bold hover:border-[#3b82f6] hover:text-[#3b82f6] transition-all">+ Add Project</button>
                            </div>
                            <div className="space-y-4">
                              <label className="text-[14px] font-bold text-gray-700">Languages</label>
                              <div className="flex gap-3">
                                <input value={langInput} onChange={(e) => setLangInput(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && !!langInput.trim() && (setForm({...form, languages: [...form.languages, langInput.trim()]}), setLangInput(""))} className="flex-1 h-12 px-5 rounded-xl border border-gray-100 bg-[#f9fafb] text-[14px]" placeholder="e.g. Arabic (Native), English (Fluent)" />
                                <button onClick={() => !!langInput.trim() && (setForm({...form, languages: [...form.languages, langInput.trim()]}), setLangInput(""))} className="px-8 bg-blue-600 text-white font-bold rounded-xl shadow-lg shadow-blue-600/10 hover:bg-blue-700 transition-all">+ Add</button>
                              </div>
                              <div className="flex flex-wrap gap-2 pt-2">
                                {form.languages.map((l, i) => <div key={i} className="px-4 py-2 bg-purple-50 text-purple-700 rounded-lg text-[12px] font-bold flex items-center gap-2">{l} <X className="w-3.5 h-3.5 cursor-pointer" onClick={() => setForm({...form, languages: form.languages.filter((_, idx) => idx !== i)})} /></div>)}
                              </div>
                            </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>

                  <div className="flex items-center justify-between pt-10 mt-auto border-t border-gray-50 bg-white sticky bottom-0 z-20 pb-4">
                    {currentSection > 0 ? (
                      <button onClick={prevSection} className="h-13 px-12 rounded-xl border-2 border-[#3b82f6] text-[#3b82f6] font-bold text-[15px] hover:bg-blue-50 transition-all">Back</button>
                    ) : (
                      <div />
                    )}
                    <button onClick={currentSection === sections.length - 1 ? handleSubmit : nextSection} className="h-13 px-12 rounded-xl bg-[#3b82f6] text-white font-bold text-[15px] shadow-lg shadow-blue-500/20 hover:scale-[1.02] transition-all">
                      {currentSection === sections.length - 1 ? (showPreview ? "Finalize & Download" : "Generate CV") : `Next: ${sections[currentSection + 1]}`}
                    </button>
                  </div>
                </div>
              </div>

              {/* Right Column: Preview Area - Exactly 50% width */}
              <div className="hidden xl:block h-screen sticky top-0 bg-[#fcfdff] border-l border-gray-100 shadow-inner">
                <div className="h-full p-10 flex flex-col relative overflow-y-auto custom-scrollbar">
                  <div className="flex items-center justify-between mb-8 border-b border-gray-100 pb-4">
                    <h3 className="text-[18px] font-bold text-gray-900">Preview Your CV</h3>
                  </div>

                  {!showPreview ? (
                    <div className="flex-1 flex flex-col items-center justify-center text-center p-12">
                       <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex flex-col items-center">
                          <div className="w-24 h-24 mb-6 flex items-center justify-center bg-white rounded-3xl shadow-sm relative">
                             <Sparkles className="w-12 h-12 text-gray-200" />
                          </div>
                          <p className="text-[16px] font-bold text-gray-400 max-w-[280px]">Fill In The Form And Generate Your Professional CV</p>
                       </motion.div>
                    </div>
                  ) : (
                    <div className="flex-1 text-left animate-in fade-in zoom-in-95 duration-500">
                         <div className="w-full px-10 py-10 font-sans text-gray-800">
                            <div className="text-center border-b-2 border-blue-600 pb-8 mb-10">
                               <h1 className="text-[32px] font-bold tracking-tight text-gray-900 uppercase mb-2">{form.fullName || "YOUR NAME"}</h1>
                               <p className="text-[14px] font-bold text-blue-600 tracking-widest uppercase mb-4">{form.careerGoal || "PROFESSIONAL TITLE"}</p>
                               <div className="flex flex-wrap justify-center gap-x-6 gap-y-2 text-[12px] font-medium text-gray-500">
                                  {form.email && <span className="flex items-center gap-1"><Mail className="w-3 h-3"/> {form.email}</span>}
                                  {form.phone && <span className="flex items-center gap-1"><Phone className="w-3 h-3"/> {form.phone}</span>}
                                  {form.location && <span className="flex items-center gap-1"><MapPin className="w-3 h-3"/> {form.location}</span>}
                                  {form.linkedinUrl && <span className="flex items-center gap-1"><Linkedin className="w-3 h-3"/> LinkedIn</span>}
                                  {form.websiteUrl && <span className="flex items-center gap-1"><Globe className="w-3 h-3"/> Portfolio</span>}
                               </div>
                            </div>
                            <div className="space-y-10">
                               {form.professionalSummary && (
                                 <section>
                                    <h2 className="text-[14px] font-black text-gray-900 uppercase border-b border-gray-100 pb-2 mb-4 tracking-wider">Professional Profile</h2>
                                    <p className="text-[13px] leading-relaxed text-gray-600">{form.professionalSummary}</p>
                                 </section>
                               )}
                               {form.experiences.length > 0 && (
                                 <section>
                                    <h2 className="text-[14px] font-black text-gray-900 uppercase border-b border-gray-100 pb-2 mb-4 tracking-wider">Work Experience</h2>
                                    <div className="space-y-8">
                                       {form.experiences.map((exp, i) => (
                                         <div key={i}>
                                            <div className="flex justify-between items-baseline mb-2">
                                               <h3 className="text-[15px] font-bold text-gray-900">{exp.role}</h3>
                                               <span className="text-[12px] font-bold text-gray-400">{exp.startDate} - {exp.current ? 'Present' : exp.endDate}</span>
                                            </div>
                                            <div className="text-[13px] font-bold text-blue-600 mb-3">{exp.company} | {exp.location}</div>
                                            <ul className="list-disc list-inside space-y-1">
                                               {exp.achievements.map((a, j) => a && <li key={j} className="text-[12px] text-gray-600 leading-relaxed pl-2">{a}</li>)}
                                            </ul>
                                         </div>
                                       ))}
                                    </div>
                                 </section>
                               )}
                               {form.education.length > 0 && (
                                 <section>
                                    <h2 className="text-[14px] font-black text-gray-900 uppercase border-b border-gray-100 pb-2 mb-4 tracking-wider">Education</h2>
                                    <div className="space-y-6">
                                       {form.education.map((edu, i) => (
                                         <div key={i}>
                                            <div className="flex justify-between items-baseline mb-1">
                                               <h3 className="text-[14px] font-bold text-gray-900">{edu.degree}</h3>
                                               <span className="text-[11px] font-bold text-gray-400">{edu.startYear} - {edu.endYear}</span>
                                            </div>
                                            <div className="text-[12px] font-bold text-gray-500">{edu.institution} | GPA: {edu.gpa}</div>
                                         </div>
                                       ))}
                                    </div>
                                 </section>
                               )}
                            </div>
                         </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CVBuilder;
