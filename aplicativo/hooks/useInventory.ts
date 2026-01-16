"use client";

import { useState, useEffect, useMemo, useCallback } from "react";
import { Product, InventoryStats } from "@/types";
import { useToast } from "@/components/ui/toast";
import { supabase } from "@/lib/supabase";

const PAGE_SIZE = 50;

export function useInventory() {
    const { toast } = useToast();
    const [products, setProducts] = useState<Product[]>([]);
    const [totalCount, setTotalCount] = useState(0);
    const [page, setPage] = useState(0);

    const [searchTerm, setSearchTerm] = useState("");
    const [categoryFilter, setCategoryFilter] = useState("Todas");
    const [stockFilter, setStockFilter] = useState("Cualquiera");
    const [isLoading, setIsLoading] = useState(true);

    const [uniqueCategories, setUniqueCategories] = useState<string[]>(["Todas"]);

    // 1. Fetch Categories (Optimized RPC)
    useEffect(() => {
        const fetchCategories = async () => {
            const { data: { session } } = await supabase.auth.getSession();
            if (!session) return;
            const { data: profile } = await supabase.from('profiles').select('organization_id').eq('id', session.user.id).single();
            if (!profile?.organization_id) return;

            // Use the lightweight RPC instead of fetching 5000 products
            const { data, error } = await supabase.rpc('get_unique_categories', {
                p_org_id: profile.organization_id
            });

            if (data) {
                // RPC returns array of objects { category: "Name" }
                const cats = data.map((d: any) => d.category);
                setUniqueCategories(["Todas", ...cats]);
            }
        };
        fetchCategories();
    }, []);

    // 2. Fetch Products (Paginated & Filtered)
    const fetchProducts = useCallback(async (pageToLoad: number) => {
        setIsLoading(true);
        try {
            const { data: { session } } = await supabase.auth.getSession();
            if (!session) return;

            const { data: profile } = await supabase
                .from('profiles')
                .select('organization_id')
                .eq('id', session.user.id)
                .single();

            if (!profile?.organization_id) {
                setProducts([]);
                setIsLoading(false);
                return;
            }

            const orgId = profile.organization_id;

            // Build Query
            let query = supabase
                .from("products")
                .select("*", { count: 'exact' })
                .eq('organization_id', orgId);

            // Filters
            if (searchTerm) {
                // ILIKE for insensitive match
                query = query.or(`name.ilike.%${searchTerm}%,barcode.eq.${searchTerm}`);
            }

            if (categoryFilter !== "Todas") {
                query = query.eq('category', categoryFilter);
            }

            if (stockFilter === "Sin Stock") query = query.lte('stock', 0);
            if (stockFilter === "Con Stock") query = query.gt('stock', 0);

            // Pagination
            const from = pageToLoad * PAGE_SIZE;
            const to = from + PAGE_SIZE - 1;

            query = query.order('created_at', { ascending: false }).range(from, to);

            const { data, count, error } = await query;

            if (error) throw error;

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
                status: p.status === 'active' ? 'Activo' : 'Inactivo'
            }));

            setProducts(mappedProducts);
            setTotalCount(count || 0);
            setPage(pageToLoad);

        } catch (error) {
            console.error("Error fetching inventory:", error);
            toast("Error cargando inventario", "error");
        } finally {
            setIsLoading(false);
        }
    }, [searchTerm, categoryFilter, stockFilter, toast]);

    // Debounce Search & Filter Change Effect
    useEffect(() => {
        const timeout = setTimeout(() => {
            fetchProducts(0); // Reset to page 0 on filter change
        }, 500);
        return () => clearTimeout(timeout);
    }, [fetchProducts]);

    // Actions
    const deleteProduct = useCallback(async (id: string, name: string = 'Producto') => {
        try {
            const { error: deleteError } = await supabase.from('products').delete().eq('id', id);
            if (deleteError) {
                console.warn("Soft delete fallback for:", name, deleteError);
                const { error: updateError } = await supabase
                    .from('products')
                    .update({ status: 'inactive' })
                    .eq('id', id);
                if (updateError) throw updateError;
                toast("Producto con movimientos: Se ha pasado a INACTIVO", "info");
                setProducts(prev => prev.map(p => p.id === id ? { ...p, status: 'Inactivo' } : p));
            } else {
                setProducts(prev => prev.filter(p => p.id !== id));
                toast("Producto eliminado permanentemente", "success");
            }
        } catch (error: any) {
            console.error("Error deleting product:", error);
            toast(`Error: ${error.message || "No se pudo eliminar"}`, "error");
        }
    }, [toast]);

    const stats: InventoryStats = useMemo(() => {
        return {
            totalProducts: totalCount,
            totalValue: 0,
            lowStockCount: 0,
            inactiveCount: 0
        };
    }, [totalCount]);

    const calculateMargin = (cost: number, price: number) => {
        if (price === 0) return 0;
        return ((price - cost) / price) * 100;
    };

    return {
        products,
        filteredProducts: products, // Pass through, handled by server
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
        calculateMargin,
        // Pagination Props
        page,
        setPage,
        fetchPage: fetchProducts,
        totalPages: Math.ceil(totalCount / PAGE_SIZE),
        totalCount
    };
}
