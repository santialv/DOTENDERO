"use client";
import { useEffect, useRef } from "react";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { MusicPlayer } from "@/components/MusicPlayer";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import Lenis from "lenis";

export default function HistoriaPage() {
    const yearDisplayRef = useRef<HTMLDivElement>(null);
    const containerRef = useRef<HTMLDivElement>(null);
    const timelineRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        gsap.registerPlugin(ScrollTrigger);

        const isMobile = window.innerWidth < 768;

        // CONFIG: Lenis Smooth Scroll - Only for desktop to save resources on mobile
        let lenis: any = null;
        if (!isMobile) {
            lenis = new Lenis({
                duration: 1.2,
                easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t))
            });

            function raf(time: number) {
                lenis.raf(time);
                ScrollTrigger.update();
                requestAnimationFrame(raf);
            }
            requestAnimationFrame(raf);
        }

        // AUTO-SCROLL to first section on load
        const handleInitialScroll = () => {
            if (timelineRef.current) {
                if (lenis) {
                    lenis.scrollTo(timelineRef.current, { offset: 0, duration: 1.5 });
                } else {
                    timelineRef.current.scrollIntoView({ behavior: 'smooth' });
                }
            }
        };

        const scrollTimeout = setTimeout(handleInitialScroll, 800);
        window.addEventListener('load', handleInitialScroll);

        // Year Roll Logic
        let currentYear = "1920";
        const digits = yearDisplayRef.current?.querySelectorAll(".digit");

        function animateYearRoll(from: string, to: string, direction = "up") {
            const fromStr = from.padStart(4, "0");
            const toStr = to.padStart(4, "0");

            digits?.forEach((el, i) => {
                const oldDigit = fromStr[i];
                const newDigit = toStr[i];

                if (oldDigit !== newDigit) {
                    const delay = (3 - i) * 0.1;

                    gsap.to(el, {
                        yPercent: -100,
                        opacity: 0,
                        duration: 0.2,
                        delay,
                        ease: "power2.in",
                        onComplete: () => {
                            el.textContent = newDigit;
                            gsap.set(el, { yPercent: 100, opacity: 0 });

                            gsap.to(el, {
                                yPercent: 0,
                                opacity: 1,
                                duration: 0.3,
                                delay: 0.05,
                                ease: "power2.out"
                            });
                        }
                    });
                }
            });
        }

        // Section Animations
        const sections = gsap.utils.toArray(".year-section") as HTMLElement[];
        sections.forEach((section, index) => {
            const newYear = section.dataset.year || "1920";
            const bgColor = section.dataset.bgColor || "#ffffff";
            const intro = section.querySelector(".intro");
            const items = section.querySelectorAll(".media-item");

            // ScrollTrigger for each section
            ScrollTrigger.create({
                trigger: section,
                start: "top top",
                end: "+=100%",
                pin: !isMobile, // Disable pinning on mobile for better performance
                scrub: true,
                onEnter: () => {
                    animateYearRoll(currentYear, newYear, "up");
                    currentYear = newYear;
                    gsap.to("body", { backgroundColor: bgColor, duration: 0.6 });
                },
                onLeaveBack: () => {
                    const prev = sections[index - 1];
                    const prevYear = prev?.dataset.year || "1920";
                    const prevColor = prev?.dataset.bgColor || "#ffffff";
                    animateYearRoll(currentYear, prevYear, "down");
                    currentYear = prevYear;
                    gsap.to("body", { backgroundColor: prevColor, duration: 0.6 });
                }
            });

            // Text reveal animation - disable or simplify on mobile
            if (intro && !isMobile) {
                const text = intro.textContent || "";
                intro.innerHTML = text.split(" ").map(word =>
                    `<span class="opacity-10 transition-opacity duration-300 pointer-events-none">${word}</span>`
                ).join(" ");

                const words = intro.querySelectorAll("span");

                gsap.to(words, {
                    opacity: 1,
                    stagger: 0.02,
                    scrollTrigger: {
                        trigger: section,
                        start: "top center",
                        end: "bottom center",
                        scrub: true
                    }
                });
            }

            // Media items animation
            items.forEach((item, i) => {
                const element = item as HTMLElement;
                gsap.set(element, {
                    opacity: isMobile ? 1 : 0,
                    zIndex: i,
                    rotation: Math.random() * 8 - 4,
                    scale: isMobile ? 1 : 0.95
                });

                if (!isMobile) {
                    gsap.to(element, {
                        opacity: 1,
                        scale: 1,
                        zIndex: items.length + i,
                        scrollTrigger: {
                            trigger: section,
                            start: `top+=${i * 15}% center`,
                            end: `top+=${(i + 1) * 15}% center`,
                            scrub: true
                        }
                    });
                }
            });
        });

        return () => {
            if (lenis) lenis.destroy();
            ScrollTrigger.getAll().forEach(t => t.kill());
            clearTimeout(scrollTimeout);
            window.removeEventListener('load', handleInitialScroll);
            gsap.set("body", { clearProps: "backgroundColor" });
        };
    }, []);

    return (
        <div className="min-h-screen transition-colors duration-700" ref={containerRef}>
            <Header dark={false} />

            <main className="pt-32">
                {/* HERO */}
                <section className="max-w-[1200px] mx-auto px-6 pt-20 mb-32">
                    <div className="reveal-on-scroll">
                        <h1 className="text-[12vw] md:text-[8vw] font-black leading-[0.85] tracking-tighter text-slate-900 mb-12">
                            EL LEGADO <br /> DE LA <br /> <span className="text-primary italic">CONFIANZA.</span>
                        </h1>
                        <div className="w-full h-[60vh] rounded-[3rem] overflow-hidden relative shadow-2xl">
                            <img src="/historia/1920.png" className="w-full h-full object-cover" alt="Historia DonTendero" />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent flex items-end p-12">
                                <p className="text-white text-2xl md:text-3xl font-bold max-w-2xl leading-tight">Del trueque a la inteligencia artificial: el comercio que construyó a Colombia.</p>
                            </div>
                        </div>
                    </div>
                </section>

                {/* TIMELINE CONTAINER */}
                <div className="relative" ref={timelineRef}>
                    {/* STICKY YEAR DISPLAY - Adjusted for mobile visibility */}
                    <div ref={yearDisplayRef} className="year-number sticky top-[15vh] md:top-[25vh] z-30 flex justify-center items-center text-[25vw] md:text-[12vw] pointer-events-none mix-blend-difference text-white font-mono font-black leading-none opacity-20 md:opacity-40">
                        <span className="digit inline-block overflow-hidden w-[1ch] text-center">1</span>
                        <span className="digit inline-block overflow-hidden w-[1ch] text-center">9</span>
                        <span className="digit inline-block overflow-hidden w-[1ch] text-center">2</span>
                        <span className="digit inline-block overflow-hidden w-[1ch] text-center">0</span>
                    </div>

                    {/* SECTIONS */}
                    <section className="year-section min-h-screen flex items-center px-6 relative py-20" data-year="1920" data-bg-color="#ffffff">
                        <div className="w-full max-w-[1200px] mx-auto grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
                            <div className="flex flex-col justify-center items-start z-40">
                                <h2 className="text-4xl md:text-6xl font-black text-slate-900 mb-6 leading-tight">El Trueque</h2>
                                <p className="intro text-lg md:text-2xl text-slate-500 leading-relaxed max-w-lg font-medium break-words whitespace-normal">
                                    A inicios del siglo XX, el comercio era un intercambio de manos. Cafeteros y artesanos se reunían en plazas para cambiar lo que producían. La contabilidad no estaba en libros, sino en la memoria de un acuerdo mutuo.
                                </p>
                            </div>
                            <div className="media-stack relative h-[50vh] md:h-[70vh] flex items-center justify-center">
                                <img className="media-item absolute max-h-[80%] w-auto object-contain rounded-[2rem] shadow-2xl border-4 border-white" src="/historia/1920.png" alt="1920" />
                            </div>
                        </div>
                    </section>

                    <section className="year-section min-h-screen flex items-center px-6 relative py-20" data-year="1950" data-bg-color="#fcfdfb">
                        <div className="w-full max-w-[1200px] mx-auto grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
                            <div className="flex flex-col justify-center items-start z-40">
                                <h2 className="text-4xl md:text-6xl font-black text-slate-900 mb-6 leading-tight">La Institución</h2>
                                <p className="intro text-lg md:text-2xl text-slate-500 leading-relaxed max-w-lg font-medium break-words whitespace-normal">
                                    Las pulperías se transforman en las primeras tiendas de barrio. El tendero se convierte en el guardián de la despensa local. Los precios comienzan a fijarse y la confianza se institucionaliza en la esquina.
                                </p>
                            </div>
                            <div className="media-stack relative h-[50vh] md:h-[70vh] flex items-center justify-center">
                                <img className="media-item absolute max-h-[80%] w-auto object-contain rounded-[2rem] shadow-2xl border-4 border-white" src="/historia/1950.png" alt="1950" />
                            </div>
                        </div>
                    </section>

                    <section className="year-section min-h-screen flex items-center px-6 relative py-20" data-year="1970" data-bg-color="#f8fafc">
                        <div className="w-full max-w-[1200px] mx-auto grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
                            <div className="flex flex-col justify-center items-start z-40">
                                <h2 className="text-4xl md:text-6xl font-black text-slate-900 mb-6 leading-tight">Libros y Cálculos</h2>
                                <p className="intro text-lg md:text-2xl text-slate-500 leading-relaxed max-w-lg font-medium break-words whitespace-normal">
                                    Nacen los grandes libros contables. El registro formal de entradas y salidas llega al mostrador. Se introducen las calculadoras mecánicas, dando paso a una gestión del negocio mucho más rigurosa y técnica.
                                </p>
                            </div>
                            <div className="media-stack relative h-[50vh] md:h-[70vh] flex items-center justify-center">
                                <img className="media-item absolute max-h-[80%] w-auto object-contain rounded-[2rem] shadow-2xl border-4 border-white" src="/historia/1970.png" alt="1970" />
                                <div className="media-item absolute bg-emerald-500 px-8 py-4 rounded-2xl transform rotate-3 shadow-2xl text-white font-black text-xl uppercase tracking-tighter">
                                    "Cada centavo cuenta"
                                </div>
                            </div>
                        </div>
                    </section>

                    <section className="year-section min-h-screen flex items-center px-6 relative py-20" data-year="2010" data-bg-color="#f1f5f9">
                        <div className="w-full max-w-[1200px] mx-auto grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
                            <div className="flex flex-col justify-center items-start z-40">
                                <h2 className="text-4xl md:text-6xl font-black text-slate-900 mb-6 leading-tight">La Gran Competencia</h2>
                                <p className="intro text-lg md:text-2xl text-slate-500 leading-relaxed max-w-lg font-medium break-words whitespace-normal">
                                    Las cadenas masivas amenazan la tienda tradicional. Muchos intentan digitalizarse con Excel, pero las herramientas son frías y complejas. El negocio de barrio lucha por no perder su contacto humano ante la eficiencia del algoritmo.
                                </p>
                            </div>
                            <div className="media-stack relative h-[50vh] md:h-[70vh] flex items-center justify-center">
                                <img className="media-item absolute max-h-[80%] w-auto object-contain rounded-[2rem] shadow-2xl border-4 border-white" src="/historia/2010.png" alt="2010" />
                            </div>
                        </div>
                    </section>

                    <section className="year-section min-h-screen flex items-center px-6 relative py-20" data-year="2026" data-bg-color="#102219">
                        <div className="w-full max-w-[1200px] mx-auto grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
                            <div className="flex flex-col justify-center items-start z-40 md:pr-12">
                                <h2 className="text-4xl md:text-6xl font-black text-primary mb-6 italic tracking-tighter">La Nueva Era</h2>
                                <p className="intro text-lg md:text-3xl text-emerald-100/60 leading-relaxed max-w-lg font-bold break-words whitespace-normal">
                                    Nace DonTendero en 2026. Combinamos la calidez humana de 1920 con la potencia tecnológica del futuro. Una contabilidad inteligente que crece contigo, protegiendo tu patrimonio y simplificando tu vida.
                                </p>
                                <div className="mt-8">
                                    <a href="https://dontendero.com/register" className="inline-block py-5 px-10 bg-primary text-slate-900 rounded-2xl font-black shadow-2xl shadow-primary/20 hover:scale-105 transition-transform">
                                        Empieza tu nuevo capítulo
                                    </a>
                                </div>
                            </div>
                            <div className="media-stack relative h-[50vh] md:h-[70vh] flex items-center justify-center transform md:translate-x-12 md:-translate-y-8">
                                <img className="media-item absolute max-h-[80%] w-auto object-contain rounded-[3rem] shadow-2xl border-4 border-primary/30" src="/historia/2025.png" alt="2026" />
                                <div className="media-item absolute inset-0 bg-primary/20 blur-[120px] -z-10 rounded-full"></div>
                            </div>
                        </div>
                    </section>
                </div>

                <MusicPlayer />

                {/* FINAL CALL TO ACTION - Removed white background section to avoid gaps */}
                <section className="pb-32 bg-slate-900 flex items-center justify-center text-center px-6 relative z-10">
                    <div className="max-w-4xl reveal-on-scroll">
                        <h2 className="text-5xl md:text-8xl font-black text-white mb-8 leading-none">Tu historia <br /> sigue aquí.</h2>
                        <p className="text-2xl text-slate-400 mb-12">No dejes que tu historia se quede en el papel. Hagamos tu negocio eterno.</p>
                        <a href="/planes" className="py-6 px-12 bg-primary text-slate-900 rounded-2xl text-2xl font-black hover:scale-105 transition-transform inline-block">Ver mi futuro</a>
                    </div>
                </section>
            </main>

            <Footer dark={true} />

            <style jsx>{`
                .font-mono { font-family: 'JetBrains Mono', monospace; }
                .year-number {
                    line-height: 1;
                    height: 1em;
                }
                .digit {
                  display: inline-block;
                  line-height: 1;
                  width: 1ch;
                  text-align: center;
                }
                .media-item {
                    transition: transform 0.3s ease;
                }
            `}</style>
        </div>
    );
}
