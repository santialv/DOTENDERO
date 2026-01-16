"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export function MobileNav() {
    const pathname = usePathname();

    const isActive = (path: string) => pathname === path;

    return (
        <div className="fixed bottom-0 inset-x-0 h-16 bg-white border-t border-slate-200 z-50 flex items-center justify-around px-2 md:hidden shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)]">
            <NavItem href="/dashboard" icon="home" label="Inicio" active={isActive('/dashboard')} />
            <NavItem href="/venta" icon="point_of_sale" label="Venta" active={isActive('/venta')} highlight />
            <NavItem href="/caja" icon="payments" label="Caja" active={isActive('/caja')} />
            <NavItem href="/inventario" icon="inventory_2" label="Inventario" active={isActive('/inventario')} />
            {/* Menu button could open a drawer for other links */}
            <NavItem href="/configuracion" icon="settings" label="Config" active={isActive('/configuracion')} />
        </div>
    );
}

function NavItem({ href, icon, label, active, highlight }: { href: string; icon: string; label: string; active: boolean; highlight?: boolean }) {
    return (
        <Link
            href={href}
            className={`flex flex-col items-center justify-center w-full h-full gap-1 active:scale-95 transition-transform ${highlight ? '-mt-6' : ''}`}
        >
            <div className={`
                flex items-center justify-center rounded-2xl transition-all
                ${highlight
                    ? 'w-14 h-14 bg-[#13ec80] text-slate-900 shadow-lg shadow-green-500/30'
                    : 'w-8 h-8'
                }
                ${!highlight && active ? 'text-[#13ec80] bg-green-50' : ''}
                ${!highlight && !active ? 'text-slate-400' : ''}
            `}>
                <span className={`material-symbols-outlined ${highlight ? 'text-2xl' : 'text-[24px]'}`}>{icon}</span>
            </div>
            <span className={`text-[10px] font-bold ${active ? 'text-slate-900' : 'text-slate-400'}`}>
                {label}
            </span>
        </Link>
    );
}
