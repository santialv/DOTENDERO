"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Sparkles, TrendingUp, Users, Package, Lightbulb, RefreshCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

interface AIReportData {
    greeting: string;
    financial_summary: string;
    clients_insight: string;
    inventory_alert: string;
    smart_tip: string;
    mood: "happy" | "neutral" | "concerned";
}

export function AIReportView({ organizationId }: { organizationId: string }) {
    const [report, setReport] = useState<AIReportData | null>(null);
    const [loading, setLoading] = useState(true);

    const generateReport = async () => {
        setLoading(true);
        try {
            const res = await fetch('/api/ai-report', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ organizationId })
            });
            const data = await res.json();
            setReport(data);
        } catch (error) {
            console.error("Failed to generate report", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (organizationId) {
            generateReport();
        }
    }, [organizationId]);

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[400px] space-y-6 text-center animate-pulse">
                <Sparkles className="w-16 h-16 text-indigo-400 animate-spin-slow" />
                <div className="space-y-2">
                    <h3 className="text-2xl font-bold text-slate-700">Consultando con Don Tendero...</h3>
                    <p className="text-slate-500">Analizando sus ventas, inventario y clientes en tiempo real.</p>
                </div>
            </div>
        );
    }

    if (!report) return <div className="p-8 text-center">No se pudo cargar el reporte.</div>;

    const moodColor = report.mood === 'happy' ? 'text-emerald-600 bg-emerald-50 border-emerald-100' :
        report.mood === 'concerned' ? 'text-amber-600 bg-amber-50 border-amber-100' :
            'text-blue-600 bg-blue-50 border-blue-100';

    return (
        <div className="space-y-6 max-w-5xl mx-auto">
            {/* Header Greeting */}
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-3xl font-black text-slate-800 tracking-tight flex items-center gap-3">
                        <Sparkles className="text-indigo-600 w-8 h-8" />
                        {report.greeting}
                    </h2>
                    <p className="text-slate-500 mt-1">Reporte Inteligente - {new Date().toLocaleTimeString()}</p>
                </div>
                <Button onClick={generateReport} variant="outline" size="icon" title="Actualizar Análisis">
                    <RefreshCcw className="w-4 h-4" />
                </Button>
            </div>

            {/* Main Financial Insight */}
            <Card className={cn("border-2 shadow-sm", moodColor)}>
                <CardHeader>
                    <div className="flex items-center gap-2">
                        <TrendingUp className="w-6 h-6" />
                        <CardTitle className="text-lg">Balance del Día</CardTitle>
                    </div>
                </CardHeader>
                <CardContent>
                    <p className="text-xl font-medium leading-relaxed">
                        "{report.financial_summary}"
                    </p>
                </CardContent>
            </Card>

            <div className="grid md:grid-cols-2 gap-6">
                {/* Clients & Tips */}
                <Card className="bg-white shadow-sm border-slate-200">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2 text-blue-700">
                            <Users className="w-5 h-5" />
                            La Clientela
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="text-slate-600 italic">"{report.clients_insight}"</p>
                    </CardContent>
                </Card>

                <Card className="bg-white shadow-sm border-slate-200">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2 text-amber-700">
                            <Package className="w-5 h-5" />
                            Ojo al Inventario
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="text-slate-600 italic">"{report.inventory_alert}"</p>
                    </CardContent>
                </Card>
            </div>

            {/* Smart Tip */}
            <Card className="bg-gradient-to-r from-indigo-600 to-purple-700 text-white shadow-lg transform hover:scale-[1.01] transition-transform">
                <CardContent className="p-6 flex items-start gap-4">
                    <div className="p-3 bg-white/20 rounded-full shrink-0">
                        <Lightbulb className="w-8 h-8 text-yellow-300" />
                    </div>
                    <div>
                        <h4 className="font-bold text-lg mb-1 text-indigo-100 uppercase tracking-wider">Consejo de Don Tendero</h4>
                        <p className="text-lg font-medium leading-relaxed">
                            {report.smart_tip}
                        </p>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
