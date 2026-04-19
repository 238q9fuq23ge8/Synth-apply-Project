import { useState, useEffect, useCallback } from "react";
import api from "@/lib/api";

export interface Notification {
  id: string;
  type: string;
  title: string;
  message: string;
  action_url?: string;
  action_label?: string;
  priority: "low" | "medium" | "high" | "critical";
  status: "unread" | "read" | "archived";
  metadata: Record<string, unknown>;
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

export function useNotifications(status?: string, limit = 20) {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [hasMore, setHasMore] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchNotifications = useCallback(async () => {
    try {
      setError(null);
      const params = new URLSearchParams();
      if (status) params.set("status", status);
      params.set("limit", limit.toString());

      const response = await api.get(`/v1/notifications?${params}`);
      const data = response as NotificationsResponse;
      setNotifications(data.notifications || []);
      setUnreadCount(data.unread_count || 0);
      setHasMore(data.pagination?.has_more || false);
    } catch (err: unknown) {
      console.error("Failed to fetch notifications:", err);
      setError("Failed to load notifications");
    } finally {
      setLoading(false);
    }
  }, [status, limit]);

  const markAsRead = async (notificationId: string) => {
    try {
      await api.patch(`/v1/notifications/${notificationId}/read`);
      // Update local state
      setNotifications(prev =>
        prev.map(n =>
          n.id === notificationId ? { ...n, status: "read" as const, read_at: new Date().toISOString() } : n
        )
      );
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch (err) {
      console.error("Failed to mark as read:", err);
    }
  };

  const markAllAsRead = async () => {
    try {
      await api.patch("/v1/notifications/read-all");
      setNotifications(prev =>
        prev.map(n => ({ ...n, status: "read" as const, read_at: new Date().toISOString() }))
      );
      setUnreadCount(0);
    } catch (err) {
      console.error("Failed to mark all as read:", err);
    }
  };

  const deleteNotification = async (notificationId: string) => {
    try {
      await api.delete(`/v1/notifications/${notificationId}`);
      setNotifications(prev => prev.filter(n => n.id !== notificationId));
    } catch (err) {
      console.error("Failed to delete notification:", err);
    }
  };

  useEffect(() => {
    fetchNotifications();
  }, [fetchNotifications]);

  return {
    notifications,
    unreadCount,
    loading,
    hasMore,
    error,
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
        setCount((response as { unread_count: number }).unread_count || 0);
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