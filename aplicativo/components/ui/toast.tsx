"use client";

import React, { createContext, useContext, useState, useCallback } from "react";

type ToastType = "success" | "error" | "info" | "warning";

interface Toast {
    id: string;
    message: string;
    type: ToastType;
}

interface ToastContextType {
    toast: (message: string, type?: ToastType) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export function ToastProvider({ children }: { children: React.ReactNode }) {
    const [toasts, setToasts] = useState<Toast[]>([]);

    const addToast = useCallback((message: string, type: ToastType = "info") => {
        const id = crypto.randomUUID();
        setToasts((prev) => [...prev, { id, message, type }]);

        // Auto remove after 3 seconds
        setTimeout(() => {
            setToasts((prev) => prev.filter((t) => t.id !== id));
        }, 3000);
    }, []);

    const removeToast = useCallback((id: string) => {
        setToasts((prev) => prev.filter((t) => t.id !== id));
    }, []);

    return (
        <ToastContext.Provider value={{ toast: addToast }}>
            {children}
            <div className="fixed bottom-6 right-6 z-[100] flex flex-col gap-3 pointer-events-none">
                {toasts.map((t) => (
                    <div
                        key={t.id}
                        className={`pointer-events-auto flex items-center gap-3 px-4 py-3 rounded-xl shadow-lg border animate-in slide-in-from-right-full fade-in duration-300 ${t.type === "success"
                                ? "bg-white border-green-200 text-slate-800"
                                : t.type === "error"
                                    ? "bg-white border-red-200 text-slate-800"
                                    : t.type === "warning"
                                        ? "bg-white border-orange-200 text-slate-800"
                                        : "bg-white border-slate-200 text-slate-800"
                            }`}
                    >
                        <div
                            className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${t.type === "success"
                                    ? "bg-green-100 text-green-600"
                                    : t.type === "error"
                                        ? "bg-red-100 text-red-600"
                                        : t.type === "warning"
                                            ? "bg-orange-100 text-orange-600"
                                            : "bg-blue-100 text-blue-600"
                                }`}
                        >
                            <span className="material-symbols-outlined text-[20px]">
                                {t.type === "success"
                                    ? "check"
                                    : t.type === "error"
                                        ? "error"
                                        : t.type === "warning"
                                            ? "warning"
                                            : "info"}
                            </span>
                        </div>
                        <p className="text-sm font-semibold">{t.message}</p>
                        <button
                            onClick={() => removeToast(t.id)}
                            className="ml-2 text-slate-400 hover:text-slate-600 transition-colors"
                        >
                            <span className="material-symbols-outlined text-[18px]">close</span>
                        </button>
                    </div>
                ))}
            </div>
        </ToastContext.Provider>
    );
}

export function useToast() {
    const context = useContext(ToastContext);
    if (context === undefined) {
        throw new Error("useToast must be used within a ToastProvider");
    }
    return context;
}
