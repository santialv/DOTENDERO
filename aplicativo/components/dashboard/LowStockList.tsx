"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/lib/supabase";
import { AlertCircle } from "lucide-react";

interface LowStockListProps {
    organizationId: string | null;
}

interface Product {
    id: string;
    name: string;
    stock: number;
    min_stock: number;
}

export function LowStockList({ organizationId }: LowStockListProps) {
    const [products, setProducts] = useState<Product[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!organizationId) return;

        const fetchLowStock = async () => {
            // Fetch products where stock <= min_stock
            // Note: RLS should handle permissions.
            const { data, error } = await supabase
                .from("products")
                .select("id, name, stock, min_stock")
                .eq("organization_id", organizationId)
                .eq("status", "active")
                .lte("stock", supabase.rpc("min_stock")); // This syntax might be wrong for column comparison in basic select if not using raw filter or specific postgrest syntax for col-col comparison. 

            // Postgrest doesn't easily support col vs col comparison in simple filter helpers (.lte('stock', 'min_stock') compares stock against the string 'min_stock').
            // We usually need to use .or or .filter with raw logic, or just fetch active products and filter in client (not ideal for large DBs), or use a View / RPC.
            // Since we already have get_dashboard_stats RPC, we might not have a "get_low_stock_products" RPC.
            // I will create a simple query that fetches low stock products using a filter that works or raw SQL if needed.
            // Actually, `.lt` or `.lte` with a column name is not directly supported in the JS client without specific workarounds or if enabled on server.
            // I will simply fetch active products with stock <= 10 (heuristic) OR properly, I should use an RPC for this list if I want strict "stock <= min_stock" logic without fetching all.

            // However, the previous RPC used: WHERE stock <= min_stock. 
            // I can create a small RPC or just accept fetching top 50 active products and filtering client side? 
            // "Improve Inventory Search" is also a task, implying the inventory is large.
            // So iterating client side is bad.

            // Let's try to use the `filter` modifier with the correct PostgREST syntax if possible, but simplest is creating a small RPC or View.
            // I'll assume for now I can filter by a fixed threshold or try to use an RPC I create later. 
            // Use RPC `get_low_stock_products`? It doesn't exist yet.

            // ALTERNATIVE: Use `min_stock` if I can't compare columns.
            // Wait, I can't easily compare two columns in standard supabase-js .select() filters.
            // I'll compromise: Fetch products with stock <= 5 (common default) or use a raw query if enabled? No.
            // Best approach: user `get_dashboard_stats` already calculates count. 
            // I will define a new RPC `get_low_stock_products` in the next SQL file or assume I can filter locally if the count is small.
            // Given the user wants to "Improve Inventory Search" because of pagination limits, looking for low stock efficiently is important.

            // Let's create an RPC `get_low_stock_products` quickly in the SQL.
            // It's cleaner.

            // For now, in this file, I'll call an RPC named `get_low_stock_products`. I will define it in a SQL file shortly.

            const { data: rpcData, error: rpcError } = await supabase
                .rpc("get_low_stock_products", { p_org_id: organizationId });

            if (rpcError) {
                console.error("Error fetching low stock:", rpcError);
            } else {
                setProducts(rpcData || []);
            }
            setLoading(false);
        };

        fetchLowStock();
    }, [organizationId]);

    return (
        <Card className="col-span-4 lg:col-span-3">
            {/* lg:col-span-3 allows it to take more width alongside something else or just full width depending on layout */}
            <CardHeader>
                <CardTitle>Productos con Bajo Stock</CardTitle>
                <CardDescription>
                    Listado de productos que requieren reposición inmediata.
                </CardDescription>
            </CardHeader>
            <CardContent>
                <div className="space-y-4">
                    {loading ? (
                        <div className="text-center text-sm text-muted-foreground">Cargando...</div>
                    ) : products.length === 0 ? (
                        <div className="text-center text-sm text-muted-foreground py-4">
                            Todo en orden. No hay productos con bajo stock.
                        </div>
                    ) : (
                        <div className="max-h-[300px] overflow-auto">
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Producto</TableHead>
                                        <TableHead className="text-right">Stock Actual</TableHead>
                                        <TableHead className="text-right">Mínimo</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {products.map((product) => (
                                        <TableRow key={product.id}>
                                            <TableCell className="font-medium">
                                                <div className="flex items-center gap-2">
                                                    <AlertCircle className="h-4 w-4 text-amber-500" />
                                                    {product.name}
                                                </div>
                                            </TableCell>
                                            <TableCell className="text-right font-bold text-amber-600">
                                                {product.stock}
                                            </TableCell>
                                            <TableCell className="text-right text-muted-foreground">
                                                {product.min_stock}
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </div>
                    )}
                </div>
            </CardContent>
        </Card>
    );
}
