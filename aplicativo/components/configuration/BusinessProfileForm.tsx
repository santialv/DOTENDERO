"use client";

import { useState, useRef } from "react";
import { BusinessInfo } from "@/types/business";
import { optimizeImage } from "@/lib/imageUtils";

// ... existing imports

const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;

    const originalFile = e.target.files[0];

    // Basic pre-check (limit huge files before processing)
    if (originalFile.size > 10 * 1024 * 1024) {
        alert("El archivo es demasiado grande (máx 10MB)");
        return;
    }

    setUploadingLogo(true);
    try {
        if (!userId) throw new Error("No user ID found");

        // Compress Image
        const compressedFile = await optimizeImage(originalFile);

        const fileExt = "jpg"; // Our optimizer returns jpeg
        const fileName = `logo_${Date.now()}.${fileExt}`;
        const filePath = `${userId}/${fileName}`;

        // Upload Compressed to 'logos' bucket
        const { error: uploadError } = await supabase.storage
            .from('logos')
            .upload(filePath, compressedFile, { upsert: true });

        if (uploadError) throw uploadError;

        // Get Public URL
        const { data: { publicUrl } } = supabase.storage
            .from('logos')
            .getPublicUrl(filePath);

        // Update State
        setBusinessInfo({ ...businessInfo, logoUrl: publicUrl });

    } catch (error: any) {
        console.error(error);
        alert("Error subiendo el logo");
    } finally {
        setUploadingLogo(false);
    }
};

const handleRutUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;

    const file = e.target.files[0];
    if (file.size > 5 * 1024 * 1024) {
        alert("El archivo debe pesar menos de 5MB");
        return;
    }

    setUploadingLogo(true);
    try {
        if (!userId) throw new Error("No user ID found");

        const fileExt = file.name.split('.').pop();
        const fileName = `rut_update_${Date.now()}.${fileExt}`;
        // Use userId folder to comply with RLS
        const filePath = `${userId}/${fileName}`;

        const { error: uploadError } = await supabase.storage
            .from('documents')
            .upload(filePath, file);

        if (uploadError) throw uploadError;

        // Updated Local State
        setBusinessInfo({ ...businessInfo, rutUrl: filePath });
        alert("RUT cargado. Recuerda guardar los cambios.");

    } catch (error: any) {
        console.error(error);
        alert("Error subiendo el RUT: " + error.message);
    } finally {
        setUploadingLogo(false);
    }
};

const openRutLink = async () => {
    if (!businessInfo.rutUrl) return;

    // If it's a full public URL (rare for private buckets unless misconfigured, but handle it)
    if (businessInfo.rutUrl.startsWith("http")) {
        window.open(businessInfo.rutUrl, "_blank");
        return;
    }

    try {
        // Create Signed URL for private bucket
        const { data, error } = await supabase.storage
            .from('documents')
            .createSignedUrl(businessInfo.rutUrl, 60); // 60 seconds valid

        if (error) throw error;
        if (data?.signedUrl) {
            window.open(data.signedUrl, "_blank");
        }
    } catch (e) {
        console.error("Error signing URL:", e);
        alert("No se pudo generar el enlace seguro. Verifica permisos.");
    }
};

