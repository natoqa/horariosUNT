---
description: Clean Architecture, independencia de módulos y dependencias entre módulos
paths:
  - "src/modules/**"
---

# Arquitectura Module-First + Clean Architecture

## Capas (dependencia unidireccional)
`domain/` → `application/` → `infrastructure/` → `presentation/`
- **domain/**: Entidades puras TypeScript. SIN dependencias de frameworks, Supabase, React ni Next.js.
- **application/**: Use cases + DTOs Zod. Solo importa de domain.
- **infrastructure/**: Repositorios Supabase. Importa de domain y application.
- **presentation/**: Server Actions + componentes React. Importa de todas las capas internas.

## Independencia de módulos
- Un módulo SOLO importa de: sí mismo, `shared/`, o el `index.ts` de otro módulo.
- NUNCA importar archivos internos de otro módulo (ej. `modules/x/domain/...`).
- Cada módulo exporta lo público vía barrel `index.ts`.

## Dependencias entre módulos
| Módulo | Depende de |
|---|---|
| auth | — (base) |
| periodos | auth |
| docentes | auth, periodos |
| cursos | auth, periodos |
| aulas | auth, periodos |
| disponibilidad | auth, periodos, docentes |
| horarios | auth, periodos, docentes, cursos, aulas, disponibilidad |
| reportes | horarios, docentes, cursos, aulas |
| dashboard | horarios, docentes, cursos, aulas |
| auditoria/notificaciones | transversales (escuchan a los demás) |
