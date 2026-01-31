"use client";

import { useEffect, useState } from "react";

export function InstallPrompt() {
    const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
    const [isVisible, setIsVisible] = useState(false);
    const [isIOS, setIsIOS] = useState(false);

    useEffect(() => {
        // Register Service Worker for PWA support
        if ('serviceWorker' in navigator) {
            navigator.serviceWorker.register('/sw.js').catch(console.error);
        }

        // Check if already installed
        if (window.matchMedia('(display-mode: standalone)').matches) {
            return;
        }

        // Detect iOS
        const isIosDevice = /iPad|iPhone|iPod/.test(navigator.userAgent) && !(window as any).MSStream;
        setIsIOS(isIosDevice);

        const handleBeforeInstallPrompt = (e: any) => {
            e.preventDefault();
            setDeferredPrompt(e);
            // Auto-show only on mobile or if desired, but we can respect user choice
            // keeping original behavior of show-on-event
            setIsVisible(true);
        };

        const handleManualTrigger = () => {
            if (deferredPrompt) {
                setIsVisible(true);
            } else if (isIosDevice) {
                setIsVisible(true); // Always show instructions for iOS
            } else {
                // Determine if we should warn or just ignore
                // For now, let's open the modal if possible, or maybe show a toast
                // But strictly, if no deferredPrompt, we can't 'install'.
                // Giving visual feedback is better.
                alert('Tu dispositivo ya tiene la app instalada o no es compatible con la instalación directa. Revisa el menú de tu navegador.');
            }
        };

        window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
        window.addEventListener("trigger-install-prompt", handleManualTrigger);

        // For iOS, we show the prompt after a short delay since there's no event
        if (isIosDevice) {
            const timer = setTimeout(() => setIsVisible(true), 3000);
            return () => {
                clearTimeout(timer);
                window.removeEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
                window.removeEventListener("trigger-install-prompt", handleManualTrigger);
            };
        }

        return () => {
            window.removeEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
            window.removeEventListener("trigger-install-prompt", handleManualTrigger);
        };
    }, [deferredPrompt]); // Added deferredPrompt dependency to ensure handler has latest state

    const handleInstallClick = async () => {
        if (!deferredPrompt) return;
        deferredPrompt.prompt();
        const { outcome } = await deferredPrompt.userChoice;
        if (outcome === "accepted") {
            setIsVisible(false);
        }
    };

    const [isExpanded, setIsExpanded] = useState(false);

    if (!isVisible) return null;

    return (
        <div className="fixed bottom-24 left-4 z-[100] animate-in fade-in zoom-in duration-500">
            {!isExpanded ? (
                // Floating Bubble (Closed State)
                <button
                    onClick={() => setIsExpanded(true)}
                    className="group relative flex items-center justify-center size-14 bg-primary rounded-full shadow-2xl shadow-primary/40 hover:scale-110 transition-transform active:scale-95 overflow-hidden"
                >
                    <div className="absolute inset-0 bg-white/20 animate-pulse"></div>
                    <img src="/icon.png" alt="App" className="size-8 object-contain relative z-10" />
                    <span className="absolute -top-1 -right-1 flex h-3 w-3">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500"></span>
                    </span>
                </button>
            ) : (
                // Expanded Message (Open State)
                <div
                    className="bg-slate-900 border border-white/10 rounded-[2rem] p-4 pr-12 shadow-2xl flex items-center gap-4 animate-in slide-in-from-left-4 duration-300 relative max-w-[calc(100vw-2rem)] md:max-w-xs"
                >
                    <div className="size-12 rounded-2xl bg-primary flex items-center justify-center shrink-0 shadow-lg">
                        <img src="/icon.png" alt="Logo" className="size-8 object-contain" />
                    </div>
                    <div className="flex-1 overflow-hidden">
                        <p className="text-white font-black text-xs uppercase tracking-tight truncate">Instalar App</p>
                        <p className="text-[10px] text-gray-400 leading-tight mt-0.5">
                            {isIOS ? "Toca compartir y 'Agregar a inicio'" : "Accede más rápido a tu negocio."}
                        </p>
                    </div>

                    <div className="flex flex-col gap-1 ml-2">
                        {!isIOS && (
                            <button
                                onClick={handleInstallClick}
                                className="bg-primary text-slate-900 text-[10px] font-black px-3 py-1.5 rounded-full hover:bg-white transition-colors"
                            >
                                INSTALAR
                            </button>
                        )}
                        <button
                            onClick={() => setIsExpanded(false)}
                            className="text-gray-500 text-[10px] font-bold hover:text-white transition-colors text-center"
                        >
                            Cerrar
                        </button>
                    </div>

                    <button
                        onClick={() => setIsVisible(false)}
                        className="absolute top-2 right-2 size-6 flex items-center justify-center text-gray-500 hover:text-white"
                    >
                        <span className="material-symbols-outlined text-[16px]">close</span>
                    </button>
                </div>
            )}
        </div>
    );
}
