"use server";

import { wompiService } from "@/lib/wompi";
import { supabase } from "@/lib/supabase";

export async function getWompiSignature(amount: number) {
    try {
        const transactionData = wompiService.prepareTransaction(amount);
        return { success: true, data: transactionData };
    } catch (error) {
        console.error("Error generating Wompi signature:", error);
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

        // 2. Determinar Plan basado en el monto
        const amount = transaction.amount_in_cents / 100;
        let planCode = 'basic_monthly';

        if (amount >= 590000) planCode = 'pro_annual'; // ~599k
        else if (amount >= 50000) planCode = 'pro_monthly'; // ~59k

        console.log(`[SUBSCRIPTION] Activating Plan: ${planCode} for Amount ${amount}`);

        // 3. Activar Plan usando la Función RPC de Base de Datos
        const { data, error } = await supabase.rpc('activate_subscription_plan', {
            p_org_id: orgId,
            p_plan_code: planCode,
            p_payment_ref: transactionId,
            p_amount: amount
        });

        if (error) {
            console.error("[SUBSCRIPTION] RPC Error:", error);
            throw new Error(`Database Error: ${error.message} (Hint: Did you run the SQL migration?)`);
        }

        return {
            success: true,
            message: "¡Plan activado exitosamente!",
            plan: planCode,
            status: 'APPROVED',
            data
        };

    } catch (error: any) {
        console.error("[SUBSCRIPTION] System Error:", error);
        return {
            success: false,
            status: 'ERROR',
            message: error.message || "Error del sistema al activar suscripción.",
            error: error.message
        };
    }
}
