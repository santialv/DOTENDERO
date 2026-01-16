"use client";

import { useEffect, useRef, useState } from "react";
import { ProductGrid } from "@/components/pos/ProductGrid";
import { CartSidebar } from "@/components/pos/CartSidebar";
import { PaymentModal } from "@/components/pos/PaymentModal";
import { CashCloseModal } from "@/components/pos/CashCloseModal";
import { SuccessModal } from "@/components/pos/SuccessModal";
import { CustomerModal } from "@/components/pos/CustomerModal";
import { CategoryButton } from "@/components/pos/CategoryButton";
import { usePOS } from "@/hooks/usePOS";
import { PRODUCT_CATEGORIES } from "@/lib/constants";
import { Transaction } from "@/types";

export default function VentaPage() {
  const searchInputRef = useRef<HTMLInputElement>(null);

  const {
    // State
    filteredProducts,
    activeCategory,
    searchQuery,
    products,
    cartItems,
    total,
    saleId,
    selectedCustomer,
    heldOrders,

    // Setters
    setActiveCategory,
    setSearchQuery,
    setSelectedCustomer,

    // Actions
    addToCart,
    removeFromCart,
    deleteFromCart,
    clearCart,
    holdOrder,
    resumeOrder,
    checkout
  } = usePOS();

  // Local UI State
  const [isAllCategoriesOpen, setIsAllCategoriesOpen] = useState(false);
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [isCustomerModalOpen, setIsCustomerModalOpen] = useState(false);
  const [isHeldOrdersModalOpen, setIsHeldOrdersModalOpen] = useState(false);
  const [isCashCloseModalOpen, setIsCashCloseModalOpen] = useState(false);
  const [lastTransaction, setLastTransaction] = useState<Transaction | null>(null);

  // Mobile Cart Drawer State
  const [isMobileCartOpen, setIsMobileCartOpen] = useState(false);

  // Auto-focus search on mount
  useEffect(() => {
    if (!isPaymentModalOpen && !lastTransaction && !isAllCategoriesOpen && !isMobileCartOpen) {
      setTimeout(() => searchInputRef.current?.focus(), 100);
    }
  }, [isPaymentModalOpen, lastTransaction, isAllCategoriesOpen, isMobileCartOpen]);


  const handleSearchKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();

      if (searchQuery.trim() === "" && cartItems.length > 0) {
        setIsPaymentModalOpen(true);
        return;
      }

      if (filteredProducts.length > 0) {
        const exactMatch = filteredProducts.find(p => String(p.id) === searchQuery.trim());
        const product = exactMatch || filteredProducts[0];
        addToCart(product.id);
        setSearchQuery("");
      }
    }
  };

  return (
    <>
      <header className="h-auto min-h-[5rem] shrink-0 px-4 md:px-6 py-4 pt-8 md:pt-4 flex items-center justify-between gap-4 md:gap-6 bg-white z-10 border-b border-transparent">
        <div className="flex-1 max-w-3xl flex items-center gap-4">
          <div className="relative group flex-1">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
              <span className={`material-symbols-outlined transition-colors ${searchQuery ? 'text-primary' : 'text-slate-400'}`}>search</span>
            </div>
            <input
              ref={searchInputRef}
              className="block w-full pl-12 pr-12 md:pr-28 py-3 bg-white border-none rounded-2xl text-slate-900 placeholder-slate-400 focus:ring-2 focus:ring-primary/50 shadow-sm text-base transition-all h-12 box-border shadow-slate-200/50 border-slate-100 border"
              placeholder="Buscar..."
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={handleSearchKeyDown}
            />
            {/* Desktop Scan Button */}
            <div className="hidden md:flex absolute inset-y-0 right-0 pr-2 items-center gap-2">
              <button className="flex items-center gap-1.5 px-2 py-1.5 rounded-lg bg-slate-50 hover:bg-slate-100 text-slate-500 hover:text-primary transition-colors group/scan" title="Escanear Código">
                <span className="material-symbols-outlined text-[20px] group-hover/scan:text-primary">barcode_scanner</span>
              </button>
              {cartItems.length > 0 && !searchQuery && (
                <span className="text-xs font-bold text-green-600 bg-green-50 px-2 py-1 rounded animate-pulse">ENTER = Cobrar</span>
              )}
            </div>
            {/* Mobile Scan Icon */}
            <button className="md:hidden absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400">
              <span className="material-symbols-outlined">barcode_scanner</span>
            </button>
          </div>
        </div>

        {/* Desktop Customer & Actions */}
        <div className="hidden md:flex items-center gap-3">
          <button
            onClick={() => setIsCustomerModalOpen(true)}
            className="flex items-center gap-3 px-1 py-1 pr-4 rounded-xl hover:bg-slate-50 border border-transparent hover:border-slate-200 transition-all group"
          >
            <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${selectedCustomer.id !== 'default' ? 'bg-green-100 text-green-600' : 'bg-slate-100 text-slate-500'}`}>
              <span className="material-symbols-outlined">person</span>
            </div>
            <div className="text-left">
              <p className="text-xs text-slate-400 font-bold uppercase tracking-wider">Cliente</p>
              <p className={`text-sm font-bold truncate max-w-[150px] ${selectedCustomer.id !== 'default' ? 'text-green-700' : 'text-slate-700'}`}>
                {selectedCustomer.name}
              </p>
            </div>
            <span className="material-symbols-outlined text-slate-400 group-hover:text-slate-600">expand_more</span>
          </button>

          <button
            onClick={() => setIsCashCloseModalOpen(true)}
            className="flex items-center gap-2 px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-600 hover:bg-slate-100 hover:text-slate-900 transition-colors font-semibold text-sm"
          >
            <span className="material-symbols-outlined text-[20px]">point_of_sale</span>
            Cerrar Caja
          </button>

          <button className="w-11 h-11 flex items-center justify-center rounded-xl bg-white border border-slate-200 text-slate-500 hover:text-primary transition-colors shadow-sm relative">
            <span className="material-symbols-outlined">notifications</span>
            <span className="absolute top-2.5 right-3 w-2 h-2 bg-red-500 rounded-full border-2 border-white"></span>
          </button>
        </div>

        {/* Mobile Header Actions */}
        <div className="flex md:hidden items-center gap-2">
          <button onClick={() => setIsCustomerModalOpen(true)} className="w-10 h-10 bg-slate-100 rounded-full flex items-center justify-center text-slate-600">
            <span className="material-symbols-outlined">person</span>
          </button>
        </div>
      </header>

      <div className="flex-1 flex overflow-hidden relative">
        <div className="flex-1 flex flex-col px-4 md:px-6 pb-6 overflow-hidden">
          {/* Categories */}
          <div className="shrink-0 mb-4 md:mb-6">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-bold text-slate-500 uppercase tracking-wide">Categorías</h3>
              <button
                onClick={() => setIsAllCategoriesOpen(true)}
                className="text-sm text-primary font-semibold hover:text-primary-dark transition-colors flex items-center gap-1"
              >
                Ver todas
                <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
              </button>
            </div>

            <div className="flex overflow-x-auto pb-2 gap-3 md:grid md:grid-cols-6 lg:grid-cols-8 no-scrollbar scroll-smooth snap-x">
              <div className="snap-start shrink-0">
                <CategoryButton
                  label="Todos"
                  icon="apps"
                  active={activeCategory === "Todos"}
                  onClick={() => setActiveCategory("Todos")}
                />
              </div>
              {PRODUCT_CATEGORIES.slice(0, 7).map(cat => (
                <div key={cat.id} className="snap-start shrink-0">
                  <CategoryButton
                    label={cat.id}
                    icon={cat.icon}
                    color={cat.color}
                    active={activeCategory === cat.id}
                    onClick={() => setActiveCategory(cat.id)}
                  />
                </div>
              ))}
            </div>
          </div>

          <ProductGrid
            products={filteredProducts}
            addToCart={addToCart}
            activeCategory={activeCategory}
            searchQuery={searchQuery}
          />
        </div>

        {/* Desktop Cart Sidebar */}
        <CartSidebar
          saleId={saleId}
          cartItems={cartItems}
          total={total}
          removeFromCart={removeFromCart}
          addToCart={addToCart}
          deleteFromCart={deleteFromCart}
          clearCart={clearCart}
          onCheckout={() => setIsPaymentModalOpen(true)}
          onHoldOrder={holdOrder}
          onViewHeldOrders={() => setIsHeldOrdersModalOpen(true)}
          heldOrdersCount={heldOrders.length}
        />
      </div>

      {/* MOBILE: Floating Cart Button */}
      {cartItems.length > 0 && !isMobileCartOpen && (
        <div className="md:hidden fixed bottom-20 left-4 right-4 z-40 animate-in slide-in-from-bottom duration-300">
          <button
            onClick={() => setIsMobileCartOpen(true)}
            className="w-full bg-slate-900 text-white p-4 rounded-2xl shadow-2xl flex items-center justify-between"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-[#13ec80] rounded-full flex items-center justify-center text-slate-900 font-bold">
                {cartItems.reduce((acc, item) => acc + item.quantity, 0)}
              </div>
              <div className="flex flex-col items-start leading-none">
                <span className="text-sm text-slate-400 font-medium">Ver Pedido</span>
                <span className="text-lg font-bold">Total: ${total.toLocaleString()}</span>
              </div>
            </div>
            <div className="flex items-center gap-1 font-bold text-[#13ec80]">
              Ir a Pagar
              <span className="material-symbols-outlined">arrow_upward</span>
            </div>
          </button>
        </div>
      )}

      {/* MOBILE: Cart Drawer (Overlay) */}
      {isMobileCartOpen && (
        <div className="fixed inset-0 z-[100] md:hidden flex flex-col bg-white animate-in slide-in-from-bottom duration-300">
          <div className="h-16 px-4 pt-4 border-b border-slate-100 flex items-center justify-between bg-white shrink-0">
            <h2 className="text-xl font-black text-slate-900">Tu Pedido</h2>
            <button
              onClick={() => setIsMobileCartOpen(false)}
              className="w-10 h-10 bg-slate-100 rounded-full flex items-center justify-center text-slate-600"
            >
              <span className="material-symbols-outlined">close</span>
            </button>
          </div>

          {/* Reuse CartSidebar Logic but adapted style manually or reuse component if flexible */}
          {/* For speed, reusing logic manually inside drawer since CartSidebar is styled as aside */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-50 pb-32">
            {cartItems.map(item => (
              <div key={item.id} className="bg-white p-4 rounded-xl border border-slate-100 shadow-sm flex gap-4">
                <div className="flex-1">
                  <h4 className="font-bold text-slate-900 mb-1">{item.name}</h4>
                  <p className="text-slate-500 text-sm mb-3">${item.finalPrice.toLocaleString()}</p>

                  <div className="flex items-center gap-4">
                    <div className="flex items-center border border-slate-200 rounded-lg bg-slate-50 h-10">
                      <button onClick={() => removeFromCart(item.id)} className="w-10 h-full flex items-center justify-center text-slate-500 active:bg-slate-200">
                        <span className="material-symbols-outlined">remove</span>
                      </button>
                      <div className="w-10 text-center font-bold text-slate-900">{item.quantity}</div>
                      <button onClick={() => addToCart(item.id)} className="w-10 h-full flex items-center justify-center text-slate-500 active:bg-slate-200">
                        <span className="material-symbols-outlined">add</span>
                      </button>
                    </div>
                    <div className="ml-auto font-black text-lg text-slate-900">
                      ${(item.finalPrice * item.quantity).toLocaleString()}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="absolute bottom-0 left-0 right-0 p-4 bg-white border-t border-slate-200 pb-8 rounded-t-2xl shadow-lg">
            <div className="flex justify-between items-center mb-4">
              <span className="text-lg font-bold text-slate-500">Total a Pagar</span>
              <span className="text-3xl font-black text-slate-900">${total.toLocaleString()}</span>
            </div>
            <button
              onClick={() => { setIsMobileCartOpen(false); setIsPaymentModalOpen(true); }}
              className="w-full bg-[#13ec80] text-slate-900 font-black text-xl py-4 rounded-xl shadow-lg shadow-green-500/30 active:scale-95 transition-transform flex items-center justify-center gap-2"
            >
              COBRAR AHORA
              <span className="material-symbols-outlined font-bold">arrow_forward</span>
            </button>
          </div>
        </div>
      )}


      {/* Categories Drawer - Same as before */}
      {isAllCategoriesOpen && (
        <div className="fixed inset-0 z-50 flex justify-end bg-slate-900/50 backdrop-blur-sm animate-in fade-in">
          <div className="w-full md:w-[400px] h-full bg-white shadow-2xl flex flex-col animate-in slide-in-from-right duration-300">
            <div className="p-6 border-b border-slate-100 flex items-center justify-between">
              <h2 className="text-xl font-bold text-slate-900">Categorías</h2>
              <button onClick={() => setIsAllCategoriesOpen(false)} className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-slate-100 text-slate-500">
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>
            <div className="flex-1 overflow-y-auto p-4 custom-scrollbar">
              <div className="grid grid-cols-2 gap-3">
                <button
                  onClick={() => { setActiveCategory("Todos"); setIsAllCategoriesOpen(false); }}
                  className={`flex flex-col items-center justify-center gap-2 p-4 rounded-xl border transition-all ${activeCategory === "Todos" ? 'bg-primary border-primary' : 'bg-slate-50 border-slate-100'}`}
                >
                  <span className="material-symbols-outlined text-[24px]">apps</span>
                  <span className="font-bold text-sm">Todos</span>
                </button>
                {PRODUCT_CATEGORIES.map(cat => (
                  <button
                    key={cat.id}
                    onClick={() => { setActiveCategory(cat.id); setIsAllCategoriesOpen(false); }}
                    className={`flex flex-col items-center justify-center gap-2 p-4 rounded-xl border transition-all ${activeCategory === cat.id ? 'bg-primary/20 border-primary' : 'bg-white border-slate-200 hover:border-primary/50'}`}
                  >
                    <span className={`material-symbols-outlined text-[24px] text-${cat.color}-500`}>{cat.icon}</span>
                    <span className="font-bold text-sm text-slate-700">{cat.id}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modals */}
      {isHeldOrdersModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4 animate-in fade-in">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg overflow-hidden flex flex-col max-h-[80vh]">
            <div className="p-4 border-b border-slate-100 flex justify-between items-center">
              <h3 className="font-bold text-lg">Ventas en Espera</h3>
              <button onClick={() => setIsHeldOrdersModalOpen(false)}><span className="material-symbols-outlined">close</span></button>
            </div>
            <div className="flex-1 overflow-y-auto p-4 space-y-2">
              {heldOrders.map((order, i) => (
                <div key={order.id} className="border border-slate-200 rounded-xl p-4 flex justify-between items-center hover:bg-slate-50 cursor-pointer" onClick={() => resumeOrder(order)}>
                  <div>
                    <p className="font-bold">Orden #{i + 1} - {new Date(order.timestamp).toLocaleTimeString()}</p>
                    <p className="text-sm text-slate-500">{order.customer.name}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-lg">${order.total.toLocaleString()}</p>
                    <span className="text-xs text-primary font-bold">Recuperar</span>
                  </div>
                </div>
              ))}
              {heldOrders.length === 0 && <p className="text-center text-slate-400 py-8">No hay ventas pendientes</p>}
            </div>
          </div>
        </div>
      )}

      <PaymentModal
        isOpen={isPaymentModalOpen}
        onClose={() => setIsPaymentModalOpen(false)}
        total={total}
        currentCustomer={selectedCustomer}
        onRequestCustomerSelection={() => {
          setIsPaymentModalOpen(false);
          setIsCustomerModalOpen(true);
        }}
        onFinalize={async (payments, amountTendered, change) => {
          const tx = await checkout(payments, amountTendered, change);
          if (tx) {
            setLastTransaction(tx as any);
            setIsPaymentModalOpen(false);
          }
        }}
      />

      <CashCloseModal
        isOpen={isCashCloseModalOpen}
        onClose={() => setIsCashCloseModalOpen(false)}
      />

      <SuccessModal
        transaction={lastTransaction}
        onNewSale={() => setLastTransaction(null)}
      />

      <CustomerModal
        isOpen={isCustomerModalOpen}
        onClose={() => setIsCustomerModalOpen(false)}
        onSelect={(customer) => setSelectedCustomer(customer)}
      />

      <style jsx global>{`
        @media print {
          @page { margin: 0; size: auto; }
          body * { visibility: hidden; }
          #printable-receipt, #printable-receipt * { visibility: visible; }
          #printable-receipt {
            position: absolute; left: 0; top: 0; width: 80mm; margin: 0; padding: 10px; background: white; color: black;
          }
          .fixed { position: static !important; }
        }
      `}</style>
    </>
  );
}
