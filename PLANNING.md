# PLANNING.md — Índice del Proyecto

## Sistema Inteligente de Gestión y Generación Automática de Horarios Académicos
### Escuela Profesional de Ingeniería de Sistemas — UNT

**Versión:** 1.0.0 | **Fecha:** 24 de mayo de 2026 | **Estado:** En desarrollo

---

## Resumen de Progreso

| Categoría | DONE | READY | PENDING | Total |
|---|---|---|---|---|
| Fase 1 — Autenticación | 3 | 0 | 0 | 3 |
| Fase 2 — Gestión de Datos | 9 | 0 | 0 | 9 |
| Fase 3 — Disponibilidad y Horarios | 5 | 0 | 0 | 5 |
| Fase 4 — Reportes y Vistas | 6 | 0 | 0 | 6 |
| Fase 5 — Dashboard y Sistema | 3 | 0 | 0 | 3 |
| **TOTAL** | **26** | **0** | **0** | **26** |

---

## Documentación Detallada

La documentación completa se encuentra organizada en la carpeta `docs/`:

### Historias de Usuario (`docs/HU/`)

| Archivo | Contenido | Estado |
|---|---|---|
| `fase-1-autenticacion.md` | HU-001, HU-021, HU-025 — Login, cambio y recuperación de contraseña | ✅ 3/3 DONE |
| `fase-2-gestion-datos.md` | HU-002 a HU-007, HU-017, HU-018, HU-022 — Períodos, docentes, cursos, aulas, grupos | ✅ 9/9 DONE |
| `fase-3-disponibilidad-horarios.md` | HU-005, HU-008 a HU-010, HU-023 — Disponibilidad, generación, modificación, aprobación | ✅ 5/5 DONE |
| `fase-4-reportes-vistas.md` | HU-011 a HU-013, HU-019, HU-020, HU-024 — PDF, Excel, vistas por aula/ciclo/docente | ✅ 6/6 DONE |
| `fase-5-dashboard-sistema.md` | HU-014 a HU-016 — Dashboard, auditoría, notificaciones | ✅ 3/3 DONE |

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

✅ **Todas las fases completadas**

El proyecto está completo con las 26 historias de usuario implementadas:

- ✅ Fase 1 — Autenticación (3/3)
- ✅ Fase 2 — Gestión de Datos (9/9)
- ✅ Fase 3 — Disponibilidad y Horarios (5/5)
- ✅ Fase 4 — Reportes y Vistas (6/6)
- ✅ Fase 5 — Dashboard y Sistema (3/3)

**Implementaciones recientes:**
- HU-015 — Registro de auditoría con exportación a Excel
- HU-016 — Notificaciones del sistema (infrastructure + presentation completos)
- HU-024 — Visualización de horario por ciclo con detección de conflictos
- HU-014 — Dashboard ejecutivo (Director, Secretaria, Docente)
