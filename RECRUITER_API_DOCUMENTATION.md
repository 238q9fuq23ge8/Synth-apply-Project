# Recruiter Module - Frontend to Backend API Documentation

## Base Configuration

- **Base URL**: `https://jobbot-production-ddd9.up.railway.app` (or your deployed backend URL)
- **Authentication**: Bearer token in `Authorization` header
- **Content-Type**: `application/json`

---

## Authentication Headers

All endpoints require authentication. Include the token in the request headers:

```javascript
{
  headers: {
    "Authorization": `Bearer ${access_token}`,
    "Content-Type": "application/json"
  }
}
```

---

## API Endpoints Summary

### 1. Dashboard & Analytics

| Frontend Need | Endpoint | Method | Description |
|---------------|----------|--------|-------------|
| Get dashboard metrics | `/v1/recruiter/analytics` | GET | Returns total jobs, active jobs, candidates count, hired count |
| Get recruiter jobs | `/v1/recruiter/jobs` | GET | Returns all jobs posted by recruiter |
| Get weekly stats | `/v1/dashboard/analytics` | GET | Returns weekly application stats for charts |
| Get credit balance | `/v1/credits/balance` | GET | Returns current credits and plan info |

**Request Example:**
```javascript
// GET /v1/recruiter/analytics
const response = await fetch('/v1/recruiter/analytics', {
  headers: { Authorization: `Bearer ${token}` }
});
const data = await response.json();
// Returns: { total_jobs, active_jobs, total_candidates, candidates_in_review, candidates_added_today, hired }
```

---

### 2. Jobs Management

| Frontend Need | Endpoint | Method | Description |
|---------------|----------|--------|-------------|
| Create new job | `/v1/recruiter/jobs/json` | POST | Post a new job |
| Get all my jobs | `/v1/recruiter/jobs` | GET | List all jobs with pagination |
| Get job details | `/v1/recruiter/jobs/{job_id}` | GET | Get specific job details |
| Delete/archive job | `/v1/recruiter/jobs/{job_id}` | DELETE | Soft delete a job (set is_active=false) |
| Get job public link | `/v1/recruiter/jobs/{job_id}/public-link` | GET | Get shareable public URL |

**Request Example:**
```javascript
// POST /v1/recruiter/jobs/json
const response = await fetch('/v1/recruiter/jobs/json', {
  method: 'POST',
  headers: {
    Authorization: `Bearer ${token}`,
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    title: "Product Designer",
    description: "Job description here",
    skills: ["Figma", "UI/UX"],
    duration_days: 30
  })
});

// GET /v1/recruiter/jobs?page=1&page_size=20&status=active
const jobs = await fetch('/v1/recruiter/jobs?page=1&status=active', {
  headers: { Authorization: `Bearer ${token}` }
}).then(r => r.json());
// Returns: { ok: true, jobs: [...], page: 1 }
```

---

### 3. Applications/Candidates Management

| Frontend Need | Endpoint | Method | Description |
|---------------|----------|--------|-------------|
| Get job applicants | `/v1/recruiter/jobs/{job_id}/applications` | GET | Get all applicants for a job |
| Get application details | `/v1/recruiter/applications/{app_id}` | GET | Get specific applicant with CV data |
| Update applicant status | `/v1/recruiter/applications/{app_id}` | PATCH | Update status (pending, reviewing, shortlisted, rejected, hired) |
| View candidate CV | `/v1/cv/{cv_id}` | GET | Get parsed CV data |

**Request Example:**
```javascript
// GET /v1/recruiter/jobs/{job_id}/applications
const applicants = await fetch('/v1/recruiter/jobs/{job_id}/applications?page=1', {
  headers: { Authorization: `Bearer ${token}` }
}).then(r => r.json());
// Returns: { ok: true, applications: [...], total: 10 }

// PATCH /v1/recruiter/applications/{app_id}
await fetch('/v1/recruiter/applications/{app_id}', {
  method: 'PATCH',
  headers: {
    Authorization: `Bearer ${token}`,
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    status: "shortlisted",  // pending, reviewing, shortlisted, rejected, hired
    notes: "Great candidate for UX role"
  })
});

// GET /v1/cv/{cv_id}
const cvData = await fetch('/v1/cv/{cv_id}', {
  headers: { Authorization: `Bearer ${token}` }
}).then(r => r.json());
// Returns: { ok: true, parsed: { name, title, email, ... }, extracted_skills: [...] }
```

