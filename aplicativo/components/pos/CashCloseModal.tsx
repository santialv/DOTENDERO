import { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { supabase } from '@/lib/supabase';
import { formatCurrency } from '@/lib/utils';
import { useToast } from '@/components/ui/toast';
import { Loader2, Calculator, Save, AlertTriangle, CheckCircle2, FileDown, TrendingDown } from 'lucide-react';
import { generateCashClosePDF } from '@/lib/pdfUtils'; // Assuming this exists or I should check it. 
// If generic PDF gen exists, good. If not, I might need to fix this import later. 
// I'll assume it exists as per previous file read context (it was imported in previous version).

interface CashCloseModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess?: () => void;
    activeShift?: any; // Added to avoid redundant fetching
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

export function CashCloseModal({ isOpen, onClose, onSuccess, activeShift }: CashCloseModalProps) {
    const { toast } = useToast();
    const [loading, setLoading] = useState(false);
    const [successView, setSuccessView] = useState(false);

    // Metadata for PDF
    const [orgName, setOrgName] = useState("");
    const [userName, setUserName] = useState("");
    const [userRole, setUserRole] = useState<string | null>(null);

    // System Data
    const [systemTotals, setSystemTotals] = useState({
        total: 0,
        cash: 0,
        card: 0,
        transfer: 0,
        credit: 0,
        other: 0,
        transactionCount: 0,
        expenses: 0,
        initialCash: 0,
        manualIncome: 0,
    });

    // Shift Data
    const [shiftId, setShiftId] = useState<string | null>(null);

    // User Input (Count)
    const [counts, setCounts] = useState<Record<number, number>>({});
    const [observations, setObservations] = useState("");

    // Fetch transactions for today
    useEffect(() => {
        if (isOpen) {
            fetchShiftAndSales();
            setSuccessView(false);
        } else {
            // Reset state when closed
            setCounts({});
            setObservations("");
        }
    }, [isOpen]);

    // Print helper
    const handlePrint = () => {
        window.print();
    };

    const fetchShiftAndSales = async () => {
        setLoading(true);
        console.log("Fetching shift data...");
        try {
            let workingOrgId = activeShift?.organization_id;
            let workingShift = activeShift;

            // Get Organization ID & Details if not provided
            const { data: { session } } = await supabase.auth.getSession();
            if (!session) {
                console.error("No session found");
                toast("No se encontró sesión activa", "error");
                onClose();
                return;
            }

            if (!workingOrgId) {
                const { data: profile, error: profileError } = await supabase.from('profiles').select('organization_id, role').eq('id', session.user.id).single();

                if (profileError) {
                    console.error("Error fetching profile:", profileError);
                    toast(`Error de perfil: ${profileError.message}`, "error");
                    onClose();
                    return;
                }

                if (!profile?.organization_id) {
                    console.error("Profile exists but has no organization_id:", profile);
                    toast("Error: Tu perfil no tiene una tienda vinculada.", "error");
                    onClose();
                    return;
                }
                workingOrgId = profile.organization_id;
                setUserName(session.user.email || "Usuario");
                setUserRole(profile.role);
            } else {
                // Fetch role even if workingOrgId is provided
                const { data: profile } = await supabase.from('profiles').select('role').eq('id', session.user.id).single();
                setUserRole(profile?.role || 'cashier');
                setUserName(session.user.email || "Usuario");
            }

            // Get Org Name
            const { data: org } = await supabase.from('organizations').select('name').eq('id', workingOrgId).single();
            if (org) setOrgName(org.name);

            // 1. Get Open Shift (if not provided)
            if (!workingShift) {
                console.log("Looking for open shift for org:", workingOrgId);
                const { data: shiftResult, error: shiftError } = await supabase
                    .from('cash_shifts')
                    .select('*')
                    .eq('organization_id', workingOrgId)
                    .ilike('status', 'open')
                    .maybeSingle();

                if (shiftError) throw shiftError;
                workingShift = shiftResult;
            }

            if (!workingShift) {
                console.warn("No open shift found.");
                toast("No se encontró un turno abierto.", "error");
                onClose();
                return;
            }

            console.log("Shift identified:", workingShift.id);
            setShiftId(workingShift.id);

            // 2. Fetch Invoices within Shift Time frame
            const startTime = workingShift.start_time;
            const endTime = new Date().toISOString();

            // Fetch Invoices
            const { data: invoices, error } = await supabase
                .from('invoices')
                .select('*')
                .eq('organization_id', workingOrgId)
                .gte('created_at', startTime)
                .lte('created_at', endTime)
                .ilike('status', 'paid');

            if (error) {
                console.error("Error loading invoices:", error);
                toast("Advertencia: No se pudieron cargar las ventas.", "error");
            }

            // 3. Fetch Cash Movements
            const { data: movements, error: movementsError } = await supabase
                .from('cash_movements')
                .select('*')
                .eq('shift_id', workingShift.id);

            if (movementsError) {
                console.error("Error loading movements:", movementsError);
                toast("Error al cargar movimientos manuales", "error");
            }

            const expensesTotal = movements?.filter(m => m.type === 'out').reduce((acc, curr) => acc + curr.amount, 0) || 0;
            const incomeTotal = movements?.filter(m => m.type === 'in').reduce((acc, curr) => acc + curr.amount, 0) || 0;

            // Calculate Totals
            const totals = {
                total: 0,
                cash: 0,
                card: 0,
                transfer: 0,
                credit: 0,
                other: 0,
                transactionCount: invoices?.length || 0,
                expenses: expensesTotal,
                initialCash: workingShift.initial_cash || 0,
                manualIncome: incomeTotal
            };

            invoices?.forEach(inv => {
                totals.total += inv.total;

                // Robust Payment Method Detection
                const methods = (inv.payment_method || "").toLowerCase();

                // Check multiple keywords for Cash
                if (methods.includes('efectivo') || methods.includes('cash') || methods.includes('contado')) {
                    totals.cash += inv.total;
                } else if (methods.includes('tarjeta') || methods.includes('card') || methods.includes('datáfono')) {
                    totals.card += inv.total;
                } else if (methods.includes('qr') || methods.includes('transferencia') || methods.includes('nequi') || methods.includes('daviplata')) {
                    totals.transfer += inv.total;
                } else if (methods.includes('fiado') || methods.includes('crédito') || methods.includes('credito')) {
                    totals.credit += inv.total;
                } else {
                    totals.other += inv.total;
                }
            });

            setSystemTotals(totals);

        } catch (error) {
            console.error("Error fetching sales:", error);
            toast("Error crítico al cargar datos del turno", "error");
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

    // Expected Cash = Initial + Sales Cash + Manual In - Manual Out (Expenses)
    const expectedCash = Math.max(0,
        systemTotals.initialCash +
        systemTotals.cash +
        systemTotals.manualIncome -
        systemTotals.expenses
    );

    const difference = totalCounted - expectedCash;
    const isBalanced = Math.abs(difference) < 50; // Tolerance

    const handleCloseShift = async () => {
        if (!shiftId) {
            toast("Error: No hay ID de turno activo.", "error");
            return;
        }
        setLoading(true);
        try {
            const { error } = await supabase
                .from('cash_shifts')
                .update({
                    end_time: new Date().toISOString(),
                    final_cash_expected: expectedCash || 0, // Ensure numeric
                    final_cash_real: totalCounted || 0, // Ensure numeric
                    difference: difference || 0, // Ensure numeric
                    status: 'closed',
                    notes: observations
                })
                .eq('id', shiftId);

            if (error) throw error;

            toast("Turno cerrado correctamente", "success");
            setSuccessView(true);
            if (onSuccess) onSuccess();
        } catch (error: any) {
            console.error("Error closing shift:", error);
            toast(`Error al guardar cierre: ${error.message}`, "error");
        } finally {
            setLoading(false);
        }
    };

    const handleDownloadPDF = () => {
        // Adapt to new data structure if needed, or pass extras in "observations"
        generateCashClosePDF({
            organizationName: orgName,
            userName,
            date: new Date().toISOString(),
            systemTotals: {
                ...systemTotals,
                // Add base cash to display if PDF supports it, or merge
            },
            countedCash: totalCounted,
            difference,
            observations: `Base: ${formatCurrency(systemTotals.initialCash)}. ${observations}`,
            denominations: counts
        });
        toast("Informe descargado", "success");
    };

    if (!isOpen) return null;

    return (
        <AnimatePresence>
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 print:p-0 print:bg-white print:static">
                {/* Print Styles */}
                <style jsx global>{`
                    @media print {
                        body * { visibility: hidden; }
                        #cash-close-report, #cash-close-report * { visibility: visible; }
                        #cash-close-report { 
                            position: absolute; 
                            left: 0; 
                            top: 0; 
                            width: 100%; 
                            margin: 0; 
                            padding: 20px;
                            background: white !important;
                            color: black !important;
                            box-shadow: none !important;
                        }
                        .no-print { display: none !important; }
                    }
                `}</style>

                <motion.div
                    id="cash-close-report"
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    className="bg-white rounded-2xl shadow-xl w-full max-w-5xl max-h-[90vh] overflow-hidden flex flex-col print:max-h-none print:shadow-none print:w-full print:max-w-none"
                >
                    {successView ? (
                        <div className="flex flex-col items-center justify-center p-12 text-center h-full print:p-0">
                            <div className="w-20 h-20 bg-green-100 text-green-600 rounded-full flex items-center justify-center mb-6 animate-in zoom-in duration-300 no-print">
                                <CheckCircle2 className="w-10 h-10" />
                            </div>
                            <h2 className="text-3xl font-black text-slate-900 mb-2">¡Turno Cerrado!</h2>
                            <p className="text-slate-500 mb-8 max-w-md no-print">
                                El turno se ha cerrado y registrado correctamente.
                            </p>

                            {/* Print Summary */}
                            <div className="hidden print:block text-left w-full mb-8">
                                <p><strong>Tienda:</strong> {orgName}</p>
                                <p><strong>Responsable:</strong> {userName}</p>
                                <p><strong>Fecha:</strong> {new Date().toLocaleString()}</p>
                                <hr className="my-2" />
                                <p>Total Sistema: {formatCurrency(systemTotals.total)}</p>
                                <p>Efectivo Reportado: {formatCurrency(totalCounted)}</p>
                                <p><strong>Diferencia: {formatCurrency(difference)}</strong></p>
                            </div>

                            <div className="flex gap-4 no-print">
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
                                <button
                                    onClick={handlePrint}
                                    className="px-6 py-3 rounded-xl bg-white border border-slate-200 text-slate-700 font-bold hover:bg-slate-50 transition-colors flex items-center gap-2"
                                >
                                    <span className="material-symbols-outlined">print</span>
                                    Imprimir
                                </button>
                            </div>
                        </div>
                    ) : (
                        <>
                            {/* Header */}
                            <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50/50 no-print">
                                <div>
                                    <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                                        <Calculator className="w-6 h-6 text-primary" />
                                        Cierre de Turno
                                    </h2>
                                    <p className="text-sm text-gray-500 mt-1">
                                        Resumen de movimientos del turno actual
                                    </p>
                                </div>
                                <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
                                    <span className="material-symbols-outlined text-gray-500">close</span>
                                </button>
                            </div>

                            <div className="flex-1 overflow-hidden flex flex-col lg:flex-row print:flex-col print:overflow-visible">
                                {/* Left: System Summary */}
                                <div className="w-full lg:w-1/3 bg-gray-50 p-6 border-r border-gray-100 overflow-y-auto print:w-full print:bg-white print:border-none print:overflow-visible">
                                    <h3 className="font-bold text-gray-700 mb-4 flex items-center gap-2">
                                        <span className="material-symbols-outlined text-blue-500 no-print">dns</span>
                                        Resumen (Sistema)
                                    </h3>

                                    {loading ? (
                                        <div className="flex justify-center py-8"><Loader2 className="animate-spin text-primary" /></div>
                                    ) : (
                                        <div className="space-y-4">

                                            <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm print:border-none print:p-0">
                                                <p className="text-sm text-gray-500 mb-1">Total Esperado en Caja</p>
                                                {userRole === 'cashier' ? (
                                                    <div className="flex items-center gap-2 text-blue-600 bg-blue-50 px-3 py-2 rounded-lg border border-blue-100">
                                                        <span className="material-symbols-outlined text-[18px]">visibility_off</span>
                                                        <p className="text-sm font-bold">Conteo Ciego Activado</p>
                                                    </div>
                                                ) : (
                                                    <p className="text-3xl font-bold text-blue-600">{formatCurrency(expectedCash)}</p>
                                                )}
                                            </div>

                                            {userRole !== 'cashier' && (
                                                <div className="space-y-2 text-sm bg-white p-3 rounded-lg border border-gray-100 print:border-none print:p-0">
                                                    <div className="flex justify-between">
                                                        <span className="text-gray-500">Base Inicial</span>
                                                        <span className="font-semibold text-gray-900">{formatCurrency(systemTotals.initialCash)}</span>
                                                    </div>
                                                    <div className="flex justify-between">
                                                        <span className="text-gray-500">Ventas Efectivo</span>
                                                        <span className="font-semibold text-green-600">+{formatCurrency(systemTotals.cash)}</span>
                                                    </div>
                                                    <div className="flex justify-between">
                                                        <span className="text-gray-500">Ingresos Manuales</span>
                                                        <span className="font-semibold text-green-600">+{formatCurrency(systemTotals.manualIncome)}</span>
                                                    </div>
                                                    <div className="flex justify-between">
                                                        <span className="text-gray-500">Gastos/Salidas</span>
                                                        <span className="font-semibold text-red-600">-{formatCurrency(systemTotals.expenses)}</span>
                                                    </div>
                                                </div>
                                            )}

                                            <div className="mt-4 pt-4 border-t border-gray-200">
                                                <p className="text-xs font-bold text-gray-400 uppercase mb-2">Otros Medios</p>
                                                <div className="space-y-2">
                                                    <div className="flex justify-between">
                                                        <span className="text-gray-600">Tarjeta</span>
                                                        <span className="font-medium">{formatCurrency(systemTotals.card)}</span>
                                                    </div>
                                                    <div className="flex justify-between">
                                                        <span className="text-gray-600">Transferencia</span>
                                                        <span className="font-medium">{formatCurrency(systemTotals.transfer)}</span>
                                                    </div>
                                                    <div className="flex justify-between">
                                                        <span className="text-gray-600">Fiado</span>
                                                        <span className="font-medium">{formatCurrency(systemTotals.credit)}</span>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    )}
                                </div>

                                {/* Right: Cash Count */}
                                <div className="flex-1 p-6 overflow-y-auto bg-white print:hidden">
                                    <h3 className="font-bold text-gray-700 mb-4 flex items-center gap-2">
                                        <span className="material-symbols-outlined text-green-500">payments</span>
                                        Arqueo de Efectivo Real
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
                                            placeholder="Novedades del turno..."
                                            value={observations}
                                            onChange={(e) => setObservations(e.target.value)}
                                        ></textarea>
                                    </div>
                                </div>
                            </div>

                            {/* Footer */}
                            <div className="p-4 border-t border-gray-100 bg-gray-50 flex items-center justify-between no-print">
                                <div className="flex items-center gap-8">
                                    <div>
                                        <p className="text-xs text-gray-500 uppercase font-bold text-right">Total Contado</p>
                                        <p className="text-2xl font-bold text-gray-900">{formatCurrency(totalCounted)}</p>
                                    </div>
                                    {userRole !== 'cashier' && (
                                        <div className={`px-4 py-2 rounded-lg border ${isBalanced ? 'bg-green-50 border-green-100' : 'bg-red-50 border-red-100'}`}>
                                            <p className={`text-xs uppercase font-bold ${isBalanced ? 'text-green-600' : 'text-red-600'}`}>
                                                {isBalanced ? 'Cuadrado' : 'Diferencia'}
                                            </p>
                                            <p className={`text-xl font-bold flex items-center gap-2 ${isBalanced ? 'text-green-700' : 'text-red-700'}`}>
                                                {isBalanced ? <CheckCircle2 className="w-5 h-5" /> : <AlertTriangle className="w-5 h-5" />}
                                                {formatCurrency(difference)}
                                            </p>
                                        </div>
                                    )}
                                    {userRole === 'cashier' && (
                                        <div className="px-4 py-2 rounded-lg border bg-amber-50 border-amber-100">
                                            <p className="text-xs uppercase font-bold text-amber-600">Seguridad Financiera</p>
                                            <p className="text-sm font-medium text-amber-800">El descuadre se revelará al cerrar el turno.</p>
                                        </div>
                                    )}
                                </div>

                                <div className="flex gap-3">
                                    <button
                                        onClick={fetchShiftAndSales}
                                        className="px-4 py-2 text-sm font-bold text-gray-600 hover:bg-white hover:text-gray-900 bg-transparent border border-transparent hover:border-gray-200 rounded-lg transition-all"
                                    >
                                        Recalcular
                                    </button>
                                    <motion.button
                                        whileHover={{ scale: 1.02 }}
                                        whileTap={{ scale: 0.98 }}
                                        onClick={handleCloseShift}
                                        disabled={loading || !shiftId}
                                        className={`px-6 py-2 bg-[#13ec80] hover:bg-[#10d673] text-slate-900 font-bold rounded-lg shadow-sm flex items-center gap-2 ${loading || !shiftId ? 'opacity-50 cursor-not-allowed' : ''}`}
                                    >
                                        <Save className="w-4 h-4 font-bold" />
                                        {loading ? "Cargando..." : "Cerrar Turno"}
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
