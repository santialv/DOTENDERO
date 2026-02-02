"use client";
import { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import { InstallPrompt } from "@/components/ui/InstallPrompt";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { DonTenderoChat } from "@/components/chat/DonTenderoChat";

export default function Home() {
  const [showCelebration, setShowCelebration] = useState(false);
  const [activeCategory, setActiveCategory] = useState("Ventas");

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
    <div className="flex flex-col min-h-screen bg-background-dark text-white font-display relative overflow-hidden">
      {/* Background Decorative Elements */}
      <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-primary/10 blur-[120px] rounded-full -translate-y-1/2 pointer-events-none"></div>
      <div className="absolute bottom-1/4 right-0 w-[400px] h-[400px] bg-primary/5 blur-[100px] rounded-full pointer-events-none"></div>

      <Header dark={true} />

      <main className="flex-1 flex flex-col items-center w-full">
        {/* HERO SECTION */}
        <section className="w-full max-w-[1200px] px-6 pt-32 pb-20 flex flex-col items-center text-center">
          <div className="mb-8 inline-flex items-center gap-2 rounded-full border border-[#32674d] bg-[#193326] px-4 py-2 shadow-xl shadow-primary/5 reveal-on-scroll">
            <span className="flex size-2 rounded-full bg-primary animate-pulse"></span>
            <span className="text-xs font-black uppercase tracking-widest text-primary">
              Hecho en Colombia 🇨🇴
            </span>
          </div>

          <h1 className="text-white text-5xl md:text-7xl lg:text-8xl font-black leading-[1] tracking-tight max-w-[1000px] mb-8 glow-text reveal-on-scroll">
            No somos un software. <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-emerald-400">
              Somos justicia tecnológica.
            </span>
          </h1>

          <p className="text-gray-400 text-lg md:text-2xl font-medium leading-relaxed max-w-[850px] mb-12 reveal-on-scroll delay-100">
            Llevamos la herramienta más avanzada del mercado a quienes el sistema <span className="text-white font-black">siempre ha dejado atrás</span>. Porque democratizar la innovación de punta no es una opción, es nuestra obligación con cada rincón de nuestro país.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 w-full max-w-md justify-center reveal-on-scroll delay-200">
            <a
              href="https://dontendero.com/register"
              className="flex items-center justify-center rounded-2xl h-16 px-10 bg-primary hover:bg-[#0fd672] text-[#11221a] text-xl font-black transition-all transform hover:scale-105 shadow-[0_0_30px_rgba(19,236,128,0.3)] active:scale-95"
            >
              Comenzar Gratis
            </a>
            <a
              href="#demo"
              className="flex items-center justify-center rounded-2xl h-16 px-10 bg-white/5 border border-white/10 text-white text-xl font-bold hover:bg-white/10 transition-all"
            >
              Ver Demo
            </a>
          </div>

          {/* PURPOSE SECTION: Why we are different */}
          <section className="w-full max-w-[1200px] mt-32 px-6 py-24 bg-white/5 rounded-[4rem] border border-white/10 reveal-on-scroll">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-16 items-center text-left">
              <div>
                <h3 className="text-primary font-bold tracking-widest uppercase text-xs mb-4">Nuestra Raíz</h3>
                <h2 className="text-4xl md:text-6xl font-black text-white mb-8 leading-tight">Venimos de abajo, <br /><span className="text-primary italic">como tú</span></h2>
                <div className="space-y-6 text-gray-400 text-lg leading-relaxed">
                  <p>
                    Mientras otros diseñan sistemas en oficinas de lujo para empresas gigantes, DonTendero nació en la esquina. Crecimos viendo el esfuerzo de quienes levantan la persiana antes de que salga el sol y entendemos el valor de un <span className="text-white font-bold">cuaderno de fiados</span> manchado de café.
                  </p>
                  <p>
                    Existimos porque estamos cansados de ver al tendero ser el último en enterarse cuánto ganó. No somos una aplicación más; somos un escudo para <span className="text-white font-bold">proteger tu patrimonio</span> y el futuro de tu familia.
                  </p>
                  <p className="text-primary font-black italic text-2xl mt-8">
                    "Porque en este barrio sabemos que los últimos seremos los primeros."
                  </p>
                  <div className="pt-4 flex items-center gap-4">
                    <div className="size-12 rounded-full bg-primary/20 flex items-center justify-center text-primary">
                      <span className="material-symbols-outlined">volunteer_activism</span>
                    </div>
                    <div>
                      <p className="text-white font-bold text-sm">Tecnología con Alma</p>
                      <p className="text-xs">Hecha por quienes saben lo que cuesta cada peso.</p>
                    </div>
                  </div>
                </div>
              </div>
              <div className="relative group">
                <div className="absolute -inset-4 bg-primary/10 rounded-[3rem] blur-2xl group-hover:bg-primary/20 transition-all"></div>
                <div className="relative bg-[#193326] p-8 rounded-[3rem] border border-primary/20 shadow-2xl">
                  <h4 className="text-white font-bold text-xl mb-6 flex items-center gap-2">
                    <span className="material-symbols-outlined text-primary">psychology</span>
                    Lo que nos hace diferentes:
                  </h4>
                  <ul className="space-y-6">
                    {[
                      { t: "Foco en el Fiado", d: "Sabemos que el fiado es el corazón del barrio. Lo digitalizamos con respeto." },
                      { t: "Cero Curva de Aprendizaje", d: "Si sabes mandar un audio de WhatsApp, ya sabes usar DonTendero." },
                      { t: "Caja que se Paga Sola", d: "Nuestro objetivo es que recuperes más de lo que pagas en suscripción." }
                    ].map((item, i) => (
                      <li key={i} className="flex gap-4">
                        <div className="size-6 rounded-full bg-primary flex-shrink-0 flex items-center justify-center text-[10px] text-background-dark font-black">{i + 1}</div>
                        <div>
                          <p className="text-white font-bold text-sm">{item.t}</p>
                          <p className="text-xs text-gray-500">{item.d}</p>
                        </div>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          </section>
        </section>

        {/* FINANCIAL ADVISORY SECTION - Professional Accompaniment */}
        <section className="w-full py-32 bg-white text-slate-900 rounded-[5rem] -mt-10 relative z-10 border-b border-slate-100 reveal-on-scroll">
          <div className="w-full max-w-[1200px] mx-auto px-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-20 items-center">
              <div>
                <h3 className="text-primary font-bold tracking-widest uppercase text-xs mb-4">Acompañamiento 360</h3>
                <h2 className="text-4xl md:text-6xl font-black text-slate-900 mb-8 leading-tight tracking-tighter">
                  Cerramos tu <span className="text-primary italic">ciclo financiero</span>
                </h2>
                <div className="space-y-8 text-slate-600 text-lg leading-relaxed">
                  <p>
                    Para nosotros, entregarte una aplicación es solo el comienzo. DonTendero es la única plataforma en Colombia que te ofrece un **acompañamiento real** en todas las etapas de tu negocio.
                  </p>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-8 mt-12">
                    {[
                      { icon: "analytics", t: "Análisis Personalizado", d: "Interpretamos tus números por ti. Te decimos dónde estás ganando y dónde estás perdiendo." },
                      { icon: "account_balance", t: "Gestión de Activos", d: "Te ayudamos a convertir tus ganancias en crecimiento real para tu negocio." },
                      { icon: "trending_up", t: "Proyecciones de Venta", d: "Planifica tus compras con datos reales, no con presentimientos." },
                      { icon: "shield_person", t: "Seguridad Patrimonial", d: "Asesoría para que tu negocio sea legal, sólido y rentable a largo plazo." }
                    ].map((item, i) => (
                      <div key={i} className="flex flex-col gap-3">
                        <div className="size-10 rounded-xl bg-slate-900 flex items-center justify-center text-primary group-hover:scale-110 transition-transform">
                          <span className="material-symbols-outlined text-xl">{item.icon}</span>
                        </div>
                        <h4 className="text-slate-900 font-bold text-sm tracking-tight">{item.t}</h4>
                        <p className="text-xs text-slate-500 leading-snug">{item.d}</p>
                      </div>
                    ))}
                  </div>

                  <p className="pt-8 border-t border-slate-100 font-medium text-slate-400 italic">
                    "No eres solo un usuario; eres un socio. Nuestro éxito depende de que tu patrimonio crezca cada mes."
                  </p>
                </div>
              </div>

              <div className="relative">
                <div className="absolute -inset-10 bg-primary/5 blur-[120px] rounded-full pointer-events-none"></div>
                <div className="relative bg-slate-50 p-12 rounded-[4rem] border border-slate-200">
                  <h4 className="text-slate-900 font-black text-2xl mb-8 flex items-center gap-3">
                    <span className="material-symbols-outlined text-primary text-3xl">psychology_alt</span>
                    Asesoría que transforma
                  </h4>
                  <div className="space-y-8">
                    <div className="flex gap-6 items-start">
                      <div className="size-12 rounded-full border-2 border-primary flex items-center justify-center font-black text-slate-900 flex-shrink-0 italic">1</div>
                      <div>
                        <p className="font-bold text-slate-900 text-lg mb-1">Diagnóstico Inicial</p>
                        <p className="text-sm text-slate-500">Evaluamos la salud actual de tu inventario y tus deudas por cobrar.</p>
                      </div>
                    </div>
                    <div className="flex gap-6 items-start">
                      <div className="size-12 rounded-full border-2 border-primary flex items-center justify-center font-black text-slate-900 flex-shrink-0 italic">2</div>
                      <div>
                        <p className="font-bold text-slate-900 text-lg mb-1">Optimización de Caja</p>
                        <p className="text-sm text-slate-500">Implementamos estrategias para mejorar el flujo de efectivo diario.</p>
                      </div>
                    </div>
                    <div className="flex gap-6 items-start">
                      <div className="size-12 rounded-full border-2 border-primary flex items-center justify-center font-black text-slate-900 flex-shrink-0 italic">3</div>
                      <div>
                        <p className="font-bold text-slate-900 text-lg mb-1">Cierre de Ciclo</p>
                        <p className="text-sm text-slate-500">Revisión mensual de metas para asegurar que el patrimonio familiar aumentó.</p>
                      </div>
                    </div>
                  </div>

                  <div className="mt-12 p-6 bg-slate-900 rounded-3xl text-center">
                    <p className="text-primary font-bold text-sm mb-2">¿Necesitas asesoría ya?</p>
                    <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
                      <a href="https://wa.me/573107146415" className="text-white font-black text-lg hover:underline underline-offset-4 decoration-primary">Hablar con un experto →</a>
                      <Link href="/asesoria" className="text-slate-400 font-bold text-sm hover:text-white transition-colors">Ver detalles de asesoría</Link>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* DEMO / PHONE MOCKUP SECTION */}
        <section id="demo" className="w-full max-w-[1200px] px-6 py-24 flex justify-center reveal-on-scroll">
          <div className="relative w-full max-w-[900px] aspect-[16/9] rounded-[3rem] overflow-hidden border border-[#234836] bg-[#11221a]/50 backdrop-blur-3xl shadow-2xl flex flex-col md:flex-row">
            {/* Minimal Mobile UI Mockup inside */}
            <div className="w-full md:w-[320px] h-full border-r border-[#234836] bg-[#11221a] flex flex-col">
              <div className="p-6 border-b border-[#234836] flex justify-between items-center">
                <span className="text-white font-black">DonTendero</span>
                <span className="material-symbols-outlined text-primary">notifications</span>
              </div>
              <div className="flex-1 p-4 space-y-4">
                <div className="h-24 bg-[#193326] rounded-2xl p-4 flex flex-col justify-end">
                  <p className="text-[10px] text-primary font-bold uppercase tracking-wider">Ventas de hoy</p>
                  <p className="text-2xl text-white font-black">$450.000</p>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div className="h-16 bg-[#193326] rounded-xl flex items-center justify-center"><span className="material-symbols-outlined text-white">add_shopping_cart</span></div>
                  <div className="h-16 bg-[#193326] rounded-xl flex items-center justify-center"><span className="material-symbols-outlined text-white">menu_book</span></div>
                </div>
              </div>
            </div>

            <div className="hidden md:flex flex-1 flex-col items-center justify-center p-12 text-center">
              <h3 className="text-3xl font-black text-white mb-6">Tan fácil como usar WhatsApp</h3>
              <p className="text-gray-400 text-lg leading-relaxed mb-8">No necesitas cursos. DonTendero está diseñado para ser usado con una mano mientras atiendes a un cliente con la otra.</p>
              <div className="flex gap-4">
                <button className="px-6 py-3 rounded-xl bg-primary text-background-dark font-black">Probar POS</button>
                <button className="px-6 py-3 rounded-xl border border-primary/30 text-primary font-bold">Ver Reportes</button>
              </div>
            </div>
          </div>
        </section>

        {/* REINFORCEMENT SECTION */}
        <section className="w-full py-24 bg-primary text-background-dark text-center">
          <div className="w-full max-w-[800px] mx-auto px-6">
            <h2 className="text-4xl md:text-6xl font-black mb-8 leading-none tracking-tighter">¿Listo para dejar de <br />regalar plata?</h2>
            <p className="text-xl md:text-3xl font-bold opacity-80 mb-12">Miles de empresarios en Colombia están digitalizando sus negocios hoy.</p>
            <Link href="/planes" className="inline-block py-5 px-12 bg-background-dark text-white rounded-2xl text-2xl font-black hover:scale-105 transition-transform shadow-2xl">Ver Planes y Precios</Link>
          </div>
        </section>
      </main>

      <Footer dark={true} />

      {/* Chatbot Floating Button */}
      <div className="fixed bottom-6 right-6 z-[150]">
        <DonTenderoChat />
      </div>

      <InstallPrompt />
    </div >
  );
}

