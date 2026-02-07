# 🛠️ Stack Tecnológico Oficial de DonTendero

Este documento lista todas las tecnologías y servicios externos que componen la infraestructura de DonTendero. Cualquier agente IA debe consultar esto antes de proponer nuevas integraciones.

## 🌐 Infraestructura Core
| Servicio | Propósito | Nivel de Criticidad |
| :--- | :--- | :--- |
| **Vercel** | Hosting del Frontend (Next.js) y Serverless Functions. | 🔥 Crítico |
| **Supabase** | Base de Datos (PostgreSQL), Autenticación y Almacenamiento de Archivos. | 🔥 Crítico |
| **PostgreSQL** | Motor de base de datos relacional. Usamos Row Level Security (RLS) para seguridad. | 🔥 Crítico |

## 🖥️ Frontend (Cliente)
| Tecnología | Versión / Detalle |
| :--- | :--- |
| **Next.js** | App Router (v14+). Server Components por defecto. |
| **TypeScript** | Estricto. Tipos generados automáticamente de Supabase. |
| **Tailwind CSS** | Estilos utilitarios. **Color Principal:** `#13ec80`. |
| **React Query** | Manejo de estado asíncrono, caché y actualizaciones en tiempo real. |
| **Lucide React** | Iconografía estándar. |
| **Shadcn/UI** | Componentes base accesibles (basados en Radix UI). |

## 🧩 Integraciones de Terceros & Utilidades
| Librería/Servicio | Uso Específico |
| :--- | :--- |
| **Sentry** | Monitoreo de errores en tiempo real y performance tracking. |
| **Google Gemini (AI)** | Chatbot inteligente integrado para asistencia al usuario. |
| **jsPDF / autoTable** | Generación de facturas PDF, reportes y tirillas térmicas (80mm). |
| **Date-fns** | Manipulación de fechas (Locale: `es`, Timezone: `America/Bogota`). |
| **Recharts** | Visualización de datos y estadísticas en el Dashboard. |
| **Zod** | Validación de esquemas y formularios. |

## ⚠️ Reglas de Oro para Dependencias
1. **Minimalismo:** Antes de instalar un paquete nuevo, verifica si se puede hacer con lo existente o nativamente.
2. **Seguridad:** Revisa CVEs (vulnerabilidades conocidas) antes de añadir cualquier librería.
3. **Versiones:** Mantén las versiones fijas (`package.json` sin `^` o `~` en deps críticas) para evitar roturas silenciosas en updates automáticos.
