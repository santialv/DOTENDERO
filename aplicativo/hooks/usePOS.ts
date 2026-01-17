"use client";

import { useMemo, useState, useCallback, useEffect } from "react";
import { Product, CartItem, Customer, Sale, Payment } from "@/types";
import { useToast } from "@/components/ui/toast";
import { SEED_PRODUCTS } from "@/lib/seed-data";
import { supabase } from "@/lib/supabase";

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

    // Load Products (Smart Loading Strategy)
    useEffect(() => {
        async function fetchProducts() {
            const { data: { session } } = await supabase.auth.getSession();
            if (!session) return;

            const { data: profile } = await supabase
                .from('profiles')
                .select('organization_id')
                .eq('id', session.user.id)
                .single();

            if (!profile?.organization_id) return;

            // If user is searching, fetch all matching products
            if (searchQuery.trim() !== "") {
                const { data } = await supabase
                    .from('products')
                    .select('*')
                    .eq('status', 'active')
                    .eq('organization_id', profile.organization_id)
                    .or(`name.ilike.%${searchQuery}%,barcode.ilike.%${searchQuery}%,id.eq.${searchQuery}`)
                    .limit(50); // Limit search results to 50 for performance

                if (data) {
                    const mapped = data.map(p => ({
                        id: p.id,
                        name: p.name,
                        description: p.description,
                        category: p.category,
                        barcode: p.barcode,
                        price: p.price,
                        costPrice: p.cost,
                        salePrice: p.price,
                        stock: p.stock,
                        minStock: p.min_stock,
                        unit: p.unit,
                        status: p.status === 'active' ? 'Activo' : 'Inactivo',
                        image: p.image_url,
                        tax: p.tax_rate,
                        bagTax: p.bag_tax,
                        icaRate: p.ica_rate
                    }));
                    setProducts(mapped as any);
                }
                return;
            }

            // Default: Load top 20 most sold products
            try {
                // Try to get top selling products from invoice_items
                const { data: topProducts, error: topError } = await supabase
                    .rpc('get_top_products_for_pos', {
                        p_org_id: profile.organization_id,
                        p_limit: 20
                    });

                if (!topError && topProducts && topProducts.length > 0) {
                    // Load full product details for top sellers
                    const productIds = topProducts.map((p: any) => p.product_id);
                    const { data } = await supabase
                        .from('products')
                        .select('*')
                        .eq('status', 'active')
                        .eq('organization_id', profile.organization_id)
                        .in('id', productIds);

                    if (data) {
                        const mapped = data.map(p => ({
                            id: p.id,
                            name: p.name,
                            description: p.description,
                            category: p.category,
                            barcode: p.barcode,
                            price: p.price,
                            costPrice: p.cost,
                            salePrice: p.price,
                            stock: p.stock,
                            minStock: p.min_stock,
                            unit: p.unit,
                            status: p.status === 'active' ? 'Activo' : 'Inactivo',
                            image: p.image_url,
                            tax: p.tax_rate,
                            bagTax: p.bag_tax,
                            icaRate: p.ica_rate
                        }));
                        setProducts(mapped as any);
                    }
                } else {
                    // Fallback: Load 20 random products if no sales history
                    const { data } = await supabase
                        .from('products')
                        .select('*')
                        .eq('status', 'active')
                        .eq('organization_id', profile.organization_id)
                        .limit(20);

                    if (data) {
                        const mapped = data.map(p => ({
                            id: p.id,
                            name: p.name,
                            description: p.description,
                            category: p.category,
                            barcode: p.barcode,
                            price: p.price,
                            costPrice: p.cost,
                            salePrice: p.price,
                            stock: p.stock,
                            minStock: p.min_stock,
                            unit: p.unit,
                            status: p.status === 'active' ? 'Activo' : 'Inactivo',
                            image: p.image_url,
                            tax: p.tax_rate,
                            bagTax: p.bag_tax,
                            icaRate: p.ica_rate
                        }));
                        setProducts(mapped as any);
                    }
                }
            } catch (error) {
                console.error("Error loading products:", error);
            }
        }
        fetchProducts();
    }, [searchQuery]); // Re-fetch when search query changes

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
            // Safety check: POS should strictly only show active products
            if (p.status !== 'Activo') return false;
            // Filter by category (search filtering is now done server-side)
            if (activeCategory !== "Todos" && p.category !== activeCategory) return false;
            return true;
        });
    }, [products, activeCategory]);

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

    const checkout = useCallback(async (payments: Payment[], amountTendered: number, change: number) => {
        try {
            // 1. Get Session
            const { data: { session } } = await supabase.auth.getSession();
            if (!session) throw new Error("No active session");

            // 2. Preparing Data for RPC
            const itemsPayload = cartItems.map(item => ({
                id: item.id,
                quantity: item.quantity
            }));

            const paymentsPayload = payments.map(p => ({
                method: p.method,
                amount: p.amount
            }));

            // 3. Get Organization ID (Reliable fetch)
            const { data: profile } = await supabase
                .from('profiles')
                .select('organization_id')
                .eq('id', session.user.id)
                .single();

            if (!profile?.organization_id) throw new Error("No organization found for user");

            // 4. Call the Atomic RPC Function (Server-Side Logic)
            const { data: saleResult, error: saleError } = await supabase
                .rpc('process_sale', {
                    p_org_id: profile.organization_id,
                    p_seller_id: session.user.id,
                    p_customer_id: selectedCustomer.id !== 'default' ? selectedCustomer.id : null,
                    p_items: itemsPayload,
                    p_payments: paymentsPayload,
                    p_sale_number: null // Server will generate it if null
                });

            if (saleError) throw saleError;

            // 5. Success Handling
            // Construct a "Transaction" object just for UI display/receipt printing
            const newTransaction = {
                id: saleResult.invoice_id,
                date: new Date().toISOString(),
                type: "sale",
                method: payments.map(p => p.method).join(" + "),
                amount: saleResult.total, // Trusted total from server
                amountTendered,
                change,
                description: `Venta #${saleResult.sale_number}`,
                items: cartItems, // Keep local items for receipt detail
                customerId: selectedCustomer.id !== "default" ? selectedCustomer.id : undefined,
                customerName: selectedCustomer.name,
                customerData: selectedCustomer,
                payments
            };

            // 6. Update Local State (Optimistic UI)
            setProducts(prev => prev.map(p => {
                const updated = cartItems.find(c => String(c.id) === String(p.id));
                if (updated) {
                    return { ...p, stock: (p.stock || 0) - updated.quantity };
                }
                return p;
            }));

            // Legacy support (localStorage)
            const savedTransactions = JSON.parse(localStorage.getItem("transactions") || "[]");
            localStorage.setItem("transactions", JSON.stringify([...savedTransactions, newTransaction]));

            // Update Sale ID Counter based on server response (keep local in sync)
            const numPart = parseInt(saleResult.sale_number.split('-')[1] || "0");
            if (numPart) {
                setSaleId(numPart + 1);
                localStorage.setItem("lastSaleId", (numPart + 1).toString());
            }

            setCart([]);
            setSelectedCustomer({ id: "default", name: "Venta General" });
            toast(`Venta ${saleResult.sale_number} registrada con éxito`, "success");

            return newTransaction;

        } catch (error: any) {
            console.error("Checkout Error:", error);
            const msg = error.message || error.details || 'Error desconocido';
            toast(`Error en venta: ${msg}`, "error");
            return null;
        }
    }, [saleId, cartItems, selectedCustomer, toast]);

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
