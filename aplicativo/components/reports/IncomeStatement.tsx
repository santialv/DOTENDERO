import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { formatCurrency } from '@/lib/utils';
import { Loader2, Calendar, Download, TrendingUp, TrendingDown, DollarSign } from 'lucide-react';
// import { generateIncomeStatementPDF } from '@/lib/pdfUtils'; // We will need to create this later or mock it for now

interface IncomeStatementProps {
    className?: string;
}

export function IncomeStatement({ className }: IncomeStatementProps) {
    // defaults to current month
    const now = new Date();
    const [startDate, setStartDate] = useState(new Date(now.getFullYear(), now.getMonth(), 1).toISOString().split('T')[0]);
    const [endDate, setEndDate] = useState(new Date(now.getFullYear(), now.getMonth() + 1, 0).toISOString().split('T')[0]);

    const [loading, setLoading] = useState(false);
    const [data, setData] = useState({
        revenue: 0,
        cogs: 0, // Cost of Goods Sold
        grossProfit: 0,
        expenses: [] as { category: string; total: number }[],
        totalExpenses: 0,
        netProfit: 0,
        margin: 0
    });

    const fetchReport = async () => {
        setLoading(true);
        try {
            const { data: { session } } = await supabase.auth.getSession();
            if (!session) return;
            const { data: profile } = await supabase.from('profiles').select('organization_id').eq('id', session.user.id).single();
            const orgId = profile?.organization_id;

            if (!orgId) return;

            // 1. Revenue (Ventas)
            // Using invoices is faster for Revenue
            const { data: invoices, error: invError } = await supabase
                .from('invoices')
                .select('total')
                .eq('organization_id', orgId)
                .neq('status', 'cancelled')
                .gte('date', `${startDate}T00:00:00`)
                .lte('date', `${endDate}T23:59:59`);

            if (invError) throw invError;
            const revenue = invoices?.reduce((sum, inv) => sum + (inv.total || 0), 0) || 0;

            // 2. COGS (Costo de Ventas)
            // Query movements directly for accurate historical cost
            let cogs = 0;
            try {
                const { data: movements, error: movError } = await supabase
                    .from('movements')
                    .select('quantity, unit_cost')
                    .eq('organization_id', orgId)
                    .eq('type', 'OUT')
                    .not('invoice_id', 'is', null) // Only sales
                    .gte('created_at', `${startDate}T00:00:00`)
                    .lte('created_at', `${endDate}T23:59:59`);

                if (movError) {
                    console.warn("COGS Warning (ignoring):", movError.message);
                } else {
                    cogs = movements?.reduce((sum, m) => sum + (m.quantity * (m.unit_cost || 0)), 0) || 0;
                }
            } catch (err) {
                console.warn("COGS Calculation failed:", err);
            }

            // 3. Expenses (Gastos Operativos)
            const { data: expenses, error: expError } = await supabase
                .from('expenses')
                .select('*')
                .eq('organization_id', orgId)
                .eq('type', 'expense')
                .gte('date', `${startDate}T00:00:00`)
                .lte('date', `${endDate}T23:59:59`);

            if (expError) throw expError;

            // Group Expenses
            const expenseGroup: Record<string, number> = {};
            expenses?.forEach((exp: any) => {
                const cat = exp.category || 'other';
                const label = getCategoryLabel(cat);
                expenseGroup[label] = (expenseGroup[label] || 0) + exp.amount;
            });

            const expenseList = Object.entries(expenseGroup).map(([category, total]) => ({ category, total }));
            const totalExpenses = expenses?.reduce((sum: number, exp: any) => sum + exp.amount, 0) || 0;

            // Totals
            const grossProfit = revenue - cogs;
            const netProfit = grossProfit - totalExpenses;
            const margin = revenue > 0 ? (netProfit / revenue) * 100 : 0;

            setData({
                revenue,
                cogs,
                grossProfit,
                expenses: expenseList,
                totalExpenses,
                netProfit,
                margin
            });

        } catch (error: any) {
            console.error("Error generating income statement:", error.message || error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchReport();
    }, [startDate, endDate]);

    const getCategoryLabel = (cat: string) => {
        const map: Record<string, string> = {
            'provider': 'Proveedores',
            'utility': 'Servicios Públicos',
            'salary': 'Nómina',
            'personal': 'Retiros Personales',
            'other': 'Otros Gastos'
        };
        return map[cat] || cat;
    };

    return (
        <div className={`bg-white rounded-2xl border border-slate-200 shadow-sm p-6 ${className}`}>

            {/* Header & Controls */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
                <div>
                    <h2 className="text-xl font-black text-slate-900 flex items-center gap-2">
                        <TrendingUp className="w-6 h-6 text-primary" />
                        Estado de Resultados
                    </h2>
                    <p className="text-sm text-slate-500">Pérdidas y Ganancias (P&L)</p>
                </div>

                <div className="flex flex-wrap items-center gap-3">
                    <div className="flex items-center gap-2 bg-slate-50 border border-slate-200 rounded-lg px-3 py-2">
                        <Calendar className="w-4 h-4 text-slate-400" />
                        <input
                            type="date"
                            value={startDate}
                            onChange={(e) => setStartDate(e.target.value)}
                            className="bg-transparent text-sm font-medium text-slate-700 outline-none w-32"
                        />
                        <span className="text-slate-400">-</span>
                        <input
                            type="date"
                            value={endDate}
                            onChange={(e) => setEndDate(e.target.value)}
                            className="bg-transparent text-sm font-medium text-slate-700 outline-none w-32"
                        />
                    </div>

                    <button
                        onClick={fetchReport}
                        className="p-2 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-lg transition-colors"
                        title="Actualizar"
                    >
                        <Loader2 className={`w-5 h-5 ${loading ? 'animate-spin' : ''}`} />
                    </button>

                    {/* Future: PDF Export */}
                    {/* <button className="flex items-center gap-2 px-4 py-2 bg-slate-900 text-white text-sm font-bold rounded-lg hover:bg-slate-800 transition-colors">
                        <Download className="w-4 h-4" /> Exportar
                    </button> */}
                </div>
            </div>

            {/* The Report */}
            {loading ? (
                <div className="py-20 flex justify-center text-slate-300">
                    <Loader2 className="w-10 h-10 animate-spin" />
                </div>
            ) : (
                <div className="max-w-3xl mx-auto space-y-1">

                    {/* REVENUE */}
                    <ReportRow
                        label="Ingresos por Ventas"
                        amount={data.revenue}
                        type="positive"
                        bold
                        icon={<DollarSign className="w-4 h-4" />}
                    />

                    {/* COGS */}
                    <ReportRow
                        label="(-) Costo de Mercancía Vendida (CMV)"
                        amount={data.cogs}
                        type="negative"
                        indent
                    />

                    {/* GROSS PROFIT */}
                    <div className="my-2 border-t border-slate-200 pt-2"></div>
                    <ReportRow
                        label="= Utilidad Bruta"
                        amount={data.grossProfit}
                        type="neutral"
                        bg="bg-slate-50"
                        bold
                        percent={data.revenue ? (data.grossProfit / data.revenue) * 100 : 0}
                    />
                    <div className="mb-6"></div>

                    {/* EXPENSES */}
                    <div className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2 mt-4 px-3">Gastos Operativos</div>
                    {data.expenses.length === 0 && (
                        <div className="px-3 text-sm text-slate-300 italic mb-2">No hay gastos registrados en este periodo</div>
                    )}
                    {data.expenses.map((exp, i) => (
                        <ReportRow
                            key={i}
                            label={`(-) ${exp.category}`}
                            amount={exp.total}
                            type="negative"
                            indent
                        />
                    ))}

                    <div className="my-2 border-t border-slate-200 pt-2"></div>

                    {/* NET PROFIT */}
                    <div className={`p-4 rounded-xl border-2 flex justify-between items-center ${data.netProfit >= 0 ? 'border-green-100 bg-green-50' : 'border-red-100 bg-red-50'}`}>
                        <div>
                            <p className={`text-sm font-bold ${data.netProfit >= 0 ? 'text-green-700' : 'text-red-700'}`}>
                                = UTILIDAD NETA
                            </p>
                            <p className="text-xs text-slate-500 mt-1">
                                Margen Neto: <span className="font-bold">{data.margin.toFixed(1)}%</span>
                            </p>
                        </div>
                        <p className={`text-2xl font-black ${data.netProfit >= 0 ? 'text-green-700' : 'text-red-700'}`}>
                            {formatCurrency(data.netProfit)}
                        </p>
                    </div>

                    {/* AI Tip Placeholder */}
                    <div className="mt-8 bg-purple-50 p-4 rounded-xl border border-purple-100 flex gap-3">
                        <div className="mt-1">
                            <span className="material-symbols-outlined text-purple-600">auto_awesome</span>
                        </div>
                        <div>
                            <h4 className="font-bold text-purple-900 text-sm">Análisis Inteligente (Beta)</h4>
                            <p className="text-xs text-purple-700 leading-relaxed">
                                {data.netProfit > 0
                                    ? "¡Buen trabajo! Tu negocio es rentable este periodo. Tu margen bruto es saludable. Considera reinvertir el excedente en productos de alta rotación."
                                    : "Atención: Tus costos y gastos superan tus ingresos. Revisa tu margen de ganancia por producto y controla las 'Salidas de Caja' innecesarias."
                                }
                            </p>
                        </div>
                    </div>

                </div>
            )}
        </div>
    );
}

function ReportRow({ label, amount, type = "neutral", bold = false, indent = false, bg = "", icon, percent }: any) {
    const color = type === 'positive' ? 'text-slate-900' : type === 'negative' ? 'text-red-500' : 'text-slate-900';

    return (
        <div className={`flex justify-between items-center p-2 rounded-lg ${bg} hover:bg-slate-50 transition-colors`}>
            <div className={`flex items-center gap-2 ${indent ? 'pl-6' : ''}`}>
                {icon && <span className="text-slate-400">{icon}</span>}
                <span className={`text-sm ${bold ? 'font-bold' : 'font-medium text-slate-600'}`}>{label}</span>
            </div>
            <div className="text-right">
                <span className={`text-sm ${bold ? 'font-bold' : 'font-medium'} ${color}`}>
                    {formatCurrency(amount)}
                </span>
                {percent !== undefined && (
                    <span className="block text-[10px] text-slate-400 font-bold">{percent.toFixed(1)}%</span>
                )}
            </div>
        </div>
    )
}
