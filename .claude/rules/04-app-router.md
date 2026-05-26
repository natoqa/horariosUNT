---
description: Reglas de Next.js App Router, páginas delgadas, Server Components y ruteo por rol
paths:
  - "src/app/**"
  - "app/**"
---

# Next.js App Router

- Las páginas en `app/` son **delgadas**: solo importan y renderizan componentes de `src/modules/`. Sin lógica de negocio.
- Server Components por defecto. `'use client'` solo cuando hay interactividad (hooks, event handlers).
- Server Actions para mutaciones. No crear endpoints REST para CRUD.
- Next.js 16 renombró middleware a `proxy.ts` para rutas protegidas y RBAC.

## Ruteo por rol (OBLIGATORIO)

Cada módulo necesita una página en `app/(dashboard)/{rol}/{modulo}/page.tsx` por CADA rol que tenga acceso. El sidebar usa `/${role}/...` como href, así que si la página no existe, el enlace lleva a un 404.

### Tabla de acceso módulo → roles

| Módulo | director | secretaria | docente |
|---|---|---|---|
| periodos | ✅ | — | — |
| docentes | ✅ | ✅ | — |
| cursos | ✅ | ✅ | — |
| aulas | ✅ | ✅ | — |
| disponibilidad | ✅ | — | ✅ |
| horarios | ✅ | ✅ | ✅ |
| reportes | ✅ | ✅ | — |
| dashboard | ✅ | ✅ | ✅ |
| auditoria | ✅ | — | — |

### Patrón de página

```tsx
// app/(dashboard)/{rol}/{modulo}/page.tsx
import { ModuloContent } from '@/modules/{modulo}';
import { Icon } from 'lucide-react';

export default function ModuloPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">{Título}</h1>
          <p className="text-sm text-muted-foreground mt-1">{Subtítulo según rol}</p>
        </div>
        <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
          <Icon className="w-5 h-5 text-primary" />
        </div>
      </div>
      <ModuloContent />
    </div>
  );
}
```

**Regla**: Al crear o modificar un módulo, SIEMPRE verificar que existan páginas para TODOS los roles marcados con ✅. Si falta alguna, crearla.
