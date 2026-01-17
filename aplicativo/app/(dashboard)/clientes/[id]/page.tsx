"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import Link from 'next/link';

export default function CustomerDetailPage() {
    const { id } = useParams();
    const router = useRouter();
    const [customer, setCustomer] = useState<any>(null);
    const [invoices, setInvoices] = useState<any[]>([]);
    const [payments, setPayments] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (id) loadData();
    }, [id]);

    const loadData = async () => {
        setLoading(true);
        // 1. Fetch Customer
        const { data: cust, error } = await supabase.from('customers').select('*').eq('id', id).single();
        if (error) {
            alert("Cliente no encontrado");
            router.push('/clientes');
            return;
        }
        setCustomer(cust);

        // 2. Fetch Invoices (Sales to this customer)
        const { data: invs } = await supabase
            .from('invoices')
            .select('*')
            .eq('customer_id', id)
            .order('date', { ascending: false });
        setInvoices(invs || []);

        // 3. Fetch Payments (Expenses linked to customer)
        const { data: pays } = await supabase
            .from('expenses')
            .select('*')
            .eq('customer_id', id)
            .order('date', { ascending: false });
        setPayments(pays || []);

        setLoading(false);
    };

    if (loading) return <div className="p-10 text-center">Cargando perfil...</div>;
    if (!customer) return null;

    const totalPurchased = invoices.reduce((sum, i) => sum + (i.total || 0), 0);
    const totalPaid = payments.reduce((sum, p) => sum + (p.amount || 0), 0);

    return (
        <div className="flex flex-col h-full bg-slate-50 font-display">
            {/* Header / Nav */}
            <div className="px-10 py-6 border-b border-slate-200 bg-white flex items-center gap-4">
                <Link href="/clientes" className="p-2 hover:bg-slate-100 rounded-full transition-colors">
                    <span className="material-symbols-outlined text-slate-500">arrow_back</span>
                </Link>
                <div>
                    <h1 className="text-2xl font-black text-slate-900">{customer.full_name}</h1>
                    <p className="text-slate-500 text-sm">Perfil de Cliente</p>
                </div>
            </div>

            <div className="flex-1 overflow-auto custom-scrollbar p-10">
                <div className="max-w-6xl mx-auto space-y-8">

                    {/* Info & Stats */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        {/* Personal Info */}
                        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
                            <h3 className="font-bold text-slate-900 mb-4 border-b border-slate-50 pb-2">Información Personal</h3>
                            <div className="space-y-3 text-sm">
                                <div>
                                    <p className="text-xs font-bold text-slate-400 uppercase">Documento</p>
                                    <p className="font-mono text-slate-700">{customer.document_number || 'No registrado'}</p>
                                </div>
                                <div>
                                    <p className="text-xs font-bold text-slate-400 uppercase">Teléfono</p>
                                    <p className="text-slate-700">{customer.phone || 'No registrado'}</p>
                                </div>
                                <div>
                                    <p className="text-xs font-bold text-slate-400 uppercase">Email</p>
                                    <p className="text-slate-700">{customer.email || 'No registrado'}</p>
                                </div>
                                <div>
                                    <p className="text-xs font-bold text-slate-400 uppercase">Ubicación</p>
                                    <p className="text-slate-700">{customer.address}, {customer.city}</p>
                                </div>
                            </div>
                        </div>

                        {/* Debt Card */}
                        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex flex-col justify-center items-center text-center">
                            <div className="w-16 h-16 bg-red-50 text-red-500 rounded-full flex items-center justify-center mb-4">
                                <span className="material-symbols-outlined text-3xl">money_off</span>
                            </div>
                            <p className="text-sm font-bold text-slate-400 uppercase">Deuda Actual</p>
                            <p className="text-4xl font-black text-red-600 mt-2">${customer.current_debt?.toLocaleString()}</p>
                            <p className="text-xs text-slate-400 mt-2">Saldo pendiente por cobrar</p>
                        </div>

                        {/* Lifetime Stats */}
                        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex flex-col justify-center space-y-6">
                            <div className="flex justify-between items-center">
                                <div>
                                    <p className="text-xs font-bold text-slate-400 uppercase">Total Comprado</p>
                                    <p className="text-2xl font-black text-slate-900">${totalPurchased.toLocaleString()}</p>
                                </div>
                                <span className="p-2 bg-blue-50 text-blue-600 rounded-lg material-symbols-outlined">shopping_bag</span>
                            </div>
                            <div className="flex justify-between items-center border-t border-slate-50 pt-4">
                                <div>
                                    <p className="text-xs font-bold text-slate-400 uppercase">Total Abonado</p>
                                    <p className="text-2xl font-black text-green-600">${totalPaid.toLocaleString()}</p>
                                </div>
                                <span className="p-2 bg-green-50 text-green-600 rounded-lg material-symbols-outlined">payments</span>
                            </div>
                        </div>
                    </div>

                    {/* History Tables */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">

                        {/* Purchases History */}
                        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden flex flex-col h-[500px]">
                            <div className="p-4 border-b border-slate-100 bg-slate-50 flex justify-between items-center">
                                <h3 className="font-bold text-slate-800 flex items-center gap-2">
                                    <span className="material-symbols-outlined text-slate-400">receipt_long</span>
                                    Historial de Compras
                                </h3>
                                <span className="bg-white px-2 py-1 rounded-md text-xs font-bold border border-slate-200">{invoices.length} facturas</span>
                            </div>
                            <div className="flex-1 overflow-auto custom-scrollbar">
                                <table className="w-full text-left text-sm">
                                    <thead className="bg-white text-xs font-bold text-slate-400 uppercase sticky top-0">
                                        <tr>
                                            <th className="p-4">Fecha</th>
                                            <th className="p-4">Factura</th>
                                            <th className="p-4">Método</th>
                                            <th className="p-4 text-right">Total</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-50">
                                        {invoices.length === 0 ? (
                                            <tr><td colSpan={4} className="p-8 text-center text-slate-400">Sin compras registradas</td></tr>
                                        ) : invoices.map(inv => (
                                            <tr key={inv.id} className="hover:bg-slate-50">
                                                <td className="p-4 text-slate-600">
                                                    {new Intl.DateTimeFormat('es-CO', { dateStyle: 'medium', timeStyle: 'short' }).format(new Date(inv.date))}
                                                </td>
                                                <td className="p-4 font-mono font-bold text-slate-800">{inv.number}</td>
                                                <td className="p-4">
                                                    <span className={`px-2 py-1 rounded text-xs font-bold ${inv.payment_method === 'Fiado'
                                                            ? 'bg-red-100 text-red-700'
                                                            : 'bg-green-100 text-green-700'
                                                        }`}>
                                                        {inv.payment_method}
                                                    </span>
                                                </td>
                                                <td className="p-4 text-right font-bold text-slate-900">${inv.total.toLocaleString()}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>

                        {/* Payments History */}
                        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden flex flex-col h-[500px]">
                            <div className="p-4 border-b border-slate-100 bg-slate-50 flex justify-between items-center">
                                <h3 className="font-bold text-slate-800 flex items-center gap-2">
                                    <span className="material-symbols-outlined text-slate-400">history</span>
                                    Historial de Pagos
                                </h3>
                                <span className="bg-white px-2 py-1 rounded-md text-xs font-bold border border-slate-200">{payments.length} abonos</span>
                            </div>
                            <div className="flex-1 overflow-auto custom-scrollbar">
                                <table className="w-full text-left text-sm">
                                    <thead className="bg-white text-xs font-bold text-slate-400 uppercase sticky top-0">
                                        <tr>
                                            <th className="p-4">Fecha</th>
                                            <th className="p-4">Descripción</th>
                                            <th className="p-4 text-right">Monto</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-50">
                                        {payments.length === 0 ? (
                                            <tr><td colSpan={3} className="p-8 text-center text-slate-400">Sin abonos registrados</td></tr>
                                        ) : payments.map(p => (
                                            <tr key={p.id} className="hover:bg-slate-50">
                                                <td className="p-4 text-slate-600">
                                                    {new Intl.DateTimeFormat('es-CO', { dateStyle: 'medium' }).format(new Date(p.date))}
                                                </td>
                                                <td className="p-4 text-slate-600">{p.description}</td>
                                                <td className="p-4 text-right font-bold text-green-600">+${p.amount.toLocaleString()}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>

                    </div>
                </div>
            </div>
        </div>
    );
}
