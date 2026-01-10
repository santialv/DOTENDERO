"use client";

import { useState, useEffect, useMemo, useCallback } from "react";
import { Product, InventoryStats } from "@/types";
import { SEED_PRODUCTS } from "@/lib/seed-data";
import { useToast } from "@/components/ui/toast";
import { supabase } from "@/lib/supabase";

export function useInventory() {
    const { toast } = useToast();
    const [products, setProducts] = useState<Product[]>([]);
    const [searchTerm, setSearchTerm] = useState("");
    const [categoryFilter, setCategoryFilter] = useState("Todas");
    const [stockFilter, setStockFilter] = useState("Cualquiera"); // Cualquiera, Bajo Stock, Sin Stock
    const [isLoading, setIsLoading] = useState(true);

    // Load Data
    // Load Data from Supabase
    const fetchProducts = useCallback(async () => {
        setIsLoading(true);
        try {
            // 1. Get User
            const { data: { session } } = await supabase.auth.getSession();
            if (!session) return;

            // 2. Get User's Organization
            const { data: profile } = await supabase
                .from('profiles')
                .select('organization_id')
                .eq('id', session.user.id)
                .single();

            if (!profile?.organization_id) {
                // Should be handled by AuthGuard, but safety first
                setProducts([]);
                setIsLoading(false);
                return;
            }

            const orgId = profile.organization_id;

            // 3. Fetch Products for THIS Organization
            const { data, error } = await supabase
                .from("products")
                .select("*")
                .eq('organization_id', orgId)
                .order('created_at', { ascending: false });

            if (error) throw error;

            if (!data || data.length === 0) {
                setProducts([]);
                setIsLoading(false);
                return;
            }

            // Map Supabase snake_case to TS camelCase
            const mappedProducts: Product[] = (data || []).map(p => ({
                id: p.id,
                name: p.name,
                description: p.description,
                category: p.category,
                barcode: p.barcode,
                price: p.price,
                salePrice: p.price,
                costPrice: p.cost,
                tax: p.tax_rate,
                taxType: p.tax_type as 'IVA' | 'ICO',
                stock: p.stock,
                minStock: p.min_stock,
                unit: p.unit,
                image: p.image_url,
                icaRate: p.ica_rate,
                bagTax: p.bag_tax,
                status: p.status === 'active' ? 'Activo' : 'Inactivo' // Map back
            }));

            setProducts(mappedProducts);
        } catch (error) {
            console.error("Error fetching inventory:", error);
            toast("Error cargando inventario", "error");
        } finally {
            setIsLoading(false);
        }
    }, [toast]);

    useEffect(() => {
        fetchProducts();
    }, [fetchProducts]);

    // Actions
    const deleteProduct = useCallback(async (id: string, name: string = 'Producto') => {
        try {
            // 1. Try Hard Delete (works if no history)
            const { error: deleteError } = await supabase.from('products').delete().eq('id', id);

            if (deleteError) {
                // 2. If constraint violation (FK), fallback to Soft Delete (Archive)
                // Postgres error 23503 is foreign_key_violation
                console.warn("Soft delete fallback for:", name, deleteError);

                const { error: updateError } = await supabase
                    .from('products')
                    .update({ status: 'inactive' })
                    .eq('id', id);

                if (updateError) throw updateError;

                toast("Producto con movimientos: Se ha pasado a INACTIVO", "info");
                // Update local state to reflect change (or remove if you filter by active)
                setProducts(prev => prev.map(p => p.id === id ? { ...p, status: 'Inactivo' } : p));
            } else {
                // Hard delete success
                setProducts(prev => prev.filter(p => p.id !== id));
                toast("Producto eliminado permanentemente", "success");
            }
        } catch (error: any) {
            console.error("Error deleting product:", error);
            toast(`Error: ${error.message || "No se pudo eliminar"}`, "error");
        }
    }, [toast]);

    // Derived State
    const filteredProducts = useMemo(() => {
        return products.filter(p => {
            // 1. Search
            const matchesSearch = p.name.toLowerCase().includes(searchTerm.toLowerCase()) || p.barcode?.includes(searchTerm);
            if (!matchesSearch) return false;

            // 2. Category
            if (categoryFilter !== "Todas" && p.category !== categoryFilter) return false;

            // 3. Stock
            if (stockFilter === "Bajo Stock") return p.stock <= p.minStock;
            if (stockFilter === "Sin Stock") return p.stock <= 0;
            if (stockFilter === "Con Stock") return p.stock > 0;

            return true;
        });
    }, [products, searchTerm, categoryFilter, stockFilter]);

    const uniqueCategories = useMemo(() => {
        const cats = new Set(products.map(p => p.category).filter(Boolean));
        return ["Todas", ...Array.from(cats)];
    }, [products]);

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
        categoryFilter,
        setCategoryFilter,
        stockFilter,
        setStockFilter,
        uniqueCategories,
        stats,
        isLoading,
        deleteProduct,
        calculateMargin
    };
}
