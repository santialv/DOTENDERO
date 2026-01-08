"use client";

import { useState } from 'react';
import { differenceInMonths, parseISO } from 'date-fns';

export function DownloadReports() {
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');
    const [reportType, setReportType] = useState('sales');
    const [error, setError] = useState('');
    const [showFormats, setShowFormats] = useState(false);

    const handleDateChange = (type: 'start' | 'end', value: string) => {
        setError('');
        if (type === 'start') {
            setStartDate(value);
            if (endDate && value) {
                validateRange(value, endDate);
            }
        } else {
            setEndDate(value);
            if (startDate && value) {
                validateRange(startDate, value);
            }
        }
    };

    const validateRange = (start: string, end: string) => {
        const startObj = parseISO(start);
        const endObj = parseISO(end);

        if (endObj < startObj) {
            setError('La fecha final no puede ser anterior a la inicial.');
            return;
        }

        const monthsDiff = differenceInMonths(endObj, startObj);
        if (monthsDiff > 5) {
            setError('El rango máximo permitido es de 5 meses para mantener el rendimiento.');
        }
    };

    const handleDownload = (format: 'pdf' | 'excel') => {
        if (error) return;
        if (!startDate || !endDate) {
            setError('Por favor selecciona ambas fechas.');
            return;
        }
        alert(`Descargando reporte de ${reportType} (${format}) de ${startDate} a ${endDate}`);
    };

    return (
        <div className="w-full bg-white p-6 rounded-xl shadow-sm border border-slate-100">
            <div className="mb-6">
                <h3 className="text-lg font-semibold text-slate-800">Exportar Datos</h3>
                <p className="text-sm text-slate-500">Selecciona el rango de fechas (máximo 5 meses) y el tipo de informe.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 items-start">

                {/* Date Range */}
                <div className="flex flex-col gap-2">
                    <label className="text-sm font-medium text-slate-700">Fecha Inicio</label>
                    <input
                        type="date"
                        value={startDate}
                        onChange={(e) => handleDateChange('start', e.target.value)}
                        className="w-full p-2.5 border border-slate-200 rounded-lg text-slate-700 focus:outline-none focus:ring-2 focus:ring-[#13ec80] focus:border-transparent"
                    />
                </div>

                <div className="flex flex-col gap-2">
                    <label className="text-sm font-medium text-slate-700">Fecha Fin</label>
                    <input
                        type="date"
                        value={endDate}
                        onChange={(e) => handleDateChange('end', e.target.value)}
                        className="w-full p-2.5 border border-slate-200 rounded-lg text-slate-700 focus:outline-none focus:ring-2 focus:ring-[#13ec80] focus:border-transparent"
                    />
                </div>

                {/* Report Type */}
                <div className="flex flex-col gap-2">
                    <label className="text-sm font-medium text-slate-700">Tipo de Reporte</label>
                    <select
                        value={reportType}
                        onChange={(e) => setReportType(e.target.value)}
                        className="w-full p-2.5 border border-slate-200 rounded-lg text-slate-700 focus:outline-none focus:ring-2 focus:ring-[#13ec80] focus:border-transparent bg-white"
                    >
                        <option value="sales">Ventas Detalladas</option>
                        <option value="cash">Movimiento de Efectivo</option>
                        <option value="inventory">Valor del Inventario</option>
                        <option value="expenses">Gastos Operativos</option>
                    </select>
                </div>

                {/* Export Button with Dropdown */}
                <div className="flex flex-col gap-2 relative">
                    <label className="text-sm font-medium text-slate-700 invisible">Exportar</label>
                    <div className="relative">
                        <button
                            onClick={() => setShowFormats(!showFormats)}
                            disabled={!!error}
                            className={`w-full flex items-center justify-center gap-2 p-2.5 rounded-lg border transition-colors font-medium ${error ? 'bg-slate-50 text-slate-400 border-slate-200 cursor-not-allowed' : 'bg-[#13ec80] text-white hover:bg-[#10dc75] border-[#13ec80] shadow-sm'}`}
                        >
                            <span className="material-symbols-outlined text-[20px]">download</span>
                            Exportar
                        </button>

                        {showFormats && !error && (
                            <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-xl shadow-lg border border-slate-100 p-1.5 z-10 flex flex-col gap-1 animate-in fade-in zoom-in-95 duration-200">
                                <button
                                    onClick={() => { handleDownload('excel'); setShowFormats(false); }}
                                    className="w-full flex items-center gap-2 px-3 py-2 hover:bg-green-50 text-slate-700 hover:text-green-700 rounded-lg transition-colors text-sm font-medium text-left"
                                >
                                    <span className="material-symbols-outlined text-[18px] text-green-600">table_view</span>
                                    Excel
                                </button>
                                <button
                                    onClick={() => { handleDownload('pdf'); setShowFormats(false); }}
                                    className="w-full flex items-center gap-2 px-3 py-2 hover:bg-red-50 text-slate-700 hover:text-red-700 rounded-lg transition-colors text-sm font-medium text-left"
                                >
                                    <span className="material-symbols-outlined text-[18px] text-red-600">picture_as_pdf</span>
                                    PDF
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            </div>


            {
                error && (
                    <div className="mt-4 p-3 bg-red-50 text-red-600 text-sm rounded-lg flex items-center gap-2">
                        <span className="material-symbols-outlined text-[18px]">error</span>
                        {error}
                    </div>
                )
            }
        </div >
    );
}
