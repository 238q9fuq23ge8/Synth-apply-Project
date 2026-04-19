import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Toaster } from "sonner";
import "./index.css";

// ✅ Pages
import PrivacyPolicy from "./pages/privacy-policy";
import { AutomationProvider } from '@/contexts/AutomationContext';
import PublicJobView from './pages/PublicJobView';
import JobSeekersPage from "./pages/jobseekerslost";
import RecruitersPage from "./pages/recruiter-page";
import PricingPage from "./pages/pricing";
import About from "@/pages/About";
import Careers from "@/pages/Careers";
import Contact from "@/pages/Contact";
import TermsOfService from "./pages/terms-of-service";
import Landing from "./pages/Landing";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import VerifyEmail from "./pages/VerifyEmail";
import Dashboard from "./pages/Dashboard";
import UploadCV from "./pages/UploadCV";
import JobSearch from "./pages/JobSearch";
import MyApplications from "./pages/MyApplications";
import Plans from "./pages/Plans";
import CVBuilder from "./pages/CVBuilder";
import PaymentSuccess from "./pages/PaymentSuccess";
import PaymentCancel from "./pages/PaymentCancel";
import NotFound from "./pages/NotFound";
import CompanyJobs from "./pages/CompanyJobs";
import Profile from "@/pages/Profile";
import Recruiter from "./pages/Recruiter";
import CVViewer from "./pages/CVViewer";
import AuthCallback from "./pages/AuthCallback";
import AccountSelection from "./pages/AccountSelection";
import Onboarding from "./pages/Onboarding";
import SkillGapAnalysis from "./pages/SkillGapAnalysis";
import Notifications from "./pages/Notifications";
import RecommendedJobs from "./pages/RecommendedJobs";
import ScopeJobs from "./pages/ScopeJobs";
import AiAutoApply from "./pages/AiAutoApply";
import ScrollToTop from './ScrollToTop'; // Import the new component
import { MainLayout } from "./components/layout/MainLayout";

// ✅ Private Route
import { PrivateRoute } from "@/components/PrivateRoute";
import AdminLogin from "@/pages/admin/Login";
import AdminLayout from "@/pages/admin/AdminLayout";
import DashboardOverview from "@/pages/admin/DashboardOverview";
import AdminUsers from "@/pages/admin/Users";
import AdminRevenue from "@/pages/admin/Revenue";
import AdminSystem from "@/pages/admin/System";
import { AdminRoute } from "@/components/AdminRoute";

// ✅ Global Currency Context
import { CurrencyProvider } from "./pages/currency_context";
import ResetPassword from "./pages/ResetPassword";
import RecruiterPlans from "./pages/RecruiterPlans";
import RecruiterArchivedJobs from "./pages/RecruiterArchivedJobs";
import RecruiterLayout from "./pages/recruiter/RecruiterLayout";
import MyJobsPage from "./pages/recruiter/MyJobsPage";
import CandidatesPage from "./pages/recruiter/CandidatesPage";

const queryClient = new QueryClient();

