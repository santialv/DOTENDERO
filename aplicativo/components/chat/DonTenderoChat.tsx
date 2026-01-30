"use client";

import React, { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { MessageCircle, X, Send, Bot, User, Loader2 } from "lucide-react";
import { useConfiguration } from "@/hooks/useConfiguration";

interface Message {
    role: "user" | "assistant";
    content: string;
}

export function DonTenderoChat() {
    const { businessInfo } = useConfiguration();
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState<Message[]>([
        { role: "assistant", content: "¡Hola! Soy el asistente de soporte de Don Tendero. ¿En qué te puedo ayudar hoy?" }
    ]);
    const [input, setInput] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const scrollRef = useRef<HTMLDivElement>(null);

    // Auto-scroll to bottom
    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    }, [messages, isOpen]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        console.log("handleSubmit called with input:", input);
        if (!input.trim() || isLoading) {
            console.log("handleSubmit returning early. isLoading:", isLoading, "input.trim():", input.trim());
            return;
        }

        const userMsg = input.trim();
        console.log("Clearing input and adding user message to state");
        setInput("");
        setMessages(prev => [...prev, { role: "user", content: userMsg }]);
        setIsLoading(true);

        try {
            console.log("Fetching /api/ai-chat...");
            const response = await fetch("/api/ai-chat", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    messages: [...messages, { role: "user", content: userMsg }],
                    organizationId: businessInfo?.organization_id
                })
            });

            console.log("Response status:", response.status);
            const data = await response.json();
            console.log("Response data:", data);

            if (data.response) {
                setMessages(prev => [...prev, { role: "assistant", content: data.response }]);
            } else {
                console.warn("No response field in data", data);
                setMessages(prev => [...prev, { role: "assistant", content: "Lo siento, tuve un problema técnico. Intenta de nuevo." }]);
            }

        } catch (error) {
            console.error("Chat fetch error:", error);
            setMessages(prev => [...prev, { role: "assistant", content: "Error de conexión. Revisa tu internet." }]);
        } finally {
            setIsLoading(false);
        }
    };

    if (!isOpen) {
        return (
            <Button
                onClick={() => setIsOpen(true)}
                className="h-14 w-14 rounded-full shadow-xl bg-[#13ec80] hover:bg-[#0eb562] text-slate-900 p-0 flex items-center justify-center transition-all hover:scale-110 active:scale-95 border-2 border-white"
            >
                <div className="relative">
                    <MessageCircle className="w-8 h-8" />
                    <span className="absolute -top-1 -right-1 w-3.5 h-3.5 bg-red-500 rounded-full border-2 border-white animate-pulse" />
                </div>
            </Button>
        );
    }

    return (
        <Card className="w-[350px] md:w-[380px] h-[550px] flex flex-col shadow-2xl rounded-2xl overflow-hidden border-0 animate-in slide-in-from-bottom-10 fade-in duration-200">
            {/* Header */}
            <div className="bg-[#1e293b] p-4 flex items-center justify-between shrink-0">
                <div className="flex items-center gap-3">
                    <div className="bg-[#13ec80]/20 p-2 rounded-xl backdrop-blur-sm border border-[#13ec80]/30 text-[#13ec80]">
                        <Bot className="w-5 h-5" />
                    </div>
                    <div>
                        <h3 className="text-white font-bold text-sm">Don Tendero Soporte</h3>
                        <div className="flex items-center gap-1.5">
                            <span className="w-2 h-2 rounded-full bg-[#13ec80] animate-pulse shadow-[0_0_8px_#13ec80]" />
                            <span className="text-slate-400 text-[11px] font-medium">Asistente Virtual</span>
                        </div>
                    </div>
                </div>
                <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setIsOpen(false)}
                    className="text-slate-400 hover:text-white hover:bg-white/10 rounded-full h-8 w-8"
                >
                    <X className="w-5 h-5" />
                </Button>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto bg-slate-50 p-4 space-y-4" ref={scrollRef}>
                {messages.map((msg, idx) => (
                    <div
                        key={idx}
                        className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
                    >
                        <div
                            className={`max-w-[85%] rounded-2xl px-4 py-3 text-sm shadow-sm ${msg.role === "user"
                                ? "bg-[#13ec80] text-slate-900 font-medium rounded-tr-none"
                                : "bg-white text-slate-800 border border-slate-200 rounded-tl-none"
                                }`}
                        >
                            <p className="whitespace-pre-wrap leading-relaxed">{msg.content}</p>
                        </div>
                    </div>
                ))}
                {isLoading && (
                    <div className="flex justify-start">
                        <div className="bg-white border border-slate-200 rounded-2xl rounded-tl-none px-4 py-3 shadow-sm flex items-center gap-2">
                            <Loader2 className="w-4 h-4 text-[#13ec80] animate-spin" />
                            <span className="text-xs text-slate-400 font-medium">Don Tendero está pensando...</span>
                        </div>
                    </div>
                )}
            </div>

            {/* WhatsApp Support Button */}
            <div className="px-4 py-2 bg-slate-50 border-t border-slate-100 flex justify-center">
                <Button
                    variant="outline"
                    size="sm"
                    className="w-full text-xs gap-2 text-green-600 border-green-200 hover:bg-green-50 hover:text-green-700"
                    onClick={() => window.open("https://wa.me/57310714415", "_blank")}
                >
                    <svg viewBox="0 0 24 24" className="w-4 h-4 fill-current"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z" /></svg>
                    Contactar Soporte Humano
                </Button>
            </div>

            {/* Input */}
            <div className="p-4 bg-white border-t border-slate-100">
                <form onSubmit={handleSubmit} className="flex gap-2">
                    <Input
                        value={input}
                        onChange={(e: React.ChangeEvent<HTMLInputElement>) => setInput(e.target.value)}
                        placeholder="Pregúntame lo que necesites..."
                        className="rounded-xl bg-slate-50 border-slate-200 focus-visible:ring-[#13ec80] pl-4 h-11"
                        autoFocus
                    />
                    <Button
                        type="submit"
                        size="icon"
                        disabled={isLoading || !input.trim()}
                        className="rounded-xl bg-[#13ec80] hover:bg-[#0eb562] text-slate-900 shrink-0 h-11 w-11 shadow-md shadow-[#13ec80]/20"
                    >
                        <Send className="w-5 h-5" />
                    </Button>
                </form>
            </div>
        </Card>
    );
}
