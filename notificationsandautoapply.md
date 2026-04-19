
---

## 2. Notifications API

### Overview

The notifications system provides in-app notifications for job updates, automation status, and account events. All endpoints require authentication.

---

### 2.1 Get Notifications

Fetch paginated notifications for the authenticated user.

**Endpoint:** `GET /v1/notifications`

**Authentication:** Required

**Query Parameters:**
| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `status` | string | `null` | Filter by status: `unread`, `read`, `archived` |
| `limit` | number | `20` | Results per page (1-100) |
| `offset` | number | `0` | Pagination offset |

**Response:**
```json
{
  "ok": true,
  "notifications": [
    {
      "id": "uuid",
      "type": "automation_completed",
      "title": "Automation Complete! 🚀",
      "message": "Your automation has completed. Applied to 5 job(s).",
      "action_url": "/my-applications",
      "action_label": "View Applications",
      "priority": "medium",
      "status": "unread",
      "metadata": {},
      "created_at": "2025-01-09T12:00:00Z",
      "read_at": null,
      "expires_at": null
    }
  ],
  "unread_count": 5,
  "pagination": {
    "limit": 20,
    "offset": 0,
    "has_more": true
  }
}
```

**Frontend Implementation:**
```typescript
interface Notification {
  id: string;
  type: string;
  title: string;
  message: string;
  action_url?: string;
  action_label?: string;
  priority: 'low' | 'medium' | 'high' | 'critical';
  status: 'unread' | 'read' | 'archived';
  metadata: Record<string, any>;
  created_at: string;
  read_at?: string;
}

interface NotificationsResponse {
  ok: boolean;
  notifications: Notification[];
  unread_count: number;
  pagination: {
    limit: number;
    offset: number;
    has_more: boolean;
  };
}

async function getNotifications(
  status?: string,
  limit = 20,
  offset = 0
): Promise<NotificationsResponse> {
  const params = new URLSearchParams();
  if (status) params.set('status', status);
  params.set('limit', limit.toString());
  params.set('offset', offset.toString());

  const response = await fetch(
    `${API_BASE}/v1/notifications?${params}`,
    {
      headers: { 'Authorization': `Bearer ${getToken()}` }
    }
  );

  if (!response.ok) throw new Error('Failed to fetch notifications');
  return response.json();
}
```

---

### 2.2 Get Unread Count

Get the count of unread notifications for badge display.

**Endpoint:** `GET /v1/notifications/unread-count`

**Authentication:** Required

**Response:**
```json
{
  "ok": true,
  "unread_count": 5
}
```

**Frontend Implementation:**
```typescript
async function getUnreadCount(): Promise<number> {
  const response = await fetch(
    `${API_BASE}/v1/notifications/unread-count`,
    {
      headers: { 'Authorization': `Bearer ${getToken()}` }
    }
  );

  if (!response.ok) throw new Error('Failed to fetch unread count');
  const data = await response.json();
  return data.unread_count;
}
```

**React Hook for Polling:**
```typescript
const POLL_INTERVAL = 30000; // 30 seconds

export function useUnreadCount() {
  const [count, setCount] = useState(0);

  useEffect(() => {
    const fetchCount = async () => {
      try {
        const count = await getUnreadCount();
        setCount(count);
      } catch (err) {
        console.error('Failed to fetch unread count:', err);
      }
    };

    fetchCount();
    const interval = setInterval(fetchCount, POLL_INTERVAL);
    return () => clearInterval(interval);
  }, []);

  return count;
}
```

---

### 2.3 Mark Notification as Read

Mark a specific notification as read.

**Endpoint:** `PATCH /v1/notifications/{notification_id}/read`

**Authentication:** Required

**Response:**
```json
{
  "ok": true,
  "message": "Notification marked as read"
}
```

**Error Response (404):**
```json
{
  "detail": "Notification not found or already read"
}
```

---

### 2.4 Mark All as Read

Mark all unread notifications as read.

**Endpoint:** `PATCH /v1/notifications/read-all`

**Authentication:** Required

**Response:**
```json
{
  "ok": true,
  "marked_count": 5,
  "message": "Marked 5 notification(s) as read"
}
```

---

### 2.5 Delete Notification

Delete a specific notification.

**Endpoint:** `DELETE /v1/notifications/{notification_id}`

**Authentication:** Required

**Response:**
```json
{
  "ok": true,
  "message": "Notification deleted"
}
```

---

### 2.6 Notification Types

| Type | Title Pattern | Priority | Actionable |
|------|---------------|----------|------------|
| `new_job_match` | New {Role} Jobs Found! 💼 | medium | View Jobs |
| `job_application_sent` | Application Sent! 🎉 | low | None |
| `application_status_update` | Application Status Updated | high | View Details |
| `daily_limit_reached` | Daily Limit Reached ⚠️ | high | Upgrade Plan |
| `new_recommended_job` | New Job Recommendation | medium | View Jobs |
| `automation_started` | Automation Started | low | View Status |
| `automation_completed` | Automation Complete! 🚀 | medium | View Results |
| `automation_failed` | Automation Failed ❌ | high | Retry |
| `email_verification_required` | Verify Your Email 📧 | high | Verify Now |
| `email_verified` | Email Verified ✅ | low | None |
| `plan_upgraded` | Plan Upgraded! 🎉 | medium | View Dashboard |
| `credits_low` | Low Credits Warning ⚠️ | medium | Buy Credits |
| `trial_ending` | Trial Ending in X Days ⏰ | medium | Upgrade Now |
| `trial_expired` | Trial Expired ⏰ | high | Upgrade Now |

