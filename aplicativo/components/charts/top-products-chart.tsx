"use client";

import { BarChart, Bar, YAxis, CartesianGrid, XAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';

const data = [
    { name: 'Coca Cola 1.5L', ventas: 120 },
    { name: 'Arroz Diana', ventas: 98 },
    { name: 'Aceite Oleocali', ventas: 86 },
    { name: 'Leche Colanta', ventas: 80 },
    { name: 'Huevos A', ventas: 65 },
];

const COLORS = ['#10b981', '#34d399', '#6ee7b7', '#a7f3d0', '#d1fae5'];

export function TopProductsChart() {
    return (
        <div className="w-full h-[450px] bg-white p-4 rounded-xl shadow-sm border border-slate-100">
            <div className="mb-4">
                <h3 className="text-lg font-semibold text-slate-800">Top 5 Productos Más Vendidos</h3>
                <p className="text-sm text-slate-500">Ranking por unidades vendidas este mes</p>
            </div>
            <ResponsiveContainer width="100%" height="350px">
                <BarChart
                    layout="vertical"
                    data={data}
                    margin={{
                        top: 5,
                        right: 50, // Increased to prevent overflow
                        left: 60, // Increased for product names
                        bottom: 20,
                    }}
                >
                    <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} stroke="#f1f5f9" />
                    <XAxis type="number" hide domain={[0, 'dataMax + 20']} />
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
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                    </Bar>
                </BarChart>
            </ResponsiveContainer>
        </div>
    );
}
