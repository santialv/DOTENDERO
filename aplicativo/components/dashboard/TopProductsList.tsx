"use client";

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";

interface TopProduct {
    product_name: string;
    total_qty: number;
    total_rev: number;
}

interface TopProductsListProps {
    products: TopProduct[];
    className?: string;
}

export function TopProductsList({ products, className }: TopProductsListProps) {
    return (
        <Card className={className}>
            <CardHeader>
                <CardTitle className="text-sm font-bold text-slate-700">Top Productos (Hoy)</CardTitle>
                <CardDescription>Lo más vendido durante el día</CardDescription>
            </CardHeader>
            <CardContent>
                <div className="space-y-4">
                    {products && products.length > 0 ? (
                        products.map((product, index) => (
                            <div key={index} className="flex items-center justify-between">
                                <div className="space-y-1">
                                    <p className="text-sm font-bold leading-none text-slate-900">{product.product_name}</p>
                                    <p className="text-xs text-slate-500">{product.total_qty} unidades vendidas</p>
                                </div>
                                <div className="font-bold text-sm text-primary">
                                    {new Intl.NumberFormat("es-CO", { style: "currency", currency: "COP", maximumFractionDigits: 0 }).format(product.total_rev)}
                                </div>
                            </div>
                        ))
                    ) : (
                        <div className="text-center py-4 text-slate-400 text-sm">No hay ventas hoy</div>
                    )}

                </div>
            </CardContent>
        </Card>
    );
}