---

### 2.7 UI Component Example

**Notification Bell with Badge:**
```typescript
import { Bell } from 'lucide-react';
import { useUnreadCount } from '@/hooks/useNotifications';

export function NotificationBell() {
  const unreadCount = useUnreadCount();

  return (
    <button className="relative p-2">
      <Bell className="w-5 h-5" />
      {unreadCount > 0 && (
        <span className="absolute top-0 right-0 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
          {unreadCount > 99 ? '99+' : unreadCount}
        </span>
      )}
    </button>
  );
}
```

---

## 3. Daily Application Limits

### Overview

Free users are limited to 5 automated job applications per day. Paid users (pro/premium/recruiter) and admins have unlimited applications. Limits reset at midnight UTC.

---

### 3.1 Get Application Limits

Get current daily application limits and usage for the authenticated user.

**Endpoint:** `GET /v1/automation/application-limits`

**Authentication:** Required

**Response (Free User):**
```json
{
  "ok": true,
  "can_proceed": true,
  "remaining": 3,
  "current_count": 2,
  "daily_limit": 5,
  "plan": "free_trial",
  "unlimited": false,
  "is_admin": false,
  "reset_time": "2025-01-10T00:00:00Z",
  "reset_in_hours": 8.5,
  "features": {
    "daily_applications": {
      "enabled": true,
      "limit": 5,
      "used": 2,
      "remaining": 3,
      "resets_at": "2025-01-10T00:00:00Z"
    }
  }
}
```

**Response (Paid User - Unlimited):**
```json
{
  "ok": true,
  "can_proceed": true,
  "remaining": 999999,
  "current_count": 0,
  "daily_limit": 999999,
  "plan": "premium",
  "unlimited": true,
  "is_admin": false,
  "reset_time": "2025-01-10T00:00:00Z",
  "reset_in_hours": 8.5,
  "features": {
    "daily_applications": {
      "enabled": true,
      "limit": 999999,
      "used": 0,
      "remaining": 999999,
      "resets_at": "2025-01-10T00:00:00Z"
    }
  }
}
```

**Response Fields:**
| Field | Type | Description |
|-------|------|-------------|
| `can_proceed` | boolean | Whether user can send more applications |
| `remaining` | number | Applications remaining today |
| `current_count` | number | Applications sent today |
| `daily_limit` | number | Maximum applications per day |
| `plan` | string | User's current plan |
| `unlimited` | boolean | True if user has unlimited applications |
| `is_admin` | boolean | True if user is an admin |
| `reset_time` | string | ISO timestamp when limits reset |
| `reset_in_hours` | number | Hours until limits reset |

---

### 3.2 Limit Exceeded Error

When a free user exceeds their daily limit, automation endpoints return:

**Status Code:** 402 Payment Required

**Error Response:**
```json
{
  "detail": {
    "error": "daily_application_limit_exceeded",
    "message": "Daily application limit exceeded. You've used 5/5 applications today.",
    "current_count": 5,
    "daily_limit": 5,
    "plan": "free_trial",
    "reset_time": "2025-01-10T00:00:00Z",
    "upgrade_required": true
  }
}
```

---

### 3.3 Frontend Implementation

**React Hook for Application Limits:**
```typescript
interface ApplicationLimits {
  can_proceed: boolean;
  remaining: number;
  current_count: number;
  daily_limit: number;
  plan: string;
  unlimited: boolean;
  is_admin: boolean;
  reset_time: string;
  reset_in_hours: number;
}

export function useApplicationLimits() {
  const [limits, setLimits] = useState<ApplicationLimits | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchLimits = async () => {
    try {
      const response = await fetch(`${API_BASE}/v1/automation/application-limits`, {
        headers: { 'Authorization': `Bearer ${getToken()}` }
      });

      if (!response.ok) throw new Error('Failed to fetch limits');

      const data = await response.json();
      setLimits(data);
    } catch (err) {
      console.error('Failed to fetch application limits:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLimits();
    // Refresh every minute to update countdown
    const interval = setInterval(fetchLimits, 60000);
    return () => clearInterval(interval);
  }, []);

  return { limits, loading, refetch: fetchLimits };
}
```

**Usage in Automation Modal:**
```typescript
function AutomationModal() {
  const { limits } = useApplicationLimits();

  if (!limits) return <Loading />;

  if (limits.unlimited) {
    return <AutomationForm />;
  }

  if (limits.remaining === 0) {
    return (
      <LimitReachedCard
        plan={limits.plan}
        resetTime={limits.reset_time}
        resetInHours={limits.reset_in_hours}
      />
    );
  }

  return (
    <AutomationForm
      remainingApplications={limits.remaining}
      dailyLimit={limits.daily_limit}
    />
  );
}
```

