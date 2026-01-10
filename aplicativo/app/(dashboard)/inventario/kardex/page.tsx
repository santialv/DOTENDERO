"use client";

import { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { Movement } from "../../../utils/inventory";

export default function KardexPage() {
    const searchParams = useSearchParams();
    const initialSearch = searchParams.get('search') || "";

    const [movements, setMovements] = useState<Movement[]>([]);
    const [searchTerm, setSearchTerm] = useState(initialSearch);
    const [filterType, setFilterType] = useState("Todos");

    useEffect(() => {
        const fetchKardex = async () => {
            // 0. Get Org Context
            const { data: { session } } = await supabase.auth.getSession();
            if (!session) return;
            const { data: profile } = await supabase
                .from('profiles')
                .select('organization_id')
                .eq('id', session.user.id)
                .single();
            const orgId = profile?.organization_id;
            if (!orgId) return;

            const { data } = await supabase
                .from('movements')
                .select('*, products(name)')
                .eq('organization_id', orgId)
                .order('created_at', { ascending: false });

            if (data) {
                const mapped = data.map(m => {
                    let type = m.type;
                    if (m.type === 'IN') type = m.reference && m.reference.includes('Compra') ? 'Compra' : 'Entrada';
                    if (m.type === 'OUT') type = 'Venta';

                    return {
                        id: m.id,
                        date: m.created_at,
                        ref: m.reference || 'S/N',
                        productId: m.product_id,
                        productName: m.products?.name || 'Desconocido',
                        type: type,
                        quantity: m.type === 'OUT' ? -m.quantity : m.quantity, // Visual negative for OUT
                        costPrice: m.unit_cost,
                        balance: m.new_stock,
                        user: "Sistema" // Placeholder until we join profiles
                    };
                });
                setMovements(mapped as any);
            }
        };
        fetchKardex();
    }, []);

    const filteredMovements = movements.filter(m => {
        const matchesSearch = !searchTerm || m.productName.toLowerCase().includes(searchTerm.toLowerCase()) || m.ref.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesType = filterType === "Todos" || m.type === filterType;
        return matchesSearch && matchesType;
    });

    // Stats
    const totalValue = movements[0]?.balance ? 0 : 0; // Complexity to calc total value of inventory from kardex is high, use products for that usually. Keep placeholder or link to products.
    // Actually, let's pull products for stats
    // Stats
    const [stats, setStats] = useState({ totalValue: 0, totalUnits: 0 });
    useEffect(() => {
        const fetchStats = async () => {
            // 0. Get Org Context
            const { data: { session } } = await supabase.auth.getSession();
            if (!session) return;
            const { data: profile } = await supabase
                .from('profiles')
                .select('organization_id')
                .eq('id', session.user.id)
                .single();
            const orgId = profile?.organization_id;
            if (!orgId) return;

            const { data } = await supabase.from('products').select('stock, cost').eq('organization_id', orgId);
            if (data) {
                const val = data.reduce((acc, p) => acc + ((p.stock || 0) * (p.cost || 0)), 0);
                const units = data.reduce((acc, p) => acc + (p.stock || 0), 0);
                setStats({ totalValue: val, totalUnits: units });
            }
        };
        fetchStats();
    }, []);

    const getTypeColor = (type: Movement['type']) => {
        switch (type) {
            case 'Venta': return 'bg-red-50 text-red-700 border-red-100';
            case 'Compra': return 'bg-primary/10 text-primary-dark border-primary/20';
            case 'Merma': return 'bg-orange-50 text-orange-700 border-orange-100';
            case 'Inicial': return 'bg-slate-100 text-slate-700 border-slate-200';
            case 'Ajuste': return 'bg-blue-50 text-blue-700 border-blue-100';
            default: return 'bg-slate-100 text-slate-700';
        }
    };

    const getTypeIcon = (type: Movement['type']) => {
        switch (type) {
            case 'Venta': return 'remove_shopping_cart';
            case 'Compra': return 'add_business';
            case 'Merma': return 'broken_image';
            case 'Inicial': return 'flag';
            case 'Ajuste': return 'tune';
            default: return 'circle';
        }
    };

    return (
        <div className="flex flex-col h-full bg-slate-50 font-display overflow-hidden">
            {/* Header */}
            <div className="px-10 py-8 flex flex-col md:flex-row md:items-end justify-between gap-4 shrink-0">
                <div className="flex flex-col gap-1">
                    <div className="flex items-center gap-2">
                        <span className="inline-flex items-center rounded-md bg-primary/10 px-2 py-1 text-xs font-medium text-primary-dark ring-1 ring-inset ring-primary/20">Auditoría</span>
                        <span className="text-sm text-slate-500">Valoración: Promedio Ponderado</span>
                    </div>
                    <h1 className="text-3xl md:text-4xl font-black tracking-tight text-slate-900">Kardex de Inventario</h1>
                    <p className="text-slate-500 text-base">Historial detallado de movimientos de entrada y salida.</p>
                </div>
            </div>

            <div className="px-10 pb-8 flex flex-col gap-6 flex-1 overflow-hidden">
                {/* Stats Overview */}
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-3 shrink-0">
                    <div className="relative overflow-hidden rounded-xl border border-slate-200 bg-white p-6 shadow-sm group">
                        <div className="absolute right-0 top-0 p-4 opacity-10">
                            <span className="material-symbols-outlined text-6xl text-primary">payments</span>
                        </div>
                        <p className="text-sm font-medium text-slate-500">Valor Total Inventario</p>
                        <div className="mt-2 flex items-baseline gap-2">
                            <p className="text-3xl font-bold text-slate-900">${stats.totalValue.toLocaleString()}</p>
                        </div>
                    </div>
                    <div className="relative overflow-hidden rounded-xl border border-slate-200 bg-white p-6 shadow-sm group">
                        <div className="absolute right-0 top-0 p-4 opacity-10">
                            <span className="material-symbols-outlined text-6xl text-primary">inventory_2</span>
                        </div>
                        <p className="text-sm font-medium text-slate-500">Unidades Totales</p>
                        <div className="mt-2 flex items-baseline gap-2">
                            <p className="text-3xl font-bold text-slate-900">{stats.totalUnits.toLocaleString()}</p>
                        </div>
                    </div>
                    {/* Placeholder third card */}
                    <div className="relative overflow-hidden rounded-xl border border-slate-200 bg-white p-6 shadow-sm group">
                        <p className="text-sm font-medium text-slate-500">Movimientos Registrados</p>
                        <div className="mt-2 flex items-baseline gap-2">
                            <p className="text-3xl font-bold text-slate-900">{movements.length}</p>
                        </div>
                    </div>
                </div>

                {/* Filters */}
                <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm shrink-0">
                    <div className="grid grid-cols-1 gap-4 md:grid-cols-12">
                        <div className="col-span-1 md:col-span-5">
                            <label className="mb-1.5 block text-xs font-semibold text-slate-900">Buscar</label>
                            <div className="relative">
                                <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">search</span>
                                <input
                                    className="block w-full rounded-lg border-none bg-slate-50 py-2.5 pl-10 pr-3 text-sm text-slate-900 placeholder-slate-400 focus:ring-2 focus:ring-primary outline-none transition-all"
                                    placeholder="Nombre, Referencia..."
                                    value={searchTerm}
                                    onChange={e => setSearchTerm(e.target.value)}
                                />
                            </div>
                        </div>
                        <div className="col-span-1 md:col-span-3">
                            <label className="mb-1.5 block text-xs font-semibold text-slate-900">Tipo</label>
                            <select
                                className="block w-full rounded-lg border-none bg-slate-50 py-2.5 px-3 text-sm text-slate-900 focus:ring-2 focus:ring-primary outline-none"
                                value={filterType}
                                onChange={e => setFilterType(e.target.value)}
                            >
                                <option value="Todos">Todos</option>
                                <option value="Venta">Ventas</option>
                                <option value="Compra">Compras</option>
                                <option value="Ajuste">Ajustes</option>
                                <option value="Inicial">Inicial</option>
                            </select>
                        </div>
                    </div>
                </div>

                {/* Table */}
                <div className="flex flex-col overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm flex-1">
                    <div className="overflow-auto custom-scrollbar flex-1">
                        <table className="w-full min-w-[1000px] border-collapse text-left text-sm">
                            <thead className="bg-slate-50 sticky top-0 z-10">
                                <tr className="border-b border-slate-200">
                                    <th className="p-4 font-semibold text-slate-900 w-[180px]">Fecha/Hora</th>
                                    <th className="p-4 font-semibold text-slate-900">Referencia</th>
                                    <th className="p-4 font-semibold text-slate-900 w-[140px]">Tipo</th>
                                    <th className="p-4 font-semibold text-right text-slate-500">Entrada/Salida</th>
                                    <th className="p-4 font-semibold text-right text-slate-900">Costo Unit. (Ponderado)</th>
                                    <th className="p-4 font-semibold text-right text-slate-900 bg-slate-50">Saldo</th>
                                    <th className="p-4 font-semibold text-slate-900">Usuario</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {filteredMovements.length === 0 ? (
                                    <tr><td colSpan={7} className="p-8 text-center text-slate-500">No se encontraron movimientos.</td></tr>
                                ) : filteredMovements.map((move) => (
                                    <tr key={move.id} className="group hover:bg-slate-50 transition-colors">
                                        <td className="p-4 text-slate-900">
                                            <div className="flex flex-col">
                                                <span className="font-medium">{new Date(move.date).toLocaleDateString()}</span>
                                                <span className="text-xs text-slate-500">{new Date(move.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                                            </div>
                                        </td>
                                        <td className="p-4">
                                            <span className="font-mono text-xs font-medium text-slate-500 border border-slate-200 rounded px-1.5 py-0.5">{move.ref}</span>
                                            <div className="text-xs text-slate-900 mt-0.5 truncate max-w-[180px]">{move.productName}</div>
                                        </td>
                                        <td className="p-4">
                                            <span className={`inline-flex items-center gap-1 rounded-md px-2 py-1 text-xs font-bold border ${getTypeColor(move.type)}`}>
                                                <span className="material-symbols-outlined text-[14px]">{getTypeIcon(move.type)}</span>
                                                {move.type}
                                            </span>
                                        </td>
                                        <td className="p-4 text-right">
                                            <span className={`font-mono font-bold ${move.quantity > 0 ? 'text-green-600' : 'text-red-600'}`}>
                                                {move.quantity > 0 ? '+' : ''}{move.quantity}
                                            </span>
                                        </td>
                                        <td className="p-4 text-right text-slate-900 font-mono">
                                            ${move.costPrice?.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
                                        </td>
                                        <td className="p-4 text-right font-black text-slate-900 bg-slate-50/50 group-hover:bg-slate-100 font-mono text-base">{move.balance}</td>
                                        <td className="p-4 text-slate-500">{move.user}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    );
}
