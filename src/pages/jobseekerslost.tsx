import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
  ArrowLeft,
  Upload,
  Bot,
  ShieldCheck,
  FileText,
  Search,
  CheckCircle2,
  Star,
  Zap,
  TrendingUp,
  Gauge,
  Target,
  Clock,
  Users,
  Award,
  BarChart3,
  Mail,
  MessageSquare,
} from "lucide-react";

export default function ForJobSeekersPage() {
  const navigate = useNavigate();

  const features = [
    {
      icon: ShieldCheck,
      title: "Secure & Private",
      description: "Your data is protected with enterprise-grade security. We never share your information without permission.",
      color: "from-emerald-500 to-emerald-600",
      bgColor: "bg-emerald-100",
      textColor: "text-emerald-600",
    },
    {
      icon: FileText,
      title: "AI CV Parser",
      description: "Advanced AI extracts and understands your skills, experience, and preferences with 95% accuracy.",
      color: "from-indigo-500 to-indigo-600",
      bgColor: "bg-indigo-100",
      textColor: "text-indigo-600",
    },
    {
      icon: Search,
      title: "Smart Job Search",
      description: "Search across 50+ job boards simultaneously. Our AI finds roles that match your profile perfectly.",
      color: "from-purple-500 to-purple-600",
      bgColor: "bg-purple-100",
      textColor: "text-purple-600",
    },
    {
      icon: Gauge,
      title: "Match Scoring",
      description: "Get precise compatibility scores for each role. Focus your energy on the best opportunities.",
      color: "from-blue-500 to-blue-600",
      bgColor: "bg-blue-100",
      textColor: "text-blue-600",
    },
    {
      icon: Bot,
      title: "Auto Applications",
      description: "Automated application submission with personalized cover letters. Apply to 100+ jobs effortlessly.",
      color: "from-pink-500 to-pink-600",
      bgColor: "bg-pink-100",
      textColor: "text-pink-600",
    },
    {
      icon: Target,
      title: "AI CV Builder",
      description: "Create and enhance resumes with AI assistance. Get industry-specific recommendations.",
      color: "from-orange-500 to-orange-600",
      bgColor: "bg-orange-100",
      textColor: "text-orange-600",
    },
  ];

  const benefits = [
    {
      icon: Clock,
      title: "Save 40+ Hours Weekly",
      description: "Automate repetitive job application tasks",
    },
    {
      icon: TrendingUp,
      title: "95% Success Rate",
      description: "Higher interview callback rates with AI optimization",
    },
    {
      icon: Zap,
      title: "Instant Matching",
      description: "Real-time job discovery and application",
    },
    {
      icon: Award,
      title: "ATS Optimized",
      description: "Beat applicant tracking systems automatically",
    },
  ];

  const testimonials = [
    {
      name: "Sarah Chen",
      role: "Software Engineer",
      quote: "Scope AI found me 50+ relevant positions and automated applications to all of them. I got 3 interview calls in the first week!",
      rating: 5,
    },
    {
      name: "Ahmed Al-Rashid",
      role: "Marketing Manager",
      quote: "The AI-generated cover letters were so personalized, recruiters thought I wrote them myself. Amazing technology!",
      rating: 5,
    },
    {
      name: "Emily Rodriguez",
      role: "Data Analyst",
      quote: "I was spending 4 hours a day on job applications. Now Scope AI does it all while I focus on interview prep.",
      rating: 5,
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

      {/* Hero Section */}
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12 sm:py-20">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12 sm:mb-16"
        >
          <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-black text-slate-900 mb-4">
            Automate Your{" "}
            <span className="bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
              Job Search
            </span>
          </h1>
          <p className="text-base sm:text-lg md:text-xl text-slate-600 max-w-3xl mx-auto px-4">
            Upload your CV once and let AI handle the rest. From parsing to applying, we automate everything while you focus on interviews.
          </p>
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
            Why Choose Scope AI
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
            What Job Seekers Say
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
                  <div className="text-sm text-slate-600">{testimonial.role}</div>
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
          <Upload className="h-12 w-12 mx-auto mb-4 opacity-90" />
          <h3 className="text-2xl sm:text-3xl font-bold mb-4">Ready to Automate Your Job Search?</h3>
          <p className="text-lg text-indigo-100 mb-6 max-w-2xl mx-auto">
            Join thousands of professionals who've transformed their job search with AI automation.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button
              onClick={() => navigate("/signup")}
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-white px-6 py-3 text-indigo-600 font-semibold hover:bg-indigo-50 transition"
            >
              <Upload className="h-5 w-5" />
              Start Free Trial
            </button>
            <button
              onClick={() => navigate("/cv-builder")}
              className="inline-flex items-center justify-center gap-2 rounded-xl border-2 border-white px-6 py-3 text-white font-semibold hover:bg-white/10 transition"
            >
              <FileText className="h-5 w-5" />
              Try CV Builder
            </button>
          </div>
        </motion.div>
      </div>
    </div>
  );
}