import { motion } from "framer-motion";
import { 
  CreditCard, 
  FileText, 
  Search, 
  Bot, 
  Building2, 
  Sparkles, 
  CheckCircle2,
  Zap,
  RefreshCcw,
  Shield,
  Clock,
  Users,
  ArrowRight
} from "lucide-react";
import { useCurrency } from "@/pages/currency_context";

export function CreditsExplanationSection() {
  const { convert, country } = useCurrency();
  
  // Base price for recruiter plan in AED
  const recruiterPriceAED = 200;
  
  const getRecruiterPrice = () => {
    if (country === "United Arab Emirates") {
      return `${recruiterPriceAED} AED`;
    }
    return convert(recruiterPriceAED);
  };

  return (
    <section className="relative overflow-hidden bg-gradient-to-b from-slate-50 via-white to-slate-50 py-16 sm:py-20 md:py-24">
      {/* Subtle Grid Background */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#8080800a_1px,transparent_1px),linear-gradient(to_bottom,#8080800a_1px,transparent_1px)] bg-[size:24px_24px]" />
      
      <div className="container relative mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-6xl">
          
          {/* Header */}
          <div className="mb-12 sm:mb-16 md:mb-20 text-center">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5 }}
              className="mb-4 sm:mb-6 inline-block"
            >
              <div className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-3 sm:px-5 py-1.5 sm:py-2 text-xs sm:text-sm font-medium text-slate-700 shadow-sm">
                <CreditCard className="h-3.5 w-3.5 text-indigo-600" />
                Transparent Credit System
              </div>
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1, duration: 0.5 }}
              className="mb-6 sm:mb-8 text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-black leading-tight tracking-tight text-slate-900"
            >
              How Credits
              <br />
              <span className="relative inline-block">
                <span className="bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
                  Work.
                </span>
                <svg className="absolute -bottom-1 sm:-bottom-2 left-0 w-full" height="8" viewBox="0 0 200 8" fill="none">
                  <motion.path
                    initial={{ pathLength: 0 }}
                    whileInView={{ pathLength: 1 }}
                    transition={{ delay: 0.5, duration: 1 }}
                    d="M0 4C50 4 50 4 100 4C150 4 150 4 200 4"
                    stroke="url(#creditGradient)"
                    strokeWidth="6"
                    strokeLinecap="round"
                  />
                  <defs>
                    <linearGradient id="creditGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                      <stop offset="0%" stopColor="#4F46E5" />
                      <stop offset="50%" stopColor="#9333EA" />
                      <stop offset="100%" stopColor="#DB2777" />
                    </linearGradient>
                  </defs>
                </svg>
              </span>
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2, duration: 0.5 }}
              className="mx-auto mb-8 sm:mb-12 max-w-2xl text-base sm:text-lg md:text-xl leading-relaxed text-slate-600 px-4"
            >
              Simple, transparent pricing. Pay only for what you use with automatic refunds for failed applications.
            </motion.p>
          </div>

          {/* Free Trial Hero Card */}
          <motion.div
            initial={{ opacity: 0, y: 60 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.7 }}
            className="relative mx-auto max-w-5xl mb-16 sm:mb-20"
          >
            <div className="relative overflow-hidden rounded-2xl sm:rounded-3xl border border-slate-200 bg-white shadow-2xl">
              {/* Browser Chrome */}
              <div className="flex items-center gap-2 border-b border-slate-200 bg-slate-50 px-3 sm:px-4 py-2 sm:py-3">
                <div className="flex gap-1.5 sm:gap-2">
                  <div className="h-2 w-2 sm:h-3 sm:w-3 rounded-full bg-red-400" />
                  <div className="h-2 w-2 sm:h-3 sm:w-3 rounded-full bg-yellow-400" />
                  <div className="h-2 w-2 sm:h-3 sm:w-3 rounded-full bg-green-400" />
                </div>
                <div className="ml-2 sm:ml-4 flex-1 rounded bg-white px-2 sm:px-3 py-0.5 sm:py-1 text-[10px] sm:text-xs text-slate-500 truncate">
                  scopeai.com/credits
                </div>
              </div>

              {/* Content */}
              <div className="bg-gradient-to-br from-slate-50 to-white p-6 sm:p-8 md:p-12">
                <div className="grid md:grid-cols-2 gap-8 items-center">
                  <div>
                    <div className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-emerald-500 to-teal-600 px-4 py-2 text-white text-sm font-medium mb-6">
                      <Clock className="h-4 w-4" />
                      7-Day Free Trial
                    </div>
                    <h3 className="text-2xl sm:text-3xl md:text-4xl font-bold text-slate-900 mb-4">
                      Start with <span className="bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">100 Credits</span>
                    </h3>
                    <p className="text-slate-600 text-base sm:text-lg mb-6">
                      Test all features risk-free. No credit card required.
                    </p>
                    <div className="grid grid-cols-2 gap-4 text-center">
                      <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm">
                        <div className="text-2xl font-bold text-emerald-600">100</div>
                        <div className="text-xs text-slate-500">Free Credits</div>
                      </div>
                      <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm">
                        <div className="text-2xl font-bold text-indigo-600">7</div>
                        <div className="text-xs text-slate-500">Days Trial</div>
                      </div>
                    </div>
                  </div>
                  <div className="space-y-4">
                    {[
                      { activity: "CV Upload & Parsing", free: 5, paid: 1, icon: FileText },
                      { activity: "Job Search", free: 1, paid: 1, icon: Search },
                      { activity: "CV Building", free: 5, paid: 3, icon: Sparkles },
                      { activity: "Automation (10 jobs)", free: 28, paid: 14, icon: Bot }
                    ].map((item, index) => (
                      <motion.div
                        key={item.activity}
                        initial={{ opacity: 0, x: 20 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.5 + index * 0.1 }}
                        className="flex items-center justify-between bg-white rounded-xl border border-slate-200 p-4 shadow-sm"
                      >
                        <div className="flex items-center gap-3">
                          <div className={`w-8 h-8 bg-gradient-to-br ${item.icon === FileText ? 'from-indigo-500 to-indigo-600' : 
                            item.icon === Search ? 'from-purple-500 to-purple-600' : 
                            item.icon === Sparkles ? 'from-pink-500 to-pink-600' : 
                            'from-slate-500 to-slate-600'} rounded-lg flex items-center justify-center text-white`}>
                            <item.icon className="h-4 w-4" />
                          </div>
                          <span className="font-medium text-slate-900 text-sm">{item.activity}</span>
                        </div>
                        <div className="flex items-center gap-3 text-xs">
                          <div className="text-right">
                            <div className="text-orange-600 font-semibold">{item.free}</div>
                            <div className="text-slate-500">Free Trial</div>
                          </div>
                          <ArrowRight className="h-3 w-3 text-slate-400" />
                          <div className="text-right">
                            <div className="text-emerald-600 font-semibold">{item.paid}</div>
                            <div className="text-slate-500">Paid</div>
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Floating Stats - Hidden on mobile */}
            <motion.div
              initial={{ opacity: 0, scale: 0.8, y: 20 }}
              whileInView={{ opacity: 1, scale: 1, y: 0 }}
              transition={{ delay: 1.2 }}
              className="hidden lg:block absolute -left-6 bottom-1/4 rounded-2xl border border-white bg-white/90 p-4 shadow-2xl backdrop-blur-sm"
            >
              <div className="mb-1 text-sm text-slate-600">Refund Rate</div>
              <div className="text-2xl font-bold text-purple-600">100%</div>
            </motion.div>
          </motion.div>

          {/* Plans Comparison */}
          <div className="grid md:grid-cols-3 gap-6 sm:gap-8 mb-16 sm:mb-20">
            {/* Job Seekers */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="bg-white rounded-2xl border border-slate-200 shadow-lg overflow-hidden"
            >
              <div className="bg-gradient-to-r from-indigo-500 to-purple-600 p-6 text-white">
                <div className="flex items-center gap-3 mb-2">
                  <Users className="h-6 w-6" />
                  <h3 className="text-lg font-bold text-white">Job Seekers</h3>
                </div>
                <p className="text-indigo-100 text-sm">Credit-based pricing</p>
              </div>
              <div className="p-6">
                <div className="space-y-4 mb-6">
                  <div className="flex justify-between items-center">
                    <span className="text-slate-600 text-sm">CV Upload & Parse</span>
                    <div className="text-right text-xs">
                      <div className="text-orange-600 font-semibold">5 → 1</div>
                    </div>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-slate-600 text-sm">Job Search</span>
                    <div className="text-emerald-600 font-semibold text-xs">1 credit</div>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-slate-600 text-sm">CV Builder</span>
                    <div className="text-right text-xs">
                      <div className="text-orange-600 font-semibold">5 → 3</div>
                    </div>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-slate-600 text-sm">Auto Apply (10 jobs)</span>
                    <div className="text-right text-xs">
                      <div className="text-orange-600 font-semibold">28 → 14</div>
                    </div>
                  </div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-indigo-600 mb-1">Credit Packs</div>
                  <div className="text-slate-500 text-sm">Starting from 100 credits</div>
                </div>
              </div>
            </motion.div>

            {/* Recruiters */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="bg-gradient-to-r from-purple-500 to-pink-600 rounded-2xl text-white overflow-hidden relative"
            >
              <div className="absolute inset-0 bg-white/5 bg-[linear-gradient(45deg,transparent_25%,rgba(255,255,255,0.1)_25%,rgba(255,255,255,0.1)_50%,transparent_50%,transparent_75%,rgba(255,255,255,0.1)_75%)] bg-[length:20px_20px]" />
              
              <div className="relative p-6">
                <div className="flex items-center gap-3 mb-6">
                  <Building2 className="h-6 w-6" />
                  <div>
                    <h3 className="text-lg font-bold text-white">Recruiters</h3>
                    <p className="text-purple-100 text-sm">No credits needed</p>
                  </div>
                </div>
                
                <div className="mb-6">
                  <div className="bg-white/20 rounded-xl p-4 backdrop-blur-sm mb-4">
                    <div className="text-2xl font-bold mb-1">{getRecruiterPrice()}</div>
                    <div className="text-purple-100 text-sm">per month after 7-day trial</div>
                  </div>
                </div>

                <div className="space-y-3 text-sm">
                  {[
                    "Post unlimited jobs",
                    "AI-filtered candidates",
                    "Full CV database access",
                    "Advanced search filters",
                    "Priority support"
                  ].map((feature, index) => (
                    <div key={feature} className="flex items-center gap-2">
                      <CheckCircle2 className="h-4 w-4 text-white flex-shrink-0" />
                      <span>{feature}</span>
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>

            {/* Credit Protection */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="bg-white rounded-2xl border border-slate-200 shadow-lg p-6"
            >
              <div className="text-center mb-6">
                <div className="w-12 h-12 bg-gradient-to-br from-emerald-100 to-teal-100 rounded-xl flex items-center justify-center mx-auto mb-3">
                  <Shield className="h-6 w-6 text-emerald-600" />
                </div>
                <h3 className="text-lg font-bold text-slate-900">Credit Protection</h3>
              </div>

              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <RefreshCcw className="h-5 w-5 text-emerald-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <div className="font-medium text-slate-900 text-sm">Auto Refunds</div>
                    <div className="text-slate-600 text-xs">Failed applications refunded instantly</div>
                  </div>
                </div>
                
                <div className="flex items-start gap-3">
                  <Clock className="h-5 w-5 text-indigo-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <div className="font-medium text-slate-900 text-sm">Never Expire</div>
                    <div className="text-slate-600 text-xs">Credits stay in your account forever</div>
                  </div>
                </div>
                
                <div className="flex items-start gap-3">
                  <Sparkles className="h-5 w-5 text-purple-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <div className="font-medium text-slate-900 text-sm">Real-time Tracking</div>
                    <div className="text-slate-600 text-xs">Monitor usage in your dashboard</div>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>

        </div>
      </div>
    </section>
  );
}

export default CreditsExplanationSection;