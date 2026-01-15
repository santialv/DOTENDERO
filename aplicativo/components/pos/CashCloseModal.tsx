import { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { supabase } from '@/lib/supabase';
import { formatCurrency } from '@/lib/utils';
import { useToast } from '@/components/ui/toast';
import { Loader2, Calculator, Save, AlertTriangle, CheckCircle2, FileDown, TrendingDown } from 'lucide-react';
import { generateCashClosePDF } from '@/lib/pdfUtils';

interface CashCloseModalProps {
    isOpen: boolean;
    onClose: () => void;
}

const DENOMINATIONS = [
    { value: 100000, label: '$100.000' },
    { value: 50000, label: '$50.000' },
    { value: 20000, label: '$20.000' },
    { value: 10000, label: '$10.000' },
    { value: 5000, label: '$5.000' },
    { value: 2000, label: '$2.000' },
    { value: 1000, label: '$1.000' },
    { value: 500, label: '$500' },
    { value: 200, label: '$200' },
    { value: 100, label: '$100' },
    { value: 50, label: '$50' },
];

export function CashCloseModal({ isOpen, onClose }: CashCloseModalProps) {
    const { toast } = useToast();
    const [loading, setLoading] = useState(false);
    const [successView, setSuccessView] = useState(false);

    // Metadata for PDF
    const [orgName, setOrgName] = useState("");
    const [userName, setUserName] = useState("");

    // System Data
    const [systemTotals, setSystemTotals] = useState({
        total: 0,
        cash: 0,
        card: 0,
        transfer: 0,
        credit: 0,
        other: 0,
        transactionCount: 0,
        expenses: 0
    });

    // User Input (Count)
    const [counts, setCounts] = useState<Record<number, number>>({});
    const [observations, setObservations] = useState("");

    // Fetch transactions for today
    useEffect(() => {
        if (isOpen) {
            fetchDailySales();
            setSuccessView(false);
        } else {
            // Reset state when closed
            setCounts({});
            setObservations("");
        }
    }, [isOpen]);

    const fetchDailySales = async () => {
        setLoading(true);
        try {
            const today = new Date();
            today.setHours(0, 0, 0, 0);

            // Get Organization ID & Details
            const { data: { session } } = await supabase.auth.getSession();
            if (!session) return;

            const { data: profile } = await supabase.from('profiles').select('organization_id, full_name, role').eq('id', session.user.id).single();
            if (!profile?.organization_id) return;

            setUserName(profile.full_name || session.user.email || "Usuario");

            // Get Org Name
            const { data: org } = await supabase.from('organizations').select('name').eq('id', profile.organization_id).single();
            if (org) setOrgName(org.name);

            // Fetch Invoices
            const { data: invoices, error } = await supabase
                .from('invoices')
                .select('*')
                .eq('organization_id', profile.organization_id)
                .gte('created_at', today.toISOString())
                .eq('status', 'paid'); // Only paid invoices

            if (error) throw error;

            // Fetch Expenses
            const { data: expenses, error: expensesError } = await supabase
                .from('cash_expenses')
                .select('amount')
                .eq('organization_id', profile.organization_id)
                .gte('created_at', today.toISOString());

            if (expensesError) throw expensesError;

            const totalExpenses = expenses?.reduce((acc, curr) => acc + curr.amount, 0) || 0;

            // Calculate Totals
            const totals = {
                total: 0,
                cash: 0,
                card: 0,
                transfer: 0,
                credit: 0,
                other: 0,
                transactionCount: invoices?.length || 0,
                expenses: totalExpenses
            };

            invoices?.forEach(inv => {
                totals.total += inv.total;

                const methods = (inv.payment_method || "").toLowerCase();

                if (methods.includes('efectivo')) {
                    totals.cash += inv.total;
                } else if (methods.includes('tarjeta')) {
                    totals.card += inv.total;
                } else if (methods.includes('qr') || methods.includes('transferencia')) {
                    totals.transfer += inv.total;
                } else if (methods.includes('fiado')) {
                    totals.credit += inv.total;
                } else {
                    totals.other += inv.total;
                }
            });

            setSystemTotals(totals);

        } catch (error) {
            console.error("Error fetching sales:", error);
            toast("Error al cargar ventas del día", "error");
        } finally {
            setLoading(false);
        }
    };

    const handleCountChange = (value: number, quantity: string) => {
        const qty = parseInt(quantity) || 0;
        setCounts(prev => ({ ...prev, [value]: qty }));
    };

    const totalCounted = useMemo(() => {
        return DENOMINATIONS.reduce((acc, curr) => {
            return acc + (curr.value * (counts[curr.value] || 0));
        }, 0);
    }, [counts]);

    // Expected Cash = Sales Cash - Expenses
    const expectedCash = Math.max(0, systemTotals.cash - systemTotals.expenses);
    const difference = totalCounted - expectedCash;
    const isBalanced = Math.abs(difference) < 50; // Tolerance

    const handleCloseShift = async () => {
        setLoading(true);
        try {
            const { data: { session } } = await supabase.auth.getSession();
            if (!session) {
                toast("No hay sesión activa", "error");
                return;
            }

            const { data: profile } = await supabase.from('profiles').select('organization_id').eq('id', session.user.id).single();
            if (!profile?.organization_id) {
                toast("Error de organización", "error");
                return;
            }

            // Note: We are saving Sales Total, but difference now accounts for expenses.
            // Ideally we should save Expenses too, but to avoid schema error manually,
            // we will note it in observations or just rely on 'difference' reflecting it.
            // If the user runs the migration for expenses column later, we can add it.
            // For now, I'll append expenses info to observations automatically if not present.

            const autoObservation = `Gastos del día: ${formatCurrency(systemTotals.expenses)}. ` + observations;

            const { error } = await supabase.from('cash_closes').insert({
                organization_id: profile.organization_id,
                user_id: session.user.id,
                system_cash_total: systemTotals.cash,
                system_card_total: systemTotals.card,
                system_transfer_total: systemTotals.transfer,
                system_credit_total: systemTotals.credit,
                system_other_total: systemTotals.other,
                system_grand_total: systemTotals.total,
                counted_cash_total: totalCounted,
                difference: difference,
                cash_denomination_details: counts,
                observations: autoObservation
            });

            if (error) throw error;

            toast("Cierre de caja guardado correctamente", "success");
            setSuccessView(true);
        } catch (error: any) {
            console.error("Error closing shift:", error);
            toast(`Error al guardar cierre: ${error.message}`, "error");
        } finally {
            setLoading(false);
        }
    };

    const handleDownloadPDF = () => {
        generateCashClosePDF({
            organizationName: orgName,
            userName,
            date: new Date().toISOString(),
            systemTotals,
            countedCash: totalCounted,
            difference,
            observations,
            denominations: counts
        });
        toast("Informe descargado", "success");
    };

    if (!isOpen) return null;

    return (
        <AnimatePresence>
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
                <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    className="bg-white rounded-2xl shadow-xl w-full max-w-5xl max-h-[90vh] overflow-hidden flex flex-col"
                >
                    {successView ? (
                        <div className="flex flex-col items-center justify-center p-12 text-center h-full">
                            <div className="w-20 h-20 bg-green-100 text-green-600 rounded-full flex items-center justify-center mb-6 animate-in zoom-in duration-300">
                                <CheckCircle2 className="w-10 h-10" />
                            </div>
                            <h2 className="text-3xl font-black text-slate-900 mb-2">¡Cierre de Caja Exitoso!</h2>
                            <p className="text-slate-500 mb-8 max-w-md">
                                El cierre se ha registrado correctamente en el sistema. Puedes descargar el comprobante ahora.
                            </p>

                            <div className="flex gap-4">
                                <button
                                    onClick={onClose}
                                    className="px-6 py-3 rounded-xl border border-slate-200 text-slate-700 font-bold hover:bg-slate-50 transition-colors"
                                >
                                    Cerrar y Volver
                                </button>
                                <button
                                    onClick={handleDownloadPDF}
                                    className="px-6 py-3 rounded-xl bg-slate-900 text-white font-bold hover:bg-slate-800 transition-colors flex items-center gap-2 shadow-lg shadow-slate-900/20"
                                >
                                    <FileDown className="w-5 h-5" />
                                    Descargar PDF
                                </button>
                            </div>
                        </div>
                    ) : (
                        <>
                            {/* Header */}
                            <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
                                <div>
                                    <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                                        <Calculator className="w-6 h-6 text-primary" />
                                        Cierre de Caja
                                    </h2>
                                    <p className="text-sm text-gray-500 mt-1">
                                        {new Date().toLocaleDateString('es-CO', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                                    </p>
                                </div>
                                <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
                                    <span className="material-symbols-outlined text-gray-500">close</span>
                                </button>
                            </div>

                            <div className="flex-1 overflow-hidden flex flex-col lg:flex-row">
                                {/* Left: System Summary */}
                                <div className="w-full lg:w-1/3 bg-gray-50 p-6 border-r border-gray-100 overflow-y-auto">
                                    <h3 className="font-bold text-gray-700 mb-4 flex items-center gap-2">
                                        <span className="material-symbols-outlined text-blue-500">dns</span>
                                        Resumen del Sistema
                                    </h3>

                                    {loading ? (
                                        <div className="flex justify-center py-8"><Loader2 className="animate-spin text-primary" /></div>
                                    ) : (
                                        <div className="space-y-4">
                                            <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
                                                <p className="text-sm text-gray-500 mb-1">Ventas Totales</p>
                                                <p className="text-3xl font-bold text-gray-900">{formatCurrency(systemTotals.total)}</p>
                                                <p className="text-xs text-blue-500 font-medium mt-1">{systemTotals.transactionCount} transacciones</p>
                                            </div>

                                            <div className="space-y-3">
                                                <div className="flex justify-between items-center p-3 bg-white rounded-lg border border-gray-100">
                                                    <span className="flex items-center gap-2 text-gray-600 text-sm">
                                                        <span className="w-2 h-2 rounded-full bg-green-500"></span> Efectivo
                                                    </span>
                                                    <span className="font-semibold">{formatCurrency(systemTotals.cash)}</span>
                                                </div>

                                                {/* Expenses Display */}
                                                <div className="flex justify-between items-center p-3 bg-red-50 rounded-lg border border-red-100">
                                                    <span className="flex items-center gap-2 text-red-600 text-sm font-bold">
                                                        <TrendingDown className="w-4 h-4" /> Gastos / Salidas
                                                    </span>
                                                    <span className="font-bold text-red-700">-{formatCurrency(systemTotals.expenses)}</span>
                                                </div>

                                                <div className="flex justify-between items-center p-3 bg-blue-50 rounded-lg border border-blue-100">
                                                    <span className="flex items-center gap-2 text-blue-600 text-sm font-bold">
                                                        <span className="material-symbols-outlined text-sm">savings</span>
                                                        Neto en Caja (Esperado)
                                                    </span>
                                                    <span className="font-bold text-blue-700">{formatCurrency(expectedCash)}</span>
                                                </div>

                                                <div className="flex justify-between items-center p-3 bg-white rounded-lg border border-gray-100 mt-4">
                                                    <span className="flex items-center gap-2 text-gray-600 text-sm">
                                                        <span className="w-2 h-2 rounded-full bg-blue-500"></span> Tarjeta
                                                    </span>
                                                    <span className="font-semibold">{formatCurrency(systemTotals.card)}</span>
                                                </div>
                                                <div className="flex justify-between items-center p-3 bg-white rounded-lg border border-gray-100">
                                                    <span className="flex items-center gap-2 text-gray-600 text-sm">
                                                        <span className="w-2 h-2 rounded-full bg-purple-500"></span> Transferencia/QR
                                                    </span>
                                                    <span className="font-semibold">{formatCurrency(systemTotals.transfer)}</span>
                                                </div>
                                                <div className="flex justify-between items-center p-3 bg-white rounded-lg border border-gray-100">
                                                    <span className="flex items-center gap-2 text-gray-600 text-sm">
                                                        <span className="w-2 h-2 rounded-full bg-orange-500"></span> Fiado / Crédito
                                                    </span>
                                                    <span className="font-semibold">{formatCurrency(systemTotals.credit)}</span>
                                                </div>
                                            </div>
                                        </div>
                                    )}
                                </div>

                                {/* Right: Cash Count */}
                                <div className="flex-1 p-6 overflow-y-auto bg-white">
                                    <h3 className="font-bold text-gray-700 mb-4 flex items-center gap-2">
                                        <span className="material-symbols-outlined text-green-500">payments</span>
                                        Arqueo de Efectivo
                                    </h3>

                                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mb-6">
                                        {DENOMINATIONS.map((denom) => (
                                            <div key={denom.value} className="bg-gray-50 p-3 rounded-xl border border-gray-100 hover:border-green-200 transition-colors">
                                                <label className="text-xs font-bold text-gray-500 block mb-1">{denom.label}</label>
                                                <div className="flex items-center gap-2">
                                                    <input
                                                        type="number"
                                                        min="0"
                                                        className="w-full bg-white border border-gray-200 rounded-lg px-2 py-1.5 text-right font-mono text-gray-900 focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none"
                                                        placeholder="0"
                                                        onChange={(e) => handleCountChange(denom.value, e.target.value)}
                                                    />
                                                </div>
                                                <p className="text-right text-xs text-gray-400 mt-1 font-mono">
                                                    {formatCurrency(denom.value * (counts[denom.value] || 0))}
                                                </p>
                                            </div>
                                        ))}
                                    </div>

                                    <div className="border-t border-gray-100 pt-6">
                                        <label className="block text-sm font-medium text-gray-700 mb-2">Observaciones</label>
                                        <textarea
                                            className="w-full border border-gray-200 rounded-lg p-3 text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none resize-none"
                                            rows={3}
                                            placeholder="Alguna novedad durante el turno..."
                                            value={observations}
                                            onChange={(e) => setObservations(e.target.value)}
                                        ></textarea>
                                    </div>
                                </div>
                            </div>

                            {/* Footer */}
                            <div className="p-4 border-t border-gray-100 bg-gray-50 flex items-center justify-between">
                                <div className="flex items-center gap-8">
                                    <div>
                                        <p className="text-xs text-gray-500 uppercase font-bold text-right">Total Contado</p>
                                        <p className="text-2xl font-bold text-gray-900">{formatCurrency(totalCounted)}</p>
                                    </div>
                                    <div className={`px-4 py-2 rounded-lg border ${isBalanced ? 'bg-green-50 border-green-100' : 'bg-red-50 border-red-100'}`}>
                                        <p className={`text-xs uppercase font-bold ${isBalanced ? 'text-green-600' : 'text-red-600'}`}>
                                            {isBalanced ? 'Cuadrado' : 'Diferencia'}
                                        </p>
                                        <p className={`text-xl font-bold flex items-center gap-2 ${isBalanced ? 'text-green-700' : 'text-red-700'}`}>
                                            {isBalanced ? <CheckCircle2 className="w-5 h-5" /> : <AlertTriangle className="w-5 h-5" />}
                                            {formatCurrency(difference)}
                                        </p>
                                    </div>
                                </div>

                                <div className="flex gap-3">
                                    <button
                                        onClick={fetchDailySales}
                                        className="px-4 py-2 text-sm font-bold text-gray-600 hover:bg-white hover:text-gray-900 bg-transparent border border-transparent hover:border-gray-200 rounded-lg transition-all"
                                    >
                                        Recalcular
                                    </button>
                                    <motion.button
                                        whileHover={{ scale: 1.02 }}
                                        whileTap={{ scale: 0.98 }}
                                        onClick={handleCloseShift}
                                        className="px-6 py-2 bg-primary text-text-main font-bold rounded-lg shadow-sm hover:bg-primary-hover flex items-center gap-2"
                                    >
                                        <Save className="w-4 h-4" />
                                        Cerrar Caja
                                    </motion.button>
                                </div>
                            </div>
                        </>
                    )}
                </motion.div>
            </div>
        </AnimatePresence>
    );
}
