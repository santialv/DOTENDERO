"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

interface HeaderProps {
    dark?: boolean;
}

export function Header({ dark = true }: HeaderProps) {
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const pathname = usePathname();

    // Prevent scroll when menu is open
    useEffect(() => {
        if (isMenuOpen) {
            document.body.style.overflow = "hidden";
        } else {
            document.body.style.overflow = "auto";
        }
        return () => { document.body.style.overflow = "auto"; };
    }, [isMenuOpen]);

    const navLinks = [
        { name: "Inicio", href: "/" },
        { name: "Beneficios", href: "/beneficios" },
        { name: "Cómo funciona", href: "/como-funciona" },
        { name: "Asesoría", href: "/asesoria" },
        { name: "Historia", href: "/historia" },
        { name: "Planes", href: "/planes" },
    ];

    return (
        <>
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

                    <div className="flex items-center gap-3">
                        <div className="hidden sm:flex gap-3">
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

                        {/* Mobile Menu Button */}
                        <button
                            onClick={() => setIsMenuOpen(true)}
                            className={`lg:hidden flex items-center justify-center size-12 rounded-2xl transition-all active:scale-90 ${dark ? 'bg-white/10 text-white' : 'bg-slate-100 text-slate-900'}`}
                            aria-label="Abrir menú"
                        >
                            <span className="material-symbols-outlined text-3xl font-black">menu</span>
                        </button>
                    </div>
                </div>
            </header>

            {/* Mobile Nav Sidebar / Drawer - OUTSIDE the filtered header */}
            <div
                className={`fixed inset-0 z-[200] transition-all duration-300 lg:hidden ${isMenuOpen ? 'visible' : 'invisible pointer-events-none'}`}
            >
                {/* Backdrop with intense blur */}
                <div
                    className={`absolute inset-0 bg-slate-900/40 backdrop-blur-md transition-opacity duration-300 ${isMenuOpen ? 'opacity-100' : 'opacity-0'}`}
                    onClick={() => setIsMenuOpen(false)}
                />

                {/* Drawer Panel - White Solid - Slide from Right */}
                <div
                    className={`absolute top-0 right-0 w-[85%] max-w-[320px] h-full bg-white shadow-[0_0_50px_rgba(0,0,0,0.3)] transition-transform duration-300 ease-out flex flex-col ${isMenuOpen ? 'translate-x-0' : 'translate-x-full'}`}
                >
                    {/* Drawer Header */}
                    <div className="p-6 flex items-center justify-between border-b border-slate-100">
                        <div className="flex items-center gap-2">
                            <div className="size-8 rounded-lg bg-primary flex items-center justify-center">
                                <span className="material-symbols-outlined text-background-dark font-black text-xl">storefront</span>
                            </div>
                            <span className="font-black text-xl text-slate-900 tracking-tighter">DonTendero</span>
                        </div>
                        <button
                            onClick={() => setIsMenuOpen(false)}
                            className="size-10 flex items-center justify-center rounded-xl bg-slate-100 text-slate-900 active:scale-90 transition-transform"
                        >
                            <span className="material-symbols-outlined font-black">close</span>
                        </button>
                    </div>

                    {/* Drawer Content */}
                    <nav className="flex-1 overflow-y-auto p-4 space-y-2">
                        {navLinks.map((link) => {
                            const isActive = pathname === link.href;
                            return (
                                <Link
                                    key={link.href}
                                    href={link.href}
                                    onClick={() => setIsMenuOpen(false)}
                                    className={`flex items-center justify-between p-4 rounded-2xl font-black text-lg transition-all ${isActive
                                        ? 'bg-primary/10 text-primary'
                                        : 'text-slate-600 active:bg-slate-50'
                                        }`}
                                >
                                    {link.name}
                                    <span className={`material-symbols-outlined text-sm ${isActive ? 'text-primary' : 'text-slate-300'}`}>
                                        {isActive ? 'fiber_manual_record' : 'chevron_right'}
                                    </span>
                                </Link>
                            );
                        })}
                    </nav>

                    {/* Drawer Footer */}
                    <div className="p-6 border-t border-slate-100 bg-slate-50 space-y-3">
                        <a
                            href="https://dontendero.com/login"
                            className="flex items-center justify-center h-14 rounded-2xl font-black text-slate-900 border-2 border-slate-200 bg-white active:scale-95 transition-all text-sm uppercase tracking-wider"
                        >
                            Ingresar
                        </a>
                        <Link
                            href="/planes"
                            onClick={() => setIsMenuOpen(false)}
                            className="flex items-center justify-center h-14 rounded-2xl font-black bg-primary text-slate-900 shadow-xl shadow-primary/30 active:scale-95 transition-all text-sm uppercase tracking-wider"
                        >
                            Comenzar ahora
                        </Link>
                    </div>
                </div>
            </div>
        </>
    );
}
