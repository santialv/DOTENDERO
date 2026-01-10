"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { useToast } from "@/components/ui/toast";

interface Customer {
    id: string;
    full_name: string;
    phone: string;
    current_debt: number;
}

export default function CarteraPage() {
    const { toast } = useToast();
    const [debtors, setDebtors] = useState<Customer[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");

    // Payment Modal State
    const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
    const [selectedDebtor, setSelectedDebtor] = useState<Customer | null>(null);
    const [paymentAmount, setPaymentAmount] = useState("");

    useEffect(() => {
        loadDebtors();
    }, []);

    const loadDebtors = async () => {
        setLoading(true);
        // Fetch only customers with debt > 0
        const { data, error } = await supabase
            .from('customers')
            .select('id, full_name, phone, current_debt')
            .gt('current_debt', 0)
            .order('current_debt', { ascending: false }); // Highest debt first

        if (data) {
            setDebtors(data);
        } else if (error) {
            console.error(error);
        }
        setLoading(false);
    };

    const handleOpenPayment = (customer: Customer) => {
        setSelectedDebtor(customer);
        setPaymentAmount("");
        setIsPaymentModalOpen(true);
    };

    const processPayment = async () => {
        if (!selectedDebtor || !paymentAmount) return;
        const amount = parseFloat(paymentAmount);
        if (amount <= 0) return toast("Monto inválido", "error");
        if (amount > selectedDebtor.current_debt) return toast("El abono no puede superar la deuda", "error");

        try {
            // Get Org ID
            const { data: orgs } = await supabase.from("organizations").select("id").limit(1);
            const orgId = orgs?.[0]?.id;

            // 1. Update Debt in Customer Table
            const newDebt = selectedDebtor.current_debt - amount;
            const { error: debtError } = await supabase
                .from('customers')
                .update({ current_debt: newDebt })
                .eq('id', selectedDebtor.id);

            if (debtError) throw debtError;

            // 2. Register Transaction (Income)
            const { error: incomeError } = await supabase.from('expenses').insert({
                organization_id: orgId,
                description: `Abono de Cartera: ${selectedDebtor.full_name}`,
                amount: amount, // Positive for Income
                type: 'income',
                customer_id: selectedDebtor.id,
                payment_method: 'Efectivo',
                category: 'Abono Cartera'
            });

            if (incomeError) console.error("Error creating income record", incomeError);

            toast(`Abono de $${amount.toLocaleString()} registrado`, "success");
            setIsPaymentModalOpen(false);
            loadDebtors(); // Refresh list

        } catch (error: any) {
            console.error(error);
            toast("Error al procesar el abono", "error");
        }
    };

    // Derived State
    const totalDebt = debtors.reduce((sum, d) => sum + d.current_debt, 0);
    const filteredDebtors = debtors.filter(d =>
        d.full_name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="flex flex-col h-full bg-[#f8fafc] font-display">
            {/* Header with Stats */}
            <div className="px-8 py-8 shrink-0">
                <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-6">
                    <div>
                        <h1 className="text-3xl font-black text-slate-900 tracking-tight flex items-center gap-3">
                            <span className="material-symbols-outlined text-4xl text-slate-400">account_balance_wallet</span>
                            Cartera y Fiados
                        </h1>
                        <p className="text-slate-500 mt-1">Gestiona las cuentas por cobrar a tus clientes.</p>
                    </div>

                    {/* KPI Card */}
                    <div className="bg-white px-6 py-4 rounded-2xl shadow-sm border border-slate-100 flex items-center gap-4 min-w-[280px]">
                        <div className="w-12 h-12 bg-red-100 rounded-xl flex items-center justify-center text-red-600">
                            <span className="material-symbols-outlined text-2xl">price_check</span>
                        </div>
                        <div>
                            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Total por Cobrar</p>
                            <p className="text-2xl font-black text-slate-900">${totalDebt.toLocaleString()}</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Content Filter */}
            <div className="px-8 mb-6">
                <div className="relative max-w-md">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 material-symbols-outlined text-slate-400">search</span>
                    <input
                        className="w-full pl-12 pr-4 py-3 rounded-xl border-none bg-white shadow-sm focus:ring-2 focus:ring-slate-900 outline-none transition-all placeholder:text-slate-400 font-medium"
                        placeholder="Buscar deudor..."
                        value={searchTerm}
                        onChange={e => setSearchTerm(e.target.value)}
                    />
                </div>
            </div>

            {/* List */}
            <div className="flex-1 px-8 pb-8 overflow-hidden">
                <div className="bg-white rounded-3xl shadow-sm border border-slate-200 h-full overflow-hidden flex flex-col">
                    <div className="overflow-y-auto custom-scrollbar flex-1 p-2">
                        {loading ? (
                            <div className="p-10 text-center text-slate-400">Cargando deudores...</div>
                        ) : filteredDebtors.length === 0 ? (
                            <div className="flex flex-col items-center justify-center h-64 text-slate-400">
                                <span className="material-symbols-outlined text-6xl mb-4 opacity-20">sentiment_satisfied</span>
                                <p className="font-bold">¡Excelente! No tienes cuentas por cobrar pendientes.</p>
                            </div>
                        ) : (
                            <table className="w-full text-left border-collapse">
                                <thead className="bg-slate-50 sticky top-0 z-10 text-xs font-bold text-slate-500 uppercase">
                                    <tr>
                                        <th className="p-5 rounded-tl-2xl">Cliente</th>
                                        <th className="p-5">Teléfono</th>
                                        <th className="p-5 text-right">Deuda Pendiente</th>
                                        <th className="p-5 text-center rounded-tr-2xl">Acción</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100">
                                    {filteredDebtors.map(debtor => (
                                        <tr key={debtor.id} className="hover:bg-slate-50 transition-colors group">
                                            <td className="p-5">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center text-slate-500 font-bold group-hover:bg-slate-200 transition-colors">
                                                        {debtor.full_name.charAt(0).toUpperCase()}
                                                    </div>
                                                    <span className="font-bold text-slate-700">{debtor.full_name}</span>
                                                </div>
                                            </td>
                                            <td className="p-5 text-slate-500 font-mono text-sm">{debtor.phone || '-'}</td>
                                            <td className="p-5 text-right">
                                                <span className="bg-red-50 text-red-600 px-3 py-1 rounded-lg font-black text-sm border border-red-100">
                                                    ${debtor.current_debt.toLocaleString()}
                                                </span>
                                            </td>
                                            <td className="p-5 flex justify-center">
                                                <button
                                                    onClick={() => handleOpenPayment(debtor)}
                                                    className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-sm font-bold shadow-lg shadow-slate-900/10 active:scale-95 transition-all flex items-center gap-2"
                                                >
                                                    <span className="material-symbols-outlined text-[18px]">payments</span>
                                                    Abonar
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        )}
                    </div>
                </div>
            </div>

            {/* Payment Modal */}
            {isPaymentModalOpen && selectedDebtor && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
                    <div className="bg-white w-full max-w-sm rounded-[2rem] shadow-2xl p-8 text-center animate-in zoom-in-95 duration-200 relative overflow-hidden">
                        {/* Decorative Background */}
                        <div className="absolute top-0 inset-x-0 h-32 bg-gradient-to-b from-green-50 to-transparent pointer-events-none" />

                        <div className="relative">
                            <div className="w-20 h-20 bg-green-100 text-green-600 rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-sm rotate-3 transform transition-transform hover:rotate-6">
                                <span className="material-symbols-outlined text-4xl">attach_money</span>
                            </div>

                            <h2 className="text-2xl font-black text-slate-900 mb-1">Registrar Abono</h2>
                            <p className="text-slate-500 text-sm mb-8 font-medium">Cliente: {selectedDebtor.full_name}</p>

                            <div className="bg-slate-50 rounded-2xl p-5 mb-6 border border-slate-100">
                                <p className="text-xs text-slate-400 uppercase font-black tracking-widest mb-1">Deuda Total</p>
                                <p className="text-4xl font-black text-slate-900 tracking-tight">${selectedDebtor.current_debt.toLocaleString()}</p>
                            </div>

                            <div className="mb-8">
                                <label className="block text-left text-xs font-bold text-slate-400 uppercase mb-2 ml-1">Monto a abonar</label>
                                <div className="relative">
                                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 font-bold">$</span>
                                    <input
                                        type="number"
                                        autoFocus
                                        className="w-full p-4 pl-8 border-2 border-slate-100 rounded-2xl text-left text-xl font-bold focus:border-green-500 focus:ring-4 focus:ring-green-500/10 outline-none transition-all"
                                        placeholder="0"
                                        value={paymentAmount}
                                        onChange={e => setPaymentAmount(e.target.value)}
                                        onKeyDown={e => e.key === 'Enter' && processPayment()}
                                    />
                                </div>
                            </div>

                            <div className="flex gap-3">
                                <button
                                    onClick={() => setIsPaymentModalOpen(false)}
                                    className="flex-1 py-4 text-slate-500 font-bold hover:bg-slate-50 rounded-2xl transition-colors"
                                >
                                    Cancelar
                                </button>
                                <button
                                    onClick={processPayment}
                                    className="flex-1 py-4 bg-[#00E054] text-slate-900 font-black rounded-2xl hover:bg-[#00c94a] shadow-lg shadow-green-500/20 hover:shadow-green-500/30 active:scale-95 transition-all text-lg"
                                >
                                    Confirmar
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
