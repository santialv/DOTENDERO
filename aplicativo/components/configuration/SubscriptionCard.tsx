"use client";

import { useState } from 'react';

// Mock Data
const SUBSCRIPTION_DATA = {
    planName: "Plan DonTendero Pro",
    status: "active",
    amount: 150000,
    currency: "COP",
    nextPayment: "2026-01-15",
    daysRemaining: 18,
    cardLast4: "8832",
    history: [
        { date: "15 Dic 2025", concept: "Mensualidad Plan Pro", amount: 150000, status: "Pagado", ref: "REF-9921" },
        { date: "15 Nov 2025", concept: "Mensualidad Plan Pro", amount: 150000, status: "Pagado", ref: "REF-8842" },
        { date: "15 Oct 2025", concept: "Mensualidad Plan Pro", amount: 150000, status: "Pagado", ref: "REF-7731" },
    ]
};

export const SubscriptionCard = () => {
    const formatCurrency = (val: number) => {
        return new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', maximumFractionDigits: 0 }).format(val);
    };

    return (
        <div className="flex flex-col gap-8 font-body">

            {/* Header Section */}
            <div className="flex flex-col gap-2">
                <div className="flex items-center gap-2 text-sm text-slate-500">
                    <span>Configuración</span>
                    <span className="material-symbols-outlined text-[14px]">chevron_right</span>
                    <span className="text-emerald-600 font-bold bg-emerald-50 px-2 py-0.5 rounded-md">Mi Suscripción</span>
                </div>
                <h1 className="text-3xl md:text-4xl font-black text-slate-900 tracking-tight">
                    Tu <span className="bg-clip-text text-transparent bg-gradient-to-r from-emerald-600 to-teal-500">Membresía</span>
                </h1>
                <p className="text-slate-500 max-w-2xl">
                    Gestiona el crecimiento de tu negocio sin interrupciones. Aquí tienes el resumen de tu cuenta y facturación del software.
                </p>
            </div>

            {/* KPI Cards Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">

                {/* 1. Time Remaining (Featured) */}
                <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-emerald-600 to-teal-600 text-white shadow-lg shadow-emerald-500/20 group">
                    <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:opacity-20 transition-opacity">
                        <span className="material-symbols-outlined text-[120px]">hourglass_top</span>
                    </div>
                    <div className="relative p-6 h-full flex flex-col justify-between z-10">
                        <div className="flex items-center gap-2 mb-4">
                            <div className="p-2 bg-white/20 rounded-lg backdrop-blur-sm">
                                <span className="material-symbols-outlined text-[20px]">calendar_clock</span>
                            </div>
                            <p className="font-medium text-emerald-50">Tiempo Restante</p>
                        </div>
                        <div>
                            <p className="text-4xl font-black mb-1">{SUBSCRIPTION_DATA.daysRemaining} Días</p>
                            <div className="w-full bg-black/20 rounded-full h-1.5 mt-2 overflow-hidden">
                                <div className="bg-white h-1.5 rounded-full" style={{ width: '60%' }}></div>
                            </div>
                            <p className="text-xs text-emerald-100 mt-2 font-medium">Renovación automática activa</p>
                        </div>
                    </div>
                </div>

                {/* 2. Next Charge */}
                <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm relative group hover:shadow-md transition-all">
                    <div className="flex items-center gap-2 mb-6">
                        <div className="p-2 bg-indigo-50 text-indigo-600 rounded-lg">
                            <span className="material-symbols-outlined text-[20px]">event</span>
                        </div>
                        <p className="text-slate-500 font-medium">Próximo cobro</p>
                    </div>
                    <div>
                        <p className="text-3xl font-black text-slate-900">15 Ene</p>
                        <p className="text-lg text-slate-400">2026</p>
                    </div>
                </div>

                {/* 3. Monthly Amount */}
                <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm relative group hover:shadow-md transition-all">
                    <div className="flex items-center gap-2 mb-6">
                        <div className="p-2 bg-amber-50 text-amber-600 rounded-lg">
                            <span className="material-symbols-outlined text-[20px]">payments</span>
                        </div>
                        <p className="text-slate-500 font-medium">Monto mensual</p>
                    </div>
                    <div className="flex items-baseline gap-1">
                        <p className="text-3xl font-black text-slate-900 tracking-tight">{formatCurrency(SUBSCRIPTION_DATA.amount)}</p>
                        <span className="text-sm text-slate-400 font-medium">COP</span>
                    </div>
                </div>
            </div>

            {/* Main Content Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

                {/* Plan Details & Actions (2/3 width) */}
                <div className="lg:col-span-2 flex flex-col rounded-2xl border border-slate-200 bg-white shadow-sm overflow-hidden">
                    <div className="p-8 flex flex-col gap-8 relative">
                        {/* Decorative Background */}
                        <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-emerald-50 to-teal-50 rounded-bl-full -z-0"></div>

                        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-6 relative z-10">
                            <div className="space-y-2">
                                <div className="flex items-center gap-3">
                                    <h3 className="text-slate-900 text-2xl font-black tracking-tight">{SUBSCRIPTION_DATA.planName}</h3>
                                    <span className="bg-emerald-100 text-emerald-700 text-xs px-3 py-1 rounded-full font-bold uppercase tracking-wide flex items-center gap-1.5 shadow-sm border border-emerald-200">
                                        <span className="relative flex h-2 w-2">
                                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                                            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                                        </span>
                                        Activo
                                    </span>
                                </div>
                                <p className="text-slate-500 font-medium">Facturación mensual recurrente</p>
                            </div>
                            <div className="flex flex-col items-start sm:items-end bg-slate-50 p-4 rounded-xl border border-slate-100">
                                <p className="text-slate-900 text-3xl font-black tracking-tight">{formatCurrency(SUBSCRIPTION_DATA.amount)}</p>
                                <span className="text-slate-400 text-xs font-bold uppercase tracking-wider">Por mes + IVA</span>
                            </div>
                        </div>

                        {/* Features List */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-4 gap-x-8 relative z-10">
                            {[
                                "Acceso ilimitado al inventario",
                                "Soporte prioritario 24/7",
                                "Módulo Financiero Avanzado",
                                "Multiusuario (hasta 3 cuentas)"
                            ].map((feature, idx) => (
                                <div key={idx} className="flex items-center gap-3 group">
                                    <div className="bg-emerald-50 p-1.5 rounded-full text-emerald-600 group-hover:scale-110 transition-transform">
                                        <span className="material-symbols-outlined text-[18px]">check</span>
                                    </div>
                                    <span className="text-sm font-medium text-slate-700">{feature}</span>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Action Bar */}
                    <div className="bg-slate-50 p-6 border-t border-slate-200 flex flex-wrap gap-6 justify-between items-center">
                        <span className="text-sm text-slate-500 font-medium">
                            ¿Quieres pagar el año completo?
                            <a href="#" className="text-emerald-600 font-bold hover:underline decoration-2 underline-offset-2 ml-1">Ahorra un 20%</a>
                        </span>
                        <button className="relative overflow-hidden group bg-gradient-to-r from-slate-900 to-slate-800 text-white font-bold py-3 px-8 rounded-xl shadow-lg shadow-slate-500/30 hover:shadow-slate-500/50 transition-all hover:-translate-y-0.5 w-full sm:w-auto">
                            <span className="absolute top-0 left-0 w-full h-full bg-white/10 translate-y-full group-hover:translate-y-0 transition-transform duration-300"></span>
                            <div className="relative flex items-center justify-center gap-2">
                                <span className="material-symbols-outlined text-[20px]">credit_card</span>
                                <span>Pagar Mensualidad</span>
                            </div>
                        </button>
                    </div>
                </div>

                {/* Payment Method & Auto-Renew (1/3 width) */}
                <div className="flex flex-col gap-6">
                    <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm h-full flex flex-col">
                        <div className="flex items-center justify-between mb-6">
                            <h4 className="text-slate-900 font-bold text-lg">Método de Pago</h4>
                            <button className="text-xs font-bold text-emerald-600 hover:text-emerald-700 uppercase tracking-wide">Editar</button>
                        </div>

                        {/* Credit Card Visual */}
                        <div className="relative overflow-hidden rounded-xl bg-gradient-to-br from-slate-800 to-black p-5 text-white shadow-xl shadow-slate-400/20 mb-6 group transition-transform hover:scale-[1.02] duration-300">
                            <div className="absolute top-0 right-0 -mt-4 -mr-4 w-24 h-24 bg-white/10 rounded-full blur-xl group-hover:bg-white/20 transition-colors"></div>
                            <div className="relative z-10 flex flex-col justify-between h-32">
                                <div className="flex justify-between items-start">
                                    <div className="flex gap-1.5 opacity-80">
                                        <div className="size-6 rounded-full bg-rose-500/80"></div>
                                        <div className="size-6 rounded-full bg-orange-500/80 -ml-3"></div>
                                    </div>
                                    <span className="material-symbols-outlined text-white/50">contactless</span>
                                </div>
                                <div>
                                    <p className="font-mono text-lg tracking-widest mb-1 text-shadow-sm">•••• •••• •••• {SUBSCRIPTION_DATA.cardLast4}</p>
                                    <div className="flex justify-between items-end">
                                        <p className="text-[10px] text-white/70 uppercase font-bold tracking-wider">Titular</p>
                                        <p className="text-[10px] text-white/70 font-mono">EXP 09/28</p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="mt-auto">
                            <div className="flex items-center justify-between mb-3 p-3 rounded-lg bg-slate-50 border border-slate-200">
                                <span className="text-sm font-semibold text-slate-700 flex items-center gap-2">
                                    <span className="material-symbols-outlined text-[18px] text-emerald-600">autorenew</span>
                                    Pago Automático
                                </span>
                                <div className="relative inline-flex items-center cursor-pointer">
                                    <input type="checkbox" className="sr-only peer" checked readOnly />
                                    <div className="w-9 h-5 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-emerald-500"></div>
                                </div>
                            </div>
                            <p className="text-xs text-slate-400 leading-relaxed px-1">
                                Próximo cargo automático a tu tarjeta terminada en {SUBSCRIPTION_DATA.cardLast4}.
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            {/* History Table */}
            <div className="flex flex-col gap-6">
                <div className="flex items-center justify-between">
                    <h3 className="text-slate-900 text-2xl font-black tracking-tight">Historial de Pagos</h3>
                    <button className="text-sm font-bold text-emerald-600 hover:text-emerald-700 flex items-center gap-1 transition-colors bg-emerald-50 px-3 py-1.5 rounded-lg border border-emerald-100">
                        Descargar todo <span className="material-symbols-outlined text-[16px]">download</span>
                    </button>
                </div>

                <div className="rounded-2xl border border-slate-200 bg-white overflow-hidden shadow-sm">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="bg-slate-50 border-b border-slate-200">
                                    <th className="p-5 text-xs font-bold text-slate-500 uppercase tracking-wider">Fecha</th>
                                    <th className="p-5 text-xs font-bold text-slate-500 uppercase tracking-wider">Concepto</th>
                                    <th className="p-5 text-xs font-bold text-slate-500 uppercase tracking-wider hidden sm:table-cell">Método</th>
                                    <th className="p-5 text-xs font-bold text-slate-500 uppercase tracking-wider text-right">Monto</th>
                                    <th className="p-5 text-xs font-bold text-slate-500 uppercase tracking-wider text-center">Estado</th>
                                    <th className="p-5 text-xs font-bold text-slate-500 uppercase tracking-wider text-center">Recibo</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {SUBSCRIPTION_DATA.history.map((item, idx) => (
                                    <tr key={idx} className="hover:bg-slate-50 transition-colors group">
                                        <td className="p-5 text-sm font-bold text-slate-700">{item.date}</td>
                                        <td className="p-5 text-sm text-slate-600 font-medium">
                                            {item.concept}
                                            <span className="block text-[10px] text-slate-400 font-normal sm:hidden">{item.ref}</span>
                                        </td>
                                        <td className="p-5 text-sm text-slate-500 hidden sm:table-cell">
                                            <div className="flex items-center gap-2">
                                                <span className="material-symbols-outlined text-[16px]">credit_card</span>
                                                •••• {SUBSCRIPTION_DATA.cardLast4}
                                            </div>
                                        </td>
                                        <td className="p-5 text-sm font-bold text-slate-900 text-right font-mono">{formatCurrency(item.amount)}</td>
                                        <td className="p-5 text-center">
                                            <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-100 px-2.5 py-0.5 text-xs font-bold text-emerald-700 border border-emerald-200">
                                                <span className="size-1.5 rounded-full bg-emerald-500"></span>
                                                {item.status}
                                            </span>
                                        </td>
                                        <td className="p-5 text-center">
                                            <button className="size-8 rounded-full flex items-center justify-center text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 transition-all mx-auto shadow-sm" title="Descargar Recibo">
                                                <span className="material-symbols-outlined text-[18px]">description</span>
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    );
};
