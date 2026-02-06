"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { WompiButton } from "@/components/payments/WompiButton";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";

interface Plan {
    id: string;
    name: string;
    price: number;
    features: string[];
}

interface PlanUpgradeModalProps {
    isOpen: boolean;
    onClose: () => void;
    currentPlanId: string;
}

export const PlanUpgradeModal = ({ isOpen, onClose, currentPlanId }: PlanUpgradeModalProps) => {
    const [plans, setPlans] = useState<Plan[]>([]);
    const [selectedPlan, setSelectedPlan] = useState<Plan | null>(null);
    const [cycle, setCycle] = useState<'monthly' | 'yearly'>('monthly');

    const DEFAULT_PLANS: Plan[] = [
        { id: "free", name: "Estándar (Gratis)", price: 0, features: ["Panel Administrativo", "Soporte Básico"] },
        { id: "basic", name: "Emprendedor", price: 50000, features: ["Panel Administrativo", "Soporte Prioritario", "1 Bodega", "Inventario Ilimitado"] },
        { id: "pro", name: "Empresario PRO", price: 90000, features: ["Todo lo de Emprendedor", "Soporte VIP", "Multi-Bodega", "API Access", "Reportes Avanzados"] }
    ];

    useEffect(() => {
        if (isOpen) {
            fetchPlans();
        }
    }, [isOpen]);

    const tryParse = (str: string) => {
        try {
            const parsed = JSON.parse(str);
            return Array.isArray(parsed) ? parsed : [];
        } catch (e) {
            return [];
        }
    };

    const fetchPlans = async () => {
        try {
            const { data, error } = await supabase.from('plans').select('*').eq('active', true).order('price');

            if (error) {
                console.warn("Supabase error fetching plans, using defaults:", error);
                setPlans(DEFAULT_PLANS);
                return;
            }

            if (data && data.length > 0) {
                const mapped = data.map(p => ({
                    id: p.id,
                    name: p.name,
                    price: p.price,
                    features: Array.isArray(p.features)
                        ? p.features
                        : (typeof p.features === 'string'
                            ? (tryParse(p.features) || [])
                            : [])
                }));
                setPlans(mapped);
            } else {
                console.warn("No plans found in DB, using defaults");
                setPlans(DEFAULT_PLANS);
            }
        } catch (e) {
            console.error("Critical error fetching plans:", e);
            setPlans(DEFAULT_PLANS);
        }
    };

    const getPrice = (plan: Plan) => {
        if (cycle === 'yearly') {
            return plan.price * 12 * 0.8; // 20% discount
        }
        return plan.price;
    };

    const formatCurrency = (val: number) => {
        return new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', maximumFractionDigits: 0 }).format(val);
    };

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="max-w-6xl w-[95%] max-h-[90vh] overflow-y-auto">
                <DialogHeader className="p-4 pb-2">
                    <DialogTitle className="text-xl">Mejora tu Plan</DialogTitle>
                    <DialogDescription className="text-xs">
                        Elige el plan que mejor se adapte al crecimiento de tu negocio.
                    </DialogDescription>
                </DialogHeader>

                <div className="flex justify-center my-2">
                    <div className="bg-slate-100 p-0.5 rounded-lg flex scale-90 origin-center">
                        <button
                            onClick={() => setCycle('monthly')}
                            className={`px-3 py-1 text-xs font-bold rounded-md transition-all ${cycle === 'monthly' ? 'bg-white shadow text-indigo-600' : 'text-slate-400'}`}
                        >
                            Mensual
                        </button>
                        <button
                            onClick={() => setCycle('yearly')}
                            className={`px-3 py-1 text-xs font-bold rounded-md transition-all flex items-center gap-1 ${cycle === 'yearly' ? 'bg-white shadow text-indigo-600' : 'text-slate-400'}`}
                        >
                            Anual <span className="text-[9px] bg-emerald-100 text-emerald-700 px-1 rounded-full">-20%</span>
                        </button>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-3 px-4 pb-4">
                    {plans.map((plan) => (
                        <div
                            key={plan.id}
                            className={`border rounded-xl p-3 flex flex-col relative transition-all ${selectedPlan?.id === plan.id ? 'border-2 border-indigo-600 bg-indigo-50/30' : 'border-slate-200 hover:border-slate-300'}`}
                        >
                            {plan.id === currentPlanId && (
                                <span className="absolute -top-2 left-1/2 -translate-x-1/2 bg-slate-800 text-white text-[9px] font-bold px-2 py-0.5 rounded-full uppercase tracking-widest shadow-sm whitespace-nowrap z-10">
                                    Actual
                                </span>
                            )}

                            <h3 className="text-sm font-black text-slate-800 text-center uppercase tracking-tight mb-0.5">{plan.name}</h3>
                            <div className="text-center mb-3">
                                <span className="text-2xl font-black text-slate-900">{plan.price === 0 ? 'Gratis' : formatCurrency(getPrice(plan))}</span>
                                {plan.price > 0 && <span className="text-[10px] text-slate-400 block font-medium -mt-1">/{cycle === 'monthly' ? 'mes' : 'año'}</span>}
                            </div>

                            <ul className="space-y-1.5 mb-4 flex-1 px-1">
                                {plan.features?.map((f, i) => (
                                    <li key={i} className="text-xs text-slate-600 flex items-start gap-2 leading-tight">
                                        <span className="material-symbols-outlined text-emerald-500 text-[14px] shrink-0 mt-0.5">check_circle</span>
                                        <span className="tracking-tight">{f}</span>
                                    </li>
                                ))}
                            </ul>

                            {plan.id !== currentPlanId ? (
                                <button
                                    onClick={() => setSelectedPlan(plan)}
                                    className={`w-full py-2 rounded-lg font-bold text-xs transition-all ${selectedPlan?.id === plan.id ? 'bg-indigo-600 text-white shadow-md' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}
                                >
                                    {selectedPlan?.id === plan.id ? 'Seleccionado' : 'Elegir'}
                                </button>
                            ) : (
                                <button disabled className="w-full py-2 bg-slate-50 text-slate-400 font-bold text-xs rounded-lg cursor-not-allowed border border-slate-100">
                                    Tu Plan
                                </button>
                            )}
                        </div>
                    ))}
                </div>

                {selectedPlan && selectedPlan.price > 0 && (
                    <div className="border-t border-slate-100 p-4 bg-slate-50/50 animate-in slide-in-from-bottom-2 duration-200">
                        <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
                            <div className="text-center sm:text-left">
                                <p className="text-xs text-slate-500">
                                    Plan <strong>{selectedPlan.name}</strong> <span className="text-slate-400">({cycle === 'monthly' ? 'Mensual' : 'Anual'})</span>
                                </p>
                            </div>
                            <div className="flex items-center gap-3">
                                <span className="text-lg font-black text-slate-900">{formatCurrency(getPrice(selectedPlan))}</span>
                                <WompiButton amount={getPrice(selectedPlan)} className="w-auto px-4 py-1.5 h-8 text-xs min-w-[140px]" />
                            </div>
                        </div>
                    </div>
                )}
            </DialogContent>
        </Dialog>
    );
};
