"use client";

import { useState } from 'react';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useToast } from "@/components/ui/toast";

export default function LoginPage() {
    const router = useRouter();
    const { toast } = useToast();

    // State
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [rememberMe, setRememberMe] = useState(false);
    const [loading, setLoading] = useState(false);

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            const { error } = await supabase.auth.signInWithPassword({
                email,
                password,
            });

            if (error) {
                toast(error.message || "Credenciales inválidas", "error");
            } else {
                toast("Bienvenido de nuevo", "success");
                router.refresh();
                router.push('/venta');
            }
        } catch (error) {
            toast("Ocurrió un error inesperado", "error");
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="font-sans bg-[#f8fcfa] text-[#0d1b14] h-full antialiased selection:bg-[#13ec80] selection:text-[#0d1b14]">
            <div className="flex min-h-screen flex-row">
                {/* Left Side: Visual/Marketing (Hidden on mobile) */}
                <div className="relative hidden w-0 flex-1 lg:block bg-[#102219]">
                    <div className="absolute inset-0 h-full w-full">
                        {/* Image background */}
                        <div
                            className="h-full w-full bg-cover bg-center opacity-80"
                            style={{ backgroundImage: 'url("https://lh3.googleusercontent.com/aida-public/AB6AXuDjnnJ_Bojfahx6uj6ZM6G6F8WqQhiG_5T2QAIflcv84V7X8VlPphs8trlDQVewnTc6LkxIQ94kuxjeyklAWxcFnnXg0Drt4h5AbwLBYFYQZzNb3KM_0arNJuDC4WphD-rkFVZSIChbo9MY5KWq936jRrk4PjCKZ1nLIX30AJDEeo9z_WiTtRMyjmBjB2_-oqQ0L9_O6wUC71aS5Tvc_2FVw9hk9Kso5bKqswjR8_BWSo2F525tzf8gUQS0hEIvFuzcgC26LjFdk6c")' }}
                        >
                        </div>
                        {/* Overlay gradient */}
                        <div className="absolute inset-0 bg-gradient-to-t from-[#102219]/90 via-[#102219]/40 to-transparent"></div>
                    </div>
                    <div className="relative z-10 flex h-full flex-col justify-end p-12 text-white">
                        <div className="mb-8">
                            <div className="mb-4 flex size-12 items-center justify-center rounded-lg bg-[#13ec80]/20 backdrop-blur-sm">
                                <span className="material-symbols-outlined text-[#13ec80] text-3xl">storefront</span>
                            </div>
                            <h2 className="text-3xl font-bold leading-tight tracking-tight text-white mb-2">Tu aliado en el crecimiento</h2>
                            <p className="text-lg text-gray-300 max-w-md">Gestiona tu inventario, ventas y fiados en un solo lugar. DonTendero hace que tu negocio prospere.</p>
                        </div>
                        <div className="flex items-center gap-2 text-sm text-gray-400">
                            <span>© 2026 DonTendero</span>
                            <span>•</span>
                            <a className="hover:text-[#13ec80] transition-colors" href="/legal/privacidad" target="_blank">Privacidad</a>
                            <span>•</span>
                            <a className="hover:text-[#13ec80] transition-colors" href="/legal/terminos" target="_blank">Términos</a>
                        </div>
                    </div>
                </div>

                {/* Right Side: Login Form */}
                <div className="flex flex-1 flex-col justify-center px-4 py-12 sm:px-6 lg:flex-none lg:px-20 xl:px-24 bg-white w-full lg:w-[600px]">
                    <div className="mx-auto w-full max-w-sm lg:w-96">
                        {/* Logo Header */}
                        <div className="flex flex-col gap-6 mb-8">
                            <div className="flex items-center gap-3 mb-2">
                                <img src="/logo.png" alt="DonTendero POS" className="h-[42px] w-auto object-contain" />
                            </div>
                            <div>
                                <h1 className="text-3xl font-bold tracking-tight text-[#0d1b14]">Bienvenido de nuevo</h1>
                                <p className="mt-2 text-base text-[#4c9a73]">
                                    Ingresa tus credenciales para acceder a tu panel.
                                </p>
                            </div>
                        </div>

                        {/* Form */}
                        <div className="mt-2">
                            <form onSubmit={handleLogin} className="space-y-6">
                                {/* Email Field */}
                                <div className="space-y-2">
                                    <label className="block text-sm font-medium leading-6 text-[#0d1b14]" htmlFor="email">
                                        Correo electrónico o Usuario
                                    </label>
                                    <div className="relative rounded-lg shadow-sm">
                                        <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                                            <span className="material-symbols-outlined text-[#4c9a73]">mail</span>
                                        </div>
                                        <input
                                            id="email"
                                            name="email"
                                            type="email"
                                            autoComplete="email"
                                            placeholder="ejemplo@correo.com"
                                            required
                                            value={email}
                                            onChange={(e) => setEmail(e.target.value)}
                                            className="block w-full rounded-lg border-0 py-3.5 pl-10 text-[#0d1b14] ring-1 ring-inset ring-[#cfe7db] placeholder:text-[#4c9a73]/70 focus:ring-2 focus:ring-inset focus:ring-[#13ec80] sm:text-sm sm:leading-6 bg-white outline-none"
                                        />
                                    </div>
                                </div>

                                {/* Password Field */}
                                <div className="space-y-2">
                                    <label className="block text-sm font-medium leading-6 text-[#0d1b14]" htmlFor="password">
                                        Contraseña
                                    </label>
                                    <div className="relative rounded-lg shadow-sm">
                                        <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                                            <span className="material-symbols-outlined text-[#4c9a73]">lock</span>
                                        </div>
                                        <input
                                            id="password"
                                            name="password"
                                            type={showPassword ? "text" : "password"}
                                            autoComplete="current-password"
                                            placeholder="••••••••"
                                            required
                                            value={password}
                                            onChange={(e) => setPassword(e.target.value)}
                                            className="block w-full rounded-lg border-0 py-3.5 pl-10 pr-10 text-[#0d1b14] ring-1 ring-inset ring-[#cfe7db] placeholder:text-[#4c9a73]/70 focus:ring-2 focus:ring-inset focus:ring-[#13ec80] sm:text-sm sm:leading-6 bg-white outline-none"
                                        />
                                        <button
                                            type="button"
                                            onClick={() => setShowPassword(!showPassword)}
                                            className="absolute inset-y-0 right-0 flex items-center pr-3 cursor-pointer text-[#4c9a73] hover:text-[#13ec80] transition-colors outline-none"
                                        >
                                            <span className="material-symbols-outlined">{showPassword ? 'visibility_off' : 'visibility'}</span>
                                        </button>
                                    </div>
                                </div>

                                {/* Remember & Forgot Password */}
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center">
                                        <input
                                            id="remember-me"
                                            name="remember-me"
                                            type="checkbox"
                                            checked={rememberMe}
                                            onChange={(e) => setRememberMe(e.target.checked)}
                                            className="h-4 w-4 rounded border-[#cfe7db] text-[#13ec80] focus:ring-[#13ec80] bg-white"
                                        />
                                        <label className="ml-2 block text-sm text-[#0d1b14]" htmlFor="remember-me">Recordarme</label>
                                    </div>
                                    <div className="text-sm">
                                        <Link href="/login/recuperar" className="font-semibold text-[#13ec80] hover:text-[#0fd673] hover:underline decoration-2 underline-offset-2">
                                            ¿Olvidaste tu contraseña?
                                        </Link>
                                    </div>
                                </div>

                                {/* Submit Button */}
                                <div>
                                    <button
                                        type="submit"
                                        disabled={loading}
                                        className="flex w-full justify-center rounded-lg bg-[#13ec80] px-3 py-3.5 text-sm font-bold leading-6 text-[#0d1b14] shadow-sm hover:bg-[#0fd673] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#13ec80] transition-all duration-200 transform active:scale-[0.98] disabled:opacity-70 disabled:cursor-not-allowed"
                                    >
                                        {loading ? 'Iniciando sesión...' : 'Iniciar Sesión'}
                                    </button>
                                </div>
                            </form>

                            {/* Divider */}
                            <div className="relative mt-8">
                                <div aria-hidden="true" className="absolute inset-0 flex items-center">
                                    <div className="w-full border-t border-gray-200"></div>
                                </div>
                                <div className="relative flex justify-center text-sm font-medium leading-6">
                                    <span className="bg-[#f8fcfa] px-6 text-[#4c9a73]">¿Nuevo en DonTendero?</span>
                                </div>
                            </div>

                            {/* Create Account Button */}
                            <div className="mt-6">
                                <Link
                                    href="/register"
                                    className="flex w-full items-center justify-center gap-3 rounded-lg bg-white px-3 py-3.5 text-sm font-bold text-[#0d1b14] shadow-sm ring-1 ring-inset ring-[#cfe7db] hover:bg-gray-50 focus-visible:ring-transparent transition-all duration-200"
                                >
                                    Crear una cuenta
                                </Link>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
