import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Link, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import api from "../lib/api";
import { supabase } from "@/lib/supabaseClient";
import { toast } from "sonner";
import { MainLayout } from "@/components/layout/MainLayout";
import { AuthError } from "@/components/auth/AuthError";
import ScopeLogo from "@/assets/WhatsApp_Image_2025-10-17_at_13.05.55_6ba1ea04-removebg-preview (1).png";
import { 
  User, Mail, Lock, ChevronDown, Check,
  Smartphone, Globe, Briefcase, Calendar, MapPin, Building2, UploadCloud,
  EyeOff, Search, Eye
} from "lucide-react";

const Signup = () => {
  const navigate = useNavigate();

  // Form State
  const [step, setStep] = useState<number | 'emailSent'>(1);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<any>({});
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Step 1
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [accountType, setAccountType] = useState<"job_seeker" | "recruiter">("job_seeker");

  // Step 2
  const [phonePrefix, setPhonePrefix] = useState("+962");
  const [phone, setPhone] = useState("");
  const [nationality, setNationality] = useState("");
  const [profession, setProfession] = useState("");
  const [dateOfBirth, setDateOfBirth] = useState("");
  const [location, setLocation] = useState("");
  const [isNationalityOpen, setIsNationalityOpen] = useState(false);
  const [isPrefixOpen, setIsPrefixOpen] = useState(false);
  const [isProfessionOpen, setIsProfessionOpen] = useState(false);
  const [isLocationOpen, setIsLocationOpen] = useState(false);
  const [phonePrefixFlag, setPhonePrefixFlag] = useState("🇯🇴");

  const prefixes = [
    { code: "+962", flag: "🇯🇴", name: "Jordan" },
    { code: "+971", flag: "🇦🇪", name: "UAE" },
    { code: "+966", flag: "🇸🇦", name: "Saudi Arabia" },
    { code: "+965", flag: "🇰🇼", name: "Kuwait" },
    { code: "+974", flag: "🇶🇦", name: "Qatar" },
    { code: "+973", flag: "🇧🇭", name: "Bahrain" },
    { code: "+968", flag: "🇴🇲", name: "Oman" },
    { code: "+20", flag: "🇪🇬", name: "Egypt" },
    { code: "+91", flag: "🇮🇳", name: "India" },
    { code: "+90", flag: "🇹🇷", name: "Turkey" },
    { code: "+1", flag: "🇺🇸", name: "USA" },
    { code: "+44", flag: "🇬🇧", name: "UK" }
  ];

  const professions = [
    "Software Engineer", "Frontend Developer", "Backend Developer", "Full Stack Developer",
    "Product Manager", "UI/UX Designer", "Data Scientist", "Mobile App Developer",
    "QA Engineer", "DevOps Engineer", "Marketing Manager", "Sales Representative",
    "Digital Marketer", "Accountant", "Business Analyst", "HR Specialist", "Graphic Designer"
  ];

  // Step 3 (Recruiter Only)
  const [companyName, setCompanyName] = useState("");
  const [companyLogo, setCompanyLogo] = useState<File | null>(null);

  const countries = [
    "Afghanistan", "Albania", "Algeria", "Argentina", "Armenia", "Australia",
    "Austria", "Azerbaijan", "Bahrain", "Bangladesh", "Belarus", "Belgium",
    "Brazil", "Canada", "China", "Denmark", "Egypt", "Finland", "France", 
    "Germany", "India", "Indonesia", "Iran", "Iraq", "Ireland", "Italy", 
    "Japan", "Jordan", "Kuwait", "Lebanon", "Malaysia", "Mexico", "Morocco", 
    "Netherlands", "Nigeria", "Norway", "Pakistan", "Philippines", "Poland", 
    "Qatar", "Russia", "Saudi Arabia", "Singapore", "South Africa", "South Korea",
    "Spain", "Sweden", "Switzerland", "Turkey", "United Arab Emirates", 
    "United Kingdom", "United States"
  ];

  const handleNext = () => {
    setErrors({});
    let newErrors: any = {};
    let hasError = false;

    if (step === 1) {
      if (!name) { newErrors.name = "Full Name is required."; hasError = true; }
      if (!email) { newErrors.email = "Email Address is required."; hasError = true; }
      if (!password) { newErrors.password = "Password is required."; hasError = true; }
      if (!confirmPassword) { newErrors.confirmPassword = "Confirm Password is required."; hasError = true; }
      
      if (!hasError) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
          newErrors.email = "Please Enter A Valid Email Address";
          hasError = true;
        }
        if (password !== confirmPassword) {
          newErrors.confirmPassword = "Passwords Do Not Match, Please Make Sure Both Fields Are Identical.";
          hasError = true;
        }
        if (password.length < 8) {
          newErrors.password = "Password Must Be At Least 8 Characters Long";
          hasError = true;
        }
      }

      if (hasError) {
        if (!name || !email || !password || !confirmPassword) {
          newErrors.global = "Please Fill In All The Required Fields Before Proceeding.";
        }
        setErrors(newErrors);
        return;
      }
      setStep(2);
    } else if (step === 2) {
      if (!phone) { 
        newErrors.phone = "Phone number is required."; 
        hasError = true; 
      } else {
        if (phone.length !== 9) {
          newErrors.phone = "Phone Number Must Be 9 Digits";
          hasError = true;
        } else if (!/^(77|78|79)/.test(phone)) {
          newErrors.phone = "Invalid Phone Number. Must Start With 77, 78, Or 79";
          hasError = true;
        }
      }
      if (!nationality) { newErrors.nationality = "Nationality is required."; hasError = true; }
      if (!profession) { newErrors.profession = "Profession is required."; hasError = true; }

      if (hasError) {
        newErrors.global = "Please Fill In All The Required Fields Before Proceeding.";
        setErrors(newErrors);
        return;
      }

      if (accountType === "recruiter") {
        setStep(3);
      } else {
        handleSubmit();
      }
    }
  };

  const handleBack = () => {
    setErrors({});
    if (step === 3) setStep(2);
    if (step === 2) setStep(1);
  };

  const handleSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setErrors({});
    
    if (accountType === "recruiter" && (step as any) !== 3) {
       // Should not happen if UI is correct, but just in case
       handleNext();
       return;
    }
    
    if (accountType === "recruiter" && (step as any) === 3) {
      let newErrors: any = {};
      let hasError = false;
      if (!companyName) { newErrors.companyName = "Company Name is required."; hasError = true; }
      if (!companyLogo) { newErrors.companyLogo = "Company Logo is required."; hasError = true; }
      
      if (hasError) {
        newErrors.global = "Please Fill In All The Required Fields Before Proceeding.";
        setErrors(newErrors);
        return;
      }
    }

    setLoading(true);
    try {
      const response = await api.post("/v1/auth/signup", {
        email,
        password,
        metadata: { 
          name, 
          person: accountType, 
          phone: `${phonePrefix} ${phone}`, 
          nationality, 
          profession, 
          date_of_birth: dateOfBirth || null, 
          location: location || null,
          company_name: companyName || null
        },
      });
      const data = response.data;
      if (!data.access_token) throw new Error("No token returned");
      localStorage.setItem("access_token", data.access_token);
      localStorage.setItem("user_email", email);
      setStep('emailSent');
    } catch (error: any) {
      let errorMsg = "Signup failed. Please try again.";
      const data = error?.response?.data;
      if (data) {
        if (typeof data === 'string') errorMsg = data;
        else if (data.detail) errorMsg = data.detail;
        else if (data.msg) errorMsg = data.msg;
        else errorMsg = JSON.stringify(data);
      }
      setErrors({ global: errorMsg });
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignup = async () => {
    try {
      localStorage.setItem("pending_auth_mode", "sign_up");
      localStorage.removeItem("pending_account_type");
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: { redirectTo: window.location.origin + '/auth/callback' }
      });
      if (error) throw error;
    } catch (error: any) {
      toast.error(error.message || "Failed to sign up with Google");
    }
  };

  let strength = 0;
  if (password.length > 0) strength = 1;
  if (password.length >= 6) strength = 2;
  if (password.length >= 8 && /[A-Z]/.test(password) && /[0-9]/.test(password)) strength = 3;

  let strengthColor = "bg-slate-100";
  let strengthText = "";
  let textColor = "";

  if (strength === 1) {
    strengthColor = "bg-red-500";
    strengthText = "Weak";
    textColor = "text-red-500";
  } else if (strength === 2) {
    strengthColor = "bg-amber-400";
    strengthText = "Medium";
    textColor = "text-amber-500";
  } else if (strength === 3) {
    strengthColor = "bg-[#16a34a]";
    strengthText = "Strong";
    textColor = "text-[#16a34a]";
  }

  const FieldError = ({ message }: { message?: string }) => {
    if (!message) return null;
    return (
      <div className="text-red-500 text-[11px] font-bold mt-1.5 flex items-center gap-1.5">
        <div className="w-[12px] h-[12px] flex items-center justify-center rounded-full bg-red-500 text-white text-[8px] font-bold">!</div>
        {message}
      </div>
    );
  };

  return (
    <MainLayout hideFooter={true}>
      <div className="min-h-[calc(100vh-72px)] bg-[#fafcff] flex items-center justify-center p-4 sm:p-8 relative overflow-hidden">
        
        {/* Subtle background waves */}
        <div className="absolute inset-0 z-0 pointer-events-none opacity-40">
          <svg className="absolute w-full h-full" xmlns="http://www.w3.org/2000/svg">
            <path d="M0,200 Q200,300 400,200 T800,200 T1200,200" fill="none" stroke="#e2e8f0" strokeWidth="1" />
            <path d="M0,400 Q300,500 600,400 T1200,400" fill="none" stroke="#e2e8f0" strokeWidth="1" />
            <path d="M-200,600 Q200,700 600,600 T1400,600" fill="none" stroke="#f1f5f9" strokeWidth="2" />
          </svg>
        </div>

        {step === 'emailSent' ? (
          <div className="w-full max-w-[1100px] min-h-[640px] bg-white rounded-3xl shadow-[0_8px_40px_rgb(0,0,0,0.06)] flex overflow-hidden border border-slate-100 relative z-10 transition-all duration-500">
             {/* Left Sidebar Fixed for success */}
             <div className="w-[280px] bg-[#f8fafc] border-r border-slate-100 p-10 flex flex-col hidden md:flex">
               <div className="flex items-center gap-2 mb-16">
                 <img src={ScopeLogo} alt="Scope AI" className="w-8 h-8 object-contain" />
                 <span className="text-[20px] font-bold text-[#333] tracking-tight">Scope AI</span>
               </div>
               <div className="flex flex-col gap-0 relative">
                 <div className="absolute left-[13px] top-[24px] bottom-[24px] w-px bg-slate-200 z-0" />
                 <div className="relative z-10 flex items-center gap-4 py-4 bg-[#f8fafc]">
                   <div className="w-[26px] h-[26px] rounded-full flex items-center justify-center bg-[#16a34a] border-2 border-[#16a34a]">
                     <Check className="w-3.5 h-3.5 text-white stroke-[3px]" />
                   </div>
                   <span className="text-[13px] font-bold text-[#16a34a]">Account Details</span>
                 </div>
                 <div className="relative z-10 flex items-center gap-4 py-4 bg-[#f8fafc]">
                   <div className="w-[26px] h-[26px] rounded-full flex items-center justify-center bg-[#16a34a] border-2 border-[#16a34a]">
                     <Check className="w-3.5 h-3.5 text-white stroke-[3px]" />
                   </div>
                   <span className="text-[13px] font-bold text-[#16a34a]">Profile Details</span>
                 </div>
                 <div className="relative z-10 flex items-center gap-4 py-4 bg-[#f8fafc]">
                   <div className="w-[26px] h-[26px] rounded-full flex items-center justify-center bg-[#16a34a] border-2 border-[#16a34a]">
                     <Check className="w-3.5 h-3.5 text-white stroke-[3px]" />
                   </div>
                   <span className="text-[13px] font-bold text-[#16a34a]">Company Details</span>
                 </div>
               </div>
             </div>

             <div className="flex-1 flex flex-col items-center justify-center p-12 text-center bg-white">
                <div className="relative mb-10">
                   {/* Envelope with Logo Illustration */}
                   <div className="w-[120px] h-[120px] bg-blue-50/50 rounded-full flex items-center justify-center relative">
                      <div className="absolute inset-0 bg-blue-100/30 scale-125 blur-xl rounded-full animate-pulse" />
                      <div className="relative w-[80px] h-[60px] bg-blue-600 rounded-lg flex items-center justify-center shadow-lg">
                        <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-blue-500 to-blue-700 rounded-lg" />
                        <div className="z-10 bg-white p-1.5 rounded-md shadow-sm">
                           <img src={ScopeLogo} alt="" className="w-6 h-6 object-contain" />
                        </div>
                        {/* Envelope flap details */}
                        <div className="absolute -top-1 left-0 w-full h-[40px] border-x-[40px] border-x-transparent border-t-[40px] border-t-white/10" />
                      </div>
                   </div>
                </div>

                <h2 className="text-[32px] font-bold text-[#2563eb] mb-4">Check Your Email</h2>
                <div className="max-w-md mx-auto">
                   <p className="text-[#64748b] text-[15px] leading-relaxed mb-10">
                      We've sent an account activation link to <strong className="text-blue-600 underline font-semibold">{email}</strong><br/>
                      Please follow the instructions in the email to activate your account.
                   </p>
                </div>
                
                <Button 
                   onClick={() => navigate("/login")} 
                   variant="outline"
                   className="w-full max-w-sm h-[52px] border-slate-200 text-[#2563eb] font-bold rounded-xl hover:bg-slate-50 transition-all border-2"
                >
                   Go To Login
                </Button>
             </div>
          </div>
        ) : (
          <div className="w-full max-w-[1100px] min-h-[640px] bg-white rounded-3xl shadow-[0_8px_40px_rgb(0,0,0,0.06)] flex overflow-hidden border border-slate-100 relative z-10 transition-all duration-500">
            
            {/* Left Sidebar */}
            <div className="w-[280px] bg-[#f8fafc] border-r border-slate-100 p-10 flex flex-col hidden md:flex">
              <div className="flex items-center gap-2 mb-16">
                <img src={ScopeLogo} alt="Scope AI" className="w-8 h-8 object-contain" />
                <span className="text-[20px] font-bold text-[#333] tracking-tight">Scope AI</span>
              </div>

              <div className="flex flex-col gap-0 relative">
                {/* Connecting Line */}
                <div className="absolute left-[13px] top-[24px] bottom-[24px] w-px bg-slate-200 z-0" />
                
                {/* Step 1 */}
                <div className="relative z-10 flex items-center gap-4 py-4 bg-[#f8fafc]">
                  <div className={`w-[26px] h-[26px] rounded-full flex items-center justify-center border-2 transition-all ${step > 1 ? 'bg-[#16a34a] border-[#16a34a]' : step === 1 ? 'border-[#333] bg-white shadow-[0_0_0_4px_rgba(37,99,235,0.05)]' : 'border-slate-300 bg-white'}`}>
                    {step > 1 ? <Check className="w-3.5 h-3.5 text-white stroke-[3px]" /> : <User className={`w-3.5 h-3.5 ${step === 1 ? 'text-[#333]' : 'text-slate-300'}`} />}
                  </div>
                  <span className={`text-[13px] font-bold ${step > 1 ? 'text-[#16a34a]' : step === 1 ? 'text-[#333]' : 'text-slate-400'}`}>Account Details</span>
                </div>

                {/* Step 2 */}
                <div className={`relative z-10 flex items-center gap-4 py-4 bg-[#f8fafc] transition-all duration-500`}>
                  <div className={`w-[26px] h-[26px] rounded-full flex items-center justify-center border-2 transition-all ${step > 2 ? 'bg-[#16a34a] border-[#16a34a]' : step === 2 ? 'border-[#333] bg-white shadow-[0_0_0_4px_rgba(37,99,235,0.05)]' : 'border-slate-300 bg-white'}`}>
                    {step > 2 ? <Check className="w-3.5 h-3.5 text-white stroke-[3px]" /> : <User className={`w-3.5 h-3.5 ${step === 2 ? 'text-[#333]' : 'text-slate-300'}`} />}
                  </div>
                  <span className={`text-[13px] font-bold ${step > 2 ? 'text-[#16a34a]' : step === 2 ? 'text-[#333]' : 'text-slate-400'}`}>Profile Details</span>
                </div>

                {/* Step 3 (Only visible if recruiter) */}
                <div className={`relative z-10 items-center gap-4 py-4 bg-[#f8fafc] transition-all duration-500 ${accountType === "recruiter" ? "flex" : "hidden opacity-0"}`}>
                   <div className={`w-[26px] h-[26px] rounded-full flex items-center justify-center border-2 transition-all ${(step as any) === 'emailSent' ? 'bg-[#16a34a] border-[#16a34a]' : (step as any) === 3 ? 'border-[#333] bg-white shadow-[0_0_0_4px_rgba(37,99,235,0.05)]' : 'border-slate-300 bg-white'}`}>
                    {(step as any) === 'emailSent' ? <Check className="w-3.5 h-3.5 text-white stroke-[3px]" /> : <Building2 className={`w-3.5 h-3.5 ${(step as any) === 3 ? 'text-[#333]' : 'text-slate-300'}`} />}
                  </div>
                  <span className={`text-[13px] font-bold ${(step as any) === 'emailSent' ? 'text-[#16a34a]' : (step as any) === 3 ? 'text-[#333]' : 'text-slate-400'}`}>Company Details</span>
                </div>
              </div>
            </div>

            {/* Main Form Area */}
            <div className="flex-1 p-8 md:p-12 lg:p-14 flex flex-col bg-white">
              <div className="max-w-2xl w-full mx-auto flex-1 flex flex-col">
                
                <div className="mb-8">
                  <h1 className="text-[28px] md:text-[32px] font-bold text-[#2563eb] mb-2 tracking-tight">Create Your Account</h1>
                  <p className="text-[14px] text-slate-500 mb-3">Get started with Scope AI and unlock smarter job searching powered by AI.</p>
                  <p className="text-[12px] font-bold text-blue-500 flex items-center gap-1.5"><Check className="w-3.5 h-3.5" /> Join 10,000+ Professionals Already Using Scope AI</p>
                </div>

                <form onSubmit={(e) => { e.preventDefault(); if (step === (accountType === 'recruiter' ? 3 : 2)) handleSubmit(); else handleNext(); }} className="flex-1 flex-col">


                  {/* STEP 1 */}
                  {step === 1 && (
                    <motion.div initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} className="space-y-6 flex-1">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                          <Label className="text-[13px] font-bold text-slate-700">Full Name <span className="text-red-500">*</span></Label>
                          <div className="relative">
                            <User className="absolute left-4 top-1/2 -translate-y-1/2 h-[16px] w-[16px] text-slate-300" />
                            <Input placeholder="Enter Your Full Name" value={name} onChange={e => setName(e.target.value)} className={`pl-11 h-[52px] rounded-[10px] text-[14px] transition-colors focus-visible:ring-1 focus-visible:ring-[#2563eb] ${errors.name || (errors.global && !name) ? 'bg-white border-red-500 text-slate-800' : 'bg-[#f8fafc] border-transparent placeholder:text-slate-400'}`} />
                          </div>
                          <FieldError message={errors.name} />
                        </div>
                        <div className="space-y-2">
                          <Label className="text-[13px] font-bold text-slate-700">Email Address <span className="text-red-500">*</span></Label>
                          <div className="relative">
                            <Mail className="absolute left-4 top-1/2 -translate-y-1/2 h-[16px] w-[16px] text-slate-300" />
                            <Input type="email" placeholder="Enter Your Email Address" value={email} onChange={e => setEmail(e.target.value)} className={`pl-11 h-[52px] rounded-[10px] text-[14px] transition-colors focus-visible:ring-1 focus-visible:ring-[#2563eb] ${errors.email || (errors.global && !email) ? 'bg-white border-red-500 text-slate-800' : 'bg-[#f8fafc] border-transparent placeholder:text-slate-400'}`} />
                          </div>
                          <FieldError message={errors.email} />
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
                        <div className="space-y-2">
                          <Label className="text-[13px] font-bold text-slate-700 flex items-center gap-1.5">Password <span className="text-red-500">*</span> <span className="text-slate-400 cursor-help flex items-center justify-center w-3.5 h-3.5 rounded-full bg-slate-100 text-[9px] font-bold">i</span></Label>
                          <div className="relative">
                            <Lock className="absolute left-4 top-1/2 -translate-y-1/2 h-[16px] w-[16px] text-slate-300" />
                            <Input type={showPassword ? "text" : "password"} placeholder="Enter Your Password" value={password} onChange={e => setPassword(e.target.value)} className={`pl-11 pr-11 h-[52px] rounded-[10px] text-[14px] transition-colors focus-visible:ring-1 focus-visible:ring-[#2563eb] ${errors.password || (errors.global && !password) ? 'bg-white border-red-500 text-slate-800' : 'bg-[#f8fafc] border-transparent placeholder:text-slate-400'}`} />
                            <div className="absolute right-4 top-1/2 -translate-y-1/2 cursor-pointer text-slate-300 hover:text-slate-500" onClick={() => setShowPassword(!showPassword)}>
                               {showPassword ? <Eye className="h-[16px] w-[16px]" /> : <EyeOff className="h-[16px] w-[16px]" />}
                            </div>
                          </div>
                          {password.length > 0 && (
                            <div>
                              <div className="flex gap-1.5 mt-2">
                                <div className={`h-[3px] flex-1 rounded-full ${strength >= 1 ? strengthColor : 'bg-slate-200'}`} />
                                <div className={`h-[3px] flex-1 rounded-full ${strength >= 2 ? strengthColor : 'bg-slate-200'}`} />
                                <div className={`h-[3px] flex-1 rounded-full ${strength >= 3 ? strengthColor : 'bg-slate-200'}`} />
                              </div>
                              <div className={`text-[10px] font-bold mt-1.5 text-right ${textColor}`}>
                                {strengthText}
                              </div>
                            </div>
                          )}
                          <FieldError message={errors.password} />
                        </div>
                        <div className="space-y-2">
                          <Label className="text-[13px] font-bold text-slate-700">Confirm Password <span className="text-red-500">*</span></Label>
                          <div className="relative">
                            <Lock className="absolute left-4 top-1/2 -translate-y-1/2 h-[16px] w-[16px] text-slate-300" />
                            <Input type={showConfirmPassword ? "text" : "password"} placeholder="Enter Your Password" value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} className={`pl-11 pr-11 h-[52px] rounded-[10px] text-[14px] transition-colors focus-visible:ring-1 focus-visible:ring-[#2563eb] ${errors.confirmPassword || (errors.global && !confirmPassword) ? 'bg-white border-red-500 text-slate-800' : 'bg-[#f8fafc] border-transparent placeholder:text-slate-400'}`} />
                            <div className="absolute right-4 top-1/2 -translate-y-1/2 cursor-pointer text-slate-300 hover:text-slate-500" onClick={() => setShowConfirmPassword(!showConfirmPassword)}>
                               {showConfirmPassword ? <Eye className="h-[16px] w-[16px]" /> : <EyeOff className="h-[16px] w-[16px]" />}
                            </div>
                          </div>
                          {confirmPassword && password === confirmPassword && (
                            <div className="flex items-center gap-1.5 mt-1.5">
                              <Check className="w-3 h-3 text-[#16a34a] stroke-[3px]" />
                              <span className="text-[#16a34a] text-[10px] font-bold">Passwords Match</span>
                            </div>
                          )}
                          <FieldError message={errors.confirmPassword} />
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-[1fr_auto] gap-6 items-end mt-2">
                        <div className="space-y-2">
                          <Label className="text-[13px] font-bold text-slate-700">Account Type <span className="text-red-500">*</span></Label>
                          <div className="flex gap-4">
                            <button type="button" onClick={() => setAccountType("job_seeker")} className={`flex-1 flex flex-row items-center py-2 px-3 border rounded-[10px] transition-colors min-h-[52px] ${accountType === "job_seeker" ? "bg-white border-blue-500 shadow-[0_2px_10px_rgb(59,130,246,0.06)]" : "bg-[#f8fafc] border-slate-100"} ${(errors.global && !accountType) ? "border-red-500 bg-[#fffafa]" : ""}`}>
                              <div className="w-8 flex items-center justify-center">
                                <Search className={`w-4 h-4 ${accountType === "job_seeker" ? "text-blue-500" : "text-slate-400"}`} />
                              </div>
                              <div className="flex flex-col items-start ml-1">
                                <span className={`text-[13px] font-bold ${accountType === "job_seeker" ? "text-[#333]" : "text-slate-500"}`}>Job Seeker</span>
                                <span className="text-[10px] text-slate-400">Finding Opportunities</span>
                              </div>
                            </button>
                            <button type="button" onClick={() => setAccountType("recruiter")} className={`flex-1 flex flex-row items-center py-2 px-3 border rounded-[10px] transition-colors min-h-[52px] ${accountType === "recruiter" ? "bg-white border-blue-500 shadow-[0_2px_10px_rgb(59,130,246,0.06)]" : "bg-[#f8fafc] border-slate-100"} ${(errors.global && !accountType) ? "border-red-500 bg-[#fffafa]" : ""}`}>
                              <div className="w-8 flex items-center justify-center">
                                <Building2 className={`w-4 h-4 ${accountType === "recruiter" ? "text-blue-500" : "text-slate-400"}`} />
                              </div>
                              <div className="flex flex-col items-start ml-1">
                                <span className={`text-[13px] font-bold ${accountType === "recruiter" ? "text-[#333]" : "text-slate-500"}`}>Recruiter</span>
                                <span className="text-[10px] text-slate-400">Hiring Top Talent</span>
                              </div>
                            </button>
                          </div>
                        </div>
                        
                        <Button type="button" onClick={handleNext} className="h-[52px] w-full md:w-[150px] bg-[#2563eb] hover:bg-blue-600 text-white font-bold text-[14px] rounded-[10px] shadow-sm">
                           Next
                        </Button>
                      </div>

                      {errors.global && (
                        <div className="bg-red-50 rounded-[8px] p-2 flex items-center gap-2 mt-2 w-fit px-3">
                          <div className="w-[12px] h-[12px] flex items-center justify-center rounded-full bg-red-500 text-white text-[8px] font-bold">!</div>
                          <span className="text-red-500 text-[11px] font-bold">{errors.global}</span>
                        </div>
                      )}
                    </motion.div>
                  )}

                  {/* STEP 2 */}
                  {step === 2 && (
                    <motion.div initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} className="space-y-6 flex-1">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2 relative">
                          <Label className="text-[13px] font-bold text-slate-700">Phone Number <span className="text-red-500">*</span></Label>
                          <div className="flex gap-2">
                            <div className="relative w-[110px]">
                               <div 
                                 className="flex items-center gap-2 pl-3 h-[52px] bg-[#f8fafc] border-transparent rounded-[10px] text-[14px] cursor-pointer border hover:border-slate-200 transition-all"
                                 onClick={() => setIsPrefixOpen(!isPrefixOpen)}
                               >
                                 <span className="text-[16px]">{phonePrefixFlag}</span>
                                 <span className="text-[13px] font-bold text-slate-700">{phonePrefix}</span>
                                 <ChevronDown className={`w-3.5 h-3.5 text-slate-400 transition-transform ${isPrefixOpen ? 'rotate-180' : ''}`} />
                               </div>
                               
                               {isPrefixOpen && (
                                 <div className="absolute top-[calc(100%+8px)] left-0 w-[220px] bg-white border border-slate-100 shadow-xl rounded-xl max-h-[220px] overflow-y-auto z-[60] py-2">
                                    {prefixes.map(p => (
                                      <div 
                                        key={p.code} 
                                        onClick={() => { setPhonePrefix(p.code); setPhonePrefixFlag(p.flag); setIsPrefixOpen(false); }} 
                                        className="px-4 py-2 hover:bg-slate-50 cursor-pointer text-[13px] text-slate-700 flex items-center gap-3"
                                      >
                                        <span className="text-[16px]">{p.flag}</span>
                                        <span className="font-bold flex-1">{p.code}</span>
                                        <span className="text-slate-400 text-[11px]">{p.name}</span>
                                      </div>
                                    ))}
                                 </div>
                               )}
                            </div>
                            <Input placeholder="Enter Your Phone Number" value={phone} onChange={e => setPhone(e.target.value)} className={`flex-1 h-[52px] rounded-[10px] text-[14px] transition-colors focus-visible:ring-1 focus-visible:ring-[#2563eb] ${errors.phone || (errors.global && !phone) ? 'bg-white border-red-500 text-slate-800' : 'bg-[#f8fafc] border-transparent placeholder:text-slate-400'}`} />
                          </div>
                          <FieldError message={errors.phone} />
                        </div>
                        <div className="space-y-2 relative">
                          <Label className="text-[13px] font-bold text-slate-700">Nationality <span className="text-red-500">*</span></Label>
                          <div className="relative">
                            <Globe className="absolute left-4 top-1/2 -translate-y-1/2 h-[16px] w-[16px] text-slate-300 pointer-events-none z-10" />
                            <Input 
                              placeholder="Select Your Nationality"
                              value={nationality}
                              onChange={e => { setNationality(e.target.value); setIsNationalityOpen(true); }}
                              onFocus={() => setIsNationalityOpen(true)}
                              className={`pl-11 pr-10 h-[52px] rounded-[10px] text-[14px] transition-colors focus-visible:ring-1 focus-visible:ring-[#2563eb] ${errors.nationality || (errors.global && !nationality) ? 'bg-white border-red-500 text-slate-800' : 'bg-[#f8fafc] border-transparent placeholder:text-slate-400'}`} 
                            />
                            <ChevronDown className={`absolute right-4 top-1/2 -translate-y-1/2 h-[16px] w-[16px] text-slate-400 cursor-pointer transition-transform ${isNationalityOpen ? 'rotate-180' : ''}`} onClick={() => setIsNationalityOpen(!isNationalityOpen)} />
                          </div>
                          <FieldError message={errors.nationality} />
                          
                          {isNationalityOpen && (
                            <div className="absolute top-[calc(100%+8px)] left-0 w-full bg-white border border-slate-100 shadow-xl rounded-xl max-h-[220px] overflow-y-auto z-50 py-2">
                               {countries.filter(c => c.toLowerCase().includes(nationality.toLowerCase())).map(c => (
                                 <div key={c} onClick={() => { setNationality(c); setIsNationalityOpen(false); }} className="px-4 py-2 hover:bg-slate-50 cursor-pointer text-[13px] text-slate-700">{c}</div>
                               ))}
                               {countries.filter(c => c.toLowerCase().includes(nationality.toLowerCase())).length === 0 && (
                                  <div className="px-4 py-2 text-[12px] text-slate-400 italic">No results found</div>
                               )}
                            </div>
                          )}
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2 relative">
                          <Label className="text-[13px] font-bold text-slate-700">Profession/Job Title <span className="text-red-500">*</span></Label>
                          <div className="relative">
                            <Briefcase className="absolute left-4 top-1/2 -translate-y-1/2 h-[16px] w-[16px] text-slate-300 pointer-events-none z-10" />
                            <Input 
                              placeholder="Select Your Profession/Job Title" 
                              value={profession} 
                              onChange={e => { setProfession(e.target.value); setIsProfessionOpen(true); }}
                              onFocus={() => setIsProfessionOpen(true)}
                              className={`pl-11 h-[52px] rounded-[10px] text-[14px] transition-colors focus-visible:ring-1 focus-visible:ring-[#2563eb] ${errors.profession || (errors.global && !profession) ? 'bg-white border-red-500 text-slate-800' : 'bg-[#f8fafc] border-transparent placeholder:text-slate-400'}`} 
                            />
                            <ChevronDown className={`absolute right-4 top-1/2 -translate-y-1/2 h-[16px] w-[16px] text-slate-400 cursor-pointer transition-transform ${isProfessionOpen ? 'rotate-180' : ''}`} onClick={() => setIsProfessionOpen(!isProfessionOpen)} />
                          </div>
                          <FieldError message={errors.profession} />

                          {isProfessionOpen && (
                            <div className="absolute top-[calc(100%+8px)] left-0 w-full bg-white border border-slate-100 shadow-xl rounded-xl max-h-[220px] overflow-y-auto z-50 py-2">
                               {professions.filter(p => p.toLowerCase().includes(profession.toLowerCase())).map(p => (
                                 <div key={p} onClick={() => { setProfession(p); setIsProfessionOpen(false); }} className="px-4 py-2 hover:bg-slate-50 cursor-pointer text-[13px] text-slate-700">{p}</div>
                               ))}
                               {professions.filter(p => p.toLowerCase().includes(profession.toLowerCase())).length === 0 && (
                                  <div className="px-4 py-2 text-[12px] text-slate-400 italic">No results found</div>
                               )}
                            </div>
                          )}
                        </div>
                        <div className="space-y-2">
                          <Label className="text-[13px] font-bold text-slate-700">Date Of Birth <span className="text-slate-400 font-normal">(Optional)</span></Label>
                          <div className="relative">
                            <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 h-[16px] w-[16px] text-slate-300 pointer-events-none" />
                            <Input type="date" value={dateOfBirth} onChange={e => setDateOfBirth(e.target.value)} className="pl-11 h-[52px] bg-[#f8fafc] border-transparent rounded-[10px] text-[14px] text-slate-400" />
                          </div>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-[1fr_auto_auto] gap-4 items-end pt-4">
                        <div className="space-y-2 relative">
                          <Label className="text-[13px] font-bold text-slate-700">Current Location <span className="text-slate-400 font-normal">(Optional)</span></Label>
                          <div className="relative">
                            <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 h-[16px] w-[16px] text-slate-300 pointer-events-none z-10" />
                            <Input 
                              placeholder="Select Your Current Location" 
                              value={location} 
                              onChange={e => { setLocation(e.target.value); setIsLocationOpen(true); }} 
                              onFocus={() => setIsLocationOpen(true)}
                              className="pl-11 h-[52px] bg-[#f8fafc] border-transparent rounded-[10px] text-[14px] placeholder:text-slate-400" 
                            />
                            <ChevronDown className={`absolute right-4 top-1/2 -translate-y-1/2 h-[16px] w-[16px] text-slate-400 cursor-pointer transition-transform ${isLocationOpen ? 'rotate-180' : ''}`} onClick={() => setIsLocationOpen(!isLocationOpen)} />
                          </div>

                          {isLocationOpen && (
                            <div className="absolute top-[calc(100%+8px)] left-0 w-full bg-white border border-slate-100 shadow-xl rounded-xl max-h-[220px] overflow-y-auto z-50 py-2">
                               {countries.filter(c => c.toLowerCase().includes(location.toLowerCase())).map(c => (
                                 <div key={c} onClick={() => { setLocation(c); setIsLocationOpen(false); }} className="px-4 py-2 hover:bg-slate-50 cursor-pointer text-[13px] text-slate-700">{c}</div>
                               ))}
                               {countries.filter(c => c.toLowerCase().includes(location.toLowerCase())).length === 0 && (
                                  <div className="px-4 py-2 text-[12px] text-slate-400 italic">No results found</div>
                               )}
                            </div>
                          )}
                        </div>

                        <Button type="button" onClick={handleBack} variant="outline" className="h-[52px] w-[140px] rounded-[10px] font-bold text-slate-500 border-slate-200 bg-white hover:bg-slate-50">
                           Back
                        </Button>
                        <Button type="button" onClick={handleNext} disabled={loading} className="h-[52px] w-[180px] bg-[#2563eb] hover:bg-blue-600 text-white font-bold text-[14px] rounded-[10px] shadow-sm">
                           {loading ? "..." : "Next"}
                        </Button>
                      </div>

                      {errors.global && (
                        <div className="bg-red-50 rounded-[8px] p-2 flex items-center gap-2 mt-2 w-fit px-3">
                          <div className="w-[12px] h-[12px] flex items-center justify-center rounded-full bg-red-500 text-white text-[8px] font-bold">!</div>
                          <span className="text-red-500 text-[11px] font-bold">{errors.global}</span>
                        </div>
                      )}
                    </motion.div>
                  )}

                  {/* STEP 3 (Recruiter) */}
                  {step === 3 && accountType === "recruiter" && (
                    <motion.div initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} className="space-y-6 flex-1">
                       <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                          <Label className="text-[13px] font-bold text-slate-700">Company Logo <span className="text-red-500">*</span></Label>
                          <div className={`relative flex items-center h-[52px] border rounded-[10px] px-4 overflow-hidden ${errors.companyLogo || (errors.global && !companyLogo) ? 'border-red-500 bg-white' : 'bg-[#f8fafc] border-transparent'}`}>
                             <div className="flex-1 flex items-center gap-2 overflow-hidden">
                                <UploadCloud className="w-5 h-5 text-blue-500 flex-shrink-0" />
                                <span className="text-[12px] text-slate-400 truncate whitespace-nowrap">{companyLogo ? companyLogo.name : "PNG, JPG (Max 5MB)."}</span>
                             </div>
                             <label className="bg-[#2563eb] cursor-pointer text-white text-[11px] font-bold px-4 py-2 rounded-[6px] ml-2 flex-shrink-0 whitespace-nowrap hover:bg-blue-600 transition-colors">
                                + Choose File
                                <input type="file" className="hidden" accept="image/png, image/jpeg" onChange={(e) => { if(e.target.files && e.target.files[0]) setCompanyLogo(e.target.files[0]) }} />
                             </label>
                          </div>
                          <FieldError message={errors.companyLogo} />
                        </div>

                        <div className="space-y-2">
                          <Label className="text-[13px] font-bold text-slate-700">Company Name <span className="text-red-500">*</span></Label>
                          <div className="relative">
                            <Building2 className="absolute left-4 top-1/2 -translate-y-1/2 h-[16px] w-[16px] text-slate-300" />
                            <Input placeholder="Enter Company Name" value={companyName} onChange={e => setCompanyName(e.target.value)} className={`pl-11 h-[52px] rounded-[10px] text-[14px] transition-colors focus-visible:ring-1 focus-visible:ring-[#2563eb] ${errors.companyName || (errors.global && !companyName) ? 'bg-white border-red-500 text-slate-800' : 'bg-[#f8fafc] border-transparent placeholder:text-slate-400'}`} />
                          </div>
                          <FieldError message={errors.companyName} />
                        </div>
                      </div>
                      
                      <div className="flex justify-end gap-4 mt-16 pt-8 border-t border-slate-50">
                         <Button type="button" onClick={handleBack} variant="outline" className="h-[52px] w-[120px] rounded-[10px] font-bold text-slate-500 border-slate-200 bg-white hover:bg-slate-50">
                           Back
                         </Button>
                         <Button type="button" onClick={handleSubmit} disabled={loading} className="h-[52px] w-[180px] bg-[#2563eb] hover:bg-blue-600 text-white font-bold text-[14px] rounded-[10px] shadow-sm">
                           {loading ? "..." : "Sign Up"}
                         </Button>
                      </div>

                      {errors.global && (
                        <div className="bg-red-50 rounded-[8px] p-2 flex items-center gap-2 mt-2 w-fit px-3">
                          <div className="w-[12px] h-[12px] flex items-center justify-center rounded-full bg-red-500 text-white text-[8px] font-bold">!</div>
                          <span className="text-red-500 text-[11px] font-bold">{errors.global}</span>
                        </div>
                      )}
                    </motion.div>
                   )}

                  {/* Footer Elements */}
                  <div className="mt-8 pt-6 border-t border-slate-50 flex flex-col items-center">
                    <div className="w-full flex items-center gap-4 mb-6 relative">
                       <div className="h-px flex-1 bg-slate-100"></div>
                       <span className="text-[#94a3b8] text-[11px] bg-white px-2 font-bold tracking-widest uppercase">OR</span>
                       <div className="h-px flex-1 bg-slate-100"></div>
                    </div>

                    <Button
                       type="button"
                       variant="outline"
                       onClick={handleGoogleSignup}
                       className="w-full max-w-lg h-[52px] bg-white border border-slate-200 text-slate-700 font-bold text-[14px] rounded-[10px] shadow-[0_2px_4px_rgb(0,0,0,0.02)] hover:bg-slate-50 flex items-center justify-center gap-3 transition-all"
                    >
                       <img src="https://www.vectorlogo.zone/logos/google/google-icon.svg" alt="Google" className="w-4 h-4" />
                       <span>Sign Up With Google</span>
                    </Button>
                    
                    <div className="text-center text-[13px] font-bold text-slate-500 mt-6">
                      Already Have An Account? <Link to="/login" className="text-blue-600 hover:underline">Sign In</Link>
                    </div>
                  </div>

                </form>
              </div>
            </div>
          </div>
        )}
      </div>
    </MainLayout>
  );
};

export default Signup;
