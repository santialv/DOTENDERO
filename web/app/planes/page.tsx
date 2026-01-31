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

    useEffect(() => {
        async function fetchPlans() {
            try {
                const { data, error } = await supabase
                    .from('plans')
                    .select('*')
                    .eq('active', true)
                    .order('price', { ascending: true });

                if (data && !error) {
                    setPlans(data.map(p => ({
                        ...p,
                        features: Array.isArray(p.features) ? p.features : JSON.parse(p.features || '[]')
                    })));
                }
            } catch (err) {
                console.error("Error fetching plans:", err);
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
                                    a: "Nada malo. Tu información está segura en nuestros servidores. Solo descarga la app en un nuevo celular, ingresa con tus datos y tendrás toda tu tienda intacta (inventario, fiados y reportes)."
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
            </main>

            <Footer dark={false} />
        </div>
    );
}
