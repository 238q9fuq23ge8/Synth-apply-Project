# Backend Integration Plan

## 📊 Current Status Analysis

### ✅ BACKEND APIs COMPLETED

1. **CV Chatbot WebSocket API** (`CV_Builder_Chatbot_backend_spec.md`)
   - WebSocket endpoint: `ws://localhost:8000/ws/cv-chat/{session_id}`
   - Features: Real-time CV building, file upload, AI suggestions
   - Status: ❌ NOT CONNECTED

2. **Job Recommendations API** (`JOB_RECOMMENDATIONS_API.md`)
   - Endpoint: `POST /v1/jobs/recommendations`
   - Features: AI-powered job matching, internal + external jobs
   - Status: ❌ NOT CONNECTED

3. **Skill Gap Analysis API** (`skillgap.route.md`)
   - Endpoint: `POST /v1/skill-gap/analyze`
   - Features: Analyze skills, suggest courses
   - Status: ✅ PARTIALLY CONNECTED (needs enhancement)

4. **Admin Routes** (`admin.route.md`)
   - Endpoints: `/v1/admin/metrics/*`, `/v1/admin/users`
   - Features: Dashboard metrics, user management, revenue tracking
   - Status: ✅ FULLY CONNECTED

5. **Credits API**
   - Endpoints: `/v1/credits/balance`, `/v1/credits/history`
   - Status: ✅ FULLY CONNECTED

6. **Job Search API**
   - Endpoint: `POST /v1/jobs/search-simple`
   - Status: ✅ FULLY CONNECTED

7. **Automation API**
   - Endpoints: `/v1/automation/status`, `/v1/automate-job-apply`
   - Status: ✅ FULLY CONNECTED

8. **CV Upload/Parse API**
   - Endpoints: `/v1/cv/upload`, `/v1/ai/parse-cv`
   - Status: ✅ FULLY CONNECTED

9. **Authentication API**
   - Endpoint: `POST v1/auth/login`, `POST /auth/signup`
   - Status: ✅ FULLY CONNECTED

10. **Profile API**
    - Endpoint: `POST /v1/profile/me`
    - Status: ✅ FULLY CONNECTED

11. **Company Jobs API**
    - Endpoints: `/v1/company-jobs`, `/v1/company-jobs/apply`
    - Status: ✅ FULLY CONNECTED

12. **Applications API**
    - Endpoints: `/v1/jobseeker/applications/all`, `/v1/applied-jobs/all`
    - Status: ✅ FULLY CONNECTED

---

## 🎯 PAGES NEEDING BACKEND CONNECTION

### Priority 1: Critical Features

#### 1. **CandidatesPage** (Recruiter Portal) - NEW PAGE
**Location:** `src/pages/recruiter/CandidatesPage.tsx`

**Status:** ❌ Using mock data

**Required Backend Endpoints:**
```
GET /v1/recruiter/candidates
  - Query params: page, limit, job_position, status, match_score, search
  - Returns: List of candidates who applied to recruiter's jobs

GET /v1/recruiter/candidates/{candidate_id}
  - Returns: Full candidate profile with CV data

PUT /v1/recruiter/candidates/{candidate_id}/status
  - Body: { status: "New" | "Pending" | "Shortlisted" | "Rejected" | "Hired" }
  - Returns: Updated candidate

GET /v1/recruiter/jobs/{job_id}/candidates
  - Returns: All candidates for a specific job

GET /v1/recruiter/candidates/{candidate_id}/cv/download
  - Returns: CV file download
```

**Integration Tasks:**
- [ ] Create API service file: `src/services/recruiterApi.ts`
- [ ] Add candidate fetching with filters
- [ ] Add status update functionality
- [ ] Add CV download functionality
- [ ] Replace mock data with real API calls
- [ ] Add error handling and loading states
- [ ] Add pagination support

---

#### 2. **RecommendedJobs Page**
**Location:** `src/pages/RecommendedJobs.tsx`

**Status:** ❌ NOT CONNECTED

**Backend API:** Job Recommendations API (COMPLETED)
```
POST /v1/jobs/recommendations
Body: {
  cv_id?: string,
  limit?: number,
  region?: string,
  min_score?: number,
  force_refresh?: boolean
}
```

