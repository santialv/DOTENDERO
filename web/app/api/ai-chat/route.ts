import { NextResponse } from "next/server";

export async function POST(req: Request) {
    try {
        const body = await req.json();
        const { messages } = body;
        const apiKey = process.env.GEMINI_API_KEY?.trim();

        if (!apiKey) {
            return NextResponse.json({
                error: "Falta API Key",
                response: "Lo siento, tengo un problema de configuración. Contacta al administrador."
            }, { status: 500 });
        }

        // Configuration
        const systemPrompt = `
            Eres 'Don Tendero AI', el asistente virtual experto y amigable de la aplicación 'Don Tendero'.
            Tu misión es doble: 
            1. Explicar qué es y por qué sirve Don Tendero a nuevos interesados (estás en la Landing Page).
            2. Ayudar a resolver dudas básicas sobre la aplicación y su funcionamiento.

            REGLAS DE FORMATO OBLIGATORIAS:
            - NO uses negritas (no uses asteriscos dobles). Escribe texto plano y limpio.
            - NO uses encabezados grandes (#).
            - Usa listas simples con guiones (-) para enumerar pasos.
            - Habla como paisa amable, respetuoso y "echado pa'lante" ("Claro patrón", "Mire le explico", "Con mucho gusto", "Hágale pues").
            - Sé breve y conciso.

            MANUAL DE USUARIO Y BASE DE CONOCIMIENTO (DON TENDERO):

            0. ¿QUÉ ES DON TENDERO?:
               - Es una aplicación web todo-en-uno diseñada para tiendas de barrio en Colombia.
               - Sirve para administrar el negocio: controlar inventario, registrar ventas, ver ganancias y fiar.
               - Funciona en celular, tablet o computador. Todo en la nube.
               - Beneficios: Ahorra tiempo, evita robos hormiga, cuentas claras.
               - Es tan fácil de usar como mandar un audio de WhatsApp.

            1. PRECIOS Y PLANES (Si preguntan):
               - Plan Gratis: Ideal para probar y pequeños negocios.
               - Plan Pro: Para negocios que quieren reportes avanzados y más control.
               - Es "La caja registradora que se paga sola".

            2. SOPORTE Y CONTACTO:
               - WhatsApp de Ventas/Soporte: +57 310 714 6415
               - Correo: ayuda@dontendero.com

            3. FUNCIONES PRINCIPALES (Para explicar al cliente):
               - POS (Caja): Ventas con escáner de barras o manual. Soporta efectivo y transferencias.
               - Inventario: Alertas de bajo stock, control de costos y precios.
               - Fiados: Gestión digital de deudas. Ya no más cuadernos manchados.
               - Caja y Turnos: Abrir y cerrar caja para que la plata nunca falte.
               - Reportes: Ver cuánto ganaste al día, a la semana o al mes.

            CONSEJOS DE VENTA:
            - Invita al usuario a registrarse gratis en la web si parece interesado.
            - Resalta que es un producto hecho en Colombia para colombianos.
        `;

        // DIRECT REST API CALL
        const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-flash-latest:generateContent?key=${apiKey}`;

        // Prepare contents structure manually
        // 1. System Prompt Exchange
        const contents = [
            {
                role: 'user',
                parts: [{ text: systemPrompt + "\n\nPor favor confirma que entendiste tu rol." }]
            },
            {
                role: 'model',
                parts: [{ text: "¡Claro que sí patrón! Soy Don Tendero AI. Estoy listo para explicarle a los visitantes qué es esta maravilla de herramienta y cómo les puede cambiar la vida a sus negocios." }]
            }
        ];

        // 2. Append Chat History
        // Clean history first
        let history = messages.map((msg: any) => ({
            role: msg.role === 'assistant' ? 'model' : 'user',
            parts: [{ text: msg.content }]
        }));

        // Current question
        const lastUserMessage = history.pop();
        if (!lastUserMessage || !lastUserMessage.parts[0].text) {
            return NextResponse.json({ response: "¿En qué puedo ayudarte hoy?" });
        }

        // Filter valid history
        const firstUserIndex = history.findIndex((msg: any) => msg.role === 'user');
        if (firstUserIndex !== -1) {
            history.slice(firstUserIndex).forEach((msg: any) => contents.push(msg));
        }

        // 3. Append Current Question
        contents.push({
            role: 'user',
            parts: [{ text: lastUserMessage.parts[0].text }]
        });

        const fetchResponse = await fetch(url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                contents: contents,
                generationConfig: {
                    maxOutputTokens: 500,
                    temperature: 0.7
                }
            })
        });

        if (!fetchResponse.ok) {
            const errorText = await fetchResponse.text();
            throw new Error(`Google API Message: ${errorText}`);
        }

        const data = await fetchResponse.json();

        // Extract text safely
        const responseText = data.candidates?.[0]?.content?.parts?.[0]?.text || "Lo siento, no pude generar una respuesta.";

        return NextResponse.json({ response: responseText });

    } catch (error: any) {
        console.error("Chat API Error details:", error);
        let errorMessage = "Error desconocido";
        let tip = "";

        if (error.status === 404) {
            errorMessage = "Modelo no encontrado (404).";
            tip = "TIP: Tu API Key podría no tener habilitada la 'Generative Language API'.";
        }
        else if (error.status === 403) errorMessage = "Credenciales inválidas (403).";
        else if (error.message) errorMessage = error.message;

        return NextResponse.json({
            response: `¡Qué pena patrón! Error de conexión momentáneo (${errorMessage}). Si persiste, escríbanos al WhatsApp.`
        });
    }
}
