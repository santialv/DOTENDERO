"use client";

import { SalesComparisonChart } from '@/components/charts/sales-comparison-chart';
import { TopProductsChart } from '@/components/charts/top-products-chart';
import { DownloadReports } from '@/components/reports/download-reports';

export default function ReportesPage() {
    return (
        <div className="p-6 space-y-6">
            <div className="flex flex-col gap-2">
                <h1 className="text-2xl font-bold text-slate-900">Reportes y Analítica</h1>
                <p className="text-slate-500">Visualiza el rendimiento de tu negocio con gráficas interactivas.</p>
            </div>

            {/* KPI Cards Summary (Optional placeholders) */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-white p-4 rounded-xl border border-slate-100 shadow-sm">
                    <p className="text-sm text-slate-500">Ventas Totales (Mes)</p>
                    <p className="text-2xl font-bold text-slate-900">$12,450,000</p>
                    <span className="text-xs text-green-500 font-medium flex items-center gap-1">
                        <span className="material-symbols-outlined text-[14px]">trending_up</span>
                        +12.5% vs mes anterior
                    </span>
                </div>
                <div className="bg-white p-4 rounded-xl border border-slate-100 shadow-sm">
                    <p className="text-sm text-slate-500">Beneficio Neto</p>
                    <p className="text-2xl font-bold text-slate-900">$3,200,000</p>
                    <span className="text-xs text-green-500 font-medium flex items-center gap-1">
                        <span className="material-symbols-outlined text-[14px]">trending_up</span>
                        +8.2% vs mes anterior
                    </span>
                </div>
                <div className="bg-white p-4 rounded-xl border border-slate-100 shadow-sm">
                    <p className="text-sm text-slate-500">Ticket Promedio</p>
                    <p className="text-2xl font-bold text-slate-900">$45,000</p>
                    <span className="text-xs text-red-500 font-medium flex items-center gap-1">
                        <span className="material-symbols-outlined text-[14px]">trending_down</span>
                        -2.1% vs mes anterior
                    </span>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <SalesComparisonChart />
                <TopProductsChart />
            </div>

            <DownloadReports />
        </div>
    );
}
