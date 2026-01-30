export default function Loading() {
    return (
        <div className="flex h-[100dvh] w-full flex-col items-center justify-center bg-white text-slate-500 antialiased z-[9999] fixed inset-0">
            <div className="flex flex-col items-center justify-center gap-8 p-10">
                {/* Spinner Container */}
                <div className="relative flex items-center justify-center">
                    {/* Glowing Green Backdrop (Blur) */}
                    <div className="absolute inset-0 bg-[#13ec80]/30 rounded-full blur-xl animate-pulse"></div>

                    {/* Main Spinner SVGs */}
                    <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="h-20 w-20 animate-spin relative z-10">
                        {/* Background track */}
                        <circle cx="12" cy="12" r="10" className="stroke-slate-100" strokeWidth="3" />

                        {/* Active spinning arc - Extended to ~280 degrees for more visibility */}
                        {/* Path: M12 2 A10 10 0 1 1 2 12 ... approximate arc */}
                        <path
                            d="M12 2C6.48 2 2 6.48 2 12C2 17.52 6.48 22 12 22C17.52 22 22 17.52 22 12"
                            className="stroke-[#13ec80] drop-shadow-[0_0_8px_rgba(19,236,128,0.6)]"
                            strokeWidth="3"
                            strokeLinecap="round"
                        />
                    </svg>

                    {/* Logo/Icon in center (Optional, makes it look premium) */}
                    <div className="absolute inset-0 flex items-center justify-center z-0 opacity-50">
                        {/* Static inner dot or mini-logo if desired, leaving empty for clean spinner look as requested */}
                    </div>
                </div>

                {/* Text */}
                <div className="text-center space-y-2">
                    <h2 className="text-2xl font-black text-slate-900 tracking-tight font-display">
                        DonTendero
                    </h2>
                    <div className="flex items-center justify-center gap-1.5">
                        <span className="h-1.5 w-1.5 bg-[#13ec80] rounded-full animate-bounce [animation-delay:-0.3s]"></span>
                        <span className="h-1.5 w-1.5 bg-[#13ec80] rounded-full animate-bounce [animation-delay:-0.15s]"></span>
                        <span className="h-1.5 w-1.5 bg-[#13ec80] rounded-full animate-bounce"></span>
                    </div>
                </div>
            </div>
        </div>
    );
}
