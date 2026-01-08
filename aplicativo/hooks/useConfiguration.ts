"use client";

import { useState, useEffect } from "react";
import { useToast } from "@/components/ui/toast";

export type BusinessInfo = {
    name: string;
    legalName: string;
    regime: string;
    activityCode: string;
    nit: string;
    city: string;
    address: string;
    phone: string;
    email: string;
};

const DEFAULT_INFO: BusinessInfo = {
    name: "DonTendero Demo",
    legalName: "Carlos Ruiz S.A.S.",
    regime: "No Responsable de IVA",
    activityCode: "4711",
    nit: "900.123.456-7",
    city: "Bogotá D.C.",
    address: "Calle 123 # 45-67, Bogotá",
    phone: "300 123 4567",
    email: "admin@dontendero.com"
};

export function useConfiguration() {
    const { toast } = useToast();
    const [businessInfo, setBusinessInfo] = useState<BusinessInfo>(DEFAULT_INFO);

    useEffect(() => {
        const saved = localStorage.getItem("businessInfo");
        if (saved) {
            setBusinessInfo(JSON.parse(saved));
        }
    }, []);

    const saveConfiguration = () => {
        localStorage.setItem("businessInfo", JSON.stringify(businessInfo));
        toast("Configuración guardada exitosamente", "success");
    };

    return {
        businessInfo,
        setBusinessInfo,
        saveConfiguration
    };
}
