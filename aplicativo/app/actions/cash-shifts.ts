"use server";

import { createClient } from "@/lib/supabase-server";
import { revalidatePath } from "next/cache";

export type ShiftActionState = {
    success: boolean;
    message?: string;
    data?: any;
};

/**
 * Gets all cash registers for the current user's organization.
 */
export async function getCashRegisters(): Promise<ShiftActionState> {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { success: false, message: "No hay sesión activa" };

    const { data: profile, error: profileError } = await supabase.from('profiles').select('organization_id').eq('id', user.id).single();
    if (profileError) return { success: false, message: `Error perfil: ${profileError.message}` };
    if (!profile?.organization_id) return { success: false, message: "Usuario sin organización vinculada" };

    const { data, error } = await supabase
        .from('cash_registers')
        .select('*')
        .eq('organization_id', profile.organization_id);

    // Log for server-side debugging
    console.log(`[getCashRegisters] Org: ${profile.organization_id}, Count: ${data?.length || 0}`);

    if (error) return { success: false, message: `Error DB Cajas: ${error.message}` };
    return { success: true, data };
}

/**
 * Opens a new shift for a specific register.
 */
export async function openShift(registerId: string, initialCash: number): Promise<ShiftActionState> {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { success: false, message: "No hay sesión activa" };

    const { data: profile } = await supabase.from('profiles').select('organization_id').eq('id', user.id).single();
    if (!profile?.organization_id) return { success: false, message: "No se encontró organización" };

    // Check if the user already has an open shift (only one shift at a time per user usually)
    const { data: existingShift } = await supabase
        .from('cash_shifts')
        .select('id')
        .eq('user_id', user.id)
        .eq('status', 'open')
        .maybeSingle();

    if (existingShift) {
        return { success: false, message: "Ya tienes un turno abierto activo." };
    }

    // Check if the REGISTER already has an open shift by someone else
    const { data: registerOpen } = await supabase
        .from('cash_shifts')
        .select('id, profiles(full_name)')
        .eq('register_id', registerId)
        .eq('status', 'open')
        .maybeSingle();

    if (registerOpen) {
        const profile = registerOpen.profiles as any;
        const name = Array.isArray(profile) ? profile[0]?.full_name : profile?.full_name;
        return { success: false, message: `Esta caja ya está siendo usada por ${name || 'otro usuario'}` };
    }

    const { data, error } = await supabase.from('cash_shifts').insert({
        organization_id: profile.organization_id,
        register_id: registerId,
        user_id: user.id,
        initial_cash: initialCash,
        start_time: new Date().toISOString(),
        status: 'open'
    }).select().single();

    if (error) return { success: false, message: error.message };

    revalidatePath("/pos");
    return { success: true, message: "Turno abierto correctamente", data };
}

/**
 * Closes an existing shift and calculates totals.
 */
export async function closeShift(shiftId: string, finalCashReal: number, notes?: string): Promise<ShiftActionState> {
    const supabase = await createClient();

    // 1. Calculate Expected Cash
    // Expected = Initial + Cash Sales + Cash Incomes - Cash Withdrawals

    // Get Shift Info
    const { data: shift, error: shiftError } = await supabase
        .from('cash_shifts')
        .select('initial_cash')
        .eq('id', shiftId)
        .single();

    if (shiftError || !shift) return { success: false, message: "No se encontró el turno" };

    // Get Cash Sales
    const { data: sales } = await supabase
        .from('invoices')
        .select('total')
        .eq('shift_id', shiftId)
        .eq('payment_method', 'cash')
        .eq('status', 'paid');

    const totalSales = sales?.reduce((acc, curr) => acc + Number(curr.total), 0) || 0;

    // Get Manual Movements
    const { data: movements } = await supabase
        .from('cash_movements')
        .select('amount, type')
        .eq('shift_id', shiftId);

    const totalIn = movements?.filter(m => m.type === 'in').reduce((acc, curr) => acc + Number(curr.amount), 0) || 0;
    const totalOut = movements?.filter(m => m.type === 'out').reduce((acc, curr) => acc + Number(curr.amount), 0) || 0;

    const expectedCash = Number(shift.initial_cash) + totalSales + totalIn - totalOut;
    const difference = finalCashReal - expectedCash;

    // 2. Update Shift
    const { error: updateError } = await supabase
        .from('cash_shifts')
        .update({
            end_time: new Date().toISOString(),
            status: 'closed',
            final_cash_expected: expectedCash,
            final_cash_real: finalCashReal,
            difference: difference,
            notes: notes
        })
        .eq('id', shiftId);

    if (updateError) return { success: false, message: updateError.message };

    revalidatePath("/pos");
    return {
        success: true,
        message: "Turno cerrado correctamente",
        data: { expectedCash, finalCashReal, difference }
    };
}

/**
 * Gets the current open shift for the user.
 */
export async function getCurrentOpenShift() {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return null;

    const { data, error } = await supabase
        .from('cash_shifts')
        .select('*, cash_registers(name)')
        .eq('user_id', user.id)
        .eq('status', 'open')
        .maybeSingle();

    if (error) return null;
    return data;
}
