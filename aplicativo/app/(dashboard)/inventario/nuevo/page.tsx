"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { PRODUCT_CATEGORIES } from "@/lib/constants";
import { supabase } from "@/lib/supabase";
import { useToast } from "@/components/ui/toast";

// Define Product interface locally or import if available centrally (using local conformity for now)
interface Product {
    id: string;
    name: string;
    description: string;
    category: string;
    barcode: string;
    costPrice: number;
    salePrice: number;
    tax: number;
    stock: number;
    minStock: number;
    unit: string;
    status: 'Activo' | 'Inactivo';
    image?: string;
    icaRate?: number;
    bagTax?: number;
    taxType?: 'IVA' | 'ICO';
}

export default function CreateProductPage() {
    const router = useRouter();
    const { toast } = useToast();

    // -- Form State --
    const [name, setName] = useState("");
    const [description, setDescription] = useState("");
    const [category, setCategory] = useState("");
    const [barcode, setBarcode] = useState("");
    const [skuMode, setSkuMode] = useState<'manual' | 'auto'>('manual');

    const [costPrice, setCostPrice] = useState("");
    const [salePrice, setSalePrice] = useState("");
    const [tax, setTax] = useState("0");
    const [taxType, setTaxType] = useState<"IVA" | "ICO">("IVA");
    const [stock, setStock] = useState("");
    const [minStock, setMinStock] = useState("5"); // Default min stock

    const [unit, setUnit] = useState("und");
    const [status, setStatus] = useState<'Activo' | 'Inactivo'>('Activo');

    // Additional Taxes
    const [icaRate, setIcaRate] = useState("");
    const [hasBagTax, setHasBagTax] = useState(false);
    const [bagTaxValue, setBagTaxValue] = useState("60"); // Default 2024/2025 value approx

    const handleSave = async (shouldRedirect = true) => {
        if (!name) {
            toast("El nombre del producto es obligatorio.", "error");
            return;
        }

        if (!salePrice) {
            toast("El precio de venta es obligatorio.", "error");
            return;
        }

        try {
            // Get Organization Securely
            const { data: { session } } = await supabase.auth.getSession();
            if (!session) {
                toast("No hay sesión activa.", "error");
                return;
            }

            const { data: profile } = await supabase
                .from("profiles")
                .select("organization_id")
                .eq("id", session.user.id)
                .single();

            const orgId = profile?.organization_id;

            if (!orgId) {
                toast("No se encontró una organización válida vinculada a su cuenta.", "error");
                return;
            }

            let finalBarcode = barcode;

            // If still in auto mode but no barcode generated yet (fallback), generate one now
            if (skuMode === 'auto' && (!finalBarcode || finalBarcode === "SIN-CODIGO")) {
                const randomSuffix = Math.floor(100000 + Math.random() * 900000);
                finalBarcode = `SKU-${randomSuffix}`;
            } else if (!finalBarcode) {
                if (!confirm("El código de barras está vacío. ¿Desea guardar sin código?")) return;
                finalBarcode = "SIN-CODIGO";
            }

            // Check duplicate barcode
            if (finalBarcode !== "SIN-CODIGO") {
                const { data: duplicate } = await supabase
                    .from("products")
                    .select("id")
                    .eq("barcode", finalBarcode)
                    .eq("organization_id", orgId) // Check duplicate in same org only!
                    .single();

                if (duplicate) {
                    toast(`El código de barras "${finalBarcode}" ya está registrado.`, "error");
                    return;
                }
            }

            // Insert to Supabase
            const { error } = await supabase.from("products").insert({
                organization_id: orgId,
                name,
                description,
                category: category || "General",
                barcode: finalBarcode,
                price: parseFloat(salePrice) || 0,
                cost: parseFloat(costPrice) || 0,
                tax_rate: parseFloat(tax) || 0,
                tax_type: taxType,
                stock: parseFloat(stock) || 0,
                min_stock: parseFloat(minStock) || 0,
                unit,
                status: status === 'Activo' ? 'active' : 'inactive',
                image_url: "",
                ica_rate: parseFloat(icaRate) || 0,
                bag_tax: hasBagTax ? (parseFloat(bagTaxValue) || 0) : 0
            });

            if (error) throw error;

            toast("Producto creado exitosamente.", "success");

            if (shouldRedirect) {
                router.push("/inventario");
            } else {
                // Reset form
                setName("");
                setDescription("");
                setBarcode("");
                setCostPrice("");
                setSalePrice("");
                setStock("");
                setIcaRate("");
                setBagTaxValue("60");
                setHasBagTax(false);
                setStatus("Activo");
            }
        } catch (error) {
            console.error("Error creating product:", error);
            toast("Error al guardar el producto.", "error");
        }
    };

    // Calculate Margin for display
    const cost = parseFloat(costPrice) || 0;
    const price = parseFloat(salePrice) || 0;
    const margin = price > 0 ? ((price - cost) / price) * 100 : 0;

    return (
        <div className="flex flex-col h-full bg-slate-50 font-display overflow-hidden">
            {/* Header */}
            <header className="h-16 flex items-center justify-between px-8 py-4 bg-slate-50 border-b border-transparent z-10 shrink-0">
                <div className="flex flex-col">
                    <div className="flex items-center text-xs text-slate-500 gap-2 mb-1">
                        <Link href="/inventario" className="hover:underline">Productos</Link>
                        <span className="material-symbols-outlined text-[12px]">chevron_right</span>
                        <span className="font-medium text-primary">Crear Nuevo</span>
                    </div>
                    <h1 className="text-2xl text-slate-900 tracking-tight leading-none">Crear Nuevo Producto</h1>
                </div>
                <div className="flex gap-3">
                    <Link href="/inventario" className="px-4 py-2 rounded-lg border border-slate-200 text-slate-700 font-semibold hover:bg-white transition-colors text-sm flex items-center">
                        Cancelar
                    </Link>
                    <button
                        onClick={() => handleSave(false)}
                        className="px-4 py-2 rounded-lg border-2 border-[#13ec80] text-[#0f3d2a] hover:bg-[#13ec80]/10 font-bold transition-all text-sm hidden md:block"
                    >
                        Guardar y Crear Otro
                    </button>
                    <button
                        onClick={() => handleSave(true)}
                        className="px-6 py-2 rounded-lg bg-[#13ec80] hover:bg-[#10d673] text-slate-900 font-black shadow-sm shadow-green-500/30 transition-all transform active:scale-95 text-sm flex items-center gap-2"
                    >
                        <span className="material-symbols-outlined text-lg font-bold">save</span>
                        Guardar Producto
                    </button>
                </div>
            </header>

            {/* Scrollable Form Area */}
            <div className="flex-1 overflow-y-auto px-8 py-6 custom-scrollbar">
                <div className="max-w-6xl mx-auto flex flex-col lg:flex-row gap-6 pb-20">
                    {/* Left Column: Image & Basic Info */}
                    <div className="flex flex-col gap-6 lg:w-2/3">
                        {/* Basic Information Card */}
                        <div className="bg-white rounded-xl shadow-sm p-6 border border-slate-200">
                            <div className="flex items-center gap-3 mb-6 pb-4 border-b border-slate-100">
                                <div className="p-2 bg-slate-100 rounded-lg">
                                    <span className="material-symbols-outlined text-primary">edit_document</span>
                                </div>
                                <div>
                                    <h2 className="text-lg text-slate-900">Detalles Generales</h2>
                                    <p className="text-sm text-slate-400">Información básica del producto para identificación.</p>
                                </div>
                            </div>
                            <div className="flex flex-col gap-5">
                                <label className="flex flex-col gap-2">
                                    <span className="text-sm text-slate-700">Nombre del Producto <span className="text-red-500">*</span></span>
                                    <input
                                        value={name}
                                        onChange={(e) => setName(e.target.value)}
                                        className="w-full rounded-lg border-slate-200 bg-slate-50 text-slate-900 focus:ring-2 focus:ring-primary focus:border-primary h-12 px-4 placeholder:text-gray-400"
                                        placeholder="Ej. Coca-Cola 1.5L Original"
                                        type="text"
                                    />
                                </label>
                                <label className="flex flex-col gap-2">
                                    <span className="text-sm text-slate-700">Descripción</span>
                                    <textarea
                                        value={description}
                                        onChange={(e) => setDescription(e.target.value)}
                                        className="w-full rounded-lg border-slate-200 bg-slate-50 text-slate-900 focus:ring-2 focus:ring-primary focus:border-primary min-h-[100px] p-4 placeholder:text-gray-400"
                                        placeholder="Añade detalles sobre el producto, ingredientes, o notas internas..."
                                    ></textarea>
                                </label>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                                    <label className="flex flex-col gap-2 relative">
                                        <span className="text-sm text-slate-700">Categoría</span>
                                        <select
                                            value={category}
                                            onChange={(e) => setCategory(e.target.value)}
                                            className="w-full rounded-lg border-slate-200 bg-slate-50 text-slate-900 focus:ring-2 focus:ring-primary focus:border-primary h-12 px-4 appearance-none"
                                        >
                                            <option disabled value="">Seleccionar categoría</option>
                                            {PRODUCT_CATEGORIES.map(cat => (
                                                <option key={cat.id} value={cat.id}>{cat.id}</option>
                                            ))}
                                        </select>
                                        <div className="absolute right-4 top-[38px] pointer-events-none text-gray-400">
                                            <span className="material-symbols-outlined">expand_more</span>
                                        </div>
                                    </label>
                                    <div className="flex flex-col gap-2">
                                        <div className="flex items-center justify-between">
                                            <span className="text-sm text-slate-700">Código de Barras</span>
                                            <div className="flex bg-slate-100 p-0.5 rounded-lg">
                                                <button
                                                    onClick={() => {
                                                        setSkuMode('manual');
                                                        setBarcode(""); // Clear on manual switch if desired, or keep it. Let's clear to avoid confusion if they switch back and forth.
                                                    }}
                                                    className={`px-2 py-0.5 text-xs font-medium rounded-md transition-all ${skuMode === 'manual' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                                                >
                                                    Manual
                                                </button>
                                                <button
                                                    onClick={() => {
                                                        setSkuMode('auto');
                                                        // Generate immediately
                                                        const randomSuffix = Math.floor(100000 + Math.random() * 900000);
                                                        setBarcode(`SKU-${randomSuffix}`);
                                                    }}
                                                    className={`px-2 py-0.5 text-xs font-medium rounded-md transition-all ${skuMode === 'auto' ? 'bg-white text-primary shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                                                >
                                                    Auto
                                                </button>
                                            </div>
                                        </div>
                                        <div className="relative flex items-center">
                                            <span className={`absolute left-3 material-symbols-outlined text-[20px] ${skuMode === 'auto' ? 'text-primary' : 'text-gray-400'}`}>
                                                {skuMode === 'auto' ? 'autorenew' : 'qr_code_scanner'}
                                            </span>
                                            <input
                                                value={barcode}
                                                onChange={(e) => setBarcode(e.target.value)}
                                                disabled={skuMode === 'auto'}
                                                readOnly={skuMode === 'auto'}
                                                autoFocus={skuMode === 'manual'}
                                                className={`w-full rounded-lg border bg-slate-50 focus:ring-2 focus:ring-primary focus:border-primary h-12 pl-10 pr-4 font-mono transition-colors ${skuMode === 'auto' ? 'border-primary/30 text-primary font-bold' : 'border-slate-200 text-slate-900 placeholder:text-slate-400'}`}
                                                placeholder={skuMode === 'manual' ? "Haz clic aquí y escanea el código..." : "Automático"}
                                                type="text"
                                            />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                    {/* Pricing & Inventory Card */}
                    <div className="bg-white rounded-xl shadow-sm p-6 border border-slate-200">
                        <div className="flex items-center gap-3 mb-6 pb-4 border-b border-slate-100">
                            <div className="p-2 bg-slate-100 rounded-lg">
                                <span className="material-symbols-outlined text-primary">payments</span>
                            </div>
                            <div>
                                <h2 className="text-lg text-slate-900">Precios e Inventario</h2>
                                <p className="text-sm text-slate-400">Define los costos y el stock inicial.</p>
                            </div>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-5">
                            <label className="flex flex-col gap-2">
                                <span className="text-sm text-slate-700">Precio de Costo ($)</span>
                                <input
                                    value={costPrice}
                                    onChange={(e) => setCostPrice(e.target.value)}
                                    className="w-full rounded-lg border-slate-200 bg-slate-50 text-slate-900 focus:ring-2 focus:ring-primary focus:border-primary h-12 px-4 font-medium"
                                    placeholder="0.00"
                                    step="0.01"
                                    type="number"
                                />
                            </label>
                            <label className="flex flex-col gap-2">
                                <span className="text-sm text-slate-700">Precio de Venta ($)</span>
                                <div className="relative">
                                    <input
                                        value={salePrice}
                                        onChange={(e) => setSalePrice(e.target.value)}
                                        className="w-full rounded-lg border-slate-200 bg-slate-50 text-slate-900 focus:ring-2 focus:ring-primary focus:border-primary h-12 px-4 text-lg"
                                        placeholder="0.00"
                                        step="0.01"
                                        type="number"
                                    />
                                    <div className="absolute right-3 top-1/2 -translate-y-1/2 px-2 py-0.5 bg-green-100 text-green-700 text-xs rounded hidden md:block">
                                        Margen: {margin.toFixed(1)}%
                                    </div>
                                </div>
                            </label>

                        </div>
                        <div className="mt-5 border-t border-slate-100 pt-5">
                            <h3 className="text-sm text-slate-900 mb-3 block">Otros Impuestos</h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                                <label className="flex flex-col gap-2">
                                    <div className="flex justify-between">
                                        <span className="text-sm text-slate-700">ICA (Industria y Comercio)</span>
                                        <span className="text-xs text-slate-400">Por mil (‰)</span>
                                    </div>
                                    <div className="relative">
                                        <input
                                            value={icaRate}
                                            onChange={(e) => setIcaRate(e.target.value)}
                                            className="w-full rounded-lg border-slate-200 bg-slate-50 text-slate-900 focus:ring-2 focus:ring-primary focus:border-primary h-12 px-4"
                                            placeholder="Ej. 11.04"
                                            type="number"
                                            step="0.01"
                                        />
                                        <div className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 font-medium">‰</div>
                                    </div>
                                </label>
                                <div className="flex flex-col gap-2">
                                    <span className="text-sm text-slate-700">Impuesto a la Bolsa</span>
                                    <div className={`p-3 rounded-lg border transition-colors ${hasBagTax ? 'bg-primary/5 border-primary/30' : 'bg-slate-50 border-slate-200'}`}>
                                        <label className="flex items-center gap-3 cursor-pointer mb-2">
                                            <input
                                                type="checkbox"
                                                checked={hasBagTax}
                                                onChange={(e) => setHasBagTax(e.target.checked)}
                                                className="w-5 h-5 text-primary rounded border-gray-300 focus:ring-primary"
                                            />
                                            <span className="text-slate-800">Aplica Impuesto Nacional</span>
                                        </label>
                                        {hasBagTax && (
                                            <div className="pl-8">
                                                <div className="relative">
                                                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500">$</span>
                                                    <input
                                                        value={bagTaxValue}
                                                        onChange={(e) => setBagTaxValue(e.target.value)}
                                                        className="w-full rounded-md border-slate-300 text-sm h-9 pl-6"
                                                        placeholder="Valor"
                                                        type="number"
                                                    />
                                                </div>
                                                <p className="text-[10px] text-slate-500 mt-1">Valor por unidad (Ej. $60)</p>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div className="mt-5 border-t border-slate-100 pt-5 grid grid-cols-1 md:grid-cols-2 gap-5">
                            <label className="flex flex-col gap-2">
                                <span className="text-sm text-slate-700">Tipo de Impuesto</span>
                                <div className="flex gap-2">
                                    <select
                                        value={taxType}
                                        onChange={(e) => setTaxType(e.target.value as "IVA" | "ICO")}
                                        className="w-1/3 rounded-lg border-slate-200 bg-slate-50 text-slate-900 focus:ring-2 focus:ring-primary focus:border-primary h-12 px-4 appearance-none"
                                    >
                                        <option value="IVA">IVA</option>
                                        <option value="ICO">Impoconsumo</option>
                                    </select>
                                    <select
                                        value={tax}
                                        onChange={(e) => setTax(e.target.value)}
                                        className="w-2/3 rounded-lg border-slate-200 bg-slate-50 text-slate-900 focus:ring-2 focus:ring-primary focus:border-primary h-12 px-4 appearance-none"
                                    >
                                        {taxType === 'IVA' ? (
                                            <>
                                                <option value="19">19% (General)</option>
                                                <option value="5">5% (Reducido)</option>
                                                <option value="0">0% (Exento)</option>
                                                <option value="-1">Excluido</option>
                                            </>
                                        ) : (
                                            <>
                                                <option value="8">8% (General)</option>
                                                <option value="4">4% (Telefonía)</option>
                                                <option value="0">0% (Exento)</option>
                                            </>
                                        )}
                                    </select>
                                </div>
                            </label>
                            <label className="flex flex-col gap-2">
                                <span className="text-sm text-slate-700">Cantidad Inicial</span>
                                <input
                                    value={stock}
                                    onChange={(e) => setStock(e.target.value)}
                                    className="w-full rounded-lg border-slate-200 bg-slate-50 text-slate-900 focus:ring-2 focus:ring-primary focus:border-primary h-12 px-4"
                                    placeholder="0"
                                    type="number"
                                />
                            </label>
                        </div>
                    </div>
                </div>
                {/* Right Column: Image Upload & Config */}
                <div className="flex flex-col gap-6 lg:w-1/3">
                    {/* Status Card (New) */}
                    <div className="bg-white rounded-xl shadow-sm p-6 border border-slate-200">
                        <div className="flex items-center gap-3 mb-5 border-b border-slate-100 pb-3">
                            <span className="material-symbols-outlined text-primary">toggle_on</span>
                            <h2 className="text-base text-slate-900">Estado</h2>
                        </div>
                        <div className="flex flex-col gap-4">
                            <label className={`flex items-center justify-between p-4 rounded-lg border cursor-pointer transition-all ${status === 'Activo' ? 'border-green-200 bg-green-50' : 'border-slate-200 bg-white'}`}>
                                <span className="text-slate-700">Activo</span>
                                <input type="radio" checked={status === 'Activo'} onChange={() => setStatus('Activo')} name="status" className="w-5 h-5 text-green-600 focus:ring-green-500" />
                            </label>
                            <label className={`flex items-center justify-between p-4 rounded-lg border cursor-pointer transition-all ${status === 'Inactivo' ? 'border-red-200 bg-red-50' : 'border-slate-200 bg-white'}`}>
                                <span className="text-slate-700">Inactivo</span>
                                <input type="radio" checked={status === 'Inactivo'} onChange={() => setStatus('Inactivo')} name="status" className="w-5 h-5 text-red-600 focus:ring-red-500" />
                            </label>
                        </div>
                    </div>

                    {/* Configuration Card */}
                    <div className="bg-white rounded-xl shadow-sm p-6 border border-slate-200">
                        <div className="flex items-center gap-3 mb-5 border-b border-slate-100 pb-3">
                            <span className="material-symbols-outlined text-primary">tune</span>
                            <h2 className="text-base text-slate-900">Configuración</h2>
                        </div>
                        <div className="flex flex-col gap-5">
                            <label className="flex flex-col gap-2">
                                <span className="text-sm text-slate-700">Unidad de Medida</span>
                                <select
                                    value={unit}
                                    onChange={(e) => setUnit(e.target.value)}
                                    className="w-full rounded-lg border-slate-200 bg-slate-50 text-slate-900 focus:ring-2 focus:ring-primary focus:border-primary h-11 px-3 text-sm appearance-none"
                                >
                                    <option value="und">Unidad (und)</option>
                                    <option value="kg">Kilogramo (kg)</option>
                                    <option value="lb">Libra (lb)</option>
                                    <option value="lt">Litro (lt)</option>
                                    <option value="mt">Metro (mt)</option>
                                </select>
                            </label>

                            <div className="p-4 rounded-lg border border-slate-200 bg-slate-50">
                                <label className="flex flex-col gap-2">
                                    <div className="flex items-center gap-2 mb-1">
                                        <span className="material-symbols-outlined text-amber-500 text-[20px]">notification_important</span>
                                        <span className="text-sm text-slate-900">Alerta de Stock Bajo</span>
                                    </div>
                                    <p className="text-xs text-slate-500 mb-2">Notificar cuando el inventario sea menor a:</p>
                                    <div className="flex items-center gap-2">
                                        <input
                                            value={minStock}
                                            onChange={(e) => setMinStock(e.target.value)}
                                            className="w-full rounded-lg border-slate-200 bg-white text-slate-900 focus:ring-2 focus:ring-primary focus:border-primary h-10 px-3 text-center"
                                            type="number"
                                            min="0"
                                        />
                                        <span className="text-sm text-slate-500">{unit}</span>
                                    </div>
                                </label>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
