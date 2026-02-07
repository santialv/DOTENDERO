---
description: Run this check before confirming any major changes or deployment.
---

# Pre-Deploy Safety Check (El Guardián de Estabilidad)

Cada vez que realices cambios significativos (especialmente en lógica central, base de datos o autenticación), EJECUTA ESTOS PASOS OBLIGATORIAMENTE.
Tu objetivo es detectar regresiones ANTES de que el usuario las sufra.

## 1. Validación de Tipos (TypeScript)
Verifica que no has roto las definiciones de tipos en ninguna parte del proyecto.
// turbo
```bash
npx tsc --noEmit
```
- **Si falla:** NO DESPLEGAR. Corrige los errores de tipo primero. Los errores de tipo suelen esconder bugs graves en runtime.

## 2. Construcción de Producción (Next.js Build)
Simula el proceso de despliegue real para asegurar que todas las páginas se pueden generar.
// turbo
```bash
npm run build
```
- **Si falla:** NO DESPLEGAR. Lee el error detenidamente. Puede ser una página que usa datos dinámicos sin `suspense` o un error de sintaxis oculto.

## 3. Verificación Visual (Smoke Test Manual)
- [ ] Abre `http://localhost:3000`
- [ ] Navega a las páginas afectadas por tus cambios.
- [ ] Intenta romperlas (clicks rápidos, inputs vacíos, refrescar página).
- [ ] Revisa la consola del navegador (F12) en busca de errores rojos.

## 4. Limpieza (Opcional)
Si modificaste la base de datos o migraciones:
- [ ] Asegúrate de que los cambios son reversibles o seguros.
- [ ] Verifica que los tipos generados de Supabase (`types/database.types.ts`) están actualizados si es necesario.

---
**Recuerda:** Es mejor tardar 5 minutos más verificando que tumbar la aplicación en producción.
