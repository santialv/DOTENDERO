"use client";

import { Product } from "@/types";

interface ProductGridProps {
    products: Product[];
    addToCart: (productId: string | number) => void;
    activeCategory: string;
    searchQuery: string;
}

export function ProductGrid({ products, addToCart, activeCategory, searchQuery }: ProductGridProps) {
    const title = activeCategory === "Todos" && searchQuery.trim() === ""
        ? "Más Vendidos (Top 20)"
        : (activeCategory === "Todos" ? "Resultados de Búsqueda" : activeCategory);

    return (
        <div className="flex-1 overflow-y-auto custom-scrollbar pr-2">
            <h3 className="text-sm font-bold text-slate-500 uppercase tracking-wide mb-3">
                {title}
            </h3>
            {/* Added pb-24 for mobile to avoid bottom nav overlap */}
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-3 pb-24 md:pb-20">
                {products.map(product => (
                    <div
                        key={product.id}
                        onClick={() => addToCart(product.id)}
                        className="bg-white p-3 rounded-2xl shadow-sm border border-slate-100 hover:shadow-lg hover:border-primary/30 cursor-pointer transition-all group flex flex-col h-full relative touch-manipulation active:scale-[0.98]"
                    >

                        <div className="flex flex-col flex-1">
                            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1 block">{product.brand}</span>
                            <h3 className="font-semibold text-slate-900 leading-tight mb-1 text-sm line-clamp-2 md:text-base">{product.name}</h3>
                            <div className="mt-auto pt-2 flex items-center justify-between">
                                <div>
                                    <span className="text-lg font-bold text-slate-900">${(product.salePrice || product.price).toLocaleString()}</span>
                                </div>
                                <button className="w-9 h-9 rounded-xl bg-slate-100 text-slate-600 group-hover:bg-primary group-hover:text-slate-900 flex items-center justify-center transition-colors">
                                    <span className="material-symbols-outlined text-[20px]">add</span>
                                </button>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
