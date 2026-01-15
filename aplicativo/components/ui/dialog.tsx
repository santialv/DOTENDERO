"use client";

import * as React from "react";

const Dialog = ({ open, onOpenChange, children }: { open: boolean; onOpenChange: (open: boolean) => void; children: React.ReactNode }) => {
    if (!open) return null;

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-in fade-in duration-200">
            <div
                className="fixed inset-0"
                onClick={() => onOpenChange(false)}
            />
            <div className="relative z-50 w-auto">
                {children}
            </div>
        </div>
    );
};

const DialogContent = ({ children, className }: { children: React.ReactNode; className?: string }) => (
    <div className={`bg-white rounded-xl shadow-2xl w-full border border-slate-200 bg-white p-0 shadow-lg duration-200 animate-in zoom-in-95 ${className}`}>
        <div className="relative">
            {children}
        </div>
    </div>
);

const DialogHeader = ({ children, className }: { children: React.ReactNode; className?: string }) => (
    <div className={`flex flex-col space-y-1.5 text-center sm:text-left p-6 ${className}`}>
        {children}
    </div>
);

const DialogTitle = ({ children, className }: { children: React.ReactNode; className?: string }) => (
    <h2 className={`text-xl font-bold leading-none tracking-tight text-slate-900 ${className}`}>
        {children}
    </h2>
);

const DialogDescription = ({ children, className }: { children: React.ReactNode; className?: string }) => (
    <p className={`text-sm text-slate-500 ${className}`}>
        {children}
    </p>
);

export { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription };
