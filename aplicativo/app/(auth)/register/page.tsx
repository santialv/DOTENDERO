"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

export default function RegisterPage() {
    const router = useRouter();
    const [isLoading, setIsLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        // Simulate network delay
        await new Promise(resolve => setTimeout(resolve, 1500));
        setIsLoading(false);
        router.push("/caja");
    };

    return (
        <div className="flex min-h-screen flex-row font-display bg-white text-slate-900">
            {/* Left Side: Visual / Hero */}
            <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden bg-slate-900">
                <div
                    className="absolute inset-0 h-full w-full bg-cover bg-center opacity-60 mix-blend-overlay"
                    style={{ backgroundImage: 'url("https://lh3.googleusercontent.com/aida-public/AB6AXuBEOdEkdUjBG-tgn0hpYWw7k7t01mA6H2fn09LYT9ntJLCXJTNxQSPmZxm91x04cbnaAn0E16aIhBLQlM-h_3A838kcizKPdvbmXpFRZLR9RLl5fAoMJUOYemzh4aSn4_ZdTK1m2shjn8Wseh5w0NNzxIq9YT5eWpO9tG6sXbXDXxqJ9OAAfXg9YTHs-KrJwJyk4B_rSpe1w3iGF4DoMG_nHHMIPB5skRSCDkNANz6C4QOw-wETm2qcGzELGGc5BamfEb5s2ASsAh8")' }}
                />
                <div className="relative z-10 flex h-full flex-col justify-end p-16">
                    <div className="mb-6 h-12 w-12 rounded-xl bg-primary/20 flex items-center justify-center text-background-dark border border-primary/30">
                        <svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-8 h-8">
                            <rect x="50" y="5" width="64" height="64" transform="rotate(45 50 5)" fill="#13ec80" rx="4" />
                            <path d="M55 35 L40 50 L55 65" stroke="#000000" strokeWidth="8" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                    </div>
                    <blockquote className="text-white">
                        <p className="text-3xl font-bold leading-tight mb-4">"Desde que uso DonTendero, el inventario de mi miscelánea está siempre al día."</p>
                        <footer className="text-primary font-medium text-lg">Carlos Rodríguez, Tendero en Bogotá</footer>
                    </blockquote>
                </div>
            </div>

            {/* Right Side: Form */}
            <div className="flex flex-1 flex-col justify-center px-4 py-12 sm:px-6 lg:flex-none lg:px-20 xl:px-24 w-full lg:w-1/2 bg-white">
                <div className="mx-auto w-full max-w-sm lg:w-96">
                    {/* Logo Header */}
                    <div className="flex flex-col items-center mb-8">
                        <div className="flex items-center gap-3 mb-2">
                            <div className="size-10 relative">
                                <svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full drop-shadow-sm">
                                    <rect x="50" y="5" width="64" height="64" transform="rotate(45 50 5)" fill="#13ec80" rx="4" />
                                    <path d="M55 35 L40 50 L55 65" stroke="#000000" strokeWidth="8" strokeLinecap="round" strokeLinejoin="round" />
                                </svg>
                            </div>
                            <span className="text-3xl font-black tracking-tighter text-slate-900">DonTendero</span>
                        </div>
                        <p className="text-sm text-slate-500 font-medium tracking-wide">CREAR CUENTA</p>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div className="space-y-1.5">
                            <label htmlFor="name" className="block text-sm font-bold text-slate-700">
                                Nombre del Negocio o Propietario
                            </label>
                            <input
                                id="name"
                                name="name"
                                type="text"
                                required
                                placeholder="Ej. Tienda La Esperanza"
                                className="block w-full rounded-xl border border-slate-200 py-3 px-4 text-slate-900 placeholder:text-slate-400 focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all bg-white"
                            />
                        </div>

                        <div className="space-y-1.5">
                            <label htmlFor="email" className="block text-sm font-bold text-slate-700">
                                Correo electrónico
                            </label>
                            <input
                                id="email"
                                name="email"
                                type="email"
                                required
                                placeholder="ejemplo@correo.com"
                                className="block w-full rounded-xl border border-slate-200 py-3 px-4 text-slate-900 placeholder:text-slate-400 focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all bg-white"
                            />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-1.5">
                                <label htmlFor="password" className="block text-sm font-bold text-slate-700">
                                    Contraseña
                                </label>
                                <input
                                    id="password"
                                    name="password"
                                    type="password"
                                    required
                                    placeholder="••••••••"
                                    className="block w-full rounded-xl border border-slate-200 py-3 px-4 text-slate-900 placeholder:text-slate-400 focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all bg-white"
                                />
                            </div>
                            <div className="space-y-1.5">
                                <label htmlFor="confirm-password" className="block text-sm font-bold text-slate-700">
                                    Confirmar
                                </label>
                                <input
                                    id="confirm-password"
                                    name="confirm-password"
                                    type="password"
                                    required
                                    placeholder="••••••••"
                                    className="block w-full rounded-xl border border-slate-200 py-3 px-4 text-slate-900 placeholder:text-slate-400 focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all bg-white"
                                />
                            </div>
                        </div>

                        <div className="flex items-start pt-2">
                            <div className="flex h-5 items-center">
                                <input
                                    id="terms"
                                    name="terms"
                                    type="checkbox"
                                    className="h-4 w-4 rounded border-slate-300 text-primary focus:ring-primary"
                                />
                            </div>
                            <div className="ml-3 text-sm">
                                <label htmlFor="terms" className="text-slate-500">
                                    Acepto los <a href="#" className="font-bold text-slate-700 underline">Términos</a> y <a href="#" className="font-bold text-slate-700 underline">Privacidad</a>.
                                </label>
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={isLoading}
                            className="w-full rounded-xl bg-primary py-3.5 text-sm font-bold text-slate-900 shadow-lg shadow-primary/25 hover:bg-primary-hover hover:shadow-primary/40 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 transition-all transform active:scale-[0.98] disabled:opacity-70 disabled:cursor-not-allowed"
                        >
                            {isLoading ? 'Creando cuenta...' : 'Crear Cuenta'}
                        </button>
                    </form>

                    <div className="mt-8 pt-6 border-t border-slate-100 text-center">
                        <p className="text-sm text-slate-500">
                            ¿Ya tienes cuenta?
                            <Link href="/login" className="font-bold text-primary hover:text-primary-dark ml-1 transition-colors">
                                Iniciar sesión
                            </Link>
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}
