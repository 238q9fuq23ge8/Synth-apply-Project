import { useState, useRef, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { Bell, BellOff, Check, Loader2 } from "lucide-react";
import { useUnreadCount } from "@/hooks/useNotifications";
import type { Notification } from "@/hooks/useNotifications";
import api from "@/lib/api";

export function NotificationBell() {
  const navigate = useNavigate();
  const unreadCount = useUnreadCount();
  const [showDropdown, setShowDropdown] = useState(false);
  const [recentNotifications, setRecentNotifications] = useState<Notification[]>([]);
  const [loadingNotifications, setLoadingNotifications] = useState(false);
  const [localUnreadCount, setLocalUnreadCount] = useState(0);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Keep local unread count in sync
  useEffect(() => {
    setLocalUnreadCount(unreadCount);
  }, [unreadCount]);

  // Fetch recent notifications when dropdown opens (use api directly, NOT hook)
  const fetchRecentNotifications = useCallback(async () => {
    setLoadingNotifications(true);
    try {
      const res = await api.get("/v1/notifications?limit=5&status=unread") as {
        notifications?: Notification[];
      };
      setRecentNotifications(res.notifications || []);
    } catch (err) {
      console.error("Failed to fetch recent notifications:", err);
      setRecentNotifications([]);
    } finally {
      setLoadingNotifications(false);
    }
  }, []);

  useEffect(() => {
    if (showDropdown) {
      fetchRecentNotifications();
    }
  }, [showDropdown, fetchRecentNotifications]);

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

  const handleNotificationClick = async (notification: Notification) => {
    if (notification.status === "unread") {
      try {
        await api.patch(`/v1/notifications/${notification.id}/read`);
        setRecentNotifications((prev) =>
          prev.map((n) =>
            n.id === notification.id ? { ...n, status: "read" as const } : n
          )
        );
        setLocalUnreadCount((prev) => Math.max(0, prev - 1));
      } catch (err) {
        console.error("Failed to mark as read:", err);
      }
    }
    if (notification.action_url) {
      navigate(notification.action_url);
    }
    setShowDropdown(false);
  };

  const handleMarkAllRead = async () => {
    try {
      await api.patch("/v1/notifications/read-all");
      setRecentNotifications((prev) =>
        prev.map((n) => ({ ...n, status: "read" as const }))
      );
      setLocalUnreadCount(0);
    } catch (err) {
      console.error("Failed to mark all as read:", err);
    }
  };

  const getPriorityIndicator = (priority: string) => {
    switch (priority) {
      case "critical": return "bg-red-500";
      case "high":     return "bg-orange-500";
      case "medium":   return "bg-blue-500";
      default:         return "bg-slate-400";
    }
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case "automation_completed":       return "🚀";
      case "automation_failed":          return "❌";
      case "automation_started":         return "⚙️";
      case "credits_low":                return "⚠️";
      case "trial_ending":               return "⏰";
      case "plan_upgraded":              return "🎉";
      case "application_status_update":  return "📋";
      case "new_job_match":              return "💼";
      case "new_recommended_job":        return "💼";
      case "daily_limit_reached":        return "🚫";
      case "job_application_sent":       return "✅";
      case "email_verification_required":return "📧";
      default:                           return "📢";
    }
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);

    if (minutes < 1)  return "Just now";
    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24)   return `${hours}h ago`;
    if (days < 7)     return `${days}d ago`;
    return date.toLocaleDateString();
  };

  const displayCount = localUnreadCount;

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Bell Button */}
      <button
        onClick={() => setShowDropdown(!showDropdown)}
        className="relative p-2 text-slate-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all duration-200"
        title="Notifications"
        aria-label={`Notifications${displayCount > 0 ? ` (${displayCount} unread)` : ""}`}
      >
        {displayCount > 0 ? (
          <Bell className="w-5 h-5" />
        ) : (
          <BellOff className="w-5 h-5 text-slate-400" />
        )}
        {displayCount > 0 && (
          <span className="absolute -top-0.5 -right-0.5 bg-red-500 text-white text-[10px] font-bold rounded-full min-w-[18px] h-[18px] flex items-center justify-center px-1 shadow-sm shadow-red-500/30">
            {displayCount > 99 ? "99+" : displayCount}
          </span>
        )}
      </button>

      {/* Dropdown */}
      {showDropdown && (
        <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white rounded-xl shadow-xl border border-slate-200 z-50 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200">
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3 border-b border-slate-100 bg-gradient-to-r from-blue-50 to-slate-50">
            <div className="flex items-center gap-2">
              <Bell className="w-4 h-4 text-blue-600" />
              <h3 className="font-bold text-slate-900 text-[14px]">Notifications</h3>
              {displayCount > 0 && (
                <span className="bg-blue-600 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full">
                  {displayCount}
                </span>
              )}
            </div>
            {displayCount > 0 && (
              <button
                onClick={handleMarkAllRead}
                className="text-xs text-blue-600 hover:text-blue-700 font-semibold transition-colors flex items-center gap-1"
              >
                <Check className="w-3 h-3" />
                Mark all read
              </button>
            )}
          </div>

          {/* Notifications List */}
          <div className="max-h-80 overflow-y-auto">
            {loadingNotifications ? (
              <div className="flex items-center justify-center py-10">
                <Loader2 className="w-6 h-6 animate-spin text-blue-600" />
              </div>
            ) : recentNotifications.length === 0 ? (
              <div className="px-4 py-10 text-center">
                <div className="w-12 h-12 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-3">
                  <Bell className="w-6 h-6 text-slate-400" />
                </div>
                <p className="text-sm text-slate-600 font-semibold">You're all caught up!</p>
                <p className="text-xs text-slate-400 mt-1">No unread notifications</p>
              </div>
            ) : (
              recentNotifications.map((notification) => (
                <button
                  key={notification.id}
                  onClick={() => handleNotificationClick(notification)}
                  className={`w-full px-4 py-3 text-left hover:bg-slate-50 transition-colors border-b border-slate-50 last:border-b-0 ${
                    notification.status === "unread" ? "bg-blue-50/40" : ""
                  }`}
                >
                  <div className="flex items-start gap-3">
                    {/* Emoji Icon */}
                    <div className="text-lg flex-shrink-0 mt-0.5 w-7 text-center">
                      {getNotificationIcon(notification.type)}
                    </div>

                    {/* Priority Dot */}
                    <div
                      className={`w-2 h-2 mt-2 rounded-full flex-shrink-0 ${getPriorityIndicator(notification.priority)}`}
                    />

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1.5">
                        <p className="font-semibold text-[13px] text-slate-900 truncate flex-1">
                          {notification.title}
                        </p>
                        {notification.status === "unread" && (
                          <span className="w-2 h-2 bg-blue-500 rounded-full flex-shrink-0" />
                        )}
                      </div>
                      <p className="text-[12px] text-slate-500 truncate mt-0.5 leading-relaxed">
                        {notification.message}
                      </p>
                      <p className="text-[11px] text-slate-400 mt-1 font-medium">
                        {formatTime(notification.created_at)}
                      </p>
                    </div>
                  </div>
                </button>
              ))
            )}
          </div>

          {/* Footer */}
          <div className="px-4 py-3 border-t border-slate-100 bg-slate-50">
            <button
              onClick={() => {
                setShowDropdown(false);
                navigate("/notifications");
              }}
              className="w-full text-center text-sm text-blue-600 hover:text-blue-700 font-semibold transition-colors py-0.5"
            >
              View All Notifications →
            </button>
          </div>
        </div>
      )}
    </div>
  );
}