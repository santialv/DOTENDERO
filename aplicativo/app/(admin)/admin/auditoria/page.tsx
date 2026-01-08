"use client";

import Link from "next/link";

export default function AuditPage() {
    const logs = [
        { id: 1, action: "IMPERSONATE_USER", actor: "admin@dontendero.com", target: "Tienda La Esperanza", date: "2024-05-27 14:30:22", ip: "192.168.1.10", severity: "high" },
        { id: 2, action: "CHANGE_PLAN_PRICE", actor: "admin@dontendero.com", target: "Plan PRO", date: "2024-05-26 09:15:00", ip: "192.168.1.10", severity: "critical" },
        { id: 3, action: "SEND_BROADCAST", actor: "support@dontendero.com", target: "All Users", date: "2024-05-25 18:00:00", ip: "10.0.0.5", severity: "medium" },
        { id: 4, action: "RESET_PASSWORD", actor: "system", target: " user_123", date: "2024-05-25 10:20:11", ip: "server-worker", severity: "low" },
    ];

    return (
        <div className="h-screen overflow-y-auto bg-slate-50 font-sans text-slate-900">
            <nav className="bg-slate-900 text-white px-8 py-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <Link href="/admin/dashboard" className="flex h-8 w-8 items-center justify-center rounded bg-[#13ec80] text-slate-900 hover:opacity-90 transition-opacity">
                        <span className="material-symbols-outlined text-xl">arrow_back</span>
                    </Link>
                    <div>
                        <h1 className="text-xl font-bold leading-none">DonTendero <span className="text-[#13ec80]">ADMIN</span></h1>
                        <p className="text-xs text-slate-400">Auditoría y Seguridad</p>
                    </div>
                </div>
            </nav>

            <main className="p-8 max-w-6xl mx-auto">
                <div className="mb-8">
                    <h2 className="text-2xl font-bold text-slate-900">Bitácora de Eventos (Logs)</h2>
                    <p className="text-slate-500">Registro inmutable de todas las acciones administrativas.</p>
                </div>

                <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                    <div className="px-6 py-4 border-b border-slate-100 bg-slate-50 flex gap-4">
                        <input
                            type="date"
                            className="bg-white border border-slate-200 rounded-lg px-3 py-2 text-sm"
                        />
                        <select className="bg-white border border-slate-200 rounded-lg px-3 py-2 text-sm">
                            <option>Todos los eventos</option>
                            <option>Alta Severidad</option>
                            <option>Inicios de Sesión</option>
                        </select>
                    </div>
                    <table className="w-full text-left text-sm">
                        <thead className="bg-white text-slate-500 border-b border-slate-200">
                            <tr>
                                <th className="px-6 py-3 font-bold">Evento</th>
                                <th className="px-6 py-3 font-bold">Actor (Admin)</th>
                                <th className="px-6 py-3 font-bold">Objetivo</th>
                                <th className="px-6 py-3 font-bold">Fecha / IP</th>
                                <th className="px-6 py-3 font-bold">Severidad</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {logs.map((log) => (
                                <tr key={log.id} className="hover:bg-slate-50 font-mono text-xs">
                                    <td className="px-6 py-4 font-bold text-slate-700">{log.action}</td>
                                    <td className="px-6 py-4 text-blue-600">{log.actor}</td>
                                    <td className="px-6 py-4 text-slate-600">{log.target}</td>
                                    <td className="px-6 py-4 text-slate-500">
                                        <div>{log.date}</div>
                                        <div className="text-[10px] opacity-70">{log.ip}</div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className={`px-2 py-1 rounded border capitalize ${log.severity === 'critical' ? 'bg-red-50 border-red-200 text-red-700' :
                                                log.severity === 'high' ? 'bg-orange-50 border-orange-200 text-orange-700' :
                                                    log.severity === 'medium' ? 'bg-yellow-50 border-yellow-200 text-yellow-700' :
                                                        'bg-slate-100 border-slate-200 text-slate-600'
                                            }`}>
                                            {log.severity}
                                        </span>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </main>
        </div>
    );
}
