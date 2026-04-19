import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useNotifications } from "@/hooks/useNotifications";
import { Bell, Check, Trash2, Loader2, ArrowLeft, Filter, X } from "lucide-react";
import { Button } from "@/components/ui/button";

type FilterType = "all" | "unread" | "read";

export default function NotificationsPage() {
  const navigate = useNavigate();
  const [filter, setFilter] = useState<FilterType>("all");
  const { notifications, loading, unreadCount, markAsRead, markAllAsRead, deleteNotification, error } =
    useNotifications(filter === "all" ? undefined : filter);

  const handleMarkAsRead = async (e: React.MouseEvent, notificationId: string) => {
    e.stopPropagation();
    await markAsRead(notificationId);
  };

  const handleDelete = async (e: React.MouseEvent, notificationId: string) => {
    e.stopPropagation();
    await deleteNotification(notificationId);
  };

  const getPriorityStyles = (priority: string, status: string) => {
    if (status === "read") {
      return "bg-white border-slate-200";
    }
    switch (priority) {
      case "critical":
        return "bg-red-50 border-red-200";
      case "high":
        return "bg-orange-50 border-orange-200";
      case "medium":
        return "bg-blue-50 border-blue-200";
      default:
        return "bg-slate-50 border-slate-200";
    }
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case "automation_completed":
        return "🚀";
      case "automation_failed":
        return "❌";
      case "credits_low":
        return "⚠️";
      case "trial_ending":
        return "⏰";
      case "plan_upgraded":
        return "🎉";
      case "application_status_update":
        return "📋";
      case "new_job_match":
        return "💼";
      case "job_application_sent":
        return "✅";
      case "email_verification_required":
        return "📧";
      case "email_verified":
        return "✅";
      case "daily_limit_reached":
        return "🚫";
      case "new_recommended_job":
        return "💼";
      case "automation_started":
        return "⚙️";
      default:
        return "📢";
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "critical":
        return "text-red-600";
      case "high":
        return "text-orange-600";
      case "medium":
        return "text-blue-600";
      default:
        return "text-slate-500";
    }
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);

    if (minutes < 1) return "Just now";
    if (minutes < 60) return `${minutes} min ago`;
    if (hours < 24) return `${hours} hours ago`;
    if (days < 7) return `${days} days ago`;
    return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="max-w-3xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center gap-4 mb-6">
          <Button
            variant="outline"
            size="sm"
            onClick={() => navigate(-1)}
            className="h-10 w-10 p-0 border-slate-200"
          >
            <ArrowLeft className="w-4 h-4" />
          </Button>
          <div className="flex-1">
            <h1 className="text-2xl font-bold text-slate-900">Notifications</h1>
            <p className="text-slate-500 text-sm font-medium mt-0.5">
              {unreadCount > 0 ? `You have ${unreadCount} unread notifications` : "You're all caught up!"}
            </p>
          </div>
          {unreadCount > 0 && (
            <Button
              variant="outline"
              onClick={markAllAsRead}
              className="flex items-center gap-2 border-slate-200 text-slate-600 hover:text-blue-600 hover:border-blue-300"
            >
              <Check className="w-4 h-4" />
              <span className="hidden sm:inline">Mark All Read</span>
            </Button>
          )}
        </div>

        {/* Filter Tabs */}
        <div className="flex gap-2 mb-6">
          {(["all", "unread", "read"] as FilterType[]).map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all ${
                filter === f
                  ? "bg-blue-600 text-white shadow-md shadow-blue-500/20"
                  : "bg-white text-slate-600 hover:bg-slate-100 border border-slate-200"
              }`}
            >
              {f.charAt(0).toUpperCase() + f.slice(1)}
              {f === "unread" && unreadCount > 0 && (
                <span className="ml-1.5 bg-red-500 text-white text-[10px] px-1.5 py-0.5 rounded-full">
                  {unreadCount}
                </span>
              )}
            </button>
          ))}
        </div>

        {/* Error State */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-xl p-4 mb-4">
            <p className="text-red-600 text-sm font-medium">{error}</p>
          </div>
        )}

        {/* Loading State */}
        {loading ? (
          <div className="flex items-center justify-center py-16">
            <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
          </div>
        ) : notifications.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-xl border border-slate-200">
            <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Bell className="w-8 h-8 text-slate-400" />
            </div>
            <p className="text-slate-600 font-medium">No notifications found</p>
            <p className="text-slate-400 text-sm mt-1">
              {filter === "unread"
                ? "You're all caught up!"
                : filter === "read"
                ? "You haven't read any notifications yet"
                : "You're all caught up! Check back later for updates"}
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {notifications.map((notification) => (
              <div
                key={notification.id}
                onClick={() => notification.action_url && navigate(notification.action_url)}
                className={`p-4 rounded-xl border transition-all hover:shadow-md cursor-pointer ${
                  getPriorityStyles(notification.priority, notification.status)
                }`}
              >
                <div className="flex items-start gap-4">
                  {/* Icon */}
                  <div className="text-2xl flex-shrink-0">
                    {getNotificationIcon(notification.type)}
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className={`font-bold text-[15px] ${
                        notification.status === "unread" ? "text-slate-900" : "text-slate-700"
                      }`}>
                        {notification.title}
                      </h3>
                      {notification.status === "unread" && (
                        <span className="w-2 h-2 bg-blue-500 rounded-full" />
                      )}
                    </div>
                    <p className="text-sm text-slate-600 mt-1 leading-relaxed">
                      {notification.message}
                    </p>
                    <div className="flex items-center gap-3 mt-2">
                      <p className={`text-xs font-medium ${getPriorityColor(notification.priority)}`}>
                        {notification.priority.charAt(0).toUpperCase() + notification.priority.slice(1)} Priority
                      </p>
                      <span className="text-slate-300">•</span>
                      <p className="text-xs text-slate-400">
                        {formatTime(notification.created_at)}
                      </p>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-1 flex-shrink-0" onClick={(e) => e.stopPropagation()}>
                    {notification.status === "unread" && (
                      <button
                        onClick={(e) => handleMarkAsRead(e, notification.id)}
                        className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                        title="Mark as read"
                      >
                        <Check className="w-4 h-4" />
                      </button>
                    )}
                    <button
                      onClick={(e) => handleDelete(e, notification.id)}
                      className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                      title="Delete notification"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Action Button */}
                {notification.action_url && notification.action_label && (
                  <div className="mt-3 pt-3 border-t border-slate-200/60">
                    <Button
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        navigate(notification.action_url!);
                      }}
                      className="bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold h-8 px-4"
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