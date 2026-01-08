export interface Movement {
    id: string;
    date: string;
    ref: string;
    productId: string;
    productName: string;
    type: 'Venta' | 'Compra' | 'Ajuste' | 'Merma' | 'Inicial';
    quantity: number;
    costPrice: number; // The weighted average cost AT THAT MOMENT
    unitCost: number; // The cost of this specific entry (for Purchases)
    balance: number;
    user: string;
}

export const calculateWeightedAverageCost = (
    currentStock: number,
    currentAvgCost: number,
    newQty: number,
    newUnitCost: number
): number => {
    if (currentStock + newQty === 0) return 0;
    const totalValue = (currentStock * currentAvgCost) + (newQty * newUnitCost);
    const totalQty = currentStock + newQty;
    return totalValue / totalQty;
};

export const addInventoryMovement = (
    productId: string | null,
    newItemData: { name: string, barcode: string, cost: number, price: number, minStock?: number, category?: string } | null,
    qty: number,
    unitCost: number,
    type: 'Venta' | 'Compra' | 'Ajuste' | 'Merma' | 'Inicial',
    ref: string,
    user: string
): { success: boolean; message: string } => {
    try {
        const products = JSON.parse(localStorage.getItem("products") || "[]");
        const kardex = JSON.parse(localStorage.getItem("kardex") || "[]");

        let productIndex = -1;
        let product: any = null;

        if (productId) {
            productIndex = products.findIndex((p: any) => p.id === productId);
        } else if (newItemData) {
            // Try to find by barcode if productId not provided
            productIndex = products.findIndex((p: any) => p.barcode === newItemData.barcode);
        }

        let newCost = unitCost;
        let newStock = qty;

        if (productIndex >= 0) {
            product = products[productIndex];

            // Logic for Weighted Average Cost
            // Only recalculate on Purchase or Initial, and ONLY if quantity is positive (adding stock)
            if ((type === 'Compra' || type === 'Inicial' || type === 'Ajuste') && qty > 0) {
                newCost = calculateWeightedAverageCost(product.stock, product.costPrice, qty, unitCost);
            } else {
                // For sales or outgoing, cost remains the same (FIFO/Average logic usually implies cost doesn't change on sale)
                // Use current product cost for the movement record
                newCost = product.costPrice;
            }

            product.stock += qty;
            product.costPrice = newCost;
            // Update sale price if provided (optional, usually manual)
            if (newItemData && newItemData.price > 0) product.salePrice = newItemData.price;

            products[productIndex] = product;
        } else if (newItemData) {
            // Create New Product
            newStock = qty;
            newCost = unitCost; // Initial cost is the unit cost

            product = {
                id: crypto.randomUUID(),
                name: newItemData.name,
                description: `Creado desde ${ref}`,
                category: newItemData.category || "General",
                barcode: newItemData.barcode,
                costPrice: newCost,
                salePrice: newItemData.price,
                tax: 0,
                stock: newStock,
                minStock: newItemData.minStock || 5,
                unit: "und",
                status: 'Activo'
            };
            products.push(product);
        } else {
            return { success: false, message: "Producto no encontrado y no se proporcionaron datos para crearlo." };
        }

        // Add Movement
        const movement: Movement = {
            id: crypto.randomUUID(),
            date: new Date().toISOString(),
            ref,
            productId: product.id,
            productName: product.name,
            type,
            quantity: qty,
            costPrice: newCost, // The new weighted average
            unitCost: unitCost, // What we paid for THIS batch
            balance: product.stock,
            user
        };
        kardex.push(movement);

        localStorage.setItem("products", JSON.stringify(products));
        localStorage.setItem("kardex", JSON.stringify(kardex));

        return { success: true, message: "Movimiento registrado" };
    } catch (e) {
        console.error(e);
        return { success: false, message: "Error interno al guardar" };
    }
};
