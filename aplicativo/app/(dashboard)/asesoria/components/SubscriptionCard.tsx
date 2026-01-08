"use client";

import { useState } from 'react';

// Mock data to simulate API response
const MOCK_SUBSCRIPTION = {
    status: 'active', // 'active' | 'inactive' | 'past_due'
    planName: 'Plan Blindaje Fiscal',
    billingCycle: 'Mensual',
    amount: 150000,
    currency: 'COP',
    lastPaymentDate: '2025-12-01',
    nextPaymentDate: '2026-01-01',
    paymentMethod: '**** 4242',
    autoRenew: true
};

export const SubscriptionCard = () => {
    // Logic to calculate days remaining
    const today = new Date();
    const nextDate = new Date(MOCK_SUBSCRIPTION.nextPaymentDate);
    const diffTime = Math.abs(nextDate.getTime() - today.getTime());
    const daysRemaining = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    const [isProcessing, setIsProcessing] = useState(false);

    const handleMockPayment = () => {
        setIsProcessing(true);
        // Simulate gateway interaction
        setTimeout(() => setIsProcessing(false), 2000);
    };

    const formatCurrency = (val: number) => {
        return new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', maximumFractionDigits: 0 }).format(val);
    };

    return (
        <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm relative overflow-hidden">
            {/* Background decoration */}
            <div className="absolute top-0 right-0 p-4 opacity-5 pointer-events-none">
                <span className="material-symbols-outlined text-[120px]">credit_card</span>
            </div>

            <div className="relative z-10">
                <div className="flex justify-between items-start mb-4">
                    <h2 className="text-sm font-bold text-slate-500 uppercase tracking-wider">Tu Suscripción</h2>
                    <span className={`px-2 py-1 rounded text-[10px] font-bold uppercase tracking-wide border ${MOCK_SUBSCRIPTION.status === 'active'
                            ? 'bg-green-50 text-green-600 border-green-200'
                            : 'bg-red-50 text-red-600 border-red-200'
                        }`}>
                        {MOCK_SUBSCRIPTION.status === 'active' ? '● Activa' : '● Inactiva'}
                    </span>
                </div>

                <div className="mb-6">
                    <h3 className="text-xl font-bold text-slate-900">{MOCK_SUBSCRIPTION.planName}</h3>
                    <p className="text-sm text-slate-500 flex items-center gap-1">
                        {formatCurrency(MOCK_SUBSCRIPTION.amount)}
                        <span className="text-xs bg-slate-100 px-1.5 py-0.5 rounded text-slate-500">/{MOCK_SUBSCRIPTION.billingCycle.toLowerCase()}</span>
                    </p>
                </div>

                {/* Status Grid */}
                <div className="grid grid-cols-2 gap-4 mb-6">
                    <div className="bg-slate-50 p-3 rounded-lg border border-slate-100">
                        <p className="text-[10px] text-slate-400 font-bold uppercase mb-1">Último Pago</p>
                        <p className="text-sm font-bold text-slate-700">{MOCK_SUBSCRIPTION.lastPaymentDate}</p>
                    </div>
                    <div className="bg-indigo-50 p-3 rounded-lg border border-indigo-100 relative overflow-hidden">
                        <div className="absolute right-0 top-0 p-1 opacity-10">
                            <span className="material-symbols-outlined">calendar_clock</span>
                        </div>
                        <p className="text-[10px] text-indigo-400 font-bold uppercase mb-1">Próximo Pago</p>
                        <p className="text-sm font-bold text-indigo-700">{MOCK_SUBSCRIPTION.nextPaymentDate}</p>
                    </div>
                </div>

                {/* Days Remaining Progress */}
                <div className="mb-6">
                    <div className="flex justify-between items-end mb-2">
                        <span className="text-xs font-bold text-slate-600">Tiempo Restante</span>
                        <span className="text-xs font-bold text-indigo-600">{daysRemaining} días</span>
                    </div>
                    <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                        <div
                            className="bg-indigo-600 h-2 rounded-full transition-all duration-1000 ease-out"
                            style={{ width: `${(daysRemaining / 30) * 100}%` }}
                        ></div>
                    </div>
                </div>

                {/* Actions */}
                <div className="flex flex-col gap-3">
                    <button
                        onClick={handleMockPayment}
                        disabled={isProcessing}
                        className="w-full bg-slate-900 hover:bg-slate-800 text-white font-bold py-3 px-4 rounded-xl transition-all shadow-lg hover:shadow-xl flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed group"
                    >
                        {isProcessing ? (
                            <span className="block size-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
                        ) : (
                            <>
                                <span className="material-symbols-outlined group-hover:scale-110 transition-transform">credit_card</span>
                                Gestionar Pago
                            </>
                        )}
                    </button>
                    <p className="text-[10px] text-center text-slate-400 flex items-center justify-center gap-1">
                        <span className="material-symbols-outlined text-[12px]">lock</span>
                        Pagos seguros encriptados
                    </p>
                </div>
            </div>
        </div>
    );
};
