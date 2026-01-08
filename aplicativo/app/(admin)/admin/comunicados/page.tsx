"use client";

import { useState } from "react";
import Link from "next/link";

export default function BroadcastsPage() {
    const [activeTab, setActiveTab] = useState<'compose' | 'history'>('compose');
    const [preview, setPreview] = useState({
        title: "Mantenimiento Programado",
        message: "La plataforma no estará disponible este Domingo de 2am a 4am por mejoras en la base de datos.",
        type: "warning" as "info" | "warning" | "success" | "error"
    });

    const broadcasts = [
        { id: 1, title: "¡Bienvenido al nuevo DonTendero!", date: "2024-05-20", status: "Sent", openRate: "85%" },
        { id: 2, title: "Actualización de Precios", date: "2024-05-10", status: "Sent", openRate: "62%" },
        { id: 3, title: "Recordatorio de Pago", date: "2024-05-01", status: "Draft", openRate: "-" },
    ];

    return (
        <div className="h-screen overflow-y-auto bg-slate-50 font-sans text-slate-900">
            {/* Top Navigation (Shared) */}
            <nav className="bg-slate-900 text-white px-8 py-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <Link href="/admin/dashboard" className="flex h-8 w-8 items-center justify-center rounded bg-[#13ec80] text-slate-900 hover:opacity-90 transition-opacity">
                        <span className="material-symbols-outlined text-xl">arrow_back</span>
                    </Link>
                    <div>
                        <h1 className="text-xl font-bold leading-none">DonTendero <span className="text-[#13ec80]">ADMIN</span></h1>
                        <p className="text-xs text-slate-400">Centro de Comunicaciones</p>
                    </div>
                </div>
            </nav>

            <main className="p-8 max-w-5xl mx-auto">
                <div className="flex gap-8">
                    {/* Sidebar / Types */}
                    <div className="w-64 shrink-0">
                        <button
                            onClick={() => setActiveTab('compose')}
                            className={`nav-button w-full text-left px-4 py-3 rounded-xl mb-2 flex items-center gap-3 transition-colors ${activeTab === 'compose' ? 'bg-[#13ec80] text-slate-900 font-bold shadow-lg shadow-[#13ec80]/20' : 'bg-white text-slate-600 hover:bg-slate-100'}`}
                        >
                            <span className="material-symbols-outlined">edit_square</span>
                            Redactar Nuevo
                        </button>
                        <button
                            onClick={() => setActiveTab('history')}
                            className={`nav-button w-full text-left px-4 py-3 rounded-xl mb-2 flex items-center gap-3 transition-colors ${activeTab === 'history' ? 'bg-[#13ec80] text-slate-900 font-bold shadow-lg shadow-[#13ec80]/20' : 'bg-white text-slate-600 hover:bg-slate-100'}`}
                        >
                            <span className="material-symbols-outlined">history</span>
                            Historial
                        </button>
                    </div>

                    {/* Content Area */}
                    <div className="flex-1">
                        {activeTab === 'compose' && (
                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                                {/* Form */}
                                <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
                                    <h2 className="text-lg font-bold mb-4 flex items-center gap-2">
                                        <span className="material-symbols-outlined text-purple-600">campaign</span>
                                        Configurar Mensaje
                                    </h2>

                                    <div className="space-y-4">
                                        <div>
                                            <label className="block text-sm font-bold text-slate-700 mb-1">Título del Anuncio</label>
                                            <input
                                                type="text"
                                                value={preview.title}
                                                onChange={(e) => setPreview({ ...preview, title: e.target.value })}
                                                className="w-full rounded-lg border border-slate-200 p-2 text-sm focus:border-[#13ec80] focus:ring-1 focus:ring-[#13ec80] outline-none"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-bold text-slate-700 mb-1">Mensaje (Cuerpo)</label>
                                            <textarea
                                                rows={4}
                                                value={preview.message}
                                                onChange={(e) => setPreview({ ...preview, message: e.target.value })}
                                                className="w-full rounded-lg border border-slate-200 p-2 text-sm focus:border-[#13ec80] focus:ring-1 focus:ring-[#13ec80] outline-none resize-none"
                                            ></textarea>
                                        </div>

                                        <div className="grid grid-cols-2 gap-4">
                                            <div>
                                                <label className="block text-sm font-bold text-slate-700 mb-1">Tipo de Alerta</label>
                                                <select
                                                    value={preview.type}
                                                    onChange={(e) => setPreview({ ...preview, type: e.target.value as any })}
                                                    className="w-full rounded-lg border border-slate-200 p-2 text-sm outline-none"
                                                >
                                                    <option value="info">Información (Azul)</option>
                                                    <option value="success">Éxito (Verde)</option>
                                                    <option value="warning">Advertencia (Naranja)</option>
                                                    <option value="error">Crítico (Rojo)</option>
                                                </select>
                                            </div>
                                            <div>
                                                <label className="block text-sm font-bold text-slate-700 mb-1">Audiencia</label>
                                                <select className="w-full rounded-lg border border-slate-200 p-2 text-sm outline-none">
                                                    <option value="all">Todos los Usuarios (142)</option>
                                                    <option value="pro">Solo Plan PRO (86)</option>
                                                    <option value="free">Solo Plan FREE (56)</option>
                                                </select>
                                            </div>
                                        </div>

                                        <div className="pt-4 border-t border-slate-100 flex gap-3">
                                            <button className="flex-1 bg-[#13ec80] hover:bg-[#0fd671] text-slate-900 font-bold py-2.5 rounded-lg shadow-lg shadow-[#13ec80]/20 transition-all active:scale-95">
                                                Enviar Broadcast
                                            </button>
                                            <button className="px-4 border border-slate-200 font-bold text-slate-600 rounded-lg hover:bg-slate-50">
                                                Guardar Borrador
                                            </button>
                                        </div>
                                    </div>
                                </div>

                                {/* Live Preview */}
                                <div>
                                    <h2 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4">Vista Previa (Dashboard Usuario)</h2>

                                    <div className="bg-slate-100 p-6 rounded-3xl border-8 border-slate-800 shadow-2xl relative overflow-hidden aspect-[16/10]">
                                        {/* Fake App Background */}
                                        <div className="absolute top-0 left-0 right-0 h-16 bg-white flex items-center px-4 border-b border-slate-200">
                                            <div className="w-8 h-8 bg-[#13ec80] rounded mr-3"></div>
                                            <div className="w-32 h-4 bg-slate-200 rounded"></div>
                                        </div>

                                        {/* The Alert Component */}
                                        <div className={`absolute top-20 right-4 left-4 p-4 rounded-xl border shadow-lg flex items-start gap-4 animate-in slide-in-from-top-4 duration-500
                                    ${preview.type === 'info' ? 'bg-blue-50 border-blue-100 text-blue-900' :
                                                preview.type === 'warning' ? 'bg-orange-50 border-orange-100 text-orange-900' :
                                                    preview.type === 'success' ? 'bg-green-50 border-green-100 text-green-900' :
                                                        'bg-red-50 border-red-100 text-red-900'}
                                `}>
                                            <div className={`p-2 rounded-full shrink-0
                                        ${preview.type === 'info' ? 'bg-blue-100 text-blue-600' :
                                                    preview.type === 'warning' ? 'bg-orange-100 text-orange-600' :
                                                        preview.type === 'success' ? 'bg-green-100 text-green-600' :
                                                            'bg-red-100 text-red-600'}
                                    `}>
                                                <span className="material-symbols-outlined">
                                                    {preview.type === 'info' ? 'info' :
                                                        preview.type === 'warning' ? 'warning' :
                                                            preview.type === 'success' ? 'check_circle' : 'error'}
                                                </span>
                                            </div>
                                            <div>
                                                <h4 className="font-bold text-sm mb-1">{preview.title}</h4>
                                                <p className="text-xs opacity-90 leading-relaxed">{preview.message}</p>
                                            </div>
                                            <button className="ml-auto text-current opacity-50 hover:opacity-100">
                                                <span className="material-symbols-outlined text-lg">close</span>
                                            </button>
                                        </div>
                                    </div>
                                    <p className="text-center text-xs text-slate-400 mt-2">Así lo verán tus clientes en su sistema.</p>
                                </div>
                            </div>
                        )}

                        {activeTab === 'history' && (
                            <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                                <table className="w-full text-left text-sm">
                                    <thead className="bg-slate-50 text-slate-500">
                                        <tr>
                                            <th className="px-6 py-3 font-bold">Título</th>
                                            <th className="px-6 py-3 font-bold">Fecha</th>
                                            <th className="px-6 py-3 font-bold">Estado</th>
                                            <th className="px-6 py-3 font-bold">Tasa Apertura</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-100">
                                        {broadcasts.map((b) => (
                                            <tr key={b.id} className="hover:bg-slate-50">
                                                <td className="px-6 py-4 font-bold text-slate-900">{b.title}</td>
                                                <td className="px-6 py-4 text-slate-600">{b.date}</td>
                                                <td className="px-6 py-4">
                                                    <span className={`px-2 py-1 rounded-full text-xs font-bold ${b.status === 'Sent' ? 'bg-green-100 text-green-700' : 'bg-slate-100 text-slate-600'
                                                        }`}>
                                                        {b.status === 'Sent' ? 'Enviado' : 'Borrador'}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4 text-slate-600">{b.openRate}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </div>
                </div>
            </main>
        </div>
    );
}
