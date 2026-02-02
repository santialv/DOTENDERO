import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { supabase } from "@/lib/supabase";
import { useToast } from "@/components/ui/toast";
import { Loader2, DollarSign, ArrowRight, LayoutGrid } from "lucide-react";
import { formatCurrency } from "@/lib/utils";
import { useCashRegisters } from "@/hooks/useCashRegisters";

interface OpenShiftModalProps {
    isOpen: boolean;
    onSuccess: () => void;
}

export function OpenShiftModal({ isOpen, onSuccess }: OpenShiftModalProps) {
    const { toast } = useToast();
    const { registers, loading: fetchingRegisters } = useCashRegisters();
    const [loading, setLoading] = useState(false);
    const [initialCash, setInitialCash] = useState<string>("");
    const [selectedRegisterId, setSelectedRegisterId] = useState<string>("");

    useEffect(() => {
        if (registers.length > 0 && !selectedRegisterId) {
            setSelectedRegisterId(registers[0].id);
        }
    }, [registers, selectedRegisterId]);

    const handleOpenShift = async () => {
        if (!selectedRegisterId) {
            toast("Debes seleccionar una caja", "error");
            return;
        }

        setLoading(true);
        try {
            const { data: { session } } = await supabase.auth.getSession();
            if (!session) {
                toast("Error: No hay sesión activa (Client)", "error");
                setLoading(false);
                return;
            }

            const { data: profile } = await supabase.from('profiles').select('organization_id').eq('id', session.user.id).single();
            if (!profile?.organization_id) {
                toast("Error: No se encontró organización", "error");
                setLoading(false);
                return;
            }

            // check for existing shift
            const { data: existingShift } = await supabase
                .from('cash_shifts')
                .select('id')
                .eq('user_id', session.user.id)
                .eq('status', 'open')
                .maybeSingle();

            if (existingShift) {
                toast("Ya tienes un turno abierto activo.", "error");
                setLoading(false);
                return;
            }

            // check for register usage
            const { data: registerOpen } = await supabase
                .from('cash_shifts')
                .select('id, profiles(full_name)')
                .eq('register_id', selectedRegisterId)
                .eq('status', 'open')
                .maybeSingle();

            if (registerOpen) {
                const p = registerOpen.profiles as any;
                const name = Array.isArray(p) ? p[0]?.full_name : p?.full_name;
                toast(`Esta caja ya está siendo usada por ${name || 'otro usuario'}`, "error");
                setLoading(false);
                return;
            }

            const baseCash = parseFloat(initialCash) || 0;
            const { error: insertError } = await supabase.from('cash_shifts').insert({
                organization_id: profile.organization_id,
                register_id: selectedRegisterId,
                user_id: session.user.id,
                initial_cash: baseCash,
                start_time: new Date().toISOString(),
                status: 'open'
            });

            if (insertError) throw insertError;

            toast("Turno abierto correctamente", "success");
            onSuccess();
        } catch (error: any) {
            toast(`Error: ${error.message}`, "error");
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
                            {/* Register Selection */}
                            <div className="space-y-2">
                                <label className="block text-sm font-medium text-slate-700">Seleccionar Caja</label>
                                <div className="relative">
                                    <div className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">
                                        <LayoutGrid className="w-5 h-5" />
                                    </div>
                                    <select
                                        value={selectedRegisterId}
                                        onChange={(e) => setSelectedRegisterId(e.target.value)}
                                        disabled={fetchingRegisters}
                                        className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none transition-all appearance-none"
                                    >
                                        {fetchingRegisters ? (
                                            <option>Cargando cajas...</option>
                                        ) : registers.length > 0 ? (
                                            registers.map(reg => (
                                                <option key={reg.id} value={reg.id}>{reg.name}</option>
                                            ))
                                        ) : (
                                            <option value="">No hay cajas configuradas</option>
                                        )}
                                    </select>
                                </div>
                            </div>

                            {/* Initial Cash */}
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
                                    />
                                </div>
                                <p className="text-xs text-slate-500 mt-2">
                                    Ingresa el dinero en efectivo con el que inicias el día.
                                </p>
                            </div>

                            <button
                                onClick={handleOpenShift}
                                disabled={loading || fetchingRegisters || registers.length === 0}
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
