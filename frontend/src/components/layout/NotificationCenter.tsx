"use client";

import React, { useState, useEffect, useRef } from "react";
import { UserNotification } from "@/types";

interface NotificationCenterProps {
  userId?: string;
}

export default function NotificationCenter({ userId = "cand-1" }: NotificationCenterProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [notifications, setNotifications] = useState<UserNotification[]>([]);
  const [unreadCount, setUnreadCount] = useState<number>(0);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState<"all" | "unread">("all");
  const dropdownRef = useRef<HTMLDivElement>(null);

  const fetchNotifications = React.useCallback(async () => {
    try {
      const res = await fetch(`http://localhost:8000/api/v1/notifications?user_id=${userId}`);
      if (res.ok) {
        const data = await res.json();
        setNotifications(data.notifications || []);
        setUnreadCount(data.unread_count || 0);
      }
    } catch {
      // Offline fallback silent handle
    } finally {
      setIsLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    let isCancelled = false;
    (async () => {
      if (!isCancelled) {
        await fetchNotifications();
      }
    })();
    const interval = setInterval(fetchNotifications, 20000);
    return () => {
      isCancelled = true;
      clearInterval(interval);
    };
  }, [fetchNotifications]);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const markAsRead = async (notificationId: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();

    setNotifications((prev) =>
      prev.map((n) => (n.id === notificationId ? { ...n, is_read: true } : n))
    );
    setUnreadCount((prev) => Math.max(0, prev - 1));

    try {
      await fetch(`http://localhost:8000/api/v1/notifications/${notificationId}/read`, {
        method: "PATCH",
      });
    } catch {
      fetchNotifications();
    }
  };

  const markAllAsRead = async () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, is_read: true })));
    setUnreadCount(0);

    try {
      await fetch("http://localhost:8000/api/v1/notifications/mark-all-read", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ user_id: userId }),
      });
    } catch {
      fetchNotifications();
    }
  };

  const displayedNotifications = notifications.filter((notif) =>
    activeTab === "unread" ? !notif.is_read : true
  );

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Bell Icon Trigger Button */}
      <button
        id="notification-bell-btn"
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className={`relative p-1.5 rounded-md transition-colors border ${
          isOpen
            ? "bg-[#F5F5F7] text-[#1D1D1F] border-[#D2D2D7]"
            : unreadCount > 0
            ? "bg-white text-[#1D1D1F] border-[#D2D2D7] hover:bg-[#F5F5F7]"
            : "bg-transparent text-[#6E6E73] border-transparent hover:text-[#1D1D1F] hover:bg-[#F5F5F7]"
        }`}
        title="Notifications"
        aria-label="Notifications"
      >
        <svg
          className="w-4 h-4"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          aria-hidden="true"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={1.8}
            d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
          />
        </svg>

        {/* Unread Badge Counter */}
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 flex h-4 min-w-4 items-center justify-center px-1 rounded-full bg-[#0071E3] text-[10px] font-semibold text-white">
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        )}
      </button>

      {/* Dropdown Panel */}
      {isOpen && (
        <div
          id="notification-dropdown-panel"
          className="absolute right-0 mt-2 w-80 sm:w-96 rounded-xl border border-[#D2D2D7] bg-white shadow-xl z-50 overflow-hidden text-[#1D1D1F]"
        >
          {/* Header */}
          <div className="px-4 py-3 border-b border-[#E5E5EA] flex items-center justify-between bg-[#FBFBFD]">
            <div>
              <h3 className="text-sm font-semibold text-[#1D1D1F]">Notifications</h3>
              <p className="text-xs text-[#6E6E73]">
                {unreadCount === 0 ? "All caught up" : `${unreadCount} unread`}
              </p>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={fetchNotifications}
                disabled={isLoading}
                title="Refresh notifications"
                className="p-1 rounded text-[#6E6E73] hover:text-[#1D1D1F] hover:bg-[#F5F5F7] transition-colors disabled:opacity-50"
              >
                <svg
                  className={`w-3.5 h-3.5 ${isLoading ? "animate-spin text-[#0071E3]" : ""}`}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                  />
                </svg>
              </button>

              {unreadCount > 0 && (
                <button
                  type="button"
                  onClick={markAllAsRead}
                  className="text-xs text-[#0071E3] hover:underline font-medium px-1.5 py-0.5 rounded transition-colors"
                >
                  Mark all read
                </button>
              )}
            </div>
          </div>

          {/* Filter Tabs */}
          <div className="flex items-center gap-1 px-4 py-2 border-b border-[#E5E5EA] text-xs bg-[#F5F5F7]">
            <button
              type="button"
              onClick={() => setActiveTab("all")}
              className={`px-2.5 py-1 rounded font-medium text-xs transition-colors ${
                activeTab === "all"
                  ? "bg-white text-[#1D1D1F] shadow-xs"
                  : "text-[#6E6E73] hover:text-[#1D1D1F]"
              }`}
            >
              All ({notifications.length})
            </button>
            <button
              type="button"
              onClick={() => setActiveTab("unread")}
              className={`px-2.5 py-1 rounded font-medium text-xs transition-colors flex items-center gap-1.5 ${
                activeTab === "unread"
                  ? "bg-white text-[#1D1D1F] shadow-xs"
                  : "text-[#6E6E73] hover:text-[#1D1D1F]"
              }`}
            >
              <span>Unread</span>
              {unreadCount > 0 && (
                <span className="w-4 h-4 rounded-full bg-[#0071E3]/15 text-[#0071E3] text-[10px] font-mono flex items-center justify-center">
                  {unreadCount}
                </span>
              )}
            </button>
          </div>

          {/* Notification List */}
          <div className="max-h-[360px] overflow-y-auto divide-y divide-[#E5E5EA]">
            {isLoading && notifications.length === 0 ? (
              <div className="p-8 text-center text-xs text-[#6E6E73] flex flex-col items-center gap-2">
                <span>Loading notifications...</span>
              </div>
            ) : displayedNotifications.length === 0 ? (
              <div className="p-8 text-center text-xs text-[#6E6E73] flex flex-col items-center gap-2">
                <p className="font-medium text-[#1D1D1F]">No notifications</p>
                <p className="text-xs text-[#86868B] max-w-[200px]">
                  {activeTab === "unread"
                    ? "You have marked all notifications as read."
                    : "No notifications at this time."}
                </p>
              </div>
            ) : (
              displayedNotifications.map((notif) => {
                const isDeadline = notif.notification_type === "deadline_warning";
                return (
                  <div
                    key={notif.id}
                    id={`notification-item-${notif.id}`}
                    onClick={() => {
                      if (!notif.is_read) {
                        markAsRead(notif.id);
                      }
                    }}
                    className={`p-3.5 transition-colors cursor-pointer ${
                      !notif.is_read
                        ? "bg-[#FBFBFD] hover:bg-[#F5F5F7] border-l-2 border-l-[#0071E3]"
                        : "hover:bg-[#F5F5F7] opacity-80 hover:opacity-100 border-l-2 border-l-transparent"
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-1 mb-1">
                          <span
                            className={`text-[10px] font-semibold uppercase px-1.5 py-0.5 rounded border ${
                              !notif.is_read
                                ? notif.notification_type === "job_match"
                                  ? "bg-[#E6F4EA] text-[#1E8E3E] border-[#CEEAD6]"
                                  : isDeadline
                                  ? "bg-[#FEF7E0] text-[#B06000] border-[#FEEFC3]"
                                  : "bg-[#E8F0FE] text-[#0071E3] border-[#D2E3FC]"
                                : "bg-[#F5F5F7] text-[#6E6E73] border-[#E5E5EA]"
                            }`}
                          >
                            {notif.notification_type === "job_match"
                              ? "Job Match"
                              : isDeadline
                              ? "Deadline Alert"
                              : "Application Window"}
                          </span>

                          <span className="text-[10px] text-[#86868B]">
                            {notif.trigger_date}
                          </span>
                        </div>

                        <p className={`text-xs leading-relaxed ${!notif.is_read ? "font-medium text-[#1D1D1F]" : "text-[#6E6E73]"}`}>
                          {notif.message}
                        </p>

                        <div className="flex items-center justify-between mt-2 pt-1 border-t border-[#E5E5EA]/60 text-[11px] text-[#6E6E73]">
                          <span>Deadline: {notif.application_deadline ? notif.application_deadline.split(" ")[0] : notif.trigger_date}</span>
                          {!notif.is_read ? (
                            <button
                              type="button"
                              onClick={(e) => markAsRead(notif.id, e)}
                              className="text-[#0071E3] hover:underline text-xs font-medium"
                            >
                              Mark read
                            </button>
                          ) : (
                            <span className="text-[#86868B] text-xs">Read</span>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {/* Footer */}
          <div className="px-4 py-2.5 bg-[#F5F5F7] border-t border-[#E5E5EA] text-xs text-[#6E6E73] flex items-center justify-between">
            <span>Automated deadline & application alerts</span>
            <span className="text-[#1D1D1F] font-medium">Aspire AI</span>
          </div>
        </div>
      )}
    </div>
  );
}
