import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
  ArrowLeft,
  Building2,
  Users,
  Target,
  BarChart3,
  Clock,
  Award,
  Filter,
  Mail,
  CheckCircle2,
  Star,
  TrendingUp,
  Search,
  Bot,
  Zap,
  Crown,
  MessageSquare,
  UserCheck,
  Calendar,
  FileText,
} from "lucide-react";

export default function ForRecruitersPage() {
  const navigate = useNavigate();

  const features = [
    {
      icon: Target,
      title: "AI-Powered Matching",
      description: "Our advanced algorithms analyze skills, experience, and job requirements to find the perfect candidates.",
      color: "from-indigo-500 to-indigo-600",
      bgColor: "bg-indigo-100",
      textColor: "text-indigo-600",
    },
    {
      icon: Filter,
      title: "Smart Candidate Screening",
      description: "Automatically screen and rank candidates based on your specific requirements and preferences.",
      color: "from-emerald-500 to-emerald-600",
      bgColor: "bg-emerald-100",
      textColor: "text-emerald-600",
    },
    {
      icon: BarChart3,
      title: "Detailed Analytics",
      description: "Get insights into candidate quality, response rates, and hiring funnel performance.",
      color: "from-purple-500 to-purple-600",
      bgColor: "bg-purple-100",
      textColor: "text-purple-600",
    },
    {
      icon: Clock,
      title: "Instant Results",
      description: "Post a job and receive qualified candidates within hours, not weeks.",
      color: "from-blue-500 to-blue-600",
      bgColor: "bg-blue-100",
      textColor: "text-blue-600",
    },
    {
      icon: Users,
      title: "Large Talent Pool",
      description: "Access 10,000+ pre-verified professionals actively seeking new opportunities.",
      color: "from-pink-500 to-pink-600",
      bgColor: "bg-pink-100",
      textColor: "text-pink-600",
    },
    {
      icon: Mail,
      title: "Seamless Outreach",
      description: "Contact candidates directly through our platform with built-in messaging tools.",
      color: "from-orange-500 to-orange-600",
      bgColor: "bg-orange-100",
      textColor: "text-orange-600",
    },
  ];

  const benefits = [
    {
      icon: TrendingUp,
      title: "70% Faster Hiring",
      description: "Reduce time-to-hire from weeks to days",
    },
    {
      icon: Award,
      title: "95% Match Accuracy",
      description: "AI ensures only qualified candidates reach you",
    },
    {
      icon: Zap,
      title: "24/7 Candidate Discovery",
      description: "Continuous matching even when you're offline",
    },
    {
      icon: Crown,
      title: "Premium Talent Access",
      description: "Connect with top-tier professionals",
    },
  ];

  const testimonials = [
    {
      name: "Jennifer Park",
      role: "Head of Talent",
      company: "TechCorp",
      quote: "Scope AI reduced our time-to-hire by 70%. We found perfect candidates for our senior roles in just 2 days.",
      rating: 5,
    },
    {
      name: "Michael Rodriguez",
      role: "HR Director",
      company: "StartupXYZ",
      quote: "The AI matching is incredible. Every candidate we received was pre-qualified and relevant. Best hiring tool we've used.",
      rating: 5,
    },
    {
      name: "Sarah Thompson",
      role: "Recruiting Manager",
      company: "Global Inc",
      quote: "From posting to hiring in 24 hours. The candidate quality is outstanding - they're exactly what we're looking for.",
      rating: 5,
    },
  ];

  const stats = [
    { value: "500+", label: "Companies Trust Us" },
    { value: "10,000+", label: "Active Candidates" },
    { value: "24hr", label: "Average Time to Hire" },
    { value: "98%", label: "Recruiter Satisfaction" },
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

      {/* Hero Section */}
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12 sm:py-20">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12 sm:mb-16"
        >
          <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-black text-slate-900 mb-4">
            Find Perfect{" "}
            <span className="bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
              Candidates Faster
            </span>
          </h1>
          <p className="text-base sm:text-lg md:text-xl text-slate-600 max-w-3xl mx-auto px-4">
            AI-powered candidate matching from our pool of 10,000+ job seekers. Post once, get pre-screened, ranked candidates instantly.
          </p>
        </motion.div>

        {/* Stats */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="grid grid-cols-2 lg:grid-cols-4 gap-6 mb-16"
        >
          {stats.map((stat, index) => (
            <div
              key={index}
              className="text-center p-6 rounded-2xl bg-gradient-to-br from-indigo-50 to-purple-50 border border-indigo-100"
            >
              <div className="text-3xl sm:text-4xl font-bold text-indigo-600 mb-2">{stat.value}</div>
              <div className="text-sm sm:text-base text-slate-600">{stat.label}</div>
            </div>
          ))}
        </motion.div>

        {/* Features Grid */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-16">
          {features.map((feature, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className="group relative rounded-2xl border border-gray-200 bg-white p-6 sm:p-8 shadow-sm hover:shadow-xl transition-all duration-300 overflow-hidden"
            >
              {/* Gradient Background on Hover */}
              <div className={`absolute inset-0 bg-gradient-to-br ${feature.color} opacity-0 group-hover:opacity-5 transition-opacity duration-300`} />
              
              <div className="relative">
                <div className={`inline-flex rounded-xl ${feature.bgColor} p-4 mb-4 group-hover:scale-110 transition-transform duration-300`}>
                  <feature.icon className={`h-8 w-8 ${feature.textColor}`} />
                </div>
                
                <h3 className="text-xl font-bold text-slate-900 mb-2">{feature.title}</h3>
                <p className="text-sm text-slate-600 leading-relaxed">{feature.description}</p>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Benefits Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="mb-16"
        >
          <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 text-center mb-8">
            Why Choose Scope AI for Hiring
          </h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {benefits.map((benefit, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.5 + index * 0.1 }}
                className="rounded-xl border border-gray-200 bg-white p-6 text-center hover:shadow-lg transition-shadow"
              >
                <div className="inline-flex rounded-full bg-gradient-to-br from-indigo-100 to-purple-100 p-4 mb-4">
                  <benefit.icon className="h-6 w-6 text-indigo-600" />
                </div>
                <h3 className="text-lg font-semibold text-slate-900 mb-2">{benefit.title}</h3>
                <p className="text-sm text-slate-600">{benefit.description}</p>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Testimonials Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.8 }}
          className="mb-16"
        >
          <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 text-center mb-8">
            What Recruiters Say
          </h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {testimonials.map((testimonial, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5, delay: 0.9 + index * 0.1 }}
                className="rounded-xl border border-gray-200 bg-white p-6 hover:shadow-md transition-shadow"
              >
                <div className="flex items-center gap-1 mb-4 text-amber-400">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <Star key={i} className="h-4 w-4 fill-current" />
                  ))}
                </div>
                <p className="text-slate-700 mb-4 leading-relaxed">"{testimonial.quote}"</p>
                <div>
                  <div className="font-semibold text-slate-900">{testimonial.name}</div>
                  <div className="text-sm text-slate-600">{testimonial.role} at {testimonial.company}</div>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* CTA Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 1.2 }}
          className="rounded-2xl bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 p-8 sm:p-12 text-center text-white"
        >
          <Building2 className="h-12 w-12 mx-auto mb-4 opacity-90" />
          <h3 className="text-2xl sm:text-3xl font-bold mb-4">Ready to Hire Smarter?</h3>
          <p className="text-lg text-indigo-100 mb-6 max-w-2xl mx-auto">
            Join hundreds of companies finding perfect candidates with AI-powered matching.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button
              onClick={() => navigate("/signup")}
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-white px-6 py-3 text-indigo-600 font-semibold hover:bg-indigo-50 transition"
            >
              <Building2 className="h-5 w-5" />
              Post Your First Job
            </button>
            
          </div>
        </motion.div>
      </div>
    </div>
  );
}