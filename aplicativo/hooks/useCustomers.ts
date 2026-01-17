import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/lib/supabase";
import { useToast } from "@/components/ui/toast";

export interface Customer {
    id: string;
    full_name: string;
    document_number: string;
    phone: string;
    email: string;
    address: string;
    city: string;
    current_debt: number;
}

const PAGE_SIZE = 50;

export function useCustomers() {
    const { toast } = useToast();
    const [customers, setCustomers] = useState<Customer[]>([]);
    const [totalCount, setTotalCount] = useState(0);
    const [page, setPage] = useState(0);
    const [isLoading, setIsLoading] = useState(true);

    const [searchTerm, setSearchTerm] = useState("");
    const [showDebtorsOnly, setShowDebtorsOnly] = useState(false);

    // Fetch Customers (Server Side Pagination & Filtering)
    const fetchCustomers = useCallback(async (pageToLoad: number) => {
        setIsLoading(true);
        try {
            const { data: { session } } = await supabase.auth.getSession();
            if (!session) return;
            const { data: profile } = await supabase.from('profiles').select('organization_id').eq('id', session.user.id).single();
            const orgId = profile?.organization_id;

            if (!orgId) {
                setCustomers([]);
                setIsLoading(false);
                return;
            }

            // Build Query
            let query = supabase
                .from('customers')
                .select('*', { count: 'exact' })
                .eq('organization_id', orgId);

            // Filters
            if (searchTerm) {
                const term = searchTerm.trim();
                // Improved Search Query including Email
                query = query.or(`full_name.ilike.%${term}%,document_number.ilike.%${term}%,email.ilike.%${term}%`);
            }

            if (showDebtorsOnly) {
                query = query.gt('current_debt', 0);
            }

            // Pagination
            const from = pageToLoad * PAGE_SIZE;
            const to = from + PAGE_SIZE - 1;

            query = query.order('full_name', { ascending: true }).range(from, to);

            const { data, count, error } = await query;

            if (error) throw error;

            if (data) {
                setCustomers(data);
                setTotalCount(count || 0);
                setPage(pageToLoad);
            }

        } catch (error) {
            console.error("Error loading customers:", error);
            toast("Error cargando clientes", "error");
        } finally {
            setIsLoading(false);
        }
    }, [searchTerm, showDebtorsOnly, toast]);

    // Initial Load & Debounce
    useEffect(() => {
        const timeout = setTimeout(() => {
            fetchCustomers(0);
        }, 500);
        return () => clearTimeout(timeout);
    }, [fetchCustomers]);

    // Actions
    const saveCustomer = async (customerData: Partial<Customer>) => {
        try {
            const { data: { session } } = await supabase.auth.getSession();
            if (!session) throw new Error("No active session");
            const { data: profile } = await supabase.from('profiles').select('organization_id').eq('id', session.user.id).single();
            const orgId = profile?.organization_id;

            if (!orgId) throw new Error("No organization linked");

            if (customerData.document_number) {
                const { data: existing } = await supabase
                    .from('customers')
                    .select('id, full_name')
                    .eq('organization_id', orgId)
                    .eq('document_number', customerData.document_number)
                    .maybeSingle();

                if (existing && existing.id !== customerData.id) {
                    toast(`El documento ya pertenece a: ${existing.full_name}`, "error");
                    return false;
                }
            }

            if (customerData.id) {
                // Update
                const { error } = await supabase
                    .from('customers')
                    .update(customerData)
                    .eq('id', customerData.id);
                if (error) throw error;
                toast("Cliente actualizado", "success");
            } else {
                // Create
                const { error } = await supabase.from('customers').insert({
                    organization_id: orgId,
                    ...customerData,
                    current_debt: 0
                });
                if (error) throw error;
                toast("Cliente creado", "success");
            }
            fetchCustomers(page); // Reload current page
            return true;
        } catch (error: any) {
            console.error(error);
            toast("Error al guardar cliente", "error");
            return false;
        }
    };

    const deleteCustomer = async (id: string) => {
        if (!confirm("¿Eliminar cliente?")) return;
        try {
            const { error } = await supabase.from('customers').delete().eq('id', id);
            if (error) throw error;
            toast("Cliente eliminado", "success");
            fetchCustomers(0); // Reload from start
        } catch (error) {
            toast("Error al eliminar", "error");
        }
    };

    const processPayment = async (customer: Customer, amount: number, reference?: string) => {
        if (amount <= 0) { toast("Monto inválido", "error"); return false; }
        if (amount > customer.current_debt) { toast("El abono no puede superar la deuda", "error"); return false; }

        try {
            const { data: { session } } = await supabase.auth.getSession();
            if (!session) throw new Error("No auth");
            const { data: profile } = await supabase.from('profiles').select('organization_id').eq('id', session.user.id).single();
            const orgId = profile?.organization_id;

            // 1. Update Debt
            const newDebt = customer.current_debt - amount;
            const { error: debtError } = await supabase
                .from('customers')
                .update({ current_debt: newDebt })
                .eq('id', customer.id);

            if (debtError) throw debtError;

            // 2. Register Value in Expenses (Income)
            // If reference provided, append to description
            const desc = reference
                ? `Abono Cliente: ${customer.full_name} (Ref: ${reference})`
                : `Abono Cliente: ${customer.full_name}`;

            await supabase.from('expenses').insert({
                organization_id: orgId,
                description: desc,
                amount: amount,
                type: 'income',
                customer_id: customer.id,
                payment_method: 'Efectivo',
                date: new Date().toISOString()
            });

            toast("Abono registrado exitosamente", "success");
            fetchCustomers(page);
            return true;
        } catch (error) {
            console.error(error);
            toast("Error procesando pago", "error");
            return false;
        }
    };

    return {
        customers,
        isLoading,
        searchTerm, setSearchTerm,
        showDebtorsOnly, setShowDebtorsOnly,
        saveCustomer,
        deleteCustomer,
        processPayment,
        reload: () => fetchCustomers(page),

        // Pagination
        page,
        setPage, // Exposed for UI
        totalPages: Math.ceil(totalCount / PAGE_SIZE),
        totalCount,
        fetchPage: fetchCustomers
    };
}
