import React, { useState, useRef, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { ChevronDown, Menu, X, LogOut } from "lucide-react";
import ScopeLogo from "@/assets/WhatsApp_Image_2025-10-17_at_13.05.55_6ba1ea04-removebg-preview (1).png";
import { Button } from "@/components/ui/button";
import { useAuthStatus } from "@/hooks/useAuthStatus";
import { NotificationBell } from "@/components/ui/NotificationBell";

const navLinks = [
  { name: "Home", href: "/" },
  { name: "Job Seekers", href: "/job-search" },
  { name: "Recruiters", href: "/recruiter" },
  { name: "Scope Jobs", href: "/recommended-jobs" },
  { name: "Pricing", href: "/pricing" },
  { name: "Contact", href: "/contact" },
  { name: "FAQs", href: "/#faqs" },
];

const loggedInNavLinks = [
  { name: "Dashboard", href: "/dashboard" },
  { name: "My CV", href: "/upload-cv" },
  { name: "Job Opportunities", href: "/CompanyJobs" },
  { name: "AI Auto Apply", href: "/ai-auto-apply" },
  { name: "My Applications", href: "/my-applications" },
  { name: "Skill Gap", href: "/skill-gap-analysis" },
  { name: "Profile", href: "/profile" },
  { name: "Upgrade plan", href: "/plans" },
];const currencies = [
  { code: "AED", name: "UAE Dirham", symbol: "د.إ" },
  { code: "USD", name: "US Dollar", symbol: "$" },
  { code: "EUR", name: "Euro", symbol: "€" },
  { code: "GBP", name: "British Pound", symbol: "£" },
  { code: "SAR", name: "Saudi Riyal", symbol: "ر.س" },
  { code: "QAR", name: "Qatari Riyal", symbol: "ر.ق" },
  { code: "BHD", name: "Bahraini Dinar", symbol: ".د.ب" },
  { code: "OMR", name: "Omani Rial", symbol: "ر.ع." },
  { code: "KWD", name: "Kuwaiti Dinar", symbol: "د.ك" },
  { code: "INR", name: "Indian Rupee", symbol: "₹" },
  { code: "AUD", name: "Australian Dollar", symbol: "A$" },
  { code: "CAD", name: "Canadian Dollar", symbol: "C$" },
];

export function GlobalHeader() {
  const { loggedIn, user } = useAuthStatus();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [currencyOpen, setCurrencyOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [selectedCurrency, setSelectedCurrency] = useState(currencies[0]);
  const navigate = useNavigate();
  const location = useLocation();
  const currencyRef = useRef<HTMLDivElement>(null);
  const profileRef = useRef<HTMLDivElement>(null);

  // Get user name from auth or local storage
  const userName = user?.user_metadata?.full_name || user?.email?.split('@')[0] || localStorage.getItem("user_name") || "Dema Ahmad";
  
  // Get initials (up to 2 chars)
  const getInitials = (name: string) => {
    const parts = name.split(' ');
    if (parts.length >= 2) return (parts[0][0] + parts[parts.length-1][0]).toUpperCase();
    return name.substring(0, 2).toUpperCase();
  };

  // Get a deterministic color based on name
  const getAvatarColor = (name: string) => {
    const colors = [
      'from-[#5352FF] to-[#8C3AFF]', // Purple-Blue
      'from-[#FF52D9] to-[#8C3AFF]', // Pink-Purple
      'from-[#52C4FF] to-[#3A8CFF]', // Light Blue
      'from-[#10B981] to-[#059669]', // Green
      'from-[#F59E0B] to-[#D97706]', // Orange
    ];
    let hash = 0;
    for (let i = 0; i < name.length; i++) {
        hash = name.charCodeAt(i) + ((hash << 5) - hash);
    }
    return colors[Math.abs(hash) % colors.length];
  };

  const initials = getInitials(userName);
  const avatarBg = getAvatarColor(userName);
  const person = (localStorage.getItem("person") as "job_seeker" | "recruiter") || "job_seeker";
  const recruiterProfileCompleted = localStorage.getItem("recruiter_profile_completed") === "true";
  const roleLabel = person === "recruiter" ? "Recruiter" : "Job seeker";
  const profileLinkLabel =
    person === "recruiter" && !recruiterProfileCompleted ? "Complete Profile" : "Profile";

  const handleLogout = () => {
    localStorage.clear();
    sessionStorage.clear();
    navigate("/login");
    window.location.reload();
  };

  // Close currency dropdown when clicked outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (currencyRef.current && !currencyRef.current.contains(event.target as Node)) {
        setCurrencyOpen(false);
      }
      if (profileRef.current && !profileRef.current.contains(event.target as Node)) {
        setProfileOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [currencyRef]);

  const handleNavClick = (href: string) => {
    setMobileMenuOpen(false);
    if (href.startsWith("/#")) {
      const id = href.substring(2);
      if (location.pathname === "/") {
        const element = document.getElementById(id);
        if (element) {
          element.scrollIntoView({ behavior: "smooth" });
        }
      } else {
        navigate(`/${href}`);
      }
    } else {
      navigate(href);
    }
  };

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-white border-b border-slate-100 py-3 shadow-sm h-[72px] flex items-center">
      <div className="w-full max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 pr-4 lg:pr-8">
            <img src={ScopeLogo} alt="Scope AI" className="w-[42px] h-[42px] object-contain" />
            <span className="text-[22px] font-extrabold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-blue-400 leading-none pb-0.5 whitespace-nowrap">
              Scope AI
            </span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden xl:flex items-center gap-6 lg:gap-8 flex-1 justify-center border-r border-slate-200 border-dashed pr-8 mr-4">
            {(loggedIn ? loggedInNavLinks : navLinks).map((link) => (
              <button
                key={link.name}
                onClick={() => handleNavClick(link.href)}
                className={`text-[13px] font-bold transition whitespace-nowrap pb-0.5 border-b-2 ${
                  location.pathname === link.href 
                    ? "text-blue-600 border-blue-600" 
                    : "text-slate-600 hover:text-blue-600 border-transparent"
                }`}
              >
                {link.name}
              </button>
            ))}
          </nav>

          <nav className="hidden md:flex xl:hidden items-center gap-4 flex-1 justify-center">
            {/* Fallback for smaller desktop screens */}
            {(loggedIn ? loggedInNavLinks : navLinks).slice(0, 4).map((link) => (
              <button
                key={link.name}
                onClick={() => handleNavClick(link.href)}
                className={`text-[12px] font-bold transition whitespace-nowrap pb-0.5 border-b-2 ${
                  location.pathname === link.href 
                    ? "text-blue-600 border-blue-600" 
                    : "text-slate-600 hover:text-blue-600 border-transparent"
                }`}
              >
                {link.name}
              </button>
            ))}
          </nav>

          {/* Right Actions */}
          {loggedIn ? (
            <div className="hidden md:flex items-center gap-6">
              {/* Notification Bell */}
              <NotificationBell />

              <div className="relative group" ref={profileRef}>
                <div 
                  className="flex items-center gap-3 cursor-pointer"
                  onClick={() => setProfileOpen(!profileOpen)}
                >
                  <div className={`w-10 h-10 rounded-full bg-gradient-to-br ${avatarBg} text-white flex items-center justify-center text-sm font-bold shadow-sm border-2 border-white ring-1 ring-slate-100`}>
                    {initials}
                  </div>
                  <div className="flex flex-col justify-center">
                    <div className="flex items-center gap-1">
                      <span className="text-[15px] font-bold text-slate-900 leading-tight">{userName}</span>
                      <ChevronDown className={`w-3 h-3 text-slate-400 transition-transform ${profileOpen ? 'rotate-180' : ''}`} />
                    </div>
                    <div className="flex items-center gap-1">
                      <span className="text-[11px] text-slate-400 font-medium leading-none">{roleLabel}</span>
                      <span className="text-[11px] text-slate-300 font-light px-0.5">|</span>
                      <span className="text-[11px] text-slate-400 font-medium leading-none">Free Account</span>
                    </div>
                  </div>
                </div>

                {/* Profile Dropdown */}
                {profileOpen && (
                  <div className="absolute top-[120%] right-0 mt-1 w-56 bg-white border border-slate-200 shadow-xl rounded-xl z-50 py-2 animate-in fade-in slide-in-from-top-2">
                    <div className="px-4 py-2 border-b border-slate-50 mb-1">
                      <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Account</p>
                    </div>
                    <button 
                      onClick={() => { navigate("/profile"); setProfileOpen(false); }}
                      className="w-full flex items-center gap-3 px-4 py-2.5 text-left text-sm font-bold text-slate-600 hover:bg-slate-50 hover:text-blue-600 transition-colors"
                    >
                      {profileLinkLabel}
                    </button>
                    <button 
                      onClick={() => { navigate("/dashboard"); setProfileOpen(false); }}
                      className="w-full flex items-center gap-3 px-4 py-2.5 text-left text-sm font-bold text-slate-600 hover:bg-slate-50 hover:text-blue-600 transition-colors"
                    >
                      Dashboard
                    </button>
                    <div className="h-px bg-slate-100 my-1 mx-2" />
                    <button 
                      onClick={handleLogout}
                      className="w-full flex items-center gap-3 px-4 py-2.5 text-left text-sm font-bold text-rose-600 hover:bg-rose-50 transition-colors"
                    >
                      <LogOut className="w-4 h-4" />
                      Logout
                    </button>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="hidden md:flex items-center gap-5">
              {/* Currency Selector */}
              <div className="relative pl-2" ref={currencyRef}>
                <div 
                  className="flex items-center justify-between gap-2 cursor-pointer text-slate-700 hover:text-blue-600 hover:bg-slate-50 px-2 py-1.5 rounded-md transition-colors border border-transparent hover:border-slate-200"
                  onClick={() => setCurrencyOpen(!currencyOpen)}
                >
                  <div className="w-[22px] h-[22px] bg-slate-100 rounded-full flex items-center justify-center font-bold text-[10px] text-slate-600 border border-slate-200">
                    {selectedCurrency.symbol}
                  </div>
                  <span className="text-[14px] font-bold text-slate-700 w-8">{selectedCurrency.code}</span>
                  <ChevronDown className={`w-3.5 h-3.5 ml-0.5 text-slate-500 transition-transform ${currencyOpen ? 'rotate-180' : ''}`} strokeWidth={3} />
                </div>

                {/* Dropdown Menu */}
                {currencyOpen && (
                  <div className="absolute top-[120%] right-0 mt-1 w-48 bg-white border border-slate-200 shadow-xl rounded-xl z-50 py-2 animate-in fade-in slide-in-from-top-2">
                    <div className="max-h-[320px] overflow-y-auto px-1">
                      {currencies.map((currency) => (
                        <button
                          key={currency.code}
                          onClick={() => {
                            setSelectedCurrency(currency);
                            setCurrencyOpen(false);
                          }}
                          className={`w-full flex items-center gap-3 px-3 py-2.5 text-left text-sm font-medium rounded-lg transition-colors ${selectedCurrency.code === currency.code ? 'bg-blue-50 text-blue-700' : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'}`}
                        >
                          <div className="w-[22px] h-[22px] bg-slate-100 rounded-full flex items-center justify-center font-bold text-[10px] text-slate-600 border border-slate-200">
                            {currency.symbol}
                          </div>
                          <span className="text-[12px] text-slate-400 font-normal truncate">{currency.name}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
              
              <Button
                variant="outline"
                onClick={() => navigate("/job-search")}
                className="text-[#3b82f6] border-[#3b82f6] bg-transparent hover:bg-blue-50 hover:text-[#2563eb] border-2 font-bold px-5 py-2 h-auto text-[14px] rounded-lg transition-all shadow-sm"
              >
                Explore Jobs
              </Button>
              <Button
                onClick={() => navigate("/login")}
                className="bg-[#3b82f6] hover:bg-blue-700 text-white font-bold px-5 py-2 h-auto text-[14px] border-2 border-transparent rounded-lg transition-all shadow-md shadow-blue-500/20"
              >
                Get Started
              </Button>
            </div>
          )}

          {/* Mobile Menu Toggle */}
          <button
            className="md:hidden p-2 text-slate-600 hover:bg-slate-100 rounded-lg ml-auto"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Navigation Menu */}
      {mobileMenuOpen && (
        <div className="absolute top-[72px] left-0 right-0 md:hidden bg-white border-b border-slate-100 px-4 py-4 space-y-3 shadow-lg z-40 max-h-[calc(100vh-72px)] overflow-y-auto">
          {(loggedIn ? loggedInNavLinks : navLinks).map((link) => (
            <button
              key={link.name}
              onClick={() => handleNavClick(link.href)}
              className="block w-full text-left px-3 py-3 text-[15px] font-bold text-slate-700 hover:bg-slate-50 hover:text-blue-600 rounded-lg transition-colors"
            >
              {link.name}
            </button>
          ))}
          <div className="border-t border-slate-100 pt-5 pb-4 flex flex-col gap-4 px-3">
             {loggedIn ? (
               <div className="flex flex-col gap-3">
                 <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl border border-slate-100 mb-2">
                   <div className={`w-10 h-10 rounded-full bg-gradient-to-br ${avatarBg} text-white flex items-center justify-center text-sm font-bold shadow-md`}>
                     {initials}
                   </div>
                   <div className="flex flex-col flex-1">
                     <span className="text-sm font-bold text-slate-800">{userName}</span>
                     <span className="text-xs text-slate-500 font-semibold">(Job seeker | Free Account)</span>
                   </div>
                   {/* Mobile Notification Bell */}
                   <NotificationBell />
                 </div>
                 <Button
                    className="w-full justify-center bg-purple-50 text-[#8C3AFF] hover:bg-purple-100 hover:text-[#5352FF] border border-purple-200 font-bold h-12 text-base rounded-xl shadow-sm"
                    onClick={() => navigate("/plans")}
                  >
                    Upgrade plan
                 </Button>
                 <Button
                    variant="outline"
                    className="w-full justify-center text-slate-600 border-2 border-slate-200 font-bold h-12 text-base rounded-xl"
                    onClick={() => navigate("/dashboard")}
                  >
                    Profile
                 </Button>
               </div>
             ) : (
               <>
                 <div className="text-slate-700 mb-2">
                    <span className="font-bold text-[13px] uppercase tracking-wider text-slate-400 block mb-3">Select Currency</span>
                    <div className="grid grid-cols-2 gap-2">
                       {currencies.map(c => (
                         <button 
                            key={c.code}
                            onClick={() => { setSelectedCurrency(c); }}
                            className={`flex items-center gap-2 px-3 py-2 rounded-lg border ${selectedCurrency.code === c.code ? 'border-blue-500 bg-blue-50' : 'border-slate-200 bg-white hover:bg-slate-50'}`}
                         >
                           <div className="w-5 h-5 bg-slate-100 rounded-full flex items-center justify-center font-bold text-[9px] text-slate-600 border border-slate-200">
                             {c.symbol}
                           </div>
                           <span className={`text-sm font-bold ${selectedCurrency.code === c.code ? 'text-blue-700' : 'text-slate-700'}`}>{c.code}</span>
                         </button>
                       ))}
                    </div>
                 </div>
                 <div className="flex flex-col gap-3 mt-2">
                   <Button
                      variant="outline"
                      className="w-full justify-center text-blue-600 border-2 border-blue-600 font-bold h-12 text-base rounded-xl"
                      onClick={() => navigate("/job-search")}
                    >
                      Explore Jobs
                   </Button>
                   <Button
                      className="w-full justify-center bg-blue-600 hover:bg-blue-700 text-white font-bold h-12 text-base rounded-xl shadow-md"
                      onClick={() => navigate("/login")}
                    >
                      Get Started
                   </Button>
                 </div>
               </>
             )}
          </div>
        </div>
      )}
    </header>
  );
}