**Limit Reached Component:**
```typescript
function LimitReachedCard({ plan, resetTime, resetInHours }: Props) {
  return (
    <div className="bg-orange-50 border border-orange-200 rounded-lg p-6">
      <h3 className="text-lg font-semibold text-orange-800">
        Daily Application Limit Reached
      </h3>
      <p className="mt-2 text-orange-700">
        You've used all {plan === 'free_trial' ? '5' : 'your'} applications for today.
      </p>
      <p className="mt-1 text-sm text-orange-600">
        Limits reset in {Math.ceil(resetInHours)} hours ({new Date(resetTime).toLocaleTimeString()})
      </p>
      <button
        onClick={() => router.push('/plans')}
        className="mt-4 bg-orange-600 text-white px-4 py-2 rounded hover:bg-orange-700"
      >
        Upgrade for Unlimited Applications
      </button>
    </div>
  );
}
```

**Progress Bar Component:**
```typescript
function ApplicationProgress({ limits }: { limits: ApplicationLimits }) {
  const percentage = limits.unlimited
    ? 100
    : (limits.current_count / limits.daily_limit) * 100;

  return (
    <div className="mb-4">
      <div className="flex justify-between text-sm mb-1">
        <span>Daily Applications</span>
        <span>
          {limits.unlimited
            ? 'Unlimited'
            : `${limits.current_count}/${limits.daily_limit}`}
        </span>
      </div>
      <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
        <div
          className={`h-full transition-all ${
            percentage >= 100
              ? 'bg-red-500'
              : percentage >= 70
              ? 'bg-orange-500'
              : 'bg-green-500'
          }`}
          style={{ width: `${percentage}%` }}
        />
      </div>
      {!limits.unlimited && (
        <p className="text-xs text-gray-500 mt-1">
          {limits.remaining} remaining today • Resets in {Math.ceil(limits.reset_in_hours)}h
        </p>
      )}
    </div>
  );
}
```

---

## Common Patterns

### API Client Setup

```typescript
// lib/api.ts
const API_BASE = import.meta.env.VITE_API_URL || 'https://jobbot-production-ddd9.up.railway.app';

function getToken(): string {
  const token = localStorage.getItem('access_token');
  if (!token) throw new Error('No access token found');
  return token;
}

const api = {
  async get(endpoint: string, requiresAuth = true) {
    const headers: HeadersInit = { 'Content-Type': 'application/json' };
    if (requiresAuth) headers['Authorization'] = `Bearer ${getToken()}`;

    const response = await fetch(`${API_BASE}${endpoint}`, { headers });
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.detail || 'API request failed');
    }
    return response.json();
  },

  async post(endpoint: string, body: any, requiresAuth = true) {
    const headers: HeadersInit = { 'Content-Type': 'application/json' };
    if (requiresAuth) headers['Authorization'] = `Bearer ${getToken()}`;

    const response = await fetch(`${API_BASE}${endpoint}`, {
      method: 'POST',
      headers,
      body: JSON.stringify(body)
    });
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.detail || 'API request failed');
    }
    return response.json();
  },

  async patch(endpoint: string, body: any) {
    const response = await fetch(`${API_BASE}${endpoint}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${getToken()}`
      },
      body: JSON.stringify(body)
    });
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.detail || 'API request failed');
    }
    return response.json();
  },

  async delete(endpoint: string) {
    const response = await fetch(`${API_BASE}${endpoint}`, {
      method: 'DELETE',
      headers: { 'Authorization': `Bearer ${getToken()}` }
    });
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.detail || 'API request failed');
    }
    return response.json();
  }
};

export default api;
```

### Error Handling

```typescript
// lib/error-handler.ts
export function handleApiError(error: any): string {
  if (error.response?.status === 401) {
    // Unauthorized - redirect to login
    localStorage.removeItem('access_token');
    window.location.href = '/login';
    return 'Session expired. Please login again.';
  }

  if (error.response?.status === 402) {
    // Payment required - application limit exceeded
    return error.response.data?.detail?.message || 'Limit exceeded.';
  }

  if (error.response?.status === 404) {
    return 'Resource not found.';
  }

  if (error.response?.status >= 500) {
    return 'Server error. Please try again later.';
  }

  return error.message || 'An error occurred.';
}
```

---

## Environment Variables

```bash
# .env
VITE_API_URL=https://jobbot-production-ddd9.up.railway.app
# Or for local development:
# VITE_API_URL=http://localhost:8000
```

---

## Testing

All endpoints can be tested via the Swagger UI at `/docs` on the backend URL.

---

## Support

For issues or questions:
- Swagger UI: `/docs` endpoint
- Backend team contact
- Check existing documentation files:
  - `PASSWORD_RESET_API.md`
  - `NOTIFICATIONS_API_GUIDE.md`
  - `NOTIFICATION_EVENTS.md`
