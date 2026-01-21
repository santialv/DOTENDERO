"use client";

import { useEffect, useState, Suspense } from "react";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { useToast } from "@/components/ui/toast";
import { WompiButton } from "@/components/payments/WompiButton";
import { Lock, CreditCard, ShieldCheck } from "lucide-react";
import { reportError } from "@/lib/error-reporting";

function AuthGuardContent({ children }: { children: React.ReactNode }) {
    const router = useRouter();
    const pathname = usePathname();
    const searchParams = useSearchParams();
    const { toast } = useToast();
    const [isAuthorized, setIsAuthorized] = useState(false);
    const [loading, setLoading] = useState(true);
    const [subscriptionInfo, setSubscriptionInfo] = useState<{ plan: string, status: string } | null>(null);
    const [verifyingPayment, setVerifyingPayment] = useState(false);

    // Check for payment return
    useEffect(() => {
        const checkPayment = async () => {
            const transactionId = searchParams?.get('id');
            const { data: { session } } = await supabase.auth.getSession();

            if (transactionId && session?.user) {
                setVerifyingPayment(true);
                toast("Verificando tu pago...", "info");

                try {
                    // We need the org ID to verify
                    const { data: profile } = await supabase
                        .from('profiles')
                        .select('organization_id')
                        .eq('id', session.user.id)
                        .single();

                    if (profile?.organization_id) {
                        const { verifyAndActivateSubscription } = await import("@/app/actions/wompi");
                        const result = await verifyAndActivateSubscription(transactionId, profile.organization_id);

                        if (result.success) {
                            toast("¡Pago exitoso! Bienvenido.", "success");
                            // Clear URL
                            const newUrl = window.location.pathname;
                            window.history.replaceState({}, '', newUrl);
                            // Force reload to update context
                            window.location.reload();
                            return;
                        } else if (result.status !== 'PENDING') {
                            toast(`Error en el pago: ${result.message}`, "error");
                        }
                    }
                } catch (e) {
                    console.error(e);
                } finally {
                    setVerifyingPayment(false);
                }
            }
        };

        checkPayment();
    }, [searchParams]);

    useEffect(() => {
        const checkSession = async () => {
            try {
                const { data: { session } } = await supabase.auth.getSession();

                if (!session) {
                    console.log("Guardián: No hay sesión, redirigiendo a login.");
                    router.replace("/login");
                    return;
                }

                // 1. Obtener Perfil y Organización
                const { data: profile } = await supabase
                    .from('profiles')
                    .select('organization_id, organizations(plan, subscription_status)')
                    .eq('id', session.user.id)
                    .maybeSingle();

                if (!profile?.organization_id) {
                    console.warn("Usuario sin tienda vinculada.");

                    if (pathname === "/onboarding") {
                        setIsAuthorized(true);
                        setLoading(false);
                        return; // Detenerse aquí si ya estamos en onboarding
                    }

                    // Solo intentamos auto-vinculación si el usuario intenta entrar a otra página
                    const { data: existingOrgs } = await supabase
                        .from("organizations")
                        .select("id")
                        .eq("email", session.user.email)
                        .limit(1);

                    if (existingOrgs && existingOrgs.length > 0) {
                        const autoOrgId = existingOrgs[0].id;
                        console.log("Guardián: Recuperando tienda para acceso directo...");
                        const { error: linkError } = await supabase
                            .from("profiles")
                            .upsert({
                                id: session.user.id,
                                organization_id: autoOrgId,
                                email: session.user.email,
                                role: 'admin'
                            });

                        if (!linkError) {
                            console.log("Guardián: Vinculación exitosa. Acceso concedido.");
                            // NO Recargar página para evitar bucles. Asumir éxito.
                            setIsAuthorized(true);
                            setLoading(false);
                            return;
                        }
                    }

                    console.warn("Guardián: Redirigiendo a onboarding.");
                    router.replace("/onboarding");
                    return;
                }

                // CASO B: SI TIENE ORGANIZACIÓN
                if (pathname === "/onboarding") {
                    router.replace("/venta");
                    return;
                }

                const org = (profile as any).organizations;
                if (org) {
                    setSubscriptionInfo({
                        plan: org.plan || 'free',
                        status: org.subscription_status || 'active'
                    });
                }
                setIsAuthorized(true);

            } catch (error) {
                reportError(error, {
                    location: "AuthGuard:verifySession",
                    metadata: { path: pathname }
                });

                // Si el token es inválido o no se encuentra (AuthApiError), 
                // forzamos el cierre de sesión para limpiar el localStorage.
                await supabase.auth.signOut();

                router.replace("/login");
            } finally {
                setLoading(false);
            }
        };

        checkSession();

        const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
            if (event === 'SIGNED_OUT' || !session) {
                router.replace("/login");
                setIsAuthorized(false);
            }
        });

        return () => subscription.unsubscribe();
    }, [router, pathname, toast]);

    if (loading || verifyingPayment) {
        return (
            <div className="h-screen w-full flex items-center justify-center bg-slate-50">
                <div className="flex flex-col items-center gap-4">
                    <div className="w-12 h-12 border-4 border-slate-200 border-t-slate-900 rounded-full animate-spin"></div>
                    <p className="text-slate-500 font-medium animate-pulse">
                        {verifyingPayment ? "Confirmando pago con el banco..." : "Verificando seguridad..."}
                    </p>
                </div>
            </div>
        );
    }

    if (!isAuthorized) {
        return null;
    }

    // BLOCKING SCREEN: Only if status is explicitly 'inactive' or 'suspended'
    // We ALLOW 'pending_payment' so they can at least enter and configure.
    const isBlocked = subscriptionInfo &&
        subscriptionInfo.plan !== 'free' &&
        (subscriptionInfo.status === 'inactive' || subscriptionInfo.status === 'suspended');

    if (isBlocked) {
        const planPrice = subscriptionInfo?.plan === 'pro' ? 50000 : 90000;

        return (
            <div className="h-screen w-full flex items-center justify-center bg-slate-50 p-6">
                <div className="max-w-md w-full bg-white rounded-3xl shadow-2xl p-8 border border-slate-200 animate-in zoom-in-95 duration-500">
                    <div className="w-20 h-20 bg-red-50 rounded-2xl flex items-center justify-center mx-auto mb-6">
                        <Lock className="w-10 h-10 text-red-600" />
                    </div>

                    <h1 className="text-2xl font-black text-slate-900 text-center mb-2">Acceso Restringido</h1>
                    <p className="text-slate-500 text-center mb-8 leading-relaxed">
                        Tu suscripción al <span className="font-bold text-slate-700 capitalize">Plan {subscriptionInfo.plan}</span> se encuentra inactiva o con pago pendiente.
                    </p>

                    <div className="bg-slate-50 rounded-2xl p-6 mb-8 border border-slate-100">
                        <div className="flex justify-between items-center mb-4">
                            <span className="text-slate-500 font-bold text-xs uppercase tracking-wider">Monto a pagar</span>
                            <span className="text-xl font-black text-slate-900">${planPrice.toLocaleString()} COP</span>
                        </div>
                        <div className="flex items-center gap-3 text-sm text-slate-600">
                            <ShieldCheck className="w-5 h-5 text-indigo-600" />
                            <span>Pago 100% seguro vía Wompi</span>
                        </div>
                    </div>

                    <WompiButton
                        amount={planPrice}
                        className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-black py-4 rounded-xl shadow-lg shadow-indigo-100 flex items-center justify-center gap-2 group transition-all"
                    />

                    <button
                        onClick={async () => {
                            await supabase.auth.signOut();
                            router.replace("/login");
                        }}
                        className="w-full mt-4 text-slate-400 text-sm font-bold hover:text-slate-600 transition-colors"
                    >
                        Cerrar Sesión
                    </button>
                </div>
            </div>
        );
    }

    return <>{children}</>;
}

export default function AuthGuard({ children }: { children: React.ReactNode }) {
    return (
        <Suspense fallback={
            <div className='h-screen w-full flex items-center justify-center bg-slate-50'>
                <div className='flex flex-col items-center gap-4'>
                    <div className='w-12 h-12 border-4 border-slate-200 border-t-slate-900 rounded-full animate-spin'></div>
                    <p className='text-slate-500 font-medium animate-pulse'>Cargando...</p>
                </div>
            </div>
        }>
            <AuthGuardContent>{children}</AuthGuardContent>
        </Suspense>
    );
}
