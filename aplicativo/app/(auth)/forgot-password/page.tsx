"use client";

import Link from "next/link";
import { useState } from "react";

export default function ForgotPasswordPage() {
    const [emailSent, setEmailSent] = useState(false);
    const [isLoading, setIsLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        // Simulate network delay
        await new Promise(resolve => setTimeout(resolve, 1500));
        setIsLoading(false);
        setEmailSent(true);
    };

    return (
        <div className="flex min-h-screen flex-row font-display bg-white text-slate-900">
            {/* Left Side: Visual/Image */}
            <div className="hidden lg:flex lg:w-1/2 relative bg-[#edfcf4] items-center justify-center p-12 overflow-hidden">
                {/* Background Pattern/Effect */}
                <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-[0.05]"></div>

                <div className="relative w-full max-w-lg">
                    {/* Decorative Elements around the image */}
                    <div className="absolute -top-12 -right-12 h-64 w-64 rounded-full bg-primary/20 blur-3xl"></div>
                    <div className="absolute -bottom-12 -left-12 h-64 w-64 rounded-full bg-blue-500/10 blur-3xl"></div>

                    <div className="relative overflow-hidden rounded-2xl shadow-xl border border-white/50">
                        {/* Image Component */}
                        <div
                            className="aspect-[4/3] bg-gray-200 bg-cover bg-center"
                            style={{ backgroundImage: "url('https://lh3.googleusercontent.com/aida-public/AB6AXuBSnXmW-zMXKG8U3YWqp_kuM_OpPkYJ8XGiBlbd7VhhPnkz4gpM9osDU1SjHJZ1MKqp-DsVpVqsWaNDoC6WB_6oGGdaPl1R37ugPSxxwyBwhv6mCtteKMk2nGq0igA7znkxS7m6lJ1RqiipS_trcZsghIzvkWEIYhJuJlrxc4vUEj3zqp6VAnzhx7ZlaPQTKD1soeyXIkuyI89LddRGzvL_2IO00IODHkSGA7HHVwgw9L795GTh34QZHdYnb1Op9YQ9BEYj4X4fy_k')" }}
                        ></div>
                        {/* Overlay Text */}
                        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent p-8 pt-24 text-white">
                            <blockquote className="text-lg font-medium italic">
                                "Con DonTendero recuperé el control de mi inventario en semanas."
                            </blockquote>
                        </div>
                    </div>
                </div>
            </div>

            {/* Right Side: Form Container */}
            <div className="flex w-full flex-col justify-center px-6 py-12 lg:w-1/2 lg:px-20 xl:px-32 bg-white">
                <div className="w-full max-w-[480px]">
                    {/* Logo Section */}
                    <div className="flex flex-col mb-10">
                        <div className="flex items-center gap-3">
                            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[#13ec80] text-slate-900 shadow-sm shrink-0">
                                <span className="material-symbols-outlined text-[24px]">storefront</span>
                            </div>
                            <div className="flex flex-col">
                                <span className="text-3xl font-black tracking-tighter text-slate-900 leading-none">DonTendero</span>
                                <span className="text-xs font-bold tracking-[0.2em] text-[#13ec80] leading-none mt-1">POS</span>
                            </div>
                        </div>
                    </div>

                    {emailSent ? (
                        <div className="animate-in fade-in slide-in-from-bottom-5 duration-500">
                            <div className="mb-8 flex flex-col gap-3">
                                <div className="h-16 w-16 bg-primary/20 rounded-full flex items-center justify-center mb-4 text-primary">
                                    <span className="material-symbols-outlined text-[32px]">mark_email_read</span>
                                </div>
                                <h1 className="text-slate-900 text-3xl font-black leading-tight tracking-tight">
                                    ¡Correo Enviado!
                                </h1>
                                <p className="text-slate-500 text-base font-normal leading-normal">
                                    Revisa tu bandeja de entrada y sigue las instrucciones.
                                </p>
                            </div>
                            <Link href="/login" className="flex w-full cursor-pointer items-center justify-center overflow-hidden rounded-xl h-12 px-5 bg-slate-100 hover:bg-slate-200 text-slate-900 text-base font-bold leading-normal tracking-[0.015em] transition-colors">
                                Volver al Inicio de Sesión
                            </Link>
                        </div>
                    ) : (
                        <form onSubmit={handleSubmit}>
                            <div className="mb-8 flex flex-col gap-3">
                                <h1 className="text-slate-900 text-3xl font-black leading-tight tracking-tight">
                                    ¿Olvidaste tu contraseña?
                                </h1>
                                <p className="text-slate-500 text-base font-normal">
                                    Ingresa tu correo electrónico y te ayudaremos.
                                </p>
                            </div>

                            <div className="mb-6 space-y-1.5">
                                <label htmlFor="email" className="block text-sm font-bold text-slate-700">
                                    Correo electrónico
                                </label>
                                <input
                                    id="email"
                                    type="email"
                                    required
                                    placeholder="ejemplo@tienda.com"
                                    className="block w-full rounded-xl border border-slate-200 py-3 px-4 text-slate-900 placeholder:text-slate-400 focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all bg-white"
                                />
                            </div>

                            <button
                                type="submit"
                                disabled={isLoading}
                                className="w-full rounded-xl bg-primary py-3.5 text-sm font-bold text-slate-900 shadow-lg shadow-primary/25 hover:bg-primary-hover hover:shadow-primary/40 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 transition-all transform active:scale-[0.98] disabled:opacity-70 disabled:cursor-not-allowed"
                            >
                                <span className="truncate">{isLoading ? 'Enviando...' : 'Enviar Instrucciones'}</span>
                            </button>

                            <div className="mt-8 text-center">
                                <p className="text-sm text-slate-500">
                                    ¿Ya te acordaste?
                                    <Link href="/login" className="font-bold text-primary hover:text-primary-dark ml-1 transition-colors">
                                        Iniciar Sesión
                                    </Link>
                                </p>
                            </div>
                        </form>
                    )}
                </div>
            </div>
        </div>
    );
}
