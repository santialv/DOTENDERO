"use client";

import { useState, useMemo, useEffect, useCallback } from "react";
import { Transaction, TransactionType } from "@/types";
import { useToast } from "@/components/ui/toast";
import { supabase } from "@/lib/supabase";

type FilterDateMode = "hoy" | "semana" | "mes" | "custom";

export function useTransactions() {
    const { toast } = useToast();
    const [transactions, setTransactions] = useState<Transaction[]>([]);
    const [stats, setStats] = useState({ totalCash: 0, totalBank: 0, totalFiado: 0 });
    const [loading, setLoading] = useState(false);

    // Pagination & Filter State
    const [page, setPage] = useState(0);
    const [totalCount, setTotalCount] = useState(0);
    const ITEMS_PER_PAGE = 50;

    const [activeTab, setActiveTab] = useState<"fisico" | "bancos">("fisico");
    const [showFilters, setShowFilters] = useState(false);
    const [filterDateMode, setFilterDateMode] = useState<FilterDateMode>("hoy");
    const [searchQuery, setSearchQuery] = useState("");
    const [filterCustomer, setFilterCustomer] = useState("");
    const [filterMinAmount, setFilterMinAmount] = useState("");
    const [filterMaxAmount, setFilterMaxAmount] = useState("");
    const [startDate, setStartDate] = useState("");
    const [endDate, setEndDate] = useState("");

    // 1. Fetch Transactions (Optimized View + Pagination)
    const fetchTransactions = useCallback(async (pageToLoad: number) => {
        setLoading(true);
        try {
            const { data: { session } } = await supabase.auth.getSession();
            if (!session) return;
            const { data: profile } = await supabase.from('profiles').select('organization_id').eq('id', session.user.id).single();
            const orgId = profile?.organization_id;
            if (!orgId) return;

            // Start Building Query on VIEW
            let query = supabase
                .from('all_transactions_view')
                .select('*', { count: 'exact' })
                .eq('organization_id', orgId);

            // Apply Filters (Server Side)

            // Tab Filter (Physical vs Bank)
            if (activeTab === 'fisico') {
                query = query.eq('method', 'Efectivo');
            } else {
                query = query.neq('method', 'Efectivo'); // Tarjeta, QR, etc.
            }

            // Date Filters
            const now = new Date();
            if (filterDateMode === "hoy") {
                const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate()).toISOString();
                query = query.gte('date', startOfDay);
            } else if (filterDateMode === "semana") {
                const startOfWeek = new Date(now);
                const day = startOfWeek.getDay(); // 0 (Sun) - 6 (Sat)
                // Calculate difference to get to Monday. If Sunday (0), go back 6 days. Else go back (day-1) days.
                const diff = startOfWeek.getDate() - day + (day === 0 ? -6 : 1);

                startOfWeek.setDate(diff); // Now is Monday
                startOfWeek.setHours(0, 0, 0, 0);

                query = query.gte('date', startOfWeek.toISOString());
            } else if (filterDateMode === "mes") {
                const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();
                query = query.gte('date', startOfMonth);
            } else if (filterDateMode === "custom" && startDate) {
                query = query.gte('date', new Date(startDate).toISOString());
                if (endDate) {
                    const end = new Date(endDate);
                    end.setHours(23, 59, 59);
                    query = query.lte('date', end.toISOString());
                }
            }

            // Text Search
            if (searchQuery) {
                query = query.or(`description.ilike.%${searchQuery}%,reference_number.ilike.%${searchQuery}%`);
            }

            if (filterCustomer) {
                query = query.ilike('customer_name', `%${filterCustomer}%`);
            }

            // Pagination
            const from = pageToLoad * ITEMS_PER_PAGE;
            const to = from + ITEMS_PER_PAGE - 1;

            query = query.order('date', { ascending: false }).range(from, to);

            const { data, count, error } = await query;
            if (error) throw error;

            setTransactions(data || []);
            setTotalCount(count || 0);
            setPage(pageToLoad);

            // Fetch Stats (Separate RPC for speed)
            const { data: statsData } = await supabase.rpc('get_transaction_stats', {
                p_org_id: orgId
                // p_start_date: ... (if we want to filter stats by date too, pass here)
            });

            if (statsData) {
                setStats(statsData);
            }

        } catch (error) {
            console.error("Error loading transactions:", error);
        } finally {
            setLoading(false);
        }
    }, [activeTab, filterDateMode, startDate, endDate, searchQuery, filterCustomer]);

    // Debounce & Reload
    useEffect(() => {
        const timeout = setTimeout(() => {
            fetchTransactions(0);
        }, 500); // 500ms debounce slightly longer to feel like user stopped typing
        return () => clearTimeout(timeout);
    }, [fetchTransactions]);

    // Actions
    const addTransaction = useCallback(async (
        type: TransactionType,
        amountStr: string,
        description: string
    ) => {
        if (!amountStr || !description) return;
        const val = parseFloat(amountStr);
        const finalAmount = type === 'expense' ? -Math.abs(val) : Math.abs(val);

        try {
            const { data: { session } } = await supabase.auth.getSession();
            if (!session) throw new Error("No active session");
            const { data: profile } = await supabase.from('profiles').select('organization_id').eq('id', session.user.id).single();
            const orgId = profile?.organization_id;

            if (!orgId) throw new Error("No organization linked");

            const { error } = await supabase.from('expenses').insert({
                organization_id: orgId,
                description,
                amount: finalAmount,
                type: type,
                date: new Date().toISOString(),
                user_id: session.user.id,
                payment_method: 'Efectivo'
            });

            if (error) throw error;

            toast("Movimiento registrado", "success");
            fetchTransactions(0); // Reload first page
            return true;
        } catch (error: any) {
            console.error("Error saving transaction:", error);
            toast(`Error: ${error.message}`, "error");
        }
    }, [toast, fetchTransactions]);

    const handleCloseDay = () => {
        window.print();
    };

    return {
        transactions,
        filteredTransactions: transactions, // Already filtered by server
        allFilteredCount: totalCount,
        stats,
        addTransaction,
        handleCloseDay,
        loading, // Export loading

        // Pagination
        page,
        setPage,
        totalPages: Math.ceil(totalCount / ITEMS_PER_PAGE),

        // Filter State & Setters
        activeTab, setActiveTab,
        showFilters, setShowFilters,
        filterDateMode, setFilterDateMode,
        searchQuery, setSearchQuery,
        filterCustomer, setFilterCustomer,
        filterMinAmount, setFilterMinAmount,
        filterMaxAmount, setFilterMaxAmount,
        startDate, setStartDate,
        endDate, setEndDate,
    };
}
