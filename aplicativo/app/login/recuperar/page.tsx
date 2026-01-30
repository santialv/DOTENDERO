"use client";

import { useState } from 'react';
import { supabase } from '@/lib/supabase';
import Link from 'next/link';
import { useToast } from "@/components/ui/toast";

export default function ForgotPasswordPage() {
    const { toast } = useToast();
    const [email, setEmail] = useState('');
    const [loading, setLoading] = useState(false);
    const [sent, setSent] = useState(false);

    const handleReset = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            const { error } = await supabase.auth.resetPasswordForEmail(email, {
                redirectTo: `${window.location.origin}/login/restablecer`,
            });

            if (error) {
                toast(error.message || "Error al enviar correo", "error");
            } else {
                setSent(true);
                toast("Correo enviado. Revisa tu bandeja de entrada.", "success");
            }
        } catch (error) {
            toast("Ocurrió un error inesperado", "error");
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    if (sent) {
        return (
            <div className="flex min-h-screen flex-col justify-center items-center py-12 px-4 sm:px-6 lg:px-8 bg-slate-50 font-display">
                <div className="w-full max-w-md space-y-8 bg-white p-10 rounded-3xl shadow-xl text-center">
                    <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto text-green-600">
                        <span className="material-symbols-outlined text-3xl">mark_email_read</span>
                    </div>
                    <h2 className="text-3xl font-black text-slate-900">¡Correo Enviado!</h2>
                    <p className="text-slate-500">
                        Hemos enviado un enlace de recuperación a <span className="font-bold text-slate-800">{email}</span>.
                        <br />
                        Revisa tu bandeja de entrada (y spam).
                    </p>
                    <Link href="/login" className="block w-full text-center text-primary font-bold hover:underline mt-8">
                        Volver al inicio de sesión
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <div className="flex min-h-screen flex-col justify-center py-12 px-4 sm:px-6 lg:px-8 bg-slate-50 font-display">
            <div className="sm:mx-auto sm:w-full sm:max-w-md">
                <div className="flex justify-center mb-6">
                    <span className="material-symbols-outlined text-5xl text-primary">storefront</span>
                </div>
                <h2 className="text-center text-3xl font-black tracking-tight text-slate-900">
                    Recuperar Contraseña
                </h2>
                <p className="mt-2 text-center text-sm text-slate-600">
                    Ingresa tu correo y te enviaremos las instrucciones.
                </p>
            </div>

            <div className="mt-10 sm:mx-auto sm:w-full sm:max-w-[480px]">
                <div className="bg-white px-6 py-12 shadow-xl sm:rounded-3xl sm:px-12 border border-slate-100">
                    <form className="space-y-6" onSubmit={handleReset}>
                        <div>
                            <label htmlFor="email" className="block text-xs font-bold text-slate-500 uppercase mb-2">
                                Correo Electrónico
                            </label>
                            <input
                                id="email"
                                name="email"
                                type="email"
                                autoComplete="email"
                                required
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="block w-full rounded-xl border-0 py-3.5 px-4 text-slate-900 shadow-sm ring-1 ring-inset ring-slate-200 placeholder:text-slate-400 focus:ring-2 focus:ring-inset focus:ring-primary sm:text-sm sm:leading-6 outline-none bg-slate-50 focus:bg-white transition-all"
                                placeholder="tu@correo.com"
                            />
                        </div>

                        <div>
                            <button
                                type="submit"
                                disabled={loading}
                                className="flex w-full justify-center rounded-xl bg-slate-900 px-3 py-3.5 text-sm font-bold leading-6 text-white shadow-sm hover:bg-slate-800 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-slate-600 transition-all disabled:opacity-70 disabled:cursor-wait"
                            >
                                {loading ? "Enviando..." : "Enviar Enlace"}
                            </button>
                        </div>
                    </form>

                    <div className="mt-8 text-center">
                        <Link href="/login" className="font-bold text-slate-500 hover:text-slate-900 text-sm flex items-center justify-center gap-2">
                            <span className="material-symbols-outlined text-lg">arrow_back</span>
                            Volver
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
}
