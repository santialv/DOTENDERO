"use client";

import { useMemo } from "react";
import { InventoryStats } from "@/types";
import { motion } from "framer-motion";

interface InventoryStatsProps {
    stats: InventoryStats;
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

export function InventoryStatsCards({ stats }: InventoryStatsProps) {
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
            <motion.div variants={item} className="rounded-xl p-5 border border-slate-200 bg-white shadow-sm hover:shadow-md transition-shadow relative overflow-hidden">
                <div className="absolute right-0 top-0 p-3 opacity-5">
                    <span className="material-symbols-outlined text-6xl text-red-500">warning</span>
                </div>
                <p className="text-slate-500 text-sm font-medium mb-2">Bajo Stock</p>
                <div className="flex items-end justify-between">
                    <p className="text-3xl font-bold tracking-tight text-red-600">{stats.lowStockCount}</p>
                    <span className="text-xs font-bold text-red-600 bg-red-100 px-2 py-1 rounded-full">Atención</span>
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
