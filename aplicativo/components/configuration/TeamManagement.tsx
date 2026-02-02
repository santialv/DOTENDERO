"use client";

import { useState } from "react";
import { useTeam } from "@/hooks/useTeam";
import { createTeamMember, updateTeamMember } from "@/app/actions/team";
import {
    UserPlus,
    Mail,
    Lock,
    User,
    ShieldCheck,
    Loader2,
    MoreVertical,
    Power,
    UserCog,
    BadgeCheck
} from "lucide-react";
import { useToast } from "@/components/ui/toast";

export function TeamManagement() {
    const { members, loading, refreshTeam } = useTeam();
    const { toast } = useToast();
    const [isAdding, setIsAdding] = useState(false);

    // Form State
    const [form, setForm] = useState({
        email: "",
        password: "",
        fullName: "",
        role: "cashier" as "admin" | "cashier"
    });
    const [saving, setSaving] = useState(false);

    // Permissions Modal State
    const [selectedMember, setSelectedMember] = useState<any | null>(null);
    const [isPermissionsModalOpen, setIsPermissionsModalOpen] = useState(false);
    const [editedPermissions, setEditedPermissions] = useState<Record<string, boolean>>({});
    const [editedRole, setEditedRole] = useState<'admin' | 'cashier' | null>(null);

    const handleAdd = async (e: React.FormEvent) => {
        e.preventDefault();
        setSaving(true);
        try {
            const res = await createTeamMember(form.email, form.password, form.fullName, form.role);
            if (res.success) {
                toast("Usuario creado con éxito", "success");
                setIsAdding(false);
                setForm({ email: "", password: "", fullName: "", role: "cashier" });
                refreshTeam();
            } else {
                toast(res.message, "error");
            }
        } catch (error: any) {
            toast("Error al crear usuario", "error");
        } finally {
            setSaving(false);
        }
    };

    const handleToggleStatus = async (userId: string, currentStatus: string) => {
        const newStatus = currentStatus === 'active' ? 'inactive' : 'active';
        try {
            const res = await updateTeamMember(userId, { status: newStatus as any });
            if (res.success) {
                toast(`Usuario ${newStatus === 'active' ? 'activado' : 'desactivado'}`, "success");
                refreshTeam();
            } else {
                toast(res.message, "error");
            }
        } catch (error) {
            toast("Error al actualizar estado", "error");
        }
    };

    if (loading) return (
        <div className="flex justify-center p-12">
            <Loader2 className="w-8 h-8 animate-spin text-slate-300" />
        </div>
    );

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center bg-white p-6 rounded-3xl border border-slate-200">
                <div>
                    <h3 className="text-xl font-black text-slate-900 tracking-tight">Mi Equipo</h3>
                    <p className="text-slate-500 text-sm font-medium">Gestiona quién tiene acceso a tu tienda</p>
                </div>
                <button
                    onClick={() => setIsAdding(true)}
                    className="bg-slate-900 text-white px-5 py-2.5 rounded-xl font-bold text-sm flex items-center gap-2 hover:bg-slate-800 transition-all shadow-lg shadow-slate-900/10 active:scale-95"
                >
                    <UserPlus className="w-4 h-4" />
                    Nuevo Miembro
                </button>
            </div>

            {isAdding && (
                <div className="bg-white p-8 rounded-3xl border-2 border-slate-900 shadow-2xl animate-in fade-in slide-in-from-top-4 duration-300">
                    <div className="flex justify-between items-center mb-6">
                        <h4 className="text-lg font-black text-slate-900 tracking-tight">Invitar nuevo colaborador</h4>
                        <button onClick={() => setIsAdding(false)} className="text-slate-400 hover:text-slate-900 font-bold text-sm">Cerrar</button>
                    </div>

                    <form onSubmit={handleAdd} className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-1">
                            <label className="text-xs font-black text-slate-400 uppercase tracking-widest pl-1">Nombre Completo</label>
                            <div className="relative">
                                <User className="absolute left-3 top-3 w-4 h-4 text-slate-300" />
                                <input
                                    className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-100 rounded-xl focus:ring-2 focus:ring-slate-900/10 outline-none transition-all font-medium"
                                    placeholder="Ej: Juan Perez"
                                    required
                                    value={form.fullName}
                                    onChange={e => setForm({ ...form, fullName: e.target.value })}
                                />
                            </div>
                        </div>

                        <div className="space-y-1">
                            <label className="text-xs font-black text-slate-400 uppercase tracking-widest pl-1">Correo Electrónico</label>
                            <div className="relative">
                                <Mail className="absolute left-3 top-3 w-4 h-4 text-slate-300" />
                                <input
                                    type="email"
                                    className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-100 rounded-xl focus:ring-2 focus:ring-slate-900/10 outline-none transition-all font-medium"
                                    placeholder="correo@ejemplo.com"
                                    required
                                    value={form.email}
                                    onChange={e => setForm({ ...form, email: e.target.value })}
                                />
                            </div>
                        </div>

                        <div className="space-y-1">
                            <label className="text-xs font-black text-slate-400 uppercase tracking-widest pl-1">Contraseña Temporal</label>
                            <div className="relative">
                                <Lock className="absolute left-3 top-3 w-4 h-4 text-slate-300" />
                                <input
                                    type="password"
                                    className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-100 rounded-xl focus:ring-2 focus:ring-slate-900/10 outline-none transition-all font-medium"
                                    placeholder="Min. 6 caracteres"
                                    required
                                    minLength={6}
                                    value={form.password}
                                    onChange={e => setForm({ ...form, password: e.target.value })}
                                />
                            </div>
                        </div>

                        <div className="space-y-1">
                            <label className="text-xs font-black text-slate-400 uppercase tracking-widest pl-1">Rol de Acceso</label>
                            <div className="relative">
                                <ShieldCheck className="absolute left-3 top-3 w-4 h-4 text-slate-300" />
                                <select
                                    className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-100 rounded-xl focus:ring-2 focus:ring-slate-900/10 outline-none transition-all font-bold appearance-none"
                                    value={form.role}
                                    onChange={e => setForm({ ...form, role: e.target.value as any })}
                                >
                                    <option value="cashier">Cajero (Solo Ventas)</option>
                                    <option value="admin">Administrador (Control Total)</option>
                                </select>
                            </div>
                        </div>

                        <div className="md:col-span-2 pt-4">
                            <button
                                type="submit"
                                disabled={saving}
                                className="w-full bg-[#13ec80] text-slate-900 py-3 rounded-xl font-bold hover:bg-[#10d673] transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                            >
                                {saving ? <Loader2 className="w-5 h-5 animate-spin" /> : "Crear Usuario y Activar"}
                            </button>
                        </div>
                    </form>
                </div>
            )}

            <div className="bg-white rounded-3xl border border-slate-200 overflow-hidden">
                <table className="w-full text-left">
                    <thead>
                        <tr className="bg-slate-50 border-b border-slate-200">
                            <th className="px-6 py-4 text-xs font-black text-slate-400 uppercase tracking-widest">Colaborador</th>
                            <th className="px-6 py-4 text-xs font-black text-slate-400 uppercase tracking-widest">Rol</th>
                            <th className="px-6 py-4 text-xs font-black text-slate-400 uppercase tracking-widest">Estado</th>
                            <th className="px-6 py-4 text-xs font-black text-slate-400 uppercase tracking-widest text-right">Acciones</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-50">
                        {members.map(member => (
                            <tr key={member.id} className="hover:bg-slate-50/50 transition-colors">
                                <td className="px-6 py-4">
                                    <div className="flex items-center gap-3">
                                        <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-white shadow-sm ${member.role === 'owner' ? 'bg-indigo-500' : member.role === 'admin' ? 'bg-blue-500' : 'bg-emerald-500'}`}>
                                            {(member.full_name || member.email || '?')[0].toUpperCase()}
                                        </div>
                                        <div>
                                            <p className="font-bold text-slate-900 leading-none mb-1 flex items-center gap-1.5">
                                                {member.full_name || 'Sin nombre'}
                                                {member.role === 'owner' && <BadgeCheck className="w-4 h-4 text-indigo-500" />}
                                            </p>
                                            <p className="text-xs text-slate-400 font-medium">{member.email}</p>
                                        </div>
                                    </div>
                                </td>
                                <td className="px-6 py-4">
                                    <div className="flex items-center gap-2">
                                        <span className={`text-[10px] font-black uppercase px-2 py-1 rounded-lg tracking-wider border ${member.role === 'owner' ? 'bg-indigo-50 border-indigo-100 text-indigo-600' :
                                            member.role === 'admin' ? 'bg-blue-50 border-blue-100 text-blue-600' :
                                                'bg-emerald-50 border-emerald-100 text-emerald-600'
                                            }`}>
                                            {member.role === 'owner' ? 'Propietario' : member.role === 'admin' ? 'Administrador' : 'Cajero'}
                                        </span>
                                        {member.role !== 'owner' && (
                                            <button
                                                onClick={() => {
                                                    setSelectedMember(member);
                                                    setEditedPermissions(member.permissions || {
                                                        create_customers: member.role === 'admin',
                                                        view_purchase_costs: member.role === 'admin',
                                                        apply_discounts: true,
                                                        manage_team: member.role === 'admin'
                                                    });
                                                    setEditedRole(member.role);
                                                    setIsPermissionsModalOpen(true);
                                                }}
                                                className="text-[10px] font-bold text-slate-400 hover:text-indigo-600 underline underline-offset-2"
                                            >
                                                Editar
                                            </button>
                                        )}
                                    </div>
                                </td>
                                <td className="px-6 py-4">
                                    <div className="flex items-center gap-2">
                                        <div className={`w-2 h-2 rounded-full ${member.status === 'active' ? 'bg-emerald-500' : 'bg-slate-300'}`} />
                                        <span className="text-xs font-bold text-slate-500 capitalize">{member.status === 'active' ? 'Activo' : 'Inactivo'}</span>
                                    </div>
                                </td>
                                <td className="px-6 py-4 text-right">
                                    <div className="flex justify-end gap-2">
                                        <button
                                            onClick={() => {
                                                setSelectedMember(member);
                                                setEditedPermissions(member.permissions || {
                                                    create_customers: member.role === 'admin',
                                                    view_purchase_costs: member.role === 'admin',
                                                    apply_discounts: true,
                                                    manage_team: member.role === 'admin'
                                                });
                                                setEditedRole(member.role);
                                                setIsPermissionsModalOpen(true);
                                            }}
                                            className="p-2 text-slate-300 hover:text-indigo-500 hover:bg-indigo-50 rounded-lg transition-all"
                                            title="Ajustar Permisos"
                                        >
                                            <UserCog className="w-5 h-5" />
                                        </button>
                                        {member.role !== 'owner' && (
                                            <button
                                                onClick={() => handleToggleStatus(member.id, member.status)}
                                                className={`p-2 rounded-lg transition-all ${member.status === 'active' ? 'text-slate-300 hover:text-red-500 hover:bg-red-50' : 'text-slate-300 hover:text-emerald-500 hover:bg-emerald-50'}`}
                                                title={member.status === 'active' ? 'Desactivar' : 'Activar'}
                                            >
                                                <Power className="w-5 h-5" />
                                            </button>
                                        )}
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>

                {/* Permissions Modal */}
                {isPermissionsModalOpen && selectedMember && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4">
                        <div className="bg-white w-full max-w-md rounded-3xl shadow-2xl p-8 border border-slate-100 animate-in zoom-in duration-200">
                            <div className="flex justify-between items-center mb-6">
                                <div>
                                    <h3 className="text-xl font-black text-slate-900 tracking-tight">Gestionar Acceso</h3>
                                    <p className="text-slate-500 text-sm font-medium">{selectedMember.full_name || selectedMember.email}</p>
                                </div>
                                <button onClick={() => setIsPermissionsModalOpen(false)} className="text-slate-400 hover:text-slate-900 font-bold">Cerrar</button>
                            </div>

                            <div className="space-y-4 mb-8">
                                {/* Role Selector */}
                                <div className="p-4 bg-indigo-50/50 rounded-2xl border border-indigo-100">
                                    <label className="text-[10px] font-black text-indigo-400 uppercase tracking-widest block mb-2">Rol del Usuario</label>
                                    <div className="grid grid-cols-2 gap-2">
                                        <button
                                            onClick={() => setEditedRole('cashier')}
                                            className={`py-2 px-3 rounded-xl text-xs font-bold border transition-all ${editedRole === 'cashier' ? 'bg-white border-indigo-200 text-indigo-600 shadow-sm' : 'bg-transparent border-transparent text-slate-400 hover:text-slate-600'}`}
                                        >
                                            Cajero
                                        </button>
                                        <button
                                            onClick={() => setEditedRole('admin')}
                                            className={`py-2 px-3 rounded-xl text-xs font-bold border transition-all ${editedRole === 'admin' ? 'bg-white border-indigo-200 text-indigo-600 shadow-sm' : 'bg-transparent border-transparent text-slate-400 hover:text-slate-600'}`}
                                        >
                                            Administrador
                                        </button>
                                    </div>
                                </div>

                                <div className="h-px bg-slate-100 my-2" />
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block pl-1">Permisos Específicos</label>

                                {[
                                    { id: 'create_customers', label: 'Crear Clientes', desc: 'Permite registrar nuevos clientes en el sistema' },
                                    { id: 'view_purchase_costs', label: 'Ver Costos de Compra', desc: 'Ver el precio al que compras la mercancía' },
                                    { id: 'apply_discounts', label: 'Aplicar Descuentos', desc: 'Permite modificar precios en el carrito de venta' },
                                    { id: 'manage_team', label: 'Gestionar Equipo', desc: 'Crear y editar otros usuarios (Admin)' }
                                ].map((perm) => (
                                    <div key={perm.id} className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl border border-slate-100 hover:border-indigo-200 transition-all">
                                        <div>
                                            <p className="font-bold text-slate-900 text-sm">{perm.label}</p>
                                            <p className="text-xs text-slate-400">{perm.desc}</p>
                                        </div>
                                        <button
                                            onClick={() => {
                                                setEditedPermissions(prev => ({
                                                    ...prev,
                                                    [perm.id]: !prev[perm.id]
                                                }));
                                            }}
                                            className={`w-12 h-6 rounded-full transition-all relative ${editedPermissions[perm.id] ? 'bg-indigo-600' : 'bg-slate-300'}`}
                                        >
                                            <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all ${editedPermissions[perm.id] ? 'left-7' : 'left-1'}`} />
                                        </button>
                                    </div>
                                ))}
                            </div>

                            <button
                                disabled={saving}
                                onClick={async () => {
                                    setSaving(true);
                                    try {
                                        const res = await updateTeamMember(selectedMember.id, {
                                            permissions: editedPermissions,
                                            role: editedRole as any
                                        });
                                        if (res.success) {
                                            toast("Acceso actualizado", "success");
                                            setIsPermissionsModalOpen(false);
                                            refreshTeam();
                                        } else {
                                            toast(res.message, "error");
                                        }
                                    } catch (error) {
                                        toast("Error al actualizar permisos", "error");
                                    } finally {
                                        setSaving(false);
                                    }
                                }}
                                className="w-full bg-slate-900 text-white py-3 rounded-xl font-bold hover:bg-slate-800 transition-all shadow-lg shadow-slate-900/20 active:scale-95 disabled:opacity-50"
                            >
                                {saving ? <Loader2 className="w-5 h-5 animate-spin mx-auto" /> : "Guardar Cambios"}
                            </button>
                        </div>
                    </div>
                )}

                {members.length === 0 && (
                    <div className="p-20 text-center">
                        <UserCog className="w-12 h-12 text-slate-200 mx-auto mb-4" />
                        <p className="text-slate-400 font-medium">No se encontraron miembros del equipo.</p>
                    </div>
                )}
            </div>
        </div>
    );
}
