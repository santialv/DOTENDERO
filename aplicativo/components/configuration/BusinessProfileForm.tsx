"use client";

import { BusinessInfo } from "@/hooks/useConfiguration";
import { CIIU_ACTIVITIES } from "@/lib/ciiu";
import { COLOMBIA_CITIES } from "@/lib/cities";

interface BusinessProfileFormProps {
    businessInfo: BusinessInfo;
    setBusinessInfo: (info: BusinessInfo) => void;
}

export function BusinessProfileForm({ businessInfo, setBusinessInfo }: BusinessProfileFormProps) {
    return (
        <div className="max-w-4xl grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Logo Section */}
            <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex flex-col items-center gap-4">
                <h3 className="text-lg font-bold text-slate-900 w-full mb-2">Logotipo</h3>
                <div className="w-40 h-40 rounded-full bg-slate-100 border-2 border-dashed border-slate-300 flex flex-col items-center justify-center text-slate-400 cursor-pointer hover:bg-slate-50 hover:border-primary transition-all group relative overflow-hidden">
                    <span className="material-symbols-outlined text-4xl group-hover:scale-110 transition-transform">add_a_photo</span>
                    <span className="text-xs font-medium mt-2">Subir Logo</span>
                </div>
                <p className="text-xs text-slate-400 text-center">Recomendado: 500x500px, PNG o JPG.<br />Este logo aparecerá en facturas e informes.</p>
            </div>

            {/* Basic Info Section */}
            <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex flex-col gap-4">
                <h3 className="text-lg font-bold text-slate-900 mb-2">Información del Negocio</h3>

                {/* Legal Info */}
                <div className="p-4 bg-slate-50 rounded-lg border border-slate-200 flex flex-col gap-4 mb-2">
                    <div className="flex items-center gap-2 mb-1">
                        <span className="material-symbols-outlined text-primary">gavel</span>
                        <span className="text-sm font-bold text-slate-900">Datos Legales</span>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-5">
                        <div className="flex flex-col gap-1.5 col-span-2 md:col-span-2">
                            <label className="text-sm font-semibold text-slate-700">Razón Social / Nombre Legal</label>
                            <div className="relative">
                                <span className="absolute left-3 top-1/2 -translate-y-1/2 material-symbols-outlined text-slate-400">badge</span>
                                <input
                                    type="text"
                                    value={businessInfo.legalName}
                                    onChange={(e) => setBusinessInfo({ ...businessInfo, legalName: e.target.value })}
                                    placeholder="Ej. Carlos Ruiz S.A.S."
                                    className="w-full rounded-lg border border-slate-200 bg-white py-2.5 pl-10 pr-3 text-sm text-slate-900 focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all"
                                />
                            </div>
                        </div>
                        <div className="flex flex-col gap-1.5">
                            <label className="text-sm font-semibold text-slate-700">NIT / Documento</label>
                            <div className="relative">
                                <span className="absolute left-3 top-1/2 -translate-y-1/2 material-symbols-outlined text-slate-400">fingerprint</span>
                                <input
                                    type="text"
                                    value={businessInfo.nit}
                                    onChange={(e) => setBusinessInfo({ ...businessInfo, nit: e.target.value })}
                                    className="w-full rounded-lg border border-slate-200 bg-white py-2.5 pl-10 pr-3 text-sm text-slate-900 focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all"
                                />
                            </div>
                        </div>
                        <div className="flex flex-col gap-1.5">
                            <label className="text-sm font-semibold text-slate-700">Tipo de Régimen</label>
                            <div className="relative">
                                <select
                                    value={businessInfo.regime}
                                    onChange={(e) => setBusinessInfo({ ...businessInfo, regime: e.target.value })}
                                    className="w-full rounded-lg border border-slate-200 bg-white py-2.5 pl-3 pr-8 text-sm text-slate-900 focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all appearance-none"
                                >
                                    <option value="No Responsable de IVA">No Responsable de IVA</option>
                                    <option value="Responsable de IVA">Responsable de IVA</option>
                                    <option value="Régimen Simple">Régimen Simple</option>
                                    <option value="Gran Contribuyente">Gran Contribuyente</option>
                                </select>
                                <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none flex items-center text-slate-400">
                                    <span className="material-symbols-outlined text-[20px]">expand_more</span>
                                </div>
                            </div>
                        </div>
                        <div className="flex flex-col gap-1.5 col-span-2 md:col-span-2 relative">
                            <label className="text-sm font-semibold text-slate-700">CIIU / Actividad Económica</label>
                            <div className="relative">
                                <span className="absolute left-3 top-1/2 -translate-y-1/2 material-symbols-outlined text-slate-400">work</span>
                                <input
                                    type="text"
                                    value={businessInfo.activityCode}
                                    onChange={(e) => setBusinessInfo({ ...businessInfo, activityCode: e.target.value })}
                                    placeholder="Buscar por código (4711) o nombre (Tienda)..."
                                    className="w-full rounded-lg border border-slate-200 bg-white py-2.5 pl-10 pr-3 text-sm text-slate-900 focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all"
                                />
                            </div>
                            {/* Autocomplete Suggestions */}
                            {businessInfo.activityCode && !CIIU_ACTIVITIES.some(c => `${c.code} - ${c.name}` === businessInfo.activityCode) && (
                                <div className="absolute top-full left-0 right-0 z-10 mt-1 max-h-48 overflow-auto bg-white border border-slate-200 rounded-lg shadow-lg">
                                    {CIIU_ACTIVITIES.filter(c =>
                                        c.code.includes(businessInfo.activityCode) ||
                                        c.name.toLowerCase().includes(businessInfo.activityCode.toLowerCase())
                                    ).map(activity => (
                                        <div
                                            key={activity.code}
                                            onClick={() => setBusinessInfo({ ...businessInfo, activityCode: `${activity.code} - ${activity.name}` })}
                                            className="px-4 py-2 hover:bg-slate-50 cursor-pointer text-sm text-slate-700 border-b border-slate-50 last:border-0"
                                        >
                                            <span className="font-bold text-primary">{activity.code}</span> - {activity.name}
                                        </div>
                                    ))}
                                    {CIIU_ACTIVITIES.filter(c => c.code.includes(businessInfo.activityCode) || c.name.toLowerCase().includes(businessInfo.activityCode.toLowerCase())).length === 0 && (
                                        <div className="px-4 py-2 text-xs text-slate-400 italic">No se encontraron actividades. Intenta con "Tienda", "4711", etc.</div>
                                    )}
                                </div>
                            )}
                        </div>
                    </div>

                    {/* RUT Upload */}
                    <div className="border-t border-slate-200 pt-4 mt-2">
                        <label className="text-sm font-semibold text-slate-700 mb-2 block">Documento RUT (DIAN)</label>
                        <div className="border-2 border-dashed border-slate-300 rounded-lg p-6 flex flex-col items-center justify-center text-center cursor-pointer hover:bg-white hover:border-primary transition-colors group bg-white/50">
                            <span className="material-symbols-outlined text-4xl text-slate-400 group-hover:text-primary mb-2">upload_file</span>
                            <p className="text-sm font-medium text-slate-700">Haz clic para subir tu RUT (PDF)</p>
                            <p className="text-xs text-slate-500 mt-1">Nuestra IA analizará este documento para completar tu perfil automáticamente.</p>
                        </div>
                    </div>
                </div>

                <div className="flex flex-col gap-1.5">
                    <label className="text-sm font-semibold text-slate-700">Nombre Comercial del Negocio</label>
                    <input
                        type="text"
                        value={businessInfo.name}
                        onChange={(e) => setBusinessInfo({ ...businessInfo, name: e.target.value })}
                        className="w-full rounded-lg border border-slate-200 bg-slate-50 py-2.5 px-3 text-sm text-slate-900 focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all"
                    />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="flex flex-col gap-1.5">
                        <label className="text-sm font-semibold text-slate-700">Teléfono</label>
                        <input
                            type="text"
                            value={businessInfo.phone}
                            onChange={(e) => setBusinessInfo({ ...businessInfo, phone: e.target.value })}
                            className="w-full rounded-lg border border-slate-200 bg-slate-50 py-2.5 px-3 text-sm text-slate-900 focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all"
                        />
                    </div>
                    <div className="flex flex-col gap-1.5">
                        <label className="text-sm font-semibold text-slate-700">Email Contacto</label>
                        <input
                            type="email"
                            value={businessInfo.email}
                            onChange={(e) => setBusinessInfo({ ...businessInfo, email: e.target.value })}
                            className="w-full rounded-lg border border-slate-200 bg-slate-50 py-2.5 px-3 text-sm text-slate-900 focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all"
                        />
                    </div>
                    <div className="flex flex-col gap-1.5">
                        <label className="text-sm font-semibold text-slate-700">Ciudad / Municipio</label>
                        <div className="relative">
                            <select
                                value={businessInfo.city}
                                onChange={(e) => setBusinessInfo({ ...businessInfo, city: e.target.value })}
                                className="w-full rounded-lg border border-slate-200 bg-slate-50 py-2.5 pl-3 pr-8 text-sm text-slate-900 focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all appearance-none"
                            >
                                <option disabled value="">Seleccionar ciudad</option>
                                {COLOMBIA_CITIES.map(city => (
                                    <option key={city} value={city}>{city}</option>
                                ))}
                            </select>
                            <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none flex items-center text-slate-400">
                                <span className="material-symbols-outlined text-[20px]">expand_more</span>
                            </div>
                        </div>
                    </div>
                    <div className="flex flex-col gap-1.5">
                        <label className="text-sm font-semibold text-slate-700">Dirección</label>
                        <input
                            type="text"
                            value={businessInfo.address}
                            onChange={(e) => setBusinessInfo({ ...businessInfo, address: e.target.value })}
                            className="w-full rounded-lg border border-slate-200 bg-slate-50 py-2.5 px-3 text-sm text-slate-900 focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all"
                        />
                    </div>
                </div>
            </div>
        </div>
    );
}
