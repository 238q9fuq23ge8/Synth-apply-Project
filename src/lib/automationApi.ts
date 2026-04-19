import api from './api';
import { supabase } from './supabaseClient';

const getAuthHeaders = async () => {
  const { data: { session } } = await supabase.auth.getSession();
  return { Authorization: `Bearer ${session?.access_token}` };
};

export const automationApi = {
  // Start automation
  async startAutomation(payload: {
    cv_id: string;
    role: string;
    country: string;
    min_match_score: number;
    max_jobs: number;
    selected_jobs?: string[];
    use_ai_scoring?: boolean;
    use_llm_boost?: boolean;
    include_internal_jobs?: boolean;
  }) {
    const headers = await getAuthHeaders();
    const response = await api.post('/v1/automate-job-apply', payload, { headers });
    return response.data;
  },

  // Get automation status
  async getStatus() {
    const headers = await getAuthHeaders();
    const response = await api.get('/v1/automation/status', { headers });
    return response.data;
  },

  // Get automation history
  async getHistory(page = 1, pageSize = 10) {
    const headers = await getAuthHeaders();
    const response = await api.get(
      `/v1/automation/history?page=${page}&page_size=${pageSize}`,
      { headers }
    );
    return response.data;
  },

  // Get logs for a history record
  async getLogs(recordId: string) {
    const headers = await getAuthHeaders();
    const response = await api.get(`/v1/automation/logs/${recordId}`, { headers });
    return response.data;
  },

  // Get all applied jobs
  async getAppliedJobs(page = 1, pageSize = 20) {
    const headers = await getAuthHeaders();
    const response = await api.get(
      `/v1/applied-jobs/all?page=${page}&page_size=${pageSize}`,
      { headers }
    );
    return response.data;
  },

  // Get applied jobs by run
  async getJobsByRun(runId: string) {
    const headers = await getAuthHeaders();
    const response = await api.get(`/v1/applied-jobs/run/${runId}`, { headers });
    return response.data;
  },

  // Connect to SSE stream
  connectToStream(runId: string, onMessage: (data: any) => void): EventSource {
    const baseUrl =
      import.meta.env.VITE_API_URL || 'https://jobbot-production-ddd9.up.railway.app';
    const token = localStorage.getItem('access_token') || '';
    const eventSource = new EventSource(
      `${baseUrl}/v1/sse/stream?user_id=${encodeURIComponent(token)}`
    );
    eventSource.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        onMessage(data);
      } catch {
        onMessage({ type: 'info', msg: event.data });
      }
    };
    return eventSource;
  },
};
