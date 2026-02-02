"use server";

import { revalidatePath } from "next/cache";
import { supabaseAdmin } from "@/lib/supabase-admin";
import { createClient } from "@/lib/supabase-server";

export type ActionState = {
    success: boolean;
    message: string;
    data?: any;
};

/**
 * Creates a new user for the current organization.
 * Only owners and admins can perform this action.
 */
export async function createTeamMember(
    email: string,
    password: string,
    fullName: string,
    role: 'admin' | 'cashier'
): Promise<ActionState> {
    try {
        const supabase = await createClient();
        const { data: { user: currentUser } } = await supabase.auth.getUser();
        if (!currentUser) return { success: false, message: "No autenticado" };

        // 1. Verify permissions and plan limits
        const { data: profile } = await supabase
            .from('profiles')
            .select('organization_id, role, organizations(plan)')
            .eq('id', currentUser.id)
            .single();

        if (!profile || !['owner', 'admin'].includes(profile.role)) {
            return { success: false, message: "No tienes permisos para crear usuarios." };
        }

        const orgId = profile.organization_id;
        const currentPlanId = (profile.organizations as any)?.plan || 'free';

        // 1.1 Check Plan Limits
        const [{ data: plan }, { count: userCount }] = await Promise.all([
            supabase.from('plans').select('features').eq('id', currentPlanId).single(),
            supabase.from('profiles').select('*', { count: 'exact', head: true }).eq('organization_id', orgId)
        ]);

        const maxUsers = plan?.features?.max_users || 1;
        if (userCount !== null && userCount >= maxUsers) {
            return {
                success: false,
                message: `Límite de usuarios alcanzado (${userCount}/${maxUsers}). Por favor mejora tu plan para agregar más miembros.`
            };
        }

        // 2. Create the user in Supabase Auth
        const { data: newUser, error: authError } = await supabaseAdmin.auth.admin.createUser({
            email,
            password,
            email_confirm: true,
            user_metadata: { full_name: fullName }
        });

        if (authError) throw authError;

        // 3. Update the profile in our table
        // Note: Supabase might have a trigger that creates a profile automatically,
        // but it might not know the organization_id or role.
        // We update/upsert to ensure it's correct.
        const { error: profileError } = await supabaseAdmin
            .from('profiles')
            .upsert({
                id: newUser.user.id,
                email,
                full_name: fullName,
                role: role,
                organization_id: profile.organization_id,
                status: 'active',
                permissions: role === 'admin'
                    ? { create_customers: true, view_purchase_costs: true, apply_discounts: true, manage_team: true }
                    : { create_customers: true, view_purchase_costs: false, apply_discounts: true, manage_team: false }
            });

        if (profileError) {
            // Cleanup: avoid orphan auth user if profile fails
            await supabaseAdmin.auth.admin.deleteUser(newUser.user.id);
            throw profileError;
        }

        revalidatePath("/configuracion");
        return { success: true, message: "Miembro del equipo creado correctamente." };

    } catch (error: any) {
        console.error("Error creating team member:", error);
        return { success: false, message: error.message || "Error al crear usuario." };
    }
}

/**
 * Updates a team member's role or status.
 */
export async function updateTeamMember(
    userId: string,
    updates: { role?: 'admin' | 'cashier', status?: 'active' | 'inactive', permissions?: any }
): Promise<ActionState> {
    try {
        const supabase = await createClient();
        const { data: { user: currentUser } } = await supabase.auth.getUser();
        if (!currentUser) return { success: false, message: "No autenticado" };

        const { data: profile } = await supabase
            .from('profiles')
            .select('organization_id, role')
            .eq('id', currentUser.id)
            .single();

        if (!profile || !['owner', 'admin'].includes(profile.role)) {
            return { success: false, message: "Permisos insuficientes." };
        }

        // Prevent admin from downgrading owners or themselves if they are owner
        const { data: targetProfile } = await supabase
            .from('profiles')
            .select('role')
            .eq('id', userId)
            .single();

        if (targetProfile?.role === 'owner' && profile.role !== 'owner') {
            return { success: false, message: "Un administrador no puede modificar al dueño." };
        }

        const { error } = await supabase
            .from('profiles')
            .update(updates)
            .eq('id', userId)
            .eq('organization_id', profile.organization_id);

        if (error) throw error;

        revalidatePath("/configuracion");
        return { success: true, message: "Usuario actualizado correctamente." };

    } catch (error: any) {
        return { success: false, message: error.message || "Error al actualizar." };
    }
}

/**
 * Fetches all team members for the organization.
 */
export async function getTeamMembers() {
    try {
        const supabase = await createClient();
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return [];

        const { data: profile } = await supabase
            .from('profiles')
            .select('organization_id')
            .eq('id', user.id)
            .single();

        if (!profile) return [];

        const { data, error } = await supabase
            .from('profiles')
            .select('*')
            .eq('organization_id', profile.organization_id)
            .order('created_at', { ascending: true });

        if (error) throw error;
        return data || [];

    } catch (error) {
        console.error("Error getting team:", error);
        return [];
    }
}
