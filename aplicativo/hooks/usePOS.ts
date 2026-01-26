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

    // Cache for products in cart to prevent them disappearing when search changes
    const [productCache, setProductCache] = useState<Record<string, Product>>({});

    const [activeCategory, setActiveCategory] = useState("Todos");
    const [searchQuery, setSearchQuery] = useState("");

    // Transaction State
    const [saleId, setSaleId] = useState(1024);
    const [selectedCustomer, setSelectedCustomer] = useState<Customer>({ id: "default", name: "Venta General" });
    const [heldOrders, setHeldOrders] = useState<any[]>([]);

    // Helper to update cache
    const updateProductCache = useCallback((newProducts: Product[]) => {
        setProductCache(prev => {
            const next = { ...prev };
            newProducts.forEach(p => {
                next[String(p.id)] = p;
            });
            return next;
        });
    }, []);

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
                    updateProductCache(mapped as any); // Cache them
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
                        updateProductCache(mapped as any);
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
                        updateProductCache(mapped as any);
                    }
                }
            } catch (error) {
                console.error("Error loading products:", error);
            }
        }
        fetchProducts();
    }, [searchQuery, updateProductCache]); // Re-fetch when search query changes

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
            // Find in current view products OR in cache
            const product = products.find(p => String(p.id) === String(cartItem.id)) || productCache[String(cartItem.id)];

            if (!product) return null;
            return {
                ...product,
                ...cartItem,
                finalPrice: product.salePrice || product.price || 0,
            } as CartItem;
        }).filter((item): item is CartItem => item !== null);
    }, [cart, products, productCache]);

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

        // Ensure added product is in cache (it should be if we clicked it, but good to be safe)
        // We rely on products/cache being updated during fetch/render.
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
        setCart(prev => prev.filter(item => String(item.id) !== String(productId)));
    }, []);

    const clearCart = useCallback(() => {
        setCart([]);
        setSelectedCustomer({ id: "default", name: "Venta General" });
    }, []);

    const holdOrder = useCallback(async () => {
        if (cartItems.length === 0) return;

        const order = {
            id: Date.now(),
            timestamp: new Date().toISOString(),
            cart: cartItems, // Save full items to avoiding cache issues on resume
            customer: selectedCustomer,
            total,
            saleId
        };

        const newHeld = [...heldOrders, order];
        setHeldOrders(newHeld);
        localStorage.setItem("heldOrders", JSON.stringify(newHeld));

        clearCart();
        toast("Orden puesta en espera", "info");
    }, [cartItems, selectedCustomer, total, saleId, heldOrders, clearCart, toast]);

    const resumeOrder = useCallback((order: any) => {
        // Update cache with items from held order to ensure they display
        const restoredProducts: Product[] = order.cart.map((item: CartItem) => {
            // Strip quantity and pure product fields
            const { quantity, finalPrice, ...p } = item;
            return p as Product;
        });

        updateProductCache(restoredProducts);

        setCart(order.cart.map((item: any) => ({
            id: String(item.id),
            quantity: item.quantity
        })));
        setSelectedCustomer(order.customer);

        const newHeld = heldOrders.filter(h => h.id !== order.id);
        setHeldOrders(newHeld);
        localStorage.setItem("heldOrders", JSON.stringify(newHeld));

        toast("Orden recuperada", "info");
    }, [heldOrders, toast, updateProductCache]);

    const checkout = useCallback(async (
        paymentMethods: Payment[],
        amountTendered: number,
        change: number
    ) => {
        if (cartItems.length === 0) return null;

        const { data: { session } } = await supabase.auth.getSession();
        if (!session) {
            toast("No session found", "error");
            return null;
        }

        const { data: profile } = await supabase
            .from('profiles')
            .select('organization_id')
            .eq('id', session.user.id)
            .single();

        if (!profile?.organization_id) {
            toast("No organization linked", "error");
            return null;
        }

        // Process Sale via RPC
        const saleData = {
            p_org_id: profile.organization_id,
            p_user_id: session.user.id, // Vendedor
            p_invoice_number: saleId,
            p_customer_id: selectedCustomer.id === 'default' ? null : selectedCustomer.id,
            p_total: total,
            p_payment_method: paymentMethods.map(p => p.method).join(','), // Simple comma list for now or first method
            p_items: cartItems.map(item => ({
                product_id: item.id,
                quantity: item.quantity,
                unit_price: item.finalPrice,
                subtotal: item.finalPrice * item.quantity
            }))
        };

        try {
            // Using a Supabase RPC to handle transaction atomically
            const { data, error } = await supabase.rpc('process_sale', saleData);

            if (error) {
                console.error("Sale Error:", error);
                toast(`Error al procesar venta: ${error.message}`, "error");
                return null;
            }

            // Success
            const confirmedSale = {
                id: data || saleId,
                total,
                items: cartItems,
                date: new Date().toISOString(),
                paymentMethod: paymentMethods[0].method, // Simplify
                customer: selectedCustomer
            };

            // Update local ID
            setSaleId(prev => {
                const next = prev + 1;
                localStorage.setItem("lastSaleId", next.toString());
                return next;
            });

            clearCart();
            toast("Venta registrada con éxito", "success");

            return confirmedSale;

        } catch (err) {
            console.error(err);
            toast("Error inesperado", "error");
            return null;
        }
    }, [cartItems, saleId, selectedCustomer, total, toast, clearCart]);

    return {
        products,
        filteredProducts, // Actually just 'products' filtered by category locally
        activeCategory,
        searchQuery,
        cartItems,
        total,
        saleId,
        selectedCustomer,
        heldOrders,
        setActiveCategory,
        setSearchQuery,
        setSelectedCustomer,
        addToCart,
        removeFromCart,
        deleteFromCart,
        clearCart,
        holdOrder,
        resumeOrder,
        checkout
    };
}
