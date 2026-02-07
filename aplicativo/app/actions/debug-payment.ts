"use server";

// 🔒 SECURITY NOTICE:
// Debug actions have been disabled for production security.
// The 'simulatePaymentActivation' backdoor has been removed.

export async function debugPaymentAction(transactionId: string, manualOrgId?: string) {
    return { success: false, logs: ["❌ Debugging disabled in production."] };
}

export async function simulatePaymentActivation(manualOrgId?: string) {
    console.error("🚨 SECURITY ALERT: Attempt to call simulatePaymentActivation in production.");
    return { success: false, logs: ["❌ Acción deshabilitada por seguridad."] };
}
