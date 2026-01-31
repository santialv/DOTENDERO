"use client";
import { useEffect } from "react";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";

export default function AsesoriaPage() {
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
    }, []);

    return (
        <div className="min-h-screen bg-white">
            <Header dark={false} />

            <main className="pt-32 pb-20">
                {/* HERO SECTION - ADVISORY */}
                <section className="w-full py-20 overflow-hidden text-center">
                    <div className="w-full max-w-[1200px] mx-auto px-6">
                        <div className="mb-12 reveal-on-scroll">
                            <h3 className="text-primary font-bold tracking-widest uppercase text-xs mb-4">Acompañamiento 360°</h3>
                            <h1 className="text-slate-900 text-4xl md:text-7xl font-black tracking-tight leading-none mb-8">
                                No solo te damos la app, <br />
                                <span className="text-primary italic">te damos el camino</span>
                            </h1>
                            <p className="text-slate-500 text-lg md:text-xl max-w-3xl mx-auto leading-relaxed">
                                DonTendero es la única plataforma que cierra el ciclo financiero de tu negocio. Interpretamos tus números por ti y te acompañamos paso a paso para que tu patrimonio crezca de verdad.
                            </p>
                        </div>

                        <div className="relative inline-block reveal-on-scroll delay-200">
                            <div className="absolute -inset-4 bg-primary/10 rounded-3xl blur-2xl"></div>
                            <a
                                href="https://wa.me/573107146415?text=Hola!%20Quiero%20recibir%20asesoría%20financiera"
                                className="relative py-6 px-12 bg-slate-900 text-white rounded-2xl text-2xl font-black hover:scale-105 transition-transform flex items-center gap-4 shadow-2xl shadow-slate-200 group"
                            >
                                <span className="material-symbols-outlined text-primary">chat</span>
                                Agendar Asesoría Gratis
                                <span className="material-symbols-outlined group-hover:translate-x-1 transition-transform">arrow_forward</span>
                            </a>
                        </div>
                    </div>
                </section>

                {/* THE CYCLE - VISUAL SECTION */}
                <section className="w-full py-24 bg-slate-50 border-y border-slate-100">
                    <div className="w-full max-w-[1200px] mx-auto px-6">
                        <div className="text-center mb-20 reveal-on-scroll">
                            <h2 className="text-slate-900 text-3xl md:text-5xl font-black tracking-tight">El Ciclo del <span className="text-primary italic">Éxito Tendero</span></h2>
                            <p className="text-slate-500 mt-4">Nuestra metodología paso a paso para transformar tu negocio.</p>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
                            {[
                                { step: "1", title: "Diagnóstico", desc: "Auditamos tu inventario y tus deudas por cobrar para saber dónde estás parado.", icon: "detection_and_zone" },
                                { step: "2", title: "Optimización", desc: "Eliminamos fugas de dinero y te enseñamos a comprar lo que sí se vende.", icon: "unfold_more_double" },
                                { step: "3", title: "Control", desc: "Implementamos cierres de caja ciegos para que no falte ni un solo peso.", icon: "security_update_good" },
                                { step: "4", title: "Patrimonio", desc: "Convertimos tus ganancias en inversión real para tu propiedad o local.", icon: "account_balance" }
                            ].map((item, i) => (
                                <div key={i} className="bg-white p-10 rounded-[2.5rem] border border-slate-100 shadow-sm relative group reveal-on-scroll" style={{ transitionDelay: `${i * 100}ms` }}>
                                    <div className="size-14 rounded-2xl bg-slate-50 flex items-center justify-center text-primary mb-8 group-hover:bg-primary group-hover:text-slate-900 transition-all duration-500">
                                        <span className="material-symbols-outlined text-3xl">{item.icon}</span>
                                    </div>
                                    <div className="absolute top-8 right-8 text-slate-100 font-black text-6xl group-hover:text-primary/10 transition-colors">{item.step}</div>
                                    <h4 className="text-xl font-bold text-slate-900 mb-4">{item.title}</h4>
                                    <p className="text-slate-500 text-sm leading-relaxed">{item.desc}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>

                {/* DETAILED SERVICES - BENTO STYLE */}
                <section className="w-full py-32">
                    <div className="w-full max-w-[1200px] mx-auto px-6">
                        <div className="mb-20 reveal-on-scroll">
                            <h3 className="text-primary font-bold tracking-widest uppercase text-xs mb-4">Servicios Especializados</h3>
                            <h2 className="text-slate-900 text-4xl font-black max-w-2xl leading-none">Todo el conocimiento de un financiero <br /><span className="text-primary italic">hablado en tu mismo idioma</span></h2>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                            <div className="p-12 rounded-[3.5rem] bg-emerald-50 border border-emerald-100 reveal-on-scroll">
                                <h4 className="text-slate-900 font-black text-2xl mb-6 flex items-center gap-3">
                                    <span className="material-symbols-outlined text-emerald-600">trending_up</span>
                                    Análisis de Rentabilidad Real
                                </h4>
                                <p className="text-slate-600 leading-relaxed text-lg mb-8">
                                    Muchos tenderos venden mucho pero no ven la plata. Nosotros calculamos el **margen neto real** quitando costos ocultos, mermas y gastos de operación. Sabrás exactamente cuánto dinero entra en tu bolsillo por cada producto.
                                </p>
                                <ul className="space-y-4 text-emerald-800 font-bold text-sm">
                                    <li className="flex items-center gap-2"><span className="material-symbols-outlined text-emerald-500 text-base">check_circle</span> Identificación de productos "huesos"</li>
                                    <li className="flex items-center gap-2"><span className="material-symbols-outlined text-emerald-500 text-base">check_circle</span> Estrategia de precios competitivos</li>
                                    <li className="flex items-center gap-2"><span className="material-symbols-outlined text-emerald-500 text-base">check_circle</span> Control de mermas y vencimientos</li>
                                </ul>
                            </div>

                            <div className="p-12 rounded-[3.5rem] bg-blue-50 border border-blue-100 reveal-on-scroll delay-100">
                                <h4 className="text-slate-900 font-black text-2xl mb-6 flex items-center gap-3">
                                    <span className="material-symbols-outlined text-blue-600">payments</span>
                                    Estrategia de Cobro de Fiados
                                </h4>
                                <p className="text-slate-600 leading-relaxed text-lg mb-8">
                                    El fiado es una bendición y a la vez una condena. Te enseñamos a **gestionar el cupo de crédito** de tus vecinos sin dañar la relación, implementando recordatorios sutiles y límites saludables.
                                </p>
                                <ul className="space-y-4 text-blue-800 font-bold text-sm">
                                    <li className="flex items-center gap-2"><span className="material-symbols-outlined text-blue-500 text-base">check_circle</span> Digitalización del cuaderno</li>
                                    <li className="flex items-center gap-2"><span className="material-symbols-outlined text-blue-500 text-base">check_circle</span> Alertas de sobre-endeudamiento</li>
                                    <li className="flex items-center gap-2"><span className="material-symbols-outlined text-blue-500 text-base">check_circle</span> Recuperación de cartera vieja</li>
                                </ul>
                            </div>

                            <div className="p-12 rounded-[3.5rem] bg-slate-900 text-white md:col-span-2 reveal-on-scroll delay-200 relative overflow-hidden">
                                <div className="relative z-10">
                                    <h4 className="text-primary font-black text-3xl mb-8 flex items-center gap-3 leading-tight">
                                        <span className="material-symbols-outlined text-white">volunteer_activism</span>
                                        Plan de Protección Familiar <br />y Patrimonial
                                    </h4>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                                        <div className="space-y-6">
                                            <p className="text-slate-400 text-lg leading-relaxed">
                                                Tu tienda es mucho más que un negocio; es el futuro de tus hijos. Nuestra asesoría te guía para que el crecimiento de la tienda se traduzca en **activos reales** (mejoras locativas, ahorro programado o estudio).
                                            </p>
                                        </div>
                                        <div className="bg-white/5 border border-white/10 p-8 rounded-3xl backdrop-blur-md">
                                            <h5 className="text-white font-bold mb-4 uppercase text-xs tracking-widest text-primary">Nuestra Promesa</h5>
                                            <p className="text-sm italic text-slate-300">"No descansaremos hasta que el tendero de barrio deje de sentir que trabaja para el banco o para pagar el arriendo, y empiece a trabajar para construir su propio imperio."</p>
                                        </div>
                                    </div>
                                </div>
                                <div className="absolute top-0 right-0 size-96 bg-primary/10 rounded-full blur-[120px]"></div>
                            </div>
                        </div>
                    </div>
                </section>

                {/* BARRIO ROOT REINFORCEMENT */}
                <section className="w-full py-32 bg-slate-50 border-t border-slate-100">
                    <div className="w-full max-w-[1000px] mx-auto px-6 text-center reveal-on-scroll">
                        <div className="inline-flex size-20 rounded-[2rem] bg-slate-900 items-center justify-center text-primary mb-10 shadow-xl">
                            <span className="material-symbols-outlined text-5xl font-black">handshake</span>
                        </div>
                        <h2 className="text-slate-900 text-4xl md:text-6xl font-black mb-10 leading-none tracking-tight">
                            Entendemos el barrio porque <br /><span className="text-primary italic">venimos de él</span>
                        </h2>
                        <div className="space-y-8 text-slate-500 text-xl leading-relaxed max-w-3xl mx-auto">
                            <p>
                                La mayoría de asesores financieros hablan de balances y PDG en oficinas con aire acondicionado. Nosotros hablamos de **"cuánto me quedó al final del día"** en el mostrador.
                            </p>
                            <p className="text-slate-800 font-bold italic">
                                "Venimos de abajo y por eso entendemos a los de abajo. Estamos aquí para asegurar que los últimos en la cadena siempre sean los primeros en recibir tecnología de clase mundial."
                            </p>
                        </div>
                    </div>
                </section>

                {/* FINAL CALL TO ACTION */}
                <section className="w-full py-24 bg-primary text-background-dark text-center overflow-hidden relative">
                    <div className="w-full max-w-[800px] mx-auto px-6 relative z-10">
                        <h2 className="text-4xl md:text-7xl font-black mb-10 leading-[0.9] tracking-tighter">¿Hablamos sobre <br />tus números?</h2>
                        <p className="text-xl md:text-3xl font-bold opacity-80 mb-12">No dejes para mañana el crecimiento que puedes empezar hoy. Agenda una sesión personalizada.</p>
                        <a
                            href="https://wa.me/573107146415?text=Deseo%20empezar%20con%20la%20asesoría%20financiera"
                            className="inline-flex items-center gap-6 py-6 px-16 bg-background-dark text-white rounded-[2rem] text-2xl font-black hover:scale-105 transition-transform shadow-3xl group"
                        >
                            Contactar con un Experto
                            <span className="material-symbols-outlined text-primary group-hover:translate-x-2 transition-transform">trending_up</span>
                        </a>
                    </div>
                    {/* Decorative elements */}
                    <div className="absolute top-0 right-0 w-64 h-64 bg-white/20 rounded-full -translate-y-1/2 translate-x-1/2 blur-3xl"></div>
                    <div className="absolute bottom-0 left-0 w-80 h-80 bg-black/5 rounded-full translate-y-1/2 -translate-x-1/2 blur-2xl"></div>
                </section>
            </main>

            <Footer dark={false} />
        </div>
    );
}
