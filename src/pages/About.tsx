import { useNavigate } from "react-router-dom";
import { ArrowLeft, Target, Users, Zap, Shield } from "lucide-react";
import { motion } from "framer-motion";

export default function About() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white">
      {/* Header */}
      <div className="border-b border-gray-200 bg-white/80 backdrop-blur-xl">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 items-center justify-between">
            <button
              onClick={() => navigate("/")}
              className="flex items-center gap-2 text-sm text-slate-600 hover:text-slate-900"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to Home
            </button>
          </div>
        </div>
      </div>

      {/* Hero Section */}
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-16 sm:py-24">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-black text-slate-900 mb-4">
            About <span className="bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">Scope AI</span>
          </h1>
          <p className="text-lg sm:text-xl text-slate-600 max-w-3xl mx-auto">
            Revolutionizing job search with AI-powered automation
          </p>
        </motion.div>

        {/* Mission Section */}
        <div className="grid md:grid-cols-2 gap-12 items-center mb-20">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            <h2 className="text-3xl font-bold text-slate-900 mb-4">Our Mission</h2>
            <p className="text-slate-600 leading-relaxed mb-4">
              We believe job hunting shouldn't be a full-time job. Scope AI was founded to eliminate the tedious, repetitive work of job applications and let candidates focus on what matters—preparing for interviews and landing their dream role.
            </p>
            <p className="text-slate-600 leading-relaxed">
              Our AI-powered platform automates the entire application process, from CV parsing to job matching to submission, saving job seekers hundreds of hours while improving application quality and success rates.
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 p-8 text-white"
          >
            <h3 className="text-2xl font-bold mb-6">By the Numbers</h3>
            <div className="space-y-4">
              <div>
                <div className="text-4xl font-extrabold">10,000+</div>
                <div className="text-indigo-100">Active Users</div>
              </div>
              <div>
                <div className="text-4xl font-extrabold">100,000+</div>
                <div className="text-indigo-100">Applications Submitted</div>
              </div>
              <div>
                <div className="text-4xl font-extrabold">95%</div>
                <div className="text-indigo-100">Success Rate</div>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Values Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="mb-20"
        >
          <h2 className="text-3xl font-bold text-slate-900 text-center mb-12">Our Values</h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              {
                icon: Target,
                title: "User-First",
                description: "Every feature is designed with job seekers in mind",
              },
              {
                icon: Zap,
                title: "Innovation",
                description: "Leveraging cutting-edge AI to solve real problems",
              },
              {
                icon: Shield,
                title: "Security",
                description: "Your data is protected with enterprise-grade security",
              },
              {
                icon: Users,
                title: "Transparency",
                description: "Clear pricing, honest results, no hidden fees",
              },
            ].map((value, index) => (
              <div
                key={index}
                className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm hover:shadow-md transition"
              >
                <value.icon className="h-10 w-10 text-indigo-600 mb-4" />
                <h3 className="text-lg font-semibold text-slate-900 mb-2">{value.title}</h3>
                <p className="text-sm text-slate-600">{value.description}</p>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Story Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.5 }}
          className="rounded-2xl border border-gray-200 bg-white p-8 sm:p-12 shadow-lg"
        >
          <h2 className="text-3xl font-bold text-slate-900 mb-6">Our Story</h2>
          <div className="space-y-4 text-slate-600 leading-relaxed">
            <p>
              Scope AI was born from personal frustration. Our founders spent countless hours manually applying to hundreds of jobs, copying and pasting the same information, and waiting for responses that rarely came.
            </p>
            <p>
              We realized that in 2025, with advanced AI capabilities, this process could be completely automated. So we built Scope AI—combining natural language processing, machine learning, and browser automation to handle the entire job application workflow.
            </p>
            <p>
              Today, we're proud to serve thousands of job seekers worldwide, helping them land opportunities faster and with less stress. Our platform has evolved to include AI CV builders, intelligent job matching, and automated application tracking—all designed to give candidates an edge in today's competitive job market.
            </p>
          </div>
        </motion.div>
      </div>
    </div>
  );
}