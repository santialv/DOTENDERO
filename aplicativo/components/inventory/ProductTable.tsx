"use client";

import Link from "next/link";
import { Product } from "@/types";

interface ProductTableProps {
    products: Product[];
    onDelete: (id: string) => void;
    calculateMargin: (cost: number, price: number) => number;
    permissions?: any;
}

export function ProductTable({ products, onDelete, calculateMargin, permissions }: ProductTableProps) {
    const canViewCosts = permissions?.view_purchase_costs !== false; // Default to true if not provided or admin

    return (
        <div className="w-full">
            {/* Desktop Table View */}
            <div className="hidden md:block w-full">
                <table className="w-full text-left border-collapse">
                    <thead className="bg-slate-50 border-b border-slate-200 sticky top-0 z-10">
                        <tr>
                            <th className="py-4 pl-6 pr-4 text-xs font-bold uppercase tracking-wider text-slate-500 w-[60px]">
                                <input className="rounded border-slate-300 text-primary focus:ring-primary bg-white cursor-pointer" type="checkbox" />
                            </th>
                            <th className="py-4 px-4 text-xs font-bold uppercase tracking-wider text-slate-500 min-w-[280px]">Producto</th>
                            <th className="py-4 px-4 text-xs font-bold uppercase tracking-wider text-slate-500">Stock</th>
                            {canViewCosts && <th className="py-4 px-4 text-xs font-bold uppercase tracking-wider text-slate-500 text-right">Costo</th>}
                            <th className="py-4 px-4 text-xs font-bold uppercase tracking-wider text-slate-500 text-right">P. Venta</th>
                            {canViewCosts && <th className="py-4 px-4 text-xs font-bold uppercase tracking-wider text-slate-500 text-center">Margen</th>}
                            <th className="py-4 px-4 text-xs font-bold uppercase tracking-wider text-slate-500 text-center">Estado</th>
                            <th className="py-4 pr-6 pl-4 text-xs font-bold uppercase tracking-wider text-slate-500 text-right sticky right-0 bg-slate-50 shadow-[-10px_0_10px_-10px_rgba(0,0,0,0.05)]">Acciones</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 bg-white">
                        {products.map((product) => {
                            const margin = calculateMargin(product.costPrice, product.salePrice);
                            const isLowStock = product.stock <= product.minStock;
                            const isInactive = product.status === 'Inactivo';

                            return (
                                <tr key={product.id} className={`group hover:bg-slate-50 transition-colors ${isLowStock && !isInactive ? 'bg-red-50/50' : ''} ${isInactive ? 'opacity-75' : ''}`}>
                                    <td className="py-3 pl-6 pr-4">
                                        <input className="rounded border-slate-300 text-primary focus:ring-primary bg-white cursor-pointer" type="checkbox" />
                                    </td>
                                    <td className="py-3 px-4">
                                        <div className="flex items-center gap-3">
                                            <div className="flex flex-col">
                                                <span className={`text-sm font-bold text-slate-900 ${isInactive ? 'line-through text-slate-500' : ''}`}>{product.name}</span>
                                                <div className="flex items-center gap-2 text-xs text-slate-500">
                                                    <span className="bg-slate-100 px-1.5 py-0.5 rounded text-[10px] font-mono">SKU: {product.barcode?.slice(-6) || 'N/A'}</span>
                                                    <span>•</span>
                                                    <span>{product.category}</span>
                                                </div>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="py-3 px-4">
                                        <div className="flex flex-col gap-1 max-w-[120px]">
                                            <div className="flex justify-between text-xs font-medium">
                                                <span className={`${isLowStock && !isInactive ? 'text-red-600 font-bold' : isInactive ? 'text-slate-500' : 'text-green-600'}`}>
                                                    {product.stock} {product.unit || 'Und'}
                                                </span>
                                                <span className="text-slate-400">Min: {product.minStock}</span>
                                            </div>
                                            <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
                                                <div
                                                    className={`h-full rounded-full ${isInactive ? 'bg-slate-300' : isLowStock ? 'bg-red-500' : 'bg-primary'}`}
                                                    style={{ width: `${Math.min((product.stock / (product.minStock * 3 || 1)) * 100, 100)}%` }}
                                                ></div>
                                            </div>
                                        </div>
                                    </td>
                                    {canViewCosts && <td className="py-3 px-4 text-right text-sm text-slate-500 font-mono">${product.costPrice.toLocaleString()}</td>}
                                    <td className="py-3 px-4 text-right text-sm font-bold text-slate-900 font-mono">${product.salePrice.toLocaleString()}</td>
                                    {canViewCosts && (
                                        <td className="py-3 px-4 text-center">
                                            <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${isInactive ? 'bg-slate-100 text-slate-500' :
                                                margin < 20 ? 'bg-yellow-100 text-yellow-700' :
                                                    'bg-green-100 text-green-700'
                                                }`}>
                                                {margin.toFixed(1)}%
                                            </span>
                                        </td>
                                    )}
                                    <td className="py-3 px-4 text-center">
                                        <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium border ${isInactive ? 'bg-slate-100 text-slate-500 border-slate-200' :
                                            'bg-green-50 text-green-700 border-green-200'
                                            }`}>
                                            {product.status}
                                        </span>
                                    </td>
                                    <td className="py-3 pr-6 pl-4 text-right sticky right-0 bg-white group-hover:bg-slate-50 shadow-[-10px_0_10px_-10px_rgba(0,0,0,0.05)] transition-colors">
                                        <div className="flex justify-end gap-1">
                                            <Link
                                                href={`/inventario/editar/${product.id}`}
                                                className="p-1.5 rounded-md hover:bg-slate-200 text-slate-500 transition-colors block"
                                                title="Editar"
                                            >
                                                <span className="material-symbols-outlined text-[18px]">edit</span>
                                            </Link>
                                            <Link
                                                href={`/inventario/kardex?search=${encodeURIComponent(product.name)}`}
                                                className="p-1.5 rounded-md hover:bg-slate-200 text-slate-500 transition-colors block"
                                                title="Ver Kardex"
                                            >
                                                <span className="material-symbols-outlined text-[18px]">history</span>
                                            </Link>
                                            <button
                                                onClick={() => {
                                                    if (confirm("¿Eliminar producto?")) onDelete(product.id);
                                                }}
                                                className="p-1.5 rounded-md hover:bg-red-50 text-slate-400 hover:text-red-600 transition-colors"
                                                title="Eliminar"
                                            >
                                                <span className="material-symbols-outlined text-[18px]">delete</span>
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            </div>

            {/* Mobile Card View - Removes internal scrolling, relies on parent */}
            <div className="md:hidden flex flex-col gap-3 p-4">
                {products.length === 0 ? (
                    <div className="text-center text-slate-400 py-10">
                        Sin productos encontrados
                    </div>
                ) : (
                    products.map(product => (
                        <div key={product.id} className="bg-white p-4 rounded-xl shadow-sm border border-slate-200 flex flex-col gap-3">
                            <div className="flex justify-between items-start">
                                <div>
                                    <h3 className="font-bold text-slate-900 text-sm leading-tight mb-1">{product.name}</h3>
                                    <span className="text-xs text-slate-500 bg-slate-50 px-1.5 py-0.5 rounded border border-slate-100">
                                        {product.category}
                                    </span>
                                </div>
                                <div className="text-right">
                                    <div className="font-bold text-slate-900">${product.salePrice.toLocaleString()}</div>
                                    {canViewCosts && <div className="text-[10px] text-slate-400">Costo: ${product.costPrice.toLocaleString()}</div>}
                                </div>
                            </div>

                            <div className="flex items-center justify-between pt-2 border-t border-slate-50">
                                <div className="flex items-center gap-2">
                                    <div className={`flex items-center gap-1 text-xs font-bold ${product.stock <= product.minStock ? 'text-red-600' : 'text-green-600'}`}>
                                        <span className="material-symbols-outlined text-[16px]">inventory_2</span>
                                        {product.stock} {product.unit}
                                    </div>
                                    {product.stock <= product.minStock && (
                                        <span className="text-[10px] text-red-500 font-medium bg-red-50 px-1 rounded">Bajo Stock</span>
                                    )}
                                </div>
                                <div className="flex gap-2">
                                    <Link href={`/inventario/editar/${product.id}`} className="p-2 bg-slate-50 text-slate-600 rounded-lg active:scale-95 transition-transform">
                                        <span className="material-symbols-outlined text-[20px]">edit</span>
                                    </Link>
                                    <button
                                        onClick={() => { if (confirm("¿Eliminar?")) onDelete(product.id); }}
                                        className="p-2 bg-red-50 text-red-500 rounded-lg active:scale-95 transition-transform"
                                    >
                                        <span className="material-symbols-outlined text-[20px]">delete</span>
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
}
