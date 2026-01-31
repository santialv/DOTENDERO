"use client";
import { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import { InstallPrompt } from "@/components/ui/InstallPrompt";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";

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
            La Caja Registradora que <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-emerald-400">
              se paga sola
            </span>
          </h1>

          <p className="text-gray-400 text-lg md:text-2xl font-medium leading-relaxed max-w-[700px] mb-12 reveal-on-scroll delay-100">
            Digitaliza tu tienda de barrio. Gestiona inventario, fiados y ganancias desde tu celular con la tecnología más avanzada del mercado.
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
                <h3 className="text-primary font-bold tracking-widest uppercase text-xs mb-4">Nuestra Razón de Ser</h3>
                <h2 className="text-4xl md:text-6xl font-black text-white mb-8 leading-tight">No somos otra <br /><span className="text-primary italic">app de ventas</span></h2>
                <div className="space-y-6 text-gray-400 text-lg leading-relaxed">
                  <p>
                    La mayoría de las aplicaciones fueron hechas por ingenieros para empresas grandes. Nosotros nacimos viendo cómo el <span className="text-white font-bold">cuaderno de fiados</span> se mojaba, se perdía o simplemente no sumaba bien.
                  </p>
                  <p>
                    Existimos para que el tendero no sea el último en enterarse cuánto ganó al mes. Existimos para <span className="text-white font-bold">proteger tu patrimonio</span>, no para complicarte la vida con tecnología difícil.
                  </p>
                  <div className="pt-4 flex items-center gap-4">
                    <div className="size-12 rounded-full bg-primary/20 flex items-center justify-center text-primary">
                      <span className="material-symbols-outlined">favorite</span>
                    </div>
                    <div>
                      <p className="text-white font-bold text-sm">Tecnología con Corazón</p>
                      <p className="text-xs">Diseñado para ayudar, no para extraer.</p>
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
            <p className="text-xl md:text-3xl font-bold opacity-80 mb-12">Miles de tenderos en Colombia están digitalizando sus negocios hoy.</p>
            <Link href="/planes" className="inline-block py-5 px-12 bg-background-dark text-white rounded-2xl text-2xl font-black hover:scale-105 transition-transform shadow-2xl">Ver Planes y Precios</Link>
          </div>
        </section>
      </main>

      <Footer dark={true} />

      {/* WhatsApp Floating Button */}
      <a
        href="https://wa.me/573107146415?text=Hola!%20Quiero%20saber%20más%20de%20DonTendero"
        target="_blank"
        rel="noopener noreferrer"
        className="fixed bottom-6 right-6 z-[150] size-16 bg-[#25D366] rounded-full flex items-center justify-center shadow-[0_0_40px_rgba(37,211,102,0.4)] hover:scale-110 transition-transform active:scale-95 group"
      >
        <svg className="size-10 fill-white" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
          <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z" />
        </svg>
      </a>

      <InstallPrompt />
    </div>
  );
}

