"use client";

import { useState, useMemo, useEffect, useCallback } from "react";
import { Transaction, TransactionType } from "@/types";
import { useToast } from "@/components/ui/toast";
import { supabase } from "@/lib/supabase";

type FilterDateMode = "hoy" | "semana" | "mes" | "custom";

export function useTransactions() {
    const { toast } = useToast();
    const [transactions, setTransactions] = useState<Transaction[]>([]);

    // Filters State
    const [activeTab, setActiveTab] = useState<"fisico" | "bancos">("fisico");
    const [showFilters, setShowFilters] = useState(false);
    const [filterDateMode, setFilterDateMode] = useState<FilterDateMode>("hoy");
    const [searchQuery, setSearchQuery] = useState("");
    const [filterCustomer, setFilterCustomer] = useState("");
    const [filterMinAmount, setFilterMinAmount] = useState("");
    const [filterMaxAmount, setFilterMaxAmount] = useState("");
    const [startDate, setStartDate] = useState("");
    const [endDate, setEndDate] = useState("");

    // Load Data from Supabase
    const fetchTransactions = useCallback(async () => {
        try {
            // 0. Get Context
            const { data: { session } } = await supabase.auth.getSession();
            if (!session) return;
            const { data: profile } = await supabase
                .from('profiles')
                .select('organization_id')
                .eq('id', session.user.id)
                .single();

            const orgId = profile?.organization_id;
            if (!orgId) return;

            // 1. Fetch Sales (Invoices)
            const { data: sales, error: salesError } = await supabase
                .from('invoices')
                .select('*')
                .eq('organization_id', orgId)
                .order('date', { ascending: false });

            if (salesError) throw salesError;

            // 2. Fetch Expenses/Manual Entries
            const { data: expenses, error: expensesError } = await supabase
                .from('expenses')
                .select('*')
                .eq('organization_id', orgId)
                .order('date', { ascending: false });

            if (expensesError) throw expensesError;

            // 3. Merge & Map
            const mappedSales: Transaction[] = (sales || []).map(s => ({
                id: s.id,
                date: s.date,
                type: 'income', // Sales are income
                method: s.payment_method?.includes('Tarjeta') ? 'Tarjeta' : (s.payment_method?.includes('QR') ? 'QR' : (s.payment_method?.includes('Fiado') ? 'Fiado' : 'Efectivo')),
                amount: s.total,
                description: `Venta ${s.number} - ${s.status === 'paid' ? 'Pagada' : 'Pendiente'}`,
                items: [],
                customerName: 'Cliente' // Should join customer but keep simple for now
            }));

            const mappedExpenses: Transaction[] = (expenses || []).map(e => ({
                id: e.id,
                date: e.date,
                type: e.amount < 0 ? 'expense' : 'income',
                method: e.payment_method || 'Efectivo',
                amount: e.amount,
                description: e.description || 'Movimiento Manual',
                items: []
            }));

            const all = [...mappedSales, ...mappedExpenses].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

            setTransactions(all);
        } catch (error) {
            console.error("Error loading transactions:", error);
            // Fallback to localstorage if DB fail? No, show error or empty.
        }
    }, []);

    useEffect(() => {
        fetchTransactions();
    }, [fetchTransactions]);

    // Actions
    const addTransaction = useCallback(async (
        type: TransactionType,
        amountStr: string,
        description: string
    ) => {
        if (!amountStr || !description) return;

        const val = parseFloat(amountStr);
        // Correct sign: expense is negative, income is positive
        const finalAmount = type === 'expense' ? -Math.abs(val) : Math.abs(val);

        try {
            // Get ID
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
                user_id: null, // fill if auth context available
                payment_method: 'Efectivo' // Default to cash for manual box movements usually
            });

            if (error) throw error;

            toast("Movimiento registrado", "success");
            fetchTransactions(); // Reload list
            return true;
        } catch (error: any) {
            console.error("Error saving transaction:", error);
            toast(`Error: ${error.message}`, "error");
        }
    }, [toast, fetchTransactions]);

    // Derived State (Totals - Liquid)
    const stats = useMemo(() => {
        const totalCash = transactions
            .filter(t => t.method === "Efectivo")
            .reduce((sum, t) => sum + t.amount, 0); // Amount is already negative for expenses

        const totalBank = transactions
            .filter(t => t.method === "Tarjeta" || t.method === "QR")
            .reduce((sum, t) => sum + t.amount, 0);

        const totalFiado = transactions
            .filter(t => t.method === "Fiado")
            .reduce((sum, t) => sum + t.amount, 0);

        return { totalCash, totalBank, totalFiado };
    }, [transactions]);

    // Derived State (Filtered List)
    const filteredTransactions = useMemo(() => {
        return transactions.filter(t => {
            // 1. Tab Filter
            const matchesTab = activeTab === "fisico"
                ? t.method === "Efectivo"
                : (t.method === "Tarjeta" || t.method === "QR");
            if (!matchesTab) return false;

            // 2. Date Filter
            const date = new Date(t.date);
            let matchesDate = true;
            const now = new Date();

            if (filterDateMode === "custom") {
                if (startDate && date < new Date(startDate)) matchesDate = false;
                if (endDate) {
                    const end = new Date(endDate);
                    end.setHours(23, 59, 59);
                    if (date > end) matchesDate = false;
                }
            } else {
                const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate());
                if (filterDateMode === "hoy") {
                    matchesDate = date >= startOfDay;
                } else if (filterDateMode === "semana") {
                    const startOfWeek = new Date(now);
                    startOfWeek.setDate(now.getDate() - now.getDay());
                    startOfWeek.setHours(0, 0, 0, 0);
                    matchesDate = date >= startOfWeek;
                } else if (filterDateMode === "mes") {
                    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
                    matchesDate = date >= startOfMonth;
                }
            }
            if (!matchesDate) return false;

            // 3. Search
            if (searchQuery) {
                const q = searchQuery.toLowerCase();
                if (!t.description.toLowerCase().includes(q) && !t.id.toLowerCase().includes(q)) return false;
            }

            // 4. Customer
            if (filterCustomer) {
                const c = filterCustomer.toLowerCase();
                const matchesName = t.customerName?.toLowerCase().includes(c) || false;
                const matchesDesc = t.description.toLowerCase().includes(c);
                if (!matchesName && !matchesDesc) return false;
            }

            // 5. Amount
            if (filterMinAmount && Math.abs(t.amount) < parseFloat(filterMinAmount)) return false;
            if (filterMaxAmount && Math.abs(t.amount) > parseFloat(filterMaxAmount)) return false;

            return true;
        });
    }, [transactions, activeTab, filterDateMode, searchQuery, filterCustomer, filterMinAmount, filterMaxAmount, startDate, endDate]);

    // Pagination State
    const [page, setPage] = useState(0);
    const ITEMS_PER_PAGE = 50;

    // Reset page when filters change
    useEffect(() => {
        setPage(0);
    }, [activeTab, filterDateMode, searchQuery, filterCustomer, filterMinAmount, filterMaxAmount, startDate, endDate]);

    // Derived State (Paginated)
    const paginatedTransactions = useMemo(() => {
        const start = page * ITEMS_PER_PAGE;
        return filteredTransactions.slice(start, start + ITEMS_PER_PAGE);
    }, [filteredTransactions, page]);

    const handleCloseDay = () => {
        const now = new Date();
        const todayTxs = transactions.filter(t => {
            const d = new Date(t.date);
            return d.getFullYear() === now.getFullYear() &&
                d.getMonth() === now.getMonth() &&
                d.getDate() === now.getDate();
        });

        const cashIn = todayTxs.filter(t => t.method === "Efectivo" && t.amount > 0).reduce((s, t) => s + t.amount, 0);
        const cashOut = todayTxs.filter(t => t.method === "Efectivo" && t.amount < 0).reduce((s, t) => s + Math.abs(t.amount), 0);

        const balanceToday = cashIn - cashOut;

        // Print Logic
        const printWindow = window.open('', '_blank');
        if (printWindow) {
            printWindow.document.write(`
              <html>
              <head>
                  <title>Cierre de Caja - DonTendero</title>
                  <style>
                      body { font-family: monospace; max-width: 300px; margin: 0 auto; padding: 20px; }
                      h1, h2, h3 { text-align: center; margin: 5px 0; }
                      .line { border-bottom: 1px dashed #000; margin: 10px 0; }
                      .row { display: flex; justify-content: space-between; margin-bottom: 5px; }
                      .bold { font-weight: bold; }
                  </style>
              </head>
              <body>
                  <h1>DonTendero</h1>
                  <h3>CIERRE DE CAJA</h3>
                  <p style="text-align: center">${new Date().toLocaleDateString()} ${new Date().toLocaleTimeString()}</p>
                  <div class="line"></div>
                  
                  <div class="row"><span class="bold">EFECTIVO ACTUAL:</span> <span>$${stats.totalCash.toLocaleString()}</span></div>
                  <div class="line"></div>

                  <h3>MOVIMIENTOS DE HOY</h3>
                  <div class="row"><span>Ventas Efectivo:</span> <span>+$${cashIn.toLocaleString()}</span></div>
                  <div class="row"><span>Gastos/Retiros:</span> <span>-$${cashOut.toLocaleString()}</span></div>
                  <div class="row bold" style="margin-top:5px"><span>Balance Hoy:</span> <span>$${balanceToday.toLocaleString()}</span></div>
                  
                  <div class="line"></div>
                  <div class="row"><span>Digital/Bancos:</span> <span>$${stats.totalBank.toLocaleString()}</span></div>
                  <div class="row"><span>Fiado (Crédito):</span> <span>$${stats.totalFiado.toLocaleString()}</span></div>
                  
                  <br/><br/>
                  <p style="text-align: center">_________________________<br/>Firma Responsable</p>
                  <script>window.onload = () => { window.print(); window.close(); }</script>
              </body>
              </html>
           `);
        }
    };

    return {
        transactions,
        filteredTransactions: paginatedTransactions, // Expose only the current slice to the UI Table
        allFilteredCount: filteredTransactions.length, // Expose total count for pagination UI
        stats,
        addTransaction,
        handleCloseDay,

        // Pagination
        page,
        setPage,
        totalPages: Math.ceil(filteredTransactions.length / ITEMS_PER_PAGE),

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
