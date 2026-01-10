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
        <div className="flex flex-col h-full bg-slate-50 font-display overflow-hidden">
            {/* Header */}
            <div className="px-10 py-8 flex flex-col md:flex-row md:items-end justify-between gap-4 shrink-0">
                <div className="flex flex-col gap-1">
                    <h1 className="text-3xl md:text-4xl font-black tracking-tight text-slate-900">Catálogo de Productos</h1>
                    <p className="text-slate-500 text-base">Gestión maestra de inventario, precios y existencias.</p>
                </div>
                <div className="flex gap-2">
                    <Link href="/inventario/kardex" className="flex h-10 px-4 items-center justify-center rounded-lg border border-slate-200 bg-white hover:bg-slate-50 transition-colors text-sm font-bold text-slate-700">
                        <span className="material-symbols-outlined mr-2 text-[18px]">history</span>
                        Ver Kardex
                    </Link>
                    <button className="flex h-10 px-4 items-center justify-center rounded-lg border border-slate-200 bg-white hover:bg-slate-50 transition-colors text-sm font-bold text-slate-700">
                        <span className="material-symbols-outlined mr-2 text-[18px]">file_download</span>
                        Exportar
                    </button>
                    <Link href="/inventario/nuevo" className="flex h-10 px-4 items-center justify-center rounded-lg bg-primary hover:bg-primary-dark text-text-main text-sm font-bold transition-colors shadow-sm">
                        <span className="material-symbols-outlined mr-2 text-[18px]">add</span>
                        Nuevo Producto
                    </Link>
                </div>
            </div>

            <div className="px-10 pb-8 flex flex-col gap-6 flex-1 overflow-hidden">
                {/* Stats */}
                <InventoryStatsCards stats={stats} />

                {/* Main Content Card */}
                <div className="flex flex-col rounded-xl border border-slate-200 bg-white shadow-sm overflow-hidden flex-1">
                    {/* Toolbar */}
                    <div className="p-4 border-b border-slate-200 flex flex-col xl:flex-row gap-4 justify-between items-start xl:items-center bg-slate-50/50">
                        {/* Search */}
                        <div className="w-full xl:max-w-md">
                            <div className="flex items-center rounded-lg bg-white border border-slate-200 focus-within:ring-2 focus-within:ring-primary/50 focus-within:border-primary transition-all shadow-sm">
                                <div className="pl-3 pr-2 py-2.5 text-slate-400">
                                    <span className="material-symbols-outlined">search</span>
                                </div>
                                <input
                                    className="w-full bg-transparent border-none text-sm placeholder:text-slate-400 focus:ring-0 text-slate-900 outline-none"
                                    placeholder="Buscar por nombre, SKU o código de barras..."
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
                            <div className="relative group">
                                <div className="pointer-events-none absolute inset-y-0 right-2 flex items-center">
                                    <span className="material-symbols-outlined text-[18px] text-slate-400">expand_more</span>
                                </div>
                                <select
                                    value={categoryFilter}
                                    onChange={(e) => setCategoryFilter(e.target.value)}
                                    className="h-9 pl-3 pr-8 rounded-lg border border-slate-200 bg-white text-xs font-medium text-slate-900 hover:border-primary/50 transition-colors outline-none cursor-pointer appearance-none shadow-sm"
                                >
                                    {uniqueCategories.map(cat => (
                                        <option key={cat} value={cat}>Categoría: {cat}</option>
                                    ))}
                                </select>
                            </div>

                            {/* Stock Filter */}
                            <div className="relative group">
                                <div className="pointer-events-none absolute inset-y-0 right-2 flex items-center">
                                    <span className="material-symbols-outlined text-[18px] text-slate-400">expand_more</span>
                                </div>
                                <select
                                    value={stockFilter}
                                    onChange={(e) => setStockFilter(e.target.value)}
                                    className="h-9 pl-3 pr-8 rounded-lg border border-slate-200 bg-white text-xs font-medium text-slate-900 hover:border-primary/50 transition-colors outline-none cursor-pointer appearance-none shadow-sm"
                                >
                                    <option value="Cualquiera">Stock: Cualquiera</option>
                                    <option value="Con Stock">Stock: Con Stock</option>
                                    <option value="Bajo Stock">Stock: Bajo Stock</option>
                                    <option value="Sin Stock">Stock: Sin Stock</option>
                                </select>
                            </div>

                            <button className="flex size-9 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-400 hover:text-primary hover:border-primary/50 transition-colors" title="Más filtros">
                                <span className="material-symbols-outlined text-[20px]">tune</span>
                            </button>
                        </div>
                    </div>

                    {/* Table */}
                    <ProductTable
                        products={filteredProducts}
                        onDelete={deleteProduct}
                        calculateMargin={calculateMargin}
                    />

                    {/* Pagination (Dynamic) */}
                    <div className="flex items-center justify-between border-t border-slate-200 bg-slate-50/50 px-4 py-3 sm:px-6 shrink-0">
                        <div className="hidden sm:flex flex-1 sm:items-center sm:justify-between">
                            <div>
                                <p className="text-sm text-slate-500">
                                    Mostrando <span className="font-medium text-slate-900">{startItem}</span> a <span className="font-medium text-slate-900">{endItem}</span> de <span className="font-medium text-slate-900">{totalCount}</span> resultados
                                </p>
                            </div>
                            <div>
                                <nav className="isolate inline-flex -space-x-px rounded-md shadow-sm">
                                    <button
                                        onClick={() => setPage(page - 1)}
                                        disabled={page === 0}
                                        className="relative inline-flex items-center rounded-l-md px-2 py-2 text-slate-400 ring-1 ring-inset ring-slate-200 hover:bg-slate-50 focus:z-20 focus:outline-offset-0 disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        <span className="material-symbols-outlined text-[20px]">chevron_left</span>
                                    </button>
                                    <button className="relative inline-flex items-center bg-primary px-4 py-2 text-sm font-semibold text-text-main focus:z-20 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary">
                                        {page + 1}
                                    </button>
                                    <button
                                        onClick={() => setPage(page + 1)}
                                        disabled={page >= totalPages - 1}
                                        className="relative inline-flex items-center rounded-r-md px-2 py-2 text-slate-400 ring-1 ring-inset ring-slate-200 hover:bg-slate-50 focus:z-20 focus:outline-offset-0 disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        <span className="material-symbols-outlined text-[20px]">chevron_right</span>
                                    </button>
                                </nav>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
