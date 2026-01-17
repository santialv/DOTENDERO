import { useState } from "react";
import { useToast } from "@/components/ui/toast";
import { CartItem, Customer, Payment, PaymentMethod } from "@/types";

interface PaymentModalProps {
    isOpen: boolean;
    onClose: () => void;
    total: number;
    cartItems: CartItem[];
    onFinalize: (payments: Payment[], totalPaid: number, change: number) => void;
    currentCustomer: Customer | null;
    onRequestCustomerSelection?: () => void;
}

export function PaymentModal({
    isOpen,
    onClose,
    total,
    cartItems,
    onFinalize,
    currentCustomer,
    onRequestCustomerSelection
}: PaymentModalProps) {
    const { toast } = useToast();
    const [payments, setPayments] = useState<Payment[]>([]);
    const [currentPaymentMethod, setCurrentPaymentMethod] = useState<PaymentMethod | null>(null);
    const [amountTendered, setAmountTendered] = useState<string>("");
    const [showFiadoPartialInput, setShowFiadoPartialInput] = useState(false);

    if (!isOpen) return null;

    // Haptic Helper
    const triggerHaptic = () => {
        if (typeof navigator !== 'undefined' && navigator.vibrate) {
            navigator.vibrate(10);
        }
    };

    const totalPaid = payments.reduce((sum, p) => sum + p.amount, 0);
    const remaining = Math.max(0, total - totalPaid);

    const addPayment = (method: PaymentMethod, amount: number) => {
        const newPayment: Payment = { id: crypto.randomUUID(), method, amount };
        const updatedPayments = [...payments, newPayment];
        setPayments(updatedPayments);
        setAmountTendered("");
        setCurrentPaymentMethod(null);
        setShowFiadoPartialInput(false);
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
        triggerHaptic();
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

    const DENOMINATIONS = [
        { value: 1000, label: "$1k" },
        { value: 2000, label: "$2k" },
        { value: 5000, label: "$5k" },
        { value: 10000, label: "$10k" },
        { value: 20000, label: "$20k" },
        { value: 50000, label: "$50k" },
        { value: 100000, label: "$100k" },
    ];

    const handleDenominationClick = (val: number) => {
        triggerHaptic();
        setAmountTendered(val.toString());
    };

    return (
        <div className="fixed inset-0 z-[100] flex items-end md:items-center justify-center bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200 p-0 md:p-4">
            {/* Modal Container: Full width bottom sheet on mobile, centered card on desktop */}
            <div className="bg-white w-full md:max-w-2xl rounded-t-3xl md:rounded-3xl shadow-2xl overflow-hidden flex flex-col h-[95vh] md:h-auto md:max-h-[90vh]">

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
                <div className="flex-1 overflow-y-auto custom-scrollbar bg-white flex flex-col md:flex-row">

                    {/* Left Column (Desktop): Summary & Bill Details */}
                    <div className="flex-1 flex flex-col p-4 md:p-6 space-y-4 bg-slate-50/50">
                        {/* LEFT TOP: Monto a Cobrar */}
                        <div className="p-6 text-center shrink-0 rounded-2xl bg-white border border-slate-200 shadow-sm">
                            <p className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-1">
                                Monto a Cobrar
                            </p>
                            <p className="text-5xl font-black text-slate-900">
                                ${remaining.toLocaleString()}
                            </p>
                            {payments.length > 0 && remaining > 0 && (
                                <div className="mt-3 text-xs flex justify-center gap-2">
                                    <span className="font-bold text-slate-400">Pagado:</span>
                                    <span className="font-bold text-green-600">${totalPaid.toLocaleString()}</span>
                                </div>
                            )}
                        </div>

                        {/* Customer Info & Debt Visualizer */}
                        {currentCustomer && currentCustomer.id !== 'default' && (
                            <div className={`p-4 rounded-xl border flex justify-between items-center transition-all ${currentPaymentMethod === 'Fiado' ? 'bg-blue-50 border-blue-200' : 'bg-white border-slate-200'}`}>
                                <div>
                                    <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Cliente</p>
                                    <p className="font-bold text-slate-900 leading-tight">{currentCustomer.name}</p>
                                    <p className="text-xs text-slate-400">{currentCustomer.document_number || "Sin Documento"}</p>
                                </div>
                                <div className="text-right">
                                    <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Deuda Actual</p>
                                    <p className={`text-xl font-black ${(currentCustomer.current_debt || 0) > 0 ? 'text-red-500' : 'text-green-600'}`}>
                                        ${(currentCustomer.current_debt || 0).toLocaleString()}
                                    </p>
                                </div>
                            </div>
                        )}

                        {/* LEFT MIDDLE: Invoice Summary */}
                        <div className="flex-1 bg-white rounded-xl border border-dashed border-slate-300 p-4 space-y-2 text-sm text-slate-600">
                            <h3 className="font-bold text-slate-400 text-xs uppercase mb-2">Resumen de Factura</h3>
                            <div className="flex justify-between">
                                <span>Subtotal</span>
                                <span className="font-medium">
                                    ${(cartItems.reduce((acc, item) => acc + (item.finalPrice * item.quantity) / (1 + (item.tax || 0) / 100), 0)).toLocaleString(undefined, { maximumFractionDigits: 0 })}
                                </span>
                            </div>
                            <div className="flex justify-between">
                                <span>Impuestos (IVA/ICO)</span>
                                <span className="font-medium">
                                    ${(total - (cartItems.reduce((acc, item) => acc + (item.finalPrice * item.quantity) / (1 + (item.tax || 0) / 100), 0))).toLocaleString(undefined, { maximumFractionDigits: 0 })}
                                </span>
                            </div>
                            <div className="border-t border-slate-100 my-2 pt-2 flex justify-between font-bold text-slate-900">
                                <span>Total</span>
                                <span>${total.toLocaleString()}</span>
                            </div>
                            <div className="text-[10px] text-slate-400 text-center mt-4">
                                {cartItems.reduce((acc, item) => acc + item.quantity, 0)} {cartItems.length === 1 ? 'Producto' : 'Productos'}
                            </div>
                        </div>

                        {/* Payment Methods */}
                        <div className="grid grid-cols-4 gap-2">
                            {(["Efectivo", "Tarjeta", "QR", "Fiado"] as PaymentMethod[]).map((m) => {
                                const isActive = (currentPaymentMethod || "Efectivo") === m;
                                return (
                                    <button
                                        key={m}
                                        onClick={() => {
                                            triggerHaptic();
                                            if (m === 'Fiado') {
                                                if (!currentCustomer || currentCustomer.id === 'default') {
                                                    toast("Asigna un cliente para fiar.", "error");
                                                    if (onRequestCustomerSelection) onRequestCustomerSelection();
                                                    return;
                                                }
                                                // Reset partial input on fresh click
                                                setShowFiadoPartialInput(false);
                                                setCurrentPaymentMethod(m);
                                                setAmountTendered("");
                                            } else {
                                                setCurrentPaymentMethod(m);
                                                setAmountTendered("");
                                            }
                                        }}
                                        className={`py-3 rounded-lg text-xs font-bold transition-all flex flex-col items-center justify-center gap-1 ${isActive ? 'bg-slate-900 text-white shadow-lg' : 'bg-white border border-slate-200 text-slate-500 hover:text-slate-900 hover:bg-slate-50'}`}
                                    >
                                        <span className="material-symbols-outlined text-[20px]">
                                            {m === 'Efectivo' ? 'payments' : m === 'Tarjeta' ? 'credit_card' : m === 'QR' ? 'qr_code' : 'contract_edit'}
                                        </span>
                                        {m}
                                    </button>
                                )
                            })}
                        </div>
                    </div>

                    {/* Right Column: Input & Interaction */}
                    <div className="flex-1 flex flex-col p-4 md:p-6 bg-white md:border-l border-slate-100">
                        {currentPaymentMethod === 'Fiado' ? (
                            // --- FIADO SPECIFIC MODE ---
                            <div className="flex-1 flex flex-col justify-between animate-in fade-in slide-in-from-bottom-2 duration-300">
                                <div className="text-center space-y-6 mt-8">
                                    <div className="mx-auto w-16 h-16 rounded-full bg-blue-50 flex items-center justify-center mb-2">
                                        <span className="material-symbols-outlined text-3xl text-blue-600">contract_edit</span>
                                    </div>

                                    <div>
                                        <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">Se enviará a Deuda</p>
                                        <p className="text-5xl font-black text-red-500">
                                            ${(remaining - (parseFloat(amountTendered) || 0)).toLocaleString()}
                                        </p>
                                    </div>

                                    {!showFiadoPartialInput ? (
                                        <button
                                            onClick={() => setShowFiadoPartialInput(true)}
                                            className="px-6 py-3 rounded-xl bg-slate-50 hover:bg-slate-100 text-slate-600 font-bold text-sm border border-slate-200 transition-all active:scale-95"
                                        >
                                            + Agregar Abono / Pago Parcial
                                        </button>
                                    ) : (
                                        <div className="bg-slate-50 rounded-2xl p-6 border border-slate-100 max-w-sm mx-auto animate-in zoom-in duration-200">
                                            <label className="text-xs font-bold text-slate-500 uppercase block mb-2">Monto Abono (Efectivo)</label>
                                            <div className="text-3xl font-black text-slate-900 mb-4 border-b-2 border-slate-200 pb-2">
                                                ${(parseFloat(amountTendered) || 0).toLocaleString()}
                                            </div>
                                            <div className="grid grid-cols-4 gap-2">
                                                {DENOMINATIONS.slice(0, 4).map(d => (
                                                    <button key={d.value} onClick={() => setAmountTendered(d.value.toString())} className="text-xs font-bold py-2 bg-white rounded border hover:border-blue-500 text-slate-600">
                                                        {d.label}
                                                    </button>
                                                ))}
                                                <button onClick={() => setAmountTendered("")} className="col-span-4 text-xs font-bold py-2 text-red-500">Borrar</button>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>
                        ) : (
                            // --- STANDARD MODE (Cash, Card, QR) ---
                            <>
                                {/* RIGHT TOP: Dinero Recibido Input */}
                                <div className="flex-1 flex flex-col items-center justify-center mb-6 relative">
                                    <label className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-2 transition-colors">
                                        {(currentPaymentMethod || "Efectivo") === "Efectivo" ? "Dinero Recibido" : "Confirmar Monto"}
                                    </label>
                                    <div className="relative w-full text-center">
                                        <span className={`text-5xl md:text-6xl font-black tracking-tight ${amountTendered ? 'text-slate-900' : 'text-slate-200'}`}>
                                            ${amountTendered ? parseInt(amountTendered).toLocaleString() : "0"}
                                        </span>
                                    </div>
                                </div>

                                {/* RIGHT MIDDLE: Monto a Devolver (Change) */}
                                <div className="mb-6 min-h-[5rem] flex items-center justify-center">
                                    {(currentPaymentMethod || "Efectivo") === "Efectivo" && parseFloat(amountTendered || "0") >= remaining ? (
                                        <div className="text-center animate-in slide-in-from-bottom-2 duration-300 bg-green-50 w-full py-4 rounded-xl border border-green-100">
                                            <p className="text-xs font-bold text-green-600 uppercase tracking-widest mb-1">Monto a Devolver</p>
                                            <p className="text-4xl font-black text-green-600">
                                                ${(parseFloat(amountTendered || "0") - remaining).toLocaleString()}
                                            </p>
                                        </div>
                                    ) : (
                                        <div className="w-full py-4 rounded-xl border border-dashed border-slate-100 flex flex-col items-center justify-center text-slate-300">
                                            <span className="text-xs font-bold uppercase">Pendiente</span>
                                        </div>
                                    )}
                                </div>

                                {/* RIGHT BOTTOM: Denominations or Keypad */}
                                <div className="hidden md:grid grid-cols-2 gap-3 content-start">
                                    <button
                                        onClick={() => setAmountTendered(remaining.toString())}
                                        className="col-span-2 py-4 bg-slate-50 hover:bg-slate-100 text-slate-900 rounded-xl font-bold text-lg border border-slate-200 transition-colors flex items-center justify-center gap-2 active:scale-95"
                                    >
                                        <span className="material-symbols-outlined">payments</span>
                                        Exacto: ${remaining.toLocaleString()}
                                    </button>

                                    {DENOMINATIONS.map(denom => (
                                        <button
                                            key={denom.value}
                                            onClick={() => handleDenominationClick(denom.value)}
                                            className="py-3 bg-white border border-slate-100 hover:border-[#13ec80] hover:bg-green-50 text-slate-700 hover:text-slate-900 rounded-xl font-bold text-lg shadow-sm transition-all active:scale-95"
                                        >
                                            ${denom.value.toLocaleString()}
                                        </button>
                                    ))}
                                    <button
                                        onClick={() => setAmountTendered("")}
                                        className="col-span-2 py-3 text-red-400 hover:text-red-500 font-bold text-sm hover:bg-red-50 rounded-xl transition-colors"
                                    >
                                        Corregir
                                    </button>
                                </div>

                                {/* MOBILE Keypad */}
                                <div className="grid md:hidden grid-cols-3 gap-2 flex-1 pb-4">
                                    {["1", "2", "3", "4", "5", "6", "7", "8", "9"].map(num => (
                                        <button
                                            key={num}
                                            onClick={() => handleKeypadPress(num)}
                                            className="h-14 bg-white border border-slate-100 rounded-xl text-2xl font-bold text-slate-900 shadow-sm active:bg-slate-50 active:scale-95 transition-transform"
                                        >
                                            {num}
                                        </button>
                                    ))}
                                    <button onClick={() => handleKeypadPress("000")} className="h-14 bg-slate-50 border border-slate-100 rounded-xl text-sm font-bold text-slate-600 active:bg-slate-200">000</button>
                                    <button onClick={() => handleKeypadPress("0")} className="h-14 bg-white border border-slate-100 rounded-xl text-2xl font-bold text-slate-900 shadow-sm active:bg-slate-50 active:scale-95 transition-transform">0</button>
                                    <button onClick={() => handleKeypadPress("backspace")} className="h-14 bg-slate-50 border border-slate-100 rounded-xl text-slate-600 flex items-center justify-center active:bg-red-50 active:text-red-500 transition-colors">
                                        <span className="material-symbols-outlined">backspace</span>
                                    </button>
                                </div>
                            </>
                        )}
                    </div>
                </div>

                {/* Footer Actions */}
                <div className="p-4 md:p-6 border-t border-slate-100 bg-slate-50 shrink-0 pb-safe-area mb-8 md:mb-0">
                    {remaining <= 0 ? (
                        <button
                            onClick={handleFinalize}
                            className="w-full bg-[#13ec80] hover:bg-[#0eb562] text-slate-900 font-black text-xl py-4 rounded-xl shadow-lg shadow-green-500/20 transition-all flex items-center justify-center gap-2 active:scale-95"
                        >
                            <span>FINALIZAR VENTA</span>
                            <span className="material-symbols-outlined font-bold">check</span>
                        </button>
                    ) : (
                        <div className="flex gap-3">
                            {/* Mobile Only Exact Button - Only for Standard Mode usually, but keep for now */}
                            <button
                                onClick={() => setAmountTendered(remaining.toString())}
                                className="md:hidden flex-1 bg-white border border-slate-200 text-slate-600 font-bold py-4 rounded-xl active:bg-slate-50 text-base"
                            >
                                Exacto
                            </button>
                            <button
                                disabled={currentPaymentMethod !== 'Fiado' && (!amountTendered || parseFloat(amountTendered) <= 0)}
                                onClick={() => {
                                    triggerHaptic();
                                    const val = parseFloat(amountTendered) || 0;

                                    if (currentPaymentMethod === 'Fiado') {
                                        const creditAmount = remaining - val;
                                        if (creditAmount < 0) {
                                            toast("El abono no puede ser mayor al total.", "error");
                                            return;
                                        }

                                        const splitPayments = [...payments];
                                        if (val > 0) {
                                            splitPayments.push({ id: crypto.randomUUID(), method: "Efectivo", amount: val });
                                        }
                                        if (creditAmount > 0) {
                                            splitPayments.push({ id: crypto.randomUUID(), method: "Fiado", amount: creditAmount });
                                        }

                                        onFinalize(splitPayments, totalPaid + remaining, 0);
                                        return;
                                    }

                                    if (!val || val <= 0) return;

                                    if (val >= remaining) {
                                        const change = val - remaining;
                                        const newPayment: Payment = {
                                            id: crypto.randomUUID(),
                                            method: currentPaymentMethod || "Efectivo",
                                            amount: remaining
                                        };
                                        const finalPayments = [...payments, newPayment];
                                        onFinalize(finalPayments, totalPaid + val, change);
                                    } else {
                                        const method = currentPaymentMethod || "Efectivo";
                                        if (method !== 'Fiado') {
                                            if (!window.confirm(`El monto ingresado ($${val.toLocaleString()}) es MENOR al total pendiente ($${remaining.toLocaleString()}).\n\n¿Desea registrar un PAGO PARCIAL?`)) {
                                                return;
                                            }
                                        }
                                        addPayment(method, val);
                                    }
                                }}
                                className={`flex-[2] text-white font-bold text-xl py-4 rounded-xl shadow-lg transition-all flex items-center justify-center gap-2 ${((currentPaymentMethod || "Efectivo") as PaymentMethod) !== 'Fiado' && (!amountTendered || parseFloat(amountTendered) <= 0)
                                    ? 'bg-slate-300 cursor-not-allowed'
                                    : 'bg-slate-900 hover:bg-slate-800 active:scale-95'
                                    }`}
                            >
                                {currentPaymentMethod === 'Fiado' ? 'Confirmar Crédito' : 'Cobrar'}
                                <span className="material-symbols-outlined">arrow_forward</span>
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
