"use client";

import { useState } from "react";
import { useTransactions } from "@/hooks/useTransactions";
import { TransactionSummaryCards } from "@/components/transactions/TransactionSummaryCards";
import { TransactionTable } from "@/components/transactions/TransactionTable";
import { TransactionFilters } from "@/components/transactions/TransactionFilters";
import { TransactionModal } from "@/components/transactions/TransactionModal";
import { TransactionType } from "@/types";

export default function CajaPage() {
    const {
        transactions, // Original unfiltered list needed for Closing Day calculation inside hook?
        // Actually hook handles logic. We need filteredTransactions for Table.
        filteredTransactions,
        stats,
        addTransaction,
        handleCloseDay,

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
    const [transactionType, setTransactionType] = useState<TransactionType>("income");

    const openModal = (type: TransactionType) => {
        setTransactionType(type);
        setIsTransactionModalOpen(true);
    };

    const handeModalConfirm = (type: TransactionType, amount: string, description: string) => {
        addTransaction(type, amount, description);
        setIsTransactionModalOpen(false);
    };

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
                        onClick={handleCloseDay}
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
                    <TransactionTable transactions={filteredTransactions} />
                </div>
            </div>

            {/* Modal */}
            <TransactionModal
                isOpen={isTransactionModalOpen}
                onClose={() => setIsTransactionModalOpen(false)}
                type={transactionType}
                onConfirm={handeModalConfirm}
            />
        </div>
    );
}
