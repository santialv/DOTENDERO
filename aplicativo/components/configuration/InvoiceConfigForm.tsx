"use client";

export function InvoiceConfigForm() {
    return (
        <div className="max-w-4xl flex flex-col gap-6">
            <div className="bg-orange-50 border border-orange-100 rounded-xl p-4 flex gap-4 items-start">
                <span className="material-symbols-outlined text-orange-600 mt-1">warning</span>
                <div>
                    <h4 className="text-base font-bold text-orange-800">Facturación Electrónica DIAN</h4>
                    <p className="text-sm text-orange-700 mt-1">
                        Actualmente estamos en modo "POS Local". La integración con la DIAN para el CUFE y facturación electrónica está marcada como <i>Coming Soon</i>.
                        Sin embargo, puedes configurar los datos que aparecerán en tu tirilla de venta actual.
                    </p>
                </div>
            </div>

            <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex flex-col gap-4">
                <h3 className="text-lg font-bold text-slate-900">Configuración de Tirilla (POS)</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="flex flex-col gap-1.5">
                        <label className="text-sm font-semibold text-slate-700">Resolución DIAN (Opcional)</label>
                        <input
                            type="text"
                            placeholder="Ej: 18760000001"
                            className="w-full rounded-lg border border-slate-200 bg-slate-50 py-2.5 px-3 text-sm text-slate-900 focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all"
                        />
                    </div>
                    <div className="flex flex-col gap-1.5">
                        <label className="text-sm font-semibold text-slate-700">Prefijo Facturación</label>
                        <input
                            type="text"
                            placeholder="Ej: POS-"
                            className="w-full rounded-lg border border-slate-200 bg-slate-50 py-2.5 px-3 text-sm text-slate-900 focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all"
                        />
                    </div>
                    <div className="col-span-2 flex flex-col gap-1.5">
                        <label className="text-sm font-semibold text-slate-700">Pie de Página (Mensaje final)</label>
                        <textarea
                            rows={2}
                            placeholder="Ej: Gracias por su compra, vuelva pronto!"
                            className="w-full rounded-lg border border-slate-200 bg-slate-50 py-2.5 px-3 text-sm text-slate-900 focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all resize-none"
                        />
                    </div>
                </div>
            </div>

            <div className="opacity-50 pointer-events-none grayscale bg-slate-100 p-6 rounded-xl border border-slate-200 shadow-sm flex flex-col gap-4 relative overflow-hidden">
                <div className="absolute top-4 right-4 bg-slate-800 text-white text-xs font-bold px-2 py-1 rounded">Próximamente</div>
                <h3 className="text-lg font-bold text-slate-900">Integración Proveedor Tecnológico</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="flex flex-col gap-1.5">
                        <label className="text-sm font-semibold text-slate-700">Token API</label>
                        <input type="password" value="****************" readOnly className="w-full rounded-lg border border-slate-200 bg-white py-2.5 px-3 text-sm" />
                    </div>
                    <div className="flex flex-col gap-1.5">
                        <label className="text-sm font-semibold text-slate-700">Test Set ID</label>
                        <input type="text" value="8812903-123-123" readOnly className="w-full rounded-lg border border-slate-200 bg-white py-2.5 px-3 text-sm" />
                    </div>
                </div>
            </div>
        </div>
    );
}
