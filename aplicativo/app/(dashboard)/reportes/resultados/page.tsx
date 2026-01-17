"use client";

import { IncomeStatement } from "@/components/reports/IncomeStatement";

export default function ResultadosPage() {
    return (
        <div className="p-6 bg-slate-50 min-h-screen font-display">
            <h1 className="text-2xl font-black text-slate-900 mb-6">Estado de Resultados (P&L)</h1>
            <IncomeStatement />
        </div>
    );
}
