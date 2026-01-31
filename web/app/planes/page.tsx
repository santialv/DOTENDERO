"use client";
import { useState, useEffect } from "react";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { supabase } from "@/lib/supabase";

interface Plan {
    id: string;
    name: string;
    price: number;
    description: string;
    features: string[];
}

export default function PlanesPage() {
    const [plans, setPlans] = useState<Plan[]>([]);
    const [loadingPlans, setLoadingPlans] = useState(true);
    const [cycle, setCycle] = useState<'monthly' | 'yearly'>('monthly');

    const DEFAULT_PLANS: Plan[] = [
        { id: 'free', name: 'Plan Gratuito', price: 0, description: 'Ideal para quienes están empezando y quieren digitalizar su negocio sin costo.', features: ["Ventas ilimitadas", "Inventario básico", "Gestión de fiados básica", "Sin costo mensual"] },
        { id: 'pro', name: 'Plan Pro', price: 50000, description: 'La mejor opción para negocios en crecimiento que necesitan control total.', features: ["Todo lo del Gratuito", "Facturación Electrónica", "Reportes de ganancias", "Soporte prioritario 24/7"] },
        { id: 'premium', name: 'Plan Premium', price: 90000, description: 'Para empresarios con múltiples sedes o grandes volúmenes de venta.', features: ["Todo lo del Pro", "Multi-Bodega / Multi-Sede", "Asesoría financiera mensual", "Personalización de reportes"] }
    ];

    useEffect(() => {
        async function fetchPlans() {
            try {
                const { data, error } = await supabase
                    .from('plans')
                    .select('*')
                    .eq('active', true)
                    .order('price', { ascending: true });

                if (data && data.length > 0 && !error) {
                    setPlans(data.map(p => ({
                        ...p,
                        features: Array.isArray(p.features) ? p.features : JSON.parse(p.features || '[]')
                    })));
                } else {
                    // Fallback to default plans if database is empty or error
                    setPlans(DEFAULT_PLANS);
                }
            } catch (err) {
                console.error("Error fetching plans:", err);
                setPlans(DEFAULT_PLANS);
            } finally {
                setLoadingPlans(false);
            }
        }
        fetchPlans();
    }, []);

    const formatCurrency = (val: number) => {
        return new Intl.NumberFormat('es-CO', {
            style: 'currency',
            currency: 'COP',
            maximumFractionDigits: 0
        }).format(val);
    };

    useEffect(() => {
        const observerOptions = { threshold: 0.1 };
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('reveal-visible');
                }
            });
        }, observerOptions);

        document.querySelectorAll('.reveal-on-scroll').forEach(el => observer.observe(el));
        return () => observer.disconnect();
    }, [loadingPlans]);

    return (
        <div className="min-h-screen bg-white">
            <Header dark={false} />

            <main className="pt-32 pb-20">
                {/* Pricing Section */}
                <section className="w-full py-20 pb-40">
                    <div className="w-full max-w-[1200px] mx-auto px-6">
                        <div className="text-center mb-16 reveal-on-scroll">
                            <h3 className="text-primary font-bold tracking-widest uppercase text-xs mb-3">Precios Claros</h3>
                            <h2 className="text-slate-900 text-4xl md:text-6xl font-black mb-10 tracking-tight">Invierte en el <span className="text-primary italic">crecimiento de tu tienda</span></h2>

                            <div className="inline-flex items-center p-1.5 bg-slate-50 rounded-2xl border border-slate-100 mb-8 shadow-sm">
                                <button
                                    onClick={() => setCycle('monthly')}
                                    className={`px-6 py-2.5 rounded-xl text-sm font-bold transition-all ${cycle === 'monthly' ? 'bg-white text-slate-900 shadow-md' : 'text-slate-500 hover:text-slate-900'}`}
                                >
                                    Mensual
                                </button>
                                <button
                                    onClick={() => setCycle('yearly')}
                                    className={`px-6 py-2.5 rounded-xl text-sm font-bold transition-all flex items-center gap-2 ${cycle === 'yearly' ? 'bg-white text-slate-900 shadow-md' : 'text-slate-500 hover:text-slate-900'}`}
                                >
                                    Anual <span className="text-[10px] bg-primary text-background-dark px-2 py-0.5 rounded-full">-20%</span>
                                </button>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                            {loadingPlans ? (
                                Array(3).fill(0).map((_, i) => (
                                    <div key={i} className="h-[600px] rounded-[3rem] bg-slate-50 animate-pulse"></div>
                                ))
                            ) : (
                                plans.map((plan) => (
                                    <div
                                        key={plan.id}
                                        className={`p-10 rounded-[3rem] flex flex-col transition-all duration-500 relative ${plan.id === 'pro'
                                            ? 'bg-slate-900 text-white shadow-[0_40px_80px_-15px_rgba(0,0,0,0.3)] md:-translate-y-8 z-10'
                                            : 'bg-slate-50 border border-slate-100'
                                            }`}
                                    >
                                        {plan.id === 'pro' && (
                                            <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-primary text-background-dark px-6 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest shadow-xl">
                                                Recomendado
                                            </div>
                                        )}

                                        <h4 className={`${plan.id === 'pro' ? 'text-primary' : 'text-slate-400'} font-bold text-sm uppercase tracking-widest mb-6`}>
                                            {plan.name}
                                        </h4>

                                        <div className="mb-8">
                                            <div className="flex items-baseline gap-2">
                                                <span className={`text-4xl md:text-5xl font-black ${plan.id === 'pro' ? 'text-white' : 'text-slate-900'}`}>
                                                    {plan.price === 0 ? 'Gratis' : formatCurrency(cycle === 'monthly' ? plan.price : plan.price * 12 * 0.8)}
                                                </span>
                                                {plan.price > 0 && (
                                                    <span className={`${plan.id === 'pro' ? 'text-slate-500' : 'text-slate-400'} text-sm font-bold`}>
                                                        /{cycle === 'monthly' ? 'mes' : 'año'}
                                                    </span>
                                                )}
                                            </div>
                                        </div>

                                        <p className={`${plan.id === 'pro' ? 'text-slate-400' : 'text-slate-500'} text-sm mb-10 leading-relaxed min-h-[40px]`}>
                                            {plan.description}
                                        </p>

                                        <div className={`h-px w-full mb-10 ${plan.id === 'pro' ? 'bg-slate-800' : 'bg-slate-200'}`}></div>

                                        <ul className="space-y-6 mb-12 flex-1">
                                            {plan.features.map((feature, idx) => (
                                                <li key={idx} className="flex items-start gap-3 text-sm">
                                                    <span className="text-primary material-symbols-outlined text-xl">check_circle</span>
                                                    <span className={plan.id === 'pro' ? 'text-slate-200' : 'text-slate-600'}>{feature}</span>
                                                </li>
                                            ))}
                                        </ul>

                                        <a
                                            href="https://dontendero.com/register"
                                            className={`w-full py-5 text-center rounded-2xl font-black transition-all ${plan.id === 'pro'
                                                ? 'bg-primary text-background-dark shadow-xl shadow-primary/20 hover:scale-[1.02]'
                                                : 'bg-slate-900 text-white hover:bg-slate-800'
                                                }`}
                                        >
                                            {plan.price === 0 ? 'Empezar Gratis' : 'Elegir Plan'}
                                        </a>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>
                </section>

                {/* FAQ Section - White version */}
                <section id="faq" className="w-full bg-slate-50 py-24 border-t border-slate-100">
                    <div className="w-full max-w-[800px] mx-auto px-6">
                        <div className="text-center mb-16 reveal-on-scroll">
                            <h3 className="text-primary font-bold tracking-widest uppercase text-xs mb-3">Preguntas Frecuentes</h3>
                            <h2 className="text-slate-900 text-3xl md:text-4xl font-black tracking-tight">Despeja tus dudas y empieza hoy</h2>
                        </div>

                        <div className="space-y-4">
                            {[
                                {
                                    q: "¿Es legal usar DonTendero para mi negocio?",
                                    a: "¡Totalmente! DonTendero está diseñado cumpliendo con las normativas comerciales de Colombia. Además, nuestro Plan Emprendedor incluye herramientas para ayudarte con la Facturación Electrónica si tu negocio lo requiere."
                                },
                                {
                                    q: "¿Funciona sin internet?",
                                    a: "DonTendero es una aplicación basada en la nube para que tu información nunca se pierda. Necesitas una conexión (Wi-Fi o datos móviles) para registrar ventas y sincronizar inventario en tiempo real."
                                },
                                {
                                    q: "¿Me cobran por cada factura que haga?",
                                    a: "No. A diferencia de otros sistemas, nosotros no cobramos por factura emitida. Pagas una suscripción fija mensual o anual y tienes ventas ilimitadas."
                                },
                                {
                                    q: "¿Qué pasa si pierdo mi celular?",
                                    a: "Nada malo. Tu información está segura en nuestros servidores. Solo descarga la app en un nuevo celular, ingresa con tus datos y tendrás todo tu negocio intacto (inventario, fiados y reportes)."
                                }
                            ].map((faq, i) => (
                                <div key={i} className="group p-8 rounded-[2rem] bg-white border border-slate-100 hover:border-primary/30 transition-all reveal-on-scroll">
                                    <h3 className="text-slate-900 font-bold mb-4 flex items-center justify-between">
                                        {faq.q}
                                        <span className="material-symbols-outlined text-primary group-hover:rotate-180 transition-transform">expand_more</span>
                                    </h3>
                                    <p className="text-slate-500 text-sm leading-relaxed">{faq.a}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>

                {/* Emotional Purpose Section - Minimal Light Version */}
                <section className="w-full py-32 bg-white">
                    <div className="w-full max-w-[1200px] mx-auto px-6">
                        <div className="flex flex-col md:flex-row gap-16 items-center">
                            <div className="flex-1 reveal-on-scroll">
                                <h3 className="text-primary font-bold tracking-widest uppercase text-xs mb-6">Nuestra Motivación</h3>
                                <h2 className="text-slate-900 text-4xl md:text-6xl font-black mb-8 leading-tight">
                                    No estamos aquí para <br /><span className="text-primary italic">sacarte plata</span>
                                </h2>
                                <p className="text-slate-500 text-lg leading-relaxed mb-8">
                                    Creamos DonTendero porque sabemos que el sistema financiero muchas veces ignora al pequeño. Nosotros no. Tu pago no es un gasto, es el motor que nos permite seguir construyendo herramientas que te devuelven el control de tu vida.
                                </p>
                                <div className="p-8 rounded-[2.5rem] bg-slate-50 border border-slate-100 italic text-slate-700 font-medium text-lg relative">
                                    <span className="material-symbols-outlined absolute -top-4 -left-4 size-10 bg-primary rounded-full flex items-center justify-center text-slate-900 text-xl font-black">format_quote</span>
                                    "Trabajamos para que el tendero, el que siempre ha estado abajo, hoy tenga la tecnología del más grande. Porque los últimos seremos los primeros."
                                </div>
                            </div>
                            <div className="w-full md:w-[400px] grid grid-cols-2 gap-4 reveal-on-scroll delay-200">
                                <div className="aspect-square bg-slate-900 rounded-[2rem] flex flex-col items-center justify-center text-white p-6 text-center">
                                    <span className="material-symbols-outlined text-primary text-3xl mb-3">shield_heart</span>
                                    <p className="text-xs font-bold uppercase tracking-tighter">Protección Social</p>
                                </div>
                                <div className="aspect-square bg-primary rounded-[2rem] flex flex-col items-center justify-center text-slate-900 p-6 text-center">
                                    <span className="material-symbols-outlined text-3xl mb-3">groups</span>
                                    <p className="text-xs font-black uppercase tracking-tighter">Comunidad Real</p>
                                </div>
                                <div className="col-span-2 h-32 bg-slate-100 rounded-[2rem] flex items-center justify-center gap-4 px-8 overflow-hidden relative">
                                    <div className="relative z-10 flex items-center gap-4">
                                        <div className="size-10 rounded-full bg-white flex items-center justify-center shadow-sm">
                                            <span className="material-symbols-outlined text-primary">verified</span>
                                        </div>
                                        <p className="text-slate-900 font-black text-sm uppercase tracking-widest">Hecho con ❤️ en Colombia</p>
                                    </div>
                                    <div className="absolute top-0 right-0 w-32 h-32 bg-primary/20 blur-3xl rounded-full"></div>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>
            </main>

            <Footer dark={false} />
        </div>
    );
}
