"use client";

import Link from "next/link";

export default function MaintenancePage() {
    return (
        <div className="min-h-screen bg-slate-900 flex flex-col items-center justify-center text-center p-8 relative overflow-hidden">
            {/* Background Elements */}
            <div className="absolute top-0 left-0 w-full h-full opacity-10 pointer-events-none">
                <div className="absolute top-10 left-10 w-64 h-64 bg-[#13ec80] rounded-full blur-[100px]"></div>
                <div className="absolute bottom-10 right-10 w-96 h-96 bg-purple-600 rounded-full blur-[100px]"></div>
            </div>

            <div className="relative z-10 max-w-lg">
                <div className="w-24 h-24 bg-slate-800 rounded-3xl flex items-center justify-center mx-auto mb-8 shadow-2xl border border-slate-700 animate-bounce">
                    <span className="material-symbols-outlined text-5xl text-[#13ec80]">engineering</span>
                </div>

                <h1 className="text-4xl md:text-5xl font-black text-white mb-6">
                    Estamos Mejorando <br />
                    <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#13ec80] to-green-400">Tu Experiencia</span>
                </h1>

                <p className="text-slate-400 text-lg mb-8 leading-relaxed">
                    DonTendero está en mantenimiento programado para implementar nuevas funciones.
                    <br />
                    Volveremos en unos minutos. Gracias por tu paciencia.
                </p>

                <div className="flex gap-4 justify-center">
                    <button className="px-6 py-3 bg-white/5 backdrop-blur-md border border-white/10 rounded-xl text-white font-bold hover:bg-white/10 transition-all flex items-center gap-2">
                        <span className="material-symbols-outlined">refresh</span>
                        Intentar Recargar
                    </button>
                    <Link href="https://status.dontendero.com" className="px-6 py-3 bg-transparent text-slate-400 font-bold hover:text-white transition-all flex items-center gap-2">
                        Ver Estado del Servidor
                    </Link>
                </div>
            </div>

            {/* Admin Bypass Button (For Demo Purposes) */}
            <div className="absolute bottom-8 right-8">
                <Link href="/admin/configuracion" className="px-4 py-2 bg-red-500/10 border border-red-500/20 text-red-500 rounded-lg text-xs font-bold hover:bg-red-500/20 transition-all flex items-center gap-2">
                    <span className="material-symbols-outlined text-sm">lock_open</span>
                    Admin Bypass (Volver)
                </Link>
            </div>

            <div className="absolute bottom-8 left-8 text-slate-600 text-xs font-mono">
                Error Code: 503_SERVICE_UNAVAILABLE
            </div>
        </div>
    );
}
