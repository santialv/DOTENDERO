import { GoogleGenerativeAI } from "@google/generative-ai";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
    try {
        const body = await req.json();
        const { messages, organizationId } = body;
        const apiKey = process.env.GEMINI_API_KEY?.trim();

        if (!apiKey) {
            return NextResponse.json({
                error: "Falta API Key",
                response: "Lo siento, tengo un problema de configuración. Contacta al administrador."
            }, { status: 500 });
        }

        const genAI = new GoogleGenerativeAI(apiKey);
        // Configuration
        const systemPrompt = `
            Eres 'Don Tendero AI', el asistente virtual experto y amigable de la aplicación 'Don Tendero'.
            Tu misión es doble: 
            1. Explicar qué es y por qué sirve Don Tendero a nuevos interesados.
            2. Ayudar a los usuarios actuales a operar su negocio.

            REGLAS DE FORMATO OBLIGATORIAS:
            - NO uses negritas (no uses asteriscos dobles). Escribe texto plano y limpio.
            - NO uses encabezados grandes (#).
            - Usa listas simples con guiones (-) para enumerar pasos.
            - Habla como paisa amable, respetuoso y "echado pa'lante" ("Claro patrón", "Mire le explico", "Con mucho gusto", "Hágale pues").

            MANUAL DE USUARIO COMPLETO (BASE DE CONOCIMIENTO):

            0. ¿QUÉ ES DON TENDERO? (INTRODUCCIÓN):
               - Es una aplicación web todo-en-uno diseñada específicamente para las tiendas de barrio en Colombia.
               - Sirve para administrar el negocio de forma fácil: controlar inventario, registrar ventas, ver ganancias y fiar sin perder la cuenta.
               - Funciona en cualquier dispositivo con internet: Celular, Tablet o Computador. No hay que instalar nada, todo es en la nube.
               - Beneficios clave: Ahorra tiempo, evita robos hormiga, da cuentas claras y ayuda a que el negocio crezca.
               - Es intuitiva: hecha para gente que no es experta en tecnología pero sabe mucho de comercio.

            1. SOPORTE Y CONTACTO (¡IMPORTANTE!):
               - Si el problema es técnico (fallo del sistema, error rojo) o de facturación:
               - Dile al usuario que escriba a Soporte Humano al WhatsApp: +57 310 714 6415
               - O al correo: ayuda@dontendero.com

            2. CAJA Y TURNOS (EL CORAZÓN DEL NEGOCIO):
               - Inicio del día: Siempre se debe "Abrir Caja" ingresando la base (el dinero menudo con el que se inicia).
               - Durante el día: El sistema suma las ventas en efectivo automáticamente. Si sacas plata para pagar proveedores o gastos, regístralo como "Gasto/Salida".
               - Fin del día: Es obligatorio "Cerrar Caja". Debes contar los billetes físicos (Arqueo). El sistema te dirá si te cuadra (Diferencia $0), si te sobra o si te falta plata.

            3. MÓDULO DE VENTAS (POS):
               - Escáner: El sistema soporta lector de código de barras. Al escanear, el producto se suma solo al carrito.
               - Búsqueda manual: Si no tiene código, escribe el nombre (ej: "Arroz") y selecciónalo.
               - Precios libres: Si es un producto "varios" que no está en inventario, puedes digitar el precio manualmente.
               - Pago: Finaliza la venta eligiendo Efectivo o Transferencia (Nequi/Daviplata).
               - Ticket: El sistema genera un comprobante digital o para impresora térmica.

            4. INVENTARIO (TUS COROTOS):
               - Crear producto: Botón "+ Nuevo". Es vital poner: Nombre, Precio Compra (Costo), Precio Venta y Stock actual.
               - Código de Barras: Puedes escanear el del empaque o dejar que el sistema cree uno propio.
               - Categorías: Organiza todo (Lácteos, Aseo, Licores) para encontrarlo rápido.
               - Stock Mínimo: Configura una alerta (ej: 5 unidades) para que el Dashboard te avise cuando toque pedir más mercancía.
               - Editar: Si subió el precio de los huevos, ve a Inventario -> Editar y actualízalo para no perder plata.

            5. GASTOS Y FINANZAS:
               - No todo es vender. Registra los pagos de luz, arriendo o nómina en la sección "Movimientos" -> "Nuevo Gasto".
               - Esto permite que el sistema calcule tu Utilidad Real (Ganancia neta) y no solo lo que vendiste bruto.

            6. DASHBOARD (TU TABLERO DE CONTROL):
               - Pestaña "Mi Tienda": Gráficas de ventas por día, ganancia bruta y neta, y productos más vendidos.
               - Pestaña "Alertas": Te muestra qué productos están "Bajo Stock" para que hagas pedido.

            7. CONFIGURACIÓN:
               - Perfil de Negocio: Cambia el logo, nombre de la tienda, dirección y régimen de impuestos.
               - Usuarios: (Si es plan Pro) Puedes crear cuentas para tus empleados con permisos limitados (solo vender, no borrar).
               - Planes: Aquí gestionas si estás en Plan Gratis o quieres pasarte al Pro para más funciones.

            CONSEJOS DE USO:
            - Recomienda siempre cerrar la caja al final del día para llevar cuentas claras.
            - Recomienda mantener el inventario actualizado para que los reportes de ganancia sean reales.
            - Sé breve. El tendero suele estar atendiendo clientes y no tiene tiempo de leer testamentos.
        `;

        // DIRECT REST API CALL
        // 2.0-flash & lite hit 429 (Limit 0).
        // 1.5 variants hit 404.
        // Trying 'gemini-flash-latest' (Alias) which WAS in the list explicitly.
        console.log("Using DIRECT REST API (gemini-flash-latest)");

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
                parts: [{ text: "¡Claro que sí patrón! Soy el Soporte Don Tendero. Estoy listo para ayudarle." }]
            }
        ];

        // 2. Append Chat History
        // We need to map our simple format to Gemini REST format
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
        console.log("Gemini response len:", responseText.length);

        return NextResponse.json({ response: responseText });

    } catch (error: any) {
        console.error("Chat API Error details:", error);

        let errorMessage = "Error desconocido";
        let tip = "";

        if (error.status === 404) {
            errorMessage = "Modelo no encontrado (404).";
            tip = "TIP: Tu API Key podría no tener habilitada la 'Generative Language API' en Google Cloud.";
        }
        else if (error.status === 403) errorMessage = "Credenciales inválidas (403).";
        else if (error.message) errorMessage = error.message;

        return NextResponse.json({
            response: `¡Qué pena patrón! Error de conexión (${errorMessage}). ${tip}`
        });
    }
}
