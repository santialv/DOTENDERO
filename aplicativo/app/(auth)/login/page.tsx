"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

export default function LoginPage() {
    const router = useRouter();
    const [isLoading, setIsLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        // Simulate network delay
        await new Promise(resolve => setTimeout(resolve, 1500));
        setIsLoading(false);

        // Check for Admin Credential Simulation
        // In a real app, this would be handled by Supabase Auth Roles (RBAC)
        const emailInput = (e.target as HTMLFormElement).email.value;

        if (emailInput === "admin@dontendero.com") {
            router.push("/admin/dashboard");
        } else {
            router.push("/caja");
        }
    };

    return (
        <div className="flex min-h-screen flex-row font-display bg-white text-slate-900">
            {/* Left Side: Visual/Marketing (Hidden on mobile) */}
            <div className="relative hidden w-0 flex-1 lg:block bg-slate-900">
                <div className="absolute inset-0 h-full w-full">
                    {/* Image background */}
                    <div
                        className="h-full w-full bg-cover bg-center opacity-80"
                        style={{ backgroundImage: 'url("https://lh3.googleusercontent.com/aida-public/AB6AXuDjnnJ_Bojfahx6uj6ZM6G6F8WqQhiG_5T2QAIflcv84V7X8VlPphs8trlDQVewnTc6LkxIQ94kuxjeyklAWxcFnnXg0Drt4h5AbwLBYFYQZzNb3KM_0arNJuDC4WphD-rkFVZSIChbo9MY5KWq936jRrk4PjCKZ1nLIX30AJDEeo9z_WiTtRMyjmBjB2_-oqQ0L9_O6wUC71aS5Tvc_2FVw9hk9Kso5bKqswjR8_BWSo2F525tzf8gUQS0hEIvFuzcgC26LjFdk6c")' }}
                    />
                    {/* Overlay gradient */}
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-900/90 via-slate-900/40 to-transparent"></div>
                </div>
                <div className="relative z-10 flex h-full flex-col justify-end p-12 text-white">
                    <div className="mb-8">
                        <div className="mb-4 flex size-12 items-center justify-center rounded-xl bg-primary/20 backdrop-blur-sm border border-primary/30 text-primary">
                            {/* Custom Logo Icon Small */}
                            <svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-8 h-8">
                                <rect x="50" y="5" width="64" height="64" transform="rotate(45 50 5)" fill="#13ec80" rx="4" />
                                <path d="M55 35 L40 50 L55 65" stroke="#000000" strokeWidth="8" strokeLinecap="round" strokeLinejoin="round" />
                            </svg>
                        </div>
                        <h2 className="text-3xl font-bold leading-tight tracking-tight text-white mb-2">Tu aliado en el crecimiento</h2>
                        <p className="text-lg text-slate-300 max-w-md">Gestiona tu inventario, ventas y fiados en un solo lugar.</p>
                    </div>
                </div>
            </div>

            {/* Right Side: Login Form */}
            <div className="flex flex-1 flex-col justify-center px-4 py-12 sm:px-6 lg:flex-none lg:px-20 xl:px-24 w-full lg:w-[600px] bg-white">
                <div className="mx-auto w-full max-w-sm lg:w-96">
                    {/* Logo Header */}
                    <div className="flex flex-col items-center mb-10">
                        <div className="flex items-center gap-3 mb-1">
                            {/* Custom Logo: Green Rounded Square with Storefront */}
                            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[#13ec80] text-slate-900 shadow-sm shrink-0">
                                <span className="material-symbols-outlined text-[24px]">storefront</span>
                            </div>
                            <span className="text-3xl font-black tracking-tighter text-slate-900">DonTendero</span>
                        </div>
                        <div className="w-full flex pl-[52px]">
                            <p className="text-xs font-bold tracking-[0.2em] text-[#13ec80]">POS</p>
                        </div>
                    </div>

                    <div className="text-center mb-8">
                        <h1 className="text-2xl font-bold tracking-tight text-slate-900">Bienvenido de nuevo</h1>
                    </div>

                    {/* Form */}
                    <form onSubmit={handleSubmit} className="space-y-5">
                        <div className="space-y-1.5">
                            <label htmlFor="email" className="block text-sm font-bold text-slate-700">
                                Correo electrónico
                            </label>
                            <input
                                id="email"
                                name="email"
                                type="email"
                                autoComplete="email"
                                required
                                placeholder="ejemplo@correo.com"
                                className="block w-full rounded-xl border border-slate-200 py-3 px-4 text-slate-900 placeholder:text-slate-400 focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all bg-white"
                            />
                        </div>

                        <div className="space-y-1.5">
                            <label htmlFor="password" className="block text-sm font-bold text-slate-700">
                                Contraseña
                            </label>
                            <input
                                id="password"
                                name="password"
                                type="password"
                                autoComplete="current-password"
                                required
                                placeholder="••••••••"
                                className="block w-full rounded-xl border border-slate-200 py-3 px-4 text-slate-900 placeholder:text-slate-400 focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all bg-white"
                            />
                        </div>

                        <div className="flex items-center justify-between">
                            <div className="flex items-center">
                                <input
                                    id="remember-me"
                                    name="remember-me"
                                    type="checkbox"
                                    className="h-4 w-4 rounded border-slate-300 text-primary focus:ring-primary"
                                />
                                <label htmlFor="remember-me" className="ml-2 block text-sm text-slate-600">
                                    Recordarme
                                </label>
                            </div>
                            <div className="text-sm">
                                <Link href="/forgot-password" className="font-semibold text-primary hover:text-primary-dark transition-colors">
                                    ¿Olvidaste tu contraseña?
                                </Link>
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={isLoading}
                            className="w-full rounded-xl bg-primary py-3.5 text-sm font-bold text-slate-900 shadow-lg shadow-primary/25 hover:bg-primary-hover hover:shadow-primary/40 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 transition-all transform active:scale-[0.98] disabled:opacity-70 disabled:cursor-not-allowed"
                        >
                            {isLoading ? 'Ingresando...' : 'Iniciar Sesión'}
                        </button>
                    </form>

                    <div className="mt-8 pt-6 border-t border-slate-100 text-center">
                        <p className="text-sm text-slate-500">
                            ¿Aún no tienes cuenta?
                            <Link href="/register" className="font-bold text-primary hover:text-primary-dark ml-1 transition-colors">
                                Regístrate gratis
                            </Link>
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}