**Integration Tasks:**
- [ ] Add API call to fetch recommendations
- [ ] Display internal vs external jobs
- [ ] Show match scores and reasons
- [ ] Add filtering by score/location
- [ ] Handle cached vs fresh results
- [ ] Show credits remaining
- [ ] Add "Apply" functionality for internal jobs
- [ ] Add external job redirect

---

#### 3. **CVBuilder Page** (CV Chatbot)
**Location:** `src/pages/CVBuilder.tsx`

**Status:** ❌ NOT CONNECTED

**Backend API:** CV Chatbot WebSocket (COMPLETED)
```
WebSocket: ws://localhost:8000/ws/cv-chat/{session_id}?token={JWT}
```

**Integration Tasks:**
- [ ] Create WebSocket service: `src/services/cvChatService.ts`
- [ ] Implement WebSocket connection with auth
- [ ] Handle message types: chat_message, cv_update, status, suggested_prompts, flow_event
- [ ] Implement CV file upload via WebSocket
- [ ] Real-time CV preview updates
- [ ] Handle conversation flows (onboarding, profile_creation, cv_upload, cv_improvement)
- [ ] Add reconnection logic
- [ ] Store session_id for resume
- [ ] Handle streaming messages
- [ ] Add error handling

---

### Priority 2: Enhancements

#### 4. **SkillGapAnalysis Page**
**Location:** `src/pages/SkillGapAnalysis.tsx`

**Status:** ✅ PARTIALLY CONNECTED (needs enhancement)

**Backend API:** Skill Gap Analysis API (COMPLETED)

**Enhancement Tasks:**
- [ ] Improve error handling
- [ ] Add loading states for better UX
- [ ] Display course recommendations better
- [ ] Add "Save Analysis" feature
- [ ] Add "Export as PDF" feature
- [ ] Show historical analyses

---

#### 5. **Dashboard Page**
**Location:** `src/pages/Dashboard.tsx`

**Status:** ✅ MOSTLY CONNECTED

**Enhancement Tasks:**
- [ ] Add job recommendations widget
- [ ] Add skill gap analysis summary
- [ ] Improve automation status display
- [ ] Add recent CV activity

---

### Priority 3: New Features

#### 6. **Recruiter Dashboard**
**Location:** `src/pages/Recruiter.tsx`

**Required Backend Endpoints:**
```
GET /v1/recruiter/dashboard/stats
  - Returns: Total jobs, total applicants, pending reviews, hired count

GET /v1/recruiter/recent-applications
  - Returns: Recent applications to recruiter's jobs
```

**Integration Tasks:**
- [ ] Create recruiter dashboard API calls
- [ ] Display recruiter-specific metrics
- [ ] Show recent candidate applications
- [ ] Add quick actions

---

## 📋 IMPLEMENTATION PLAN

### Phase 1: Core Recruiter Features (Week 1)
**Goal:** Get recruiter portal fully functional

1. **Day 1-2: Recruiter API Service**
   - Create `src/services/recruiterApi.ts`
   - Implement all recruiter endpoints
   - Add TypeScript interfaces
   - Add error handling

2. **Day 3-4: CandidatesPage Integration**
   - Connect CandidatesPage to backend
   - Replace mock data
   - Test all filters and pagination
   - Add CV download

3. **Day 5: Testing & Bug Fixes**
   - Test all recruiter features
   - Fix any issues
   - Add loading states

---

### Phase 2: Job Seeker AI Features (Week 2)
**Goal:** Connect AI-powered features

1. **Day 1-2: Job Recommendations**
   - Create recommendations service
   - Connect RecommendedJobs page
   - Add filtering and sorting
   - Test internal vs external jobs

2. **Day 3-5: CV Chatbot WebSocket**
   - Create WebSocket service
   - Implement connection logic
   - Handle all message types
   - Test CV building flow
   - Add file upload
   - Test reconnection

---

### Phase 3: Enhancements (Week 3)
**Goal:** Polish and improve existing features

1. **Day 1-2: Skill Gap Analysis Enhancement**
   - Improve UI/UX
   - Add export features
   - Add history tracking

2. **Day 3-4: Dashboard Improvements**
   - Add recommendations widget
   - Add skill gap summary
   - Improve automation display

