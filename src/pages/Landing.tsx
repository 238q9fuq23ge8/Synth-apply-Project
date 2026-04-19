"use client";

import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { useCurrency, COUNTRY_MAP } from "@/pages/currency_context";
import {
  ArrowRight, Upload, Bot, Sparkles, ShieldCheck, FileText, Search,
  CheckCircle2, CreditCard, Menu, X, Phone, Mail, MessageCircle, 
  ChevronDown, ChevronUp, Star, Calendar, MapPin, Briefcase, 
  ChevronRight, ChevronLeft, Globe, Zap, Clock, ThumbsUp, Layers, Check, Trophy, Lightbulb, Infinity as InfinityIcon, Figma, Rocket, Crown
} from "lucide-react";

import ScopeLogo from "@/assets/WhatsApp_Image_2025-10-17_at_13.05.55_6ba1ea04-removebg-preview (1).png";



// Local Images from img-homepage
import robotImg from "@/assets/img-homepage/97df62f9-6b80-495c-837e-00f19049634e 1.png";
import step1Img from "@/assets/img-homepage/upload cv page 1.png";
import step2Img from "@/assets/img-homepage/upload 1.png";
import step3Img from "@/assets/img-homepage/upload 2.png";
import img1 from "@/assets/img-homepage/1.png";
import img2 from "@/assets/img-homepage/2.png";
import img3 from "@/assets/img-homepage/3.png";
import img4 from "@/assets/img-homepage/4.png";
import img5 from "@/assets/img-homepage/5.png";
import stripeImg from "@/assets/img-homepage/Group 1215870321.png";
import abstractBg from "@/assets/img-homepage/0_Abstract_Background_3840x2160 1.png";
import cardTotalImg from "@/assets/img-homepage/card-total-icon.png";

// Reusable Components
function Container({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return <div className={`mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8 ${className}`}>{children}</div>;
}



// 2. Hero Section
function HeroSection() {
  const navigate = useNavigate();
  return (
    <section className="relative overflow-hidden bg-gradient-to-b from-indigo-50/50 to-white py-12 sm:py-20">
      <Container className="grid lg:grid-cols-2 gap-10 lg:gap-8 items-center">
        <motion.div initial={{ opacity: 0, x: -30 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.6 }}>
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-blue-200 bg-blue-50 text-blue-700 text-sm font-medium mb-6">
            <Star className="w-4 h-4 fill-blue-500 text-blue-500" />
            Trusted By 10,000+ Professionals
          </div>
          <h1 className="text-4xl md:text-5xl lg:text-[56px] font-extrabold text-slate-900 leading-[1.1] tracking-[0.01em] mb-5">
            Your AI Career <br />
            <span className="text-[#3b82f6] block mt-1">Assistant</span>
          </h1>
          <p className="text-[16px] text-slate-600 leading-[1.5] max-w-[460px] mb-10 pb-2">
            One CV Upload. AI Handles Everything Else. From Parsing To Applying, We Automate The Entire Job Search Process While You Focus On Interviews.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 mb-14">
            <button onClick={() => navigate("/job-search")} className="flex items-center justify-center gap-2 px-6 py-3 border border-slate-300 text-[#3b82f6] text-[15px] font-semibold rounded-lg hover:bg-slate-50 transition w-full sm:w-auto shadow-sm">
              Explore Jobs <Briefcase className="w-4 h-4 ml-1" />
            </button>
            <button onClick={() => navigate("/signup")} className="flex items-center justify-center gap-2 px-6 py-3.5 bg-[#4B70F5] text-white font-semibold rounded-lg hover:bg-blue-600 transition shadow-lg shadow-blue-500/30 w-full sm:w-auto">
              Start Your Free Trial <ArrowRight className="w-4 h-4" />
            </button>
          </div>
          <div className="flex items-center gap-8 lg:gap-12">
            <div>
              <div className="text-3xl font-bold text-slate-900 mb-1">100k+</div>
              <div className="text-sm text-slate-500">Auto-Applies</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-slate-900 mb-1">88%</div>
              <div className="text-sm text-slate-500">Avg. Relevance</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-slate-900 mb-1">+62</div>
              <div className="text-sm text-slate-500">NPS</div>
            </div>
          </div>
        </motion.div>

        <motion.div initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.6, delay: 0.2 }} className="relative perspective-1000 hidden lg:block">
          <div className="relative w-full max-w-xl mx-auto h-[500px]">
             {/* Robot Image */}
             <motion.img 
               animate={{ y: [0, -15, 0] }} 
               transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
               src={robotImg} 
               className="absolute -top-10 -left-28 sm:-left-36 w-56 z-0 drop-shadow-2xl" 
               alt="AI Robot" 
             />
             
             <div className="absolute inset-0 bg-white rounded-2xl shadow-2xl border border-gray-100 p-6 flex flex-col gap-4">
                {/* CV Processing Card */}
                <div className="flex items-center gap-4 p-4 rounded-xl shadow-sm border border-gray-50 bg-white">
                  <div className="p-3 bg-purple-100 text-purple-600 rounded-lg"><FileText className="w-6 h-6" /></div>
                  <div><div className="font-bold text-slate-900">CV Processing</div><div className="text-xs text-slate-500">Real-time automation</div></div>
                </div>
                {/* CV Uploaded Card */}
                <div className="flex items-center gap-4 p-4 rounded-xl shadow-sm border border-emerald-100 bg-emerald-50/30">
                  <div className="p-1 bg-emerald-500 text-white rounded-full"><Check className="w-4 h-4" /></div>
                  <div><div className="font-bold text-emerald-800">CV Uploaded</div><div className="text-xs text-emerald-600">Parsed in 2.3 seconds</div></div>
                </div>
                {/* Jobs Found Card */}
                <div className="flex items-center gap-4 p-4 rounded-xl shadow-sm border border-blue-100 bg-blue-50/30">
                  <div className="p-2 bg-blue-100 text-blue-600 rounded-lg"><Search className="w-5 h-5" /></div>
                  <div><div className="font-bold text-blue-800">327 Jobs Found</div><div className="text-xs text-blue-600">Matched to your profile</div></div>
                </div>
                {/* Applied Card */}
                <div className="flex items-center gap-4 p-4 rounded-xl shadow-sm border border-purple-100 bg-purple-50/30">
                  <div className="p-2 bg-purple-100 text-purple-600 rounded-lg transform -rotate-12"><ArrowRight className="w-5 h-5" /></div>
                  <div><div className="font-bold text-purple-800">127 Applied</div><div className="text-xs text-purple-600">Automatically submitted</div></div>
                </div>
                {/* Success Rate Card */}
                <div className="flex items-center gap-4 p-4 rounded-xl shadow-sm border border-orange-100 bg-orange-50/30">
                  <div className="p-2 bg-orange-100 text-orange-600 rounded-full"><CheckCircle2 className="w-5 h-5" /></div>
                  <div><div className="font-bold text-orange-800">95% Success Rate</div><div className="text-xs text-orange-600">Applications processed successfully</div></div>
                </div>
             </div>
          </div>
        </motion.div>
      </Container>
    </section>
  );
}

