import { z } from "zod";

export const productSchema = z.object({
    name: z.string().min(1, "El nombre del producto es obligatorio"),
    description: z.string().min(3, "La descripción es obligatoria"),
    category: z.string().min(1, "La categoría es obligatoria"),

    costPrice: z.coerce.number().min(1, "El costo de compra es obligatorio"),
    salePrice: z.coerce.number().min(1, "El precio de venta es obligatorio"),
    tax: z.coerce.number().default(0),
    taxType: z.enum(["IVA", "ICO"]).default("IVA"),
    stock: z.coerce.number().min(0, "El stock inicial no puede ser negativo").default(0),
    minStock: z.coerce.number().min(0, "El stock mínimo no puede ser negativo").default(5),
    unit: z.string().min(1, "La unidad es obligatoria").default("und"),
    status: z.enum(["Activo", "Inactivo"]).default("Activo"),

    // DIAN / Fiscal Compliance
    priceIncludesTax: z.boolean().default(false),
    isService: z.boolean().default(false),
    fiscalClassification: z.enum(["gravado", "exento", "excluido", "no_gravado"]).default("gravado"),

    // Taxes (Virtual array for form handling)
    taxes: z.array(z.object({
        code: z.string(), // '01', '04', '22', '23'
        name: z.string(),
        rate: z.number(), // Percentage or Fixed Value
        type: z.enum(["percentage", "fixed"]),
    })).default([]),

    // Logic helpers (not DB fields)
    skuMode: z.enum(["manual", "auto"]).default("manual"),
    barcode: z.string().min(3, "El código de barras es obligatorio"),
}).refine((data) => {
    if (data.salePrice < data.costPrice) {
        // We allow this but maybe a warning? 
        // Ideally validation shouldn't block valid business cases (loss leaders), 
        // but usually a warning is nice. For now, strict validation isn't needed here.
        return true;
    }
    return true;
}, {
    message: "El precio de venta es menor al costo",
    path: ["salePrice"],
});

export type ProductFormValues = z.infer<typeof productSchema>;
