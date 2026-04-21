"use client";

import { useEffect, useRef, useState } from "react";
import { useNotifications } from "./NotificationContext";
import NotificationsDropdown from "@/components/NotificationsDropdown";

interface NotificationBellProps {
  className?: string;
}

export default function NotificationBell({ className }: NotificationBellProps) {
  const { unreadCount } = useNotifications();
  const prevUnreadCountRef = useRef<number>(unreadCount);
  const [shake, setShake] = useState<boolean>(false);

  useEffect(() => {
    let timeoutId: ReturnType<typeof setTimeout> | undefined;
    if (unreadCount > prevUnreadCountRef.current) {
      setShake(true);
      timeoutId = setTimeout(() => {
        setShake(false);
      }, 600);
    }
    prevUnreadCountRef.current = unreadCount;
    return () => {
      if (timeoutId !== undefined) {
        clearTimeout(timeoutId);
      }
    };
  }, [unreadCount]);

  return (
    <div className={`dropdown ${className ?? ""}`.trim()}>
      <button
        type="button"
        className="btn btn-link p-2 position-relative notification-bell-btn"
        data-bs-toggle="dropdown"
        aria-expanded="false"
        aria-label="Notifications"
        style={{ color: "var(--bs-body-color)", textDecoration: "none", lineHeight: 1 }}
      >
        <i
          className={`bi bi-bell-fill${shake ? " notification-bell-shake" : ""}`}
          style={{ fontSize: "1.25rem", display: "inline-block" }}
        />
        {unreadCount > 0 && (
          <span
            className="position-absolute badge bg-danger rounded-pill d-flex align-items-center justify-content-center"
            style={{
              top: 0,
              right: 0,
              minWidth: "18px",
              height: "18px",
              fontSize: "0.65rem",
              padding: "0 5px",
              transform: "translate(25%, -25%)",
            }}
            aria-label={`${unreadCount} unread notifications`}
          >
            {unreadCount > 9 ? "9+" : String(unreadCount)}
          </span>
        )}
      </button>
      <div
        className="dropdown-menu dropdown-menu-end p-0 shadow"
        style={{ minWidth: "380px" }}
      >
        <NotificationsDropdown />
      </div>
      <style jsx>{`
        @keyframes notification-bell-shake {
          0% { transform: rotate(0deg); }
          15% { transform: rotate(-15deg); }
          30% { transform: rotate(12deg); }
          45% { transform: rotate(-10deg); }
          60% { transform: rotate(8deg); }
          75% { transform: rotate(-4deg); }
          100% { transform: rotate(0deg); }
        }
        :global(.notification-bell-shake) {
          animation: notification-bell-shake 0.6s ease-in-out;
          transform-origin: 50% 0%;
        }
        .notification-bell-btn:hover {
          opacity: 0.75;
        }
        .notification-bell-btn:focus {
          box-shadow: none;
        }
      `}</style>
    </div>
  );
}
