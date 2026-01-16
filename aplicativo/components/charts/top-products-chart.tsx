"use client";

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { BarChart, Bar, YAxis, CartesianGrid, XAxis, Tooltip, ResponsiveContainer, Cell, LabelList } from 'recharts';

export function TopProductsChart() {
    const [data, setData] = useState<{ name: string; ventas: number }[]>([]);
    const [loading, setLoading] = useState(true);

    const COLORS = ['#0f172a', '#334155', '#475569', '#64748b', '#94a3b8'];

    useEffect(() => {
        async function loadTopProducts() {
            setLoading(true);
            try {
                // Get Org Context
                const { data: { session } } = await supabase.auth.getSession();
                if (!session) return;
                const { data: profile } = await supabase.from('profiles').select('organization_id').eq('id', session.user.id).single();
                const orgId = profile?.organization_id;

                if (!orgId) { setLoading(false); return; }

                // Optimized RPC Call
                const { data: products, error } = await supabase.rpc('get_top_products_stats', {
                    p_org_id: orgId
                });

                if (error) throw error;

                if (products) {
                    const formatted = products.map((p: any) => ({
                        name: p.product_name || "Sin Nombre",
                        ventas: Number(p.total_sold) || 0
                    }));
                    setData(formatted);
                }

            } catch (e) {
                console.error("Top Products Error:", e);
            } finally {
                setLoading(false);
            }
        }
        loadTopProducts();
    }, []);

    // Custom tick to truncate long names
    const CustomYAxisTick = ({ x, y, payload }: any) => {
        let val = payload.value;
        if (val.length > 15) val = val.substring(0, 15) + '...';
        return (
            <g transform={`translate(${x},${y})`}>
                <text x={0} y={0} dy={4} textAnchor="end" fill="#64748b" fontSize={12} fontWeight={500}>
                    {val}
                </text>
            </g>
        );
    };

    return (
        <div className="w-full h-[450px] bg-white p-6 rounded-2xl shadow-sm border border-slate-100 font-display">
            <div className="mb-6 flex justify-between items-end">
                <div>
                    <h3 className="text-lg font-black text-slate-900">Top Productos</h3>
                    <p className="text-sm text-slate-500 font-medium">Los 5 más vendidos del mes</p>
                </div>
            </div>

            {loading ? (
                <div className="h-[350px] w-full bg-slate-50 rounded-xl animate-pulse"></div>
            ) : data.length === 0 ? (
                <div className="h-[350px] w-full flex flex-col items-center justify-center text-slate-400 gap-2">
                    <span className="material-symbols-outlined text-4xl opacity-20">bar_chart</span>
                    <span>No hay ventas registradas este mes</span>
                </div>
            ) : (
                <ResponsiveContainer width="100%" height={350}>
                    <BarChart
                        layout="vertical"
                        data={data}
                        margin={{ top: 5, right: 30, left: 10, bottom: 5 }}
                    >
                        <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} stroke="#f1f5f9" />
                        <XAxis type="number" hide domain={[0, 'auto']} />
                        <YAxis
                            dataKey="name"
                            type="category"
                            axisLine={false}
                            tickLine={false}
                            tick={<CustomYAxisTick />}
                            width={110}
                        />
                        <Tooltip
                            cursor={{ fill: '#f8fafc' }}
                            contentStyle={{
                                backgroundColor: '#fff',
                                borderRadius: '12px',
                                border: '1px solid #e2e8f0',
                                boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)',
                                padding: '12px'
                            }}
                            formatter={(value: number) => [<span className="font-bold text-slate-900">{value} Unidades</span>, ""]}
                        />
                        <Bar
                            dataKey="ventas"
                            radius={[0, 6, 6, 0]}
                            barSize={32}
                            animationDuration={1500}
                        >
                            {data.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                            ))}
                            <LabelList dataKey="ventas" position="right" style={{ fill: '#64748b', fontSize: '12px', fontWeight: 'bold' }} />
                        </Bar>
                    </BarChart>
                </ResponsiveContainer>
            )}
        </div>
    );
}