---

### 4. Profile Management

| Frontend Need | Endpoint | Method | Description |
|---------------|----------|--------|-------------|
| Get current profile | `/v1/profile/me` | POST | Get user profile with credits |
| Update profile | (Use profile form) | PUT | Update recruiter profile |
| Upload company logo | `/v1/recruiter/upload-logo` | POST | Upload company logo to storage |

**Request Example:**
```javascript
// POST /v1/profile/me
const profile = await fetch('/v1/profile/me', {
  method: 'POST',
  headers: { Authorization: `Bearer ${token}` }
}).then(r => r.json());
// Returns: { user_id, email, plan, credits_total, remaining_credits, person, is_admin }

// POST /v1/recruiter/upload-logo
const formData = new FormData();
formData.append('logo', file);
await fetch('/v1/recruiter/upload-logo', {
  method: 'POST',
  headers: { Authorization: `Bearer ${token}` },
  body: formData
});
```

---

### 5. Payments & Credits

| Frontend Need | Endpoint | Method | Description |
|---------------|----------|--------|-------------|
| Create checkout session | `/v1/payments/create-checkout-session` | POST | Create Stripe checkout for credits |
| Get credit balance | `/v1/credits/balance` | GET | Get current credits |
| Get credit history | `/v1/credits/history` | GET | Get transaction history |
| Get subscription status | `/v1/profile/me` | POST | Check current plan |

**Request Example:**
```javascript
// POST /v1/payments/create-checkout-session
const checkout = await fetch('/v1/payments/create-checkout-session', {
  method: 'POST',
  headers: {
    Authorization: `Bearer ${token}`,
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    price_id: "price_1TM9mXFoAJbgGUkWTAUkpp96"  // 700 credits
    // price_id options:
    // - price_1TM9mXFoAJbgGUkWTAUkpp96 = 700 credits (AED 49.99)
    // - price_1TM9p0FoAJbgGUkWl9lZRcmF = 1400 credits (AED 79.99)
    // - price_1TM9pyFoAJbgGUkWVO2sCOSO = 3000 credits (AED 199.99)
  })
}).then(r => r.json());
// Returns: { ok: true, session_url: "https://checkout.stripe.com/...", session_id: "..." }

// Redirect to Stripe checkout
window.location.href = checkout.session_url;
```

---

### 6. User Role Management

| Frontend Need | Endpoint | Method | Description |
|---------------|----------|--------|-------------|
| Become recruiter | `/v1/make_recruiter` | POST | Convert user to recruiter role |
| Set user role | `/v1/profile/set-role` | POST | Switch between job_seeker/recruiter/cv_builder |

**Request Example:**
```javascript
// POST /v1/make_recruiter
await fetch('/v1/make_recruiter', {
  method: 'POST',
  headers: { Authorization: `Bearer ${token}` }
});

// POST /v1/profile/set-role
await fetch('/v1/profile/set-role', {
  method: 'POST',
  headers: {
    Authorization: `Bearer ${token}`,
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({ person: "recruiter" })
});
```

---

## Frontend Page to API Mapping

### 1. Recruiter Dashboard (`/recruiter`) - `src/pages/Recruiter.tsx`

**API Calls Needed:**
```javascript
// On component mount
useEffect(() => {
  const fetchDashboardData = async () => {
    // 1. Get analytics (metrics)
    const analytics = await api.get('/v1/recruiter/analytics', { headers: { Authorization: `Bearer ${token}` } });
    // analytics.data = { total_jobs, active_jobs, total_candidates, candidates_in_review, candidates_added_today, hired }

    // 2. Get jobs list
    const jobs = await api.get('/v1/recruiter/jobs', { params: { page: 1, page_size: 10 }, headers: { Authorization: `Bearer ${token}` } });

    // 3. Get credits
    const credits = await api.get('/v1/credits/balance', { headers: { Authorization: `Bearer ${token}` } });

    // 4. Get profile
    const profile = await api.post('/v1/profile/me', {}, { headers: { Authorization: `Bearer ${token}` } });
  };
  fetchDashboardData();
}, []);
```

