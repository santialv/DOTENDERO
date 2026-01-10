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

    // Load Products
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

            const { data } = await supabase
                .from('products')
                .select('*')
                .eq('status', 'active')
                .eq('organization_id', profile.organization_id);

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
                // Remove type casting if possible, but keeping 'as any' for safety with Product type strictness during migration
                setProducts(mapped as any);
            }
        }
        fetchProducts();
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

    const checkout = useCallback(async (payments: Payment[], amountTendered: number, change: number) => {
        try {
            // 1. Get Org ID securely
            const { data: { session } } = await supabase.auth.getSession();
            if (!session) throw new Error("No active session");

            const { data: profile } = await supabase
                .from('profiles')
                .select('organization_id')
                .eq('id', session.user.id)
                .single();

            const orgId = profile?.organization_id;

            if (!orgId) throw new Error("No organization found for user");

            // 2. Create Invoice
            const { data: invoiceData, error: invoiceError } = await supabase
                .from('invoices')
                .insert({
                    organization_id: orgId,
                    customer_id: selectedCustomer.id !== 'default' ? selectedCustomer.id : null,
                    number: `POS-${saleId}`,
                    payment_method: payments.map(p => p.method).join(','),
                    total: total,
                    status: 'paid',
                    date: new Date().toISOString()
                })
                .select()
                .single();

            if (invoiceError) throw invoiceError;
            if (invoiceError) throw invoiceError;
            const invoiceId = invoiceData.id;

            // 2.1 Handle Credit (Fiado) - Update Customer Debt
            const creditPayment = payments.find(p => p.method === 'Fiado');
            if (creditPayment && creditPayment.amount > 0) {
                if (selectedCustomer.id === 'default') {
                    throw new Error("No se puede fiar a Venta General. Seleccione un cliente.");
                }

                // Fetch current debt first to be safe (or use RPC increment if available, but read-write is ok here)
                const { data: custData } = await supabase.from('customers').select('current_debt').eq('id', selectedCustomer.id).single();
                const currentDebt = custData?.current_debt || 0;

                const { error: debtError } = await supabase
                    .from('customers')
                    .update({ current_debt: currentDebt + creditPayment.amount })
                    .eq('id', selectedCustomer.id);

                if (debtError) throw new Error("Error actualizando deuda del cliente: " + debtError.message);
            }

            // 3. Process Items (Stock + Movements + Invoice Items)
            const updates = cartItems.map(async (item) => {
                // a. Reduce Stock
                const newStock = (item.stock || 0) - item.quantity;
                const { error: stockError } = await supabase
                    .from('products')
                    .update({ stock: newStock })
                    .eq('id', item.id);

                if (stockError) throw stockError;

                // b. Insert Movement
                const { error: moveError } = await supabase.from('movements').insert({
                    organization_id: orgId,
                    product_id: item.id,
                    type: 'OUT',
                    quantity: item.quantity,
                    previous_stock: item.stock,
                    new_stock: newStock,
                    unit_cost: item.costPrice,
                    reference: `Venta POS-${saleId}`,
                    invoice_id: invoiceId
                });

                if (moveError) console.error("Error saving movement", moveError);

                // c. Add Invoice Item
                await supabase.from('invoice_items').insert({
                    invoice_id: invoiceId,
                    product_id: item.id,
                    product_name: item.name,
                    quantity: item.quantity,
                    price: item.finalPrice,
                    total: item.finalPrice * item.quantity
                });

                return { id: item.id, newStock };
            });

            await Promise.all(updates);

            // 4. Update Local State
            // Update stock in local products array to avoid refetch
            setProducts(prev => prev.map(p => {
                const updated = cartItems.find(c => String(c.id) === String(p.id));
                if (updated) {
                    return { ...p, stock: (p.stock || 0) - updated.quantity };
                }
                return p;
            }));

            // 5. Construct Transaction object for UI
            const newTransaction = {
                id: invoiceId,
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

            // Legacy support (localStorage)
            const savedTransactions = JSON.parse(localStorage.getItem("transactions") || "[]");
            localStorage.setItem("transactions", JSON.stringify([...savedTransactions, newTransaction]));

            const nextId = saleId + 1;
            setSaleId(nextId);
            localStorage.setItem("lastSaleId", nextId.toString());

            setCart([]);
            setSelectedCustomer({ id: "default", name: "Venta General" });
            toast(`Venta #${saleId} registrada con éxito`, "success");

            return newTransaction;

        } catch (error: any) {
            console.error("Checkout Error:", error);
            toast(`Error en venta: ${error.message}`, "error");
            return null;
        }
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
