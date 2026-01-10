"use client";

export function CategoryButton({ label, icon, active, onClick }: { label: string, icon: string, color?: string, active: boolean, onClick: () => void }) {
    return (
        <button
            onClick={onClick}
            // Eliminado el color dinámico para consistencia "default"
            // Mejorada la animación activa y hover
            className={`flex flex-col items-center justify-center gap-2 p-2 rounded-xl border shadow-sm transition-all duration-200 active:scale-90 group h-[88px] ${active
                ? `bg-slate-900 text-white border-slate-900 shadow-lg scale-105` // Estilo Activo Uniforme (Negro/Premium)
                : `bg-white text-slate-500 border-slate-200 hover:border-emerald-400 hover:text-emerald-600 hover:shadow-md`}`}
        >
            <div className={`w-10 h-10 rounded-full flex items-center justify-center transition-colors ${active ? 'bg-white/20 text-white' : 'bg-slate-100 group-hover:bg-emerald-50 text-slate-500 group-hover:text-emerald-600'}`}>
                <span className="material-symbols-outlined text-[24px]">{icon}</span>
            </div>
            <span className="text-xs font-bold truncate w-full px-1">{label}</span>
        </button>
    );
}