3. **Day 5: Testing & Documentation**
   - End-to-end testing
   - Update documentation
   - Create user guides

---

## 🛠️ TECHNICAL IMPLEMENTATION DETAILS

### 1. Create Recruiter API Service

**File:** `src/services/recruiterApi.ts`

```typescript
import api from '@/lib/api';

export interface Candidate {
  id: string;
  user_id: string;
  name: string;
  email: string;
  position: string;
  job_id: string;
  applied_date: string;
  location: string;
  experience: string;
  match_score: number;
  status: 'New' | 'Pending' | 'Shortlisted' | 'Rejected' | 'Hired';
  cv_id?: string;
  cv_data?: any;
}

export interface CandidatesResponse {
  candidates: Candidate[];
  total: number;
  page: number;
  limit: number;
  total_pages: number;
}

export const fetchCandidates = async (params: {
  page?: number;
  limit?: number;
  job_position?: string;
  status?: string;
  match_score?: number;
  search?: string;
}): Promise<CandidatesResponse> => {
  const response = await api.get('/v1/recruiter/candidates', { params });
  return response.data;
};

export const fetchCandidateDetails = async (candidateId: string) => {
  const response = await api.get(`/v1/recruiter/candidates/${candidateId}`);
  return response.data;
};

export const updateCandidateStatus = async (
  candidateId: string,
  status: string
) => {
  const response = await api.put(
    `/v1/recruiter/candidates/${candidateId}/status`,
    { status }
  );
  return response.data;
};

export const downloadCandidateCV = async (candidateId: string) => {
  const response = await api.get(
    `/v1/recruiter/candidates/${candidateId}/cv/download`,
    { responseType: 'blob' }
  );
  
  const url = window.URL.createObjectURL(new Blob([response.data]));
  const link = document.createElement('a');
  link.href = url;
  link.setAttribute('download', `candidate_${candidateId}_cv.pdf`);
  document.body.appendChild(link);
  link.click();
  link.remove();
};
```

---

### 2. Create Job Recommendations Service

**File:** `src/services/recommendationsApi.ts`

```typescript
import api from '@/lib/api';

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
}

export interface RecommendationsResponse {
  ok: boolean;
  recommendations: JobRecommendation[];
  total: number;
  profile_used: {
    cv_id: string;
    title: string;
    skills_count: number;
  };
  search_patterns: {
    top_keywords: string[];
    top_regions: string[];
  };
  credits_remaining: number;
  cached: boolean;
}

export const fetchJobRecommendations = async (params: {
  cv_id?: string;
  limit?: number;
  region?: string;
  min_score?: number;
  force_refresh?: boolean;
}): Promise<RecommendationsResponse> => {
  const response = await api.post('/v1/jobs/recommendations', params);
  return response.data;
};
```

---

### 3. Create CV Chatbot WebSocket Service

**File:** `src/services/cvChatService.ts`

