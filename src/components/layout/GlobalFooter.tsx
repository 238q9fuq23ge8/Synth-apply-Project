import React from "react";
import { Link } from "react-router-dom";
import ScopeLogo from "@/assets/WhatsApp_Image_2025-10-17_at_13.05.55_6ba1ea04-removebg-preview (1).png";
import { Phone, Mail, MessageSquare } from "lucide-react";

export function GlobalFooter() {
  return (
    <footer className="bg-white border-t border-slate-100 py-12 text-slate-600 text-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Top Section */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-12">
          
          {/* Logo Column */}
          <div className="col-span-1 space-y-4">
            <Link to="/" className="flex items-center gap-2">
              <img src={ScopeLogo} alt="Scope AI" className="w-[42px] h-[42px] object-contain" />
              <span className="text-[22px] font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-purple-600 leading-none pb-0.5">
                Scope AI
              </span>
            </Link>
            <p className="text-slate-500 leading-relaxed font-medium text-sm pr-6">
              Modern, Automated Job Applications And AI-<br/>Ranked Talent For Recruiters.
            </p>
          </div>

          {/* Quick Links Column */}
          <div className="col-span-1 md:pl-2">
            <h3 className="text-slate-800 font-extrabold text-base mb-5">Quick Links</h3>
            <div className="grid grid-cols-3 gap-x-2 gap-y-4">
              <Link to="/" className="text-[14px] hover:text-blue-600 text-slate-500 font-medium whitespace-nowrap">Home</Link>
              <Link to="/pricing" className="text-[14px] hover:text-blue-600 text-slate-500 font-medium whitespace-nowrap">Pricing</Link>
              <Link to="/recommended-jobs" className="text-[14px] hover:text-blue-600 text-slate-500 font-medium whitespace-nowrap pl-2">Scope Jobs</Link>
              
              <Link to="/job-search" className="text-[14px] hover:text-blue-600 text-slate-500 font-medium whitespace-nowrap">Job Seekers</Link>
              <Link to="/reviews" className="text-[14px] hover:text-blue-600 text-slate-500 font-medium whitespace-nowrap">Reviews</Link>
              <Link to="/#faqs" className="text-[14px] hover:text-blue-600 text-slate-500 font-medium whitespace-nowrap pl-2">FAQs</Link>

              <Link to="/recruiter" className="text-[14px] hover:text-blue-600 text-slate-500 font-medium whitespace-nowrap">Recruiters</Link>
              <Link to="/contact" className="text-[14px] hover:text-blue-600 text-slate-500 font-medium whitespace-nowrap">Contact</Link>
              <div></div>
            </div>
          </div>

          {/* Contact Info Column */}
          <div className="col-span-1 md:pl-8">
            <h3 className="text-slate-800 font-extrabold text-base mb-5">Contact Info</h3>
            <ul className="space-y-4">
              <li className="flex items-center gap-3">
                <div className="bg-[#2563EB] rounded-full p-[5px] flex items-center justify-center">
                  <Phone className="w-3.5 h-3.5 text-white fill-white" />
                </div>
                <span className="text-slate-500 font-medium text-[14px]">+971 56 663 1030</span>
              </li>
              <li className="flex items-center gap-3">
                <div className="bg-[#2563EB] rounded-full p-[5px] flex items-center justify-center">
                  <MessageSquare className="w-3.5 h-3.5 text-white fill-white" />
                </div>
                <span className="text-slate-500 font-medium text-[14px]">Chat On WhatsApp</span>
              </li>
              <li className="flex items-center gap-3">
                <div className="bg-[#2563EB] rounded-full p-[5px] flex items-center justify-center">
                  <Mail className="w-3.5 h-3.5 text-white fill-white" />
                </div>
                <span className="text-slate-500 font-medium text-[14px]">Info@Scopeaicv.Com</span>
              </li>
            </ul>
          </div>

          {/* Follow Us Column */}
          <div className="col-span-1 md:pl-6">
            <h3 className="text-slate-800 font-extrabold text-base mb-5">Follow Us</h3>
            <div className="grid grid-cols-2 gap-x-4 gap-y-4">
              <a href="#" className="flex items-center gap-2 text-slate-500 hover:text-blue-600 font-medium text-[14px]">
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="shrink-0">
                  <rect x="2" y="2" width="20" height="20" rx="5" fill="url(#instagram-gradient-footer)"/>
                  <circle cx="12" cy="12" r="4.5" stroke="white" strokeWidth="1.8"/>
                  <circle cx="17.5" cy="6.5" r="1.2" fill="white"/>
                  <defs>
                    <linearGradient id="instagram-gradient-footer" x1="2" y1="22" x2="22" y2="2" gradientUnits="userSpaceOnUse">
                      <stop stopColor="#fdf497"/>
                      <stop offset="0.05" stopColor="#fdf497"/>
                      <stop offset="0.45" stopColor="#fd5949"/>
                      <stop offset="0.6" stopColor="#d6249f"/>
                      <stop offset="0.9" stopColor="#285AEB"/>
                    </linearGradient>
                  </defs>
                </svg>
                <span>@Scope.AI</span>
              </a>
              <a href="#" className="flex items-center gap-2 text-slate-500 hover:text-blue-600 font-medium text-[14px]">
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="shrink-0">
                  <rect width="24" height="24" rx="5" fill="#1877F2"/>
                  <path d="M15.4 8.2h-1.6c-1.2 0-1.5.6-1.5 1.5v2h3l-.4 3h-2.6v7.6h-3.1v-7.6H7V11.6h2.1V9.2C9.1 7.2 10.3 6 12 6c.9 0 1.7.1 2 .1V8z" fill="white"/>
                </svg>
                <span>@Scope.AI</span>
              </a>
              <a href="#" className="flex items-center gap-2 text-slate-500 hover:text-blue-600 font-medium text-[14px]">
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="shrink-0">
                  <rect width="24" height="24" rx="5" fill="black"/>
                  <path d="M12.5 4H14.5C15 5.5 16 6.5 18 6.5V9C17 9 15.5 8.5 14.5 7.5V14.5C14.5 16.5 13 18.5 10.5 18.5C8 18.5 6 16.5 6 14C6 11.5 8 9.5 10.5 9.5C11 9.5 11.5 9.6 12 9.8V12.5C11.5 12.3 11 12.2 10.5 12.2C9.5 12.2 8.5 13 8.5 14C8.5 15 9.5 16 10.5 16C11.5 16 12.5 15 12.5 14V4Z" fill="white"/>
                  <path d="M12.5 4H14.5C15 5.5 16 6.5 18 6.5V9C17 9 15.5 8.5 14.5 7.5V4H12.5Z" fill="#ff0050" style={{mixBlendMode: "screen"}}/>
                  <path d="M12.5 14.5C14.5 16.5 13 18.5 10.5 18.5C8 18.5 6 16.5 6 14C6 11.5 8 9.5 10.5 9.5C11 9.5 11.5 9.6 12 9.8V12.5C11.5 12.3 11 12.2 10.5 12.2C9.5 12.2 8.5 13 8.5 14C8.5 15 9.5 16 10.5 16C11.5 16 12.5 15 12.5 14.5Z" fill="#00f2fe" style={{mixBlendMode: "screen"}}/>
                </svg>
                <span>@Scope.AI</span>
              </a>
              <a href="#" className="flex items-center gap-2 text-slate-500 hover:text-blue-600 font-medium text-[14px]">
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="shrink-0">
                  <rect width="24" height="24" rx="5" fill="black"/>
                  <path d="M14.5 10L19.5 5H18L13.5 9.5L10 5H5L10.5 11L5 17H6.5L11.5 12L15 17H20L14.5 10ZM12 11.5L6.5 5.5H8.5L13.5 10.5L18.5 16.5H16.5L12 11.5Z" fill="white"/>
                </svg>
                <span>@Scope.AI</span>
              </a>
            </div>
          </div>
        </div>

        {/* Secure Payment Section */}
        <div className="flex flex-col items-center justify-center pt-8 pb-4">
          <div className="flex items-center justify-center gap-1.5 mb-3">
            <span className="text-yellow-500 text-[16px] leading-[1]">🔒</span>
            <span className="text-slate-500 font-medium text-[13px]">Secure Payment Powered by</span>
            <span className="text-slate-800 font-extrabold text-[15px] tracking-tight ml-0.5">stripe</span>
          </div>
          <div className="flex items-center justify-center gap-2">
             <div className="bg-white border border-slate-200 rounded px-1.5 py-0.5 shadow-sm"><span className="text-[#1A1F71] font-bold italic text-[11px] px-0.5">VISA</span></div>
             <div className="bg-white border border-slate-200 rounded px-1.5 py-1 shadow-sm flex -space-x-1"><div className="w-3.5 h-3.5 border-none rounded-full bg-[#EB001B] opacity-90 z-10"></div><div className="w-3.5 h-3.5 border-none rounded-full bg-[#F79E1B] opacity-90 z-20 mix-blend-multiply"></div></div>
             <div className="bg-[#0070bc] border border-[#0070bc] rounded px-1.5 py-0.5 shadow-sm"><span className="text-white font-bold text-[9px] px-0.5">AMEX</span></div>
             <div className="bg-black border border-black rounded px-1.5 py-0.5 shadow-sm flex items-center gap-0.5"><span className="text-white text-[12px] leading-none mb-[2px]"></span><span className="text-white font-semibold text-[10px] pr-0.5">Pay</span></div>
             <div className="bg-white border border-slate-200 rounded px-1.5 py-0.5 shadow-sm flex items-center gap-0.5"><span className="text-[#4285F4] text-[12px] font-bold font-sans">G</span><span className="text-slate-500 font-semibold text-[10px] mr-1">Pay</span></div>
          </div>
        </div>

        {/* Copyright Section */}
        <div className="text-center text-slate-500 font-medium text-[13px] mt-4 pb-2">
          © 2026 Scope AI. All rights reserved.
        </div>
      </div>
    </footer>
  );
}