const App = () => (
  <AutomationProvider>

  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      {/* ✅ Global Toaster */}
      <Toaster richColors position="top-center" />

      {/* ✅ BrowserRouter wraps everything */}
      <BrowserRouter>
          <ScrollToTop /> 

        {/* ✅ CurrencyProvider wraps ALL routes, outside of <Routes> */}
        <CurrencyProvider>
          <Routes>
            <Route path="/" element={<MainLayout><Landing /></MainLayout>} />
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<MainLayout hideHeader={true}><Signup /></MainLayout>} />
            <Route
              path="/profile"
              element={
                <PrivateRoute>
                  <Profile />
                </PrivateRoute>
              }
            />
            <Route path="/notifications" element={
              <PrivateRoute>
                <MainLayout>
                  <Notifications />
                </MainLayout>
              </PrivateRoute>
            } />
            <Route path="/auth/callback" element={<AuthCallback />} />
            <Route path="/account-selection" element={<AccountSelection />} />
            <Route path="/terms-of-service" element={<MainLayout><TermsOfService /></MainLayout>} />
            <Route path="/privacy-policy" element={<MainLayout><PrivacyPolicy /></MainLayout>} />
            <Route path="/jobseekerslost" element={<MainLayout><JobSeekersPage /></MainLayout>} />
            <Route path="/recruiter-page" element={<MainLayout><RecruitersPage /></MainLayout>} />
            <Route path="/scope-jobs" element={<MainLayout><ScopeJobs /></MainLayout>} />
            <Route path="/pricing" element={<MainLayout><PricingPage /></MainLayout>} />

            <Route path="/job/:jobId" element={<MainLayout><PublicJobView /></MainLayout>} />

            {/* Protected Routes */}
            <Route
              path="/dashboard"
              element={
                <PrivateRoute>
                  <MainLayout><Dashboard /></MainLayout>
                </PrivateRoute>
              }
            />
            <Route
              path="/ai-auto-apply"
              element={
                <PrivateRoute>
                  <MainLayout><AiAutoApply /></MainLayout>
                </PrivateRoute>
              }
            />
            <Route
              path="/recruiter"
              element={
                <PrivateRoute>
                  <Recruiter />
                </PrivateRoute>
              }
            />
            <Route
              path="/recruiter"
              element={
                <PrivateRoute>
                  <RecruiterLayout />
                </PrivateRoute>
              }
            >
              <Route path="my-jobs" element={<MyJobsPage />} />
              <Route path="candidates" element={<CandidatesPage />} />
            </Route>
            <Route
              path="/recruiter-plans"
              element={
                <PrivateRoute>
                  <RecruiterPlans />
                </PrivateRoute>
              }
            />
            <Route
              path="/recruiter-archived-jobs"
              element={
                <PrivateRoute>
                  <RecruiterArchivedJobs />
                </PrivateRoute>
              }
            />
            <Route
              path="/CompanyJobs"
              element={
                <PrivateRoute>
                  <MainLayout><CompanyJobs /></MainLayout>
                </PrivateRoute>
              }
            />
            <Route
              path="/upload-cv"
              element={
                <PrivateRoute>
                  <MainLayout><UploadCV /></MainLayout>
                </PrivateRoute>
              }
            />
            <Route
              path="/job-search"
              element={
                <PrivateRoute>
                  <MainLayout><JobSearch /></MainLayout>
                </PrivateRoute>
              }
            />
            <Route
              path="/my-applications"
              element={
                <PrivateRoute>
                  <MainLayout><MyApplications /></MainLayout>
                </PrivateRoute>
              }
            />
            <Route
              path="/skill-gap-analysis"
              element={
                <PrivateRoute>
                  <MainLayout><SkillGapAnalysis /></MainLayout>
                </PrivateRoute>
              }
            />
            <Route
              path="/recommended-jobs"
              element={
                <PrivateRoute>
                  <MainLayout><RecommendedJobs /></MainLayout>
                </PrivateRoute>
              }
            />
            <Route
              path="/cv-builder"
              element={
                <PrivateRoute>
                  <MainLayout><CVBuilder /></MainLayout>
                </PrivateRoute>
              }
            />
            <Route
              path="/plans"
              element={
                <PrivateRoute>
                  <MainLayout><Plans /></MainLayout>
                </PrivateRoute>
              }
            />

            <Route path="/about" element={<MainLayout><About /></MainLayout>} />
            <Route path="/careers" element={<MainLayout><Careers /></MainLayout>} />
            <Route path="/contact" element={<MainLayout><Contact /></MainLayout>} />
            {/* CV & Payment Routes */}
            <Route path="/cv/:cvId" element={<MainLayout><CVViewer /></MainLayout>} />
            <Route path="/payment-success" element={<MainLayout><PaymentSuccess /></MainLayout>} />
            <Route path="/payment-cancel" element={<MainLayout><PaymentCancel /></MainLayout>} />
            <Route path="/reset-password" element={<ResetPassword />} />

            {/* Admin Routes */}
            <Route path="/admin/login" element={<AdminLogin />} />
            <Route
              path="/admin"
              element={
                <AdminRoute>
                  <AdminLayout />
                </AdminRoute>
              }
            >
              <Route index element={<DashboardOverview />} />
              <Route path="users" element={<AdminUsers />} />
              <Route path="revenue" element={<AdminRevenue />} />
              <Route path="system" element={<AdminSystem />} />
            </Route>

            {/* Redirect & Fallback */}
            <Route path="/home" element={<Navigate to="/dashboard" replace />} />
            <Route path="*" element={<MainLayout><NotFound /></MainLayout>} />
          </Routes>
        </CurrencyProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
  </AutomationProvider>
);

