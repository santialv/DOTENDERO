"use client";

import { useState } from "react";

export default function ReceivingPage() {
    return (
        <div className="flex flex-col h-full bg-slate-50 font-display overflow-hidden">
            {/* Header */}
            <div className="px-10 py-8 flex flex-col md:flex-row md:items-end justify-between gap-4 shrink-0">
                <div className="flex flex-col gap-1">
                    <div className="flex flex-wrap gap-2 items-center text-sm mb-2">
                        <span className="text-slate-500 font-medium hover:text-primary cursor-pointer w-fit">Inicio</span>
                        <span className="text-slate-400">/</span>
                        <span className="text-slate-500 font-medium hover:text-primary cursor-pointer w-fit">Compras</span>
                        <span className="text-slate-400">/</span>
                        <span className="text-slate-900 font-semibold">Nueva Recepción</span>
                    </div>
                    <h1 className="text-3xl md:text-4xl font-black tracking-tight text-slate-900">Registrar Entrada</h1>
                    <p className="text-slate-500 text-base">Verifique y registre los productos recibidos en el almacén.</p>
                </div>
                <div className="flex gap-3">
                    <button className="px-6 py-2.5 rounded-lg border border-slate-200 bg-white text-slate-700 font-bold text-sm hover:bg-slate-50 transition-colors shadow-sm">Cancelar</button>
                    <button className="px-6 py-2.5 rounded-lg bg-[#13ec80] text-slate-900 font-bold text-sm shadow-md hover:bg-[#10d673] transition-all flex items-center gap-2">
                        <span className="material-symbols-outlined text-[18px]">save</span>
                        Guardar Borrador
                    </button>
                </div>
            </div>

            <div className="px-10 pb-8 flex flex-col gap-6 flex-1 overflow-hidden">
                {/* Receipt Details Card */}
                <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 shrink-0">
                    <h3 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
                        <span className="material-symbols-outlined text-primary">description</span>
                        Datos del Documento
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <label className="flex flex-col gap-2">
                            <span className="text-sm font-semibold text-slate-900">Proveedor</span>
                            <div className="relative">
                                <select className="w-full appearance-none rounded-lg border border-slate-200 bg-slate-50 py-3 px-4 pr-10 text-slate-900 focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary transition-colors">
                                    <option disabled selected>Seleccione un proveedor</option>
                                    <option value="1">Distribuidora Central</option>
                                    <option value="2">Bebidas del Norte S.A.</option>
                                </select>
                                <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-slate-500">
                                    <span className="material-symbols-outlined">expand_more</span>
                                </div>
                            </div>
                        </label>
                        <label className="flex flex-col gap-2">
                            <span className="text-sm font-semibold text-slate-900">N° Factura / Remisión</span>
                            <input className="w-full rounded-lg border border-slate-200 bg-slate-50 py-3 px-4 text-slate-900 focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary placeholder-slate-400 transition-colors" placeholder="Ej: FAC-2023-001" type="text" />
                        </label>
                        <label className="flex flex-col gap-2">
                            <span className="text-sm font-semibold text-slate-900">Fecha de Recepción</span>
                            <input className="w-full rounded-lg border border-slate-200 bg-slate-50 py-3 px-4 text-slate-900 focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary transition-colors" type="date" />
                        </label>
                    </div>
                </div>

                {/* Products Table Section */}
                <div className="flex flex-col bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden flex-1">
                    {/* Toolbar */}
                    <div className="p-4 border-b border-slate-200 flex flex-col md:flex-row justify-between items-center gap-4 bg-slate-50/50">
                        <div className="relative w-full md:max-w-md">
                            <span className="absolute inset-y-0 left-0 flex items-center pl-3">
                                <span className="material-symbols-outlined text-slate-400">qr_code_scanner</span>
                            </span>
                            <input className="w-full pl-10 pr-4 py-3 rounded-lg border border-slate-200 bg-white text-sm focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary text-slate-900 transition-colors" placeholder="Buscar producto por nombre o código de barras..." type="text" />
                        </div>
                        <button className="w-full md:w-auto px-4 py-2.5 bg-primary/10 text-green-700 hover:bg-primary/20 rounded-lg font-bold text-sm transition-colors flex items-center justify-center gap-2">
                            <span className="material-symbols-outlined text-[20px]">add_circle</span>
                            Agregar Manualmente
                        </button>
                    </div>

                    {/* Table */}
                    <div className="overflow-auto custom-scrollbar flex-1">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="bg-slate-50 text-slate-500 text-xs uppercase tracking-wider font-semibold border-b border-slate-200 sticky top-0 z-10">
                                    <th className="px-6 py-4">Producto</th>
                                    <th className="px-4 py-4 w-32 text-center">Cant. Recibida</th>
                                    <th className="px-4 py-4 w-32 text-center">Costo Unit.</th>
                                    <th className="px-4 py-4 w-32">Lote</th>
                                    <th className="px-4 py-4 w-32">Vencimiento</th>
                                    <th className="px-4 py-4 w-28 text-right">Subtotal</th>
                                    <th className="px-4 py-4 w-16 text-center"></th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {/* Row 1 */}
                                <tr className="group hover:bg-slate-50 transition-colors">
                                    <td className="px-6 py-4 align-top">
                                        <div className="flex items-start gap-3">
                                            <div className="size-10 rounded-lg bg-slate-100 flex items-center justify-center text-slate-400">
                                                <span className="material-symbols-outlined">image</span>
                                            </div>
                                            <div>
                                                <p className="font-bold text-slate-900 text-sm">Leche Entera 1L</p>
                                                <p className="text-xs text-slate-500">SKU: 102938</p>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-4 py-3 align-top">
                                        <input className="w-full text-center rounded border border-slate-200 bg-white py-2 text-sm font-medium focus:border-primary focus:ring-1 focus:ring-primary text-slate-900" type="number" defaultValue="24" />
                                    </td>
                                    <td className="px-4 py-3 align-top">
                                        <div className="relative">
                                            <span className="absolute left-2 top-2 text-xs text-slate-400">$</span>
                                            <input className="w-full text-right pl-4 pr-2 rounded border border-slate-200 bg-white py-2 text-sm font-medium focus:border-primary focus:ring-1 focus:ring-primary text-slate-900" type="number" defaultValue="3200" />
                                        </div>
                                    </td>
                                    <td className="px-4 py-3 align-top">
                                        <input className="w-full rounded border border-slate-200 bg-white py-2 px-2 text-sm focus:border-primary focus:ring-1 focus:ring-primary text-slate-900" placeholder="L-2023" type="text" />
                                    </td>
                                    <td className="px-4 py-3 align-top">
                                        <input className="w-full rounded border border-slate-200 bg-white py-2 px-2 text-xs focus:border-primary focus:ring-1 focus:ring-primary text-slate-500" type="date" />
                                    </td>
                                    <td className="px-4 py-4 text-right align-top font-bold text-slate-900 text-sm">$76,800</td>
                                    <td className="px-4 py-3 align-top text-center">
                                        <button className="p-1.5 rounded text-red-400 hover:bg-red-50 hover:text-red-600 transition-colors">
                                            <span className="material-symbols-outlined text-[20px]">delete</span>
                                        </button>
                                    </td>
                                </tr>
                                {/* Row 2 (Empty/New) */}
                                <tr className="group hover:bg-slate-50 transition-colors border-l-4 border-l-primary bg-primary/5">
                                    <td className="px-6 py-4 align-top" colSpan={7}>
                                        <div className="flex items-center gap-3 text-slate-500 italic text-sm cursor-pointer">
                                            <span className="material-symbols-outlined text-[18px]">add</span>
                                            Escanea o busca para agregar...
                                        </div>
                                    </td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                    {/* Summary Footer */}
                    <div className="mt-auto bg-slate-50 p-6 border-t border-slate-200 flex flex-col md:flex-row justify-between items-end md:items-center gap-6">
                        <div className="flex flex-col gap-1">
                            <p className="text-sm text-slate-500">Total de items: <span className="font-bold text-slate-900">24 unidades</span></p>
                            <p className="text-sm text-slate-500">Variedad de productos: <span className="font-bold text-slate-900">1</span></p>
                        </div>
                        <div className="flex flex-col md:flex-row items-center gap-6 w-full md:w-auto">
                            <div className="flex flex-col items-end">
                                <span className="text-sm font-medium text-slate-500">Total a Pagar</span>
                                <span className="text-3xl font-black text-slate-900 tracking-tight">$76,800</span>
                            </div>
                            <button className="w-full md:w-auto px-8 py-4 bg-[#13ec80] text-slate-900 rounded-xl font-bold text-lg shadow-lg shadow-green-500/30 hover:shadow-green-500/50 hover:-translate-y-0.5 transition-all flex items-center justify-center gap-2">
                                <span className="material-symbols-outlined font-bold">check_circle</span>
                                Confirmar Recepción
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
