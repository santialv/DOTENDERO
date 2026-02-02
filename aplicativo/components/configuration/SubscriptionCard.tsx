"use client";

import { useEffect, useState } from 'react';
import { useConfiguration } from "@/hooks/useConfiguration";
import { supabase } from "@/lib/supabase";
import { PlanUpgradeModal } from "./PlanUpgradeModal";
import { PlanSuccessModal } from "./PlanSuccessModal";
import { useSearchParams, useRouter } from "next/navigation";
import { verifyAndActivateSubscription } from "@/app/actions/wompi";
import { useToast } from "@/components/ui/toast";

export const SubscriptionCard = () => {
    const { businessInfo, refresh } = useConfiguration();
    const router = useRouter();
    const searchParams = useSearchParams();
    const { toast } = useToast();

    const [isUpgradeModalOpen, setIsUpgradeModalOpen] = useState(false);
    const [showSuccessModal, setShowSuccessModal] = useState(false);
    const [planDetails, setPlanDetails] = useState<any>(null);

    useEffect(() => {
        const checkPayment = async () => {
            const transactionId = searchParams.get('id');

            if (transactionId && businessInfo?.organization_id) {
                toast("Verificando estado del pago...", "info");

                try {
                    const result = await verifyAndActivateSubscription(transactionId, businessInfo.organization_id);

                    if (result.success) {
                        setShowSuccessModal(true);
                        // Clean URL
                        const newUrl = window.location.pathname;
                        window.history.replaceState({}, '', newUrl);
                        toast("¡Pago confirmado! Tu suscripción ha sido activada.", "success");

                        // Force a refresh of the organization data
                        refresh();
                    } else {
                        if (result.status === 'PENDING') {
                            toast("El pago está en proceso de validación por tu banco.", "warning");
                        } else {
                            // Show detailed error message from server
                            toast(result.message || `Error: ${result.status}`, "error");
                        }
                    }
                } catch (e) {
                    console.error("Error verifying payment:", e);
                    toast("Error verificando el pago", "error");
                }
            }
        };

        if (businessInfo?.organization_id) {
            checkPayment();
        }
    }, [searchParams, businessInfo?.organization_id, toast]);

    useEffect(() => {
        if (businessInfo?.plan) {
            fetchPlanDetails(businessInfo.plan);
        }
    }, [businessInfo]);

    const fetchPlanDetails = async (planId: string) => {
        const { data } = await supabase.from('plans').select('*').eq('id', planId).single();
        if (data) setPlanDetails(data);
    };

    const formatCurrency = (val: number) => {
        return new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', maximumFractionDigits: 0 }).format(val);
    };

    return (
        <div className="flex flex-col gap-8 font-body">

            <PlanUpgradeModal
                isOpen={isUpgradeModalOpen}
                onClose={() => setIsUpgradeModalOpen(false)}
                currentPlanId={businessInfo?.plan || 'free'}
            />

            <PlanSuccessModal
                isOpen={showSuccessModal}
                onClose={() => setShowSuccessModal(false)}
                planName={planDetails?.name || businessInfo?.plan || 'Premium'}
            />

            {/* Header Section */}
            <div className="flex flex-col gap-2">
                <div className="flex items-center gap-2 text-sm text-slate-500">
                    <span>Configuración</span>
                    <span className="material-symbols-outlined text-[14px]">chevron_right</span>
                    <span className="text-emerald-600 font-bold bg-emerald-50 px-2 py-0.5 rounded-md">Mi Suscripción</span>
                </div>
                <h1 className="text-3xl md:text-4xl font-black text-slate-900 tracking-tight">
                    Tu <span className="bg-clip-text text-transparent bg-gradient-to-r from-emerald-600 to-teal-500">Membresía</span>
                </h1>
                <p className="text-slate-500 max-w-2xl">
                    Estado actual de tu suscripción a DonTendero.
                </p>
            </div>

            {/* Main Content Grid */}
            <div className="grid grid-cols-1 gap-8">
                {/* Plan Details & Actions */}
                <div className="flex flex-col rounded-2xl border border-slate-200 bg-white shadow-sm overflow-hidden">
                    <div className="p-8 flex flex-col gap-8 relative">
                        {/* Decorative Background */}
                        <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-emerald-50 to-teal-50 rounded-bl-full -z-0"></div>

                        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-6 relative z-10">
                            <div className="space-y-2">
                                <div className="flex items-center gap-3">
                                    <h3 className="text-slate-900 text-2xl font-black tracking-tight uppercase">
                                        {planDetails?.name || businessInfo?.plan || 'Cargando...'}
                                    </h3>
                                    <span className={`text-xs px-3 py-1 rounded-full font-bold uppercase tracking-wide flex items-center gap-1.5 shadow-sm border ${businessInfo?.subscription_status === 'active' ? 'bg-emerald-100 text-emerald-700 border-emerald-200' : 'bg-amber-100 text-amber-700 border-amber-200'}`}>
                                        <span className={`relative flex h-2 w-2`}>
                                            <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${businessInfo?.subscription_status === 'active' ? 'bg-emerald-400' : 'bg-amber-400'}`}></span>
                                            <span className={`relative inline-flex rounded-full h-2 w-2 ${businessInfo?.subscription_status === 'active' ? 'bg-emerald-500' : 'bg-amber-500'}`}></span>
                                        </span>
                                        {businessInfo?.subscription_status === 'active' ? 'Activo' : businessInfo?.subscription_status || 'Inactivo'}
                                    </span>
                                </div>
                                <p className="text-slate-500 font-medium">
                                    {businessInfo?.plan === 'free' ? 'Plan gratuito sin costo recurrente.' : 'Facturación mensual recurrente'}
                                </p>
                            </div>
                            <div className="flex flex-col items-start sm:items-end bg-slate-50 p-4 rounded-xl border border-slate-100">
                                <p className="text-slate-900 text-3xl font-black tracking-tight">{formatCurrency(planDetails?.price || 0)}</p>
                                <span className="text-slate-400 text-xs font-bold uppercase tracking-wider">/ Mensual</span>
                            </div>
                        </div>

                        {/* Feature Highlights based on plan */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-4 gap-x-8 relative z-10">
                            {planDetails?.features?.map((feature: string, idx: number) => (
                                <div key={idx} className="flex items-center gap-3 group">
                                    <div className="bg-emerald-50 p-1.5 rounded-full text-emerald-600 group-hover:scale-110 transition-transform">
                                        <span className="material-symbols-outlined text-[18px]">check</span>
                                    </div>
                                    <span className="text-sm font-medium text-slate-700">{feature}</span>
                                </div>
                            ))}
                            {(!planDetails?.features || planDetails.features.length === 0) && (
                                <p className="text-xs text-slate-400 italic">Características básicas del sistema.</p>
                            )}
                        </div>
                    </div>

                    {/* Action Bar */}
                    <div className="bg-slate-50 p-6 border-t border-slate-200 flex flex-wrap gap-6 justify-between items-center">
                        <span className="text-sm text-slate-500 font-medium">
                            ¿Necesitas más poder para tu negocio?
                        </span>
                        <button
                            onClick={() => setIsUpgradeModalOpen(true)}
                            className="relative overflow-hidden group bg-slate-900 text-white font-bold py-3 px-8 rounded-xl shadow-lg shadow-slate-500/30 hover:shadow-slate-500/50 transition-all hover:-translate-y-0.5 w-full sm:w-auto"
                        >
                            <div className="relative flex items-center justify-center gap-2">
                                <span className="material-symbols-outlined text-[20px]">upgrade</span>
                                <span>Cambiar de Plan</span>
                            </div>
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};
