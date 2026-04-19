import api from '@/lib/api';

// ==================== TYPES ====================

export interface Candidate {
  id: string;
  user_id: string;
  name: string;
  email: string;
  position: string;
  job_id: string;
  job_title?: string;
  applied_date: string;
  location: string;
  experience: string;
  match_score: number;
  status: 'New' | 'Pending' | 'Shortlisted' | 'Rejected' | 'Hired';
  cv_id?: string;
  avatar?: string;
  summary?: string;
  experience_details?: ExperienceDetail[];
  education?: EducationDetail[];
  skills?: string[];
  phone?: string;
  linkedin?: string;
}

export interface ExperienceDetail {
  title: string;
  company: string;
  period: string;
  description?: string;
}

export interface EducationDetail {
  degree: string;
  university: string;
  year: string;
  details?: string[];
}

export interface CandidatesResponse {
  candidates: Candidate[];
  total: number;
  page: number;
  limit: number;
  total_pages: number;
}

export interface CandidateStats {
  total: number;
  hired: number;
  pending: number;
  rejected: number;
  new: number;
  shortlisted: number;
  last_24_hours: number;
}

export interface Job {
  id: string;
  title: string;
  company: string;
  posted_date: string;
  salary?: string;
  location: string;
  work_type: string;
  description: string;
  required_skills: string[];
}

// ==================== API FUNCTIONS ====================

/**
 * Fetch all candidates (applications) across all jobs with pagination
 * Maps to GET /v1/recruiter/jobs then fetches applications per job
 */
export const fetchCandidates = async (params: {
  page?: number;
  limit?: number;
  job_position?: string;
  status?: string;
  match_score?: number;
  search?: string;
}): Promise<CandidatesResponse> => {
  try {
    const jobsRes = await api.get('/v1/recruiter/jobs', {
      params: { page: 1, page_size: 50 },
    });
    const jobs = jobsRes.data?.jobs || [];

    const allCandidates: Candidate[] = [];
    for (const job of jobs.slice(0, 10)) {
      try {
        const appRes = await api.get(`/v1/recruiter/jobs/${job.id}/applications`, {
          params: { page: params.page || 1, page_size: params.limit || 20 },
        });
        const apps = appRes.data?.applications || [];
        allCandidates.push(
          ...apps.map((a: any) => ({
            id: a.id,
            user_id: a.user_id || '',
            name: a.applicant_name || a.name || 'Unknown',
            email: a.email || '',
            position: job.title,
            job_id: job.id,
            job_title: job.title,
            applied_date: a.applied_at || a.created_at || '',
            location: a.location || '',
            experience: a.experience || '',
            match_score: a.match_score || 0,
            status: a.status || 'New',
            cv_id: a.cv_id,
          }))
        );
      } catch {
        // skip failed job
      }
    }

    // Client-side filter by status/search
    let filtered = allCandidates;
    if (params.status) {
      filtered = filtered.filter(
        (c) => c.status.toLowerCase() === params.status!.toLowerCase()
      );
    }
    if (params.search) {
      const q = params.search.toLowerCase();
      filtered = filtered.filter(
        (c) => c.name.toLowerCase().includes(q) || c.position.toLowerCase().includes(q)
      );
    }

    return {
      candidates: filtered,
      total: filtered.length,
      page: params.page || 1,
      limit: params.limit || 20,
      total_pages: Math.ceil(filtered.length / (params.limit || 20)),
    };
  } catch (error: any) {
    console.error('Failed to fetch candidates:', error);
    throw error;
  }
};

/**
 * Fetch candidate statistics derived from applications
 */
export const fetchCandidateStats = async (): Promise<CandidateStats> => {
  try {
    const res = await api.get('/v1/recruiter/analytics');
    const d = res.data;
    return {
      total: d.total_applications || 0,
      hired: d.hired || 0,
      pending: d.pending || 0,
      rejected: d.rejected || 0,
      new: d.new_applications || 0,
      shortlisted: d.shortlisted || 0,
      last_24_hours: d.last_24_hours || 0,
    };
  } catch (error: any) {
    console.error('Failed to fetch candidate stats:', error);
    throw error;
  }
};

/**
 * Fetch detailed information for a specific application
 * Maps to GET /v1/recruiter/applications/{app_id}
 */
export const fetchCandidateDetails = async (candidateId: string): Promise<Candidate> => {
  try {
    const response = await api.get(`/v1/recruiter/applications/${candidateId}`);
    const a = response.data;
    return {
      id: a.id,
      user_id: a.user_id || '',
      name: a.applicant_name || a.name || 'Unknown',
      email: a.email || '',
      position: a.job_title || '',
      job_id: a.job_id || '',
      job_title: a.job_title,
      applied_date: a.applied_at || a.created_at || '',
      location: a.location || '',
      experience: a.experience || '',
      match_score: a.match_score || 0,
      status: a.status || 'New',
      cv_id: a.cv_id,
      skills: a.skills,
      summary: a.summary,
    };
  } catch (error: any) {
    console.error('Failed to fetch candidate details:', error);
    throw error;
  }
};

/**
 * Update application status
 * Maps to PATCH /v1/recruiter/applications/{app_id}
 */
export const updateCandidateStatus = async (
  candidateId: string,
  status: string
): Promise<{ success: boolean; message: string; candidate: Candidate }> => {
  try {
    const response = await api.patch(`/v1/recruiter/applications/${candidateId}`, {
      status: status.toLowerCase(),
    });
    return response.data;
  } catch (error: any) {
    console.error('Failed to update candidate status:', error);
    throw error;
  }
};

