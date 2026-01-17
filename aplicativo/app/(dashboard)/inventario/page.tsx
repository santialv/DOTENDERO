"use client";

import { useInventory } from "@/hooks/useInventory";
import { InventoryStatsCards } from "@/components/inventory/InventoryStatsCards";
import { ProductTable } from "@/components/inventory/ProductTable";
import Link from "next/link";

export default function InventoryPage() {
    const {
        filteredProducts,
        searchTerm,
        setSearchTerm,
        stats,
        deleteProduct,
        calculateMargin,
        categoryFilter,
        setCategoryFilter,
        stockFilter,
        setStockFilter,
        statusFilter, // New
        setStatusFilter, // New
        uniqueCategories,
        // Pagination
        page,
        setPage,
        totalPages,
        totalCount
    } = useInventory();

    const startItem = totalCount === 0 ? 0 : page * 50 + 1;
    const endItem = Math.min((page + 1) * 50, totalCount);

    return (
        <div className="flex flex-col h-full bg-slate-50 font-display overflow-hidden pb-20 md:pb-0">
            {/* Header */}
            <div className="px-6 md:px-10 py-6 md:py-8 flex flex-col md:flex-row md:items-end justify-between gap-4 shrink-0">
                <div className="flex flex-col gap-1">
                    <h1 className="text-2xl md:text-3xl lg:text-4xl font-black tracking-tight text-slate-900">Catálogo de Productos</h1>
                    <p className="text-sm md:text-base text-slate-500">Gestión maestra de inventario, precios y existencias.</p>
                </div>
                {/* Mobile Actions Scroll Container */}
                <div className="flex gap-2 overflow-x-auto pb-2 md:pb-0 no-scrollbar">
                    <Link href="/inventario/kardex" className="flex h-10 px-4 items-center justify-center rounded-lg border border-slate-200 bg-white hover:bg-slate-50 transition-colors text-sm font-bold text-slate-700 whitespace-nowrap">
                        <span className="material-symbols-outlined mr-2 text-[18px]">history</span>
                        Ver Kardex
                    </Link>
                    <button className="flex h-10 px-4 items-center justify-center rounded-lg border border-slate-200 bg-white hover:bg-slate-50 transition-colors text-sm font-bold text-slate-700">
                        <span className="material-symbols-outlined mr-2 text-[18px]">file_download</span>
                        Exportar
                    </button>
                    <Link href="/inventario/nuevo" className="flex h-10 px-4 items-center justify-center rounded-lg bg-[#13ec80] hover:bg-[#10d673] text-slate-900 text-sm font-black transition-colors shadow-sm whitespace-nowrap gap-2">
                        <span className="material-symbols-outlined text-[18px] font-bold">add</span>
                        Nuevo Producto
                    </Link>
                </div>
            </div>

            <div className="px-4 md:px-10 pb-8 flex flex-col gap-6 flex-1 overflow-hidden">
                {/* Stats */}
                <InventoryStatsCards
                    stats={stats}
                    onLowStockClick={() => setStockFilter("Bajo Stock")}
                />

                {/* Main Content Card */}
                {/* Removed fixed overflow-hidden that blocked mobile scroll */}
                <div className="flex flex-col rounded-xl md:border md:border-slate-200 md:bg-white md:shadow-sm overflow-hidden flex-1 min-h-0 bg-transparent shadow-none border-none">
                    {/* Toolbar */}
                    <div className="p-4 border-b border-slate-200 flex flex-col xl:flex-row gap-4 justify-between items-start xl:items-center bg-white rounded-t-xl md:bg-slate-50/50">
                        {/* Search */}
                        <div className="w-full xl:max-w-md">
                            <div className="flex items-center rounded-lg bg-white border border-slate-200 focus-within:ring-2 focus-within:ring-primary/50 focus-within:border-primary transition-all shadow-sm">
                                <div className="pl-3 pr-2 py-2.5 text-slate-400">
                                    <span className="material-symbols-outlined">search</span>
                                </div>
                                <input
                                    className="w-full bg-transparent border-none text-sm placeholder:text-slate-400 focus:ring-0 text-slate-900 outline-none"
                                    placeholder="Buscar producto..."
                                    type="text"
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                />
                                <div className="pr-2 pl-2 border-l border-slate-200 text-slate-400 hover:text-primary cursor-pointer" title="Escanear código">
                                    <span className="material-symbols-outlined">qr_code_scanner</span>
                                </div>
                            </div>
                        </div>
                        {/* Filters (Visual only for now matching original) */}
                        <div className="flex flex-wrap gap-2 w-full xl:w-auto xl:justify-end">
                            {/* Category Filter */}
                            <div className="relative group flex-1 md:flex-none">
                                <div className="pointer-events-none absolute inset-y-0 right-2 flex items-center">
                                    <span className="material-symbols-outlined text-[18px] text-slate-400">expand_more</span>
                                </div>
                                <select
                                    value={categoryFilter}
                                    onChange={(e) => setCategoryFilter(e.target.value)}
                                    className="h-9 w-full md:w-auto pl-3 pr-8 rounded-lg border border-slate-200 bg-white text-xs font-medium text-slate-900 hover:border-primary/50 transition-colors outline-none cursor-pointer appearance-none shadow-sm"
                                >
                                    {uniqueCategories.map(cat => (
                                        <option key={cat} value={cat}>{cat}</option>
                                    ))}
                                </select>
                            </div>

                            {/* Stock Filter */}
                            <div className="relative group flex-1 md:flex-none">
                                <div className="pointer-events-none absolute inset-y-0 right-2 flex items-center">
                                    <span className="material-symbols-outlined text-[18px] text-slate-400">expand_more</span>
                                </div>
                                <select
                                    value={stockFilter}
                                    onChange={(e) => setStockFilter(e.target.value)}
                                    className="h-9 w-full md:w-auto pl-3 pr-8 rounded-lg border border-slate-200 bg-white text-xs font-medium text-slate-900 hover:border-primary/50 transition-colors outline-none cursor-pointer appearance-none shadow-sm"
                                >
                                    <option value="Cualquiera">Stock: Todos</option>
                                    <option value="Con Stock">Con Stock</option>
                                    <option value="Bajo Stock">Bajo Stock</option>
                                    <option value="Sin Stock">Sin Stock</option>
                                </select>
                            </div>

                            {/* Status Filter (New) */}
                            <div className="relative group flex-1 md:flex-none">
                                <div className="pointer-events-none absolute inset-y-0 right-2 flex items-center">
                                    <span className="material-symbols-outlined text-[18px] text-slate-400">expand_more</span>
                                </div>
                                <select
                                    value={statusFilter}
                                    onChange={(e) => setStatusFilter(e.target.value)}
                                    className="h-9 w-full md:w-auto pl-3 pr-8 rounded-lg border border-slate-200 bg-white text-xs font-medium text-slate-900 hover:border-primary/50 transition-colors outline-none cursor-pointer appearance-none shadow-sm"
                                >
                                    <option value="Todos">Estado: Todos</option>
                                    <option value="Activo">Activos</option>
                                    <option value="Inactivo">Inactivos</option>
                                </select>
                            </div>
                        </div>
                    </div>

                    {/* Table */}
                    <div className="flex-1 overflow-auto custom-scrollbar bg-slate-50 md:bg-white">
                        <ProductTable
                            products={filteredProducts}
                            onDelete={deleteProduct}
                            calculateMargin={calculateMargin}
                        />
                    </div>

                    {/* Pagination (Responsive) */}
                    <div className="flex flex-col sm:flex-row items-center justify-between border-t border-slate-200 bg-white md:bg-slate-50/50 px-4 py-3 shrink-0 gap-2">
                        <div className="text-xs text-slate-500 text-center sm:text-left">
                            <span className="font-medium text-slate-900">{startItem} - {endItem}</span> de <span className="font-medium text-slate-900">{totalCount}</span>
                        </div>
                        <div className="flex gap-2 w-full sm:w-auto">
                            <button
                                onClick={() => setPage(page - 1)}
                                disabled={page === 0}
                                className="flex-1 sm:flex-none justify-center px-4 py-2 text-sm font-bold text-slate-600 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed shadow-sm flex items-center"
                            >
                                <span className="material-symbols-outlined text-[16px] mr-1">chevron_left</span> Anterior
                            </button>
                            <div className="flex items-center justify-center font-bold text-slate-900 bg-slate-100 rounded-lg px-3 min-w-[40px]">
                                {page + 1}
                            </div>
                            <button
                                onClick={() => setPage(page + 1)}
                                disabled={page >= totalPages - 1}
                                className="flex-1 sm:flex-none justify-center px-4 py-2 text-sm font-bold text-slate-600 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed shadow-sm flex items-center"
                            >
                                Siguiente <span className="material-symbols-outlined text-[16px] ml-1">chevron_right</span>
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
