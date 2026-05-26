# PLANNING.md — Índice del Proyecto

## Sistema Inteligente de Gestión y Generación Automática de Horarios Académicos
### Escuela Profesional de Ingeniería de Sistemas — UNT

**Versión:** 1.0.0 | **Fecha:** 24 de mayo de 2026 | **Estado:** En desarrollo

---

## Resumen de Progreso

| Categoría | READY | PENDING | Total |
|---|---|---|---|
| Fase 1 — Autenticación | 3 | 0 | 3 |
| Fase 2 — Gestión de Datos | 9 | 0 | 9 |
| Fase 3 — Disponibilidad y Horarios | 5 | 0 | 5 |
| Fase 4 — Reportes y Vistas | 4 | 2 | 6 |
| Fase 5 — Dashboard y Sistema | 1 | 2 | 3 |
| **TOTAL** | **22** | **4** | **26** |

---

## Documentación Detallada

La documentación completa se encuentra organizada en la carpeta `docs/`:

### Historias de Usuario (`docs/HU/`)

| Archivo | Contenido | Estado |
|---|---|---|
| `fase-1-autenticacion.md` | HU-001, HU-021, HU-025 — Login, cambio y recuperación de contraseña | ✅ 3/3 READY |
| `fase-2-gestion-datos.md` | HU-002 a HU-007, HU-017, HU-018, HU-022 — Períodos, docentes, cursos, aulas, grupos | ✅ 9/9 READY |
| `fase-3-disponibilidad-horarios.md` | HU-005, HU-008 a HU-010, HU-023 — Disponibilidad, generación, modificación, aprobación | ✅ 5/5 DONE |
| `fase-4-reportes-vistas.md` | HU-011 a HU-013, HU-019, HU-020, HU-024 — PDF, Excel, vistas por aula/ciclo/docente | ✅ 4/6 DONE |
| `fase-5-dashboard-sistema.md` | HU-014 a HU-016 — Dashboard, auditoría, notificaciones | ✅ 1/3 READY |

### Documentación Técnica (`docs/`)

| Archivo | Contenido |
|---|---|
| `contexto.md` | Descripción del proyecto, problema actual, objetivos, alcance, actores del sistema |
| `requerimientos.md` | RF-001 a RF-062, RNF-001 a RNF-008, RN-001 a RN-032 |
| `algoritmo.md` | Algoritmo CSP de 9 fases, sistema de puntuación ponderado |
| `workflows-seguridad-roadmap.md` | Workflows del sistema, estrategia de seguridad (3 niveles), matriz de permisos, diseño de dashboards, roadmap 20 semanas, escalabilidad futura |

### Reglas automáticas (`.claude/rules/`)
Arquitectura, UI, seguridad y convenciones se cargan automáticamente según el contexto de los archivos editados. Ver `CLAUDE.md` para el índice.

---

## Próximo Paso

Implementar las HUs restantes de **Fase 3** (HU-009, HU-010, HU-023):
1. HU-009 — Modificación manual de horario
2. HU-010 — Aprobación y publicación del horario
3. HU-023 — Horario post-publicación con control de cambios
