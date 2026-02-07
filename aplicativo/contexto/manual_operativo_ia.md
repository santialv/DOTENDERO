# 🤖 Manual Operativo para Agentes IA (DonTendero)

## 🎯 Objetivo Principal
Mantener la estabilidad y escalabilidad del proyecto DonTendero mientras se añaden nuevas funcionalidades.
NUNCA asumas estructura o tipos. SIEMPRE consulta `contexto/` primero.

## 🛠️ Herramientas Vitales
- **Generar Tipos DB:** `npm run gen-types`
  - *Uso:* Cada vez que se modifique la base de datos (nuevas tablas/columnas).
  - *Resultado:* Actualiza `types/database.types.ts`.
- **Validar Cambios:** `.agent/workflows/pre-deploy-check.md`
  - *Uso:* Antes de decir "Terminé".

## 🚫 Prohibiciones Estrictas
1. **NO modificar `types/database.types.ts` manualmente.** Este archivo es generado automáticamente.
2. **NO usar `any` en componentes críticos.** Usa los tipos generados (`Database['public']['Tables']['...']`).
3. **NO crear archivos fuera de la estructura definida en `contexto/arquitectura.md`.**

## 💡 Flujo de Trabajo Ideal
1. Leer `contexto/arquitectura.md` y `contexto/stack_tecnologico.md`.
2. Si vas a tocar base de datos:
   a. Modificar SQL/Supabase.
   b. Ejecutar `npm run gen-types`.
   c. Usar los nuevos tipos en el código.
3. Si vas a tocar UI:
   a. Usar Tailwind con colores de marca (`text-[#13ec80]`).
   b. Verificar responsive.

## 💾 Gestión de Estado (React Query)
Para nuevos módulos, la norma es usar `@tanstack/react-query` para manejo de datos de servidor.
**Regla de Oro:** NUNCA inventes strings para las query keys. Usa siempre `queryKeys` importado de `@/lib/query-keys`.

### Ejemplo Correcto:
```typescript
import { useQuery } from '@tanstack/react-query';
import { queryKeys } from '@/lib/query-keys';
import { getProducts } from '@/actions/products';

export function useProducts(filters: any) {
  return useQuery({
    queryKey: queryKeys.products.list(filters),
    queryFn: () => getProducts(filters),
    staleTime: 1000 * 60 * 5, // 5 minutos
  });
}
```

---
**Recuerda:** Tu éxito se mide por cuántos bugs **NO** introduces.
