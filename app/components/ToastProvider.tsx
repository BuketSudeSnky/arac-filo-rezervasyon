"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";

type ToastType = "success" | "error" | "info";

type Toast = {
  type: ToastType;
  message: string;
};

type ToastContextType = {
  showToast: (message: string, type?: ToastType) => void;
};

const ToastContext = createContext<ToastContextType | null>(
  null
);

export function ToastProvider({
  children,
}: {
  children: ReactNode;
}) {
  const [toast, setToast] = useState<Toast | null>(null);

  const showToast = useCallback(
    (
      message: string,
      type: ToastType = "success"
    ) => {
      setToast({ message, type });
    },
    []
  );

  useEffect(() => {
    if (!toast) {
      return;
    }

    const timer = window.setTimeout(() => {
      setToast(null);
    }, 3000);

    return () => window.clearTimeout(timer);
  }, [toast]);

  const toastStyle = {
    success:
      "border-green-200 bg-green-50 text-green-800",
    error: "border-red-200 bg-red-50 text-red-800",
    info: "border-blue-200 bg-blue-50 text-blue-800",
  };

  const toastIcon = {
    success: "✓",
    error: "!",
    info: "i",
  };

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}

      {toast && (
        <div
          role="status"
          aria-live="polite"
          className={`fixed right-5 top-5 z-[9999] flex min-w-[300px] max-w-md items-center justify-between gap-4 rounded-xl border px-4 py-3 shadow-lg ${toastStyle[toast.type]}`}
        >
          <div className="flex items-center gap-3">
            <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full border font-bold">
              {toastIcon[toast.type]}
            </span>

            <p className="text-sm font-semibold">
              {toast.message}
            </p>
          </div>

          <button
            type="button"
            onClick={() => setToast(null)}
            aria-label="Bildirimi kapat"
            className="text-xl leading-none opacity-60 transition hover:opacity-100"
          >
            ×
          </button>
        </div>
      )}
    </ToastContext.Provider>
  );
}

export function useToast() {
  const context = useContext(ToastContext);

  if (!context) {
    throw new Error(
      "useToast, ToastProvider içerisinde kullanılmalıdır."
    );
  }

  return context;
}