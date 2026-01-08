"use client";

import { useState } from "react";
import { TransactionType } from "@/types";

interface TransactionModalProps {
    isOpen: boolean;
    onClose: () => void;
    type: TransactionType;
    onConfirm: (type: TransactionType, amount: string, description: string) => void;
}

export function TransactionModal({ isOpen, onClose, type, onConfirm }: TransactionModalProps) {
    const [amount, setAmount] = useState("");
    const [description, setDescription] = useState("");

    if (!isOpen) return null;

    const handleConfirm = () => {
        onConfirm(type, amount, description);
        setAmount("");
        setDescription("");
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-md p-4 animate-in fade-in duration-200">
            <div className="bg-white rounded-3xl shadow-2xl w-full max-w-sm overflow-hidden">
                <div className={`p-6 flex items-center justify-between ${type === 'income' ? 'bg-green-50' : 'bg-red-50'}`}>
                    <h2 className={`text-xl font-black ${type === 'income' ? 'text-green-800' : 'text-red-800'}`}>
                        {type === 'income' ? 'Ingreso a Caja' : 'Retiro / Gasto'}
                    </h2>
                    <button onClick={onClose} className="text-slate-500 hover:text-slate-900">
                        <span className="material-symbols-outlined">close</span>
                    </button>
                </div>
                <div className="p-6 space-y-4">
                    <div>
                        <label className="block text-sm font-bold text-slate-900 mb-1">Monto</label>
                        <div className="relative">
                            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 font-bold">$</span>
                            <input
                                type="number"
                                autoFocus
                                value={amount}
                                onChange={e => setAmount(e.target.value)}
                                className="w-full pl-8 pr-4 py-3 bg-slate-50 border-2 border-slate-100 rounded-xl text-xl font-bold text-slate-900 focus:border-slate-900 outline-none transition-all"
                                placeholder="0"
                            />
                        </div>
                    </div>
                    <div>
                        <label className="block text-sm font-bold text-slate-900 mb-1">Descripción / Motivo</label>
                        <input
                            type="text"
                            value={description}
                            onChange={e => setDescription(e.target.value)}
                            className="w-full px-4 py-3 bg-slate-50 border-2 border-slate-100 rounded-xl font-medium text-slate-900 focus:border-slate-900 outline-none transition-all"
                            placeholder={type === 'income' ? "Ej. Base inicial" : "Ej. Pago a proveedor CocaCola"}
                        />
                    </div>
                    <button
                        onClick={handleConfirm}
                        className={`w-full py-4 rounded-xl font-black text-slate-900 shadow-lg transition-transform active:scale-95 mt-2 ${type === 'income'
                            ? 'bg-[#13ec80] hover:bg-[#0eb562] shadow-green-500/30'
                            : 'bg-red-500 hover:bg-red-600 shadow-red-500/30 text-white'
                            }`}
                    >
                        Confirmar {type === 'income' ? 'Ingreso' : 'Retiro'}
                    </button>
                </div>
            </div>
        </div>
    );
}