// 3. Simple Fast Powerful (3 Steps)
function ThreeSteps() {
  return (
    <section className="py-20 bg-white">
      <Container className="text-center">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: "-100px" }}>
          <h2 className="text-3xl md:text-4xl font-extrabold text-slate-900 mb-4">Simple. Fast. Powerful.</h2>
          <p className="text-slate-600 mb-12">Get Started In Just 3 Easy Steps And Let AI Transform Your Job Search</p>
        </motion.div>
        
        <div className="grid md:grid-cols-3 gap-8 text-left">
          <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: "-50px" }} transition={{ duration: 0.5 }} className="rounded-2xl border border-gray-100 p-6 shadow-lg shadow-gray-200/40 bg-white hover:-translate-y-1 transition duration-300">
            <div className="h-48 w-full bg-slate-50 rounded-xl mb-6 overflow-hidden border border-gray-100 flex items-center justify-center p-2">
              <img src={step1Img} alt="Step 1" className="max-w-full max-h-full object-contain" />
            </div>
            <h3 className="text-lg font-bold text-slate-900 mb-2">1. Upload Your CV</h3>
            <p className="text-sm text-slate-600 leading-relaxed">Increase your chances of getting hired with AI-optimized applications.</p>
          </motion.div>
          <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: "-50px" }} transition={{ duration: 0.5, delay: 0.15 }} className="rounded-2xl border border-gray-100 p-6 shadow-lg shadow-gray-200/40 bg-white hover:-translate-y-1 transition duration-300">
            <div className="h-48 w-full bg-slate-50 rounded-xl mb-6 overflow-hidden border border-gray-100 flex items-center justify-center p-2">
              <img src={step2Img} alt="Step 2" className="max-w-full max-h-full object-contain" />
            </div>
            <h3 className="text-lg font-bold text-slate-900 mb-2">2. Discover Matching Jobs And Apply</h3>
            <p className="text-sm text-slate-600 leading-relaxed">AI finds the most relevant opportunities for you based on your skills, experience, and career goals.</p>
          </motion.div>
          <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: "-50px" }} transition={{ duration: 0.5, delay: 0.3 }} className="rounded-2xl border border-gray-100 p-6 shadow-lg shadow-gray-200/40 bg-white hover:-translate-y-1 transition duration-300">
            <div className="h-48 w-full bg-slate-50 rounded-xl mb-6 overflow-hidden border border-gray-100 flex items-center justify-center p-2">
              <img src={step3Img} alt="Step 3" className="max-w-full max-h-full object-contain" />
            </div>
            <h3 className="text-lg font-bold text-slate-900 mb-2">3. Apply Automatically Using AI Auto Apply</h3>
            <p className="text-sm text-slate-600 leading-relaxed">Let AI apply to jobs while you focus on what matters. Save hours of manual applications.</p>
          </motion.div>
        </div>
      </Container>
    </section>
  );
}

// 4. Powerful Features
function PowerfulFeatures() {
  const features = [
    { icon: <Search className="w-5 h-5" />, title: "AI Job Matching", desc: "Get Personalized Job Recommendations Based On Your CV, Skills, And Career Aspirations.", color: "bg-purple-100 text-purple-600" },
    { icon: <Bot className="w-5 h-5" />, title: "Auto Apply with AI", desc: "Apply To Multiple Jobs Automatically In Minutes. Let AI Handle The Repetitive Work.", color: "bg-pink-100 text-pink-600" },
    { icon: <FileText className="w-5 h-5" />, title: "CV Builder with AI", desc: "Create A Professional CV Tailored To Your Role With AI-Powered Suggestions.", color: "bg-violet-100 text-violet-600" },
    { icon: <Zap className="w-5 h-5" />, title: "Skill Gap Analysis", desc: "Identify Missing Skills And Improve Your Profile With Personalized Recommendations.", color: "bg-fuchsia-100 text-fuchsia-600" },
    { icon: <ShieldCheck className="w-5 h-5" />, title: "Privacy First", desc: "Your Data Is Secure And Encrypted. We Never Share Your Information.", color: "bg-purple-100 text-purple-600" },
    { icon: <Clock className="w-5 h-5" />, title: "24/7 Support", desc: "Get Help Anytime With Our Dedicated Support Team.", color: "bg-fuchsia-100 text-fuchsia-600" },
    { icon: <CheckCircle2 className="w-5 h-5" />, title: "Guaranteed Delivery", desc: "We Make Sure Your Applications Are Submitted Successfully And Reach The Employer.", color: "bg-pink-100 text-pink-600" },
  ];

  return (
    <section className="py-20 bg-slate-50/50">
      <Container>
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: "-100px" }} className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-extrabold text-slate-900 mb-4">Powerful Features to Boost Your Career</h2>
          <p className="text-slate-600">Everything You Need To Succeed In Your Job Search, Powered By AI</p>
        </motion.div>
        
        <div className="flex flex-wrap justify-center gap-6 max-w-6xl mx-auto">
          {features.map((f, i) => (
            <motion.div initial={{ opacity: 0, scale: 0.95, y: 15 }} whileInView={{ opacity: 1, scale: 1, y: 0 }} viewport={{ once: true, margin: "-50px" }} transition={{ duration: 0.4, delay: i * 0.05 }} key={i} className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 w-full sm:w-[calc(50%-12px)] lg:w-[calc(33.33%-16px)] xl:w-[calc(25%-18px)] hover:shadow-md transition">
              <div className={`w-10 h-10 rounded-lg flex items-center justify-center mb-4 ${f.color}`}>
                {f.icon}
              </div>
              <h3 className="text-lg font-bold text-slate-900 mb-2">{f.title}</h3>
              <p className="text-sm text-slate-600 leading-relaxed">{f.desc}</p>
            </motion.div>
          ))}
        </div>
      </Container>
    </section>
  );
}

