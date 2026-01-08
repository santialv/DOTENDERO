"use client";

import Link from "next/link";
import { useState } from "react";

export default function SupportPage() {
    const [searchTerm, setSearchTerm] = useState("");
    const [isImpersonating, setIsImpersonating] = useState(false);

    // Mock Users for Search
    const users = [
        { id: 1, name: "Tienda La Esperanza", email: "carlos@esperanza.com", status: "Active" },
        { id: 2, name: "Supermercado El Vecino", email: "ana@vecino.com", status: "Active" },
        { id: 3, name: "Víveres Don José", email: "jose@viveres.com", status: "Locked" },
    ];

    const handleImpersonate = (userName: string) => {
        if (confirm(`¿Estás seguro que quieres entrar como ${userName}? Quedará registro en auditoría.`)) {
            setIsImpersonating(true);
            // In real app: call API to get short-lived JWT for this user
            setTimeout(() => {
                alert(`Modo Fantasma Activado: Ahora ves lo que ve ${userName}.`);
                // router.push('/caja'); 
                setIsImpersonating(false);
            }, 1000);
        }
    };

    return (
        <div className="h-screen overflow-y-auto bg-slate-50 font-sans text-slate-900">
            <nav className="bg-slate-900 text-white px-8 py-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <Link href="/admin/dashboard" className="flex h-8 w-8 items-center justify-center rounded bg-[#13ec80] text-slate-900 hover:opacity-90 transition-opacity">
                        <span className="material-symbols-outlined text-xl">arrow_back</span>
                    </Link>
                    <div>
                        <h1 className="text-xl font-bold leading-none">DonTendero <span className="text-[#13ec80]">ADMIN</span></h1>
                        <p className="text-xs text-slate-400">Soporte Técnico</p>
                    </div>
                </div>
            </nav>

            <main className="p-8 max-w-4xl mx-auto">
                <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-8 text-center mb-8">
                    <div className="w-16 h-16 bg-purple-100 text-purple-600 rounded-full flex items-center justify-center mx-auto mb-4">
                        <span className="material-symbols-outlined text-3xl">local_police</span>
                    </div>
                    <h2 className="text-2xl font-bold text-slate-900 mb-2">Modo "Ghost Login" (Impersonación)</h2>
                    <p className="text-slate-500 max-w-lg mx-auto mb-6">
                        Utiliza esta herramienta para iniciar sesión como cualquier cliente y ver exactamente lo que ellos ven.
                        <span className="block font-bold text-orange-600 mt-2">⚠️ Advertencia: Todas tus acciones quedarán registradas en la Auditoría.</span>
                    </p>

                    <div className="max-w-md mx-auto relative">
                        <span className="material-symbols-outlined absolute left-3 top-3 text-slate-400">search</span>
                        <input
                            type="text"
                            placeholder="Buscar por nombre, correo o NIT..."
                            className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-200 shadow-sm focus:ring-2 focus:ring-purple-500 outline-none"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                </div>

                {/* Results List */}
                {searchTerm && (
                    <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                        <div className="p-4 bg-slate-50 border-b border-slate-100 font-bold text-xs text-slate-500 uppercase tracking-wider">
                            Resultados de búsqueda
                        </div>
                        <div className="divide-y divide-slate-100">
                            {users.map(user => (
                                <div key={user.id} className="p-4 flex items-center justify-between hover:bg-slate-50">
                                    <div className="flex items-center gap-3">
                                        <div className="h-10 w-10 rounded-full bg-slate-200 flex items-center justify-center text-slate-500 font-bold">
                                            {user.name.charAt(0)}
                                        </div>
                                        <div>
                                            <h4 className="font-bold text-slate-900">{user.name}</h4>
                                            <p className="text-xs text-slate-500">{user.email}</p>
                                        </div>
                                    </div>
                                    <button
                                        onClick={() => handleImpersonate(user.name)}
                                        className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg text-xs font-bold flex items-center gap-2 transition-colors"
                                    >
                                        <span className="material-symbols-outlined text-sm">login</span>
                                        Acceder
                                    </button>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

            </main>
        </div>
    );
}
