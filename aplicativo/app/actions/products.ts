"use server";

import { createClient } from "@/lib/supabase-server";
import { productSchema, ProductFormValues } from "@/lib/schemas/product";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

export type ActionState = {
    success: boolean;
    message?: string;
    errors?: Record<string, string[]>;
    data?: any;
};

export async function createProduct(data: ProductFormValues): Promise<ActionState> {
    // 1. Validate Input
    const validation = productSchema.safeParse(data);
    if (!validation.success) {
        return {
            success: false,
            message: "Error de validación",
            errors: validation.error.flatten().fieldErrors,
        };
    }

    const {
        name, description, category, barcode,
        costPrice, salePrice, stock, minStock, unit, status,
        priceIncludesTax, isService, fiscalClassification, taxes,
        skuMode
    } = validation.data;

    try {
        // 2. Auth & Org Check
        const supabase = await createClient();

        const { data: { session }, error: sessionError } = await supabase.auth.getSession();

        if (sessionError || !session) {
            console.error("Session Error:", sessionError);
            return { success: false, message: "No hay sesión activa. Por favor recarga la página." };
        }

        const { data: profile } = await supabase.from("profiles").select("organization_id").eq("id", session.user.id).single();
        if (!profile?.organization_id) return { success: false, message: "No se encontró organización vinculada." };

        const orgId = profile.organization_id;

        // 3. Duplicate Barcode Check (if exists)
        if (barcode && barcode.length > 3) {
            const { data: duplicate } = await supabase
                .from("products")
                .select("id")
                .eq("barcode", barcode)
                .eq("organization_id", orgId)
                .single();
            if (duplicate) {
                return { success: false, message: "El código de barras ya existe." };
            }
        }

        // 4. Insert Product (Main Table)
        // Backward compatibility: tax_rate/tax_type filled with main IVA if available
        const mainIva = taxes.find(t => t.code === '01');
        const legacyTaxRate = mainIva ? mainIva.rate : 0;
        const legacyTaxType = mainIva ? 'IVA' : 'ICO'; // Simplification

        const { data: productData, error: productError } = await supabase.from("products").insert({
            organization_id: orgId,
            name,
            description: description || "",
            category,
            barcode: barcode || "SIN-CODIGO",
            price: salePrice,
            cost: costPrice,
            stock,
            min_stock: minStock,
            unit,
            status: status === "Activo" ? "active" : "inactive",
            // New DIAN Fields
            price_includes_tax: priceIncludesTax,
            is_service: isService,
            fiscal_classification: fiscalClassification,
            // Legacy Compatibility (Optional, can be 0/null)
            tax_rate: legacyTaxRate,
            tax_type: legacyTaxType,
            bag_tax: 0,
            ica_rate: 0
        }).select().single();

        if (productError) throw productError;
        const productId = productData.id;

        // 5. Handle Taxes (Many-to-Many)
        if (taxes && taxes.length > 0) {
            for (const tax of taxes) {
                // Find or Create Tax Record in 'taxes' table
                // We assume tax uniqueness by code + rate + org
                let taxId: string | null = null;

                const { data: existingTax } = await supabase
                    .from('taxes')
                    .select('id')
                    .eq('organization_id', orgId)
                    .eq('code', tax.code)
                    .eq('rate', tax.rate) // Careful with float comparison, maybe use range or numeric type
                    .eq('type', tax.type)
                    .maybeSingle();

                if (existingTax) {
                    taxId = existingTax.id;
                } else {
                    // Create new Tax Definition
                    const { data: newTax, error: newTaxError } = await supabase.from('taxes').insert({
                        organization_id: orgId,
                        name: tax.name,
                        code: tax.code,
                        rate: tax.rate,
                        type: tax.type,
                    }).select().single();

                    if (!newTaxError && newTax) {
                        taxId = newTax.id;
                    }
                }

                // Link Product to Tax
                if (taxId) {
                    await supabase.from('product_taxes').insert({
                        product_id: productId,
                        tax_id: taxId
                    });
                }
            }
        }

        revalidatePath("/inventario");
        return { success: true, message: "Producto creado exitosamente" };

    } catch (error: any) {
        console.error("Server Action Error:", error);
        return {
            success: false,
            message: error.message || "Error al guardar el producto."
        };
    }
}
