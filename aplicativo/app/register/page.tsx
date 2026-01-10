"use client";

import { useState } from 'react';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useToast } from "@/components/ui/toast";

export default function RegisterPage() {
    const router = useRouter();
    const { toast } = useToast();

    // Form State
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [loading, setLoading] = useState(false);

    const handleRegister = async (e: React.FormEvent) => {
        e.preventDefault();

        if (password !== confirmPassword) {
            toast("Las contraseñas no coinciden", "destructive");
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
                toast(error.message, "destructive");
            } else {
                alert(`¡Cuenta creada con éxito!\n\nHemos enviado un enlace de confirmación a ${email}.`);
                router.push('/login');
            }
        } catch (error) {
            toast("Error inesperado", "destructive");
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="bg-[#f6f8f7] font-sans text-[#0d1b14] antialiased transition-colors duration-200">
            <div className="flex min-h-screen flex-row">
                {/* Left Side: Visual / Hero */}
                <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden bg-[#102219]">
                    <img
                        alt="Tienda de barrio"
                        className="absolute inset-0 h-full w-full object-cover opacity-60 mix-blend-overlay"
                        src="https://lh3.googleusercontent.com/aida-public/AB6AXuBEOdEkdUjBG-tgn0hpYWw7k7t01mA6H2fn09LYT9ntJLCXJTNxQSPmZxm91x04cbnaAn0E16aIhBLQlM-h_3A838kcizKPdvbmXpFRZLR9RLl5fAoMJUOYemzh4aSn4_ZdTK1m2shjn8Wseh5w0NNzxIq9YT5eWpO9tG6sXbXDXxqJ9OAAfXg9YTHs-KrJwJyk4B_rSpe1w3iGF4DoMG_nHHMIPB5skRSCDkNANz6C4QOw-wETm2qcGzELGGc5BamfEb5s2ASsAh8"
                    />
                    <div className="relative z-10 flex flex-col justify-end p-16">
                        <div className="mb-6 h-12 w-12 rounded-lg bg-[#13ec80] flex items-center justify-center text-[#102219]">
                            <span className="material-symbols-outlined" style={{ fontSize: '32px' }}>storefront</span>
                        </div>
                        <blockquote className="text-white">
                            <p className="text-3xl font-bold leading-tight mb-4">"Desde que uso DonTendero, el inventario de mi miscelánea está siempre al día y mis clientes están más felices."</p>
                            <footer className="text-[#13ec80] font-medium text-lg">Carlos Rodríguez, Tendero en Bogotá</footer>
                        </blockquote>
                    </div>
                </div>

                {/* Right Side: Form */}
                <div className="flex flex-1 flex-col justify-center px-4 py-12 sm:px-6 lg:flex-none lg:px-20 xl:px-24 w-full lg:w-1/2 bg-[#f6f8f7]">
                    <div className="mx-auto w-full max-w-sm lg:w-96">
                        {/* Logo & Header */}
                        <div className="flex flex-col gap-2 mb-8">
                            <div className="flex items-center gap-3 text-[#0d1b14] mb-2">
                                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[#13ec80] text-[#102219]">
                                    <svg className="h-6 w-6" fill="none" viewBox="0 0 48 48" xmlns="http://www.w3.org/2000/svg">
                                        <g clipPath="url(#clip0_6_330)">
                                            <path clipRule="evenodd" d="M24 0.757355L47.2426 24L24 47.2426L0.757355 24L24 0.757355ZM21 35.7574V12.2426L9.24264 24L21 35.7574Z" fill="currentColor" fillRule="evenodd"></path>
                                        </g>
                                        <defs>
                                            <clipPath id="clip0_6_330"><rect fill="white" height="48" width="48"></rect></clipPath>
                                        </defs>
                                    </svg>
                                </div>
                                <span className="text-xl font-bold tracking-tight">DonTendero</span>
                            </div>
                            <h2 className="text-3xl font-black leading-tight tracking-tight text-[#0d1b14]">Crear tu cuenta</h2>
                            <p className="text-[#4c9a73] text-sm">
                                Empieza a gestionar tu tienda de manera fácil y rápida.
                            </p>
                        </div>

                        {/* Form */}
                        <form onSubmit={handleRegister} className="space-y-5">
                            {/* Name Field */}
                            <div>
                                <label className="block text-sm font-medium leading-6 text-[#0d1b14] mb-1.5" htmlFor="name">
                                    Nombre completo o de la tienda
                                </label>
                                <div className="relative rounded-lg shadow-sm">
                                    <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                                        <span className="material-symbols-outlined text-[#4c9a73]">person</span>
                                    </div>
                                    <input
                                        className="block w-full rounded-lg border-0 py-3 pl-10 ring-1 ring-inset ring-[#cfe7db] placeholder:text-[#4c9a73] focus:ring-2 focus:ring-inset focus:ring-[#13ec80] sm:text-sm sm:leading-6 bg-[#ffffff] text-[#0d1b14] outline-none"
                                        id="name"
                                        name="name"
                                        placeholder="Ej. Tienda La Esperanza o Juan Pérez"
                                        type="text"
                                        value={name}
                                        onChange={(e) => setName(e.target.value)}
                                    />
                                </div>
                            </div>

                            {/* Email Field */}
                            <div>
                                <label className="block text-sm font-medium leading-6 text-[#0d1b14] mb-1.5" htmlFor="email">
                                    Correo electrónico
                                </label>
                                <div className="relative rounded-lg shadow-sm">
                                    <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                                        <span className="material-symbols-outlined text-[#4c9a73]">mail</span>
                                    </div>
                                    <input
                                        className="block w-full rounded-lg border-0 py-3 pl-10 ring-1 ring-inset ring-[#cfe7db] placeholder:text-[#4c9a73] focus:ring-2 focus:ring-inset focus:ring-[#13ec80] sm:text-sm sm:leading-6 bg-[#ffffff] text-[#0d1b14] outline-none"
                                        id="email"
                                        name="email"
                                        placeholder="tucorreo@ejemplo.com"
                                        type="email"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                    />
                                </div>
                            </div>

                            {/* Password Fields Group */}
                            <div className="grid grid-cols-1 gap-5">
                                {/* Password */}
                                <div>
                                    <label className="block text-sm font-medium leading-6 text-[#0d1b14] mb-1.5" htmlFor="password">
                                        Contraseña
                                    </label>
                                    <div className="relative rounded-lg shadow-sm">
                                        <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                                            <span className="material-symbols-outlined text-[#4c9a73]">lock</span>
                                        </div>
                                        <input
                                            className="block w-full rounded-lg border-0 py-3 pl-10 pr-10 ring-1 ring-inset ring-[#cfe7db] placeholder:text-[#4c9a73] focus:ring-2 focus:ring-inset focus:ring-[#13ec80] sm:text-sm sm:leading-6 bg-[#ffffff] text-[#0d1b14] outline-none"
                                            id="password"
                                            name="password"
                                            placeholder="Mínimo 8 caracteres"
                                            type="password"
                                            value={password}
                                            onChange={(e) => setPassword(e.target.value)}
                                        />
                                        <div className="absolute inset-y-0 right-0 flex items-center pr-3 cursor-pointer group">
                                            <span className="material-symbols-outlined text-[#4c9a73] hover:text-[#0d1b14] transition-colors">visibility</span>
                                        </div>
                                    </div>
                                </div>
                                {/* Confirm Password */}
                                <div>
                                    <label className="block text-sm font-medium leading-6 text-[#0d1b14] mb-1.5" htmlFor="confirm-password">
                                        Confirmar contraseña
                                    </label>
                                    <div className="relative rounded-lg shadow-sm">
                                        <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                                            <span className="material-symbols-outlined text-[#4c9a73]">lock_reset</span>
                                        </div>
                                        <input
                                            className="block w-full rounded-lg border-0 py-3 pl-10 ring-1 ring-inset ring-[#cfe7db] placeholder:text-[#4c9a73] focus:ring-2 focus:ring-inset focus:ring-[#13ec80] sm:text-sm sm:leading-6 bg-[#ffffff] text-[#0d1b14] outline-none"
                                            id="confirm-password"
                                            name="confirm-password"
                                            placeholder="Repite tu contraseña"
                                            type="password"
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
                                        className="h-4 w-4 rounded border-[#cfe7db] text-[#13ec80] focus:ring-[#13ec80]"
                                        id="terms"
                                        name="terms"
                                        type="checkbox"
                                    />
                                </div>
                                <div className="ml-3 text-sm leading-6">
                                    <label className="font-normal text-[#0d1b14]" htmlFor="terms">
                                        He leído y acepto los <a className="font-semibold text-[#13ec80] hover:text-[#0fb863]" href="/legal/terminos" target="_blank">Términos y Condiciones</a> y la <a className="font-semibold text-[#13ec80] hover:text-[#0fb863]" href="/legal/privacidad" target="_blank">Política de Privacidad</a>.
                                    </label>
                                </div>
                            </div>

                            {/* Submit Button */}
                            <div>
                                <button
                                    className="flex w-full justify-center items-center gap-2 rounded-lg bg-[#13ec80] px-3 py-3.5 text-sm font-bold leading-6 text-[#102219] shadow-sm hover:bg-[#0fb863] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#13ec80] transition-colors"
                                    type="submit"
                                    disabled={loading}
                                >
                                    {loading ? 'Creando...' : 'Crear Cuenta'}
                                    {!loading && <span className="material-symbols-outlined text-lg">arrow_forward</span>}
                                </button>
                            </div>
                        </form>

                        {/* Footer / Login Link */}
                        <p className="mt-8 text-center text-sm text-[#4c9a73]">
                            ¿Ya tienes cuenta?
                            <a href="/login" className="font-bold text-[#13ec80] hover:text-[#0fb863] ml-1">
                                Inicia sesión aquí
                            </a>
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}
