"use client";

import { CartItem, Customer } from "@/types";

interface CartSidebarProps {
    saleId: number;
    cartItems: CartItem[];
    total: number;
    removeFromCart: (id: string | number) => void;
    addToCart: (id: string | number) => void;
    deleteFromCart: (id: string | number) => void;
    clearCart: () => void;
    onCheckout: () => void;
    onHoldOrder: () => void;
    onViewHeldOrders: () => void;
    heldOrdersCount: number;
}

export function CartSidebar({
    saleId,
    cartItems,
    total,
    removeFromCart,
    addToCart,
    deleteFromCart,
    clearCart,
    onCheckout,
    onHoldOrder,
    onViewHeldOrders,
    heldOrdersCount
}: CartSidebarProps) {
    return (
        <aside className="w-[380px] bg-white border-l border-slate-200 flex flex-col shadow-xl shrink-0 z-10">
            <div className="h-16 px-6 border-b border-slate-100 flex items-center justify-between shrink-0">
                <h2 className="text-lg font-bold text-slate-900">Venta Actual</h2>
                <span className="text-sm font-medium text-slate-500 bg-slate-100 px-2 py-1 rounded-md">#{saleId}</span>
            </div>

            <div className="flex-1 overflow-y-auto custom-scrollbar p-4 space-y-4">
                {cartItems.length === 0 ? (
                    <div className="h-full flex flex-col items-center justify-center text-slate-400">
                        <span className="material-symbols-outlined text-[64px] mb-2 opacity-50">shopping_cart</span>
                        <p>El carrito está vacío</p>
                        <p className="text-xs text-slate-300 mt-2">Escanea un producto o búscalo</p>
                    </div>
                ) : (
                    cartItems.map(item => (
                        <div key={item.id}>
                            <div className="flex gap-3 relative group">

                                <div className="flex-1 flex flex-col justify-center">
                                    <div className="flex justify-between items-start">
                                        <h4 className="font-medium text-slate-900 line-clamp-1 text-sm">{item.name}</h4>
                                        <span className="font-bold text-slate-900 text-sm">${(item.finalPrice * item.quantity).toLocaleString()}</span>
                                    </div>
                                    <div className="text-xs text-slate-500 mt-0.5">${item.finalPrice.toLocaleString()} c/u</div>
                                    <div className="flex items-center gap-3 mt-2">
                                        <div className="flex items-center border border-slate-200 rounded-lg overflow-hidden h-7">
                                            <button onClick={() => removeFromCart(item.id)} className="w-7 h-full flex items-center justify-center hover:bg-slate-100 text-slate-500 transition-colors">
                                                <span className="material-symbols-outlined text-[16px]">remove</span>
                                            </button>
                                            <input className="w-8 h-full text-center text-sm font-semibold border-none bg-transparent p-0 focus:ring-0 text-slate-900" type="text" value={item.quantity} readOnly />
                                            <button onClick={() => addToCart(item.id)} className="w-7 h-full flex items-center justify-center hover:bg-slate-100 text-slate-500 transition-colors">
                                                <span className="material-symbols-outlined text-[16px]">add</span>
                                            </button>
                                        </div>
                                        <button onClick={() => deleteFromCart(item.id)} className="text-red-400 hover:text-red-500 p-1 rounded transition-colors opacity-0 group-hover:opacity-100">
                                            <span className="material-symbols-outlined text-[18px]">delete</span>
                                        </button>
                                    </div>
                                </div>
                            </div>
                            <div className="h-px bg-slate-100 w-full mt-4"></div>
                        </div>
                    ))
                )}
            </div>

            <div className="p-6 bg-slate-50 border-t border-slate-200 shrink-0">
                <div className="flex justify-between items-center mb-2">
                    <span className="text-slate-500 font-medium">Subtotal</span>
                    <span className="text-slate-900 font-semibold">${(total - cartItems.reduce((acc, item) => acc + (item.bagTax || 0) * item.quantity, 0)).toLocaleString()}</span>
                </div>
                <div className="flex justify-between items-center mb-2">
                    <span className="text-slate-500 font-medium">Impuesto Bolsa</span>
                    <span className="text-slate-900 font-semibold">${cartItems.reduce((acc, item) => acc + (item.bagTax || 0) * item.quantity, 0).toLocaleString()}</span>
                </div>
                <div className="flex justify-between items-center mb-6 pt-4 border-t border-dashed border-slate-300">
                    <span className="text-lg font-bold text-slate-900">Total a Pagar</span>
                    <span className="text-2xl font-bold text-slate-900">${total.toLocaleString()}</span>
                </div>
                <button
                    onClick={onCheckout}
                    disabled={total === 0}
                    className="w-full bg-[#13ec80] hover:bg-[#0eb562] disabled:opacity-50 disabled:cursor-not-allowed text-slate-900 font-black text-lg py-4 px-6 rounded-xl shadow-lg shadow-green-500/30 transition-all active:scale-[0.98] hover:scale-[1.02] mb-3 flex items-center justify-center gap-2 animate-pulse hover:animate-none"
                >
                    <span>COBRAR</span>
                    <span className="material-symbols-outlined font-bold">arrow_forward</span>
                </button>
                <div className="grid grid-cols-2 gap-3">
                    {cartItems.length > 0 ? (
                        <button onClick={onHoldOrder} className="w-full bg-white border border-orange-200 hover:bg-orange-50 text-orange-600 font-bold py-2.5 px-4 rounded-xl transition-colors text-sm flex items-center justify-center gap-2">
                            <span className="material-symbols-outlined text-[18px]">pause_circle</span>
                            {heldOrdersCount > 0 ? `Poner en Espera (${heldOrdersCount})` : 'Poner en Espera'}
                        </button>
                    ) : (
                        <button
                            onClick={onViewHeldOrders}
                            className="w-full bg-white border border-slate-200 hover:bg-slate-50 text-slate-600 font-bold py-2.5 px-4 rounded-xl transition-colors text-sm flex items-center justify-center gap-2"
                        >
                            <span className="material-symbols-outlined text-[18px]">list_alt</span>
                            Ver Pendientes ({heldOrdersCount})
                        </button>
                    )}
                    <button
                        onClick={clearCart}
                        className="w-full bg-white border border-red-200 hover:bg-red-50 text-red-600 font-semibold py-2.5 px-4 rounded-xl transition-colors text-sm"
                    >
                        Cancelar
                    </button>
                </div>
            </div>
        </aside>
    );
}
