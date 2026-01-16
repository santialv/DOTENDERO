import { useState, useEffect, useCallback, useRef } from 'react';
import { supabase } from '@/lib/supabase';
import { Product } from '@/types';
import { useToast } from '@/components/ui/toast';
import { useDebounce } from 'react-use'; // We will implement manual debounce if not available, but usually nice to use useDebounce

// Fallback debounce if library not present (keeping zero deps approach)
function useDebounceValue<T>(value: T, delay: number): T {
    const [debouncedValue, setDebouncedValue] = useState<T>(value);
    useEffect(() => {
        const handler = setTimeout(() => setDebouncedValue(value), delay);
        return () => clearTimeout(handler);
    }, [value, delay]);
    return debouncedValue;
}

export function useProductSearch(initialProducts: Product[] = []) {
    const { toast } = useToast();
    const [query, setQuery] = useState('');
    const debouncedQuery = useDebounceValue(query, 300); // Wait 300ms after typing stops

    const [results, setResults] = useState<Product[]>(initialProducts);
    const [isLoading, setIsLoading] = useState(false);
    const [orgId, setOrgId] = useState<string | null>(null);

    // 1. Initialize Org Context
    useEffect(() => {
        async function loadOrg() {
            const { data: { session } } = await supabase.auth.getSession();
            if (!session) return;
            const { data } = await supabase.from('profiles').select('organization_id').eq('id', session.user.id).single();
            if (data?.organization_id) setOrgId(data.organization_id);
        }
        loadOrg();
    }, []);

    // 2. The Search Logic (Server-Side)
    useEffect(() => {
        // If query is empty, allow parent to show default/top products or handle locally
        // But here we implement the logic: Empty -> Show Top/Recent? Or let parent pass initial?
        // Let's assume: Empty query = Show whatever initial list passed (usually top products)
        if (!debouncedQuery.trim()) {
            setResults(initialProducts);
            return;
        }

        if (!orgId) return;

        const searchProducts = async () => {
            setIsLoading(true);
            try {
                const q = debouncedQuery.trim();
                const isBarcode = /^\d+$/.test(q) && q.length > 5; // Simple heuristic

                let searchReq = supabase
                    .from('products')
                    .select('*')
                    .eq('organization_id', orgId) // 🔒 SECURITY: Tenant Isolation
                    .eq('status', 'active')
                    .limit(20); // Always limit results to protect UI

                if (isBarcode) {
                    // Exact match optimized for scanners
                    searchReq = searchReq.eq('barcode', q);
                } else {
                    // Fuzzy text search
                    searchReq = searchReq.ilike('name', `%${q}%`);
                }

                const { data, error } = await searchReq;

                if (error) throw error;

                if (data) {
                    // Map DB types to Frontend Types (reuse mapping logic)
                    const mapped: Product[] = data.map(p => ({
                        id: p.id,
                        name: p.name,
                        description: p.description,
                        category: p.category,
                        barcode: p.barcode,
                        price: p.price,
                        costPrice: p.cost,
                        salePrice: p.price,
                        stock: p.stock,
                        minStock: p.min_stock,
                        unit: p.unit,
                        status: p.status === 'active' ? 'Activo' : 'Inactivo',
                        image: p.image_url,
                        tax: p.tax_rate,
                        bagTax: p.bag_tax,
                        icaRate: p.ica_rate
                    }));
                    setResults(mapped);
                }
            } catch (err) {
                console.error("Search error:", err);
                toast("Error buscando productos", "error");
            } finally {
                setIsLoading(false);
            }
        };

        searchProducts();
    }, [debouncedQuery, orgId, initialProducts]);

    return {
        query,
        setQuery,
        results,
        isLoading
    };
}
