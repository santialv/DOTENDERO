import Link from 'next/link';
import { Button } from "@/components/ui/button";

export default function NotFound() {
    return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-slate-50 text-center px-4">
            <div className="bg-white p-8 rounded-2xl shadow-xl max-w-md w-full border border-slate-100">
                <div className="mb-6 flex justify-center">
                    <span className="text-8xl">🥑</span>
                </div>

                <h1 className="text-6xl font-black text-slate-900 mb-2 font-display">404</h1>
                <h2 className="text-2xl font-bold text-slate-800 mb-4">¡Ay, caramba!</h2>

                <p className="text-slate-500 mb-8 text-lg">
                    Parece que esta estantería está vacía. La página que buscas no existe o se movió de lugar.
                </p>

                <div className="flex flex-col gap-3">
                    <Link href="/dashboard" className="w-full">
                        <Button className="w-full bg-[#22C55E] hover:bg-[#166534] text-white font-bold h-12 text-lg shadow-lg shadow-green-200">
                            Volver a la Tienda (Inicio)
                        </Button>
                    </Link>

                    <Link href="/soporte" className="w-full">
                        <Button variant="ghost" className="w-full text-slate-500 hover:text-slate-700">
                            Contactar Soporte
                        </Button>
                    </Link>
                </div>
            </div>

            <div className="mt-8 text-sm text-slate-400 font-medium">
                Don Tendero © {new Date().getFullYear()}
            </div>
        </div>
    );
}
