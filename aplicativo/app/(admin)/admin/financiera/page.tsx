"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";

export default function FinancialZonePage() {
    // Real State
    const [clients, setClients] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [totals, setTotals] = useState({ revenue: 0, active: 0, gmv: 0 });

    // Fetch Real Data
    useEffect(() => {
        const loadData = async () => {
            setLoading(true);
            try {
                // Get all orgs
                const { data: orgs, error } = await supabase
                    .from('organizations')
                    .select('*')
                    .order('created_at', { ascending: false });

                if (error) throw error;

                // Process Data
                const mapped = (orgs || []).map((o: any, index: number) => ({
                    id: o.id,
                    displayId: index + 1,
                    business: o.name,
                    owner: o.email || "N/A", // Owner email not always directly linked here, using org email for now
                    nit: o.nit || "N/A",
                    phone: o.phone || "N/A",
                    email: o.email || "N/A",
                    plan: "PRO", // Hardcoded for now, assuming all valid orgs are clients
                    since: new Date(o.created_at).toLocaleDateString(),
                    revenue: 25 // Hardcoded SaaS Price
                }));

                setClients(mapped);
                setTotals({
                    revenue: mapped.length * 25,
                    active: mapped.length,
                    gmv: mapped.length * 5000000 // Estimated GMV fallback
                });

            } catch (e) {
                console.error("Error loading financial data", e);
            } finally {
                setLoading(false);
            }
        };
        loadData();
    }, []);

    const handleExport = () => {
        const headers = ["ID", "Negocio", "Propietario", "NIT", "Teléfono", "Correo", "Plan", "Fecha Registro", "Ingresos (USD)"];
        const csvContent = [
            headers.join(","),
            ...clients.map(row =>
                [row.displayId, `"${row.business}"`, `"${row.owner}"`, row.nit, row.phone, row.email, row.plan, row.since, row.revenue].join(",")
            )
        ].join("\n");

        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement("a");
        const url = URL.createObjectURL(blob);
        link.setAttribute("href", url);
        link.setAttribute("download", "reporte_clientes_dontendero.csv");
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    return (
        <div className="h-screen overflow-y-auto bg-slate-50 font-sans text-slate-900">
            {/* Top Navigation */}
            <nav className="bg-slate-900 text-white px-8 py-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <Link href="/admin/dashboard" className="flex h-8 w-8 items-center justify-center rounded bg-[#13ec80] text-slate-900 hover:opacity-90 transition-opacity">
                        <span className="material-symbols-outlined text-xl">arrow_back</span>
                    </Link>
                    <div>
                        <h1 className="text-xl font-bold leading-none">DonTendero <span className="text-[#13ec80]">ADMIN</span></h1>
                        <p className="text-xs text-slate-400">Zona Financiera</p>
                    </div>
                </div>
            </nav>

            <main className="p-8 max-w-7xl mx-auto">
                <div className="flex justify-between items-end mb-8">
                    <div>
                        <h2 className="text-3xl font-black text-slate-900">Reporte de Ingresos</h2>
                        <p className="text-slate-500">Panorama financiero global de tu SaaS.</p>
                    </div>
                    <div className="flex gap-2">
                        <select className="bg-white border border-slate-200 text-slate-700 text-sm rounded-lg p-2.5 outline-none focus:ring-2 focus:ring-[#13ec80]">
                            <option>Este Mes (Mayo)</option>
                            <option>Mes Anterior</option>
                            <option>Año Actual (2024)</option>
                        </select>
                        <button onClick={handleExport} className="bg-slate-900 text-white px-4 py-2 rounded-lg text-sm font-bold hover:bg-slate-800 flex items-center gap-2">
                            <span className="material-symbols-outlined text-sm">download</span>
                            Exportar Informe
                        </button>
                    </div>
                </div>

                {/* Big Numbers Grid */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
                    {/* Total Revenue */}
                    <div className="bg-blue-600 text-white p-6 rounded-2xl shadow-lg relative overflow-hidden">
                        <div className="absolute right-0 top-0 p-4 opacity-10">
                            <span className="material-symbols-outlined text-9xl">attach_money</span>
                        </div>
                        <p className="text-blue-100 text-sm font-bold mb-1">Ingresos Totales (Neto)</p>
                        <h3 className="text-4xl font-black mb-2">${totals.revenue.toLocaleString()} USD</h3>
                        <div className="flex items-center text-xs font-bold bg-blue-500/30 w-fit px-2 py-1 rounded-full">
                            <span className="material-symbols-outlined text-sm mr-1">trending_up</span>
                            +100% vs mes anterior
                        </div>
                    </div>

                    {/* Active Subscriptions */}
                    <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
                        <p className="text-slate-500 text-sm font-bold mb-1">Suscripciones Activas</p>
                        <h3 className="text-4xl font-black text-slate-900 mb-2">{totals.active}</h3>
                        <p className="text-xs text-green-600 font-bold flex items-center">
                            <span className="material-symbols-outlined text-sm mr-1">check_circle</span>
                            Tiendas registradas
                        </p>
                    </div>

                    {/* GMV (Client Sales) */}
                    <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
                        <p className="text-slate-500 text-sm font-bold mb-1">Volumen de Clientes (GMV)</p>
                        <h3 className="text-4xl font-black text-slate-900 mb-2">${(totals.gmv / 1000000).toFixed(0)}M</h3>
                        <p className="text-xs text-slate-400">COP (Estimado)</p>
                        <p className="text-xs text-purple-600 font-bold mt-1">Tu plataforma mueve esto.</p>
                    </div>

                    {/* ARPU */}
                    <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
                        <p className="text-slate-500 text-sm font-bold mb-1">Ingreso x Usuario (ARPU)</p>
                        <h3 className="text-4xl font-black text-slate-900 mb-2">$25.00</h3>
                        <p className="text-xs text-slate-400">Promedio USD</p>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
                    {/* Plan Distribution */}
                    <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 col-span-1">
                        <h3 className="font-bold text-lg mb-6 flex items-center gap-2">
                            <span className="material-symbols-outlined text-slate-400">pie_chart</span>
                            Distribución de Planes
                        </h3>
                        <div className="space-y-6">
                            <div>
                                <div className="flex justify-between text-sm mb-1">
                                    <span className="font-bold text-slate-700">Plan PRO ($25/mes)</span>
                                    <span className="text-slate-500">60% (86 tiendas)</span>
                                </div>
                                <div className="w-full bg-slate-100 rounded-full h-3 overflow-hidden">
                                    <div className="bg-[#13ec80] h-3 rounded-full" style={{ width: '60%' }}></div>
                                </div>
                            </div>
                            <div>
                                <div className="flex justify-between text-sm mb-1">
                                    <span className="font-bold text-slate-700">Plan Básico ($10/mes)</span>
                                    <span className="text-slate-500">25% (35 tiendas)</span>
                                </div>
                                <div className="w-full bg-slate-100 rounded-full h-3 overflow-hidden">
                                    <div className="bg-blue-500 h-3 rounded-full" style={{ width: '25%' }}></div>
                                </div>
                            </div>
                            <div>
                                <div className="flex justify-between text-sm mb-1">
                                    <span className="font-bold text-slate-700">Plan Gratuito</span>
                                    <span className="text-slate-500">15% (21 tiendas)</span>
                                </div>
                                <div className="w-full bg-slate-100 rounded-full h-3 overflow-hidden">
                                    <div className="bg-slate-400 h-3 rounded-full" style={{ width: '15%' }}></div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Top Performing Clients */}
                    <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 col-span-2">
                        <h3 className="font-bold text-lg mb-6 flex items-center gap-2">
                            <span className="material-symbols-outlined text-slate-400">leaderboard</span>
                            Top Clientes por Volumen de Venta
                        </h3>
                        <div className="overflow-x-auto">
                            <table className="w-full text-left text-sm">
                                <thead className="bg-slate-50 text-slate-500">
                                    <tr>
                                        <th className="px-4 py-2 font-bold">Posición</th>
                                        <th className="px-4 py-2 font-bold">Cliente</th>
                                        <th className="px-4 py-2 font-bold">Plan</th>
                                        <th className="px-4 py-2 font-bold text-right">Volumen (Mes)</th>
                                        <th className="px-4 py-2 font-bold text-right">Comisión (Est.)</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100">
                                    <tr className="hover:bg-slate-50">
                                        <td className="px-4 py-3"><span className="font-black text-yellow-500">#1</span></td>
                                        <td className="px-4 py-3 font-bold text-slate-900">Supermercado El Éxito</td>
                                        <td className="px-4 py-3"><span className="bg-[#13ec80]/20 text-green-800 text-xs px-2 py-1 rounded-full font-bold">PRO</span></td>
                                        <td className="px-4 py-3 text-right font-mono">$45,200,000</td>
                                        <td className="px-4 py-3 text-right font-mono text-green-600">$0 (SaaS)</td>
                                    </tr>
                                    <tr className="hover:bg-slate-50">
                                        <td className="px-4 py-3"><span className="font-black text-slate-400">#2</span></td>
                                        <td className="px-4 py-3 font-bold text-slate-900">Licorera 24/7</td>
                                        <td className="px-4 py-3"><span className="bg-[#13ec80]/20 text-green-800 text-xs px-2 py-1 rounded-full font-bold">PRO</span></td>
                                        <td className="px-4 py-3 text-right font-mono">$32,150,000</td>
                                        <td className="px-4 py-3 text-right font-mono text-green-600">$0 (SaaS)</td>
                                    </tr>
                                    <tr className="hover:bg-slate-50">
                                        <td className="px-4 py-3"><span className="font-black text-amber-700">#3</span></td>
                                        <td className="px-4 py-3 font-bold text-slate-900">Tienda de Pedro</td>
                                        <td className="px-4 py-3"><span className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full font-bold">Básico</span></td>
                                        <td className="px-4 py-3 text-right font-mono">$18,400,000</td>
                                        <td className="px-4 py-3 text-right font-mono text-green-600">$0 (SaaS)</td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>

                {/* Full Clients Report Table */}
                <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden mb-12">
                    <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-slate-50">
                        <h3 className="font-bold text-lg text-slate-900">Informe Detallado de Clientes (Base de Datos)</h3>
                        <button onClick={handleExport} className="text-sm font-bold text-blue-600 hover:text-blue-800 transition-colors flex items-center gap-1">
                            <span className="material-symbols-outlined text-lg">table_view</span>
                            Descargar Excel Completo
                        </button>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-sm">
                            <thead className="bg-white text-slate-500 border-b border-slate-200">
                                <tr>
                                    <th className="px-6 py-3 font-bold">ID</th>
                                    <th className="px-6 py-3 font-bold">Nombre Negocio</th>
                                    <th className="px-6 py-3 font-bold">Propietario</th>
                                    <th className="px-6 py-3 font-bold">NIT / Cédula</th>
                                    <th className="px-6 py-3 font-bold">Teléfono</th>
                                    <th className="px-6 py-3 font-bold">Correo</th>
                                    <th className="px-6 py-3 font-bold">Plan</th>
                                    <th className="px-6 py-3 font-bold">Registro</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {clients.map((client) => (
                                    <tr key={client.id} className="hover:bg-slate-50">
                                        <td className="px-6 py-3 text-slate-400 font-mono">#{client.displayId}</td>
                                        <td className="px-6 py-3 font-bold text-slate-900">{client.business}</td>
                                        <td className="px-6 py-3 text-slate-600">{client.owner}</td>
                                        <td className="px-6 py-3 text-slate-600 font-mono text-xs">{client.nit}</td>
                                        <td className="px-6 py-3 text-slate-600">{client.phone}</td>
                                        <td className="px-6 py-3 text-slate-600 text-xs">{client.email}</td>
                                        <td className="px-6 py-3">
                                            <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase border ${client.plan === 'PRO' ? 'bg-green-50 text-green-700 border-green-200' :
                                                client.plan === 'Free' ? 'bg-slate-50 text-slate-600 border-slate-200' :
                                                    'bg-blue-50 text-blue-700 border-blue-200'
                                                }`}>
                                                {client.plan}
                                            </span>
                                        </td>
                                        <td className="px-6 py-3 text-slate-500 text-xs">{client.since}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                    <div className="bg-slate-50 px-6 py-3 border-t border-slate-100 text-center">
                        <p className="text-xs text-slate-400">Mostrando {clients.length} registros</p>
                    </div>
                </div>

            </main>
        </div>
    );
}
