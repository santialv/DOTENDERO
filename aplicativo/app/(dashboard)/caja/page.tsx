"use client";

import { useState } from "react";
import { useTransactions } from "@/hooks/useTransactions";
import { TransactionSummaryCards } from "@/components/transactions/TransactionSummaryCards";
import { TransactionTable } from "@/components/transactions/TransactionTable";
import { TransactionFilters } from "@/components/transactions/TransactionFilters";
import { TransactionModal } from "@/components/transactions/TransactionModal";
import { CashCloseModal } from "@/components/pos/CashCloseModal";
import { TransactionType } from "@/types";
import { ExpenseModal } from "@/components/expenses/ExpenseModal";

export default function CajaPage() {
    const {
        transactions,
        filteredTransactions,
        allFilteredCount,
        stats,
        addTransaction,
        // handleCloseDay, // Deprecated in favor of Modal

        // Pagination
        page,
        setPage,
        totalPages,

        // State Pass-through
        activeTab, setActiveTab,
        showFilters, setShowFilters,
        filterDateMode, setFilterDateMode,
        searchQuery, setSearchQuery,
        filterCustomer, setFilterCustomer,
        filterMinAmount, setFilterMinAmount,
        filterMaxAmount, setFilterMaxAmount,
        startDate, setStartDate,
        endDate, setEndDate,
    } = useTransactions();

    const [isTransactionModalOpen, setIsTransactionModalOpen] = useState(false);
    const [isCashCloseModalOpen, setIsCashCloseModalOpen] = useState(false);
    const [isExpenseModalOpen, setIsExpenseModalOpen] = useState(false);
    const [transactionType, setTransactionType] = useState<TransactionType>("income");

    const openModal = (type: TransactionType) => {
        setTransactionType(type);
        setIsTransactionModalOpen(true);
    };

    const handeModalConfirm = (type: TransactionType, amount: string, description: string) => {
        addTransaction(type, amount, description);
        setIsTransactionModalOpen(false);
    };

    // Pagination Calculations for Display
    const startItem = allFilteredCount === 0 ? 0 : page * 50 + 1;
    const endItem = Math.min((page + 1) * 50, allFilteredCount);

    return (
        <div className="flex flex-col h-full bg-slate-50 font-display relative">
            {/* Header */}
            <header className="px-8 py-6 bg-white border-b border-slate-200 flex justify-between items-center sticky top-0 z-20">
                <div>
                    <h1 className="text-2xl font-black text-slate-900">Control de Caja</h1>
                    <p className="text-slate-500 font-medium">Resumen financiero y movimientos</p>
                </div>
                <div className="flex gap-3">
                    <button
                        onClick={() => setIsExpenseModalOpen(true)}
                        className="bg-red-50 hover:bg-red-100 text-red-600 border border-red-200 font-bold py-2.5 px-5 rounded-xl transition-all active:scale-95 flex items-center gap-2"
                    >
                        <span className="material-symbols-outlined">payments</span>
                        Registrar Gasto
                    </button>
                    <button
                        onClick={() => setIsCashCloseModalOpen(true)}
                        className="bg-slate-900 hover:bg-slate-800 text-white font-bold py-2.5 px-5 rounded-xl shadow-lg shadow-slate-900/20 transition-all active:scale-95 flex items-center gap-2"
                    >
                        <span className="material-symbols-outlined">receipt_long</span>
                        Cierre del Día
                    </button>
                </div>
            </header>

            <div className="flex-1 p-8 overflow-hidden flex flex-col gap-8 custom-scrollbar overflow-y-auto">
                {/* Premium Summary Cards */}
                <TransactionSummaryCards
                    totalCash={stats.totalCash}
                    totalBank={stats.totalBank}
                    totalFiado={stats.totalFiado}
                    onOpenModal={openModal}
                />

                {/* Filters & List */}
                <div className="flex-1 bg-white rounded-3xl border border-slate-200 shadow-sm flex flex-col overflow-hidden">
                    <TransactionFilters
                        activeTab={activeTab} setActiveTab={setActiveTab}
                        showFilters={showFilters} setShowFilters={setShowFilters}
                        searchQuery={searchQuery} setSearchQuery={setSearchQuery}
                        filterCustomer={filterCustomer} setFilterCustomer={setFilterCustomer}
                        filterDateMode={filterDateMode} setFilterDateMode={setFilterDateMode}
                        filterMinAmount={filterMinAmount} setFilterMinAmount={setFilterMinAmount}
                        filterMaxAmount={filterMaxAmount} setFilterMaxAmount={setFilterMaxAmount}
                        startDate={startDate} setStartDate={setStartDate}
                        endDate={endDate} setEndDate={setEndDate}
                    />

                    <div className="flex-1 overflow-auto custom-scrollbar">
                        <TransactionTable transactions={filteredTransactions} />
                    </div>

                    {/* Pagination Footer */}
                    <div className="px-6 py-4 border-t border-slate-200 bg-slate-50 flex justify-between items-center shrink-0">
                        <span className="text-sm font-medium text-slate-500">
                            Mostrando <span className="text-slate-900 font-bold">{startItem} - {endItem}</span> de <span className="text-slate-900 font-bold">{allFilteredCount}</span> movimientos
                        </span>
                        <div className="flex gap-2">
                            <button
                                onClick={() => setPage(page - 1)}
                                disabled={page === 0}
                                className="px-4 py-2 text-sm font-bold text-slate-600 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-sm"
                            >
                                Anterior
                            </button>
                            <button
                                onClick={() => setPage(page + 1)}
                                disabled={page >= totalPages - 1} // Correct logic: if pages is 5, index 4 is last. if page(4) >= 4 -> disabled.
                                className="px-4 py-2 text-sm font-bold text-white bg-slate-900 rounded-lg hover:bg-slate-800 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg shadow-slate-900/10"
                            >
                                Siguiente
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Modal */}
            <TransactionModal
                isOpen={isTransactionModalOpen}
                onClose={() => setIsTransactionModalOpen(false)}
                type={transactionType}
                onConfirm={handeModalConfirm}
            />

            <ExpenseModal
                isOpen={isExpenseModalOpen}
                onClose={() => setIsExpenseModalOpen(false)}
            />

            <CashCloseModal
                isOpen={isCashCloseModalOpen}
                onClose={() => setIsCashCloseModalOpen(false)}
            />
        </div>
    );
}
