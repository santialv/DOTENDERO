"use client";

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/navigation';
import { useToast } from "@/components/ui/toast";

export default function ResetPasswordPage() {
    const router = useRouter();
    const { toast } = useToast();
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [sessionChecking, setSessionChecking] = useState(true);

    // Verify we have a session (magic link should have created one)
    useEffect(() => {
        const checkSession = async () => {
            const { data: { session } } = await supabase.auth.getSession();
            // We just verify session exists, if it doesn't supabase logic usually redirects or we handle error on update
            setSessionChecking(false);
        };
        checkSession();
    }, []);

    const handleUpdatePassword = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        if (password.length < 6) {
            toast("La contraseña debe tener al menos 6 caracteres", "destructive");
            setLoading(false);
            return;
        }

        if (password !== confirmPassword) {
            toast("Las contraseñas no coinciden. Inténtalo de nuevo.", "destructive");
            setLoading(false);
            return;
        }

        try {
            const { error } = await supabase.auth.updateUser({ password: password });

            if (error) {
                toast(error.message, "destructive");
            } else {
                toast("¡Contraseña actualizada con éxito!", "default");
                setTimeout(() => {
                    router.push('/');
                }, 1500);
            }
        } catch (error) {
            toast("Error inesperado al actualizar", "destructive");
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    if (sessionChecking) return <div className="flex min-h-screen items-center justify-center text-slate-500 font-bold animate-pulse">Verificando enlace de seguridad...</div>;

    return (
        <div className="flex min-h-screen flex-col justify-center py-12 px-4 sm:px-6 lg:px-8 bg-slate-50 font-sans">
            <div className="sm:mx-auto sm:w-full sm:max-w-md">
                <div className="flex justify-center mb-6">
                    <div className="w-16 h-16 bg-[#00E054] rounded-2xl flex items-center justify-center shadow-lg shadow-[#00E054]/20">
                        <span className="material-symbols-outlined text-4xl text-slate-900">lock_reset</span>
                    </div>
                </div>
                <h2 className="text-center text-3xl font-bold tracking-tight text-slate-900 mb-2">
                    Establecer Nueva Contraseña
                </h2>
                <p className="text-center text-sm text-slate-500">
                    Crea una contraseña fuerte para proteger tu negocio.
                </p>
            </div>

            <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-[480px]">
                <div className="bg-white px-6 py-10 shadow-xl shadow-slate-200/50 sm:rounded-3xl sm:px-10 border border-slate-100">

                    {/* Security Notice Box */}
                    <div className="mb-8 p-4 bg-amber-50 rounded-xl border border-amber-100 flex gap-3 text-amber-800">
                        <span className="material-symbols-outlined shrink-0 text-amber-600">security</span>
                        <p className="text-xs font-medium leading-relaxed">
                            <span className="font-bold block mb-0.5">Importante: Tu seguridad es primero.</span>
                            Nunca compartas tu contraseña ni brindes datos de acceso a personas desconocidas. El equipo de DonTendero nunca te pedirá tu clave.
                        </p>
                    </div>

                    <form className="space-y-5" onSubmit={handleUpdatePassword}>
                        <div>
                            <label htmlFor="password" className="block text-xs font-bold text-slate-600 uppercase mb-2 ml-1">
                                Nueva Contraseña
                            </label>
                            <div className="relative group">
                                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                    <span className="material-symbols-outlined text-[#00E054]">lock</span>
                                </div>
                                <input
                                    id="password"
                                    name="password"
                                    type="password"
                                    required
                                    minLength={6}
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    className="block w-full rounded-xl border border-slate-200 py-3.5 pl-12 pr-4 text-slate-900 placeholder:text-slate-300 focus:border-[#00E054] focus:ring-4 focus:ring-[#00E054]/10 outline-none transition-all font-medium"
                                    placeholder="******"
                                />
                            </div>
                        </div>

                        <div>
                            <label htmlFor="confirmPassword" className="block text-xs font-bold text-slate-600 uppercase mb-2 ml-1">
                                Confirmar Contraseña
                            </label>
                            <div className="relative group">
                                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                    <span className="material-symbols-outlined text-[#00E054]">verified_user</span>
                                </div>
                                <input
                                    id="confirmPassword"
                                    name="confirmPassword"
                                    type="password"
                                    required
                                    minLength={6}
                                    value={confirmPassword}
                                    onChange={(e) => setConfirmPassword(e.target.value)}
                                    className="block w-full rounded-xl border border-slate-200 py-3.5 pl-12 pr-4 text-slate-900 placeholder:text-slate-300 focus:border-[#00E054] focus:ring-4 focus:ring-[#00E054]/10 outline-none transition-all font-medium"
                                    placeholder="******"
                                />
                            </div>
                        </div>

                        <div className="pt-2">
                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full flex justify-center py-4 px-4 rounded-xl shadow-lg shadow-[#00E054]/20 text-sm font-bold text-slate-900 bg-[#00E054] hover:bg-[#00c94a] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#00E054] transition-all transform active:scale-[0.98] disabled:opacity-70 disabled:cursor-wait uppercase tracking-wide"
                            >
                                {loading ? "Guardando..." : "Actualizar Contraseña"}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
}
