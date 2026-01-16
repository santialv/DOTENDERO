"use client";

import { useToast } from "@/components/ui/toast";
import { Transaction } from "@/types";

interface TransactionTableProps {
    transactions: Transaction[];
}

export function TransactionTable({ transactions }: TransactionTableProps) {
    const { toast } = useToast();

    if (transactions.length === 0) {
        return (
            <div className="px-6 py-12 text-center text-slate-400">
                No hay movimientos que coincidan con los filtros
            </div>
        );
    }

    return (
        <div className="flex-1 overflow-hidden flex flex-col">
            {/* Desktop Table View */}
            <div className="hidden md:block overflow-y-auto custom-scrollbar flex-1">
                <table className="w-full text-left">
                    <thead className="bg-slate-50 sticky top-0 z-10">
                        <tr>
                            <th className="px-6 py-4 text-xs font-black text-slate-400 uppercase tracking-wider">Fecha</th>
                            <th className="px-6 py-4 text-xs font-black text-slate-400 uppercase tracking-wider">Descripción / Cliente</th>
                            <th className="px-6 py-4 text-xs font-black text-slate-400 uppercase tracking-wider">Tipo</th>
                            <th className="px-6 py-4 text-xs font-black text-slate-400 uppercase tracking-wider text-right">Monto</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                        {transactions.map((tx) => (
                            <tr key={tx.id} className="hover:bg-slate-50 transition-colors group">
                                <td className="px-6 py-4 text-sm font-medium text-slate-500">
                                    {new Date(tx.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                    <span className="block text-[10px] opacity-70">{new Date(tx.date).toLocaleDateString()}</span>
                                </td>
                                <td className="px-6 py-4">
                                    <p className="text-sm font-bold text-slate-900 line-clamp-1">{tx.description}</p>
                                    {tx.customerName && (
                                        <div className="flex items-center gap-2">
                                            <p className="text-xs text-slate-500 font-medium flex items-center gap-1">
                                                <span className="material-symbols-outlined text-[12px]">person</span>
                                                {tx.customerName}
                                            </p>
                                            {tx.customerData?.email && (
                                                <button
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        import("@/lib/email-service").then(async (service) => {
                                                            const success = await service.sendInvoiceEmail({
                                                                id: tx.id,
                                                                customerName: tx.customerName || "",
                                                                customerEmail: tx.customerData!.email!,
                                                                amount: tx.amount,
                                                                date: tx.date,
                                                                items: tx.items || []
                                                            });
                                                            if (success) {
                                                                toast(`¡Factura reenviada exitosamente a ${tx.customerData!.email}!`, "success");
                                                            } else {
                                                                toast(`Error al reenviar la factura.`, "error");
                                                            }
                                                        });
                                                    }}
                                                    className="text-blue-500 hover:text-blue-700 bg-blue-50 px-2 py-0.5 rounded text-[10px] font-bold flex items-center gap-1 transition-colors"
                                                    title={`Reenviar a ${tx.customerData.email}`}
                                                >
                                                    <span className="material-symbols-outlined text-[12px]">send</span> Reenviar
                                                </button>
                                            )}
                                        </div>
                                    )}
                                </td>
                                <td className="px-6 py-4">
                                    <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-bold ${tx.type === 'expense' ? 'bg-red-50 text-red-600' :
                                        tx.type === 'income' ? 'bg-green-50 text-green-600' :
                                            'bg-blue-50 text-blue-600'
                                        }`}>
                                        {tx.method}
                                    </span>
                                </td>
                                <td className={`px-6 py-4 text-sm font-black text-right ${tx.amount > 0 ? 'text-slate-900' : 'text-red-500'
                                    }`}>
                                    {tx.amount > 0 ? '+' : ''}{tx.amount.toLocaleString()}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* Mobile Card View ("Movimientos Bancarios" Style) */}
            <div className="md:hidden flex-1 overflow-y-auto px-4 pb-20 pt-2 space-y-3">
                {transactions.map((tx) => (
                    <div key={tx.id} className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm flex items-center gap-4 active:scale-[0.98] transition-all">
                        {/* Icon */}
                        <div className={`w-12 h-12 rounded-full flex items-center justify-center shrink-0 ${tx.type === 'expense' ? 'bg-red-50 text-red-500' :
                                tx.amount > 0 ? 'bg-green-50 text-green-500' : 'bg-slate-100 text-slate-500'
                            }`}>
                            <span className="material-symbols-outlined text-2xl">
                                {tx.type === 'expense' ? 'arrow_downward' :
                                    tx.amount > 0 ? 'arrow_upward' : 'remove'}
                            </span>
                        </div>

                        {/* Content */}
                        <div className="flex-1 min-w-0">
                            <h4 className="font-bold text-slate-900 text-sm truncate">{tx.description}</h4>
                            <div className="flex items-center gap-2 text-xs text-slate-500 mt-1">
                                <span className="font-medium">{tx.method}</span>
                                <span>•</span>
                                <span>{new Date(tx.date).toLocaleDateString()}</span>
                            </div>
                            {tx.customerName && (
                                <p className="text-[10px] text-slate-400 mt-0.5 truncate flex items-center gap-1">
                                    <span className="material-symbols-outlined text-[10px]">person</span>
                                    {tx.customerName}
                                </p>
                            )}
                        </div>

                        {/* Amount */}
                        <div className="text-right shrink-0">
                            <span className={`block font-black text-base ${tx.amount > 0 ? 'text-green-600' : 'text-red-600'
                                }`}>
                                {tx.amount > 0 ? '+' : ''}{tx.amount.toLocaleString()}
                            </span>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
