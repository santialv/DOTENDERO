import { BusinessInfo } from "@/types/business";

export interface InvoiceData {
    id: string;
    customerName: string;
    customerEmail?: string;
    additionalEmail?: string;
    amount: number;
    date: string;
    items: any[];
    businessInfo?: BusinessInfo; // Added businessInfo
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

        const b = invoice.businessInfo;
        const brandColor = "#13ec80";
        const darkColor = "#111827";
        const lightGray = "#f9fafb";

        const itemsHtml = invoice.items.map(item => {
            const qty = item.quantity || 1;
            const price = item.finalPrice || item.price || 0;
            const total = qty * price;
            return `
                <tr>
                    <td style="padding: 12px 8px; border-bottom: 1px solid #edf2f7; text-align: left;">
                        <div style="font-weight: 600; color: ${darkColor};">${item.name || 'Producto'}</div>
                        <div style="font-size: 11px; color: #718096; margin-top: 2px;">Ref: ${item.id?.slice(0, 8) || 'N/A'}</div>
                    </td>
                    <td style="padding: 12px 8px; border-bottom: 1px solid #edf2f7; text-align: center; color: #4a5568;">${qty}</td>
                    <td style="padding: 12px 8px; border-bottom: 1px solid #edf2f7; text-align: right; font-weight: 600; color: ${darkColor};">$${total.toLocaleString()}</td>
                </tr>
            `;
        }).join('');

