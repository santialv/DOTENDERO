"use client";

import { useState } from 'react';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useToast } from "@/components/ui/toast";
import { motion } from 'framer-motion';
import { Store, User, Mail, Lock, Eye, EyeOff, ArrowRight, Check } from 'lucide-react';

export default function RegisterPage() {
    const router = useRouter();
    const { toast } = useToast();

    // Form State
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const [agreed, setAgreed] = useState(false);

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

    return (
        <div className="bg-background-light font-sans text-text-main antialiased transition-colors duration-200">
            <div className="flex min-h-screen flex-row">
                {/* Left Side: Visual / Hero */}
                <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden bg-background-dark">
                    <motion.div
                        initial={{ opacity: 0, scale: 1.05 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 0.8, ease: "easeOut" }}
                        className="absolute inset-0 h-full w-full"
                    >
                        <img
                            alt="Tienda de barrio"
                            className="absolute inset-0 h-full w-full object-cover opacity-60 mix-blend-overlay"
                            src="https://lh3.googleusercontent.com/aida-public/AB6AXuBEOdEkdUjBG-tgn0hpYWw7k7t01mA6H2fn09LYT9ntJLCXJTNxQSPmZxm91x04cbnaAn0E16aIhBLQlM-h_3A838kcizKPdvbmXpFRZLR9RLl5fAoMJUOYemzh4aSn4_ZdTK1m2shjn8Wseh5w0NNzxIq9YT5eWpO9tG6sXbXDXxqJ9OAAfXg9YTHs-KrJwJyk4B_rSpe1w3iGF4DoMG_nHHMIPB5skRSCDkNANz6C4QOw-wETm2qcGzELGGc5BamfEb5s2ASsAh8"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-background-dark/90 via-background-dark/40 to-transparent"></div>
                    </motion.div>

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
