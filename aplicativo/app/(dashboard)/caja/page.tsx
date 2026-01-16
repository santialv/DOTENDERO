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
        <div className="flex flex-col h-full bg-slate-50 font-display relative pb-20 md:pb-0">
            {/* Header */}
            <header className="px-4 md:px-8 py-4 md:py-6 bg-white border-b border-slate-200 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 sticky top-0 z-20 shrink-0">
                <div>
                    <h1 className="text-xl md:text-2xl font-black text-slate-900">Control de Caja</h1>
                    <p className="text-sm md:text-base text-slate-500 font-medium">Resumen financiero y movimientos</p>
                </div>
                <div className="flex gap-2 md:gap-3 w-full md:w-auto">
                    <button
                        onClick={() => setIsExpenseModalOpen(true)}
                        className="flex-1 md:flex-none justify-center bg-red-50 hover:bg-red-100 text-red-600 border border-red-200 font-bold py-2 md:py-2.5 px-3 md:px-5 rounded-xl transition-all active:scale-95 flex items-center gap-2 text-sm md:text-base"
                    >
                        <span className="material-symbols-outlined text-[18px] md:text-[24px]">payments</span>
                        Registrar Gasto
                    </button>
                    <button
                        onClick={() => setIsCashCloseModalOpen(true)}
                        className="flex-1 md:flex-none justify-center bg-slate-900 hover:bg-slate-800 text-white font-bold py-2 md:py-2.5 px-3 md:px-5 rounded-xl shadow-lg shadow-slate-900/20 transition-all active:scale-95 flex items-center gap-2 text-sm md:text-base"
                    >
                        <span className="material-symbols-outlined text-[18px] md:text-[24px]">receipt_long</span>
                        <span className="hidden md:inline">Cierre del Día</span>
                        <span className="md:hidden">Cierre</span>
                    </button>
                </div>
            </header>

            {/* Main Content Area - Fixing scroll for mobile by removing conflicting overflows */}
            <div className="flex-1 flex flex-col overflow-hidden">
                <div className="flex-1 p-4 md:p-8 overflow-y-auto custom-scrollbar flex flex-col gap-6 md:gap-8">

                    {/* Summary Cards */}
                    <TransactionSummaryCards
                        totalCash={stats.totalCash}
                        totalBank={stats.totalBank}
                        totalFiado={stats.totalFiado}
                        onOpenModal={openModal}
                    />

                    {/* Filters & List Container */}
                    {/* On Desktop: White card with borders. On Mobile: Transparent background, no borders for cleaner feed look */}
                    <div className="flex-1 md:bg-white md:rounded-3xl md:border md:border-slate-200 md:shadow-sm flex flex-col overflow-hidden min-h-[400px]">
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

                        {/* Transaction List itself handles content */}
                        <TransactionTable transactions={filteredTransactions} />

                        {/* Pagination Footer */}
                        <div className="mt-auto px-4 md:px-6 py-4 border-t border-slate-200 md:bg-slate-50 bg-white flex justify-between items-center shrink-0 rounded-b-3xl">
                            <span className="text-xs md:text-sm font-medium text-slate-500">
                                Mostrando <span className="text-slate-900 font-bold">{startItem} - {endItem}</span> de <span className="text-slate-900 font-bold">{allFilteredCount}</span>
                            </span>
                            <div className="flex gap-2">
                                <button
                                    onClick={() => setPage(page - 1)}
                                    disabled={page === 0}
                                    className="px-3 md:px-4 py-1.5 md:py-2 text-xs md:text-sm font-bold text-slate-600 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-sm"
                                >
                                    Anterior
                                </button>
                                <button
                                    onClick={() => setPage(page + 1)}
                                    disabled={page >= totalPages - 1}
                                    className="px-3 md:px-4 py-1.5 md:py-2 text-xs md:text-sm font-bold text-white bg-slate-900 rounded-lg hover:bg-slate-800 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg shadow-slate-900/10"
                                >
                                    Siguiente
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Modals */}
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
