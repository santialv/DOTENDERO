"use client";

import { useEffect, useState } from "react";
import { getWompiSignature } from "@/app/actions/wompi";
import { useToast } from "@/components/ui/toast";

interface WompiButtonProps {
    amount: number;
    className?: string;
}

export const WompiButton = ({ amount, className }: WompiButtonProps) => {
    const { toast } = useToast();
    const [loading, setLoading] = useState(true);
    const [paymentParams, setPaymentParams] = useState<string>("");

    useEffect(() => {
        let mounted = true;

        const preparePayment = async () => {
            if (!amount || amount <= 0) return;
            setLoading(true);

            try {
                const response = await getWompiSignature(amount);

                if (!mounted) return;

                if (response.success && response.data) {
                    const { publicKey, currency, amountInCents, reference, integritySignature } = response.data;

                    // Dynamically determine redirect URL (current page)
                    // We replace 'localhost' with '127.0.0.1' because Wompi/CloudFront often blocks 'localhost' in params
                    let currentUrl = window.location.href.split('?')[0];
                    if (currentUrl.includes('localhost')) {
                        currentUrl = currentUrl.replace('localhost', '127.0.0.1');
                    }

                    const paramsObj: Record<string, string> = {
                        "public-key": publicKey,
                        "currency": currency,
                        "amount-in-cents": amountInCents.toString(),
                        "reference": reference,
                        "signature:integrity": integritySignature,
                        "redirect-url": currentUrl
                    };

                    const params = new URLSearchParams(paramsObj);
                    setPaymentParams(params.toString());
                } else {
                    console.error("Failed to generate signature");
                }
            } catch (err) {
                console.error("Wompi signature error:", err);
            } finally {
                if (mounted) setLoading(false);
            }
        };

        preparePayment();

        return () => {
            mounted = false;
        };
    }, [amount]);

    const handlePayment = () => {
        if (!paymentParams) {
            toast("Preparando pago... intenta nuevamente", "info");
            return;
        }

        // Open in new tab with NO REFERRER to bypass localhost blocking issues on Wompi side
        // NOTE: Wompi uses the same checkout URL for Sandbox and Production.
        // The environment is determined by the Public Key prefix (pub_test_ vs pub_prod_).
        const url = `https://checkout.wompi.co/p/?${paymentParams}`;
        window.open(url, '_self'); // '_self' to keep flow in same tab if preferred, or '_blank'
    };

    return (
        <button
            onClick={handlePayment}
            disabled={loading || !paymentParams}
            className={`w-full max-w-[300px] h-[45px] bg-[#2C2A49] hover:bg-[#1f1d35] text-white font-bold rounded-lg shadow-md transition-all flex items-center justify-center gap-3 ${className}`}
        >
            {/* Wompi-style button */}
            {loading ? (
                <>
                    <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
                    <span className="text-sm">Cargando...</span>
                </>
            ) : (
                <>
                    <span>Pagar con Wompi</span>
                    <span className="material-symbols-outlined text-sm">shield_lock</span>
                </>
            )}
        </button>
    );
};
