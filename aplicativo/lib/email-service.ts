export interface InvoiceData {
    id: string;
    customerName: string;
    customerEmail?: string;
    additionalEmail?: string; // New manual email
    amount: number;
    date: string;
    items: any[];
}

/**
 * Sends an invoice email via the Next.js API route.
 */
export async function sendInvoiceEmail(invoice: InvoiceData): Promise<boolean> {
    const recipients = [];
    if (invoice.customerEmail && invoice.customerEmail.includes('@')) recipients.push(invoice.customerEmail);
    if (invoice.additionalEmail && invoice.additionalEmail.includes('@')) recipients.push(invoice.additionalEmail);

    if (recipients.length === 0) {
        console.log(`[Email Service] No valid emails provided for invoice #${invoice.id}.`);
        return false;
    }

    try {
        console.log(`[Email Service] Sending to ${recipients.join(', ')}...`);

        // Simple HTML Template
        const itemsHtml = invoice.items.map(item => `
            <tr>
                <td style="padding: 8px; border-bottom: 1px solid #ddd;">${item.name || 'Producto'}</td>
                <td style="padding: 8px; border-bottom: 1px solid #ddd; text-align: center;">${item.quantity || 1}</td>
                <td style="padding: 8px; border-bottom: 1px solid #ddd; text-align: right;">$${(item.finalPrice || item.price || 0).toLocaleString()}</td>
            </tr>
        `).join('');

        const htmlContent = `
            <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #eee; border-radius: 10px;">
                <h1 style="color: #333;">Recibo de Compra</h1>
                <p>Hola <strong>${invoice.customerName}</strong>,</p>
                <p>Gracias por tu compra en DonTendero.</p>
                <div style="margin: 20px 0;">
                    <p><strong>Factura:</strong> #${invoice.id.slice(0, 8)}</p>
                    <p><strong>Fecha:</strong> ${new Date(invoice.date).toLocaleDateString()}</p>
                </div>
                <table style="width: 100%; border-collapse: collapse; margin-bottom: 20px;">
                    <thead>
                        <tr style="background-color: #f8f9fa;">
                            <th style="padding: 8px; text-align: left;">Producto</th>
                            <th style="padding: 8px; text-align: center;">Cant</th>
                            <th style="padding: 8px; text-align: right;">Total</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${itemsHtml}
                    </tbody>
                    <tfoot>
                        <tr>
                            <td colspan="2" style="padding: 8px; text-align: right; font-weight: bold;">TOTAL:</td>
                            <td style="padding: 8px; text-align: right; font-weight: bold; font-size: 18px;">$${invoice.amount.toLocaleString()}</td>
                        </tr>
                    </tfoot>
                </table>
                <p style="font-size: 12px; color: #888; text-align: center; margin-top: 30px;">
                    Este es un comprobante electrónico generado por DonTendero POS.
                </p>
            </div>
        `;

        const response = await fetch('/api/send', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                to: recipients,
                subject: `Recibo de Compra - DonTendero #${invoice.id.slice(0, 6)}`,
                html: htmlContent,
                text: `Recibo de Compra DonTendero. Total: $${invoice.amount}`
            })
        });

        if (!response.ok) throw new Error('Failed to send');

        const result = await response.json();
        console.log("[Email Service] Result:", result);
        return true;

    } catch (error) {
        console.error("[Email Service] Error sending email:", error);
        return false;
    }
}
