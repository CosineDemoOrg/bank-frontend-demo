"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { useNotifications } from "@/components/NotificationContext";
import {
  categoryIcon,
  categoryLabel,
  formatRelative,
} from "@/components/NotificationsDropdown";

type FilterKey =
  | "all"
  | "unread"
  | "transfer"
  | "bill"
  | "loan"
  | "system"
  | "security";

interface FilterTab {
  key: FilterKey;
  label: string;
}

const FILTER_TABS: FilterTab[] = [
  { key: "all", label: "All" },
  { key: "unread", label: "Unread" },
  { key: "transfer", label: "Transfers" },
  { key: "bill", label: "Bills" },
  { key: "loan", label: "Loans" },
  { key: "system", label: "System" },
  { key: "security", label: "Security" },
];

function dayBucket(ts: number): "Today" | "Yesterday" | "Earlier" {
  const d = new Date(ts);
  d.setHours(0, 0, 0, 0);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const diffDays = Math.round((today.getTime() - d.getTime()) / 86_400_000);
  if (diffDays <= 0) return "Today";
  if (diffDays === 1) return "Yesterday";
  return "Earlier";
}

export default function NotificationsPage() {
  const { notifications, unreadCount, markRead, markAllRead, clearAll } =
    useNotifications();
  const router = useRouter();
  const [filter, setFilter] = useState<FilterKey>("all");
  const [, setTick] = useState(0);

  useEffect(() => {
    const id = setInterval(() => setTick((t) => t + 1), 30000);
    return () => clearInterval(id);
  }, []);

  const counts = useMemo(
    () => ({
      all: notifications.length,
      unread: unreadCount,
      transfer: notifications.filter((n) => n.category === "transfer").length,
      bill: notifications.filter((n) => n.category === "bill").length,
      loan: notifications.filter((n) => n.category === "loan").length,
      system: notifications.filter((n) => n.category === "system").length,
      security: notifications.filter((n) => n.category === "security").length,
    }),
    [notifications, unreadCount]
  );

  const filtered = useMemo(() => {
    let list = notifications;
    if (filter === "unread") {
      list = list.filter((n) => !n.read);
    } else if (filter !== "all") {
      list = list.filter((n) => n.category === filter);
    }
    return [...list].sort((a, b) => b.createdAt - a.createdAt);
  }, [notifications, filter]);

  const grouped = useMemo(() => {
    const buckets: Record<"Today" | "Yesterday" | "Earlier", typeof filtered> = {
      Today: [],
      Yesterday: [],
      Earlier: [],
    };
    for (const n of filtered) {
      buckets[dayBucket(n.createdAt)].push(n);
    }
    const order: Array<"Today" | "Yesterday" | "Earlier"> = [
      "Today",
      "Yesterday",
      "Earlier",
    ];
    return order
      .map((label) => [label, buckets[label]] as const)
      .filter(([, items]) => items.length > 0);
  }, [filtered]);

  return (
    <>
      <div className="d-flex justify-content-between align-items-center mb-4 flex-wrap gap-2">
        <div>
          <h1 className="h3 mb-1">Notifications</h1>
          <div className="text-secondary">Realtime updates from your accounts</div>
        </div>
        <div className="d-flex gap-2">
          <button
            type="button"
            className="btn btn-sm btn-outline-secondary"
            onClick={markAllRead}
            disabled={unreadCount === 0}
          >
            <i className="bi bi-check2-all me-1" />
            Mark all read
          </button>
          <button
            type="button"
            className="btn btn-sm btn-outline-danger"
            onClick={() => {
              if (confirm("Clear all notifications?")) clearAll();
            }}
            disabled={notifications.length === 0}
          >
            <i className="bi bi-trash me-1" />
            Clear all
          </button>
        </div>
      </div>

      <ul className="nav nav-pills mb-4 flex-wrap gap-1">
        {FILTER_TABS.map((tab) => {
          const active = filter === tab.key;
          const count = counts[tab.key];
          return (
            <li key={tab.key} className="nav-item">
              <button
                type="button"
                className={"nav-link" + (active ? " active" : "")}
                onClick={() => setFilter(tab.key)}
              >
                {tab.label}{" "}
                <span className={"ms-1 " + (active ? "opacity-75" : "text-secondary")}>
                  ({count})
                </span>
              </button>
            </li>
          );
        })}
      </ul>

      {filtered.length === 0 ? (
        <div className="text-center py-5 text-secondary">
          <i className="bi bi-inbox fs-1 d-block mb-2" />
          No notifications here
        </div>
      ) : (
        grouped.map(([label, items]) => (
          <div key={label}>
            <div
              className="text-uppercase text-secondary small fw-semibold mb-2 mt-3"
              style={{ letterSpacing: "0.05em" }}
            >
              {label}
            </div>
            <div className="list-group">
              {items.map((n) => {
                const rowOnClick = () => {
                  markRead(n.id);
                  if (n.href) router.push(n.href);
                };
                return (
                  <div
                    key={n.id}
                    role="button"
                    tabIndex={0}
                    onClick={rowOnClick}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" || e.key === " ") {
                        e.preventDefault();
                        rowOnClick();
                      }
                    }}
                    className={
                      "list-group-item list-group-item-action d-flex gap-3 align-items-start py-3" +
                      (!n.read ? " notif-page-unread" : "")
                    }
                  >
                    <span
                      className="flex-shrink-0 d-inline-flex align-items-center justify-content-center rounded-circle bg-body-tertiary"
                      style={{ width: 40, height: 40 }}
                    >
                      <i className={"bi " + categoryIcon(n.category)} />
                    </span>
                    <div className="flex-grow-1 text-start" style={{ minWidth: 0 }}>
                      <div className="d-flex justify-content-between align-items-center gap-2 mb-1">
                        <div className="fw-semibold">{n.title}</div>
                        {!n.read && (
                          <span
                            className="badge bg-primary rounded-pill"
                            style={{ fontSize: 10 }}
                          >
                            New
                          </span>
                        )}
                      </div>
                      <div className="text-body" style={{ fontSize: 14 }}>
                        {n.body}
                      </div>
                      <div className="text-secondary small mt-2">
                        <span className="me-2">{categoryLabel(n.category)}</span>
                        <span>·</span>
                        <span className="mx-2">{formatRelative(n.createdAt)}</span>
                        <span>·</span>
                        <span className="ms-2">
                          {new Date(n.createdAt).toLocaleString()}
                        </span>
                      </div>
                    </div>
                    {!n.read && (
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          markRead(n.id);
                        }}
                        className="btn btn-sm btn-outline-secondary align-self-center"
                      >
                        <i className="bi bi-check2 me-1" />
                        Mark read
                      </button>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        ))
      )}

      <style jsx>{`
        .notif-page-unread {
          background-color: var(--bs-secondary-bg);
        }
      `}</style>
    </>
  );
}
