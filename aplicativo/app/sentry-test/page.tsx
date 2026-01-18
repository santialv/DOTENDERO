"use client";

export default function SentryTestPage() {
    return (
        <div className="flex flex-col items-center justify-center min-h-screen p-4 bg-slate-50">
            <h1 className="text-2xl font-bold mb-4 text-slate-900">Prueba de Sentry</h1>
            <p className="mb-8 text-slate-600">Haz clic en el botón para enviar un error de prueba a Sentry.</p>

            <button
                type="button"
                className="px-6 py-3 bg-red-600 text-white rounded-lg font-bold hover:bg-red-700 transition-colors shadow-lg"
                onClick={() => {
                    throw new Error("Sentry Test Error from DonTendero Client");
                }}
            >
                Lanzar Error de Prueba
            </button>
        </div>
    );
}
