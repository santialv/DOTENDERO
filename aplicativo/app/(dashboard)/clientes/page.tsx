"use client";

import { useState } from "react";
import { useCustomers, Customer } from "@/hooks/useCustomers";
import { useToast } from "@/components/ui/toast";

export default function CustomersPage() {
    const { toast } = useToast();
    const {
        customers,
        isLoading,
        searchTerm,
        setSearchTerm,
        showDebtorsOnly,
        setShowDebtorsOnly,
        saveCustomer,
        deleteCustomer,
        processPayment,
        page,
        setPage, // We will manually handle page change using fetchPage logic wrapper if needed, or just let useEffect handle it
        fetchPage,
        totalPages,
        totalCount
    } = useCustomers();

    // Modal State
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
    const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);

    // Form States
    const [formData, setFormData] = useState({
        full_name: "",
        document_number: "",
        phone: "",
        email: "",
        address: "",
        city: ""
    });
    const [paymentAmount, setPaymentAmount] = useState("");

    const handleCreate = () => {
        setSelectedCustomer(null);
        setFormData({
            full_name: "",
            document_number: "",
            phone: "",
            email: "",
            address: "",
            city: ""
        });
        setIsModalOpen(true);
    };

    const handleEdit = (customer: Customer) => {
        setSelectedCustomer(customer);
        setFormData({
            full_name: customer.full_name,
            document_number: customer.document_number || "",
            phone: customer.phone || "",
            email: customer.email || "",
            address: customer.address || "",
            city: customer.city || ""
        });
        setIsModalOpen(true);
    };

    const handleOpenPayment = (customer: Customer) => {
        setSelectedCustomer(customer);
        setPaymentAmount("");
        setIsPaymentModalOpen(true);
    };

    const handleSave = async () => {
        if (!formData.full_name) return toast("Nombre requerido", "error");

        const success = await saveCustomer({
            id: selectedCustomer?.id,
            ...formData
        });

        if (success) setIsModalOpen(false);
    };

    const handlePayment = async () => {
        if (!selectedCustomer || !paymentAmount) return;
        const amount = parseFloat(paymentAmount);
        const success = await processPayment(selectedCustomer, amount);
        if (success) setIsPaymentModalOpen(false);
    };

    // Pagination Display Range
    const startItem = totalCount === 0 ? 0 : page * 50 + 1;
    const endItem = Math.min((page + 1) * 50, totalCount);

    return (
        <div className="flex flex-col h-full bg-slate-50 font-display">
            {/* Header */}
            <div className="px-10 py-8 flex items-end justify-between gap-4 shrink-0">
                <div className="flex flex-col gap-1">
                    <h1 className="text-3xl md:text-4xl font-black tracking-tight text-slate-900">Gestión de Clientes</h1>
                    <p className="text-slate-500 text-base">Administra tu base de clientes y sus cuentas por cobrar.</p>
                </div>
                <button
                    onClick={handleCreate}
                    className="h-12 px-6 bg-slate-900 hover:bg-slate-800 text-white rounded-xl font-bold shadow-lg shadow-slate-900/20 active:scale-95 transition-all flex items-center gap-2"
                >
                    <span className="material-symbols-outlined">person_add</span>
                    Nuevo Cliente
                </button>
            </div>

            {/* Content */}
            <div className="flex-1 px-10 pb-10 overflow-hidden flex flex-col">
                {/* Search */}
                <div className="mb-6 flex flex-col md:flex-row gap-4">
                    <div className="relative w-full max-w-md">
                        <span className="absolute left-4 top-1/2 -translate-y-1/2 material-symbols-outlined text-slate-400">search</span>
                        <input
                            className="w-full pl-12 pr-4 py-3 rounded-xl border border-slate-200 focus:border-slate-900 outline-none shadow-sm"
                            placeholder="Buscar por nombre o documento..."
                            value={searchTerm}
                            onChange={e => setSearchTerm(e.target.value)}
                        />
                    </div>

                    <button
                        onClick={() => setShowDebtorsOnly(!showDebtorsOnly)}
                        className={`px-6 py-3 rounded-xl font-bold flex items-center gap-2 transition-all border shadow-sm ${showDebtorsOnly
                            ? 'bg-red-600 text-white border-red-600 shadow-red-200 hover:bg-red-700'
                            : 'bg-white text-slate-600 border-slate-200 hover:border-slate-300 hover:bg-slate-50'
                            }`}
                    >
                        <span className="material-symbols-outlined filled">
                            {showDebtorsOnly ? 'filter_alt_off' : 'money_off'}
                        </span>
                        {showDebtorsOnly ? 'Ver Todos' : 'Ver Deudores'}
                    </button>
                </div>

                {/* List */}
                <div className="bg-white rounded-2xl border border-slate-200 shadow-sm flex-1 overflow-hidden flex flex-col">
                    <div className="overflow-auto custom-scrollbar flex-1">
                        <table className="w-full text-left">
                            <thead className="bg-slate-50 sticky top-0 z-10 text-xs font-bold text-slate-500 uppercase tracking-wider">
                                <tr>
                                    <th className="p-4">Cliente</th>
                                    <th className="p-4">Documento</th>
                                    <th className="p-4">Contacto</th>
                                    <th className="p-4 text-right">Deuda Actual</th>
                                    <th className="p-4 text-center">Acciones</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {isLoading ? (
                                    <tr>
                                        <td colSpan={5} className="p-12 text-center text-slate-400">
                                            Cargando clientes...
                                        </td>
                                    </tr>
                                ) : customers.length === 0 ? (
                                    <tr>
                                        <td colSpan={5} className="p-12 text-center text-slate-400">
                                            No se encontraron clientes.
                                        </td>
                                    </tr>
                                ) : customers.map(c => (
                                    <tr key={c.id} className="hover:bg-slate-50 transition-colors">
                                        <td className="p-4">
                                            <p className="font-bold text-slate-900">{c.full_name}</p>
                                            <p className="text-xs text-slate-500">{c.city}</p>
                                        </td>
                                        <td className="p-4 font-mono text-sm text-slate-600">{c.document_number || 'N/A'}</td>
                                        <td className="p-4 text-sm text-slate-600">
                                            <p>{c.phone}</p>
                                            <p className="text-xs text-slate-400">{c.email}</p>
                                        </td>
                                        <td className="p-4 text-right">
                                            {c.current_debt > 0 ? (
                                                <span className="text-red-600 font-black">${c.current_debt.toLocaleString()}</span>
                                            ) : (
                                                <span className="text-green-600 font-bold">$0</span>
                                            )}
                                        </td>
                                        <td className="p-4 flex justify-center gap-2">
                                            {c.current_debt > 0 && (
                                                <button
                                                    onClick={() => handleOpenPayment(c)}
                                                    className="px-3 py-1 bg-green-100 text-green-700 rounded-lg text-xs font-bold hover:bg-green-200 transition-colors flex items-center gap-1"
                                                >
                                                    <span className="material-symbols-outlined text-[16px]">payments</span>
                                                    Abonar
                                                </button>
                                            )}
                                            <button onClick={() => window.location.href = `/clientes/${c.id}`} className="p-2 text-slate-400 hover:text-blue-600 rounded-lg" title="Ver Perfil Completo">
                                                <span className="material-symbols-outlined text-[20px]">visibility</span>
                                            </button>
                                            <button onClick={() => handleEdit(c)} className="p-2 text-slate-400 hover:text-blue-600 rounded-lg">
                                                <span className="material-symbols-outlined text-[20px]">edit</span>
                                            </button>
                                            <button onClick={() => deleteCustomer(c.id)} className="p-2 text-slate-400 hover:text-red-600 rounded-lg">
                                                <span className="material-symbols-outlined text-[20px]">delete</span>
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                    {/* Pagination Footer */}
                    <div className="px-6 py-4 border-t border-slate-200 bg-slate-50 flex justify-between items-center shrink-0">
                        <span className="text-sm font-medium text-slate-500">
                            Mostrando <span className="text-slate-900 font-bold">{startItem} - {endItem}</span> de <span className="text-slate-900 font-bold">{totalCount}</span> clientes
                        </span>
                        <div className="flex gap-2">
                            <button
                                onClick={() => fetchPage(page - 1)}
                                disabled={page === 0}
                                className="px-4 py-2 text-sm font-bold text-slate-600 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-sm"
                            >
                                Anterior
                            </button>
                            <button
                                onClick={() => fetchPage(page + 1)}
                                disabled={page >= totalPages - 1}
                                className="px-4 py-2 text-sm font-bold text-white bg-slate-900 rounded-lg hover:bg-slate-800 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg shadow-slate-900/10"
                            >
                                Siguiente
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Create/Edit Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4">
                    <div className="bg-white w-full max-w-lg rounded-2xl shadow-xl p-6">
                        <h2 className="text-xl font-bold mb-4">{selectedCustomer ? 'Editar Cliente' : 'Nuevo Cliente'}</h2>
                        <div className="space-y-4">
                            <div>
                                <label className="text-xs font-bold text-slate-500 uppercase">Nombre Completo</label>
                                <input className="w-full p-2 border rounded-lg" value={formData.full_name} onChange={e => setFormData({ ...formData, full_name: e.target.value })} />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="text-xs font-bold text-slate-500 uppercase">Documento</label>
                                    <input className="w-full p-2 border rounded-lg" value={formData.document_number} onChange={e => setFormData({ ...formData, document_number: e.target.value })} />
                                </div>
                                <div>
                                    <label className="text-xs font-bold text-slate-500 uppercase">Teléfono</label>
                                    <input className="w-full p-2 border rounded-lg" value={formData.phone} onChange={e => setFormData({ ...formData, phone: e.target.value })} />
                                </div>
                            </div>
                            <div>
                                <label className="text-xs font-bold text-slate-500 uppercase">Dirección</label>
                                <input className="w-full p-2 border rounded-lg" value={formData.address} onChange={e => setFormData({ ...formData, address: e.target.value })} />
                            </div>
                        </div>
                        <div className="flex justify-end gap-3 mt-6">
                            <button onClick={() => setIsModalOpen(false)} className="px-4 py-2 text-slate-600 font-bold hover:bg-slate-100 rounded-lg">Cancelar</button>
                            <button onClick={handleSave} className="px-4 py-2 bg-slate-900 text-white font-bold rounded-lg hover:bg-slate-800">Guardar</button>
                        </div>
                    </div>
                </div>
            )}

            {/* Payment Modal */}
            {isPaymentModalOpen && selectedCustomer && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4">
                    <div className="bg-white w-full max-w-sm rounded-2xl shadow-xl p-6 text-center">
                        <div className="w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-4">
                            <span className="material-symbols-outlined text-3xl">attach_money</span>
                        </div>
                        <h2 className="text-xl font-bold mb-1">Registrar Abono</h2>
                        <p className="text-slate-500 text-sm mb-6">Cliente: <span className="font-bold text-slate-900">{selectedCustomer.full_name}</span></p>

                        <div className="bg-slate-50 rounded-xl p-4 mb-4">
                            <p className="text-xs text-slate-500 uppercase font-bold">Deuda Actual</p>
                            <p className="text-3xl font-black text-red-600">${selectedCustomer.current_debt.toLocaleString()}</p>
                        </div>

                        <div className="mb-6">
                            <label className="block text-left text-xs font-bold text-slate-500 uppercase mb-1">Monto a abonar</label>
                            <input
                                type="number"
                                className="w-full p-3 border-2 border-slate-200 rounded-xl text-center text-xl font-bold focus:border-green-500 outline-none transition-colors"
                                placeholder="$0"
                                value={paymentAmount}
                                onChange={e => setPaymentAmount(e.target.value)}
                            />
                        </div>

                        <div className="flex gap-3">
                            <button onClick={() => setIsPaymentModalOpen(false)} className="flex-1 py-3 text-slate-600 font-bold hover:bg-slate-100 rounded-xl">Cancelar</button>
                            <button onClick={handlePayment} className="flex-1 py-3 bg-green-600 text-white font-bold rounded-xl hover:bg-green-500 shadow-lg shadow-green-600/20">Confirmar Pago</button>
                        </div>
                    </div>
                </div>
            )}

        </div>
    );
}
