"use client";

import { useEffect, useRef, useState } from "react";
import { ProductGrid } from "@/components/pos/ProductGrid";
import { CartSidebar } from "@/components/pos/CartSidebar";
import { PaymentModal } from "@/components/pos/PaymentModal";
import { SuccessModal } from "@/components/pos/SuccessModal";
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
    products, // Needed if we want logic for first match
    cartItems,
    total,
    saleId,
    selectedCustomer,
    heldOrders,
    cart, // Need cart for length checks

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
  const [lastTransaction, setLastTransaction] = useState<Transaction | null>(null);

  // Auto-focus search on mount and after interactions
  useEffect(() => {
    if (!isPaymentModalOpen && !lastTransaction && !isAllCategoriesOpen) {
      setTimeout(() => searchInputRef.current?.focus(), 100);
    }
  }, [isPaymentModalOpen, lastTransaction, isAllCategoriesOpen]);


  const handleSearchKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();

      // Case 1: Search is empty and Cart has items -> Checkout
      if (searchQuery.trim() === "" && cartItems.length > 0) {
        setIsPaymentModalOpen(true);
        return;
      }

      // Case 2: Exact Match or First Result
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
      <header className="h-20 shrink-0 px-6 py-4 flex items-center justify-between gap-6 bg-white z-10 border-b border-transparent">
        <div className="flex-1 max-w-3xl flex items-center gap-4">
          <div className="relative group flex-1">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
              <span className={`material-symbols-outlined transition-colors ${searchQuery ? 'text-primary' : 'text-slate-400'}`}>search</span>
            </div>
            <input
              ref={searchInputRef}
              className="block w-full pl-12 pr-28 py-3 bg-white border-none rounded-2xl text-slate-900 placeholder-slate-400 focus:ring-2 focus:ring-primary/50 shadow-sm text-base transition-all h-12 box-border"
              placeholder="Escanear o buscar (Enter para cobrar)"
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={handleSearchKeyDown}
            />
            <div className="absolute inset-y-0 right-0 pr-2 flex items-center gap-2">
              <button className="flex items-center gap-1.5 px-2 py-1.5 rounded-lg bg-slate-50 hover:bg-slate-100 text-slate-500 hover:text-primary transition-colors group/scan" title="Escanear Código">
                <span className="material-symbols-outlined text-[20px] group-hover/scan:text-primary">barcode_scanner</span>
              </button>
              {cartItems.length > 0 && !searchQuery && (
                <span className="text-xs font-bold text-green-600 bg-green-50 px-2 py-1 rounded animate-pulse">ENTER = Cobrar</span>
              )}
            </div>
          </div>
        </div>

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

        <div className="flex items-center gap-3">
          <button className="w-11 h-11 flex items-center justify-center rounded-xl bg-white border border-slate-200 text-slate-500 hover:text-primary transition-colors shadow-sm relative">
            <span className="material-symbols-outlined">notifications</span>
            <span className="absolute top-2.5 right-3 w-2 h-2 bg-red-500 rounded-full border-2 border-white"></span>
          </button>
        </div>
      </header>

      <div className="flex-1 flex overflow-hidden">
        <div className="flex-1 flex flex-col px-6 pb-6 overflow-hidden">
          <div className="shrink-0 mb-6">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-bold text-slate-500 uppercase tracking-wide">Categorías</h3>
              <button
                onClick={() => setIsAllCategoriesOpen(true)}
                className="text-sm text-primary font-semibold hover:text-primary-dark transition-colors flex items-center gap-1"
              >
                Ver todas ({PRODUCT_CATEGORIES.length})
                <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
              </button>
            </div>

            <div className="grid grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-3">
              <button
                onClick={() => setActiveCategory("Todos")}
                className={`flex flex-col items-center justify-center gap-2 p-2 rounded-xl border shadow-md transition-all active:scale-95 group h-[88px] ${activeCategory === "Todos"
                  ? "bg-primary text-slate-900 border-primary shadow-primary/20"
                  : "bg-white text-slate-600 border-slate-200 hover:border-primary/50"}`}
              >
                <div className={`w-10 h-10 rounded-full flex items-center justify-center backdrop-blur-sm ${activeCategory === "Todos" ? "bg-white/20" : "bg-slate-100"}`}>
                  <span className="material-symbols-outlined text-[22px]">apps</span>
                </div>
                <span className="text-xs font-bold">Todos</span>
              </button>
              {PRODUCT_CATEGORIES.slice(0, 7).map(cat => (
                <CategoryButton
                  key={cat.id}
                  label={cat.id}
                  icon={cat.icon}
                  color={cat.color}
                  active={activeCategory === cat.id}
                  onClick={() => setActiveCategory(cat.id)}
                />
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

      {/* Categories Drawer/Modal */}
      {isAllCategoriesOpen && (
        <div className="fixed inset-0 z-50 flex justify-end bg-slate-900/50 backdrop-blur-sm animate-in fade-in">
          <div className="w-[400px] h-full bg-white shadow-2xl flex flex-col animate-in slide-in-from-right duration-300">
            <div className="p-6 border-b border-slate-100 flex items-center justify-between">
              <h2 className="text-xl font-bold text-slate-900">Todas las Categorías</h2>
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

      {/* Held Orders Modal Re-integration needed or separate component? Keeping concise for now */}
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
        onFinalize={(payments, amountTendered, change) => {
          const tx = checkout(payments, amountTendered, change);
          setLastTransaction(tx);
          setIsPaymentModalOpen(false);
        }}
      />

      <SuccessModal
        transaction={lastTransaction}
        onNewSale={() => setLastTransaction(null)}
      />

      {/* Print Styles */}
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
