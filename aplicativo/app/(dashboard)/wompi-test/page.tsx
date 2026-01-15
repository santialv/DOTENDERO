"use client";

import { WompiButton } from "@/components/payments/WompiButton";
import { CreditCard, ShieldCheck, Zap } from "lucide-react";

export default function WompiTestPage() {
    return (
        <div className="p-8 max-w-4xl mx-auto">
            <header className="mb-10 text-center">
                <h1 className="text-4xl font-black text-slate-900 mb-4 tracking-tight">
                    Módulo de Pagos <span className="text-indigo-600">Wompi</span>
                </h1>
                <p className="text-slate-500 text-lg max-w-2xl mx-auto">
                    Prueba la integración de Checkout de Wompi. Generamos firmas de seguridad en el servidor para proteger cada transacción.
                </p>
            </header>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 ring-1 ring-slate-200 p-8 rounded-3xl bg-white shadow-xl shadow-slate-100">
                <div className="space-y-6">
                    <div className="bg-slate-50 p-6 rounded-2xl border border-slate-100">
                        <h2 className="font-bold text-slate-800 mb-2 flex items-center gap-2">
                            <Zap className="w-5 h-5 text-yellow-500" />
                            Pago Rápido (Sandbox)
                        </h2>
                        <p className="text-sm text-slate-500 mb-6">
                            Este botón iniciará un flujo de pago de prueba por $50,000 COP.
                        </p>

                        <WompiButton
                            amount={50000}
                            className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-4 rounded-xl shadow-lg shadow-indigo-100 flex items-center justify-center gap-2 group transition-all active:scale-95"
                        />
                    </div>

                    <div className="flex items-center gap-4 text-xs text-slate-400">
                        <div className="flex -space-x-2">
                            <div className="w-8 h-8 rounded-full border-2 border-white bg-slate-100 flex items-center justify-center text-[10px] font-bold">VISA</div>
                            <div className="w-8 h-8 rounded-full border-2 border-white bg-slate-100 flex items-center justify-center text-[10px] font-bold">MC</div>
                            <div className="w-8 h-8 rounded-full border-2 border-white bg-slate-100 flex items-center justify-center text-[10px] font-bold">PSE</div>
                        </div>
                        <p>Soportamos múltiples medios de pago locales.</p>
                    </div>
                </div>

                <div className="flex flex-col justify-center space-y-4">
                    <div className="flex gap-4 items-start">
                        <div className="w-10 h-10 rounded-xl bg-green-50 flex items-center justify-center shrink-0">
                            <ShieldCheck className="w-6 h-6 text-green-600" />
                        </div>
                        <div>
                            <h3 className="font-bold text-slate-800">Firma de Integridad</h3>
                            <p className="text-sm text-slate-500">Cada transacción lleva una firma HMAC-SHA256 generada en tiempo real.</p>
                        </div>
                    </div>
                    <div className="flex gap-4 items-start">
                        <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center shrink-0">
                            <Zap className="w-6 h-6 text-blue-600" />
                        </div>
                        <div>
                            <h3 className="font-bold text-slate-800">Redirección Segura</h3>
                            <p className="text-sm text-slate-500">El usuario es llevado al checkout oficial de Wompi y regresa a DonTendero.</p>
                        </div>
                    </div>
                </div>
            </div>

            <footer className="mt-12 text-center text-slate-400 text-xs">
                © 2026 DonTendero Payment Engine. Powered by Wompi Colombia.
            </footer>
        </div>
    );
}
