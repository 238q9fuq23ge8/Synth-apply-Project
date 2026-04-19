import api from "@/lib/api";

export interface OverviewMetrics {
  total_users: number;
  new_users_today: number;
  new_users_week: number;
  new_users_month: number;
  total_revenue: number;
  active_trials: number;
  paid_users: number;
  total_automations: number;
  total_applications: number;
}

export interface UsersMetrics {
  total_users: number;
  job_seekers: number;
  recruiters: number;
  trial_users: number;
  paid_users: number;
  users_with_cvs: number;
  avg_cvs_per_user: number;
  avg_applications_per_user: number;
  growth_data?: Record<string, number>;
}

export interface RevenueMetrics {
  total_revenue: number;
  revenue_today: number;
  revenue_week: number;
  revenue_month: number;
  revenue_by_package: Record<string, { count: number; revenue: number }>;
  total_credits_sold: number;
  arpu: number;
}

export interface SystemMetrics {
  total_credits_purchased: number;
  total_credits_consumed: number;
  credits_remaining: number;
  total_automation_runs: number;
  successful_runs: number;
  failed_runs: number;
  automation_success_rate: number;
  total_job_searches: number;
  total_cvs_uploaded: number;
  total_applications: number;
}

export interface ListUsersParams {
  page?: number;
  limit?: number;
  plan?: string;
  person?: string;
  search?: string;
}

// ✅ Enhanced CV Data Interface
export interface CVData {
  id: string;
  name?: string;
  summary?: string;
  skills?: string[];
  validation_status?: string;
  created_at?: string;
  file_path?: string;
  file_name?: string;
  file_url?: string;
  parsed?: {
    name?: string;
    email?: string;
    phone?: string;
    summary?: string;
    experience?: Array<{
      title?: string;
      company?: string;
      start_date?: string;
      end_date?: string;
    }>;
    education?: Array<{
      institution?: string;
      degree?: string;
      year?: string;
    }>;
  };
  is_docx?: boolean;
  has_parsed_data?: boolean;
  needs_parsing?: boolean;
}

// ✅ Enhanced Admin User Interface
export interface AdminUserRow {
  user_id: string;
  email: string;
  name?: string;
  person: string;
  plan: string;
  credits: number;
  is_admin: boolean;
  trial_ends_at?: string | null;
  created_at: string;
  // ✅ Enhanced profile fields
  phone?: string;
  nationality?: string;
  profession?: string;
  date_of_birth?: string;
  location?: string;
  bio?: string;
  linkedin_url?: string;
  years_experience?: number;
  education_level?: string;
  cv_id?: string;
  profile_completed?: boolean;
  cv_data?: {
    id: string;
    name?: string;
    summary?: string;
    skills?: string[];
    validation_status?: string;
    created_at?: string;
    file_path?: string;
  };
}

export interface ListUsersResponse {
  users: AdminUserRow[];
  total: number;
  page: number;
  limit: number;
  total_pages: number;
}

// ✅ API Functions
export const getOverviewMetrics = async (): Promise<OverviewMetrics> => {
  const res = await api.get("/v1/admin/metrics/overview");
  return res.data;
};

export const getUserMetrics = async (): Promise<UsersMetrics> => {
  const res = await api.get("/v1/admin/metrics/users");
  return res.data;
};

export const getRevenueMetrics = async (): Promise<RevenueMetrics> => {
  const res = await api.get("/v1/admin/metrics/revenue");
  return res.data;
};

export const getSystemMetrics = async (): Promise<SystemMetrics> => {
  const res = await api.get("/v1/admin/metrics/system");
  return res.data;
};

export const listUsers = async (
  params: ListUsersParams = {}
): Promise<ListUsersResponse> => {
  try {
    const res = await api.get("/v1/admin/users", { params });
    return res.data;
  } catch (error: any) {
    console.error("Failed to fetch users:", error);
    throw error;
  }
};

// ✅ NEW: Get user CV details (Admin endpoint)
export const getUserCV = async (cvId: string): Promise<CVData> => {
  try {
    // Use admin endpoint that can access any CV
    const res = await api.get(`/v1/admin/cvs/${cvId}`);
    return res.data;
  } catch (error: any) {
    console.error("Failed to fetch CV:", error);
    throw error;
  }
};

