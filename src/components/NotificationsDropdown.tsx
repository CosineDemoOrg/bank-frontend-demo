"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useNotifications, type NotificationCategory } from "./NotificationContext";

export function formatRelative(createdAt: number): string {
  const diff = Date.now() - createdAt;
  if (diff < 60_000) return "just now";
  if (diff < 3_600_000) return `${Math.floor(diff / 60_000)}m ago`;
  if (diff < 86_400_000) return `${Math.floor(diff / 3_600_000)}h ago`;
  if (diff < 7 * 86_400_000) return `${Math.floor(diff / 86_400_000)}d ago`;
  return new Date(createdAt).toLocaleDateString();
}

export function categoryIcon(c: NotificationCategory): string {
  switch (c) {
    case "transfer":
      return "bi-arrow-left-right";
    case "bill":
      return "bi-cash";
    case "loan":
      return "bi-cash-coin";
    case "system":
      return "bi-info-circle";
    case "security":
      return "bi-shield-lock";
  }
}

export function categoryLabel(c: NotificationCategory): string {
  switch (c) {
    case "transfer":
      return "Transfer";
    case "bill":
      return "Bill";
    case "loan":
      return "Loan";
    case "system":
      return "System";
    case "security":
      return "Security";
  }
}

function closeDropdown() {
  if (typeof document === "undefined") return;
  const toggle = document.querySelector<HTMLElement>(
    '[data-bs-toggle="dropdown"][aria-expanded="true"]'
  );
  if (toggle) toggle.click();
}

export default function NotificationsDropdown() {
  const { notifications, unreadCount, markRead, markAllRead } = useNotifications();
  const router = useRouter();
  const [, setTick] = useState(0);

  useEffect(() => {
    const id = setInterval(() => setTick((t) => t + 1), 30000);
    return () => clearInterval(id);
  }, []);

  const sorted = [...notifications].sort((a, b) => b.createdAt - a.createdAt).slice(0, 8);

  return (
    <div>
      <div className="d-flex justify-content-between align-items-center px-3 py-2 border-bottom">
        <span className="fw-semibold">Notifications</span>
        <button
          type="button"
          className="btn btn-link btn-sm p-0 text-decoration-none"
          onClick={() => markAllRead()}
          disabled={unreadCount === 0}
        >
          Mark all read
        </button>
      </div>

      {notifications.length === 0 ? (
        <div className="py-5 text-center text-secondary">
          <i className="bi bi-bell-slash fs-2 d-block mb-2" />
          You&apos;re all caught up
        </div>
      ) : (
        <div style={{ maxHeight: 420, overflowY: "auto" }}>
          {sorted.map((n) => (
            <button
              key={n.id}
              type="button"
              className={
                "w-100 text-start border-0 bg-transparent px-3 py-2 d-flex gap-3 align-items-start notif-row" +
                (!n.read ? " notif-row-unread" : "")
              }
              onClick={() => {
                markRead(n.id);
                closeDropdown();
                if (n.href) router.push(n.href);
              }}
            >
              <span
                className="flex-shrink-0 d-inline-flex align-items-center justify-content-center rounded-circle bg-body-tertiary"
                style={{ width: 32, height: 32 }}
              >
                <i className={"bi " + categoryIcon(n.category)} />
              </span>
              <div className="flex-grow-1" style={{ minWidth: 0 }}>
                <div
                  className="fw-semibold text-body"
                  style={{ fontSize: 15, lineHeight: 1.2 }}
                >
                  {n.title}
                </div>
                <div
                  className="text-secondary"
                  style={{
                    fontSize: 13,
                    display: "-webkit-box",
                    WebkitLineClamp: 2,
                    WebkitBoxOrient: "vertical",
                    overflow: "hidden",
                  }}
                >
                  {n.body}
                </div>
                <div className="text-secondary mt-1" style={{ fontSize: 12 }}>
                  {formatRelative(n.createdAt)}
                </div>
              </div>
              {!n.read && (
                <span
                  className="flex-shrink-0 rounded-circle bg-primary mt-2"
                  style={{ width: 8, height: 8 }}
                  aria-label="Unread"
                />
              )}
            </button>
          ))}
        </div>
      )}

      <div className="border-top px-3 py-2 text-center">
        <button
          type="button"
          className="btn btn-link btn-sm text-decoration-none"
          onClick={() => {
            closeDropdown();
            router.push("/notifications");
          }}
        >
          View all notifications
        </button>
      </div>

      <style jsx>{`
        .notif-row:hover {
          background-color: var(--bs-tertiary-bg);
          cursor: pointer;
        }
        .notif-row-unread {
          background-color: var(--bs-secondary-bg);
        }
        .notif-row-unread:hover {
          background-color: var(--bs-tertiary-bg);
        }
      `}</style>
    </div>
  );
}
