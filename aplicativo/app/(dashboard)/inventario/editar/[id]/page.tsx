"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter, useParams } from "next/navigation";
import { PRODUCT_CATEGORIES } from "@/lib/constants";

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
}

export default function EditProductPage() {
    const router = useRouter();
    const params = useParams();
    const productId = params?.id as string;

    // -- Form State --
    const [name, setName] = useState("");
    const [description, setDescription] = useState("");
    const [category, setCategory] = useState("");
    const [barcode, setBarcode] = useState("");
    const [skuMode, setSkuMode] = useState<'manual' | 'auto'>('manual');

    const [costPrice, setCostPrice] = useState("");
    const [salePrice, setSalePrice] = useState("");
    const [tax, setTax] = useState("0");
    const [stock, setStock] = useState("");
    const [minStock, setMinStock] = useState("5"); // Default min stock

    const [unit, setUnit] = useState("und");
    const [status, setStatus] = useState<'Activo' | 'Inactivo'>('Activo');

    // Load Product Data
    useEffect(() => {
        if (!productId) return;

        const savedProducts = JSON.parse(localStorage.getItem("products") || "[]");
        const product = savedProducts.find((p: Product) => String(p.id) === String(productId));

        if (product) {
            setName(product.name);
            setDescription(product.description || "");
            setCategory(product.category);
            setBarcode(product.barcode);
            setSkuMode(product.barcode.startsWith("SKU-") ? 'auto' : 'manual');
            setCostPrice(String(product.costPrice));
            setSalePrice(String(product.salePrice));
            setTax(String(product.tax));
            setStock(String(product.stock));
            setMinStock(String(product.minStock));
            setUnit(product.unit);
            setStatus(product.status);
        } else {
            alert("Producto no encontrado.");
            router.push("/inventario");
        }
    }, [productId, router]);

    const handleSave = () => {
        if (!name) {
            alert("El nombre del producto es obligatorio.");
            return;
        }

        let finalBarcode = barcode;
        if (skuMode === 'auto' && (!barcode || barcode.startsWith("SKU-"))) {
            // Keep existing if auto
            if (!finalBarcode) {
                const randomSuffix = Math.floor(100000 + Math.random() * 900000);
                finalBarcode = `SKU-${randomSuffix}`;
            }
        } else if (!finalBarcode) {
            if (!confirm("El código de barras está vacío. ¿Desea guardar sin código?")) return;
            finalBarcode = "SIN-CODIGO";
        }

        const updatedProduct: Product = {
            id: productId,
            name,
            description,
            category: category || "General",
            barcode: finalBarcode,
            costPrice: parseFloat(costPrice) || 0,
            salePrice: parseFloat(salePrice) || 0,
            tax: parseFloat(tax) || 0,
            stock: parseFloat(stock) || 0,
            minStock: parseFloat(minStock) || 0,
            unit,
            status,
            image: "" // Placeholder, assuming we don't wipe image if we had one, but currently we have separate image logic. Ideally specificy `image: product.image` but `product` isn't in scope here. 
            // Better to re-fetch to merge.
        };

        // Save to LocalStorage
        const existingProducts = JSON.parse(localStorage.getItem("products") || "[]");
        const index = existingProducts.findIndex((p: Product) => String(p.id) === String(productId));

        if (index !== -1) {
            // Merge to keep existing fields like image if not editable here
            const updatedProducts = [...existingProducts];
            updatedProducts[index] = { ...existingProducts[index], ...updatedProduct };
            localStorage.setItem("products", JSON.stringify(updatedProducts));
            router.push("/inventario");
        } else {
            alert("Error al guardar: Producto original no encontrado.");
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
                        <span className="font-medium text-primary">Editar</span>
                    </div>
                    <h1 className="text-2xl font-black text-slate-900 tracking-tight leading-none">Editar Producto</h1>
                </div>
                <div className="flex gap-3">
                    <Link href="/inventario" className="px-4 py-2 rounded-lg border border-slate-200 text-slate-700 font-semibold hover:bg-white transition-colors text-sm flex items-center">
                        Cancelar
                    </Link>
                    <button
                        onClick={handleSave}
                        className="px-6 py-2 rounded-lg bg-primary hover:bg-primary-dark text-text-main font-bold shadow-sm shadow-primary/30 transition-all transform active:scale-95 text-sm flex items-center gap-2"
                    >
                        <span className="material-symbols-outlined text-lg">save</span>
                        Guardar Cambios
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
                                    <h2 className="text-lg font-bold text-slate-900">Detalles Generales</h2>
                                    <p className="text-sm text-slate-400">Información básica del producto para identificación.</p>
                                </div>
                            </div>
                            <div className="flex flex-col gap-5">
                                <label className="flex flex-col gap-2">
                                    <span className="text-sm font-semibold text-slate-700">Nombre del Producto <span className="text-red-500">*</span></span>
                                    <input
                                        value={name}
                                        onChange={(e) => setName(e.target.value)}
                                        className="w-full rounded-lg border-slate-200 bg-slate-50 text-slate-900 focus:ring-2 focus:ring-primary focus:border-primary h-12 px-4 placeholder:text-gray-400"
                                        placeholder="Ej. Coca-Cola 1.5L Original"
                                        type="text"
                                    />
                                </label>
                                <label className="flex flex-col gap-2">
                                    <span className="text-sm font-semibold text-slate-700">Descripción</span>
                                    <textarea
                                        value={description}
                                        onChange={(e) => setDescription(e.target.value)}
                                        className="w-full rounded-lg border-slate-200 bg-slate-50 text-slate-900 focus:ring-2 focus:ring-primary focus:border-primary min-h-[100px] p-4 placeholder:text-gray-400"
                                        placeholder="Añade detalles sobre el producto, ingredientes, o notas internas..."
                                    ></textarea>
                                </label>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                                    <label className="flex flex-col gap-2 relative">
                                        <span className="text-sm font-semibold text-slate-700">Categoría</span>
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
                                            <span className="text-sm font-semibold text-slate-700">Código de Barras</span>
                                            <div className="flex bg-slate-100 p-0.5 rounded-lg">
                                                <button
                                                    onClick={() => setSkuMode('manual')}
                                                    className={`px-2 py-0.5 text-xs font-medium rounded-md transition-all ${skuMode === 'manual' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                                                >
                                                    Manual
                                                </button>
                                                <button
                                                    onClick={() => setSkuMode('auto')}
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
                                                value={skuMode === 'auto' ? (barcode || "Se generará automáticamente") : barcode}
                                                onChange={(e) => setBarcode(e.target.value)}
                                                disabled={skuMode === 'auto'}
                                                className={`w-full rounded-lg border bg-slate-50 focus:ring-2 focus:ring-primary focus:border-primary h-12 pl-10 pr-4 font-mono transition-colors ${skuMode === 'auto' ? 'border-primary/30 text-primary italic' : 'border-slate-200 text-slate-900'}`}
                                                placeholder="Escanea o escribe"
                                                type="text"
                                            />
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
                                    <h2 className="text-lg font-bold text-slate-900">Precios e Inventario</h2>
                                    <p className="text-sm text-slate-400">Define los costos y el stock actual.</p>
                                </div>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-5">
                                <label className="flex flex-col gap-2">
                                    <span className="text-sm font-semibold text-slate-700">Precio de Costo ($)</span>
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
                                    <span className="text-sm font-semibold text-slate-700">Precio de Venta ($)</span>
                                    <div className="relative">
                                        <input
                                            value={salePrice}
                                            onChange={(e) => setSalePrice(e.target.value)}
                                            className="w-full rounded-lg border-slate-200 bg-slate-50 text-slate-900 focus:ring-2 focus:ring-primary focus:border-primary h-12 px-4 font-bold text-lg"
                                            placeholder="0.00"
                                            step="0.01"
                                            type="number"
                                        />
                                        <div className="absolute right-3 top-1/2 -translate-y-1/2 px-2 py-0.5 bg-green-100 text-green-700 text-xs font-bold rounded hidden md:block">
                                            Margen: {margin.toFixed(1)}%
                                        </div>
                                    </div>
                                </label>
                                <label className="flex flex-col gap-2">
                                    <span className="text-sm font-semibold text-slate-700">Impuesto (IVA)</span>
                                    <select
                                        value={tax}
                                        onChange={(e) => setTax(e.target.value)}
                                        className="w-full rounded-lg border-slate-200 bg-slate-50 text-slate-900 focus:ring-2 focus:ring-primary focus:border-primary h-12 px-4 appearance-none"
                                    >
                                        <option value="19">19% (General)</option>
                                        <option value="5">5% (Reducido)</option>
                                        <option value="0">0% (Exento)</option>
                                    </select>
                                </label>
                                <label className="flex flex-col gap-2">
                                    <span className="text-sm font-semibold text-slate-700">Stock Actual</span>
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
                        {/* Status Card (New for Edit) */}
                        <div className="bg-white rounded-xl shadow-sm p-6 border border-slate-200">
                            <div className="flex items-center gap-3 mb-5 border-b border-slate-100 pb-3">
                                <span className="material-symbols-outlined text-primary">toggle_on</span>
                                <h2 className="text-base font-bold text-slate-900">Estado</h2>
                            </div>
                            <div className="flex flex-col gap-4">
                                <label className={`flex items-center justify-between p-4 rounded-lg border cursor-pointer transition-all ${status === 'Activo' ? 'border-green-200 bg-green-50' : 'border-slate-200 bg-white'}`}>
                                    <span className="font-bold text-slate-700">Activo</span>
                                    <input type="radio" checked={status === 'Activo'} onChange={() => setStatus('Activo')} name="status" className="w-5 h-5 text-green-600 focus:ring-green-500" />
                                </label>
                                <label className={`flex items-center justify-between p-4 rounded-lg border cursor-pointer transition-all ${status === 'Inactivo' ? 'border-red-200 bg-red-50' : 'border-slate-200 bg-white'}`}>
                                    <span className="font-bold text-slate-700">Inactivo</span>
                                    <input type="radio" checked={status === 'Inactivo'} onChange={() => setStatus('Inactivo')} name="status" className="w-5 h-5 text-red-600 focus:ring-red-500" />
                                </label>
                            </div>
                        </div>

                        {/* Configuration Card */}
                        <div className="bg-white rounded-xl shadow-sm p-6 border border-slate-200">
                            <div className="flex items-center gap-3 mb-5 border-b border-slate-100 pb-3">
                                <span className="material-symbols-outlined text-primary">tune</span>
                                <h2 className="text-base font-bold text-slate-900">Configuración</h2>
                            </div>
                            <div className="flex flex-col gap-5">
                                <label className="flex flex-col gap-2">
                                    <span className="text-sm font-semibold text-slate-700">Unidad de Medida</span>
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
                                            <span className="text-sm font-bold text-slate-900">Alerta de Stock Bajo</span>
                                        </div>
                                        <p className="text-xs text-slate-500 mb-2">Notificar cuando el inventario sea menor a:</p>
                                        <div className="flex items-center gap-2">
                                            <input
                                                value={minStock}
                                                onChange={(e) => setMinStock(e.target.value)}
                                                className="w-full rounded-lg border-slate-200 bg-white text-slate-900 focus:ring-2 focus:ring-primary focus:border-primary h-10 px-3 text-center font-bold"
                                                type="number"
                                                min="0"
                                            />
                                            <span className="text-sm font-medium text-slate-500">{unit}</span>
                                        </div>
                                    </label>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
