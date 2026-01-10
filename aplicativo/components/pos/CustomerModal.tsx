import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";

interface Customer {
    id: string;
    full_name: string;
    document_number: string;
    phone?: string;
    email?: string;
    current_debt: number;
}

interface CustomerModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSelect: (customer: { id: string, name: string }) => void;
}

export const CustomerModal = ({ isOpen, onClose, onSelect }: CustomerModalProps) => {
    const [customers, setCustomers] = useState<Customer[]>([]);
    const [searchTerm, setSearchTerm] = useState("");
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (isOpen) {
            fetchCustomers();
        }
    }, [isOpen]);

    const fetchCustomers = async () => {
        setLoading(true);
        const { data } = await supabase
            .from('customers')
            .select('*')
            .order('full_name');

        if (data) {
            setCustomers(data);
        }
        setLoading(false);
    };

    const filtered = customers.filter(c =>
        c.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        c.document_number?.includes(searchTerm)
    );

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4 animate-in fade-in">
            <div className="bg-white w-full max-w-lg rounded-2xl shadow-2xl flex flex-col max-h-[80vh] overflow-hidden">
                <div className="p-4 border-b border-slate-100 flex items-center justify-between">
                    <h3 className="font-bold text-lg text-slate-900">Seleccionar Cliente</h3>
                    <button onClick={onClose} className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-slate-100 transition-colors">
                        <span className="material-symbols-outlined text-slate-500">close</span>
                    </button>
                </div>

                <div className="p-4 bg-slate-50 border-b border-slate-100">
                    <div className="relative">
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 material-symbols-outlined text-slate-400">search</span>
                        <input
                            className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-200 outline-none focus:ring-2 focus:ring-primary shadow-sm"
                            placeholder="Buscar por nombre o documento..."
                            value={searchTerm}
                            onChange={e => setSearchTerm(e.target.value)}
                            autoFocus
                        />
                    </div>
                </div>

                <div className="flex-1 overflow-y-auto p-2">
                    {loading ? (
                        <div className="p-8 text-center text-slate-500">Cargando clientes...</div>
                    ) : filtered.length === 0 ? (
                        <div className="p-8 text-center text-slate-500">
                            No se encontraron clientes.
                            {/* Future: Add 'Create Client' button here */}
                        </div>
                    ) : (
                        <div className="space-y-1">
                            <button
                                onClick={() => { onSelect({ id: 'default', name: 'Venta General' }); onClose(); }}
                                className="w-full text-left p-3 rounded-xl hover:bg-slate-50 border border-transparent hover:border-slate-100 flex items-center gap-3 transition-colors mb-2"
                            >
                                <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center text-slate-500 font-bold">
                                    VG
                                </div>
                                <div>
                                    <p className="font-bold text-slate-900">Venta General</p>
                                    <p className="text-xs text-slate-500">Cliente Público</p>
                                </div>
                            </button>

                            {filtered.map(c => (
                                <button
                                    key={c.id}
                                    onClick={() => { onSelect({ id: c.id, name: c.full_name }); onClose(); }}
                                    className="w-full text-left p-3 rounded-xl hover:bg-blue-50 border border-transparent hover:border-blue-100 flex items-center gap-3 transition-colors group"
                                >
                                    <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold uppercase">
                                        {c.full_name.substring(0, 2)}
                                    </div>
                                    <div className="flex-1">
                                        <p className="font-bold text-slate-900 group-hover:text-blue-700">{c.full_name}</p>
                                        <p className="text-xs text-slate-500 flex gap-2">
                                            <span>CC: {c.document_number}</span>
                                            {c.current_debt > 0 && <span className="text-red-500 font-bold">Deuda: ${c.current_debt.toLocaleString()}</span>}
                                        </p>
                                    </div>
                                    <span className="material-symbols-outlined text-transparent group-hover:text-blue-500">check_circle</span>
                                </button>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};
