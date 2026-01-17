"use client";

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

export function SalesComparisonChart() {
    const [data, setData] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    const now = new Date();
    const currentYear = now.getFullYear();
    const lastYear = currentYear - 1;

    useEffect(() => {
        async function loadHistory() {
            setLoading(true);
            try {
                // Get Org Context
                const { data: { session } } = await supabase.auth.getSession();
                if (!session) return;
                const { data: profile } = await supabase.from('profiles').select('organization_id').eq('id', session.user.id).single();
                const orgId = profile?.organization_id;
                if (!orgId) return;

                // Call Optimized RPC
                const { data: stats, error } = await supabase.rpc('get_monthly_sales_stats', {
                    p_org_id: orgId,
                    p_start_year: lastYear,
                    p_end_year: currentYear
                });

                if (error) {
                    console.error("Supabase RPC Error:", error);
                    throw error;
                }

                // console.log("Stats fetched:", stats?.length); // Debug success

                if (!stats || !Array.isArray(stats)) {
                    console.warn("No stats returned or invalid format", stats);
                    setData([]);
                    return;
                }

                // Transform Flat Data to Chart Format (Group by Month)
                const months = [
                    'Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun',
                    'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'
                ];

                const chartData = months.map((m, index) => {
                    const monthIndex = index + 1; // 1-12

                    // Find values safely
                    const valCurrent = stats.find((s: any) => s.year === currentYear && s.month === monthIndex)?.total || 0;
                    const valLast = stats.find((s: any) => s.year === lastYear && s.month === monthIndex)?.total || 0;

                    return {
                        name: m,
                        [`venta${lastYear}`]: valLast,
                        [`venta${currentYear}`]: valCurrent
                    };
                });

                setData(chartData);

            } catch (e: any) {
                console.error("Chart Logic Error:", e.message || e);
            } finally {
                setLoading(false);
            }
        }
        loadHistory();
    }, [currentYear, lastYear]);

    return (
        <div className="w-full h-[450px] bg-white p-6 rounded-2xl shadow-sm border border-slate-100 font-display">
            <div className="mb-6 flex justify-between items-end">
                <div>
                    <h3 className="text-lg font-black text-slate-900">Comparativo de Ventas</h3>
                    <p className="text-sm text-slate-500 font-medium">Desempeño mensual: {lastYear} vs {currentYear}</p>
                </div>
                {loading && <span className="text-xs text-slate-400 animate-pulse">Analizando datos...</span>}
            </div>

            {loading ? (
                // Skeleton
                <div className="h-[350px] w-full bg-slate-50 rounded-xl animate-pulse"></div>
            ) : (
                <ResponsiveContainer width="100%" height={350}>
                    <LineChart
                        data={data}
                        margin={{ top: 5, right: 10, left: 0, bottom: 5 }}
                    >
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                        <XAxis
                            dataKey="name"
                            axisLine={false}
                            tickLine={false}
                            tick={{ fill: '#94a3b8', fontSize: 12, fontWeight: 500 }}
                            dy={10}
                        />
                        <YAxis
                            axisLine={false}
                            tickLine={false}
                            tick={{ fill: '#94a3b8', fontSize: 12, fontWeight: 500 }}
                            tickFormatter={(value) => {
                                if (value >= 1000000) return `$${(value / 1000000).toFixed(1)}M`;
                                if (value >= 1000) return `$${(value / 1000).toFixed(0)}k`;
                                return `$${value}`;
                            }}
                            width={45}
                        />
                        <Tooltip
                            contentStyle={{
                                backgroundColor: '#fff',
                                borderRadius: '12px',
                                border: '1px solid #e2e8f0',
                                boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)',
                                padding: '12px'
                            }}
                            itemStyle={{ fontSize: '13px', fontWeight: 'bold' }}
                            formatter={(value: any) => [`$${(Number(value) || 0).toLocaleString()}`, ""]}
                            cursor={{ stroke: '#cbd5e1', strokeWidth: 1, strokeDasharray: '4 4' }}
                        />
                        <Legend wrapperStyle={{ paddingTop: '20px', fontSize: '13px', fontWeight: 'bold' }} />

                        <Line
                            type="monotone"
                            dataKey={`venta${lastYear}`}
                            name={`${lastYear}`}
                            stroke="#94a3b8"
                            strokeWidth={2}
                            dot={false}
                            strokeDasharray="5 5"
                            activeDot={{ r: 6, fill: '#94a3b8', strokeWidth: 0 }}
                        />
                        <Line
                            type="monotone"
                            dataKey={`venta${currentYear}`}
                            name={`${currentYear} (Actual)`}
                            stroke="#0f172a"
                            strokeWidth={3}
                            activeDot={{ r: 8, fill: '#0f172a', stroke: '#fff', strokeWidth: 2 }}
                        />
                    </LineChart>
                </ResponsiveContainer>
            )}
        </div>
    );
}
