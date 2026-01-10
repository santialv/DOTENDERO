export default function LegalLayout({
    children,
}: {
    children: React.ReactNode
}) {
    return (
        <div className="min-h-screen bg-slate-50 font-display text-slate-900">
            {/* Header */}
            <header className="bg-white border-b border-slate-200 sticky top-0 z-50">
                <div className="max-w-4xl mx-auto px-6 h-16 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <span className="material-symbols-outlined text-[#13ec80] text-3xl">storefront</span>
                        <span className="font-bold text-xl tracking-tight">DonTendero</span>
                    </div>
                    <a href="/login" className="text-sm font-bold text-slate-500 hover:text-slate-900">Volver al Inicio</a>
                </div>
            </header>

            {/* Content */}
            <main className="max-w-4xl mx-auto px-6 py-12">
                {children}
            </main>

            {/* Footer */}
            <footer className="border-t border-slate-200 bg-white py-8 mt-12">
                <div className="max-w-4xl mx-auto px-6 text-center text-sm text-slate-400">
                    <p>&copy; 2026 DonTendero. Todos los derechos reservados.</p>
                </div>
            </footer>
        </div>
    );
}
