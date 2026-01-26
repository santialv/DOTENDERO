"use client";

import { useEffect, useState } from "react";
import { Bar, BarChart, ResponsiveContainer, XAxis, YAxis, Tooltip } from "recharts";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { supabase } from "@/lib/supabase";
import { subDays, format, startOfDay, endOfDay } from "date-fns";
import { es } from "date-fns/locale";

interface SalesChartProps {
    organizationId: string | null;
}

export function SalesChart({ organizationId }: SalesChartProps) {
    const [data, setData] = useState<{ day: string; total: number }[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!organizationId) return;

        const fetchSalesData = async () => {
            const endDate = endOfDay(new Date());
            const startDate = startOfDay(subDays(endDate, 6)); // Last 7 days including today

            const { data: invoices, error } = await supabase
                .from("invoices")
                .select("total, created_at")
                .eq("organization_id", organizationId)
                //.eq("status", "paid") // Assuming we only count paid invoices. 
                // Removed status check for now if statuses vary, typically 'paid' is what we want.
                // Re-adding status check if status column exists and is used consistently.
                // Based on previous file reads, 'status' exists.
                .eq("status", "paid")
                .gte("created_at", startDate.toISOString())
                .lte("created_at", endDate.toISOString());

            if (error) {
                console.error("Error fetching sales data:", error);
                setLoading(false);
                return;
            }

            // Aggregate by day
            const groupedData: Record<string, number> = {};

            // Initialize last 7 days with 0
            for (let i = 0; i < 7; i++) {
                const date = subDays(endDate, i);
                const key = format(date, "EEE", { locale: es }); // Mon, Tue, etc.
                // We might want full date for sorting but display short name
                // Let's use ISO date string for key and format later, or just keep order reversed.
                // Simpler: Just map 0-6 days back.
            }

            const chartData = Array.from({ length: 7 }).map((_, i) => {
                const date = subDays(new Date(), 6 - i);
                return {
                    date: format(date, "yyyy-MM-dd"),
                    displayDate: format(date, "EEE", { locale: es }), // Lun, Mar
                    total: 0
                };
            });

            invoices?.forEach((invoice) => {
                const invoiceDate = format(new Date(invoice.created_at), "yyyy-MM-dd");
                const dayEntry = chartData.find(d => d.date === invoiceDate);
                if (dayEntry) {
                    dayEntry.total += invoice.total;
                }
            });

            setData(chartData.map(d => ({
                day: d.displayDate.charAt(0).toUpperCase() + d.displayDate.slice(1), // Capitalize
                total: d.total
            })));
            setLoading(false);
        };

        fetchSalesData();
    }, [organizationId]);

    return (
        <Card>
            <CardHeader>
                <CardTitle>Ventas Semanales</CardTitle>
                <CardDescription>
                    Comportamiento de ventas de los últimos 7 días.
                </CardDescription>
            </CardHeader>
            <CardContent className="pl-2">
                <div className="h-[240px] w-full">
                    {loading ? (
                        <div className="flex h-full items-center justify-center text-sm text-muted-foreground">
                            Cargando datos...
                        </div>
                    ) : (
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={data}>
                                <XAxis
                                    dataKey="day"
                                    stroke="#888888"
                                    fontSize={12}
                                    tickLine={false}
                                    axisLine={false}
                                />
                                <YAxis
                                    stroke="#888888"
                                    fontSize={12}
                                    tickLine={false}
                                    axisLine={false}
                                    tickFormatter={(value) => `$${value}`}
                                />
                                <Tooltip
                                    formatter={(value: any) =>
                                        new Intl.NumberFormat("es-CO", {
                                            style: "currency",
                                            currency: "COP",
                                            maximumFractionDigits: 0
                                        }).format(Number(value))
                                    }
                                    labelStyle={{ color: "black" }}
                                />
                                <Bar
                                    dataKey="total"
                                    fill="currentColor"
                                    radius={[4, 4, 0, 0]}
                                    className="fill-primary"
                                />
                            </BarChart>
                        </ResponsiveContainer>
                    )}
                </div>
            </CardContent>
        </Card>
    );
}
