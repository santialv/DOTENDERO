"use client";
import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

interface HeaderProps {
    dark?: boolean;
}

export function Header({ dark = true }: HeaderProps) {
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const pathname = usePathname();

    const navLinks = [
        { name: "Inicio", href: "/" },
        { name: "Beneficios", href: "/beneficios" },
        { name: "Cómo funciona", href: "/como-funciona" },
        { name: "Asesoría", href: "/asesoria" },
        { name: "Historia", href: "/historia" },
        { name: "Planes", href: "/planes" },
    ];

    return (
        <header className={`w-full h-20 flex items-center justify-center fixed top-0 z-[100] transition-all ${dark ? 'bg-[#102219]/80 backdrop-blur-md border-b border-[#234836]' : 'bg-white/80 backdrop-blur-md border-b border-gray-100'}`}>
            <div className="w-full max-w-[1200px] px-6 flex items-center justify-between">
                <Link href="/" className="flex items-center gap-2 group">
                    <div className="size-8 rounded-lg bg-primary flex items-center justify-center shadow-lg shadow-primary/20 transition-transform group-hover:scale-110">
                        <span className="material-symbols-outlined text-background-dark font-black text-xl">storefront</span>
                    </div>
                    <span className={`font-black text-xl tracking-tighter ${dark ? 'text-white' : 'text-slate-900'}`}>DonTendero</span>
                </Link>

                {/* Desktop Nav */}
                <nav className="hidden lg:flex items-center gap-6 mx-8">
                    {navLinks.map((link) => {
                        const isActive = pathname === link.href;
                        return (
                            <Link
                                key={link.href}
                                href={link.href}
                                className={`text-sm font-bold transition-all relative py-1 px-2 rounded-lg ${isActive
                                        ? (dark ? 'text-primary bg-primary/10' : 'text-primary bg-primary/5')
                                        : (dark ? 'text-gray-400 hover:text-white' : 'text-gray-500 hover:text-slate-900')
                                    }`}
                            >
                                {link.name}
                                {isActive && (
                                    <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 bg-primary rounded-full"></span>
                                )}
                            </Link>
                        );
                    })}
                </nav>

                <div className="flex gap-3">
                    <a
                        href="https://dontendero.com/login"
                        className={`flex items-center justify-center overflow-hidden rounded-full h-10 px-4 sm:px-6 font-bold transition-all ${dark ? 'bg-[#234836] text-white hover:bg-[#1e3d2f] border border-[#234836]' : 'bg-slate-900 text-white hover:bg-slate-800'}`}
                    >
                        <span className="truncate text-sm">Ingresar</span>
                    </a>
                    <Link
                        href="/planes"
                        className="flex items-center justify-center overflow-hidden rounded-full h-10 px-4 sm:px-6 bg-primary text-background-dark text-sm font-bold hover:bg-[#0fd672] transition-colors"
                    >
                        Comenzar
                    </Link>
                </div>
            </div>
        </header>
    );
}
