"use client";

import { useState, useMemo } from 'react';

type RegimeType = 'SIMPLE' | 'ORDINARIO' | null;

export const TaxSimulator = () => {
    const [monthlyIncome, setMonthlyIncome] = useState(15000000); // Higher default to show contrast
    const [profitMargin, setProfitMargin] = useState(10); // Standard retail margin 10-15%
    const [infoModal, setInfoModal] = useState<RegimeType>(null);

    const UVT_2026 = 52374;

    // Simulation Logic
    const simulation = useMemo(() => {
        const annualIncome = monthlyIncome * 12;
        const incomeInUVT = annualIncome / UVT_2026;

        // --- REGIMEN SIMPLE (RST) ---
        // Group 2 (Retail/Tiendas) Rates 2024/2025 Ref
        // < 6000 UVT: ~1.6%
        // < 30000 UVT: ~2.5%
        // > 30000 UVT: ~5.4%
        let rateRST = 0;
        if (incomeInUVT < 6000) rateRST = 0.016;
        else if (incomeInUVT < 30000) rateRST = 0.025;
        else rateRST = 0.054;

        const taxRST = annualIncome * rateRST;
        const accountingCostRST = 150000 * 12; // Lower compliance burden
        const totalRST = taxRST + accountingCostRST;

        // --- REGIMEN ORDINARIO ---
        // Tax Base = Net Income (Income * Margin)
        // Rate = 35%
        const netIncome = annualIncome * (profitMargin / 100);
        const taxOrdinary = netIncome * 0.35;
        const accountingCostOrdinary = 350000 * 12; // Higher compliance (Exogena, etc)
        const totalOrdinary = taxOrdinary + accountingCostOrdinary;

        const winner = totalRST < totalOrdinary ? 'SIMPLE' : 'ORDINARIO';
        const savings = Math.abs(totalOrdinary - totalRST);

        return {
            annualIncome,
            totalRST,
            totalOrdinary,
            winner,
            savings
        };
    }, [monthlyIncome, profitMargin]);

    const formatCurrency = (val: number) => {
        return new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', maximumFractionDigits: 0 }).format(val);
    };

    return (
        <div className="bg-white rounded-xl border border-indigo-100 p-6 shadow-lg flex flex-col h-full relative">

            {/* --- MODAL (POPUP) --- */}
            {infoModal && (
                <div className="absolute inset-0 z-50 flex items-center justify-center p-4 bg-white/90 backdrop-blur-sm rounded-xl">
                    <div className="bg-white border border-slate-200 shadow-2xl rounded-2xl p-6 max-w-sm w-full relative animate-in fade-in zoom-in duration-200">
                        <button
                            onClick={() => setInfoModal(null)}
                            className="absolute top-3 right-3 text-slate-400 hover:text-slate-600"
                        >
                            <span className="material-symbols-outlined">close</span>
                        </button>

                        <div className={`size-12 rounded-lg flex items-center justify-center mb-4 ${infoModal === 'SIMPLE' ? 'bg-green-100 text-green-600' : 'bg-slate-100 text-slate-600'}`}>
                            <span className="material-symbols-outlined text-2xl">
                                {infoModal === 'SIMPLE' ? 'verified' : 'gavel'}
                            </span>
                        </div>

                        <h3 className="text-lg font-bold text-slate-800 mb-2">
                            {infoModal === 'SIMPLE' ? 'Régimen Simple (RST)' : 'Régimen Ordinario'}
                        </h3>

                        <p className="text-sm text-slate-600 leading-relaxed">
                            {infoModal === 'SIMPLE'
                                ? "Es un modelo simplificado creado para facilitar el pago de impuestos. Pagas una tarifa baja sobre tus ingresos BRUTOS (totales), sin importar tus gastos. Incluye Renta, ICA y Consumo en un solo formulario. Ideal para márgenes de ganancia saludables."
                                : "Es el modelo tradicional. Pagas el 35% de impuestos sobre tu UTILIDAD (ingresos menos gastos). Requiere una contabilidad estricta y detallada. Puede ser mejor si tu negocio tiene márgenes de ganancia muy bajos o pérdidas."}
                        </p>

                        <button
                            onClick={() => setInfoModal(null)}
                            className="mt-6 w-full py-2 bg-slate-900 text-white rounded-lg font-bold text-sm hover:bg-slate-800 transition-colors"
                        >
                            Entendido
                        </button>
                    </div>
                </div>
            )}

            {/* Header */}
            <div className="flex items-center gap-3 mb-6">
                <div className="bg-indigo-600/10 p-2 rounded-lg text-indigo-600">
                    <span className="material-symbols-outlined">calculate</span>
                </div>
                <div>
                    <h3 className="font-bold text-slate-800 text-lg">Simulador de Régimen</h3>
                    <p className="text-sm text-slate-500">¿Cuál te conviene más?</p>
                </div>
            </div>

            {/* Controls */}
            <div className="space-y-6 mb-8">
                {/* Income Slider */}
                <div>
                    <label className="flex justify-between text-sm font-bold text-slate-700 mb-2">
                        <span>Ventas Mensuales</span>
                        <span className="text-indigo-600">{formatCurrency(monthlyIncome)}</span>
                    </label>
                    <input
                        type="range"
                        min="2000000"
                        max="100000000"
                        step="1000000"
                        value={monthlyIncome}
                        onChange={(e) => setMonthlyIncome(Number(e.target.value))}
                        className="w-full h-2 bg-slate-100 rounded-lg appearance-none cursor-pointer accent-indigo-600 hover:bg-slate-200 transition-colors"
                    />
                </div>

                {/* Margin Slider */}
                <div>
                    <div className="flex justify-between items-center mb-2">
                        <label className="text-sm font-bold text-slate-700">Margen de Ganancia</label>
                        <span className="text-slate-500 text-xs bg-slate-100 px-2 py-1 rounded">
                            {profitMargin}%
                        </span>
                    </div>
                    <input
                        type="range"
                        min="1"
                        max="50"
                        step="1"
                        value={profitMargin}
                        onChange={(e) => setProfitMargin(Number(e.target.value))}
                        className="w-full h-2 bg-slate-100 rounded-lg appearance-none cursor-pointer accent-slate-400 hover:bg-slate-200 transition-colors"
                    />
                    <p className="text-[10px] text-slate-400 mt-1">
                        Ajusta esto si tus costos son muy altos (margen bajo) o bajos (margen alto).
                    </p>
                </div>
            </div>

            {/* Comparison Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Result Card: Ordinary */}
                <div
                    className={`border rounded-xl p-4 transition-all relative ${simulation.winner === 'ORDINARIO'
                            ? 'bg-indigo-50 border-indigo-200 ring-2 ring-indigo-500/20 shadow-md'
                            : 'bg-white border-slate-200 opacity-60 grayscale-[0.5]'
                        }`}
                >
                    {simulation.winner === 'ORDINARIO' && (
                        <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-indigo-600 text-white text-[10px] font-bold px-3 py-1 rounded-full shadow-sm">
                            MEJOR OPCIÓN
                        </div>
                    )}
                    <div className="flex justify-between items-start mb-2">
                        <h4 className={`text-xs font-bold uppercase tracking-wider ${simulation.winner === 'ORDINARIO' ? 'text-indigo-700' : 'text-slate-500'}`}>
                            Régimen Ordinario
                        </h4>
                        <button onClick={() => setInfoModal('ORDINARIO')} className="text-slate-400 hover:text-indigo-600">
                            <span className="material-symbols-outlined text-[16px]">info</span>
                        </button>
                    </div>
                    <p className={`text-2xl font-bold mb-1 ${simulation.winner === 'ORDINARIO' ? 'text-indigo-900' : 'text-slate-700'}`}>
                        {formatCurrency(simulation.totalOrdinary)}
                    </p>
                    <p className="text-[10px] text-slate-500">Costo total anual est.</p>
                </div>

                {/* Result Card: Simple */}
                <div
                    className={`border rounded-xl p-4 transition-all relative ${simulation.winner === 'SIMPLE'
                            ? 'bg-green-50 border-green-200 ring-2 ring-green-500/20 shadow-md'
                            : 'bg-white border-slate-200 opacity-60 grayscale-[0.5]'
                        }`}
                >
                    {simulation.winner === 'SIMPLE' && (
                        <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-green-600 text-white text-[10px] font-bold px-3 py-1 rounded-full shadow-sm">
                            MEJOR OPCIÓN
                        </div>
                    )}
                    <div className="flex justify-between items-start mb-2">
                        <h4 className={`text-xs font-bold uppercase tracking-wider ${simulation.winner === 'SIMPLE' ? 'text-green-700' : 'text-slate-500'}`}>
                            Régimen Simple
                        </h4>
                        <button onClick={() => setInfoModal('SIMPLE')} className="text-slate-400 hover:text-green-600">
                            <span className="material-symbols-outlined text-[16px]">info</span>
                        </button>
                    </div>
                    <p className={`text-2xl font-bold mb-1 ${simulation.winner === 'SIMPLE' ? 'text-green-900' : 'text-slate-700'}`}>
                        {formatCurrency(simulation.totalRST)}
                    </p>
                    <p className="text-[10px] text-slate-500">Costo total anual est.</p>
                </div>
            </div>

            {/* Footer Summary */}
            <div className="mt-6 pt-6 border-t border-slate-50 flex items-center justify-between">
                <div>
                    <span className="text-xs font-semibold text-slate-400 uppercase">Tu Ahorro Potencial</span>
                    <p className={`text-xl font-black ${simulation.winner === 'SIMPLE' ? 'text-green-600' : 'text-indigo-600'}`}>
                        {formatCurrency(simulation.savings)}/año
                    </p>
                </div>
                <button
                    className={`font-bold py-2.5 px-5 rounded-xl shadow-lg transition-all transform hover:-translate-y-0.5 text-sm ${simulation.winner === 'SIMPLE'
                            ? 'bg-green-600 hover:bg-green-700 text-white shadow-green-200'
                            : 'bg-indigo-600 hover:bg-indigo-700 text-white shadow-indigo-200'
                        }`}
                >
                    Elegir {simulation.winner === 'SIMPLE' ? 'Simple' : 'Ordinario'}
                </button>
            </div>
        </div>
    );
};
