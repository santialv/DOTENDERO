import React from "react";

interface LogoProps {
    className?: string;
    showText?: boolean;
    collapsed?: boolean;
    dark?: boolean;
}

export function Logo({ className = "", showText = true, collapsed = false, dark = false }: LogoProps) {
    return (
        <div className={`flex items-center ${collapsed ? 'justify-center' : 'gap-2'} ${className} group`}>
            {/* The green rounded square icon */}
            <div className={`size-10 rounded-xl bg-[#13ec80] flex items-center justify-center shadow-lg shadow-[#13ec80]/20 transition-transform group-hover:scale-105 shrink-0`}>
                <span className="material-symbols-outlined text-[#102219] font-black text-2xl">
                    storefront
                </span>
            </div>

            {/* The branding text */}
            {showText && !collapsed && (
                <span className={`font-black text-xl tracking-tighter ${dark ? 'text-white' : 'text-slate-900'} transition-opacity animate-in fade-in`}>
                    DonTendero
                </span>
            )}
        </div>
    );
}
