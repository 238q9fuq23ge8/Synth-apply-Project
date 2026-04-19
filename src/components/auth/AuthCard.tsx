import React from "react";
import { Card } from "@/components/ui/card";

interface AuthCardProps {
  children: React.ReactNode;
  sidebar?: React.ReactNode;
}

export const AuthCard: React.FC<AuthCardProps> = ({ children, sidebar }) => {
  return (
    <div className="w-full border-none shadow-none rounded-none overflow-hidden bg-white flex flex-col md:flex-row min-h-screen animate-in zoom-in-95 duration-700 relative z-50">
      {/* Left Sidebar/Banner Area */}
      {sidebar && (
        <div className="w-full md:w-[42%] lg:w-[45%] shrink-0 border-r border-slate-50 relative overflow-hidden">
          {sidebar}
        </div>
      )}

      {/* Main Content Area */}
      <div className="flex-1 p-6 sm:p-8 md:p-12 lg:p-16 flex flex-col justify-center relative bg-white overflow-y-auto">
        {children}
      </div>
    </div>
  );
};
