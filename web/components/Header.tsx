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
                        onClick={() => setIsMenuOpen(!isMenuOpen)}
                        className={`lg:hidden flex items-center justify-center size-12 rounded-2xl relative z-[150] transition-all active:scale-90 ${isMenuOpen ? 'bg-primary text-slate-900' : (dark ? 'bg-white/10 text-white' : 'bg-slate-100 text-slate-900')}`}
                        aria-label="Toggle menu"
                    >
                        <span className="material-symbols-outlined text-3xl font-black">
                            {isMenuOpen ? 'close' : 'menu'}
                        </span>
                    </button>
                </div>
            </div>

            {/* Mobile Nav Sidebar / Drawer */}
            <div
                className={`lg:hidden fixed inset-0 z-[150] transition-all duration-300 ${isMenuOpen ? 'visible' : 'invisible pointer-events-none'}`}
            >
                {/* Backdrop with blur */}
                <div
                    className={`absolute inset-0 bg-slate-900/60 backdrop-blur-sm transition-opacity duration-300 ${isMenuOpen ? 'opacity-100' : 'opacity-0'}`}
                    onClick={() => setIsMenuOpen(false)}
                />

                {/* Drawer Panel - White Solid */}
                <div
                    className={`absolute top-0 right-0 w-[80%] max-w-sm h-full bg-white shadow-2xl transition-transform duration-300 ease-out flex flex-col ${isMenuOpen ? 'translate-x-0' : 'translate-x-full'}`}
                >
                    {/* Drawer Header */}
                    <div className="p-6 flex items-center justify-between border-b border-slate-100">
                        <span className="font-black text-xl text-slate-900 tracking-tighter">DonTendero</span>
                        <button
                            onClick={() => setIsMenuOpen(false)}
                            className="size-10 flex items-center justify-center rounded-xl bg-slate-100 text-slate-900 active:scale-90 transition-transform"
                        >
                            <span className="material-symbols-outlined font-black">close</span>
                        </button>
                    </div>

                    {/* Drawer Content */}
                    <nav className="flex-1 overflow-y-auto p-6 space-y-3">
                        {navLinks.map((link) => {
                            const isActive = pathname === link.href;
                            return (
                                <Link
                                    key={link.href}
                                    href={link.href}
                                    onClick={() => setIsMenuOpen(false)}
                                    className={`flex items-center justify-between p-5 rounded-2xl font-black text-xl transition-all ${isActive
                                        ? 'bg-primary text-slate-900 shadow-lg shadow-primary/20'
                                        : 'text-slate-500 active:bg-slate-50'
                                        }`}
                                >
                                    {link.name}
                                    <span className={`material-symbols-outlined text-sm ${isActive ? 'text-slate-900' : 'text-slate-300'}`}>
                                        arrow_forward_ios
                                    </span>
                                </Link>
                            );
                        })}
                    </nav>

                    {/* Drawer Footer */}
                    <div className="p-6 border-t border-slate-100 bg-slate-50">
                        <div className="grid grid-cols-1 gap-4">
                            <a
                                href="https://dontendero.com/login"
                                className="flex items-center justify-center h-14 rounded-2xl font-black text-slate-900 border-2 border-slate-200 bg-white"
                            >
                                Ingresar
                            </a>
                            <Link
                                href="/planes"
                                onClick={() => setIsMenuOpen(false)}
                                className="flex items-center justify-center h-14 rounded-2xl font-black bg-primary text-slate-900 shadow-xl shadow-primary/30"
                            >
                                Comenzar ahora
                            </Link>
                        </div>
                    </div>
                </div>
            </div>
        </header>
    );
}
