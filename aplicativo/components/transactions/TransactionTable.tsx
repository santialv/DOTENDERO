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
        <div className="flex-1 overflow-y-auto custom-scrollbar">
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
    );
}
