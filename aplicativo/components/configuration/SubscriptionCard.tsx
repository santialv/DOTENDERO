"use client";

import { useEffect, useState } from 'react';
import { useConfiguration } from "@/hooks/useConfiguration";
import { supabase } from "@/lib/supabase";
import { PlanUpgradeModal } from "./PlanUpgradeModal";
import { PlanSuccessModal } from "./PlanSuccessModal";
import { useSearchParams, useRouter } from "next/navigation";
import { verifyAndActivateSubscription } from "@/app/actions/wompi";
import { useToast } from "@/components/ui/toast";

// --- THEME DEFINITIONS ---
const THEMES: Record<string, any> = {
    free: {
        bgGradient: "from-slate-50 to-gray-100",
        headerGradient: "from-slate-500 to-gray-600",
        badge: "bg-slate-100 text-slate-600 border-slate-200",
        icon: "text-slate-400",
        price: "text-slate-700",
        border: "border-slate-200"
    },
    basic: {
        bgGradient: "from-blue-50 to-indigo-50",
        headerGradient: "from-blue-600 to-indigo-500",
        badge: "bg-blue-100 text-blue-700 border-blue-200",
        icon: "text-blue-500",
        price: "text-blue-900",
        border: "border-blue-200"
    },
    pro: {
        bgGradient: "from-emerald-50 to-teal-50",
        headerGradient: "from-emerald-600 to-teal-500",
        badge: "bg-emerald-100 text-emerald-700 border-emerald-200",
        icon: "text-emerald-500",
        price: "text-emerald-900",
        border: "border-emerald-200"
    }
};

