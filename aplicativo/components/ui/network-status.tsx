"use client";

import { useState, useEffect } from "react";
import { toast } from "sonner"; // Assuming sonner or useToast is used, checking usage in other files. 
// Wait, looking at previous files, I see: import { useToast } from "@/components/ui/toast";
// I will stick to a custom visual indicator that is less intrusive than a toast stack, or use the existing toast system.
// Let's use a non-intrusive bottom fixed banner that appears ONLY when offline.

export function NetworkStatus() {
    const [isOnline, setIsOnline] = useState(true);

    useEffect(() => {
        // Initial check
        setIsOnline(navigator.onLine);

        const handleOnline = () => {
            setIsOnline(true);
            // Optional: Trigger a sync or toast when back online
        };

        const handleOffline = () => {
            setIsOnline(false);
        };

        window.addEventListener("online", handleOnline);
        window.addEventListener("offline", handleOffline);

        return () => {
            window.removeEventListener("online", handleOnline);
            window.removeEventListener("offline", handleOffline);
        };
    }, []);

    if (isOnline) return null;

    return (
        <div className="fixed bottom-[80px] md:bottom-6 left-1/2 -translate-x-1/2 z-[150] animate-in slide-in-from-bottom-4 duration-300">
            <div className="bg-red-500 text-white px-4 py-2 rounded-full shadow-lg flex items-center gap-2 text-xs md:text-sm font-bold">
                <span className="material-symbols-outlined text-[16px] md:text-[18px] animate-pulse">wifi_off</span>
                <span>Sin conexión a internet</span>
            </div>
        </div>
    );
}
