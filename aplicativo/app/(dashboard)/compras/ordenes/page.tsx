"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { addInventoryMovement } from "../../../utils/inventory";

interface PurchaseOrder {
    id: string;
    date: string;
    supplier: string;
    items: {
        id: string;
        productName: string;
        sku: string;
        suggestedQty: number;
        totalCost: number;
        lastCost: number;
    }[];
    subtotal: number;
    tax: number;
    retention: number;
    total: number;
    status: 'Pendiente' | 'Recibido';
    notes: string;
}

export default function OrderHistoryPage() {
    const [orders, setOrders] = useState<PurchaseOrder[]>([]);
    const [selectedOrder, setSelectedOrder] = useState<PurchaseOrder | null>(null);

    useEffect(() => {
        const savedOrders = JSON.parse(localStorage.getItem("purchaseOrders") || "[]");
        // Sort by date desc
        setOrders(savedOrders.sort((a: any, b: any) => new Date(b.date).getTime() - new Date(a.date).getTime()));
    }, []);

    const handleReceiveOrder = (order: PurchaseOrder) => {
        if (!confirm(`¿Confirmas la recepción de la orden ${order.id} por $${order.total.toLocaleString()}? Esto actualizará el inventario.`)) return;

        // 1. Process Inventory Updates via Utility (Weighted Average)
        order.items.forEach(item => {
            const result = addInventoryMovement(
                null, // will find by sku/name inside
                {
                    name: item.productName,
                    barcode: item.sku,
                    cost: item.lastCost,
                    price: item.lastCost * 1.3,
                    category: "General"
                },
                item.suggestedQty,
                item.lastCost,
                'Compra',
                `#OC-${order.id}`,
                "Usuario Actual"
            );
            if (!result.success) console.error(`Error processing item ${item.productName}: ${result.message}`);
        });

        // 2. Update Order Status
        const updatedOrders = orders.map(o =>
            o.id === order.id ? { ...o, status: 'Recibido' as const } : o
        );
        setOrders(updatedOrders);
        localStorage.setItem("purchaseOrders", JSON.stringify(updatedOrders));

        alert("¡Mercancía recibida e inventario actualizado con éxito!");
    };

    const getStatusColor = (status: string) => {
        return status === 'Recibido' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800';
    };

    return (
        <div className="flex flex-col h-full bg-slate-50 font-display overflow-hidden">
            {/* Header */}
            <div className="px-10 py-8 flex flex-col md:flex-row md:items-end justify-between gap-4 shrink-0">
                <div className="flex flex-col gap-1">
                    <h1 className="text-3xl md:text-4xl font-black tracking-tight text-slate-900">Historial de Ordenes</h1>
                    <p className="text-slate-500 text-base">Gestiona y recibe tus ordenes de compra generadas.</p>
                </div>
                <div className="flex gap-2">
                    <Link href="/compras/sugerido" className="flex h-10 px-4 items-center justify-center rounded-lg border border-slate-200 bg-white hover:bg-slate-50 transition-colors text-sm font-bold text-slate-700">
                        <span className="material-symbols-outlined mr-2 text-[18px]">arrow_back</span>
                        Volver al Sugerido
                    </Link>
                </div>
            </div>

            <div className="px-10 pb-8 flex flex-col gap-6 flex-1 overflow-hidden">
                {/* Table */}
                <div className="flex flex-col bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden flex-1">
                    <div className="overflow-auto custom-scrollbar flex-1">
                        <table className="w-full text-left border-collapse">
                            <thead className="bg-slate-50 border-b border-slate-200 sticky top-0 z-10">
                                <tr>
                                    <th className="p-4 text-xs font-bold text-slate-500 uppercase tracking-wider">ID Orden</th>
                                    <th className="p-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Fecha</th>
                                    <th className="p-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Proveedor</th>
                                    <th className="p-4 text-xs font-bold text-slate-500 uppercase tracking-wider text-center">Items</th>
                                    <th className="p-4 text-xs font-bold text-slate-500 uppercase tracking-wider text-right">Total</th>
                                    <th className="p-4 text-xs font-bold text-slate-500 uppercase tracking-wider text-center">Estado</th>
                                    <th className="p-4 text-xs font-bold text-slate-500 uppercase tracking-wider text-center">Acciones</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {orders.length === 0 ? (
                                    <tr>
                                        <td colSpan={7} className="p-8 text-center text-slate-500">No hay ordenes registradas. Ve al Sugerido para generar una.</td>
                                    </tr>
                                ) : orders.map((order) => (
                                    <tr key={order.id} className="group hover:bg-slate-50 transition-colors">
                                        <td className="p-4 font-bold text-slate-900">{order.id}</td>
                                        <td className="p-4 text-slate-600">{new Date(order.date).toLocaleDateString()} <span className="text-xs text-slate-400">{new Date(order.date).toLocaleTimeString()}</span></td>
                                        <td className="p-4 font-medium text-slate-800">{order.supplier}</td>
                                        <td className="p-4 text-center text-slate-600">{order.items.length}</td>
                                        <td className="p-4 text-right font-mono font-bold text-slate-900">${order.total.toLocaleString()}</td>
                                        <td className="p-4 text-center">
                                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold ${getStatusColor(order.status)}`}>
                                                {order.status}
                                            </span>
                                        </td>
                                        <td className="p-4 text-center">
                                            <div className="flex items-center justify-center gap-2">
                                                <button
                                                    onClick={() => setSelectedOrder(order)}
                                                    className="p-1.5 text-slate-400 hover:text-primary transition-colors rounded-md hover:bg-white"
                                                    title="Ver Detalles"
                                                >
                                                    <span className="material-symbols-outlined text-[20px]">visibility</span>
                                                </button>
                                                {order.status === 'Pendiente' && (
                                                    <button
                                                        onClick={() => handleReceiveOrder(order)}
                                                        className="p-1.5 text-slate-400 hover:text-green-600 transition-colors rounded-md hover:bg-white"
                                                        title="Recibir Mercancía"
                                                    >
                                                        <span className="material-symbols-outlined text-[20px]">inventory_2</span>
                                                    </button>
                                                )}
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>

            {/* Detail Modal */}
            {selectedOrder && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm" onClick={() => setSelectedOrder(null)}>
                    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl overflow-hidden flex flex-col max-h-[85vh]" onClick={e => e.stopPropagation()}>
                        <div className="bg-slate-50 p-6 border-b border-slate-200 flex justify-between items-center">
                            <div>
                                <h2 className="text-xl font-black text-slate-900">Detalle Orden {selectedOrder.id}</h2>
                                <p className="text-sm text-slate-500 font-medium">Proveedor: <span className="text-primary font-bold">{selectedOrder.supplier}</span></p>
                            </div>
                            <button onClick={() => setSelectedOrder(null)} className="text-slate-400 hover:text-slate-600 transition-colors">
                                <span className="material-symbols-outlined">close</span>
                            </button>
                        </div>
                        <div className="flex-1 overflow-y-auto p-6 custom-scrollbar">
                            <table className="w-full text-left text-sm">
                                <thead className="border-b border-slate-200 text-xs uppercase font-bold text-slate-500">
                                    <tr>
                                        <th className="px-2 py-3">Producto</th>
                                        <th className="px-2 py-3 text-center">Cant.</th>
                                        <th className="px-2 py-3 text-right">Costo</th>
                                        <th className="px-2 py-3 text-right">Total</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100">
                                    {selectedOrder.items.map((item, idx) => (
                                        <tr key={idx}>
                                            <td className="px-2 py-3 font-medium text-slate-900">
                                                {item.productName}
                                                <div className="text-[10px] text-slate-400">{item.sku}</div>
                                            </td>
                                            <td className="px-2 py-3 text-center">{item.suggestedQty}</td>
                                            <td className="px-2 py-3 text-right font-mono text-slate-500">${item.lastCost.toLocaleString()}</td>
                                            <td className="px-2 py-3 text-right font-bold text-slate-900 font-mono">${item.totalCost.toLocaleString()}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                            <div className="mt-6 flex justify-end">
                                <div className="w-48 space-y-2">
                                    <div className="flex justify-between text-sm text-slate-500">
                                        <span>Subtotal</span>
                                        <span>${selectedOrder.subtotal.toLocaleString()}</span>
                                    </div>
                                    <div className="flex justify-between text-sm text-slate-500">
                                        <span>Impuestos</span>
                                        <span>${selectedOrder.tax.toLocaleString()}</span>
                                    </div>
                                    <div className="border-t border-slate-200 pt-2 flex justify-between text-lg font-black text-slate-900">
                                        <span>Total</span>
                                        <span>${selectedOrder.total.toLocaleString()}</span>
                                    </div>
                                </div>
                            </div>
                            {selectedOrder.notes && (
                                <div className="mt-6 bg-yellow-50 p-4 rounded-lg border border-yellow-100 text-sm text-yellow-800">
                                    <span className="font-bold block mb-1">Notas:</span>
                                    {selectedOrder.notes}
                                </div>
                            )}
                        </div>
                        <div className="bg-slate-50 p-6 border-t border-slate-200 flex justify-end gap-3">
                            {selectedOrder.status === 'Pendiente' && (
                                <button
                                    onClick={() => {
                                        handleReceiveOrder(selectedOrder);
                                        setSelectedOrder(null);
                                    }}
                                    className="px-6 py-2.5 rounded-xl bg-green-600 hover:bg-green-700 text-white font-bold transition-colors shadow-lg shadow-green-600/20"
                                >
                                    Recibir Inventario
                                </button>
                            )}
                            <button className="px-6 py-2.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 font-bold transition-colors">
                                Reimprimir
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