**Dashboard Metrics from `/v1/recruiter/analytics`:**
- `total_jobs` - Total job postings
- `active_jobs` - Active job postings
- `total_candidates` - Total applicants
- `candidates_in_review` - Applications in review
- `candidates_added_today` - New candidates today
- `hired` - Hired candidates count
- `applications_by_status` - Breakdown by status

---

### 2. My Jobs (Job List)

**API Calls Needed:**
```javascript
// GET /v1/recruiter/jobs
const response = await api.get('/v1/recruiter/jobs', {
  params: { page: 1, page_size: 20, status: 'active' },
  headers: { Authorization: `Bearer ${token}` }
});
// Returns: { ok: true, jobs: [{ id, title, description, is_active, created_at, application_count, ... }] }
```

---

### 3. Create Job Form (`src/pages/JobPostForm.tsx`)

**API Call:**
```javascript
// POST /v1/recruiter/jobs/json
const response = await api.post('/v1/recruiter/jobs/json', {
  title: jobTitle,
  description: jobDescription,
  skills: skills.split(',').map(s => s.trim()),
  duration_days: parseInt(duration)
}, {
  headers: { Authorization: `Bearer ${token}` }
});
// Returns: { ok: true, message: "Job posted successfully", job: { ... } }
```

---

### 4. Candidates/Applicants List

**API Calls:**
```javascript
// GET /v1/recruiter/jobs/{job_id}/applications
const response = await api.get(`/v1/recruiter/jobs/${jobId}/applications`, {
  params: { page: 1, page_size: 20 },
  headers: { Authorization: `Bearer ${token}` }
});
// Returns: { ok: true, applications: [{ id, user_id, job_id, status, score, cv_id, ... }] }

// GET /v1/recruiter/applications/{application_id} - for detailed view
const detail = await api.get(`/v1/recruiter/applications/${appId}`, {
  headers: { Authorization: `Bearer ${token}` }
});
// Returns: { ok: true, application: {...}, job: {...}, candidate: { user_id, email, cv: {...} } }

// PATCH /v1/recruiter/applications/{application_id} - update status
await api.patch(`/v1/recruiter/applications/${appId}`, {
  status: 'shortlisted', // pending, reviewing, shortlisted, rejected, hired
  notes: 'Optional notes'
}, {
  headers: { Authorization: `Bearer ${token}` }
});
```

---

### 5. Archived Jobs (`/recruiter-archived-jobs`)

**API Calls:**
```javascript
// GET /v1/recruiter/jobs?status=inactive
const archivedJobs = await api.get('/v1/recruiter/jobs', {
  params: { status: 'inactive' },
  headers: { Authorization: `Bearer ${token}` }
});
```

---

### 6. Profile Page

**API Calls:**
```javascript
// GET /v1/profile/me
const profile = await api.post('/v1/profile/me', {}, {
  headers: { Authorization: `Bearer ${token}` }
});
// Returns: { user_id, email, plan, credits_total, remaining_credits, person, is_admin }

// POST /v1/recruiter/upload-logo
const formData = new FormData();
formData.append('file', logoFile);
await api.post('/v1/recruiter/upload-logo', formData, {
  headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'multipart/form-data' }
});
```

---

### 7. Plans/Credits Purchase

**API Calls:**
```javascript
// GET credit balance
const balance = await api.get('/v1/credits/balance', {
  headers: { Authorization: `Bearer ${token}` }
});

// Create checkout session
const checkout = await api.post('/v1/payments/create-checkout-session', {
  price_id: 'price_1TM9mXFoAJbgGUkWTAUkpp96' // Use correct price ID
}, {
  headers: { Authorization: `Bearer ${token}` }
});

// Redirect to Stripe
window.location.href = checkout.data.session_url;
```

**Price IDs:**
- Basic (700 credits): `price_1TM9mXFoAJbgGUkWTAUkpp96` - AED 49.99
- Premium (1400 credits): `price_1TM9p0FoAJbgGUkWl9lZRcmF` - AED 79.99
- Recruiter (3000 credits): `price_1TM9pyFoAJbgGUkWVO2sCOSO` - AED 199.99

