"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { supabase } from "@/lib/supabase";
import { useToast } from "@/components/ui/toast";
import { Loader2, DollarSign, ArrowRight } from "lucide-react";
import { formatCurrency } from "@/lib/utils";

interface OpenShiftModalProps {
    isOpen: boolean;
    onSuccess: () => void;
}

export function OpenShiftModal({ isOpen, onSuccess }: OpenShiftModalProps) {
    const { toast } = useToast();
    const [loading, setLoading] = useState(false);
    const [initialCash, setInitialCash] = useState<string>("");

    const handleOpenShift = async () => {
        setLoading(true);
        try {
            const { data: { session } } = await supabase.auth.getSession();
            if (!session) {
                toast("No hay sesión activa", "error");
                return;
            }

            const { data: profile } = await supabase.from('profiles').select('organization_id').eq('id', session.user.id).single();
            if (!profile?.organization_id) {
                toast("Error de organización", "error");
                return;
            }

            const baseCash = parseFloat(initialCash) || 0;

            const { error } = await supabase.from('cash_shifts').insert({
                organization_id: profile.organization_id,
                user_id: session.user.id,
                initial_cash: baseCash,
                start_time: new Date().toISOString(),
                status: 'open'
            });

            if (error) throw error;

            toast("Turno abierto exitosamente", "success");
            onSuccess();
        } catch (error: any) {
            console.error("Error opening shift:", error);
            toast(`Error al abrir turno: ${error.message}`, "error");
        } finally {
            setLoading(false);
        }
    };

    if (!isOpen) return null;

    return (
        <AnimatePresence>
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
                <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden"
                >
                    <div className="p-6">
                        <div className="flex items-center gap-3 mb-6">
                            <div className="w-10 h-10 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-600">
                                <DollarSign className="w-6 h-6" />
                            </div>
                            <div>
                                <h2 className="text-xl font-bold text-slate-900">Apertura de Caja</h2>
                                <p className="text-sm text-slate-500">Inicia un nuevo turno de ventas</p>
                            </div>
                        </div>

                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-2">Base en Efectivo</label>
                                <div className="relative">
                                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 font-bold">$</span>
                                    <input
                                        type="number"
                                        value={initialCash}
                                        onChange={(e) => setInitialCash(e.target.value)}
                                        className="w-full pl-8 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-lg font-bold text-slate-900 focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none transition-all placeholder:text-slate-300"
                                        placeholder="0"
                                        autoFocus
                                    />
                                </div>
                                <p className="text-xs text-slate-500 mt-2">
                                    Ingresa el dinero en efectivo con el que inicias el día (monedas y billetes).
                                </p>
                            </div>

                            <button
                                onClick={handleOpenShift}
                                disabled={loading}
                                className="w-full py-3 bg-[#13ec80] hover:bg-[#10d673] text-slate-900 font-bold rounded-xl shadow-lg shadow-emerald-500/20 flex items-center justify-center gap-2 transition-all active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {loading ? (
                                    <Loader2 className="w-5 h-5 animate-spin" />
                                ) : (
                                    <>
                                        Abrir Turno <ArrowRight className="w-5 h-5" />
                                    </>
                                )}
                            </button>
                        </div>
                    </div>
                </motion.div>
            </div>
        </AnimatePresence>
    );
}
