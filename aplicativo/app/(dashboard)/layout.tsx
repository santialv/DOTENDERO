"use client";

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useState } from 'react';

import { NavItem } from '@/components/nav-item';
import AuthGuard from '@/components/AuthGuard';
import { supabase } from '@/lib/supabase';
import { useConfiguration } from "@/hooks/useConfiguration";

export default function DashboardLayout({
    children,
}: {
    children: React.ReactNode
}) {
    const [isCollapsed, setIsCollapsed] = useState(false);
    const pathname = usePathname();
    const router = useRouter(); // Import useRouter
    const { businessInfo } = useConfiguration(); // Fetch dynamic info
    const isFinance = pathname?.startsWith('/asesoria');

    const brandColor = isFinance ? 'bg-blue-600' : 'bg-[#13ec80]';
    // User requested "DonTendero POS" (interpreted from 'POST') vs "DonTendero FINANCE"
    // 'Financiera' placed subtly below.
    const subLabel = isFinance ? 'FINANCE' : 'POS';
    const subLabelColor = isFinance ? 'text-blue-600' : 'text-[#13ec80]';

    const handleLogout = async () => {
        await supabase.auth.signOut();
        // Clear sensitive local data
        localStorage.removeItem("onboarding_data");
        localStorage.removeItem("onboarding_step");
        // AuthGuard will detect change and redirect, but we can force it too
        router.push('/login');
    };

    return (
        <AuthGuard>
            <div className="flex h-screen bg-slate-50">
                {/* Sidebar */}
                <aside
                    className={`${isCollapsed ? 'w-20' : 'w-64'} h-full bg-white border-r border-slate-200 flex flex-col justify-between shrink-0 z-20 transition-all duration-300 relative`}
                >
                    {/* Toggle Button */}
                    <button
                        onClick={() => setIsCollapsed(!isCollapsed)}
                        className="absolute -right-3 top-24 bg-white border border-slate-200 text-slate-400 hover:text-primary rounded-full p-0.5 shadow-sm z-50 transition-colors"
                    >
                        <span className="material-symbols-outlined text-sm">
                            {isCollapsed ? 'chevron_right' : 'chevron_left'}
                        </span>
                    </button>

                    <div>
                        <div className={`h-20 flex items-center ${isCollapsed ? 'justify-center px-0' : 'px-6'} border-b border-slate-100 overflow-hidden whitespace-nowrap`}>
                            <div className="flex items-center gap-3">
                                {/* Logo: Always storefront, color changes */}
                                <div className={`w-10 h-10 ${brandColor} rounded-lg flex items-center justify-center text-slate-900 shadow-sm shrink-0 transition-colors duration-300`}>
                                    <span className={`material-symbols-outlined text-[24px] ${isFinance ? 'text-white' : 'text-slate-900'}`}>storefront</span>
                                </div>
                                <div className={`${isCollapsed ? 'hidden' : 'block'} flex flex-col transition-opacity`}>
                                    <h1 className="text-lg font-bold leading-none mb-0.5 text-slate-900">DonTendero</h1>
                                    <p className={`text-[10px] font-bold tracking-[0.2em] leading-none ${subLabelColor}`}>{subLabel}</p>
                                </div>
                            </div>
                        </div>
                        <nav className="flex flex-col gap-1 p-2 md:p-4">
                            <NavItem href="/venta" icon="point_of_sale" label="Venta" collapsed={isCollapsed} />
                            <NavItem href="/caja" icon="payments" label="Caja" collapsed={isCollapsed} />
                            <NavItem href="/inventario" icon="inventory_2" label="Inventario" collapsed={isCollapsed} />
                            <NavItem href="/compras" icon="shopping_cart_checkout" label="Compras" collapsed={isCollapsed} />
                            <NavItem href="/clientes" icon="groups" label="Clientes" collapsed={isCollapsed} />
                            <NavItem href="/cartera" icon="account_balance_wallet" label="Cartera" collapsed={isCollapsed} />
                            <NavItem href="/reportes" icon="bar_chart" label="Reportes" collapsed={isCollapsed} />
                            <div className="my-2 border-t border-slate-100 mx-2"></div>
                            <NavItem href="/asesoria" icon="support_agent" label="Asesoría Financiera" collapsed={isCollapsed} />
                            <NavItem href="/configuracion" icon="settings" label="Configuración" collapsed={isCollapsed} />
                        </nav>
                    </div>
                    <div className={`p-4 border-t border-slate-200 ${isCollapsed ? 'flex flex-col gap-2 justify-center' : ''}`}>
                        <div className={`flex items-center gap-3 p-2 rounded-xl hover:bg-slate-50 cursor-pointer transition-colors ${isCollapsed ? 'justify-center p-0' : ''}`}>
                            <div className="w-10 h-10 rounded-full bg-[#13ec80] flex items-center justify-center shrink-0 border-2 border-white shadow-sm text-slate-900 font-bold overflow-hidden">
                                {businessInfo.name ? businessInfo.name.charAt(0).toUpperCase() : <span className="material-symbols-outlined">store</span>}
                            </div>
                            <div className={`flex flex-col ${isCollapsed ? 'hidden' : 'block'} whitespace-nowrap overflow-hidden`}>
                                <span className="text-sm font-bold text-slate-900 truncate max-w-[140px]" title={businessInfo.name}>
                                    {businessInfo.name || "Cargando..."}
                                </span>
                                <span className="text-xs text-slate-500 font-medium">{businessInfo.legalName ? 'Empresa' : 'Propietario'}</span>
                            </div>
                        </div>

                        <button
                            onClick={handleLogout}
                            className={`flex w-full items-center gap-3 p-2 rounded-xl text-slate-600 hover:text-red-600 hover:bg-red-50 transition-colors group ${isCollapsed ? 'justify-center' : ''}`}
                            title="Cerrar Sesión"
                        >
                            <span className="material-symbols-outlined text-[20px] group-hover:scale-110 transition-transform">logout</span>
                            {!isCollapsed && <span className="text-sm font-medium">Cerrar Sesión</span>}
                        </button>
                    </div>
                </aside>

                {/* Main Content */}
                <main className="flex-1 overflow-x-hidden overflow-y-auto relative flex flex-col bg-slate-50/50">
                    {children}
                </main>
            </div>
        </AuthGuard>
    );
}
