export type Product = {
    id: string; // Unified to string for easier consistency
    name: string;
    description?: string;
    category: string;
    brand?: string;
    barcode?: string;

    // Pricing & Costs
    price: number; // Base price (often same as salePrice)
    salePrice: number;
    costPrice: number;
    tax?: number;
    taxType?: 'IVA' | 'ICO';

    // Inventory
    stock: number;
    minStock: number;
    unit?: string;

    // Metadata
    image?: string;
    icaRate?: number;
    bagTax?: number;
    status: "Activo" | "Inactivo";
};

export type CartItem = Product & {
    quantity: number;
    finalPrice: number;
};

export type Customer = {
    id: string;
    name: string; // Used as display name (often full_name)
    full_name?: string;
    email?: string;
    phone?: string;
    cc?: string; // Legacy?
    document_number?: string;
    address?: string;
    city?: string;
    department?: string;
    current_debt?: number;
};

export type PaymentMethod = "Efectivo" | "Tarjeta" | "QR" | "Fiado";

export type Payment = {
    id: string;
    method: PaymentMethod;
    amount: number;
};

export type TransactionType = "sale" | "expense" | "income";

export type Transaction = {
    id: string; // UUID
    date: string; // ISO String
    type: TransactionType;
    method: string;
    amount: number;
    amountTendered?: number;
    change?: number;
    description: string;
    items?: CartItem[];
    customerId?: string;
    customerName?: string;
    customerData?: Customer;
    payments?: Payment[];

    // View Fields
    customer_name?: string;
    reference_number?: string;
    payment_method?: string;
};

export type Sale = {
    id: number; // Incremental ID
    transactionId: string;
    timestamp: number;
    total: number;
    items: CartItem[];
    customer: Customer;
    status: "completed" | "pending" | "cancelled";
};

// Stats Type
export type InventoryStats = {
    totalProducts: number;
    totalValue: number;
    lowStockCount: number;
    inactiveCount: number;
};
