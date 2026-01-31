"use client";
import { useState, useRef, useEffect } from "react";

export function MusicPlayer() {
    const [isPlaying, setIsPlaying] = useState(false);
    const [progress, setProgress] = useState(0);
    const audioRef = useRef<HTMLAudioElement | null>(null);

    const togglePlay = () => {
        if (audioRef.current) {
            if (isPlaying) {
                audioRef.current.pause();
            } else {
                audioRef.current.play().catch(e => console.log("Audio play failed:", e));
            }
            setIsPlaying(!isPlaying);
        }
    };

    useEffect(() => {
        const audio = audioRef.current;
        if (!audio) return;

        const updateProgress = () => {
            const current = audio.currentTime;
            const duration = audio.duration;
            if (duration) {
                setProgress((current / duration) * 100);
            }
        };

        audio.addEventListener("timeupdate", updateProgress);
        audio.addEventListener("ended", () => setIsPlaying(false));
        return () => {
            audio.removeEventListener("timeupdate", updateProgress);
        };
    }, []);

    return (
        <section className="py-32 flex flex-col items-center justify-center bg-slate-900 overflow-hidden relative">
            <div className="absolute inset-0 bg-primary/5 blur-[120px] rounded-full transform -translate-y-1/2"></div>

            <div className="reveal-on-scroll text-center mb-16 z-10">
                <h3 className="text-primary font-bold tracking-widest uppercase text-xs mb-3">Bonus Track</h3>
                <h2 className="text-white text-4xl md:text-6xl font-black tracking-tighter">El Sonido del <span className="text-primary italic">Mañana</span></h2>
                <p className="text-slate-400 mt-4 max-w-md mx-auto">Dale play y escucha la esencia de nuestra evolución.</p>
            </div>

            <div className="relative group perspective-1000 z-10">
                {/* Vinyl Background Circle */}
                <div className={`absolute inset-0 bg-black rounded-full transition-transform duration-1000 ${isPlaying ? 'scale-110 translate-x-12 rotate-45' : 'scale-100'}`}>
                    <div className="w-full h-full rounded-full border-[10px] border-slate-800 flex items-center justify-center">
                        <div className="w-4 h-4 rounded-full bg-slate-700"></div>
                    </div>
                </div>

                {/* Player Card */}
                <div className="relative w-72 md:w-80 bg-white/10 backdrop-blur-2xl border border-white/20 rounded-[2.5rem] p-8 shadow-2xl overflow-hidden hover:scale-105 transition-transform duration-500">
                    <div className="flex w-full items-center justify-between mb-8">
                        <button className="rounded-full bg-white/5 p-2 text-white/50 hover:text-white transition-colors">
                            <span className="material-symbols-outlined text-sm">arrow_back_ios_new</span>
                        </button>
                        <span className="text-white/40 text-[10px] uppercase font-bold tracking-widest">Playing now</span>
                        <button className="rounded-full bg-white/5 p-2 text-white/50 hover:text-white transition-colors">
                            <span className="material-symbols-outlined text-sm">more_horiz</span>
                        </button>
                    </div>

                    <div className="relative flex justify-center mb-10">
                        <div className={`w-48 h-48 rounded-full p-1 bg-gradient-to-tr from-primary to-primary/20 shadow-2xl relative z-10 ${isPlaying ? 'animate-spin-slow' : ''}`}>
                            <img
                                src="/historia/album.png"
                                className="w-full h-full rounded-full object-cover"
                                alt="DonTendero Album"
                            />
                        </div>
                    </div>

                    <div className="text-center mb-8">
                        <h4 className="text-white text-2xl font-black mb-1">Hecho para Construir País</h4>
                        <p className="text-primary/70 text-sm font-bold uppercase tracking-widest">DonTendero & Colombia</p>
                    </div>

                    <div className="w-full mb-8">
                        <div className="h-1.5 w-full bg-white/10 rounded-full overflow-hidden">
                            <div
                                className="h-full bg-primary transition-all duration-300"
                                style={{ width: `${progress}%` }}
                            ></div>
                        </div>
                        <div className="flex justify-between mt-2">
                            <span className="text-[10px] text-white/30 font-bold">Iniciando...</span>
                            <span className="text-[10px] text-white/30 font-bold">2026</span>
                        </div>
                    </div>

                    <div className="flex justify-between items-center px-4">
                        <button className="text-white/50 hover:text-white transition-colors">
                            <span className="material-symbols-outlined text-3xl">skip_previous</span>
                        </button>

                        <button
                            onClick={togglePlay}
                            className="size-16 rounded-full bg-primary text-slate-900 flex items-center justify-center shadow-xl shadow-primary/20 hover:scale-110 transition-transform active:scale-95"
                        >
                            <span className="material-symbols-outlined text-4xl font-black">
                                {isPlaying ? 'pause' : 'play_arrow'}
                            </span>
                        </button>

                        <button className="text-white/50 hover:text-white transition-colors">
                            <span className="material-symbols-outlined text-3xl">skip_next</span>
                        </button>
                    </div>
                </div>
            </div>

            <audio ref={audioRef} src="/historia/audio.mp3" preload="auto" />

            <style jsx>{`
                @keyframes spin-slow {
                    from { transform: rotate(0deg); }
                    to { transform: rotate(360deg); }
                }
                .animate-spin-slow {
                    animation: spin-slow 15s linear infinite;
                }
                .perspective-1000 {
                    perspective: 1000px;
                }
            `}</style>
        </section>
    );
}