// 5 & 6. Roles
function RoleSections() {
  const navigate = useNavigate();
  return (
    <section className="py-24 bg-white space-y-32">
      {/* Job Seekers */}
      <Container className="grid lg:grid-cols-2 gap-16 items-center">
        <motion.div initial={{ opacity: 0, x: -40 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true, margin: "-100px" }} transition={{ duration: 0.6 }}>
          <div className="inline-block px-3 py-1 bg-pink-500 text-white text-xs font-bold uppercase rounded-full mb-4">For Job Seekers</div>
          <h2 className="text-3xl md:text-4xl font-extrabold text-slate-900 mb-6">Land Your Next Job Faster with AI</h2>
          <p className="text-slate-600 mb-8 leading-relaxed">
            Our Platform Uses AI To Match You With The Right Opportunities And Handle The Application Process—So You Can Focus On Preparing For Interviews.
          </p>
          <ul className="space-y-6 mb-8">
            <li className="flex items-start gap-3">
              <CheckCircle2 className="w-5 h-5 text-blue-500 mt-0.5" />
              <div><strong className="text-slate-900 block font-semibold mb-1">Find The Right Jobs Instantly</strong><span className="text-sm text-slate-600">Get matched with opportunities that fit your skills, experience, and career goals.</span></div>
            </li>
            <li className="flex items-start gap-3">
              <CheckCircle2 className="w-5 h-5 text-blue-500 mt-0.5" />
              <div><strong className="text-slate-900 block font-semibold mb-1">Stand Out With A Stronger CV</strong><span className="text-sm text-slate-600">Receive AI-powered suggestions to improve your CV and increase your chances of getting noticed.</span></div>
            </li>
            <li className="flex items-start gap-3">
              <CheckCircle2 className="w-5 h-5 text-blue-500 mt-0.5" />
              <div><strong className="text-slate-900 block font-semibold mb-1">Apply Automatically With AI</strong><span className="text-sm text-slate-600">Save hours by letting AI apply to relevant jobs on your behalf.</span></div>
            </li>
            <li className="flex items-start gap-3">
              <CheckCircle2 className="w-5 h-5 text-blue-500 mt-0.5" />
              <div><strong className="text-slate-900 block font-semibold mb-1">Track Your Progress</strong><span className="text-sm text-slate-600">Stay updated on your applications and see how they progress through the hiring process.</span></div>
            </li>
          </ul>
          <button onClick={() => navigate("/signup")} className="px-6 py-3 bg-[#4B70F5] text-white font-semibold rounded-lg hover:bg-blue-600 shadow-lg shadow-blue-500/30">Start Your Job Search</button>
        </motion.div>
        <motion.div initial={{ opacity: 0, x: 40 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true, margin: "-100px" }} transition={{ duration: 0.6, delay: 0.2 }} className="relative">
          {/* Job Seeker Dashboard Mockup in HTML */}
          <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-6 max-w-lg mx-auto transform hover:-translate-y-1 transition duration-500">
             <div className="flex items-center gap-2 mb-6">
                <div className="w-3 h-3 rounded-full bg-red-400"></div>
                <div className="w-3 h-3 rounded-full bg-yellow-400"></div>
                <div className="w-3 h-3 rounded-full bg-green-400"></div>
             </div>
             <div className="flex items-center gap-4 mb-6 pb-6 border-b border-gray-50">
                <div className="w-12 h-12 bg-slate-200 rounded-full overflow-hidden">
                   <img src={img1} className="w-full h-full object-cover" alt="Alex Smith" />
                </div>
                <div>
                   <h4 className="font-bold text-slate-900">Alex Smith</h4>
                   <p className="text-xs text-slate-500">UI/UX Designer</p>
                </div>
             </div>
             <div className="space-y-3 mb-6">
                <div className="h-2 bg-slate-100 rounded w-full"></div>
                <div className="h-2 bg-slate-100 rounded w-5/6"></div>
                <div className="h-2 bg-slate-100 rounded w-4/6"></div>
             </div>
             
             {/* Overlapping Card */}
             <div className="absolute -bottom-8 -right-8 bg-white rounded-xl shadow-2xl border border-gray-100 p-5 w-72 z-10">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                     <div className="w-8 h-8 rounded bg-white shadow-sm border border-gray-50 flex items-center justify-center">
                        <Figma className="w-5 h-5 text-pink-500" />
                     </div>
                     <div>
                       <div className="font-bold text-sm text-slate-900 leading-tight">Product Designer</div>
                     </div>
                  </div>
                  <div className="relative w-8 h-8 flex items-center justify-center">
                     <svg className="w-full h-full transform -rotate-90" viewBox="0 0 36 36">
                       <path className="text-gray-100" strokeWidth="3" stroke="currentColor" fill="none" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" />
                       <path className="text-emerald-500" strokeWidth="3" strokeDasharray="85, 100" strokeLinecap="round" stroke="currentColor" fill="none" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" />
                     </svg>
                     <span className="absolute text-[8px] font-bold text-emerald-600">85%</span>
                  </div>
                </div>
                <div className="space-y-3 mb-6 flex-col flex items-center w-full mt-2">
                   <div className="h-2 bg-slate-100 rounded w-full"></div>
                   <div className="h-2 bg-slate-100 rounded w-full"></div>
                </div>
                <div className="flex items-center justify-between mt-4">
                   <div className="px-3 py-1 bg-[#4B70F5] text-white text-[10px] sm:text-[11px] font-bold rounded-full">Full Time</div>
                   <button className="px-5 py-2 bg-[#4B70F5] text-white text-xs font-bold rounded-lg shadow-sm">Apply</button>
                </div>
             </div>
          </div>
        </motion.div>
      </Container>

      {/* Recruiters */}
      <Container className="grid lg:grid-cols-2 gap-16 items-center">
        <motion.div initial={{ opacity: 0, x: -40 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true, margin: "-100px" }} transition={{ duration: 0.6, delay: 0.2 }} className="order-2 lg:order-1 relative">
          
          <div className="flex flex-col gap-0 max-w-lg mx-auto w-full">
             <div className="bg-white rounded-2xl rounded-b-none shadow-[0_-10px_40px_-15px_rgba(0,0,0,0.1)] border border-gray-100 border-b-0 p-6 relative w-full">
                 <h3 className="font-bold text-slate-900 mb-6 pb-2 text-lg">Top Candidates (AI-Ranked)</h3>
                 <div className="space-y-4">
                    {[
                      { name: "Lama M.", role: "Data Scientist", match: "94%", img: img2 },
                      { name: "Omar K.", role: "Backend Engineer", match: "91%", img: img3 },
                      { name: "Ayesha R.", role: "Product Designer", match: "88%", img: img4 }
                    ].map((c, i) => (
                      <div key={i} className="flex items-center justify-between p-3 rounded-xl bg-slate-50/40 hover:bg-slate-50 transition border border-gray-50 shadow-sm">
                        <div className="flex items-center gap-4">
                           <img src={c.img} className="w-12 h-12 rounded-full object-cover bg-slate-200 border border-gray-100 shadow-sm" alt={c.name} />
                           <div>
                             <div className="font-bold text-sm text-slate-900">{c.name}</div>
                             <div className="text-xs text-slate-500 mt-0.5">{c.role}</div>
                           </div>
                        </div>
                        <div className="text-right pr-2">
                           <div className="text-lg font-extrabold text-[#4B70F5]">{c.match}</div>
                           <div className="text-[10px] font-semibold text-slate-400 capitalize whitespace-nowrap mt-0.5">Match</div>
                        </div>
                      </div>
                    ))}
                 </div>
             </div>
             
             {/* Stats Overlay flowing seamlessly */}
             <div className="bg-white rounded-2xl rounded-t-none shadow-xl border border-gray-100 pt-2 pb-6 px-4 flex items-center justify-between divide-x divide-gray-100 w-full relative z-10 bottom-1">
                <div className="px-2 lg:px-4 text-center w-1/3">
                  <div className="text-lg font-bold text-[#4B70F5]">100k+</div>
                  <div className="text-[10px] text-slate-500 font-semibold whitespace-nowrap mt-1">Auto-applies</div>
                </div>
                <div className="px-2 lg:px-4 text-center w-1/3">
                  <div className="text-lg font-bold text-[#4B70F5]">88%</div>
                  <div className="text-[10px] text-slate-500 font-semibold whitespace-nowrap mt-1">Avg. relevance</div>
                </div>
                <div className="px-2 lg:px-4 text-center w-1/3">
                  <div className="text-lg font-bold text-[#4B70F5]">+62</div>
                  <div className="text-[10px] text-slate-500 font-semibold whitespace-nowrap mt-1">NPS</div>
                </div>
             </div>
          </div>
        </motion.div>
        <motion.div initial={{ opacity: 0, x: 40 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true, margin: "-100px" }} transition={{ duration: 0.6 }} className="order-1 lg:order-2">
          <div className="inline-block px-3 py-1 bg-pink-500 text-white text-xs font-bold uppercase rounded-full mb-4">For Recruiters</div>
          <h2 className="text-3xl md:text-4xl font-extrabold text-slate-900 mb-6">Hire the Right Talent Faster with AI</h2>
          <p className="text-slate-600 mb-8 leading-relaxed">
            Our Platform Helps You Find, Evaluate, And Manage Candidates Efficiently—So You Can Focus On Making The Best Hiring Decisions.
          </p>
          <ul className="space-y-6 mb-8">
            <li className="flex items-start gap-3">
              <CheckCircle2 className="w-5 h-5 text-blue-500 mt-0.5" />
              <div><strong className="text-slate-900 block font-semibold mb-1">Post Jobs In Minutes</strong><span className="text-sm text-slate-600">Create and publish job listings in minutes with a simple and intuitive workflow.</span></div>
            </li>
            <li className="flex items-start gap-3">
              <CheckCircle2 className="w-5 h-5 text-blue-500 mt-0.5" />
              <div><strong className="text-slate-900 block font-semibold mb-1">Find The Best-Fit Candidates</strong><span className="text-sm text-slate-600">AI analyzes applications and highlights candidates who match your role requirements.</span></div>
            </li>
            <li className="flex items-start gap-3">
              <CheckCircle2 className="w-5 h-5 text-blue-500 mt-0.5" />
              <div><strong className="text-slate-900 block font-semibold mb-1">Streamline Your Hiring Process</strong><span className="text-sm text-slate-600">Manage applications, track candidate progress, and stay organized in one place.</span></div>
            </li>
            <li className="flex items-start gap-3">
              <CheckCircle2 className="w-5 h-5 text-blue-500 mt-0.5" />
              <div><strong className="text-slate-900 block font-semibold mb-1">Make Faster Hiring Decisions</strong><span className="text-sm text-slate-600">Get clear insights and candidate rankings to quickly identify top talent.</span></div>
            </li>
          </ul>
          <button onClick={() => navigate("/recruiter")} className="px-6 py-3 bg-[#4B70F5] text-white font-semibold rounded-lg hover:bg-blue-600 shadow-lg shadow-blue-500/30">Start Hiring Today</button>
        </motion.div>
      </Container>
    </section>
  );
}

