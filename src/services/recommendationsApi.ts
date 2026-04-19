import api from '@/lib/api';

// ==================== TYPES ====================

export interface JobRecommendation {
  id: string;
  title: string;
  company: string | null;
  location: string | null;
  snippet: string | null;
  url: string | null;
  score: number;
  match_reasons: string[];
  source: string;
  is_internal: boolean;
  salary?: string;
  posted_date?: string;
  job_type?: string;
}

export interface ProfileUsed {
  cv_id: string;
  title: string;
  skills_count: number;
}

export interface SearchPatterns {
  top_keywords: string[];
  top_regions: string[];
}

export interface RecommendationsResponse {
  ok: boolean;
  recommendations: JobRecommendation[];
  total: number;
  profile_used: ProfileUsed;
  search_patterns: SearchPatterns;
  credits_remaining: number;
  cached: boolean;
}

export interface RecommendationFilters {
  min_score?: number;
  max_score?: number;
  location?: string;
  job_type?: string;
  source?: 'internal' | 'external' | 'all';
  company?: string;
}

// ==================== API FUNCTIONS ====================

/**
 * Fetch job recommendations based on user's CV and search history
 */
export const fetchJobRecommendations = async (params: {
  cv_id?: string;
  limit?: number;
  region?: string;
  min_score?: number;
  force_refresh?: boolean;
} = {}): Promise<RecommendationsResponse> => {
  try {
    const response = await api.post('/v1/jobs/recommendations', {
      cv_id: params.cv_id,
      limit: params.limit || 20,
      region: params.region,
      min_score: params.min_score || 30,
      force_refresh: params.force_refresh || false,
    }, { timeout: 120000 }); // 2 min timeout — backend does AI CV scoring
    
    return response.data;
  } catch (error: any) {
    console.error('Failed to fetch job recommendations:', error);
    
    // Handle specific error cases
    if (error.response?.status === 400) {
      throw new Error('No CV found. Please upload and parse a CV first.');
    } else if (error.response?.status === 402) {
      throw new Error('Insufficient credits. Please upgrade your plan.');
    } else if (error.response?.status === 404) {
      throw new Error('Profile not found.');
    }
    
    throw error;
  }
};

/**
 * Apply filters to recommendations (client-side filtering)
 */
export const filterRecommendations = (
  recommendations: JobRecommendation[],
  filters: RecommendationFilters
): JobRecommendation[] => {
  let filtered = [...recommendations];

  // Filter by score range
  if (filters.min_score !== undefined) {
    filtered = filtered.filter(job => job.score >= filters.min_score!);
  }
  if (filters.max_score !== undefined) {
    filtered = filtered.filter(job => job.score <= filters.max_score!);
  }

  // Filter by location
  if (filters.location) {
    filtered = filtered.filter(job => 
      job.location?.toLowerCase().includes(filters.location!.toLowerCase())
    );
  }

  // Filter by job type
  if (filters.job_type) {
    filtered = filtered.filter(job => 
      job.job_type?.toLowerCase().includes(filters.job_type!.toLowerCase())
    );
  }

  // Filter by source
  if (filters.source && filters.source !== 'all') {
    if (filters.source === 'internal') {
      filtered = filtered.filter(job => job.is_internal);
    } else if (filters.source === 'external') {
      filtered = filtered.filter(job => !job.is_internal);
    }
  }

  // Filter by company
  if (filters.company) {
    filtered = filtered.filter(job => 
      job.company?.toLowerCase().includes(filters.company!.toLowerCase())
    );
  }

  return filtered;
};

/**
 * Sort recommendations by different criteria
 */
