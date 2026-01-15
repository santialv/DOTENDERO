"use client";

import React, { createContext, useContext } from "react";
import { toast as sonnerToast, Toaster } from "sonner";

type ToastType = "success" | "error" | "info" | "warning";

interface ToastContextType {
    toast: (message: string, type?: ToastType) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export function ToastProvider({ children }: { children: React.ReactNode }) {
    const toast = (message: string, type: ToastType = "info") => {
        switch (type) {
            case "success":
                sonnerToast.success(message);
                break;
            case "error":
                sonnerToast.error(message);
                break;
            case "warning":
                sonnerToast.warning(message);
                break;
            case "info":
            default:
                sonnerToast.info(message);
                break;
        }
    };

    return (
        <ToastContext.Provider value={{ toast }}>
            {children}
            <Toaster position="top-center" richColors />
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
