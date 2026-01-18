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

    return (
        <AuthGuard>
            <div className="flex h-screen bg-slate-50">
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
                                {/* Collapsed: CSS Icon */}
                                {isCollapsed ? (
                                    <div className={`w-10 h-10 ${brandColor} rounded-lg flex items-center justify-center text-slate-900 shadow-sm shrink-0 transition-transform duration-300`}>
                                        <span className={`material-symbols-outlined text-[24px] ${isFinance ? 'text-white' : 'text-slate-900'}`}>storefront</span>
                                    </div>
                                ) : (
                                    /* Expanded: Full Logo Image */
                                    <div className="flex justify-start w-full transition-opacity duration-300 animate-in fade-in">
                                        <img src="/logo.png" alt="DonTendero" className="h-[42px] w-auto object-contain" />
                                    </div>
                                )}
                            </div>
                        </div>
                        <nav className="flex flex-col gap-1 p-2 md:p-4">
                            <NavItem href="/venta" icon="point_of_sale" label="Venta" collapsed={isCollapsed} />
                            <NavItem href="/caja" icon="payments" label="Caja" collapsed={isCollapsed} />
                            <NavItem href="/inventario" icon="inventory_2" label="Inventario" collapsed={isCollapsed} />
                            <NavItem href="/compras" icon="shopping_cart_checkout" label="Compras" collapsed={isCollapsed} />
                            <NavItem href="/clientes" icon="groups" label="Clientes" collapsed={isCollapsed} />
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

                        {/* Admin Link (Only for Super Admin) */}
                        {userRole === 'super_admin' && (
                            <Link
                                href="/admin"
                                className={`flex w-full items-center gap-3 p-2 rounded-xl text-slate-600 hover:text-purple-600 hover:bg-purple-50 transition-colors group ${isCollapsed ? 'justify-center' : ''}`}
                                title="Panel Administrativo"
                            >
                                <span className="material-symbols-outlined text-[20px] group-hover:scale-110 transition-transform">shield_person</span>
                                {!isCollapsed && <span className="text-sm font-medium">Panel Admin</span>}
                            </Link>
                        )}

                        <button
                            onClick={handleLogout}
                            className={`flex w-full items-center gap-3 p-2 rounded-xl text-slate-600 hover:text-red-600 hover:bg-red-50 transition-colors group ${isCollapsed ? 'justify-center' : ''}`}
                            title="Cerrar Sesión"
                        >
                            <span className="material-symbols-outlined text-[20px] group-hover:scale-110 transition-transform">logout</span>
                            {!isCollapsed && <span className="text-sm font-medium">Cerrar Sesión</span>}
                        </button>

                        {!isCollapsed && (
                            <div className="mt-2 text-center">
                                <span className="text-[10px] text-slate-300 font-mono">v0.1.2</span>
                            </div>
                        )}
                    </div>
                </aside>

                {/* Main Content */}
                <main className="flex-1 overflow-x-hidden overflow-y-auto relative flex flex-col bg-slate-50/50 pb-20 md:pb-0">
                    {/* Ghost Mode Banner */}
                    {ghostOrgId && (
                        <div className="bg-slate-900 border-b-4 border-red-500 text-white px-6 py-3 shadow-md flex flex-col md:flex-row justify-between items-center gap-4 z-40 sticky top-0">
                            <div className="flex items-center gap-3">
                                <span className="p-2 bg-red-500/20 rounded-full animate-pulse">
                                    <span className="material-symbols-outlined text-red-400">visibility</span>
                                </span>
                                <div>
                                    <p className="font-black text-sm uppercase tracking-wider text-red-400">Modo Fantasma Activo</p>
                                    <p className="text-xs text-slate-400">Estás visualizando la tienda como administrador. Cualquier cambio será real.</p>
                                </div>
                            </div>
                            <button
                                onClick={exitGhostMode}
                                className="bg-red-600 hover:bg-red-500 text-white px-5 py-2 rounded-lg text-xs font-bold uppercase shadow-lg shadow-red-500/20 transition-all flex items-center gap-2"
                            >
                                <span className="material-symbols-outlined text-sm">logout</span>
                                Salir del Modo Fantasma
                            </button>
                        </div>
                    )}

                    <div className="fixed bottom-24 right-4 z-50 md:bottom-8 md:right-8">
                        <NotificationBell />
                    </div>
                    {children}
                </main>

                {/* Mobile Navigation */}
                <MobileNav />
            </div>
        </AuthGuard>
    );
}
