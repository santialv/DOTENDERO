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
        const transaction = await wompiService.verifyTransaction(transactionId);

        if (transaction?.status === 'APPROVED') {
            const { error } = await supabase
                .from('organizations')
                .update({ subscription_status: 'active' })
                .eq('id', orgId);

            if (error) throw error;
            return { success: true, message: "Subscription activated!" };
        }

        return {
            success: false,
            status: transaction?.status || 'NOT_FOUND',
            message: "Payment not approved yet."
        };
    } catch (error) {
        console.error("Error activating subscription:", error);
        return { success: false, error: "System error activating subscription." };
    }
}
