"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabase";
import { useCashRegisters } from "@/hooks/useCashRegisters";
import { formatCurrency } from "@/lib/utils";
import { Loader2, Plus, LayoutGrid, Settings2, Trash2, Power } from "lucide-react";
import { useToast } from "@/components/ui/toast";

export function RegisterManagement() {
    const { registers, loading, error: hookError, refreshRegisters } = useCashRegisters();
    const { toast } = useToast();
    const [isAdding, setIsAdding] = useState(false);
    const [newName, setNewName] = useState("");
    const [saving, setSaving] = useState(false);

    const handleAddRegister = async () => {
        const nameToUse = newName.trim() || `Caja ${nextRegisterNumber}`;
        setSaving(true);
        try {
            const { data: { session } } = await supabase.auth.getSession();
            if (!session) return;
            const { data: profile } = await supabase.from('profiles').select('organization_id').eq('id', session.user.id).single();
            if (!profile?.organization_id) return;

            const { error } = await supabase.from('cash_registers').insert({
                organization_id: profile.organization_id,
                name: nameToUse,
                status: 'active'
            });

            if (error) throw error;

            toast("Caja creada", "success");
            setNewName("");
            setIsAdding(false);
            refreshRegisters();
        } catch (error: any) {
            toast(`Error: ${error.message}`, "error");
        } finally {
            setSaving(false);
        }
    };

    const handleDeleteRegister = async (id: string) => {
        if (!confirm("¿Estás seguro de que deseas eliminar esta caja? Esto no afectará los turnos pasados.")) return;
        setSaving(true);
        try {
            const { error } = await supabase.from('cash_registers').delete().eq('id', id);
            if (error) throw error;
            toast("Caja eliminada", "success");
            refreshRegisters();
        } catch (error: any) {
            toast(`Error: ${error.message}`, "error");
        } finally {
            setSaving(false);
        }
    };

    const nextRegisterNumber = registers.length + 1;

    if (loading) return (
        <div className="flex justify-center p-12 text-slate-400">
            <Loader2 className="w-8 h-8 animate-spin" />
        </div>
    );

    return (
        <div className="space-y-6">
            {hookError && (
                <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-xl flex items-center gap-3 animate-in fade-in duration-300">
                    <span className="material-symbols-outlined">error</span>
                    <p className="text-sm font-bold">Error: {hookError}</p>
                </div>
            )}
            <div className="flex justify-between items-center">
                <h3 className="font-bold text-slate-900">Configuración de Cajas</h3>
                <button
                    onClick={() => setIsAdding(true)}
                    className="flex items-center gap-2 px-4 py-2 bg-slate-900 text-white font-bold rounded-xl hover:bg-slate-800 transition-all text-sm"
                >
                    <Plus className="w-4 h-4" />
                    Nueva Caja
                </button>
            </div>

            {isAdding && (
                <div className="bg-white p-6 rounded-2xl border-2 border-slate-900/5 shadow-xl animate-in fade-in zoom-in duration-200">
                    <h4 className="font-bold text-slate-900 mb-4">Agregar Nueva Caja</h4>
                    <div className="flex gap-3">
                        <input
                            type="text"
                            value={newName}
                            onChange={(e) => setNewName(e.target.value)}
                            placeholder={`Ej: Caja ${nextRegisterNumber}...`}
                            className="flex-1 px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-slate-900/10 focus:border-slate-900 outline-none transition-all"
                            autoFocus
                        />
                        <button
                            onClick={() => setIsAdding(false)}
                            className="px-4 py-2.5 text-slate-500 font-bold hover:bg-slate-50 rounded-xl transition-all"
                        >
                            Cancelar
                        </button>
                        <button
                            onClick={handleAddRegister}
                            disabled={saving}
                            className="px-6 py-2.5 bg-[#13ec80] text-slate-900 font-bold rounded-xl hover:bg-[#10d673] disabled:opacity-50 transition-all flex items-center gap-2"
                        >
                            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : "Guardar Caja"}
                        </button>
                    </div>
                </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {registers.map((reg) => (
                    <div
                        key={reg.id}
                        className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm hover:border-slate-300 transition-all group"
                    >
                        <div className="flex justify-between items-start mb-4">
                            <div className="w-10 h-10 rounded-xl bg-slate-50 text-slate-400 flex items-center justify-center group-hover:bg-slate-900 group-hover:text-white transition-all">
                                <LayoutGrid className="w-5 h-5" />
                            </div>
                            <div className="flex gap-1">
                                <button className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-all" title="Editar">
                                    <Settings2 className="w-4 h-4" />
                                </button>
                                <button
                                    onClick={() => handleDeleteRegister(reg.id)}
                                    className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all"
                                    title="Eliminar"
                                >
                                    <Trash2 className="w-4 h-4" />
                                </button>
                            </div>
                        </div>

                        <h4 className="font-bold text-slate-900 text-lg mb-1">{reg.name}</h4>
                        <div className="flex items-center gap-2 mt-2">
                            <span className={`w-2 h-2 rounded-full ${reg.status === 'active' ? 'bg-emerald-500' : 'bg-slate-300'}`}></span>
                            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">
                                {reg.status === 'active' ? 'Operativo' : 'Inactivo'}
                            </p>
                        </div>

                        <div className="mt-6 pt-4 border-t border-slate-50 flex items-center justify-between">
                            <button className="text-xs font-bold text-slate-400 hover:text-slate-900 flex items-center gap-1 transition-colors">
                                <Power className="w-3.5 h-3.5" />
                                Desactivar
                            </button>
                            <span className="text-[10px] text-slate-300 font-medium">ID: {reg.id.slice(0, 8)}</span>
                        </div>
                    </div>
                ))}

                {registers.length === 0 && !loading && (
                    <div className="col-span-full text-center py-12 bg-slate-50 rounded-3xl border-2 border-dashed border-slate-200">
                        <p className="text-slate-400 font-medium">No hay cajas configuradas aún.</p>
                    </div>
                )}
            </div>
        </div>
    );
}
