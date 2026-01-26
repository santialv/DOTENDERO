"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { supabase } from "@/lib/supabase";
import { Store, Lock, Unlock } from "lucide-react";
import { useRouter } from "next/navigation";
import { format } from "date-fns";
import { es } from "date-fns/locale";

interface CashShiftCardProps {
    organizationId: string | null;
}

export function CashShiftCard({ organizationId }: CashShiftCardProps) {
    const [shift, setShift] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const router = useRouter();

    useEffect(() => {
        if (!organizationId) return;

        const fetchShift = async () => {
            const { data, error } = await supabase.rpc("get_open_shift", { p_org_id: organizationId });
            if (error) {
                console.error("Error fetching shift:", error);
            } else {
                setShift(data);
            }
            setLoading(false);
        };

        fetchShift();
    }, [organizationId]);

    const handleAction = () => {
        if (shift) {
            router.push("/venta"); // Usually shift actions are in POS
        } else {
            // If no shift, maybe redirect to a route to open it?
            // Or open a modal? 
            // For now, redirect to POS where presumably the check happens.
            router.push("/venta");
        }
    };

    if (loading) return null;

    return (
        <Card className={`${shift ? 'bg-emerald-50 border-emerald-200 dark:bg-emerald-950/20 dark:border-emerald-900' : 'bg-gray-50 dark:bg-gray-900/50'}`}>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">Estado de Caja</CardTitle>
                <Store className={`h-4 w-4 ${shift ? 'text-emerald-500' : 'text-gray-500'}`} />
            </CardHeader>
            <CardContent>
                <div className="flex flex-col gap-2">
                    <div className="text-2xl font-bold flex items-center gap-2">
                        {shift ? (
                            <>
                                <Unlock className="h-5 w-5 text-emerald-600" />
                                <span className="text-emerald-700 dark:text-emerald-400">Abierta</span>
                            </>
                        ) : (
                            <>
                                <Lock className="h-5 w-5 text-gray-500" />
                                <span className="text-gray-600 dark:text-gray-300">Cerrada</span>
                            </>
                        )}
                    </div>
                    {shift && (
                        <p className="text-xs text-muted-foreground">
                            Desde: {format(new Date(shift.start_time), "p, d MMM", { locale: es })}
                        </p>
                    )}
                    <Button
                        size="sm"
                        variant={shift ? "default" : "outline"}
                        className="mt-2 w-full"
                        onClick={handleAction}
                    >
                        {shift ? "Ir al PV" : "Abrir Caja"}
                    </Button>
                </div>
            </CardContent>
        </Card>
    );
}
