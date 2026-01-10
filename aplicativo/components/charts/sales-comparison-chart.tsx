"use client";

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

export function SalesComparisonChart() {
    const [data, setData] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function loadHistory() {
            setLoading(true);
            try {
                const now = new Date();
                const currentYear = now.getFullYear();
                const lastYear = currentYear - 1;

                const startDate = new Date(lastYear, 0, 1).toISOString();
                const endDate = new Date(currentYear, 11, 31).toISOString();

                // Get Org Context
                const { data: { session } } = await supabase.auth.getSession();
                if (!session) { setLoading(false); return; }
                const { data: profile } = await supabase
                    .from('profiles')
                    .select('organization_id')
                    .eq('id', session.user.id)
                    .single();
                const orgId = profile?.organization_id;
                if (!orgId) { setLoading(false); return; }

                // Fetch 2 years of data
                const { data: invoices } = await supabase
                    .from('invoices')
                    .select('total, date, status')
                    .eq('organization_id', orgId)
                    .gte('date', startDate)
                    .lte('date', endDate)
                    .neq('status', 'cancelled');

                // Initialize months structure
                const months = [
                    'Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun',
                    'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'
                ];

                const stats = months.map(m => ({
                    name: m,
                    [`venta${lastYear}`]: 0,
                    [`venta${currentYear}`]: 0
                }));

                if (invoices) {
                    invoices.forEach(inv => {
                        const d = new Date(inv.date);
                        const month = d.getMonth();
                        const year = d.getFullYear();

                        if (year === lastYear) {
                            stats[month][`venta${lastYear}`] += (inv.total || 0);
                        } else if (year === currentYear) {
                            stats[month][`venta${currentYear}`] += (inv.total || 0);
                        }
                    });
                }

                setData(stats);
            } catch (e) {
                console.error(e);
            } finally {
                setLoading(false);
            }
        }
        loadHistory();
    }, []);

    const now = new Date();
    const currentYear = now.getFullYear();
    const lastYear = currentYear - 1;

    return (
        <div className="w-full h-[450px] bg-white p-4 rounded-xl shadow-sm border border-slate-100">
            <div className="mb-4">
                <h3 className="text-lg font-semibold text-slate-800">Comparativo de Ventas (YoY)</h3>
                <p className="text-sm text-slate-500">Comparación mensual {lastYear} vs {currentYear}</p>
            </div>
            {loading ? (
                <div className="h-[350px] w-full flex items-center justify-center text-slate-400">Cargando...</div>
            ) : (
                <ResponsiveContainer width="100%" height={350}>
                    <LineChart
                        data={data}
                        margin={{
                            top: 5,
                            right: 30,
                            left: 20,
                            bottom: 40,
                        }}
                    >
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                        <XAxis
                            dataKey="name"
                            axisLine={false}
                            tickLine={false}
                            tick={{ fill: '#64748b', fontSize: 12 }}
                            dy={10}
                        />
                        <YAxis
                            axisLine={false}
                            tickLine={false}
                            tick={{ fill: '#64748b', fontSize: 12 }}
                            tickFormatter={(value) => `$${value}`} // Shorten if numbers are huge?
                        />
                        <Tooltip
                            contentStyle={{ backgroundColor: '#fff', borderRadius: '8px', border: '1px solid #e2e8f0', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                            itemStyle={{ fontSize: '12px' }}
                            formatter={(value: any) => [`$${(value || 0).toLocaleString()}`, "Ventas"]}
                        />
                        <Legend wrapperStyle={{ paddingTop: '20px' }} />
                        <Line
                            type="monotone"
                            dataKey={`venta${lastYear}`}
                            name={`Ventas ${lastYear}`}
                            stroke="#94a3b8"
                            strokeWidth={2}
                            dot={false}
                            strokeDasharray="5 5"
                            activeDot={{ r: 8 }}
                        />
                        <Line
                            type="monotone"
                            dataKey={`venta${currentYear}`}
                            name={`Ventas ${currentYear}`}
                            stroke="#10b981"
                            strokeWidth={2}
                            activeDot={{ r: 8 }}
                        />
                    </LineChart>
                </ResponsiveContainer>
            )}
        </div>
    );
}
