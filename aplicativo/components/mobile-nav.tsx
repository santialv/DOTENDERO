"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion } from "framer-motion";

export function MobileNav() {
    const pathname = usePathname();

    // Helper to check if a route is active (handling sub-routes like /inventario/nuevo)
    const isActive = (path: string) => {
        if (path === '/dashboard') return pathname === '/dashboard';
        return pathname?.startsWith(path);
    };

    return (
        <div className="fixed bottom-0 inset-x-0 h-16 bg-white/95 backdrop-blur-md border-t border-slate-200 z-50 flex items-center justify-around px-2 md:hidden shadow-[0_-4px_20px_-5px_rgba(0,0,0,0.1)] pb-safe-area">
            <NavItem href="/reportes" icon="bar_chart" label="Informes" active={isActive('/reportes')} />
            <NavItem href="/venta" icon="point_of_sale" label="Venta" active={isActive('/venta')} centralAction />
            <NavItem href="/caja" icon="payments" label="Caja" active={isActive('/caja')} />
            <NavItem href="/inventario" icon="inventory_2" label="Stock" active={isActive('/inventario')} />
            <NavItem href="/configuracion" icon="settings" label="Config" active={isActive('/configuracion')} />
        </div>
    );
}

function NavItem({ href, icon, label, active, centralAction }: { href: string; icon: string; label: string; active: boolean; centralAction?: boolean }) {
    return (
        <Link
            href={href}
            className={`flex flex-col items-center justify-center w-full h-full relative group ${centralAction ? '-mt-8' : ''}`}
        >
            {/* Animated Background Blob for Active State */}
            {active && !centralAction && (
                <motion.div
                    layoutId="navBlob"
                    className="absolute top-1 w-10 h-10 bg-green-100 rounded-2xl -z-10"
                    initial={false}
                    transition={{ type: "spring", stiffness: 500, damping: 30 }}
                />
            )}

            <motion.div
                className={`
                    flex items-center justify-center rounded-2xl transition-all duration-300
                    ${centralAction
                        ? 'w-16 h-16 bg-[#13ec80] text-slate-900 shadow-lg shadow-green-500/40 border-4 border-slate-50'
                        : 'w-10 h-10'
                    }
                    ${!centralAction && active ? 'text-green-600 scale-110' : ''}
                    ${!centralAction && !active ? 'text-slate-400' : ''}
                `}
                animate={active ? { scale: centralAction ? 1.1 : 1.1 } : { scale: 1 }}
                whileTap={{ scale: 0.9 }}
            >
                <span className={`material-symbols-outlined ${centralAction ? 'text-[32px]' : 'text-[26px]'} ${active && !centralAction ? 'filled-icon' : ''}`}>
                    {icon}
                </span>
            </motion.div>

            <span className={`text-[10px] font-bold mt-1 transition-colors ${active ? 'text-slate-900' : 'text-slate-400'} ${centralAction ? 'mb-1' : ''}`}>
                {label}
            </span>
        </Link>
    );
}
