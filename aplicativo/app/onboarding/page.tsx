"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { useToast } from "@/components/ui/toast";
import { COLOMBIA_CITIES } from "@/lib/cities";
import { CIIU_ACTIVITIES } from "@/lib/ciiu";

// Types
type OnboardingData = {
    storeName: string;
    legalName: string;
    nit: string;
    city: string;
    regime: string;
    activityCode: string;
    address: string;
    phone: string;
    rutPath?: string; // New field
};

export default function OnboardingPage() {
    const router = useRouter();
    const { toast } = useToast();
    const [step, setStep] = useState(1);
    const [loading, setLoading] = useState(false);
    const [uploading, setUploading] = useState(false); // New state
    const [userId, setUserId] = useState<string | null>(null);
    const [userEmail, setUserEmail] = useState<string | null>(null);
    const [data, setData] = useState<OnboardingData>({
        storeName: "",
        legalName: "",
        nit: "",
        city: "",
        regime: "No Responsable de IVA",
        activityCode: "",
        address: "",
        phone: "",
        rutPath: ""
    });

    // Save state on change
    useEffect(() => {
        localStorage.setItem("onboarding_data", JSON.stringify(data));
        localStorage.setItem("onboarding_step", step.toString());
    }, [data, step]);

    const handleNext = () => {
        if (step === 1 && !data.storeName) return toast("Por favor escribe el nombre de tu tienda", "error");
        if (step === 2 && (!data.nit || !data.city)) return toast("Estos datos son necesarios para la facturación", "error");
        if (step === 3 && (!data.activityCode)) return toast("Selecciona tu actividad económica", "error");
        // Step 4 is Upload, optional
        if (step === 5 && (!data.address || !data.phone)) return toast("Completa los datos de contacto", "error");

        if (step === 5) {
            handleFinalSubmit();
        } else {
            setStep(prev => prev + 1);
        }
    };

    const handleFinalSubmit = async () => {
        console.log("[1] INICIO SUBMIT - Debug Mode");

        if (!userId) {
            toast("Error: Sesión perdida. Recarga.", "error");
            return;
        }

        setStep(6);
        setLoading(true);

        try {
            // PASO 1: PERFIL
            console.log("[2] Buscando Perfil...");
            const { data: profile } = await supabase.from('profiles').select('organization_id').eq('id', userId).maybeSingle();
            let orgId = profile?.organization_id;

            if (!profile) {
                console.log("[2.1] Creando Perfil fantasma...");
                await supabase.from('profiles').insert({
                    id: userId,
                    email: userEmail || 'debug@user.com',
                    role: 'admin'
                });
            }
            console.log("[3] Perfil OK. OrgID actual:", orgId);

            // PASO 2: ORGANIZACIÓN (INSERT)
            if (!orgId) {
                console.log("[4] Insertando Organización...");
                const { data: newOrg, error: insertError } = await supabase.from('organizations').insert({
                    name: data.storeName,
                    legal_name: data.legalName,
                    created_at: new Date().toISOString(),
                    nit: data.nit,
                    email: userEmail,
                }).select().single();

                if (insertError) {
                    console.error("!!! ERROR EN INSERT [4]:", insertError);
                    throw insertError;
                }

                orgId = newOrg.id;
                console.log("[5] Org Creada con ID:", orgId);

                // VINCULAR
                console.log("[6] Vinculando Perfil -> Org...");
                const { error: linkError } = await supabase.from('profiles').update({ organization_id: orgId }).eq('id', userId);
                if (linkError) console.error("!!! ERROR EN LINK [6]:", linkError);
            }

            // PASO 3: UPDATE FINAL
            if (orgId) {
                console.log("[7] Iniciando Update Final...");
                const { error: updateError } = await supabase.from('organizations').update({
                    name: data.storeName,
                    legal_name: data.legalName,
                    nit: data.nit,
                    city: data.city,
                    regime: data.regime || 'No Responsable de IVA',
                    activity_code: data.activityCode,
                    address: data.address,
                    phone: data.phone,
                    email: userEmail,
                    rut_url: data.rutPath // Save RUT path
                }).eq('id', orgId);

                if (updateError) throw updateError;
            } else {
                throw new Error("No Organization ID");
            }

            console.log("[8] ¡EXITO TOTAL!");
            localStorage.removeItem("onboarding_data");
            localStorage.removeItem("onboarding_step");
            setLoading(false);
            setStep(7);

        } catch (error: any) {
            console.error("!!! CRASH FINAL:", error);
            toast("Error Técnico: " + error.message, "error");
            setLoading(false);
        }
    };

    // Initialize Session
    useEffect(() => {
        const initSession = async () => {
            const { data: { session } } = await supabase.auth.getSession();
            if (session?.user) {
                setUserId(session.user.id);
                setUserEmail(session.user.email || "");
            }
        };
        initSession();
    }, []);

    // AUTO-RECOVERY: Check if user already has a store but profile is broken
    useEffect(() => {
        const attemptRecovery = async () => {

            const { data: { session } } = await supabase.auth.getSession();
            if (!session?.user?.email) return;

            // Check if email owns an org
            const { data: existingOrg } = await supabase
                .from('organizations')
                .select('id, name')
                .eq('email', session.user.email)
                .single();

            if (existingOrg) {
                console.log("¡Recuperación! Tienda encontrada:", existingOrg);
                toast(`Tienda encontrada: ${existingOrg.name}. Reconectando...`, "info");

                // Fix Profile
                await supabase
                    .from('profiles')
                    .update({ organization_id: existingOrg.id })
                    .eq('id', session.user.id);

                // Redirect
                window.location.href = "/venta";
            }
        };
        attemptRecovery();
    }, []);

    const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        if (!e.target.files || e.target.files.length === 0) return;

        const file = e.target.files[0];
        if (file.size > 5 * 1024 * 1024) return toast("El archivo es muy pesado (Max 5MB)", "error");

        setUploading(true);
        try {
            const fileExt = file.name.split('.').pop();
            const fileName = `${Date.now()}.${fileExt}`;
            const filePath = `${userId}/${fileName}`;

            const { error: uploadError } = await supabase.storage
                .from('documents')
                .upload(filePath, file);

            if (uploadError) throw uploadError;

            setData({ ...data, rutPath: filePath });
            toast("RUT subido correctamente", "success");
        } catch (error: any) {
            console.error(error);
            toast("Error subiendo el archivo: " + error.message, "error");
        } finally {
            setUploading(false);
        }
    };

    // --- Render Steps ---

    const renderStep1 = () => (
        <div className="flex flex-col gap-6 animate-in slide-in-from-right duration-500">
            <div className="text-center">
                <div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center mx-auto mb-4 text-primary">
                    <span className="material-symbols-outlined text-4xl">storefront</span>
                </div>
                <h2 className="text-2xl font-black text-slate-900">¿Cómo se llama tu negocio?</h2>
                <p className="text-slate-500 mt-2">Démosle una identidad a tu nueva tienda digital.</p>
            </div>
            <div>
                <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Nombre de la Tienda</label>
                <input
                    type="text"
                    value={data.storeName}
                    onChange={e => setData({ ...data, storeName: e.target.value })}
                    placeholder="Ej. Supermercado El Vecino"
                    className="w-full text-lg font-bold border-b-2 border-slate-200 focus:border-primary outline-none py-2 bg-transparent transition-colors placeholder:font-normal"
                    autoFocus
                />
            </div>
        </div>
    );

    const renderStep2 = () => (
        <div className="flex flex-col gap-6 animate-in slide-in-from-right duration-500">
            <div className="text-center">
                <div className="w-16 h-16 bg-blue-100 rounded-2xl flex items-center justify-center mx-auto mb-4 text-blue-600">
                    <span className="material-symbols-outlined text-4xl">receipt_long</span>
                </div>
                <h2 className="text-2xl font-black text-slate-900">Datos Legales Básicos</h2>
                <p className="text-slate-500 mt-2">Necesarios para generar tus facturas e inventario correctamente.</p>
            </div>
            <div className="flex flex-col gap-4">
                <div className="p-4 bg-orange-50 border border-orange-200 rounded-xl flex gap-3 text-orange-800 text-sm mb-2 animate-in fade-in duration-500">
                    <span className="material-symbols-outlined text-orange-600 shrink-0">warning</span>
                    <p>Ten mucho cuidado: La <strong>Razón Social</strong> y el <strong>NIT</strong> no se podrán editar después de crear la tienda.</p>
                </div>
                <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Razón Social / Nombre Legal</label>
                    <input
                        type="text"
                        value={data.legalName}
                        onChange={e => setData({ ...data, legalName: e.target.value })}
                        placeholder="Ej. Carlos Ruiz o Inversiones SAS"
                        className="w-full h-12 px-4 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:border-primary outline-none transition-all"
                    />
                </div>
                <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase mb-2">NIT o Documento</label>
                    <input
                        type="text"
                        value={data.nit}
                        onChange={e => setData({ ...data, nit: e.target.value })}
                        placeholder="Ej. 900.123.456-7"
                        className="w-full h-12 px-4 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:border-primary outline-none transition-all"
                    />
                </div>
                <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Ciudad</label>
                    <div className="relative">
                        <select
                            value={data.city}
                            onChange={e => setData({ ...data, city: e.target.value })}
                            className="w-full h-12 px-4 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:border-primary outline-none transition-all appearance-none"
                        >
                            <option value="">Seleccionar Ciudad</option>
                            {COLOMBIA_CITIES.map(c => <option key={c} value={c}>{c}</option>)}
                        </select>
                        <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
                            <span className="material-symbols-outlined">expand_more</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );

    const renderStep3 = () => (
        <div className="flex flex-col gap-6 animate-in slide-in-from-right duration-500">
            <div className="text-center">
                <div className="w-16 h-16 bg-emerald-100 rounded-2xl flex items-center justify-center mx-auto mb-4 text-emerald-600">
                    <span className="material-symbols-outlined text-4xl">account_balance</span>
                </div>
                <h2 className="text-2xl font-black text-slate-900">Perfil Tributario</h2>
                <p className="text-slate-500 mt-2">Ayudanos a configurar tus impuestos correctamente.</p>
            </div>
            <div className="flex flex-col gap-6">
                <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Régimen</label>
                    <div className="relative">
                        <select
                            value={data.regime}
                            onChange={e => setData({ ...data, regime: e.target.value })}
                            className="w-full h-14 px-4 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:border-primary outline-none transition-all appearance-none text-sm font-medium"
                        >
                            <option value="No Responsable de IVA">No Responsable de IVA (Simplificado)</option>
                            <option value="Responsable de IVA">Responsable de IVA (Común)</option>
                            <option value="Régimen Simple">Régimen Simple</option>
                            <option value="Gran Contribuyente">Gran Contribuyente</option>
                        </select>
                        <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
                            <span className="material-symbols-outlined">expand_more</span>
                        </div>
                    </div>
                    <p className="text-xs text-slate-400 mt-2 ml-1">
                        Si tienes una tienda pequeña de barrio, usualmente es <span className="font-bold text-slate-600">No Responsable de IVA</span>.
                    </p>
                </div>

                <div className="relative">
                    <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Actividad Económica (CIIU)</label>
                    <input
                        type="text"
                        value={data.activityCode}
                        onChange={e => setData({ ...data, activityCode: e.target.value })}
                        placeholder="Ej. Tienda, Panadería, Droguería..."
                        className="w-full h-14 px-4 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:border-primary outline-none transition-all"
                    />

                    {/* Activity Suggestions */}
                    {data.activityCode && !CIIU_ACTIVITIES.some(c => `${c.code} - ${c.name}` === data.activityCode) && (
                        <div className="absolute top-full left-0 right-0 z-20 mt-2 max-h-60 overflow-y-auto bg-white border border-slate-100 rounded-xl shadow-xl">
                            {CIIU_ACTIVITIES.filter(c =>
                                c.name.toLowerCase().includes(data.activityCode.toLowerCase()) ||
                                c.code.includes(data.activityCode)
                            ).map(activity => (
                                <button
                                    key={activity.code}
                                    onClick={() => setData({ ...data, activityCode: `${activity.code} - ${activity.name}` })}
                                    className="w-full text-left px-4 py-3 hover:bg-slate-50 border-b border-slate-50 last:border-0 text-sm transition-colors flex flex-col items-start"
                                >
                                    <span className="font-bold text-emerald-600 mb-0.5">{activity.code}</span>
                                    <span className="text-slate-600">{activity.name}</span>
                                </button>
                            ))}
                            {CIIU_ACTIVITIES.filter(c => c.name.toLowerCase().includes(data.activityCode.toLowerCase()) || c.code.includes(data.activityCode)).length === 0 && (
                                <div className="p-4 text-sm text-slate-400 text-center italic">
                                    No encontramos resultados. Intenta con "4711" (Tiendas).
                                </div>
                            )}
                        </div>
                    )}

                    <p className="text-xs text-slate-400 mt-2 ml-1">
                        Escribe "Tienda", "Droguería", o el número si lo sabes.
                    </p>
                </div>
            </div>
        </div>
    );

    const renderStep4 = () => (
        <div className="flex flex-col gap-6 animate-in slide-in-from-right duration-500">
            <div className="text-center">
                <div className="w-16 h-16 bg-orange-100 rounded-2xl flex items-center justify-center mx-auto mb-4 text-orange-600">
                    <span className="material-symbols-outlined text-4xl">upload_file</span>
                </div>
                <h2 className="text-2xl font-black text-slate-900">Sube tu RUT</h2>
                <p className="text-slate-500 mt-2">Nuestra Inteligencia Artificial puede extraer tus datos automáticamente (Opcional).</p>
            </div>

            <label className={`block border-2 border-dashed ${data.rutPath ? 'border-[#00E054] bg-green-50' : 'border-slate-300 bg-slate-50'} rounded-2xl p-8 flex flex-col items-center justify-center hover:bg-slate-100 hover:border-primary transition-all cursor-pointer group relative`}>
                <input
                    type="file"
                    accept=".pdf,image/*"
                    className="hidden"
                    onChange={handleFileUpload}
                    disabled={uploading}
                />

                {uploading ? (
                    <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary mb-3"></div>
                ) : data.rutPath ? (
                    <span className="material-symbols-outlined text-5xl text-[#00E054] mb-3">check_circle</span>
                ) : (
                    <span className="material-symbols-outlined text-5xl text-slate-400 group-hover:text-primary mb-3 transition-colors">cloud_upload</span>
                )}

                <p className="font-bold text-slate-700">
                    {uploading ? "Subiendo..." : data.rutPath ? "Archivo Cargado Correctamente" : "Haz clic para subir archivo PDF"}
                </p>
                <p className="text-xs text-slate-400 mt-1">Máximo 5MB</p>
            </label>

            {data.rutPath && (
                <button onClick={() => setStep(step + 1)} className="w-full py-3 bg-slate-900 text-white font-bold rounded-xl shadow-lg">
                    Continuar
                </button>
            )}

            {!data.rutPath && (
                <button onClick={() => setStep(step + 1)} className="text-sm font-bold text-slate-500 hover:text-slate-800 underline">
                    Omitir este paso por ahora
                </button>
            )}
        </div>
    );

    const renderStep5 = () => (
        <div className="flex flex-col gap-6 animate-in slide-in-from-right duration-500">
            <div className="text-center">
                <div className="w-16 h-16 bg-purple-100 rounded-2xl flex items-center justify-center mx-auto mb-4 text-purple-600">
                    <span className="material-symbols-outlined text-4xl">location_on</span>
                </div>
                <h2 className="text-2xl font-black text-slate-900">Contacto</h2>
                <p className="text-slate-500 mt-2">Para que tus clientes y proveedores te encuentren.</p>
            </div>
            <div className="flex flex-col gap-4">
                <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Dirección del Local</label>
                    <input
                        type="text"
                        value={data.address}
                        onChange={e => setData({ ...data, address: e.target.value })}
                        placeholder="Ej. Calle 123 # 45 - 67"
                        className="w-full h-12 px-4 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:border-primary outline-none transition-all"
                    />
                </div>
                <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Teléfono / WhatsApp</label>
                    <input
                        type="tel"
                        value={data.phone}
                        onChange={e => setData({ ...data, phone: e.target.value })}
                        placeholder="Ej. 300 123 4567"
                        className="w-full h-12 px-4 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:border-primary outline-none transition-all"
                    />
                </div>
            </div>
        </div>
    );

    const renderLoading = () => (
        <div className="flex flex-col items-center justify-center py-10 animate-in fade-in duration-700">
            <div className="relative w-24 h-24 mb-6">
                <div className="absolute inset-0 border-4 border-slate-100 rounded-full"></div>
                <div className="absolute inset-0 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
            </div>
            <h2 className="text-2xl font-black text-slate-900 mb-2">Creando tu Tienda...</h2>
            <p className="text-slate-500 max-w-sm text-center">Nuestra IA está configurando tu base de datos y optimizando tu inventario.</p>
        </div>
    );

    const renderManifesto = () => (
        <div className="w-full max-w-4xl animate-in zoom-in-95 duration-700 relative z-10">
            {/* Success Badge */}
            <div className="absolute top-6 right-6 z-20">
                <span className="bg-[#00E054] text-slate-900 text-xs font-black px-3 py-1 rounded-full uppercase tracking-wider shadow-sm">
                    ¡Éxito!
                </span>
            </div>

            <div className="bg-white rounded-3xl shadow-xl overflow-hidden">
                {/* Header Image */}
                <div className="relative h-40 w-full bg-orange-100">
                    <div className="absolute inset-0 bg-gradient-to-b from-[#FFCFA3] to-[#FFE8D1] flex items-end justify-center overflow-hidden">
                        <div className="w-full h-full relative opacity-90">
                            <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1572074558284-59cb79339e08?q=80&w=2000&auto=format&fit=crop')] bg-cover bg-center opacity-80 mix-blend-overlay"></div>
                            <div className="absolute inset-x-0 bottom-0 h-32 bg-gradient-to-t from-white to-transparent"></div>
                        </div>
                    </div>
                </div>

                <div className="p-6 md:p-10 text-center relative">
                    <h4 className="text-[#00E054] font-bold text-sm tracking-widest uppercase mb-2">Tu camino hacia la digitalización comienza aquí</h4>
                    <h1 className="text-4xl md:text-5xl font-black text-slate-900 mb-6 leading-tight">
                        ¡Bienvenido a la Familia <br />
                        <span className="text-[#00E054]">DonTendero</span>!
                    </h1>

                    <p className="text-slate-500 text-lg max-w-2xl mx-auto mb-10 leading-relaxed">
                        Nuestra meta es digitalizar el comercio de barrio. Estamos construyendo algo grande, y tú eres parte de ello.
                    </p>

                    <div className="flex flex-col md:flex-row items-center justify-center gap-6">
                        <button
                            onClick={async () => {
                                // Lógica de Reparación Just-in-Time
                                setLoading(true);
                                toast("Preparando tu tienda...", "info");

                                try {
                                    // 1. Verificar/Crear Org
                                    const { data: profile } = await supabase.from('profiles').select('organization_id').eq('id', userId).maybeSingle();

                                    if (!profile?.organization_id) {
                                        // Crear Org
                                        const { data: newOrg } = await supabase.from('organizations').insert({
                                            name: data.storeName || "Mi Tienda Nueva",
                                            created_at: new Date().toISOString(),
                                            nit: data.nit,
                                            city: data.city,
                                            regime: data.regime || 'No Responsable de IVA',
                                        }).select().single();

                                        if (newOrg) {
                                            await supabase.from('profiles').update({ organization_id: newOrg.id }).eq('id', userId);
                                        }
                                    }

                                    // 2. Redirigir ahora sí seguro
                                    window.location.href = "/venta";

                                } catch (e) {
                                    console.error("Error final:", e);
                                    router.push("/venta");
                                }
                            }}
                            className="h-14 px-8 bg-[#00E054] hover:bg-[#00c94a] text-slate-900 text-lg font-black rounded-lg transition-all shadow-lg shadow-green-500/30 hover:shadow-green-500/40 hover:-translate-y-1 active:scale-95 flex items-center gap-2"
                        >
                            Ir a mi Tienda
                            <span className="material-symbols-outlined font-bold">arrow_forward</span>
                        </button>

                        <button className="flex items-center gap-2 text-slate-500 font-bold hover:text-slate-800 transition-colors">
                            <span className="material-symbols-outlined text-xl">help</span>
                            Ver Tutorial
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );

    return (
        <div className="min-h-screen bg-[#F3F9F4] font-display relative overflow-y-auto overflow-x-hidden flex flex-col">

            {/* Floating Background Decor (Only visible on Step 7) */}
            {step === 7 && (
                <>
                    {/* Left Icon */}
                    <div className="absolute top-40 left-10 md:left-20 animate-in fade-in slide-in-from-left duration-1000 delay-300 pointer-events-none">
                        <div className="w-24 h-24 bg-[#B8F3C5] rounded-2xl rotate-12 flex items-center justify-center opacity-80">
                            <span className="material-symbols-outlined text-5xl text-white">storefront</span>
                        </div>
                    </div>
                    {/* Right Stars */}
                    <div className="absolute bottom-20 right-10 md:right-20 animate-in fade-in slide-in-from-right duration-1000 delay-500 pointer-events-none">
                        <div className="relative w-24 h-24 text-[#B8F3C5]">
                            <span className="material-symbols-outlined absolute top-0 right-0 text-5xl animate-bounce">star</span>
                            <span className="material-symbols-outlined absolute bottom-0 left-0 text-3xl animate-pulse">star</span>
                        </div>
                    </div>
                </>
            )}

            {/* Top Navigation */}
            <div className="w-full px-6 py-4 flex items-center justify-between z-20 shrink-0">
                <div className="flex items-center gap-2 text-slate-900 font-black text-xl">
                    <div className="w-8 h-8 bg-[#00E054] rounded-lg flex items-center justify-center text-white">
                        <span className="material-symbols-outlined text-sm">change_history</span>
                    </div>
                    DonTendero
                </div>
                {/* Profile Placeholder */}
                <div className="flex items-center gap-4">
                    <button className="w-10 h-10 rounded-full bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-slate-600 transition-colors">
                        <span className="material-symbols-outlined">notifications</span>
                    </button>
                    <div className="w-10 h-10 rounded-full bg-slate-200 border-2 border-white shadow-sm flex items-center justify-center overflow-hidden">
                        <span className="material-symbols-outlined text-slate-400">person</span>
                    </div>
                </div>
            </div>

            {/* Main Content Area */}
            <div className="flex-1 flex flex-col items-center justify-center p-4 relative z-10 pb-20">

                {/* Floating Progress Bar (Steps 1-6) */}
                {step < 7 && (
                    <div className="w-full max-w-lg mb-8 animate-in fade-in slide-in-from-top duration-500 shrink-0">
                        <div className="bg-white rounded-2xl p-4 shadow-sm border border-slate-100 flex items-center gap-4">
                            <div className="flex-1">
                                <div className="flex justify-between text-xs font-bold text-slate-500 uppercase mb-2">
                                    <span>Progreso de Registro</span>
                                    <span>{Math.round((step / 6) * 100)}%</span>
                                </div>
                                <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                                    <div
                                        className="h-full bg-[#00E054] transition-all duration-500 ease-out rounded-full"
                                        style={{ width: `${(step / 6) * 100}%` }}
                                    ></div>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* Final Step Progress (Success Capsule) - Floating above card */}
                {step === 7 && (
                    <div className="w-full max-w-4xl mb-6 animate-in slide-in-from-top duration-700 delay-200 px-4 md:px-0 shrink-0">
                        <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-3 shadow-sm border border-green-100 flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center text-green-600">
                                    <span className="material-symbols-outlined text-lg">check_circle</span>
                                </div>
                                <div>
                                    <p className="text-sm font-bold text-slate-800 leading-tight">Registro Exitoso</p>
                                </div>
                            </div>
                            <span className="font-black text-green-600 text-sm bg-green-50 px-2 py-1 rounded-md">100%</span>
                        </div>
                    </div>
                )}

                {/* Render Active Step */}
                <div className="w-full flex justify-center px-4">
                    {step < 7 ? (
                        // Form Steps Card
                        <div className="w-full max-w-lg bg-white rounded-3xl shadow-xl overflow-hidden p-6 md:p-10 relative transition-all duration-300">
                            {step === 1 && renderStep1()}
                            {step === 2 && renderStep2()}
                            {step === 3 && renderStep3()}
                            {step === 4 && renderStep4()}
                            {step === 5 && renderStep5()}
                            {step === 6 && renderLoading()}

                            {/* Navigation Buttons for Form */}
                            {step < 6 && (
                                <div className="mt-8 flex gap-3">
                                    {step > 1 && (
                                        <button
                                            type="button"
                                            onClick={() => setStep(step - 1)}
                                            className="flex-1 h-12 rounded-xl text-slate-600 font-bold hover:bg-slate-50 transition-colors border border-transparent hover:border-slate-200"
                                        >
                                            Atrás
                                        </button>
                                    )}
                                    <button
                                        type="button"
                                        onClick={handleNext}
                                        className="flex-1 h-12 bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-xl transition-all shadow-lg shadow-slate-900/20 active:scale-95 flex items-center justify-center gap-2"
                                    >
                                        {step === 5 ? 'Finalizar' : 'Continuar'}
                                        <span className="material-symbols-outlined text-sm">arrow_forward</span>
                                    </button>
                                </div>
                            )}
                        </div>
                    ) : (
                        // Manifesto Card
                        renderManifesto()
                    )}
                </div>
            </div>

            <div className="w-full text-center py-6 shrink-0 relative z-10">
                <p className="text-slate-400 text-sm">
                    ¿Necesitas ayuda? <a href="#" className="text-[#00E054] font-medium hover:underline">Contacta con soporte</a>
                </p>
                <div className="mt-2 text-[10px] text-slate-300">
                    © 2026 DonTendero. Digitalizando el corazón del barrio.
                </div>
            </div>
        </div>
    );
}
