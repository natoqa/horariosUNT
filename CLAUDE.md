# CLAUDE.md — Horarios Académicos UNT

## Proyecto
Sistema Inteligente de Gestión y Generación Automática de Horarios Académicos
Escuela Profesional de Ingeniería de Sistemas — Universidad Nacional de Trujillo

## Reglas automáticas (`.claude/rules/`)
Las reglas se cargan automáticamente según el contexto:

| # | Rule | Tipo | Carga cuando... |
|---|---|---|---|
| 00 | `00-core.md` | always | Siempre |
| 01 | `01-code-conventions.md` | always | Siempre |
| 02 | `02-module-architecture.md` | path | Tocas `src/modules/**` |
| 03 | `03-ui-guidelines.md` | path | Tocas `src/**/presentation/**`, `src/**/components/**` |
| 04 | `04-app-router.md` | path | Tocas `src/app/**` |
| 05 | `05-security.md` | path | Tocas `src/modules/auth/**`, proxy, layout |
| 06 | `06-database.md` | path | Tocas `src/**/infrastructure/**` |
| 07 | `07-algorithm.md` | path | Tocas `src/modules/horarios/**` |
| 08 | `08-validation.md` | path | Tocas `src/**/dtos/**`, `src/**/actions/**` |

## Skills (`.claude/skills/`)
Flujo de desarrollo en 2 fases:

| Skill | Fase | Descripción |
|---|---|---|
| `/planificar` | 1 — Plan | Analiza HU + código existente → emite plan en `docs/planes/` |
| `/implementar` | 2 — Implementar | Ejecuta el plan paso a paso (domain → app → infra → presentation) |

**Flujo:** `/planificar <HU o módulo>` → revisar plan → `/implementar <plan>`

## Documentación detallada (`docs/`)
- `docs/requerimientos.md` — RF-001 a RF-062, RNF, RN-001 a RN-032
- `docs/algoritmo.md` — Algoritmo CSP completo y sistema de puntuación
- `docs/workflows-seguridad-roadmap.md` — Flujos, permisos, roadmap
- `docs/contexto.md` — Problema, objetivos, actores
- `docs/HU/` — Historias de usuario por fase
- `docs/planes/` — Planes de implementación generados por `/planificar`
- `PLANNING.md` — Índice de progreso
- `TEAM.md` — Distribución de trabajo del equipo
