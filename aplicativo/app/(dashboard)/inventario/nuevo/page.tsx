"use client";

import { useState, useRef, useTransition, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { PRODUCT_CATEGORIES } from "@/lib/constants";
import { useToast } from "@/components/ui/toast";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { productSchema, ProductFormValues } from "@/lib/schemas/product";
import { createProduct } from "@/app/actions/products";

export default function CreateProductPage() {
    const router = useRouter();
    const { toast } = useToast();
    const [isPending, startTransition] = useTransition();
    const nameInputRef = useRef<HTMLInputElement>(null);

    // Determines if we redirect or reset after save
    const [saveAndCreateAnother, setSaveAndCreateAnother] = useState(false);

    const form = useForm({
        resolver: zodResolver(productSchema),
        defaultValues: {
            name: "",
            description: "",
            category: "",
            skuMode: "manual",
            barcode: "",
            costPrice: 0,
            salePrice: 0,
            stock: 0,
            minStock: 5,
            unit: "und",
            status: "Activo",

            // New DIAN Defaults
            priceIncludesTax: false,
            isService: false,
            fiscalClassification: "gravado",
            taxes: [{ code: '01', name: 'IVA 19%', rate: 19, type: 'percentage' }], // Default IVA 19
        },
    });

    const { register, handleSubmit, watch, setValue, setError, setFocus, trigger, getValues, formState: { errors } } = form;

    // Watch values for dynamic UI
    const skuMode = watch("skuMode") as "manual" | "auto";
    const barcode = watch("barcode") as string;
    const salePrice = watch("salePrice") as number;
    const costPrice = watch("costPrice") as number;
    const priceIncludesTax = watch("priceIncludesTax");
    const fiscalClassification = watch("fiscalClassification");
    const status = watch("status") as "Activo" | "Inactivo";

    // Audio/Haptic Feedback Helper (Client-side effect)
    const triggerSuccessFeedback = () => {
        if (typeof navigator !== 'undefined' && navigator.vibrate) navigator.vibrate(15);
        try {
            const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
            const oscillator = audioCtx.createOscillator();
            const gainNode = audioCtx.createGain();
            oscillator.connect(gainNode);
            gainNode.connect(audioCtx.destination);
            oscillator.type = 'sine';
            oscillator.frequency.setValueAtTime(880, audioCtx.currentTime);
            gainNode.gain.setValueAtTime(0.1, audioCtx.currentTime);
            oscillator.start();
            oscillator.stop(audioCtx.currentTime + 0.1);
        } catch (e) { }
    };

    const onSubmit = (data: ProductFormValues) => {
        startTransition(async () => {
            // Server Action Call
            const result = await createProduct(data);

            if (result.success) {
                toast(result.message || "Producto creado", "success");
                triggerSuccessFeedback();

                if (saveAndCreateAnother) {
                    // Reset, keep checking 'skuMode' choice usually? Or full reset.
                    // Full reset is safer to avoid accidental duplication.
                    form.reset({
                        skuMode: "manual",
                        barcode: "",
                        name: "",
                        description: "",
                        category: "",
                        costPrice: 0,
                        salePrice: 0,
                        stock: 0,
                        priceIncludesTax: false,
                        fiscalClassification: "gravado",
                        taxes: [{ code: '01', name: 'IVA 19%', rate: 19, type: 'percentage' }],
                    });
                    // Re-focus name
                    setTimeout(() => setFocus("name"), 100);
                } else {
                    router.push("/inventario");
                }
            } else {
                toast(result.message || "Error al guardar", "error");
                // Check for field specific errors
                if (result.errors) {
                    Object.entries(result.errors).forEach(([field, messages]) => {
                        setError(field as keyof ProductFormValues, {
                            type: "server",
                            message: messages[0]
                        });
                    });
                }
            }
        });
    };

    // Auto-Generate SKU Logic
    const handleAutoSku = () => {
        setValue("skuMode", "auto");
        const randomSuffix = Math.floor(100000 + Math.random() * 900000);
        setValue("barcode", `SKU-${randomSuffix}`);
        trigger("barcode");
    };

    // Calculate Margin for display
    const taxes = watch("taxes") || [];
    const mainIva = taxes.find(t => t.code === '01');
    const ivaRate = mainIva ? mainIva.rate : 0;

    // Net Price Calculation (Price used for margin)
    const netPrice = priceIncludesTax
        ? (salePrice / (1 + (ivaRate / 100)))
        : salePrice;

    // Margin = (Net Income - Cost) / Net Income (Commercial Margin)
    const margin = netPrice > 0 ? ((netPrice - costPrice) / netPrice) * 100 : 0;

    return (
        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col h-screen bg-slate-50/50 font-display overflow-hidden">
            {/* Header */}
            <header className="h-16 flex items-center justify-between px-6 lg:px-10 py-4 bg-white/80 backdrop-blur-md border-b border-slate-200 z-20 shrink-0 sticky top-0">
                <div className="flex flex-col">
                    <div className="flex items-center text-xs text-slate-500 gap-2 mb-1">
                        <Link href="/inventario" className="hover:text-slate-900 transition-colors">Productos</Link>
                        <span className="material-symbols-outlined text-[12px] text-slate-400">chevron_right</span>
                        <span className="font-bold text-[#13ec80]">Nuevo</span>
                    </div>
                    <h1 className="text-xl lg:text-2xl font-black text-slate-900 tracking-tight leading-none flex items-center gap-2">
                        <span className="material-symbols-outlined text-[#13ec80]">add_circle</span>
                        Crear Producto
                    </h1>
                </div>
                <div className="flex items-center gap-3">
                    <Link href="/inventario" className="hidden md:flex px-5 py-2.5 rounded-xl border border-slate-200 text-slate-600 font-bold hover:bg-slate-50 transition-colors text-sm">
                        Cancelar
                    </Link>
                    <button
                        type="submit"
                        disabled={isPending}
                        onClick={() => setSaveAndCreateAnother(true)}
                        className="hidden md:flex px-5 py-2.5 rounded-xl bg-slate-100 text-slate-600 font-bold hover:bg-slate-200 transition-colors text-sm"
                    >
                        {isPending && saveAndCreateAnother ? "Guardando..." : "Guardar y Otro"}
                    </button>
                    <button
                        type="submit"
                        disabled={isPending}
                        onClick={() => setSaveAndCreateAnother(false)}
                        className="px-6 py-2.5 rounded-xl bg-[#13ec80] hover:bg-[#10d673] text-slate-900 font-black shadow-lg shadow-green-500/20 hover:shadow-green-500/40 transition-all transform hover:-translate-y-0.5 active:translate-y-0 text-sm flex items-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed disabled:transform-none"
                    >
                        {isPending && !saveAndCreateAnother ? (
                            <span className="material-symbols-outlined animate-spin text-[20px]">progress_activity</span>
                        ) : (
                            <span className="material-symbols-outlined text-[20px]">save</span>
                        )}
                        <span>{isPending && !saveAndCreateAnother ? "Guardando..." : "Guardar Producto"}</span>
                    </button>
                </div>
            </header>

            {/* Scrollable Form Area */}
            <div className="flex-1 overflow-y-auto custom-scrollbar bg-slate-50/50">
                <div className="max-w-7xl mx-auto px-6 lg:px-10 py-8">
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 pb-24">

                        {/* LEFT COLUMN (Identity & Inventory) */}
                        <div className="lg:col-span-7 flex flex-col gap-8">

                            {/* Card 1: Identity */}
                            <section className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
                                <div className="p-6 border-b border-slate-100 flex items-center gap-3 bg-slate-50/50">
                                    <div className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center text-blue-600 shadow-sm border border-blue-100">
                                        <span className="material-symbols-outlined">fingerprint</span>
                                    </div>
                                    <div>
                                        <h2 className="text-lg font-bold text-slate-900">Identificación</h2>
                                        <p className="text-sm text-slate-500">Datos básicos del producto</p>
                                    </div>
                                </div>
                                <div className="p-6 space-y-6">
                                    {/* Name */}
                                    <div className="space-y-2">
                                        <label className="text-sm font-bold text-slate-700 flex justify-between">
                                            Nombre del Producto <span className="text-red-500">*</span>
                                        </label>
                                        <input
                                            {...register("name")}
                                            className={`w-full h-12 px-4 rounded-xl border bg-slate-50/50 text-slate-900 focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all font-bold text-base placeholder:font-normal placeholder:text-slate-400 ${errors.name ? 'border-red-500 bg-red-50' : 'border-slate-200'}`}
                                            placeholder="Ej. Arroz Diana 500g"
                                        />
                                        {errors.name && <p className="text-xs text-red-500 font-bold mt-1">{errors.name.message}</p>}
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        {/* Category */}
                                        <div className="space-y-2">
                                            <label className="text-sm font-bold text-slate-700">Categoría <span className="text-red-500">*</span></label>
                                            <div className="relative">
                                                <div className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none">
                                                    <span className="material-symbols-outlined text-[20px]">category</span>
                                                </div>
                                                <select
                                                    {...register("category")}
                                                    className={`w-full h-12 pl-10 pr-10 rounded-xl border bg-slate-50/50 text-slate-900 focus:ring-2 focus:ring-primary/20 focus:border-primary appearance-none transition-all ${errors.category ? 'border-red-500' : 'border-slate-200'}`}
                                                >
                                                    <option value="">Seleccionar...</option>
                                                    {PRODUCT_CATEGORIES.map(cat => (
                                                        <option key={cat.id} value={cat.id}>{cat.id}</option>
                                                    ))}
                                                </select>
                                                <div className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none">
                                                    <span className="material-symbols-outlined text-[20px]">expand_more</span>
                                                </div>
                                            </div>
                                            {errors.category && <p className="text-xs text-red-500 font-medium">{errors.category.message}</p>}
                                        </div>

                                        {/* Barcode */}
                                        <div className="space-y-2">
                                            <label className="text-sm font-bold text-slate-700 flex justify-between items-center">
                                                <span>Código de Barras <span className="text-red-500">*</span></span>
                                                <div className="flex bg-slate-100 rounded-lg p-0.5">
                                                    <button
                                                        type="button"
                                                        onClick={() => { setValue("skuMode", "manual"); setValue("barcode", ""); setTimeout(() => setFocus("barcode"), 50); }}
                                                        className={`px-2 py-0.5 text-[10px] font-bold rounded-md transition-all ${skuMode === 'manual' ? 'bg-white shadow-sm text-slate-900' : 'text-slate-400'}`}
                                                    >Manual</button>
                                                    <button
                                                        type="button"
                                                        onClick={handleAutoSku}
                                                        className={`px-2 py-0.5 text-[10px] font-bold rounded-md transition-all ${skuMode === 'auto' ? 'bg-[#13ec80] shadow-sm text-slate-900' : 'text-slate-400'}`}
                                                    >Auto</button>
                                                </div>
                                            </label>
                                            <div className="relative">
                                                <div className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none">
                                                    <span className="material-symbols-outlined text-[20px]">{skuMode === 'auto' ? 'qr_code_2' : 'barcode_scanner'}</span>
                                                </div>
                                                <input
                                                    {...register("barcode")}
                                                    onKeyDown={(e) => {
                                                        if (e.key === 'Enter') {
                                                            e.preventDefault();
                                                            if (barcode && barcode.length > 2) {
                                                                triggerSuccessFeedback();
                                                                toast("Código escaneado", "success");
                                                                setTimeout(() => setFocus("name"), 100);
                                                            }
                                                        }
                                                    }}
                                                    readOnly={skuMode === 'auto'}
                                                    className={`w-full h-12 pl-10 pr-4 rounded-xl border bg-slate-50/50 focus:ring-2 focus:ring-primary/20 focus:border-primary font-mono transition-all ${skuMode === 'auto' ? 'text-slate-500 bg-slate-100 italic' : 'text-slate-900'}`}
                                                    placeholder="Escanea el código..."
                                                />
                                            </div>
                                            {errors.barcode && <p className="text-xs text-red-500 font-medium mt-1">{errors.barcode.message}</p>}
                                        </div>
                                    </div>

                                    {/* Description */}
                                    <div className="space-y-2">
                                        <label className="text-sm font-bold text-slate-700">Descripción <span className="text-red-500">*</span></label>
                                        <textarea
                                            {...register("description")}
                                            className={`w-full h-24 p-4 rounded-xl border bg-slate-50/50 text-slate-900 focus:ring-2 focus:ring-primary/20 focus:border-primary resize-none placeholder:text-slate-400 ${errors.description ? 'border-red-500 bg-red-50' : 'border-slate-200'}`}
                                            placeholder="Detalles adicionales..."
                                        ></textarea>
                                        {errors.description && <p className="text-xs text-red-500 font-medium mt-1">{errors.description.message}</p>}
                                    </div>
                                </div>
                            </section>

                            {/* Card 2: Inventory */}
                            <section className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
                                <div className="p-6 border-b border-slate-100 flex items-center gap-3 bg-slate-50/50">
                                    <div className="w-10 h-10 rounded-full bg-amber-50 flex items-center justify-center text-amber-600 shadow-sm border border-amber-100">
                                        <span className="material-symbols-outlined">inventory_2</span>
                                    </div>
                                    <div>
                                        <h2 className="text-lg font-bold text-slate-900">Inventario</h2>
                                        <p className="text-sm text-slate-500">Control de existencias</p>
                                    </div>
                                </div>
                                <div className="p-6">
                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                        <div className="space-y-2">
                                            <label className="text-sm font-bold text-slate-700">Stock Inicial</label>
                                            <div className="relative">
                                                <input
                                                    type="number"
                                                    {...register("stock")}
                                                    className="w-full h-12 pl-4 pr-12 rounded-xl border border-slate-200 bg-slate-50/50 text-slate-900 focus:ring-2 focus:ring-primary/20 focus:border-primary font-bold"
                                                    placeholder="0"
                                                />
                                            </div>
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-sm font-bold text-slate-700">Stock Mínimo</label>
                                            <div className="relative">
                                                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 material-symbols-outlined text-[18px]">notification_important</span>
                                                <input
                                                    type="number"
                                                    {...register("minStock")}
                                                    className="w-full h-12 pl-10 pr-4 rounded-xl border border-slate-200 bg-slate-50/50 text-slate-900 focus:ring-2 focus:ring-primary/20 focus:border-primary"
                                                    placeholder="5"
                                                />
                                            </div>
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-sm font-bold text-slate-700">Unidad</label>
                                            <select
                                                {...register("unit")}
                                                className="w-full h-12 px-4 rounded-xl border border-slate-200 bg-slate-50/50 text-slate-900 focus:ring-2 focus:ring-primary/20 focus:border-primary appearance-none"
                                            >
                                                <option value="und">Unidad</option>
                                                <option value="kg">Kilogramo</option>
                                                <option value="lb">Libra</option>
                                                <option value="lt">Litro</option>
                                            </select>
                                        </div>
                                    </div>
                                </div>
                            </section>
                        </div>

                        {/* RIGHT COLUMN (Pricing & Config) */}
                        <div className="lg:col-span-5 flex flex-col gap-8">

                            {/* Card 3: Configuración Fiscal (DIAN) */}
                            <section className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
                                <div className="p-6 border-b border-slate-100 flex items-center gap-3 bg-slate-50/50">
                                    <div className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center text-blue-600 shadow-sm border border-blue-100">
                                        <span className="material-symbols-outlined">account_balance</span>
                                    </div>
                                    <div>
                                        <h2 className="text-lg font-bold text-slate-900">Impuestos (DIAN)</h2>
                                        <p className="text-sm text-slate-500">Clasificación tributaria obligatoria</p>
                                    </div>
                                </div>

                                <div className="p-6 space-y-6">
                                    {/* 1. Fiscal Classification */}
                                    <div className="space-y-3">
                                        <label className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-2">
                                            Clasificación del Producto <span className="text-red-500">*</span>
                                        </label>
                                        <div className="grid grid-cols-2 gap-3">
                                            {[
                                                { value: "gravado", label: "Gravado (IVA)" },
                                                { value: "exento", label: "Exento (0%)" },
                                                { value: "excluido", label: "Excluido" },
                                                { value: "no_gravado", label: "No Gravado" }
                                            ].map((option) => (
                                                <label key={option.value} className={`relative flex items-center justify-center p-3 rounded-xl border cursor-pointer transition-all ${form.watch("fiscalClassification") === option.value
                                                    ? "bg-blue-50 border-blue-200 text-blue-700 font-bold shadow-sm"
                                                    : "bg-white border-slate-200 text-slate-600 hover:bg-slate-50"
                                                    }`}>
                                                    <input
                                                        type="radio"
                                                        value={option.value}
                                                        {...register("fiscalClassification")}
                                                        className="hidden"
                                                    />
                                                    <span className="text-xs text-center">{option.label}</span>
                                                </label>
                                            ))}
                                        </div>
                                    </div>

                                    {/* 2. IVA Selection */}
                                    {(form.watch("fiscalClassification") === 'gravado') && (
                                        <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
                                            <p className="text-xs font-bold text-slate-500 uppercase mb-3 text-center">Selecciona la Tarifa de IVA</p>
                                            <div className="flex justify-center gap-4">
                                                {[
                                                    { rate: 19, label: "19% (General)" },
                                                    { rate: 5, label: "5% (Reducido)" }
                                                ].map((tax) => (
                                                    <label key={tax.rate} className="flex items-center gap-2 cursor-pointer bg-white px-4 py-2 rounded-lg border border-slate-200 shadow-sm hover:border-blue-300 transition-all">
                                                        <input type="radio" value={tax.rate} name="iva_selector"
                                                            defaultChecked={tax.rate === 19}
                                                            onChange={() => setValue("taxes", [{ code: '01', name: `IVA ${tax.rate}%`, rate: tax.rate, type: 'percentage' }])}
                                                            className="w-4 h-4 text-primary"
                                                        />
                                                        <span className="text-sm font-bold text-slate-700">{tax.label}</span>
                                                    </label>
                                                ))}
                                            </div>
                                        </div>
                                    )}

                                    {/* 3. Additional Taxes */}
                                    <div className="space-y-3 pt-2">
                                        <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Impuestos Especiales</p>
                                        <div className="space-y-2">
                                            <label className="flex items-center gap-3 p-3 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 cursor-pointer transition-colors">
                                                <input type="checkbox" className="w-5 h-5 rounded text-orange-500 focus:ring-orange-500"
                                                    onChange={(e) => {
                                                        const current = form.getValues("taxes") || [];
                                                        if (e.target.checked) setValue("taxes", [...current, { code: '04', name: 'INC 8%', rate: 8, type: 'percentage' }]);
                                                        else setValue("taxes", current.filter(t => t.code !== '04'));
                                                    }}
                                                />
                                                <div>
                                                    <span className="text-sm font-bold text-slate-700 block">Impuesto al Consumo (INC)</span>
                                                    <span className="text-xs text-slate-400">Para restaurantes y bares (8%)</span>
                                                </div>
                                            </label>

                                            <label className="flex items-center gap-3 p-3 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 cursor-pointer transition-colors">
                                                <input type="checkbox" className="w-5 h-5 rounded text-purple-500 focus:ring-purple-500"
                                                    onChange={(e) => {
                                                        const current = form.getValues("taxes") || [];
                                                        if (e.target.checked) setValue("taxes", [...current, { code: '22', name: 'ICUI 10%', rate: 10, type: 'percentage' }]);
                                                        else setValue("taxes", current.filter(t => t.code !== '22'));
                                                    }}
                                                />
                                                <div>
                                                    <span className="text-sm font-bold text-slate-700 block">Impuesto Saludable (ICUI)</span>
                                                    <span className="text-xs text-slate-400">Ultraprocesados (Snacks, Embutidos)</span>
                                                </div>
                                            </label>
                                            <label className="flex items-center gap-3 p-3 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 cursor-pointer transition-colors">
                                                <input type="checkbox" className="w-5 h-5 rounded text-pink-500 focus:ring-pink-500"
                                                    onChange={(e) => {
                                                        const current = form.getValues("taxes") || [];
                                                        if (e.target.checked) setValue("taxes", [...current, { code: '23', name: 'IBUA', rate: 0, type: 'fixed' }]);
                                                        else setValue("taxes", current.filter(t => t.code !== '23'));
                                                    }}
                                                />
                                                <div>
                                                    <span className="text-sm font-bold text-slate-700 block">Bebidas Azucaradas (IBUA)</span>
                                                    <span className="text-xs text-slate-400">Refrescos y gaseosas</span>
                                                </div>
                                            </label>
                                        </div>
                                    </div>
                                </div>
                            </section>

                            {/* Card 4: Calculadora de Precios (Separated) */}
                            <section className="bg-gradient-to-br from-[#13ec80]/10 to-transparent rounded-2xl shadow-lg shadow-green-500/10 border border-[#13ec80]/30 overflow-hidden relative">
                                <div className="absolute top-0 right-0 w-32 h-32 bg-[#13ec80]/10 rounded-bl-full pointer-events-none blur-2xl"></div>

                                <div className="p-6 border-b border-[#13ec80]/20 flex items-center gap-3 bg-white/50 backdrop-blur-sm">
                                    <div className="w-10 h-10 rounded-full bg-[#13ec80]/20 flex items-center justify-center text-green-700 shadow-sm border border-[#13ec80]/30">
                                        <span className="material-symbols-outlined">calculate</span>
                                    </div>
                                    <div>
                                        <h2 className="text-lg font-black text-slate-900">Calculadora de Precio</h2>
                                        <p className="text-sm text-slate-600 font-medium">Define tu rentabilidad fácilmente</p>
                                    </div>
                                </div>

                                <div className="p-6 space-y-6">

                                    {/* Helper Text */}
                                    <div className="bg-blue-50 text-blue-800 text-xs p-3 rounded-lg border border-blue-100 flex items-start gap-2">
                                        <span className="material-symbols-outlined text-[16px] mt-0.5">info</span>
                                        <p>
                                            El margen se calcula sobre el precio <strong>antes de impuestos</strong>.
                                            Si el precio incluye IVA, el sistema lo descuenta primero para mostrarte tu ganancia real.
                                        </p>
                                    </div>

                                    {/* Cost Input */}
                                    <div className="space-y-2">
                                        <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">1. Costo de Compra (Base)</label>
                                        <div className="relative group">
                                            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 font-bold">$</span>
                                            <input
                                                type="number"
                                                step="0.01"
                                                {...register("costPrice")}
                                                className={`w-full h-12 pl-7 pr-3 rounded-xl border bg-white text-slate-700 focus:ring-2 focus:ring-primary/20 font-bold text-lg ${errors.costPrice ? 'border-red-500 bg-red-50' : 'border-slate-200'}`}
                                                placeholder="0"
                                            />
                                        </div>
                                        {errors.costPrice && <p className="text-xs text-red-500 font-medium mt-1">{errors.costPrice.message}</p>}
                                    </div>

                                    {/* Profit Margin Control */}
                                    <div className="space-y-2">
                                        <div className="flex justify-between items-center">
                                            <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">2. Margen de Ganancia Deseado</label>
                                            <span className={`text-xs font-bold px-2 py-0.5 rounded-md ${margin < 0 ? 'bg-red-50 text-red-600' : 'bg-green-50 text-green-600'}`}>
                                                Real: {margin.toFixed(1)}%
                                            </span>
                                        </div>
                                        <div className="flex gap-2">
                                            {[15, 20, 30, 40, 50].map(pct => (
                                                <button
                                                    key={pct}
                                                    type="button"
                                                    onClick={() => {
                                                        const cost = Number(form.getValues("costPrice")) || 0;
                                                        if (cost > 0) {
                                                            // Target Net Price = Cost / (1 - Margin)
                                                            const targetNetPrice = cost / (1 - (pct / 100));

                                                            // If price includes Tax, add Tax to Net Price to get Sale Price
                                                            // Otherwise, Sale Price is Net Price
                                                            const isIncTax = form.getValues("priceIncludesTax");
                                                            const currentIva = (form.getValues("taxes")?.find((t: any) => t.code === '01')?.rate) || 0;

                                                            const finalPrice = isIncTax
                                                                ? targetNetPrice * (1 + (currentIva / 100))
                                                                : targetNetPrice;

                                                            setValue("salePrice", Math.round(finalPrice / 50) * 50); // Round to nearest 50 for prettier prices
                                                        }
                                                    }}
                                                    className="flex-1 py-2 text-xs font-bold bg-white border border-slate-200 rounded-lg hover:border-[#13ec80] hover:text-[#13ec80] hover:bg-green-50 transition-all text-slate-500"
                                                >
                                                    {pct}%
                                                </button>
                                            ))}
                                        </div>
                                    </div>

                                    <div className="relative flex items-center gap-4">
                                        <div className="h-px bg-slate-200 flex-1"></div>
                                        <span className="text-xs font-bold text-slate-400 uppercase">Resultado</span>
                                        <div className="h-px bg-slate-200 flex-1"></div>
                                    </div>

                                    {/* Price Input (Result) */}
                                    <div className="space-y-2">
                                        <div className="flex justify-between items-center mb-1">
                                            <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">3. Precio de Venta (Público)</label>
                                            <label className="flex items-center gap-2 cursor-pointer">
                                                <input type="checkbox" {...register("priceIncludesTax")} className="w-3 h-3 rounded text-[#13ec80] focus:ring-[#13ec80]" />
                                                <span className="text-[10px] font-bold text-slate-500 uppercase">¿Incluye Impuestos?</span>
                                            </label>
                                        </div>

                                        <div className="relative group shadow-lg shadow-green-500/20 rounded-xl">
                                            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-green-600 font-bold text-xl">$</span>
                                            <input
                                                type="number"
                                                step="50"
                                                {...register("salePrice")}
                                                className={`w-full h-16 pl-10 pr-4 rounded-xl border-2 bg-white text-slate-900 focus:ring-4 focus:ring-[#13ec80]/20 focus:border-[#13ec80] font-black text-3xl text-right transition-all ${errors.salePrice ? 'border-red-500 bg-red-50' : 'border-[#13ec80]'}`}
                                                placeholder="0"
                                            />
                                            <div className="absolute right-4 bottom-2 text-[10px] text-slate-400 font-bold pointer-events-none">COP</div>
                                        </div>
                                        {errors.salePrice && <p className="text-xs text-red-500 font-bold text-right pt-1">{errors.salePrice.message}</p>}

                                        {/* Tax Breakdown Preview */}
                                        <div className="flex justify-between items-center mt-2 px-1">
                                            {priceIncludesTax && ivaRate > 0 ? (
                                                <>
                                                    <div className="text-xs text-slate-500 font-medium">
                                                        Precio Base: <span className="font-bold text-slate-700">{netPrice.toLocaleString('es-CO', { style: 'currency', currency: 'COP', maximumFractionDigits: 0 })}</span>
                                                    </div>
                                                    <div className="text-xs text-slate-400 font-mono">
                                                        + IVA ({ivaRate}%): {((salePrice - netPrice)).toLocaleString('es-CO', { style: 'currency', currency: 'COP', maximumFractionDigits: 0 })}
                                                    </div>
                                                </>
                                            ) : (
                                                <div className="text-xs text-slate-400 italic w-full text-right">
                                                    {fiscalClassification === 'exento' ? 'Producto Exento de IVA' : 'Precio antes de aplicar impuestos'}
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                </div>
                            </section>

                            {/* Card 4: Status */}
                            <section className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
                                <div className="p-4 border-b border-slate-100 bg-slate-50/50">
                                    <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider">Estado del Producto</h2>
                                </div>
                                <div className="p-4">
                                    <div className="flex bg-slate-100 p-1 rounded-xl">
                                        <label className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-lg cursor-pointer transition-all ${status === 'Activo' ? 'bg-white shadow-sm text-green-600 font-bold' : 'text-slate-500 hover:text-slate-700'}`}>
                                            <input type="radio" value="Activo" {...register("status")} className="hidden" />
                                            <span className="material-symbols-outlined text-[18px]">check_circle</span>
                                            Activo
                                        </label>
                                        <label className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-lg cursor-pointer transition-all ${status === 'Inactivo' ? 'bg-white shadow-sm text-slate-900 font-bold' : 'text-slate-500 hover:text-slate-700'}`}>
                                            <input type="radio" value="Inactivo" {...register("status")} className="hidden" />
                                            <span className="material-symbols-outlined text-[18px]">cancel</span>
                                            Inactivo
                                        </label>
                                    </div>
                                </div>
                            </section>
                        </div>

                    </div>
                </div>
            </div>
        </form>
    );
}
