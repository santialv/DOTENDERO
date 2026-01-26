import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DollarSign, CreditCard, TrendingUp, BarChart3 } from "lucide-react";

interface DashboardStatsProps {
    salesToday: number;
    transactionsToday: number;
    profitToday: number;
    avgTicket: number;
}

export function DashboardStats({ salesToday, transactionsToday, profitToday, avgTicket }: DashboardStatsProps) {
    const stats = [
        {
            title: "Ventas Hoy",
            value: new Intl.NumberFormat("es-CO", { style: "currency", currency: "COP", maximumFractionDigits: 0 }).format(salesToday),
            icon: DollarSign,
            description: "Facturado hoy",
            color: "text-emerald-500",
        },
        {
            title: "Ganancia Real",
            value: new Intl.NumberFormat("es-CO", { style: "currency", currency: "COP", maximumFractionDigits: 0 }).format(profitToday),
            icon: TrendingUp,
            description: "Utilidad neta (Venta - Costo)",
            color: "text-blue-500",
        },
        {
            title: "Ticket Promedio",
            value: new Intl.NumberFormat("es-CO", { style: "currency", currency: "COP", maximumFractionDigits: 0 }).format(avgTicket),
            icon: BarChart3,
            description: "Valor promedio por venta",
            color: "text-amber-500",
        },
        {
            title: "Transacciones",
            value: transactionsToday.toString(),
            icon: CreditCard,
            description: "Ventas totales hoy",
            color: "text-violet-500",
        },
    ];

    return (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            {stats.map((stat, index) => (
                <Card key={index} className="shadow-sm border-slate-100">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-bold text-slate-700">
                            {stat.title}
                        </CardTitle>
                        <stat.icon className={`h-4 w-4 ${stat.color}`} />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-black text-slate-900">{stat.value}</div>
                        <p className="text-xs text-slate-500 font-medium">
                            {stat.description}
                        </p>
                    </CardContent>
                </Card>
            ))}
        </div>
    );
}
