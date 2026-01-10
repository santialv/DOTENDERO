"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { format } from "date-fns";
import Link from "next/link";

export default function StoresManagementPage() {
    const [clients, setClients] = useState<any[]>([]);
    const [searchTerm, setSearchTerm] = useState(""); // State for search
    const [loading, setLoading] = useState(true);
    const [errorMsg, setErrorMsg] = useState<string | null>(null);

    useEffect(() => {
        loadClients();
    }, []);

    const loadClients = async () => {
        setLoading(true);
        setErrorMsg(null);
        try {
            // Attempt 1: Try RPC (Preferred)
            const { data, error } = await supabase.rpc('get_admin_tenants_list');

            if (!error && data) {
                setClients(data);
                return;
            }

            // Attempt 2: Direct Table Select (Fallback if RPC fails/missing)
            // This requires RLS policies allowing 'select' on organizations
            console.warn("RPC failed, trying direct select", error);

            const { data: directData, error: directError } = await supabase
                .from('organizations')
                .select('id, name, created_at, email, city, nit') // Added nit
                .order('created_at', { ascending: false });

            if (directError) {
                console.error("Direct Select Error:", directError);
                throw directError; // Throw the real error if both fail
            }

            if (directData) {
                // Map to match the expected format (missing status/last_activity logic)
                const mappedData = directData.map(org => ({
                    ...org,
                    status: 'Desconocido (Fallo RPC)',
                    last_activity: null
                }));
                setClients(mappedData);
                // Don't show error to user if fallback worked, just log it
                console.log("Loaded via fallback");
            }

        } catch (error: any) {
            console.error("Critical error loading clients:", error);
            console.log("Full error object:", JSON.stringify(error, null, 2));
            setErrorMsg(error.message || JSON.stringify(error));
        } finally {
            setLoading(false);
        }
    };

    // Filter logic
    const filteredClients = clients.filter(client =>
        client.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        client.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        client.nit?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="min-h-screen bg-slate-50 font-display text-slate-900 p-8">
            <div className="max-w-7xl mx-auto">
                <div className="flex items-center gap-4 mb-8">
                    <Link href="/admin/dashboard" className="p-2 rounded-full hover:bg-slate-200 transition-colors">
                        <span className="material-symbols-outlined">arrow_back</span>
                    </Link>
                    <h1 className="text-3xl font-black">Administración de Tiendas</h1>
                </div>

                {errorMsg && (
                    <div className="mb-6 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg flex items-start gap-3">
                        <span className="material-symbols-outlined mt-0.5">error</span>
                        <div>
                            <p className="font-bold">Error de Conexión</p>
                            <p className="text-sm">No se pudieron cargar los datos completos.</p>
                            <code className="text-xs bg-red-100 p-1 rounded mt-1 block font-mono">{errorMsg}</code>
                            <p className="text-xs mt-2 text-red-500">
                                Asegúrate de ejecutar el script SQL con los permisos "GRANT EXECUTE".
                            </p>
                        </div>
                    </div>
                )}

                <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                    <div className="px-6 py-4 border-b border-slate-100 flex flex-col md:flex-row justify-between items-center gap-4 bg-white sticky top-0 z-10">
                        <div className="flex items-center gap-4 w-full md:w-auto">
                            <h3 className="font-bold text-lg whitespace-nowrap">Listado de Tenants</h3>
                            <span className="bg-slate-100 text-slate-600 text-xs font-bold px-2 py-1 rounded-full">
                                {filteredClients.length}
                            </span>
                        </div>

                        <div className="flex gap-2 w-full md:w-auto">
                            {/* Search Bar */}
                            <div className="relative flex-1 md:w-64">
                                <span className="absolute left-3 top-1/2 -translate-y-1/2 material-symbols-outlined text-slate-400 text-sm">search</span>
                                <input
                                    type="text"
                                    placeholder="Buscar por Nombre, NIT o Email..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all"
                                />
                            </div>

                            <button onClick={loadClients} className="p-2 text-slate-500 hover:bg-slate-100 rounded-lg" title="Recargar lista">
                                <span className="material-symbols-outlined">refresh</span>
                            </button>
                            <button className="px-4 py-2 bg-[#13ec80] hover:bg-[#0fb863] text-slate-900 font-bold rounded-lg text-sm transition-colors shadow-sm whitespace-nowrap">
                                + Nuevo
                            </button>
                        </div>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-sm">
                            <thead className="bg-slate-50 text-slate-500">
                                <tr>
                                    <th className="px-6 py-3 font-bold">Negocio</th>
                                    <th className="px-6 py-3 font-bold">NIT / CC</th>
                                    <th className="px-6 py-3 font-bold">Email Propietario</th>
                                    <th className="px-6 py-3 font-bold">Ciudad</th>
                                    <th className="px-6 py-3 font-bold">Estado</th>
                                    <th className="px-6 py-3 font-bold">Última Actividad</th>
                                    <th className="px-6 py-3 font-bold text-right">Acciones</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {loading && (
                                    <tr>
                                        <td colSpan={7} className="px-6 py-8 text-center text-slate-400">Cargando datos...</td>
                                    </tr>
                                )}
                                {!loading && !errorMsg && filteredClients.length === 0 && (
                                    <tr>
                                        <td colSpan={7} className="px-6 py-8 text-center text-slate-400">
                                            {searchTerm ? "No se encontraron resultados para tu búsqueda." : "No hay tiendas registradas (o no tienes permiso para verlas)."}
                                        </td>
                                    </tr>
                                )}
                                {filteredClients.map((client) => (
                                    <tr key={client.id} className="hover:bg-slate-50 transition-colors">
                                        <td className="px-6 py-4 font-bold text-slate-900">{client.name || "Sin nombre"}</td>
                                        <td className="px-6 py-4 font-mono text-slate-600 text-xs">{client.nit || "-"}</td>
                                        <td className="px-6 py-4 text-slate-600">{client.email || "Sin email"}</td>
                                        <td className="px-6 py-4 text-slate-600">{client.city || "-"}</td>
                                        <td className="px-6 py-4">
                                            <span className={`inline-flex items-center gap-1.5 px-2 py-1 rounded-full text-xs font-bold ${client.status === 'Activo' ? 'bg-green-100 text-green-700' : 'bg-slate-100 text-slate-500'}`}>
                                                <span className={`h-1.5 w-1.5 rounded-full ${client.status === 'Activo' ? 'bg-green-500' : 'bg-slate-400'}`}></span>
                                                {client.status || 'Desconocido'}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-slate-600">
                                            {client.last_activity ? format(new Date(client.last_activity), 'dd MMM yyyy HH:mm') : 'N/A'}
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <Link href={`/admin/tiendas/${client.id}`}>
                                                <button className="text-slate-400 hover:text-slate-900 font-bold text-xs border border-slate-200 rounded px-2 py-1 hover:bg-white transition-colors">
                                                    Gestionar
                                                </button>
                                            </Link>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    );
}
