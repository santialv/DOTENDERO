"use client";

import { useState } from "react";
import { DailyStartLedger } from "@/components/reports/DailyStartLedger";

export default function LibroDiarioPage() {
    return (
        <div className="p-6 bg-slate-50 min-h-screen font-display">
            <h1 className="text-2xl font-black text-slate-900 mb-6">Libro Diario de Movimientos</h1>
            <DailyStartLedger />
        </div>
    );
}
