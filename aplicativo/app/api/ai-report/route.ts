import { createClient } from "@supabase/supabase-js";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
    try {
        const { organizationId } = await req.json();
        const apiKey = process.env.GEMINI_API_KEY;

        if (!apiKey) {
            throw new Error("API Key no encontrada en variables de entorno.");
        }

        // Initialize Supabase to fetch DATA
        // Using anon key + RLS usually relies on headers, but here we read raw data via simple lookup
        const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
        const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
        const supabase = createClient(supabaseUrl, supabaseKey);

        // 1. Fetch Real Data
        // Dashboard Stats RPC
        const { data: statsData } = await supabase.rpc('get_dashboard_stats', { p_org_id: organizationId });
        const stats = statsData?.[0] || {};

        // Context Construction
        const isEmptyData = (stats.transactions_today || 0) === 0;
        const now = new Date();
        const dateOptions: Intl.DateTimeFormatOptions = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' };
        const currentDateString = now.toLocaleDateString('es-CO', dateOptions);

        const context = {
            date: currentDateString,
            salesToday: stats.sales_today || 0,
            transactions: stats.transactions_today || 0,
            profit: stats.profit_today || 0,
            lowStock: stats.low_stock_count || 0,
            topProducts: stats.top_products || [],
            isEmptyData: isEmptyData
        };

        // 2. Call Gemini via REST (Robust Method)
        console.log("Generando reporte con Gemini REST (gemini-flash-latest)...");
        const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-flash-latest:generateContent?key=${apiKey}`;

        const prompt = `
            Eres "Don Tendero", el socio experto y paisa del dueño de esta tienda.
            
            FECHA ACTUAL: ${context.date}
            
            DATOS DEL NEGOCIO (HOY):
            ${JSON.stringify(context, null, 2)}
            
            TU MISIÓN:
            Analizar estos datos y escribir un reporte JSON.
            
            REGLAS DE PERSONALIDAD:
            - Habla MUY Paisa ("¡Quiubo pues!", "Parcero", "Hágale").
            - Sé motivador pero realista.
            
            REGLAS DE NEGOCIO:
            1. Si "isEmptyData" es true (0 ventas):
               - financial_summary: "¡Quiubo pues patrón! Apenas estamos arrancando. No veo movimientos todavía hoy, pero no se preocupe que el día es joven. ¡Vamos a vender con toda!".
               - mood: "neutral"
            2. Si hay ventas:
               - financial_summary: "Resumen corto de cómo vamos hoy (ventas y utilidad)."
               - mood: "happy" si profit > 0, "concerned" si profit <= 0.
            
            FORMATO JSON REQUERIDO (Solo devuelve el JSON, nada más):
            {
               "greeting": "Saludo paisa carismático.",
               "financial_summary": "Resumen financiero corto.",
               "clients_insight": "Consejo sobre los clientes hoy.",
               "inventory_alert": "Alerta sobre el stock o sugerencia de qué revisar.",
               "smart_tip": "Un consejo de negocio o motivacional único para hoy (NO REPETITIVO).",
               "mood": "happy" | "neutral" | "concerned"
            }
        `;

        const response = await fetch(url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                contents: [{
                    parts: [{ text: prompt }]
                }],
                generationConfig: {
                    maxOutputTokens: 800,
                    temperature: 0.7,
                    // responseMimeType: "application/json" // REMOVED: Causing issues with some models/keys
                }
            })
        });

        if (!response.ok) {
            const errText = await response.text();
            throw new Error(`Gemini API Error: ${response.status} - ${errText}`);
        }

        const data = await response.json();
        let text = data.candidates?.[0]?.content?.parts?.[0]?.text;

        if (!text) {
            throw new Error("Gemini returned empty response.");
        }

        // Clean markdown (just in case)
        text = text.replace(/```json/g, '').replace(/```/g, '').trim();

        const jsonResponse = JSON.parse(text);

        return NextResponse.json(jsonResponse);

    } catch (error: any) {
        console.error("❌ ERROR EN IA REPORT:", error?.message || error);

        // Fallback robusto en caso de error
        const fallbackTips = [
            "El que madruga Dios le ayuda, ¡abra esa reja con energía!",
            "Pa' atrás ni pa' coger impulso, socio. ¡Vamos es pa' lante!",
            "La constancia vence lo que la dicha no alcanza.",
            "Tienda bien surtida, cliente que no se olvida.",
        ];
        const randomTip = fallbackTips[Math.floor(Math.random() * fallbackTips.length)];

        return NextResponse.json({
            greeting: "¡Quiubo pues patrón!",
            financial_summary: `(Error Técnico: ${error.message || "Desconocido"}). Intente de nuevo en un ratico.`,
            clients_insight: "Trate al cliente con cariño y verá que vuelve.",
            inventory_alert: "Échele ojo a la bodega por si acaso.",
            smart_tip: randomTip,
            mood: "neutral"
        });
    }
}
