"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Loader2, ArrowRight, X } from "lucide-react";
import { addCashMovement } from "@/app/actions/cash-movements";
import { useToast } from "@/components/ui/toast";

interface MovementModalProps {
    isOpen: boolean;
    onClose: () => void;
    type: 'in' | 'out'; // 'in' = Ingreso, 'out' = Gasto/Salida
}

const movementSchema = z.object({
    amount: z.coerce.number().min(1, "El monto debe ser mayor a 0"),
    reason: z.string().min(5, "La descripción debe ser más detallada"),
    categoryId: z.string().optional()
});

type MovementFormValues = z.infer<typeof movementSchema>;

export function CashMovementModal({ isOpen, onClose, type }: MovementModalProps) {
    const { toast } = useToast();
    const [loading, setLoading] = useState(false);

    const { register, handleSubmit, formState: { errors }, reset } = useForm({
        resolver: zodResolver(movementSchema)
    });

    const onSubmit = async (data: MovementFormValues) => {
        setLoading(true);
        try {
            const result = await addCashMovement(
                data.amount,
                type,
                data.reason,
                data.categoryId || ""
            );

            if (result.success) {
                toast(result.message, "success");
                reset();
                onClose();
            } else {
                toast(result.message, "error");
            }
        } catch (e) {
            toast("Error al registrar movimiento", "error");
        } finally {
            setLoading(false);
        }
    };

    if (!isOpen) return null;

    const isExpense = type === 'out';

    return (
        <AnimatePresence>
            <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
                <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    className="bg-white rounded-2xl shadow-xl w-full max-w-sm overflow-hidden"
                >
                    <div className={`p-6 border-b flex items-center justify-between ${isExpense ? 'bg-red-50 border-red-100' : 'bg-green-50 border-green-100'}`}>
                        <div className="flex items-center gap-3">
                            <div className={`w-10 h-10 rounded-full flex items-center justify-center ${isExpense ? 'bg-red-100 text-red-600' : 'bg-green-100 text-green-600'}`}>
                                <span className="material-symbols-outlined">{isExpense ? 'money_off' : 'attach_money'}</span>
                            </div>
                            <div>
                                <h3 className={`font-bold ${isExpense ? 'text-red-900' : 'text-green-900'}`}>
                                    {isExpense ? 'Registrar Gasto' : 'Ingreso de Efectivo'}
                                </h3>
                                <p className="text-xs text-slate-500">
                                    {isExpense ? 'Salida de dinero de la caja' : 'Entrada manual a la caja'}
                                </p>
                            </div>
                        </div>
                        <button onClick={onClose} className="p-1 hover:bg-black/5 rounded-full transition-colors">
                            <X className="w-5 h-5 text-slate-500" />
                        </button>
                    </div>

                    <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-4">
                        <div className="space-y-2">
                            <label className="text-sm font-bold text-slate-700">Monto</label>
                            <div className="relative">
                                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 font-bold">$</span>
                                <input
                                    {...register("amount")}
                                    type="number"
                                    autoFocus
                                    className="w-full pl-8 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-lg font-bold text-slate-900 focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none"
                                    placeholder="0"
                                />
                            </div>
                            {errors.amount && <p className="text-xs text-red-500 font-medium">{errors.amount.message}</p>}
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-bold text-slate-700">Motivo / Descripción</label>
                            <textarea
                                {...register("reason")}
                                rows={2}
                                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-900 focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none resize-none"
                                placeholder={isExpense ? "Ej. Pago a proveedor Pan Bimbo" : "Ej. Base adicional"}
                            />
                            {errors.reason && <p className="text-xs text-red-500 font-medium">{errors.reason.message}</p>}
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className={`w-full py-3 font-bold rounded-xl shadow-lg flex items-center justify-center gap-2 transition-all active:scale-[0.98] ${isExpense ? 'bg-red-500 hover:bg-red-600 text-white shadow-red-500/20' : 'bg-green-500 hover:bg-green-600 text-white shadow-green-500/20'}`}
                        >
                            {loading ? <Loader2 className="animate-spin w-5 h-5" /> : (
                                <>
                                    {isExpense ? 'Registrar Salida' : 'Registrar Ingreso'} <ArrowRight className="w-5 h-5" />
                                </>
                            )}
                        </button>
                    </form>
                </motion.div>
            </div>
        </AnimatePresence>
    );
}
