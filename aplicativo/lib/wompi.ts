
import crypto from 'crypto-js';

export interface WompiTransactionData {
    reference: string;
    amountInCents: number; // Wompi expects amounts in cents (e.g., $10000 -> 1000000)
    currency: string;
    integritySignature: string;
    publicKey: string;
    redirectUrl?: string; // Optional: for web checkout return
}

/**
 * Utility class for handling Wompi payment integration logic.
 */
export class WompiService {
    private publicKey: string;
    private integritySecret: string;
    private isProduction: boolean;

    constructor() {
        this.publicKey = process.env.NEXT_PUBLIC_WOMPI_PUBLIC_KEY || '';
        this.integritySecret = process.env.WOMPI_INTEGRITY_SECRET || '';
        this.isProduction = !this.publicKey.includes('pub_test_');

        if (!this.publicKey || !this.integritySecret) {
            console.warn("WompiService: Missing environment variables (NEXT_PUBLIC_WOMPI_PUBLIC_KEY or WOMPI_INTEGRITY_SECRET)");
        }
    }

    /**
     * Generates a unique reference code for the transaction.
     * Format: DT-{TIMESTAMP}-{RANDOM}
     */
    public generateReference(): string {
        const timestamp = Date.now();
        const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
        return `DT-${timestamp}-${random}`;
    }

    /**
     * Generates the integrity signature required by Wompi.
     * Formula: SHA256(Reference + AmountInCents + Currency + IntegritySecret)
     */
    public generateSignature(reference: string, amountInCents: number, currency: string = 'COP'): string {
        const rawString = `${reference}${amountInCents}${currency}${this.integritySecret}`;
        const signature = crypto.SHA256(rawString).toString(crypto.enc.Hex);
        return signature;
    }

    /**
     * Prepares the full data object needed for the frontend widget or checkout.
     */
    public prepareTransaction(amount: number, currency: string = 'COP'): WompiTransactionData {
        // Prepare data
        const reference = this.generateReference();
        const amountInCents = Math.round(amount * 100); // Convert to cents
        const signature = this.generateSignature(reference, amountInCents, currency);

        return {
            reference,
            amountInCents,
            currency,
            integritySignature: signature,
            publicKey: this.publicKey
        };
    }

    /**
     * Verifies a transaction status via Wompi API.
     */
    public async verifyTransaction(id: string): Promise<any> {
        const baseUrl = this.isProduction
            ? 'https://production.wompi.co/v1/transactions'
            : 'https://sandbox.wompi.co/v1/transactions';

        try {
            const response = await fetch(`${baseUrl}/${id}`, {
                cache: 'no-store',
                headers: {
                    'Accept': 'application/json'
                }
            });
            const data = await response.json();
            return data.data;
        } catch (error) {
            console.error("WompiService: Error verifying transaction:", error);
            return null;
        }
    }
}

export const wompiService = new WompiService();