/**
 * Download candidate's CV
 * Maps to GET /v1/cv/{cv_id}
 */
export const downloadCandidateCV = async (candidateId: string, candidateName?: string) => {
  try {
    // First get the application to find cv_id
    const appRes = await api.get(`/v1/recruiter/applications/${candidateId}`);
    const cvId = appRes.data?.cv_id;
    if (!cvId) throw new Error('No CV found for this candidate');

    const response = await api.get(`/v1/cv/${cvId}`, { responseType: 'blob' });

    const url = window.URL.createObjectURL(new Blob([response.data]));
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `${candidateName || 'candidate'}_cv.pdf`);
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.URL.revokeObjectURL(url);

    return { success: true };
  } catch (error: any) {
    console.error('Failed to download CV:', error);
    throw error;
  }
};

/**
 * Fetch all candidates for a specific job
 * Maps to GET /v1/recruiter/jobs/{job_id}/applications
 */
export const fetchJobCandidates = async (jobId: string): Promise<Candidate[]> => {
  try {
    const response = await api.get(`/v1/recruiter/jobs/${jobId}/applications`);
    const apps = response.data?.applications || [];
    return apps.map((a: any) => ({
      id: a.id,
      user_id: a.user_id || '',
      name: a.applicant_name || a.name || 'Unknown',
      email: a.email || '',
      position: a.job_title || '',
      job_id: jobId,
      applied_date: a.applied_at || a.created_at || '',
      location: a.location || '',
      experience: a.experience || '',
      match_score: a.match_score || 0,
      status: a.status || 'New',
      cv_id: a.cv_id,
    }));
  } catch (error: any) {
    console.error('Failed to fetch job candidates:', error);
    throw error;
  }
};

/**
 * Fetch job details
 * Maps to GET /v1/recruiter/jobs/{job_id}
 */
export const fetchJobDetails = async (jobId: string): Promise<Job> => {
  try {
    const response = await api.get(`/v1/recruiter/jobs/${jobId}`);
    return response.data;
  } catch (error: any) {
    console.error('Failed to fetch job details:', error);
    throw error;
  }
};

/**
 * Bulk update candidate statuses
 * Maps to PATCH /v1/recruiter/applications/{app_id} for each candidate
 */
export const bulkUpdateCandidateStatus = async (
  candidateIds: string[],
  status: string
): Promise<{ success: boolean; updated_count: number }> => {
  try {
    const results = await Promise.allSettled(
      candidateIds.map((id) =>
        api.patch(`/v1/recruiter/applications/${id}`, { status: status.toLowerCase() })
      )
    );
    const updated = results.filter((r) => r.status === 'fulfilled').length;
    return { success: updated > 0, updated_count: updated };
  } catch (error: any) {
    console.error('Failed to bulk update candidates:', error);
    throw error;
  }
};

/**
 * Export candidates data (client-side CSV generation)
 */
export const exportCandidates = async (format: 'csv' | 'excel' | 'pdf') => {
  try {
    const { candidates } = await fetchCandidates({ limit: 500 });

    if (format === 'csv') {
      const headers = ['Name', 'Email', 'Position', 'Status', 'Match Score', 'Applied Date'];
      const rows = candidates.map((c) => [
        c.name, c.email, c.position, c.status, c.match_score, c.applied_date,
      ]);
      const csv = [headers, ...rows].map((r) => r.join(',')).join('\n');
      const blob = new Blob([csv], { type: 'text/csv' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', 'candidates_export.csv');
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    }

    return { success: true };
  } catch (error: any) {
    console.error('Failed to export candidates:', error);
    throw error;
  }
};

/**
 * Add notes to a candidate — stored locally as backend doesn't have this endpoint yet
 */
export const addCandidateNote = async (
  candidateId: string,
  note: string
): Promise<{ success: boolean; note_id: string }> => {
  const key = `candidate_notes_${candidateId}`;
  const existing = JSON.parse(localStorage.getItem(key) || '[]');
  const noteId = `note_${Date.now()}`;
  existing.push({ id: noteId, note, created_at: new Date().toISOString() });
  localStorage.setItem(key, JSON.stringify(existing));
  return { success: true, note_id: noteId };
};

/**
 * Fetch candidate notes — from local storage until backend supports it
 */
export const fetchCandidateNotes = async (candidateId: string) => {
  const key = `candidate_notes_${candidateId}`;
  return JSON.parse(localStorage.getItem(key) || '[]');
};

/**
 * Schedule interview — stored locally as backend doesn't have this endpoint yet
 */
export const scheduleInterview = async (
  candidateId: string,
  interviewData: {
    date: string;
    time: string;
    type: string;
    notes?: string;
  }
): Promise<{ success: boolean; interview_id: string }> => {
  const key = `candidate_interviews_${candidateId}`;
  const existing = JSON.parse(localStorage.getItem(key) || '[]');
  const interviewId = `interview_${Date.now()}`;
  existing.push({ id: interviewId, ...interviewData, created_at: new Date().toISOString() });
  localStorage.setItem(key, JSON.stringify(existing));
  return { success: true, interview_id: interviewId };
};

export default {
  fetchCandidates,
  fetchCandidateStats,
  fetchCandidateDetails,
  updateCandidateStatus,
  downloadCandidateCV,
  fetchJobCandidates,
  fetchJobDetails,
  bulkUpdateCandidateStatus,
  exportCandidates,
  addCandidateNote,
  fetchCandidateNotes,
  scheduleInterview,
};
