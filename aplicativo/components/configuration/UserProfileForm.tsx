"use client";

export function UserProfileForm() {
    return (
        <div className="max-w-4xl bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
            <h3 className="text-lg font-bold text-slate-900 mb-6">Mi Perfil</h3>
            <div className="flex items-start gap-6">
                <div className="w-20 h-20 rounded-full bg-slate-200 bg-cover shrink-0" style={{ backgroundImage: "url('https://lh3.googleusercontent.com/aida-public/AB6AXuDw5mwhe7jy2edaIS6zXjemObgNFmMEdbIgrF0lOg3q07bSmDuq3YoPOxoGGmZdRLcaPgOasAdHqnbWGar4vQdmVPgspxvsgwXt6lFX3pu9h3C636MPj7j_grZ_3Y6MWI_HVSR5gY6uLID7Z_HLNEVUJytTIXzIgnZrp9banoIjFJcrIa-c6bgz0ex1IeJAesOicTUwjMuD8uJnHnwIHMPgpC3kfCH20rw0nRhA2hEqMgVOUt57goo98PFourOlzWB-icnHtgDwbNA')" }}></div>
                <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="flex flex-col gap-1.5">
                        <label className="text-sm font-semibold text-slate-700">Nombre Completo</label>
                        <input type="text" defaultValue="Carlos Ruiz" className="w-full rounded-lg border border-slate-200 bg-slate-50 py-2.5 px-3 text-sm text-slate-900 outline-none" />
                    </div>
                    <div className="flex flex-col gap-1.5">
                        <label className="text-sm font-semibold text-slate-700">Rol</label>
                        <input type="text" defaultValue="Administrador" disabled className="w-full rounded-lg border border-slate-200 bg-slate-100 py-2.5 px-3 text-sm text-slate-500 outline-none" />
                    </div>
                    <div className="flex flex-col gap-1.5">
                        <label className="text-sm font-semibold text-slate-700">Contraseña Actual</label>
                        <input type="password" placeholder="••••••••" className="w-full rounded-lg border border-slate-200 bg-slate-50 py-2.5 px-3 text-sm text-slate-900 outline-none" />
                    </div>
                    <div className="flex flex-col gap-1.5">
                        <label className="text-sm font-semibold text-slate-700">Nueva Contraseña</label>
                        <input type="password" placeholder="••••••••" className="w-full rounded-lg border border-slate-200 bg-slate-50 py-2.5 px-3 text-sm text-slate-900 outline-none" />
                    </div>
                    <div className="flex flex-col gap-1.5">
                        <label className="text-sm font-semibold text-slate-700">Ciudad de Residencia</label>
                        <input type="text" placeholder="Ej. Bogotá D.C." className="w-full rounded-lg border border-slate-200 bg-slate-50 py-2.5 px-3 text-sm text-slate-900 outline-none" />
                    </div>
                    <div className="flex flex-col gap-1.5">
                        <label className="text-sm font-semibold text-slate-700">Dirección de Residencia</label>
                        <input type="text" placeholder="Ej. Calle 123 # 45-67" className="w-full rounded-lg border border-slate-200 bg-slate-50 py-2.5 px-3 text-sm text-slate-900 outline-none" />
                    </div>
                </div>
            </div>
        </div>
    );
}