function LatestJobs() {
  const navigate = useNavigate();
  const jobs = Array(4).fill(null);
  return (
    <section className="py-20 bg-slate-50/50">
      <Container>
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: "-100px" }} className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-extrabold text-slate-900 mb-4">Explore Latest Job Openings</h2>
          <p className="text-slate-600">Thousands Of Jobs Posted Daily By Top Companies Worldwide</p>
        </motion.div>
        <div className="relative">
           {/* Slider Controls mock */}
           <button className="absolute left-0 top-1/2 -ml-6 -translate-y-1/2 w-10 h-10 bg-[#4B70F5] text-white rounded-full flex items-center justify-center shadow-lg"><ChevronLeft /></button>
           <button className="absolute right-0 top-1/2 -mr-6 -translate-y-1/2 w-10 h-10 bg-[#4B70F5] text-white rounded-full flex items-center justify-center shadow-lg hover:bg-blue-600 z-10"><ChevronRight /></button>
           
           <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 overflow-hidden max-w-[95%] mx-auto">
             {jobs.map((_, i) => (
               <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: "-50px" }} transition={{ duration: 0.4, delay: i * 0.1 }} key={i} className="bg-white border text-center border-gray-100 rounded-2xl p-6 shadow-sm hover:shadow-lg transition flex flex-col">
                 <img src={cardTotalImg} className="w-12 h-12 object-contain mb-4 mx-auto" alt="Icon" />
                 <h3 className="font-bold text-slate-900">Product Designer</h3>
                 <p className="text-xs text-slate-500 mb-4">Figma · San Francisco, CA</p>
                 <div className="flex flex-wrap gap-2 mb-6 justify-center">
                   <span className="px-2 py-1 bg-blue-50 text-blue-600 rounded text-[10px]">Communication</span>
                   <span className="px-2 py-1 bg-blue-50 text-blue-600 rounded text-[10px]">Adobe XD</span>
                   <span className="px-2 py-1 bg-blue-50 text-blue-600 rounded text-[10px]">UX research</span>
                 </div>
                 <button onClick={() => navigate('/job/1')} className="w-full py-2.5 mt-auto border border-gray-200 rounded-lg text-sm font-semibold hover:border-[#4B70F5] hover:text-[#4B70F5] transition">Apply Now →</button>
               </motion.div>
             ))}
           </div>
        </div>
      </Container>
    </section>
  );
}

