import { NextResponse } from 'next/server';
import { Resend } from 'resend';

// Initialize Resend with API Key only if present (prevents build errors)
const resend = process.env.RESEND_API_KEY ? new Resend(process.env.RESEND_API_KEY) : null;

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { to, subject, html, text, fromName } = body;

        if (!to || !subject) {
            return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
        }

        // Check if API Key and resend instance are present
        if (!resend) {
            console.warn("RESEND_API_KEY is missing. Simulating send.");
            return NextResponse.json({ success: true, message: "Simulated (Missing Key)" });
        }

        const senderName = fromName || 'DonTendero';
        const data = await resend.emails.send({
            from: `${senderName} <noreply@dontendero.com>`,
            to: Array.isArray(to) ? to : [to],
            subject: subject,
            html: html,
            text: text
        });

        return NextResponse.json(data);
    } catch (error) {
        console.error("Email Error:", error);
        return NextResponse.json({ error: 'Failed to send email' }, { status: 500 });
    }
}
