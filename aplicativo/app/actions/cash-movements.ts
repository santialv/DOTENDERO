"use server";

import { createClient } from "@/lib/supabase-server";

export async function addCashMovement(
    amount: number,
    type: 'in' | 'out',
    reason: string,
    categoryId: string
) {
    const supabase = await createClient();

    // 1. Get Session & Org
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) return { success: false, message: "No sesión" };

    const { data: profile } = await supabase.from('profiles').select('organization_id').eq('id', session.user.id).single();
    const orgId = profile?.organization_id;
    if (!orgId) return { success: false, message: "No Org" };

    // 2. Get CURRENT OPEN shift
    const { data: shift, error: shiftError } = await supabase
        .from('cash_shifts')
        .select('id')
        .eq('organization_id', orgId)
        .ilike('status', 'open')
        .maybeSingle();

    if (shiftError || !shift) {
        return { success: false, message: "No hay turno abierto para registrar movimientos." };
    }

    // 3. Insert Movement
    const { error } = await supabase.from('cash_movements').insert({
        organization_id: orgId,
        shift_id: shift.id,
        user_id: session.user.id,
        amount: amount,
        type: type, // 'in' or 'out'
        reason: reason,
        category_id: categoryId || null // Optional relation to categories
    });

    if (error) {
        console.error("Error creating movement:", error);
        return { success: false, message: error.message };
    }

    return { success: true, message: "Movimiento registrado" };
}
