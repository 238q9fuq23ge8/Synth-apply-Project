import { useNavigate } from 'react-router-dom';
import ScopeLogo from "@/assets/WhatsApp_Image_2025-10-17_at_13.05.55_6ba1ea04-removebg-preview (1).png";

function Container({ children }: { children: React.ReactNode }) {
  return (
    <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
      {children}
    </div>
  );
}

function TermsOfService() {
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
              Terms of Service
            </h1>
            
            <div className="prose prose-slate max-w-none">
              <div className="mb-8 text-center text-sm text-slate-600">
                <p><strong>Effective Date:</strong> November 12, 2025</p>
                <p><strong>Company Name:</strong> Scope AI</p>
                <p><strong>Website:</strong> scopeaicv.com</p>
                <p><strong>Registered Office:</strong> Abu Dhabi, United Arab Emirates</p>
              </div>

              <section className="mb-8">
                <h2 className="text-2xl font-semibold text-slate-900 mb-4">Acceptance of Terms</h2>
                <p className="text-slate-700 leading-relaxed mb-4">
                  By creating an account or using Scope AI's website or mobile application ("Service"), you agree to comply with these Terms of Service ("Terms").
                </p>
                <p className="text-slate-700 leading-relaxed">
                  If you do not agree, please do not use our services.
                </p>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-semibold text-slate-900 mb-4">Description of Service</h2>
                <p className="text-slate-700 mb-4">
                  Scope AI is an AI-driven job-application and recruitment platform that enables:
                </p>
                <ul className="list-disc pl-6 space-y-2 text-slate-700 mb-4">
                  <li>Users to build AI-generated CVs and cover letters</li>
                  <li>Automated job applications using recruiter data and APIs</li>
                  <li>Recruiters to post, rank, and shortlist candidates</li>
                </ul>
                <p className="text-slate-700">
                  Scope AI may update or improve its features without prior notice.
                </p>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-semibold text-slate-900 mb-4">Eligibility</h2>
                <p className="text-slate-700 mb-4">
                  You must be at least 18 years old or have legal capacity under applicable law to use our services.
                </p>
                <p className="text-slate-700">
                  By registering, you confirm that the information you provide is accurate and truthful.
                </p>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-semibold text-slate-900 mb-4">Account Registration and Security</h2>
                <ul className="list-disc pl-6 space-y-3 text-slate-700 mb-4">
                  <li>You are responsible for maintaining the confidentiality of your login credentials.</li>
                  <li>Any activity under your account is your responsibility.</li>
                  <li>
                    If you suspect unauthorized access, contact{' '}
                    <a href="mailto:info@scopeaicv.com" className="text-blue-600 hover:text-blue-800 transition">
                      info@scopeaicv.com
                    </a>{' '}
                    immediately.
                  </li>
                </ul>
                <p className="text-slate-700">
                  We reserve the right to suspend or terminate accounts that violate these Terms.
                </p>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-semibold text-slate-900 mb-4">Subscription and Payment</h2>
                <ul className="list-disc pl-6 space-y-3 text-slate-700">
                  <li>Scope AI operates on a monthly subscription model through Stripe.</li>
                  <li>Prices are stated in AED and may vary by plan:
                    <ul className="list-disc pl-6 mt-2 space-y-1">
                      <li>Basic: 700 credits 50 AED/month</li>
                      <li>Premium: 1400 credits 80/AED/month</li>
                      <li>Recruiter: 199.9 AED/month</li>
                    </ul>
                  </li>
                  <li>Payments are processed securely via Stripe.</li>
                  <li>You authorize Scope AI to charge your payment method on a recurring basis.</li>
                  <li>Subscriptions can be canceled anytime through your account dashboard.</li>
                </ul>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-semibold text-slate-900 mb-4">Use of the Platform</h2>
                <p className="text-slate-700 mb-4">You agree not to:</p>
                <ul className="list-disc pl-6 space-y-2 text-slate-700 mb-4">
                  <li>Upload false, misleading, or illegal job postings or CVs</li>
                  <li>Attempt to hack, reverse-engineer, or disrupt the platform</li>
                  <li>Violate any applicable laws or third-party rights</li>
                  <li>Use the service for spamming, data scraping, or fraudulent purposes</li>
                </ul>
                <p className="text-slate-700">
                  Violation of these terms may result in account termination.
                </p>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-semibold text-slate-900 mb-4">Intellectual Property</h2>
                <p className="text-slate-700 mb-4">
                  All content, software, logos, and materials on Scope AI are the exclusive property of Scope AI.
                </p>
                <p className="text-slate-700">
                  You may not copy, modify, or redistribute any part of the Service without written permission.
                </p>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-semibold text-slate-900 mb-4">User-Generated Content</h2>
                <p className="text-slate-700 mb-4">
                  By uploading your CV or other data, you grant Scope AI a limited license to process and use that data to provide job-matching and application services.
                </p>
                <p className="text-slate-700">
                  We do not claim ownership over your personal or business information.
                </p>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-semibold text-slate-900 mb-4">Privacy</h2>
                <p className="text-slate-700">
                  Your use of Scope AI is also governed by our Privacy Policy, which explains how we collect, use, and protect your data.
                </p>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-semibold text-slate-900 mb-4">Termination of Service</h2>
                <p className="text-slate-700 mb-4">Scope AI may suspend or terminate access to your account if:</p>
                <ul className="list-disc pl-6 space-y-2 text-slate-700 mb-4">
                  <li>You violate these Terms, or</li>
                  <li>Required by law, or</li>
                  <li>Upon your own request.</li>
                </ul>
                <p className="text-slate-700">
                  Upon termination, all unpaid fees will become due immediately.
                </p>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-semibold text-slate-900 mb-4">Refund Policy</h2>
                <p className="text-slate-700 mb-4">
                  We may issue refunds only for technical issues or accidental double charges verified by Stripe.
                </p>
                <p className="text-slate-700">
                  All refund requests must be made within 7 days of the transaction.
                </p>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-semibold text-slate-900 mb-4">Limitation of Liability</h2>
                <p className="text-slate-700 mb-4">
                  Scope AI provides services "as is" without warranties of any kind.
                </p>
                <p className="text-slate-700 mb-4">We are not liable for:</p>
                <ul className="list-disc pl-6 space-y-2 text-slate-700 mb-4">
                  <li>Job offers not received or accepted</li>
                  <li>Employer or recruiter misconduct</li>
                  <li>Service interruptions beyond our control</li>
                </ul>
                <p className="text-slate-700">
                  To the maximum extent permitted by law, our liability shall not exceed the amount paid by you in the last 3 months.
                </p>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-semibold text-slate-900 mb-4">Changes to Terms</h2>
                <p className="text-slate-700 mb-4">
                  We may revise these Terms at any time by updating this page.
                </p>
                <p className="text-slate-700">
                  Continued use after any changes constitutes acceptance of the new Terms.
                </p>
              </section>

              <section className="mb-8 bg-slate-50 rounded-lg p-6">
                <h2 className="text-2xl font-semibold text-slate-900 mb-4">Contact Information</h2>
                <p className="text-slate-700 mb-2">For questions or concerns about these Terms, contact:</p>
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

export default TermsOfService;