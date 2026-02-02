"use client";

import { useEffect, useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Rocket, ShieldCheck, Calculator, Bug, CheckCircle2, LayoutGrid } from "lucide-react";
import confetti from "canvas-confetti";

export function ChangelogModal() {
    const [open, setOpen] = useState(false);

    // Versión actual de los cambios. Cambiar esto forzará que el modal vuelva a salir.
    const CURRENT_VERSION = "2026-02-01-registers-and-perms";

    useEffect(() => {
        const hasSeenUpdate = localStorage.getItem(`changelog_${CURRENT_VERSION}`);
        if (!hasSeenUpdate) {
            // Pequeño delay para no abrumar al cargar
            const timer = setTimeout(() => {
                setOpen(true);
                // Efecto de celebración
                confetti({
                    particleCount: 100,
                    spread: 70,
                    origin: { y: 0.6 }
                });
            }, 1000);
            return () => clearTimeout(timer);
        }
    }, []);

    const handleClose = () => {
        setOpen(false);
        localStorage.setItem(`changelog_${CURRENT_VERSION}`, "true");
    };

    return (
        <Dialog open={open} onOpenChange={handleClose}>
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <div className="flex items-center gap-2 mb-2">
                        <Badge variant="default" className="bg-[#13ec80] text-black hover:bg-[#0fd673]">
                            ¡Actualización!
                        </Badge>
                        <span className="text-xs text-muted-foreground">Actualización 1 Feb</span>
                    </div>
                    <DialogTitle className="text-xl flex items-center gap-2">
                        <Rocket className="w-5 h-5 text-indigo-600" />
                        Super Control de Caja y Equipo
                    </DialogTitle>
                    <DialogDescription>
                        Hemos blindado tu negocio y mejorado el control de tu dinero. Mira lo nuevo:
                    </DialogDescription>
                </DialogHeader>

                <div className="space-y-4 py-2">
                    {/* Item 1 */}
                    <div className="flex gap-3 items-start">
                        <div className="bg-indigo-100 p-2 rounded-full shrink-0">
                            <LayoutGrid className="w-4 h-4 text-indigo-600" />
                        </div>
                        <div>
                            <h4 className="text-sm font-semibold text-foreground">Multi-Cajas & Numeración</h4>
                            <p className="text-xs text-muted-foreground mt-0.5">
                                Crea y elimina cajas fácilmente. El sistema ahora las numera automáticamente y permite borrarlas sin perder historial.
                            </p>
                        </div>
                    </div>

                    <Separator />

                    {/* Item 2 */}
                    <div className="flex gap-3 items-start">
                        <div className="bg-purple-100 p-2 rounded-full shrink-0">
                            <ShieldCheck className="w-4 h-4 text-purple-600" />
                        </div>
                        <div>
                            <h4 className="text-sm font-semibold text-foreground">Permisos Granulares</h4>
                            <p className="text-xs text-muted-foreground mt-0.5">
                                Ahora decides quién puede ver tus costos de compra, quién puede dar descuentos y quién crea clientes. ¡Control total!
                            </p>
                        </div>
                    </div>

                    <Separator />

                    {/* Item 3 */}
                    <div className="flex gap-3 items-start">
                        <div className="bg-emerald-100 p-2 rounded-full shrink-0">
                            <Calculator className="w-4 h-4 text-emerald-600" />
                        </div>
                        <div>
                            <h4 className="text-sm font-semibold text-foreground">Contabilidad de Diferencias</h4>
                            <p className="text-xs text-muted-foreground mt-0.5">
                                Al cerrar turno, el sistema detecta sobrantes o faltantes y los contabiliza automáticamente como ajustes de caja.
                            </p>
                        </div>
                    </div>
                </div>

                <DialogFooter className="sm:justify-between sm:flex-row gap-2">
                    <div className="text-[10px] text-muted-foreground self-center">
                        v2.0.0 (Registers & Perms)
                    </div>
                    <Button onClick={handleClose} className="w-full sm:w-auto gap-2 bg-[#13ec80] text-slate-900 hover:bg-[#10d673] font-bold">
                        <CheckCircle2 className="w-4 h-4" />
                        ¡Excelente, a vender!
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
