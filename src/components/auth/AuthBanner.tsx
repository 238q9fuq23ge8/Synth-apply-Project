import React from "react";
import { motion } from "framer-motion";
import RobotImg from "@/assets/robot.png.png";
import HeroComposite from "@/assets/img-homepage/1.png";
import BgAsset from "@/assets/0_Abstract_Background_3840x2160 1.png";
import ProfileImg from "@/assets/img-homepage/4.png";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

export const AuthBanner: React.FC = () => {
  return (
    <div className="relative w-full h-full min-h-[600px] md:min-h-full bg-gradient-to-br from-[#6b4cff] via-[#4665ff] to-[#2b7afd] overflow-hidden flex flex-col pt-16 px-10 md:px-14 lg:px-16 text-white">
      {/* Fractal Background Overlay */}
      <div className="absolute inset-0 z-0 opacity-20 pointer-events-none">
        <img src={BgAsset} alt="" className="w-full h-full object-cover mix-blend-overlay" />
      </div>

      {/* Direct Hero Title Restoration - Cloned from Figma/Reference */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
        className="relative z-20 mb-6 lg:mb-8"
      >
        <h1 className="text-[clamp(2.0rem,4vw,3.2rem)] font-bold leading-[1.2] mb-6 tracking-tight drop-shadow-md text-white">
          <span className="block whitespace-nowrap overflow-visible">Transform the Way</span>
          <span className="block whitespace-nowrap overflow-visible text-[#ffde59]">You Find and Apply</span>
          <span className="block whitespace-nowrap overflow-visible">to Jobs With AI</span>
        </h1>
        <p className="text-[14px] lg:text-[15px] text-white/90 leading-relaxed max-w-[420px]">
          Automatically match your skills to opportunities or discover top talent faster with AI-powered insights.
        </p>
      </motion.div>

      {/* Visual Workspace Container - Fixed aspect container for precise alignment */}
      <div className="relative w-full max-w-[500px] aspect-[4/3] mx-auto mt-4 md:mt-8 flex items-center justify-center">
          
        {/* SVG connecting lines spanning from left to center-left */}
        <div className="absolute inset-0 z-0 pointer-events-none">
           <svg className="w-full h-full" viewBox="0 0 500 375" fill="none">
              {/* Single trunk line matching Card's center-left */}
              <path d="M 170 187.5 L 140 187.5" stroke="white" strokeWidth="2.5" strokeLinecap="round" opacity="0.4" />
              {/* Branches to 4 icons exactly positioned */}
              <path d="M 140 187.5 C 110 187.5, 90 90, 40 90" stroke="white" strokeWidth="2.5" strokeLinecap="round" opacity="0.3" /> {/* S */}
              <path d="M 140 187.5 C 120 187.5, 110 150, 90 150" stroke="white" strokeWidth="2.5" strokeLinecap="round" opacity="0.3" /> {/* Figma */}
              <path d="M 140 187.5 C 100 187.5, 70 220, 30 220" stroke="white" strokeWidth="2.5" strokeLinecap="round" opacity="0.3" /> {/* Google */}
              <path d="M 140 187.5 C 110 187.5, 90 300, 50 300" stroke="white" strokeWidth="2.5" strokeLinecap="round" opacity="0.3" /> {/* Microsoft */}
           </svg>
        </div>

        {/* Icons */}
        {/* Top 'S' */}
        <motion.div animate={{ y: [-2, 2, -2] }} transition={{ duration: 4, repeat: Infinity }} className="absolute left-[8%] top-[24%] -translate-x-1/2 -translate-y-1/2 w-10 h-10 rounded-[10px] bg-white shadow-lg flex items-center justify-center z-10">
           <span className="text-[#0ea5e9] font-black text-[22px]">S</span>
        </motion.div>
        
        {/* Figma */}
        <motion.div animate={{ y: [2, -2, 2] }} transition={{ duration: 5, repeat: Infinity }} className="absolute left-[18%] top-[40%] -translate-x-1/2 -translate-y-1/2 w-[38px] h-[38px] rounded-[10px] bg-white shadow-lg flex items-center justify-center p-2 z-10">
           <img src="https://www.vectorlogo.zone/logos/figma/figma-icon.svg" alt="Figma" className="w-[85%] h-[85%]" />
        </motion.div>

        {/* Google */}
        <motion.div animate={{ y: [-2, 2, -2] }} transition={{ duration: 4.5, repeat: Infinity }} className="absolute left-[6%] top-[58.6%] -translate-x-1/2 -translate-y-1/2 w-10 h-10 rounded-[10px] bg-white shadow-lg flex items-center justify-center p-2.5 z-10">
           <img src="https://www.vectorlogo.zone/logos/google/google-icon.svg" alt="Google" className="w-full h-full" />
        </motion.div>

        {/* Microsoft */}
        <motion.div animate={{ y: [2, -2, 2] }} transition={{ duration: 6, repeat: Infinity }} className="absolute left-[10%] top-[80%] -translate-x-1/2 -translate-y-1/2 w-[38px] h-[38px] rounded-[10px] bg-white shadow-lg flex items-center justify-center p-2.5 z-10">
           <img src="https://www.vectorlogo.zone/logos/microsoft/microsoft-icon.svg" alt="Microsoft" className="w-full h-full" />
        </motion.div>

        {/* Robot - Behind card, peeking out from top right, 95% visible */}
        <motion.div 
          animate={{ y: [-5, 5, -5] }} 
          transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }} 
          className="absolute w-[70px] sm:w-[85px] z-20" 
          style={{ 
            filter: 'drop-shadow(0 15px 25px rgba(0,0,0,0.25))',
            right: 'calc(8% - 0.4cm)', 
            top: 'calc(12% - 2.8cm)'
          }}
        >
          <img src={RobotImg} alt="AI Robot" className="w-full h-auto object-contain" />
        </motion.div>

        {/* Profile Card */}
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="absolute -translate-x-1/2 -translate-y-1/2 z-30 w-[280px] bg-white rounded-[14px] overflow-hidden shadow-[0_20px_50px_rgba(0,0,0,0.25)] p-0"
          style={{ 
            left: 'calc(62% - 3.5cm)', 
            top: 'calc(60% - 4.2cm)' 
          }}
        >
           {/* macOS Window Controls */}
           <div className="px-4 pt-3 pb-2 flex gap-1.5 border-b border-transparent">
              <div className="w-2.5 h-2.5 rounded-full bg-[#ff5f56]"></div>
              <div className="w-2.5 h-2.5 rounded-full bg-[#ffbd2e]"></div>
              <div className="w-2.5 h-2.5 rounded-full bg-[#27c93f]"></div>
           </div>

           {/* Profile Header */}
           <div className="px-5 py-2.5 flex items-center gap-3">
              <div className="w-[34px] h-[34px] rounded-full overflow-hidden flex items-center justify-center mt-0.5 pointer-events-none bg-slate-100">
                 <img src={ProfileImg} alt="Alex Smith" className="w-full h-full object-cover" />
              </div>
              <div className="flex-1">
                 <h4 className="text-[15px] font-bold text-slate-800 leading-tight">Alex Smith</h4>
              </div>
              <div className="w-[28px] h-[28px] rounded-full text-[#16a34a] border-[2px] border-[#16a34a] flex items-center justify-center text-center">
                 <span className="text-[9px] font-bold">65%</span>
              </div>
           </div>
           
           <div className="px-5 pt-3 pb-5">
              <div className="space-y-2 mb-4">
                 <div className="h-1.5 w-full bg-[#f1f5f9] rounded-full" />
                 <div className="h-1.5 w-full bg-[#f1f5f9] rounded-full" />
                 <div className="h-1.5 w-[80%] bg-[#f1f5f9] rounded-full" />
              </div>
              
              <div className="space-y-2 mb-5">
                 <div className="h-1.5 w-full bg-[#f1f5f9] rounded-full" />
                 <div className="h-1.5 w-[60%] bg-[#f1f5f9] rounded-full" />
              </div>
              
              <div>
                 <button className="w-[85px] h-[28px] bg-[#2563eb] hover:bg-blue-600 transition-colors text-white font-bold text-[11px] rounded-[6px] shadow-sm flex items-center justify-center">
                    Apply
                 </button>
              </div>
           </div>
        </motion.div>
      </div>
    </div>
  );
};
