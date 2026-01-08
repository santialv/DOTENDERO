"use client";

import { useState } from 'react';

const TAX_EVENTS_2026 = [
    { name: "Renta Grandes Contribuyentes (Cuota 1)", date: "2026-02-10", type: "Renta" },
    { name: "IVA Bimestral (Ene-Feb)", date: "2026-03-10", type: "IVA" },
    { name: "Renta Personas Jurídicas (Cuota 1)", date: "2026-05-12", type: "Renta" },
    { name: "Renta Personas Naturales (Inicio)", date: "2026-08-12", type: "Renta" },
    { name: "Régimen Simple (Anticipo Ene-Feb)", date: "2026-05-12", type: "Simple" },
    { name: "Impuesto al Patrimonio (Cuota 1)", date: "2026-05-12", type: "Patrimonio" },
    { name: "ICA Anual (Bogotá - Aprox)", date: "2026-04-18", type: "ICA" },
    { name: "IVA Cuatrimestral (Ene-Abr)", date: "2026-05-12", type: "IVA" },
    { name: "Retención en la Fuente (Enero)", date: "2026-02-10", type: "Retención" },
];

export const TaxCalendar2026 = () => {
    const [filter, setFilter] = useState("Todos");

    // Helper to get 'human' date
    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        return new Intl.DateTimeFormat('es-CO', { day: 'numeric', month: 'long', year: 'numeric' }).format(date);
    };

    const upcomingEvents = TAX_EVENTS_2026.filter(e => filter === "Todos" || e.type === filter);

    return (
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm flex flex-col h-full">
            <div className="bg-slate-50 px-6 py-5 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h3 className="font-bold text-slate-800 text-lg flex items-center gap-2">
                        <span className="material-symbols-outlined text-indigo-600">calendar_month</span>
                        Calendario Tributario 2026
                    </h3>
                    <p className="text-sm text-slate-500">Próximos vencimientos para tu negocio</p>
                </div>
                <div className="flex gap-2">
                    <span className="text-xs font-mono bg-indigo-50 text-indigo-700 px-3 py-1.5 rounded-lg border border-indigo-100 self-start">UVT 2026: $52.374</span>
                </div>
            </div>

            <div className="p-4 border-b border-slate-100 overflow-x-auto">
                <div className="flex gap-2">
                    {["Todos", "Renta", "IVA", "Simple", "ICA"].map(type => (
                        <button
                            key={type}
                            onClick={() => setFilter(type)}
                            className={`px-4 py-2 rounded-lg text-sm font-bold whitespace-nowrap transition-all ${filter === type ? 'bg-indigo-600 text-white shadow-md shadow-indigo-200' : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'}`}
                        >
                            {type}
                        </button>
                    ))}
                </div>
            </div>

            <div className="flex-1 overflow-y-auto min-h-[300px] p-0">
                {upcomingEvents.length > 0 ? (
                    upcomingEvents.map((event, idx) => (
                        <div key={idx} className="flex items-center gap-5 p-5 hover:bg-slate-50 transition-colors border-b border-slate-50 last:border-0 group cursor-default">
                            <div className="flex flex-col items-center justify-center min-w-[70px] h-[70px] bg-slate-100 rounded-xl border border-slate-200 group-hover:bg-white group-hover:border-indigo-200 group-hover:shadow-sm transition-all">
                                <span className="text-xs font-bold text-slate-500 uppercase group-hover:text-indigo-600">{new Date(event.date).toLocaleString('es-CO', { month: 'short' })}</span>
                                <span className="text-2xl font-black text-slate-800 group-hover:text-indigo-700">{event.date.split('-')[2]}</span>
                            </div>
                            <div className="flex-1">
                                <div className="flex items-center gap-2 mb-1">
                                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded uppercase tracking-wider ${event.type === 'Renta' ? 'bg-blue-100 text-blue-700' :
                                            event.type === 'IVA' ? 'bg-purple-100 text-purple-700' :
                                                event.type === 'Simple' ? 'bg-green-100 text-green-700' :
                                                    'bg-slate-100 text-slate-600'
                                        }`}>
                                        {event.type}
                                    </span>
                                </div>
                                <h4 className="text-base font-bold text-slate-900 mb-0.5">{event.name}</h4>
                                <p className="text-sm text-slate-500">Vence: <strong className="text-slate-700">{formatDate(event.date)}</strong></p>
                            </div>
                            <button className="text-slate-300 hover:text-indigo-600 opacity-0 group-hover:opacity-100 transition-opacity">
                                <span className="material-symbols-outlined text-2xl">event_available</span>
                            </button>
                        </div>
                    ))
                ) : (
                    <div className="flex flex-col items-center justify-center h-full p-10 text-slate-400">
                        <span className="material-symbols-outlined text-4xl mb-2">event_busy</span>
                        <p>No hay eventos para este filtro.</p>
                    </div>
                )}
            </div>

            <div className="bg-yellow-50 p-4 border-t border-yellow-100">
                <p className="text-xs text-yellow-800 font-medium flex items-start gap-2">
                    <span className="material-symbols-outlined text-base">warning</span>
                    <span>
                        <strong>Importante:</strong> Las fechas exactas dependen de los últimos dígitos de tu NIT. Activa el servicio para ver tu calendario personalizado.
                    </span>
                </p>
            </div>
        </div>
    );
};
