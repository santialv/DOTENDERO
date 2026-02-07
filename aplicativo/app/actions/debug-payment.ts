"use server";

import { wompiService } from "@/lib/wompi";
import { supabaseAdmin } from "@/lib/supabase-admin";

export async function debugPaymentAction(transactionId: string) {
    const logs: string[] = [];
    const log = (msg: string) => logs.push(`[${new Date().toISOString().split('T')[1]}] ${msg}`);

    log(`Iniciando diagnóstico para Transaction ID: ${transactionId}`);

    try {
        // 1. Check Environment
        log("Chequeando Variables de Entorno...");
        if (!process.env.NEXT_PUBLIC_WOMPI_PUBLIC_KEY) log("❌ Faltan WOMPI_PUBLIC_KEY");
        else log("✅ WOMPI_PUBLIC_KEY presente");

        if (!process.env.SUPABASE_SERVICE_ROLE_KEY) log("❌ Faltan SUPABASE_SERVICE_ROLE_KEY");
        else log("✅ SUPABASE_SERVICE_ROLE_KEY presente");

        // 2. Check Wompi
        log("Consultando Wompi...");
        const transaction = await wompiService.verifyTransaction(transactionId);

        if (!transaction) {
            log("❌ Wompi devolvió null. ¿ID incorrecto o ambiente (sandbox/prod) mixto?");
            return { success: false, logs };
        }

        log(`✅ Wompi respondió. Estado: ${transaction.status}`);
        log(`💰 Monto: ${transaction.amount_in_cents} centavos`);
        log(`📅 Referencia: ${transaction.reference}`);

        if (transaction.status !== 'APPROVED') {
            log("⚠️ El estado NO es APPROVED. El sistema requiere APPROVED para activar.");
        }

        // 3. Check Supabase Admin Connection
        log("Probando conexión a Supabase con Service Role...");
        const { data: plans, error: planError } = await supabaseAdmin.from('plans').select('count(*)').single();

        if (planError) {
            log(`❌ Error contectando a DB: ${planError.message}`);
            log(`Detalle: ${JSON.stringify(planError)}`);
            return { success: false, logs };
        } else {
            log("✅ Conexión DB Admin exitosa.");
        }

        // 4. Simulate Logic
        const amount = transaction.amount_in_cents / 100;
        let planId = 'free';
        if (amount >= 80000) planId = 'pro';
        else if (amount >= 20000) planId = 'basic';

        // Sandbox Override Check logic copy
        if (!process.env.NEXT_PUBLIC_WOMPI_PUBLIC_KEY?.includes('pub_prod_') && amount < 20000) {
            log("ℹ️ Detectado modo Sandbox con monto bajo. Asignando 'basic' por defecto.");
            planId = 'basic';
        }

        log(`🎯 Plan calculado: ${planId}`);

        return { success: true, logs, transactionStatus: transaction.status, calculatedPlan: planId };

    } catch (error: any) {
        log(`❌ Excepción no controlada: ${error.message}`);
        return { success: false, logs };
    }
}
