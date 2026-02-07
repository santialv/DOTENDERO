'use client';

import { useEffect } from 'react';

export default function Error({
    error,
    reset,
}: {
    error: Error & { digest?: string };
    reset: () => void;
}) {
    useEffect(() => {
        // Log error to monitoring service (Sentry)
        console.error("Dashboard Error Boundary Caught:", error);
    }, [error]);

    return (
        <div className="flex flex-col items-center justify-center h-[calc(100vh-100px)] p-8 text-center space-y-6">
            <div className="bg-red-50 p-6 rounded-full animate-in zoom-in duration-300">
                <span className="material-symbols-outlined text-red-500 text-6xl">dizzy</span>
            </div>

            <div className="space-y-2">
                <h2 className="text-2xl font-black text-slate-900">¡Ups! Algo salió mal</h2>
                <p className="text-slate-500 max-w-md mx-auto">
                    Hemos detectado un problema al cargar esta sección. No te preocupes, el resto de la aplicación sigue funcionando.
                </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 pt-2">
                <button
                    onClick={() => reset()}
                    className="px-6 py-3 bg-[#13ec80] hover:bg-[#0eb562] text-slate-900 font-bold rounded-xl transition-all shadow-lg shadow-[#13ec80]/20 active:scale-95 flex items-center justify-center gap-2"
                >
                    <span className="material-symbols-outlined text-[20px]">refresh</span>
                    Intentar de nuevo
                </button>

                <button
                    onClick={() => window.location.href = '/dashboard'} // Fallback to safe zone
                    className="px-6 py-3 bg-white border-2 border-slate-200 hover:bg-slate-50 text-slate-700 font-bold rounded-xl transition-all active:scale-95"
                >
                    Ir al Inicio
                </button>
            </div>

            {/* Dev Info for debugging without breaking UI */}
            <div className="mt-8 text-left max-w-2xl w-full">
                <details className="cursor-pointer group">
                    <summary className="text-xs font-bold text-slate-400 uppercase tracking-widest hover:text-slate-600 transition-colors list-none flex items-center gap-2 justify-center">
                        <span className="material-symbols-outlined text sm group-open:rotate-180 transition-transform">expand_more</span>
                        Ver detalles técnicos
                    </summary>
                    <div className="mt-4 bg-slate-900 rounded-xl p-4 overflow-auto max-h-60 custom-scrollbar border border-slate-800">
                        <p className="text-red-400 font-mono text-xs mb-2 font-bold">{error.name}: {error.message}</p>
                        <pre className="text-slate-500 font-mono text-[10px] whitespace-pre-wrap">{error.stack}</pre>
                        {error.digest && <p className="text-slate-600 font-mono text-[10px] mt-2">Digest: {error.digest}</p>}
                    </div>
                </details>
            </div>
        </div>
    );
}
