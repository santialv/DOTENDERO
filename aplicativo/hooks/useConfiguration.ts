"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { useToast } from "@/components/ui/toast";
import { BusinessInfo, DEFAULT_BUSINESS_INFO } from "@/types/business";

// Removed local type definition and constant

export function useConfiguration() {
    const { toast } = useToast();
    const [businessInfo, setBusinessInfo] = useState<BusinessInfo>(DEFAULT_BUSINESS_INFO);
    const [loading, setLoading] = useState(true);
    const [userId, setUserId] = useState<string | null>(null);

    useEffect(() => {
        loadOrganization();
    }, []);

    const loadOrganization = async () => {
        setLoading(true);
        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) return;

            setUserId(user.id);

            // 1. Get Profile to find Org ID
            const { data: profile } = await supabase
                .from('profiles')
                .select('organization_id, full_name')
                .eq('id', user.id)
                .single();

            if (!profile?.organization_id) {
                console.warn("User has no organization linked");
                return;
            }

            // 2. Get Organization Details securely
            const { data: org, error } = await supabase
                .from('organizations')
                .select('*')
                .eq('id', profile.organization_id)
                .single();

            if (error) {
                console.error("Error loading org:", error);
            }

            let loadedInfo: BusinessInfo = DEFAULT_BUSINESS_INFO;

            if (org) {
                loadedInfo = {
                    name: org.name || "",
                    legalName: org.legal_name || "",
                    regime: org.regime || "No Responsable de IVA",
                    activityCode: org.activity_code || "",
                    nit: org.nit || "",
                    city: org.city || "",
                    address: org.address || "",
                    phone: org.phone || "",
                    email: org.email || "",
                    logoUrl: org.logo_url || "",
                    rutUrl: org.rut_url || "",
                    owner_name: profile.full_name || "", // Added user name mapping
                    plan: org.plan || "free",
                    subscription_status: org.subscription_status || "active",
                    organization_id: org.id
                };
            }

            // Se eliminó el mecanismo de recuperación de LocalStorage por seguridad.
            // Esto evita que datos de una sesión anterior aparezcan en una cuenta nueva vacía.

            setBusinessInfo(loadedInfo);

        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const saveConfiguration = async () => {
        setLoading(true);
        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) throw new Error("No authentifado");

            // 1. Verify Profile Link again for security
            const { data: profile } = await supabase
                .from('profiles')
                .select('organization_id')
                .eq('id', user.id)
                .single();

            if (!profile?.organization_id) {
                toast("Error: No tienes permisos sobre ninguna organización", "error");
                return;
            }

            const orgId = profile.organization_id;

            const { error } = await supabase.from('organizations').update({
                name: businessInfo.name,
                legal_name: businessInfo.legalName,
                regime: businessInfo.regime,
                activity_code: businessInfo.activityCode,
                nit: businessInfo.nit,
                city: businessInfo.city,
                address: businessInfo.address,
                phone: businessInfo.phone,
                email: businessInfo.email,
                logo_url: businessInfo.logoUrl,
                rut_url: businessInfo.rutUrl
            }).eq('id', orgId);

            if (error) {
                throw error;
            }

            toast("Configuración guardada en la nube", "success");
        } catch (error: any) {
            toast(`Error guardando: ${error.message}`, "error");
        } finally {
            setLoading(false);
        }
    };

    return {
        businessInfo,
        setBusinessInfo,
        saveConfiguration,
        loading,
        userId,
    };
}