        const htmlContent = `
            <!DOCTYPE html>
            <html>
            <head>
                <meta charset="utf-8">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                <title>Recibo de Compra DonTendero</title>
            </head>
            <body style="margin: 0; padding: 0; background-color: #f4f7f6; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; -webkit-font-smoothing: antialiased;">
                <table border="0" cellpadding="0" cellspacing="0" width="100%" style="table-layout: fixed;">
                    <tr>
                        <td align="center" style="padding: 40px 10px;">
                            <table border="0" cellpadding="0" cellspacing="0" width="100%" style="max-width: 600px; background-color: #ffffff; border-radius: 24px; overflow: hidden; box-shadow: 0 10px 25px rgba(0,0,0,0.05);">
                                <!-- Header -->
                                <tr>
                                    <td style="padding: 40px 40px 30px; background-color: ${darkColor};">
                                        <table border="0" cellpadding="0" cellspacing="0" width="100%">
                                            <tr>
                                                <td>
                                                    ${b?.logoUrl
                ? `<img src="${b.logoUrl}" alt="Logo" style="height: 40px; width: auto; display: block;">`
                : `<span style="color: ${brandColor}; font-size: 24px; font-weight: 800; letter-spacing: -1px;">DonTendero</span>`
            }
                                                </td>
                                                <td align="right">
                                                    <span style="color: rgba(255,255,255,0.6); font-size: 12px; font-weight: 600; text-transform: uppercase; letter-spacing: 1px;">Recibo de Venta</span>
                                                </td>
                                            </tr>
                                        </table>
                                    </td>
                                </tr>

                                <!-- Hero Section -->
                                <tr>
                                    <td style="padding: 40px 40px 20px;">
                                        <h1 style="margin: 0; font-size: 28px; font-weight: 800; color: ${darkColor}; letter-spacing: -0.025em;">
                                            $${invoice.amount.toLocaleString()}
                                        </h1>
                                        <p style="margin: 8px 0 0; font-size: 14px; color: #64748b;">
                                            Pagado exitosamente a <strong>${b?.name || 'DonTendero'}</strong>
                                        </p>
                                    </td>
                                </tr>

                                <!-- Transaction Details -->
                                <tr>
                                    <td style="padding: 0 40px 30px;">
                                        <div style="background-color: ${lightGray}; border-radius: 16px; padding: 20px;">
                                            <table border="0" cellpadding="0" cellspacing="0" width="100%">
                                                <tr>
                                                    <td style="padding-bottom: 12px;">
                                                        <span style="font-size: 11px; text-transform: uppercase; letter-spacing: 0.5px; color: #94a3b8; font-weight: 700;">Cliente</span><br>
                                                        <span style="font-size: 14px; color: ${darkColor}; font-weight: 600;">${invoice.customerName}</span>
                                                    </td>
                                                    <td align="right" style="padding-bottom: 12px;">
                                                        <span style="font-size: 11px; text-transform: uppercase; letter-spacing: 0.5px; color: #94a3b8; font-weight: 700;">Fecha</span><br>
                                                        <span style="font-size: 14px; color: ${darkColor}; font-weight: 600;">${new Date(invoice.date).toLocaleDateString()}</span>
                                                    </td>
                                                </tr>
                                                <tr>
                                                    <td>
                                                        <span style="font-size: 11px; text-transform: uppercase; letter-spacing: 0.5px; color: #94a3b8; font-weight: 700;">Factura</span><br>
                                                        <span style="font-size: 14px; color: ${darkColor}; font-weight: 600;">#${invoice.id.slice(0, 8)}</span>
                                                    </td>
                                                    <td align="right">
                                                        <span style="font-size: 11px; text-transform: uppercase; letter-spacing: 0.5px; color: #94a3b8; font-weight: 700;">NIT Emisor</span><br>
                                                        <span style="font-size: 14px; color: ${darkColor}; font-weight: 600;">${b?.nit || 'P .O.S.'}</span>
                                                    </td>
                                                </tr>
                                            </table>
                                        </div>
                                    </td>
                                </tr>

                                <!-- Items Table -->
                                <tr>
                                    <td style="padding: 0 40px 40px;">
                                        <table border="0" cellpadding="0" cellspacing="0" width="100%">
                                            <thead>
                                                <tr>
                                                    <th style="padding: 0 8px 12px; text-align: left; font-size: 12px; color: #94a3b8; text-transform: uppercase; letter-spacing: 1px; border-bottom: 2px solid #edf2f7;">Detalle</th>
                                                    <th style="padding: 0 8px 12px; text-align: center; font-size: 12px; color: #94a3b8; text-transform: uppercase; letter-spacing: 1px; border-bottom: 2px solid #edf2f7;">Cant</th>
                                                    <th style="padding: 0 8px 12px; text-align: right; font-size: 12px; color: #94a3b8; text-transform: uppercase; letter-spacing: 1px; border-bottom: 2px solid #edf2f7;">Total</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                ${itemsHtml}
                                            </tbody>
                                        </table>
                                    </td>
                                </tr>

                                <!-- Footer Message -->
                                <tr>
                                    <td style="padding: 0 40px 40px; text-align: center;">
                                        <div style="border-top: 1px solid #edf2f7; padding-top: 30px;">
                                            <p style="margin: 0; font-size: 14px; color: #64748b; line-height: 1.6;">
                                                ¡Gracias por preferir a <strong>${b?.name || 'nuestro negocio'}</strong>!<br>
                                                Si tienes alguna pregunta sobre este recibo, contáctanos en ${b?.phone || 'nuestro local'}.
                                            </p>
                                        </div>
                                    </td>
                                </tr>

                                <!-- App Branding Footer -->
                                <tr>
                                    <td style="padding: 30px 40px; background-color: ${lightGray}; text-align: center;">
                                        <p style="margin: 0; font-size: 12px; color: #94a3b8; font-weight: 500;">
                                            Impulsado por <span style="color: #059669; font-weight: 700;">DonTendero</span> &bull; POS Inteligente
                                        </p>
                                        <p style="margin: 8px 0 0; font-size: 11px; color: #cbd5e1;">
                                            Este es un comprobante electrónico para fines informativos.
                                        </p>
                                    </td>
                                </tr>
                            </table>
                        </td>
                    </tr>
                </table>
            </body>
            </html>
        `;

        const response = await fetch('/api/send', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                to: recipients,
                subject: `Recibo de Compra: ${b?.name || 'DonTendero'} - $${invoice.amount.toLocaleString()}`,
                html: htmlContent,
                text: `Recibo de Compra ${b?.name || 'DonTendero'}. Total: $${invoice.amount}. Factura #${invoice.id.slice(0, 8)}`,
                fromName: b?.name || 'DonTendero'
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

