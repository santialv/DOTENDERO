"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { useToast } from "@/components/ui/toast";

interface Plan {
    id: string;
    name: string;
    price: number;
    active: boolean;
    features: any;
}

export default function PlanesPage() {
    const { toast } = useToast();
    const [plans, setPlans] = useState<Plan[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchPlans();
    }, []);

    const fetchPlans = async () => {
        try {
            const { data, error } = await supabase
                .from('plans')
                .select('*')
                .order('price');

            if (error) throw error;

            if (data) {
                const mappedPlans = data.map(p => {
                    const features = p.features || {};
                    return {
                        id: p.id,
                        name: p.name,
                        price: p.price,
                        active: p.active,
                        features: typeof features === 'string' ? JSON.parse(features) : features
                    };
                });

                if (mappedPlans.length === 0) {
                    setPlans([
                        { id: "free", name: "Estándar (Gratis)", price: 0, active: true, features: { max_users: 1, max_registers: 1 } },
                        { id: "basic", name: "Emprendedor", price: 50000, active: true, features: { max_users: 2, max_registers: 1 } },
                        { id: "pro", name: "Empresario PRO", price: 90000, active: true, features: { max_users: 5, max_registers: 99 } },
                    ]);
                } else {
                    setPlans(mappedPlans);
                }
            }
        } catch (error) {
            console.error(error);
            toast("Error al cargar planes", "error");
        } finally {
            setLoading(false);
        }
    };

    const handlePriceChange = (id: string, newPrice: number) => {
        setPlans(plans.map(p => p.id === id ? { ...p, price: newPrice } : p));
    };

    const saveChanges = async () => {
        try {
            setLoading(true);
            const updates = plans.map(p => ({
                id: p.id,
                name: p.name,
                price: p.price,
                active: p.active,
                // We keep existing features or defaults
                features: p.features
            }));

            const { error } = await supabase.from('plans').upsert(updates);

            if (error) throw error;

            toast("Precios actualizados correctamente", "success");
        } catch (error) {
            console.error(error);
            toast("Error al guardar cambios", "error");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="h-screen overflow-y-auto bg-slate-50 font-sans text-slate-900">
            <nav className="bg-slate-900 text-white px-8 py-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <Link href="/admin" className="flex h-8 w-8 items-center justify-center rounded bg-[#13ec80] text-slate-900 hover:opacity-90 transition-opacity">
                        <span className="material-symbols-outlined text-xl">arrow_back</span>
                    </Link>
                    <div>
                        <h1 className="text-xl font-bold leading-none">DonTendero <span className="text-[#13ec80]">ADMIN</span></h1>
                        <p className="text-xs text-slate-400">Gestión de Planes y Precios</p>
                    </div>
                </div>
            </nav>

            <main className="p-8 max-w-5xl mx-auto">
                <div className="flex justify-between items-end mb-8">
                    <div>
                        <h2 className="text-3xl font-black text-slate-900">Planes de Suscripción</h2>
                        <p className="text-slate-500">Configura los precios y límites de tu SaaS.</p>
                    </div>
                    <button
                        onClick={saveChanges}
                        disabled={loading}
                        className="bg-[#13ec80] text-slate-900 px-6 py-2 rounded-lg text-sm font-bold shadow-lg shadow-[#13ec80]/20 hover:bg-[#0fd671] transition-all disabled:opacity-50"
                    >
                        {loading ? 'Guardando...' : 'Guardar Cambios'}
                    </button>
                </div>

                {/* Legal Notice */}
                <div className="bg-blue-50 border border-blue-100 rounded-xl p-4 mb-8 flex items-start gap-3">
                    <span className="material-symbols-outlined text-blue-600">info</span>
                    <div>
                        <h4 className="font-bold text-blue-900 text-sm mb-1">Política de Cambio de Precios</h4>
                        <p className="text-xs text-blue-700 leading-relaxed">
                            Cualquier cambio de precio realizado aquí se aplicará a los clientes existentes
                            <strong> en su próximo ciclo de facturación</strong>. Los nuevos clientes verán el precio actualizado inmediatamente.
                        </p>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {plans.map((plan) => (
                        <div key={plan.id} className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 relative group hover:border-[#13ec80] transition-colors">
                            <div className="absolute top-4 right-4">
                                <label className="relative inline-flex items-center cursor-pointer">
                                    <input
                                        type="checkbox"
                                        className="sr-only peer"
                                        checked={plan.active}
                                        onChange={(e) => setPlans(plans.map(p => p.id === plan.id ? { ...p, active: e.target.checked } : p))}
                                    />
                                    <div className="w-9 h-5 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-[#13ec80]"></div>
                                </label>
                            </div>

                            <div className="h-10 w-10 bg-slate-100 rounded-lg flex items-center justify-center text-slate-500 font-bold text-xl mb-4">
                                {plan.name.charAt(0)}
                            </div>

                            <div className="space-y-4">
                                <div>
                                    <label className="block text-xs font-bold text-slate-700 mb-1 uppercase tracking-wider">Nombre del Plan</label>
                                    <input
                                        type="text"
                                        value={plan.name}
                                        onChange={(e) => setPlans(plans.map(p => p.id === plan.id ? { ...p, name: e.target.value } : p))}
                                        className="w-full px-4 py-2 rounded-lg border border-slate-200 font-bold text-slate-900 focus:ring-2 focus:ring-[#13ec80] outline-none mb-3"
                                    />
                                </div>

                                <div>
                                    <label className="block text-xs font-bold text-slate-700 mb-1 uppercase tracking-wider">Precio Mensual (COP)</label>
                                    <div className="relative">
                                        <span className="absolute left-3 top-2 text-slate-400 font-bold">$</span>
                                        <input
                                            type="number"
                                            value={plan.price}
                                            onChange={(e) => handlePriceChange(plan.id, Number(e.target.value))}
                                            className="w-full pl-7 pr-4 py-2 rounded-lg border border-slate-200 font-bold text-slate-900 focus:ring-2 focus:ring-[#13ec80] outline-none"
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-xs font-bold text-slate-700 mb-1 uppercase tracking-wider">Límite Usuarios</label>
                                    <input
                                        type="number"
                                        value={plan.features?.max_users || 1}
                                        onChange={(e) => setPlans(plans.map(p => p.id === plan.id ? {
                                            ...p,
                                            features: { ...p.features, max_users: Number(e.target.value) }
                                        } : p))}
                                        className="w-full px-4 py-2 rounded-lg border border-slate-200 font-medium text-slate-600 focus:ring-2 focus:ring-[#13ec80] outline-none mb-3"
                                    />
                                </div>

                                <div>
                                    <label className="block text-xs font-bold text-slate-700 mb-1 uppercase tracking-wider">Límite Cajas / Bodegas</label>
                                    <input
                                        type="number"
                                        value={plan.features?.max_registers || 1}
                                        onChange={(e) => setPlans(plans.map(p => p.id === plan.id ? {
                                            ...p,
                                            features: { ...p.features, max_registers: Number(e.target.value) }
                                        } : p))}
                                        className="w-full px-4 py-2 rounded-lg border border-slate-200 font-medium text-slate-600 focus:ring-2 focus:ring-[#13ec80] outline-none"
                                    />
                                </div>
                            </div>

                            <div className="mt-6 pt-4 border-t border-slate-100">
                                <h4 className="text-xs font-bold text-slate-400 mb-2">Resumen</h4>
                                <ul className="text-xs text-slate-600 space-y-1">
                                    <li className="flex items-center gap-1">
                                        <span className="material-symbols-outlined text-[14px] text-green-500">group</span>
                                        {plan.features?.max_users || 1} Usuarios permitidos
                                    </li>
                                    <li className="flex items-center gap-1">
                                        <span className="material-symbols-outlined text-[14px] text-green-500">inventory_2</span>
                                        {plan.features?.max_registers === 99 ? 'Ilimitadas' : (plan.features?.max_registers || 1) + ' Cajas'}
                                    </li>
                                </ul>
                            </div>
                        </div>
                    ))}
                </div>
            </main>
        </div>
    );
}