return (
    <div className="max-w-4xl grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Logo Section */}
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex flex-col items-center gap-4">
            <h3 className="text-lg font-bold text-slate-900 w-full mb-2">Logotipo</h3>

            <div
                onClick={() => fileInputRef.current?.click()}
                className="w-40 h-40 rounded-full bg-slate-50 border-2 border-dashed border-slate-300 flex flex-col items-center justify-center text-slate-400 cursor-pointer hover:bg-slate-100 hover:border-primary transition-all group relative overflow-hidden"
            >
                {/* Hidden Input */}
                <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleLogoUpload}
                    accept="image/png, image/jpeg, image/jpg, image/webp"
                    className="hidden"
                />

                {uploadingLogo ? (
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                ) : businessInfo.logoUrl ? (
                    <>
                        <img src={businessInfo.logoUrl} alt="Logo Tienda" className="w-full h-full object-cover" />
                        <div className="absolute inset-0 bg-black/30 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                            <span className="material-symbols-outlined text-white text-3xl">edit</span>
                        </div>
                    </>
                ) : (
                    <>
                        <span className="material-symbols-outlined text-4xl group-hover:scale-110 transition-transform">add_a_photo</span>
                        <span className="text-xs font-medium mt-2">Subir Logo</span>
                    </>
                )}
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
                        <div className="flex justify-between">
                            <label className="text-sm font-semibold text-slate-700">Razón Social / Nombre Legal</label>
                            {businessInfo.legalName && (
                                <span className="text-[10px] bg-slate-100 text-slate-500 px-2 py-0.5 rounded-full font-bold">
                                    BLOQUEADO
                                </span>
                            )}
                        </div>
                        <div className="relative">
                            <span className="absolute left-3 top-1/2 -translate-y-1/2 material-symbols-outlined text-slate-400">badge</span>
                            <input
                                type="text"
                                value={businessInfo.legalName}
                                onChange={(e) => setBusinessInfo({ ...businessInfo, legalName: e.target.value })}
                                placeholder="Ej. Carlos Ruiz S.A.S."
                                disabled={!!businessInfo.legalName}
                                className={`w-full rounded-lg border border-slate-200 py-2.5 pl-10 pr-3 text-sm text-slate-900 outline-none transition-all ${!!businessInfo.legalName ? 'bg-slate-100 text-slate-500 cursor-not-allowed' : 'bg-white focus:ring-2 focus:ring-primary'}`}
                            />
                        </div>
                    </div>
                    <div className="flex flex-col gap-1.5">
                        <div className="flex justify-between">
                            <label className="text-sm font-semibold text-slate-700">NIT / Documento</label>
                            {businessInfo.nit && <span className="text-[10px] bg-slate-100 text-slate-500 px-2 py-0.5 rounded-full font-bold">BLOQUEADO</span>}
                        </div>
                        <div className="relative">
                            <span className="absolute left-3 top-1/2 -translate-y-1/2 material-symbols-outlined text-slate-400">fingerprint</span>
                            <input
                                type="text"
                                value={businessInfo.nit}
                                onChange={(e) => setBusinessInfo({ ...businessInfo, nit: e.target.value })}
                                disabled={!!businessInfo.nit}
                                className={`w-full rounded-lg border border-slate-200 py-2.5 pl-10 pr-3 text-sm text-slate-900 outline-none transition-all ${!!businessInfo.nit ? 'bg-slate-100 text-slate-500 cursor-not-allowed' : 'bg-white focus:ring-2 focus:ring-primary'}`}
                            />
                        </div>
                    </div>
                    <div className="flex flex-col gap-1.5">
                        <div className="flex justify-between">
                            <label className="text-sm font-semibold text-slate-700">Tipo de Régimen</label>
                        </div>
                        <div className="relative">
                            <select
                                value={businessInfo.regime}
                                onChange={(e) => setBusinessInfo({ ...businessInfo, regime: e.target.value })}
                                className={`w-full rounded-lg border border-slate-200 py-2.5 pl-3 pr-8 text-sm text-slate-900 focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all appearance-none bg-white`}
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
                    <div className="flex justify-between items-center mb-2">
                        <label className="text-sm font-semibold text-slate-700 block">Documento RUT (DIAN)</label>
                        {businessInfo.rutUrl && (
                            <span className="text-xs text-green-600 font-bold flex items-center gap-1">
                                <span className="material-symbols-outlined text-[16px]">check_circle</span>
                                Cargado
                            </span>
                        )}
                    </div>

                    <input
                        type="file"
                        ref={rutInputRef}
                        onChange={handleRutUpload}
                        accept=".pdf, image/*"
                        className="hidden"
                    />

                    {businessInfo.rutUrl ? (
                        <div className="flex flex-col gap-2">
                            <div className="p-4 bg-slate-50 border border-slate-200 rounded-lg flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 bg-red-100 text-red-600 rounded-lg flex items-center justify-center">
                                        <span className="material-symbols-outlined">description</span>
                                    </div>
                                    <div>
                                        <p className="text-sm font-bold text-slate-800">RUT Actual</p>
                                        <button
                                            onClick={openRutLink}
                                            className="text-xs text-primary hover:underline font-bold text-left"
                                        >
                                            Ver / Descargar Documento
                                        </button>
                                    </div>
                                </div>
                                <button
                                    onClick={() => rutInputRef.current?.click()}
                                    className="text-xs text-slate-500 hover:text-slate-900 font-bold border border-slate-200 px-3 py-1.5 rounded-lg bg-white"
                                >
                                    Reemplazar
                                </button>
                            </div>
                        </div>
                    ) : (
                        <div
                            onClick={() => rutInputRef.current?.click()}
                            className="border-2 border-dashed border-slate-300 rounded-lg p-6 flex flex-col items-center justify-center text-center cursor-pointer hover:bg-white hover:border-primary transition-colors group bg-white/50"
                        >
                            <span className="material-symbols-outlined text-4xl text-slate-400 group-hover:text-primary mb-2">upload_file</span>
                            <p className="text-sm font-medium text-slate-700">Haz clic para subir tu RUT (PDF)</p>
                            <p className="text-xs text-slate-500 mt-1">Sube el archivo PDF oficial descargado de la DIAN.</p>
                        </div>
                    )}
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