// 8. Why Choose Us
function WhyChooseus() {
  return (
    <section className="py-20 bg-white">
      <Container className="text-center">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: "-100px" }}>
          <h2 className="text-3xl md:text-4xl font-extrabold text-slate-900 mb-4">Why Choose Our Platform?</h2>
          <p className="text-slate-600 mb-16">The Smartest Way To Manage Your Career And Hiring Needs</p>
        </motion.div>
        
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-12 max-w-5xl mx-auto">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: "-50px" }} transition={{ duration: 0.5 }} className="flex flex-col items-center text-center">
            <div className="w-16 h-16 bg-[#4B70F5] text-white rounded-full flex items-center justify-center shadow-lg shadow-blue-500/30 mb-6"><Clock className="w-8 h-8" /></div>
            <h3 className="font-bold text-slate-900 mb-2">Save Hours</h3>
            <p className="text-sm text-slate-600 leading-relaxed">Automate your job search and save hours of manual applications every week.</p>
          </motion.div>
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: "-50px" }} transition={{ duration: 0.5, delay: 0.1 }} className="flex flex-col items-center text-center">
            <div className="w-16 h-16 bg-[#4B70F5] text-white rounded-full flex items-center justify-center shadow-lg shadow-blue-500/30 mb-6"><Trophy className="w-8 h-8" /></div>
            <h3 className="font-bold text-slate-900 mb-2">Higher Success Rate</h3>
            <p className="text-sm text-slate-600 leading-relaxed">Increase your chances of getting hired with AI-optimized applications.</p>
          </motion.div>
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: "-50px" }} transition={{ duration: 0.5, delay: 0.2 }} className="flex flex-col items-center text-center">
            <div className="w-16 h-16 bg-[#4B70F5] text-white rounded-full flex items-center justify-center shadow-lg shadow-blue-500/30 mb-6"><Lightbulb className="w-8 h-8" /></div>
            <h3 className="font-bold text-slate-900 mb-2">Smart Recommendations</h3>
            <p className="text-sm text-slate-600 leading-relaxed">Get personalized job matches powered by advanced AI algorithms.</p>
          </motion.div>
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: "-50px" }} transition={{ duration: 0.5, delay: 0.3 }} className="flex flex-col items-center text-center">
            <div className="w-16 h-16 bg-[#4B70F5] text-white rounded-full flex items-center justify-center shadow-lg shadow-blue-500/30 mb-6"><InfinityIcon className="w-8 h-8" /></div>
            <h3 className="font-bold text-slate-900 mb-2">All-In-One Platform</h3>
            <p className="text-sm text-slate-600 leading-relaxed">Everything you need for your career journey in a single platform.</p>
          </motion.div>
        </div>
      </Container>
    </section>
  );
}

