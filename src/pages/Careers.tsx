import { useNavigate } from "react-router-dom";
import { ArrowLeft, Briefcase, MapPin, Clock } from "lucide-react";
import { motion } from "framer-motion";

export default function Careers() {
  const navigate = useNavigate();

  const openings = [
    {
      title: "Senior Full-Stack Engineer",
      location: "Remote",
      type: "Full-time",
      department: "Engineering",
      description: "Build and scale our AI-powered job automation platform using React, Node.js, and Python.",
    },
    {
      title: "Machine Learning Engineer",
      location: "Remote",
      type: "Full-time",
      department: "AI/ML",
      description: "Develop and improve our CV parsing and job matching algorithms using NLP and deep learning.",
    },
    {
      title: "Product Designer",
      location: "Remote",
      type: "Full-time",
      department: "Design",
      description: "Create intuitive user experiences for job seekers and recruiters using our platform.",
    },
    {
      title: "Customer Success Manager",
      location: "Hybrid",
      type: "Full-time",
      department: "Customer Success",
      description: "Help our users succeed by providing excellent support and gathering product feedback.",
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
            Join Our <span className="bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">Team</span>
          </h1>
          <p className="text-lg sm:text-xl text-slate-600 max-w-3xl mx-auto">
            Help us revolutionize job search with AI. We're building the future of recruitment.
          </p>
        </motion.div>

        {/* Why Join Section */}
        <div className="mb-16">
          <h2 className="text-3xl font-bold text-slate-900 text-center mb-8">Why Scope AI?</h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              {
                title: "🚀 Fast Growth",
                description: "Join a rapidly scaling startup with real impact",
              },
              {
                title: "🌍 Remote First",
                description: "Work from anywhere in the world",
              },
              {
                title: "💡 Cutting-Edge Tech",
                description: "Work with latest AI, ML, and automation tools",
              },
              {
                title: "💰 Competitive Pay",
                description: "Market-leading salaries and equity options",
              },
              {
                title: "🏥 Great Benefits",
                description: "Health insurance, unlimited PTO, and more",
              },
              {
                title: "📚 Learning Budget",
                description: "Annual budget for courses, books, and conferences",
              },
            ].map((benefit, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm hover:shadow-md transition"
              >
                <h3 className="text-lg font-semibold text-slate-900 mb-2">{benefit.title}</h3>
                <p className="text-sm text-slate-600">{benefit.description}</p>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Open Positions */}
        <div>
          <h2 className="text-3xl font-bold text-slate-900 text-center mb-8">Open Positions</h2>
          <div className="space-y-4">
            {openings.map((job, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm hover:shadow-md transition"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
                  <div>
                    <h3 className="text-xl font-bold text-slate-900 mb-2">{job.title}</h3>
                    <div className="flex flex-wrap gap-3 text-sm text-slate-600">
                      <span className="flex items-center gap-1">
                        <MapPin className="h-4 w-4" /> {job.location}
                      </span>
                      <span className="flex items-center gap-1">
                        <Clock className="h-4 w-4" /> {job.type}
                      </span>
                      <span className="flex items-center gap-1">
                        <Briefcase className="h-4 w-4" /> {job.department}
                      </span>
                    </div>
                  </div>
                  <button className="shrink-0 rounded-xl bg-indigo-600 px-6 py-2.5 text-sm font-semibold text-white hover:bg-indigo-500 transition">
                    Apply Now
                  </button>
                </div>
                <p className="text-slate-600">{job.description}</p>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Don't see your role CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.5 }}
          className="mt-16 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 p-8 sm:p-12 text-center text-white"
        >
          <h3 className="text-2xl sm:text-3xl font-bold mb-4">Don't see your role?</h3>
          <p className="text-lg text-indigo-100 mb-6 max-w-2xl mx-auto">
            We're always looking for talented people. Send us your resume and tell us why you'd be a great fit!
          </p>
            <a
            href="#contact"
            className="inline-block rounded-xl bg-white px-6 py-3 text-indigo-600 font-semibold hover:bg-indigo-50 transition"
          >
            Get in Touch
          </a>
        </motion.div>
      </div>
    </div>
  );
}