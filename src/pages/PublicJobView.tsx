import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { 
  Building, MapPin, Calendar, Rocket, Plus, User, FileText,
  Mail, Phone, Send, Upload, X, Check, CheckCircle2,
  ChevronDown
} from "lucide-react";
import figmaIcon from "@/assets/img-homepage/card-total-icon.png";
import { useAuthStatus } from "@/hooks/useAuthStatus";

export default function PublicJobView() {
  const navigate = useNavigate();
  const { loggedIn, loading } = useAuthStatus();

  const [showApplyModal, setShowApplyModal] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [isApplied, setIsApplied] = useState(false);

  // Form states
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    coverLetter: ''
  });
  const [cvFile, setCvFile] = useState<File | null>(null);

  const handleApplyClick = () => {
    if (isApplied) return;
    setShowApplyModal(true);
  };

  const handleSumbitApplication = (e: React.FormEvent) => {
    e.preventDefault();
    setShowApplyModal(false);
    setIsApplied(true);
    setShowSuccessModal(true);
  };

  return (
    <div className="min-h-screen bg-[#f9fafb] pb-24">
      {/* Header Area */}
      <div className="bg-white border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-10">
           <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
              <div>
                 <h1 className="text-3xl md:text-4xl font-bold text-slate-900 mb-2 font-sans tracking-tight">
                   {loggedIn ? 'Job opportunity' : 'Job offer'}
                 </h1>
                 <p className="text-slate-500 text-sm md:text-base">
                   Browse Job Opportunities From Recruiters And External Platforms.
                 </p>
              </div>
              
              {loggedIn && (
                 <div className="bg-slate-50 border border-gray-100 rounded-xl px-5 py-3 shadow-sm inline-flex flex-col min-w-[200px]">
                    <div className="flex items-center gap-2 mb-0.5">
                       <span className="text-yellow-400">⚡</span>
                       <span className="text-sm font-bold text-slate-800">65 Credits Left</span>
                    </div>
                    <div className="text-[11px] text-slate-400 ml-6 tracking-wide">Trial expires in 4 days</div>
                 </div>
              )}
           </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-8">
        
        {/* Main Job Card */}
        <div className="bg-white rounded-2xl p-6 md:p-8 shadow-sm border border-gray-100 flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8">
           <div className="flex items-center gap-5">
              <div className="w-14 h-14 md:w-16 md:h-16 flex items-center justify-center flex-shrink-0 bg-slate-50 rounded-xl border border-gray-50 p-3">
                 <img src={figmaIcon} alt="Figma" className="w-full h-full object-contain" />
              </div>
              <div>
                 <h2 className="text-xl md:text-2xl font-bold text-slate-900 mb-2">Product Designer</h2>
                 <div className="flex flex-wrap items-center gap-4 text-xs md:text-sm text-slate-400 font-medium">
                    <span className="flex items-center gap-1.5">
                      <Building className="w-4 h-4 text-slate-300" /> 
                      Microsoft
                    </span>
                    <span className="flex items-center gap-1.5">
                      <MapPin className="w-4 h-4 text-slate-300" /> 
                      Jordan
                    </span>
                    <span className="flex items-center gap-1.5">
                       <Calendar className="w-4 h-4 text-slate-300" />
                       Posted 2 days ago
                    </span>
                 </div>
              </div>
           </div>
           
           <div className="flex flex-wrap items-center gap-3">
              <span className="px-4 py-1.5 bg-purple-600 text-white text-xs font-bold rounded-full shadow-sm hover:shadow-md transition cursor-default">Internal</span>
              <span className="px-4 py-1.5 bg-[#4B70F5] text-white text-xs font-bold rounded-full shadow-sm hover:shadow-md transition cursor-default">Full Time</span>
              <span className="px-4 py-1.5 bg-fuchsia-600 text-white text-xs font-bold rounded-full shadow-sm hover:shadow-md transition cursor-default">800$ - 1000$</span>
           </div>
        </div>

        {/* 2-Column Layout */}
        <div className="grid lg:grid-cols-3 gap-8">
           
           {/* Details Column */}
           <div className="lg:col-span-2 space-y-8">
              {/* Description block */}
              <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 md:p-8 border border-gray-100 flex flex-col h-full">
                 <h3 className="text-lg font-bold text-slate-900 mb-5">Job Description</h3>
                 <p className="text-[15px] text-slate-500 mb-6 leading-[1.8]">
                   We Are Looking For A Creative And User-Focused Product Designer To Join Our Team. In This Role, You Will Be Responsible For Designing Intuitive And Engaging Digital Products That Deliver Exceptional User Experiences. You Will Work Closely With Product Managers, Developers, And Stakeholders To Transform Ideas Into Functional And Visually Appealing Solutions.
                 </p>
                 <ul className="space-y-4 text-[15px] text-slate-500 list-disc pl-5 leading-[1.6]">
                   <li><span className="-ml-1">Design User-Centered Interfaces For Web And Mobile Applications.</span></li>
                   <li><span className="-ml-1">Conduct User Research And Translate Insights Into Design Solutions.</span></li>
                   <li><span className="-ml-1">Create Wireframes, Prototypes, And High-Fidelity UI Designs.</span></li>
                   <li><span className="-ml-1">Collaborate With Product Managers And Developers To Deliver High-Quality Product Experiences.</span></li>
                   <li><span className="-ml-1">Ensure Design Consistency Across Products By Following Design Systems And Guidelines.</span></li>
                   <li><span className="-ml-1">Iterate On Designs Based On Feedback, User Testing, And Product Data.</span></li>
                   <li><span className="-ml-1">Stay Updated With The Latest Design Trends, Tools, And Best Practices.</span></li>
                 </ul>
              </div>
              
              {/* Skills block */}
              <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 md:p-8 border border-gray-100">
                 <h3 className="text-lg font-bold text-slate-900 mb-5">Required Skills</h3>
                 <div className="flex flex-wrap gap-3">
                    <span className="px-4 py-2 bg-blue-50 text-blue-500 rounded text-xs font-semibold">Communication</span>
                    <span className="px-4 py-2 bg-blue-50 text-blue-500 rounded text-xs font-semibold">Adobe XD</span>
                    <span className="px-4 py-2 bg-blue-50 text-blue-500 rounded text-xs font-semibold">ux research</span>
                    <span className="px-4 py-2 bg-blue-50 text-blue-500 rounded text-xs font-semibold">design systems</span>
                 </div>
              </div>

           </div>

           {/* Action Card Column */}
           <div className="lg:col-span-1">
              <div className="bg-gradient-to-br from-[#5352FF] to-[#8C3AFF] rounded-2xl p-8 shadow-2xl text-center text-white sticky top-28 overflow-hidden">
                 {/* Decorative background circles */}
                 <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16 blur-2xl"></div>
                 <div className="absolute bottom-0 left-0 w-24 h-24 bg-white/10 rounded-full -ml-12 -mb-12 blur-xl"></div>
                 
                 <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-6 relative z-10">
                    <Rocket className="w-8 h-8 text-white fill-current" />
                 </div>
                 <h3 className="text-xl font-bold mb-3 tracking-wide relative z-10">Ready To Apply?</h3>
                 <p className="text-sm text-white/85 mb-8 relative z-10 leading-relaxed">
                   {loggedIn ? 'Apply Now Or Found More Offers' : 'Apply Now Or Apply From Your Account'}
                 </p>
                 
                 {isApplied ? (
                    <button disabled className="w-full py-3.5 bg-white text-emerald-500 font-bold rounded-xl flex items-center justify-center gap-2 text-sm shadow-xl shadow-[#5352FF]/20 relative z-10">
                       <CheckCircle2 className="w-5 h-5" /> Applied
                    </button>
                 ) : (
                    loggedIn ? (
                      <button onClick={handleApplyClick} className="w-full py-3.5 bg-white text-[#5352FF] font-bold rounded-xl shadow-xl shadow-[#5352FF]/20 hover:shadow-2xl transition-all flex justify-center items-center gap-2.5 text-sm active:scale-95 cursor-pointer relative z-10 hover:-translate-y-0.5">
                         <Send className="w-4 h-4 fill-current -mt-0.5 transform -rotate-12" />
                         Apply Now
                      </button>
                    ) : (
                      <div className="flex gap-4 relative z-10">
                         <button onClick={() => navigate('/login')} className="flex-1 py-3.5 border-2 border-white/30 hover:bg-white/10 transition-all text-white font-bold rounded-xl text-sm active:scale-95">
                           Login
                         </button>
                         <button onClick={handleApplyClick} className="flex-[1.4] flex items-center justify-center gap-2 py-3.5 bg-white text-[#5352FF] font-bold rounded-xl shadow-xl shadow-[#5352FF]/20 hover:shadow-2xl transition-all text-sm active:scale-95 cursor-pointer hover:-translate-y-0.5">
                            <Send className="w-4 h-4 fill-current -mt-0.5 transform -rotate-12" />
                            Apply Now
                         </button>
                      </div>
                    )
                 )}
              </div>
           </div>
        </div>
      </div>

      {/* Apply Modal */}
      {showApplyModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
          <div className="w-full max-w-2xl bg-white rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
            <div className="flex items-center justify-between px-8 py-5 border-b border-gray-100">
              <h3 className="text-xl font-bold text-slate-900 tracking-tight">Apply To Product Designer</h3>
              <button onClick={() => setShowApplyModal(false)} className="text-slate-400 hover:text-slate-600 transition">
                <X className="w-6 h-6" />
              </button>
            </div>
            
            <form onSubmit={handleSumbitApplication} className="p-8 overflow-y-auto">
              <div className="space-y-6">
                {/* Row 1 */}
                <div className="grid sm:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-[13px] font-bold text-slate-700 mb-2 uppercase tracking-wider">
                      Full Name <span className="text-red-500">*</span>
                    </label>
                    <input
                      required
                      type="text"
                      value={formData.name}
                      onChange={(e) => setFormData({...formData, name: e.target.value})}
                      placeholder="Enter Your Full Name"
                      className="w-full border border-gray-100 rounded-xl px-4 py-3.5 text-[14px] focus:outline-none focus:ring-4 focus:ring-blue-500/5 focus:border-blue-500 transition-all bg-slate-50/50 placeholder:text-slate-300 font-medium"
                    />
                  </div>
                  <div>
                    <label className="block text-[13px] font-bold text-slate-700 mb-2 uppercase tracking-wider">
                      Email Address <span className="text-red-500">*</span>
                    </label>
                    <input
                      required
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData({...formData, email: e.target.value})}
                      placeholder="Enter Your Email Address"
                      className="w-full border border-gray-100 rounded-xl px-4 py-3.5 text-[14px] focus:outline-none focus:ring-4 focus:ring-blue-500/5 focus:border-blue-500 transition-all bg-slate-50/50 placeholder:text-slate-300 font-medium"
                    />
                  </div>
                </div>

                {/* Row 2 */}
                <div className="grid sm:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-[13px] font-bold text-slate-700 mb-2 uppercase tracking-wider">
                      Phone Number <span className="text-red-500">*</span>
                    </label>
                    <div className="flex gap-2">
                      <div className="w-[110px] border border-gray-100 rounded-xl flex items-center justify-between px-3.5 py-3.5 bg-slate-50/50 cursor-pointer text-[14px] font-bold text-slate-700">
                         <span className="flex items-center gap-2">🇯🇴 +962</span>
                         <ChevronDown className="w-4 h-4 text-slate-400" />
                      </div>
                      <input
                        required
                        type="tel"
                        value={formData.phone}
                        onChange={(e) => setFormData({...formData, phone: e.target.value})}
                        placeholder="Enter Your Phone Number"
                        className="flex-1 border border-gray-100 rounded-xl px-4 py-3.5 text-[14px] focus:outline-none focus:ring-4 focus:ring-blue-500/5 focus:border-blue-500 transition-all bg-slate-50/50 placeholder:text-slate-300 font-medium"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-[13px] font-bold text-slate-700 mb-2 uppercase tracking-wider">
                      Upload CV/Resume <span className="text-red-500">*</span>
                    </label>
                    <div className="border-2 border-gray-100 border-dashed rounded-xl px-4 py-2.5 bg-slate-50/50 flex items-center gap-3 text-[14px] hover:border-blue-500/40 transition cursor-pointer group relative h-[52px]">
                      <input 
                         type="file" 
                         required 
                         onChange={(e) => e.target.files && setCvFile(e.target.files[0])} 
                         className="absolute inset-0 opacity-0 cursor-pointer"
                         accept=".pdf,.doc,.docx"
                      />
                      <div className="w-8 h-8 rounded-full border border-gray-100 bg-white flex items-center justify-center flex-shrink-0 group-hover:border-blue-200 group-hover:bg-blue-50 transition">
                         <Upload className="w-3.5 h-3.5 text-slate-400 group-hover:text-blue-500" />
                      </div>
                      <span className="text-slate-400 text-[13px] truncate font-medium">
                         {cvFile ? cvFile.name : 'Choose pdf or word document (max 10MB)'}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Row 3 */}
                <div>
                  <label className="block text-[13px] font-bold text-slate-700 mb-2 uppercase tracking-wider">
                    Cover Letter <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    required
                    rows={4}
                    value={formData.coverLetter}
                    onChange={(e) => setFormData({...formData, coverLetter: e.target.value})}
                    placeholder="Tell us why you're interested in this position and what makes you great fit"
                    className="w-full border border-gray-100 rounded-xl px-4 py-3.5 text-[14px] focus:outline-none focus:ring-4 focus:ring-blue-500/5 focus:border-blue-500 transition-all bg-slate-50/50 resize-none font-sans placeholder:text-slate-300 font-medium"
                  />
                </div>
              </div>

              {/* Footer */}
              <div className="flex items-center justify-center gap-4 mt-10">
                 <button 
                   type="button" 
                   onClick={() => setShowApplyModal(false)}
                   className="flex-1 py-3.5 rounded-xl border-2 border-slate-100 text-slate-600 font-bold text-[14px] hover:bg-slate-50 transition active:scale-95 max-w-[180px]"
                 >
                   Close
                 </button>
                 <button 
                   type="submit" 
                   className="flex-1 py-3.5 rounded-xl bg-[#2563EB] text-white font-bold text-[14px] hover:shadow-lg hover:shadow-blue-500/20 hover:bg-blue-700 transition active:scale-95 max-w-[180px]"
                 >
                   Apply
                 </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Success Modal */}
      {showSuccessModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
           <div className="w-full max-w-lg bg-white rounded-2xl shadow-xl overflow-hidden text-center relative p-10 py-12">
              <button onClick={() => setShowSuccessModal(false)} className="absolute top-6 right-6 text-slate-400 hover:text-slate-600 transition">
                <X className="w-6 h-6" />
              </button>
              
              {/* Massive check icon simulating verified seal */}
              <div className="mx-auto w-32 h-32 mb-6 relative flex items-center justify-center">
                 <svg viewBox="0 0 100 100" className="w-full h-full text-emerald-500 drop-shadow-md">
                   <path fill="currentColor" d="M50 0 L55 10 L65 10 L65 20 L75 25 L75 35 L85 45 L85 55 L75 65 L75 75 L65 80 L65 90 L55 90 L50 100 L45 90 L35 90 L35 80 L25 75 L25 65 L15 55 L15 45 L25 35 L25 25 L35 20 L35 10 L45 10 Z" />
                 </svg>
                 <Check className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-14 h-14 text-white stroke-[3px]" />
              </div>

              <h2 className="text-2xl font-extrabold text-slate-900 mb-3 tracking-tight">Application Submitted!</h2>
              <p className="text-sm text-slate-500 leading-relaxed max-w-sm mx-auto mb-10">
                Your Application Has Been Successfully Submitted. You'll Hear From The Company If You're Shortlisted.
              </p>

              <div className="flex items-center justify-center gap-4 w-full">
                 <button 
                   onClick={() => setShowSuccessModal(false)}
                   className="flex-1 py-3.5 rounded-xl border-2 border-gray-100 text-slate-700 font-bold text-sm hover:bg-slate-50 transition active:scale-95"
                 >
                   Close
                 </button>
                 <button 
                   onClick={() => {
                     setShowSuccessModal(false);
                     navigate('/');
                   }}
                   className="flex-1 py-3.5 rounded-xl bg-[#2563EB] text-white font-bold text-sm hover:shadow-lg hover:bg-blue-700 shadow-blue-500/25 transition active:scale-95"
                 >
                   View More Offers
                 </button>
              </div>
           </div>
        </div>
      )}

    </div>
  );
}