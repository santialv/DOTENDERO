"use client";

export function CategoryButton({ label, icon, color, active, onClick }: { label: string, icon: string, color: string, active: boolean, onClick: () => void }) {
    return (
        <button
            onClick={onClick}
            className={`flex flex-col items-center justify-center gap-2 p-2 rounded-xl border shadow-md transition-all active:scale-95 group h-[88px] ${active
                ? `bg-${color}-500 text-white border-${color}-500 shadow-${color}-500/30`
                : `bg-white text-slate-600 border-slate-200 hover:border-${color}-500/50`}`}
        >
            <div className={`w-10 h-10 rounded-full flex items-center justify-center backdrop-blur-sm ${active ? 'bg-white/20' : `bg-${color}-50 text-${color}-500`}`}>
                <span className="material-symbols-outlined text-[22px]">{icon}</span>
            </div>
            <span className="text-xs font-bold truncate w-full px-1">{label}</span>
        </button>
    );
}
