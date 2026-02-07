# Arquitectura de DonTendero & Guía para Agentes IA

Este documento define la estructura, estándares y reglas de oro para el desarrollo de DonTendero. **Cualquier Agente IA debe leer esto antes de realizar cambios estructurales.**

## 1. Misión del Proyecto
Crear una aplicación de gestión para tenderos de barrio que sea:
- **Resiliente:** No puede fallar en medio de una venta.
- **Escalable:** Debe soportar miles de transacciones y usuarios.
- **Intuitiva:** Diseño visual premium (Verde #13ec80) y UX simple.

## 2. Stack Tecnológico
- **Frontend:** Next.js 14+ (App Router).
- **Backend/DB:** Supabase (PostgreSQL + Auth + Storage).
- **Styling:** TailwindCSS (Evitar CSS modules o styled-components).
- **Estado:** React Hooks + React Query (TanStack Query) para datos de servidor.
- **Lenguaje:** TypeScript Estricto (Prohibido `any` sin justificación extrema).

## 3. Reglas de Estabilidad (IA-Proofing)

### A. Separación de Responsabilidades
- **Componentes (`components/`)**: SOLO renderizan UI. No deben contener lógica de negocio compleja ni queries directos gigantes.
- **Hooks (`hooks/`)**: Aquí vive la lógica de estado, efectos y llamadas a Supabase.
- **Utilidades (`utils/` o `lib/`)**: Funciones puras (cálculos, formateo, exportaciones). **Testear estas funciones es prioridad.**

### B. Manejo de Errores (Defensa en Profundidad)
- Cada Page (`page.tsx`) crítica debe tener su propio `error.tsx` para aislar fallos.
- NUNCA dejar un `catch (e)` vacío. Siempre reportar o mostrar toast al usuario.
- Validar existencia de datos antes de acceder a propiedades anidadas (ej: `user?.profile?.name ?? 'Anon'`).

### C. Estilos y Diseño
- **Color Principal:** `#13ec80` (Usar variable `primary` o clase `text-[#13ec80]`).
- **Diseño Responsivo:** Mobile-first es obligatorio. La mayoría de usuarios usan celular.
- **Feedback:** Toda acción (guardar, borrar) debe tener feedback visual (Toast, Loader).

## 4. Estructura de Directorios Clave
- `/app`: Rutas del navegador.
- `/components`: Bloques de construcción de UI.
  - `/ui`: Componentes base (Botones, Inputs) reutilizables.
  - `/pos`, `/caja`, `/inventario`: Componentes específicos de dominio.
- `/lib`: Configuración de clientes externos (Supabase, API).
- `/types`: Definiciones TypeScript globales (Base de datos).
- `/contexto`: Documentación y reglas para IAs (TÚ ESTÁS AQUÍ).

## 5. Protocolo de Modificación
1. **Leer:** Entender el componente y sus dependencias.
2. **Planear:** Si vas a cambiar lógica, verifica si afecta a otros componentes.
3. **Cambiar:** Aplica cambios pequeños e iterativos.
4. **Verificar:**
   - ¿Compila? (`npm run build`).
   - ¿Se rompieron los tipos?
   - ¿El diseño sigue siendo consistente?

## 6. Comandos Críticos
- `npm run dev`: Iniciar servidor local.
- `npm run build`: Verificar compilación de producción (¡Ejecutar antes de confirmar!).
- `npm run lint`: Buscar errores de estilo/código.

---
**Nota para la IA:** Tu prioridad #1 es NO DAÑAR lo que ya funciona. Si tienes dudas, prefiere la estabilidad sobre la novedad.
