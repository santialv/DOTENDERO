"use client";

import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

const data = [
    { name: 'Ene', venta2024: 4000, venta2025: 2400 },
    { name: 'Feb', venta2024: 3000, venta2025: 1398 },
    { name: 'Mar', venta2024: 2000, venta2025: 9800 },
    { name: 'Abr', venta2024: 2780, venta2025: 3908 },
    { name: 'May', venta2024: 1890, venta2025: 4800 },
    { name: 'Jun', venta2024: 2390, venta2025: 3800 },
    { name: 'Jul', venta2024: 3490, venta2025: 4300 },
    { name: 'Ago', venta2024: 3000, venta2025: 5300 },
    { name: 'Sep', venta2024: 2000, venta2025: 6800 },
    { name: 'Oct', venta2024: 2780, venta2025: 7908 },
    { name: 'Nov', venta2024: 1890, venta2025: 8800 },
    { name: 'Dic', venta2024: 2390, venta2025: 9800 },
];

export function SalesComparisonChart() {
    return (
        <div className="w-full h-[450px] bg-white p-4 rounded-xl shadow-sm border border-slate-100">
            <div className="mb-4">
                <h3 className="text-lg font-semibold text-slate-800">Comparativo de Ventas (YoY)</h3>
                <p className="text-sm text-slate-500">Comparación mensual 2024 vs 2025</p>
            </div>
            <ResponsiveContainer width="100%" height="350px">
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
                        tickFormatter={(value) => `$${value}`}
                    />
                    <Tooltip
                        contentStyle={{ backgroundColor: '#fff', borderRadius: '8px', border: '1px solid #e2e8f0', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                        itemStyle={{ fontSize: '12px' }}
                    />
                    <Legend wrapperStyle={{ paddingTop: '20px' }} />
                    <Line
                        type="monotone"
                        dataKey="venta2024"
                        name="Ventas 2024"
                        stroke="#94a3b8"
                        strokeWidth={2}
                        dot={false}
                        strokeDasharray="5 5"
                        activeDot={{ r: 8 }}
                    />
                    <Line
                        type="monotone"
                        dataKey="venta2025"
                        name="Ventas 2025"
                        stroke="#13ec80"
                        strokeWidth={2}
                        activeDot={{ r: 8 }}
                    />
                </LineChart>
            </ResponsiveContainer>
        </div>
    );
}
