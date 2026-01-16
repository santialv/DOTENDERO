'use client';

import { useEffect } from 'react';
import Link from 'next/link';

export default function Error({
    error,
    reset,
}: {
    error: Error & { digest?: string };
    reset: () => void;
}) {
    useEffect(() => {
        // Optionally log the error to an error reporting service
        console.error(error);
    }, [error]);

    return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50 p-6 text-center">
            <div className="w-24 h-24 bg-red-100 text-red-600 rounded-full flex items-center justify-center mb-6 animate-in zoom-in duration-300">
                <span className="material-symbols-outlined text-[48px]">error_outline</span>
            </div>

            <h2 className="text-2xl font-black text-slate-900 mb-2">Algo salió mal</h2>
            <p className="text-slate-500 mb-8 max-w-sm mx-auto">
                Ocurrió un error inesperado en la aplicación. No te preocupes, tus datos están seguros.
            </p>

            <div className="flex flex-col gap-3 w-full max-w-xs">
                <button
                    onClick={() => reset()}
                    className="w-full bg-slate-900 hover:bg-slate-800 text-white font-bold py-3.5 rounded-xl shadow-lg transition-all active:scale-95"
                >
                    Intentar de nuevo
                </button>

                <Link
                    href="/"
                    className="w-full bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 font-bold py-3.5 rounded-xl transition-all active:scale-95 block"
                >
                    Ir al Inicio
                </Link>
            </div>

            <div className="mt-12 p-4 bg-white rounded-lg border border-slate-200 max-w-md w-full text-left">
                <p className="text-xs font-bold text-slate-400 uppercase mb-2">Detalle Técnico (Beta):</p>
                <code className="text-[10px] text-slate-500 font-mono block break-words bg-slate-50 p-2 rounded">
                    {error.message || "Error desconocido"}
                </code>
            </div>
        </div>
    );
}
