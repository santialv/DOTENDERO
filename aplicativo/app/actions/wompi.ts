"use server";

import { wompiService } from "@/lib/wompi";
import { supabase } from "@/lib/supabase";
import { reportError } from "@/lib/error-reporting";

export async function getWompiSignature(amount: number) {
    try {
        const transactionData = wompiService.prepareTransaction(amount);
        return { success: true, data: transactionData };
    } catch (error) {
        reportError(error, { location: "Wompi:getWompiSignature" });
        return { success: false, error: "Failed to generate payment signature" };
    }
}

export async function verifyAndActivateSubscription(transactionId: string, orgId: string) {
    console.log(`[SUBSCRIPTION] Verifying transaction ${transactionId} for Org ${orgId}`);
    try {
        // 1. Verificar transacción real con Wompi
        const transaction = await wompiService.verifyTransaction(transactionId);

        console.log(`[SUBSCRIPTION] Wompi Status: ${transaction?.status}`);

        if (transaction?.status !== 'APPROVED') {
            return {
                success: false,
                status: transaction?.status || 'NOT_FOUND',
                message: "El pago no fue aprobado o está pendiente."
            };
        }

        // 2. Determinar Plan basado en el monto pagado
        const amount = transaction.amount_in_cents / 100;

        // Buscamos el plan en la base de datos que coincida con este precio
        const { data: matchedPlans } = await supabase
            .from('plans')
            .select('id')
            .eq('price', amount)
            .eq('active', true);

        let planId = 'pro'; // Default fallback
        if (matchedPlans && matchedPlans.length > 0) {
            planId = matchedPlans[0].id;
        } else {
            // Fallback razonable si no hay match exacto (ej: por descuentos de Wompi o IVA)
            if (amount >= 400000) planId = 'pro';
            else if (amount >= 30000) planId = 'basic';
        }

        console.log(`[SUBSCRIPTION DEBUG] Amount: ${amount}, Plan Identified: ${planId}`);

        // 3. Activar Plan usando la Función RPC de Base de Datos
        const { data, error } = await supabase.rpc('activate_subscription_plan', {
            p_org_id: orgId,
            p_plan_id: planId, // Changed from p_plan_code
            p_payment_ref: transactionId,
            p_amount: amount
        });

        if (error) {
            console.error("[SUBSCRIPTION] RPC Error:", error);
            throw new Error(`Database Error: ${error.message}`);
        }

        return {
            success: true,
            message: "¡Plan activado exitosamente!",
            plan: planId,
            status: 'APPROVED',
            data
        };

    } catch (error: any) {
        reportError(error, {
            location: "Wompi:verifyAndActivateSubscription",
            metadata: { transactionId, orgId }
        });
        return {
            success: false,
            status: 'ERROR',
            message: error.message || "Error del sistema al activar suscripción.",
            error: error.message
        };
    }
}
