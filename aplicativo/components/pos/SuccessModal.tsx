"use client";

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

    if (!transaction) return null;

    return (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4 animate-in fade-in duration-200">
            <div className="bg-white rounded-3xl shadow-2xl w-full max-w-sm overflow-hidden text-center p-8">
                <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6 text-green-500">
                    <span className="material-symbols-outlined text-[48px]">check_circle</span>
                </div>
                <h2 className="text-2xl font-bold text-slate-900 mb-2">¡Venta Exitosa!</h2>
                {/* We use 'Efectivo' check or check change directly */}
                {transaction.change !== undefined && transaction.change > 0 && (
                    <div className="bg-green-50 p-4 rounded-xl border border-green-100 mb-6">
                        <p className="text-sm font-bold text-green-700 uppercase mb-1">Entregar de Cambio</p>
                        <p className="text-3xl font-black text-green-600">${transaction.change.toLocaleString()}</p>
                    </div>
                )}
                <div className="flex gap-2 mt-4">
                    <button
                        onClick={() => {
                            window.print();
                        }}
                        className="flex-1 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 font-bold py-3 rounded-xl transition-colors flex flex-col items-center justify-center gap-1 text-xs"
                    >
                        <span className="material-symbols-outlined text-lg">print</span>
                        <span>Imprimir</span>
                    </button>

                    <button
                        onClick={onNewSale}
                        className="flex-1 bg-slate-100 hover:bg-slate-200 text-slate-900 font-bold py-3 rounded-xl transition-colors flex flex-col items-center justify-center gap-1 text-xs"
                    >
                        <span className="material-symbols-outlined text-lg">arrow_forward</span>
                        <span>Nueva</span>
                    </button>

                    {transaction.customerData?.email && (
                        <button
                            onClick={() => {
                                import("@/lib/email-service").then(async (service) => {
                                    const success = await service.sendInvoiceEmail({
                                        id: transaction.id,
                                        customerName: transaction.customerName || "",
                                        customerEmail: transaction.customerData!.email!,
                                        amount: transaction.amount,
                                        date: transaction.date,
                                        items: transaction.items || []
                                    });
                                    if (success) {
                                        toast(`¡Factura reenviada exitosamente a ${transaction.customerData!.email}!`, "success");
                                    } else {
                                        toast(`Error al reenviar la factura.`, "error");
                                    }
                                });
                            }}
                            className="flex-1 bg-blue-50 hover:bg-blue-100 text-blue-700 font-bold py-3 rounded-xl transition-colors flex flex-col items-center justify-center gap-1 text-xs"
                        >
                            <span className="material-symbols-outlined text-lg">send</span>
                            <span>Enviar</span>
                        </button>
                    )}
                </div>

                {/* Printable Receipt Hidden */}
                <div id="printable-receipt" className="hidden print:block font-mono text-black text-xs p-1 text-left">
                    <div className="text-center mb-4">
                        <h2 className="text-lg font-bold uppercase">{businessInfo.name}</h2>
                        <p>NIT: {businessInfo.nit}</p>
                        <p>{businessInfo.address}</p>
                        <p>Tel: {businessInfo.phone}</p>
                        <p>{businessInfo.city}</p>
                    </div>

                    <div className="border-b border-black border-dashed my-2"></div>

                    <div className="flex justify-between">
                        <span>Fecha:</span>
                        <span>{new Date(transaction.date).toLocaleDateString()} {new Date(transaction.date).toLocaleTimeString()}</span>
                    </div>
                    <div className="flex justify-between">
                        <span>Factura:</span>
                        <span>#{transaction.description.replace('Venta #', '')}</span>
                    </div>
                    <div className="mt-2 text-[10px] space-y-0.5">
                        <div className="flex justify-between">
                            <span className="font-bold">Cliente:</span>
                            <span className="truncate max-w-[150px]">{transaction.customerName}</span>
                        </div>
                        {transaction.customerData?.cc && (
                            <div className="flex justify-between">
                                <span>CC/NIT:</span>
                                <span>{transaction.customerData.cc}</span>
                            </div>
                        )}
                    </div>

                    <div className="border-b border-black border-dashed my-2"></div>

                    <div className="space-y-1">
                        {transaction.items?.map((item: any, idx: number) => (
                            <div key={idx} className="flex justify-between">
                                <span>{item.quantity} x {item.name.substring(0, 15)}</span>
                                <span>${(item.finalPrice * item.quantity).toLocaleString()}</span>
                            </div>
                        ))}
                    </div>

                    <div className="border-b border-black border-dashed my-2"></div>

                    <div className="flex justify-between text-[10px]">
                        <span>Subtotal:</span>
                        <span>
                            ${(transaction.items?.reduce((acc: number, item: any) => {
                                const itemTotal = item.finalPrice * item.quantity;
                                const bagTaxTotal = (item.bagTax || 0) * item.quantity;
                                const basePrice = (itemTotal - bagTaxTotal) / (1 + (item.tax || 0) / 100);
                                return acc + basePrice;
                            }, 0) || 0).toLocaleString(undefined, { maximumFractionDigits: 0 })}
                        </span>
                    </div>
                    <div className="flex justify-between text-[10px]">
                        <span>Impuestos (IVA):</span>
                        <span>
                            ${(transaction.items?.reduce((acc: number, item: any) => {
                                if (item.taxType === 'ICO') return acc;
                                const itemTotal = item.finalPrice * item.quantity;
                                const bagTaxTotal = (item.bagTax || 0) * item.quantity;
                                const basePrice = (itemTotal - bagTaxTotal) / (1 + (item.tax || 0) / 100);
                                return acc + ((itemTotal - bagTaxTotal) - basePrice);
                            }, 0) || 0).toLocaleString(undefined, { maximumFractionDigits: 0 })}
                        </span>
                    </div>
                    <div className="flex justify-between text-[10px]">
                        <span>Impoconsumo:</span>
                        <span>
                            ${(transaction.items?.reduce((acc: number, item: any) => {
                                if (item.taxType !== 'ICO') return acc;
                                const itemTotal = item.finalPrice * item.quantity;
                                const bagTaxTotal = (item.bagTax || 0) * item.quantity;
                                const basePrice = (itemTotal - bagTaxTotal) / (1 + (item.tax || 0) / 100);
                                return acc + ((itemTotal - bagTaxTotal) - basePrice);
                            }, 0) || 0).toLocaleString(undefined, { maximumFractionDigits: 0 })}
                        </span>
                    </div>
                    <div className="flex justify-between text-[10px]">
                        <span>Impuesto Bolsa:</span>
                        <span>${transaction.items?.reduce((acc: number, item: any) => acc + (item.bagTax || 0) * item.quantity, 0).toLocaleString()}</span>
                    </div>

                    <div className="flex justify-between font-bold text-sm">
                        <span>TOTAL:</span>
                        <span>${transaction.amount.toLocaleString()}</span>
                    </div>

                    {transaction.payments && (
                        <div className="mt-2 space-y-1">
                            {transaction.payments.map((p, idx) => (
                                <div key={idx} className="flex justify-between text-[10px]">
                                    <span>Pago {p.method}:</span>
                                    <span>${p.amount.toLocaleString()}</span>
                                </div>
                            ))}
                        </div>
                    )}


                    {transaction.change !== undefined && transaction.change > 0 && (
                        <div className="flex justify-between font-bold mt-2">
                            <span>CAMBIO:</span>
                            <span>${transaction.change.toLocaleString()}</span>
                        </div>
                    )}

                    <div className="border-b border-black border-dashed my-4"></div>

                    <div className="text-center text-[10px]">
                        <p>¡Gracias por su compra!</p>
                        <p>{businessInfo.regime}</p>
                    </div>
                </div>
            </div>
        </div>
    );
}
