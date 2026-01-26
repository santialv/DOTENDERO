"use client";

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Sparkles, TrendingUp, Package, Users, BadgePercent } from "lucide-react";
import { Badge } from "@/components/ui/badge";

export function AIInsightsCard() {
    return (
        <Card className="bg-gradient-to-br from-indigo-50 via-white to-purple-50 border-indigo-200 shadow-md relative overflow-hidden group">
            {/* Background Decor */}
            <div className="absolute top-0 right-0 p-4 opacity-10 transition-transform group-hover:scale-110 duration-700">
                <Sparkles className="w-40 h-40 text-indigo-600" />
            </div>

            <CardHeader className="pb-4 border-b border-indigo-100 bg-white/50 backdrop-blur-sm">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="p-2.5 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-xl shadow-lg shadow-indigo-200">
                            <Sparkles className="w-6 h-6 text-white animate-pulse" />
                        </div>
                        <div>
                            <CardTitle className="text-xl font-black text-slate-800">Don Tendero IA</CardTitle>
                            <CardDescription className="text-indigo-600 font-semibold text-sm">
                                Su parcero digital pa' que el negocio crezca
                            </CardDescription>
                        </div>
                    </div>
                    <Badge variant="secondary" className="bg-indigo-100 text-indigo-700 border-indigo-200 font-bold px-3 py-1">
                        BETA / SIMULACIÓN
                    </Badge>
                </div>
            </CardHeader>

            <CardContent className="pt-6 grid gap-6 md:grid-cols-3">
                {/* FINANZAS - LA PLATICA */}
                <div className="space-y-3 bg-white p-4 rounded-xl border border-emerald-100 shadow-sm hover:shadow-md transition-shadow">
                    <div className="flex items-center gap-2 text-emerald-700 mb-1">
                        <TrendingUp className="w-5 h-5" />
                        <h4 className="font-bold text-sm uppercase tracking-wider">La Platica (Finanzas)</h4>
                    </div>
                    <p className="text-sm text-slate-600 leading-relaxed font-medium">
                        "¡Quiubo pues mijo! Hoy la caja está sonando bonito. Si seguimos vendiendo así esta semana, <span className="text-emerald-600 font-bold bg-emerald-50 px-1 rounded">nos cuadramos el arriendo</span> rapidito. ¡Hágale que vamos bien!"
                    </p>
                </div>

                {/* INVENTARIO - EL SURTIDO */}
                <div className="space-y-3 bg-white p-4 rounded-xl border border-amber-100 shadow-sm hover:shadow-md transition-shadow">
                    <div className="flex items-center gap-2 text-amber-600 mb-1">
                        <Package className="w-5 h-5" />
                        <h4 className="font-bold text-sm uppercase tracking-wider">El Surtido (Inventario)</h4>
                    </div>
                    <p className="text-sm text-slate-600 leading-relaxed font-medium">
                        "¡Pilas pues patrón! Se nos está acabando la <span className="text-amber-700 font-bold bg-amber-50 px-1 rounded">Cerveza y las Papitas</span>. Mejor pida eso ya pa'l fin de semana, pa' que no quedemos varados viendo chisperos."
                    </p>
                </div>

                {/* CLIENTES - LA CLIENTELA */}
                <div className="space-y-3 bg-white p-4 rounded-xl border border-blue-100 shadow-sm hover:shadow-md transition-shadow">
                    <div className="flex items-center gap-2 text-blue-600 mb-1">
                        <Users className="w-5 h-5" />
                        <h4 className="font-bold text-sm uppercase tracking-wider">La Clientela</h4>
                    </div>
                    <p className="text-sm text-slate-600 leading-relaxed font-medium">
                        "Vea, Doña Marta vino otra vez hoy. <span className="text-blue-600 font-bold bg-blue-50 px-1 rounded">Esa señora es una bendición</span>. Trátela bien y encímele una mentica pa' que siga amañada con nosotros."
                    </p>
                </div>

                {/* FOOTER NOTE */}
                <div className="md:col-span-3 text-center pt-2">
                    <p className="text-xs text-indigo-400 font-medium">
                        * Estos consejos son una muestra de lo que Don Tendero IA hará por su negocio con Google Gemini.
                    </p>
                </div>
            </CardContent>
        </Card>
    );
}
