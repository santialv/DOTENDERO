"use client";

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { BarChart, Bar, YAxis, CartesianGrid, XAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';

export function TopProductsChart() {
    const [data, setData] = useState<{ name: string; ventas: number }[]>([]);
    const [loading, setLoading] = useState(true);

    const COLORS = ['#10b981', '#34d399', '#6ee7b7', '#a7f3d0', '#d1fae5'];

    useEffect(() => {
        async function loadTopProducts() {
            try {
                const now = new Date();
                const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();

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

                // 1. Get Invoice IDs for this month
                const { data: invoices } = await supabase
                    .from('invoices')
                    .select('id')
                    .eq('organization_id', orgId)
                    .gte('date', startOfMonth)
                    .neq('status', 'cancelled');

                if (!invoices || invoices.length === 0) {
                    setData([]);
                    setLoading(false);
                    return;
                }

                const invoiceIds = invoices.map(i => i.id);

                // 2. Get Items
                const { data: items } = await supabase
                    .from('invoice_items')
                    .select('product_name, quantity')
                    .in('invoice_id', invoiceIds);

                if (items) {
                    // 3. Aggregate
                    const counts: { [key: string]: number } = {};
                    items.forEach(item => {
                        counts[item.product_name] = (counts[item.product_name] || 0) + item.quantity;
                    });

                    // 4. Sort & Format
                    const sorted = Object.entries(counts)
                        .map(([name, ventas]) => ({ name, ventas })) // Abbreviate name if needed? Bar chart handles it ok usually
                        .sort((a, b) => b.ventas - a.ventas)
                        .slice(0, 5);

                    setData(sorted);
                }
            } catch (e) {
                console.error(e);
            } finally {
                setLoading(false);
            }
        }
        loadTopProducts();
    }, []);

    return (
        <div className="w-full h-[450px] bg-white p-4 rounded-xl shadow-sm border border-slate-100">
            <div className="mb-4">
                <h3 className="text-lg font-semibold text-slate-800">Top 5 Productos Más Vendidos</h3>
                <p className="text-sm text-slate-500">Ranking por unidades vendidas este mes</p>
            </div>
            {loading ? (
                <div className="h-[350px] w-full flex items-center justify-center text-slate-400">Cargando...</div>
            ) : data.length === 0 ? (
                <div className="h-[350px] w-full flex items-center justify-center text-slate-400">No hay datos suficientes este mes</div>
            ) : (
                <ResponsiveContainer width="100%" height={350}>
                    <BarChart
                        layout="vertical"
                        data={data}
                        margin={{
                            top: 5,
                            right: 50,
                            left: 60,
                            bottom: 20,
                        }}
                    >
                        <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} stroke="#f1f5f9" />
                        <XAxis type="number" hide domain={[0, 'dataMax + 2']} />
                        <YAxis
                            dataKey="name"
                            type="category"
                            axisLine={false}
                            tickLine={false}
                            tick={{ fill: '#64748b', fontSize: 12 }}
                            width={100}
                        />
                        <Tooltip
                            cursor={{ fill: 'transparent' }}
                            contentStyle={{ backgroundColor: '#fff', borderRadius: '8px', border: '1px solid #e2e8f0', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                        />
                        <Bar dataKey="ventas" radius={[0, 4, 4, 0]} barSize={32}>
                            {data.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length] || '#10b981'} />
                            ))}
                        </Bar>
                    </BarChart>
                </ResponsiveContainer>
            )}
        </div>
    );
}
