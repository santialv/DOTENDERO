"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";

interface Notification {
    id: string;
    title: string;
    message: string;
    type: 'low_stock' | 'system' | 'info';
    is_read: boolean;
    created_at: string;
    link?: string;
    metadata?: any;
}

export function NotificationBell() {
    const [isOpen, setIsOpen] = useState(false);
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const [unreadCount, setUnreadCount] = useState(0);
    const router = useRouter();

    // 1. Fetch Notifications & Low Stock Check
    useEffect(() => {
        fetchNotifications();
    }, []);

    const fetchNotifications = async () => {
        try {
            const { data: { session } } = await supabase.auth.getSession();
            if (!session) return;
            const { data: profile } = await supabase.from('profiles').select('organization_id').eq('id', session.user.id).single();
            if (!profile?.organization_id) return;
            const orgId = profile.organization_id;

            // 1. Check Low Stock (Dynamically generate these notifications)
            const { data: lowStockProducts } = await supabase
                .from('products')
                .select('id, name, stock, min_stock, organization_id')
                .eq('organization_id', orgId)
                .not('min_stock', 'is', null) // Only if min_stock is set
                .eq('status', 'active'); // Only active products

            const lowStockAlerts: Notification[] = [];

            if (lowStockProducts) {
                lowStockProducts.forEach(product => {
                    // Logic: If stock < min_stock
                    if (product.stock <= (product.min_stock || 0)) {
                        lowStockAlerts.push({
                            id: `low-stock-${product.id}`, // Virtual ID implies it's always current state
                            title: "Stock Bajo Crítico",
                            message: `El producto "${product.name}" tiene solo ${product.stock} unidades (Mín: ${product.min_stock}).`,
                            type: 'low_stock',
                            is_read: false, // Always show as unread if critical
                            created_at: new Date().toISOString(),
                            link: `/inventario?search=${product.name}`
                        });
                    }
                });
            }

            // 2. Combine with system notifications (if any in DB)
            // For now we just use the dynamic low stock alerts as the main source
            setNotifications(lowStockAlerts);
            setUnreadCount(lowStockAlerts.length);

        } catch (error) {
            console.error("Error fetching notifications:", error);
        }
    };

    const handleNotificationClick = (notification: Notification) => {
        setIsOpen(false);
        if (notification.link) {
            // If it's a link to inventory search, standard navigation
            router.push(notification.link);
        }
    };

    return (
        <div className="relative group">
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="relative w-12 h-12 flex items-center justify-center rounded-full bg-white shadow-lg border border-slate-100 hover:bg-slate-50 transition-all hover:scale-105 active:scale-95 text-slate-500 hover:text-slate-900"
            >
                <span className={`material-symbols-outlined text-2xl ${unreadCount > 0 ? 'animate-tada text-slate-700' : ''}`}>
                    notifications
                </span>
                {unreadCount > 0 && (
                    <span className="absolute top-0 right-0 w-4 h-4 bg-red-500 rounded-full border-2 border-white flex items-center justify-center text-[9px] font-bold text-white shadow-sm">
                        {unreadCount > 9 ? '9+' : unreadCount}
                    </span>
                )}
            </button>

            <AnimatePresence>
                {isOpen && (
                    <>
                        <div
                            className="fixed inset-0 z-40 bg-transparent"
                            onClick={() => setIsOpen(false)}
                        />
                        <motion.div
                            initial={{ opacity: 0, y: 20, scale: 0.95 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            exit={{ opacity: 0, y: 20, scale: 0.95 }}
                            transition={{ duration: 0.2 }}
                            className="absolute bottom-full right-0 mb-4 w-80 md:w-96 bg-white rounded-2xl shadow-2xl border border-slate-200 z-50 overflow-hidden origin-bottom-right"
                        >
                            <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/80 backdrop-blur-sm">
                                <h3 className="font-bold text-slate-900">Notificaciones</h3>
                                {unreadCount > 0 && (
                                    <span className="text-xs font-bold text-red-600 bg-red-100 px-2 py-0.5 rounded-full">
                                        {unreadCount} nuevas
                                    </span>
                                )}
                            </div>

                            <div className="max-h-[60vh] overflow-y-auto custom-scrollbar">
                                {notifications.length === 0 ? (
                                    <div className="p-8 text-center text-slate-400 flex flex-col items-center">
                                        <span className="material-symbols-outlined text-4xl mb-2 text-slate-200">notifications_off</span>
                                        <p className="text-sm">Todo está tranquilo por aquí.</p>
                                    </div>
                                ) : (
                                    <div className="divide-y divide-slate-100">
                                        {notifications.map((notification) => (
                                            <div
                                                key={notification.id}
                                                onClick={() => handleNotificationClick(notification)}
                                                className={`p-4 hover:bg-slate-50 cursor-pointer transition-colors flex gap-3 ${!notification.is_read ? 'bg-red-50/30' : ''}`}
                                            >
                                                <div className={`mt-1 shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${notification.type === 'low_stock' ? 'bg-red-100 text-red-600' : 'bg-slate-100 text-slate-600'
                                                    }`}>
                                                    <span className="material-symbols-outlined text-[18px]">
                                                        {notification.type === 'low_stock' ? 'inventory_2' : 'info'}
                                                    </span>
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <p className={`text-sm ${!notification.is_read ? 'font-bold text-slate-900' : 'font-medium text-slate-700'}`}>
                                                        {notification.title}
                                                    </p>
                                                    <p className="text-xs text-slate-500 mt-0.5 line-clamp-2">
                                                        {notification.message}
                                                    </p>
                                                    <p className="text-[10px] text-slate-400 mt-2 font-medium">
                                                        {new Date(notification.created_at).toLocaleDateString()}
                                                    </p>
                                                </div>
                                                {!notification.is_read && (
                                                    <div className="mt-2 w-2 h-2 rounded-full bg-red-500 shrink-0"></div>
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </motion.div>
                    </>
                )}
            </AnimatePresence>
        </div>
    );
}
