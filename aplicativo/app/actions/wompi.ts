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

// Use supabaseAdmin to bypass RLS for payment verification
import { supabaseAdmin } from "@/lib/supabase-admin";

export async function verifyAndActivateSubscription(transactionId: string, orgId: string) {
    console.log(`[SUBSCRIPTION] Verifying transaction ${transactionId} for Org ${orgId}`);
    try {
        // 1. Verify with Wompi
        const transaction = await wompiService.verifyTransaction(transactionId);

        console.log(`[SUBSCRIPTION] Wompi Status: ${transaction?.status}`);

        // In Sandbox, sometimes status is 'PENDING', but for testing we might want to allow it if key is test
        // But strict implementation requires APPROVED.
        if (transaction?.status !== 'APPROVED') {
            return {
                success: false,
                status: transaction?.status || 'NOT_FOUND',
                message: "El pago no fue aprobado o está pendiente de validación."
            };
        }

        // 2. Determine Plan
        const amount = transaction.amount_in_cents / 100;
        let planId = 'free';

        // Robust Price Matching Logic
        if (amount >= 80000) {
            planId = 'pro'; // Empresario PRO (aprox 90k)
        } else if (amount >= 20000) {
            planId = 'basic'; // Emprendedor (aprox 50k)
        } else {
            // If amount is small (e.g. testing $1000), default to basic for sandbox testing
            // Only for sandbox keys
            if (!process.env.NEXT_PUBLIC_WOMPI_PUBLIC_KEY?.includes('pub_prod_')) {
                console.log("[SANDBOX] Small amount detected, authorizing Basic Plan for testing.");
                planId = 'basic';
            }
        }

        console.log(`[SUBSCRIPTION] Amount: ${amount}, Activating Plan: ${planId}`);

        // 3. Update Organization with Admin Privileges (Direct Update, No RPC needed)
        const endDate = new Date();
        endDate.setDate(endDate.getDate() + 30); // 30 Days

        const { error: updateError } = await supabaseAdmin
            .from('organizations')
            .update({
                plan: planId,
                subscription_status: 'active',
                subscription_end_date: endDate.toISOString()
            })
            .eq('id', orgId);

        if (updateError) throw updateError;

        // 4. Log Subscription history (Best effort)
        try {
            await supabaseAdmin
                .from('subscriptions')
                .insert({
                    organization_id: orgId,
                    plan_id: planId,
                    status: 'active',
                    start_date: new Date().toISOString(),
                    end_date: endDate.toISOString(),
                    payment_ref: transactionId,
                    amount_paid: amount
                });
        } catch (err) {
            console.warn("Failed to log subscription history, but plan is active.", err);
        }

        return {
            success: true,
            message: "¡Plan activado exitosamente!",
            plan: planId,
            status: 'APPROVED'
        };

    } catch (error: any) {
        reportError(error, {
            location: "Wompi:verifyAndActivateSubscription",
            metadata: { transactionId, orgId }
        });
        return {
            success: false,
            status: 'ERROR',
            message: "Error activando el plan. Contacta a soporte.",
            error: error.message
        };
    }
}
