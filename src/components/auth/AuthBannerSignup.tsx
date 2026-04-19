import React from "react";
import { motion } from "framer-motion";
import RobotImg from "@/assets/robot.png.png";
import HeroComposite from "@/assets/img-homepage/1.png";
import BgAsset from "@/assets/0_Abstract_Background_3840x2160 1.png";

export const AuthBannerSignup: React.FC = () => {
  return (
    <div className="relative w-full h-full min-h-[500px] md:min-h-full bg-gradient-to-br from-[#7148ff] via-[#3b82f6] to-[#1e40af] overflow-hidden flex flex-col pt-16 px-12 md:px-16 lg:px-20 text-white">
      {/* Fractal Background Overlay */}
      <div className="absolute inset-0 z-0 opacity-20 transition-opacity">
        <img src={BgAsset} alt="" className="w-full h-full object-cover mix-blend-overlay" />
      </div>

      {/* Direct Hero Title Restoration - Cloned from Figma/Reference */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
        className="relative z-20 mb-12 lg:mb-16"
      >
        <h1 className="text-[clamp(1.7rem,4vw,2.4rem)] font-bold leading-[1.1] mb-8 lg:mb-10 tracking-tight drop-shadow-2xl text-white">
          <span className="block whitespace-nowrap overflow-visible">Transform the Way</span>
          <span className="block whitespace-nowrap overflow-visible text-[#facc15] -mt-1 mb-1">You Find and Apply</span>
          <span className="block whitespace-nowrap overflow-visible">to Jobs With AI</span>
        </h1>
        <p className="text-[14px] lg:text-[15px] text-white/80 leading-relaxed font-semibold max-w-[380px] drop-shadow-md">
          Automatically match your skills to opportunities or discover top talent faster with AI-powered insights.
        </p>
      </motion.div>

      {/* Visual Workspace Container - Centering elements for full-page immersion */}
      <div className="flex-1 relative w-full flex items-center justify-center -mt-6">
        
        {/* Brand Logos (Left Side) - Adjusted for visibility with scaled card */}
        <div className="absolute inset-x-0 inset-y-0 z-40 pointer-events-none">
          <motion.div animate={{ y: [-3, 3, -3] }} transition={{ duration: 4, repeat: Infinity }} className="absolute left-[2.5%] top-[34%] w-8 h-8 lg:w-9 lg:h-9 rounded-xl bg-white shadow-xl flex items-center justify-center border border-white/40">
            <span className="text-[#3b82f6] font-black text-[14px] lg:text-[16px]">S</span>
          </motion.div>
          <motion.div animate={{ y: [3, -3, 3] }} transition={{ duration: 5, repeat: Infinity }} className="absolute left-[4.5%] top-[44%] w-8 h-8 lg:w-9 lg:h-9 rounded-xl bg-white shadow-xl flex items-center justify-center p-1.5 border border-white/40">
            <img src="https://www.vectorlogo.zone/logos/figma/figma-icon.svg" alt="Figma" className="w-full h-full" />
          </motion.div>
          <motion.div animate={{ y: [-2, 2, -2] }} transition={{ duration: 4.5, repeat: Infinity }} className="absolute left-[4.5%] top-[56%] w-8 h-8 lg:w-9 lg:h-9 rounded-xl bg-white shadow-xl flex items-center justify-center p-1.5 border border-white/40">
            <img src="https://www.vectorlogo.zone/logos/google/google-icon.svg" alt="Google" className="w-full h-full" />
          </motion.div>
          <motion.div animate={{ y: [2, -2, 2] }} transition={{ duration: 6, repeat: Infinity }} className="absolute left-[2.5%] top-[66%] w-8 h-8 lg:w-9 lg:h-9 rounded-xl bg-white shadow-xl flex items-center justify-center p-1.5 border border-white/40">
            <img src="https://www.vectorlogo.zone/logos/microsoft/microsoft-icon.svg" alt="MS" className="w-full h-full" />
          </motion.div>
        </div>

        {/* Unified Merging Network Paths SVG - Adjusted for smaller card target */}
        <div className="absolute inset-x-0 inset-y-0 z-10 opacity-50">
           <svg className="w-full h-full" viewBox="0 0 400 400" preserveAspectRatio="none">
              <path d="M40 120 C 60 120, 70 200, 80 200" stroke="white" strokeWidth="1.2" strokeLinecap="round" fill="none" opacity="0.6" />
              <path d="M40 170 C 60 170, 70 200, 80 200" stroke="white" strokeWidth="1.2" strokeLinecap="round" fill="none" opacity="0.6" />
              <path d="M40 230 C 60 230, 70 200, 80 200" stroke="white" strokeWidth="1.2" strokeLinecap="round" fill="none" opacity="0.6" />
              <path d="M40 280 C 60 280, 70 200, 80 200" stroke="white" strokeWidth="1.2" strokeLinecap="round" fill="none" opacity="0.6" />
              <path d="M80 200 L 260 200" stroke="white" strokeWidth="2.8" strokeLinecap="round" fill="none" />
           </svg>
        </div>

        {/* AI Robot - Scaled Down (Small) and Positioned for 'PEEK-A-BOO' Occlusion */}
        <motion.div 
          animate={{ y: [-8, 8, -8], x: [0, 4, 0] }} 
          transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }} 
          className="absolute right-[20%] top-[-6%] w-[115px] z-10" 
          style={{ filter: 'drop-shadow(0 15px 35px rgba(0,0,0,0.3))' }}
        >
          <img src={RobotImg} alt="AI Robot" className="w-full h-auto object-contain opacity-95 transition-all" />
        </motion.div>

        {/* High-Fidelity UI Profile Card Component (Replacing 1.png / Girl Image) */}
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="relative z-50 w-full max-w-[360px] bg-white rounded-[24px] overflow-hidden shadow-[0_20px_50px_rgba(0,0,0,0.15)] p-0"
        >
           {/* UI Card Content - Precisely matching the Figma reference layout */}
           <div className="bg-[#f8fafc] px-5 py-4 flex items-center gap-3 border-b border-slate-100">
              <div className="w-10 h-10 rounded-full bg-slate-200 overflow-hidden border-2 border-white shadow-sm flex items-center justify-center">
                 <img src="https://api.dicebear.com/7.x/avataaars/svg?seed=Alex" alt="Alex Smith" className="w-full h-full" />
              </div>
              <div className="flex-1">
                 <h4 className="text-[15px] font-bold text-slate-800">Alex Smith</h4>
                 <p className="text-[11px] text-slate-400 font-medium">Software Engineer • Verified</p>
              </div>
              <div className="w-10 h-10 rounded-full border-4 border-emerald-500 border-t-slate-100 flex items-center justify-center">
                 <span className="text-[10px] font-black text-slate-800">85%</span>
              </div>
           </div>
           
           <div className="p-6 space-y-4">
              <div className="space-y-2">
                 <div className="h-1.5 w-[65%] bg-slate-100 rounded-full" />
                 <div className="h-1.5 w-[85%] bg-slate-50 rounded-full" />
                 <div className="h-1.5 w-[45%] bg-slate-100 rounded-full" />
              </div>
              
              <div className="pt-4">
                 <button className="w-full h-[44px] bg-[#2563eb] text-white font-bold text-[14px] rounded-xl shadow-lg shadow-blue-500/20 active:scale-95 transition-all">
                    Apply Now
                 </button>
              </div>
           </div>
        </motion.div>
      </div>
    </div>
  );
};
