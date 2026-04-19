// hooks/useProfile.ts
import { useState, useEffect } from 'react';

export interface ProfileData {
  userId: string | null;
  email: string | null;
  person: 'job_seeker' | 'recruiter';
  
  // Credits
  remainingCredits: number;
  creditsTotal: number;
  usedCredits: number;
  
  // Plan
  plan: string;
  planDisplay: string;
  isPremium: boolean;
  isFreeTrial: boolean;
  hasUnlimitedCredits: boolean;
  
  // Trial
  trialEndsAt: string | null;
  trialDaysLeft: number;
  showTrialWarning: boolean;
  
  // Methods
  refreshProfile: () => void;
  updateCredits: (newCredits: number) => void;
}

export function useProfile(): ProfileData {
  const [profile, setProfile] = useState<ProfileData>(getProfileFromLocalStorage());

  // Refresh profile data from localStorage
  const refreshProfile = () => {
    setProfile(getProfileFromLocalStorage());
  };

  // Update credits and refresh
  const updateCredits = (newCredits: number) => {
    localStorage.setItem('remaining_credits', String(newCredits));
    
    // Update planObj
    const planObj = JSON.parse(localStorage.getItem('planObj') || '{}');
    planObj.creditsRemaining = newCredits;
    localStorage.setItem('planObj', JSON.stringify(planObj));
    
    refreshProfile();
  };

  // Listen for storage changes (multi-tab sync)
  useEffect(() => {
    const handleStorageChange = () => {
      refreshProfile();
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  return {
    ...profile,
    refreshProfile,
    updateCredits,
  };
}

// =========================================================
// Helper: Get Profile from LocalStorage
// =========================================================
function getProfileFromLocalStorage(): Omit<ProfileData, 'refreshProfile' | 'updateCredits'> {
  try {
    // Try to get planObj first (most complete data)
    const planObjStr = localStorage.getItem('planObj');
    if (planObjStr) {
      const planObj = JSON.parse(planObjStr);
      return {
        userId: localStorage.getItem('user_id'),
        email: localStorage.getItem('email'),
        person: (localStorage.getItem('person') as 'job_seeker' | 'recruiter') || 'job_seeker',
        
        remainingCredits: planObj.creditsRemaining || 0,
        creditsTotal: planObj.creditsTotal || 0,
        usedCredits: planObj.creditsUsed || 0,
        
        plan: planObj.tierRaw || 'free_trial',
        planDisplay: planObj.tier || 'Free Trial',
        isPremium: planObj.isPremium || false,
        isFreeTrial: planObj.isFreeTrial || true,
        hasUnlimitedCredits: planObj.hasUnlimitedCredits || false,
        
        trialEndsAt: planObj.trialEndsAt || null,
        trialDaysLeft: planObj.trialDaysLeft || 0,
        showTrialWarning: planObj.showTrialWarning || false,
      };
    }

    // Fallback to individual items
    return {
      userId: localStorage.getItem('user_id'),
      email: localStorage.getItem('email'),
      person: (localStorage.getItem('person') as 'job_seeker' | 'recruiter') || 'job_seeker',
      
      remainingCredits: Number(localStorage.getItem('remaining_credits') || 0),
      creditsTotal: Number(localStorage.getItem('credits_total') || 0),
      usedCredits: Number(localStorage.getItem('used_credits') || 0),
      
      plan: localStorage.getItem('plan') || 'free_trial',
      planDisplay: localStorage.getItem('plan_display') || 'Free Trial',
      isPremium: localStorage.getItem('plan') === 'premium',
      isFreeTrial: localStorage.getItem('plan') === 'free_trial',
      hasUnlimitedCredits: localStorage.getItem('plan') === 'premium',
      
      trialEndsAt: localStorage.getItem('trial_ends_at'),
      trialDaysLeft: Number(localStorage.getItem('trial_days_left') || 0),
      showTrialWarning: false,
    };
  } catch (error) {
    console.error('Error reading profile from localStorage:', error);
    return getDefaultProfile();
  }
}

// =========================================================
// Helper: Default Profile
// =========================================================
function getDefaultProfile(): Omit<ProfileData, 'refreshProfile' | 'updateCredits'> {
  return {
    userId: null,
    email: null,
    person: 'job_seeker',
    
    remainingCredits: 100,
    creditsTotal: 100,
    usedCredits: 0,
    
    plan: 'free_trial',
    planDisplay: 'Free Trial',
    isPremium: false,
    isFreeTrial: true,
    hasUnlimitedCredits: false,
    
    trialEndsAt: null,
    trialDaysLeft: 7,
    showTrialWarning: false,
  };
}

// // =========================================================
// // Example Usage Component
// // =========================================================
// export function ProfileDisplay() {
//   const profile = useProfile();

//   return (
//     <div className="p-6 bg-white rounded-lg shadow">
//       <h2 className="text-xl font-bold mb-4">Your Profile</h2>
      
//       {/* Plan Info */}
//       <div className="mb-4">
//         <p className="text-sm text-gray-600">Plan</p>
//         <p className="text-lg font-semibold">{profile.planDisplay}</p>
//         {profile.isFreeTrial && (
//           <p className="text-sm text-orange-600">
//             {profile.trialDaysLeft} days left in trial
//           </p>
//         )}
//       </div>

//       {/* Credits Info */}
//       <div className="mb-4">
//         <p className="text-sm text-gray-600">Credits</p>
//         <div className="flex items-center gap-2">
//           <p className="text-2xl font-bold">{profile.remainingCredits}</p>
//           {!profile.isPremium && (
//             <p className="text-sm text-gray-500">/ {profile.creditsTotal}</p>
//           )}
//         </div>
//         {profile.isPremium && (
//           <p className="text-sm text-green-600">Unlimited credits</p>
//         )}
//       </div>

//       {/* Trial Warning */}
//       {profile.showTrialWarning && (
//         <div className="p-3 bg-orange-50 border border-orange-200 rounded">
//           <p className="text-sm text-orange-800">
//             ⚠️ Your trial ends in {profile.trialDaysLeft} days. Upgrade to continue!
//           </p>
//         </div>
//       )}

//       {/* Refresh Button */}
//       <button
//         onClick={profile.refreshProfile}
//         className="mt-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
//       >
//         Refresh Profile
//       </button>
//     </div>
//   );
// }