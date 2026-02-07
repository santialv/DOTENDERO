// Fábrica Centralizada de Llaves de Caché para React Query
// Creada para evitar errores de tipeo y garantizar invalidación correcta de datos.

export const queryKeys = {
    // Transacciones de Caja
    transactions: {
        all: ['transactions'] as const,
        list: (filters: Record<string, any>) => [...queryKeys.transactions.all, { filters }] as const,
        detail: (id: string) => [...queryKeys.transactions.all, 'detail', id] as const,
        stats: (period: string) => [...queryKeys.transactions.all, 'stats', period] as const,
    },

    // Turnos de Caja
    cashShifts: {
        all: ['cash_shifts'] as const,
        list: (filters: Record<string, any>) => [...queryKeys.cashShifts.all, { filters }] as const,
        active: (registerId: string) => [...queryKeys.cashShifts.all, 'active', registerId] as const,
        history: (registerId: string) => [...queryKeys.cashShifts.all, 'history', registerId] as const,
    },

    // Productos e Inventario
    products: {
        all: ['products'] as const,
        list: (filters: Record<string, any>) => [...queryKeys.products.all, { filters }] as const,
        detail: (id: string) => [...queryKeys.products.all, 'detail', id] as const,
        lowStock: ['products', 'low-stock'] as const,
    },

    // Clientes
    customers: {
        all: ['customers'] as const,
        list: (search: string) => [...queryKeys.customers.all, { search }] as const,
        detail: (id: string) => [...queryKeys.customers.all, 'detail', id] as const,
        map: ['customers', 'map'] as const,
    },

    // Configuración del Negocio
    config: {
        all: ['business_config'] as const,
        profile: ['business_config', 'profile'] as const,
    },

    // Usuarios y Roles
    users: {
        role: (userId: string) => ['users', 'role', userId] as const,
    }
};
