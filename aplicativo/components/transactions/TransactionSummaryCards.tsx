"use client";

interface TransactionSummaryCardsProps {
    totalCash: number;
    totalBank: number;
    totalFiado: number;
    onOpenModal: (type: "income" | "expense") => void;
}

export function TransactionSummaryCards({ totalCash, totalBank, totalFiado, onOpenModal }: TransactionSummaryCardsProps) {
    return (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 shrink-0">
            <div className="relative overflow-hidden rounded-3xl bg-white border-2 border-[#13ec80] p-8 text-slate-900 shadow-xl shadow-[#13ec80]/10 group">
                <div className="absolute -right-6 -top-6 p-4 rounded-full bg-green-50 group-hover:scale-110 transition-transform duration-500">
                    <span className="material-symbols-outlined text-[80px] text-[#13ec80]">payments</span>
                </div>
                <div className="relative z-10">
                    <p className="font-bold text-slate-500 uppercase tracking-wider text-xs mb-1">Total en Efectivo</p>
                    <h2 className="text-4xl font-black mb-6 text-slate-900">${totalCash.toLocaleString()}</h2>
                    <div className="flex gap-2">
                        <button
                            onClick={() => onOpenModal("income")}
                            className="bg-[#13ec80] hover:bg-[#0eb562] rounded-xl px-4 py-2 text-sm font-bold flex items-center gap-1 transition-all text-slate-900 shadow-sm"
                        >
                            <span className="material-symbols-outlined text-[18px]">add</span> Ingreso
                        </button>
                        <button
                            onClick={() => onOpenModal("expense")}
                            className="bg-red-50 hover:bg-red-100 rounded-xl px-4 py-2 text-sm font-bold flex items-center gap-1 transition-all text-red-600 border border-red-100"
                        >
                            <span className="material-symbols-outlined text-[18px]">remove</span> Retiro
                        </button>
                    </div>
                </div>
            </div>

            <div className="relative overflow-hidden rounded-3xl bg-white border-2 border-blue-500 p-8 text-slate-900 shadow-xl shadow-blue-500/10 group">
                <div className="absolute -right-6 -top-6 p-4 rounded-full bg-blue-50 group-hover:scale-110 transition-transform duration-500">
                    <span className="material-symbols-outlined text-[80px] text-blue-500">account_balance</span>
                </div>
                <div className="relative z-10">
                    <p className="font-bold text-blue-500/80 uppercase tracking-wider text-xs mb-1">Bancos / Digital</p>
                    <h2 className="text-4xl font-black mb-6 text-slate-900">${totalBank.toLocaleString()}</h2>
                    <div className="h-9 flex items-center">
                        <span className="text-sm font-medium text-blue-500 bg-blue-50 px-3 py-1 rounded-lg">Transacciones Card/QR</span>
                    </div>
                </div>
            </div>

            <div className="relative overflow-hidden rounded-3xl bg-white border-2 border-orange-500 p-8 text-slate-900 shadow-xl shadow-orange-500/10 group">
                <div className="absolute -right-6 -top-6 p-4 rounded-full bg-orange-50 group-hover:scale-110 transition-transform duration-500">
                    <span className="material-symbols-outlined text-[80px] text-orange-500">menu_book</span>
                </div>
                <div className="relative z-10">
                    <p className="font-bold text-orange-500/80 uppercase tracking-wider text-xs mb-1">Cuentas por Cobrar</p>
                    <h2 className="text-4xl font-black mb-6 text-slate-900">${totalFiado.toLocaleString()}</h2>
                    <div className="h-9 flex items-center">
                        <span className="text-sm font-medium text-orange-500 bg-orange-50 px-3 py-1 rounded-lg">Fiados Pendientes</span>
                    </div>
                </div>
            </div>
        </div>
    );
}
