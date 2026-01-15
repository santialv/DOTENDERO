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
            const timer = setTimeout(() => setShowConfetti(false), 7000); // Confetti for 7s
            return () => clearTimeout(timer);
        }
    }, [isOpen]);

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            {showConfetti && <Confetti width={width} height={height} numberOfPieces={500} recycle={false} />}
            <DialogContent className="max-w-md text-center p-8 bg-white border border-slate-100 shadow-2xl rounded-2xl">
                <div className="flex justify-center mb-6">
                    <div className="w-20 h-20 bg-emerald-100 rounded-full flex items-center justify-center shadow-inner animate-in zoom-in duration-500">
                        <span className="material-symbols-outlined text-[48px] text-emerald-600">rocket_launch</span>
                    </div>
                </div>

                <DialogHeader className="mb-4">
                    <DialogTitle className="text-3xl font-black text-slate-900 leading-tight">
                        ¡Bienvenido a la Familia <span className="text-emerald-600">DonTendero</span>!
                    </DialogTitle>
                </DialogHeader>

                <div className="space-y-4 mb-8">
                    <p className="text-slate-600 text-lg font-medium">
                        Has actualizado correctamente al plan <strong className="text-slate-900 uppercase">{planName}</strong>.
                    </p>
                    <p className="text-slate-500 italic">
                        "El éxito no es el final, el fracaso no es fatal: es el coraje para continuar lo que cuenta."
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
