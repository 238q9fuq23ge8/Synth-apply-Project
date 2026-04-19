import { motion } from "framer-motion";
import { Star, Quote, CheckCircle2 } from "lucide-react";
import { useState, useEffect } from "react";

export function ReviewsSection() {
  const [currentReview, setCurrentReview] = useState(0);

  // Auto-rotate reviews every 5 seconds
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentReview((prev) => (prev + 1) % reviews.length);
    }, 5000);
    return () => clearInterval(timer);
  }, []);

  const reviews = [
    {
      id: 1,
      name: "Ahmed Al-Rashid",
      title: "Senior Software Engineer",
      location: "Dubai, UAE",
      avatar: "🧑🏽‍💻",
      rating: 5,
      review: "ScopeAI transformed my job search completely. In just 3 days, I received 12 interview calls from top tech companies in Dubai. The AI perfectly matched my React.js skills with relevant positions.",
      highlight: "12 interview calls in 3 days",
      verified: true,
    },
    {
      id: 2,
      name: "Sarah Mitchell",
      title: "Marketing Manager",
      location: "London, UK",
      avatar: "👩🏼‍💼",
      rating: 5,
      review: "As a busy professional, I didn't have time to manually apply to jobs. ScopeAI's automation saved me 40+ hours and landed me my dream marketing role at a Fortune 500 company.",
      highlight: "Saved 40+ hours",
      verified: true,
    },
    {
      id: 3,
      name: "Omar Hassan",
      title: "Data Scientist",
      location: "Riyadh, KSA",
      avatar: "🧑🏽‍🔬",
      rating: 5,
      review: "The AI-powered CV parsing and job matching is incredibly accurate. Within a week, I had offers from 3 different fintech companies. The 95% match accuracy is not just a claim - it's real!",
      highlight: "3 job offers in 1 week",
      verified: true,
    },
    {
      id: 4,
      name: "Emily Chen",
      title: "Product Designer",
      location: "Toronto, Canada",
      avatar: "👩🏻‍🎨",
      rating: 5,
      review: "The automated application process is seamless. I uploaded my portfolio once, and ScopeAI handled everything else. The personalized cover letters were spot-on for each application.",
      highlight: "Seamless automation",
      verified: true,
    },
    {
      id: 5,
      name: "Khalid Al-Mansouri",
      title: "DevOps Engineer",
      location: "Abu Dhabi, UAE",
      avatar: "🧑🏽‍💻",
      rating: 5,
      review: "I was skeptical about AI job applications until I tried ScopeAI. The quality of matches and the professional approach impressed hiring managers. Landed my current role with 40% salary increase.",
      highlight: "40% salary increase",
      verified: true,
    },
    {
      id: 6,
      name: "Jennifer Thompson",
      title: "HR Director",
      location: "New York, USA",
      avatar: "👩🏼‍💼",
      rating: 5,
      review: "From a recruiter's perspective, candidates who use ScopeAI stand out. Their applications are well-targeted and professional. It's clearly the future of job searching.",
      highlight: "Professional applications",
      verified: true,
    },
    {
      id: 7,
      name: "Fatima Al-Zahra",
      title: "Business Analyst",
      location: "Doha, Qatar",
      avatar: "🧕🏽",
      rating: 5,
      review: "As a working mother, time is precious. ScopeAI's automation allowed me to job hunt while managing family responsibilities. The results exceeded my expectations - 8 interviews in 2 weeks!",
      highlight: "8 interviews in 2 weeks",
      verified: true,
    },
    {
      id: 8,
      name: "Michael Rodriguez",
      title: "Full Stack Developer",
      location: "Madrid, Spain",
      avatar: "🧑🏽‍💻",
      rating: 5,
      review: "The credit system is fair and transparent. I used only 200 credits and got my ideal remote position. The AI's ability to find relevant jobs across multiple platforms is impressive.",
      highlight: "Found ideal remote job",
      verified: true,
    }
  ];

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        className={`h-4 w-4 ${
          i < rating ? "text-yellow-400 fill-current" : "text-gray-300"
        }`}
      />
    ));
  };

  return (
    <section className="relative bg-gradient-to-b from-slate-50 to-white py-12 sm:py-16 md:py-20 overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#8080800a_1px,transparent_1px),linear-gradient(to_bottom,#8080800a_1px,transparent_1px)] bg-[size:24px_24px]" />
      
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative">
        {/* Header */}
        <div className="text-center mb-12 sm:mb-16">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="mb-4"
          >
            <div className="inline-flex items-center justify-center gap-2 rounded-full border border-indigo-200/60 bg-white/70 px-3 py-1 text-xs text-indigo-700 shadow-sm">
              <Star className="h-3.5 w-3.5 text-yellow-400 fill-current" />
              Trusted by 1,000,000+ Job Seekers Worldwide
            </div>
          </motion.div>
          
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="text-2xl sm:text-3xl md:text-4xl font-bold text-slate-900 mb-4"
          >
            Success Stories from Our Community
          </motion.h2>
          
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="text-sm sm:text-base text-slate-600 max-w-2xl mx-auto"
          >
            Real professionals sharing their job search transformation with ScopeAI
          </motion.p>
        </div>

        {/* Reviews Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8 max-w-7xl mx-auto">
          {reviews.slice(0, 6).map((review, index) => (
            <motion.div
              key={review.id}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              className="relative bg-white rounded-2xl border border-gray-200 p-6 shadow-md hover:shadow-xl transition-all duration-300 group"
            >
              {/* Quote Icon */}
              <div className="absolute -top-3 -left-3">
                <div className="w-8 h-8 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-full flex items-center justify-center shadow-lg">
                  <Quote className="h-4 w-4 text-white" />
                </div>
              </div>

              {/* Rating */}
              <div className="flex items-center gap-1 mb-4">
                {renderStars(review.rating)}
                {review.verified && (
                  <CheckCircle2 className="h-4 w-4 text-emerald-500 ml-2" />
                )}
              </div>

              {/* Review Text */}
              <blockquote className="text-slate-700 text-sm leading-relaxed mb-4 line-clamp-4">
                "{review.review}"
              </blockquote>

              {/* Highlight */}
              <div className="bg-gradient-to-r from-indigo-50 to-purple-50 border border-indigo-100 rounded-lg px-3 py-2 mb-4">
                <div className="text-xs font-semibold text-indigo-700">
                  ✨ {review.highlight}
                </div>
              </div>

              {/* Author Info */}
              <div className="flex items-center gap-3 mt-4">
                <div className="w-10 h-10 bg-gradient-to-br from-slate-100 to-slate-200 rounded-full flex items-center justify-center text-lg">
                  {review.avatar}
                </div>
                <div>
                  <div className="font-semibold text-slate-900 text-sm">
                    {review.name}
                  </div>
                  <div className="text-xs text-slate-600">
                    {review.title}
                  </div>
                  <div className="text-xs text-slate-500">
                    📍 {review.location}
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Featured Review Carousel */}
        <div className="mt-16 max-w-4xl mx-auto">
          <div className="bg-gradient-to-br from-indigo-500 via-purple-600 to-pink-600 rounded-2xl p-8 text-white relative overflow-hidden">
            {/* Background Pattern */}
            <div className="absolute inset-0 bg-white/5 bg-[linear-gradient(45deg,transparent_25%,rgba(255,255,255,0.1)_25%,rgba(255,255,255,0.1)_50%,transparent_50%,transparent_75%,rgba(255,255,255,0.1)_75%)] bg-[length:20px_20px]" />
            
            <div className="relative">
              <motion.div
                key={currentReview}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.5 }}
                className="text-center"
              >
                <div className="flex justify-center mb-4">
                  {renderStars(reviews[currentReview].rating)}
                </div>
                
                <blockquote className="text-lg sm:text-xl font-medium leading-relaxed mb-6 max-w-3xl mx-auto">
                  "{reviews[currentReview].review}"
                </blockquote>
                
                <div className="flex items-center justify-center gap-4">
                  <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center text-xl backdrop-blur-sm">
                    {reviews[currentReview].avatar}
                  </div>
                  <div className="text-left">
                    <div className="font-semibold text-lg">
                      {reviews[currentReview].name}
                    </div>
                    <div className="text-white/80 text-sm">
                      {reviews[currentReview].title} • {reviews[currentReview].location}
                    </div>
                  </div>
                </div>
              </motion.div>
            </div>
          </div>

          {/* Pagination Dots */}
          <div className="flex justify-center gap-2 mt-6">
            {reviews.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentReview(index)}
                className={`w-2 h-2 rounded-full transition-all ${
                  index === currentReview
                    ? "bg-indigo-600 w-6"
                    : "bg-gray-300 hover:bg-gray-400"
                }`}
              />
            ))}
          </div>
        </div>

        {/* Stats
        <div className="mt-16 grid grid-cols-2 md:grid-cols-4 gap-6 max-w-4xl mx-auto">
          {[
            { value: "1M+", label: "Job Seekers", icon: "👥" },
            { value: "95%", label: "Success Rate", icon: "📈" },
            { value: "2.3s", label: "Avg Parse Time", icon: "⚡" },
            { value: "40hrs", label: "Time Saved", icon: "⏰" },
          ].map((stat, index) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              className="text-center p-4 rounded-xl bg-white border border-gray-200 shadow-sm"
            >
              <div className="text-2xl mb-2">{stat.icon}</div>
              <div className="text-2xl font-bold text-slate-900 mb-1">
                {stat.value}
              </div>
              <div className="text-xs text-slate-600">{stat.label}</div>
            </motion.div>
          ))}
        </div> */}
      </div>
    </section>
  );
}

export default ReviewsSection;