// ✅ NEW: Get all CVs for a specific user (Admin only)
export const getUserCVs = async (userId: string): Promise<{
  ok: boolean;
  user_info: { user_id: string; email: string; name?: string };
  cvs: Array<{
    id: string;
    file_name: string;
    parsed_name: string;
    skills_count: number;
    created_at: string;
    validation_status: string;
    has_parsed_data: boolean;
  }>;
  total_cvs: number;
}> => {
  try {
    const res = await api.get(`/v1/admin/users/${userId}/cvs`);
    return res.data;
  } catch (error: any) {
    console.error("Failed to fetch user CVs:", error);
    throw error;
  }
};

// ✅ NEW: Debug CVs endpoint
export const debugUserCVs = async (): Promise<any> => {
  try {
    const res = await api.get("/v1/admin/users/debug-cvs");
    return res.data;
  } catch (error: any) {
    console.error("Debug CVs failed:", error);
    throw error;
  }
};

// ✅ NEW: Debug users endpoint
export const debugUsers = async (): Promise<any> => {
  try {
    const res = await api.get("/v1/admin/users/debug");
    return res.data;
  } catch (error: any) {
    console.error("Debug endpoint failed:", error);
    throw error;
  }
};

// ✅ NEW: Simple users fallback
export const getUsersSimple = async (
  params: ListUsersParams = {}
): Promise<ListUsersResponse> => {
  try {
    const res = await api.get("/v1/admin/users/simple", { params });
    return res.data;
  } catch (error: any) {
    console.error("Simple users fetch failed:", error);
    throw error;
  }
};

// ✅ NEW: Test endpoint connectivity
export const testAdminEndpoint = async (): Promise<{ ok: boolean; message: string }> => {
  try {
    const res = await api.get("/v1/admin/users/test");
    return res.data;
  } catch (error: any) {
    console.error("Admin endpoint test failed:", error);
    throw error;
  }
};

// ✅ Type guards for better error handling
export const isValidCVData = (data: any): data is CVData => {
  return data && typeof data === 'object' && typeof data.id === 'string';
};

export const isValidUserData = (data: any): data is AdminUserRow => {
  return data && typeof data === 'object' && typeof data.user_id === 'string' && typeof data.email === 'string';
};

// ✅ Helper function to get user display name
export const getUserDisplayName = (user: AdminUserRow): string => {
  return user.name || user.email.split('@')[0] || 'Unknown User';
};

// ✅ Helper function to format user type
export const formatUserType = (person: string): string => {
  return person === 'job_seeker' ? 'Job Seeker' : 'Recruiter';
};

