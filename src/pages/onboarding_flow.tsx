import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  FileText, 
  Bot, 
  Search, 
  ArrowRight, 
  Sparkles, 
  Zap,
  MessageSquare,
  Target,
  CheckCircle
} from 'lucide-react';
import { Button } from "@/components/ui/button";
import ScopeLogo from "@/assets/WhatsApp_Image_2025-10-17_at_13.05.55_6ba1ea04-removebg-preview (1).png";

interface OnboardingOption {
  id: string;
  title: string;
  subtitle: string;
  description: string;
  icon: React.ElementType;
  color: string;
  gradient: string;
  route: string;
  features: string[];
}

const OnboardingFlow = () => {
  const [selectedOption, setSelectedOption] = useState<string>('');
  const navigate = useNavigate();

  const options: OnboardingOption[] = [
    {
      id: 'resume-builder',
      title: 'AI Resume Builder',
      subtitle: 'Create & Optimize Your CV',
      description: 'Build a professional resume with AI assistance or chat with our AI bot to create it conversationally',
      icon: FileText,
      color: 'from-indigo-500 to-indigo-600',
      gradient: 'from-indigo-50 to-blue-50',
      route: '/resume-builder',
      features: ['Manual Resume Builder', 'AI-Powered Suggestions', 'Chat with AI Bot', 'ATS Optimization']
    },
    {
      id: 'auto-apply',
      title: 'Auto Apply To Jobs',
      subtitle: 'Let AI Handle Applications',
      description: 'Automatically apply to relevant job postings while you focus on preparing for interviews',
      icon: Bot,
      color: 'from-purple-500 to-purple-600',
      gradient: 'from-purple-50 to-pink-50',
      route: '/auto-apply',
      features: ['Smart Job Matching', 'Automated Applications', 'Custom Cover Letters', 'Application Tracking']
    },
    {
      id: 'job-search',
      title: 'Job Search',
      subtitle: 'Find Perfect Opportunities',
      description: 'Search through thousands of job listings with intelligent filtering and recommendations',
      icon: Search,
      color: 'from-pink-500 to-pink-600',
      gradient: 'from-pink-50 to-rose-50',
      route: '/job-search',
      features: ['Advanced Filters', 'AI Recommendations', 'Salary Insights', 'Company Research']
    }
  ];

  const handleContinue = () => {
    if (!selectedOption) return;
    
    const option = options.find(opt => opt.id === selectedOption);
    if (option) {
      // Navigate to selected route
      navigate(option.route);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-50 relative overflow-hidden">
      {/* Subtle Grid Background */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#8080800a_1px,transparent_1px),linear-gradient(to_bottom,#8080800a_1px,transparent_1px)] bg-[size:24px_24px]" />
      
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 -left-4 w-64 h-64 bg-purple-300 rounded-full mix-blend-multiply filter blur-xl opacity-10 animate-blob"></div>
        <div className="absolute top-40 -right-4 w-64 h-64 bg-blue-300 rounded-full mix-blend-multiply filter blur-xl opacity-10 animate-blob animation-delay-2000"></div>
        <div className="absolute -bottom-8 left-20 w-64 h-64 bg-pink-300 rounded-full mix-blend-multiply filter blur-xl opacity-10 animate-blob animation-delay-4000"></div>
      </div>

      <div className="relative z-10 container mx-auto px-4 py-8 sm:py-12 max-w-6xl">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-8 sm:mb-12"
        >
          <div className="flex items-center justify-center mb-6">
            <img src={ScopeLogo} alt="Scope AI" className="w-12 h-12 sm:w-16 sm:h-16 drop-shadow-lg" />
          </div>
          
          <div className="mb-4 inline-block">
            <div className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 shadow-sm">
              <span className="relative flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-indigo-600 opacity-75" />
                <span className="relative inline-flex h-2 w-2 rounded-full bg-indigo-600" />
              </span>
              Welcome to Scope AI
            </div>
          </div>

          <h1 className="text-3xl sm:text-4xl md:text-5xl font-black leading-tight tracking-tight text-slate-900 mb-4">
            Choose the option that best
            <br />
            <span className="relative inline-block">
              <span className="bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
                describes what you're looking for
              </span>
              <svg className="absolute -bottom-1 sm:-bottom-2 left-0 w-full" height="8" viewBox="0 0 200 8" fill="none">
                <motion.path
                  initial={{ pathLength: 0 }}
                  animate={{ pathLength: 1 }}
                  transition={{ delay: 0.8, duration: 1 }}
                  d="M0 4C50 4 50 4 100 4C150 4 150 4 200 4"
                  stroke="url(#gradient)"
                  strokeWidth="6"
                  strokeLinecap="round"
                />
                <defs>
                  <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="0%">
                    <stop offset="0%" stopColor="#4F46E5" />
                    <stop offset="50%" stopColor="#9333EA" />
                    <stop offset="100%" stopColor="#DB2777" />
                  </linearGradient>
                </defs>
              </svg>
            </span>
          </h1>
          
          <p className="text-lg sm:text-xl text-slate-600 max-w-2xl mx-auto">
            This will help us provide you with the most relevant experience
          </p>
        </motion.div>

        {/* Options Grid */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.6 }}
          className="grid gap-4 sm:gap-6 md:gap-8 grid-cols-1 md:grid-cols-3 mb-8 sm:mb-12"
        >
          {options.map((option, index) => (
            <motion.div
              key={option.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 + index * 0.1, duration: 0.5 }}
              className={`relative overflow-hidden rounded-2xl border-2 transition-all duration-300 cursor-pointer group ${
                selectedOption === option.id
                  ? 'border-purple-500 bg-white shadow-2xl scale-[1.02]'
                  : 'border-slate-200 bg-white hover:border-slate-300 hover:shadow-lg'
              }`}
              onClick={() => setSelectedOption(option.id)}
            >
              {/* Selection indicator */}
              <div className={`absolute top-4 right-4 transition-all duration-300 ${
                selectedOption === option.id ? 'opacity-100 scale-100' : 'opacity-0 scale-75'
              }`}>
                <div className="w-6 h-6 rounded-full bg-purple-500 flex items-center justify-center">
                  <CheckCircle className="w-4 h-4 text-white" />
                </div>
              </div>

              {/* Gradient background for selected */}
              <div className={`absolute inset-0 bg-gradient-to-br ${option.gradient} opacity-0 transition-opacity duration-300 ${
                selectedOption === option.id ? 'opacity-50' : ''
              }`} />

              <div className="relative p-6 sm:p-8">
                {/* Icon */}
                <div className={`mb-6 inline-flex rounded-xl bg-gradient-to-br ${option.color} p-3 text-white shadow-lg`}>
                  <option.icon className="h-6 w-6 sm:h-8 sm:w-8" />
                </div>

                {/* Content */}
                <div className="mb-4">
                  <h3 className="text-xl sm:text-2xl font-bold text-slate-900 mb-2">
                    {option.title}
                  </h3>
                  <p className="text-sm sm:text-base font-medium text-purple-600 mb-3">
                    {option.subtitle}
                  </p>
                  <p className="text-sm sm:text-base text-slate-600 leading-relaxed">
                    {option.description}
                  </p>
                </div>

                {/* Features */}
                <div className="space-y-2">
                  {option.features.map((feature, idx) => (
                    <div key={idx} className="flex items-center gap-2 text-sm text-slate-600">
                      <div className="w-1.5 h-1.5 rounded-full bg-slate-400" />
                      {feature}
                    </div>
                  ))}
                </div>

                {/* Hover effect */}
                <div className={`absolute inset-0 bg-gradient-to-br ${option.color} opacity-0 transition-opacity duration-300 group-hover:opacity-5 ${
                  selectedOption === option.id ? 'opacity-10' : ''
                }`} />
              </div>
            </motion.div>
          ))}
        </motion.div>

        {/* Continue Button */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8, duration: 0.5 }}
          className="text-center"
        >
          <Button
            onClick={handleContinue}
            disabled={!selectedOption}
            className={`group relative overflow-hidden rounded-full px-8 sm:px-12 py-4 sm:py-5 text-base sm:text-lg font-semibold text-white shadow-xl transition-all duration-300 ${
              selectedOption
                ? 'bg-slate-900 hover:shadow-2xl hover:scale-105'
                : 'bg-slate-400 cursor-not-allowed'
            }`}
          >
            <span className="relative z-10 flex items-center justify-center gap-3">
              Continue
              <ArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-1" />
            </span>
            {selectedOption && (
              <div className="absolute inset-0 -z-0 bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 opacity-0 transition-opacity group-hover:opacity-100" />
            )}
          </Button>
          
          <p className="mt-4 text-sm text-slate-500">
            This is just a starting point - you can explore all features anytime
          </p>
        </motion.div>

        {/* Bottom Features */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1, duration: 0.5 }}
          className="mt-12 sm:mt-16 grid gap-4 grid-cols-1 sm:grid-cols-3"
        >
          {[
            { icon: Zap, text: 'Lightning Fast Setup', color: 'text-emerald-600' },
            { icon: Sparkles, text: 'AI-Powered Intelligence', color: 'text-indigo-600' },
            { icon: Target, text: 'Targeted Job Matching', color: 'text-fuchsia-600' }
          ].map((item, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1.2 + index * 0.1, duration: 0.5 }}
              className="flex items-center justify-center gap-3 rounded-xl border border-slate-200 bg-white p-4 sm:p-6 text-slate-700"
            >
              <item.icon className={`h-5 w-5 ${item.color}`} />
              <span className="font-medium text-sm sm:text-base">{item.text}</span>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </div>
  );
};

export default OnboardingFlow;