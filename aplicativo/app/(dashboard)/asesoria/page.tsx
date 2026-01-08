"use client";

import Link from "next/link";
import { TaxSimulator } from "./components/TaxSimulator";
import { TaxCalendar2026 } from "./components/TaxCalendar2026";

export default function AsesoriaPage() {
    return (
        <div className="bg-[#f8f9fc] text-slate-900 min-h-full font-sans pb-12">

            {/* Header / Breadcrumbs */}
            <div className="w-full max-w-7xl mx-auto px-4 md:px-8 py-6">
                <div className="flex items-center gap-2 text-sm text-slate-500 mb-2">
                    <Link className="hover:text-indigo-600 transition-colors" href="/">Inicio</Link>
                    <span>/</span>
                    <span className="text-slate-800 font-medium">DonTendero Finance</span>
                </div>
                <h1 className="text-2xl font-bold text-slate-900">Centro de Asesoría Financiera</h1>
            </div>

            <main className="w-full max-w-7xl mx-auto px-4 md:px-8">

                {/* HERO BANNER - Now visually separated */}
                <div className="bg-gradient-to-r from-blue-700 to-indigo-800 rounded-2xl p-6 md:p-10 mb-10 text-white relative overflow-hidden shadow-xl shadow-indigo-900/10">
                    <div className="absolute top-0 right-0 p-8 opacity-10 pointer-events-none">
                        <span className="material-symbols-outlined text-[180px]">account_balance</span>
                    </div>

                    <div className="relative z-10 flex flex-col md:flex-row items-center gap-8">
                        <div className="size-20 rounded-2xl bg-white/10 flex items-center justify-center shrink-0 backdrop-blur-sm border border-white/20 shadow-inner">
                            <span className="material-symbols-outlined text-[40px]">campaign</span>
                        </div>
                        <div className="flex-1 text-center md:text-left">
                            <h2 className="text-2xl md:text-3xl font-bold mb-3">¡Evita sanciones con la DIAN!</h2>
                            <p className="text-blue-100 text-lg leading-relaxed max-w-3xl">
                                Mantener tu negocio al día es clave para evitar multas.
                                <strong> DonTendero Finance</strong> gestiona tus impuestos para que tú te dediques a vender.
                            </p>
                        </div>
                        <a
                            href="https://wa.me/573107146415?text=Hola,%20quiero%20activar%20DonTendero%20Finance%20para%20mi%20negocio."
                            target="_blank"
                            className="bg-white text-indigo-700 font-bold py-4 px-8 rounded-xl shadow-lg hover:bg-blue-50 hover:shadow-xl hover:scale-105 transition-all whitespace-nowrap text-lg"
                        >
                            Activar Servicios
                        </a>
                    </div>
                </div>

                {/* MAIN GRID - Spacious 2-Column Layout */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">

                    {/* LEFT COLUMN (2/3) - The "Workspace" */}
                    <div className="lg:col-span-2 flex flex-col gap-10">

                        {/* 1. Tax Calendar (Prominent) */}
                        <section>
                            <h2 className="text-xl font-bold text-slate-800 mb-4 flex items-center gap-2">
                                <span className="material-symbols-outlined text-indigo-600">event_upcoming</span>
                                Tu Agenda Tributaria
                            </h2>
                            <div className="h-[500px]"> {/* Fixed height for prominence */}
                                <TaxCalendar2026 />
                            </div>
                        </section>

                        {/* 2. Tax Simulator */}
                        <section>
                            <h2 className="text-xl font-bold text-slate-800 mb-4 flex items-center gap-2">
                                <span className="material-symbols-outlined text-green-600">calculate</span>
                                Calculadora de Beneficios
                            </h2>
                            <TaxSimulator />
                        </section>

                        {/* 3. Services Shortcuts */}
                        <section>
                            <h2 className="text-xl font-bold text-slate-800 mb-4">Servicios Rápidos</h2>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <button className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm hover:border-indigo-300 hover:shadow-md transition-all text-left flex items-start gap-4 group">
                                    <div className="bg-indigo-50 text-indigo-600 p-3 rounded-lg group-hover:bg-indigo-600 group-hover:text-white transition-colors">
                                        <span className="material-symbols-outlined">description</span>
                                    </div>
                                    <div>
                                        <h3 className="font-bold text-slate-800 group-hover:text-indigo-600 transition-colors">Declaración de Renta</h3>
                                        <p className="text-xs text-slate-500 mt-1">Gestión completa desde $150k</p>
                                    </div>
                                </button>

                                <button className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm hover:border-green-300 hover:shadow-md transition-all text-left flex items-start gap-4 group">
                                    <div className="bg-green-50 text-green-600 p-3 rounded-lg group-hover:bg-green-600 group-hover:text-white transition-colors">
                                        <span className="material-symbols-outlined">receipt_long</span>
                                    </div>
                                    <div>
                                        <h3 className="font-bold text-slate-800 group-hover:text-green-600 transition-colors">Facturación Electrónica</h3>
                                        <p className="text-xs text-slate-500 mt-1">Implementación inmediata</p>
                                    </div>
                                </button>

                                <button className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm hover:border-blue-300 hover:shadow-md transition-all text-left flex items-start gap-4 group">
                                    <div className="bg-blue-50 text-blue-600 p-3 rounded-lg group-hover:bg-blue-600 group-hover:text-white transition-colors">
                                        <span className="material-symbols-outlined">school</span>
                                    </div>
                                    <div>
                                        <h3 className="font-bold text-slate-800 group-hover:text-blue-600 transition-colors">Capacitación Gratis</h3>
                                        <p className="text-xs text-slate-500 mt-1">Aprende sobre impuestos</p>
                                    </div>
                                </button>

                                <button className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm hover:border-purple-300 hover:shadow-md transition-all text-left flex items-start gap-4 group">
                                    <div className="bg-purple-50 text-purple-600 p-3 rounded-lg group-hover:bg-purple-600 group-hover:text-white transition-colors">
                                        <span className="material-symbols-outlined">search</span>
                                    </div>
                                    <div>
                                        <h3 className="font-bold text-slate-800 group-hover:text-purple-600 transition-colors">Auditoría Preventiva</h3>
                                        <p className="text-xs text-slate-500 mt-1">Revisión de estado actual</p>
                                    </div>
                                </button>

                                <button className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm hover:border-red-300 hover:shadow-md transition-all text-left flex items-start gap-4 group">
                                    <div className="bg-red-50 text-red-600 p-3 rounded-lg group-hover:bg-red-600 group-hover:text-white transition-colors">
                                        <span className="material-symbols-outlined">gavel</span>
                                    </div>
                                    <div>
                                        <h3 className="font-bold text-slate-800 group-hover:text-red-600 transition-colors">Asesoría Legal</h3>
                                        <p className="text-xs text-slate-500 mt-1">Abogados laborales y comerciales</p>
                                    </div>
                                </button>

                                <button className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm hover:border-orange-300 hover:shadow-md transition-all text-left flex items-start gap-4 group">
                                    <div className="bg-orange-50 text-orange-600 p-3 rounded-lg group-hover:bg-orange-600 group-hover:text-white transition-colors">
                                        <span className="material-symbols-outlined">rocket_launch</span>
                                    </div>
                                    <div>
                                        <h3 className="font-bold text-slate-800 group-hover:text-orange-600 transition-colors">Escala tu Negocio</h3>
                                        <p className="text-xs text-slate-500 mt-1">Inversión y Nuevas Sucursales</p>
                                    </div>
                                </button>
                            </div>
                        </section>
                    </div>

                    {/* RIGHT COLUMN (1/3) - Sidebar / Context */}
                    <div className="lg:col-span-1 flex flex-col gap-6 sticky top-6">

                        {/* 1. Contact Card (Crucial) */}
                        <div className="bg-white rounded-2xl border border-slate-200 shadow-lg overflow-hidden">
                            <div className="h-28 bg-gradient-to-br from-[#1152d4] to-[#0a358a] relative">
                                <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-30"></div>
                            </div>
                            <div className="px-6 pb-6 -mt-12 flex flex-col items-center relative z-10">
                                <div
                                    className="size-24 rounded-full border-[6px] border-white bg-cover bg-center mb-4 shadow-xl"
                                    style={{ backgroundImage: 'url("https://lh3.googleusercontent.com/aida-public/AB6AXuDr65Sd9Di7O0HptVaLQaYQosAtWk90jMtKluWQfwLB8P39YwPwqjZyi4DrSu_Qd0FrgGkR8n_QA6Ew8mHNhbcz3s0GsMcdgI3KQJsTkavEqDnwrHlNT2qALh2Cep7rr1ncN_hHGdd5crJVcEaHDlkZVEnC8iZIEnKrW2INCCWa7DUGEV4unaD-wfw2YPUUsbZfZd1Y4t-bUeyv_46sDGg9d_2jrcVJmjKpv33I_Wc2pZn6PcFr7zfoJkpnTnkKA3tvhMCMZ2p8ey4")' }}
                                ></div>
                                <h3 className="text-xl font-bold text-slate-900">Equipo DonTendero</h3>
                                <p className="text-sm text-slate-500 text-center mb-6">Expertos Tributarios para Tiendas de Barrio</p>

                                <a
                                    href="https://wa.me/573107146415?text=Hola,%20necesito%20ayuda%20con%20mis%20impuestos."
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="w-full group relative overflow-hidden bg-[#25D366] hover:bg-[#1faa53] text-white rounded-xl p-4 transition-all shadow-lg hover:shadow-xl hover:-translate-y-0.5 flex items-center justify-between"
                                >
                                    <div className="absolute top-0 right-0 p-4 opacity-20">
                                        <span className="material-symbols-outlined text-[60px] group-hover:scale-110 transition-transform">whatsapp</span>
                                    </div>
                                    <div className="relative z-10 flex items-center gap-3">
                                        <div className="bg-white/20 p-2 rounded-lg backdrop-blur-sm">
                                            <span className="material-symbols-outlined text-[24px]">chat</span>
                                        </div>
                                        <div className="text-left">
                                            <p className="font-bold text-sm text-white/90">Hablar con un Experto</p>
                                            <p className="font-black text-lg leading-none">Vía WhatsApp</p>
                                        </div>
                                    </div>
                                    <span className="material-symbols-outlined text-white/80 group-hover:translate-x-1 transition-transform relative z-10">arrow_forward</span>
                                </a>

                                <div className="flex items-center gap-1 bg-yellow-50 px-3 py-1 rounded-full border border-yellow-100">
                                    <span className="material-symbols-outlined text-yellow-500 text-[18px]">star</span>
                                    <span className="text-xs font-bold text-yellow-700">4.9/5 (500+ casos exitosos)</span>
                                </div>
                            </div>
                        </div>

                        {/* 3. Insight Card */}
                        <div className="bg-[#101622] rounded-xl p-6 text-white relative overflow-hidden group hover:shadow-xl transition-all cursor-pointer">
                            {/* Content remains mostly same but better padding */}
                            <div className="relative z-10">
                                <div className="flex items-center gap-2 mb-3">
                                    <span className="bg-yellow-500/20 text-yellow-400 text-xs font-bold px-2 py-1 rounded border border-yellow-500/30">
                                        TIP DEL DÍA
                                    </span>
                                </div>
                                <p className="text-sm text-gray-300 mb-4 leading-relaxed">
                                    "Si tus ventas superan los <strong>3.500 UVT</strong>, estás obligado a facturar electrónicamente. ¡Evita el cierre de tu local hasta por 3 días!"
                                </p>
                                <span className="text-xs font-bold text-white flex items-center gap-1 group-hover:translate-x-1 transition-transform">
                                    Leer más sobre facturación <span className="material-symbols-outlined text-[14px]">arrow_forward</span>
                                </span>
                            </div>
                        </div>

                        {/* 4. Help Link */}
                        <div className="text-center">
                            <a href="#" className="text-sm text-slate-400 hover:text-indigo-600 font-medium underline transition-colors">
                                ¿Necesitas ayuda con la plataforma?
                            </a>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
}
