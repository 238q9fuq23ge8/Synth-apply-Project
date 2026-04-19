# Notifications & Application Limits Integration Plan

## Executive Summary

This document outlines the plan to integrate the Notifications System and Daily Application Limits into the Scope AI frontend (synth-apply folder). Both features have working backend endpoints that need to be connected to the frontend.

---

## Current State Analysis

### Backend - READY ✅
- **Notifications API**: All endpoints working
  - `GET /v1/notifications` - Get notifications
  - `GET /v1/notifications/unread-count` - Get unread count for badge
  - `PATCH /v1/notifications/{id}/read` - Mark as read
  - `PATCH /v1/notifications/read-all` - Mark all as read
  - `DELETE /v1/notifications/{id}` - Delete notification
- **Application Limits API**: Working
  - `GET /v1/automation/application-limits` - Get daily limit info

### Frontend - NEEDS DEVELOPMENT ❌
- **Notifications**:
  - No notifications page exists
  - No notification bell in header/navbar
  - No API integration
- **Application Limits**:
  - No integration with automation modal
  - No UI showing daily limit usage
  - No limit warning/reached UI

---

## Part 1: Notifications System Integration

### 1.1 Create Notification API Hook

Create a new hook for notifications:

**File:** `src/hooks/useNotifications.ts`

```typescript
import { useState, useEffect, useCallback } from "react";
import api from "@/lib/api";

interface Notification {
  id: string;
  type: string;
  title: string;
  message: string;
  action_url?: string;
  action_label?: string;
  priority: "low" | "medium" | "high" | "critical";
  status: "unread" | "read" | "archived";
  metadata: Record<string, any>;
  created_at: string;
  read_at?: string;
}

export function useNotifications(status?: string, limit = 20) {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [hasMore, setHasMore] = useState(false);

  const fetchNotifications = useCallback(async () => {
    try {
      const params = new URLSearchParams();
      if (status) params.set("status", status);
      params.set("limit", limit.toString());

      const response = await api.get(`/v1/notifications?${params}`);
      setNotifications(response.notifications || []);
      setUnreadCount(response.unread_count || 0);
      setHasMore(response.pagination?.has_more || false);
    } catch (error) {
      console.error("Failed to fetch notifications:", error);
    } finally {
      setLoading(false);
    }
  }, [status, limit]);

  const markAsRead = async (notificationId: string) => {
    await api.patch(`/v1/notifications/${notificationId}/read`);
    fetchNotifications();
  };

  const markAllAsRead = async () => {
    await api.patch("/v1/notifications/read-all");
    fetchNotifications();
  };

  const deleteNotification = async (notificationId: string) => {
    await api.delete(`/v1/notifications/${notificationId}`);
    fetchNotifications();
  };

  useEffect(() => {
    fetchNotifications();
  }, [fetchNotifications]);

  return {
    notifications,
    unreadCount,
    loading,
    hasMore,
    refetch: fetchNotifications,
    markAsRead,
    markAllAsRead,
    deleteNotification,
  };
}

export function useUnreadCount() {
  const [count, setCount] = useState(0);

  useEffect(() => {
    const fetchCount = async () => {
      try {
        const response = await api.get("/v1/notifications/unread-count");
        setCount(response.unread_count || 0);
      } catch (error) {
        console.error("Failed to fetch unread count:", error);
      }
    };

    fetchCount();
    // Poll every 30 seconds
    const interval = setInterval(fetchCount, 30000);
    return () => clearInterval(interval);
  }, []);

  return count;
}
```

---

### 1.2 Create Notification Bell Component

Add notification bell with badge to the Global Header:

**File:** `src/components/layout/GlobalHeader.tsx` (or create new component)

