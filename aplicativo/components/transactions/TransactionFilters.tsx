"use client";

interface TransactionFiltersProps {
    activeTab: "fisico" | "bancos";
    setActiveTab: (tab: "fisico" | "bancos") => void;
    showFilters: boolean;
    setShowFilters: (show: boolean) => void;
    searchQuery: string;
    setSearchQuery: (val: string) => void;
    filterCustomer: string;
    setFilterCustomer: (val: string) => void;
    filterDateMode: string;
    setFilterDateMode: (val: any) => void;
    startDate: string;
    setStartDate: (val: string) => void;
    endDate: string;
    setEndDate: (val: string) => void;
    filterMinAmount: string;
    setFilterMinAmount: (val: string) => void;
    filterMaxAmount: string;
    setFilterMaxAmount: (val: string) => void;
}

export function TransactionFilters({
    activeTab, setActiveTab,
    showFilters, setShowFilters,
    searchQuery, setSearchQuery,
    filterCustomer, setFilterCustomer,
    filterDateMode, setFilterDateMode,
    startDate, setStartDate,
    endDate, setEndDate,
    filterMinAmount, setFilterMinAmount,
    filterMaxAmount, setFilterMaxAmount
}: TransactionFiltersProps) {
    return (
        <div className="p-4 border-b border-slate-100 flex flex-col gap-4 bg-slate-50">
            <div className="flex justify-between items-center">
                <div className="flex bg-slate-200 p-1 rounded-xl">
                    <button
                        onClick={() => setActiveTab("fisico")}
                        className={`px-4 py-2 rounded-lg text-sm font-bold transition-all ${activeTab === "fisico" ? "bg-white text-slate-900 shadow-sm" : "text-slate-500 hover:text-slate-700"}`}
                    >
                        Efectivo
                    </button>
                    <button
                        onClick={() => setActiveTab("bancos")}
                        className={`px-4 py-2 rounded-lg text-sm font-bold transition-all ${activeTab === "bancos" ? "bg-white text-slate-900 shadow-sm" : "text-slate-500 hover:text-slate-700"}`}
                    >
                        Digital / Bancos
                    </button>
                </div>

                <button
                    onClick={() => setShowFilters(!showFilters)}
                    className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold transition-all border ${showFilters ? "bg-primary/10 border-primary text-primary-dark" : "bg-white border-slate-200 text-slate-600 hover:bg-slate-100"}`}
                >
                    <span className="material-symbols-outlined">filter_list</span>
                    Filtros {showFilters ? "Activos" : "Avanzados"}
                </button>
            </div>

            {/* Collapsible Filter Panel */}
            {showFilters && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 animate-in slide-in-from-top-2 duration-200">
                    {/* Search */}
                    <div>
                        <label className="text-xs font-bold text-slate-400 uppercase mb-1 block">Buscar</label>
                        <div className="relative">
                            <span className="absolute left-3 top-1/2 -translate-y-1/2 material-symbols-outlined text-slate-400 text-[18px]">search</span>
                            <input
                                type="text"
                                placeholder="Descripción o ID..."
                                value={searchQuery}
                                onChange={e => setSearchQuery(e.target.value)}
                                className="w-full pl-9 pr-3 py-2 rounded-xl border border-slate-200 text-sm font-medium focus:border-primary outline-none"
                            />
                        </div>
                    </div>

                    {/* Customer */}
                    <div>
                        <label className="text-xs font-bold text-slate-400 uppercase mb-1 block">Cliente</label>
                        <div className="relative">
                            <span className="absolute left-3 top-1/2 -translate-y-1/2 material-symbols-outlined text-slate-400 text-[18px]">person</span>
                            <input
                                type="text"
                                placeholder="Nombre del cliente..."
                                value={filterCustomer}
                                onChange={e => setFilterCustomer(e.target.value)}
                                className="w-full pl-9 pr-3 py-2 rounded-xl border border-slate-200 text-sm font-medium focus:border-primary outline-none"
                            />
                        </div>
                    </div>

                    {/* Date Range */}
                    <div>
                        <label className="text-xs font-bold text-slate-400 uppercase mb-1 block">Rango de Fecha</label>
                        <select
                            value={filterDateMode}
                            onChange={(e) => setFilterDateMode(e.target.value as any)}
                            className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm font-medium focus:border-primary outline-none bg-white mb-2"
                        >
                            <option value="hoy">Hoy</option>
                            <option value="semana">Esta Semana</option>
                            <option value="mes">Este Mes</option>
                            <option value="custom">Personalizado</option>
                        </select>
                        {filterDateMode === "custom" && (
                            <div className="flex gap-2">
                                <input
                                    type="date"
                                    value={startDate}
                                    onChange={e => setStartDate(e.target.value)}
                                    className="w-full px-2 py-1 rounded-lg border border-slate-200 text-xs"
                                />
                                <input
                                    type="date"
                                    value={endDate}
                                    onChange={e => setEndDate(e.target.value)}
                                    className="w-full px-2 py-1 rounded-lg border border-slate-200 text-xs"
                                />
                            </div>
                        )}
                    </div>

                    {/* Amount Range */}
                    <div>
                        <label className="text-xs font-bold text-slate-400 uppercase mb-1 block">Monto</label>
                        <div className="flex items-center gap-2">
                            <input
                                type="number"
                                placeholder="Min"
                                value={filterMinAmount}
                                onChange={e => setFilterMinAmount(e.target.value)}
                                className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm font-medium focus:border-primary outline-none"
                            />
                            <span className="text-slate-400">-</span>
                            <input
                                type="number"
                                placeholder="Max"
                                value={filterMaxAmount}
                                onChange={e => setFilterMaxAmount(e.target.value)}
                                className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm font-medium focus:border-primary outline-none"
                            />
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
