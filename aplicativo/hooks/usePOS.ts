"use client";

import { useMemo, useState, useCallback, useEffect } from "react";
import { Product, CartItem, Customer, Sale, Payment } from "@/types";
import { useToast } from "@/components/ui/toast";
import { SEED_PRODUCTS } from "@/lib/seed-data";

export function usePOS() {
    const { toast } = useToast();

    // Data State
    const [products, setProducts] = useState<Product[]>([]);
    const [cart, setCart] = useState<{ id: string; quantity: number }[]>([]);
    const [activeCategory, setActiveCategory] = useState("Todos");
    const [searchQuery, setSearchQuery] = useState("");

    // Transaction State
    const [saleId, setSaleId] = useState(1024);
    const [selectedCustomer, setSelectedCustomer] = useState<Customer>({ id: "default", name: "Venta General" });
    const [heldOrders, setHeldOrders] = useState<any[]>([]);

    // Load Products
    useEffect(() => {
        const savedProducts = JSON.parse(localStorage.getItem("products") || "[]");
        if (savedProducts.length < 20) {
            setProducts(SEED_PRODUCTS as Product[]);
            localStorage.setItem("products", JSON.stringify(SEED_PRODUCTS));
        } else {
            setProducts(savedProducts);
        }
    }, []);

    // Load Sale ID & Held Orders
    useEffect(() => {
        const lastId = localStorage.getItem("lastSaleId");
        if (lastId) setSaleId(parseInt(lastId));

        const savedHeld = localStorage.getItem("heldOrders");
        if (savedHeld) setHeldOrders(JSON.parse(savedHeld));
    }, []);

    // Derived State
    const filteredProducts = useMemo(() => {
        return products.filter(p => {
            if (activeCategory !== "Todos" && p.category !== activeCategory) return false;
            if (searchQuery.trim() === "") return true;
            const q = searchQuery.toLowerCase();
            return p.name.toLowerCase().includes(q) || String(p.id).toLowerCase().includes(q);
        });
    }, [products, activeCategory, searchQuery]);

    // Cart Logic
    const cartItems = useMemo(() => {
        return cart.map(cartItem => {
            const product = products.find(p => String(p.id) === String(cartItem.id));
            if (!product) return null;
            return {
                ...product,
                ...cartItem,
                finalPrice: product.salePrice || product.price || 0,
            } as CartItem;
        }).filter((item): item is CartItem => item !== null);
    }, [cart, products]);

    const total = cartItems.reduce((acc, item) => acc + (item.finalPrice * item.quantity), 0);

    // Actions
    const addToCart = useCallback((productId: string | number) => {
        setCart(prev => {
            const idStr = String(productId);
            const existing = prev.find(item => String(item.id) === idStr);
            if (existing) {
                return prev.map(item => String(item.id) === idStr ? { ...item, quantity: item.quantity + 1 } : item);
            }
            return [...prev, { id: idStr, quantity: 1 }];
        });
    }, []);

    const removeFromCart = useCallback((productId: string | number) => {
        setCart(prev => {
            const idStr = String(productId);
            const existing = prev.find(item => String(item.id) === idStr);
            if (existing && existing.quantity > 1) {
                return prev.map(item => String(item.id) === idStr ? { ...item, quantity: item.quantity - 1 } : item);
            }
            return prev.filter(item => String(item.id) !== idStr);
        });
    }, []);

    const deleteFromCart = useCallback((productId: string | number) => {
        const idStr = String(productId);
        setCart(prev => prev.filter(item => String(item.id) !== idStr));
    }, []);

    const clearCart = useCallback(() => setCart([]), []);

    const holdOrder = useCallback(() => {
        if (cart.length === 0) return;
        const newOrder = {
            id: crypto.randomUUID(),
            timestamp: Date.now(),
            cart,
            customer: selectedCustomer,
            total
        };
        const updated = [...heldOrders, newOrder];
        setHeldOrders(updated);
        localStorage.setItem("heldOrders", JSON.stringify(updated));
        setCart([]);
        setSelectedCustomer({ id: "default", name: "Venta General" });
        toast("Venta puesta en espera", "success");
    }, [cart, selectedCustomer, total, heldOrders, toast]);

    const resumeOrder = useCallback((order: any) => {
        if (cart.length > 0) {
            const currentOrder = {
                id: crypto.randomUUID(),
                timestamp: Date.now(),
                cart,
                customer: selectedCustomer,
                total
            };
            const updatedHeld = [...heldOrders.filter(o => o.id !== order.id), currentOrder];
            setHeldOrders(updatedHeld);
            localStorage.setItem("heldOrders", JSON.stringify(updatedHeld));
            toast("Venta actual guardada. Recuperando...", "info");
        } else {
            const remaining = heldOrders.filter(o => o.id !== order.id);
            setHeldOrders(remaining);
            localStorage.setItem("heldOrders", JSON.stringify(remaining));
        }
        setCart(order.cart);
        setSelectedCustomer(order.customer);
        toast("Venta recuperada", "success");
    }, [cart, selectedCustomer, total, heldOrders, toast]);

    const checkout = useCallback((payments: Payment[], amountTendered: number, change: number) => {
        const newTransaction = {
            id: crypto.randomUUID(),
            date: new Date().toISOString(),
            type: "sale",
            method: payments.map(p => p.method).join(" + "),
            amount: total,
            amountTendered,
            change,
            description: `Venta #${saleId}`,
            items: cartItems,
            customerId: selectedCustomer.id !== "default" ? selectedCustomer.id : undefined,
            customerName: selectedCustomer.name,
            customerData: selectedCustomer,
            payments
        };

        const savedTransactions = JSON.parse(localStorage.getItem("transactions") || "[]");
        localStorage.setItem("transactions", JSON.stringify([...savedTransactions, newTransaction]));

        const nextId = saleId + 1;
        setSaleId(nextId);
        localStorage.setItem("lastSaleId", nextId.toString());

        setCart([]);
        setSelectedCustomer({ id: "default", name: "Venta General" });
        toast(`Venta #${saleId} registrada con éxito`, "success");
        return newTransaction;
    }, [saleId, total, cartItems, selectedCustomer, toast]);

    return {
        // State
        products,
        filteredProducts,
        activeCategory,
        searchQuery,
        cart,
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
    };
}
