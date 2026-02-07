"use client";

interface TransactionSummaryCardsProps {
    totalCash: number;
    totalBank: number;
    totalFiado: number;
    onOpenModal: (type: "income" | "expense") => void;
}

// Compact Version
export function TransactionSummaryCards({ totalCash, totalBank, totalFiado, onOpenModal }: TransactionSummaryCardsProps) {
    return (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 shrink-0">
            {/* CASH CARD - Brand Green #13ec80 */}
            <div className="rounded-2xl bg-white border border-[#13ec80]/50 p-4 shadow-sm flex flex-col justify-between h-full relative overflow-hidden group">
                <div className="absolute right-0 top-0 p-3 opacity-10 group-hover:scale-110 transition-transform">
                    <span className="material-symbols-outlined text-[60px] text-[#13ec80]">payments</span>
                </div>

                <div className="relative z-10">
                    <p className="font-bold text-slate-500 uppercase tracking-wider text-[10px] mb-1">Total Efectivo</p>
                    <h2 className="text-2xl font-black text-slate-900 mb-3">${totalCash.toLocaleString()}</h2>
                </div>

                <div className="flex gap-2 relative z-10 mt-auto">
                    <button onClick={() => onOpenModal("income")} className="flex-1 bg-[#13ec80] hover:bg-[#0eb562] text-slate-900 rounded-lg py-1.5 text-xs font-bold transition-all flex items-center justify-center gap-1 shadow-sm shadow-[#13ec80]/20">
                        <span className="material-symbols-outlined text-[16px]">add</span> Ingreso
                    </button>
                    <button onClick={() => onOpenModal("expense")} className="flex-1 bg-red-50 hover:bg-red-100 text-red-600 rounded-lg py-1.5 text-xs font-bold transition-all flex items-center justify-center gap-1">
                        <span className="material-symbols-outlined text-[16px]">remove</span> Retiro
                    </button>
                </div>
            </div>

            {/* BANK CARD */}
            <div className="rounded-2xl bg-white border border-blue-200 p-4 shadow-sm flex flex-col justify-between h-full relative overflow-hidden">
                <div className="absolute right-0 top-0 p-3 opacity-10">
                    <span className="material-symbols-outlined text-[60px] text-blue-600">account_balance</span>
                </div>
                <div>
                    <p className="font-bold text-slate-500 uppercase tracking-wider text-[10px] mb-1">Bancos / Digital</p>
                    <h2 className="text-2xl font-black text-slate-900">${totalBank.toLocaleString()}</h2>
                </div>
                <div className="mt-3">
                    <span className="text-[10px] font-bold text-blue-600 bg-blue-50 px-2 py-1 rounded-md">Ventas Tarjeta / QR</span>
                </div>
            </div>

            {/* FIADO CARD */}
            <div className="rounded-2xl bg-white border border-orange-200 p-4 shadow-sm flex flex-col justify-between h-full relative overflow-hidden">
                <div className="absolute right-0 top-0 p-3 opacity-10">
                    <span className="material-symbols-outlined text-[60px] text-orange-600">menu_book</span>
                </div>
                <div>
                    <p className="font-bold text-slate-500 uppercase tracking-wider text-[10px] mb-1">Por Cobrar</p>
                    <h2 className="text-2xl font-black text-slate-900">${totalFiado.toLocaleString()}</h2>
                </div>
                <div className="mt-3">
                    <span className="text-[10px] font-bold text-orange-600 bg-orange-50 px-2 py-1 rounded-md">Créditos de Clientes</span>
                </div>
            </div>
        </div>
    );
}
