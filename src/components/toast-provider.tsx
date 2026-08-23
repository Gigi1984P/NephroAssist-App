"use client";

import { useState, useEffect, createContext, useContext, useCallback } from "react";
import { Bell, X, Check } from "lucide-react";
import { Button } from "@/components/ui/button";

interface Toast {
  id: string;
  title: string;
  message: string;
  type: "info" | "success" | "warning" | "error";
}

interface ToastContextType {
  toasts: Toast[];
  addToast: (toast: Omit<Toast, "id">) => void;
  removeToast: (id: string) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) throw new Error("useToast must be used within ToastProvider");
  return context;
}

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const addToast = useCallback((toast: Omit<Toast, "id">) => {
    const id = Math.random().toString(36).slice(2);
    setToasts((prev) => [...prev, { ...toast, id }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 5000);
  }, []);

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  return (
    <ToastContext.Provider value={{ toasts, addToast, removeToast }}>
      {children}
      <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-2">
        {toasts.map((toast) => (
          <div
            key={toast.id}
            className={`rounded-lg border p-4 shadow-lg max-w-sm animate-in slide-in-from-right fade-in duration-300 ${
              toast.type === "error"
                ? "bg-red-50 border-red-200"
                : toast.type === "success"
                ? "bg-green-50 border-green-200"
                : toast.type === "warning"
                ? "bg-amber-50 border-amber-200"
                : "bg-white border-gray-200"
            }`}
          >
            <div className="flex items-start gap-3">
              <div className="flex-1">
                <h4 className="font-semibold text-sm">{toast.title}</h4>
                <p className="text-sm text-muted-foreground">{toast.message}</p>
              </div>
              <Button variant="ghost" size="sm" className="h-6 w-6 p-0" onClick={() => removeToast(toast.id)}>
                <X className="h-3 w-3" />
              </Button>
            </div>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}