```typescript
export class CVChatService {
  private ws: WebSocket | null = null;
  private sessionId: string;
  private token: string;
  private messageHandlers: Map<string, Function> = new Map();
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;

  constructor(sessionId: string = 'new', token: string) {
    this.sessionId = sessionId;
    this.token = token;
  }

  connect() {
    const wsUrl = `ws://localhost:8000/ws/cv-chat/${this.sessionId}?token=${this.token}`;
    this.ws = new WebSocket(wsUrl);

    this.ws.onopen = () => {
      console.log('✅ CV Chat WebSocket connected');
      this.reconnectAttempts = 0;
    };

    this.ws.onmessage = (event) => {
      const message = JSON.parse(event.data);
      this.handleMessage(message);
    };

    this.ws.onerror = (error) => {
      console.error('❌ WebSocket error:', error);
    };

    this.ws.onclose = () => {
      console.log('🔌 WebSocket closed');
      this.attemptReconnect();
    };
  }

  private handleMessage(message: any) {
    const handler = this.messageHandlers.get(message.type);
    if (handler) {
      handler(message);
    }
  }

  on(messageType: string, handler: Function) {
    this.messageHandlers.set(messageType, handler);
  }

  sendMessage(content: string, metadata = {}) {
    if (this.ws?.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify({
        type: 'message',
        content,
        metadata
      }));
    }
  }

  uploadCV(file: File) {
    const reader = new FileReader();
    reader.onload = () => {
      if (this.ws?.readyState === WebSocket.OPEN) {
        this.ws.send(reader.result as ArrayBuffer);
      }
    };
    reader.readAsArrayBuffer(file);
  }

  private attemptReconnect() {
    if (this.reconnectAttempts < this.maxReconnectAttempts) {
      this.reconnectAttempts++;
      setTimeout(() => {
        console.log(`🔄 Reconnecting... (${this.reconnectAttempts}/${this.maxReconnectAttempts})`);
        this.connect();
      }, 2000 * this.reconnectAttempts);
    }
  }

  disconnect() {
    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }
  }
}
```

---

## 🧪 TESTING CHECKLIST

### Recruiter Portal
- [ ] Fetch candidates list with pagination
- [ ] Filter by job position
- [ ] Filter by status
- [ ] Filter by match score
- [ ] Search by name
- [ ] View candidate details
- [ ] Change candidate status
- [ ] Download candidate CV
- [ ] View job details modal
- [ ] Toast notifications work

### Job Recommendations
- [ ] Fetch recommendations
- [ ] Display internal jobs
- [ ] Display external jobs
- [ ] Show match scores
- [ ] Show match reasons
- [ ] Filter by score
- [ ] Apply to internal jobs
- [ ] Redirect to external jobs
- [ ] Handle cached results
- [ ] Show credits remaining

### CV Chatbot
- [ ] WebSocket connection
- [ ] Authentication works
- [ ] Send text messages
- [ ] Receive chat messages
- [ ] Upload CV file
- [ ] CV updates in real-time
- [ ] Status messages display
- [ ] Suggested prompts work
- [ ] Flow transitions work
- [ ] Reconnection works
- [ ] Session persistence

### Skill Gap Analysis
- [ ] Analyze skills
- [ ] Show missing skills
- [ ] Display course recommendations
- [ ] Show priority levels
- [ ] Export analysis
- [ ] Credits deduction

---

## 📝 NOTES

### Environment Variables Needed
```env
VITE_API_URL=https://jobbot-production-ddd9.up.railway.app
VITE_WS_URL=ws://localhost:8000
```

### Backend Requirements
1. All recruiter endpoints must be implemented
2. WebSocket server must be running
3. Job recommendations API must be deployed
4. Proper CORS configuration
5. JWT authentication working

### Frontend Dependencies
- axios (already installed)
- @tanstack/react-query (already installed)
- WebSocket API (native browser)

---

## 🚀 DEPLOYMENT CHECKLIST

- [ ] Update API base URL for production
- [ ] Update WebSocket URL for production
- [ ] Test all features in staging
- [ ] Update environment variables
- [ ] Test authentication flow
- [ ] Test file uploads
- [ ] Monitor error logs
- [ ] Set up error tracking (Sentry)
- [ ] Create user documentation
- [ ] Train support team

---

## 📞 SUPPORT & MAINTENANCE

### Common Issues
1. **WebSocket connection fails**
   - Check token validity
   - Verify WebSocket URL
   - Check CORS settings

2. **API calls fail**
   - Verify token in localStorage
   - Check API base URL
   - Verify backend is running

3. **File uploads fail**
   - Check file size limits
   - Verify file type
   - Check backend storage

### Monitoring
- Track API response times
- Monitor WebSocket connections
- Track error rates
- Monitor credit usage
- Track user engagement

---

## ✅ SUCCESS CRITERIA

### Phase 1 Complete When:
- [ ] Recruiter can view all candidates
- [ ] Recruiter can filter candidates
- [ ] Recruiter can change candidate status
- [ ] Recruiter can download CVs
- [ ] All features work without errors

### Phase 2 Complete When:
- [ ] Job recommendations display correctly
- [ ] CV chatbot connects and works
- [ ] File uploads work
- [ ] Real-time updates work
- [ ] All AI features functional

### Phase 3 Complete When:
- [ ] All enhancements complete
- [ ] All tests passing
- [ ] Documentation updated
- [ ] User guides created
- [ ] Ready for production

---

**Last Updated:** April 10, 2026
**Status:** Ready for Implementation
**Priority:** High