export const sortRecommendations = (
  recommendations: JobRecommendation[],
  sortBy: 'score' | 'date' | 'company' | 'location'
): JobRecommendation[] => {
  const sorted = [...recommendations];

  switch (sortBy) {
    case 'score':
      return sorted.sort((a, b) => b.score - a.score);
    
    case 'date':
      return sorted.sort((a, b) => {
        const dateA = a.posted_date ? new Date(a.posted_date).getTime() : 0;
        const dateB = b.posted_date ? new Date(b.posted_date).getTime() : 0;
        return dateB - dateA;
      });
    
    case 'company':
      return sorted.sort((a, b) => 
        (a.company || '').localeCompare(b.company || '')
      );
    
    case 'location':
      return sorted.sort((a, b) => 
        (a.location || '').localeCompare(b.location || '')
      );
    
    default:
      return sorted;
  }
};

/**
 * Get match score color based on score value
 */
export const getMatchScoreColor = (score: number): string => {
  if (score >= 90) return 'text-green-600 bg-green-100';
  if (score >= 70) return 'text-yellow-600 bg-yellow-100';
  if (score >= 50) return 'text-orange-600 bg-orange-100';
  return 'text-red-600 bg-red-100';
};

/**
 * Get match score label
 */
export const getMatchScoreLabel = (score: number): string => {
  if (score >= 90) return 'Excellent Match';
  if (score >= 70) return 'Good Match';
  if (score >= 50) return 'Fair Match';
  return 'Low Match';
};

/**
 * Save a job recommendation for later — stored locally until backend supports it
 */
export const saveRecommendation = async (jobId: string): Promise<{ success: boolean }> => {
  try {
    const key = 'saved_recommendations';
    const saved: string[] = JSON.parse(localStorage.getItem(key) || '[]');
    if (!saved.includes(jobId)) {
      saved.push(jobId);
      localStorage.setItem(key, JSON.stringify(saved));
    }
    return { success: true };
  } catch (error: any) {
    console.error('Failed to save recommendation:', error);
    throw error;
  }
};

/**
 * Dismiss a job recommendation — stored locally until backend supports it
 */
export const dismissRecommendation = async (jobId: string): Promise<{ success: boolean }> => {
  try {
    const key = 'dismissed_recommendations';
    const dismissed: string[] = JSON.parse(localStorage.getItem(key) || '[]');
    if (!dismissed.includes(jobId)) {
      dismissed.push(jobId);
      localStorage.setItem(key, JSON.stringify(dismissed));
    }
    return { success: true };
  } catch (error: any) {
    console.error('Failed to dismiss recommendation:', error);
    throw error;
  }
};

/**
 * Provide feedback on a recommendation — stored locally until backend supports it
 */
export const provideFeedback = async (
  jobId: string,
  feedback: 'relevant' | 'not_relevant' | 'applied'
): Promise<{ success: boolean }> => {
  try {
    const key = 'recommendation_feedback';
    const existing = JSON.parse(localStorage.getItem(key) || '{}');
    existing[jobId] = { feedback, created_at: new Date().toISOString() };
    localStorage.setItem(key, JSON.stringify(existing));
    return { success: true };
  } catch (error: any) {
    console.error('Failed to provide feedback:', error);
    throw error;
  }
};

/**
 * Get saved recommendations — from local storage until backend supports it
 */
export const getSavedRecommendations = async (): Promise<JobRecommendation[]> => {
  try {
    const key = 'saved_recommendations';
    const savedIds: string[] = JSON.parse(localStorage.getItem(key) || '[]');
    // Return empty array — full data would need a separate fetch
    return savedIds.map((id) => ({ id } as JobRecommendation));
  } catch (error: any) {
    console.error('Failed to get saved recommendations:', error);
    throw error;
  }
};

/**
 * Refresh recommendations (force new fetch)
 */
export const refreshRecommendations = async (cv_id?: string): Promise<RecommendationsResponse> => {
  return fetchJobRecommendations({
    cv_id,
    force_refresh: true,
  });
};

export default {
  fetchJobRecommendations,
  filterRecommendations,
  sortRecommendations,
  getMatchScoreColor,
  getMatchScoreLabel,
  saveRecommendation,
  dismissRecommendation,
  provideFeedback,
  getSavedRecommendations,
  refreshRecommendations,
};
