"use client";

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';

import { NavItem } from '@/components/nav-item';
import { MobileNav } from '@/components/mobile-nav';
import AuthGuard from '@/components/AuthGuard';
import { supabase } from '@/lib/supabase';
import { useConfiguration } from "@/hooks/useConfiguration";
import { NotificationBell } from "@/components/layout/NotificationBell";
import { DonTenderoChat } from '@/components/chat/DonTenderoChat';

export default function DashboardLayout({
    children,
}: {
    children: React.ReactNode
}) {
    const [isCollapsed, setIsCollapsed] = useState(false);
    const [userRole, setUserRole] = useState<string | null>(null);
    const pathname = usePathname();
    const router = useRouter();
    const { businessInfo } = useConfiguration();
    const isFinance = pathname?.startsWith('/asesoria');

    useEffect(() => {
        const fetchRole = async () => {
            const { data: { session } } = await supabase.auth.getSession();
            if (session?.user) {
                const { data: profile } = await supabase.from('profiles').select('role').eq('id', session.user.id).single();
                setUserRole(profile?.role || null);
            }
        };
        fetchRole();
    }, []);

    const brandColor = isFinance ? 'bg-blue-600' : 'bg-[#13ec80]';

    const handleLogout = async () => {
        await supabase.auth.signOut();
        localStorage.removeItem("onboarding_data");
        localStorage.removeItem("onboarding_step");
        router.push('/login');
    };

    // Ghost Mode Logic
    const [ghostOrgId, setGhostOrgId] = useState<string | null>(null);
    useEffect(() => {
        const stored = localStorage.getItem('ghost_admin_return_org');
        if (stored) setGhostOrgId(stored);
    }, []);

    const exitGhostMode = async () => {
        try {
            const { data: { session } } = await supabase.auth.getSession();
            if (!session || !ghostOrgId) return;

            // 1. Get Home Org ID (Securely)
            const { data: profile } = await supabase
                .from('profiles')
                .select('home_organization_id')
                .eq('id', session.user.id)
                .single();

            if (!profile?.home_organization_id) {
                alert("Error crítico: No tienes una organización hogar para volver.");
                return;
            }

            // 2. Switch back to Home Org
            await supabase.from('profiles').update({ organization_id: profile.home_organization_id }).eq('id', session.user.id);

            localStorage.removeItem('ghost_admin_return_org');
            // Force reload to refresh context
            window.location.href = '/admin/tiendas';
        } catch (e) {
            console.error(e);
            alert("Error exiting ghost mode");
        }
    };

    // ... existing logic ...

    return (
        <AuthGuard>
            <div className="flex h-screen bg-slate-50 relative">
                {/* Sidebar - Hidden on Mobile */}
                <aside
                    className={`hidden md:flex ${isCollapsed ? 'w-20' : 'w-64'} h-full bg-white border-r border-slate-200 flex-col justify-between shrink-0 z-20 transition-all duration-300 relative`}
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
                            <div className="flex items-center justify-center w-full">
                                {isCollapsed ? (
                                    <div className={`w-10 h-10 rounded-lg flex items-center justify-center text-slate-900 shadow-sm shrink-0 bg-white border border-slate-200`}>
                                        <span className={`material-symbols-outlined text-[24px]`}>storefront</span>
                                    </div>
                                ) : (
                                    <div className="flex justify-start w-full transition-opacity duration-300 animate-in fade-in">
                                        <img src="/logo.png" alt="DonTendero" className="h-[42px] w-auto object-contain" />
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Ghost Mode Exit in Sidebar */}
                        {ghostOrgId && (
                            <div className={`px-3 pt-3 ${isCollapsed ? 'hidden' : 'block'}`}>
                                <button
                                    onClick={exitGhostMode}
                                    className="w-full bg-purple-600 hover:bg-purple-700 text-white py-2 rounded-lg text-xs font-bold shadow-sm transition-colors animate-pulse flex items-center justify-center gap-2"
                                >
                                    <span className="material-symbols-outlined text-sm">visibility_off</span>
                                    SALIR MODO FANTASMA
                                </button>
                            </div>
                        )}

                        <nav className="flex-1 py-6 px-3 space-y-1 overflow-y-auto">
                            <NavItem href="/dashboard" icon="dashboard" label="Inicio" collapsed={isCollapsed} />
                            <NavItem href="/venta" icon="point_of_sale" label="Venta" collapsed={isCollapsed} />
                            <NavItem href="/caja" icon="payments" label="Caja" collapsed={isCollapsed} />
                            <NavItem href="/inventario" icon="inventory_2" label="Inventario" collapsed={isCollapsed} />
                            <NavItem href="/compras" icon="shopping_cart" label="Compras" collapsed={isCollapsed} />
                            <NavItem href="/clientes" icon="group" label="Clientes" collapsed={isCollapsed} />
                            <NavItem href="/reportes" icon="bar_chart" label="Reportes" collapsed={isCollapsed} />

                            <div className="my-2 border-t border-slate-100 mx-2" />

                            <NavItem href="/asesoria" icon="support_agent" label="Asesoría Financiera" collapsed={isCollapsed} />
                            <NavItem href="/configuracion" icon="settings" label="Configuración" collapsed={isCollapsed} />

                            {userRole === 'super_admin' && (
                                <>
                                    <div className="my-4 border-t border-slate-100" />
                                    <NavItem href="/admin/tiendas" icon="admin_panel_settings" label="Admin" collapsed={isCollapsed} />
                                </>
                            )}
                        </nav>
                    </div>

                    <div className="p-3 border-t border-slate-100">
                        {/* User Profile Info (Moved from Header) */}
                        <div className={`flex items-center gap-3 mb-3 px-2 rounded-xl bg-slate-50 py-2 border border-slate-100 ${isCollapsed ? 'justify-center p-0 w-full aspect-square mb-2' : ''}`}>
                            {businessInfo?.logoUrl ? (
                                <div className="w-8 h-8 rounded-full overflow-hidden border border-slate-200 shrink-0 bg-white">
                                    <img src={businessInfo.logoUrl} alt={businessInfo.name} className="w-full h-full object-cover" />
                                </div>
                            ) : (
                                <div className={`w-8 h-8 rounded-full ${brandColor} flex items-center justify-center text-white font-bold text-xs shrink-0`}>
                                    {(businessInfo?.owner_name || 'A')[0].toUpperCase()}
                                </div>
                            )}
                            {!isCollapsed && (
                                <div className="overflow-hidden">
                                    <p className="text-sm font-bold text-slate-700 truncate" title={businessInfo?.name}>
                                        {businessInfo?.name || 'Mi Tienda'}
                                    </p>
                                    <p className="text-[10px] text-slate-400 font-medium truncate uppercase tracking-wider">
                                        {businessInfo?.owner_name || 'Admin'}
                                    </p>
                                </div>
                            )}
                        </div>

                        <button
                            onClick={handleLogout}
                            className={`flex items-center ${isCollapsed ? 'justify-center' : 'px-3'} w-full py-2.5 text-slate-500 hover:text-red-600 hover:bg-red-50 rounded-xl transition-all group`}
                        >
                            <span className="material-symbols-outlined group-hover:scale-110 transition-transform">logout</span>
                            {!isCollapsed && <span className="ml-3 font-medium">Cerrar Sesión</span>}
                        </button>
                    </div>
                </aside>

                {/* Main Content */}
                <div className="flex-1 flex flex-col min-w-0 overflow-hidden relative">
                    {/* Header - Mobile Only */}
                    <header className="md:hidden h-16 bg-white/80 backdrop-blur-md border-b border-slate-200 flex items-center justify-between px-4 sticky top-0 z-10">
                        <div className="flex items-center gap-3">
                            {/* Logo for Mobile */}
                            {businessInfo?.logoUrl ? (
                                <img src={businessInfo.logoUrl} alt={businessInfo.name} className="h-8 w-8 rounded-lg object-cover border border-slate-100" />
                            ) : (
                                <img src="/logo.png" alt="DonTendero" className="h-8 w-auto object-contain" />
                            )}
                            <span className="font-bold text-slate-800 text-sm truncate max-w-[150px]">
                                {businessInfo?.name || 'DonTendero'}
                            </span>
                        </div>

                        <div className="flex items-center gap-3">
                            <div className="border-l border-slate-200 pl-3 ml-1">
                                <NotificationBell />
                            </div>
                        </div>
                    </header>

                    {/* Page Content */}
                    <main className="flex-1 flex flex-col overflow-y-auto bg-slate-50/50 pb-24 md:pb-0">
                        <div className="flex-1 w-full h-full relative flex flex-col">
                            {children}
                        </div>
                    </main>

                    {/* Mobile Navigation (Fixed Bottom) */}
                    <MobileNav />

                    {/* Bot de Soporte Global */}
                    <div className="fixed bottom-24 right-4 md:bottom-6 md:right-6 z-50">
                        <DonTenderoChat />
                    </div>
                </div>
            </div>
        </AuthGuard>
    );
}
