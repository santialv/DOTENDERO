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
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const [agreed, setAgreed] = useState(false);

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
                // Default to true if check fails, or false for security? 
                // Let's stick to true (allow) unless explicitly closed to avoid blocking users on error.
            } finally {
                setConfigLoading(false);
            }
        };
        checkSettings();
    }, []);

    const handleRegister = async (e: React.FormEvent) => {
        e.preventDefault();

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
                    emailRedirectTo: 'https://www.dontendero.com/login',
                    data: {
                        full_name: name
                    }
                }
            });

            if (error) {
                toast(error.message, "error");
            } else {
                toast("Cuenta creada con éxito. Revisa tu correo.", "success");
                router.push('/login');
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

    // BLOCKED SCREEN (Exact Design)
    if (!registrationsAllowed) {
        return (
            <div className="bg-white transition-colors duration-300 font-sans">
                <div className="flex flex-col lg:flex-row min-h-screen w-full">
                    {/* Left Section: Hero Image */}
                    <section className="relative lg:w-1/2 w-full min-h-[50vh] lg:min-h-screen overflow-hidden">
                        <Image
                            alt="Tienda de barrio colombiana colorida y tradicional"
                            className="object-cover"
                            src="https://lh3.googleusercontent.com/aida-public/AB6AXuBSbBngjIIPk_mihUUaZBCWi8SY7QdO3mZM-SSzVSsAZSPD0A3kMVwgCEZXhXYVIUoBbDi4svyF-CyxzMx3cmIGWMc-XkifH3xZUhoCduT4gqllB5_eES-glo3G7mAK5A0tZb0vVRrKm4WOC95a0YH2JR_R_-b_-i9O43nO-BSfiUz0WliHAy7ETDWPYBYi6AQCVcNKbPnSFs8czSbMD05os-JTXLHkBacHmJlccw6oDUPWbeJV5f6fhZgw92pDXEsQWhuiJ6FVEy4"
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
                                    ¡Oiga, vecino! Le cuento que estamos haciendo unas mejoras importantes en nuestra plataforma para que sea mucho más fácil manejar su tienda. Por ahora, no estamos recibiendo nuevos registros, pero no se preocupe, que pronto abriremos de nuevo.
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
                <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden bg-background-dark">
                    <div className="absolute inset-0 h-full w-full">
                        <Image
                            alt="Tienda de barrio"
                            className="object-cover opacity-60 mix-blend-overlay"
                            src="https://lh3.googleusercontent.com/aida-public/AB6AXuBEOdEkdUjBG-tgn0hpYWw7k7t01mA6H2fn09LYT9ntJLCXJTNxQSPmZxm91x04cbnaAn0E16aIhBLQlM-h_3A838kcizKPdvbmXpFRZLR9RLl5fAoMJUOYemzh4aSn4_ZdTK1m2shjn8Wseh5w0NNzxIq9YT5eWpO9tG6sXbXDXxqJ9OAAfXg9YTHs-KrJwJyk4B_rSpe1w3iGF4DoMG_nHHMIPB5skRSCDkNANz6C4QOw-wETm2qcGzELGGc5BamfEb5s2ASsAh8"
                            fill
                            priority
                            sizes="50vw"
                            placeholder="blur"
                            blurDataURL="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mN8/+F9PQAI8wNPvd7POQAAAABJRU5ErkJggg=="
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-background-dark/90 via-background-dark/40 to-transparent"></div>
                    </div>

                    <div className="relative z-10 flex flex-col justify-end p-16 h-full">
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.3, duration: 0.6 }}
                        >
                            <div className="mb-6 h-12 w-12 rounded-lg bg-primary flex items-center justify-center text-background-dark">
                                <Store className="w-8 h-8" />
                            </div>
                            <blockquote className="text-white">
                                <p className="text-3xl font-bold leading-tight mb-4">"Desde que uso DonTendero, el inventario de mi miscelánea está siempre al día y mis clientes están más felices."</p>
                                <footer className="text-primary font-medium text-lg">Carlos Rodríguez, Tendero en Bogotá</footer>
                            </blockquote>
                        </motion.div>
                    </div>
                </div>

                {/* Right Side: Form */}
                <div className="flex flex-1 flex-col justify-center px-4 py-12 sm:px-6 lg:flex-none lg:px-20 xl:px-24 w-full lg:w-1/2 bg-background-light">
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
                                className="flex items-center gap-3 text-text-main mb-2"
                            >
                                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary text-background-dark">
                                    <Store className="w-6 h-6" />
                                </div>
                                <span className="text-xl font-bold tracking-tight">DonTendero</span>
                            </motion.div>
                            <h2 className="text-3xl font-black leading-tight tracking-tight text-text-main">Crear tu cuenta</h2>
                            <p className="text-text-secondary text-sm">
                                Empieza a gestionar tu tienda de manera fácil y rápida.
                            </p>
                        </div>

                        {/* Form */}
                        <form onSubmit={handleRegister} className="space-y-5">
                            {/* Name Field */}
                            <div>
                                <label className="block text-sm font-medium leading-6 text-text-main mb-1.5" htmlFor="name">
                                    Nombre completo o de la tienda
                                </label>
                                <div className="relative rounded-lg shadow-sm">
                                    <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                                        <User className="w-5 h-5 text-text-secondary" />
                                    </div>
                                    <input
                                        className="block w-full rounded-lg border-0 py-3 pl-10 ring-1 ring-inset ring-input-border placeholder:text-text-secondary/70 focus:ring-2 focus:ring-inset focus:ring-primary sm:text-sm sm:leading-6 bg-white text-text-main outline-none transition-shadow"
                                        id="name"
                                        name="name"
                                        placeholder="Ej. Tienda La Esperanza o Juan Pérez"
                                        type="text"
                                        required
                                        value={name}
                                        onChange={(e) => setName(e.target.value)}
                                    />
                                </div>
                            </div>

                            {/* Email Field */}
                            <div>
                                <label className="block text-sm font-medium leading-6 text-text-main mb-1.5" htmlFor="email">
                                    Correo electrónico
                                </label>
                                <div className="relative rounded-lg shadow-sm">
                                    <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                                        <Mail className="w-5 h-5 text-text-secondary" />
                                    </div>
                                    <input
                                        className="block w-full rounded-lg border-0 py-3 pl-10 ring-1 ring-inset ring-input-border placeholder:text-text-secondary/70 focus:ring-2 focus:ring-inset focus:ring-primary sm:text-sm sm:leading-6 bg-white text-text-main outline-none transition-shadow"
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

                            {/* Password Fields Group */}
                            <div className="grid grid-cols-1 gap-5">
                                {/* Password */}
                                <div>
                                    <label className="block text-sm font-medium leading-6 text-text-main mb-1.5" htmlFor="password">
                                        Contraseña
                                    </label>
                                    <div className="relative rounded-lg shadow-sm">
                                        <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                                            <Lock className="w-5 h-5 text-text-secondary" />
                                        </div>
                                        <input
                                            className="block w-full rounded-lg border-0 py-3 pl-10 pr-10 ring-1 ring-inset ring-input-border placeholder:text-text-secondary/70 focus:ring-2 focus:ring-inset focus:ring-primary sm:text-sm sm:leading-6 bg-white text-text-main outline-none transition-shadow"
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
                                            className="absolute inset-y-0 right-0 flex items-center pr-3 cursor-pointer text-text-secondary hover:text-primary transition-colors outline-none"
                                        >
                                            {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                                        </button>
                                    </div>
                                </div>
                                {/* Confirm Password */}
                                <div>
                                    <label className="block text-sm font-medium leading-6 text-text-main mb-1.5" htmlFor="confirm-password">
                                        Confirmar contraseña
                                    </label>
                                    <div className="relative rounded-lg shadow-sm">
                                        <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                                            <Lock className="w-5 h-5 text-text-secondary" />
                                        </div>
                                        <input
                                            className="block w-full rounded-lg border-0 py-3 pl-10 ring-1 ring-inset ring-input-border placeholder:text-text-secondary/70 focus:ring-2 focus:ring-inset focus:ring-primary sm:text-sm sm:leading-6 bg-white text-text-main outline-none transition-shadow"
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
                                    className="flex w-full justify-center items-center gap-2 rounded-lg bg-primary px-3 py-3.5 text-sm font-bold leading-6 text-text-main shadow-sm hover:bg-primary-hover focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary transition-all duration-200 disabled:opacity-70 disabled:cursor-not-allowed"
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
