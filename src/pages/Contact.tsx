import { useNavigate } from "react-router-dom";
import { ArrowLeft, Mail, Phone, MessageCircle, Clock, Headphones, Zap, Shield, Globe } from "lucide-react";
import { motion } from "framer-motion";

export default function Contact() {
  const navigate = useNavigate();

  const contactMethods = [
    {
      icon: Mail,
      title: "Email Support",
      description: "Get detailed responses to your queries",
      action: "info@scopeaicv.com",
      link: "mailto:info@scopeai.com",
      color: "from-indigo-500 to-indigo-600",
      bgColor: "bg-indigo-100",
      textColor: "text-indigo-600",
    },
    {
      icon: Phone,
      title: "Phone Support",
      description: "Speak directly with our team",
      action: "+971 56 663 1030",
      link: "tel:+971566631030",
      color: "from-emerald-500 to-emerald-600",
      bgColor: "bg-emerald-100",
      textColor: "text-emerald-600",
    },
    {
      icon: MessageCircle,
      title: "WhatsApp",
      description: "Quick responses via WhatsApp",
      action: "Chat on WhatsApp",
      link: "https://wa.me/971566631030",
      color: "from-green-500 to-green-600",
      bgColor: "bg-green-100",
      textColor: "text-green-600",
    },
  ];

  const features = [
    {
      icon: Clock,
      title: "24/7 Response Time",
      description: "We aim to respond within 2 hours during business hours",
    },
    {
      icon: Headphones,
      title: "Dedicated Support",
      description: "Expert team ready to help with any questions",
    },
    {
      icon: Zap,
      title: "Quick Resolution",
      description: "Average issue resolution time under 24 hours",
    },
    {
      icon: Shield,
      title: "Secure Communication",
      description: "Your data and privacy are our top priority",
    },
  ];

  const faqs = [
    {
      question: "What are your support hours?",
      answer: "Our support team is available Monday-Friday, 9 AM - 6 PM GST. Email support is monitored 24/7.",
    },
    {
      question: "How quickly will I get a response?",
      answer: "Email responses typically within 2-4 hours during business hours. Phone and WhatsApp support is immediate.",
    },
    {
      question: "Do you offer enterprise support?",
      answer: "Yes! We provide dedicated account managers and priority support for enterprise customers. Contact us for details.",
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
            We're Here to{" "}
            <span className="bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
              Help
            </span>
          </h1>
          <p className="text-base sm:text-lg md:text-xl text-slate-600 max-w-3xl mx-auto px-4">
            Choose your preferred way to reach us. Our team is ready to assist you!
          </p>
        </motion.div>

        {/* Contact Methods */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-16">
          {contactMethods.map((method, index) => (
            <motion.a
              key={index}
              href={method.link}
              target={method.link.startsWith("http") ? "_blank" : undefined}
              rel={method.link.startsWith("http") ? "noopener noreferrer" : undefined}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className="group relative rounded-2xl border border-gray-200 bg-white p-6 sm:p-8 shadow-sm hover:shadow-xl transition-all duration-300 overflow-hidden"
            >
              {/* Gradient Background on Hover */}
              <div className={`absolute inset-0 bg-gradient-to-br ${method.color} opacity-0 group-hover:opacity-5 transition-opacity duration-300`} />
              
              <div className="relative">
                <div className={`inline-flex rounded-xl ${method.bgColor} p-4 mb-4 group-hover:scale-110 transition-transform duration-300`}>
                  <method.icon className={`h-8 w-8 ${method.textColor}`} />
                </div>
                
                <h3 className="text-xl font-bold text-slate-900 mb-2">{method.title}</h3>
                <p className="text-sm text-slate-600 mb-4">{method.description}</p>
                
                <div className={`inline-flex items-center gap-2 ${method.textColor} font-semibold text-sm group-hover:gap-3 transition-all`}>
                  {method.action}
                  <ArrowLeft className="h-4 w-4 rotate-180" />
                </div>
              </div>
            </motion.a>
          ))}
        </div>

        {/* Features Grid */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="mb-16"
        >
          <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 text-center mb-8">
            Why Our Support Stands Out
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

        {/* FAQ Section */}
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
            {faqs.map((faq, index) => (
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

        {/* CTA Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 1.2 }}
          className="mt-16 rounded-2xl bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 p-8 sm:p-12 text-center text-white"
        >
          <Globe className="h-12 w-12 mx-auto mb-4 opacity-90" />
          <h3 className="text-2xl sm:text-3xl font-bold mb-4">Global Support, Local Care</h3>
          <p className="text-lg text-indigo-100 mb-6 max-w-2xl mx-auto">
            No matter where you are, our team is ready to help you succeed with Scope AI.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a
              href="mailto:info@scopeai.com"
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-white px-6 py-3 text-indigo-600 font-semibold hover:bg-indigo-50 transition"
            >
              <Mail className="h-5 w-5" />
              Email Us
            </a>
            <a
              href="tel:+971566631030"
              className="inline-flex items-center justify-center gap-2 rounded-xl border-2 border-white px-6 py-3 text-white font-semibold hover:bg-white/10 transition"
            >
              <Phone className="h-5 w-5" />
              Call Now
            </a>
          </div>
        </motion.div>
      </div>
    </div>
  );
}