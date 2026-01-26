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
