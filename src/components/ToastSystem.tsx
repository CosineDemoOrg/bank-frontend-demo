"use client";

import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";
import { useRouter } from "next/navigation";

export type ToastVariant = "info" | "success" | "warning" | "danger" | "primary";

export interface ToastOptions {
  title?: string;
  body: string;
  variant?: ToastVariant;
  icon?: string;
  href?: string;
  durationMs?: number;
}

export interface Toast extends Required<Pick<ToastOptions, "body">> {
  id: string;
  title?: string;
  body: string;
  variant: ToastVariant;
  icon: string;
  href?: string;
  durationMs: number;
  createdAt: number;
}

export interface ToastsContextValue {
  showToast: (opts: ToastOptions) => void;
  dismiss: (id: string) => void;
}

type ToastState = "entering" | "visible" | "leaving";

interface InternalToast extends Toast {
  state: ToastState;
}

const DEFAULT_DURATION_MS = 5000;
const MAX_VISIBLE = 5;
const LEAVE_ANIMATION_MS = 200;

const DEFAULT_ICONS: Record<ToastVariant, string> = {
  success: "bi-check-circle-fill",
  warning: "bi-exclamation-triangle-fill",
  danger: "bi-x-circle-fill",
  info: "bi-info-circle-fill",
  primary: "bi-bell-fill",
};

const ToastsContext = createContext<ToastsContextValue | null>(null);

export function useToasts(): ToastsContextValue {
  const ctx = useContext(ToastsContext);
  if (!ctx) {
    throw new Error("useToasts must be used within a ToastsProvider");
  }
  return ctx;
}

function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

interface ToastCardProps {
  toast: InternalToast;
  onDismiss: (id: string) => void;
  onNavigate: (href: string, id: string) => void;
}

function ToastCard({ toast, onDismiss, onNavigate }: ToastCardProps): JSX.Element {
  const [progressWidth, setProgressWidth] = useState<string>("100%");

  useEffect(() => {
    const raf = requestAnimationFrame(() => {
      setProgressWidth("0%");
    });
    return () => cancelAnimationFrame(raf);
  }, []);

  const isLeaving = toast.state === "leaving";
  const isEntering = toast.state === "entering";
  const hidden = isLeaving || isEntering;

  const handleBodyClick = (): void => {
    if (toast.href) {
      onNavigate(toast.href, toast.id);
    }
  };

  const handleCloseClick = (e: React.MouseEvent<HTMLButtonElement>): void => {
    e.stopPropagation();
    onDismiss(toast.id);
  };

  return (
    <div
      style={{
        opacity: hidden ? 0 : 1,
        transform: hidden ? "translateX(24px)" : "translateX(0)",
        transition: "opacity 200ms ease, transform 200ms ease",
        pointerEvents: "auto",
      }}
    >
      <div
        role="alert"
        aria-live="assertive"
        aria-atomic="true"
        className="card shadow rounded border-0"
        style={{
          position: "relative",
          maxWidth: 380,
          overflow: "hidden",
          borderLeft: `4px solid var(--bs-${toast.variant})`,
        }}
      >
        <div className="d-flex p-3 gap-3">
          <i
            className={`bi ${toast.icon} text-${toast.variant}`}
            style={{ fontSize: "1.4rem", lineHeight: 1 }}
          />
          <div
            className="flex-grow-1"
            onClick={toast.href ? handleBodyClick : undefined}
            style={toast.href ? { cursor: "pointer" } : undefined}
          >
            {toast.title ? (
              <div className="fw-bold mb-1">{toast.title}</div>
            ) : null}
            <div className="small">{toast.body}</div>
          </div>
          <button
            type="button"
            className="btn-close"
            aria-label="Close"
            onClick={handleCloseClick}
          />
        </div>
        <div
          className={`bg-${toast.variant}`}
          style={{
            position: "absolute",
            left: 0,
            bottom: 0,
            height: 3,
            width: progressWidth,
            transition: `width ${toast.durationMs}ms linear`,
          }}
        />
      </div>
    </div>
  );
}