// ✅ Helper function to get trial status
export const getTrialStatus = (user: AdminUserRow): {
  status: 'active' | 'expired' | 'paid';
  daysLeft?: number;
  message: string;
} => {
  if (user.plan !== "free_trial") {
    return { status: 'paid', message: 'Paid Plan' };
  }
  
  if (!user.trial_ends_at) {
    return { status: 'active', message: 'Trial Active' };
  }
  
  const trialEnds = new Date(user.trial_ends_at);
  const now = new Date();
  const daysLeft = Math.ceil((trialEnds.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
  
  if (daysLeft > 0) {
    return { 
      status: 'active', 
      daysLeft, 
      message: `${daysLeft} day${daysLeft === 1 ? '' : 's'} left` 
    };
  } else {
    return { status: 'expired', message: 'Trial Expired' };
  }
};

// ✅ NEW: Download user's CV
export const downloadUserCV = async (cvId: string): Promise<void> => {
  try {
    const response = await api.get(`/v1/admin/cvs/${cvId}/download`, {
      responseType: 'blob' // Important for file downloads
    });

    // Create blob URL and trigger download
    const blob = new Blob([response.data]);
    const url = window.URL.createObjectURL(blob);
    
    // Extract filename from Content-Disposition header
    const contentDisposition = response.headers['content-disposition'];
    let filename = 'CV_download.pdf';
    
    if (contentDisposition) {
      const matches = /filename[^;=\n]*=((['"]).*?\2|[^;\n]*)/.exec(contentDisposition);
      if (matches != null && matches[1]) {
        filename = matches[1].replace(/['"]/g, '');
      }
    }
    
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
    
  } catch (error: any) {
    console.error("Failed to download CV:", error);
    throw error;
  }
};

// ✅ NEW: Export all users data in different formats
export const exportUsersData = async (format: 'pdf' | 'csv' | 'excel' = 'pdf'): Promise<void> => {
  try {
    const response = await api.get(`/v1/admin/export/users`, {
      params: { format },
      responseType: 'blob'
    });

    // Create blob and download
    const blob = new Blob([response.data]);
    const url = window.URL.createObjectURL(blob);
    
    // Get filename from response headers
    const contentDisposition = response.headers['content-disposition'];
    let filename = `users_export.${format}`;
    
    if (contentDisposition) {
      const matches = /filename[^;=\n]*=((['"]).*?\2|[^;\n]*)/.exec(contentDisposition);
      if (matches != null && matches[1]) {
        filename = matches[1].replace(/['"]/g, '');
      }
    }
    
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
    
  } catch (error: any) {
    console.error("Failed to export users data:", error);
    throw error;
  }
};

// ✅ NEW: Export all CVs as ZIP
export const exportAllCVs = async (): Promise<void> => {
  try {
    const response = await api.get('/v1/admin/export/cvs', {
      responseType: 'blob'
    });

    const blob = new Blob([response.data]);
    const url = window.URL.createObjectURL(blob);
    
    const contentDisposition = response.headers['content-disposition'];
    let filename = 'all_cvs_export.zip';
    
    if (contentDisposition) {
      const matches = /filename[^;=\n]*=((['"]).*?\2|[^;\n]*)/.exec(contentDisposition);
      if (matches != null && matches[1]) {
        filename = matches[1].replace(/['"]/g, '');
      }
    }
    
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
    
  } catch (error: any) {
    console.error("Failed to export all CVs:", error);
    throw error;
  }
};
// import api from "@/lib/api";

// export interface OverviewMetrics {
//   total_users: number;
//   new_users_today: number;
//   new_users_week: number;
//   new_users_month: number;
//   total_revenue: number;
//   active_trials: number;
//   paid_users: number;
//   total_automations: number;
//   total_applications: number;
// }

// export interface UsersMetrics {
//   total_users: number;
//   job_seekers: number;
//   recruiters: number;
//   trial_users: number;
//   paid_users: number;
//   users_with_cvs: number;
//   avg_cvs_per_user: number;
//   avg_applications_per_user: number;
//   growth_data?: Record<string, number>;
// }

// export interface RevenueMetrics {
//   total_revenue: number;
//   revenue_today: number;
//   revenue_week: number;
//   revenue_month: number;
//   revenue_by_package: Record<string, { count: number; revenue: number }>;
//   total_credits_sold: number;
//   arpu: number;
// }

// export interface SystemMetrics {
//   total_credits_purchased: number;
//   total_credits_consumed: number;
//   credits_remaining: number;
//   total_automation_runs: number;
//   successful_runs: number;
//   failed_runs: number;
//   automation_success_rate: number;
//   total_job_searches: number;
//   total_cvs_uploaded: number;
//   total_applications: number;
// }

// export interface ListUsersParams {
//   page?: number;
//   limit?: number;
//   plan?: string;
//   person?: string;
//   search?: string;
// }

// // ✅ Enhanced CV Data Interface
// export interface CVData {
//   id: string;
//   name?: string;
//   summary?: string;
//   skills?: string[];
//   validation_status?: string;
//   created_at?: string;
//   file_path?: string;
//   file_name?: string;
//   file_url?: string;
//   parsed?: {
//     name?: string;
//     email?: string;
//     phone?: string;
//     summary?: string;
//     experience?: Array<{
//       title?: string;
//       company?: string;
//       start_date?: string;
//       end_date?: string;
//     }>;
//     education?: Array<{
//       institution?: string;
//       degree?: string;
//       year?: string;
//     }>;
//   };
//   is_docx?: boolean;
//   has_parsed_data?: boolean;
//   needs_parsing?: boolean;
// }

// // ✅ Enhanced Admin User Interface
// export interface AdminUserRow {
//   user_id: string;
//   email: string;
//   name?: string;
//   person: string;
//   plan: string;
//   credits: number;
//   is_admin: boolean;
//   trial_ends_at?: string | null;
//   created_at: string;
//   // ✅ Enhanced profile fields
//   phone?: string;
//   nationality?: string;
//   profession?: string;
//   date_of_birth?: string;
//   location?: string;
//   bio?: string;
//   linkedin_url?: string;
//   years_experience?: number;
//   education_level?: string;
//   cv_id?: string;
//   profile_completed?: boolean;
//   cv_data?: {
//     id: string;
//     name?: string;
//     summary?: string;
//     skills?: string[];
//     validation_status?: string;
//     created_at?: string;
//     file_path?: string;
//   };
// }

// export interface ListUsersResponse {
//   users: AdminUserRow[];
//   total: number;
//   page: number;
//   limit: number;
//   total_pages: number;
// }

// // ✅ API Functions
// export const getOverviewMetrics = async (): Promise<OverviewMetrics> => {
//   const res = await api.get("/v1/admin/metrics/overview");
//   return res.data;
// };

// export const getUserMetrics = async (): Promise<UsersMetrics> => {
//   const res = await api.get("/v1/admin/metrics/users");
//   return res.data;
// };

// export const getRevenueMetrics = async (): Promise<RevenueMetrics> => {
//   const res = await api.get("/v1/admin/metrics/revenue");
//   return res.data;
// };

// export const getSystemMetrics = async (): Promise<SystemMetrics> => {
//   const res = await api.get("/v1/admin/metrics/system");
//   return res.data;
// };

// export const listUsers = async (
//   params: ListUsersParams = {}
// ): Promise<ListUsersResponse> => {
//   try {
//     const res = await api.get("/v1/admin/users", { params });
//     return res.data;
//   } catch (error: any) {
//     console.error("Failed to fetch users:", error);
//     throw error;
//   }
// };

// // ✅ NEW: Get user CV details (Admin endpoint)
// export const getUserCV = async (cvId: string): Promise<CVData> => {
//   try {
//     // Use admin endpoint that can access any CV
//     const res = await api.get(`/v1/admin/cvs/${cvId}`);
//     return res.data;
//   } catch (error: any) {
//     console.error("Failed to fetch CV:", error);
//     throw error;
//   }
// };

// // ✅ NEW: Get all CVs for a specific user (Admin only)
// export const getUserCVs = async (userId: string): Promise<{
//   ok: boolean;
//   user_info: { user_id: string; email: string; name?: string };
//   cvs: Array<{
//     id: string;
//     file_name: string;
//     parsed_name: string;
//     skills_count: number;
//     created_at: string;
//     validation_status: string;
//     has_parsed_data: boolean;
//   }>;
//   total_cvs: number;
// }> => {
//   try {
//     const res = await api.get(`/v1/admin/users/${userId}/cvs`);
//     return res.data;
//   } catch (error: any) {
//     console.error("Failed to fetch user CVs:", error);
//     throw error;
//   }
// };

// // ✅ NEW: Debug CVs endpoint
// export const debugUserCVs = async (): Promise<any> => {
//   try {
//     const res = await api.get("/v1/admin/users/debug-cvs");
//     return res.data;
//   } catch (error: any) {
//     console.error("Debug CVs failed:", error);
//     throw error;
//   }
// };

// // ✅ NEW: Debug users endpoint
// export const debugUsers = async (): Promise<any> => {
//   try {
//     const res = await api.get("/v1/admin/users/debug");
//     return res.data;
//   } catch (error: any) {
//     console.error("Debug endpoint failed:", error);
//     throw error;
//   }
// };

// // ✅ NEW: Simple users fallback
// export const getUsersSimple = async (
//   params: ListUsersParams = {}
// ): Promise<ListUsersResponse> => {
//   try {
//     const res = await api.get("/v1/admin/users/simple", { params });
//     return res.data;
//   } catch (error: any) {
//     console.error("Simple users fetch failed:", error);
//     throw error;
//   }
// };

// // ✅ NEW: Test endpoint connectivity
// export const testAdminEndpoint = async (): Promise<{ ok: boolean; message: string }> => {
//   try {
//     const res = await api.get("/v1/admin/users/test");
//     return res.data;
//   } catch (error: any) {
//     console.error("Admin endpoint test failed:", error);
//     throw error;
//   }
// };

// // ✅ Type guards for better error handling
// export const isValidCVData = (data: any): data is CVData => {
//   return data && typeof data === 'object' && typeof data.id === 'string';
// };

// export const isValidUserData = (data: any): data is AdminUserRow => {
//   return data && typeof data === 'object' && typeof data.user_id === 'string' && typeof data.email === 'string';
// };

// // ✅ Helper function to get user display name
// export const getUserDisplayName = (user: AdminUserRow): string => {
//   return user.name || user.email.split('@')[0] || 'Unknown User';
// };

// // ✅ Helper function to format user type
// export const formatUserType = (person: string): string => {
//   return person === 'job_seeker' ? 'Job Seeker' : 'Recruiter';
// };

// // ✅ Helper function to get trial status
// export const getTrialStatus = (user: AdminUserRow): {
//   status: 'active' | 'expired' | 'paid';
//   daysLeft?: number;
//   message: string;
// } => {
//   if (user.plan !== "free_trial") {
//     return { status: 'paid', message: 'Paid Plan' };
//   }
  
//   if (!user.trial_ends_at) {
//     return { status: 'active', message: 'Trial Active' };
//   }
  
//   const trialEnds = new Date(user.trial_ends_at);
//   const now = new Date();
//   const daysLeft = Math.ceil((trialEnds.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
  
//   if (daysLeft > 0) {
//     return { 
//       status: 'active', 
//       daysLeft, 
//       message: `${daysLeft} day${daysLeft === 1 ? '' : 's'} left` 
//     };
//   } else {
//     return { status: 'expired', message: 'Trial Expired' };
//   }
// };




// import api from "@/lib/api";

// export interface OverviewMetrics {
//   total_users: number;
//   new_users_today: number;
//   new_users_week: number;
//   new_users_month: number;
//   total_revenue: number;
//   active_trials: number;
//   paid_users: number;
//   total_automations: number;
//   total_applications: number;
// }

// export interface UsersMetrics {
//   total_users: number;
//   job_seekers: number;
//   recruiters: number;
//   trial_users: number;
//   paid_users: number;
//   users_with_cvs: number;
//   avg_cvs_per_user: number;
//   avg_applications_per_user: number;
//   growth_data?: Record<string, number>;
// }

// export interface RevenueMetrics {
//   total_revenue: number;
//   revenue_today: number;
//   revenue_week: number;
//   revenue_month: number;
//   revenue_by_package: Record<string, { count: number; revenue: number }>;
//   total_credits_sold: number;
//   arpu: number;
// }

// export interface SystemMetrics {
//   total_credits_purchased: number;
//   total_credits_consumed: number;
//   credits_remaining: number;
//   total_automation_runs: number;
//   successful_runs: number;
//   failed_runs: number;
//   automation_success_rate: number;
//   total_job_searches: number;
//   total_cvs_uploaded: number;
//   total_applications: number;
// }

// export interface ListUsersParams {
//   page?: number;
//   limit?: number;
//   plan?: string;
//   person?: string;
//   search?: string;
// }

// export interface AdminUserRow {
//   user_id: string;
//   email: string;
//   name: string;
//   person: string;
//   plan: string;
//   credits: number;
//   is_admin: boolean;
//   trial_ends_at: string | null;
//   created_at: string;
// }

// export interface ListUsersResponse {
//   users: AdminUserRow[];
//   total: number;
//   page: number;
//   limit: number;
//   total_pages: number;
// }

// export const getOverviewMetrics = async (): Promise<OverviewMetrics> => {
//   const res = await api.get("/v1/admin/metrics/overview");
//   return res.data;
// };

// export const getUserMetrics = async (): Promise<UsersMetrics> => {
//   const res = await api.get("/v1/admin/metrics/users");
//   return res.data;
// };

// export const getRevenueMetrics = async (): Promise<RevenueMetrics> => {
//   const res = await api.get("/v1/admin/metrics/revenue");
//   return res.data;
// };

// export const getSystemMetrics = async (): Promise<SystemMetrics> => {
//   const res = await api.get("/v1/admin/metrics/system");
//   return res.data;
// };

// export const listUsers = async (
//   params: ListUsersParams = {}
// ): Promise<ListUsersResponse> => {
//   const res = await api.get("/v1/admin/users", { params });
//   return res.data;
// };


