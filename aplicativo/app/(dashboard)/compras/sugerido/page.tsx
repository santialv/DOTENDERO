"use client";

import { useState } from "react";
import Link from "next/link";

interface SuggestedItem {
    id: string;
    productName: string;
    sku: string;
    image?: string;
    currentStock: number;
    minStock: number;
    maxStock: number;
    avgDailyConsumption: number;
    lastCost: number;
    suggestedQty: number;
    totalCost: number;
    supplier: string;
    status: 'Critico' | 'Por Vencer' | 'Bajo' | 'Normal';
}

export default function SuggestedOrderPage() {
    // Mock Data
    const [items, setItems] = useState<SuggestedItem[]>([
        { id: "1", productName: "Arroz Diana 500g", sku: "1029384", currentStock: 2, minStock: 10, maxStock: 50, avgDailyConsumption: 1.5, lastCost: 2500, suggestedQty: 48, totalCost: 120000, supplier: "Diana", status: 'Critico' },
        { id: "2", productName: "Aceite Gourmet 1L", sku: "4455667", currentStock: 12, minStock: 5, maxStock: 20, avgDailyConsumption: 0.8, lastCost: 18000, suggestedQty: 8, totalCost: 144000, supplier: "Gourmet", status: 'Por Vencer' },
        { id: "3", productName: "Leche Entera Colanta", sku: "9988776", currentStock: 8, minStock: 15, maxStock: 60, avgDailyConsumption: 4, lastCost: 3200, suggestedQty: 40, totalCost: 128000, supplier: "Colanta", status: 'Bajo' },
        { id: "4", productName: "Galletas Saltin Noel", sku: "3322114", currentStock: 15, minStock: 20, maxStock: 80, avgDailyConsumption: 2.1, lastCost: 4500, suggestedQty: 60, totalCost: 270000, supplier: "Noel", status: 'Bajo' },
        { id: "5", productName: "Atún Van Camp's", sku: "6677889", currentStock: 5, minStock: 12, maxStock: 40, avgDailyConsumption: 0.5, lastCost: 5800, suggestedQty: 35, totalCost: 203000, supplier: "Van Camps", status: 'Bajo' },
    ]);

    // Selection State
    const [selectedIds, setSelectedIds] = useState<string[]>([]);

    // Wizard State
    const [isWizardOpen, setIsWizardOpen] = useState(false);
    const [ordersQueue, setOrdersQueue] = useState<{ supplier: string, items: SuggestedItem[] }[]>([]);
    const [currentOrderIndex, setCurrentOrderIndex] = useState(0);
    const [orderDetails, setOrderDetails] = useState({ tax: 0, retention: 0, notes: "" });

    const totalEstimated = items.reduce((acc, item) => acc + item.totalCost, 0);

    const toggleSelection = (id: string) => {
        setSelectedIds(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);
    };

    const toggleAll = () => {
        if (selectedIds.length === items.length) setSelectedIds([]);
        else setSelectedIds(items.map(i => i.id));
    };

    const getStatusColor = (status: SuggestedItem['status']) => {
        switch (status) {
            case 'Critico': return 'bg-red-100 text-red-800';
            case 'Por Vencer': return 'bg-orange-100 text-orange-800';
            case 'Bajo': return 'bg-slate-100 text-slate-800';
            default: return 'bg-green-100 text-green-800';
        }
    };

    const handleStartWizard = () => {
        if (selectedIds.length === 0) return;

        // Group selected items by supplier
        const selectedItems = items.filter(i => selectedIds.includes(i.id));
        const groups: { [key: string]: SuggestedItem[] } = {};

        selectedItems.forEach(item => {
            if (!groups[item.supplier]) groups[item.supplier] = [];
            groups[item.supplier].push(item);
        });

        const queue = Object.keys(groups).map(supplier => ({
            supplier,
            items: groups[supplier]
        }));

        setOrdersQueue(queue);
        setCurrentOrderIndex(0);
        setIsWizardOpen(true);
        setOrderDetails({ tax: 0, retention: 0, notes: "" });
    };

    const calculateCurrentOrderTotal = () => {
        if (!ordersQueue[currentOrderIndex]) return 0;
        const subtotal = ordersQueue[currentOrderIndex].items.reduce((acc, i) => acc + i.totalCost, 0);
        const taxAmount = subtotal * (orderDetails.tax / 100);
        const retentionAmount = subtotal * (orderDetails.retention / 100);
        return subtotal + taxAmount - retentionAmount;
    };

    const handlePrintAndNext = () => {
        const currentOrder = ordersQueue[currentOrderIndex];
        const subtotal = currentOrder.items.reduce((acc, i) => acc + i.totalCost, 0);
        const taxVal = subtotal * (orderDetails.tax / 100);
        const retVal = subtotal * (orderDetails.retention / 100);
        const total = subtotal + taxVal - retVal;

        // Retrieve business info
        const savedInfo = localStorage.getItem("businessInfo");
        const business = savedInfo ? JSON.parse(savedInfo) : { name: "Mi Negocio", nit: "900.000.000", address: "", phone: "", email: "" };

        // Create and persist Purchase Order Record
        const newOrder = {
            id: `OC-${Date.now().toString().slice(-6)}`,
            date: new Date().toISOString(),
            supplier: currentOrder.supplier,
            items: currentOrder.items.map(i => ({ ...i, suggestedQty: i.suggestedQty, totalCost: i.totalCost })), // Snapshot
            subtotal,
            tax: taxVal,
            retention: retVal,
            total,
            status: 'Pendiente', // or 'Recibido' later
            notes: orderDetails.notes
        };

        const existingOrders = JSON.parse(localStorage.getItem("purchaseOrders") || "[]");
        localStorage.setItem("purchaseOrders", JSON.stringify([...existingOrders, newOrder]));

        // Aesthetic Print View
        const printWindow = window.open('', '_blank');
        if (printWindow) {
            printWindow.document.write(`
                <html>
                <head>
                    <title>Orden de Compra - ${currentOrder.supplier}</title>
                    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet">
                    <style>
                        body { font-family: 'Inter', sans-serif; padding: 40px; color: #1e293b; background: #fff; max-width: 800px; margin: 0 auto; }
                        .header { display: flex; justify-content: space-between; margin-bottom: 40px; padding-bottom: 20px; border-bottom: 2px solid #f1f5f9; }
                        .brand h1 { font-size: 24px; font-weight: 800; color: #0f172a; margin: 0 0 5px 0; letter-spacing: -0.5px; }
                        .brand p { margin: 0; font-size: 13px; color: #64748b; }
                        .order-info { text-align: right; }
                        .order-info h2 { font-size: 32px; font-weight: 800; color: #0f172a; margin: 0 0 5px 0; }
                        .order-info p { margin: 0; font-size: 14px; color: #64748b; font-weight: 500; }
                        
                        .vendor-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 40px; margin-bottom: 40px; }
                        .box h3 { font-size: 12px; font-weight: 700; text-transform: uppercase; color: #94a3b8; letter-spacing: 1px; margin-bottom: 10px; }
                        .box p { margin: 2px 0; font-size: 14px; font-weight: 500; }
                        .box .name { font-size: 16px; font-weight: 700; color: #0f172a; margin-bottom: 5px; }

                        table { w-full; border-collapse: collapse; width: 100%; margin-bottom: 30px; }
                        th { text-align: left; padding: 12px 10px; font-size: 11px; font-weight: 700; text-transform: uppercase; color: #64748b; border-bottom: 1px solid #e2e8f0; background: #f8fafc; }
                        td { padding: 16px 10px; font-size: 14px; border-bottom: 1px solid #f1f5f9; }
                        td.mono { font-family: 'Courier New', monospace; font-weight: 600; }
                        tr:last-child td { border-bottom: none; }

                        .totals { display: flex; justify-content: flex-end; }
                        .totals-box { width: 300px; }
                        .row { display: flex; justify-content: space-between; margin-bottom: 10px; font-size: 14px; color: #64748b; }
                        .row.final { border-top: 2px solid #0f172a; padding-top: 15px; margin-top: 15px; color: #0f172a; font-weight: 800; font-size: 18px; }

                        .footer { margin-top: 60px; padding-top: 20px; border-top: 1px solid #f1f5f9; text-align: center; color: #94a3b8; font-size: 12px; }
                        
                        @media print {
                            body { padding: 0; }
                            th { -webkit-print-color-adjust: exact; }
                        }
                    </style>
                </head>
                <body>
                    <div class="header">
                        <div class="brand">
                            <h1>${business.name}</h1>
                            <p>NIT: ${business.nit}</p>
                            <p>${business.address}</p>
                            <p>${business.email}</p>
                        </div>
                        <div class="order-info">
                            <h2>ORDEN DE COMPRA</h2>
                            <p>#${newOrder.id}</p>
                            <p>Fecha: ${new Date().toLocaleDateString()}</p>
                        </div>
                    </div>

                    <div class="vendor-grid">
                         <div class="box">
                            <h3>Proveedor</h3>
                            <p class="name">${currentOrder.supplier}</p>
                            <p>Solicitud de abastecimiento</p>
                        </div>
                        <div class="box">
                            <h3>Enviar A</h3>
                            <p class="name">${business.name}</p>
                            <p>${business.address}</p>
                        </div>
                    </div>
                            <p class="name">${business.name}</p>
                            <p>${business.address}</p>
                        </div>
                    </div>

                    <table>
                        <thead>
                            <tr>
                                <th style="width: 50%;">Producto</th>
                                <th style="text-align: center;">Cantidad</th>
                                <th style="text-align: right;">Costo Unit.</th>
                                <th style="text-align: right;">Total</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${currentOrder.items.map(item => `
                                <tr>
                                    <td>
                                        <div style="font-weight: 600; color: #0f172a;">${item.productName}</div>
                                        <div style="font-size: 12px; color: #64748b;">SKU: ${item.sku}</div>
                                    </td>
                                    <td style="text-align: center; font-weight: 600;">${item.suggestedQty}</td>
                                    <td class="mono" style="text-align: right;">$${item.lastCost.toLocaleString()}</td>
                                    <td class="mono" style="text-align: right;">$${item.totalCost.toLocaleString()}</td>
                                </tr>
                            `).join('')}
                        </tbody>
                    </table>

                    <div class="totals">
                        <div class="totals-box">
                            <div class="row">
                                <span>Subtotal</span>
                                <span>$${subtotal.toLocaleString()}</span>
                            </div>
                            ${orderDetails.tax > 0 ? `
                            <div class="row">
                                <span>Impuestos (${orderDetails.tax}%)</span>
                                <span>$${taxVal.toLocaleString()}</span>
                            </div>` : ''}
                            ${orderDetails.retention > 0 ? `
                            <div class="row">
                                <span>Retención (-${orderDetails.retention}%)</span>
                                <span>-$${retVal.toLocaleString()}</span>
                            </div>` : ''}
                            <div class="row final">
                                <span>TOTAL</span>
                                <span>$${total.toLocaleString()}</span>
                            </div>
                        </div>
                    </div>

                    <div class="footer">
                        <p>${orderDetails.notes || "Gracias por su atención. Por favor confirmar recibido."}</p>
                        <p>Generado por DonTendero Software</p>
                    </div>

                    <script>
                        window.onload = function() { window.print(); window.close(); }
                    </script>
                </body>
                </html>
            `);
            printWindow.document.close();
        }

        // Logic for next order
        if (currentOrderIndex < ordersQueue.length - 1) {
            setCurrentOrderIndex(prev => prev + 1);
            setOrderDetails({ tax: 0, retention: 0, notes: "" }); // Reset for next
        } else {
            setIsWizardOpen(false); // Close wizard if done
        }
    };

    return (
        <div className="flex flex-col h-full bg-slate-50 font-display overflow-hidden relative">
            {/* Header */}
            <div className="px-10 py-8 flex flex-col md:flex-row md:items-end justify-between gap-4 shrink-0">
                <div className="flex flex-col gap-1">
                    <h1 className="text-3xl md:text-4xl font-black tracking-tight text-slate-900">Sugerido de Compra</h1>
                    <p className="text-slate-500 text-base max-w-2xl">Revisa las recomendaciones basadas en tu stock mínimo y consumo diario.</p>
                </div>
                <div className="flex gap-2">
                    <Link href="/compras/ingreso" className="flex h-10 px-4 items-center justify-center rounded-lg border border-slate-200 bg-white hover:bg-slate-50 transition-colors text-sm font-bold text-slate-700">
                        <span className="material-symbols-outlined mr-2 text-[18px]">add_box</span>
                        Ingresar
                    </Link>
                    <Link href="/compras/ordenes" className="flex h-10 px-4 items-center justify-center rounded-lg border border-slate-200 bg-white hover:bg-slate-50 transition-colors text-sm font-bold text-slate-700">
                        <span className="material-symbols-outlined mr-2 text-[18px]">history</span>
                        Historial
                    </Link>
                    <button className="flex h-10 px-4 items-center justify-center rounded-lg border border-slate-200 bg-white hover:bg-slate-50 transition-colors text-sm font-bold text-slate-700">
                        <span className="material-symbols-outlined mr-2 text-[18px]">file_download</span>
                        Exportar
                    </button>
                    <button className="flex h-10 px-4 items-center justify-center rounded-lg border border-slate-200 bg-white hover:bg-slate-50 transition-colors text-sm font-bold text-slate-700">
                        <span className="material-symbols-outlined mr-2 text-[18px]">print</span>
                        Imprimir Lista
                    </button>
                </div>
            </div>

            <div className="px-10 pb-8 flex flex-col gap-6 flex-1 overflow-hidden">
                {/* KPI Stats */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 shrink-0">
                    <div className="flex flex-col gap-2 rounded-xl p-6 bg-white border border-slate-200 shadow-sm group hover:border-primary transition-colors">
                        <div className="flex items-center justify-between">
                            <p className="text-slate-500 text-sm font-medium uppercase tracking-wider">Productos a Reponer</p>
                            <span className="material-symbols-outlined text-orange-500">warning</span>
                        </div>
                        <p className="text-slate-900 text-3xl font-bold leading-tight">{items.length} <span className="text-lg text-slate-500 font-medium">items</span></p>
                    </div>
                    <div className="flex flex-col gap-2 rounded-xl p-6 bg-white border border-slate-200 shadow-sm group hover:border-primary transition-colors">
                        <div className="flex items-center justify-between">
                            <p className="text-slate-500 text-sm font-medium uppercase tracking-wider">Valor Sugerido</p>
                            <span className="material-symbols-outlined text-primary">attach_money</span>
                        </div>
                        <p className="text-slate-900 text-3xl font-bold leading-tight">${totalEstimated.toLocaleString()}</p>
                    </div>
                    <div className="flex flex-col gap-2 rounded-xl p-6 bg-white border border-slate-200 shadow-sm group hover:border-primary transition-colors">
                        <div className="flex items-center justify-between">
                            <p className="text-slate-500 text-sm font-medium uppercase tracking-wider">Proveedores</p>
                            <span className="material-symbols-outlined text-blue-500">local_shipping</span>
                        </div>
                        <p className="text-slate-900 text-3xl font-bold leading-tight">12 <span className="text-lg text-slate-500 font-medium">activos</span></p>
                    </div>
                </div>

                {/* Filters */}
                <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm flex flex-col gap-4 shrink-0">
                    <div className="flex flex-col lg:flex-row gap-4">
                        <div className="flex-1 relative">
                            <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">search</span>
                            <input className="w-full h-12 rounded-lg border border-slate-200 bg-slate-50 pl-12 pr-4 text-slate-900 placeholder:text-slate-400 focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all" placeholder="Buscar por nombre o SKU..." />
                        </div>
                        <div className="flex-1 relative">
                            <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">filter_alt</span>
                            <select className="w-full h-12 appearance-none rounded-lg border border-slate-200 bg-slate-50 pl-12 pr-10 text-slate-900 focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all cursor-pointer">
                                <option disabled selected>Filtrar por proveedor</option>
                                <option value="all">Todos los proveedores</option>
                                <option value="alpina">Alpina</option>
                                <option value="colanta">Colanta</option>
                            </select>
                            <span className="material-symbols-outlined absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none">expand_more</span>
                        </div>
                    </div>
                    <div className="flex flex-wrap gap-2">
                        <button className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-900 text-white text-sm font-medium transition-transform active:scale-95">Todos</button>
                        <button className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-red-100 text-red-700 text-sm font-medium hover:bg-red-200 transition-colors">
                            <span className="size-2 rounded-full bg-red-500"></span> Stock Crítico (24)
                        </button>
                        <button className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-orange-100 text-orange-700 text-sm font-medium hover:bg-orange-200 transition-colors">
                            <span className="size-2 rounded-full bg-orange-500"></span> Por Vencer (12)
                        </button>
                        <button className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-50 border border-slate-200 text-slate-900 text-sm font-medium hover:border-primary transition-colors">Bajo Stock (45)</button>
                    </div>
                </div>

                {/* Table */}
                <div className="flex flex-col bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden flex-1">
                    <div className="overflow-auto custom-scrollbar flex-1">
                        <table className="w-full text-left border-collapse">
                            <thead className="bg-slate-50 border-b border-slate-200 sticky top-0 z-10">
                                <tr>
                                    <th className="p-4 w-12 text-center">
                                        <input
                                            className="size-4 rounded border-slate-300 text-primary focus:ring-primary bg-white cursor-pointer"
                                            type="checkbox"
                                            checked={selectedIds.length === items.length}
                                            onChange={toggleAll}
                                        />
                                    </th>
                                    <th className="p-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Producto</th>
                                    <th className="p-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Estado</th>
                                    <th className="p-4 text-xs font-bold text-slate-500 uppercase tracking-wider text-center">Stock / Límites</th>
                                    <th className="p-4 text-xs font-bold text-slate-500 uppercase tracking-wider text-center">Días Inv.</th>
                                    <th className="p-4 text-xs font-bold text-slate-500 uppercase tracking-wider text-right">Costo Unit.</th>
                                    <th className="p-4 text-xs font-bold text-slate-500 uppercase tracking-wider w-32 text-center">Sugerido</th>
                                    <th className="p-4 text-xs font-bold text-slate-500 uppercase tracking-wider text-right">Total</th>
                                    <th className="p-4 w-10"></th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {items.map((item) => (
                                    <tr key={item.id} className={`group hover:bg-slate-50 transition-colors ${selectedIds.includes(item.id) ? 'bg-primary/5' : ''}`}>
                                        <td className="p-4 text-center">
                                            <input
                                                className="size-4 rounded border-slate-300 text-primary focus:ring-primary bg-white cursor-pointer"
                                                type="checkbox"
                                                checked={selectedIds.includes(item.id)}
                                                onChange={() => toggleSelection(item.id)}
                                            />
                                        </td>
                                        <td className="p-4">
                                            <div className="flex items-center gap-3">
                                                <div className="size-10 rounded-lg bg-slate-100 flex items-center justify-center text-slate-400">
                                                    <span className="material-symbols-outlined">image</span>
                                                </div>
                                                <div className="flex flex-col">
                                                    <span className="font-bold text-slate-900">{item.productName}</span>
                                                    <span className="text-xs text-slate-500">SKU: {item.sku}</span>
                                                    <span className="text-[10px] text-slate-400 font-medium">Prov: {item.supplier}</span>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="p-4">
                                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(item.status)}`}>
                                                {item.status}
                                            </span>
                                        </td>
                                        <td className="p-4 text-center">
                                            <div className="flex flex-col items-center">
                                                <span className={`text-lg font-bold ${item.currentStock <= item.minStock ? 'text-red-600' : 'text-slate-900'}`}>{item.currentStock} un</span>
                                                <span className="text-xs text-slate-500">Min: {item.minStock} / Max: {item.maxStock}</span>
                                            </div>
                                        </td>
                                        <td className="p-4 text-center font-medium text-slate-700">{(item.currentStock / item.avgDailyConsumption).toFixed(1)} días</td>
                                        <td className="p-4 text-right text-slate-500 font-mono">${item.lastCost.toLocaleString()}</td>
                                        <td className="p-4">
                                            <input className="w-full text-center font-bold h-10 rounded-lg border border-slate-300 bg-white text-slate-900 focus:ring-2 focus:ring-primary outline-none transition-all" type="number" defaultValue={item.suggestedQty} />
                                        </td>
                                        <td className="p-4 text-right font-bold text-slate-900 font-mono">${item.totalCost.toLocaleString()}</td>
                                        <td className="p-4 text-center">
                                            <button className="text-slate-300 hover:text-red-500 transition-colors">
                                                <span className="material-symbols-outlined text-[20px]">delete</span>
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                    <div className="border-t border-slate-200 p-4 flex items-center justify-between bg-slate-50/50 text-slate-500 text-sm">
                        <p>Mostrando 1-{items.length} de 145 productos</p>
                        <div className="flex gap-2">
                            <button className="px-3 py-1 border border-slate-200 rounded-md bg-white hover:bg-slate-50 disabled:opacity-50" disabled>Anterior</button>
                            <button className="px-3 py-1 border border-slate-200 rounded-md bg-white hover:bg-slate-50">Siguiente</button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Sticky Action Bar */}
            <div className="sticky bottom-0 z-40 bg-white border-t border-slate-200 p-4 px-10 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)]">
                <div className="flex flex-col md:flex-row items-center justify-between gap-4">
                    <div className="flex items-center gap-4">
                        <div className="hidden md:flex flex-col">
                            <span className="text-xs text-slate-500 font-bold uppercase">Total Estimado</span>
                            <span className="text-2xl font-black text-slate-900">${totalEstimated.toLocaleString()}</span>
                        </div>
                        <div className="h-10 w-px bg-slate-200 hidden md:block"></div>
                        <p className="text-sm text-slate-500 hidden md:block">{selectedIds.length} items seleccionados</p>
                    </div>
                    <div className="flex w-full md:w-auto gap-4">
                        <button className="flex-1 md:flex-none h-12 px-6 rounded-lg border border-slate-200 text-slate-700 font-bold bg-transparent hover:bg-slate-50 transition-colors">Guardar Borrador</button>
                        <button
                            onClick={handleStartWizard}
                            disabled={selectedIds.length === 0}
                            className="flex-1 md:flex-none h-12 px-8 rounded-lg bg-primary text-text-main font-bold hover:brightness-105 active:scale-95 transition-all flex items-center justify-center gap-2 shadow-lg shadow-primary/20 disabled:opacity-50 disabled:cursor-not-allowed">
                            <span>Generar Orden de Compra</span>
                            <span className="material-symbols-outlined">arrow_forward</span>
                        </button>
                    </div>
                </div>
            </div>

            {/* Wizard Modal */}
            {isWizardOpen && ordersQueue.length > 0 && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
                    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-3xl overflow-hidden flex flex-col max-h-[90vh]">
                        {/* Modal Header */}
                        <div className="bg-slate-50 p-6 border-b border-slate-200 flex justify-between items-center">
                            <div>
                                <h2 className="text-xl font-black text-slate-900">Generando Orden de Compra</h2>
                                <p className="text-sm text-slate-500 font-medium">Proveedor {currentOrderIndex + 1} de {ordersQueue.length}: <span className="text-primary font-bold">{ordersQueue[currentOrderIndex].supplier}</span></p>
                            </div>
                            <button onClick={() => setIsWizardOpen(false)} className="text-slate-400 hover:text-slate-600 transition-colors">
                                <span className="material-symbols-outlined">close</span>
                            </button>
                        </div>

                        {/* Modal Content */}
                        <div className="flex-1 overflow-y-auto p-6 custom-scrollbar">
                            <div className="space-y-6">
                                {/* Order Settings */}
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-1">
                                        <label className="text-xs font-bold text-slate-700 uppercase">Impuestos (%)</label>
                                        <div className="relative">
                                            <input
                                                type="number"
                                                value={orderDetails.tax}
                                                onChange={(e) => setOrderDetails({ ...orderDetails, tax: parseFloat(e.target.value) || 0 })}
                                                className="w-full rounded-lg border border-slate-200 py-2.5 pl-3 pr-8 text-sm font-semibold focus:ring-2 focus:ring-primary outline-none"
                                            />
                                            <span className="absolute right-3 top-2.5 text-slate-400">%</span>
                                        </div>
                                    </div>
                                    <div className="space-y-1">
                                        <label className="text-xs font-bold text-slate-700 uppercase">Retención (%)</label>
                                        <div className="relative">
                                            <input
                                                type="number"
                                                value={orderDetails.retention}
                                                onChange={(e) => setOrderDetails({ ...orderDetails, retention: parseFloat(e.target.value) || 0 })}
                                                className="w-full rounded-lg border border-slate-200 py-2.5 pl-3 pr-8 text-sm font-semibold focus:ring-2 focus:ring-primary outline-none"
                                            />
                                            <span className="absolute right-3 top-2.5 text-slate-400">%</span>
                                        </div>
                                    </div>
                                    <div className="col-span-2 space-y-1">
                                        <label className="text-xs font-bold text-slate-700 uppercase">Notas Adicionales</label>
                                        <textarea
                                            rows={2}
                                            value={orderDetails.notes}
                                            onChange={(e) => setOrderDetails({ ...orderDetails, notes: e.target.value })}
                                            className="w-full rounded-lg border border-slate-200 py-2.5 px-3 text-sm focus:ring-2 focus:ring-primary outline-none resize-none"
                                            placeholder="Detalles de entrega, contacto, etc."
                                        />
                                    </div>
                                </div>

                                {/* Items Summary */}
                                <div className="rounded-xl border border-slate-200 overflow-hidden">
                                    <table className="w-full text-left text-sm">
                                        <thead className="bg-slate-50 border-b border-slate-200 text-xs uppercase font-bold text-slate-500">
                                            <tr>
                                                <th className="px-4 py-3">Producto</th>
                                                <th className="px-4 py-3 text-center">Cant.</th>
                                                <th className="px-4 py-3 text-right">Costo</th>
                                                <th className="px-4 py-3 text-right">Total</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-slate-100">
                                            {ordersQueue[currentOrderIndex].items.map((item) => (
                                                <tr key={item.id}>
                                                    <td className="px-4 py-3 font-medium text-slate-900">
                                                        {item.productName}
                                                        <div className="text-[10px] text-slate-400">{item.sku}</div>
                                                    </td>
                                                    <td className="px-4 py-3 text-center">{item.suggestedQty}</td>
                                                    <td className="px-4 py-3 text-right font-mono text-slate-500">${item.lastCost.toLocaleString()}</td>
                                                    <td className="px-4 py-3 text-right font-bold text-slate-900 font-mono">${item.totalCost.toLocaleString()}</td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        </div>

                        {/* Modal Footer */}
                        <div className="bg-slate-50 p-6 border-t border-slate-200 flex justify-between items-center">
                            <div className="flex flex-col items-end">
                                <span className="text-xs font-bold text-slate-500 uppercase">Total Estimado</span>
                                <span className="text-2xl font-black text-slate-900">${calculateCurrentOrderTotal().toLocaleString()}</span>
                            </div>
                            <button
                                onClick={handlePrintAndNext}
                                className="flex h-12 px-8 items-center justify-center rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold transition-all shadow-lg hover:shadow-xl hover:-translate-y-0.5 active:translate-y-0 active:scale-95"
                            >
                                <span className="material-symbols-outlined mr-2">print</span>
                                {currentOrderIndex < ordersQueue.length - 1 ? "Imprimir y Siguiente" : "Imprimir y Finalizar"}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
