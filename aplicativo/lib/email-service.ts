export interface InvoiceData {
    id: string;
    customerName: string;
    customerEmail?: string;
    amount: number;
    date: string;
    items: any[];
}

/**
 * Placeholder service for sending invoice emails.
 * This will be connected to a real provider (Resend, SendGrid, etc.) later.
 */
export async function sendInvoiceEmail(invoice: InvoiceData): Promise<boolean> {
    // 1. Check if email exists
    if (!invoice.customerEmail) {
        console.log(`[Email Service] No email provided for invoice #${invoice.id}. Skipping.`);
        return false;
    }

    // 2. Validate format (basic)
    if (!invoice.customerEmail.includes('@')) {
        console.error(`[Email Service] Invalid email format: ${invoice.customerEmail}`);
        return false;
    }

    // 3. Simulate API Call
    console.log(`[Email Service] 📧 Connecting to SMTP...`);
    console.log(`[Email Service] Sending Invoice #${invoice.id} to ${invoice.customerEmail}...`);

    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 800));

    console.log(`[Email Service] ✅ Email sent successfully!`);
    return true;
}
