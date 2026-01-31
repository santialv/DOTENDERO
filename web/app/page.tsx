"use client";

import { useState, useEffect, useMemo } from "react";
import { InstallPrompt } from "@/components/ui/InstallPrompt";

const PRODUCTS = [
  {
    id: 1,
    name: "Gaseosa 1.5L",
    price: "$ 4.500",
    category: "Bebidas",
    image: "https://lh3.googleusercontent.com/aida-public/AB6AXuBuFlntC8xugKCNy4OziFRDlU4SuJVHuWTwAX8jvWf9lDBl9MuY9WijA3xavsBaR28pPauBq6W9f3CKQJ6O15ynv2nIPneHnmArr8EHF0k4WcKDHZMCFOE06r2kGXdmKUuvTxZM9cvTXbx1Xj0gvi8ob4VxbyvHQLur2zxnkXA5xzcmhrm-zjKM84MAObjqAo3TfQCpvEcKwdn4yKkK8GkPwasiJMf4jFIfoc4-Qk97GMl-Jy619JfUitJ2BpJ6VBM2qHNlSN60ECk"
  },
  {
    id: 2,
    name: "Arroz 500g",
    price: "$ 2.200",
    category: "Granos",
    image: "https://lh3.googleusercontent.com/aida-public/AB6AXuD-ov9z1CQR3QPIID58PSAGsBKFnFDZxnocu6IwiSQAt8HirQy44VEFATWCNGzZ1NSuIbDeuG5pKKDT6L0G6Sus8Zs3BrkJl6nkNkH-qvlcOmno1ErgqkUXINN5cPq8i24s6KbZ-nf3F0yUvwL7IKN8JAJoPitD3nkK2zroJGp05gjzogDSu0hWpOuCJV2PRnO9tGPvayozXerFPN5zlC8qz85810_Gxamc9KT53o8zbMEebIfn2uMhfgqBhph0ltI1liVCxDxnW2M"
  },
  {
    id: 3,
    name: "Leche Entera",
    price: "$ 3.800",
    category: "Lácteos",
    image: "https://lh3.googleusercontent.com/aida-public/AB6AXuAbamM-aXj8bz1EW4FbendDA68lhwULNL_Cy0zZkEGLKlRbOp3eTUfvSXUchSTw3OdIQ2JxIboeVWs1foUbEeEnRofoM5Vv8eEwFL7bHQZFWyoqxUHmnVqTzI-XY0P-mpDVcC1quazrlVDARp2NEwE0gbJnZW-ng0VhdulwidR2PS1Ns3IFY_5sDrlxDsiLABdanPK7zwM9hnfRZRafEouKbGKYiUfPNUbzCtX159Qwe-s1c7EQPSR_FvQ8j1GtIw1BXKs5h2mjH4Y"
  },
  {
    id: 4,
    name: "Pan Tajado",
    price: "$ 5.000",
    category: "Granos",
    image: "https://lh3.googleusercontent.com/aida-public/AB6AXuAAq7RNrubFO2J1u_ZxMcB_uEaWRVKgTaWMDLMQE21bTFaohlz6qgM-TbQxNNEe5kHU3tw1Tbzx6c6EpLe9OXtA83zD23vsRT0Vpd8klmMHZQYMLDGs5iwIoRJrrTVYIqMJxi_wT4hFSZJ5232pVfwu4yqIai9g5Mc5Fy9dY0f5tCpHOoZnw65lrT4M59e8hjNNeoQkXsaK3kCECxSA1Ccq2yb7u3j7786Dy0VXcleiBHH0Tv-wggR8zYi_pgk3ZGUqZZa7EfAkDP0"
  },
];

