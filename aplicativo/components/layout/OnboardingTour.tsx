"use client";

import { useEffect, useState } from "react";
import { driver } from "driver.js";
import "driver.js/dist/driver.css";
import { usePathname, useRouter } from "next/navigation";

export function OnboardingTour() {
    const pathname = usePathname();
    const router = useRouter();
    const [hasMounted, setHasMounted] = useState(false);

    useEffect(() => {
        setHasMounted(true);
    }, []);

    useEffect(() => {
        if (!hasMounted) return;

        // Verificar si ya vio el tour
        const hasSeenTour = localStorage.getItem("dontendero_tour_completed");
        if (hasSeenTour) return;

        // Solo iniciar en el dashboard principal o venta para no interrumpir otros flujos
        // Si estamos en /onboarding, no mostrar.
        if (pathname?.includes("/onboarding") || pathname?.includes("/login")) return;

        const driverObj = driver({
            showProgress: true,
            animate: true,
            allowClose: false,
            doneBtnText: "¡Entendido, a vender!",
            nextBtnText: "Siguiente",
            prevBtnText: "Atrás",
            steps: [
                {
                    element: "#logo-container", // Asumiremos que el logo tiene este ID o usaremos el body si falla
                    popover: {
                        title: "¡Hola Vecino! 👋",
                        description: "Bienvenido a <b>DonTendero</b>. Vamos a dar una vuelta rápida para poner tu negocio a volar.",
                        side: "bottom",
                        align: "start"
                    }
                },
                {
                    element: "a[href='/venta']", // Selector para el link de Venta en el Nav
                    popover: {
                        title: "Tu Caja Registradora 💰",
                        description: "Aquí es donde ocurre la magia. Registra tus ventas diarias de forma rápida y sencilla.",
                        side: "right"
                    },
                    onHighlightStarted: () => {
                        // Opcional: Podríamos navegar a la página si fuera necesario
                    }
                },
                {
                    element: "a[href='/inventario']",
                    popover: {
                        title: "Tu Bodega Digital 📦",
                        description: "Controla qué tienes, qué falta y qué se vence. ¡Nunca más pierdas mercancía!",
                        side: "right"
                    }
                },
                {
                    element: "a[href='/reportes']",
                    popover: {
                        title: "Tus Ganancias 📈",
                        description: "Mira cómo crece tu negocio. Entiende tus números sin ser contador.",
                        side: "right"
                    }
                },
                {
                    element: "#profile-section", // Necesitaremos añadir este ID al sidebar
                    popover: {
                        title: "Tu Perfil",
                        description: "Aquí gestionas tu cuenta y cierras sesión cuando acabes el turno.",
                        side: "top"
                    }
                }
            ],
            onDestroyed: () => {
                localStorage.setItem("dontendero_tour_completed", "true");

                // Acción final sugerida
                // router.push('/venta'); 
            }
        });

        // Retrasamos un poco para asegurar que la UI cargó
        const timer = setTimeout(() => {
            driverObj.drive();
        }, 1500);

        return () => clearTimeout(timer);
    }, [hasMounted, pathname]);

    return null;
}
