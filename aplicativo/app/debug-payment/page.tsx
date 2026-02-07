"use client";

import { useState } from "react";
import { debugPaymentAction } from "@/app/actions/debug-payment";

export default function DebugPaymentPage() {
    const [txId, setTxId] = useState("");
    const [logs, setLogs] = useState<string[]>([]);
    const [loading, setLoading] = useState(false);

    const runDebug = async () => {
        setLoading(true);
        setLogs(["Iniciando..."]);
        try {
            const result = await debugPaymentAction(txId);
            setLogs(result.logs);
        } catch (e: any) {
            setLogs(prev => [...prev, `Error Cliente: ${e.message}`]);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="p-10 max-w-2xl mx-auto font-sans">
            <h1 className="text-2xl font-bold mb-4">🕵️ Debug de Pagos Wompi</h1>

            <div className="flex gap-2 mb-6">
                <input
                    value={txId}
                    onChange={e => setTxId(e.target.value)}
                    placeholder="Pegar ID de Transacción Wompi aquí..."
                    className="flex-1 border p-2 rounded"
                />
                <button
                    onClick={runDebug}
                    disabled={loading || !txId}
                    className="bg-blue-600 text-white px-4 py-2 rounded disabled:opacity-50"
                >
                    {loading ? "Analizando..." : "Analizar"}
                </button>
            </div>

            <div className="bg-slate-900 text-green-400 p-4 rounded-lg font-mono text-sm min-h-[300px] overflow-y-auto">
                {logs.length === 0 ? (
                    <span className="text-slate-500">Los logs aparecerán aquí...</span>
                ) : (
                    logs.map((log, i) => <div key={i} className="mb-1">{log}</div>)
                )}
            </div>

            <div className="mt-4 text-xs text-slate-500">
                Esta herramienta verifica: Conexión Wompi, Estado de Transacción, Conexión Supabase Admin y Lógica de Asignación.
            </div>
        </div>
    );
}
