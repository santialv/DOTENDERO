"use client";

import { useState } from "react";
import { PaymentMethod, Payment } from "@/types";

interface PaymentModalProps {
    total: number;
    isOpen: boolean;
    onClose: () => void;
    onFinalize: (payments: Payment[], amountTendered: number, change: number) => void;
}

export function PaymentModal({ total, isOpen, onClose, onFinalize }: PaymentModalProps) {
    const [payments, setPayments] = useState<Payment[]>([]);
    const [currentPaymentMethod, setCurrentPaymentMethod] = useState<PaymentMethod | null>(null);
    const [amountTendered, setAmountTendered] = useState<string>("");

    if (!isOpen) return null;

    const totalPaid = payments.reduce((sum, p) => sum + p.amount, 0);
    const remaining = Math.max(0, total - totalPaid);

    const addPayment = (method: PaymentMethod, amount: number) => {
        const newPayment: Payment = { id: crypto.randomUUID(), method, amount };
        const updatedPayments = [...payments, newPayment];
        setPayments(updatedPayments);
        setAmountTendered("");
        setCurrentPaymentMethod(null);
    };

    const handleFinalize = () => {
        // Determine final tendered logic
        // If exact payment or overpayment (change) logic
        const finalTendered = payments.length > 0 ? totalPaid : total;
        // If only cash and single payment, check if tendered was higher
        const change = Math.max(0, totalPaid - total);

        // Auto-fill cash if no payments added (Implicit Exact Cash)
        const finalPayments: Payment[] = payments.length > 0
            ? payments
            : [{ id: crypto.randomUUID(), method: "Efectivo", amount: total }];

        onFinalize(finalPayments, finalTendered, change);
        setPayments([]);
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4 animate-in fade-in duration-200">
            <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md overflow-hidden flex flex-col max-h-[90vh]">
                <div className="p-6 border-b border-slate-100 flex items-center justify-between shrink-0 bg-slate-50/50">
                    <div className="flex flex-col">
                        <h2 className="text-xl font-bold text-slate-900 leading-none">Complete su Pago</h2>
                        <p className="text-sm text-slate-500 mt-1">Total a Pagar: <span className="font-bold text-slate-900">${total.toLocaleString()}</span></p>
                    </div>
                    <button
                        onClick={() => {
                            onClose();
                            setPayments([]);
                        }}
                        className="text-slate-400 hover:text-slate-600 w-8 h-8 flex items-center justify-center rounded-full hover:bg-slate-100 transition-colors"
                    >
                        <span className="material-symbols-outlined">close</span>
                    </button>
                </div>

                <div className="flex-1 overflow-y-auto custom-scrollbar bg-white">
                    <div className={`p-6 text-center ${remaining > 0 ? 'bg-slate-50 border-b border-slate-100' : 'bg-green-50 text-green-700'}`}>
                        {payments.length > 0 && remaining > 0 && (
                            <div className="mb-4 space-y-2">
                                {payments.map(p => (
                                    <div key={p.id} className="flex justify-between items-center text-sm p-3 bg-white rounded-xl border border-slate-200">
                                        <div className="flex items-center gap-2">
                                            <span className="material-symbols-outlined text-slate-400 text-[18px]">
                                                {p.method === 'Efectivo' ? 'payments' : p.method === 'Tarjeta' ? 'credit_card' : 'qr_code'}
                                            </span>
                                            <span className="font-bold text-slate-700">{p.method}</span>
                                        </div>
                                        <span className="font-bold text-slate-900">${p.amount.toLocaleString()}</span>
                                    </div>
                                ))}
                            </div>
                        )}
                        <p className="text-sm font-bold opacity-60 uppercase tracking-widest mb-1">
                            {remaining > 0 ? "Falta por Cobrar" : "¡Venta Pagada!"}
                        </p>
                        <p className={`text-4xl font-black ${remaining > 0 ? 'text-slate-900' : 'text-green-600'}`}>
                            ${remaining.toLocaleString()}
                        </p>
                    </div>

                    <div className="p-6 space-y-6">
                        <div className="flex p-1 bg-slate-100 rounded-xl">
                            {(["Efectivo", "Tarjeta", "QR", "Fiado"] as PaymentMethod[]).map((m) => {
                                const isActive = (currentPaymentMethod || "Efectivo") === m;
                                return (
                                    <button
                                        key={m}
                                        onClick={() => { setCurrentPaymentMethod(m); setAmountTendered(""); }}
                                        className={`flex-1 py-2 rounded-lg text-sm font-bold transition-all ${isActive ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                                    >
                                        {m}
                                    </button>
                                )
                            })}
                        </div>

                        <div className="flex flex-col items-center">
                            <label className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-2">
                                {(currentPaymentMethod || "Efectivo") === "Efectivo" ? "¿Cuánto recibes?" : "Monto a Cobrar"}
                            </label>
                            <div className="relative w-full max-w-xs">
                                <span className={`absolute left-4 top-1/2 -translate-y-1/2 font-bold text-2xl ${amountTendered ? 'text-slate-900' : 'text-slate-300'}`}>$</span>
                                <input
                                    autoFocus
                                    type="number"
                                    value={amountTendered}
                                    placeholder={remaining.toString()}
                                    onChange={(e) => setAmountTendered(e.target.value)}
                                    onKeyDown={(e) => {
                                        if (e.key === 'Enter') {
                                            e.preventDefault();
                                            if (remaining <= 0) {
                                                handleFinalize();
                                                return;
                                            }
                                            if (!amountTendered && payments.length === 0) {
                                                handleFinalize();
                                                return;
                                            }
                                            const val = parseFloat(amountTendered || remaining.toString());
                                            if (val > 0) {
                                                if ((currentPaymentMethod || "Efectivo") === "Efectivo") {
                                                    addPayment("Efectivo", val);
                                                } else {
                                                    addPayment(currentPaymentMethod || "Efectivo", val);
                                                }
                                            }
                                        }
                                    }}
                                    className="w-full pl-10 pr-4 py-4 text-center text-4xl font-black text-slate-900 placeholder-slate-200 border-b-2 border-slate-200 focus:border-primary outline-none transition-colors bg-transparent"
                                />
                            </div>

                            {(currentPaymentMethod || "Efectivo") === "Efectivo" && (
                                <div className="mt-4 p-4 bg-slate-50 rounded-2xl border border-slate-100 w-full text-center">
                                    <p className="text-xs text-slate-500 font-bold uppercase">Su Cambio</p>
                                    <p className={`text-3xl font-black ${parseFloat(amountTendered || "0") >= remaining ? 'text-green-600' : 'text-slate-300'}`}>
                                        ${Math.max(0, (parseFloat(amountTendered || "0") - remaining)).toLocaleString()}
                                    </p>
                                </div>
                            )}
                        </div>

                        {(currentPaymentMethod || "Efectivo") === "Efectivo" && (
                            <div className="grid grid-cols-4 gap-2">
                                {[2000, 5000, 10000, 20000, 50000, 100000].map(val => (
                                    <button
                                        key={val}
                                        onClick={() => setAmountTendered(val.toString())}
                                        className="px-2 py-3 bg-white border border-slate-200 hover:border-primary/50 hover:bg-slate-50 rounded-xl flex flex-col items-center justify-center transition-all active:scale-95"
                                    >
                                        <span className="text-[10px] text-slate-400 font-bold">$</span>
                                        <span className="text-sm font-bold text-slate-700">{val / 1000}k</span>
                                    </button>
                                ))}
                                <button onClick={() => setAmountTendered(remaining.toString())} className="col-span-2 px-2 py-3 bg-primary/10 border border-primary/20 hover:bg-primary/20 rounded-xl text-primary-dark font-bold text-sm">
                                    Exacto
                                </button>
                            </div>
                        )}
                    </div>
                </div>

                <div className="p-4 border-t border-slate-100 bg-slate-50">
                    {remaining <= 0 ? (
                        <button
                            onClick={handleFinalize}
                            className="w-full bg-[#13ec80] hover:bg-[#0eb562] text-slate-900 font-black text-xl py-4 rounded-xl shadow-lg shadow-green-500/20 transition-all flex items-center justify-center gap-2"
                        >
                            <span>FINALIZAR VENTA</span>
                            <span className="material-symbols-outlined">check</span>
                        </button>
                    ) : (
                        <button
                            onClick={() => {
                                const val = parseFloat(amountTendered || remaining.toString());
                                if (val > 0) addPayment(currentPaymentMethod || "Efectivo", Math.min(val, remaining));
                            }}
                            className="w-full bg-slate-900 hover:bg-slate-800 text-white font-bold text-lg py-4 rounded-xl shadow-lg transition-all"
                        >
                            Confirmar Pago
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
}
