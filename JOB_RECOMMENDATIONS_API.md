# Job Recommendations API Documentation

## Endpoint
`POST /v1/jobs/recommendations`

## Authentication
Requires Bearer token in Authorization header:
```
Authorization: Bearer <jwt_token>
```

## Request Schema

### JobRecommendationRequest

| Field | Type | Required | Default | Description | Constraints |
|-------|------|----------|---------|-------------|-------------|
| `cv_id` | `string` | No | `null` | CV ID to use for recommendations (defaults to user's primary CV) | - |
| `limit` | `integer` | No | `20` | Number of recommendations to return | 1-100 |
| `region` | `string` | No | `null` | Override region preference | - |
| `min_score` | `integer` | No | `30` | Minimum match score threshold | 0-100 |
| `force_refresh` | `boolean` | No | `false` | Force cache bypass and fetch fresh results | - |

### Request Body Example

```json
{
  "cv_id": "550e8400-e29b-41d4-a716-446655440000",
  "limit": 20,
  "region": "United States",
  "min_score": 30,
  "force_refresh": false
}
```

### Minimal Request Example

```json
{}
```

This will use default values:
- Uses user's most recent CV
- Returns 20 recommendations
- Uses region from search history
- Minimum score of 30
- Uses cached results if available

---

## Response Schema

### JobRecommendationsResponse

| Field | Type | Description |
|-------|------|-------------|
| `ok` | `boolean` | Request success status |
| `recommendations` | `Array<JobRecommendation>` | List of recommended jobs |
| `total` | `integer` | Total number of recommendations returned |
| `profile_used` | `object` | Profile information used for recommendations |
| `search_patterns` | `object` | Search patterns extracted from history |
| `credits_remaining` | `integer` | Remaining credits after deduction (cost: 3 credits) |
| `cached` | `boolean` | Whether results were served from cache |

### JobRecommendation

| Field | Type | Description |
|-------|------|-------------|
| `id` | `string` | Job ID |
| `title` | `string` | Job title |
| `company` | `string \| null` | Company name |
| `location` | `string \| null` | Job location |
| `snippet` | `string \| null` | Job description snippet |
| `url` | `string \| null` | Job application URL |
| `score` | `integer` | Recommendation score (0-100) |
| `match_reasons` | `Array<string>` | Reasons why this job matches |
| `source` | `string` | Job source (jooble, adzuna, gulftalent, internal) |
| `is_internal` | `boolean` | Whether this is an internal job posted by recruiters on the platform |

### Profile Used Object

```typescript
{
  "cv_id": string,
  "title": string,
  "skills_count": number
}
```

### Search Patterns Object

```typescript
{
  "top_keywords": Array<string>,
  "top_regions": Array<string>
}
```

---

## Sample Request

### Request 1: Full Request with All Parameters

```bash
curl -X POST "https://your-api.com/v1/jobs/recommendations" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "cv_id": "550e8400-e29b-41d4-a716-446655440000",
    "limit": 20,
    "region": "United States",
    "min_score": 30,
    "force_refresh": false
  }'
```

### Request 2: Minimal Request (Uses Defaults)

```bash
curl -X POST "https://your-api.com/v1/jobs/recommendations" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{}'
```

### Request 3: Force Fresh Results

```bash
curl -X POST "https://your-api.com/v1/jobs/recommendations" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "limit": 50,
    "min_score": 40,
    "force_refresh": true
  }'
```

---

## Sample Response

### Success Response (Fresh Results)

```json
{
  "ok": true,
  "recommendations": [
    {
      "id": "internal-550e8400-e29b-41d4-a716-446655440001",
      "title": "Senior Software Engineer",
      "company": "Tech Corp Inc.",
      "location": "San Francisco, CA, United States",
      "snippet": "We are looking for a Senior Software Engineer with 5+ years of experience in Python, React, and Node.js. You will work on cutting-edge web applications...",
      "url": "/v1/company-jobs/550e8400-e29b-41d4-a716-446655440001",
      "score": 89,
      "match_reasons": [
        "Strong skill match (87% match)",
        "Posted by recruiter on our platform",
        "Matches your search history: software engineer, python developer",
        "Preferred location: United States",
        "Posted recently (last 7 days)"
      ],
      "source": "internal",
      "is_internal": true
    },
    {
      "id": "job-12345",
      "title": "Full Stack Developer",
      "company": "StartupXYZ",
      "location": "Remote, United States",
      "snippet": "Join our team as a Full Stack Developer. We need someone skilled in React, TypeScript, and Node.js. Experience with AWS and Docker is a plus...",
      "url": "https://example.com/jobs/full-stack-developer-12346",
      "score": 82,
      "match_reasons": [
        "Strong skill match (78% match)",
        "Matches your search history: software engineer",
        "Preferred location: United States",
        "Posted recently (last 7 days)"
      ],
      "source": "jooble",
      "is_internal": false
    },
    {
      "id": "internal-550e8400-e29b-41d4-a716-446655440002",
      "title": "Python Backend Engineer",
      "company": "DataTech Solutions",
      "location": "New York, NY, United States",
      "snippet": "Python Backend Engineer position. Requirements: Python, FastAPI, PostgreSQL, Redis. Experience with microservices architecture preferred...",
      "url": "/v1/company-jobs/550e8400-e29b-41d4-a716-446655440002",
      "score": 79,
      "match_reasons": [
        "Good skill match (72% match)",
        "Posted by recruiter on our platform",
        "Matches your search history: python developer",
        "Preferred location: United States",
        "Posted recently (last 30 days)"
      ],
      "source": "internal",
      "is_internal": true
    },
    {
      "id": "job-12347",
      "title": "React Developer",
      "company": "WebDev Corp",
      "location": "Austin, TX, United States",
      "snippet": "React Developer position. Requirements: React, JavaScript, TypeScript, Redux. Experience with Next.js is a plus...",
      "url": "https://example.com/jobs/react-developer-12347",
      "score": 75,
      "match_reasons": [
        "Good skill match (68% match)",
        "Matches your search history: software engineer",
        "Preferred location: United States",
        "Posted recently (last 30 days)"
      ],
      "source": "adzuna",
      "is_internal": false
    }
  ],
  "total": 4,
  "profile_used": {
    "cv_id": "550e8400-e29b-41d4-a716-446655440000",
    "title": "Software Developer",
    "skills_count": 15
  },
  "search_patterns": {
    "top_keywords": [
      "software engineer",
      "python developer",
      "full stack developer"
    ],
    "top_regions": [
      "United States",
      "Remote"
    ]
  },
  "credits_remaining": 97,
  "cached": false
}
```

### Success Response (Cached Results)

```json
{
  "ok": true,
  "recommendations": [
    {
      "id": "internal-550e8400-e29b-41d4-a716-446655440001",
      "title": "Senior Software Engineer",
      "company": "Tech Corp Inc.",
      "location": "San Francisco, CA, United States",
      "snippet": "We are looking for a Senior Software Engineer...",
      "url": "/v1/company-jobs/550e8400-e29b-41d4-a716-446655440001",
      "score": 87,
      "match_reasons": [
        "Strong skill match (85% match)",
        "Posted by recruiter on our platform",
        "Matches your search history: software engineer"
      ],
      "source": "internal",
      "is_internal": true
    },
    {
      "id": "job-12345",
      "title": "Full Stack Developer",
      "company": "StartupXYZ",
      "location": "Remote, United States",
      "snippet": "Join our team as a Full Stack Developer...",
      "url": "https://example.com/jobs/full-stack-developer-12346",
      "score": 82,
      "match_reasons": [
        "Strong skill match (78% match)",
        "Matches your search history: software engineer"
      ],
      "source": "jooble",
      "is_internal": false
    }
  ],
  "total": 2,
  "profile_used": {
    "cv_id": "550e8400-e29b-41d4-a716-446655440000",
    "title": "Software Developer",
    "skills_count": 15
  },
  "search_patterns": {
    "top_keywords": [
      "software engineer",
      "python developer"
    ],
    "top_regions": [
      "United States"
    ]
  },
  "credits_remaining": 97,
  "cached": true
}
```

### Empty Results Response

```json
{
  "ok": true,
  "recommendations": [],
  "total": 0,
  "profile_used": {
    "cv_id": "550e8400-e29b-41d4-a716-446655440000",
    "title": "Software Developer",
    "skills_count": 15
  },
  "search_patterns": {
    "top_keywords": [],
    "top_regions": []
  },
  "credits_remaining": 97,
  "cached": false
}
```

---

## Error Responses

### 400 Bad Request - No CV Found

```json
{
  "detail": "No CV found. Please upload and parse a CV first to get personalized recommendations."
}
```

### 401 Unauthorized - Invalid Token

```json
{
  "detail": "Invalid or expired token"
}
```

### 402 Payment Required - Insufficient Credits

```json
{
  "detail": "Insufficient credits. You need 3 credits but have 1. Please upgrade your plan."
}
```

### 404 Not Found - Profile Not Found

```json
{
  "detail": "Profile not found"
}
```

### 500 Internal Server Error

```json
{
  "detail": "Failed to get recommendations: <error_message>"
}
```

---

## Scoring Algorithm

The recommendation score is calculated using **equal weights (25% each)**:

1. **CV Match Score (25%)**: Semantic similarity + keyword overlap + title overlap
2. **Search History Relevance (25%)**: Based on keyword matches from search history
3. **Location Preference (25%)**: Prioritizes regions from search history
4. **Recency Boost (25%)**: 
   - Last 7 days: +25 points
   - Last 30 days: +15 points
   - Older: +5 points

---

## Credit System

- **Cost**: 3 credits per request
- Credits are deducted even for cached results
- If insufficient credits, returns 402 error

---

## Caching

- Results are cached for **4 hours** per user
- Cache key is based on: `user_id + cv_id + search_patterns_hash`
- Use `force_refresh: true` to bypass cache
- Cache hit still deducts credits

---

## Internal vs External Jobs

The recommendation engine returns both **internal** and **external** jobs:

### Internal Jobs (`is_internal: true`)
- Posted by recruiters directly on your platform
- Stored in the `companyjobs` table
- Have `source: "internal"`
- URLs format: `/v1/company-jobs/{job_id}`
- Automatically excluded if user has already applied
- May include additional match reasons like "Posted by recruiter on our platform"
- Job ID format: `internal-{job_id}`

### External Jobs (`is_internal: false`)
- Fetched from external job aggregators (Jooble, Adzuna, GulfTalent)
- Have `source: "jooble"`, `"adzuna"`, or `"gulftalent"`
- URLs point to external job posting pages
- Deduplicated by URL

Both types are scored using the same algorithm and merged into a single sorted list by recommendation score.

---

## Notes

- If no `cv_id` is provided, uses the user's most recent CV
- If no search history exists, uses CV data only with neutral location score
- Maximum 2 jobs per company to ensure diversity
- Jobs are deduplicated by URL (external) or ID (internal)
- Only jobs with score >= `min_score` are returned
- **Internal jobs**: Jobs posted by recruiters on the platform are included in recommendations
- **Internal job URLs**: Use the format `/v1/company-jobs/{job_id}` for internal jobs
- **Applied jobs**: Jobs the user has already applied to are automatically excluded
- **Job sources**: Recommendations include both external jobs (Jooble, Adzuna, GulfTalent) and internal jobs (posted by recruiters)
- **Internal job benefits**: Internal jobs may have additional match reasons like "Posted by recruiter on our platform"

