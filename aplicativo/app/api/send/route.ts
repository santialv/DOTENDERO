import { NextResponse } from 'next/server';
import { Resend } from 'resend';

// Initialize Resend with API Key (Needs to be in .env)
const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { to, subject, html, text } = body;

        if (!to || !subject) {
            return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
        }

        // Check if API Key is present
        if (!process.env.RESEND_API_KEY) {
            console.warn("RESEND_API_KEY is missing. Simulating send.");
            return NextResponse.json({ success: true, message: "Simulated (Missing Key)" });
        }

        const data = await resend.emails.send({
            from: 'DonTendero <noreply@dontendero.com>', // Needs a verified domain or use 'onboarding@resend.dev' for testing
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
