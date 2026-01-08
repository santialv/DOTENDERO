"use client";

import Link from "next/link";
import { useState } from "react";

interface Coupon {
    id: number;
    code: string;
    discount: string;
    type: string;
    uses: number;
    status: "Active" | "Draft" | "Expired";
}

export default function MarketingPage() {
    const [coupons, setCoupons] = useState<Coupon[]>([
        { id: 1, code: "LANZAMIENTO2025", discount: "50%", type: "Recurrente (3 meses)", uses: 12, status: "Active" },
        { id: 2, code: "AMIGOFIBRA", discount: "100%", type: "Una vez (1 mes gratis)", uses: 5, status: "Active" },
        { id: 3, code: "BLACKFRIDAY", discount: "30%", type: "Para siempre", uses: 0, status: "Draft" },
    ]);

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [formData, setFormData] = useState({
        code: "",
        discountValue: "",
        discountType: "%",
        duration: "Una vez",
        limit_uses: ""
    });

    const handleCreateCoupon = (e: React.FormEvent) => {
        e.preventDefault();
        if (!formData.code || !formData.discountValue) return alert("Por favor completa los campos obligatorios");

        const newId = coupons.length + 1;
        const finalDiscount = `${formData.discountValue}${formData.discountType}`;

        const newCoupon: Coupon = {
            id: newId,
            code: formData.code.toUpperCase(),
            discount: finalDiscount,
            type: formData.duration,
            uses: 0,
            status: "Active"
        };

        setCoupons([newCoupon, ...coupons]);
        setIsModalOpen(false);
        setFormData({ code: "", discountValue: "", discountType: "%", duration: "Una vez", limit_uses: "" }); // Reset form
        alert("✅ Cupón creado exitosamente");
    };

    const deleteCoupon = (id: number) => {
        if (confirm("¿Estás seguro de eliminar este cupón?")) {
            setCoupons(coupons.filter(c => c.id !== id));
        }
    }

    return (
        <div className="h-screen overflow-y-auto bg-slate-50 font-sans text-slate-900">
            <nav className="bg-slate-900 text-white px-8 py-4 flex items-center justify-between sticky top-0 z-40 shadow-md">
                <div className="flex items-center gap-3">
                    <Link href="/admin/dashboard" className="flex h-8 w-8 items-center justify-center rounded bg-[#13ec80] text-slate-900 hover:opacity-90 transition-opacity">
                        <span className="material-symbols-outlined text-xl">arrow_back</span>
                    </Link>
                    <div>
                        <h1 className="text-xl font-bold leading-none">DonTendero <span className="text-[#13ec80]">ADMIN</span></h1>
                        <p className="text-xs text-slate-400">Marketing y Crecimiento</p>
                    </div>
                </div>
            </nav>

            <main className="p-8 max-w-5xl mx-auto">
                <div className="flex justify-between items-end mb-8">
                    <div>
                        <h2 className="text-3xl font-black text-slate-900">Cupones y Descuentos</h2>
                        <p className="text-slate-500">Impulsa tus ventas con códigos promocionales estratégicos.</p>
                    </div>
                    <button
                        onClick={() => setIsModalOpen(true)}
                        className="bg-slate-900 text-white px-4 py-2 rounded-lg text-sm font-bold hover:bg-slate-800 flex items-center gap-2 shadow-lg hover:translate-y-[-2px] transition-all"
                    >
                        <span className="material-symbols-outlined text-sm">add_tag</span>
                        Crear Nuevo Cupón
                    </button>
                </div>

                {/* Strategy Tips */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                    <div className="bg-orange-50 p-4 rounded-xl border border-orange-100 flex gap-3">
                        <span className="material-symbols-outlined text-orange-500 text-2xl">rocket_launch</span>
                        <div>
                            <h3 className="font-bold text-orange-900 text-sm">Lanzamiento</h3>
                            <p className="text-xs text-orange-700">Usa descuentos agresivos (50% OFF por 3 meses) para captar tus primeros 100 usuarios.</p>
                        </div>
                    </div>
                    <div className="bg-purple-50 p-4 rounded-xl border border-purple-100 flex gap-3">
                        <span className="material-symbols-outlined text-purple-500 text-2xl">restore_from_trash</span>
                        <div>
                            <h3 className="font-bold text-purple-900 text-sm">Recuperación</h3>
                            <p className="text-xs text-purple-700">Envía un cupón de "Vuelve con 20% OFF" a usuarios que cancelaron su suscripción.</p>
                        </div>
                    </div>
                    <div className="bg-blue-50 p-4 rounded-xl border border-blue-100 flex gap-3">
                        <span className="material-symbols-outlined text-blue-500 text-2xl">handshake</span>
                        <div>
                            <h3 className="font-bold text-blue-900 text-sm">Referidos</h3>
                            <p className="text-xs text-blue-700">Crea códigos únicos para influencers o aliados comerciales.</p>
                        </div>
                    </div>
                </div>

                {/* Coupons Table */}
                <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                    {coupons.length === 0 ? (
                        <div className="p-10 text-center text-slate-400">
                            <span className="material-symbols-outlined text-4xl mb-2">sentiment_dissatisfied</span>
                            <p>No hay cupones activos. ¡Crea uno para empezar!</p>
                        </div>
                    ) : (
                        <table className="w-full text-left text-sm">
                            <thead className="bg-slate-50 text-slate-500 border-b border-slate-200">
                                <tr>
                                    <th className="px-6 py-3 font-bold">Código</th>
                                    <th className="px-6 py-3 font-bold">Descuento</th>
                                    <th className="px-6 py-3 font-bold">Duración</th>
                                    <th className="px-6 py-3 font-bold">Redenciones</th>
                                    <th className="px-6 py-3 font-bold">Estado</th>
                                    <th className="px-6 py-3 font-bold text-right">Acciones</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {coupons.map((coupon) => (
                                    <tr key={coupon.id} className="hover:bg-slate-50 group transition-colors">
                                        <td className="px-6 py-4 font-mono font-bold text-slate-900 tracking-wider flex items-center gap-2">
                                            <span className="material-symbols-outlined text-slate-300 text-xs">local_activity</span>
                                            {coupon.code}
                                        </td>
                                        <td className="px-6 py-4 font-bold text-green-600">{coupon.discount}</td>
                                        <td className="px-6 py-4 text-slate-600 text-xs">{coupon.type}</td>
                                        <td className="px-6 py-4 text-slate-600">{coupon.uses} usu.</td>
                                        <td className="px-6 py-4">
                                            <span className={`px-2 py-1 rounded text-[10px] font-bold uppercase border ${coupon.status === 'Active' ? 'bg-green-50 text-green-700 border-green-200' : 'bg-slate-100 text-slate-500 border-slate-200'
                                                }`}>
                                                {coupon.status === 'Active' ? 'Activo' : 'Borrador'}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-right flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                            <button className="text-slate-400 hover:text-blue-600 transition-colors" title="Editar">
                                                <span className="material-symbols-outlined text-lg">edit</span>
                                            </button>
                                            <button onClick={() => deleteCoupon(coupon.id)} className="text-slate-400 hover:text-red-600 transition-colors" title="Eliminar">
                                                <span className="material-symbols-outlined text-lg">delete</span>
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    )}
                </div>
            </main>

            {/* Creation Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4 animate-in fade-in duration-200">
                    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden animate-in zoom-in-95 duration-200">
                        <div className="bg-slate-50 px-6 py-4 border-b border-slate-100 flex justify-between items-center">
                            <h3 className="font-bold text-slate-900">Crear Nuevo Cupón</h3>
                            <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                                <span className="material-symbols-outlined">close</span>
                            </button>
                        </div>

                        <form onSubmit={handleCreateCoupon} className="p-6 space-y-4">
                            {/* Code Input */}
                            <div>
                                <label className="block text-xs font-bold text-slate-700 mb-1 uppercase">Código del Cupón</label>
                                <div className="relative">
                                    <span className="material-symbols-outlined absolute left-3 top-2.5 text-slate-400">confirmation_number</span>
                                    <input
                                        type="text"
                                        placeholder="Ej. VERANO2025"
                                        className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#13ec80] focus:border-transparent outline-none font-mono uppercase placeholder:normal-case"
                                        value={formData.code}
                                        onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
                                        required
                                        maxLength={15}
                                    />
                                </div>
                                <p className="text-[10px] text-slate-400 mt-1">Solo letras y números, sin espacios.</p>
                            </div>

                            {/* Discount Amount */}
                            <div className="flex gap-4">
                                <div className="flex-1">
                                    <label className="block text-xs font-bold text-slate-700 mb-1 uppercase">Descuento</label>
                                    <input
                                        type="number"
                                        placeholder="20"
                                        className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#13ec80] outline-none"
                                        value={formData.discountValue}
                                        onChange={(e) => setFormData({ ...formData, discountValue: e.target.value })}
                                        required
                                        min="1"
                                    />
                                </div>
                                <div className="w-1/3">
                                    <label className="block text-xs font-bold text-slate-700 mb-1 uppercase">Tipo</label>
                                    <select
                                        className="w-full px-2 py-2 border border-slate-300 rounded-lg outline-none bg-white"
                                        value={formData.discountType}
                                        onChange={(e) => setFormData({ ...formData, discountType: e.target.value })}
                                    >
                                        <option value="%">% Porcentaje</option>
                                        <option value=" COP">$ Monto Fijo</option>
                                    </select>
                                </div>
                            </div>

                            {/* Duration */}
                            <div>
                                <label className="block text-xs font-bold text-slate-700 mb-1 uppercase">Duración</label>
                                <select
                                    className="w-full px-4 py-2 border border-slate-300 rounded-lg outline-none bg-white focus:ring-2 focus:ring-[#13ec80]"
                                    value={formData.duration}
                                    onChange={(e) => setFormData({ ...formData, duration: e.target.value })}
                                >
                                    <option value="Una vez">Una sola vez (Ej. Primer mes)</option>
                                    <option value="Recurrente (3 meses)">Por 3 meses</option>
                                    <option value="Para siempre">Para siempre (Forever)</option>
                                </select>
                            </div>

                            <div className="bg-yellow-50 p-3 rounded-lg flex gap-2">
                                <span className="material-symbols-outlined text-yellow-600 text-sm">lightbulb</span>
                                <p className="text-xs text-yellow-800 leading-tight">
                                    Tip: Los cupones "Para siempre" son peligrosos para tu flujo de caja. Úsalos con precaución.
                                </p>
                            </div>

                            <button
                                type="submit"
                                className="w-full py-3 bg-[#13ec80] hover:bg-[#0fd671] text-[#0d1b14] font-black rounded-xl shadow-lg shadow-[#13ec80]/20 transition-all active:scale-[0.98] mt-4 flex justify-center items-center gap-2"
                            >
                                <span className="material-symbols-outlined">save</span>
                                Guardar Cupón
                            </button>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
