"use client";

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { useToast } from "@/components/ui/toast";

export default function LegalSettingsPage() {
    const { toast } = useToast();
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [terms, setTerms] = useState("");
    const [privacy, setPrivacy] = useState("");

    useEffect(() => {
        loadConfig();
    }, []);

    const loadConfig = async () => {
        try {
            const { data, error } = await supabase
                .from('platform_config')
                .select('*')
                .eq('id', 1)
                .single();

            if (data) {
                setTerms(data.terms_and_conditions || "");
                setPrivacy(data.privacy_policy || "");
            } else {
                // If table doesn't exist or is empty, fallback to defaults locally but warn user
                console.warn("No configuration found. Make sure 'platform_config' table exists.");
            }
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const handleSave = async () => {
        setSaving(true);
        try {
            // Upsert configuration (ID=1)
            const { error } = await supabase
                .from('platform_config')
                .upsert({
                    id: 1,
                    terms_and_conditions: terms,
                    privacy_policy: privacy,
                    updated_at: new Date()
                });

            if (error) throw error;
            toast("Configuración legal actualizada", "success");
        } catch (error: any) {
            console.error(error);
            toast("Error al guardar: " + error.message, "error");
        } finally {
            setSaving(false);
        }
    };

    if (loading) return <div className="p-8">Cargando configuración...</div>;

    return (
        <div className="p-8 max-w-4xl mx-auto font-display">
            <h1 className="text-3xl font-black text-slate-900 mb-2">Textos Legales</h1>
            <p className="text-slate-500 mb-8">Administra los Términos y Condiciones y la Política de Privacidad visibles para los usuarios.</p>

            <div className="space-y-8">
                {/* Terms Editor */}
                <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
                    <h2 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
                        <span className="material-symbols-outlined text-slate-400">gavel</span>
                        Términos y Condiciones
                    </h2>
                    <textarea
                        className="w-full h-64 p-4 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:ring-2 focus:ring-slate-900 outline-none transition-all font-mono text-sm"
                        placeholder="Escribe aquí los términos..."
                        value={terms}
                        onChange={e => setTerms(e.target.value)}
                    />
                    <p className="text-xs text-slate-400 mt-2 text-right">Visible en /legal/terminos</p>
                </div>

                {/* Privacy Editor */}
                <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
                    <h2 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
                        <span className="material-symbols-outlined text-slate-400">lock</span>
                        Política de Privacidad
                    </h2>
                    <textarea
                        className="w-full h-64 p-4 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:ring-2 focus:ring-slate-900 outline-none transition-all font-mono text-sm"
                        placeholder="Escribe aquí la política de privacidad..."
                        value={privacy}
                        onChange={e => setPrivacy(e.target.value)}
                    />
                    <p className="text-xs text-slate-400 mt-2 text-right">Visible en /legal/privacidad</p>
                </div>

                <div className="sticky bottom-6 flex justify-end">
                    <div className="bg-white/80 backdrop-blur-md p-2 rounded-2xl shadow-xl border border-slate-100">
                        <button
                            onClick={handleSave}
                            disabled={saving}
                            className="px-8 py-3 bg-[#13ec80] hover:bg-[#0fb863] text-slate-900 font-bold rounded-xl shadow-lg shadow-green-500/20 active:scale-95 transition-all disabled:opacity-70 flex items-center gap-2"
                        >
                            {saving ? "Guardando..." : "Publicar Cambios"}
                            {!saving && <span className="material-symbols-outlined">rocket_launch</span>}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
