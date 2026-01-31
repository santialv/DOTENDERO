"use client";
import { useState, useEffect } from "react";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";

export default function ComoFuncionaPage() {
    const [desktopActiveTab, setDesktopActiveTab] = useState("Ventas");

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
                {/* Step by Step Section */}
                <section className="w-full py-20 overflow-hidden">
                    <div className="w-full max-w-[1200px] mx-auto px-6">
                        <div className="text-center mb-24 reveal-on-scroll">
                            <h3 className="text-primary font-bold tracking-widest uppercase text-xs mb-3">Simple y Rápido</h3>
                            <h2 className="text-slate-900 text-4xl md:text-6xl font-black mb-6 tracking-tight">Tu tienda digital en <span className="text-primary italic">3 pasos</span></h2>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-16 relative">
                            {/* Connector lines (Desktop) */}
                            <div className="absolute top-1/2 left-0 w-full h-px bg-slate-100 hidden md:block -z-10"></div>

                            {[
                                {
                                    step: "01",
                                    title: "Descarga y Crea",
                                    desc: "Baja la app en tu Android y crea tu cuenta en menos de 2 minutos. Solo necesitas tu correo.",
                                    icon: "install_mobile"
                                },
                                {
                                    step: "02",
                                    title: "Sube tu Inventario",
                                    desc: "Escanea tus productos con la cámara de tu celular. Es tan rápido como cobrar con pistola de láser.",
                                    icon: "qr_code_scanner"
                                },
                                {
                                    step: "03",
                                    title: "¡Empieza a Vender!",
                                    desc: "Registra ventas, fiados y mira tus ganancias crecer. DonTendero se encarga del resto.",
                                    icon: "rocket_launch"
                                }
                            ].map((item, i) => (
                                <div key={i} className="flex flex-col items-center text-center reveal-on-scroll" style={{ transitionDelay: `${i * 150}ms` }}>
                                    <div className="size-20 rounded-full bg-white border-4 border-slate-50 flex items-center justify-center text-primary shadow-xl shadow-slate-200 mb-8 relative">
                                        <span className="material-symbols-outlined text-3xl font-black">{item.icon}</span>
                                        <span className="absolute -top-2 -right-2 size-8 bg-slate-900 text-white rounded-full flex items-center justify-center font-black text-xs">{item.step}</span>
                                    </div>
                                    <h4 className="text-2xl font-bold text-slate-900 mb-4">{item.title}</h4>
                                    <p className="text-slate-500 leading-relaxed">{item.desc}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>

                {/* Desktop Dashboard Preview - Light Version */}
                <section className="w-full py-24 bg-slate-50">
                    <div className="w-full max-w-[1200px] mx-auto px-6">
                        <div className="flex flex-col lg:flex-row gap-16 items-center">
                            <div className="flex-1 reveal-on-scroll">
                                <h3 className="text-primary font-bold tracking-widest uppercase text-xs mb-3">Versión Web</h3>
                                <h2 className="text-slate-900 text-3xl md:text-5xl font-black mb-8 leading-tight">Control total desde tu <span className="text-primary italic">computador</span></h2>
                                <p className="text-slate-500 text-lg mb-10 leading-relaxed">Si tienes un depósito o supermercado grande, DonTendero Web te permite gestionar múltiples sedes, proveedores y facturación masiva con total comodidad.</p>

                                <div className="space-y-6">
                                    {['Gestión Multi-Usuario', 'Reportes Avanzados Excel', 'Auditoría de Caja'].map((f, i) => (
                                        <div key={i} className="flex items-center gap-3 text-slate-700 font-bold">
                                            <span className="material-symbols-outlined text-primary">check_circle</span>
                                            {f}
                                        </div>
                                    ))}
                                </div>
                            </div>

                            <div className="flex-1 w-full reveal-on-scroll delay-200">
                                <div className="bg-white rounded-[2rem] border border-slate-200 shadow-2xl overflow-hidden aspect-video relative group">
                                    <div className="bg-slate-100 h-10 w-full flex items-center px-4 gap-2">
                                        <div className="size-2.5 rounded-full bg-red-400"></div>
                                        <div className="size-2.5 rounded-full bg-orange-400"></div>
                                        <div className="size-2.5 rounded-full bg-green-400"></div>
                                    </div>
                                    <div className="p-4 grid grid-cols-4 gap-4 h-full">
                                        <div className="col-span-1 bg-slate-50 rounded-lg p-2 space-y-2">
                                            {[...Array(6)].map((_, i) => <div key={i} className="h-4 bg-slate-200 rounded w-full"></div>)}
                                        </div>
                                        <div className="col-span-3 bg-white border border-slate-100 rounded-lg p-4">
                                            <div className="h-full bg-[url('https://images.unsplash.com/photo-1551288049-bbbda540d3b9?auto=format&fit=crop&q=80&w=500')] bg-cover opacity-10 rounded-lg"></div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Emotional Purpose Section - Light Version */}
                <section className="w-full py-32 bg-white">
                    <div className="w-full max-w-[1000px] mx-auto px-6 text-center reveal-on-scroll">
                        <div className="inline-flex size-16 rounded-3xl bg-primary/20 items-center justify-center text-primary mb-10">
                            <span className="material-symbols-outlined text-4xl">handshake</span>
                        </div>
                        <h3 className="text-primary font-bold tracking-widest uppercase text-xs mb-6">Nuestra Alianza contigo</h3>
                        <h2 className="text-slate-900 text-3xl md:text-5xl font-black mb-8 leading-tight">
                            Hacerlo fácil no es un lujo, <br /><span className="text-primary italic">es un acto de respeto</span>
                        </h2>
                        <div className="max-w-3xl mx-auto space-y-8 text-slate-500 text-xl leading-relaxed">
                            <p>
                                Sabemos que tu tiempo es lo más valioso que tienes. Por eso, DonTendero no tiene manuales aburridos ni cursos complicados. Si sabes usar el celular para llamar a tu familia, ya sabes usar nuestra app.
                            </p>
                            <div className="h-px w-24 bg-primary mx-auto"></div>
                            <p className="font-medium text-slate-800 italic">
                                "Venimos de abajo y sabemos que para salir adelante no necesitas más trabajo, necesitas herramientas que trabajen por ti. Porque los últimos seremos los primeros."
                            </p>
                        </div>
                        <div className="mt-16">
                            <a href="https://dontendero.com/register" className="inline-flex items-center gap-3 px-10 py-5 bg-slate-900 text-white rounded-2xl font-black hover:bg-primary hover:text-slate-900 transition-all group">
                                Crear mi cuenta ahora
                                <span className="material-symbols-outlined group-hover:translate-x-1 transition-transform">arrow_forward</span>
                            </a>
                        </div>
                    </div>
                </section>
            </main>

            <Footer dark={false} />
        </div>
    );
}
