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

    if (!isVisible) return null;

    return (
        <div className="fixed bottom-24 left-4 right-4 md:bottom-8 md:right-8 md:left-auto md:w-80 z-[100] animate-in slide-in-from-bottom-5 duration-500">
            <div className="bg-white rounded-2xl shadow-2xl border border-slate-100 p-5 flex flex-col gap-4">
                <div className="flex items-start gap-4">
                    <div className="w-12 h-12 bg-[#13ec80] rounded-xl flex items-center justify-center shrink-0 shadow-sm border border-green-200">
                        <img src="/icon.png" alt="Logo" className="w-8 h-8 object-contain" />
                    </div>
                    <div className="flex-1">
                        <h3 className="font-bold text-slate-900 text-sm">Instalar DonTendero</h3>
                        <p className="text-xs text-slate-500 leading-relaxed mt-1">
                            {isIOS
                                ? "Agrégalo a tu pantalla de inicio para una mejor experiencia."
                                : "Instala la aplicación para acceder más rápido y sin distracciones."}
                        </p>
                    </div>
                    <button onClick={() => setIsVisible(false)} className="text-slate-400 hover:text-slate-600">
                        <span className="material-symbols-outlined text-sm">close</span>
                    </button>
                </div>

                {isIOS ? (
                    <div className="flex items-center gap-2 bg-slate-50 p-3 rounded-lg border border-slate-100">
                        <span className="text-[10px] font-medium text-slate-600 flex items-center gap-1.5 leading-none">
                            Toca <span className="material-symbols-outlined text-[18px] text-blue-500">ios_share</span> y luego <span className="font-bold text-slate-900">"Agregar a inicio"</span>
                        </span>
                    </div>
                ) : (
                    <button
                        onClick={handleInstallClick}
                        className="w-full bg-slate-900 text-white font-bold py-2.5 rounded-xl hover:bg-slate-800 transition-all active:scale-95 text-sm"
                    >
                        Instalar ahora
                    </button>
                )}
            </div>
        </div>
    );
}
