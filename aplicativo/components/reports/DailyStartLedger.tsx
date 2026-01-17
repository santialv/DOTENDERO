"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { useToast } from "@/components/ui/toast";
import { format } from "date-fns";
import { es } from "date-fns/locale";

interface Movement {
    id: string;
    date: string;
    description: string;
    type: 'income' | 'expense';
    amount: number;
    category?: string;
    payment_method?: string;
    user_name?: string;
}

export function DailyStartLedger() {
    const { toast } = useToast();
    const [movements, setMovements] = useState<Movement[]>([]);
    const [loading, setLoading] = useState(true);
    const [startDate, setStartDate] = useState(() => {
        const d = new Date();
        d.setDate(d.getDate() - 30); // Default 30 days
        return d.toISOString().split('T')[0];
    });
    const [endDate, setEndDate] = useState(() => new Date().toISOString().split('T')[0]);

    useEffect(() => {
        fetchMovements();
    }, [startDate, endDate]);

    async function fetchMovements() {
        setLoading(true);
        try {
            const { data: { session } } = await supabase.auth.getSession();
            if (!session) return;
            const { data: profile } = await supabase.from('profiles').select('organization_id').eq('id', session.user.id).single();
            const orgId = profile?.organization_id;

            if (!orgId) return;

            console.log("Fetching ledger for Org:", orgId, "Date:", startDate, "to", endDate);

            // Prepare Date Range for Query (Inclusive of End Date by going to Next Day 00:00)
            const qStart = new Date(startDate).toISOString();
            const qEndObj = new Date(endDate);
            qEndObj.setDate(qEndObj.getDate() + 1);
            const qEnd = qEndObj.toISOString();

            // 1. Fetch Sales (Invoices)
            const { data: invoices, error: invError } = await supabase
                .from('invoices')
                .select('id, date, number, total, payment_method, customer_id, seller_id')
                .eq('organization_id', orgId)
                .gte('date', qStart)
                .lt('date', qEnd);

            if (invError) { console.error("Invoice Error:", invError); throw invError; }

            // 2. Fetch Expenses
            const { data: expenses, error: expError } = await supabase
                .from('expenses')
                .select('*')
                .eq('organization_id', orgId)
                .gte('date', qStart)
                .lt('date', qEnd);

            if (expError) { console.error("Expense Error:", expError); throw expError; }

            // 3. Fetch User Names (Manual Join for safety)
            const userIds = new Set<string>();
            invoices?.forEach(i => i.seller_id && userIds.add(i.seller_id));
            expenses?.forEach(e => e.user_id && userIds.add(e.user_id));

            let userMap: Record<string, string> = {};
            if (userIds.size > 0) {
                const { data: profiles } = await supabase
                    .from('profiles')
                    .select('id, full_name')
                    .in('id', Array.from(userIds));

                profiles?.forEach(p => {
                    userMap[p.id] = p.full_name || 'Usuario';
                });
            }

            // 4. Merge & Transform
            const allMovements: Movement[] = [];

            // From Invoices
            invoices?.forEach((inv: any) => {
                allMovements.push({
                    id: inv.id,
                    date: inv.date,
                    description: `Venta POS #${inv.number}`,
                    type: 'income',
                    amount: inv.total,
                    category: 'Venta',
                    payment_method: inv.payment_method,
                    user_name: userMap[inv.seller_id] || 'Sistema'
                });
            });

            // From Expenses
            expenses?.forEach((exp: any) => {
                allMovements.push({
                    id: exp.id,
                    date: exp.date,
                    description: exp.description || 'Sin descripción',
                    type: exp.type === 'income' ? 'income' : 'expense',
                    amount: exp.amount,
                    category: exp.category || 'Gasto General',
                    payment_method: exp.payment_method,
                    user_name: userMap[exp.user_id] || 'Sistema'
                });
            });

            // Sort by Date Desc
            allMovements.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

            setMovements(allMovements);

        } catch (error) {
            console.error("Error fetching ledger:", error);
        } finally {
            setLoading(false);
        }
    }

    // Calculate totals
    const totalIncome = movements.filter(m => m.type === 'income').reduce((sum, m) => sum + m.amount, 0);
    const totalExpense = movements.filter(m => m.type === 'expense').reduce((sum, m) => sum + m.amount, 0);
    const balance = totalIncome - totalExpense;

    return (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden flex flex-col h-[600px]">
            <div className="p-6 border-b border-slate-100 flex flex-col md:flex-row justify-between items-center gap-4 bg-slate-50/50">
                <div>
                    <h3 className="text-lg font-black text-slate-900 flex items-center gap-2">
                        <span className="material-symbols-outlined text-slate-400">menu_book</span>
                        Libro Diario de Movimientos
                    </h3>
                    <p className="text-sm text-slate-500">Detalle de ingresos y egresos (Máx 3 meses)</p>
                </div>

                <div className="flex items-center gap-3">
                    <button
                        onClick={fetchMovements}
                        className="p-2 bg-white border border-slate-200 text-slate-500 rounded-xl hover:bg-slate-50 hover:text-slate-700 transition-colors"
                        title="Actualizar datos"
                    >
                        <span className="material-symbols-outlined text-lg">refresh</span>
                    </button>

                    <button
                        onClick={() => {
                            if (movements.length === 0) {
                                toast("No hay datos para exportar", "warning");
                                return;
                            }
                            const headers = ["Fecha", "Hora", "Responsable", "Descripción", "Tipo", "Categoría", "Método Pago", "Entrada", "Salida"];
                            const rows = movements.map(m => [
                                format(new Date(m.date), "yyyy-MM-dd"),
                                format(new Date(m.date), "HH:mm"),
                                `"${(m.user_name || '').replace(/"/g, '""')}"`,
                                `"${m.description.replace(/"/g, '""')}"`,
                                m.type === 'income' ? 'Ingreso' : 'Egreso',
                                m.category || '',
                                m.payment_method || '',
                                m.type === 'income' ? m.amount : 0,
                                m.type === 'expense' ? m.amount : 0
                            ]);

                            const csvContent = [
                                headers.join(','),
                                ...rows.map(r => r.join(','))
                            ].join('\n');

                            const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
                            const url = URL.createObjectURL(blob);
                            const link = document.createElement('a');
                            link.href = url;
                            link.setAttribute('download', `Libro_Diario_${startDate}_${endDate}.csv`);
                            document.body.appendChild(link);
                            link.click();
                            document.body.removeChild(link);
                            toast("Reporte descargado correctamente", "success");
                        }}
                        className="flex items-center gap-2 bg-white border border-slate-200 text-slate-700 font-bold px-4 py-2 rounded-xl text-xs hover:bg-slate-50 transition-colors"
                        title="Descargar reporte en Excel/CSV"
                    >
                        <span className="material-symbols-outlined text-lg">file_download</span>
                        <span>Exportar</span>
                    </button>

                    <div className="flex items-center gap-2 bg-white p-1 rounded-xl border border-slate-200">
                        <input
                            type="date"
                            value={startDate}
                            onChange={(e) => setStartDate(e.target.value)}
                            className="px-3 py-2 text-sm font-bold text-slate-600 outline-none rounded-lg"
                        />
                        <span className="text-slate-300">-</span>
                        <input
                            type="date"
                            value={endDate}
                            onChange={(e) => setEndDate(e.target.value)}
                            className="px-3 py-2 text-sm font-bold text-slate-600 outline-none rounded-lg"
                        />
                    </div>
                </div>
            </div>

            {/* Summary Cards */}
            <div className="grid grid-cols-3 divide-x divide-slate-100 border-b border-slate-100 bg-white">
                <div className="p-4 text-center">
                    <p className="text-xs font-bold text-green-600 uppercase tracking-widest">Entradas</p>
                    <p className="text-xl font-black text-slate-900 mt-1 text-green-600">+${totalIncome.toLocaleString()}</p>
                </div>
                <div className="p-4 text-center">
                    <p className="text-xs font-bold text-red-500 uppercase tracking-widest">Salidas</p>
                    <p className="text-xl font-black text-slate-900 mt-1 text-red-600">-${totalExpense.toLocaleString()}</p>
                </div>
                <div className="p-4 text-center bg-slate-50/50">
                    <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Balance Periodo</p>
                    <p className={`text-xl font-black mt-1 ${balance >= 0 ? 'text-blue-600' : 'text-red-600'}`}>
                        ${balance.toLocaleString()}
                    </p>
                </div>
            </div>

            {/* Table */}
            <div className="flex-1 overflow-auto custom-scrollbar">
                <table className="w-full text-left border-collapse">
                    <thead className="bg-slate-50 sticky top-0 z-10 text-xs font-bold text-slate-500 uppercase tracking-wider">
                        <tr>
                            <th className="p-4 border-b border-slate-200">Fecha / Hora</th>
                            <th className="p-4 border-b border-slate-200">Responsable</th>
                            <th className="p-4 border-b border-slate-200">Descripción</th>
                            <th className="p-4 border-b border-slate-200">Categoría</th>
                            <th className="p-4 border-b border-slate-200 text-right">Entrada</th>
                            <th className="p-4 border-b border-slate-200 text-right">Salida</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 text-sm">
                        {loading ? (
                            <tr><td colSpan={6} className="p-12 text-center text-slate-400">Cargando movimientos...</td></tr>
                        ) : movements.length === 0 ? (
                            <tr><td colSpan={6} className="p-12 text-center text-slate-400">No hay movimientos en este rango.</td></tr>
                        ) : movements.map((m) => (
                            <tr key={m.id} className="hover:bg-slate-50 transition-colors">
                                <td className="p-4 whitespace-nowrap text-slate-600 font-mono text-xs">
                                    {format(new Date(m.date), "dd MMM yyyy - p", { locale: es })}
                                </td>
                                <td className="p-4 whitespace-nowrap text-slate-700 text-xs font-bold">
                                    {m.user_name || 'Sistema'}
                                </td>
                                <td className="p-4 text-slate-800 font-medium">
                                    <div className="flex flex-col">
                                        <span>{m.description}</span>
                                        {m.payment_method && <span className="text-[10px] text-slate-400 uppercase">{m.payment_method}</span>}
                                    </div>
                                </td>
                                <td className="p-4">
                                    <span className={`px-2 py-1 rounded text-[10px] font-bold uppercase tracking-wide border ${m.type === 'income'
                                        ? 'bg-blue-50 text-blue-600 border-blue-100'
                                        : 'bg-orange-50 text-orange-600 border-orange-100'
                                        }`}>
                                        {m.category || (m.type === 'income' ? 'Ingreso' : 'Gasto')}
                                    </span>
                                </td>
                                <td className="p-4 text-right">
                                    {m.type === 'income' ? (
                                        <span className="font-bold text-green-600">+${m.amount.toLocaleString()}</span>
                                    ) : (
                                        <span className="text-slate-300">-</span>
                                    )}
                                </td>
                                <td className="p-4 text-right">
                                    {m.type === 'expense' ? (
                                        <span className="font-bold text-red-500">-${m.amount.toLocaleString()}</span>
                                    ) : (
                                        <span className="text-slate-300">-</span>
                                    )}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
