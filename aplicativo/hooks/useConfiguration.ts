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
            if (user) setUserId(user.id);

            // RLS ensures we only get our own organization(s)
            // Fix: Use order by created_at desc to get the latest one, and don't fail if multiple exist.
            const { data: orgs, error } = await supabase
                .from('organizations')
                .select('*')
                .order('created_at', { ascending: false })
                .limit(1);

            if (error) {
                console.error("Error loading org:", error);
            }

            let loadedInfo: BusinessInfo = DEFAULT_BUSINESS_INFO;

            if (orgs && orgs.length > 0) {
                const data = orgs[0];
                loadedInfo = {
                    name: data.name || "",
                    legalName: data.legal_name || "",
                    regime: data.regime || "No Responsable de IVA",
                    activityCode: data.activity_code || "",
                    nit: data.nit || "",
                    city: data.city || "",
                    address: data.address || "",
                    phone: data.phone || "",
                    email: data.email || "",
                    logoUrl: data.logo_url || "",
                    rutUrl: data.rut_url || ""
                };
            }

            // RECOVERY MECHANISM:
            // If critical data is missing from DB (e.g. NIT is empty), checking localStorage
            // This rescues data if Onboarding crashed before saving.
            if (!loadedInfo.nit || !loadedInfo.name) {
                const localData = localStorage.getItem("onboarding_data");
                if (localData) {
                    try {
                        const parsed = JSON.parse(localData);
                        console.log("Recuperando datos de LocalStorage:", parsed);
                        loadedInfo = {
                            ...loadedInfo,
                            name: loadedInfo.name || parsed.storeName || "",
                            nit: loadedInfo.nit || parsed.nit || "",
                            city: loadedInfo.city || parsed.city || "",
                            regime: loadedInfo.regime || parsed.regime || "No Responsable de IVA",
                            activityCode: loadedInfo.activityCode || parsed.activityCode || "",
                            address: loadedInfo.address || parsed.address || "",
                            phone: loadedInfo.phone || parsed.phone || "",
                            rutUrl: loadedInfo.rutUrl || parsed.rutPath || ""
                        };
                        toast("Datos recuperados de tu sesión anterior. Por favor guarda.", "info");
                    } catch (e) {
                        console.error("Error parsing local onboarding data", e);
                    }
                }
            }

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
            // Retrieve Org ID (assuming user has one, which trigger guarantees)
            const { data: orgs } = await supabase.from('organizations').select('id').limit(1);

            if (!orgs || orgs.length === 0) {
                toast("Error: No se encontró organización", "error");
                return;
            }

            const orgId = orgs[0].id;

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