export const SubscriptionCard = () => {
    const { businessInfo, refresh } = useConfiguration();
    const router = useRouter();
    const searchParams = useSearchParams();
    const { toast } = useToast();

    const [isUpgradeModalOpen, setIsUpgradeModalOpen] = useState(false);
    const [showSuccessModal, setShowSuccessModal] = useState(false);
    const [planDetails, setPlanDetails] = useState<any>(null);
    const [successPlanName, setSuccessPlanName] = useState("");

    // Fallback states for better robustness
    const [directPlan, setDirectPlan] = useState<any>(null);
    const [rescuedOrgId, setRescuedOrgId] = useState<string>("");

    // --- PAYMENT VERIFICATION (SECURE) ---
    const checkPayment = async (manualId?: string) => {
        const transactionId = manualId || searchParams.get('id');
        const targetId = businessInfo?.organization_id || rescuedOrgId;

        // Ensure we always have an ID for verification
        if (!targetId && transactionId) {
            toast("Error: No se encuentra ID de organización. Intenta recargar la página.", "error");
            return;
        }

        if (transactionId && targetId) {
            toast("Verificando estado del pago...", "info");
            try {
                const result = await verifyAndActivateSubscription(transactionId, targetId);
                if (result.success) {
                    setSuccessPlanName("Plan Pro"); // Assume Pro success
                    setShowSuccessModal(true);
                    toast("¡Pago confirmado! 🚀", "success");

                    // Allow UI to update
                    setTimeout(() => refresh(), 1000);
                } else {
                    if (result.status === 'PENDING') toast("Tu pago está pendiente de confirmación.", "warning");
                    else toast(result.message || "Error verificando pago.", "error");
                }
            } catch (e) {
                console.error(e);
                toast("Error verificando pago.", "error");
            }
        } else if (manualId === undefined) {
            const inputId = prompt("Ingresa el ID de la transacción de Wompi:");
            if (inputId) checkPayment(inputId);
        }
    };

    useEffect(() => {
        if ((businessInfo?.organization_id || rescuedOrgId) && searchParams.get('id')) {
            checkPayment();
        }
    }, [searchParams, businessInfo?.organization_id, rescuedOrgId]);

    // --- PLAN LOADING LOGIC ---
    useEffect(() => {
        const fetchDirect = async () => {
            let targetOrgId = businessInfo?.organization_id || rescuedOrgId;

            // Rescue ID if missing from hook
            if (!targetOrgId) {
                const { data: { user } } = await supabase.auth.getUser();
                if (user) {
                    const { data: profile } = await supabase.from('profiles').select('organization_id').eq('id', user.id).single();
                    if (profile?.organization_id) {
                        setRescuedOrgId(profile.organization_id);
                        targetOrgId = profile.organization_id;
                    }
                }
            }

            if (!targetOrgId) return;

            const { data } = await supabase
                .from('organizations')
                .select('*')
                .eq('id', targetOrgId)
                .maybeSingle();

            if (data) {
                setDirectPlan(data);
            }
        };

        fetchDirect();
        const interval = setInterval(fetchDirect, 3000); // Poll slower now that it works
        return () => clearInterval(interval);
    }, [businessInfo?.organization_id]);


    const currentPlanId = directPlan?.plan || directPlan?.subscription_plan || businessInfo?.plan || 'free';
    const isFreePlan = currentPlanId === 'free';

    // Theme Selector
    const theme = THEMES[currentPlanId] || THEMES['free'];

    const displayStatus = isFreePlan ? 'active' : (directPlan?.subscription_status || businessInfo?.subscription_status || 'inactive');
    const isStatusActive = displayStatus === 'active';

    useEffect(() => {
        if (currentPlanId) {
            fetchPlanDetails(currentPlanId);
        }
    }, [currentPlanId]);

    const fetchPlanDetails = async (planId: string) => {
        if (!planId || planId === 'free') {
            setPlanDetails({
                name: 'Plan Gratuito',
                price: 0,
                features: ['Control de Inventario', 'Punto de Venta al mostrador', 'Reportes Básicos', '1 Usuario']
            });
            return;
        }

        const { data } = await supabase.from('plans').select('*').eq('id', planId).single();
        if (data) {
            setPlanDetails(data);
        } else {
            if (planId === 'pro') {
                setPlanDetails({ name: 'Plan Profesional', price: 90000, features: ['Todo Incluido', 'Soporte Premium', 'Facturación Electrónica'] });
            } else if (planId === 'basic') {
                setPlanDetails({ name: 'Plan Básico', price: 25000, features: ['Control Inventario', 'POS'] });
            } else {
                setPlanDetails({ name: 'Plan Personalizado', price: 0, features: [] });
            }
        }
    };

    const formatCurrency = (val: number) => {
        return new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', maximumFractionDigits: 0 }).format(val);
    };

    const planName = planDetails?.name || (isFreePlan ? 'Plan Gratuito' : 'Cargando...');

    // Calculate Days Remaining
    const endDate = directPlan?.subscription_end_date || businessInfo?.subscription_end_date;
    const daysRemaining = endDate ? Math.ceil((new Date(endDate).getTime() - new Date().getTime()) / (1000 * 3600 * 24)) : 0;
    const showDays = !isFreePlan && endDate;

    return (
        <div className="flex flex-col gap-8 font-body">

            <PlanUpgradeModal
                isOpen={isUpgradeModalOpen}
                onClose={() => setIsUpgradeModalOpen(false)}
                currentPlanId={currentPlanId}
            />

            <PlanSuccessModal
                isOpen={showSuccessModal}
                onClose={() => setShowSuccessModal(false)}
                planName={successPlanName || planName}
            />

            {/* Header Section */}
            <div className="flex flex-col gap-2">
                <div className="flex items-center gap-2 text-sm text-slate-500">
                    <span>Configuración</span>
                    <span className="material-symbols-outlined text-[14px]">chevron_right</span>
                    <span className={`font-bold px-2 py-0.5 rounded-md ${theme.badge}`}>Mi Suscripción</span>
                </div>
                <h1 className="text-3xl md:text-4xl font-black text-slate-900 tracking-tight">
                    Tu <span className={`bg-clip-text text-transparent bg-gradient-to-r ${theme.headerGradient}`}>Membresía</span>
                </h1>
                <p className="text-slate-500 max-w-2xl">
                    Estado actual de tu suscripción a DonTendero.
                </p>
            </div>

            {/* Main Content Grid */}
            <div className="grid grid-cols-1 gap-8">
                {/* Plan Details & Actions */}
                <div className={`flex flex-col rounded-2xl border ${theme.border} bg-white shadow-sm overflow-hidden transition-all duration-500`}>
                    <div className="p-8 flex flex-col gap-8 relative">
                        {/* Decorative Background */}
                        <div className={`absolute top-0 right-0 w-64 h-64 bg-gradient-to-br ${theme.bgGradient} rounded-bl-full -z-0 opacity-50`}></div>

                        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-6 relative z-10">
                            <div className="space-y-2">
                                <div className="flex items-center gap-3">
                                    <h3 className={`text-2xl font-black tracking-tight uppercase ${theme.price.replace('900', '800')}`}>
                                        {planName}
                                    </h3>
                                    <span className={`text-xs px-3 py-1 rounded-full font-bold uppercase tracking-wide flex items-center gap-1.5 shadow-sm border ${isStatusActive ? 'bg-green-100 text-green-700 border-green-200' : 'bg-red-100 text-red-700 border-red-200'}`}>
                                        <span className={`relative flex h-2 w-2`}>
                                            <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${isStatusActive ? 'bg-green-400' : 'bg-red-400'}`}></span>
                                            <span className={`relative inline-flex rounded-full h-2 w-2 ${isStatusActive ? 'bg-green-500' : 'bg-red-500'}`}></span>
                                        </span>
                                        {isStatusActive ? 'Activo' : 'Vencido'}
                                    </span>
                                </div>
                                <p className="text-slate-500 font-medium">
                                    {isFreePlan ? 'Disfruta de las funciones esenciales sin costo.' : 'Acceso completo a herramientas premium.'}
                                </p>
                            </div>
                            <div className={`flex flex-col items-start sm:items-end bg-slate-50 p-4 rounded-xl border border-slate-100 min-w-[150px]`}>
                                <p className={`text-3xl font-black tracking-tight ${theme.price}`}>{formatCurrency(planDetails?.price || 0)}</p>
                                <span className="text-slate-400 text-xs font-bold uppercase tracking-wider">/ Mensual</span>

                                {/* Días restantes (Solo Planes Pagos) */}
                                {showDays && (
                                    <div className="mt-3 flex flex-col items-end w-full pt-3 border-t border-slate-200">
                                        <span className="text-xs text-slate-500 font-medium whitespace-nowrap">Renovación en:</span>
                                        <span className={`text-lg font-black ${daysRemaining <= 5 ? 'text-red-500' : theme.icon}`}>
                                            {Math.max(0, daysRemaining)} días
                                        </span>
                                    </div>
                                )}
                                {isFreePlan && (
                                    <div className="mt-3 w-full border-t border-slate-200 pt-3 flex justify-end">
                                        <span className="text-xs text-slate-400 font-bold uppercase tracking-wider">De por vida</span>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Feature Highlights */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-4 gap-x-8 relative z-10">
                            {planDetails?.features?.map((feature: string, idx: number) => (
                                <div key={idx} className="flex items-center gap-3 group">
                                    <span className={`material-symbols-outlined text-[20px] ${theme.icon}`}>check_circle</span>
                                    <span className="text-sm font-medium text-slate-700">{feature}</span>
                                </div>
                            ))}
                            {(!planDetails?.features || planDetails.features.length === 0) && (
                                <p className="text-xs text-slate-400 italic">Características incluidas.</p>
                            )}
                        </div>
                    </div>

                    {/* Action Bar */}
                    <div className="bg-slate-50 p-6 border-t border-slate-200 flex flex-wrap gap-6 justify-between items-center">
                        <span className="text-sm text-slate-500 font-medium flex items-center gap-2">
                            <span className="material-symbols-outlined text-slate-400">help</span>
                            ¿Necesitas ayuda con tu plan?
                        </span>

                        <div className="flex flex-wrap gap-4 w-full sm:w-auto">
                            <button
                                onClick={() => checkPayment()}
                                className="px-5 py-2.5 rounded-xl border border-slate-300 text-slate-600 font-bold hover:bg-white hover:text-slate-800 hover:border-slate-400 transition-all flex items-center gap-2 active:scale-95 text-sm"
                            >
                                <span className="material-symbols-outlined text-sm">sync</span>
                                <span>Verificar pago</span>
                            </button>

                            <button
                                onClick={() => setIsUpgradeModalOpen(true)}
                                className={`relative overflow-hidden group text-white font-bold py-3 px-8 rounded-xl shadow-lg transition-all hover:-translate-y-0.5 w-full sm:w-auto flex-1 sm:flex-initial flex items-center justify-center gap-2 ${currentPlanId === 'pro' ? 'bg-slate-900 shadow-slate-500/30' : 'bg-emerald-600 shadow-emerald-500/30 hover:bg-emerald-500'
                                    }`}
                            >
                                <span className="material-symbols-outlined text-[20px]">upgrade</span>
                                <span>{currentPlanId === 'free' ? 'Mejorar mi Plan' : 'Cambiar de Plan'}</span>
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};
