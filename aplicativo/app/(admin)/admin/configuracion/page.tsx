"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

export default function ConfigPage() {
    const [maintenanceMode, setMaintenanceMode] = useState(false);
    const [betaFeatures, setBetaFeatures] = useState(true);
    const [registrationsOpen, setRegistrationsOpen] = useState(true);
    const router = useRouter();

    // Load state from local storage on mount
    useEffect(() => {
        const savedMaintenance = localStorage.getItem("maintenanceMode");
        if (savedMaintenance === "true") {
            setMaintenanceMode(true);
        }
    }, []);

    const handleMaintenanceToggle = () => {
        const newState = !maintenanceMode;
        setMaintenanceMode(newState);
        localStorage.setItem("maintenanceMode", String(newState));

        if (newState) {
            if (confirm("🛑 ¿ACTIVAR MODO MANTENIMIENTO GLOBAL? 🛑\n\nTodos los usuarios (excepto Admin) serán redirigidos a la pantalla de espera.\n\nAl aceptar, te redirigiré para que veas la vista previa.")) {
                router.push("/mantenimiento");
            } else {
                // If user cancels, revert state
                setMaintenanceMode(false);
                localStorage.setItem("maintenanceMode", "false");
            }
        }
    };

    return (
        <div className="h-screen overflow-y-auto bg-slate-50 font-sans text-slate-900">
            <nav className="bg-slate-900 text-white px-8 py-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <Link href="/admin/dashboard" className="flex h-8 w-8 items-center justify-center rounded bg-[#13ec80] text-slate-900 hover:opacity-90 transition-opacity">
                        <span className="material-symbols-outlined text-xl">arrow_back</span>
                    </Link>
                    <div>
                        <h1 className="text-xl font-bold leading-none">DonTendero <span className="text-[#13ec80]">ADMIN</span></h1>
                        <p className="text-xs text-slate-400">Configuración Global del Sistema</p>
                    </div>
                </div>
            </nav>

            <main className="p-8 max-w-4xl mx-auto">
                <div className="mb-8">
                    <h2 className="text-3xl font-black text-slate-900">Feature Flags (Interruptores)</h2>
                    <p className="text-slate-500">Controla la disponibilidad global de tu plataforma.</p>
                </div>

                <div className="space-y-6">
                    {/* Maintenance Mode */}
                    <div className={`p-6 rounded-2xl border-2 transition-all ${maintenanceMode ? 'bg-red-50 border-red-200' : 'bg-white border-slate-200 shadow-sm'}`}>
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-4">
                                <div className={`h-12 w-12 rounded-xl flex items-center justify-center ${maintenanceMode ? 'bg-red-100 text-red-600' : 'bg-slate-100 text-slate-400'}`}>
                                    <span className="material-symbols-outlined text-3xl">build</span>
                                </div>
                                <div>
                                    <h3 className="text-lg font-bold text-slate-900">Modo Mantenimiento</h3>
                                    <p className="text-sm text-slate-500">Si se activa, los usuarios verán una pantalla de "Estamos trabajando" y no podrán entrar.</p>
                                </div>
                            </div>
                            <label className="relative inline-flex items-center cursor-pointer">
                                <input type="checkbox" className="sr-only peer" checked={maintenanceMode} onChange={handleMaintenanceToggle} />
                                <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-red-500"></div>
                            </label>
                        </div>
                    </div>

                    {/* Registration Toggle */}
                    <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            <div className="h-12 w-12 bg-green-100 text-green-600 rounded-xl flex items-center justify-center">
                                <span className="material-symbols-outlined text-3xl">how_to_reg</span>
                            </div>
                            <div>
                                <h3 className="text-lg font-bold text-slate-900">Permitir Nuevos Registros</h3>
                                <p className="text-sm text-slate-500">Desactívalo si quieres cerrar la plataforma a nuevos clientes temporalmente.</p>
                            </div>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer">
                            <input type="checkbox" className="sr-only peer" checked={registrationsOpen} onChange={() => setRegistrationsOpen(!registrationsOpen)} />
                            <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#13ec80]"></div>
                        </label>
                    </div>

                    {/* Beta Features */}
                    <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            <div className="h-12 w-12 bg-purple-100 text-purple-600 rounded-xl flex items-center justify-center">
                                <span className="material-symbols-outlined text-3xl">science</span>
                            </div>
                            <div>
                                <h3 className="text-lg font-bold text-slate-900">Funciones Beta (Experimental)</h3>
                                <p className="text-sm text-slate-500">Habilita módulos en desarrollo (ej. IA) para usuarios marcados como 'Early Adopters'.</p>
                            </div>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer">
                            <input type="checkbox" className="sr-only peer" checked={betaFeatures} onChange={() => setBetaFeatures(!betaFeatures)} />
                            <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-purple-600"></div>
                        </label>
                    </div>
                </div>

                <div className="mt-8 p-4 bg-slate-50 text-center rounded-xl text-xs text-slate-400 font-mono">
                    System uptime: 99.98% • Last deploy: 2 hours ago • v2.4.0
                </div>
            </main>
        </div>
    );
}
