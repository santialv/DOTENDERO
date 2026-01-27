export default function Loading() {
    return (
        <div className="flex h-screen w-full flex-col items-center justify-center bg-white text-slate-500 antialiased z-[9999] relative">
            <div className="flex flex-col items-center justify-center gap-6 p-10">
                {/* Brand Logo or Name Optional */}
                <h2 className="text-2xl font-black text-slate-900 tracking-tight mb-2 font-display">DonTendero</h2>

                {/* Spinner */}
                <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-live="polite" aria-busy="true" className="h-16 w-16 animate-spin">
                    <path d="M12 22C14.6522 22 17.1957 20.9464 19.0711 19.0711C20.9464 17.1957 22 14.6522 22 12C22 9.34784 20.9464 6.8043 19.0711 4.92893C17.1957 3.05357 14.6522 2 12 2" className="stroke-[#13ec80]" strokeWidth="4" />
                    <circle cx="12" cy="12" r="10" className="stroke-slate-100" strokeWidth="4" />
                </svg>

                <p className="text-sm font-medium text-slate-400 animate-pulse">Cargando...</p>
            </div>
        </div>
    );
}
