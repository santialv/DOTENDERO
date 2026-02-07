"use client";

import { useState, useEffect, useRef } from "react";
import { useTransactions } from "@/hooks/useTransactions";
import { useConfiguration } from "@/hooks/useConfiguration";
import { TransactionSummaryCards } from "@/components/transactions/TransactionSummaryCards";
import { TransactionTable } from "@/components/transactions/TransactionTable";
import { TransactionFilters } from "@/components/transactions/TransactionFilters";
import { TransactionModal } from "@/components/transactions/TransactionModal";
import { CashCloseModal } from "@/components/pos/CashCloseModal";
import { TransactionType } from "@/types";
import { ExpenseModal } from "@/components/expenses/ExpenseModal";
import { CashShiftHistory } from "@/components/caja/CashShiftHistory";
import { RegisterManagement } from "@/components/caja/RegisterManagement";
import { supabase } from "@/lib/supabase";
import { exportToExcel, exportToPDF, exportToTicket } from "@/utils/exportReports";
import { useToast } from "@/components/ui/toast";

type MainTab = 'transactions' | 'shifts' | 'registers';

export default function CajaPage() {
    const {
        transactions,
        filteredTransactions,
        allFilteredCount,
        stats,
        addTransaction,
        loading,
        page,
        setPage,
        totalPages,
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

    const { businessInfo } = useConfiguration();
    const { toast } = useToast();

    // Export Menu State
    const [isExportMenuOpen, setIsExportMenuOpen] = useState(false);
    const exportMenuRef = useRef<HTMLDivElement>(null);

    // Close menu when clicking outside
    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (exportMenuRef.current && !exportMenuRef.current.contains(event.target as Node)) {
                setIsExportMenuOpen(false);
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const [mainTab, setMainTab] = useState<MainTab>('transactions');
    const [userRole, setUserRole] = useState<string | null>(null);

    useEffect(() => {
        const fetchRole = async () => {
            const { data: { session } } = await supabase.auth.getSession();
            if (session?.user) {
                const { data: profile } = await supabase.from('profiles').select('role').eq('id', session.user.id).single();
                setUserRole(profile?.role || null);
            }
        };
        fetchRole();
    }, []);

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

    // Generic Export
    const handleExport = (type: 'pdf' | 'excel' | 'ticket') => {
        if (filteredTransactions.length === 0) {
            toast("No hay datos para exportar", "warning");
            return;
        }

        const options = {
            businessName: businessInfo?.name || "Mi Negocio",
            nit: businessInfo?.nit || "",
            address: businessInfo?.address || "",
            phone: businessInfo?.phone || "",
            startDate: startDate,
            endDate: endDate
        };

        if (type === 'pdf') {
            exportToPDF(filteredTransactions, options);
            toast("Generando Reporte PDF...", "info");
        } else if (type === 'excel') {
            exportToExcel(filteredTransactions);
            toast("Descargando Excel...", "success");
        } else if (type === 'ticket') {
            exportToTicket(filteredTransactions, options);
            toast("Generando Tirilla...", "info");
        }
        setIsExportMenuOpen(false);
    };

    // Pagination Calculations for Display
    const startItem = allFilteredCount === 0 ? 0 : page * 50 + 1;
    const endItem = Math.min((page + 1) * 50, allFilteredCount);

    // BRAND COLOR CONSTANT
    const BRAND_GREEN = "#13ec80";
    const BRAND_GREEN_DARK = "#0eb562";

    return (
        <div className="flex flex-col h-full bg-slate-50 font-display relative pb-20 md:pb-0">
            {/* Header Optimized */}
            <header className="px-4 md:px-8 py-3 bg-white border-b border-slate-200 sticky top-0 z-20 shrink-0 shadow-sm flex flex-col md:flex-row items-center justify-between gap-4">

                <div className="flex flex-col md:flex-row items-center gap-4 md:gap-6 w-full md:w-auto">
                    <div>
                        <h1 className="text-lg font-black text-slate-900 tracking-tight flex items-center gap-2 whitespace-nowrap">
                            Control de Caja
                            {loading && <span className="text-[10px] font-medium text-emerald-600 animate-pulse bg-green-50 px-2 py-0.5 rounded-full">Actualizando...</span>}
                        </h1>
                    </div>

                    {/* TABS CON VERDE CORPORATIVO */}
                    <div className="flex bg-slate-100 p-1 rounded-xl w-full md:w-auto border border-slate-200 overflow-x-auto custom-scrollbar">
                        <button onClick={() => setMainTab('transactions')}
                            className={`flex-1 md:flex-none px-3 py-1.5 rounded-lg font-bold text-[11px] uppercase tracking-wide transition-all 
                                ${mainTab === 'transactions' ? 'bg-[#13ec80] text-slate-900 shadow-md shadow-[#13ec80]/20' : 'text-slate-500 hover:bg-white'}`}>
                            Movimientos
                        </button>
                        <button onClick={() => setMainTab('shifts')}
                            className={`flex-1 md:flex-none px-3 py-1.5 rounded-lg font-bold text-[11px] uppercase tracking-wide transition-all 
                                ${mainTab === 'shifts' ? 'bg-[#13ec80] text-slate-900 shadow-md shadow-[#13ec80]/20' : 'text-slate-500 hover:bg-white'}`}>
                            Turnos
                        </button>
                        {userRole !== 'cashier' && (
                            <button onClick={() => setMainTab('registers')}
                                className={`flex-1 md:flex-none px-3 py-1.5 rounded-lg font-bold text-[11px] uppercase tracking-wide transition-all 
                                    ${mainTab === 'registers' ? 'bg-[#13ec80] text-slate-900 shadow-md shadow-[#13ec80]/20' : 'text-slate-500 hover:bg-white'}`}>
                                Cajas
                            </button>
                        )}
                    </div>
                </div>

                {/* Actions Group */}
                <div className="flex items-center gap-2 w-full md:w-auto overflow-visible z-50">

                    {mainTab === 'transactions' && (
                        <div className="relative" ref={exportMenuRef}>
                            <button
                                onClick={() => setIsExportMenuOpen(!isExportMenuOpen)}
                                className="bg-[#13ec80] hover:bg-[#0eb562] text-slate-900 border border-[#13ec80] font-bold py-1.5 px-4 rounded-xl transition-all active:scale-95 flex items-center gap-2 text-xs shadow-lg shadow-[#13ec80]/20 mr-2"
                            >
                                <span className="material-symbols-outlined text-[18px]">download</span>
                                Exportar
                                <span className="material-symbols-outlined text-[16px]">expand_more</span>
                            </button>

                            {/* Dropdown Menu */}
                            {isExportMenuOpen && (
                                <div className="absolute top-full right-0 mt-2 w-56 bg-white rounded-xl shadow-xl border border-slate-100 p-2 z-[100] animate-in slide-in-from-top-2 duration-200">
                                    <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest px-3 py-2">Elegir Formato</div>

                                    <button onClick={() => handleExport('excel')} className="w-full flex items-center gap-3 px-3 py-2.5 hover:bg-slate-50 rounded-lg text-slate-700 transition-colors text-left group">
                                        <div className="p-1.5 bg-green-50 rounded-md group-hover:bg-green-100 transition-colors">
                                            <span className="material-symbols-outlined text-green-600 text-[18px]">table_view</span>
                                        </div>
                                        <div className="flex flex-col">
                                            <span className="text-xs font-bold">Excel (CSV)</span>
                                            <span className="text-[10px] text-slate-400">Compatible universal</span>
                                        </div>
                                    </button>

                                    <button onClick={() => handleExport('pdf')} className="w-full flex items-center gap-3 px-3 py-2.5 hover:bg-slate-50 rounded-lg text-slate-700 transition-colors text-left group">
                                        <div className="p-1.5 bg-red-50 rounded-md group-hover:bg-red-100 transition-colors">
                                            <span className="material-symbols-outlined text-red-600 text-[18px]">picture_as_pdf</span>
                                        </div>
                                        <div className="flex flex-col">
                                            <span className="text-xs font-bold">PDF Reporte</span>
                                            <span className="text-[10px] text-slate-400">Formato A4 Estándar</span>
                                        </div>
                                    </button>

                                    <button onClick={() => handleExport('ticket')} className="w-full flex items-center gap-3 px-3 py-2.5 hover:bg-slate-50 rounded-lg text-slate-700 transition-colors text-left group">
                                        <div className="p-1.5 bg-slate-100 rounded-md group-hover:bg-slate-200 transition-colors">
                                            <span className="material-symbols-outlined text-slate-600 text-[18px]">receipt_long</span>
                                        </div>
                                        <div className="flex flex-col">
                                            <span className="text-xs font-bold">PDF Tirilla</span>
                                            <span className="text-[10px] text-slate-400">Impresora térmica (80mm)</span>
                                        </div>
                                    </button>
                                </div>
                            )}
                        </div>
                    )}

                    <button
                        onClick={() => setIsExpenseModalOpen(true)}
                        className="whitespace-nowrap flex-1 md:flex-none justify-center bg-red-50 hover:bg-red-100 text-red-600 border border-red-200 font-bold py-1.5 px-4 rounded-xl transition-all active:scale-95 flex items-center gap-2 text-xs shadow-sm"
                    >
                        <span className="material-symbols-outlined text-[18px]">payments</span>
                        Registrar Gasto
                    </button>
                </div>
            </header>

            {/* Main Content Area */}
            <div className="flex-1 flex flex-col overflow-hidden bg-slate-50/50">
                <div className="flex-1 p-4 md:p-6 overflow-hidden flex flex-col gap-4">
                    {mainTab === 'transactions' && (
                        <>
                            <TransactionSummaryCards totalCash={stats.totalCash} totalBank={stats.totalBank} totalFiado={stats.totalFiado} onOpenModal={openModal} />
                            <div className="flex-1 md:bg-white md:rounded-2xl md:border md:border-slate-200 md:shadow-sm flex flex-col overflow-hidden min-h-[400px] relative">
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
                                {loading && (
                                    <div className="w-full h-0.5 bg-green-50 overflow-hidden relative z-20">
                                        <div className="h-full bg-[#13ec80] animate-progress w-full custom-progress-bar"></div>
                                    </div>
                                )}
                                <div className="flex-1 overflow-auto custom-scrollbar relative">
                                    <TransactionTable transactions={filteredTransactions} />
                                </div>
                                <div className="mt-auto px-4 py-3 border-t border-slate-200 md:bg-slate-50 bg-white flex justify-between items-center shrink-0 z-20">
                                    <span className="text-xs font-medium text-slate-500 hidden sm:inline">
                                        Mostrando <span className="text-slate-900 font-bold">{startItem} - {endItem}</span> de <span className="text-slate-900 font-bold">{allFilteredCount}</span>
                                    </span>
                                    <div className="flex gap-2 w-full sm:w-auto justify-between sm:justify-end">
                                        <button onClick={() => setPage(page - 1)} disabled={page === 0} className="px-3 py-1 text-xs font-bold text-slate-600 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-sm">Anterior</button>
                                        <button onClick={() => setPage(page + 1)} disabled={page >= totalPages - 1} className="px-3 py-1 text-xs font-bold text-white bg-slate-900 rounded-lg hover:bg-slate-800 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg shadow-slate-900/10">Siguiente</button>
                                    </div>
                                </div>
                            </div>
                        </>
                    )}
                    {mainTab === 'shifts' && <div className="overflow-auto custom-scrollbar h-full"><CashShiftHistory /></div>}
                    {mainTab === 'registers' && <div className="overflow-auto custom-scrollbar h-full"><RegisterManagement /></div>}
                </div>
            </div>
            <TransactionModal isOpen={isTransactionModalOpen} onClose={() => setIsTransactionModalOpen(false)} type={transactionType} onConfirm={handeModalConfirm} />
            <ExpenseModal isOpen={isExpenseModalOpen} onClose={() => setIsExpenseModalOpen(false)} />
            <CashCloseModal isOpen={isCashCloseModalOpen} onClose={() => setIsCashCloseModalOpen(false)} />
        </div>
    );
}
