"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { formatCurrency } from "@/lib/utils";
import { Loader2, Calendar, User, CheckCircle2, XCircle, AlertCircle, Clock, Search } from "lucide-react";
import { intervalToDuration, format } from "date-fns";
import { es } from "date-fns/locale";

// Helper component for live duration
function LiveDuration({ startTime }: { startTime: string }) {
    const [duration, setDuration] = useState("");

    useEffect(() => {
        const update = () => {
            // Validate date
            const start = new Date(startTime);
            if (isNaN(start.getTime())) return;

            const now = new Date();
            const dist = intervalToDuration({ start, end: now });

            const parts = [];
            if (dist.days && dist.days > 0) parts.push(`${dist.days}d`);
            if (dist.hours && dist.hours > 0) parts.push(`${dist.hours}h`);
            parts.push(`${dist.minutes || 0}m`);

            setDuration(parts.join(" "));
        };
        update();
        const interval = setInterval(update, 60000);
        return () => clearInterval(interval);
    }, [startTime]);

    return <span className="font-mono text-xs font-bold text-emerald-600">{duration || "0m"}</span>;
}

export function CashShiftHistory() {
    const [shifts, setShifts] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    // Filters
    const [filterDate, setFilterDate] = useState("");
    const [filterUser, setFilterUser] = useState("");

    useEffect(() => {
        fetchShifts();
    }, [filterDate, filterUser]); // Reload when filters change

    const fetchShifts = async () => {
        setLoading(true);
        try {
            const { data: { session } } = await supabase.auth.getSession();
            if (!session) return;

            const { data: profile } = await supabase.from('profiles').select('organization_id').eq('id', session.user.id).single();
            if (!profile?.organization_id) return;

            // 1. Fetch Shifts (No Join on Profiles to avoid ambiguity)
            let query = supabase
                .from('cash_shifts')
                .select(`
                *,
                cash_registers(name)
            `)
                .eq('organization_id', profile.organization_id)
                .order('start_time', { ascending: false });

            if (filterDate) {
                const start = new Date(filterDate);
                const end = new Date(filterDate);
                end.setHours(23, 59, 59);
                query = query.gte('start_time', start.toISOString()).lte('start_time', end.toISOString());
            }

            const { data: shiftsData, error } = await query.limit(50);
            if (error) throw error;

            // 2. Fetch Profiles Manually for IDs found
            const userIds = Array.from(new Set(shiftsData?.map((s: any) => s.opened_by).filter(Boolean)));

            let profilesMap: Record<string, string> = {};
            if (userIds.length > 0) {
                // CAST userIds manually if TS complains, but usually supabase-js handles strings well
                // Use IN operator safely
                const { data: profilesData, error: profilesError } = await supabase
                    .from('profiles')
                    .select('id, full_name') // Ensure 'full_name' exists in your schema
                    .in('id', userIds);

                if (profilesData && !profilesError) {
                    profilesData.forEach((p: any) => {
                        // Check if full_name is undefined
                        profilesMap[p.id] = p.full_name || 'Sin Nombre';
                    });
                } else {
                    console.warn("Could not fetch profiles", profilesError);
                }
            }

            // 3. Merge Data for UI
            const enrichedShifts = shiftsData?.map((s: any) => ({
                ...s,
                // Create a virtual 'profiles' object to match previous structure
                profiles: {
                    full_name: profilesMap[s.opened_by] || 'Desconocido' // Fallback
                }
            })) || [];

            // In-memory filter for user name
            let result = enrichedShifts;
            if (filterUser) {
                const lower = filterUser.toLowerCase();
                result = result.filter((s: any) =>
                    s.profiles.full_name.toLowerCase().includes(lower)
                );
            }

            setShifts(result);
        } catch (error: any) {
            console.error("Error fetching shift history:", error?.message || error);
        } finally {
            setLoading(false);
        }
    };

    // Helper for static duration
    const getStaticDuration = (start: string, end: string) => {
        if (!end) return "-";
        const startDate = new Date(start);
        const endDate = new Date(end);
        if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) return "-";

        const dur = intervalToDuration({ start: startDate, end: endDate });
        const parts = [];
        if (dur.days && dur.days > 0) parts.push(`${dur.days}d`);
        if (dur.hours && dur.hours > 0) parts.push(`${dur.hours}h`);
        parts.push(`${dur.minutes || 0}m`);
        return parts.join(" ") || "0m";
    };

    return (
        <div className="space-y-6 h-full flex flex-col">
            {/* Filters Header */}
            <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex flex-col md:flex-row gap-4 items-end md:items-center justify-between shrink-0">
                <div className="flex flex-col md:flex-row gap-4 w-full">
                    <div className="flex-1">
                        <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1 block">Filtrar por Fecha</label>
                        <input
                            type="date"
                            className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium focus:ring-2 focus:ring-[#13ec80] outline-none"
                            value={filterDate}
                            onChange={(e) => setFilterDate(e.target.value)}
                        />
                    </div>
                </div>
                <div className="flex items-center gap-2 text-slate-400 text-xs font-medium whitespace-nowrap">
                    <span className="material-symbols-outlined text-[18px]">info</span>
                    Mostrando últimos 50
                </div>
            </div>

            {/* List */}
            {loading ? (
                <div className="flex-1 flex flex-col items-center justify-center p-12 text-slate-400">
                    <Loader2 className="w-8 h-8 animate-spin mb-4 text-[#13ec80]" />
                    <p className="font-medium">Cargando historial...</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 gap-4 overflow-y-auto pb-20 custom-scrollbar">
                    {shifts.map((shift) => (
                        <div
                            key={shift.id}
                            className={`bg-white rounded-2xl border transition-all overflow-hidden flex flex-col md:flex-row md:items-center p-4 gap-4 relative group ${shift.status === 'open' ? 'border-[#13ec80] shadow-md shadow-[#13ec80]/10' : 'border-slate-200 shadow-sm hover:border-slate-300'}`}
                        >
                            {/* Status Icon */}
                            <div className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 ${shift.status === 'open' ? 'bg-green-50 text-[#13ec80]' : 'bg-slate-100 text-slate-400'}`}>
                                {shift.status === 'open' ? <Clock className="w-6 h-6 animate-pulse" /> : <CheckCircle2 className="w-6 h-6" />}
                            </div>

                            {/* Details */}
                            <div className="flex-1 space-y-1">
                                <div className="flex flex-wrap items-center gap-2">
                                    <span className={`text-[10px] uppercase font-black px-2 py-0.5 rounded ${shift.status === 'open' ? 'bg-green-50 text-[#13ec80]' : 'bg-slate-100 text-slate-500'}`}>
                                        {shift.status === 'open' ? 'TURNO ABIERTO' : 'CERRADO'}
                                    </span>
                                    <h4 className="text-sm font-bold text-slate-900 flex items-center gap-1">
                                        {shift.cash_registers?.name || 'Caja'}
                                    </h4>
                                    <span className="text-xs text-slate-400">•</span>
                                    <div className="flex items-center gap-1 text-xs font-medium text-slate-600 bg-slate-50 px-2 py-0.5 rounded-lg border border-slate-100">
                                        <User className="w-3 h-3" />
                                        {shift.profiles?.full_name || 'Desconocido'}
                                    </div>
                                </div>

                                <div className="flex flex-wrap gap-x-6 gap-y-1 pt-1">
                                    <div className="flex items-center gap-1.5 text-xs text-slate-500">
                                        <Calendar className="w-3.5 h-3.5" />
                                        <span className="font-medium">Inicio:</span>
                                        {shift.start_time ? format(new Date(shift.start_time), "dd/MM/yy HH:mm", { locale: es }) : '-'}
                                    </div>

                                    <div className="flex items-center gap-1.5 text-xs text-slate-500">
                                        <Clock className="w-3.5 h-3.5" />
                                        <span className="font-medium">Duración:</span>
                                        {shift.status === 'open' ? (
                                            <LiveDuration startTime={shift.start_time} />
                                        ) : (
                                            <span className="font-mono font-bold text-slate-700">{getStaticDuration(shift.start_time, shift.end_time)}</span>
                                        )}
                                    </div>
                                </div>
                            </div>

                            {/* Financial Summary */}
                            <div className="md:text-right border-t md:border-t-0 pt-4 md:pt-0 border-slate-100 flex md:flex-col justify-between items-end gap-1 md:gap-4 min-w-[120px]">
                                {shift.status === 'open' ? (
                                    <div className="text-right">
                                        <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Estado Actual</p>
                                        <p className="text-sm font-bold text-[#13ec80] animate-pulse">En curso...</p>
                                    </div>
                                ) : (
                                    <>
                                        <div className="text-right">
                                            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Cierre Total</p>
                                            <p className="text-sm font-black text-slate-900">{formatCurrency(shift.final_cash_expected || 0)}</p>
                                        </div>
                                        {Number(shift.difference) !== 0 && (
                                            <div className={`px-2 py-0.5 rounded text-[10px] font-bold flex items-center gap-1 ${Number(shift.difference) > 0 ? 'bg-green-50 text-[#13ec80]' : 'bg-red-50 text-red-600'}`}>
                                                {Number(shift.difference) > 0 ? '+' : ''}{formatCurrency(shift.difference)}
                                                <AlertCircle className="w-3 h-3" />
                                            </div>
                                        )}
                                    </>
                                )}
                            </div>
                        </div>
                    ))}

                    {shifts.length === 0 && !loading && (
                        <div className="text-center py-20 bg-white rounded-3xl border-2 border-dashed border-slate-200">
                            <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4 text-slate-300">
                                <Search className="w-8 h-8" />
                            </div>
                            <h3 className="text-lg font-bold text-slate-900">No se encontraron turnos</h3>
                            <p className="text-slate-500 max-w-xs mx-auto text-sm">Prueba ajustando los filtros de fecha.</p>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}