// 9. Pricing
function Pricing() {
  const navigate = useNavigate();
  return (
    <section id="pricing" className="py-20 bg-slate-50/50">
      <Container>
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: "-100px" }} className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-extrabold text-slate-900 mb-4">Simple and Flexible Plans</h2>
          <p className="text-slate-600">Choose The Plan That Fits Your Needs. Upgrade Or Downgrade Anytime.</p>
        </motion.div>

        <div className="max-w-5xl mx-auto space-y-12">
          {/* Job Seekers Row */}
          <div>
            <div className="inline-block px-3 py-1 bg-pink-100 text-pink-600 text-xs font-bold uppercase rounded-full mb-6 mt-4">For Job Seekers</div>
            <div className="grid md:grid-cols-3 gap-6">
              {/* Free */}
              <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: "-50px" }} transition={{ duration: 0.5 }} className="bg-white rounded-2xl p-8 border border-gray-100 shadow-sm flex flex-col">
                <div className="w-16 h-16 bg-slate-500 rounded-2xl flex items-center justify-center mb-6 shadow-md"><Rocket className="w-8 h-8 text-white" /></div>
                <div className="text-sm text-slate-500 mb-1">Free Trial</div>
                <div className="text-4xl font-extrabold text-slate-900 mb-2">Free</div>
                <p className="text-sm text-slate-600 mb-6">Perfect to get started</p>
                <ul className="space-y-4 mb-8 flex-1">
                  <li className="flex items-center gap-3 text-sm text-slate-700"><Check className="w-4 h-4 text-emerald-500" /> 100 Credits</li>
                  <li className="flex items-center gap-3 text-sm text-slate-700"><Check className="w-4 h-4 text-emerald-500" /> AI CV Parsing</li>
                  <li className="flex items-center gap-3 text-sm text-slate-700"><Check className="w-4 h-4 text-emerald-500" /> Smart Job Search</li>
                  <li className="flex items-center gap-3 text-sm text-slate-700"><Check className="w-4 h-4 text-emerald-500" /> Basic Email Support</li>
                </ul>
                <button onClick={() => navigate("/signup")} className="w-full py-3 bg-[#4B70F5] text-white rounded-lg font-semibold hover:bg-blue-600 transition">Sign Up</button>
              </motion.div>

              {/* Standard */}
              <motion.div initial={{ opacity: 0, scale: 0.95, y: 30 }} whileInView={{ opacity: 1, scale: 1, y: 0 }} viewport={{ once: true, margin: "-50px" }} transition={{ duration: 0.5, delay: 0.15 }} className="bg-white rounded-2xl p-8 border border-gray-100 shadow-xl relative flex flex-col">
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-[#4B70F5] text-white px-4 py-1 text-xs font-bold uppercase rounded-full shadow-md">Top Choice</div>
                <div className="w-16 h-16 bg-[#4B70F5] rounded-2xl flex items-center justify-center mb-6 shadow-md"><Star className="w-8 h-8 text-white" fill="currentColor"/></div>
                <div className="text-sm text-slate-500 mb-1">Basic Plan</div>
                <div className="flex items-baseline gap-1 mb-2">
                  <span className="text-4xl font-extrabold text-slate-900">49.99</span>
                  <span className="text-slate-500 font-medium">AED</span>
                </div>
                <p className="text-sm text-slate-600 mb-6">Best for active job seekers</p>
                <ul className="space-y-4 mb-8 flex-1">
                  <li className="flex items-center gap-3 text-sm text-slate-700"><Check className="w-4 h-4 text-emerald-500" /> 700 credits</li>
                  <li className="flex items-center gap-3 text-sm text-slate-700"><Check className="w-4 h-4 text-emerald-500" /> AI CV Parsing</li>
                  <li className="flex items-center gap-3 text-sm text-slate-700"><Check className="w-4 h-4 text-emerald-500" /> Smart Job Search</li>
                  <li className="flex items-center gap-3 text-sm text-slate-700"><Check className="w-4 h-4 text-emerald-500" /> One-time purchase</li>
                </ul>
                <button onClick={() => navigate("/signup")} className="w-full py-3 bg-[#4B70F5] text-white rounded-lg font-semibold hover:bg-blue-600 transition">Get Started</button>
              </motion.div>
              
              {/* Premium */}
              <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: "-50px" }} transition={{ duration: 0.5, delay: 0.3 }} className="bg-white rounded-2xl p-8 border border-[#4B70F5]/30 shadow-sm flex flex-col">
                <div className="w-16 h-16 bg-gradient-to-br from-pink-500 to-purple-500 rounded-2xl flex items-center justify-center mb-6 shadow-md"><Crown className="w-8 h-8 text-white" fill="currentColor"/></div>
                <div className="text-sm text-slate-500 mb-1">Premium Plan</div>
                <div className="flex items-baseline gap-1 mb-2">
                  <span className="text-4xl font-extrabold text-slate-900">79.99</span>
                  <span className="text-slate-500 font-medium">AED</span>
                </div>
                <div className="inline-flex items-center gap-2 mb-6">
                   <span className="bg-purple-100 text-purple-700 text-[10px] uppercase px-2 py-0.5 rounded font-bold">Best value</span>
                   <span className="text-emerald-500 text-xs font-bold">Save 20%</span>
                </div>
                <ul className="space-y-4 mb-8 flex-1">
                  <li className="flex items-center gap-3 text-sm text-slate-700"><Check className="w-4 h-4 text-emerald-500" /> 1400 credits</li>
                  <li className="flex items-center gap-3 text-sm text-slate-700"><Check className="w-4 h-4 text-emerald-500" /> AI CV Parsing</li>
                  <li className="flex items-center gap-3 text-sm text-slate-700"><Check className="w-4 h-4 text-emerald-500" /> Smart Job Search</li>
                  <li className="flex items-center gap-3 text-sm text-slate-700"><Check className="w-4 h-4 text-emerald-500" /> One-time purchase</li>
                </ul>
                <button onClick={() => navigate("/signup")} className="w-full py-3 bg-[#4B70F5] text-white rounded-lg font-semibold hover:bg-blue-600 transition">Get Started</button>
              </motion.div>
            </div>
          </div>

          {/* Recruiters Row */}
          <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: "-50px" }} transition={{ duration: 0.6, delay: 0.2 }}>
            <div className="inline-block px-3 py-1 bg-pink-100 text-pink-600 text-xs font-bold uppercase rounded-full mb-6 mt-12">For Recruiters</div>
            <div className="bg-white rounded-2xl p-8 border border-gray-100 shadow-sm">
                <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
                  <div className="flex gap-6 items-center">
                    <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-indigo-500 rounded-2xl flex items-center justify-center shadow-lg"><Search className="w-8 h-8 text-white" /></div>
                    <div>
                      <div className="text-sm text-slate-500 mb-1">Recruiter Plan</div>
                      <div className="flex items-baseline gap-2">
                         <span className="text-3xl md:text-4xl font-extrabold text-slate-900">199.99 AED</span>
                         <span className="text-slate-500 text-sm">/Monthly</span>
                         <span className="text-emerald-500 text-xs font-bold ml-2">Save 7%</span>
                      </div>
                    </div>
                  </div>
                </div>
                <p className="text-slate-600 mt-6 mb-6 text-sm">Designed for hiring teams and professional recruiters who need high-volume access to the Scope AI network and advanced filtering tools.</p>
                <div className="grid sm:grid-cols-3 gap-y-4 gap-x-8 mb-8">
                  <div className="flex items-center gap-3 text-sm text-slate-700"><Check className="w-4 h-4 text-emerald-500" /> Unlimited credits</div>
                  <div className="flex items-center gap-3 text-sm text-slate-700"><Check className="w-4 h-4 text-emerald-500" /> AI CV Parsing</div>
                  <div className="flex items-center gap-3 text-sm text-slate-700"><Check className="w-4 h-4 text-emerald-500" /> Smart Job Search</div>
                  <div className="flex items-center gap-3 text-sm text-slate-700"><Check className="w-4 h-4 text-emerald-500" /> Priority Support</div>
                </div>
                <div className="flex justify-end">
                   <button onClick={() => navigate("/recruiter")} className="px-8 py-3 bg-[#4B70F5] text-white rounded-lg font-semibold hover:bg-blue-600 transition">Get Started As A Recruiter</button>
                </div>
            </div>
          </motion.div>
        </div>
      </Container>
    </section>
  );
}

