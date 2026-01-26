"use client";

import { useState } from 'react';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { useToast } from "@/components/ui/toast";
import { motion } from 'framer-motion';
import { Store, Mail, Lock, Eye, EyeOff } from 'lucide-react';

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
        // ... (existing handleLogin logic logic is untouched, strictly preserve it if I were editing it, but here I am just replacing the top part of the file to inject usage)
        e.preventDefault();
        setLoading(true);

        try {
            const { data, error } = await supabase.auth.signInWithPassword({
                email,
                password,
            });

            if (error) {
                if (error.message === "Invalid login credentials") {
                    toast("¡Uy! Ese usuario o contraseña no cuadran. Revísalos bien.", "error");
                } else {
                    toast(error.message || "Credenciales inválidas", "error");
                }
            } else if (data.user) {
                toast("Bienvenido de nuevo", "success");

                // Check Role
                const { data: profile } = await supabase
                    .from('profiles')
                    .select('role')
                    .eq('id', data.user.id)
                    .single();

                router.refresh();

                if (profile?.role === 'super_admin') {
                    router.push('/admin');
                } else {
                    router.push('/venta');
                }
            }
        } catch (error) {
            toast("Ocurrió un error inesperado", "error");
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="font-sans bg-background-light text-text-main h-full antialiased selection:bg-primary selection:text-text-main">
            <div className="flex min-h-screen flex-row">
                {/* Left Side: Visual/Marketing (Hidden on mobile) */}
                <div className="relative hidden w-0 flex-1 lg:block bg-black overflow-hidden">
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ duration: 1.5 }}
                        className="absolute inset-0 h-full w-full bg-black"
                    >
                        {/* 1. Video Support (Primary) */}
                        <video
                            autoPlay
                            loop
                            muted
                            playsInline
                            className="absolute inset-0 h-full w-full object-cover scale-105"
                        >
                            <source src="/images/login-video.mp4" type="video/mp4" />
                            {/* Fallback Image if video fails or is not yet uploaded */}
                            <Image
                                src="/images/login-nb.gif"
                                alt="Background"
                                fill
                                className="object-cover"
                                priority
                                unoptimized
                            />
                        </video>

                        {/* Premium Cinematic Overlays */}
                        <div className="absolute inset-0 bg-black/40"></div>
                        <div className="absolute inset-0 backdrop-blur-[1px]"></div>
                        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent"></div>
                        <div className="absolute inset-0 opacity-[0.02] pointer-events-none bg-[url('https://grainy-gradients.vercel.app/noise.svg')]"></div>
                    </motion.div>

                    <div className="relative z-10 flex h-full flex-col justify-end p-12 text-white">
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.3, duration: 0.6 }}
                            className="mb-8"
                        >
                            <div className="mb-4 flex size-12 items-center justify-center rounded-lg bg-primary/20 backdrop-blur-sm">
                                <Store className="w-8 h-8 text-primary" />
                            </div>
                            <h2 className="text-3xl font-bold leading-tight tracking-tight text-white mb-2">Tu aliado en el crecimiento</h2>
                            <p className="text-lg text-gray-300 max-w-md">Gestiona tu inventario, ventas y fiados en un solo lugar. DonTendero hace que tu negocio prospere.</p>
                        </motion.div>
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: 0.6, duration: 0.6 }}
                            className="flex items-center gap-2 text-sm text-gray-400"
                        >
                            <span>© 2026 DonTendero</span>
                            <span>•</span>
                            <a className="hover:text-primary transition-colors" href="/legal/privacidad" target="_blank">Privacidad</a>
                            <span>•</span>
                            <a className="hover:text-primary transition-colors" href="/legal/terminos" target="_blank">Términos</a>
                        </motion.div>
                    </div>
                </div>

                {/* Right Side: Login Form */}
                <div className="flex flex-1 flex-col justify-center px-4 py-12 sm:px-6 lg:flex-none lg:px-20 xl:px-24 bg-white w-full lg:w-[600px]">
                    <motion.div
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.6, ease: "easeOut" }}
                        className="mx-auto w-full max-w-sm lg:w-96"
                    >
                        {/* Logo Header */}
                        <div className="flex flex-col gap-6 mb-8">
                            <motion.div
                                initial={{ opacity: 0, scale: 0.9 }}
                                animate={{ opacity: 1, scale: 1 }}
                                transition={{ delay: 0.2, duration: 0.5 }}
                                className="flex items-center gap-3 mb-2"
                            >
                                <img src="/logo.png" alt="DonTendero POS" className="h-[42px] w-auto object-contain" />
                            </motion.div>
                            <div>
                                <h1 className="text-3xl font-bold tracking-tight text-text-main">Bienvenido de nuevo</h1>
                                <p className="mt-2 text-base text-text-secondary">
                                    Ingresa tus credenciales para acceder a tu panel.
                                </p>
                            </div>
                        </div>

                        {/* Form */}
                        <div className="mt-2">
                            <form onSubmit={handleLogin} className="space-y-6">
                                {/* Email Field */}
                                <div className="space-y-2">
                                    <label className="block text-sm font-medium leading-6 text-text-main" htmlFor="email">
                                        Correo electrónico o Usuario
                                    </label>
                                    <div className="relative rounded-lg shadow-sm">
                                        <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                                            <Mail className="w-5 h-5 text-text-secondary" />
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
                                            className="block w-full rounded-lg border-0 py-3.5 pl-10 text-text-main ring-1 ring-inset ring-input-border placeholder:text-text-secondary/70 focus:ring-2 focus:ring-inset focus:ring-primary sm:text-sm sm:leading-6 bg-white outline-none transition-shadow duration-200"
                                        />
                                    </div>
                                </div>

                                {/* Password Field */}
                                <div className="space-y-2">
                                    <label className="block text-sm font-medium leading-6 text-text-main" htmlFor="password">
                                        Contraseña
                                    </label>
                                    <div className="relative rounded-lg shadow-sm">
                                        <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                                            <Lock className="w-5 h-5 text-text-secondary" />
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
                                            className="block w-full rounded-lg border-0 py-3.5 pl-10 pr-10 text-text-main ring-1 ring-inset ring-input-border placeholder:text-text-secondary/70 focus:ring-2 focus:ring-inset focus:ring-primary sm:text-sm sm:leading-6 bg-white outline-none transition-shadow duration-200"
                                        />
                                        <button
                                            type="button"
                                            onClick={() => setShowPassword(!showPassword)}
                                            className="absolute inset-y-0 right-0 flex items-center pr-3 cursor-pointer text-text-secondary hover:text-primary transition-colors outline-none"
                                        >
                                            {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
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
                                            className="h-4 w-4 rounded border-input-border text-primary focus:ring-primary bg-white cursor-pointer"
                                        />
                                        <label className="ml-2 block text-sm text-text-main cursor-pointer" htmlFor="remember-me">Recordarme</label>
                                    </div>
                                    <div className="text-sm">
                                        <Link href="/login/recuperar" className="font-semibold text-primary hover:text-primary-hover hover:underline decoration-2 underline-offset-2">
                                            ¿Olvidaste tu contraseña?
                                        </Link>
                                    </div>
                                </div>

                                {/* Submit Button */}
                                <div>
                                    <motion.button
                                        whileHover={{ scale: 1.02 }}
                                        whileTap={{ scale: 0.98 }}
                                        type="submit"
                                        disabled={loading}
                                        className="flex w-full justify-center rounded-lg bg-[#13ec80] px-3 py-3.5 text-sm font-bold leading-6 text-[#0d1b14] shadow-sm hover:bg-[#0fd673] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#13ec80] transition-all duration-200 disabled:opacity-70 disabled:cursor-not-allowed"
                                    >
                                        {loading ? 'Iniciando sesión...' : 'Iniciar Sesión'}
                                    </motion.button>
                                </div>
                            </form>

                            {/* Divider */}
                            <div className="relative mt-8">
                                <div aria-hidden="true" className="absolute inset-0 flex items-center">
                                    <div className="w-full border-t border-gray-200"></div>
                                </div>
                                <div className="relative flex justify-center text-sm font-medium leading-6">
                                    <span className="bg-background-light px-6 text-text-secondary">¿Nuevo en DonTendero?</span>
                                </div>
                            </div>

                            {/* Create Account Button */}
                            <div className="mt-6">
                                <Link href="/register">
                                    <motion.button
                                        whileHover={{ scale: 1.02 }}
                                        whileTap={{ scale: 0.98 }}
                                        className="flex w-full items-center justify-center gap-3 rounded-lg bg-white px-3 py-3.5 text-sm font-bold text-text-main shadow-sm ring-1 ring-inset ring-input-border hover:bg-gray-50 focus-visible:ring-transparent transition-all duration-200"
                                    >
                                        Crear una cuenta
                                    </motion.button>
                                </Link>
                            </div>
                        </div>
                    </motion.div>
                </div>
            </div>
        </div>
    );
}

