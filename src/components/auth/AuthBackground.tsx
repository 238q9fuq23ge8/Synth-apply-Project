import React from "react";
import { motion } from "framer-motion";

interface AuthBackgroundProps {
  children: React.ReactNode;
}

export const AuthBackground: React.FC<AuthBackgroundProps> = ({ children }) => {
  return (
    <div className="min-h-screen w-full relative flex flex-col items-center justify-center p-0 bg-white overflow-hidden">
      {/* Background Layer with Zero Edge Bleeds - Razor Sharp Vertical Split */}
      <div className="absolute inset-0 z-0 flex">
        <div className="w-[42%] lg:w-[45%] h-full bg-gradient-to-br from-[#7148ff] via-[#3b82f6] to-[#1e40af]"></div>
        <div className="flex-1 h-full bg-white"></div>
      </div>

      {/* Content Surface - Full Viewport Bleed */}
      <div className="relative z-10 w-full h-full flex flex-col items-center justify-center">
        {children}
      </div>
    </div>
  );
};
