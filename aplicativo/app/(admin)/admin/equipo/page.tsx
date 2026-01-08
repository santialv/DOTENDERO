"use client";

import Link from "next/link";
import { useState } from "react";

export default function TeamPage() {
    const [showInviteModal, setShowInviteModal] = useState(false);

    // Mock Team Data (Ready for Supabase)
    const [teamMembers, setTeamMembers] = useState([
        { id: 1, name: "Carlos Admin", email: "admin@dontendero.com", role: "Super Admin", status: "Active", lastActive: "Ahora" },
        { id: 2, name: "Laura Soporte", email: "laura@dontendero.com", role: "Support Agent", status: "Active", lastActive: "Hace 5 min" },
        { id: 3, name: "Pedro Contador", email: "pedro@auditores.com", role: "Accountant", status: "Invited", lastActive: "-" },
    ]);

    return (
        <div className="h-screen overflow-y-auto bg-slate-50 font-sans text-slate-900">
            <nav className="bg-slate-900 text-white px-8 py-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <Link href="/admin/dashboard" className="flex h-8 w-8 items-center justify-center rounded bg-[#13ec80] text-slate-900 hover:opacity-90 transition-opacity">
                        <span className="material-symbols-outlined text-xl">arrow_back</span>
                    </Link>
                    <div>
                        <h1 className="text-xl font-bold leading-none">DonTendero <span className="text-[#13ec80]">ADMIN</span></h1>
                        <p className="text-xs text-slate-400">Gestión de Equipo y Acceso</p>
                    </div>
                </div>
            </nav>

            <main className="p-8 max-w-6xl mx-auto">
                <div className="flex justify-between items-end mb-8">
                    <div>
                        <h2 className="text-3xl font-black text-slate-900">Colaboradores</h2>
                        <p className="text-slate-500">Administra quién tiene acceso a tu panel de control.</p>
                    </div>
                    <button
                        onClick={() => setShowInviteModal(true)}
                        className="bg-slate-900 text-white px-4 py-2 rounded-lg text-sm font-bold hover:bg-slate-800 flex items-center gap-2"
                    >
                        <span className="material-symbols-outlined text-sm">person_add</span>
                        Invitar Miembro
                    </button>
                </div>

                {/* Roles Explanation Card */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                    <div className="bg-purple-50 p-4 rounded-xl border border-purple-100">
                        <div className="flex items-center gap-2 mb-2">
                            <span className="material-symbols-outlined text-purple-600">admin_panel_settings</span>
                            <h3 className="font-bold text-purple-900 text-sm">Super Admin</h3>
                        </div>
                        <p className="text-xs text-purple-700 leading-relaxed">Acceso total a todo el sistema. Puede ver finanzas, borrar usuarios y gestionar el equipo.</p>
                    </div>
                    <div className="bg-blue-50 p-4 rounded-xl border border-blue-100">
                        <div className="flex items-center gap-2 mb-2">
                            <span className="material-symbols-outlined text-blue-600">support_agent</span>
                            <h3 className="font-bold text-blue-900 text-sm">Agente de Soporte</h3>
                        </div>
                        <p className="text-xs text-blue-700 leading-relaxed">Acceso a "Lista de Clientes" y "Ghost Login". No puede ver datos financieros ni borrar cuentas.</p>
                    </div>
                    <div className="bg-green-50 p-4 rounded-xl border border-green-100">
                        <div className="flex items-center gap-2 mb-2">
                            <span className="material-symbols-outlined text-green-600">account_balance</span>
                            <h3 className="font-bold text-green-900 text-sm">Contador / Auditor</h3>
                        </div>
                        <p className="text-xs text-green-700 leading-relaxed">Acceso solo a la "Zona Financiera" y reportes. Ideal para tu equipo contable externo.</p>
                    </div>
                </div>

                {/* Team Table */}
                <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                    <table className="w-full text-left text-sm">
                        <thead className="bg-slate-50 text-slate-500 border-b border-slate-200">
                            <tr>
                                <th className="px-6 py-3 font-bold">Miembro</th>
                                <th className="px-6 py-3 font-bold">Rol Asignado</th>
                                <th className="px-6 py-3 font-bold">Estado</th>
                                <th className="px-6 py-3 font-bold">Último Acceso</th>
                                <th className="px-6 py-3 font-bold text-right">Acciones</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {teamMembers.map((member) => (
                                <tr key={member.id} className="hover:bg-slate-50">
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-3">
                                            <div className="h-8 w-8 rounded-full bg-slate-200 flex items-center justify-center text-xs font-bold text-slate-600">
                                                {member.name.charAt(0)}
                                            </div>
                                            <div>
                                                <div className="font-bold text-slate-900">{member.name}</div>
                                                <div className="text-xs text-slate-500">{member.email}</div>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className={`px-2 py-1 rounded text-xs font-bold border ${member.role === 'Super Admin' ? 'bg-purple-50 text-purple-700 border-purple-200' :
                                                member.role === 'Support Agent' ? 'bg-blue-50 text-blue-700 border-blue-200' :
                                                    'bg-green-50 text-green-700 border-green-200'
                                            }`}>
                                            {member.role === 'Super Admin' ? '👑 Super Admin' :
                                                member.role === 'Support Agent' ? '🎧 Soporte' : '📊 Contador'}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-2">
                                            <div className={`h-2 w-2 rounded-full ${member.status === 'Active' ? 'bg-green-500' : 'bg-orange-400'}`}></div>
                                            <span className="text-slate-600 font-medium text-xs">{member.status === 'Active' ? 'Activo' : 'Invitación Enviada'}</span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 text-slate-500 text-xs font-mono">{member.lastActive}</td>
                                    <td className="px-6 py-4 text-right">
                                        <button className="text-slate-400 hover:text-red-600 transition-colors">
                                            <span className="material-symbols-outlined">delete</span>
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </main>

            {/* Invite Modal */}
            {showInviteModal && (
                <div className="fixed inset-0 bg-slate-900/50 flex items-center justify-center p-4 z-50 backdrop-blur-sm">
                    <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-6 animate-in zoom-in-95 duration-200">
                        <h3 className="text-xl font-bold mb-4">Invitar Nuevo Colaborador</h3>

                        <div className="space-y-4 mb-6">
                            <div>
                                <label className="block text-sm font-bold text-slate-700 mb-1">Correo Electrónico</label>
                                <input type="email" placeholder="ej. contador@empresa.com" className="w-full border border-slate-200 rounded-lg p-2.5 outline-none focus:ring-2 focus:ring-[#13ec80]" />
                            </div>
                            <div>
                                <label className="block text-sm font-bold text-slate-700 mb-1">Rol de Acceso</label>
                                <select className="w-full border border-slate-200 rounded-lg p-2.5 outline-none focus:ring-2 focus:ring-[#13ec80]">
                                    <option value="support">🎧 Agente de Soporte (Ver usuarios, no dinero)</option>
                                    <option value="accountant">📊 Contador (Ver dinero, no usuarios)</option>
                                    <option value="admin">👑 Super Admin (Acceso Total)</option>
                                </select>
                            </div>
                        </div>

                        <div className="flex justify-end gap-3">
                            <button onClick={() => setShowInviteModal(false)} className="px-4 py-2 text-slate-600 font-bold hover:bg-slate-100 rounded-lg">Cancelar</button>
                            <button onClick={() => { alert('Invitación simulada enviada'); setShowInviteModal(false); }} className="px-4 py-2 bg-slate-900 text-white font-bold rounded-lg hover:bg-slate-800">
                                Enviar Invitación
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
