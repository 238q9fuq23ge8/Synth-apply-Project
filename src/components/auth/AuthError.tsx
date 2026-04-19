import React from "react";
import { AlertCircle } from "lucide-react";
import { motion } from "framer-motion";

interface AuthErrorProps {
  message: string;
}

export const AuthError: React.FC<AuthErrorProps> = ({ message }) => {
  if (!message) return null;

  return (
    <motion.div 
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      className="w-full bg-[#fef2f2] text-[#ef4444] text-[12px] font-bold px-4 py-2.5 rounded-[8px] flex items-center gap-2 border border-[#fee2e2] mb-6"
    >
      <div className="w-1.5 h-1.5 rounded-full bg-[#ef4444]" />
      <span className="leading-tight">{message}</span>
    </motion.div>
  );
};
