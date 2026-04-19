import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
  ArrowLeft,
  CheckCircle2,
  Crown,
  CreditCard,
  Users,
  Building2,
  Zap,
  Shield,
  Clock,
  Target,
  Sparkles,
} from "lucide-react";
import { useCurrency, COUNTRY_MAP } from "@/pages/currency_context";

export default function PricingPage() {
  const navigate = useNavigate();
  const [planType, setPlanType] = useState<'job-seekers' | 'recruiters'>('job-seekers');
  const { convert, country } = useCurrency();

  const basePricesAED = {
    "Basic Plan": 49.9,
    "Premium Plan": 79.9,
  };

  const getPrice = (label: keyof typeof basePricesAED) => {
    if (country === "United Arab Emirates") {
      return `${basePricesAED[label].toFixed(2)} AED`;
    }
    return convert(basePricesAED[label]);
  };

  const jobSeekerPlans = [
    {
      name: "Free Trial",
      price: "Free",
      period: "7 days",
      description: "Perfect for trying our platform",
      features: [
        "100 credits included",
        "AI CV parsing & optimization",
        "Smart job search & matching",
        "Basic application automation",
        "Email support"
      ],
      highlighted: false,
      badge: "Start Here",
      popular: false
    },
    {
      name: "Basic Plan",
      price: getPrice("Basic Plan"),
      period: "per month",
      description: "Great for regular job searching",
      features: [
        "700 credits per month",
        "AI CV parsing & optimization",
        "Smart job search & matching",
        "Automated applications",
        "Priority job matching",
        "Advanced analytics",
        "Priority support"
      ],
      highlighted: true,
      badge: "Most Popular",
      popular: true
    },
    {
      name: "Premium Plan",
      price: getPrice("Premium Plan"),
      period: "per month",
      description: "For serious job seekers",
      features: [
        "1400 credits per month",
        "Everything in Basic Plan",
        "Premium job board access",
        "Interview preparation tips",
        "Salary negotiation guidance",
        "Dedicated support",
        "Custom cover letter templates",
        "Career coaching sessions"
      ],
      highlighted: false,
      badge: "Best Value",
      popular: false
    },
  ];

  const recruiterPlans = [
    {
      name: "Recruiter Plan",
      price: "199.9 AED",
      period: "per month",
      description: "Complete hiring solution for all companies",
      features: [
        "Unlimited job postings",
        "Access to 10,000+ candidates",
        "Advanced AI screening",
        "Detailed analytics & insights",
        "Priority support",
        "Custom screening criteria",
        "Interview scheduling tools",
        "Candidate messaging system",
        "Hiring pipeline management",
        "14-day free trial"
      ],
      highlighted: true,
      badge: "Complete Solution",
      popular: true
    },
  ];

  const features = [
    {
      icon: Zap,
      title: "Instant Activation",
      description: "Start using your plan immediately after signup",
    },
    {
      icon: Shield,
      title: "Secure Payments",
      description: "Protected by Stripe with enterprise-grade security",
    },
    {
      icon: Clock,
      title: "Cancel Anytime",
      description: "No long-term contracts, cancel your subscription anytime",
    },
    {
      icon: Target,
      title: "24/7 Support",
      description: "Get help whenever you need it with our dedicated support",
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white">
      {/* Header */}
      <div className="border-b border-gray-200 bg-white/80 backdrop-blur-xl">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 items-center justify-between">
            <button
              onClick={() => navigate("/")}
              className="flex items-center gap-2 text-sm text-slate-600 hover:text-slate-900 transition"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to Home
            </button>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12 sm:py-20">
        {/* Title */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12 sm:mb-16"
        >
          <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-black text-slate-900 mb-4">
            Simple{" "}
            <span className="bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
              Pricing
            </span>
          </h1>
          <p className="text-base sm:text-lg md:text-xl text-slate-600 max-w-3xl mx-auto px-4">
            Choose the plan that fits your needs. Start with our free trial or select a monthly plan.
          </p>
        </motion.div>

        {/* Plan Type Toggle */}
        <div className="flex items-center justify-center mb-12">
          <div className="bg-slate-100 rounded-2xl p-1 flex">
            <button
              onClick={() => setPlanType('job-seekers')}
              className={`px-6 py-3 rounded-xl font-semibold transition-all flex items-center gap-2 ${planType === 'job-seekers'
                  ? 'bg-white text-indigo-600 shadow-md'
                  : 'text-slate-600 hover:text-slate-800'
                }`}
            >
              <Users className="h-4 w-4" />
              Job Seekers
            </button>
            <button
              onClick={() => setPlanType('recruiters')}
              className={`px-6 py-3 rounded-xl font-semibold transition-all flex items-center gap-2 ${planType === 'recruiters'
                  ? 'bg-white text-indigo-600 shadow-md'
                  : 'text-slate-600 hover:text-slate-800'
                }`}
            >
              <Building2 className="h-4 w-4" />
              Recruiters
            </button>
          </div>
        </div>

        {/* Pricing Plans */}
        {planType === 'job-seekers' ? (
          <div className="grid gap-6 md:gap-8 grid-cols-1 md:grid-cols-3 max-w-6xl mx-auto mb-16">
            {jobSeekerPlans.map((plan, index) => (
              <motion.div
                key={plan.name}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className={`relative rounded-3xl border p-8 shadow-lg transition-all hover:shadow-xl ${plan.highlighted
                    ? 'border-indigo-500 bg-gradient-to-b from-indigo-50 to-white scale-105 ring-2 ring-indigo-200'
                    : 'border-gray-200 bg-white hover:border-indigo-200'
                  }`}
              >
                {plan.badge && (
                  <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                    <div className={`px-4 py-1.5 rounded-full text-sm font-semibold ${plan.popular
                        ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white'
                        : 'bg-gradient-to-r from-emerald-500 to-teal-500 text-white'
                      }`}>
                      <Sparkles className="h-3 w-3 inline mr-1" />
                      {plan.badge}
                    </div>
                  </div>
                )}

                <div className="text-center mb-8">
                  <h3 className="text-2xl font-bold text-slate-900 mb-3">{plan.name}</h3>
                  <div className="text-4xl font-bold text-indigo-600 mb-2">{plan.price}</div>
                  <div className="text-sm text-slate-600">{plan.period}</div>
                  <p className="text-slate-600 mt-4 leading-relaxed">{plan.description}</p>
                </div>

                <ul className="space-y-4 mb-8">
                  {plan.features.map((feature, idx) => (
                    <li key={idx} className="flex items-start gap-3">
                      <CheckCircle2 className="h-5 w-5 text-emerald-600 flex-shrink-0 mt-0.5" />
                      <span className="text-slate-700">{feature}</span>
                    </li>
                  ))}
                </ul>

                <button
                  className={`w-full rounded-xl py-4 px-6 font-semibold transition-all flex items-center justify-center gap-2 ${plan.highlighted
                      ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white hover:from-indigo-700 hover:to-purple-700 shadow-md hover:shadow-lg'
                      : 'border-2 border-gray-300 bg-white text-slate-700 hover:border-indigo-300 hover:text-indigo-600'
                    }`}
                >
                  <CreditCard className="h-5 w-5" />
                  {plan.name.includes('Trial') ? 'Start Free Trial' : 'Get Started'}
                </button>
              </motion.div>
            ))}
          </div>
        ) : (
          <div className="max-w-2xl mx-auto mb-16">
            {recruiterPlans.map((plan, index) => (
              <motion.div
                key={plan.name}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="relative rounded-3xl border border-indigo-500 bg-gradient-to-b from-indigo-50 to-white p-10 shadow-xl ring-2 ring-indigo-200"
              >
                <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                  <div className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white px-6 py-2 rounded-full text-sm font-semibold">
                    <Crown className="h-4 w-4 inline mr-2" />
                    {plan.badge}
                  </div>
                </div>

                <div className="text-center mb-8">
                  <h3 className="text-3xl font-bold text-slate-900 mb-3">{plan.name}</h3>
                  <div className="text-5xl font-bold text-indigo-600 mb-2">{plan.price}</div>
                  <div className="text-lg text-slate-600">{plan.period}</div>
                  <p className="text-slate-600 mt-4 text-lg leading-relaxed">{plan.description}</p>
                </div>

                <div className="grid md:grid-cols-2 gap-4 mb-8">
                  {plan.features.map((feature, idx) => (
                    <div key={idx} className="flex items-start gap-3">
                      <CheckCircle2 className="h-5 w-5 text-emerald-600 flex-shrink-0 mt-0.5" />
                      <span className="text-slate-700">{feature}</span>
                    </div>
                  ))}
                </div>

                <button className="w-full rounded-xl py-4 px-6 font-semibold transition-all flex items-center justify-center gap-2 bg-gradient-to-r from-indigo-600 to-purple-600 text-white hover:from-indigo-700 hover:to-purple-700 shadow-md hover:shadow-lg text-lg">
                  <Building2 className="h-5 w-5" />
                  Start 14-Day Free Trial
                </button>
              </motion.div>
            ))}
          </div>
        )}

        {/* Features */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="mb-16"
        >
          <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 text-center mb-8">
            Why Choose Scope AI
          </h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.5 + index * 0.1 }}
                className="rounded-xl border border-gray-200 bg-white p-6 text-center hover:shadow-lg transition-shadow"
              >
                <div className="inline-flex rounded-full bg-gradient-to-br from-indigo-100 to-purple-100 p-4 mb-4">
                  <feature.icon className="h-6 w-6 text-indigo-600" />
                </div>
                <h3 className="text-lg font-semibold text-slate-900 mb-2">{feature.title}</h3>
                <p className="text-sm text-slate-600">{feature.description}</p>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* FAQ */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.8 }}
          className="max-w-4xl mx-auto"
        >
          <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 text-center mb-8">
            Frequently Asked Questions
          </h2>
          <div className="space-y-4">
            {[
              {
                question: "How do the monthly credits work?",
                answer: "Your monthly credits refresh every billing cycle. Basic plan gives you 700 credits and Premium gives you 1400 credits per month for automated job applications."
              },
              {
                question: "Can I upgrade or downgrade my plan?",
                answer: "Yes! You can change your plan anytime. Upgrades take effect immediately, and downgrades take effect at the next billing cycle."
              },
              {
                question: "Is there a free trial?",
                answer: "Yes! Job seekers get a 7-day free trial with 100 credits, and recruiters get a 14-day free trial with full access to all features."
              },
              {
                question: "What payment methods do you accept?",
                answer: "We accept all major credit cards, debit cards, and digital wallets through our secure Stripe payment processor."
              },
              {
                question: "Do unused credits roll over?",
                answer: "No, monthly credits reset each billing cycle. However, you can always upgrade if you need more credits in a given month."
              }
            ].map((faq, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5, delay: 0.9 + index * 0.1 }}
                className="rounded-xl border border-gray-200 bg-white p-6 hover:shadow-md transition-shadow"
              >
                <h3 className="text-lg font-semibold text-slate-900 mb-2">{faq.question}</h3>
                <p className="text-slate-600">{faq.answer}</p>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>
    </div>
  );
}