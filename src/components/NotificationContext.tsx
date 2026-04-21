"use client";

import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

export type NotificationCategory =
  | "transfer"
  | "bill"
  | "loan"
  | "system"
  | "security";

export interface Notification {
  id: string;
  title: string;
  body: string;
  category: NotificationCategory;
  createdAt: number;
  read: boolean;
  href?: string;
}

export type NotificationInput = Omit<
  Notification,
  "id" | "createdAt" | "read"
> & { id?: string };

interface NotificationContextValue {
  notifications: Notification[];
  unreadCount: number;
  addNotification: (n: NotificationInput) => void;
  markRead: (id: string) => void;
  markAllRead: () => void;
  clearAll: () => void;
}

const NotificationContext = createContext<NotificationContextValue | null>(null);

export function useNotifications(): NotificationContextValue {
  const ctx = useContext(NotificationContext);
  if (!ctx) {
    throw new Error("useNotifications must be used within NotificationsProvider");
  }
  return ctx;
}

// ---------- Mock websocket-style bus ----------
type Listener = (n: Notification) => void;

export class MockNotificationSocket {
  private listeners: Set<Listener> = new Set();
  subscribe(cb: Listener) {
    this.listeners.add(cb);
  }
  unsubscribe(cb: Listener) {
    this.listeners.delete(cb);
  }
  emit(n: NotificationInput) {
    const full: Notification = {
      id: n.id ?? `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`,
      title: n.title,
      body: n.body,
      category: n.category,
      href: n.href,
      createdAt: Date.now(),
      read: false,
    };
    this.listeners.forEach((cb) => {
      try {
        cb(full);
      } catch (e) {
        // swallow — one bad listener shouldn't break the bus
      }
    });
  }
}

export const notificationBus = new MockNotificationSocket();

// ---------- Realistic seed + stream pool ----------
const STORAGE_KEY = "demo_notifications";

const SEED: Notification[] = [
  {
    id: "seed-1",
    title: "Statement ready",
    body: "Your April statement for checking •••4821 is ready to download.",
    category: "system",
    createdAt: Date.now() - 1000 * 60 * 60 * 6,
    read: false,
    href: "/bank-accounts",
  },
  {
    id: "seed-2",
    title: "Card payment due in 3 days",
    body: "Minimum payment of $142.30 on your Visa •••3321 is due April 24.",
    category: "bill",
    createdAt: Date.now() - 1000 * 60 * 60 * 2,
    read: false,
    href: "/bills",
  },
  {
    id: "seed-3",
    title: "New sign-in from Chrome on Mac",
    body: "We noticed a new sign-in from Cairo, EG. Was this you?",
    category: "security",
    createdAt: Date.now() - 1000 * 60 * 20,
    read: false,
  },
];

const STREAM_POOL: NotificationInput[] = [
  { title: "Transfer received", body: "$420.00 from Sara M. landed in checking.", category: "transfer", href: "/transfers" },
  { title: "Transfer sent", body: "Your transfer of $75.00 to Omar H. has settled.", category: "transfer", href: "/transfers" },
  { title: "Bill scheduled", body: "Electric bill of $68.40 scheduled for next Tuesday.", category: "bill", href: "/bills" },
  { title: "Autopay ran", body: "Internet bill of $49.99 was paid automatically.", category: "bill", href: "/bills" },
  { title: "Loan update", body: "Your car loan application moved to under review.", category: "loan", href: "/loans" },
  { title: "Loan approved", body: "Great news — your personal loan for $3,500 was approved.", category: "loan", href: "/loans" },
  { title: "Unusual activity alert", body: "A $199 purchase at TechMart looked unusual. Review it?", category: "security", href: "/credit-cards" },
  { title: "Card used abroad", body: "Your debit card was used at a merchant in Dubai.", category: "security" },
  { title: "Rewards earned", body: "You earned 240 points this week on your rewards card.", category: "system", href: "/credit-cards" },
  { title: "Low balance", body: "Checking •••4821 dropped below your $200 threshold.", category: "system", href: "/bank-accounts" },
  { title: "Direct deposit", body: "Payroll of $2,410.00 was deposited to checking.", category: "transfer" },
  { title: "Bill posted", body: "Your water utility bill for $31.10 was posted.", category: "bill", href: "/bills" },
];

