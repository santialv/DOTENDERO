"use client";

import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { useToast } from "@/components/ui/toast";

export default function AuthGuard({ children }: { children: React.ReactNode }) {
    const router = useRouter();
    const pathname = usePathname();
    const { toast } = useToast();
    const [isAuthorized, setIsAuthorized] = useState(false);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const checkSession = async () => {
            try {
                const { data: { session } } = await supabase.auth.getSession();

                if (!session) {
                    console.log("Guardián: No hay sesión, redirigiendo a login.");
                    router.replace("/login");
                    return;
                }

                // 1. Obtener Perfil y Organización (Solo para logueo, no bloqueo estricto)
                const { data: profile } = await supabase
                    .from('profiles')
                    .select('organization_id')
                    .eq('id', session.user.id)
                    .single();

                if (!profile) {
                    console.warn("Usuario sin perfil. Posible error de integridad.");
                    // Treat as new user -> Redirect to Onboarding
                    if (pathname !== "/onboarding") {
                        router.replace("/onboarding");
                        return;
                    }
                }

                // CASO 1: USUARIO NUEVO (Sin Organización) -> A ONBOARDING
                else if (!profile.organization_id) {
                    console.warn("Guardián: Usuario NUEVO sin organización. Redirigiendo a Onboarding.");
                    if (pathname !== "/onboarding") {
                        router.replace("/onboarding");
                        // Return to avoid setIsAuthorized(true) below
                        return;
                    }
                    // Si ya está en onboarding, permitimos
                    setIsAuthorized(true);
                    return;
                }

                // CASO 2: USUARIO EXISTENTE (Con Organización) -> AL DASHBOARD
                setIsAuthorized(true);

            } catch (error) {
                console.error("Guardián: Fallo al verificar sesión", error);
                // En caso de error de red, mejor no sacar al usuario agresivamente, 
                // pero por seguridad en esta etapa, redirigimos a login
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

    if (loading) {
        return (
            <div className="h-screen w-full flex items-center justify-center bg-slate-50">
                <div className="flex flex-col items-center gap-4">
                    <div className="w-12 h-12 border-4 border-slate-200 border-t-slate-900 rounded-full animate-spin"></div>
                    <p className="text-slate-500 font-medium animate-pulse">Verificando seguridad...</p>
                </div>
            </div>
        );
    }

    if (!isAuthorized) {
        return null; // Bloqueo total visual hasta redirección
    }

    return <>{children}</>;
}
