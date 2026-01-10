"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { format } from "date-fns";
import Link from "next/link";
import { useParams } from "next/navigation";

export default function StoreDetailPage() {
    const params = useParams();
    const id = params.id as string;

    const [store, setStore] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (id) loadStoreDetails();
    }, [id]);

    const loadStoreDetails = async () => {
        setLoading(true);
        try {
            // Fetch Organization details
            const { data, error } = await supabase
                .from('organizations')
                .select('*')
                .eq('id', id)
                .single();

            if (error) throw error;
            setStore(data);
        } catch (error) {
            console.error("Error loading store details:", error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return <div className="p-10 text-center text-slate-500">Cargando detalles de la tienda...</div>;
    }

    if (!store) {
        return <div className="p-10 text-center text-red-500">No se encontró la tienda.</div>;
    }

    return (
        <div className="min-h-screen bg-slate-50 font-display text-slate-900 p-8">
            <div className="max-w-4xl mx-auto">
                {/* Header */}
                <div className="flex items-center gap-4 mb-8">
                    <Link href="/admin/tiendas" className="p-2 rounded-full hover:bg-slate-200 transition-colors">
                        <span className="material-symbols-outlined">arrow_back</span>
                    </Link>
                    <div>
                        <h1 className="text-3xl font-black">{store.name}</h1>
                        <p className="text-slate-500 text-sm">ID: {store.id}</p>
                    </div>
                </div>

                {/* Main Card */}
                <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden mb-6">
                    <div className="bg-slate-900 px-6 py-4 border-b border-slate-800 flex justify-between items-center text-white">
                        <h2 className="font-bold text-lg flex items-center gap-2">
                            <span className="material-symbols-outlined">storefront</span>
                            Información General
                        </h2>
                        <span className="bg-[#13ec80] text-slate-900 text-xs font-black px-2 py-1 rounded uppercase">
                            {store.subscription_plan || 'Plan Gratuito'}
                        </span>
                    </div>

                    <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-8">
                        {/* Column 1: Identity */}
                        <div className="space-y-4">
                            <div>
                                <label className="blocks text-xs font-bold text-slate-400 uppercase">Razón Social</label>
                                <p className="text-lg font-bold text-slate-900">{store.legal_name || 'No registrado'}</p>
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-slate-400 uppercase">NIT / Documento</label>
                                <p className="text-slate-700">{store.nit || 'No registrado'}</p>
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-slate-400 uppercase">Email Propietario</label>
                                <p className="text-blue-600 font-medium">{store.email || 'No registrado'}</p>
                            </div>
                        </div>

                        {/* Column 2: Contact & Location */}
                        <div className="space-y-4">
                            <div>
                                <label className="block text-xs font-bold text-slate-400 uppercase">Ciudad</label>
                                <p className="text-slate-700">{store.city || 'No registrada'}</p>
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-slate-400 uppercase">Dirección</label>
                                <p className="text-slate-700">{store.address || 'No registrada'}</p>
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-slate-400 uppercase">Teléfono</label>
                                <p className="text-slate-700">{store.phone || 'No registrado'}</p>
                            </div>
                        </div>
                    </div>

                    {/* Footer Stats */}
                    <div className="bg-slate-50 px-6 py-4 border-t border-slate-100 flex justify-between items-center">
                        <div>
                            <label className="block text-xs font-bold text-slate-400 uppercase">Fecha Registro</label>
                            <p className="text-sm font-medium text-slate-600">
                                {store.created_at ? format(new Date(store.created_at), 'dd MMM yyyy, HH:mm') : '-'}
                            </p>
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-slate-400 uppercase">Régimen</label>
                            <p className="text-sm font-medium text-slate-600">
                                {store.regime || 'No definido'}
                            </p>
                        </div>
                    </div>
                </div>

                {/* Actions */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <button className="p-4 bg-white border border-slate-200 rounded-xl hover:shadow-md transition-all flex items-center gap-3 group text-left">
                        <div className="w-10 h-10 bg-blue-100 text-blue-600 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform">
                            <span className="material-symbols-outlined">login</span>
                        </div>
                        <div>
                            <h3 className="font-bold text-slate-900">Ghost Login</h3>
                            <p className="text-xs text-slate-500">Acceder como este tenant</p>
                        </div>
                    </button>

                    <button className="p-4 bg-white border border-slate-200 rounded-xl hover:shadow-md hover:border-red-200 transition-all flex items-center gap-3 group text-left">
                        <div className="w-10 h-10 bg-red-100 text-red-600 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform">
                            <span className="material-symbols-outlined">delete</span>
                        </div>
                        <div>
                            <h3 className="font-bold text-slate-900">Eliminar Tienda</h3>
                            <p className="text-xs text-slate-500">Acción irreversible</p>
                        </div>
                    </button>
                </div>
            </div>
        </div>
    );
}
