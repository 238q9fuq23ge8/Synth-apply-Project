
### 1. GET /v1/admin/metrics/overview

Dashboard overview with high-level KPIs.

**Response:**
```json
{
  "total_users": 150,
  "new_users_today": 5,
  "new_users_week": 23,
  "new_users_month": 67,
  "total_revenue": 1234.50,
  "active_trials": 45,
  "paid_users": 105,
  "total_automations": 320,
  "total_applications": 4567
}
```

### 2. GET /v1/admin/metrics/users

Detailed user analytics and segmentation.

**Response:**
```json
{
  "total_users": 150,
  "job_seekers": 120,
  "recruiters": 30,
  "trial_users": 45,
  "paid_users": 105,
  "users_with_cvs": 110,
  "avg_cvs_per_user": 1.8,
  "avg_applications_per_user": 30.4,
  "growth_data": {
    "2025-10-31": 5,
    "2025-10-30": 3,
    "2025-10-29": 7
    // ... last 30 days
  }
}
```

### 3. GET /v1/admin/metrics/revenue

Revenue and payment analytics.

**Response:**
```json
{
  "total_revenue": 1234.50,
  "revenue_today": 45.00,
  "revenue_week": 340.00,
  "revenue_month": 890.00,
  "revenue_by_package": {
    "100_credits": {
      "count": 34,
      "revenue": 170.00
    },
    "500_credits": {
      "count": 28,
      "revenue": 560.00
    },
    "1000_credits": {
      "count": 17,
      "revenue": 510.00
    },
    "other": {
      "count": 0,
      "revenue": 0.00
    }
  },
  "total_credits_sold": 45600,
  "arpu": 8.23
}
```

**Note on Pricing:**
- The system uses approximate pricing: $5 per 100 credits, $20 per 500 credits, $30 per 1000 credits
- You can adjust the `calculate_price_from_credits()` function in `routers/admin.py` to match your actual Stripe prices

### 4. GET /v1/admin/metrics/system

System usage and health metrics.

**Response:**
```json
{
  "total_credits_purchased": 50000,
  "total_credits_consumed": 23400,
  "credits_remaining": 26600,
  "total_automation_runs": 320,
  "successful_runs": 285,
  "failed_runs": 35,
  "automation_success_rate": 89.06,
  "total_job_searches": 1240,
  "total_cvs_uploaded": 270,
  "total_applications": 4567
}
```

### 5. GET /v1/admin/users

List all users with pagination and filtering.

**Query Parameters:**
- `page` (int, default: 1) - Page number
- `limit` (int, default: 50, max: 100) - Items per page
- `plan` (string, optional) - Filter by plan: "free_trial", "pro", "premium"
- `person` (string, optional) - Filter by person type: "job_seeker", "recruiter"
- `search` (string, optional) - Search by email or name

**Example Requests:**
```bash
# Get first page of users
GET /v1/admin/users?page=1&limit=50

# Filter by plan
GET /v1/admin/users?plan=free_trial

# Filter by person type
GET /v1/admin/users?person=job_seeker

# Search by email or name
GET /v1/admin/users?search=john

# Combine filters
GET /v1/admin/users?plan=free_trial&person=job_seeker&page=2&limit=25
```

**Response:**
```json
{
  "users": [
    {
      "user_id": "uuid-here",
      "email": "user@example.com",
      "name": "John Doe",
      "person": "job_seeker",
      "plan": "free_trial",
      "credits": 85,
      "is_admin": false,
      "trial_ends_at": "2025-11-07T12:00:00Z",
      "created_at": "2025-10-31T10:30:00Z"
    }
  ],
  "total": 150,
  "page": 1,
  "limit": 50,
  "total_pages": 3
}
```

## Security Considerations

1. **Admin Access Control**: Only users with `is_admin=true` can access these endpoints
2. **Service Role**: All admin queries use the Supabase service role for full database access
3. **Read-Only**: All endpoints are GET requests and do not modify data
4. **Token Validation**: Standard JWT authentication is required

## Error Responses

### 401 Unauthorized
```json
{
  "detail": "Not authenticated"
}
```

### 403 Forbidden
```json
{
  "detail": "Access denied. Admin privileges required."
}
```

### 404 Not Found
```json
{
  "detail": "Profile not found"
}
```