---

### 8. View Candidate CV

**API Calls:**
```javascript
// GET /v1/cv/{cv_id}
const cv = await api.get(`/v1/cv/${cvId}`, {
  headers: { Authorization: `Bearer ${token}` }
});
// Returns: { ok: true, parsed: { name, title, email, phone, education, experience, skills: [] }, extracted_skills: [] }
```

---

## Real-time Updates

For real-time functionality, consider implementing:

1. **Polling** - Refresh data every 30-60 seconds
2. **SSE (Server-Sent Events)** - Use `/v1/sse/stream` for live updates
3. **WebSocket** - For instant notifications

Example polling:
```javascript
// Poll every 30 seconds
useEffect(() => {
  const fetchData = () => {
    api.get('/v1/recruiter/analytics', { headers: { Authorization: `Bearer ${token}` } })
      .then(setData);
  };

  fetchData(); // Initial fetch
  const interval = setInterval(fetchData, 30000); // Poll every 30s

  return () => clearInterval(interval);
}, []);
```

---

## Error Handling

All API errors return the following format:
```javascript
{
  "detail": "Error message description"
}
```

Common status codes:
- `200` - Success
- `400` - Bad Request (invalid data)
- `401` - Unauthorized (invalid/missing token)
- `403` - Forbidden (no access)
- `404` - Not Found
- `500` - Server Error

---

## Testing with cURL

```bash
# Test analytics endpoint
curl -X GET "https://jobbot-production-ddd9.up.railway.app/v1/recruiter/analytics" \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"

# Test get jobs
curl -X GET "https://jobbot-production-ddd9.up.railway.app/v1/recruiter/jobs?page=1&status=active" \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"

# Test create job
curl -X POST "https://jobbot-production-ddd9.up.railway.app/v1/recruiter/jobs/json" \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"title": "Product Designer", "description": "Looking for a UI/UX designer", "skills": ["Figma", "UI"], "duration_days": 30}'
```

---

## Quick Reference - All Recruiter Endpoints

| Endpoint | Method | Auth | Description |
|----------|--------|------|-------------|
| `/v1/recruiter/analytics` | GET | Yes | Dashboard metrics |
| `/v1/recruiter/jobs` | GET | Yes | List all jobs |
| `/v1/recruiter/jobs` | POST | Yes | Create job (form) |
| `/v1/recruiter/jobs/json` | POST | Yes | Create job (JSON) |
| `/v1/recruiter/jobs/{job_id}` | GET | Yes | Get job details |
| `/v1/recruiter/jobs/{job_id}` | DELETE | Yes | Delete/archive job |
| `/v1/recruiter/jobs/{job_id}/applications` | GET | Yes | Get job applicants |
| `/v1/recruiter/jobs/{job_id}/public-link` | GET | Yes | Get shareable link |
| `/v1/recruiter/applications/{app_id}` | GET | Yes | Get applicant details |
| `/v1/recruiter/applications/{app_id}` | PATCH | Yes | Update applicant status |
| `/v1/cv/{cv_id}` | GET | Yes | Get candidate CV |
| `/v1/profile/me` | POST | Yes | Get user profile |
| `/v1/profile/set-role` | POST | Yes | Change user role |
| `/v1/make_recruiter` | POST | Yes | Become recruiter |
| `/v1/recruiter/upload-logo` | POST | Yes | Upload company logo |
| `/v1/credits/balance` | GET | Yes | Get credit balance |
| `/v1/payments/create-checkout-session` | POST | Yes | Create Stripe checkout |

---

## Notes for Frontend Developer

1. **Token Storage**: Store `access_token` in localStorage after login
2. **Headers**: Always include `Authorization: Bearer ${token}` header
3. **Error Handling**: Check for 401/403 to redirect to login
4. **Loading States**: Show loading spinners while API calls are in progress
5. **Pagination**: Use `page` and `page_size` params for list endpoints
6. **Status Values**: Application statuses are: `pending`, `reviewing`, `shortlisted`, `rejected`, `hired`
7. **Job Status**: Job is_active can be `true` (active) or `false` (archived)

---

*Document generated for Frontend Developer - Scope AI Recruiter Module*