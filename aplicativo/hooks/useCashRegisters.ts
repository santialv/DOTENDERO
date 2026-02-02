"use client";

import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/lib/supabase";
import { getCashRegisters } from "@/app/actions/cash-shifts";

export function useCashRegisters() {
    const [registers, setRegisters] = useState<any[]>([]);
    const [error, setError] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);

    const fetchRegisters = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const { data: { session } } = await supabase.auth.getSession();
            if (!session) {
                setError("No hay sesión activa (Client)");
                setLoading(false);
                return;
            }

            const { data: profile } = await supabase.from('profiles').select('organization_id').eq('id', session.user.id).single();
            if (!profile?.organization_id) {
                setError("No se encontró organización");
                setLoading(false);
                return;
            }

            const { data, error: dbError } = await supabase
                .from('cash_registers')
                .select('*')
                .eq('organization_id', profile.organization_id);

            if (dbError) {
                setError(dbError.message);
            } else {
                setRegisters(data || []);
            }
        } catch (err: any) {
            setError(err.message);
        }
        setLoading(false);
    }, []);

    useEffect(() => {
        fetchRegisters();
    }, [fetchRegisters]);

    return {
        registers,
        loading,
        error,
        refreshRegisters: fetchRegisters
    };
}
