"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { useToast } from "@/components/ui/toast";

export default function ConfigPage() {
    const { toast } = useToast();
    const router = useRouter();

    const [loading, setLoading] = useState(true);
    const [maintenanceMode, setMaintenanceMode] = useState(false);
    const [registrationsOpen, setRegistrationsOpen] = useState(true);
    const [betaFeatures, setBetaFeatures] = useState(true); // Estético por ahora

    // Load state from DB on mount
    useEffect(() => {
        loadSettings();
    }, []);

    const loadSettings = async () => {
        setLoading(true);
        try {
            const { data, error } = await supabase.from('app_settings').select('*');
            if (error) throw error;

            if (data) {
                const regSetting = data.find(s => s.key === 'registrations_open');
                const maintSetting = data.find(s => s.key === 'maintenance_mode');

                if (regSetting) setRegistrationsOpen(regSetting.value);
                if (maintSetting) setMaintenanceMode(maintSetting.value);
            }
        } catch (error) {
            console.error("Error loading settings:", error);
            // Fallback to local handling if DB fails or not set up
        } finally {
            setLoading(false);
        }
    };

    const toggleSetting = async (key: string, newValue: boolean, setFn: (val: boolean) => void) => {
        // Optimistic update
        setFn(newValue);

        try {
            const { error } = await supabase
                .from('app_settings')
                .upsert({ key, value: newValue }); // Upsert handles insert or update

            if (error) throw error;
            toast("Configuración actualizada", "success");
        } catch (error) {
            console.error(`Error updating ${key}:`, error);
            toast("Error al guardar cambio", "error");
            setFn(!newValue); // Revert
        }
    };

    const handleMaintenanceToggle = () => {
        if (!maintenanceMode) {
            if (confirm("🛑 ¿ACTIVAR MODO MANTENIMIENTO GLOBAL? 🛑\n\nTodos los usuarios (excepto Admin) serán redirigidos a la pantalla de espera.")) {
                toggleSetting('maintenance_mode', true, setMaintenanceMode);
            }
        } else {
            toggleSetting('maintenance_mode', false, setMaintenanceMode);
        }
    };

    const handleRegistrationToggle = () => {
        toggleSetting('registrations_open', !registrationsOpen, setRegistrationsOpen);
    };

    return (
        <div className="h-screen overflow-y-auto bg-slate-50 font-sans text-slate-900">
            <nav className="bg-slate-900 text-white px-8 py-4 flex items-center justify-between sticky top-0 z-10 shadow-md">
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
                    <h2 className="text-3xl font-black text-slate-900">Control de Plataforma</h2>
                    <p className="text-slate-500">Gestina la disponibilidad y acceso a DonTendero.</p>
                </div>

                {loading ? (
                    <div className="p-12 text-center text-slate-400">Cargando configuración...</div>
                ) : (
                    <div className="space-y-6">

                        {/* Registration Toggle */}
                        <div className={`p-6 rounded-2xl border-2 transition-all ${!registrationsOpen ? 'bg-amber-50 border-amber-200' : 'bg-white border-slate-200 shadow-sm'}`}>
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-4">
                                    <div className={`h-12 w-12 rounded-xl flex items-center justify-center ${!registrationsOpen ? 'bg-amber-100 text-amber-600' : 'bg-green-100 text-green-600'}`}>
                                        <span className="material-symbols-outlined text-3xl">
                                            {registrationsOpen ? 'how_to_reg' : 'person_off'}
                                        </span>
                                    </div>
                                    <div>
                                        <h3 className="text-lg font-bold text-slate-900">
                                            {registrationsOpen ? 'Registros Abiertos' : 'Registros Cerrados'}
                                        </h3>
                                        <p className="text-sm text-slate-500">
                                            {registrationsOpen
                                                ? 'Cualquier persona puede crear una cuenta nueva.'
                                                : 'El formulario de registro mostrará un mensaje de "Lista de Espera".'}
                                        </p>
                                    </div>
                                </div>
                                <label className="relative inline-flex items-center cursor-pointer">
                                    <input type="checkbox" className="sr-only peer" checked={registrationsOpen} onChange={handleRegistrationToggle} />
                                    <div className={`w-14 h-7 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-6 after:w-6 after:transition-all ${registrationsOpen ? 'peer-checked:bg-green-500' : ''}`}></div>
                                </label>
                            </div>
                        </div>

                        {/* Maintenance Mode */}
                        <div className={`p-6 rounded-2xl border-2 transition-all ${maintenanceMode ? 'bg-red-50 border-red-200' : 'bg-white border-slate-200 shadow-sm'}`}>
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-4">
                                    <div className={`h-12 w-12 rounded-xl flex items-center justify-center ${maintenanceMode ? 'bg-red-100 text-red-600' : 'bg-slate-100 text-slate-400'}`}>
                                        <span className="material-symbols-outlined text-3xl">build</span>
                                    </div>
                                    <div>
                                        <h3 className="text-lg font-bold text-slate-900">Modo Mantenimiento</h3>
                                        <p className="text-sm text-slate-500">Bloquea el acceso a TODA la app (excepto Admin).</p>
                                    </div>
                                </div>
                                <label className="relative inline-flex items-center cursor-pointer">
                                    <input type="checkbox" className="sr-only peer" checked={maintenanceMode} onChange={handleMaintenanceToggle} />
                                    <div className="w-14 h-7 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-6 after:w-6 after:transition-all peer-checked:bg-red-500"></div>
                                </label>
                            </div>
                        </div>

                        {/* Feature Flags */}
                        <div className="p-6 bg-white rounded-2xl border border-slate-200 shadow-sm opacity-60 grayscale hover:grayscale-0 transition-all cursor-not-allowed" title="Próximamente">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-4">
                                    <div className="h-12 w-12 bg-purple-100 text-purple-600 rounded-xl flex items-center justify-center">
                                        <span className="material-symbols-outlined text-3xl">science</span>
                                    </div>
                                    <div>
                                        <h3 className="text-lg font-bold text-slate-900">Funciones Beta (IA)</h3>
                                        <p className="text-sm text-slate-500">Módulo en desarrollo.</p>
                                    </div>
                                </div>
                                <div className="px-3 py-1 bg-slate-100 rounded text-xs font-bold text-slate-400">PRONTO</div>
                            </div>
                        </div>
                    </div>
                )}

                <div className="mt-8 p-4 bg-slate-50 text-center rounded-xl text-xs text-slate-400 font-mono">
                    System Configuration v2.5.0 • Changes are applied immediately
                </div>
            </main>
        </div>
    );
}
