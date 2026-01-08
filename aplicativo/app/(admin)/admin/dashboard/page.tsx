"use client";

import { useState } from "react";
import Link from "next/link";

export default function SuperAdminDashboard() {
    const [clients, setClients] = useState([
        { id: 1, name: "Tienda La Esperanza", owner: "Carlos Rodríguez", plan: "Pro", status: "Active", lastPayment: "2024-05-15" },
        { id: 2, name: "Supermercado El Vecino", owner: "Ana Martínez", plan: "Free", status: "Active", lastPayment: "-" },
        { id: 3, name: "Víveres Don José", owner: "José Pérez", plan: "Pro", status: "Late", lastPayment: "2024-04-10" },
        { id: 4, name: "Licorera La 80", owner: "Felipe Gomez", plan: "Pro", status: "Active", lastPayment: "2024-05-18" },
        { id: 5, name: "Minimarket Express", owner: "Lucía Torres", plan: "Free", status: "Inactive", lastPayment: "-" },
    ]);

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
                <h2 className="text-2xl font-bold mb-6">Visión General del Negocio (SaaS)</h2>

                {/* Metrics Grid */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
                    {/* MRR Card */}
                    <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100">
                        <div className="flex items-center gap-3 mb-2">
                            <div className="p-2 bg-green-100 text-green-700 rounded-lg">
                                <span className="material-symbols-outlined">payments</span>
                            </div>
                            <span className="text-sm font-bold text-slate-500">MRR Mensual</span>
                        </div>
                        <p className="text-3xl font-black text-slate-900">$2,450 USD</p>
                        <p className="text-xs font-medium text-green-600 flex items-center mt-1">
                            <span className="material-symbols-outlined text-[16px] mr-1">trending_up</span>
                            +12% vs mes anterior
                        </p>
                    </div>

                    {/* Active Clients */}
                    <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100">
                        <div className="flex items-center gap-3 mb-2">
                            <div className="p-2 bg-blue-100 text-blue-700 rounded-lg">
                                <span className="material-symbols-outlined">store</span>
                            </div>
                            <span className="text-sm font-bold text-slate-500">Tiendas Activas</span>
                        </div>
                        <p className="text-3xl font-black text-slate-900">142</p>
                        <p className="text-xs font-medium text-blue-600 mt-1">
                            15 registradas esta semana
                        </p>
                    </div>

                    {/* Churn Rate */}
                    <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100">
                        <div className="flex items-center gap-3 mb-2">
                            <div className="p-2 bg-red-100 text-red-700 rounded-lg">
                                <span className="material-symbols-outlined">person_off</span>
                            </div>
                            <span className="text-sm font-bold text-slate-500">Tasa de Cancelación</span>
                        </div>
                        <p className="text-3xl font-black text-slate-900">1.2%</p>
                        <p className="text-xs font-medium text-slate-400 mt-1">
                            Bajo control (Objetivo &lt; 2%)
                        </p>
                    </div>

                    {/* Total Volume */}
                    <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100">
                        <div className="flex items-center gap-3 mb-2">
                            <div className="p-2 bg-purple-100 text-purple-700 rounded-lg">
                                <span className="material-symbols-outlined">bar_chart_4_bars</span>
                            </div>
                            <span className="text-sm font-bold text-slate-500">Volumen Transado</span>
                        </div>
                        <p className="text-3xl font-black text-slate-900">$450M COP</p>
                        <p className="text-xs font-medium text-purple-600 mt-1">
                            Total ventas de todos los clientes
                        </p>
                    </div>
                </div>

                {/* Operational Tools Section */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                    <Link href="/admin/comunicados" className="group">
                        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 hover:border-[#13ec80] hover:shadow-md transition-all cursor-pointer h-full">
                            <div className="h-12 w-12 bg-purple-100 text-purple-600 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                                <span className="material-symbols-outlined text-[28px]">campaign</span>
                            </div>
                            <h3 className="text-lg font-bold text-slate-900 mb-1">Centro de Comunicaciones</h3>
                            <p className="text-sm text-slate-500">Enviar alertas globales, anuncios de mantenimiento o novedades a todos los clientes.</p>
                        </div>
                    </Link>

                    <Link href="/admin/financiera" className="group">
                        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 hover:border-blue-500 hover:shadow-md transition-all cursor-pointer h-full">
                            <div className="h-12 w-12 bg-blue-100 text-blue-600 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                                <span className="material-symbols-outlined text-[28px]">monitoring</span>
                            </div>
                            <h3 className="text-lg font-bold text-slate-900 mb-1">Zona Financiera</h3>
                            <p className="text-sm text-slate-500">Ingresos del SaaS, distribución de planes y volumen de ventas de clientes.</p>
                        </div>
                    </Link>

                    <Link href="/admin/soporte" className="group">
                        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 hover:border-purple-500 hover:shadow-md transition-all cursor-pointer h-full">
                            <div className="h-12 w-12 bg-purple-100 text-purple-600 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                                <span className="material-symbols-outlined text-[28px]">local_police</span>
                            </div>
                            <h3 className="text-lg font-bold text-slate-900 mb-1">Soporte Técnico</h3>
                            <p className="text-sm text-slate-500">Herramienta "Ghost Login" para acceder como cliente y depurar errores.</p>
                        </div>
                    </Link>

                    <Link href="/admin/auditoria" className="group">
                        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 hover:border-slate-800 hover:shadow-md transition-all cursor-pointer h-full">
                            <div className="h-12 w-12 bg-slate-100 text-slate-600 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                                <span className="material-symbols-outlined text-[28px]">security</span>
                            </div>
                            <h3 className="text-lg font-bold text-slate-900 mb-1">Auditoría & Logs</h3>
                            <p className="text-sm text-slate-500">Registro de seguridad y trazabilidad de acciones administrativas.</p>
                        </div>
                    </Link>
                    <Link href="/admin/equipo" className="group">
                        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 hover:border-slate-800 hover:shadow-md transition-all cursor-pointer h-full">
                            <div className="h-12 w-12 bg-slate-100 text-slate-600 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                                <span className="material-symbols-outlined text-[28px]">group_add</span>
                            </div>
                            <h3 className="text-lg font-bold text-slate-900 mb-1">Equipo y Accesos</h3>
                            <p className="text-sm text-slate-500">Administra colaboradores, contadores y asigna permisos por rol.</p>
                        </div>
                    </Link>

                    <Link href="/admin/planes" className="group">
                        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 hover:border-[#13ec80] hover:shadow-md transition-all cursor-pointer h-full">
                            <div className="h-12 w-12 bg-green-100 text-green-600 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                                <span className="material-symbols-outlined text-[28px]">payments</span>
                            </div>
                            <h3 className="text-lg font-bold text-slate-900 mb-1">Planes y Precios</h3>
                            <p className="text-sm text-slate-500">Gestiona precios y características. (Cambios aplican al siguiente cobro).</p>
                        </div>
                    </Link>

                    <Link href="/admin/configuracion" className="group">
                        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 hover:border-red-400 hover:shadow-md transition-all cursor-pointer h-full">
                            <div className="h-12 w-12 bg-red-100 text-red-500 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                                <span className="material-symbols-outlined text-[28px]">tune</span>
                            </div>
                            <h3 className="text-lg font-bold text-slate-900 mb-1">Configuración Sistema</h3>
                            <p className="text-sm text-slate-500">Interruptores globales: Modo Mantenimiento, Registro Abierto, Beta.</p>
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

                {/* Clients Table */}
                <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                    <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center">
                        <h3 className="font-bold text-lg">Gestión de Clientes (Tenants)</h3>
                        <button className="text-sm font-bold text-primary hover:text-primary-dark transition-colors">
                            + Nuevo Registro Manual
                        </button>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-sm">
                            <thead className="bg-slate-50 text-slate-500">
                                <tr>
                                    <th className="px-6 py-3 font-bold">Negocio</th>
                                    <th className="px-6 py-3 font-bold">Propietario</th>
                                    <th className="px-6 py-3 font-bold">Plan</th>
                                    <th className="px-6 py-3 font-bold">Estado</th>
                                    <th className="px-6 py-3 font-bold">Último Pago</th>
                                    <th className="px-6 py-3 font-bold text-right">Acciones</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {clients.map((client) => (
                                    <tr key={client.id} className="hover:bg-slate-50 transition-colors">
                                        <td className="px-6 py-4 font-bold text-slate-900">{client.name}</td>
                                        <td className="px-6 py-4 text-slate-600">{client.owner}</td>
                                        <td className="px-6 py-4">
                                            <span className={`px-2 py-1 rounded-full text-xs font-bold ${client.plan === 'Pro' ? 'bg-[#13ec80]/20 text-green-800' : 'bg-slate-100 text-slate-600'
                                                }`}>
                                                {client.plan}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className={`inline-flex items-center gap-1.5 px-2 py-1 rounded-full text-xs font-bold ${client.status === 'Active' ? 'text-green-600' :
                                                client.status === 'Late' ? 'text-orange-600' : 'text-slate-400'
                                                }`}>
                                                <span className={`h-1.5 w-1.5 rounded-full ${client.status === 'Active' ? 'bg-green-500' :
                                                    client.status === 'Late' ? 'bg-orange-500' : 'bg-slate-300'
                                                    }`}></span>
                                                {client.status === 'Active' ? 'Activo' :
                                                    client.status === 'Late' ? 'Mora' : 'Inactivo'}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-slate-600">{client.lastPayment}</td>
                                        <td className="px-6 py-4 text-right">
                                            <button className="text-slate-400 hover:text-slate-900 font-bold text-xs border border-slate-200 rounded px-2 py-1">
                                                Gestionar
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                    <div className="bg-slate-50 px-6 py-3 border-t border-slate-100 text-center">
                        <button className="text-xs font-bold text-slate-500 hover:text-primary transition-colors">
                            Ver todos los 142 clientes
                        </button>
                    </div>
                </div>
            </main>
        </div>
    );
}
