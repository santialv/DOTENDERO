"use client";

import { useState } from "react";
import { useConfiguration } from "@/hooks/useConfiguration";
import BusinessProfileForm from "@/components/configuration/BusinessProfileForm";
import { InvoiceConfigForm } from "@/components/configuration/InvoiceConfigForm";
import { UserProfileForm } from "@/components/configuration/UserProfileForm";
import { SubscriptionCard } from "@/components/configuration/SubscriptionCard";

type ActiveTab = 'perfil' | 'facturacion' | 'usuarios' | 'suscripcion';

export default function ConfigurationPage() {
    const [activeTab, setActiveTab] = useState<ActiveTab>('perfil');
    const { businessInfo, setBusinessInfo, saveConfiguration, userId } = useConfiguration();

    return (
        <div className="flex flex-col h-full bg-slate-50 font-display overflow-hidden pb-20 md:pb-0">
            {/* Header */}
            <div className="px-6 md:px-10 py-6 md:py-8 flex flex-col md:flex-row md:items-end justify-between gap-4 shrink-0">
                <div className="flex flex-col gap-1">
                    <h1 className="text-2xl md:text-3xl lg:text-4xl font-black tracking-tight text-slate-900">Configuración</h1>
                    <p className="text-sm md:text-base text-slate-500">Gestiona el perfil de tu negocio, facturación y usuarios.</p>
                </div>
                <button
                    onClick={saveConfiguration}
                    className="flex h-10 px-6 items-center justify-center rounded-lg bg-[#13ec80] hover:bg-[#10d673] text-slate-900 text-sm font-black transition-colors shadow-sm w-full md:w-auto gap-2"
                >
                    <span className="material-symbols-outlined text-[18px] font-bold">save</span>
                    Guardar Cambios
                </button>
            </div>

            <div className="flex-1 flex flex-col overflow-hidden">
                {/* Tabs - Scrollable Container for Mobile */}
                <div className="px-6 md:px-10 border-b border-slate-200 shrink-0 overflow-x-auto custom-scrollbar">
                    <div className="flex gap-1 min-w-max">
                        <button
                            onClick={() => setActiveTab('perfil')}
                            className={`px-4 md:px-6 py-3 text-xs md:text-sm font-bold border-b-2 transition-colors flex items-center gap-2 ${activeTab === 'perfil' ? 'border-primary text-primary' : 'border-transparent text-slate-500 hover:text-slate-700 hover:bg-slate-100 rounded-t-lg'}`}
                        >
                            <span className="material-symbols-outlined text-[18px] md:text-[20px]">store</span>
                            Perfil de Negocio
                        </button>
                        <button
                            onClick={() => setActiveTab('facturacion')}
                            className={`px-4 md:px-6 py-3 text-xs md:text-sm font-bold border-b-2 transition-colors flex items-center gap-2 ${activeTab === 'facturacion' ? 'border-primary text-primary' : 'border-transparent text-slate-500 hover:text-slate-700 hover:bg-slate-100 rounded-t-lg'}`}
                        >
                            <span className="material-symbols-outlined text-[18px] md:text-[20px]">receipt_long</span>
                            Facturación
                        </button>
                        <button
                            onClick={() => setActiveTab('suscripcion')}
                            className={`px-4 md:px-6 py-3 text-xs md:text-sm font-bold border-b-2 transition-colors flex items-center gap-2 ${activeTab === 'suscripcion' ? 'border-primary text-primary' : 'border-transparent text-slate-500 hover:text-slate-700 hover:bg-slate-100 rounded-t-lg'}`}
                        >
                            <span className="material-symbols-outlined text-[18px] md:text-[20px]">card_membership</span>
                            Suscripción
                        </button>
                        <button
                            onClick={() => setActiveTab('usuarios')}
                            className={`px-4 md:px-6 py-3 text-xs md:text-sm font-bold border-b-2 transition-colors flex items-center gap-2 ${activeTab === 'usuarios' ? 'border-primary text-primary' : 'border-transparent text-slate-500 hover:text-slate-700 hover:bg-slate-100 rounded-t-lg'}`}
                        >
                            <span className="material-symbols-outlined text-[18px] md:text-[20px]">group</span>
                            Usuarios
                        </button>
                    </div>
                </div>

                {/* Content */}
                <div className="flex-1 overflow-auto custom-scrollbar px-6 md:px-10 py-6 md:py-8">
                    {activeTab === 'perfil' && (
                        <BusinessProfileForm businessInfo={businessInfo} setBusinessInfo={setBusinessInfo} userId={userId} />
                    )}

                    {activeTab === 'facturacion' && (
                        <InvoiceConfigForm />
                    )}

                    {activeTab === 'suscripcion' && (
                        <div className="max-w-6xl mx-auto w-full">
                            <SubscriptionCard />
                        </div>
                    )}

                    {activeTab === 'usuarios' && (
                        <UserProfileForm />
                    )}
                </div>
            </div>
        </div >
    );
}
