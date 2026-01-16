"use client";

import { useState } from "react";
import { PaymentMethod, Payment, Customer } from "@/types";
import { useToast } from "@/components/ui/toast";

interface PaymentModalProps {
    total: number;
    isOpen: boolean;
    onClose: () => void;
    onFinalize: (payments: Payment[], amountTendered: number, change: number) => void;
    currentCustomer?: Customer;
    onRequestCustomerSelection?: () => void;
}

export function PaymentModal({ total, isOpen, onClose, onFinalize, currentCustomer, onRequestCustomerSelection }: PaymentModalProps) {
    const { toast } = useToast();
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
        const finalTendered = payments.length > 0 ? totalPaid : total;
        const change = Math.max(0, totalPaid - total);

        const finalPayments: Payment[] = payments.length > 0
            ? payments
            : [{ id: crypto.randomUUID(), method: "Efectivo", amount: total }];

        onFinalize(finalPayments, finalTendered, change);
        setPayments([]);
    };

    // Helper functions for numeric keypad
    const handleKeypadPress = (val: string) => {
        if (val === 'backspace') {
            setAmountTendered(prev => prev.slice(0, -1));
        } else if (val === 'clear') {
            setAmountTendered("");
        } else if (val === '00' || val === '000') {
            if (amountTendered) setAmountTendered(prev => prev + val);
        } else {
            setAmountTendered(prev => prev + val);
        }
    };

    return (
        <div className="fixed inset-0 z-[100] flex items-end md:items-center justify-center bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200 p-0 md:p-4">
            {/* Modal Container: Full width bottom sheet on mobile, centered card on desktop */}
            <div className="bg-white w-full md:max-w-md rounded-t-3xl md:rounded-3xl shadow-2xl overflow-hidden flex flex-col h-[95vh] md:h-auto md:max-h-[90vh]">

                {/* Header */}
                <div className="p-4 md:p-6 border-b border-slate-100 flex items-center justify-between shrink-0 bg-slate-50/50">
                    <div className="flex flex-col">
                        <h2 className="text-lg md:text-xl font-bold text-slate-900 leading-none">Complete su Pago</h2>
                        <p className="text-xs md:text-sm text-slate-500 mt-1">Total: <span className="font-bold text-slate-900">${total.toLocaleString()}</span></p>
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

                {/* Content */}
                <div className="flex-1 overflow-y-auto custom-scrollbar bg-white flex flex-col">
                    {/* Amount Display */}
                    <div className={`p-4 md:p-6 text-center shrink-0 ${remaining > 0 ? 'bg-slate-50 border-b border-slate-100' : 'bg-green-50 text-green-700'}`}>
                        {payments.length > 0 && remaining > 0 && (
                            <div className="mb-2 space-y-1 text-xs">
                                {payments.map(p => (
                                    <div key={p.id} className="flex justify-between items-center p-2 bg-white rounded-lg border border-slate-200">
                                        <div className="flex items-center gap-1">
                                            <span className="material-symbols-outlined text-slate-400 text-[14px]">
                                                {p.method === 'Efectivo' ? 'payments' : p.method === 'Tarjeta' ? 'credit_card' : 'qr_code'}
                                            </span>
                                            <span className="font-bold text-slate-700">{p.method}</span>
                                        </div>
                                        <span className="font-bold text-slate-900">${p.amount.toLocaleString()}</span>
                                    </div>
                                ))}
                            </div>
                        )}
                        <p className="text-[10px] md:text-sm font-bold opacity-60 uppercase tracking-widest mb-1">
                            {remaining > 0 ? "Falta por Cobrar" : "¡Venta Pagada!"}
                        </p>
                        <p className={`text-3xl md:text-4xl font-black ${remaining > 0 ? 'text-slate-900' : 'text-green-600'}`}>
                            ${remaining.toLocaleString()}
                        </p>
                    </div>

                    <div className="p-4 md:p-6 space-y-4 md:space-y-6 flex-1 flex flex-col">
                        {/* Payment Methods */}
                        <div className="grid grid-cols-4 gap-1 p-1 bg-slate-100 rounded-xl shrink-0">
                            {(["Efectivo", "Tarjeta", "QR", "Fiado"] as PaymentMethod[]).map((m) => {
                                const isActive = (currentPaymentMethod || "Efectivo") === m;
                                return (
                                    <button
                                        key={m}
                                        onClick={() => {
                                            if (m === 'Fiado') {
                                                if (!currentCustomer || currentCustomer.id === 'default') {
                                                    toast("Asigna un cliente para fiar.", "error");
                                                    if (onRequestCustomerSelection) onRequestCustomerSelection();
                                                    return;
                                                }
                                            }
                                            setCurrentPaymentMethod(m);
                                            setAmountTendered("");
                                        }}
                                        className={`py-2 rounded-lg text-[10px] md:text-sm font-bold transition-all flex flex-col items-center justify-center gap-1 ${isActive ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                                    >
                                        <span className="material-symbols-outlined text-[16px] md:text-[20px]">
                                            {m === 'Efectivo' ? 'payments' : m === 'Tarjeta' ? 'credit_card' : m === 'QR' ? 'qr_code' : 'contract_edit'}
                                        </span>
                                        {m}
                                    </button>
                                )
                            })}
                        </div>

                        {/* Input Area */}
                        <div className="flex flex-col items-center flex-1 justify-center min-h-[80px]">
                            <label className="text-[10px] md:text-xs font-bold text-slate-500 uppercase tracking-widest mb-0">
                                {(currentPaymentMethod || "Efectivo") === "Efectivo" ? "¿Cuánto recibes?" : "Monto a Cobrar"}
                            </label>
                            <div className="relative w-full text-center">
                                <span className={`text-2xl md:text-4xl font-black ${amountTendered ? 'text-slate-900' : 'text-slate-300'}`}>
                                    ${amountTendered ? parseInt(amountTendered).toLocaleString() : remaining.toLocaleString()}
                                </span>
                            </div>

                            {/* Change Display */}
                            {(currentPaymentMethod || "Efectivo") === "Efectivo" && amountTendered && (
                                <div className="mt-2 px-3 py-1 bg-slate-50 rounded-lg border border-slate-100 text-center">
                                    <span className="text-[10px] text-slate-500 font-bold uppercase mr-2">Cambio:</span>
                                    <span className={`text-lg font-black ${parseFloat(amountTendered || "0") >= remaining ? 'text-green-600' : 'text-red-400'}`}>
                                        ${Math.max(0, (parseFloat(amountTendered || "0") - remaining)).toLocaleString()}
                                    </span>
                                </div>
                            )}
                        </div>

                        {/* Numeric Keypad for Mobile (Visible mainly on mobile or if needed) */}
                        <div className="grid grid-cols-3 gap-2 md:gap-3 flex-1 pb-4">
                            {["1", "2", "3", "4", "5", "6", "7", "8", "9"].map(num => (
                                <button
                                    key={num}
                                    onClick={() => handleKeypadPress(num)}
                                    className="h-10 md:h-14 bg-white border border-slate-100 rounded-xl text-xl font-bold text-slate-900 shadow-sm active:bg-slate-50"
                                >
                                    {num}
                                </button>
                            ))}
                            <button onClick={() => handleKeypadPress("000")} className="h-10 md:h-14 bg-slate-50 border border-slate-100 rounded-xl text-xs font-bold text-slate-600">000</button>
                            <button onClick={() => handleKeypadPress("0")} className="h-10 md:h-14 bg-white border border-slate-100 rounded-xl text-xl font-bold text-slate-900 shadow-sm">0</button>
                            <button onClick={() => handleKeypadPress("backspace")} className="h-10 md:h-14 bg-slate-50 border border-slate-100 rounded-xl text-slate-600 flex items-center justify-center">
                                <span className="material-symbols-outlined">backspace</span>
                            </button>
                        </div>
                    </div>
                </div>

                {/* Footer Actions */}
                <div className="p-4 border-t border-slate-100 bg-slate-50 shrink-0 pb-safe-area mb-8 md:mb-0">
                    {remaining <= 0 ? (
                        <button
                            onClick={handleFinalize}
                            className="w-full bg-[#13ec80] hover:bg-[#0eb562] text-slate-900 font-black text-lg md:text-xl py-3 md:py-4 rounded-xl shadow-lg shadow-green-500/20 transition-all flex items-center justify-center gap-2 active:scale-95"
                        >
                            <span>FINALIZAR VENTA</span>
                            <span className="material-symbols-outlined">check</span>
                        </button>
                    ) : (
                        <div className="flex gap-2">
                            <button
                                onClick={() => setAmountTendered(remaining.toString())}
                                className="flex-1 bg-white border border-slate-200 text-slate-600 font-bold py-3 md:py-4 rounded-xl active:bg-slate-50 text-sm md:text-base"
                            >
                                Exacto
                            </button>
                            <button
                                onClick={() => {
                                    const val = parseFloat(amountTendered || remaining.toString());
                                    if (val > 0) addPayment(currentPaymentMethod || "Efectivo", Math.min(val, remaining));
                                }}
                                className="flex-[2] bg-slate-900 hover:bg-slate-800 text-white font-bold text-lg py-3 md:py-4 rounded-xl shadow-lg transition-all active:scale-95"
                            >
                                Cobrar
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
