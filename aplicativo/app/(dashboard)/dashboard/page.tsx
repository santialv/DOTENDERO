"use client";

import { useEffect, useState } from "react";
import { useConfiguration } from "@/hooks/useConfiguration";
import { supabase } from "@/lib/supabase";
import { SalesChart } from "@/components/dashboard/SalesChart";
import { LowStockList } from "@/components/dashboard/LowStockList";
import { CashShiftCard } from "@/components/dashboard/CashShiftCard";
import { TopProductsList } from "@/components/dashboard/TopProductsList";
import { AIReportView } from "@/components/dashboard/AIReportView";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { LayoutDashboard, Sparkles, TrendingUp, DollarSign, Package } from "lucide-react";
import { useUserRole } from "@/hooks/useUserRole";

export default function DashboardPage() {
    const { role } = useUserRole();
    const { businessInfo, loading: confLoading } = useConfiguration();
    const [stats, setStats] = useState({
        salesToday: 0,
        transactionsToday: 0,
        profitToday: 0,
        avgTicket: 0,
        lowStockCount: 0,
        topProducts: []
    });
    const [statsLoading, setStatsLoading] = useState(true);

    useEffect(() => {
        const orgId = businessInfo?.organization_id;
        if (!orgId) return;

        const fetchStats = async () => {
            setStatsLoading(true);
            const { data } = await supabase.rpc("get_dashboard_stats", { p_org_id: orgId });

            if (data && data.length > 0) {
                setStats({
                    salesToday: data[0].sales_today || 0,
                    transactionsToday: data[0].transactions_today || 0,
                    profitToday: data[0].profit_today || 0,
                    avgTicket: data[0].avg_ticket || 0,
                    lowStockCount: data[0].low_stock_count || 0,
                    topProducts: data[0].top_products || []
                });
            }
            setStatsLoading(false);
        };

        fetchStats();
    }, [businessInfo?.organization_id]);

    if (confLoading || (statsLoading && !businessInfo?.organization_id)) {
        return <div className="p-8 flex items-center justify-center">Cargando...</div>;
    }

    if (!businessInfo?.organization_id) {
        return <div className="p-8">Configura tu organización.</div>;
    }

    return (
        <div className="flex-1 space-y-4 p-8 pt-6 min-h-screen bg-slate-50/50">
            <div className="flex items-center justify-between space-y-2 mb-6">
                <div>
                    <h2 className="text-3xl font-black tracking-tight text-slate-900">Dashboard</h2>
                    <p className="text-slate-500 font-medium">Control total de su negocio</p>
                </div>
            </div>

            <Tabs defaultValue="app_stats" className="space-y-6">

                {/* TOP LEVEL TABS: SEPARATION OF APP vs AI */}
                <TabsList className={`grid w-full bg-white border border-slate-200 p-1 rounded-xl shadow-sm ${role !== 'cashier' ? 'grid-cols-2 lg:w-[400px]' : 'grid-cols-1 lg:w-[200px]'}`}>
                    <TabsTrigger value="app_stats" className="rounded-lg data-[state=active]:bg-slate-900 data-[state=active]:text-white font-bold text-slate-600 transition-all gap-2">
                        <LayoutDashboard className="w-4 h-4" />
                        Mi Negocio
                    </TabsTrigger>
                    {role !== 'cashier' && (
                        <TabsTrigger value="ai_partner" className="rounded-lg data-[state=active]:bg-indigo-600 data-[state=active]:text-white font-bold text-slate-600 transition-all gap-2">
                            <Sparkles className="w-4 h-4" />
                            Don Tendero IA
                        </TabsTrigger>
                    )}
                </TabsList>

                {/* TAB 1: MI NEGOCIO (APP STATS & CHARTS) */}
                <TabsContent value="app_stats" className="space-y-4 animate-in fade-in slide-in-from-left-4 duration-300">

                    {/* KEY METRICS ROW */}
                    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium">Venta Hoy</CardTitle>
                                <DollarSign className="h-4 w-4 text-emerald-600" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold">{new Intl.NumberFormat("es-CO", { style: "currency", currency: "COP", maximumFractionDigits: 0 }).format(stats.salesToday)}</div>
                                <p className="text-xs text-muted-foreground">Transacciones: {stats.transactionsToday}</p>
                            </CardContent>
                        </Card>
                        {role !== 'cashier' && (
                            <Card>
                                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                    <CardTitle className="text-sm font-medium">Utilidad</CardTitle>
                                    <TrendingUp className="h-4 w-4 text-blue-600" />
                                </CardHeader>
                                <CardContent>
                                    <div className="text-2xl font-bold">{new Intl.NumberFormat("es-CO", { style: "currency", currency: "COP", maximumFractionDigits: 0 }).format(stats.profitToday)}</div>
                                    <p className="text-xs text-muted-foreground">Margen real</p>
                                </CardContent>
                            </Card>
                        )}
                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium">Bajo Stock</CardTitle>
                                <Package className="h-4 w-4 text-amber-600" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold">{stats.lowStockCount}</div>
                                <p className="text-xs text-muted-foreground">Productos en alerta</p>
                            </CardContent>
                        </Card>
                        <div className="md:col-span-1">
                            <CashShiftCard organizationId={businessInfo.organization_id} />
                        </div>
                    </div>

                    {/* MAIN CHARTS AREA */}
                    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
                        <div className="col-span-4 rounded-xl border border-slate-200 bg-white shadow-sm overflow-hidden">
                            <SalesChart organizationId={businessInfo.organization_id} />
                        </div>
                        <div className="col-span-3 space-y-4">
                            <TopProductsList products={stats.topProducts || []} className="border-slate-200 shadow-sm" />
                            <LowStockList organizationId={businessInfo.organization_id} />
                        </div>
                    </div>
                </TabsContent>

                {/* TAB 2: DON TENDERO IA (FULL SCREEN AI) */}
                <TabsContent value="ai_partner" className="animate-in fade-in slide-in-from-right-4 duration-500">
                    <AIReportView organizationId={businessInfo.organization_id} />
                </TabsContent>

            </Tabs>
        </div>
    );
}
