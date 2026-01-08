"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { addInventoryMovement } from "../../../utils/inventory";

// Mock Providers (would be in DB/LocalStorage typically)
const MOCK_PROVIDERS = [
    { id: "1", name: "Coca-Cola FEMSA", nit: "890.900.608-9" },
    { id: "2", name: "Bavaria S.A.", nit: "860.003.020-1" },
    { id: "3", name: "Alpina S.A.", nit: "860.025.900-3" },
    { id: "4", name: "Proveedor General", nit: "222.222.222-2" }
];

interface Product {
    id: string;
    name: string;
    barcode: string;
    costPrice: number;
    salePrice: number;
    stock: number;
    tax?: number; // 0, 5, 19
}

interface EntryItem {
    tempId: string;
    productId?: string;
    name: string;
    barcode: string;
    qty: number;
    cost: number;
    taxPercent: number; // 0 | 5 | 19
    discountPercent: number;
    isNew: boolean;
}

export default function PurchaseEntryPage() {
    const router = useRouter();

    // -- Header / Provider State --
    const [providerId, setProviderId] = useState("");
    const [providerName, setProviderName] = useState(""); // Display/Manual input
    const [invoiceNumber, setInvoiceNumber] = useState("");
    const [date, setDate] = useState("");

    useEffect(() => {
        setDate(new Date().toISOString().split('T')[0]);
    }, []);

    // -- Entry Grid State --
    const [entryItems, setEntryItems] = useState<EntryItem[]>([]);

    // -- Search State --
    const [searchTerm, setSearchTerm] = useState("");
    const [searchResults, setSearchResults] = useState<Product[]>([]);

    useEffect(() => {
        setDate(new Date().toISOString().split('T')[0]);

        // Check for "Edit Mode"
        const editData = localStorage.getItem("temp_edit_purchase");
        if (editData) {
            try {
                const purchase = JSON.parse(editData);
                // Populate fields
                setProviderName(purchase.provider);
                setProviderId("custom"); // Simplification
                setInvoiceNumber(purchase.invoice);
                if (purchase.date) setDate(purchase.date.split('T')[0]);
                if (purchase.items) setEntryItems(purchase.items);

                // Clear temp
                localStorage.removeItem("temp_edit_purchase");
            } catch (e) {
                console.error("Error loading edit data", e);
            }
        }
    }, []);

    // -- Calculations --
    const subtotal = entryItems.reduce((sum, item) => sum + (item.cost * item.qty), 0);
    const totalDiscount = entryItems.reduce((sum, item) => sum + ((item.cost * item.qty) * (item.discountPercent / 100)), 0);
    // Tax is usually calculated on the base after discount in Colombia?
    // Let's assume (Base - Discount) * Tax%
    const totalTax = entryItems.reduce((sum, item) => {
        const base = (item.cost * item.qty) * (1 - item.discountPercent / 100);
        return sum + (base * (item.taxPercent / 100));
    }, 0);
    const total = subtotal - totalDiscount + totalTax;


    // Handlers
    const handleProviderChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const pid = e.target.value;
        setProviderId(pid);
        const p = MOCK_PROVIDERS.find(pr => pr.id === pid);
        if (p) {
            setProviderName(p.name);
        } else {
            setProviderName("");
        }
    };

    const handleSearch = (term: string) => {
        setSearchTerm(term);
        if (term.length > 1) {
            const inventory = JSON.parse(localStorage.getItem("products") || "[]");
            const results = inventory.filter((p: Product) =>
                p.name.toLowerCase().includes(term.toLowerCase()) || p.barcode.includes(term)
            );
            setSearchResults(results);
        } else {
            setSearchResults([]);
        }
    };

    const addProductToGrid = (product: Product) => {
        setEntryItems([...entryItems, {
            tempId: crypto.randomUUID(),
            productId: product.id,
            name: product.name,
            barcode: product.barcode,
            qty: 1,
            cost: product.costPrice,
            taxPercent: 0, // Default to 0, user selects
            discountPercent: 0,
            isNew: false
        }]);
        setSearchTerm("");
        setSearchResults([]);
    };

    const updateItem = (fromId: string, field: keyof EntryItem, value: number) => {
        setEntryItems(prev => prev.map(item => {
            if (item.tempId === fromId) {
                return { ...item, [field]: value };
            }
            return item;
        }));
    };

    const removeItem = (id: string) => {
        setEntryItems(prev => prev.filter(i => i.tempId !== id));
    };

    const handleProcess = () => {
        if (!providerName) return alert("Seleccione un proveedor");
        if (entryItems.length === 0) return alert("Agregue al menos un producto");

        // 1. Save Inventory Movements & Update Cost
        entryItems.forEach(item => {
            addInventoryMovement(
                item.productId || null,
                null,
                item.qty,
                item.cost,
                'Compra',
                `Factura ${invoiceNumber || 'S/N'} - ${providerName}`,
                "Admin"
            );
        });

        // 2. Save to Purchase History
        const newPurchase = {
            id: crypto.randomUUID(),
            date: date || new Date().toISOString(),
            provider: providerName,
            invoice: invoiceNumber || 'S/N',
            totalAmount: total,
            itemCount: entryItems.reduce((acc, i) => acc + i.qty, 0),
            user: "Admin",
            items: entryItems // storing details just in case
        };

        const purchaseHistory = JSON.parse(localStorage.getItem("purchaseHistory") || "[]");
        purchaseHistory.unshift(newPurchase); // Add to top
        localStorage.setItem("purchaseHistory", JSON.stringify(purchaseHistory));

        // 3. Register Expense (Transaction)
        const newTransaction = {
            id: crypto.randomUUID(),
            date: date || new Date().toISOString(),
            type: 'expense', // Gasto
            method: 'Efectivo', // Defaulting to Cash/General
            amount: total,
            description: `Compra a ${providerName} (${invoiceNumber || 'S/N'})`,
            category: 'Compra Mercancía',
            user: "Admin"
        };

        const transactions = JSON.parse(localStorage.getItem("transactions") || "[]");
        transactions.push(newTransaction);
        localStorage.setItem("transactions", JSON.stringify(transactions));

        alert("Compra registrada correctamente. Inventario actualizado y gasto registrado.");
        router.push("/compras");
    };

    return (
        <div className="flex flex-col h-full bg-slate-50 font-display overflow-hidden">
            {/* Header / Meta Data */}
            <div className="bg-white px-8 py-6 border-b border-slate-200 shrink-0">
                <div className="max-w-7xl mx-auto w-full">
                    <h1 className="text-2xl font-black text-slate-900 mb-6">Registrar Compra</h1>

                    <div className="grid grid-cols-1 md:grid-cols-4 gap-6 bg-slate-50 p-6 rounded-2xl border border-slate-100">
                        {/* Provider */}
                        <div className="md:col-span-2">
                            <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Proveedor</label>
                            <div className="flex gap-2">
                                <select
                                    className="w-1/3 px-3 py-2 rounded-xl border border-slate-200 text-sm font-bold focus:border-primary outline-none"
                                    value={providerId}
                                    onChange={handleProviderChange}
                                >
                                    <option value="">Seleccionar...</option>
                                    {MOCK_PROVIDERS.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                                    <option value="custom">Otro / Nuevo</option>
                                </select>
                                <input
                                    type="text"
                                    className="flex-1 px-3 py-2 rounded-xl border border-slate-200 text-sm font-medium focus:border-primary outline-none"
                                    placeholder="Nombre del Proveedor"
                                    value={providerName}
                                    onChange={e => { setProviderName(e.target.value); setProviderId("custom"); }}
                                />
                            </div>
                        </div>

                        {/* Invoice & Date */}
                        <div>
                            <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Nro. Factura</label>
                            <input
                                type="text"
                                value={invoiceNumber}
                                onChange={e => setInvoiceNumber(e.target.value)}
                                className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm font-bold focus:border-primary outline-none"
                                placeholder="FAC-1234..."
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Fecha Emisión</label>
                            <input
                                type="date"
                                value={date}
                                onChange={e => setDate(e.target.value)}
                                className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm font-medium focus:border-primary outline-none"
                            />
                        </div>
                    </div>
                </div>
            </div>

            {/* Main Content: Search + Grid */}
            <div className="flex-1 p-8 overflow-hidden flex flex-col max-w-7xl mx-auto w-full">

                {/* Search Bar */}
                <div className="relative mb-6 z-20">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 material-symbols-outlined text-slate-400">search</span>
                    <input
                        type="text"
                        placeholder="Buscar producto por Nombre o Código de Barras..."
                        value={searchTerm}
                        onChange={e => handleSearch(e.target.value)}
                        className="w-full pl-12 pr-4 py-4 rounded-2xl border-2 border-slate-200 bg-white text-lg font-medium shadow-sm focus:border-slate-900 outline-none transition-all"
                    />
                    {/* Search Results Dropdown */}
                    {searchResults.length > 0 && (
                        <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-xl shadow-2xl border border-slate-100 max-h-80 overflow-y-auto custom-scrollbar">
                            {searchResults.map(p => (
                                <button
                                    key={p.id}
                                    onClick={() => addProductToGrid(p)}
                                    className="w-full text-left p-4 hover:bg-slate-50 border-b border-slate-50 flex justify-between items-center group transition-colors"
                                >
                                    <div>
                                        <p className="font-bold text-slate-900">{p.name}</p>
                                        <p className="text-xs text-slate-500 font-mono">{p.barcode} • Stock: {p.stock}</p>
                                    </div>
                                    <div className="flex items-center gap-2 text-primary font-bold opacity-0 group-hover:opacity-100 transition-opacity">
                                        <span>Agregar</span>
                                        <span className="material-symbols-outlined">add_circle</span>
                                    </div>
                                </button>
                            ))}
                        </div>
                    )}
                </div>

                {/* Grid */}
                <div className="flex-1 bg-white rounded-2xl border border-slate-200 shadow-sm flex flex-col overflow-hidden">
                    <div className="flex-1 overflow-auto custom-scrollbar">
                        <table className="w-full text-left">
                            <thead className="bg-slate-50 sticky top-0 z-10 text-xs font-bold text-slate-500 uppercase tracking-wider">
                                <tr>
                                    <th className="p-4">Producto</th>
                                    <th className="p-4 w-24 text-center">Cantidad</th>
                                    <th className="p-4 w-32 text-right">Costo Unit.</th>
                                    <th className="p-4 w-24 text-center">IVA %</th>
                                    <th className="p-4 w-24 text-center">Desc %</th>
                                    <th className="p-4 w-32 text-right">Subtotal</th>
                                    <th className="p-4 w-12"></th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {entryItems.length === 0 ? (
                                    <tr>
                                        <td colSpan={7} className="p-12 text-center text-slate-400">
                                            Empieza buscando productos arriba para agregarlos a la compra.
                                        </td>
                                    </tr>
                                ) : entryItems.map(item => {
                                    const rowBase = item.cost * item.qty;
                                    const rowDesc = rowBase * (item.discountPercent / 100);
                                    const rowTax = (rowBase - rowDesc) * (item.taxPercent / 100);
                                    const rowTotal = rowBase - rowDesc + rowTax;

                                    return (
                                        <tr key={item.tempId} className="hover:bg-slate-50 group transition-colors">
                                            <td className="p-4">
                                                <p className="font-bold text-slate-900 text-sm">{item.name}</p>
                                                <p className="text-[10px] text-slate-500 font-mono">{item.barcode}</p>
                                            </td>
                                            <td className="p-4">
                                                <input
                                                    type="number" min="1"
                                                    value={item.qty}
                                                    onChange={e => updateItem(item.tempId, "qty", parseFloat(e.target.value) || 0)}
                                                    className="w-full text-center bg-slate-100 rounded-lg p-1.5 font-bold text-slate-900 border border-transparent focus:bg-white focus:border-primary outline-none"
                                                />
                                            </td>
                                            <td className="p-4">
                                                <input
                                                    type="number"
                                                    value={item.cost}
                                                    onChange={e => updateItem(item.tempId, "cost", parseFloat(e.target.value) || 0)}
                                                    className="w-full text-right bg-slate-100 rounded-lg p-1.5 font-medium text-slate-900 border border-transparent focus:bg-white focus:border-primary outline-none"
                                                />
                                            </td>
                                            <td className="p-4">
                                                <select
                                                    value={item.taxPercent}
                                                    onChange={e => updateItem(item.tempId, "taxPercent", parseFloat(e.target.value))}
                                                    className="w-full text-center bg-slate-100 rounded-lg p-1.5 text-xs font-bold text-slate-700 border border-transparent focus:bg-white focus:border-primary outline-none appearance-none"
                                                >
                                                    <option value="0">0%</option>
                                                    <option value="5">5%</option>
                                                    <option value="19">19%</option>
                                                </select>
                                            </td>
                                            <td className="p-4">
                                                <input
                                                    type="number" min="0" max="100"
                                                    value={item.discountPercent}
                                                    onChange={e => updateItem(item.tempId, "discountPercent", parseFloat(e.target.value) || 0)}
                                                    className="w-full text-center bg-slate-100 rounded-lg p-1.5 font-medium text-slate-900 border border-transparent focus:bg-white focus:border-primary outline-none"
                                                />
                                            </td>
                                            <td className="p-4 text-right font-bold text-slate-900">
                                                ${rowTotal.toLocaleString(undefined, { maximumFractionDigits: 0 })}
                                            </td>
                                            <td className="p-4 text-center">
                                                <button
                                                    onClick={() => removeItem(item.tempId)}
                                                    className="text-slate-300 hover:text-red-500 transition-colors"
                                                >
                                                    <span className="material-symbols-outlined text-[20px]">delete</span>
                                                </button>
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>

                    {/* Footer Totals */}
                    <div className="bg-slate-50 p-6 border-t border-slate-200 flex flex-col md:flex-row justify-end items-center gap-8">
                        <div className="grid grid-cols-2 gap-x-8 gap-y-1 text-sm">
                            <span className="text-slate-500 text-right">Subtotal:</span>
                            <span className="font-bold text-slate-900 text-right">${subtotal.toLocaleString()}</span>

                            <span className="text-slate-500 text-right">Descuentos:</span>
                            <span className="font-bold text-red-500 text-right">-${totalDiscount.toLocaleString()}</span>

                            <span className="text-slate-500 text-right">Impuestos:</span>
                            <span className="font-bold text-slate-900 text-right">+${totalTax.toLocaleString()}</span>

                            <div className="col-span-2 border-t border-slate-300 my-2"></div>

                            <span className="text-slate-900 font-bold text-lg text-right">Total:</span>
                            <span className="font-black text-slate-900 text-lg text-right">${total.toLocaleString()}</span>
                        </div>

                        <button
                            onClick={handleProcess}
                            className="bg-slate-900 hover:bg-slate-800 text-white font-black py-4 px-8 rounded-2xl shadow-xl shadow-slate-900/20 transition-all active:scale-95 flex items-center gap-2"
                        >
                            <span className="material-symbols-outlined">save</span>
                            Registrar Compra
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