export function ToastsProvider({
  children,
}: {
  children: React.ReactNode;
}): JSX.Element {
  const [toasts, setToasts] = useState<InternalToast[]>([]);
  const router = useRouter();

  const autoTimersRef = useRef<Map<string, ReturnType<typeof setTimeout>>>(
    new Map()
  );
  const removeTimersRef = useRef<Map<string, ReturnType<typeof setTimeout>>>(
    new Map()
  );
  const enterTimersRef = useRef<Map<string, ReturnType<typeof setTimeout>>>(
    new Map()
  );

  const clearAutoTimer = useCallback((id: string): void => {
    const t = autoTimersRef.current.get(id);
    if (t) {
      clearTimeout(t);
      autoTimersRef.current.delete(id);
    }
  }, []);

  const dismiss = useCallback(
    (id: string): void => {
      clearAutoTimer(id);

      if (removeTimersRef.current.has(id)) {
        return;
      }

      setToasts((prev) =>
        prev.map((t) => (t.id === id ? { ...t, state: "leaving" } : t))
      );

      const removeTimer = setTimeout(() => {
        setToasts((prev) => prev.filter((t) => t.id !== id));
        removeTimersRef.current.delete(id);
      }, LEAVE_ANIMATION_MS);
      removeTimersRef.current.set(id, removeTimer);
    },
    [clearAutoTimer]
  );

  const showToast = useCallback(
    (opts: ToastOptions): void => {
      const variant: ToastVariant = opts.variant ?? "info";
      const icon = opts.icon ?? DEFAULT_ICONS[variant];
      const durationMs = opts.durationMs ?? DEFAULT_DURATION_MS;
      const id = generateId();

      const toast: InternalToast = {
        id,
        title: opts.title,
        body: opts.body,
        variant,
        icon,
        href: opts.href,
        durationMs,
        createdAt: Date.now(),
        state: "entering",
      };

      setToasts((prev) => {
        const next = [...prev, toast];
        const visible = next.filter((t) => t.state !== "leaving");
        if (visible.length > MAX_VISIBLE) {
          const overflow = visible.slice(0, visible.length - MAX_VISIBLE);
          for (const t of overflow) {
            queueMicrotask(() => dismiss(t.id));
          }
        }
        return next;
      });

      const enterTimer = setTimeout(() => {
        setToasts((prev) =>
          prev.map((t) => (t.id === id ? { ...t, state: "visible" } : t))
        );
        enterTimersRef.current.delete(id);
      }, 10);
      enterTimersRef.current.set(id, enterTimer);

      const autoTimer = setTimeout(() => {
        autoTimersRef.current.delete(id);
        dismiss(id);
      }, durationMs);
      autoTimersRef.current.set(id, autoTimer);
    },
    [dismiss]
  );

  const showToastRef = useRef(showToast);
  useEffect(() => {
    showToastRef.current = showToast;
  }, [showToast]);

  useEffect(() => {
    if (typeof window === "undefined") return;
    (window as any).__showToast = (opts: ToastOptions): void => {
      showToastRef.current(opts);
    };
    return () => {
      if (typeof window !== "undefined") {
        delete (window as unknown as { __showToast?: unknown }).__showToast;
      }
    };
  }, []);

  useEffect(() => {
    const autoTimers = autoTimersRef.current;
    const removeTimers = removeTimersRef.current;
    const enterTimers = enterTimersRef.current;
    return () => {
      autoTimers.forEach((t) => clearTimeout(t));
      removeTimers.forEach((t) => clearTimeout(t));
      enterTimers.forEach((t) => clearTimeout(t));
      autoTimers.clear();
      removeTimers.clear();
      enterTimers.clear();
    };
  }, []);

  const handleNavigate = useCallback(
    (href: string, id: string): void => {
      router.push(href);
      dismiss(id);
    },
    [dismiss, router]
  );

  const contextValue: ToastsContextValue = {
    showToast,
    dismiss,
  };

  return (
    <ToastsContext.Provider value={contextValue}>
      {children}
      <div
        style={{
          position: "fixed",
          top: 80,
          right: 16,
          zIndex: 1090,
          display: "flex",
          flexDirection: "column",
          gap: 12,
          pointerEvents: "none",
        }}
      >
        {toasts.map((toast) => (
          <ToastCard
            key={toast.id}
            toast={toast}
            onDismiss={dismiss}
            onNavigate={handleNavigate}
          />
        ))}
      </div>
    </ToastsContext.Provider>
  );
}
