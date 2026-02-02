"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { formatCurrency } from "@/lib/utils";
import { Loader2, Calendar, User, LayoutGrid, CheckCircle2, XCircle, ChevronRight, AlertCircle } from "lucide-react";

export function CashShiftHistory() {
    const [shifts, setShifts] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchShifts();
    }, []);

    const fetchShifts = async () => {
        setLoading(true);
        try {
            const { data: { session } } = await supabase.auth.getSession();
            if (!session) return;

            const { data: profile } = await supabase.from('profiles').select('organization_id').eq('id', session.user.id).single();
            if (!profile?.organization_id) return;

            const { data, error } = await supabase
                .from('cash_shifts')
                .select(`
                    *,
                    cash_registers(name)
                `)
                .eq('organization_id', profile.organization_id)
                .order('start_time', { ascending: false })
                .limit(50);

            if (error) {
                console.error("Supabase Error Full Detail:", JSON.stringify(error));
                throw error;
            }
            setShifts(data || []);
        } catch (error: any) {
            console.error("Error fetching shift history:", error?.message || error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) return (
        <div className="flex flex-col items-center justify-center p-12 text-slate-400">
            <Loader2 className="w-8 h-8 animate-spin mb-4" />
            <p className="font-medium">Cargando historial de turnos...</p>
        </div>
    );

    return (
        <div className="space-y-4">
            <div className="grid grid-cols-1 gap-4">
                {shifts.map((shift) => (
                    <div
                        key={shift.id}
                        className="bg-white rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-all overflow-hidden flex flex-col md:flex-row md:items-center p-4 gap-4"
                    >
                        {/* Status Icon */}
                        <div className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 ${shift.status === 'open' ? 'bg-emerald-100 text-emerald-600' : 'bg-slate-100 text-slate-400'}`}>
                            {shift.status === 'open' ? <CheckCircle2 className="w-6 h-6" /> : <XCircle className="w-6 h-6" />}
                        </div>

                        {/* Details */}
                        <div className="flex-1 space-y-1">
                            <div className="flex items-center gap-2">
                                <span className={`text-[10px] uppercase font-black px-2 py-0.5 rounded ${shift.status === 'open' ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-200 text-slate-600'}`}>
                                    {shift.status === 'open' ? 'Abierto' : 'Cerrado'}
                                </span>
                                <span className="text-sm font-bold text-slate-900 flex items-center gap-1">
                                    <LayoutGrid className="w-3.5 h-3.5 text-slate-400" />
                                    {shift.cash_registers?.name || 'Caja Desconocida'}
                                </span>
                            </div>
                            <div className="flex flex-wrap gap-x-4 gap-y-1">
                                <div className="flex items-center gap-1 text-xs text-slate-500">
                                    <User className="w-3.5 h-3.5" />
                                    {shift.profiles?.full_name || 'Usuario'}
                                </div>
                                <div className="flex items-center gap-1 text-xs text-slate-500">
                                    <Calendar className="w-3.5 h-3.5" />
                                    {new Date(shift.start_time).toLocaleString()}
                                </div>
                            </div>
                        </div>

                        {/* Financial Summary */}
                        <div className="md:text-right border-t md:border-t-0 pt-4 md:pt-0 border-slate-100 flex md:flex-col justify-between gap-4">
                            <div>
                                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Esperado</p>
                                <p className="text-sm font-bold text-slate-700">
                                    {shift.status === 'open' ? 'En curso...' : formatCurrency(shift.final_cash_expected)}
                                </p>
                            </div>
                            {shift.status === 'closed' && (
                                <div>
                                    <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Diferencia</p>
                                    <p className={`text-sm font-black ${Number(shift.difference) === 0 ? 'text-slate-700' : Number(shift.difference) > 0 ? 'text-emerald-600' : 'text-red-600'}`}>
                                        {formatCurrency(shift.difference)}
                                        {Math.abs(Number(shift.difference)) > 0 && (
                                            <AlertCircle className="w-3 h-3 inline ml-1 align-top" />
                                        )}
                                    </p>
                                </div>
                            )}
                        </div>

                        <button className="hidden md:flex w-10 h-10 items-center justify-center rounded-xl hover:bg-slate-50 text-slate-400 transition-colors">
                            <ChevronRight className="w-5 h-5" />
                        </button>
                    </div>
                ))}

                {shifts.length === 0 && (
                    <div className="text-center py-20 bg-white rounded-3xl border-2 border-dashed border-slate-200">
                        <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4 text-slate-300">
                            <Calendar className="w-8 h-8" />
                        </div>
                        <h3 className="text-lg font-bold text-slate-900">Sin historial aún</h3>
                        <p className="text-slate-500 max-w-xs mx-auto">Cuando comiences a usar las cajas y cerrar turnos, aparecerán aquí.</p>
                    </div>
                )}
            </div>
        </div>
    );
}