export default function Home() {
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [activeCategory, setActiveCategory] = useState("Todos");
  const [showCelebration, setShowCelebration] = useState(false);
  const [isInvestorModalOpen, setIsInvestorModalOpen] = useState(false);
  const [desktopActiveTab, setDesktopActiveTab] = useState("Ventas");

  const filteredProducts = useMemo(() => {
    if (activeCategory === "Todos") return PRODUCTS;
    return PRODUCTS.filter((p) => p.category === activeCategory);
  }, [activeCategory]);

  useEffect(() => {
    const updateMousePosition = (ev: MouseEvent) => {
      setMousePosition({ x: ev.clientX, y: ev.clientY });
    };
    window.addEventListener("mousemove", updateMousePosition);
    return () => {
      window.removeEventListener("mousemove", updateMousePosition);
    };
  }, []);
  return (
    <div className="relative flex min-h-screen w-full flex-col bg-background-light dark:bg-background-dark font-display overflow-x-hidden selection:bg-primary selection:text-background-dark">
      <div className="fixed inset-0 z-0 pointer-events-none">
        <div
          className="absolute inset-0 transition-opacity duration-300"
          style={{
            background: `radial-gradient(600px circle at ${mousePosition.x}px ${mousePosition.y}px, rgba(19, 236, 128, 0.15), transparent 40%)`,
          }}
        ></div>
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-[1000px] h-[500px] bg-primary/10 blur-[120px] rounded-full opacity-50"></div>
      </div>
      <div className="relative z-10 flex flex-col h-full grow">
        <header className="w-full flex justify-center sticky top-0 z-50 backdrop-blur-md bg-background-dark/80 border-b border-[#234836]">
          <div className="w-full max-w-[1200px] px-6 py-4 flex items-center justify-between">
            <div className="flex items-center gap-3 text-white cursor-pointer select-none">
              <div className="size-10 flex items-center justify-center">
                <img src="/icon.png" alt="DonTendero Icon" className="w-full h-full object-contain rounded-lg" />
              </div>
              <h2 className="text-white text-xl font-bold tracking-tight">DonTendero</h2>
            </div>

            <nav className="hidden lg:flex items-center gap-8 mx-8">
              <a href="#beneficios" className="text-gray-400 hover:text-primary text-sm font-medium transition-colors">Beneficios</a>
              <a href="#como-funciona" className="text-gray-400 hover:text-primary text-sm font-medium transition-colors">Cómo funciona</a>
              <a href="#planes" className="text-gray-400 hover:text-primary text-sm font-medium transition-colors">Planes</a>
            </nav>

            <div className="flex gap-3">
              <button
                onClick={() => setIsInvestorModalOpen(true)}
                className="flex items-center justify-center rounded-full h-10 px-4 sm:px-6 bg-transparent text-primary text-xs sm:text-sm font-bold border border-primary/50 hover:bg-primary/10 transition-colors"
                type="button"
              >
                <span className="truncate">Quiero ser inversor</span>
              </button>
              <button
                className="hidden md:flex items-center justify-center rounded-full h-10 px-4 sm:px-6 bg-white/10 text-white text-xs sm:text-sm font-bold border border-white/20 hover:bg-white/20 transition-colors"
                onClick={() => {
                  // This will work if the browser hasn't shown the prompt automatically yet
                  // but mostly it's here to fulfill the user's request of having the option visible.
                  window.dispatchEvent(new Event('trigger-install-prompt'));
                }}
              >
                <span className="material-symbols-outlined text-lg mr-2">download</span>
                <span className="truncate">Descargar App</span>
              </button>
              <a
                href="https://dontendero.com/login"
                className="flex items-center justify-center overflow-hidden rounded-full h-10 px-4 sm:px-6 bg-[#234836] text-white text-xs sm:text-sm font-bold border border-[#234836] hover:bg-[#1e3d2f] transition-colors"
              >
                <span className="truncate">Ingresar</span>
              </a>
            </div>
          </div>
        </header>
        <main className="flex-1 flex flex-col items-center w-full">
          <section className="w-full max-w-[960px] px-4 pt-16 pb-8 md:pt-24 md:pb-12 flex flex-col items-center text-center">
            <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-[#32674d] bg-[#193326] px-3 py-1.5 shadow-lg shadow-primary/5">
              <span className="flex size-2 rounded-full bg-primary animate-pulse"></span>
              <span className="text-xs font-semibold uppercase tracking-wide text-primary">
                Próximamente en Colombia
              </span>
            </div>
            <h1 className="text-white text-4xl md:text-6xl lg:text-7xl font-black leading-[1.1] tracking-tight max-w-[800px] mb-6 glow-text">
              La primera Caja Registradora que{" "}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-emerald-400">
                se paga sola
              </span>
            </h1>
            <h2 className="text-gray-300 text-lg md:text-xl font-normal leading-relaxed max-w-[640px] mb-10">
              Deja de perder plata en tu tienda. Gestiona inventario, fiados y ganancias desde tu celular. Únete a
              la revolución de los tenderos.
            </h2>
            <div className="w-full max-w-[520px] mb-6 relative group">
              <div className="absolute -inset-1 bg-gradient-to-r from-primary/30 to-[#234836] rounded-xl blur opacity-25 group-hover:opacity-50 transition duration-500"></div>
              <div className="flex flex-col sm:flex-row gap-4 w-full justify-center">
                <a
                  href="https://dontendero.com/register"
                  className="flex items-center justify-center rounded-lg h-14 px-8 bg-primary hover:bg-[#0fd672] text-[#11221a] text-lg font-bold transition-all transform active:scale-95 shadow-[0_0_20px_rgba(19,236,128,0.3)] hover:shadow-[0_0_30px_rgba(19,236,128,0.5)] whitespace-nowrap w-full sm:w-auto"
                >
                  <span>Comenzar Gratis</span>
                </a>
              </div>
            </div>
          </section>

          {/* Phone Mockup Section */}
          <section className="w-full max-w-[1200px] px-4 pb-20 flex justify-center">
            <div className="relative w-full max-w-[800px] h-[450px] md:h-[600px] rounded-3xl overflow-visible md:overflow-hidden border-none md:border border-[#234836] bg-transparent md:bg-[#11221a]/50 backdrop-blur-sm shadow-none md:shadow-2xl flex flex-col items-center justify-center group scale-[0.85] sm:scale-100 origin-top sm:origin-center">
              <div
                className="absolute inset-0 bg-[length:40px_40px] opacity-20 hidden md:block"
                style={{
                  backgroundImage:
                    "linear-gradient(to right, #234836 1px, transparent 1px), linear-gradient(to bottom, #234836 1px, transparent 1px)",
                }}
              ></div>
              <div className="relative z-10 w-[320px] h-[650px] bg-black rounded-[40px] border-8 border-gray-800 shadow-2xl translate-y-0 md:translate-y-20 transform transition-transform duration-700 hover:-translate-y-2 md:hover:-translate-y-5">
                {/* Dynamic Island */}
                <div className="absolute top-0 left-1/2 -translate-x-1/2 h-6 w-24 bg-black rounded-b-2xl z-50"></div>

                <div className="w-full h-full bg-[#f6f8f7] dark:bg-[#102219] rounded-[32px] overflow-hidden flex flex-col relative font-sans">
                  {/* Status Bar */}
                  <div className="h-10 w-full flex justify-between items-center px-6 pt-2 text-[10px] font-semibold text-[#0d1b14] dark:text-white z-40 select-none opacity-80">
                    <span>9:41</span>
                    <div className="flex items-center gap-1">
                      <span className="material-symbols-outlined text-[14px]">signal_cellular_alt</span>
                      <span className="material-symbols-outlined text-[14px]">wifi</span>
                      <span className="material-symbols-outlined text-[14px]">battery_full</span>
                    </div>
                  </div>

                  {/* Header Section */}
                  <header className="flex items-center justify-between px-5 pt-2 pb-4">
                    <div className="flex flex-col">
                      <span className="text-[#4c9a73] text-xs font-medium">Mi Tiendita</span>
                      <div className="flex items-center gap-1">
                        <h2 className="text-[#0d1b14] dark:text-white text-xl font-bold tracking-tight">Hola, Don José</h2>
                      </div>
                    </div>
                    <button className="flex items-center justify-center h-8 w-8 rounded-full bg-[#e7f3ed] dark:bg-white/10 text-[#0d1b14] dark:text-white hover:bg-[#13ec80]/20 transition-colors">
                      <span className="material-symbols-outlined text-lg">settings</span>
                    </button>
                  </header>

                  {/* Search Bar */}
                  <div className="px-5 mb-2">
                    <label className="flex flex-col w-full h-12">
                      <div className="flex w-full flex-1 items-stretch rounded-2xl shadow-sm h-full overflow-hidden">
                        <div className="text-[#4c9a73] flex border-none bg-white dark:bg-white/5 items-center justify-center pl-4 rounded-l-2xl border-r-0">
                          <span className="material-symbols-outlined text-lg">search</span>
                        </div>
                        <input
                          className="flex w-full min-w-0 flex-1 resize-none overflow-hidden rounded-2xl text-[#0d1b14] dark:text-white focus:outline-0 focus:ring-0 border-none bg-white dark:bg-white/5 focus:border-none h-full placeholder:text-[#4c9a73]/60 px-3 rounded-l-none border-l-0 pl-2 text-sm font-medium"
                          placeholder="Buscar..."
                          readOnly
                        />
                        <button className="flex items-center justify-center px-3 bg-white dark:bg-white/5 text-[#0d1b14] dark:text-white border-l border-gray-100 dark:border-white/5 hover:bg-gray-50">
                          <span className="material-symbols-outlined text-lg">qr_code_scanner</span>
                        </button>
                      </div>
                    </label>
                  </div>

                  {/* Categories (Chips) */}
                  <div className="flex gap-2 px-5 py-2 overflow-x-auto no-scrollbar w-full mask-linear-fade">
                    <button
                      onClick={() => setActiveCategory("Todos")}
                      className={`flex h-8 shrink-0 items-center justify-center gap-x-1 rounded-full px-4 transition-transform active:scale-95 ${activeCategory === "Todos" ? "bg-[#13ec80] text-[#0d1b14] shadow-sm shadow-[#13ec80]/30" : "bg-white dark:bg-white/5 border border-gray-100 dark:border-white/10 text-[#0d1b14] dark:text-white"}`}
                    >
                      <span className="text-xs font-bold">Todos</span>
                    </button>
                    <button
                      onClick={() => setActiveCategory("Bebidas")}
                      className={`flex h-8 shrink-0 items-center justify-center gap-x-1 rounded-full px-3 transition-transform active:scale-95 ${activeCategory === "Bebidas" ? "bg-[#13ec80] text-[#0d1b14] shadow-sm shadow-[#13ec80]/30" : "bg-white dark:bg-white/5 border border-gray-100 dark:border-white/10 text-[#0d1b14] dark:text-white"}`}
                    >
                      <span className={`material-symbols-outlined text-[16px] ${activeCategory === "Bebidas" ? "text-[#0d1b14]" : "text-[#4c9a73]"}`}>water_drop</span>
                      <p className="text-xs font-semibold">Bebidas</p>
                    </button>
                    <button
                      onClick={() => setActiveCategory("Granos")}
                      className={`flex h-8 shrink-0 items-center justify-center gap-x-1 rounded-full px-3 transition-transform active:scale-95 ${activeCategory === "Granos" ? "bg-[#13ec80] text-[#0d1b14] shadow-sm shadow-[#13ec80]/30" : "bg-white dark:bg-white/5 border border-gray-100 dark:border-white/10 text-[#0d1b14] dark:text-white"}`}
                    >
                      <span className={`material-symbols-outlined text-[16px] ${activeCategory === "Granos" ? "text-[#0d1b14]" : "text-[#4c9a73]"}`}>nutrition</span>
                      <p className="text-xs font-semibold">Granos</p>
                    </button>
                    <button
                      onClick={() => setActiveCategory("Lácteos")}
                      className={`flex h-8 shrink-0 items-center justify-center gap-x-1 rounded-full px-3 transition-transform active:scale-95 ${activeCategory === "Lácteos" ? "bg-[#13ec80] text-[#0d1b14] shadow-sm shadow-[#13ec80]/30" : "bg-white dark:bg-white/5 border border-gray-100 dark:border-white/10 text-[#0d1b14] dark:text-white"}`}
                    >
                      <span className={`material-symbols-outlined text-[16px] ${activeCategory === "Lácteos" ? "text-[#0d1b14]" : "text-[#4c9a73]"}`}>egg_alt</span>
                      <p className="text-xs font-semibold">Lácteos</p>
                    </button>
                  </div>

                  {/* Product Grid */}
                  <div className="flex-1 overflow-y-auto px-5 pt-2 pb-24 relative no-scrollbar">
                    {/* Shadow overlay to simulate scroll cutoff */}
                    <div className="absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-[#f6f8f7] dark:from-[#102219] to-transparent z-10 pointer-events-none"></div>

                    <h3 className="text-[#0d1b14] dark:text-white font-bold text-sm mb-3">Más vendidos</h3>
                    <div className="grid grid-cols-2 gap-3 pb-8">
                      {filteredProducts.map((product) => (
                        <div key={product.id} className="group flex flex-col gap-2 bg-white dark:bg-white/5 p-2 rounded-xl shadow-sm border border-gray-100 dark:border-white/5 active:scale-95 transition-all cursor-pointer">
                          <div className="relative w-full aspect-square bg-[#e7f3ed] dark:bg-white/10 rounded-lg overflow-hidden">
                            <div className="w-full h-full bg-center bg-no-repeat bg-cover" style={{ backgroundImage: `url("${product.image}")` }}></div>
                            <div className="absolute bottom-1 right-1 bg-white/90 dark:bg-black/60 backdrop-blur-sm rounded-full p-1 shadow-sm">
                              <span className="material-symbols-outlined text-[#13ec80] text-xs font-bold">add</span>
                            </div>
                          </div>
                          <div>
                            <p className="text-[#0d1b14] dark:text-white text-xs font-bold leading-tight">{product.name}</p>
                            <p className="text-[#4c9a73] text-[10px] font-semibold mt-0.5">{product.price}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Floating Bottom Action Bar */}
                  <div className="absolute bottom-0 left-0 w-full z-50">
                    <div className="bg-[#f6f8f7] dark:bg-[#102219] px-5 pb-6 pt-2">
                      <div className="flex justify-between items-center mb-2 px-1">
                        <span className="text-[#4c9a73] text-[10px] font-medium uppercase tracking-wider">Resumen</span>
                        <span className="text-[#0d1b14] dark:text-white text-[10px] font-bold">3 Items</span>
                      </div>
                      <button
                        onClick={() => setShowCelebration(true)}
                        className="group flex w-full cursor-pointer items-center justify-between overflow-hidden rounded-full h-12 bg-[#13ec80] text-[#0d1b14] shadow-lg shadow-[#13ec80]/30 transition-all hover:bg-[#13ec80]/90 active:scale-95 relative"
                      >
                        <div className="pl-5 flex flex-col items-start justify-center h-full">
                          <span className="text-[10px] font-semibold opacity-80 uppercase tracking-wide">Total a cobrar</span>
                          <span className="text-base font-extrabold leading-none">$ 15.500</span>
                        </div>
                        <div className="pr-1.5 h-full flex items-center">
                          <div className="bg-black/10 h-9 px-4 rounded-full flex items-center justify-center group-hover:bg-black/20 transition-colors">
                            <span className="text-xs font-bold mr-1">COBRAR</span>
                            <span className="material-symbols-outlined text-sm">arrow_forward</span>
                          </div>
                        </div>
                      </button>
                    </div>
                  </div>

                  {/* Home Indicator */}
                  <div className="absolute bottom-1 left-1/2 -translate-x-1/2 w-24 h-1 bg-gray-300 dark:bg-gray-600 rounded-full z-50"></div>
                </div>
              </div>
              <div className="absolute top-1/4 left-1/4 -translate-x-12 size-16 bg-[#193326] rounded-2xl border border-[#32674d] flex items-center justify-center shadow-lg animate-bounce duration-[3000ms]">
                <span className="material-symbols-outlined text-primary text-3xl">attach_money</span>
              </div>
              <div className="absolute bottom-1/3 right-1/4 translate-x-12 size-14 bg-[#193326] rounded-2xl border border-[#32674d] flex items-center justify-center shadow-lg animate-bounce duration-[4000ms]">
                <span className="material-symbols-outlined text-orange-400 text-2xl">warning</span>
              </div>
            </div>
          </section>

          {/* Cupos Limitados (Moved Down) */}
          <section className="w-full max-w-[640px] px-4 mb-20">
            <div className="bg-[#193326]/60 rounded-xl p-4 sm:p-5 border border-[#32674d]/50 backdrop-blur-sm mx-auto">
              <div className="flex flex-col items-center gap-3">
                <div className="flex items-center gap-2 mb-1">
                  <span className="material-symbols-outlined text-orange-400">local_fire_department</span>
                  <p className="text-orange-300 font-bold text-sm uppercase tracking-wider">
                    Cupos limitados para el lanzamiento Beta
                  </p>
                </div>
                <p className="text-gray-300 text-sm mb-3">Los primeros 50 inscritos recibirán:</p>
                <ul className="flex flex-col sm:flex-row items-start sm:items-center justify-center gap-2 sm:gap-4 text-sm text-[#92c9ad] text-left">
                  <li className="flex items-center gap-2">
                    <span className="text-primary">✅</span>
                    <span>Instalación guiada (presencial o videollamada)</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="text-primary">✅</span>
                    <span>Precio congelado de por vida ($45.000)</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="text-primary">✅</span>
                    <span>30 días de prueba sin tarjeta</span>
                  </li>
                </ul>
              </div>
            </div>
          </section>

          {/* Desktop Dashboard Preview */}
          <section className="w-full max-w-[1400px] px-4 pb-20 flex flex-col items-center">
            <div className="text-center mb-10">
              <h2 className="text-white text-3xl md:text-4xl font-bold mb-3">Gestiona todo desde tu PC</h2>
              <p className="text-[#92c9ad]">Panel de administración completo para cuando necesites ver el panorama completo.</p>
            </div>

            <div className="w-full aspect-[16/10] max-h-[800px] bg-[#1a3326] rounded-xl border border-[#234836] shadow-2xl overflow-hidden relative group font-sans">
              {/* Window Controls */}
              <div className="absolute top-0 left-0 right-0 h-10 bg-[#1a3326] border-b border-[#234836] flex items-center px-4 gap-2 z-50">
                <div className="w-3 h-3 rounded-full bg-[#ff5f56]"></div>
                <div className="w-3 h-3 rounded-full bg-[#ffbd2e]"></div>
                <div className="w-3 h-3 rounded-full bg-[#27c93f]"></div>
                <div className="ml-4 text-xs text-gray-500 font-medium">DonTendero - Dashboard</div>
              </div>

              {/* content */}
              <div className="w-full h-full pt-10 flex bg-[#f6f8f7] dark:bg-[#102219] text-slate-900 dark:text-slate-100 overflow-hidden">
                {/* ASIDE */}
                <aside className="w-64 h-full bg-white dark:bg-[#1a3326] border-r border-slate-200 dark:border-slate-800 flex flex-col justify-between shrink-0 z-20">
                  <div>
                    <div className="h-20 flex items-center px-6 border-b border-slate-100 dark:border-slate-800/50">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center text-slate-900 shadow-sm">
                          <span className="material-symbols-outlined text-[28px]">storefront</span>
                        </div>
                        <div>
                          <h1 className="text-lg font-bold leading-tight text-slate-900 dark:text-white">DonTendero</h1>
                          <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">Mi Tiendita</p>
                        </div>
                      </div>
                    </div>
                    <nav className="flex flex-col gap-1 p-4">
                      <button
                        onClick={() => setDesktopActiveTab("Ventas")}
                        className={`flex items-center gap-3 px-4 py-3 rounded-xl font-semibold transition-colors ${desktopActiveTab === "Ventas" ? "bg-primary/10 text-[#0eb562] dark:text-primary" : "text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-white/5"}`}
                      >
                        <span className="material-symbols-outlined fill-1">point_of_sale</span>
                        <span>Ventas</span>
                      </button>
                      <button
                        onClick={() => setDesktopActiveTab("Inventario")}
                        className={`flex items-center gap-3 px-4 py-3 rounded-xl font-medium transition-colors ${desktopActiveTab === "Inventario" ? "bg-primary/10 text-[#0eb562] dark:text-primary" : "text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-white/5"}`}
                      >
                        <span className="material-symbols-outlined">inventory_2</span>
                        <span>Inventario</span>
                      </button>
                      <button className="flex items-center gap-3 px-4 py-3 rounded-xl text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-white/5 transition-colors font-medium">
                        <span className="material-symbols-outlined">menu_book</span>
                        <span>Fiados</span>
                      </button>
                    </nav>
                  </div>
                  <div className="p-4 border-t border-slate-200 dark:border-slate-800">
                    <div className="flex items-center gap-3 p-2 rounded-xl hover:bg-slate-50 dark:hover:bg-white/5 cursor-pointer transition-colors">
                      <div className="w-10 h-10 rounded-full bg-slate-200 dark:bg-slate-700 bg-center bg-cover" style={{ backgroundImage: "url('https://lh3.googleusercontent.com/aida-public/AB6AXuDw5mwhe7jy2edaIS6zXjemObgNFmMEdbIgrF0lOg3q07bSmDuq3YoPOxoGGmZdRLcaPgOasAdHqnbWGar4vQdmVPgspxvsgwXt6lFX3pu9h3C636MPj7j_grZ_3Y6MWI_HVSR5gY6uLID7Z_HLNEVUJytTIXzIgnZrp9banoIjFJcrIa-c6bgz0ex1IeJAesOicTUwjMuD8uJnHnwIHMPgpC3kfCH20rw0nRhA2hEqMgVOUt57goo98PFourOlzWB-icnHtgDwbNA')" }}></div>
                      <div className="flex flex-col">
                        <span className="text-sm font-semibold text-slate-900 dark:text-white">Carlos Ruiz</span>
                        <span className="text-xs text-slate-500 dark:text-slate-400">Administrador</span>
                      </div>
                    </div>
                  </div>
                </aside>

                {/* MAIN */}
                <main className="flex-1 flex flex-col h-full overflow-hidden bg-[#f6f8f7] dark:bg-[#102219] relative">
                  <header className="h-20 shrink-0 px-6 py-4 flex items-center justify-between gap-6 bg-[#f6f8f7] dark:bg-[#102219] z-10 border-b border-transparent">
                    <div className="flex-1 max-w-3xl">
                      <div className="relative group">
                        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                          <span className="material-symbols-outlined text-slate-400 group-focus-within:text-primary transition-colors">search</span>
                        </div>
                        <input type="text" className="block w-full pl-12 pr-28 py-3 bg-white dark:bg-[#1a3326] border-none rounded-2xl text-slate-900 dark:text-white placeholder-slate-400 focus:ring-2 focus:ring-primary/50 shadow-sm text-base transition-all h-12" placeholder="Buscar producto..." />
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <button className="w-11 h-11 flex items-center justify-center rounded-xl bg-white dark:bg-[#1a3326] border border-slate-200 dark:border-slate-700 text-slate-500 hover:text-primary transition-colors shadow-sm relative">
                        <span className="material-symbols-outlined">notifications</span>
                        <span className="absolute top-2.5 right-3 w-2 h-2 bg-red-500 rounded-full border-2 border-white dark:border-[#1a3326]"></span>
                      </button>
                    </div>
                  </header>

                  {desktopActiveTab === "Ventas" ? (
                    <div className="flex-1 flex overflow-hidden">
                      <div className="flex-1 flex flex-col px-6 pb-6 overflow-hidden">
                        {/* Categorías Rápidas */}
                        <div className="shrink-0 mb-6">
                          <div className="flex items-center justify-between mb-3">
                            <h3 className="text-sm font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wide">Categorías</h3>
                          </div>
                          <div className="grid grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-3">
                            <button className="flex flex-col items-center justify-center gap-2 p-2 rounded-xl bg-primary text-slate-900 border border-primary shadow-md shadow-primary/20 transition-all active:scale-95 group h-[88px]">
                              <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center backdrop-blur-sm"><span className="material-symbols-outlined text-[22px]">apps</span></div>
                              <span className="text-xs font-bold">Todos</span>
                            </button>
                            <button className="flex flex-col items-center justify-center gap-2 p-2 rounded-xl bg-white dark:bg-[#1a3326] border border-slate-200 dark:border-slate-700 transition-all active:scale-95 group h-[88px]">
                              <div className="w-10 h-10 rounded-full bg-blue-50 dark:bg-blue-900/20 text-blue-500 dark:text-blue-400 flex items-center justify-center"><span className="material-symbols-outlined text-[22px]">local_drink</span></div>
                              <span className="text-xs font-medium text-slate-700 dark:text-slate-300">Bebidas</span>
                            </button>
                            <button className="flex flex-col items-center justify-center gap-2 p-2 rounded-xl bg-white dark:bg-[#1a3326] border border-slate-200 dark:border-slate-700 transition-all active:scale-95 group h-[88px]">
                              <div className="w-10 h-10 rounded-full bg-orange-50 dark:bg-orange-900/20 text-orange-500 dark:text-orange-400 flex items-center justify-center"><span className="material-symbols-outlined text-[22px]">grocery</span></div>
                              <span className="text-xs font-medium text-slate-700 dark:text-slate-300">Abarrotes</span>
                            </button>
                          </div>
                        </div>

                        {/* Productos */}
                        <div className="flex-1 overflow-y-auto no-scrollbar pr-2">
                          <h3 className="text-sm font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wide mb-3">Productos Destacados</h3>
                          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 pb-20">
                            {/* Product Cards */}
                            {[
                              { name: "Coca-Cola 1.5L", price: "$5.500", image: "https://lh3.googleusercontent.com/aida-public/AB6AXuC2zMjDT28_eaQ_r6b9E5kYeTmJ3eJPwef-4eSNxZeX-hVXP-r72SmxJWd3yCGfNiq7afseDos7DEB7AxaKKyBKOIKAweh1U28uQyCauYx9S-s6XLBQt8gdEZEq2Vv3CaXM3c2U0nJI_lAYXBleSiMc5eIipdHZSj7hy9hYLcCMzxkIe_e756x2PO_stQc6mdze8VuBv-SzpmhjtYQ9bagKkSobUKpHTs5wf4PyqMhi94GSS4cxR1TpEYcpTCQ3ZvWKuPRPllE943g" },
                              { name: "Arroz Diana 500g", price: "$2.800", image: "https://lh3.googleusercontent.com/aida-public/AB6AXuCsQFe5JUSw9Qs0Q2gXj4GeeCBXSDpHcuT2W-fvUMLovG-XwTPEW0dTHkim2rcLHB_V7HfeibG9pkiEEOO1s72D_3pkAaSLuKmyTr2gDWheoPZDLud28Yky5BT9XyR3-FoXwXyB6H0W4tUyQptHI7j3wlKuUGnTLMeGQtsGsMeO3rkwbEsaYB3-9q9zK9jxRipY6Isjas4vw5YIJtbRLP6EIGcudXAHL2lDrIIYBRhUExxv5DGH166fSixkqM8ZNvYFaG4St333JTw" },
                              { name: "Pan Bimbo", price: "$4.500", image: "https://lh3.googleusercontent.com/aida-public/AB6AXuBcQjveLHsgyClB04l9LGL1G54tVUfDzvqFwUAhtorq5u21QsKSd7HwA66bDng_ZAzCljdBCZWuWXjm7gp4dOQSEH9Vzy3r4SVbo5j0WQExl9ol4T0zqfNkopHZUOMu26scXAr9HwG-XokZ2ftG-ND1yoAekXQmG0zHC-i5rDgamTemf0FWH_V7b8bKTGirhwveImzNQ4tLg38QXSVU0UA0yIOkfBsVEzMU1eheX46mYerOU-mRYaRIHXv2t3SxRZGbqnkE6uRIY_Q" },
                              { name: "Leche Alquería", price: "$3.200", image: "https://lh3.googleusercontent.com/aida-public/AB6AXuAg1aZ5QhhNVyOKFz4Oll5K-Y8pBnVObPKbX8hjQ3iWjoB6kkA5Y-YYBjDsbCx_ZeYUzb58P6CDZ_v8ebDnBXblQYW7X5IsbBbmzb0RH2UnGJZDf1Aez6kd3qnlDsbMHOAKA1vZM_tdqj6uBSINy3e4dWzanmRUBsbae4N0Nr2rDAi2l4PNaknPRW0twbBPEEnGpZ4bG4wolAQt7if9aNiCGiR3-Q-xI3gj_gKKZI0rFvjcqhRbtjUI_U3jjY1DwRv34QftUAyjUl4" },
                            ].map((p, i) => (
                              <div key={i} className="bg-white dark:bg-[#1a3326] p-3 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-800 cursor-pointer group flex flex-col h-full">
                                <div className="aspect-square rounded-xl bg-slate-50 dark:bg-slate-800 mb-3 bg-center bg-contain bg-no-repeat relative overflow-hidden group-hover:scale-105 transition-transform duration-300" style={{ backgroundImage: `url('${p.image}')` }}></div>
                                <div className="flex flex-col flex-1">
                                  <h3 className="font-semibold text-slate-900 dark:text-white leading-tight mb-1 text-sm">{p.name}</h3>
                                  <div className="mt-auto pt-2 flex items-center justify-between">
                                    <span className="text-lg font-bold text-slate-900 dark:text-white">{p.price}</span>
                                    <button className="w-9 h-9 rounded-xl bg-primary text-slate-900 flex items-center justify-center shadow-md shadow-primary/20 hover:bg-[#0eb562] transition-colors"><span className="material-symbols-outlined text-[20px]">add</span></button>
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>

                      {/* Cart Sidebar (Desktop) */}
                      <aside className="w-[320px] bg-white dark:bg-[#1a3326] border-l border-slate-200 dark:border-slate-800 flex flex-col shadow-xl shrink-0 z-10">
                        <div className="h-16 px-6 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between shrink-0">
                          <h2 className="text-lg font-bold text-slate-900 dark:text-white">Venta Actual</h2>
                          <span className="text-sm font-medium text-slate-500 bg-slate-100 dark:bg-slate-800 px-2 py-1 rounded-md">#1024</span>
                        </div>
                        <div className="flex-1 overflow-y-auto no-scrollbar p-4 space-y-4">
                          <div className="flex gap-3 relative group">
                            <div className="w-16 h-16 rounded-lg bg-slate-50 dark:bg-slate-800 shrink-0 bg-center bg-contain bg-no-repeat" style={{ backgroundImage: "url('https://lh3.googleusercontent.com/aida-public/AB6AXuCai-nSwr6KpgDrM89CNxRhMATbDnrVjzFAOZ4j9W1DeD2g0k_HJo3K0jsXrykhpJNoQ8xD-WQv4XQPmJoUoHOel1xE3EUdaXi2oST8u50MX4sWsMXF85G-Etjqge6DICAYCnYHQfGciMbDCLMe_iyeYlLxvJ-YzrReYDzxwAIUdJaNagca-geNxjaz2XiUKk42TZroeu00tNsiozBTOsRXWGhVlZkShpgL-qsda2p5CeovFkWOgIETkjvDXAHT5kZPk-1HcF98KSU')" }}></div>
                            <div className="flex-1 flex flex-col justify-center">
                              <div className="flex justify-between items-start">
                                <h4 className="font-medium text-slate-900 dark:text-white line-clamp-1 text-sm">Coca-Cola 1.5L</h4>
                                <span className="font-bold text-slate-900 dark:text-white text-sm">$11.000</span>
                              </div>
                              <div className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">$5.500 c/u</div>
                            </div>
                          </div>
                          <div className="flex gap-3 relative group">
                            <div className="w-16 h-16 rounded-lg bg-slate-50 dark:bg-slate-800 shrink-0 bg-center bg-contain bg-no-repeat" style={{ backgroundImage: "url('https://lh3.googleusercontent.com/aida-public/AB6AXuAUJaN9HeNtl5o3ZcPTUKPk4BU1QTq5B5coWl9HrBe46IlvMWxT5Chvo_gB4_HlVjbErniRvzawoMHXa7rZXDiZDzBcnHur9ghgzu7qXHtxbqSDTszIr74fLOJ3fmGpYkxXWbvn5k081AUj_t9Rrg07Oas4Ay1C7WdZgghgzkkW7kPtiZEEAWNkSp9LLOGpU7CzXO0eUwthqM7d5u6TOGXQ54eHxKcN3VBlcbrp2K9wG0uVUDGZCs9wvB4KzN6G7wpWBeb9l7d9Xro')" }}></div>
                            <div className="flex-1 flex flex-col justify-center">
                              <div className="flex justify-between items-start">
                                <h4 className="font-medium text-slate-900 dark:text-white line-clamp-1 text-sm">Pan Bimbo</h4>
                                <span className="font-bold text-slate-900 dark:text-white text-sm">$4.500</span>
                              </div>
                              <div className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">$4.500 c/u</div>
                            </div>
                          </div>
                        </div>
                        <div className="p-6 bg-slate-50 dark:bg-slate-800/30 border-t border-slate-200 dark:border-slate-800 shrink-0">
                          <div className="flex justify-between items-center mb-6 pt-2">
                            <span className="text-lg font-bold text-slate-900 dark:text-white">Total a Pagar</span>
                            <span className="text-2xl font-bold text-slate-900 dark:text-white">$15.500</span>
                          </div>
                          <button
                            onClick={() => setShowCelebration(true)}
                            className="w-full bg-primary hover:bg-[#0eb562] text-slate-900 font-bold py-4 px-6 rounded-xl shadow-lg shadow-primary/20 transition-all active:scale-[0.98] mb-3 flex items-center justify-center gap-2"
                          >
                            <span>Cobrar</span>
                            <span className="material-symbols-outlined">arrow_forward</span>
                          </button>
                        </div>
                      </aside>
                    </div>
                  ) : (
                    <div className="flex-1 overflow-y-auto p-6 text-slate-900 dark:text-white">
                      <div className="flex items-center justify-between mb-6">
                        <h2 className="text-xl font-bold">Inventario General</h2>
                        <button className="px-4 py-2 bg-primary text-black rounded-lg font-bold text-sm shadow-md shadow-primary/20 hover:bg-[#0eb562] transition-colors">Nuevo Producto</button>
                      </div>
                      <div className="bg-white dark:bg-[#1a3326] rounded-xl border border-slate-200 dark:border-[#234836] overflow-hidden shadow-sm">
                        <table className="w-full text-left">
                          <thead className="bg-slate-50 dark:bg-[#234836]">
                            <tr>
                              <th className="p-4 text-xs font-bold text-slate-500 dark:text-gray-300 uppercase">Producto</th>
                              <th className="p-4 text-xs font-bold text-slate-500 dark:text-gray-300 uppercase">Categoría</th>
                              <th className="p-4 text-xs font-bold text-slate-500 dark:text-gray-300 uppercase text-right">Stock</th>
                              <th className="p-4 text-xs font-bold text-slate-500 dark:text-gray-300 uppercase text-right">Precio</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-slate-100 dark:divide-[#234836]">
                            {[1, 2, 3, 4, 5].map(i => (
                              <tr key={i} className="hover:bg-slate-50 dark:hover:bg-white/5 transition-colors">
                                <td className="p-4 text-sm font-medium">Producto Ejemplo {i}</td>
                                <td className="p-4 text-sm text-slate-500 dark:text-gray-400">Abarrotes</td>
                                <td className="p-4 text-sm text-right">24 un.</td>
                                <td className="p-4 text-sm text-right font-bold">$2.500</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  )}
                </main>
              </div>
            </div>
          </section>

          {/* Features / Problema vs Solución */}
          <section className="w-full bg-[#0d1a14] border-t border-[#234836]">
            <div className="w-full max-w-[1000px] mx-auto px-6 py-20">
              <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-12 gap-6">
                <div className="max-w-[600px]">
                  <h3 className="text-primary font-bold tracking-widest uppercase text-sm mb-2">
                    Problema vs Solución
                  </h3>
                  <h2 className="text-white text-3xl md:text-4xl font-bold leading-tight">
                    Olvídate del cuaderno y los errores de cálculo.
                  </h2>
                </div>
                <p className="text-gray-400 max-w-[300px] text-sm md:text-right">
                  Diseñado específicamente para las necesidades del tendero colombiano moderno.
                </p>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="group p-6 rounded-2xl bg-[#193326] border border-[#234836] hover:border-primary/50 transition duration-300 hover:-translate-y-1">
                  <div className="size-12 rounded-xl bg-[#11221a] flex items-center justify-center mb-6 group-hover:bg-primary/20 transition-colors">
                    <span className="material-symbols-outlined text-white group-hover:text-primary transition-colors text-2xl">
                      edit_off
                    </span>
                  </div>
                  <h3 className="text-white text-xl font-bold mb-3">No más cuentas en cuaderno</h3>
                  <p className="text-[#92c9ad] leading-relaxed text-sm">
                    El papel se pierde, se moja y se rompe. Tu información estará segura en la nube y accesible
                    siempre.
                  </p>
                </div>
                <div className="group p-6 rounded-2xl bg-[#193326] border border-[#234836] hover:border-primary/50 transition duration-300 hover:-translate-y-1">
                  <div className="size-12 rounded-xl bg-[#11221a] flex items-center justify-center mb-6 group-hover:bg-primary/20 transition-colors">
                    <span className="material-symbols-outlined text-white group-hover:text-primary transition-colors text-2xl">
                      verified_user
                    </span>
                  </div>
                  <h3 className="text-white text-xl font-bold mb-3">Control total de fiados</h3>
                  <p className="text-[#92c9ad] leading-relaxed text-sm">
                    Nunca más olvides quién te debe plata. Envía recordatorios de cobro automáticos por WhatsApp.
                  </p>
                </div>
                <div className="group p-6 rounded-2xl bg-[#193326] border border-[#234836] hover:border-primary/50 transition duration-300 hover:-translate-y-1">
                  <div className="size-12 rounded-xl bg-[#11221a] flex items-center justify-center mb-6 group-hover:bg-primary/20 transition-colors">
                    <span className="material-symbols-outlined text-white group-hover:text-primary transition-colors text-2xl">
                      inventory_2
                    </span>
                  </div>
                  <h3 className="text-white text-xl font-bold mb-3">Inventario automático</h3>
                  <p className="text-[#92c9ad] leading-relaxed text-sm">
                    Entérate cuando se te está acabando el producto antes de que llegue el proveedor. Vende sin
                    interrupciones.
                  </p>
                </div>
              </div>
            </div>
          </section>

          {/* Pricing Section */}
          <section id="planes" className="w-full bg-background-dark py-24 border-t border-[#234836] relative overflow-hidden">
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full bg-primary/5 blur-[120px] rounded-full pointer-events-none"></div>

            <div className="w-full max-w-[1200px] mx-auto px-6 relative z-10">
              <div className="text-center mb-16">
                <h3 className="text-primary font-bold tracking-widest uppercase text-sm mb-3">Precios Transparentes</h3>
                <h2 className="text-white text-3xl md:text-5xl font-black mb-6 tracking-tight">Elige el plan ideal para tu negocio</h2>
                <div className="inline-flex items-center p-1 bg-[#193326] rounded-xl border border-[#234836] mb-8">
                  <span className="px-4 py-2 bg-primary text-background-dark rounded-lg text-sm font-bold shadow-lg shadow-primary/20">Pago Mensual</span>
                  <span className="px-4 py-2 text-gray-400 text-sm font-medium">Pago Anual (Ahorra 20%)</span>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {/* Plan Gratis */}
                <div className="p-8 rounded-3xl bg-[#193326]/40 border border-[#234836] backdrop-blur-sm flex flex-col hover:border-primary/30 transition-all duration-300">
                  <h4 className="text-gray-400 font-bold text-sm uppercase tracking-widest mb-2">Estándar</h4>
                  <div className="mb-6">
                    <span className="text-white text-4xl font-black">$0</span>
                    <span className="text-gray-500 ml-2">/por siempre</span>
                  </div>
                  <p className="text-[#92c9ad] text-sm mb-8 leading-relaxed">Ideal para nuevos tenderos que quieren digitalizar su cuaderno hoy.</p>
                  <ul className="space-y-4 mb-10 flex-1">
                    <li className="flex items-start gap-3 text-sm text-gray-300">
                      <span className="text-primary material-symbols-outlined text-xl">check_circle</span>
                      <span>Ventas ilimitadas</span>
                    </li>
                    <li className="flex items-start gap-3 text-sm text-gray-300">
                      <span className="text-primary material-symbols-outlined text-xl">check_circle</span>
                      <span>Gestión de Fiados</span>
                    </li>
                    <li className="flex items-start gap-3 text-sm text-gray-300">
                      <span className="text-primary material-symbols-outlined text-xl">check_circle</span>
                      <span>Cierre de Caja diario</span>
                    </li>
                  </ul>
                  <a href="https://dontendero.com/register" className="w-full py-4 text-center rounded-xl bg-white/5 border border-white/10 text-white font-bold hover:bg-white/10 transition-all">Empezar Gratis</a>
                </div>

                {/* Plan Emprendedor (Destacado) */}
                <div className="p-8 rounded-3xl bg-[#193326] border-2 border-primary shadow-[0_0_40px_rgba(19,236,128,0.15)] flex flex-col relative transform md:-translate-y-4 hover:scale-[1.02] transition-all duration-300">
                  <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-primary text-background-dark px-4 py-1 rounded-full text-[10px] font-black uppercase tracking-widest shadow-xl">Más Popular</div>
                  <h4 className="text-primary font-bold text-sm uppercase tracking-widest mb-2">Emprendedor</h4>
                  <div className="mb-6">
                    <div className="flex items-baseline gap-2">
                      <span className="text-white text-5xl font-black">$45.000</span>
                      <span className="text-gray-500">/mes</span>
                    </div>
                    <p className="text-orange-400 text-[10px] font-bold mt-1">Precio especial: 50 primeros cupos</p>
                  </div>
                  <p className="text-white/80 text-sm mb-8 leading-relaxed">Para negocios que quieren dar el salto a las Grandes Superficies configurando inventarios.</p>
                  <ul className="space-y-4 mb-10 flex-1">
                    <li className="flex items-start gap-3 text-sm text-white">
                      <span className="text-primary material-symbols-outlined text-xl">check_circle</span>
                      <span>Todo lo del Plan Estándar</span>
                    </li>
                    <li className="flex items-start gap-3 text-sm text-white">
                      <span className="text-primary material-symbols-outlined text-xl">check_circle</span>
                      <span>Inventario Inteligente</span>
                    </li>
                    <li className="flex items-start gap-3 text-sm text-white">
                      <span className="text-primary material-symbols-outlined text-xl">check_circle</span>
                      <span>Alertas de stock bajo</span>
                    </li>
                    <li className="flex items-start gap-3 text-sm text-white">
                      <span className="text-primary material-symbols-outlined text-xl">check_circle</span>
                      <span>Reportes detallados</span>
                    </li>
                  </ul>
                  <a href="https://dontendero.com/register" className="w-full py-4 text-center rounded-xl bg-primary text-background-dark font-black shadow-lg shadow-primary/30 hover:bg-[#0fd672] transition-all group">
                    Elegir Plan
                  </a>
                </div>

                {/* Plan Business */}
                <div className="p-8 rounded-3xl bg-[#193326]/40 border border-[#234836] backdrop-blur-sm flex flex-col hover:border-primary/30 transition-all duration-300">
                  <h4 className="text-gray-400 font-bold text-sm uppercase tracking-widest mb-2">Empresario PRO</h4>
                  <div className="mb-6">
                    <span className="text-white text-4xl font-black">$90.000</span>
                    <span className="text-gray-500 ml-2">/mes</span>
                  </div>
                  <p className="text-[#92c9ad] text-sm mb-8 leading-relaxed">Potencia máxima para depósitos, cigarrerías y tiendas con múltiples sedes.</p>
                  <ul className="space-y-4 mb-10 flex-1">
                    <li className="flex items-start gap-3 text-sm text-gray-300">
                      <span className="text-primary material-symbols-outlined text-xl">check_circle</span>
                      <span>Todo lo del Plan Emprendedor</span>
                    </li>
                    <li className="flex items-start gap-3 text-sm text-gray-300">
                      <span className="text-primary material-symbols-outlined text-xl">check_circle</span>
                      <span>Multi-Organización</span>
                    </li>
                    <li className="flex items-start gap-3 text-sm text-gray-300">
                      <span className="text-primary material-symbols-outlined text-xl">check_circle</span>
                      <span>Gerente de cuenta dedicado</span>
                    </li>
                  </ul>
                  <a href="https://dontendero.com/register" className="w-full py-4 text-center rounded-xl bg-white/5 border border-white/10 text-white font-bold hover:bg-white/10 transition-all">Saber más</a>
                </div>
              </div>
            </div>
          </section>

          {/* Mission */}
          <section className="w-full relative py-20 bg-[#11221a] border-t border-[#234836] overflow-hidden">
            <div
              className="absolute inset-0 bg-[length:40px_40px] opacity-[0.05] pointer-events-none"
              style={{
                backgroundImage:
                  "linear-gradient(to right, #234836 1px, transparent 1px), linear-gradient(to bottom, #234836 1px, transparent 1px)",
              }}
            ></div>
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-3/4 h-1/2 bg-primary/5 blur-[100px] rounded-full pointer-events-none"></div>
            <div className="relative z-10 w-full max-w-[800px] mx-auto px-6 flex flex-col items-center text-center">
              <div className="mb-6 inline-flex items-center justify-center size-14 rounded-2xl bg-[#193326] border border-[#234836] shadow-xl overflow-hidden p-2">
                <img src="/icon.png" alt="DonTendero Icon" className="w-full h-full object-contain" />
              </div>
              <h2 className="text-2xl md:text-4xl font-bold text-white mb-8 tracking-tight">Nuestra Misión</h2>
              <div className="space-y-6 text-lg md:text-xl text-[#92c9ad] font-light leading-relaxed">
                <p>
                  "Sabemos que las grandes cadenas amenazan al comercio local, pero ninguna tiene lo que tú tienes:{" "}
                  <span className="text-white font-medium">la confianza de tus vecinos</span>."
                </p>
                <p>
                  Creamos esta plataforma para <span className="text-white font-medium">nivelar la cancha</span>, dándote
                  la misma tecnología de las grandes superficies pero fácil de usar.
                </p>
                <p>
                  Para que tengas el control total, cumplas con la ley sin miedo y{" "}
                  <span className="text-white font-medium">recuperes tiempo para tu familia</span>.
                </p>
              </div>
              <div className="mt-10 px-6 py-4 rounded-2xl bg-[#193326]/40 border border-[#234836] backdrop-blur-sm">
                <p className="text-white font-medium text-base md:text-lg flex flex-col md:flex-row items-center gap-2">
                  <span>Tecnología honesta, hecha en Colombia para los que mueven el país.</span>
                  <span className="text-2xl">🇨🇴</span>
                </p>
              </div>
            </div>
          </section>
        </main>
        <footer className="w-full py-8 border-t border-[#234836] bg-[#102219]">
          <div className="w-full max-w-[1200px] mx-auto px-6 flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <div className="size-5 text-gray-500">
                <span className="material-symbols-outlined text-lg">storefront</span>
              </div>
              <span className="text-gray-500 font-bold text-sm">DonTendero</span>
            </div>
            <p className="text-gray-600 text-xs text-center md:text-right">
              © 2025 DonTendero. Hecho con <span className="text-red-500">❤</span> para Colombia.
            </p>
          </div>
        </footer>
      </div>
      {/* Investor Modal */}
      {
        isInvestorModalOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="relative w-full max-w-sm bg-[#102219] border border-[#234836] rounded-2xl p-6 shadow-2xl animate-in zoom-in-95 duration-200">
              <button
                onClick={() => setIsInvestorModalOpen(false)}
                className="absolute top-4 right-4 text-gray-400 hover:text-white transition-colors"
              >
                <span className="material-symbols-outlined">close</span>
              </button>

              <div className="flex flex-col items-center text-center">
                <div className="size-12 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                  <span className="material-symbols-outlined text-primary text-2xl">rocket_launch</span>
                </div>
                <h3 className="text-xl font-bold text-white mb-2">¡Únete como Inversor!</h3>
                <p className="text-gray-400 text-sm mb-6">
                  Estamos construyendo el futuro del comercio local en Colombia. Hablemos de negocios.
                </p>

                <div className="w-full space-y-3">
                  <a
                    href="https://wa.me/573107146415"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full flex items-center justify-center gap-2 p-3 rounded-xl bg-[#25D366] hover:bg-[#20bd5a] text-white font-bold transition-all hover:scale-[1.02]"
                  >
                    <svg className="size-5 fill-current" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z" /></svg>
                    <span>WhatsApp (+57 310 714 6415)</span>
                  </a>

                  <a
                    href="mailto:santyalvpez@gmail.com"
                    className="w-full flex items-center justify-center gap-2 p-3 rounded-xl bg-[#234836] hover:bg-[#32674d] text-white font-medium transition-all hover:scale-[1.02] border border-[#32674d]"
                  >
                    <span className="material-symbols-outlined text-lg">mail</span>
                    <span>santyalvpez@gmail.com</span>
                  </a>
                </div>
              </div>
            </div>
          </div>
        )
      }
      {/* Celebration Modal */}
      {
        showCelebration && (
          <div className="fixed inset-0 z-[200] flex items-center justify-center bg-[#102219]/95 backdrop-blur-md animate-in fade-in duration-500">
            {/* Confetti-like particles (CSS) */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
              {[...Array(30)].map((_, i) => (
                <div
                  key={i}
                  className="firework-particle"
                  style={{
                    left: `${Math.random() * 100}%`,
                    top: `${Math.random() * 100}%`,
                    // @ts-ignore
                    "--x": `${(Math.random() - 0.5) * 50}px`,
                    "--initialY": "0",
                    "--initialSize": `${Math.random() * 0.5 + 0.5}rem`,
                    "--finalSize": "0rem",
                    animationDuration: `${1 + Math.random() * 2}s`,
                    animationDelay: `${Math.random() * 1}s`
                  }}
                ></div>
              ))}
            </div>

            <div className="relative z-10 flex flex-col items-center text-center p-8 max-w-md animate-in zoom-in-90 duration-500">
              <div className="size-24 rounded-full bg-primary/20 flex items-center justify-center mb-6 shadow-[0_0_50px_rgba(19,236,128,0.4)]">
                <span className="material-symbols-outlined text-primary text-6xl animate-pulse">check_circle</span>
              </div>
              <h2 className="text-3xl md:text-5xl font-black text-white mb-4 leading-tight">
                ¡Has cobrado tu primer venta!
              </h2>
              <p className="text-[#92c9ad] text-lg md:text-xl font-light mb-8">
                Únete a nosotros y construyamos país juntos.
                <span className="block mt-2 text-2xl">🇨🇴</span>
              </p>
              <button
                onClick={() => setShowCelebration(false)}
                className="px-8 py-3 rounded-full bg-primary hover:bg-[#0fd672] text-[#11221a] font-bold text-lg shadow-lg hover:shadow-[0_0_30px_rgba(19,236,128,0.6)] transition-all transform hover:scale-105"
              >
                Continuar
              </button>
            </div>
          </div>
        )
      }
      <InstallPrompt />
    </div >
  );
}
