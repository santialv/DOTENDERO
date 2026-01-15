import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { supabase } from '@/lib/supabase';
import { useToast } from '@/components/ui/toast';
import { Loader2, TrendingDown, X, DollarSign, AlignLeft, Tag } from 'lucide-react';
// import { formatCurrency } from '@/lib/utils'; // Keep imports clean

interface ExpenseModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess?: () => void;
}

const EXPENSE_CATEGORIES = [
    { value: 'provider', label: 'Pago a Proveedor' },
    { value: 'utility', label: 'Servicios de la Tienda' },
    { value: 'salary', label: 'Pago de Nómina/Turno' },
    { value: 'personal', label: 'Retiro Personal/Dueño' },
    { value: 'other', label: 'Otros Gastos' },
];

export function ExpenseModal({ isOpen, onClose, onSuccess }: ExpenseModalProps) {
    const { toast } = useToast();
    const [loading, setLoading] = useState(false);

    // Form State
    const [amount, setAmount] = useState('');
    const [description, setDescription] = useState('');
    const [category, setCategory] = useState('provider');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!amount || parseFloat(amount) <= 0) {
            toast("Ingresa un monto válido", "error");
            return;
        }
        if (!description) {
            toast("Ingresa una descripción", "error");
            return;
        }

        setLoading(true);

        try {
            const { data: { session } } = await supabase.auth.getSession();
            if (!session) return;

            const { data: profile } = await supabase.from('profiles').select('organization_id').eq('id', session.user.id).single();

            if (!profile?.organization_id) {
                toast("Error de organización", "error");
                return;
            }

            const { error } = await supabase.from('cash_expenses').insert({
                organization_id: profile.organization_id,
                user_id: session.user.id,
                amount: parseFloat(amount),
                description,
                category
            });

            if (error) throw error;

            toast("Gasto registrado correctamente", "success");
            setAmount('');
            setDescription('');
            setCategory('provider');
            if (onSuccess) onSuccess();
            onClose();

        } catch (error: any) {
            console.error("Error creating expense (FULL):", error);
            console.error("Error message:", error.message || "No message");
            toast(`Error al guardar gasto: ${error.message || "Desconocido"}`, "error");
        } finally {
            setLoading(false);
        }
    };

    if (!isOpen) return null;

    return (
        <AnimatePresence>
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
                <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden flex flex-col"
                >
                    {/* Header */}
                    <div className="p-4 border-b border-gray-100 flex justify-between items-center bg-red-50">
                        <h2 className="text-lg font-bold text-red-900 flex items-center gap-2">
                            <TrendingDown className="w-5 h-5 text-red-600" />
                            Registrar Salida de Dinero
                        </h2>
                        <button onClick={onClose} className="p-1 hover:bg-red-100 rounded-full transition-colors text-red-400 hover:text-red-700">
                            <X className="w-5 h-5" />
                        </button>
                    </div>

                    <form onSubmit={handleSubmit} className="p-6 flex flex-col gap-4">

                        {/* Amount */}
                        <div>
                            <label className="text-xs font-bold text-gray-500 uppercase mb-1 block">Monto a Retirar</label>
                            <div className="relative">
                                <DollarSign className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
                                <input
                                    type="number"
                                    value={amount}
                                    onChange={(e) => setAmount(e.target.value)}
                                    className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 focus:border-red-500 focus:ring-2 focus:ring-red-200 outline-none font-bold text-lg text-gray-900"
                                    placeholder="0"
                                    autoFocus
                                />
                            </div>
                        </div>

                        {/* Category */}
                        <div>
                            <label className="text-xs font-bold text-gray-500 uppercase mb-1 block">Tipo de Gasto</label>
                            <div className="relative">
                                <Tag className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
                                <select
                                    value={category}
                                    onChange={(e) => setCategory(e.target.value)}
                                    className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 focus:border-red-500 focus:ring-2 focus:ring-red-200 outline-none text-gray-900 appearance-none bg-white"
                                >
                                    {EXPENSE_CATEGORIES.map(cat => (
                                        <option key={cat.value} value={cat.value}>{cat.label}</option>
                                    ))}
                                </select>
                            </div>
                        </div>

                        {/* Description */}
                        <div>
                            <label className="text-xs font-bold text-gray-500 uppercase mb-1 block">Descripción / Nota</label>
                            <div className="relative">
                                <AlignLeft className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
                                <textarea
                                    value={description}
                                    onChange={(e) => setDescription(e.target.value)}
                                    className="w-full pl-10 pr-4 py-2 rounded-xl border border-gray-200 focus:border-red-500 focus:ring-2 focus:ring-red-200 outline-none text-gray-900 resize-none h-24"
                                    placeholder="¿Para qué es el dinero?"
                                />
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="mt-2 w-full py-3 bg-red-600 hover:bg-red-700 text-white font-bold rounded-xl shadow-lg shadow-red-600/20 active:scale-95 transition-all flex items-center justify-center gap-2"
                        >
                            {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : "Registrar Salida"}
                        </button>

                    </form>

                </motion.div>
            </div>
        </AnimatePresence>
    );
}
