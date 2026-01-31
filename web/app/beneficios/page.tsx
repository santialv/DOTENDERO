"use client";
import { useState, useMemo, useEffect } from "react";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";

export default function BeneficiosPage() {
    const [dailySales, setDailySales] = useState(300000);
    const [errorRate, setErrorRate] = useState(3);

    const monthlySavings = useMemo(() => {
        return (dailySales * 30) * (errorRate / 100);
    }, [dailySales, errorRate]);

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
    }, []);

    return (
        <div className="min-h-screen bg-white">
            <Header dark={false} />

            <main className="pt-32 pb-20">
                {/* Bento Grid Section */}
                <section className="w-full py-20">
                    <div className="w-full max-w-[1200px] mx-auto px-6">
                        <div className="mb-20 reveal-on-scroll">
                            <h3 className="text-primary font-bold tracking-widest uppercase text-xs mb-3">Tu Ventaja Competitiva</h3>
                            <h2 className="text-slate-900 text-3xl md:text-6xl font-black max-w-[700px] tracking-tight leading-none mb-6">
                                Tecnología diseñada para el <span className="text-primary italic">éxito de tu negocio</span>
                            </h2>
                            <p className="text-slate-500 text-lg max-w-2xl">
                                Hemos digitalizado las mejores prácticas de los tenderos más exitosos y las pusimos en la palma de tu mano.
                            </p>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
                            {/* Big Tile */}
                            <div className="md:col-span-8 p-12 rounded-[3rem] bg-slate-50 border border-slate-100 relative overflow-hidden group reveal-on-scroll">
                                <div className="relative z-10 max-w-[400px]">
                                    <div className="size-14 rounded-2xl bg-primary/20 flex items-center justify-center text-primary mb-8">
                                        <span className="material-symbols-outlined text-3xl">inventory_2</span>
                                    </div>
                                    <h3 className="text-3xl font-bold text-slate-900 mb-4">Inventario Inteligente</h3>
                                    <p className="text-slate-600 leading-relaxed text-lg">
                                        No más estantes vacíos. DonTendero predice cuándo te quedarás sin stock basándose en tu historial de ventas y te avisa qué comprar para tu negocio.
                                    </p>
                                </div>
                                <div className="absolute right-[-5%] bottom-[-5%] w-[50%] aspect-square bg-primary/5 rounded-full blur-[100px] group-hover:bg-primary/10 transition-all"></div>

                                <div className="absolute right-12 bottom-12 hidden lg:block transform group-hover:translate-y-[-10px] transition-transform duration-700">
                                    <div className="bg-white border border-slate-100 p-6 rounded-3xl shadow-xl">
                                        <div className="flex items-center gap-4">
                                            <div className="size-10 rounded-full bg-orange-100 flex items-center justify-center text-orange-500 font-black">!</div>
                                            <div>
                                                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Alerta de Stock</p>
                                                <p className="text-sm text-slate-900 font-bold">Aceite Girasol 1L - 2 un.</p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Medium Tile */}
                            <div className="md:col-span-4 p-12 rounded-[3rem] bg-slate-900 text-white border border-slate-800 hover:border-primary/40 transition-all reveal-on-scroll delay-100 overflow-hidden relative">
                                <div className="relative z-10">
                                    <div className="size-14 rounded-2xl bg-orange-500/20 flex items-center justify-center text-orange-400 mb-8">
                                        <span className="material-symbols-outlined text-3xl">menu_book</span>
                                    </div>
                                    <h3 className="text-2xl font-bold mb-4">Fiados 2.0</h3>
                                    <p className="text-slate-400 leading-relaxed">
                                        Digitaliza tu cuaderno. Envía recordatorios de cobro automáticos por WhatsApp y lleva el saldo exacto de cada cliente.
                                    </p>
                                </div>
                                <div className="absolute -right-20 -bottom-20 size-64 bg-primary/5 rounded-full blur-3xl"></div>
                            </div>

                            {/* Smaller Tiles */}
                            <div className="md:col-span-4 p-10 rounded-[2.5rem] bg-slate-50 border border-slate-100 reveal-on-scroll delay-200">
                                <div className="size-12 rounded-xl bg-slate-200 flex items-center justify-center text-slate-700 mb-6">
                                    <span className="material-symbols-outlined text-2xl">wifi_off</span>
                                </div>
                                <h4 className="text-xl font-bold text-slate-900 mb-2">Vende sin Internet</h4>
                                <p className="text-slate-500 text-sm leading-relaxed">¿Se cayó el Wi-Fi? No hay problema. Sincronizamos tus ventas automáticamente apenas recuperes la conexión.</p>
                            </div>

                            <div className="md:col-span-4 p-10 rounded-[2.5rem] bg-emerald-50 border border-emerald-100 reveal-on-scroll delay-300">
                                <div className="size-12 rounded-xl bg-emerald-100 flex items-center justify-center text-emerald-600 mb-6">
                                    <span className="material-symbols-outlined text-2xl">payments</span>
                                </div>
                                <h4 className="text-xl font-bold text-slate-900 mb-2">Márgenes Reales</h4>
                                <p className="text-slate-600 text-sm leading-relaxed">Calculamos tu ganancia bruta y neta por cada venta. Sabes cuánto dinero pusiste realmente en tu bolsillo.</p>
                            </div>

                            <div className="md:col-span-4 p-10 rounded-[2.5rem] bg-primary text-slate-900 reveal-on-scroll delay-400">
                                <div className="size-12 rounded-xl bg-white/30 flex items-center justify-center text-slate-900 mb-6">
                                    <span className="material-symbols-outlined text-2xl font-black">qr_code_scanner</span>
                                </div>
                                <h4 className="text-xl font-black mb-2 leading-tight">Cámara como Escáner</h4>
                                <p className="text-slate-900/70 text-sm font-bold leading-relaxed">Convierte cualquier celular Android en un escáner profesional de códigos de barras. Sin hardware extra.</p>
                            </div>
                        </div>
                    </div>
                </section>

                {/* ROI Calculator - Light Version */}
                <section className="w-full py-24 bg-slate-50 border-y border-slate-100">
                    <div className="w-full max-w-[1000px] mx-auto px-6 flex flex-col lg:flex-row gap-16 items-center">
                        <div className="flex-1 reveal-on-scroll">
                            <h2 className="text-slate-900 text-3xl md:text-5xl font-black mb-6 leading-tight">
                                Deja de perder plata <span className="text-primary italic">hoy mismo</span>
                            </h2>
                            <p className="text-slate-500 mb-10 text-lg">
                                Calcula cuánto dinero estás dejando ir por cuentas mal anotadas, olvidos o fugas de inventario.
                            </p>

                            <div className="space-y-12">
                                <div className="space-y-4">
                                    <div className="flex justify-between items-center">
                                        <label className="text-slate-700 font-bold text-sm">Ventas Diarias Estimadas</label>
                                        <span className="text-primary font-black text-2xl">{formatCurrency(dailySales)}</span>
                                    </div>
                                    <input
                                        type="range" min="50000" max="2000000" step="50000"
                                        value={dailySales} onChange={(e) => setDailySales(Number(e.target.value))}
                                        className="w-full accent-primary h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer"
                                    />
                                </div>

                                <div className="space-y-4">
                                    <div className="flex justify-between items-center">
                                        <label className="text-slate-700 font-bold text-sm">% de errores y fugas</label>
                                        <span className="text-orange-500 font-black text-2xl">{errorRate}%</span>
                                    </div>
                                    <input
                                        type="range" min="1" max="10" step="1"
                                        value={errorRate} onChange={(e) => setErrorRate(Number(e.target.value))}
                                        className="w-full accent-orange-500 h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer"
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="w-full max-w-[400px] reveal-on-scroll delay-200">
                            <div className="bg-white p-10 rounded-[3rem] border border-slate-200 shadow-2xl flex flex-col items-center text-center">
                                <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest mb-6 border-b border-slate-100 pb-2 w-full">Impacto Mensual DonTendero</p>
                                <h4 className="text-5xl md:text-6xl font-black text-slate-900 mb-4 tracking-tighter">
                                    {formatCurrency(monthlySavings)}
                                </h4>
                                <p className="text-slate-500 font-medium text-sm leading-relaxed mb-10">
                                    Este es dinero que DonTendero recupera para tu bolsillo mes tras mes.
                                </p>
                                <a href="https://dontendero.com/register" className="w-full py-5 bg-primary text-slate-900 rounded-2xl font-black shadow-xl shadow-primary/20 hover:scale-105 transition-transform">
                                    Empezar a Recuperar
                                </a>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Emotional Purpose Section - Light Version */}
                <section className="w-full py-32 overflow-hidden">
                    <div className="w-full max-w-[1200px] mx-auto px-6">
                        <div className="bg-slate-900 rounded-[4rem] p-12 md:p-20 relative overflow-hidden reveal-on-scroll">
                            <div className="relative z-10 grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
                                <div>
                                    <h3 className="text-primary font-bold tracking-widest uppercase text-xs mb-6">Nuestra Raíz</h3>
                                    <h2 className="text-white text-4xl md:text-6xl font-black mb-10 leading-none">
                                        Entendemos el barrio porque <span className="text-primary italic">venimos de él</span>
                                    </h2>
                                    <div className="space-y-6 text-slate-400 text-lg leading-relaxed">
                                        <p>
                                            DonTendero no nació en un laboratorio de Silicon Valley. Nació viendo cómo mi abuelo tachaba deudas en un cuaderno que apenas se entendía.
                                        </p>
                                        <p>
                                            Sabemos que cada peso cuenta y que el éxito no se mide en reportes corporativos, sino en <span className="text-white font-bold">la tranquilidad de tu familia</span> al final del día.
                                        </p>
                                        <p className="text-primary font-black italic text-2xl mt-8 leading-tight">
                                            "Estamos aquí para que los últimos, los que siempre han trabajado más duro, finalmente seamos los primeros."
                                        </p>
                                    </div>
                                </div>
                                <div className="hidden lg:block relative">
                                    <div className="absolute inset-0 bg-primary/20 blur-[100px] rounded-full"></div>
                                    <div className="relative border border-white/10 p-10 rounded-[3rem] bg-white/5 backdrop-blur-sm">
                                        <h4 className="text-white font-bold text-xl mb-8 flex items-center gap-3">
                                            <span className="material-symbols-outlined text-primary">auto_awesome</span>
                                            Por qué confiar en nosotros
                                        </h4>
                                        <div className="space-y-8">
                                            {[
                                                { t: "Foco en el Fiado", d: "Digitalizamos el corazón de tu negocio sin quitarle la humanidad." },
                                                { t: "Hecho para tenderos", d: "Si sabes usar una calculadora, ya eres un experto en DonTendero." },
                                                { t: "Tu dinero es sagrado", d: "Cada función está diseñada para evitar que un solo peso se escape." }
                                            ].map((item, i) => (
                                                <div key={i} className="flex gap-5">
                                                    <div className="size-8 rounded-full bg-primary flex-shrink-0 flex items-center justify-center text-sm text-slate-900 font-black">{i + 1}</div>
                                                    <div>
                                                        <p className="text-white font-bold mb-1">{item.t}</p>
                                                        <p className="text-sm text-slate-500 leading-relaxed">{item.d}</p>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            </div>
                            {/* Decorative background circle */}
                            <div className="absolute -right-20 -bottom-20 size-96 bg-primary/10 rounded-full blur-[120px]"></div>
                        </div>
                    </div>
                </section>
                {/* Professional Financial Cycle Section */}
                <section className="w-full py-24 bg-slate-50 border-t border-slate-100">
                    <div className="w-full max-w-[1200px] mx-auto px-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-20 items-center">
                            <div className="reveal-on-scroll">
                                <h3 className="text-primary font-bold tracking-widest uppercase text-xs mb-4">Servicio Profesional</h3>
                                <h2 className="text-slate-900 text-3xl md:text-5xl font-black mb-8 leading-tight">
                                    No solo una App, <br />un <span className="text-primary italic">aliado financiero</span>
                                </h2>
                                <p className="text-slate-500 text-lg leading-relaxed mb-10">
                                    Acompañamos al tendero en el cierre de su ciclo financiero. Desde que entra el primer peso hasta que se convierte en inversión para su patrimonio.
                                </p>

                                <div className="space-y-6">
                                    {[
                                        { t: "Análisis Semanal", d: "Revisamos tus números y te damos consejos prácticos para mejorar." },
                                        { t: "Conciliación de Fiados", d: "Estrategias de cobro efectivas para que tu dinero siempre vuelva." },
                                        { t: "Plan de Crecimiento", d: "Te ayudamos a planear la expansión o mejora de tu local." }
                                    ].map((item, i) => (
                                        <div key={i} className="flex gap-4">
                                            <div className="size-6 bg-primary rounded-full flex-shrink-0 mt-1"></div>
                                            <div>
                                                <p className="text-slate-900 font-bold mb-1">{item.t}</p>
                                                <p className="text-slate-500 text-sm">{item.d}</p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                            <div className="reveal-on-scroll delay-200">
                                <div className="bg-white p-12 rounded-[3rem] border border-slate-200 shadow-xl relative overflow-hidden">
                                    <div className="absolute top-0 right-0 p-8">
                                        <span className="material-symbols-outlined text-primary/20 text-8xl">account_balance_wallet</span>
                                    </div>
                                    <h4 className="text-slate-900 font-black text-2xl mb-6">Cerramos el Ciclo</h4>
                                    <div className="space-y-10 relative z-10">
                                        <div className="flex gap-6 items-center">
                                            <div className="size-14 rounded-2xl bg-slate-900 text-primary flex items-center justify-center font-black italic">V</div>
                                            <div>
                                                <p className="text-slate-400 text-[10px] uppercase font-bold">Paso 1</p>
                                                <p className="text-slate-900 font-bold">Venta Inteligente</p>
                                            </div>
                                        </div>
                                        <div className="flex gap-6 items-center">
                                            <div className="size-14 rounded-2xl bg-slate-900 text-primary flex items-center justify-center font-black italic">G</div>
                                            <div>
                                                <p className="text-slate-400 text-[10px] uppercase font-bold">Paso 2</p>
                                                <p className="text-slate-900 font-bold">Ganancia Neta Real</p>
                                            </div>
                                        </div>
                                        <div className="flex gap-6 items-center">
                                            <div className="size-14 rounded-2xl bg-primary text-slate-900 flex items-center justify-center font-black italic">P</div>
                                            <div>
                                                <p className="text-slate-400 text-[10px] uppercase font-bold">Paso 3</p>
                                                <p className="text-slate-900 font-bold">Patrimonio Familiar</p>
                                            </div>
                                        </div>
                                    </div>
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
