import { useNavigate } from 'react-router-dom';
import ScopeLogo from "@/assets/WhatsApp_Image_2025-10-17_at_13.05.55_6ba1ea04-removebg-preview (1).png";

function Container({ children }: { children: React.ReactNode }) {
  return (
    <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
      {children}
    </div>
  );
}

function PrivacyPolicy() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-white">
      {/* Header */}
      <header className="bg-white/90 backdrop-blur-md shadow-sm sticky top-0 z-50">
        <Container>
          <div className="flex items-center justify-between py-4">
            <button 
              onClick={() => navigate("/")} 
              className="flex items-center gap-2 hover:opacity-80 transition"
            >
              <img
                src={ScopeLogo}
                alt="Scope AI Logo"
                className="w-8 h-8 sm:w-10 sm:h-10 drop-shadow-lg"
              />
              <span className="text-lg font-semibold text-slate-900">Scope AI</span>
            </button>
            <button 
              onClick={() => navigate("/")} 
              className="text-sm text-slate-600 hover:text-slate-900 transition"
            >
              Back to Home
            </button>
          </div>
        </Container>
      </header>

      {/* Main Content */}
      <main className="py-12">
        <Container>
          <div className="bg-white rounded-2xl shadow-xl p-8 sm:p-12">
            <h1 className="text-3xl sm:text-4xl font-bold text-slate-900 mb-8 text-center">
              Privacy Policy
            </h1>
            
            <div className="prose prose-slate max-w-none">
              <div className="mb-8 text-center text-sm text-slate-600">
                <p><strong>Effective Date:</strong> November 12, 2025</p>
                <p><strong>Company Name:</strong> Scope AI</p>
                <p><strong>Website:</strong> scopeaicv.com</p>
                <p><strong>Registered Office:</strong> Abu Dhabi, United Arab Emirates</p>
              </div>

              <section className="mb-8">
                <h2 className="text-2xl font-semibold text-slate-900 mb-4">Introduction</h2>
                <p className="text-slate-700 leading-relaxed">
                  Scope AI respects your privacy and is committed to protecting your personal data. This Privacy Policy explains how we collect, use, store, and protect the personal information of users who use our platform, mobile app, and related services.
                </p>
                <p className="text-slate-700 leading-relaxed mt-4">
                  By accessing or using Scope AI, you agree to this Privacy Policy.
                </p>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-semibold text-slate-900 mb-4">Information We Collect</h2>
                <p className="text-slate-700 mb-4">We collect the following types of information:</p>
                
                <div className="mb-6">
                  <h3 className="text-xl font-medium text-slate-800 mb-3">a. Personal Information</h3>
                  <ul className="list-disc pl-6 space-y-2 text-slate-700">
                    <li>Name, email address, and contact details</li>
                    <li>Uploaded CVs, cover letters, and career data</li>
                    <li>Payment information (processed securely through Stripe)</li>
                    <li>Account login credentials (hashed and encrypted)</li>
                  </ul>
                </div>

                <div className="mb-6">
                  <h3 className="text-xl font-medium text-slate-800 mb-3">b. Usage Data</h3>
                  <ul className="list-disc pl-6 space-y-2 text-slate-700">
                    <li>IP address, browser type, and device information</li>
                    <li>Job search activity, AI recommendations, and recruiter interactions</li>
                    <li>Cookies and analytics for improving service performance</li>
                  </ul>
                </div>

                <div className="mb-6">
                  <h3 className="text-xl font-medium text-slate-800 mb-3">c. Recruiter Data</h3>
                  <ul className="list-disc pl-6 space-y-2 text-slate-700">
                    <li>Company name, HR contact information, job postings, and candidate preferences</li>
                  </ul>
                </div>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-semibold text-slate-900 mb-4">How We Use Your Information</h2>
                <p className="text-slate-700 mb-4">We use the collected data to:</p>
                <ul className="list-disc pl-6 space-y-2 text-slate-700">
                  <li>Create and manage your Scope AI account</li>
                  <li>Build and optimize AI-generated CVs and cover letters</li>
                  <li>Automatically match and apply to job postings</li>
                  <li>Process payments and subscriptions through Stripe</li>
                  <li>Communicate with you regarding your account and updates</li>
                  <li>Improve our algorithms and user experience</li>
                </ul>
                <p className="text-slate-700 mt-4 font-medium">
                  We do not sell or rent your personal information to third parties.
                </p>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-semibold text-slate-900 mb-4">Data Sharing</h2>
                <p className="text-slate-700 mb-4">We may share your data only with:</p>
                <ul className="list-disc pl-6 space-y-2 text-slate-700">
                  <li>Recruiters or employers when you apply for jobs</li>
                  <li>Stripe for payment processing</li>
                  <li>Service providers (e.g., email and hosting platforms) under confidentiality agreements</li>
                </ul>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-semibold text-slate-900 mb-4">Data Retention</h2>
                <p className="text-slate-700 mb-4">
                  Your personal information is stored securely on encrypted servers located in the UAE and/or EU regions.
                </p>
                <p className="text-slate-700 mb-4">
                  We retain data as long as your account is active or as required by law.
                </p>
                <p className="text-slate-700">
                  You can request deletion of your data anytime by emailing{' '}
                  <a href="mailto:info@scopeaicv.com" className="text-blue-600 hover:text-blue-800 transition">
                    info@scopeaicv.com
                  </a>
                </p>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-semibold text-slate-900 mb-4">Your Rights</h2>
                <p className="text-slate-700 mb-4">You have the right to:</p>
                <ul className="list-disc pl-6 space-y-2 text-slate-700">
                  <li>Access, update, or delete your account data</li>
                  <li>Withdraw consent for processing</li>
                  <li>Request a copy of your stored information</li>
                  <li>Contact us regarding any privacy concerns</li>
                </ul>
                <p className="text-slate-700 mt-4">
                  To exercise these rights, contact{' '}
                  <a href="mailto:info@scopeaicv.com" className="text-blue-600 hover:text-blue-800 transition">
                    info@scopeaicv.com
                  </a>
                </p>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-semibold text-slate-900 mb-4">Cookies Policy</h2>
                <p className="text-slate-700 mb-4">
                  We use cookies and similar technologies for analytics, preferences, and authentication.
                </p>
                <p className="text-slate-700">
                  You may disable cookies in your browser settings, but some features may not function properly.
                </p>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-semibold text-slate-900 mb-4">Data Security</h2>
                <p className="text-slate-700 mb-4">
                  We implement strong encryption (AES-256, HTTPS, and secure SSL certificates) to protect your data.
                </p>
                <p className="text-slate-700">
                  All payment transactions are handled by Stripe, which complies with PCI-DSS standards.
                </p>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-semibold text-slate-900 mb-4">Changes to This Policy</h2>
                <p className="text-slate-700">
                  We may update this Privacy Policy periodically. The latest version will always be available at{' '}
                  <a href="https://www.scopeaicv.com/privacy-policy" className="text-blue-600 hover:text-blue-800 transition">
                    https://scopeaicv.com/privacy-policy
                  </a>
                </p>
              </section>

              <section className="mb-8 bg-slate-50 rounded-lg p-6">
                <h2 className="text-2xl font-semibold text-slate-900 mb-4">Contact Us</h2>
                <p className="text-slate-700 mb-2">For any questions, please contact:</p>
                <div className="space-y-2 text-slate-700">
                  <p>📧 <a href="mailto:info@scopeaicv.com" className="text-blue-600 hover:text-blue-800 transition">info@scopeaicv.com</a></p>
                  <p>🏢 Scope AI, Abu Dhabi, United Arab Emirates</p>
                </div>
              </section>
            </div>
          </div>
        </Container>
      </main>
    </div>
  );
}

export default PrivacyPolicy;