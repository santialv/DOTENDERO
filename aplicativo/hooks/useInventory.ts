"use client";

import { useState, useEffect, useMemo, useCallback } from "react";
import { Product, InventoryStats } from "@/types";
import { SEED_PRODUCTS } from "@/lib/seed-data";
import { useToast } from "@/components/ui/toast";

export function useInventory() {
    const { toast } = useToast();
    const [products, setProducts] = useState<Product[]>([]);
    const [searchTerm, setSearchTerm] = useState("");
    const [isLoading, setIsLoading] = useState(true);

    // Load Data
    useEffect(() => {
        setIsLoading(true);
        const savedProducts = JSON.parse(localStorage.getItem("products") || "[]");

        // Auto-seed if empty or low (legacy logic)
        if (savedProducts.length < 20) {
            // Cast seed data to match new Product type if needed, 
            // assuming SEED_PRODUCTS roughly matches. 
            // In real app, we'd map/validate.
            const seed = SEED_PRODUCTS.map(p => ({
                ...p,
                id: String(p.id),
                stock: p.stock || 0,
                minStock: p.minStock || 5,
                costPrice: p.costPrice || 0,
                salePrice: p.salePrice || p.price || 0,
                status: p.status || "Activo"
            })) as Product[];

            setProducts(seed);
            localStorage.setItem("products", JSON.stringify(seed));
        } else {
            setProducts(savedProducts);
        }
        setIsLoading(false);
    }, []);

    // Actions
    const deleteProduct = useCallback((id: string) => {
        // In a real app this would be a modal, but for hook logic we provide the function
        const updatedProducts = products.filter(p => p.id !== id);
        setProducts(updatedProducts);
        localStorage.setItem("products", JSON.stringify(updatedProducts));
        toast("Producto eliminado correctamente", "success");
    }, [products, toast]);

    // Derived State
    const filteredProducts = useMemo(() => {
        return products.filter(p =>
            p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            p.barcode?.includes(searchTerm)
        );
    }, [products, searchTerm]);

    const stats: InventoryStats = useMemo(() => {
        return {
            totalProducts: products.length,
            totalValue: products.reduce((acc, p) => acc + (p.costPrice * p.stock), 0),
            lowStockCount: products.filter(p => p.stock <= p.minStock && p.status === 'Activo').length,
            inactiveCount: products.filter(p => p.status === 'Inactivo').length,
        };
    }, [products]);

    const calculateMargin = (cost: number, price: number) => {
        if (price === 0) return 0;
        return ((price - cost) / price) * 100;
    };

    return {
        products,
        filteredProducts,
        searchTerm,
        setSearchTerm,
        stats,
        isLoading,
        deleteProduct,
        calculateMargin
    };
}