function loadFromStorage(): Notification[] | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return null;
    return parsed as Notification[];
  } catch {
    return null;
  }
}

function saveToStorage(list: Notification[]) {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
  } catch {
    // quota / private mode — ignore
  }
}

function categoryToVariant(c: NotificationCategory): string {
  switch (c) {
    case "transfer": return "success";
    case "bill": return "warning";
    case "loan": return "info";
    case "security": return "danger";
    case "system":
    default: return "secondary";
  }
}

// Try to resolve Agent D's module once at module scope; if absent, leave null.
// Use a variable path so webpack does not statically resolve it — this lets the
// build succeed even if ./ToastSystem hasn't been written yet.
let ToastSystemModule: any = null;
try {
  const modName = "./ToastSystem";
  ToastSystemModule = require(modName);
} catch {
  ToastSystemModule = null;
}

// Resolve the hook reference once at module scope. Because this is a stable
// reference, calling `toastHookRef()` inside the bridge is deterministic
// across renders — the hook is either always called or never called for the
// lifetime of the app, which satisfies the Rules of Hooks.
const toastHookRef: null | (() => { showToast?: (o: { title?: string; body: string; variant?: string }) => void }) =
  ToastSystemModule && typeof ToastSystemModule.useToasts === "function"
    ? ToastSystemModule.useToasts
    : null;

function useToastBridge(): (n: Notification) => void {
  const toastCtx = toastHookRef ? toastHookRef() : null;

  return (n: Notification) => {
    if (toastCtx && typeof toastCtx.showToast === "function") {
      try {
        toastCtx.showToast({ title: n.title, body: n.body, variant: categoryToVariant(n.category) });
        return;
      } catch {}
    }
    if (typeof window !== "undefined") {
      const g = (window as any).__showToast;
      if (typeof g === "function") {
        try {
          g({ title: n.title, body: n.body, variant: categoryToVariant(n.category) });
          return;
        } catch {}
      }
    }
  };
}

export function NotificationsProvider({ children }: { children: React.ReactNode }) {
  const [notifications, setNotifications] = useState<Notification[]>(() => {
    const loaded = loadFromStorage();
    if (loaded && loaded.length) return loaded;
    return SEED;
  });

  const pushToast = useToastBridge();

  // persist
  useEffect(() => {
    saveToStorage(notifications);
  }, [notifications]);

  // keep a ref so bus subscriber and interval always see latest setter semantics
  const addFromBus = useCallback((n: Notification) => {
    setNotifications((prev) => {
      if (prev.some((p) => p.id === n.id)) return prev;
      return [n, ...prev].slice(0, 100);
    });
    pushToast(n);
  }, [pushToast]);

  // subscribe provider to the bus
  useEffect(() => {
    notificationBus.subscribe(addFromBus);
    return () => notificationBus.unsubscribe(addFromBus);
  }, [addFromBus]);

  // mock stream — every 12-20s push a random pool item via the bus
  useEffect(() => {
    let cancelled = false;
    let timer: ReturnType<typeof setTimeout> | null = null;

    const schedule = () => {
      const delay = 12000 + Math.floor(Math.random() * 8000); // 12–20s
      timer = setTimeout(() => {
        if (cancelled) return;
        const pick = STREAM_POOL[Math.floor(Math.random() * STREAM_POOL.length)];
        notificationBus.emit(pick);
        schedule();
      }, delay);
    };

    schedule();
    return () => {
      cancelled = true;
      if (timer) clearTimeout(timer);
    };
  }, []);

  const addNotification = useCallback((n: NotificationInput) => {
    // route through bus so all subscribers hear it (including this provider)
    notificationBus.emit(n);
  }, []);

  const markRead = useCallback((id: string) => {
    setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, read: true } : n)));
  }, []);

  const markAllRead = useCallback(() => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  }, []);

  const clearAll = useCallback(() => {
    setNotifications([]);
  }, []);

  const unreadCount = useMemo(
    () => notifications.reduce((acc, n) => acc + (n.read ? 0 : 1), 0),
    [notifications]
  );

  const value = useMemo<NotificationContextValue>(
    () => ({ notifications, unreadCount, addNotification, markRead, markAllRead, clearAll }),
    [notifications, unreadCount, addNotification, markRead, markAllRead, clearAll]
  );

  return (
    <NotificationContext.Provider value={value}>{children}</NotificationContext.Provider>
  );
}