export default App;

// import { Toaster as Sonner } from "@/components/ui/sonner";
// import { TooltipProvider } from "@/components/ui/tooltip";
// import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
// import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";

// // Pages
// import Landing from "./pages/Landing";
// import Login from "./pages/Login";
// import Signup from "./pages/Signup";
// import Dashboard from "./pages/Dashboard";
// import UploadCV from "./pages/UploadCV";
// import JobSearch from "./pages/JobSearch";
// import MyApplications from "./pages/MyApplications";
// import Plans from "./pages/Plans";
// import CVBuilder from "./pages/CVBuilder";
// import PaymentSuccess from "./pages/PaymentSuccess";
// import PaymentCancel from "./pages/PaymentCancel";
// import NotFound from "./pages/NotFound";
// import CompanyJobs from "./pages/CompanyJobs";
// import Profile from "@/pages/Profile";
// // Private Route
// import { PrivateRoute } from "@/components/PrivateRoute"; // ✅ make sure this exists
// import Recruiter from "./pages/Recruiter";
// import CVViewer from "./pages/CVViewer";
// import AuthCallback from "./pages/AuthCallback";
// import React from "react";
// import ReactDOM from "react-dom/client";
// import "./index.css";
// import { Toaster } from "sonner"; // ✅ import Toaster



// const queryClient = new QueryClient();

// const App = () => (
//   <QueryClientProvider client={queryClient}>
//     <TooltipProvider>
//       <Sonner />

//       <BrowserRouter>
//         <Routes>
//           {/* ✅ Public Routes */}
//           <Route path="/" element={<Landing />} />
//           <Route path="/login" element={<Login />} />
//           <Route path="/signup" element={<Signup />} />
//           <Route path="/auth/callback" element={<AuthCallback />} />
//           <Toaster richColors position="top-center" />
          

//           <Route path="/profile" element={<Profile />} />

//           {/* ✅ Protected Routes */}
//           <Route
//             path="/dashboard"
//             element={
//               <PrivateRoute>
//                 <Dashboard />
//               </PrivateRoute>
//             }
//           />
//           <Route 
//           path="/recruiter" 
//           element={
//           <PrivateRoute>

//           <Recruiter />
//           </PrivateRoute>
//           } 
//           />
//           <Route 
//           path="/CompanyJobs" 
//           element={
//           <PrivateRoute>

//           <CompanyJobs />
//           </PrivateRoute>
//           } 
//           />
//           <Route path="/cv/:cvId" element={<CVViewer />} />

//           <Route
//             path="/upload-cv"
//             element={
//               <PrivateRoute>
//                 <UploadCV />
//               </PrivateRoute>
//             }
//           />
//           <Route
//             path="/job-search"
//             element={
//               <PrivateRoute>
//                 <JobSearch />
//               </PrivateRoute>
//             }
//           />
//           <Route
//             path="/my-applications"
//             element={
//               <PrivateRoute>
//                 <MyApplications />
//               </PrivateRoute>
//             }
//           />
//           <Route
//             path="/cv-builder"
//             element={
//               <PrivateRoute>
//                 <CVBuilder />
//               </PrivateRoute>
//             }
//           />
//           <Route
//             path="/plans"
//             element={
//               <PrivateRoute>
//                 <Plans />
//               </PrivateRoute>
//             }
//           />

//           {/* ✅ Payment Routes */}
//           <Route path="/payment-success" element={<PaymentSuccess />} />
//           <Route path="/payment-cancel" element={<PaymentCancel />} />

//           {/* ✅ Redirect root to dashboard if logged in */}
//           <Route
//             path="/home"
//             element={<Navigate to="/dashboard" replace />}
//           />

//           {/* ✅ Fallback */}
//           <Route path="*" element={<NotFound />} />
//         </Routes>
//       </BrowserRouter>
//     </TooltipProvider>
//   </QueryClientProvider>
// );

// export default App;