```tsx
import { Bell, BellOff } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useUnreadCount } from "@/hooks/useNotifications";
import { useState, useRef, useEffect } from "react";
import api from "@/lib/api";

export function NotificationBell() {
  const navigate = useNavigate();
  const unreadCount = useUnreadCount();
  const [showDropdown, setShowDropdown] = useState(false);
  const [recentNotifications, setRecentNotifications] = useState<any[]>([]);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Fetch recent notifications when dropdown opens
  useEffect(() => {
    if (showDropdown) {
      api.get("/v1/notifications?limit=5").then((res) => {
        setRecentNotifications(res.notifications || []);
      });
    }
  }, [showDropdown]);

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowDropdown(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleNotificationClick = async (notification: any) => {
    // Mark as read
    if (notification.status === "unread") {
      await api.patch(`/v1/notifications/${notification.id}/read`);
    }
    // Navigate to action URL if exists
    if (notification.action_url) {
      navigate(notification.action_url);
    }
    setShowDropdown(false);
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setShowDropdown(!showDropdown)}
        className="relative p-2 text-gray-600 hover:text-gray-900 transition-colors"
      >
        {unreadCount > 0 ? (
          <Bell className="w-5 h-5" />
        ) : (
          <BellOff className="w-5 h-5 text-gray-400" />
        )}
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
            {unreadCount > 99 ? "99+" : unreadCount}
          </span>
        )}
      </button>

      {showDropdown && (
        <div className="absolute right-0 mt-2 w-80 bg-white rounded-lg shadow-xl border border-gray-200 z-50">
          <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100">
            <h3 className="font-semibold text-gray-900">Notifications</h3>
            {unreadCount > 0 && (
              <button
                onClick={async () => {
                  await api.patch("/v1/notifications/read-all");
                  window.location.reload();
                }}
                className="text-xs text-blue-600 hover:text-blue-700"
              >
                Mark all read
              </button>
            )}
          </div>

          <div className="max-h-96 overflow-y-auto">
            {recentNotifications.length === 0 ? (
              <div className="px-4 py-8 text-center text-gray-500">
                No notifications yet
              </div>
            ) : (
              recentNotifications.map((notification) => (
                <button
                  key={notification.id}
                  onClick={() => handleNotificationClick(notification)}
                  className={`w-full px-4 py-3 text-left hover:bg-gray-50 transition-colors ${
                    notification.status === "unread" ? "bg-blue-50" : ""
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <div className={`w-2 h-2 mt-2 rounded-full flex-shrink-0 ${
                      notification.priority === "critical" ? "bg-red-500" :
                      notification.priority === "high" ? "bg-orange-500" :
                      "bg-blue-500"
                    }`} />
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-sm text-gray-900 truncate">
                        {notification.title}
                      </p>
                      <p className="text-xs text-gray-600 truncate">
                        {notification.message}
                      </p>
                      <p className="text-xs text-gray-400 mt-1">
                        {new Date(notification.created_at).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                </button>
              ))
            )}
          </div>

          <div className="px-4 py-3 border-t border-gray-100">
            <button
              onClick={() => {
                setShowDropdown(false);
                navigate("/notifications");
              }}
              className="w-full text-center text-sm text-blue-600 hover:text-blue-700 font-medium"
            >
              View All Notifications
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
```

---

### 1.3 Create Notifications Page

**File:** `src/pages/Notifications.tsx`

```tsx
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useNotifications } from "@/hooks/useNotifications";
import { Bell, Check, Trash2, Filter, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";

type FilterType = "all" | "unread" | "read";

export default function NotificationsPage() {
  const navigate = useNavigate();
  const [filter, setFilter] = useState<FilterType>("all");
  const { notifications, loading, unreadCount, markAsRead, markAllAsRead, deleteNotification, refetch } =
    useNotifications(filter === "all" ? undefined : filter);

  const handleMarkAsRead = async (e: React.MouseEvent, notificationId: string) => {
    e.stopPropagation();
    await markAsRead(notificationId);
  };

  const handleDelete = async (e: React.MouseEvent, notificationId: string) => {
    e.stopPropagation();
    await deleteNotification(notificationId);
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "critical": return "bg-red-100 border-red-200";
      case "high": return "bg-orange-100 border-orange-200";
      case "medium": return "bg-blue-100 border-blue-200";
      default: return "bg-gray-100 border-gray-200";
    }
  };

  const getNotificationIcon = (type: string) => {
    // Return appropriate icon based on notification type
    switch (type) {
      case "automation_completed": return "🚀";
      case "automation_failed": return "❌";
      case "credits_low": return "⚠️";
      case "trial_ending": return "⏰";
      case "plan_upgraded": return "🎉";
      default: return "📢";
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-3xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Notifications</h1>
            <p className="text-gray-600 mt-1">
              {unreadCount > 0 ? `You have ${unreadCount} unread notifications` : "You're all caught up!"}
            </p>
          </div>
          {unreadCount > 0 && (
            <Button
              variant="outline"
              onClick={markAllAsRead}
              className="flex items-center gap-2"
            >
              <Check className="w-4 h-4" />
              Mark All Read
            </Button>
          )}
        </div>

        {/* Filter Tabs */}
        <div className="flex gap-2 mb-6">
          {(["all", "unread", "read"] as FilterType[]).map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                filter === f
                  ? "bg-blue-600 text-white"
                  : "bg-white text-gray-600 hover:bg-gray-100"
              }`}
            >
              {f.charAt(0).toUpperCase() + f.slice(1)}
            </button>
          ))}
        </div>

        {/* Notifications List */}
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
          </div>
        ) : notifications.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-lg">
            <Bell className="w-12 h-12 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500">No notifications found</p>
          </div>
        ) : (
          <div className="space-y-3">
            {notifications.map((notification) => (
              <div
                key={notification.id}
                onClick={() => notification.action_url && navigate(notification.action_url)}
                className={`p-4 rounded-lg border transition-all hover:shadow-md cursor-pointer ${
                  notification.status === "unread"
                    ? getPriorityColor(notification.priority)
                    : "bg-white border-gray-200"
                }`}
              >
                <div className="flex items-start gap-4">
                  {/* Icon */}
                  <div className="text-2xl">{getNotificationIcon(notification.type)}</div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <h3 className={`font-semibold ${notification.status === "unread" ? "text-gray-900" : "text-gray-700"}`}>
                        {notification.title}
                      </h3>
                      {notification.status === "unread" && (
                        <span className="w-2 h-2 bg-blue-500 rounded-full" />
                      )}
                    </div>
                    <p className="text-sm text-gray-600 mt-1">{notification.message}</p>
                    <p className="text-xs text-gray-400 mt-2">
                      {new Date(notification.created_at).toLocaleString()}
                    </p>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
                    {notification.status === "unread" && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={(e) => handleMarkAsRead(e, notification.id)}
                        className="text-gray-500 hover:text-blue-600"
                      >
                        <Check className="w-4 h-4" />
                      </Button>
                    )}
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={(e) => handleDelete(e, notification.id)}
                      className="text-gray-500 hover:text-red-600"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>

                {/* Action Button */}
                {notification.action_url && notification.action_label && (
                  <div className="mt-3 pt-3 border-t border-gray-200">
                    <Button
                      size="sm"
                      onClick={() => navigate(notification.action_url)}
                      className="bg-blue-600 hover:bg-blue-700"
                    >
                      {notification.action_label}
                    </Button>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
```

---

### 1.4 Add Route for Notifications Page

**File:** `src/App.tsx`

```tsx
import Notifications from "@/pages/Notifications";

// Add route:
<Route path="/notifications" element={<Notifications />} />
```

---

### 1.5 Add Notification Bell to Global Header

**File:** `src/components/layout/GlobalHeader.tsx`

Import and add the NotificationBell component next to the user menu.

---

## Part 2: Application Limits Integration

### 2.1 Create Application Limits Hook

**File:** `src/hooks/useApplicationLimits.ts`

```typescript
import { useState, useEffect, useCallback } from "react";
import api from "@/lib/api";

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
  const [error, setError] = useState<string | null>(null);

  const fetchLimits = useCallback(async () => {
    try {
      setError(null);
      const response = await api.get("/v1/automation/application-limits");
      setLimits(response);
    } catch (err: any) {
      console.error("Failed to fetch application limits:", err);
      setError(err?.message || "Failed to load limits");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchLimits();
    // Refresh every minute to update countdown
    const interval = setInterval(fetchLimits, 60000);
    return () => clearInterval(interval);
  }, [fetchLimits]);

  return { limits, loading, error, refetch: fetchLimits };
}
```

---

### 2.2 Create Application Limit Display Component

**File:** `src/components/ui/ApplicationLimitCard.tsx`

```tsx
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { AlertTriangle, Clock, Zap } from "lucide-react";

interface ApplicationLimitCardProps {
  limits: {
    remaining: number;
    current_count: number;
    daily_limit: number;
    plan: string;
    unlimited: boolean;
    reset_time: string;
    reset_in_hours: number;
  };
}

export function ApplicationLimitCard({ limits }: ApplicationLimitCardProps) {
  const navigate = useNavigate();

  if (limits.unlimited) {
    return (
      <div className="bg-green-50 border border-green-200 rounded-lg p-4 flex items-center gap-3">
        <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
          <Zap className="w-5 h-5 text-green-600" />
        </div>
        <div>
          <p className="font-semibold text-green-800">Unlimited Applications</p>
          <p className="text-sm text-green-600">
            Your {limits.plan} plan includes unlimited job applications
          </p>
        </div>
      </div>
    );
  }

  const percentage = (limits.current_count / limits.daily_limit) * 100;
  const isWarning = percentage >= 70;
  const isCritical = percentage >= 100;

  return (
    <div className={`rounded-lg p-4 border ${
      isCritical ? "bg-red-50 border-red-200" :
      isWarning ? "bg-orange-50 border-orange-200" :
      "bg-blue-50 border-blue-200"
    }`}>
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          {isCritical ? (
            <AlertTriangle className="w-5 h-5 text-red-600" />
          ) : (
            <Clock className="w-5 h-5 text-blue-600" />
          )}
          <span className={`font-semibold ${
            isCritical ? "text-red-800" :
            isWarning ? "text-orange-800" :
            "text-blue-800"
          }`}>
            Daily Applications
          </span>
        </div>
        <span className={`text-sm font-medium ${
          isCritical ? "text-red-600" :
          isWarning ? "text-orange-600" :
          "text-blue-600"
        }`}>
          {limits.current_count}/{limits.daily_limit}
        </span>
      </div>

      {/* Progress Bar */}
      <div className="h-2 bg-gray-200 rounded-full overflow-hidden mb-3">
        <div
          className={`h-full transition-all ${
            isCritical ? "bg-red-500" :
            isWarning ? "bg-orange-500" :
            "bg-blue-500"
          }`}
          style={{ width: `${Math.min(percentage, 100)}%` }}
        />
      </div>

      <div className="flex items-center justify-between">
        <p className={`text-sm ${
          isCritical ? "text-red-600" :
          isWarning ? "text-orange-600" :
          "text-blue-600"
        }`}>
          {limits.remaining > 0
            ? `${limits.remaining} remaining today • Resets in ${Math.ceil(limits.reset_in_hours)}h`
            : "Daily limit reached"}
        </p>

        {limits.remaining === 0 && (
          <Button
            size="sm"
            onClick={() => navigate("/plans")}
            className="bg-red-600 hover:bg-red-700 text-white"
          >
            Upgrade Now
          </Button>
        )}
      </div>
    </div>
  );
}
```

---

### 2.3 Integrate into AutomateModal

**File:** `src/pages/AutomateModal.tsx`

Add the limit display before the automation form:

```tsx
import { useApplicationLimits } from "@/hooks/useApplicationLimits";
import { ApplicationLimitCard } from "@/components/ui/ApplicationLimitCard";

// Inside the component:
const { limits, loading: limitsLoading } = useApplicationLimits();

// Before the form:
{limitsLoading ? (
  <div className="animate-pulse h-24 bg-gray-100 rounded-lg" />
) : limits && !limits.can_proceed ? (
  <div className="mb-4">
    <ApplicationLimitCard limits={limits} />
  </div>
) : limits && (
  <div className="mb-4">
    <ApplicationLimitCard limits={limits} />
  </div>
)}
```

---

## Part 3: Implementation Priority & Timeline

### Phase 1: Core Notifications (Day 1)
- [ ] Create `useNotifications` hook
- [ ] Create `useUnreadCount` hook
- [ ] Create NotificationBell component
- [ ] Add bell to GlobalHeader

### Phase 2: Notifications Page (Day 2)
- [ ] Create Notifications.tsx page
- [ ] Add route to App.tsx
- [ ] Test all notification actions (mark read, delete, etc.)

### Phase 3: Application Limits (Day 3)
- [ ] Create `useApplicationLimits` hook
- [ ] Create ApplicationLimitCard component
- [ ] Integrate into AutomateModal

### Phase 4: Polish & Testing (Day 4)
- [ ] Test polling for notifications
- [ ] Test limit countdown timer
- [ ] Handle 402 error for limit exceeded
- [ ] Add loading states

---

## API Endpoints Summary

| Feature | Endpoint | Method | Purpose |
|---------|----------|--------|---------|
| Notifications | `/v1/notifications` | GET | Get all notifications |
| Notifications | `/v1/notifications/unread-count` | GET | Get badge count |
| Notifications | `/v1/notifications/{id}/read` | PATCH | Mark as read |
| Notifications | `/v1/notifications/read-all` | PATCH | Mark all as read |
| Notifications | `/v1/notifications/{id}` | DELETE | Delete notification |
| App Limits | `/v1/automation/application-limits` | GET | Get daily limit info |

---

## Notification Types to Display

| Type | Title | Action |
|------|-------|--------|
| `automation_completed` | Automation Complete! | View Applications |
| `automation_failed` | Automation Failed | View Logs |
| `application_status_update` | Application Status Updated | View Application |
| `credits_low` | Low Credits Warning | Buy Credits |
| `trial_ending` | Trial Ending | Upgrade Plan |
| `plan_upgraded` | Plan Upgraded | View Dashboard |
| `new_job_match` | New Jobs Found | View Jobs |

---

## Files to Create

1. `src/hooks/useNotifications.ts`
2. `src/hooks/useApplicationLimits.ts`
3. `src/components/ui/NotificationBell.tsx`
4. `src/components/ui/ApplicationLimitCard.tsx`
5. `src/pages/Notifications.tsx`

## Files to Modify

1. `src/App.tsx` - Add notifications route
2. `src/components/layout/GlobalHeader.tsx` - Add notification bell
3. `src/pages/AutomateModal.tsx` - Add application limits display

---

*This plan is ready for implementation by your frontend developer.*