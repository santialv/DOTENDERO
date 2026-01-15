"use client";

import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { useEffect, useState } from "react";
import Confetti from "react-confetti";
import { useWindowSize } from "react-use";

interface PlanSuccessModalProps {
    isOpen: boolean;
    onClose: () => void;
    planName: string;
}

export const PlanSuccessModal = ({ isOpen, onClose, planName }: PlanSuccessModalProps) => {
    const { width, height } = useWindowSize();
    const [showConfetti, setShowConfetti] = useState(false);

    useEffect(() => {
        if (isOpen) {
            setShowConfetti(true);
            // Confetti runs indefinitely while modal is open to create the "aleleyas" effect
        } else {
            setShowConfetti(false);
        }
    }, [isOpen]);

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            {showConfetti && (
                <div className="fixed inset-0 z-[9999] pointer-events-none">
                    <Confetti width={width} height={height} numberOfPieces={400} recycle={true} gravity={0.15} />
                </div>
            )}
            <DialogContent className="max-w-md text-center p-8 bg-white border border-slate-100 shadow-2xl rounded-2xl z-[10000]">
                <div className="flex justify-center mb-6">
                    <div className="w-24 h-24 bg-yellow-100 rounded-full flex items-center justify-center shadow-inner animate-in zoom-in duration-500 ring-4 ring-yellow-50">
                        <span className="material-symbols-outlined text-[56px] text-yellow-600 animate-bounce">celebration</span>
                    </div>
                </div>

                <DialogHeader className="mb-4">
                    <DialogTitle className="text-4xl font-black text-slate-900 leading-none tracking-tight">
                        ¡La sacaste del <span className="text-emerald-600">Estadio!</span>
                    </DialogTitle>
                </DialogHeader>

                <div className="space-y-4 mb-8">
                    <div className="bg-slate-50 p-4 rounded-xl border border-slate-100">
                        <p className="text-slate-800 text-lg font-medium">
                            Bienvenido al plan <strong className="text-emerald-600 uppercase tracking-wide">{planName}</strong>
                        </p>
                    </div>

                    <p className="text-slate-500 text-base leading-relaxed">
                        "En Colombia no nos varamos, nos reinventamos. Hoy diste un paso gigante para llevar tu negocio a las grandes ligas."
                    </p>
                    <p className="text-slate-400 text-sm font-bold uppercase tracking-wider mt-2 text-center">
                        ¡A camellar se dijo! 🚀
                    </p>
                </div>

                <button
                    onClick={onClose}
                    className="w-full py-3.5 rounded-xl bg-slate-900 hover:bg-black text-white font-bold shadow-lg shadow-slate-500/20 transition-all transform active:scale-95 text-lg"
                >
                    Comenzar a Crecer
                </button>
            </DialogContent>
        </Dialog>
    );
};
