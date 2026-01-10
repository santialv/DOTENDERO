"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabase";
import { formatCurrency } from "@/lib/utils";

export default function SuperAdminDashboard() {
    const [stats, setStats] = useState({
        total_stores: 0,
        active_stores: 0,
        total_volume: 0,
        new_stores_week: 0
    });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadDashboardData();
    }, []);

    const loadDashboardData = async () => {
        setLoading(true);
        try {
            // Attempt 1: Try RPC (Fastest & Preferred)
            const { data: statsData, error: statsError } = await supabase.rpc('get_admin_dashboard_stats');

            if (!statsError && statsData && statsData.length > 0) {
                setStats(statsData[0]);
                return;
            }

            // Attempt 2: Fallback (Manual Queries)
            console.warn("RPC Stats failed, switching to manual queries...", statsError);

            // 1. Total Stores
            const { count: totalStores } = await supabase
                .from('organizations')
                .select('*', { count: 'exact', head: true });

            // 2. Total Volume (This is heavy for client, so we might skip or approximate)
            // We can't sum easily without RPC or downloading all rows. 
            // We'll set it to 0 or leave previous value.

            // 3. New Stores (Last 7 days)
            const today = new Date();
            const lastWeek = new Date(today.setDate(today.getDate() - 7)).toISOString();
            const { count: newStores } = await supabase
                .from('organizations')
                .select('*', { count: 'exact', head: true })
                .gt('created_at', lastWeek);

            setStats(prev => ({
                ...prev,
                total_stores: totalStores || 0,
                new_stores_week: newStores || 0,
                active_stores: 0, // Hard to calculate client-side efficiently
                total_volume: 0   // Hard to calculate client-side efficiently
            }));

        } catch (error) {
            console.error("Error loading admin dashboard:", error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="h-screen overflow-y-auto bg-slate-50 font-sans text-slate-900">
            {/* Top Navigation */}
            <nav className="bg-slate-900 text-white px-8 py-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <div className="flex h-8 w-8 items-center justify-center rounded bg-[#13ec80] text-slate-900">
                        <span className="material-symbols-outlined text-xl">admin_panel_settings</span>
                    </div>
                    <div>
                        <h1 className="text-xl font-bold leading-none">DonTendero <span className="text-[#13ec80]">ADMIN</span></h1>
                        <p className="text-xs text-slate-400">Panel de Control Global</p>
                    </div>
                </div>
                <div className="flex items-center gap-4">
                    <div className="text-right hidden md:block">
                        <p className="text-sm font-bold">Super Admin</p>
                        <p className="text-xs text-slate-400">admin@dontendero.com</p>
                    </div>
                    <Link href="/login" className="p-2 hover:bg-white/10 rounded-full transition-colors text-red-400" title="Cerrar Sesión">
                        <span className="material-symbols-outlined">logout</span>
                    </Link>
                </div>
            </nav>

            <main className="p-8 max-w-7xl mx-auto">
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-2xl font-bold">Visión General del Negocio (SaaS)</h2>
                    <button onClick={loadDashboardData} className="text-sm text-slate-500 hover:text-slate-900 flex items-center gap-1">
                        <span className="material-symbols-outlined text-sm">refresh</span> Actualizar
                    </button>
                </div>

                {/* Metrics Grid */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
                    {/* Total Stores */}
                    <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100">
                        <div className="flex items-center gap-3 mb-2">
                            <div className="p-2 bg-blue-100 text-blue-700 rounded-lg">
                                <span className="material-symbols-outlined">store</span>
                            </div>
                            <span className="text-sm font-bold text-slate-500">Total Tiendas</span>
                        </div>
                        <p className="text-3xl font-black text-slate-900">{stats.total_stores}</p>
                        <p className="text-xs font-medium text-slate-400 mt-1">
                            Registradas en plataforma
                        </p>
                    </div>

                    {/* Active Stores */}
                    <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100">
                        <div className="flex items-center gap-3 mb-2">
                            <div className="p-2 bg-green-100 text-green-700 rounded-lg">
                                <span className="material-symbols-outlined">verified</span>
                            </div>
                            <span className="text-sm font-bold text-slate-500">Tiendas Activas</span>
                        </div>
                        <p className="text-3xl font-black text-slate-900">{stats.active_stores}</p>
                        <p className="text-xs font-medium text-green-600 mt-1">
                            Ventas en últimos 30 días
                        </p>
                    </div>

                    {/* New Stores */}
                    <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100">
                        <div className="flex items-center gap-3 mb-2">
                            <div className="p-2 bg-purple-100 text-purple-700 rounded-lg">
                                <span className="material-symbols-outlined">domain_add</span>
                            </div>
                            <span className="text-sm font-bold text-slate-500">Crecimiento (7d)</span>
                        </div>
                        <p className="text-3xl font-black text-slate-900">+{stats.new_stores_week}</p>
                        <p className="text-xs font-medium text-purple-600 mt-1">
                            Nuevas tiendas esta semana
                        </p>
                    </div>

                    {/* Total Volume */}
                    <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100">
                        <div className="flex items-center gap-3 mb-2">
                            <div className="p-2 bg-orange-100 text-orange-700 rounded-lg">
                                <span className="material-symbols-outlined">bar_chart_4_bars</span>
                            </div>
                            <span className="text-sm font-bold text-slate-500">Volumen Transado</span>
                        </div>
                        <p className="text-3xl font-black text-slate-900">{formatCurrency(stats.total_volume)}</p>
                        <p className="text-xs font-medium text-orange-600 mt-1">
                            Total ventas históricas
                        </p>
                    </div>
                </div>

                {/* Operational Tools Grid */}
                <h3 className="text-xl font-bold mb-4 text-slate-800">Herramientas de Administración</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">

                    {/* NEW: Stores Management Card */}
                    <Link href="/admin/tiendas" className="group">
                        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 hover:border-[#13ec80] hover:shadow-md transition-all cursor-pointer h-full">
                            <div className="h-12 w-12 bg-green-100 text-green-600 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                                <span className="material-symbols-outlined text-[28px]">storefront</span>
                            </div>
                            <h3 className="text-lg font-bold text-slate-900 mb-1">Administración de Tiendas</h3>
                            <p className="text-sm text-slate-500">Ver listado de tenants, gestionar estados y crear nuevas tiendas manualmente.</p>
                        </div>
                    </Link>

                    <Link href="/admin/comunicados" className="group">
                        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 hover:border-purple-200 hover:shadow-md transition-all cursor-pointer h-full">
                            <div className="h-12 w-12 bg-purple-100 text-purple-600 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                                <span className="material-symbols-outlined text-[28px]">campaign</span>
                            </div>
                            <h3 className="text-lg font-bold text-slate-900 mb-1">Centro de Comunicaciones</h3>
                            <p className="text-sm text-slate-500">Enviar alertas globales y anuncios a todos los clientes.</p>
                        </div>
                    </Link>

                    <Link href="/admin/legal" className="group">
                        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 hover:border-slate-800 hover:shadow-md transition-all cursor-pointer h-full">
                            <div className="h-12 w-12 bg-slate-100 text-slate-600 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                                <span className="material-symbols-outlined text-[28px]">gavel</span>
                            </div>
                            <h3 className="text-lg font-bold text-slate-900 mb-1">Legal (Términos)</h3>
                            <p className="text-sm text-slate-500">Gestiona los textos de Términos y Condiciones y Privacidad.</p>
                        </div>
                    </Link>

                    <Link href="/admin/financiera" className="group">
                        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 hover:border-blue-500 hover:shadow-md transition-all cursor-pointer h-full">
                            <div className="h-12 w-12 bg-blue-100 text-blue-600 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                                <span className="material-symbols-outlined text-[28px]">monitoring</span>
                            </div>
                            <h3 className="text-lg font-bold text-slate-900 mb-1">Zona Financiera</h3>
                            <p className="text-sm text-slate-500">Ingresos del SaaS, métricas MRR y facturación.</p>
                        </div>
                    </Link>

                    <Link href="/admin/soporte" className="group">
                        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 hover:border-purple-500 hover:shadow-md transition-all cursor-pointer h-full">
                            <div className="h-12 w-12 bg-purple-100 text-purple-600 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                                <span className="material-symbols-outlined text-[28px]">local_police</span>
                            </div>
                            <h3 className="text-lg font-bold text-slate-900 mb-1">Soporte Técnico</h3>
                            <p className="text-sm text-slate-500">Herramienta "Ghost Login" y logs de errores.</p>
                        </div>
                    </Link>

                    <Link href="/admin/auditoria" className="group">
                        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 hover:border-slate-800 hover:shadow-md transition-all cursor-pointer h-full">
                            <div className="h-12 w-12 bg-slate-100 text-slate-600 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                                <span className="material-symbols-outlined text-[28px]">security</span>
                            </div>
                            <h3 className="text-lg font-bold text-slate-900 mb-1">Auditoría & Logs</h3>
                            <p className="text-sm text-slate-500">Registro de seguridad y trazabilidad.</p>
                        </div>
                    </Link>

                    <Link href="/admin/planes" className="group">
                        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 hover:border-[#13ec80] hover:shadow-md transition-all cursor-pointer h-full">
                            <div className="h-12 w-12 bg-green-100 text-green-600 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                                <span className="material-symbols-outlined text-[28px]">payments</span>
                            </div>
                            <h3 className="text-lg font-bold text-slate-900 mb-1">Planes y Precios</h3>
                            <p className="text-sm text-slate-500">Gestiona la oferta comercial del SaaS.</p>
                        </div>
                    </Link>

                    <Link href="/admin/configuracion" className="group">
                        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 hover:border-red-400 hover:shadow-md transition-all cursor-pointer h-full">
                            <div className="h-12 w-12 bg-red-100 text-red-500 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                                <span className="material-symbols-outlined text-[28px]">tune</span>
                            </div>
                            <h3 className="text-lg font-bold text-slate-900 mb-1">Configuración Sistema</h3>
                            <p className="text-sm text-slate-500">Modo Mantenimiento, Registro Abierto, etc.</p>
                        </div>
                    </Link>
                    <Link href="/admin/marketing" className="group">
                        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 hover:border-orange-500 hover:shadow-md transition-all cursor-pointer h-full">
                            <div className="h-12 w-12 bg-orange-100 text-orange-600 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                                <span className="material-symbols-outlined text-[28px]">local_offer</span>
                            </div>
                            <h3 className="text-lg font-bold text-slate-900 mb-1">Marketing y Cupones</h3>
                            <p className="text-sm text-slate-500">Crea códigos de descuento (ej. "LANZAMIENTO") para captar clientes.</p>
                        </div>
                    </Link>

                </div>
            </main>
        </div>
    );
}
