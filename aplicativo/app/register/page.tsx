"use client";

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { useToast } from "@/components/ui/toast";
import { motion } from 'framer-motion';
import { Store, User, Mail, Lock, Eye, EyeOff, ArrowRight, Construction } from 'lucide-react';

export default function RegisterPage() {
    const router = useRouter();
    const { toast } = useToast();

    // Configuration State
    const [registrationsAllowed, setRegistrationsAllowed] = useState(true);
    const [configLoading, setConfigLoading] = useState(true);

    // Form State
    const [email, setEmail] = useState('');
    const [confirmEmail, setConfirmEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const [agreed, setAgreed] = useState(false);
    const [isSuccess, setIsSuccess] = useState(false);

    // Load Configuration
    useEffect(() => {
        const checkSettings = async () => {
            try {
                const { data, error } = await supabase
                    .from('app_settings')
                    .select('value')
                    .eq('key', 'registrations_open')
                    .single();

                if (data) {
                    setRegistrationsAllowed(data.value);
                }
            } catch (e) {
                console.error("Config check failed", e);
            } finally {
                setConfigLoading(false);
            }
        };
        checkSettings();
    }, []);

    const handleRegister = async (e: React.FormEvent) => {
        e.preventDefault();

        if (email !== confirmEmail) {
            toast("Los correos electrónicos no coinciden", "error");
            return;
        }

        if (password !== confirmPassword) {
            toast("Las contraseñas no coinciden", "error");
            return;
        }

        if (!agreed) {
            toast("Debes aceptar los términos y condiciones", "warning");
            return;
        }

        setLoading(true);

        try {
            const { data, error } = await supabase.auth.signUp({
                email,
                password,
                options: {
                    emailRedirectTo: `${window.location.origin}/login`,
                    data: {
                        full_name: email.split('@')[0]
                    }
                }
            });

            if (error) {
                toast(error.message, "error");
            } else {
                setIsSuccess(true);
            }
        } catch (error) {
            toast("Error inesperado", "error");
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    if (configLoading) {
        return <div className="min-h-screen bg-slate-50 flex items-center justify-center text-slate-400">Cargando...</div>;
    }

    if (isSuccess) {
        return (
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="fixed inset-0 z-50 bg-[#13ec80] flex flex-col items-center justify-center text-[#0d1b14] p-8 text-center overflow-hidden"
            >
                {/* Background Animated Elements */}
                {[...Array(6)].map((_, i) => (
                    <motion.div
                        key={i}
                        className="absolute text-white/10 pointer-events-none"
                        initial={{
                            x: Math.random() * (typeof window !== 'undefined' ? window.innerWidth : 1000),
                            y: Math.random() * (typeof window !== 'undefined' ? window.innerHeight : 800),
                            scale: 0.5,
                            rotate: 0
                        }}
                        animate={{
                            y: [null, Math.random() * -100],
                            rotate: 360,
                        }}
                        transition={{
                            duration: 10 + Math.random() * 10,
                            repeat: Infinity,
                            ease: "linear"
                        }}
                    >
                        {i % 3 === 0 ? <Store size={60 + Math.random() * 40} /> :
                            i % 3 === 1 ? <Mail size={40 + Math.random() * 40} /> :
                                <span className="material-symbols-outlined text-[60px]">check_circle</span>}
                    </motion.div>
                ))}

                <motion.div
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ type: "spring", bounce: 0.5 }}
                    className="relative z-10"
                >
                    <div className="mb-8 flex justify-center">
                        <motion.div
                            animate={{ y: [0, -10, 0] }}
                            transition={{ repeat: Infinity, duration: 2, ease: "easeInOut" }}
                            className="bg-white p-8 rounded-full shadow-2xl relative"
                        >
                            <motion.div
                                initial={{ scale: 0 }}
                                animate={{ scale: 1 }}
                                transition={{ delay: 0.2, type: "spring" }}
                            >
                                <span className="material-symbols-outlined text-7xl text-[#13ec80]">mark_email_unread</span>
                            </motion.div>

                            {/* Mini confetti particles decoration */}
                            <motion.div
                                className="absolute -top-2 -right-2 bg-yellow-400 w-6 h-6 rounded-full"
                                animate={{ scale: [1, 1.2, 1], rotate: [0, 90, 0] }}
                                transition={{ repeat: Infinity, duration: 1.5 }}
                            />
                            <motion.div
                                className="absolute -bottom-1 -left-2 bg-blue-500 w-4 h-4 rounded-full"
                                animate={{ scale: [1, 1.3, 1] }}
                                transition={{ repeat: Infinity, duration: 2 }}
                            />
                        </motion.div>
                    </div>

                    <motion.h1
                        initial={{ y: 20, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        transition={{ delay: 0.3 }}
                        className="text-4xl md:text-6xl font-black mb-6 tracking-tight drop-shadow-sm"
                    >
                        ¡Ya casi estamos listos!
                    </motion.h1>

                    <motion.p
                        initial={{ y: 20, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        transition={{ delay: 0.4 }}
                        className="text-xl md:text-2xl font-medium mb-12 max-w-2xl mx-auto opacity-90"
                    >
                        Enviamos un enlace a tu correo. <br />
                        <span className="font-bold underline decoration-2 underline-offset-4">Ábrelo para activar tu cuenta</span> y empezar a crecer.
                    </motion.p>

                    <Link href="/login">
                        <motion.button
                            initial={{ y: 20, opacity: 0 }}
                            animate={{ y: 0, opacity: 1 }}
                            transition={{ delay: 0.5 }}
                            whileHover={{ scale: 1.05, boxShadow: "0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)" }}
                            whileTap={{ scale: 0.95 }}
                            className="bg-white text-[#0d1b14] px-10 py-4 rounded-xl font-bold text-xl shadow-xl transition-all flex items-center gap-3 mx-auto"
                        >
                            <span>Ir a Iniciar Sesión</span>
                            <ArrowRight className="w-6 h-6" />
                        </motion.button>
                    </Link>
                </motion.div>
            </motion.div>
        );
    }

    // BLOCKED SCREEN (Exact Design)
    if (!registrationsAllowed) {
        return (
            <div className="bg-white transition-colors duration-300 font-sans">
                <div className="flex flex-col lg:flex-row min-h-screen w-full">
                    {/* Left Section: Hero Image */}
                    <section className="relative lg:w-1/2 w-full min-h-[50vh] lg:min-h-screen overflow-hidden">
                        <Image
                            alt="Tienda de barrio colombiana colorida y tradicional"
                            className="object-cover opacity-80"
                            src="/register-hero.png" // Ensured path
                            fill
                            priority
                            sizes="(max-width: 1024px) 100vw, 50vw"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-slate-900/85 to-slate-900/30 flex flex-col justify-end p-8 lg:p-16">
                            <div className="max-w-xl">
                                <h1 className="text-4xl lg:text-6xl font-extrabold text-white leading-tight mb-6 font-display">
                                    Impulsando el corazón de nuestros barrios.
                                </h1>
                                <div className="inline-block bg-[#22C55E] px-5 py-3 rounded-lg shadow-lg">
                                    <p className="text-white text-lg lg:text-xl font-semibold">
                                        Estamos poniendo la casa en orden para que tu negocio crezca como nunca.
                                    </p>
                                </div>
                            </div>
                        </div>
                    </section>

                    {/* Right Section: Content */}
                    <section className="lg:w-1/2 w-full flex flex-col items-center justify-center p-6 lg:p-20 bg-white">
                        <div className="w-full max-w-md text-center space-y-8">

                            {/* Icon */}
                            <div className="flex justify-center">
                                <div className="w-24 h-24 bg-[#F0FDF4] rounded-3xl flex items-center justify-center shadow-sm border border-[#22C55E]/10">
                                    <span className="material-symbols-outlined text-[#22C55E] text-6xl">storefront</span>
                                </div>
                            </div>

                            <div className="space-y-3">
                                <h2 className="text-3xl lg:text-4xl font-extrabold text-slate-900 font-display">
                                    ¡Qué bueno tenerte por acá!
                                </h2>
                                <p className="text-slate-600 text-lg">
                                    Gracias por confiar en DonTendero.
                                </p>
                            </div>

                            {/* Info Box */}
                            <div className="bg-slate-50 border border-slate-100 rounded-2xl p-6 text-left shadow-sm">
                                <div className="flex items-center gap-3 mb-3">
                                    <span className="material-symbols-outlined text-[#22C55E] text-2xl">info</span>
                                    <h3 className="font-bold text-slate-800 text-lg">
                                        Registros Pausados por el Momento
                                    </h3>
                                </div>
                                <p className="text-slate-600 leading-relaxed text-sm lg:text-base">
                                    ¡Oiga, socio! Le cuento que estamos haciendo unas mejoras importantes en nuestra plataforma para que sea mucho más fácil manejar su negocio. Por ahora, no estamos recibiendo nuevos registros, pero no se preocupe, que pronto abriremos de nuevo.
                                </p>
                            </div>

                            {/* Buttons */}
                            <div className="space-y-6">
                                <p className="text-slate-500 font-medium">
                                    Estamos "echando para adelante" con tecnología para los tenderos de Colombia.
                                </p>
                                <div className="flex flex-col gap-4">
                                    <Link
                                        href="/login"
                                        className="w-full flex justify-center items-center py-4 px-6 bg-[#22C55E] hover:bg-[#166534] text-white rounded-xl font-bold text-lg transition-all shadow-md active:scale-[0.98]"
                                    >
                                        Ya tengo cuenta, iniciar sesión
                                    </Link>
                                    <Link
                                        href="/"
                                        className="text-slate-500 hover:text-[#22C55E] transition-colors text-sm font-semibold flex items-center justify-center gap-2"
                                    >
                                        <span className="material-symbols-outlined text-sm">arrow_back</span>
                                        Volver al inicio
                                    </Link>
                                </div>
                            </div>
                        </div>
                    </section>
                </div>
            </div>
        );
    }

    // ORIGINAL FORM (When Allowed)
    return (
        <div className="bg-background-light font-sans text-text-main antialiased transition-colors duration-200">
            <div className="flex min-h-screen flex-row">
                {/* Left Side: Visual / Hero */}
                <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden bg-slate-900">
                    <div className="absolute inset-0 h-full w-full">
                        <Image
                            alt="Tienda de barrio"
                            className="object-cover opacity-80"
                            src="/register-hero.png"
                            fill
                            priority
                            sizes="50vw"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-slate-900/90 via-slate-900/40 to-transparent"></div>
                    </div>

                    <div className="relative z-10 flex flex-col justify-end p-16 h-full">
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.3, duration: 0.6 }}
                        >
                            <div className="mb-6 h-12 w-12 rounded-lg bg-[#13ec80] flex items-center justify-center text-slate-950">
                                <Store className="w-8 h-8" />
                            </div>
                            <blockquote className="text-white">
                                <p className="text-3xl font-bold leading-tight mb-4">"Desde que uso DonTendero, el inventario de mi miscelánea está siempre al día y mis clientes están más felices."</p>
                                <footer className="text-[#13ec80] font-medium text-lg">Carlos Rodríguez, Tendero en Bogotá</footer>
                            </blockquote>
                        </motion.div>
                    </div>
                </div>

                {/* Right Side: Form */}
                <div className="flex flex-1 flex-col justify-center px-4 py-12 sm:px-6 lg:flex-none lg:px-20 xl:px-24 w-full lg:w-1/2 bg-white">
                    <motion.div
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.6, ease: "easeOut" }}
                        className="mx-auto w-full max-w-sm lg:w-96"
                    >
                        {/* Logo & Header */}
                        <div className="flex flex-col gap-2 mb-8">
                            <motion.div
                                initial={{ opacity: 0, scale: 0.9 }}
                                animate={{ opacity: 1, scale: 1 }}
                                transition={{ delay: 0.2, duration: 0.5 }}
                                className="flex items-center gap-3 text-slate-900 mb-2"
                            >
                                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[#13ec80] text-slate-950">
                                    <Store className="w-6 h-6" />
                                </div>
                                <span className="text-xl font-bold tracking-tight">DonTendero</span>
                            </motion.div>
                            <h2 className="text-3xl font-black leading-tight tracking-tight text-slate-900">Crear tu cuenta</h2>
                            <p className="text-slate-500 text-sm">
                                Empieza a gestionar tu negocio de manera fácil y rápida.
                            </p>
                        </div>

                        {/* Form */}
                        <form onSubmit={handleRegister} className="space-y-4">
                            {/* Email Field */}
                            <div>
                                <label className="block text-sm font-medium leading-6 text-slate-700 mb-1.5" htmlFor="email">
                                    Correo electrónico
                                </label>
                                <div className="relative rounded-lg shadow-sm">
                                    <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                                        <Mail className="w-5 h-5 text-slate-400" />
                                    </div>
                                    <input
                                        className="block w-full rounded-lg border-0 py-3 pl-10 ring-1 ring-inset ring-slate-200 placeholder:text-slate-300 focus:ring-2 focus:ring-inset focus:ring-[#13ec80] sm:text-sm sm:leading-6 bg-slate-50 text-slate-900 outline-none transition-all"
                                        id="email"
                                        name="email"
                                        placeholder="tucorreo@ejemplo.com"
                                        type="email"
                                        required
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                    />
                                </div>
                            </div>

                            {/* Confirm Email Field */}
                            <div>
                                <label className="block text-sm font-medium leading-6 text-slate-700 mb-1.5" htmlFor="confirm-email">
                                    Confirmar correo electrónico
                                </label>
                                <div className="relative rounded-lg shadow-sm">
                                    <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                                        <Mail className="w-5 h-5 text-slate-400" />
                                    </div>
                                    <input
                                        className="block w-full rounded-lg border-0 py-3 pl-10 ring-1 ring-inset ring-slate-200 placeholder:text-slate-300 focus:ring-2 focus:ring-inset focus:ring-[#13ec80] sm:text-sm sm:leading-6 bg-slate-50 text-slate-900 outline-none transition-all"
                                        id="confirm-email"
                                        name="confirm-email"
                                        placeholder="Repite tu correo"
                                        type="email"
                                        required
                                        value={confirmEmail}
                                        onChange={(e) => setConfirmEmail(e.target.value)}
                                    />
                                </div>
                            </div>

                            {/* Password Field */}
                            <div>
                                <label className="block text-sm font-medium leading-6 text-slate-700 mb-1.5" htmlFor="password">
                                    Contraseña
                                </label>
                                <div className="relative rounded-lg shadow-sm">
                                    <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                                        <Lock className="w-5 h-5 text-slate-400" />
                                    </div>
                                    <input
                                        className="block w-full rounded-lg border-0 py-3 pl-10 ring-1 ring-inset ring-slate-200 placeholder:text-slate-300 focus:ring-2 focus:ring-inset focus:ring-[#13ec80] sm:text-sm sm:leading-6 bg-slate-50 text-slate-900 outline-none transition-all"
                                        id="password"
                                        name="password"
                                        placeholder="Mínimo 8 caracteres"
                                        type={showPassword ? "text" : "password"}
                                        required
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowPassword(!showPassword)}
                                        className="absolute inset-y-0 right-0 flex items-center pr-3 cursor-pointer text-slate-400 hover:text-[#13ec80] transition-colors outline-none"
                                    >
                                        {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                                    </button>
                                </div>
                            </div>

                            {/* Confirm Password Field */}
                            <div>
                                <label className="block text-sm font-medium leading-6 text-slate-700 mb-1.5" htmlFor="confirm-password">
                                    Confirmar contraseña
                                </label>
                                <div className="relative rounded-lg shadow-sm">
                                    <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                                        <Lock className="w-5 h-5 text-slate-400" />
                                    </div>
                                    <input
                                        className="block w-full rounded-lg border-0 py-3 pl-10 ring-1 ring-inset ring-slate-200 placeholder:text-slate-300 focus:ring-2 focus:ring-inset focus:ring-[#13ec80] sm:text-sm sm:leading-6 bg-slate-50 text-slate-900 outline-none transition-all"
                                        id="confirm-password"
                                        name="confirm-password"
                                        placeholder="Repite tu contraseña"
                                        type={showPassword ? "text" : "password"}
                                        required
                                        value={confirmPassword}
                                        onChange={(e) => setConfirmPassword(e.target.value)}
                                    />
                                </div>
                            </div>

                            {/* Terms Checkbox */}
                            <div className="flex items-start">
                                <div className="flex h-6 items-center">
                                    <input
                                        className="h-4 w-4 rounded border-input-border text-primary focus:ring-primary cursor-pointer"
                                        id="terms"
                                        name="terms"
                                        type="checkbox"
                                        checked={agreed}
                                        onChange={(e) => setAgreed(e.target.checked)}
                                    />
                                </div>
                                <div className="ml-3 text-sm leading-6">
                                    <label className="font-normal text-text-main cursor-pointer" htmlFor="terms">
                                        He leído y acepto los <a className="font-semibold text-primary hover:text-primary-hover" href="/legal/terminos" target="_blank">Términos y Condiciones</a> y la <a className="font-semibold text-primary hover:text-primary-hover" href="/legal/privacidad" target="_blank">Política de Privacidad</a>.
                                    </label>
                                </div>
                            </div>

                            {/* Submit Button */}
                            <div>
                                <motion.button
                                    whileHover={{ scale: 1.02 }}
                                    whileTap={{ scale: 0.98 }}
                                    className="flex w-full justify-center items-center gap-2 rounded-lg bg-[#13ec80] px-3 py-3.5 text-sm font-bold leading-6 text-[#0d1b14] shadow-sm hover:bg-[#0fd673] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#13ec80] transition-all duration-200 disabled:opacity-70 disabled:cursor-not-allowed"
                                    type="submit"
                                    disabled={loading}
                                >
                                    {loading ? 'Creando...' : 'Crear Cuenta'}
                                    {!loading && <ArrowRight className="w-5 h-5" />}
                                </motion.button>
                            </div>
                        </form>

                        {/* Footer / Login Link */}
                        <p className="mt-8 text-center text-sm text-text-secondary">
                            ¿Ya tienes cuenta?
                            <Link href="/login" className="font-bold text-primary hover:text-primary-hover ml-1">
                                Inicia sesión aquí
                            </Link>
                        </p>
                    </motion.div>
                </div>
            </div>
        </div>
    );
}