// 10. Reviews
function Testimonials() {
  const scrollContainerRef = React.useRef<HTMLDivElement>(null);

  const scrollLeft = () => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollBy({ left: -350, behavior: 'smooth' });
    }
  };

  const scrollRight = () => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollBy({ left: 350, behavior: 'smooth' });
    }
  };

  const reviews = [
    { text: "It helped me improve my focus on preparing for the role.", author: "Ahmed S., Cairo", role: "Software Engineer", avatar: img1 },
    { text: "I applied to 10 jobs in minutes with AI. I got interviews faster than I ever expected!", author: "Dema A., Jordan", role: "Job Seeker - UX Designer", avatar: img2 },
    { text: "I finally feel in control of my career. The platform made the process simple and stress-free.", author: "Omar H., Saudi Arabia", role: "Job Seeker - Marketing Specialist", avatar: img3 },
    { text: "AI matched us with highly qualified candidates instantly. Our hiring process is now so much faster.", author: "Laila M., Dubai", role: "Recruiter - HR Manager", avatar: img4 },
    { text: "We posted our role and within hours, we had perfect matches.", author: "Khalid, Riyadh", role: "Recruiter", avatar: img5 }
  ];

  return (
    <section className="py-20 border-t-4 border-blue-400 bg-white">
      <Container>
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: "-100px" }} className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-extrabold text-slate-900 mb-4">What our users says</h2>
          <p className="text-slate-600">Join Thousands Of Satisfied Users Who Transformed Their Careers</p>
        </motion.div>
        <div className="relative max-w-6xl mx-auto px-12">
           {/* Mock Arrows */}
           <button onClick={scrollLeft} className="absolute left-0 top-1/2 -ml-4 -translate-y-1/2 w-10 h-10 bg-[#4B70F5] text-white rounded-full flex items-center justify-center shadow-lg z-10 hover:bg-blue-600"><ChevronLeft /></button>
           <button onClick={scrollRight} className="absolute right-0 top-1/2 -mr-4 -translate-y-1/2 w-10 h-10 bg-[#4B70F5] text-white rounded-full flex items-center justify-center shadow-lg z-10 hover:bg-blue-600"><ChevronRight /></button>
           
           <motion.div 
             initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: "-50px" }} transition={{ duration: 0.6 }}
             ref={scrollContainerRef}
             className="flex gap-6 overflow-x-auto hide-scrollbar snap-x snap-mandatory py-4"
             style={{ msOverflowStyle: 'none', scrollbarWidth: 'none' }}
           >
              {reviews.map((r, i) => (
                <div key={i} className="min-w-[300px] md:min-w-[340px] snap-center bg-white border text-left border-gray-100 rounded-2xl p-6 shadow-sm flex flex-col justify-between">
                  <div>
                    <div className="flex text-yellow-500 mb-4">
                      <Star className="w-4 h-4 fill-current"/>
                      <Star className="w-4 h-4 fill-current"/>
                      <Star className="w-4 h-4 fill-current"/>
                      <Star className="w-4 h-4 fill-current"/>
                      <Star className="w-4 h-4 fill-current"/>
                    </div>
                    <p className="text-sm text-slate-600 leading-relaxed mb-6 italic">"{r.text}"</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <img src={r.avatar} alt={r.author} className="w-10 h-10 rounded-full flex-shrink-0 object-cover" />
                    <div>
                       <div className="text-sm font-bold text-slate-900">{r.author}</div>
                       <div className="text-xs text-slate-500">{r.role}</div>
                    </div>
                  </div>
                </div>
              ))}
           </motion.div>
        </div>
      </Container>
    </section>
  );
}

