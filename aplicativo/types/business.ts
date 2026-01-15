export type Profile = {
    id: string;
    email: string;
    full_name?: string;
    avatar_url?: string;
    role: 'admin' | 'cashier' | 'warehouse';
    organization_id?: string;
};

export type Organization = {
    id: string;
    name: string;
    legal_name?: string;
    nit?: string;
    address?: string;
    phone?: string;
    email?: string;
    city?: string;
    regime?: string;
    activity_code?: string;
    rut_url?: string; // Added
    logo_url?: string;
    created_at: string;
    subscription_plan?: string;
    subscription_status?: string;
};

// Application logic type (CamelCase for frontend)
export type BusinessInfo = {
    name: string;
    legalName: string;
    nit: string;
    regime: string;
    activityCode: string; // "Code - Name" or just "Code"
    city: string;
    address: string;
    phone: string;
    email: string;
    logoUrl?: string; // Added
    rutUrl?: string; // Added
    plan?: string;
    subscription_status?: string;
    organization_id?: string;
};

// Initial state constant
export const DEFAULT_BUSINESS_INFO: BusinessInfo = {
    name: "",
    legalName: "",
    nit: "",
    regime: "No Responsable de IVA",
    activityCode: "",
    city: "",
    address: "",
    phone: "",
    email: "",
    logoUrl: "",
    rutUrl: "",
    organization_id: ""
};
