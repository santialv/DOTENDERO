"use client";

import { useState } from "react";
import { useToast } from "@/components/ui/toast";
import { Transaction } from "@/types";
import { useConfiguration } from "@/hooks/useConfiguration";

interface SuccessModalProps {
    transaction: Transaction | null;
    onNewSale: () => void;
}

export function SuccessModal({ transaction, onNewSale }: SuccessModalProps) {
    const { toast } = useToast();
    const { businessInfo } = useConfiguration();
    const [showEmailForm, setShowEmailForm] = useState(false);
    const [manualEmail, setManualEmail] = useState("");
    const [isSending, setIsSending] = useState(false);
    const [showWhatsAppForm, setShowWhatsAppForm] = useState(false);
    const [whatsappPhone, setWhatsappPhone] = useState("");

    if (!transaction) return null;

    const handleSendEmail = () => {
        setIsSending(true);
        import("@/lib/email-service").then(async (service) => {
            const success = await service.sendInvoiceEmail({
                id: transaction.id,
                customerName: transaction.customerName || "",
                customerEmail: transaction.customerData?.email,
                additionalEmail: manualEmail,
                amount: transaction.amount,
                date: transaction.date,
                items: transaction.items || [],
                businessInfo: businessInfo // Pass businessInfo here
            });

            setIsSending(false);
            if (success) {
                toast(`Factura enviada exitosamente.`, "success");
                setShowEmailForm(false);
                setManualEmail("");
            } else {
                toast(`Error envíando factura. Verifique los correos.`, "error");
            }
        });
    };

    return (
        <>
            <div className="fixed inset-0 z-[60] flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4 animate-in fade-in duration-200 print:hidden">
                <div className="bg-white rounded-3xl shadow-2xl w-full max-w-sm overflow-hidden text-center p-8 transition-all">
                    {!showEmailForm && !showWhatsAppForm ? (
                        <>
                            <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6 text-green-500">
                                <span className="material-symbols-outlined text-[48px]">check_circle</span>
                            </div>
                            <h2 className="text-2xl font-bold text-slate-900 mb-2">¡Venta Exitosa!</h2>
                            {transaction.change !== undefined && transaction.change > 0 && (
                                <div className="bg-green-50 p-4 rounded-xl border border-green-100 mb-6">
                                    <p className="text-sm font-bold text-green-700 uppercase mb-1">Entregar de Cambio</p>
                                    <p className="text-3xl font-black text-green-600">${(transaction.change || 0).toLocaleString()}</p>
                                </div>
                            )}

                            <div className="grid grid-cols-2 gap-2 mt-4">
                                <button
                                    onClick={onNewSale}
                                    className="col-span-2 bg-[#13ec80] hover:bg-[#0eb562] text-slate-900 font-bold py-3 rounded-xl transition-colors flex items-center justify-center gap-2 shadow-lg shadow-green-500/20 active:scale-95"
                                >
                                    <span>Nueva Venta</span>
                                    <span className="material-symbols-outlined text-lg font-bold">arrow_forward</span>
                                </button>

                                <button
                                    onClick={() => {
                                        setWhatsappPhone(transaction.customerData?.phone || "");
                                        setShowWhatsAppForm(true);
                                    }}
                                    className="col-span-2 bg-white border-2 border-[#25D366] text-[#25D366] hover:bg-green-50 font-bold py-3 rounded-xl transition-colors flex items-center justify-center gap-2 active:scale-95"
                                >
                                    <span className="text-lg">📱</span> {/* WhatsApp Icon placeholder */}
                                    <span>Enviar x WhatsApp</span>
                                </button>

                                <button
                                    onClick={() => window.print()}
                                    className="bg-white border border-slate-200 hover:bg-slate-50 text-slate-600 font-bold py-3 rounded-xl transition-colors flex flex-col items-center justify-center gap-1 text-xs"
                                >
                                    <span className="material-symbols-outlined text-lg">print</span>
                                    <span>Imprimir</span>
                                </button>

                                <button
                                    onClick={() => setShowEmailForm(true)}
                                    className="bg-white border border-slate-200 hover:bg-slate-50 text-slate-600 font-bold py-3 rounded-xl transition-colors flex flex-col items-center justify-center gap-1 text-xs"
                                >
                                    <span className="material-symbols-outlined text-lg">mail</span>
                                    <span>Correo</span>
                                </button>
                            </div>
                        </>
                    ) : showWhatsAppForm ? (
                        <div className="animate-in fade-in slide-in-from-bottom-4 duration-300">
                            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4 text-[#25D366]">
                                <span className="material-symbols-outlined text-[32px]">perm_phone_msg</span>
                            </div>
                            <h3 className="font-bold text-lg mb-2 text-slate-900">Enviar a WhatsApp</h3>
                            <p className="text-xs text-slate-500 mb-6">El cliente recibirá un resumen de la compra instantáneamente.</p>

                            <div className="text-left mb-6">
                                <label className="text-xs font-bold text-slate-500 uppercase ml-1 mb-1 block">
                                    Número Celular (Sin +57)
                                </label>
                                <div className="relative">
                                    <span className="absolute left-3 top-3 text-slate-400 font-bold text-sm">🇨🇴 +57</span>
                                    <input
                                        type="tel"
                                        placeholder="300 123 4567"
                                        value={whatsappPhone}
                                        onChange={e => setWhatsappPhone(e.target.value.replace(/\D/g, ''))}
                                        className="w-full pl-16 p-3 rounded-xl border border-slate-200 focus:border-green-500 outline-none transition-colors font-bold text-lg bg-white"
                                        autoFocus
                                    />
                                </div>
                            </div>

                            <div className="flex gap-2">
                                <button
                                    onClick={() => setShowWhatsAppForm(false)}
                                    className="flex-1 py-3 text-slate-500 font-bold hover:bg-slate-50 rounded-xl transition-colors"
                                >
                                    Volver
                                </button>
                                <button
                                    onClick={() => {
                                        if (!whatsappPhone) return;

                                        // Build Message
                                        let msg = `🧾 *Recibo de Compra* - ${businessInfo.name}\n\n`;
                                        msg += `📅 *Fecha:* ${new Date(transaction.date).toLocaleDateString()} ${new Date(transaction.date).toLocaleTimeString()}\n`;
                                        msg += `🔢 *Ticket:* #${transaction.id.toString().slice(-6)}\n`;
                                        msg += `--------------------------------\n`;

                                        transaction.items?.forEach(item => {
                                            msg += `▪ ${item.quantity}x ${item.name} ($${((item.finalPrice || 0) * (item.quantity || 0)).toLocaleString()})\n`;
                                        });

                                        msg += `--------------------------------\n`;
                                        msg += `💰 *TOTAL A PAGAR: $${(transaction.amount || 0).toLocaleString()}*\n`;

                                        if (transaction.change && transaction.change > 0) {
                                            msg += `💵 Cambio: $${transaction.change.toLocaleString()}\n`;
                                        }

                                        msg += `\n✅ *¡Gracias por tu compra!* 💚\n`;
                                        msg += `_Generado por DonTendero.com_ 🚀`;

                                        const url = `https://wa.me/57${whatsappPhone}?text=${encodeURIComponent(msg)}`;
                                        window.open(url, '_blank');
                                        setShowWhatsAppForm(false);
                                        toast("Abriendo WhatsApp...", "success");
                                    }}
                                    disabled={!whatsappPhone || whatsappPhone.length < 10}
                                    className="flex-[2] bg-[#25D366] hover:bg-[#20bd5a] text-white font-bold py-3 rounded-xl shadow-lg shadow-green-500/30 transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                                >
                                    <span>Enviar Ahora</span>
                                    <span className="material-symbols-outlined text-sm font-bold">send</span>
                                </button>
                            </div>
                        </div>
                    ) : (
                        <div className="animate-in fade-in slide-in-from-bottom-4 duration-300">
                            <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4 text-blue-600">
                                <span className="material-symbols-outlined text-[32px]">forward_to_inbox</span>
                            </div>
                            <h3 className="font-bold text-lg mb-4 text-slate-900">Enviar Factura (Email)</h3>

                            <div className="space-y-3 text-left mb-6">
                                {transaction.customerData?.email && (
                                    <div className="flex items-center gap-2 p-3 bg-slate-50 rounded-xl border border-slate-200 text-sm">
                                        <span className="material-symbols-outlined text-slate-400">person</span>
                                        <div className="flex-1 overflow-hidden">
                                            <p className="text-xs text-slate-500 font-bold uppercase">Cliente</p>
                                            <p className="truncate text-slate-700 font-medium">{transaction.customerData.email}</p>
                                        </div>
                                        <span className="material-symbols-outlined text-green-500">check_circle</span>
                                    </div>
                                )}
                                <div>
                                    <label className="text-xs font-bold text-slate-500 uppercase ml-1 mb-1 block">
                                        {transaction.customerData?.email ? 'Enviar copia a (Opcional)' : 'Enviar a'}
                                    </label>
                                    <input
                                        type="email"
                                        placeholder="ejemplo@correo.com"
                                        value={manualEmail}
                                        onChange={e => setManualEmail(e.target.value)}
                                        className="w-full p-3 rounded-xl border border-slate-200 focus:border-blue-500 outline-none transition-colors font-medium bg-white"
                                    />
                                </div>
                            </div>

                            <div className="flex gap-2">
                                <button
                                    onClick={() => setShowEmailForm(false)}
                                    className="flex-1 py-3 text-slate-500 font-bold hover:bg-slate-50 rounded-xl transition-colors"
                                >
                                    Cancelar
                                </button>
                                <button
                                    onClick={handleSendEmail}
                                    disabled={isSending || (!transaction.customerData?.email && !manualEmail)}
                                    className="flex-[2] bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-xl shadow-lg shadow-blue-500/30 transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                                >
                                    {isSending ? (
                                        <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
                                    ) : (
                                        <>
                                            <span>Enviar Correo</span>
                                            <span className="material-symbols-outlined text-sm">send</span>
                                        </>
                                    )}
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Printable Receipt - MOVED OUTSIDE MODAL CONTAINER */}
            <div id="printable-receipt" className="hidden print:block font-mono text-black text-[10px] leading-tight p-2 text-left w-[80mm] absolute top-0 left-0">
                <div className="flex flex-col items-center text-center mb-4">
                    {/* 1. LOGO */}
                    {businessInfo.logoUrl && (
                        <img src={businessInfo.logoUrl} alt="Logo" className="w-24 h-auto object-contain mb-2" />
                    )}

                    {/* 2. HEADER OBLIGATORIO */}
                    <h2 className="font-bold text-sm uppercase mb-1">{businessInfo.name}</h2>
                    <p className="font-bold">NIT: {businessInfo.nit}</p>
                    <p className="uppercase">{businessInfo.address}</p>
                    <p className="uppercase">{businessInfo.city}</p>
                    <p>Tel: {businessInfo.phone}</p>
                </div>

                {/* INFORMACIÓN TRIBUTARIA */}
                <div className="text-center mb-4">
                    <h3 className="font-bold text-xs mt-3 mb-1 px-4 border-y border-black py-1">
                        INFORMACIÓN TRIBUTARIA
                    </h3>
                    <p className="mt-1 font-bold">{businessInfo.regime}</p>
                    <p>No somos Grandes Contribuyentes</p>
                    <p>Agentes Retenedores de IVA: NO</p>
                    <h3 className="font-bold text-xs mt-3 mb-1 px-4 border-y border-black py-1">
                        DOCUMENTO EQUIVALENTE ELECTRÓNICO TICKET DE MÁQUINA REGISTRADORA CON SISTEMA P.O.S.
                    </h3>
                    <div className="text-[9px] mt-1 space-y-0.5">
                        <p>Resolución DIAN No. 18760000001</p>
                        <p>Fecha: 2025-01-01 Vigencia: 12 Meses</p>
                        <p>Rango Autorizado: POS-1 a POS-100000</p>
                    </div>
                </div>

                {/* 6. DETALLES DE VENTA */}
                <div className="space-y-0.5 mb-2 border-t border-black border-dashed pt-2">
                    <div className="flex justify-between">
                        <span>Ticket No:</span>
                        <span className="font-bold">POS-{transaction.id.toString().slice(-6)}</span>
                    </div>
                    <div className="flex justify-between">
                        <span>Fecha:</span>
                        <span>{new Date(transaction.date).toLocaleDateString()} {new Date(transaction.date).toLocaleTimeString()}</span>
                    </div>
                    <div className="flex justify-between">
                        <span>Cajero:</span>
                        <span>Principal</span>
                    </div>
                </div>

                <div className="mb-2">
                    <p><span className="font-bold">Cliente:</span> {transaction.customerName === "Publico General" || !transaction.customerName ? "CONSUMIDOR FINAL" : transaction.customerName}</p>
                    <p><span className="font-bold">NIT/CC:</span> {transaction.customerData?.cc || "222222222222"}</p>
                </div>

                <div className="border-b border-black border-dashed my-2"></div>

                {/* 8. ÍTEMS (CON PRECIO UNITARIO) */}
                <table className="w-full text-left mb-2 border-collapse">
                    <thead>
                        <tr className="uppercase text-[9px] border-b border-black">
                            <th className="w-[40%] py-1">Producto</th>
                            <th className="w-[15%] text-center py-1">Cant</th>
                            <th className="w-[20%] text-right py-1">Unitario</th>
                            <th className="w-[25%] text-right py-1">Total</th>
                        </tr>
                    </thead>
                    <tbody className="text-[10px]">
                        {transaction.items?.map((item: any, idx: number) => {
                            // Safe fallback for values
                            const qty = item.quantity || 0;
                            const finalPrice = item.finalPrice || 0;
                            const total = qty * finalPrice;
                            return (
                                <tr key={idx} className="border-b border-gray-300 border-dashed">
                                    <td className="pr-1 py-1 leading-none">
                                        {item.name ? item.name.substring(0, 25) : "Item"}
                                        {item.tax > 0 && <span className="text-[8px] ml-1 font-bold">(I:{item.tax}%)</span>}
                                    </td>
                                    <td className="text-center align-top py-1">{qty}</td>
                                    <td className="text-right align-top py-1">${(finalPrice || 0).toLocaleString()}</td>
                                    <td className="text-right align-top font-bold py-1">${(total || 0).toLocaleString()}</td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>

                <div className="border-b border-black border-dashed my-2"></div>

                {/* 9. TOTALES E IMPUESTOS DETALLADOS */}
                <div className="space-y-1 text-right mb-2 text-black">
                    <div className="flex justify-between font-bold text-xs">
                        <span>SUBTOTAL:</span>
                        <span>
                            ${(transaction.items?.reduce((acc: number, item: any) => {
                                const itemTotal = (item.finalPrice || 0) * (item.quantity || 0);
                                const bagTaxTotal = (item.bagTax || 0) * (item.quantity || 0);
                                const basePrice = (itemTotal - bagTaxTotal) / (1 + (item.tax || 0) / 100);
                                return acc + basePrice;
                            }, 0) || 0).toLocaleString(undefined, { maximumFractionDigits: 0 })}
                        </span>
                    </div>

                    {/* SECCIÓN DE IMPUESTOS Y RETENCIONES */}
                    <div className="text-[9px] text-right pt-2 pb-1">
                        <div className="flex justify-between font-bold border-b border-black border-dashed mb-1 pb-0.5">
                            <span>IMPUESTOS Y RETENCIONES</span>
                            <span>VALOR</span>
                        </div>

                        {/* Desglose de IVAs */}
                        {(() => {
                            const taxes = transaction.items?.reduce((acc: any, item: any) => {
                                if (item.tax > 0) {
                                    const totalLine = item.finalPrice * item.quantity;
                                    const base = totalLine / (1 + item.tax / 100);
                                    const taxAmount = totalLine - base;
                                    const key = `IVA ${item.tax}%`;
                                    if (!acc[key]) acc[key] = 0;
                                    acc[key] += taxAmount;
                                }
                                return acc;
                            }, {});

                            const taxEntries = Object.entries(taxes || {});

                            if (taxEntries.length === 0) {
                                return (
                                    <div className="flex justify-between italic text-slate-500">
                                        <span>No aplican impuestos</span>
                                        <span>$0</span>
                                    </div>
                                );
                            }

                            return taxEntries.map(([key, val]: any) => (
                                <div key={key} className="flex justify-between">
                                    <span>{key}</span>
                                    <span>${val.toLocaleString(undefined, { maximumFractionDigits: 0 })}</span>
                                </div>
                            ));
                        })()}

                        {/* Impuesto Bolsa */}
                        {(transaction.items?.some((i: any) => i.bagTax > 0)) && (
                            <div className="flex justify-between">
                                <span>Imp. Nacional Bolsas</span>
                                <span>${transaction.items?.reduce((acc: number, item: any) => acc + (item.bagTax || 0) * item.quantity, 0).toLocaleString()}</span>
                            </div>
                        )}

                        {/* Retenciones (Simulado por ahora si se requiere mostrar) */}
                        <div className="flex justify-between text-slate-600">
                            <span>ReteFuente (0%):</span>
                            <span>$0</span>
                        </div>
                        <div className="flex justify-between text-slate-600">
                            <span>ReteICA (0%):</span>
                            <span>$0</span>
                        </div>
                    </div>

                    <div className="flex justify-between font-black text-sm border-t border-black border-dashed pt-2">
                        <span>TOTAL A PAGAR:</span>
                        <span>${(transaction.amount || 0).toLocaleString()}</span>
                    </div>
                </div>

                {/* 10. FORMAS DE PAGO */}
                <div className="mt-3">
                    <p className="font-bold text-[10px] mb-1">MEDIOS DE PAGO:</p>
                    {transaction.payments ? (
                        transaction.payments.map((p, idx) => (
                            <div key={idx} className="flex justify-between text-[10px]">
                                <span className="uppercase">Pago {p.method}:</span>
                                <span>${(p.amount || 0).toLocaleString()}</span>
                            </div>
                        ))
                    ) : (
                        <div className="flex justify-between text-[10px]">
                            <span>Efectivo:</span>
                            <span>${(transaction.amount || 0).toLocaleString()}</span>
                        </div>
                    )}

                    {transaction.change !== undefined && transaction.change > 0 && (
                        <div className="flex justify-between font-bold mt-1">
                            <span>CAMBIO:</span>
                            <span>${(transaction.change || 0).toLocaleString()}</span>
                        </div>
                    )}
                </div>

                <div className="my-4 text-center">
                    <p className="text-[9px] mb-2 font-bold">REPRESENTACIÓN GRÁFICA DOCUMENTO EQUIVALENTE ELECTRÓNICO</p>

                    {/* 11. QR PLACEHOLDER */}
                    <div className="mx-auto w-24 h-24 bg-white border border-black p-1 flex items-center justify-center mb-2">
                        {/* Simple CSS QR Pattern Simulation */}
                        <div className="grid grid-cols-4 gap-1 w-full h-full opacity-80">
                            <div className="bg-black col-span-2 row-span-2"></div>
                            <div className="bg-black col-start-4"></div>
                            <div className="bg-black row-start-3 col-start-2"></div>
                            <div className="bg-black row-start-3 col-start-4"></div>
                            <div className="bg-black row-start-4 col-start-1"></div>
                            <div className="bg-black row-start-4 col-start-3 span-2"></div>
                        </div>
                    </div>

                    {/* CUFE */}
                    <div className="text-[8px] tracking-tighter break-all text-center text-slate-600 leading-none">
                        <strong>CUFE:</strong> 069ea0c4f8d975a5c... (Simulado en Modo Pruebas)
                    </div>
                </div>

                <div className="text-center text-[9px] mt-4 font-bold">
                    <p className="text-[10px] italic mb-1">"DonTendero: Tu negocio, al siguiente nivel"</p>
                    <p>Software: DonTendero POS</p>
                    <p>Nit Proveedor Tecnológico: 900.222.333</p>
                </div>
            </div>
        </>
    );
}
