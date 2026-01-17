"use client";

import { useMemo } from "react";
import { InventoryStats } from "@/types";
import { motion } from "framer-motion";

interface InventoryStatsProps {
    stats: InventoryStats;
    onLowStockClick?: () => void;
}

const container = {
    hidden: { opacity: 0 },
    show: {
        opacity: 1,
        transition: {
            staggerChildren: 0.1
        }
    }
};

const item = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 }
};

export function InventoryStatsCards({ stats, onLowStockClick }: InventoryStatsProps) {
    const inactivePercentage = stats.totalProducts > 0
        ? ((stats.inactiveCount / stats.totalProducts) * 100).toFixed(1)
        : "0";

    return (
        <motion.div
            variants={container}
            initial="hidden"
            animate="show"
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 shrink-0"
        >
            <motion.div variants={item} className="rounded-xl p-5 border border-slate-200 bg-white shadow-sm hover:shadow-md transition-shadow">
                <p className="text-slate-500 text-sm font-medium mb-2">Total Productos</p>
                <div className="flex items-end justify-between">
                    <p className="text-3xl font-bold tracking-tight text-slate-900">{stats.totalProducts}</p>
                </div>
            </motion.div>
            <motion.div variants={item} className="rounded-xl p-5 border border-slate-200 bg-white shadow-sm hover:shadow-md transition-shadow">
                <p className="text-slate-500 text-sm font-medium mb-2">Valor Inventario</p>
                <div className="flex items-end justify-between">
                    <p className="text-3xl font-bold tracking-tight text-slate-900">${stats.totalValue.toLocaleString()}</p>
                </div>
            </motion.div>
            <motion.div
                variants={item}
                onClick={onLowStockClick}
                className="rounded-xl p-5 border border-red-100 bg-red-50/50 hover:bg-red-50 shadow-sm hover:shadow-md hover:border-red-200 transition-all relative overflow-hidden cursor-pointer group"
            >
                <div className="absolute right-0 top-0 p-3 opacity-10 group-hover:opacity-20 transition-opacity">
                    <span className="material-symbols-outlined text-6xl text-red-500">warning</span>
                </div>
                <p className="text-red-600 text-sm font-bold mb-2 flex items-center gap-1">
                    Bajo Stock
                    <span className="material-symbols-outlined text-[16px] animate-pulse">priority_high</span>
                </p>
                <div className="flex items-end justify-between">
                    <p className="text-3xl font-bold tracking-tight text-red-700">{stats.lowStockCount}</p>
                    <span className="text-xs font-bold text-white bg-red-500 px-3 py-1 rounded-full shadow-sm group-hover:scale-105 transition-transform">Ver Todos</span>
                </div>
            </motion.div>
            <motion.div variants={item} className="rounded-xl p-5 border border-slate-200 bg-white shadow-sm hover:shadow-md transition-shadow">
                <p className="text-slate-500 text-sm font-medium mb-2">Prod. Inactivos</p>
                <div className="flex items-end justify-between">
                    <p className="text-3xl font-bold tracking-tight text-slate-900">{stats.inactiveCount}</p>
                    <span className="text-xs font-medium text-slate-500">{inactivePercentage}% del total</span>
                </div>
            </motion.div>
        </motion.div>
    );
}
