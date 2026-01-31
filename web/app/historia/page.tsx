"use client";
import { useEffect, useRef } from "react";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import Lenis from "lenis";

export default function HistoriaPage() {
    const yearDisplayRef = useRef<HTMLDivElement>(null);
    const containerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        gsap.registerPlugin(ScrollTrigger);

        // CONFIG: Lenis Smooth Scroll
        const lenis = new Lenis({
            duration: 1.2,
            easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t))
        });

        function raf(time: number) {
            lenis.raf(time);
            ScrollTrigger.update();
            requestAnimationFrame(raf);
        }
        requestAnimationFrame(raf);

        // Year Roll Logic
        let currentYear = "1950";
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
            const newYear = section.dataset.year || "1950";
            const bgColor = section.dataset.bgColor || "#ffffff";
            const intro = section.querySelector(".intro");
            const items = section.querySelectorAll(".media-item");

            // ScrollTrigger for each section
            ScrollTrigger.create({
                trigger: section,
                start: "top top",
                end: "+=100%",
                pin: true,
                scrub: true,
                onEnter: () => {
                    animateYearRoll(currentYear, newYear, "up");
                    currentYear = newYear;
                    gsap.to("body", { backgroundColor: bgColor, duration: 0.6 });
                },
                onLeaveBack: () => {
                    const prev = sections[index - 1];
                    const prevYear = prev?.dataset.year || "1950";
                    const prevColor = prev?.dataset.bgColor || "#ffffff";
                    animateYearRoll(currentYear, prevYear, "down");
                    currentYear = prevYear;
                    gsap.to("body", { backgroundColor: prevColor, duration: 0.6 });
                }
            });

            // Text Opacity Animation (Simple word split approximation)
            if (intro) {
                const text = intro.textContent || "";
                intro.innerHTML = text.split(" ").map(word => `<span class="inline-block opacity-10 mr-1">${word}</span>`).join("");
                const words = intro.querySelectorAll("span");

                gsap.to(words, {
                    opacity: 1,
                    stagger: 0.05,
                    scrollTrigger: {
                        trigger: section,
                        start: "top center",
                        end: "bottom center",
                        scrub: true
                    }
                });
            }

            // Media Stack Animation
            items.forEach((item, i) => {
                const element = item as HTMLElement;
                gsap.set(element, {
                    opacity: 0,
                    zIndex: i,
                    rotation: Math.random() * 8 - 4,
                    scale: 0.95
                });

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
            });
        });

        return () => {
            lenis.destroy();
            ScrollTrigger.getAll().forEach(t => t.kill());
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
                            EL BARRIO <br /> SIEMPRE <br /> <span className="text-primary italic">AVANZA.</span>
                        </h1>
                        <div className="w-full h-[60vh] rounded-[3rem] overflow-hidden relative">
                            <img src="/historia/1950.png" className="w-full h-full object-cover" alt="Historia DonTendero" />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent flex items-end p-12">
                                <p className="text-white text-2xl font-bold max-w-xl">Esta es la historia de quienes construyen país desde la esquina.</p>
                            </div>
                        </div>
                    </div>
                </section>

                {/* TIMELINE CONTAINER */}
                <div className="relative">
                    {/* STICKY YEAR DISPLAY */}
                    <div ref={yearDisplayRef} className="year-number sticky top-[15vh] z-50 flex justify-center items-center text-[15vw] pointer-events-none mix-blend-difference text-white font-mono leading-none">
                        <span className="digit inline-block overflow-hidden w-[0.6ch] h-[1em]">1</span>
                        <span className="digit inline-block overflow-hidden w-[0.6ch] h-[1em]">9</span>
                        <span className="digit inline-block overflow-hidden w-[0.6ch] h-[1em]">5</span>
                        <span className="digit inline-block overflow-hidden w-[0.6ch] h-[1em]">0</span>
                    </div>

                    {/* SECTIONS */}
                    <section className="year-section h-screen flex items-center px-6" data-year="1950" data-bg-color="#ffffff">
                        <div className="w-full max-w-[1200px] mx-auto grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
                            <div className="order-2 md:order-1">
                                <h2 className="text-4xl md:text-6xl font-black text-slate-900 mb-6">El Origen</h2>
                                <p className="intro text-xl text-slate-500 leading-relaxed max-w-md">
                                    En los años 50, la tienda de barrio nació como el corazón de la comunidad. Eran las pulperías donde el tendero conocía a cada vecino por su nombre y la confianza era la única moneda necesaria.
                                </p>
                            </div>
                            <div className="media-stack relative h-[60vh] flex items-center justify-center order-1 md:order-2">
                                <img className="media-item absolute max-h-full object-contain rounded-2xl shadow-2xl" src="/historia/1950.png" alt="1950" />
                            </div>
                        </div>
                    </section>

                    <section className="year-section h-screen flex items-center px-6" data-year="1985" data-bg-color="#f8fafc">
                        <div className="w-full max-w-[1200px] mx-auto grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
                            <div className="order-2 md:order-1">
                                <h2 className="text-4xl md:text-6xl font-black text-slate-900 mb-6">La Era del Cuaderno</h2>
                                <p className="intro text-xl text-slate-500 leading-relaxed max-w-md">
                                    Llegó el "Fíeme, vecino". El cuaderno de fiados se convirtió en el libro contable con más alma del mundo. Sin bancos, sin intereses, solo la palabra de honor de un barrio que se apoyaba entre sí.
                                </p>
                            </div>
                            <div className="media-stack relative h-[60vh] flex items-center justify-center order-1 md:order-2">
                                <img className="media-item absolute max-h-full object-contain rounded-2xl shadow-2xl" src="/historia/1985.png" alt="1985" />
                                <div className="media-item absolute bg-primary p-6 rounded-2xl transform rotate-3 shadow-xl text-slate-900 font-bold">
                                    "La palabra valía más que el papel"
                                </div>
                            </div>
                        </div>
                    </section>

                    <section className="year-section h-screen flex items-center px-6" data-year="2010" data-bg-color="#f1f5f9">
                        <div className="w-full max-w-[1200px] mx-auto grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
                            <div className="order-2 md:order-1">
                                <h2 className="text-4xl md:text-6xl font-black text-slate-900 mb-6">El Desafío Digital</h2>
                                <p className="intro text-xl text-slate-500 leading-relaxed max-w-md">
                                    Aparecieron las grandes superficies y los supermercados de cadena. El negocio de barrio se enfrentó a la presión de la tecnología. Muchos intentaron usar Excel, pero la esencia se perdía entre fórmulas frías.
                                </p>
                            </div>
                            <div className="media-stack relative h-[60vh] flex items-center justify-center order-1 md:order-2">
                                <img className="media-item absolute max-h-full object-contain rounded-2xl shadow-2xl" src="/historia/2010.png" alt="2010" />
                            </div>
                        </div>
                    </section>

                    <section className="year-section h-screen flex items-center px-6" data-year="2025" data-bg-color="#102219">
                        <div className="w-full max-w-[1200px] mx-auto grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
                            <div className="order-2 md:order-1">
                                <h2 className="text-4xl md:text-6xl font-black text-primary mb-6 italic">La Revolución</h2>
                                <p className="intro text-xl text-emerald-100/60 leading-relaxed max-w-md">
                                    Nace DonTendero. Devolvemos el poder al empresario de barrio. Digitalizamos el cuaderno sin quitarle el alma. Ahora el negocio es inteligente, el patrimonio crece y el tendero vuelve a ser el rey de su economía.
                                </p>
                                <div className="mt-8">
                                    <a href="https://dontendero.com/register" className="inline-block py-4 px-8 bg-primary text-slate-900 rounded-xl font-black">Únete a la historia</a>
                                </div>
                            </div>
                            <div className="media-stack relative h-[60vh] flex items-center justify-center order-1 md:order-2">
                                <img className="media-item absolute max-h-full object-contain rounded-2xl shadow-2xl" src="/historia/2025.png" alt="2025" />
                                <div className="media-item absolute inset-0 bg-primary/20 blur-3xl -z-10 rounded-full"></div>
                            </div>
                        </div>
                    </section>
                </div>

                <section className="h-screen flex items-center justify-center text-center px-6">
                    <div className="max-w-4xl reveal-on-scroll">
                        <h2 className="text-5xl md:text-8xl font-black text-slate-900 mb-8 leading-none">Tú eres el <br /> próximo paso.</h2>
                        <p className="text-2xl text-slate-400 mb-12">No dejes que tu historia se quede en el papel. Hagamos tu negocio eterno.</p>
                        <a href="/planes" className="py-6 px-12 bg-slate-900 text-white rounded-2xl text-2xl font-black hover:scale-105 transition-transform inline-block">Ver mi futuro</a>
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
                  width: 0.6ch;
                  text-align: center;
                }
                .media-item {
                    transition: transform 0.3s ease;
                }
            `}</style>
        </div>
    );
}
