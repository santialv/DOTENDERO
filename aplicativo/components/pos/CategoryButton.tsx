"use client";

export function CategoryButton({ label, icon, active, onClick }: { label: string, icon: string, color?: string, active: boolean, onClick: () => void }) {
    return (
        <button
            onClick={onClick}
            className={`flex flex-col items-center justify-center gap-1.5 p-2.5 rounded-xl border shadow-sm transition-all duration-200 active:scale-95 group min-w-[80px] w-[80px] h-[76px] sm:min-w-[90px] sm:w-[90px] sm:h-[82px] lg:w-24 lg:h-[84px] xl:w-28 xl:h-[88px] shrink-0 ${active
                ? `bg-slate-900 text-white border-slate-900 shadow-lg scale-105 z-10`
                : `bg-white text-slate-500 border-slate-200 hover:border-[#13ec80] hover:text-slate-700 hover:shadow-md`}`}
        >
            <div className={`w-8 h-8 sm:w-9 sm:h-9 lg:w-9 lg:h-9 xl:w-10 xl:h-10 rounded-full flex items-center justify-center transition-colors duration-300 ${active ? 'bg-white/20 text-white animate-pulse-once' : 'bg-slate-50 group-hover:bg-green-50 text-slate-400 group-hover:text-[#13ec80]'}`}>
                <span className="material-symbols-outlined text-[20px] sm:text-[22px] lg:text-[22px] xl:text-[24px]">{icon}</span>
            </div>
            <span className="text-[10px] sm:text-[11px] lg:text-[11px] xl:text-xs font-bold truncate w-full px-0.5 leading-tight text-center">{label}</span>
        </button>
    );
}
