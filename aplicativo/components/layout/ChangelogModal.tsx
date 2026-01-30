"use client";

import { useEffect, useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Rocket, ShieldCheck, Calculator, Bug, CheckCircle2 } from "lucide-react";
import confetti from "canvas-confetti";

export function ChangelogModal() {
    const [open, setOpen] = useState(false);

    // Versión actual de los cambios. Cambiar esto forzará que el modal vuelva a salir.
    const CURRENT_VERSION = "2026-01-29-updates";

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
                            ¡Nuevo!
                        </Badge>
                        <span className="text-xs text-muted-foreground">Actualización 29 Ene</span>
                    </div>
                    <DialogTitle className="text-xl flex items-center gap-2">
                        <Rocket className="w-5 h-5 text-purple-600" />
                        Novedades en DonTendero
                    </DialogTitle>
                    <DialogDescription>
                        Hemos realizado mejoras importantes para ti y tu equipo. Aquí tienes un resumen de lo nuevo:
                    </DialogDescription>
                </DialogHeader>

                <div className="space-y-4 py-2">
                    {/* Item 1 */}
                    <div className="flex gap-3 items-start">
                        <div className="bg-purple-100 p-2 rounded-full shrink-0">
                            <ShieldCheck className="w-4 h-4 text-purple-600" />
                        </div>
                        <div>
                            <h4 className="text-sm font-semibold text-foreground">Login Más Seguro</h4>
                            <p className="text-xs text-muted-foreground mt-0.5">
                                Implementamos protección contra intentos fallidos. Ahora tu cuenta se bloquea temporalmente si detectamos actividad sospechosa.
                            </p>
                        </div>
                    </div>

                    <Separator />

                    {/* Item 2 */}
                    <div className="flex gap-3 items-start">
                        <div className="bg-green-100 p-2 rounded-full shrink-0">
                            <Calculator className="w-4 h-4 text-green-600" />
                        </div>
                        <div>
                            <h4 className="text-sm font-semibold text-foreground">Calculadora de Precios 2.0</h4>
                            <p className="text-xs text-muted-foreground mt-0.5">
                                Cálculo de márgenes optimizado. Ahora descuenta impuestos automáticamente para mostrarte tu ganancia real.
                            </p>
                        </div>
                    </div>

                    <Separator />

                    {/* Item 3 */}
                    <div className="flex gap-3 items-start">
                        <div className="bg-blue-100 p-2 rounded-full shrink-0">
                            <Bug className="w-4 h-4 text-blue-600" />
                        </div>
                        <div>
                            <h4 className="text-sm font-semibold text-foreground">Correcciones & Estilo</h4>
                            <p className="text-xs text-muted-foreground mt-0.5">
                                Solucionado error en Cierre de Caja (perfil sin tienda) y renovamos nuestra identidad visual con nuevo Logo.
                            </p>
                        </div>
                    </div>
                </div>

                <DialogFooter className="sm:justify-between sm:flex-row gap-2">
                    <div className="text-[10px] text-muted-foreground self-center">
                        v1.2.0
                    </div>
                    <Button onClick={handleClose} className="w-full sm:w-auto gap-2">
                        <CheckCircle2 className="w-4 h-4" />
                        Entendido, a trabajar
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
