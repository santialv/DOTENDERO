"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";

export type UserRole = 'owner' | 'admin' | 'cashier' | 'super_admin';

export interface UserPermissions {
    create_customers: boolean;
    view_purchase_costs: boolean;
    apply_discounts: boolean;
    manage_team: boolean;
}

export function useUserRole() {
    const [role, setRole] = useState<UserRole | null>(null);
    const [permissions, setPermissions] = useState<UserPermissions | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function fetchRole() {
            try {
                const { data: { session } } = await supabase.auth.getSession();
                if (!session) {
                    setRole(null);
                    setPermissions(null);
                    setLoading(false);
                    return;
                }

                const { data, error } = await supabase
                    .from('profiles')
                    .select('role, permissions')
                    .eq('id', session.user.id)
                    .single();

                if (error) throw error;
                setRole(data?.role as UserRole || 'cashier');
                setPermissions(data?.permissions as UserPermissions || null);
            } catch (error) {
                console.error("Error fetching user role:", error);
                setRole('cashier');
                setPermissions(null);
            } finally {
                setLoading(false);
            }
        }

        fetchRole();
    }, []);

    return { role, permissions, loading };
}
