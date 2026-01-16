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
    try {
        // 1. Verificar transacción real con Wompi
        const transaction = await wompiService.verifyTransaction(transactionId);

        if (transaction?.status !== 'APPROVED') {
            return {
                success: false,
                status: transaction?.status || 'NOT_FOUND',
                message: "El pago no fue aprobado o está pendiente."
            };
        }

        // 2. Determinar Plan basado en el monto
        // TODO: En el futuro, el ID del plan debería venir en los metadatos de la transacción (extra1)
        // Por ahora, usamos lógica simple basada en los precios definidos en SQL
        const amount = transaction.amount_in_cents / 100; // Wompi usa centavos
        let planCode = 'basic_monthly';

        if (amount >= 590000) planCode = 'pro_annual'; // ~599k
        else if (amount >= 50000) planCode = 'pro_monthly'; // ~59k

        // 3. Activar Plan usando la Función RPC de Base de Datos
        // Esta función calcula fechas, guarda historial y actualiza estado, todo en uno.
        const { data, error } = await supabase.rpc('activate_subscription_plan', {
            p_org_id: orgId,
            p_plan_code: planCode,
            p_payment_ref: transactionId,
            p_amount: amount
        });

        if (error) {
            console.error("RPC Error:", error);
            throw new Error(`Error en base de datos: ${error.message}`);
        }

        return {
            success: true,
            message: "¡Plan activado exitosamente!",
            plan: planCode,
            data
        };

    } catch (error: any) {
        console.error("Error activating subscription:", error);
        return { success: false, error: error.message || "Error del sistema al activar suscripción." };
    }
}
