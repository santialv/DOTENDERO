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

        const { data: { user }, error: authError } = await supabase.auth.getUser();

        if (authError || !user) {
            console.error("Auth Error:", authError);
            return {
                success: false,
                message: "No hay sesión activa. Por favor cierra sesión y vuelve a ingresar o recarga la página."
            };
        }

        const { data: profile, error: profileError } = await supabase
            .from("profiles")
            .select("organization_id")
            .eq("id", user.id)
            .single();

        if (profileError || !profile?.organization_id) {
            console.error("Profile Error:", profileError);
            return { success: false, message: "No se encontró una organización vinculada a tu cuenta." };
        }

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
        const mainIva = taxes.find(t => t.code === '01');
        const legacyTaxRate = mainIva ? mainIva.rate : 0;
        const legacyTaxType = mainIva ? 'IVA' : 'ICO';

        const { data: productData, error: productError } = await supabase.from("products").insert({
            organization_id: orgId,
            name,
            description,
            category,
            barcode,
            price: salePrice,
            cost: costPrice,
            stock,
            min_stock: minStock,
            unit,
            status: status === "Activo" ? "active" : "inactive",
            price_includes_tax: priceIncludesTax,
            is_service: isService,
            fiscal_classification: fiscalClassification,
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
                let taxId: string | null = null;
                const { data: existingTax } = await supabase
                    .from('taxes')
                    .select('id')
                    .eq('organization_id', orgId)
                    .eq('code', tax.code)
                    .eq('rate', tax.rate)
                    .eq('type', tax.type)
                    .maybeSingle();

                if (existingTax) {
                    taxId = existingTax.id;
                } else {
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

export async function updateProduct(id: string, data: ProductFormValues): Promise<ActionState> {
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
        priceIncludesTax, isService, fiscalClassification, taxes
    } = validation.data;

    try {
        const supabase = await createClient();
        const { data: { user }, error: authError } = await supabase.auth.getUser();

        if (authError || !user) {
            return {
                success: false,
                message: "No hay sesión activa. Por favor cierra sesión y vuelve a ingresar."
            };
        }

        const { data: profile } = await supabase
            .from("profiles")
            .select("organization_id")
            .eq("id", user.id)
            .single();

        if (!profile?.organization_id) return { success: false, message: "No se encontró organización vinculada." };
        const orgId = profile.organization_id;

        // Duplicate Barcode Check (excluding current)
        if (barcode && barcode.length > 3) {
            const { data: duplicate } = await supabase
                .from("products")
                .select("id")
                .eq("barcode", barcode)
                .eq("organization_id", orgId)
                .neq("id", id)
                .maybeSingle();

            if (duplicate) {
                return { success: false, message: "El código de barras ya está en uso por otro producto." };
            }
        }

        // Update Product
        const mainIva = taxes.find(t => t.code === '01');
        const legacyTaxRate = mainIva ? mainIva.rate : 0;
        const legacyTaxType = mainIva ? 'IVA' : 'ICO';

        const { error: productError } = await supabase.from("products").update({
            name,
            description,
            category,
            barcode,
            price: salePrice,
            cost: costPrice,
            stock,
            min_stock: minStock,
            unit,
            status: status === "Activo" ? "active" : "inactive",
            price_includes_tax: priceIncludesTax,
            is_service: isService,
            fiscal_classification: fiscalClassification,
            tax_rate: legacyTaxRate,
            tax_type: legacyTaxType,
        }).eq("id", id).eq("organization_id", orgId);

        if (productError) throw productError;

        // Cleanup and re-link taxes
        await supabase.from('product_taxes').delete().eq('product_id', id);

        if (taxes && taxes.length > 0) {
            for (const tax of taxes) {
                let taxId: string | null = null;
                const { data: existingTax } = await supabase
                    .from('taxes')
                    .select('id')
                    .eq('organization_id', orgId)
                    .eq('code', tax.code)
                    .eq('rate', tax.rate)
                    .eq('type', tax.type)
                    .maybeSingle();

                if (existingTax) {
                    taxId = existingTax.id;
                } else {
                    const { data: newTax } = await supabase.from('taxes').insert({
                        organization_id: orgId,
                        name: tax.name,
                        code: tax.code,
                        rate: tax.rate,
                        type: tax.type,
                    }).select().single();
                    if (newTax) taxId = newTax.id;
                }

                if (taxId) {
                    await supabase.from('product_taxes').insert({
                        product_id: id,
                        tax_id: taxId
                    });
                }
            }
        }

        revalidatePath("/inventario");
        return { success: true, message: "Producto actualizado exitosamente" };

    } catch (error: any) {
        console.error("Update Action Error:", error);
        return { success: false, message: error.message || "Error al actualizar." };
    }
}
