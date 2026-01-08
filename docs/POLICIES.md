# Políticas de Desarrollo y Arquitectura - DonTendero

Este documento define los estándares de código, flujo de trabajo y arquitectura para garantizar la escalabilidad y mantenibilidad del proyecto.

## 1. Stack Tecnológico

| Tecnología | Versión Estándar | Notas |
| :--- | :--- | :--- |
| **Framework** | Next.js 16 (App Router) | Usar Server Components por defecto. |
| **Lenguaje** | TypeScript 5 | Tipado estricto (`noImplicitAny`). |
| **UI Library** | React 19 | Hooks modernos (`use`, `useActionState`). |
| **Estilos** | Tailwind CSS 4 | Utilidades primero. Evitar CSS modules salvo excepción. |
| **Iconos** | Material Symbols | Usar `material-symbols-outlined` vía span o librería centralizada. |

## 2. Estructura de Directorios

La estructura debe ser consistente entre `web` (Landing) y `aplicativo` (Dashboard).

```
/
├── components/          # Componentes compartidos y UI Kit
│   ├── ui/              # Componentes base (Button, Input, Card)
│   └── business/        # Componentes de negocio reutilizables
├── lib/                 # Utilidades puras, constantes y helpers
├── hooks/               # Custom Hooks reutilizables
├── app/                 # Next.js App Router (Rutas y Layouts)
│   ├── (group)/         # Agrupación lógica de rutas
│   └── api/             # Endpoints de API Route Handlers
└── public/              # Assets estáticos
```

## 3. Convenciones de Nombres

| Elemento | Convención | Ejemplo |
| :--- | :--- | :--- |
| **Carpetas** | kebab-case | `components/user-profile` |
| **Archivos** | kebab-case | `user-card.tsx`, `utils.ts` |
| **Componentes** | PascalCase | `function UserCard() {...}` |
| **Funciones** | camelCase | `const calculateTotal = () => ...` |
| **Constantes** | UPPER_SNAKE_CASE | `MAX_RETRY_COUNT = 3` |

## 4. Git Workflow

- **Ramas**:
  - `main`: Código estable en producción.
  - `develop`: Rama de integración para desarrollo continuo.
  - `feat/nombre-feature`: Nuevas funcionalidades.
  - `fix/nombre-bug`: Corrección de errores.

- **Commits (Conventional Commits)**:
  - `feat:` Nueva funcionalidad.
  - `fix:` Corrección de error.
  - `refactor:` Cambio de código que no altera funcionalidad.
  - `style:` Cambios de formato (espacios, comas, etc).
  - `docs:` Cambios en documentación.

## 5. Gestión del Estado

1.  **Server State**: Preferir `React Server Components` para data fetching inicial.
2.  **Client State (URL)**: Usar URL Search Params para filtros y paginación (persistible y compartible).
3.  **Client State (Local)**: `useState` / `useReducer` para interacciones locales de UI.
4.  **Global State**: Evitar si es posible. Usar Context API solo para temas globales (Auth, Theme).

## 6. UI/UX Principles

- **Feedback Inmediato**: Mostrar estados de carga (Skeletons) y confirmaciones (Toasts).
- **Accesibilidad**: Usar etiquetas semánticas (`<button>`, `<nav>`, `<main>`) y atributos `aria` cuando sea necesario.
- **Responsive**: Diseño *Mobile-First*.
