"use client";

import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/lib/supabase";
import { useToast } from "@/components/ui/toast";

export interface CashShift {
    id: string;
    organization_id: string;
    user_id: string;
    start_time: string;
    initial_cash: number;
    status: 'open' | 'closed';
}

export function useCashShift() {
    const [currentShift, setCurrentShift] = useState<CashShift | null>(null);
    const [loading, setLoading] = useState(true);
    const { toast } = useToast();

    const fetchOpenShift = useCallback(async () => {
        setLoading(true);
        try {
            const { data: { session } } = await supabase.auth.getSession();
            if (!session) return;

            const { data: profile } = await supabase.from('profiles').select('organization_id').eq('id', session.user.id).single();
            if (!profile?.organization_id) return;

            // Use the RPC if available, or direct query
            // Using direct query for simplicity and control
            const { data, error } = await supabase
                .from('cash_shifts')
                .select('*')
                .eq('organization_id', profile.organization_id)
                .eq('user_id', session.user.id)
                .eq('status', 'open')
                .maybeSingle();

            if (error) {
                console.error("Error fetching shift (Detailed):", JSON.stringify(error));
            }

            setCurrentShift(data);
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchOpenShift();
    }, [fetchOpenShift]);

    return {
        currentShift,
        loading,
        refreshShift: fetchOpenShift
    };
}
