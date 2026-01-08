"use client";

import { useState, useEffect } from "react";

interface Customer {
    id: string;
    name: string;
    cc: string;
    phone: string;
    type: "Cliente" | "Proveedor";
    email?: string;
    address?: string;
    createdAt: string;
}

interface Transaction {
    id: string;
    date: string;
    amount: number;
    items: any[];
    customerId?: string;
    description: string;
    change?: number;
    amountTendered?: number;
    method: string;
}

export default function ClientsPage() {
    const [customers, setCustomers] = useState<Customer[]>([]);
    const [transactions, setTransactions] = useState<Transaction[]>([]);
    const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
    const [searchTerm, setSearchTerm] = useState("");
    const [isModalOpen, setIsModalOpen] = useState(false);

    // New/Edit Form State
    const [formData, setFormData] = useState({
        id: "",
        name: "",
        cc: "",
        phone: "",
        email: "",
        address: "",
        type: "Cliente" as "Cliente" | "Proveedor"
    });

    useEffect(() => {
        const savedCustomers = JSON.parse(localStorage.getItem("customers") || "[]");
        const savedTransactions = JSON.parse(localStorage.getItem("transactions") || "[]");

        if (savedCustomers.length === 0) {
            const initialCustomers: Customer[] = [
                { id: "1", name: "Juan Pérez", cc: "12345678", phone: "3001234567", type: "Cliente", email: "juan@gmail.com", address: "Av. Siempre Viva 123", createdAt: new Date().toISOString() },
                { id: "2", name: "María Rodriguez", cc: "87654321", phone: "3109876543", type: "Cliente", email: "maria@hotmail.com", createdAt: new Date().toISOString() },
                { id: "3", name: "Distribuidora de Bebidas SAS", cc: "900123456", phone: "6017894561", type: "Proveedor", address: "Calle 100 #15-20", createdAt: new Date().toISOString() },
            ];
            localStorage.setItem("customers", JSON.stringify(initialCustomers));
            setCustomers(initialCustomers);
            // Select first one for demo visual match
            setSelectedCustomer(initialCustomers[0]);
        } else {
            setCustomers(savedCustomers);
            setSelectedCustomer(savedCustomers[0] || null);
        }
        setTransactions(savedTransactions);
    }, []);

    const handleSaveCustomer = () => {
        if (!formData.name || !formData.cc) {
            alert("Por favor complete nombre y cédula/NIT");
            return;
        }

        const duplicate = customers.find(c => c.cc === formData.cc && c.id !== formData.id);
        if (duplicate) {
            alert("Ya existe un cliente con esta Cédula/NIT");
            return;
        }

        let updatedCustomers: Customer[];
        let newCust: Customer;

        if (formData.id) {
            updatedCustomers = customers.map(c => c.id === formData.id ? { ...c, ...formData } : c);
            newCust = updatedCustomers.find(c => c.id === formData.id)!;
        } else {
            const { id: _, ...customerData } = formData;
            newCust = {
                id: crypto.randomUUID(),
                ...customerData,
                createdAt: new Date().toISOString()
            };
            updatedCustomers = [...customers, newCust];
        }

        setCustomers(updatedCustomers);
        localStorage.setItem("customers", JSON.stringify(updatedCustomers));
        setSelectedCustomer(newCust); // Select the new/edited one
        setIsModalOpen(false);
        setFormData({ id: "", name: "", cc: "", phone: "", email: "", address: "", type: "Cliente" });
    };

    const handleEdit = (c: Customer) => {
        setFormData({
            id: c.id,
            name: c.name,
            cc: c.cc,
            phone: c.phone,
            email: c.email || "",
            address: c.address || "",
            type: c.type
        });
        setIsModalOpen(true);
    };

    const handleDelete = (id: string) => {
        if (!confirm("¿Eliminar cliente?")) return;
        const updated = customers.filter(c => c.id !== id);
        setCustomers(updated);
        localStorage.setItem("customers", JSON.stringify(updated));
        if (selectedCustomer?.id === id) setSelectedCustomer(updated[0] || null);
    };

    const filteredCustomers = customers.filter(c =>
        c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        c.cc.includes(searchTerm) ||
        c.phone.includes(searchTerm)
    );

    const customerHistory = selectedCustomer
        ? transactions.filter(t => t.customerId === selectedCustomer.id || t.customerName === selectedCustomer.name)
        : [];

    const totalDebt = 50000; // Mocked for design match, can be real later

    return (
        <div className="flex flex-col h-full bg-slate-50 font-display overflow-hidden">
            {/* Top Header */}
            <header className="h-16 flex items-center justify-between px-6 bg-white border-b border-slate-200 shrink-0">
                <div className="flex items-center gap-4">
                    <span className="material-symbols-outlined text-slate-900">groups</span>
                    <h2 className="text-lg font-bold text-slate-900">Directorio de Clientes</h2>
                </div>
                <div className="flex items-center gap-4">
                    <button className="flex items-center justify-center w-10 h-10 rounded-full hover:bg-slate-100 text-slate-900 transition-colors">
                        <span className="material-symbols-outlined">notifications</span>
                    </button>
                    <button className="flex items-center justify-center w-10 h-10 rounded-full hover:bg-slate-100 text-slate-900 transition-colors">
                        <span className="material-symbols-outlined">help</span>
                    </button>
                </div>
            </header>

            {/* Two Column Layout */}
            <div className="flex flex-1 overflow-hidden">
                {/* Left Column: List */}
                <div className="w-[380px] flex flex-col border-r border-slate-200 bg-white shrink-0">
                    {/* Search & Action */}
                    <div className="p-4 flex flex-col gap-4 border-b border-slate-200 bg-white sticky top-0 z-10">
                        <div className="relative w-full">
                            <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                                <span className="material-symbols-outlined text-slate-400">search</span>
                            </div>
                            <input
                                className="block w-full p-2.5 pl-10 text-sm rounded-lg bg-slate-100 border-none focus:ring-2 focus:ring-primary text-slate-900 placeholder-slate-400"
                                placeholder="Buscar por nombre o teléfono..."
                                type="text"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>
                        <button
                            onClick={() => {
                                setFormData({ id: "", name: "", cc: "", phone: "", email: "", address: "", type: "Cliente" });
                                setIsModalOpen(true);
                            }}
                            className="flex items-center justify-center gap-2 w-full bg-primary hover:bg-primary-dark text-text-main font-bold py-2.5 px-4 rounded-lg transition-colors border-2 border-primary-dark/10"
                        >
                            <span className="material-symbols-outlined text-[20px]">add</span>
                            <span>Nuevo Cliente</span>
                        </button>
                    </div>

                    {/* List Items */}
                    <div className="flex-1 overflow-y-auto p-2 space-y-1 custom-scrollbar">
                        {filteredCustomers.map((customer) => (
                            <div
                                key={customer.id}
                                onClick={() => setSelectedCustomer(customer)}
                                className={`cursor-pointer flex items-center gap-3 p-3 rounded-lg transition-all ${selectedCustomer?.id === customer.id
                                    ? 'bg-primary/10 border-l-4 border-primary shadow-sm'
                                    : 'hover:bg-slate-50 border border-transparent hover:border-slate-200'
                                    }`}
                            >
                                <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center shrink-0 text-blue-600 font-bold text-lg">
                                    {customer.name.charAt(0)}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <div className="flex justify-between items-center">
                                        <h3 className="font-medium text-slate-900 truncate">{customer.name}</h3>
                                        {/* Mocking 'Debt' status visually based on ID odd/even for visual variety like snippet */}
                                        {parseInt(customer.cc.slice(-1)) % 2 === 0 ? (
                                            <span className="text-[10px] font-bold text-red-500 bg-red-50 px-1.5 py-0.5 rounded">Debe</span>
                                        ) : (
                                            <span className="text-[10px] font-bold text-green-500 bg-green-50 px-1.5 py-0.5 rounded">Al día</span>
                                        )}
                                    </div>
                                    <p className="text-sm text-slate-500 font-medium truncate">{customer.type}</p>
                                </div>
                                <span className="material-symbols-outlined text-slate-400 text-sm">chevron_right</span>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Right Column: Detail */}
                <div className="flex-1 overflow-y-auto bg-slate-50 p-8 custom-scrollbar">
                    {selectedCustomer ? (
                        <div className="max-w-4xl mx-auto flex flex-col gap-8 animate-in fade-in slide-in-from-bottom-4 duration-300">
                            {/* Profile Header Card */}
                            <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-200 flex items-start justify-between gap-6">
                                <div className="flex gap-6">
                                    <div className="w-24 h-24 rounded-full bg-slate-200 flex items-center justify-center border-4 border-slate-100 text-slate-400 text-3xl font-black">
                                        {selectedCustomer.name.charAt(0)}
                                    </div>
                                    <div className="flex flex-col py-1">
                                        <h2 className="text-3xl font-bold text-slate-900 mb-2">{selectedCustomer.name}</h2>
                                        <div className="flex flex-col gap-1 text-slate-500 text-sm font-medium">
                                            <div className="flex items-center gap-2">
                                                <span className="material-symbols-outlined text-[18px]">badge</span>
                                                <span>{selectedCustomer.cc}</span>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <span className="material-symbols-outlined text-[18px]">phone</span>
                                                <span>{selectedCustomer.phone || "No registrado"}</span>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <span className="material-symbols-outlined text-[18px]">mail</span>
                                                <span>{selectedCustomer.email || "No registrado"}</span>
                                            </div>
                                            {selectedCustomer.address && (
                                                <div className="flex items-center gap-2">
                                                    <span className="material-symbols-outlined text-[18px]">location_on</span>
                                                    <span>{selectedCustomer.address}</span>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                                <button
                                    onClick={() => handleEdit(selectedCustomer)}
                                    className="p-2 rounded-lg text-slate-500 hover:bg-slate-100 hover:text-slate-900 transition-colors"
                                >
                                    <span className="material-symbols-outlined">edit</span>
                                </button>
                            </div>

                            {/* Stats Grid */}
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                {/* Debt Status */}
                                <div className="bg-white rounded-xl p-6 shadow-sm border-l-4 border-l-red-500 border-t border-r border-b border-slate-200 relative overflow-hidden group">
                                    <div className="absolute right-0 top-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                                        <span className="material-symbols-outlined text-[80px] text-red-500">account_balance_wallet</span>
                                    </div>
                                    <p className="text-sm font-medium text-slate-500 uppercase tracking-wider mb-1">Estado de Cuenta</p>
                                    <h3 className="text-3xl font-bold text-red-600">$50.000</h3>
                                    <div className="flex items-center gap-1 mt-2 text-red-600 text-sm font-medium">
                                        <span className="material-symbols-outlined text-[16px]">warning</span>
                                        <span>Pendiente de pago</span>
                                    </div>
                                </div>
                                {/* Last Visit (Mock) */}
                                <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-200">
                                    <p className="text-sm font-medium text-slate-500 uppercase tracking-wider mb-1">Última Visita</p>
                                    <h3 className="text-2xl font-bold text-slate-900">12 Oct, 2023</h3>
                                    <p className="text-sm text-slate-500 mt-2">Hace 3 días</p>
                                </div>
                                {/* Total Spent (Mock) */}
                                <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-200">
                                    <p className="text-sm font-medium text-slate-500 uppercase tracking-wider mb-1">Gasto Promedio</p>
                                    <h3 className="text-2xl font-bold text-slate-900">$8.250</h3>
                                    <div className="flex items-center gap-1 mt-2 text-primary font-medium text-sm">
                                        <span className="material-symbols-outlined text-[16px]">trending_up</span>
                                        <span>+12% vs mes anterior</span>
                                    </div>
                                </div>
                            </div>

                            {/* Action Buttons */}
                            <div className="flex gap-4">
                                <button className="flex-1 bg-primary hover:bg-primary-dark text-text-main font-bold py-3 px-6 rounded-lg shadow-sm transition-colors flex items-center justify-center gap-2 border-2 border-primary-dark/10">
                                    <span className="material-symbols-outlined">payments</span>
                                    Registrar Pago
                                </button>
                                <button className="flex-1 bg-white hover:bg-slate-100 border-2 border-slate-200 text-slate-900 font-medium py-3 px-6 rounded-lg transition-colors flex items-center justify-center gap-2">
                                    <span className="material-symbols-outlined">shopping_cart</span>
                                    Nueva Venta
                                </button>
                                <button
                                    onClick={() => handleDelete(selectedCustomer.id)}
                                    className="bg-white hover:bg-red-50 border-2 border-red-100 text-red-500 font-medium py-3 px-4 rounded-lg transition-colors"
                                >
                                    <span className="material-symbols-outlined">delete</span>
                                </button>
                            </div>

                            {/* Transaction History */}
                            <div className="flex flex-col gap-4">
                                <div className="flex items-center justify-between">
                                    <h3 className="text-lg font-bold text-slate-900">Historial de Compras</h3>
                                    <a className="text-sm font-medium text-primary hover:text-primary-dark" href="#">Ver todo</a>
                                </div>
                                <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-sm">
                                    {customerHistory.length === 0 ? (
                                        <div className="p-8 text-center text-slate-500">
                                            <p>No hay compras recientes</p>
                                        </div>
                                    ) : (
                                        <table className="w-full text-left border-collapse">
                                            <thead className="bg-slate-100 text-slate-500 text-xs uppercase font-semibold">
                                                <tr>
                                                    <th className="px-6 py-4">Fecha</th>
                                                    <th className="px-6 py-4">Resumen</th>
                                                    <th className="px-6 py-4 text-right">Total</th>
                                                    <th className="px-6 py-4 text-center">Estado</th>
                                                    <th className="px-6 py-4"></th>
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y divide-slate-100">
                                                {customerHistory.map(tx => (
                                                    <tr key={tx.id} className="hover:bg-slate-50 transition-colors">
                                                        <td className="px-6 py-4 text-sm text-slate-900">
                                                            {new Date(tx.date).toLocaleDateString()} <br />
                                                            <span className="text-xs text-slate-500">{new Date(tx.date).toLocaleTimeString()}</span>
                                                        </td>
                                                        <td className="px-6 py-4 text-sm text-slate-900">
                                                            <div className="font-medium line-clamp-1">{tx.description}</div>
                                                            <div className="text-xs text-slate-500">{tx.items.length} items</div>
                                                        </td>
                                                        <td className="px-6 py-4 text-sm font-bold text-right text-slate-900">
                                                            ${tx.amount.toLocaleString()}
                                                        </td>
                                                        <td className="px-6 py-4 text-center">
                                                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${tx.method === 'Fiado' ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800'}`}>
                                                                {tx.method === 'Fiado' ? 'Fiado' : 'Pagado'}
                                                            </span>
                                                        </td>
                                                        <td className="px-6 py-4 text-right">
                                                            <button className="text-slate-400 hover:text-primary transition-colors">
                                                                <span className="material-symbols-outlined">visibility</span>
                                                            </button>
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    )}
                                </div>
                            </div>
                        </div>
                    ) : (
                        <div className="h-full flex flex-col items-center justify-center text-slate-400 opacity-50">
                            <span className="material-symbols-outlined text-[64px] mb-4">person</span>
                            <p>Selecciona un cliente para ver detalles</p>
                        </div>
                    )}
                </div>
            </div>

            {/* Modal: New / Edit */}
            {isModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4 animate-in fade-in duration-200">
                    <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md overflow-hidden">
                        <div className="p-6 border-b border-slate-200 flex items-center justify-between bg-white">
                            <h2 className="text-xl font-bold text-slate-900">{formData.id ? "Editar Cliente" : "Nuevo Cliente"}</h2>
                            <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-900">
                                <span className="material-symbols-outlined">close</span>
                            </button>
                        </div>
                        <div className="p-6 space-y-4">
                            <div>
                                <label className="block text-sm font-bold text-slate-900 mb-1">Nombre Completo <span className="text-red-500">*</span></label>
                                <input
                                    className="w-full px-4 py-2 rounded-xl border border-slate-200 bg-slate-50 text-slate-900 focus:ring-2 focus:ring-primary focus:border-primary outline-none"
                                    value={formData.name}
                                    onChange={e => setFormData({ ...formData, name: e.target.value })}
                                    autoFocus
                                />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-bold text-slate-900 mb-1">CC / NIT</label>
                                    <input
                                        className="w-full px-4 py-2 rounded-xl border border-slate-200 bg-slate-50 text-slate-900 focus:ring-2 focus:ring-primary focus:border-primary outline-none"
                                        value={formData.cc}
                                        onChange={e => setFormData({ ...formData, cc: e.target.value })}
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-bold text-slate-900 mb-1">Tipo</label>
                                    <select
                                        className="w-full px-4 py-2 rounded-xl border border-slate-200 bg-slate-50 text-slate-900 focus:ring-2 focus:ring-primary focus:border-primary outline-none"
                                        value={formData.type}
                                        onChange={e => setFormData({ ...formData, type: e.target.value as any })}
                                    >
                                        <option value="Cliente">Cliente</option>
                                        <option value="Proveedor">Proveedor</option>
                                    </select>
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm font-bold text-slate-900 mb-1">Teléfono</label>
                                <input
                                    className="w-full px-4 py-2 rounded-xl border border-slate-200 bg-slate-50 text-slate-900 focus:ring-2 focus:ring-primary focus:border-primary outline-none"
                                    value={formData.phone}
                                    onChange={e => setFormData({ ...formData, phone: e.target.value })}
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-bold text-slate-900 mb-1">Email</label>
                                <input
                                    className="w-full px-4 py-2 rounded-xl border border-slate-200 bg-slate-50 text-slate-900 focus:ring-2 focus:ring-primary focus:border-primary outline-none"
                                    value={formData.email}
                                    onChange={e => setFormData({ ...formData, email: e.target.value })}
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-bold text-slate-900 mb-1">Dirección</label>
                                <input
                                    className="w-full px-4 py-2 rounded-xl border border-slate-200 bg-slate-50 text-slate-900 focus:ring-2 focus:ring-primary focus:border-primary outline-none"
                                    value={formData.address}
                                    onChange={e => setFormData({ ...formData, address: e.target.value })}
                                />
                            </div>
                        </div>
                        <div className="p-6 border-t border-slate-200 bg-slate-50 flex gap-3">
                            <button onClick={() => setIsModalOpen(false)} className="flex-1 py-3 rounded-xl border border-slate-200 text-slate-900 font-bold hover:bg-white transition-colors">Cancelar</button>
                            <button onClick={handleSaveCustomer} className="flex-1 py-3 rounded-xl bg-primary text-text-main font-bold hover:bg-primary-dark transition-colors shadow-lg shadow-primary/20">Guardar</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
