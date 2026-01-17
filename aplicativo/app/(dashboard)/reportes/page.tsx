"use client";

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { SalesComparisonChart } from '@/components/charts/sales-comparison-chart';
import { TopProductsChart } from '@/components/charts/top-products-chart';
import { DownloadReports } from '@/components/reports/download-reports';
import { IncomeStatement } from '@/components/reports/IncomeStatement'; // Kept for type safety if needed, or remove if unused. Actually remove if unused.
import { DailyStartLedger } from '@/components/reports/DailyStartLedger'; // Remove if unused.
import Link from 'next/link';

export default function ReportesPage() {
    const [loading, setLoading] = useState(true);
    const [stats, setStats] = useState({
        revenue: 0,
        revenueGrowth: 0,
        profit: 0,
        profitGrowth: 0,
        ticket: 0,
        ticketGrowth: 0
    });

    useEffect(() => {
        async function loadData() {
            setLoading(true);
            try {
                // 0. Get Org Context
                const { data: { session } } = await supabase.auth.getSession();
                if (!session) return;
                const { data: profile } = await supabase.from('profiles').select('organization_id').eq('id', session.user.id).single();
                const orgId = profile?.organization_id;

                if (!orgId) { setLoading(false); return; }

                // 1. Fetch Optimized KPIs from RPC
                const { data, error } = await supabase.rpc('get_dashboard_kpis', {
                    p_org_id: orgId
                });

                if (error) throw error;

                if (data) {
                    setStats({
                        revenue: data.revenue || 0,
                        revenueGrowth: data.revenueGrowth || 0,
                        profit: data.profit || 0,
                        profitGrowth: data.profitGrowth || 0,
                        ticket: data.ticket || 0,
                        ticketGrowth: data.ticketGrowth || 0
                    });
                }
            } catch (error) {
                console.error("Error loading dashboard stats:", error);
            } finally {
                setLoading(false);
            }
        }
        loadData();
    }, []);

    // Helper for cards
    const Card = ({ title, value, prefix = "$", diff, loading }: any) => {
        const isPositive = diff >= 0;
        return (
            <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm flex flex-col justify-between">
                <div>
                    <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wide">{title}</h3>
                    {loading ? (
                        <div className="h-8 w-24 bg-slate-100 rounded animate-pulse mt-1"></div>
                    ) : (
                        <p className="text-3xl font-black text-slate-900 mt-1">
                            {prefix}{value.toLocaleString(undefined, { maximumFractionDigits: 0 })}
                        </p>
                    )}
                </div>
                {!loading && (
                    <div className={`flex items-center gap-1 text-sm font-bold mt-4 ${isPositive ? 'text-green-500' : 'text-red-500'}`}>
                        <span className="material-symbols-outlined text-[18px]">
                            {isPositive ? 'trending_up' : 'trending_down'}
                        </span>
                        <span>{Math.abs(diff).toFixed(1)}% vs mes anterior</span>
                    </div>
                )}
            </div>
        );
    };

    return (
        <div className="p-6 space-y-6 bg-slate-50 min-h-full font-display">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="flex flex-col gap-2">
                    <h1 className="text-2xl font-black text-slate-900 tracking-tight">Reportes y Analítica</h1>
                    <p className="text-slate-500 font-medium">Visualiza el rendimiento de tu negocio en tiempo real.</p>
                </div>
                <div className="shrink-0">
                    <DownloadReports />
                </div>
            </div>

            {/* KPI Cards Summary */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Card
                    title="Ventas del Mes"
                    value={stats.revenue}
                    diff={stats.revenueGrowth}
                    loading={loading}
                />
                <Card
                    title="Utilidad Real"
                    value={stats.profit}
                    diff={stats.profitGrowth}
                    loading={loading}
                />
                <Card
                    title="Ticket Promedio"
                    value={stats.ticket}
                    diff={stats.ticketGrowth}
                    loading={loading}
                />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <SalesComparisonChart />
                <TopProductsChart />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
                <Link
                    href="/reportes/libro-diario"
                    target="_blank"
                    className="group bg-white p-6 rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-all flex flex-col gap-2 relative overflow-hidden"
                >
                    <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                        <span className="material-symbols-outlined text-6xl text-blue-600">menu_book</span>
                    </div>
                    <div className="flex items-center gap-3">
                        <div className="p-3 bg-blue-50 rounded-xl text-blue-600">
                            <span className="material-symbols-outlined">menu_book</span>
                        </div>
                        <h3 className="text-lg font-bold text-slate-900">Libro Diario</h3>
                    </div>
                    <p className="text-sm text-slate-500 font-medium leading-relaxed">
                        Consulta todos los movimientos detallados de ingresos y egresos, filtrados por fecha y responsable.
                    </p>
                </Link>

                <Link
                    href="/reportes/resultados"
                    target="_blank"
                    className="group bg-white p-6 rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-all flex flex-col gap-2 relative overflow-hidden"
                >
                    <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                        <span className="material-symbols-outlined text-6xl text-green-600">finance_chip</span>
                    </div>
                    <div className="flex items-center gap-3">
                        <div className="p-3 bg-green-50 rounded-xl text-green-600">
                            <span className="material-symbols-outlined">trending_up</span>
                        </div>
                        <h3 className="text-lg font-bold text-slate-900">Estado de Resultados</h3>
                    </div>
                    <p className="text-sm text-slate-500 font-medium leading-relaxed">
                        Analiza la rentabilidad de tu negocio (P&L). Compara ingresos vs costos y gastos operativos.
                    </p>
                </Link>
            </div>
        </div>
    );
}
