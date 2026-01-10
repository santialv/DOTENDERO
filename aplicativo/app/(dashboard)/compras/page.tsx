"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabase";
import { addInventoryMovement } from "../../utils/inventory";

interface EntryItem { // Duplicated from ingreo/page.tsx or should be shared?
    tempId: string;
    productId?: string;
    name: string;
    barcode: string;
    qty: number;
    cost: number;
    taxPercent: number;
    discountPercent: number;
    isNew: boolean;
}

interface PurchaseRecord {
    id: string;
    date: string;
    provider: string;
    invoice: string;
    totalAmount: number;
    itemCount: number;
    user: string;
    items?: EntryItem[];
}

export default function PurchasesHistoryPage() {
    // Pagination State
    const [page, setPage] = useState(0);
    const [hasMore, setHasMore] = useState(false);
    const PAGE_SIZE = 50;

    const [purchases, setPurchases] = useState<PurchaseRecord[]>([]);
    const [selectedPurchase, setSelectedPurchase] = useState<PurchaseRecord | null>(null);
    const [searchTerm, setSearchTerm] = useState("");
    const [stats, setStats] = useState({
        totalSpent: 0,
        purchaseCount: 0,
        topProvider: "N/A"
    });

    const calculateStats = (data: PurchaseRecord[]) => {
        const totalSpent = data.reduce((sum, p) => sum + p.totalAmount, 0);
        const purchaseCount = data.length;

        // Find top provider
        const providerCounts: { [key: string]: number } = {};
        data.forEach(p => {
            providerCounts[p.provider] = (providerCounts[p.provider] || 0) + 1;
        });

        let topProvider = "N/A";
        let maxCount = 0;
        for (const [provider, count] of Object.entries(providerCounts)) {
            if (count > maxCount) {
                maxCount = count;
                topProvider = provider;
            }
        }

        setStats({ totalSpent, purchaseCount, topProvider });
    };

    useEffect(() => {
        loadPurchases(0);
    }, []);

    const loadPurchases = async (pageToLoad: number) => {
        const { data: { session } } = await supabase.auth.getSession();
        if (!session) return;

        const { data: profile } = await supabase.from('profiles').select('organization_id').eq('id', session.user.id).single();
        const orgId = profile?.organization_id;

        if (!orgId) return;

        const from = pageToLoad * PAGE_SIZE;
        const to = from + PAGE_SIZE - 1;

        const { data, count } = await supabase
            .from('purchases')
            .select('*', { count: 'exact' })
            .eq('organization_id', orgId)
            .order('date', { ascending: false })
            .range(from, to);

        if (data) {
            const mapped = data.map(p => ({
                id: p.id,
                date: p.date,
                provider: p.provider_name || 'Desconocido',
                invoice: p.invoice_number,
                totalAmount: p.total_amount,
                itemCount: p.item_count,
                user: "Sistema", // Placeholder
                items: []
            }));

            setPurchases(mapped);
            setPage(pageToLoad);
            setHasMore(data.length === PAGE_SIZE); // If we got a full page, there might be more

            // Note: Stats will only reflect current page unless we do a separate aggregate query.
            // For now, let's keep it simple as requested.
            calculateStats(mapped);
        }
    };

    // ... calculateStats logic stays same ...

    // Filter Logic needs to handle server-side if properly done, 
    // but for user request "not strict", we will keep client filter on CURRENT PAGE
    const filteredPurchases = purchases.filter(p =>
        p.provider?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.invoice?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const handleNextPage = () => loadPurchases(page + 1);
    const handlePrevPage = () => {
        if (page > 0) loadPurchases(page - 1);
    };

    const handleDelete = (purchase: PurchaseRecord) => {
        if (!confirm(`¿Estás seguro de eliminar la compra ${purchase.invoice} de ${purchase.provider}? Esto revertirá el inventario.`)) return;

        // 1. Revert Inventory
        if (purchase.items) {
            // Dynamically import or copy logic? We need to import 'addInventoryMovement'
            // Assuming we added the import at the top of the file as requested.
            purchase.items.forEach((item: any) => {
                // Negative quantity to revert
                addInventoryMovement(
                    item.productId || null,
                    null,
                    -item.qty, // Subtract stock
                    item.cost,
                    'Ajuste', // Type 'Ajuste' ensures WAC isn't recalculated, effectively just reversing the qty at current cost logic-wise, or simply reducing stock.
                    `Anulación Compra ${purchase.invoice}`,
                    "Admin"
                );
            });
        }

        // 2. Remove from Purchase History
        const newHistory = purchases.filter(p => p.id !== purchase.id);
        localStorage.setItem("purchaseHistory", JSON.stringify(newHistory));

        // 3. Remove from Transactions (Expenses)
        // We need to find the transaction. We didn't link IDs perfectly (bad design previously), but we can try to match description or ID if we stored it?
        // In the previous step, I used random UUIDs for both. I didn't store the transaction ID in the purchase record.
        // Fallback: Filter by description "Compra a [Provider] ([Invoice])" and approximate amount/date?
        // Or just leave it? No, user wants it clean.
        // Better effort: Match by Invoice check in description.
        const transactions = JSON.parse(localStorage.getItem("transactions") || "[]");
        const matchDesc = `Compra a ${purchase.provider} (${purchase.invoice})`;
        // Filter out ONE matching transaction (in case of duplicates, just one)
        const itemIndex = transactions.findIndex((t: any) => t.description === matchDesc && t.amount === purchase.totalAmount);
        if (itemIndex > -1) {
            transactions.splice(itemIndex, 1);
            localStorage.setItem("transactions", JSON.stringify(transactions));
        }

        alert("Compra eliminada y stock revertido.");
        loadPurchases(page);
    };

    const handleEdit = (purchase: PurchaseRecord) => {
        if (!confirm("Para editar, se cargará la información y se eliminará el registro actual (revirtiendo el stock). ¿Continuar?")) return;

        // 1. Revert Inventory (Same as Delete)
        if (purchase.items) {
            purchase.items.forEach((item: any) => {
                addInventoryMovement(
                    item.productId || null,
                    null,
                    -item.qty,
                    item.cost,
                    'Ajuste',
                    `Modificación Compra ${purchase.invoice}`,
                    "Admin"
                );
            });
        }

        // 2. Remove old records (Same as Delete)
        const newHistory = purchases.filter(p => p.id !== purchase.id);
        localStorage.setItem("purchaseHistory", JSON.stringify(newHistory));

        const transactions = JSON.parse(localStorage.getItem("transactions") || "[]");
        const matchDesc = `Compra a ${purchase.provider} (${purchase.invoice})`;
        const itemIndex = transactions.findIndex((t: any) => t.description === matchDesc && t.amount === purchase.totalAmount);
        if (itemIndex > -1) {
            transactions.splice(itemIndex, 1);
            localStorage.setItem("transactions", JSON.stringify(transactions));
        }

        // 3. Save to Temp for Edit
        localStorage.setItem("temp_edit_purchase", JSON.stringify(purchase));

        // 4. Redirect
        window.location.href = "/compras/ingreso";
    };

    return (
        <div className="flex flex-col h-full bg-slate-50 font-display relative">
            {/* Header */}
            <div className="px-10 py-8 flex items-end justify-between gap-4 shrink-0">
                <div className="flex flex-col gap-1">
                    <h1 className="text-3xl md:text-4xl font-black tracking-tight text-slate-900">Historial de Compras</h1>
                    <p className="text-slate-500 text-base">Gestiona y consulta todas las compras de mercancía realizadas.</p>
                </div>
                <Link
                    href="/compras/ingreso"
                    className="h-12 px-6 bg-slate-900 hover:bg-slate-800 text-white rounded-xl font-bold shadow-lg shadow-slate-900/20 active:scale-95 transition-all flex items-center gap-2"
                >
                    <span className="material-symbols-outlined">add_circle</span>
                    Nueva Compra
                </Link>
            </div>

            {/* Stats Cards */}
            <div className="px-10 pb-6 grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl p-6 text-white shadow-lg shadow-blue-500/20">
                    <div className="flex items-center gap-4 mb-2">
                        <span className="p-2 bg-white/20 rounded-lg">
                            <span className="material-symbols-outlined">attach_money</span>
                        </span>
                        <h3 className="font-bold text-lg text-blue-100">Total del Mes</h3>
                    </div>
                    <p className="text-3xl font-black">${stats.totalSpent.toLocaleString()}</p>
                    <p className="text-sm text-blue-200 mt-1">+0% vs mes anterior</p>
                </div>

                <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm">
                    <div className="flex items-center gap-4 mb-2">
                        <span className="p-2 bg-orange-100 text-orange-600 rounded-lg">
                            <span className="material-symbols-outlined">receipt_long</span>
                        </span>
                        <h3 className="font-bold text-lg text-slate-600">Compras Realizadas</h3>
                    </div>
                    <p className="text-3xl font-black text-slate-900">{stats.purchaseCount}</p>
                    <p className="text-sm text-slate-400 mt-1">En el historial</p>
                </div>

                <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm">
                    <div className="flex items-center gap-4 mb-2">
                        <span className="p-2 bg-emerald-100 text-emerald-600 rounded-lg">
                            <span className="material-symbols-outlined">local_shipping</span>
                        </span>
                        <h3 className="font-bold text-lg text-slate-600">Proveedor Frecuente</h3>
                    </div>
                    <p className="text-3xl font-black text-slate-900 truncate" title={stats.topProvider}>{stats.topProvider}</p>
                    <p className="text-sm text-slate-400 mt-1">Basado en cantidad de compras</p>
                </div>
            </div>

            {/* Filters */}
            <div className="px-10 pb-6 flex gap-4">
                <div className="relative w-full max-w-md group">
                    <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-primary transition-colors">search</span>
                    <input
                        className="w-full h-12 rounded-xl border border-slate-200 bg-white pl-10 pr-4 text-slate-900 placeholder:text-slate-400 focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all shadow-sm"
                        placeholder="Buscar por proveedor o factura..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
            </div>

            {/* List */}
            <div className="flex-1 px-10 pb-10 overflow-hidden">
                <div className="bg-white rounded-2xl border border-slate-200 shadow-sm h-full overflow-hidden flex flex-col">
                    <div className="overflow-auto custom-scrollbar flex-1">
                        <table className="w-full text-left">
                            <thead className="bg-slate-50 sticky top-0 z-10 text-xs font-bold text-slate-500 uppercase tracking-wider">
                                <tr>
                                    <th className="p-4">Fecha</th>
                                    <th className="p-4">Proveedor</th>
                                    <th className="p-4">Factura</th>
                                    <th className="p-4 text-center">Items</th>
                                    <th className="p-4 text-right">Total</th>
                                    <th className="p-4 text-center">Usuario</th>
                                    <th className="p-4 text-center w-40">Acciones</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {filteredPurchases.length === 0 ? (
                                    <tr>
                                        <td colSpan={7} className="p-20 text-center text-slate-400">
                                            <span className="material-symbols-outlined text-[64px] mb-4 text-slate-200">receipt_long</span>
                                            <p className="text-lg font-bold text-slate-600">No hay compras registradas</p>
                                            <p className="text-sm">Registra una nueva compra para verla aquí.</p>
                                        </td>
                                    </tr>
                                ) : filteredPurchases.map(purchase => (
                                    <tr key={purchase.id} className="hover:bg-slate-50 transition-colors cursor-default">
                                        <td className="p-4 font-mono text-sm text-slate-600">
                                            {purchase.date ? new Intl.DateTimeFormat('es-CO', { day: '2-digit', month: 'short', year: 'numeric' }).format(new Date(purchase.date)) : 'N/A'}
                                        </td>
                                        <td className="p-4 font-bold text-slate-900">{purchase.provider}</td>
                                        <td className="p-4 text-sm text-slate-600">{purchase.invoice || 'N/A'}</td>
                                        <td className="p-4 text-center">
                                            <span className="inline-flex items-center justify-center px-2.5 py-0.5 rounded-full text-xs font-bold bg-blue-100 text-blue-800">
                                                {purchase.itemCount} items
                                            </span>
                                        </td>
                                        <td className="p-4 text-right font-black text-slate-900">
                                            ${purchase.totalAmount.toLocaleString()}
                                        </td>
                                        <td className="p-4 text-center text-sm text-slate-500">{purchase.user}</td>
                                        <td className="p-4 flex justify-center gap-2">
                                            <button
                                                onClick={async () => {
                                                    const { data: items } = await supabase.from('purchase_items').select('*').eq('purchase_id', purchase.id);
                                                    setSelectedPurchase({
                                                        ...purchase, items: items?.map(i => ({
                                                            tempId: i.id,
                                                            productId: i.product_id,
                                                            name: i.product_name,
                                                            barcode: '', // Could join products or omit
                                                            qty: i.quantity,
                                                            cost: i.cost,
                                                            taxPercent: i.tax_percent,
                                                            discountPercent: i.discount_percent,
                                                            isNew: false
                                                        })) as any
                                                    });
                                                }}
                                                className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                                                title="Ver Detalles"
                                            >
                                                <span className="material-symbols-outlined text-[20px]">visibility</span>
                                            </button>
                                            <button
                                                onClick={async () => {
                                                    const { data: items } = await supabase.from('purchase_items').select('*').eq('purchase_id', purchase.id);
                                                    const fullPurchase = {
                                                        ...purchase, items: items?.map(i => ({
                                                            tempId: i.id,
                                                            productId: i.product_id,
                                                            name: i.product_name,
                                                            barcode: '', // Added missing field
                                                            qty: i.quantity,
                                                            cost: i.cost,
                                                            taxPercent: i.tax_percent,
                                                            discountPercent: i.discount_percent,
                                                            isNew: false
                                                        }))
                                                    };
                                                    handleEdit(fullPurchase as any);
                                                }}
                                                className="p-2 text-slate-400 hover:text-orange-600 hover:bg-orange-50 rounded-lg transition-colors"
                                                title="Editar (Rehacer)"
                                            >
                                                <span className="material-symbols-outlined text-[20px]">edit</span>
                                            </button>
                                            <button
                                                onClick={() => handleDelete(purchase)}
                                                className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                                title="Eliminar"
                                            >
                                                <span className="material-symbols-outlined text-[20px]">delete</span>
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    {/* Pagination Footer */}
                    <div className="px-6 py-4 border-t border-slate-200 bg-slate-50 flex justify-between items-center">
                        <span className="text-sm font-medium text-slate-500">
                            Página <span className="text-slate-900 font-bold">{page + 1}</span>
                        </span>
                        <div className="flex gap-2">
                            <button
                                onClick={handlePrevPage}
                                disabled={page === 0}
                                className="px-4 py-2 text-sm font-bold text-slate-600 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-sm"
                            >
                                Anterior
                            </button>
                            <button
                                onClick={handleNextPage}
                                disabled={!hasMore}
                                className="px-4 py-2 text-sm font-bold text-white bg-slate-900 rounded-lg hover:bg-slate-800 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg shadow-slate-900/10"
                            >
                                Siguiente
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* View/Print Modal */}
            {selectedPurchase && (
                <div className="absolute inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4">
                    <div className="bg-white w-full max-w-3xl rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
                        {/* Printable Area */}
                        <div id="print-area" className="p-8 overflow-y-auto custom-scrollbar bg-white">
                            <div className="flex justify-between items-start mb-8 border-b border-slate-100 pb-8">
                                <div>
                                    <h2 className="text-2xl font-black text-slate-900 mb-1">Factura de Compra</h2>
                                    <p className="text-slate-500">ID: {selectedPurchase.id.slice(0, 8)}</p>
                                </div>
                                <div className="text-right">
                                    <p className="text-sm font-bold text-slate-500 uppercase">Proveedor</p>
                                    <p className="text-xl font-bold text-slate-900">{selectedPurchase.provider}</p>
                                    <div className="mt-2">
                                        <p className="text-xs font-bold text-slate-500 uppercase">Factura Nro.</p>
                                        <p className="font-mono text-slate-900">{selectedPurchase.invoice}</p>
                                    </div>
                                    <div className="mt-2">
                                        <p className="text-xs font-bold text-slate-500 uppercase">Fecha</p>
                                        <p className="font-mono text-slate-900">{selectedPurchase.date.split('T')[0]}</p>
                                    </div>
                                </div>
                            </div>

                            <table className="w-full text-left mb-8">
                                <thead className="bg-slate-50 text-xs font-bold text-slate-500 uppercase border-y border-slate-200">
                                    <tr>
                                        <th className="py-3 px-2">Producto</th>
                                        <th className="py-3 px-2 text-center">Cant.</th>
                                        <th className="py-3 px-2 text-right">Costo</th>
                                        <th className="py-3 px-2 text-right">Subtotal</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100 font-medium text-sm">
                                    {selectedPurchase.items?.map((item: any, idx: number) => (
                                        <tr key={idx}>
                                            <td className="py-3 px-2">
                                                <p className="text-slate-900">{item.name}</p>
                                                <p className="text-[10px] text-slate-400 font-mono">{item.barcode}</p>
                                            </td>
                                            <td className="py-3 px-2 text-center">{item.qty}</td>
                                            <td className="py-3 px-2 text-right">${item.cost.toLocaleString()}</td>
                                            <td className="py-3 px-2 text-right font-bold text-slate-900">
                                                ${(item.cost * item.qty).toLocaleString()}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>

                            <div className="flex justify-end border-t border-slate-200 pt-6">
                                <div className="w-64 space-y-2">
                                    <div className="flex justify-between text-sm">
                                        <span className="text-slate-500">Items:</span>
                                        <span className="font-bold text-slate-900">{selectedPurchase.itemCount}</span>
                                    </div>
                                    <div className="flex justify-between text-xl border-t border-slate-100 pt-2">
                                        <span className="font-bold text-slate-900">Total:</span>
                                        <span className="font-black text-slate-900">${selectedPurchase.totalAmount.toLocaleString()}</span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Modal Actions */}
                        <div className="bg-slate-50 p-4 border-t border-slate-200 flex justify-end gap-3 print:hidden">
                            <button
                                onClick={() => setSelectedPurchase(null)}
                                className="px-4 py-2 text-slate-600 font-bold hover:bg-slate-200 rounded-xl transition-colors"
                            >
                                Cerrar
                            </button>
                            <button
                                onClick={() => {
                                    const printContent = document.getElementById('print-area');
                                    if (printContent) {
                                        const originalContents = document.body.innerHTML;
                                        document.body.innerHTML = printContent.innerHTML;
                                        window.print();
                                        document.body.innerHTML = originalContents;
                                        window.location.reload(); // Reload to restore event listeners/React state safely
                                    }
                                }}
                                className="px-6 py-2 bg-slate-900 text-white font-bold rounded-xl hover:bg-slate-800 shadow-lg shadow-slate-900/10 active:scale-95 transition-all flex items-center gap-2"
                            >
                                <span className="material-symbols-outlined">print</span>
                                Imprimir
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
