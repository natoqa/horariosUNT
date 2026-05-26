---
description: Reglas de Next.js App Router, páginas delgadas y Server Components
paths:
  - "src/app/**"
---

# Next.js App Router

- Las páginas en `app/` son **delgadas**: solo importan y renderizan componentes de `src/modules/`. Sin lógica de negocio.
- Server Components por defecto. `'use client'` solo cuando hay interactividad (hooks, event handlers).
- Server Actions para mutaciones. No crear endpoints REST para CRUD.
- Next.js 16 renombró middleware a `proxy.ts` para rutas protegidas y RBAC.