// 11. Help / FAQ
function HelpAndFAQ() {
  const [openFAQ, setOpenFAQ] = useState<number | null>(4);

  const faqs = [
    {
      q: "How does the AI job application automation work?",
      a: "Our AI analyzes your CV and skills, matches them with relevant job openings, and automatically submits your applications to maximize your chances of getting hired."
    },
    {
      q: "Is my data secure?",
      a: "Yes, we use bank-level encryption to protect your personal information. We never share your data with third parties without your explicit consent."
    },
    {
      q: "What's included in the free trial?",
      a: "The free trial includes AI CV parsing, smart job search recommendations, and a limited number of auto-apply credits to test the platform."
    },
    {
      q: "How do credits work?",
      a: "Each automated job application consumes a credit. You can purchase credit packs as needed. Unused credits roll over and never expire."
    },
    {
      q: "Can I cancel my subscription anytime?",
      a: "We operate on a credit-based system, not subscriptions. You only purchase credits when you need them - no recurring charges, no cancellation hassles. Use your credits at your own pace."
    }
  ];

  return (
    <section id="faqs" className="py-20 bg-slate-50/30 border-t border-gray-100">
      <Container className="max-w-4xl mx-auto">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: "-100px" }} className="text-center mb-12">
          <h2 className="text-2xl md:text-3xl font-extrabold text-slate-900 mb-2">We're Here to Help</h2>
          <p className="text-slate-600 text-sm">Need Assistance? Our Team Is Ready To Support You — Anytime, Anywhere.</p>
        </motion.div>

        <div className="grid md:grid-cols-3 gap-4 mb-16">
          <div className="bg-white flex items-center justify-between p-4 rounded-xl border border-gray-100 shadow-sm cursor-pointer hover:shadow-md transition">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center"><Mail className="w-5 h-5"/></div>
              <div><div className="text-sm font-bold text-slate-900">Email Address</div><div className="text-[10px] text-slate-500">Get detailed responses to your queries</div><div className="text-xs text-blue-600 font-medium mt-1">info@scopeaicv.com</div></div>
            </div>
            <ChevronRight className="w-4 h-4 text-slate-400" />
          </div>
          <div className="bg-white flex items-center justify-between p-4 rounded-xl border border-gray-100 shadow-sm cursor-pointer hover:shadow-md transition">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-pink-100 text-pink-600 rounded-full flex items-center justify-center"><Phone className="w-5 h-5"/></div>
              <div><div className="text-sm font-bold text-slate-900">Phone Support</div><div className="text-[10px] text-slate-500">Speak directly with our team</div><div className="text-xs text-pink-600 font-medium mt-1">+971 56 663 1030</div></div>
            </div>
            <ChevronRight className="w-4 h-4 text-slate-400" />
          </div>
          <div className="bg-white flex items-center justify-between p-4 rounded-xl border border-gray-100 shadow-sm cursor-pointer hover:shadow-md transition">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center"><MessageCircle className="w-5 h-5"/></div>
              <div><div className="text-sm font-bold text-slate-900">WhatsApp</div><div className="text-[10px] text-slate-500">Quick responses via WhatsApp</div><div className="text-xs text-emerald-600 font-medium mt-1">Chat on WhatsApp</div></div>
            </div>
            <ChevronRight className="w-4 h-4 text-slate-400" />
          </div>
        </div>

        <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: "-50px" }} transition={{ duration: 0.5 }}>
          <div className="text-center mb-8">
            <h2 className="text-2xl font-extrabold text-slate-900 mb-2">Got Questions? We've Got Answers</h2>
            <p className="text-slate-600 text-sm">Everything You Need To Know About Scope AI</p>
          </div>
  
          <div className="space-y-3">
            {faqs.map((faq, i) => (
               <div key={i} className="bg-white border border-gray-100 rounded-xl overflow-hidden shadow-sm">
                 <button onClick={() => setOpenFAQ(openFAQ === i ? null : i)} className="w-full flex items-center justify-between p-5 text-left bg-white hover:bg-slate-50 transition">
                    <span className="font-semibold text-slate-800 text-sm">{i + 1}. {faq.q}</span>
                    {openFAQ === i ? <ChevronUp className="w-4 h-4 text-slate-500" /> : <ChevronDown className="w-4 h-4 text-slate-400" />}
                 </button>
                 {openFAQ === i && (
                   <div className="px-5 pb-5 pt-0 text-sm text-slate-600 bg-white border-t border-gray-50 mt-2 pt-4">
                     {faq.a}
                   </div>
                 )}
               </div>
            ))}
          </div>
        </motion.div>
      </Container>
    </section>
  );
}

// 12. Bottom Banner
function BottomCTA() {
  const navigate = useNavigate();
  return (
    <section className="relative overflow-hidden bg-[#1E3A8A] py-24 text-center">
      <div className="absolute inset-0 bg-gradient-to-br from-blue-700 via-[#1E40AF] to-indigo-900 opacity-90"></div>
      <img src={abstractBg} alt="Abstract Background" className="absolute inset-0 w-full h-full object-cover opacity-60 mix-blend-screen pointer-events-none" />
      <Container className="relative z-10">
        <motion.div initial={{ opacity: 0, scale: 0.95, y: 30 }} whileInView={{ opacity: 1, scale: 1, y: 0 }} viewport={{ once: true, margin: "-100px" }} transition={{ duration: 0.6 }}>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-white mb-6 tracking-tight">Smarter Job Hunting Starts Here</h2>
          <p className="text-blue-100 mb-10 max-w-2xl mx-auto text-lg pt-2">AI-powered tools to match your skills with top opportunities and boost your career growth.</p>
          <button onClick={() => navigate("/signup")} className="px-10 py-4 bg-white text-[#4B70F5] text-sm font-bold rounded-lg shadow-lg hover:shadow-xl transition hover:-translate-y-1">Sign Up</button>
        </motion.div>
      </Container>
    </section>
  );
}




export default function LandingPage() {
  return (
    <>
      <HeroSection />
      <ThreeSteps />
      <PowerfulFeatures />
      <RoleSections />
      <LatestJobs />
      <WhyChooseus />
      <Pricing />
      <Testimonials />
      <HelpAndFAQ />
      <BottomCTA />
    </>
  );
}
