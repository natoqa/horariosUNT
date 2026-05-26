# Plan: Horarios (Modificación Manual) — HU-009
> Fecha: 2026-05-26
> HU: HU-009 — Modificación manual de horario
> Módulo destino: `src/modules/horarios/` (extensión del módulo existente)

## Resumen
Agregar la capacidad de editar manualmente asignaciones del horario generado: reasignar docente, aula o bloque horario de una asignación existente, con validación de conflictos en tiempo real antes de guardar.

## HU y criterios de aceptación
- **HU-009** — Modificación manual de horario
  - Seleccionar bloque y reasignar docente, aula u horario
  - Validación en tiempo real de conflictos al intentar guardar
  - Descripción clara del conflicto si existe
  - Registro en auditoría con motivo del cambio

## Requerimientos aplicables
- **RF-036:** Modificación manual con validación en tiempo real
- **RF-037:** Resaltado visual de conflictos
- **RN-001:** No simultaneidad docente (restricción dura)
- **RN-009:** No simultaneidad aula (restricción dura)
- **RN-010:** Capacidad aula ≥ estudiantes
- **RN-011/012:** Compatibilidad tipo aula
- **RN-015:** Cursos mismo ciclo no se superponen
- **RN-019:** Máx. 6h consecutivas por ciclo/día
- **RN-025:** Toda mutación se audita

## Archivos a crear

### application/
- `src/modules/horarios/application/dtos/update-asignacion.dto.ts` — Schema Zod: asignacionId + campos opcionales (docenteId, aulaId, dia, bloque) + motivo obligatorio
- `src/modules/horarios/application/use-cases/update-asignacion.use-case.ts` — Valida DTO, carga asignación existente + resto del horario, ejecuta `validateHardConstraints` + `validateMaxConsecutiveHours`, si pasa actualiza y retorna; si no, retorna violations

### domain/ (extensión)
- Agregar método `updateAsignacion` y `findAsignacionById` al repositorio interface existente

### infrastructure/ (extensión)
- Agregar implementación de `updateAsignacion` y `findAsignacionById` al repo Supabase existente

### presentation/
- `src/modules/horarios/presentation/actions/update-asignacion.action.ts` — Server Action: auth (director) + Zod + use case + revalidate
- `src/modules/horarios/presentation/components/asignacion-edit-dialog.tsx` — Modal: muestra asignación actual, selects de docente/aula/día/bloque, panel de conflictos en tiempo real, campo motivo, botón guardar

## Archivos a modificar
- `src/modules/horarios/domain/repositories/horario.repository.ts` — Agregar `updateAsignacion` y `findAsignacionById`
- `src/modules/horarios/infrastructure/supabase-horario.repository.ts` — Implementar los nuevos métodos
- `src/modules/horarios/presentation/components/horario-grid.tsx` — Hacer celdas clickeables, abrir diálogo de edición al seleccionar una asignación
- `src/modules/horarios/presentation/components/horarios-content.tsx` — Pasar callback de refresh al grid, manejar estado post-edición
- `src/modules/horarios/index.ts` — Exportar nuevos tipos si es necesario

## Reutilización (NO crear) — SECCIÓN CRÍTICA
- `src/modules/horarios/domain/services/constraint-validator.service.ts` — `validateHardConstraints`, `validateMaxConsecutiveHours`, tipo `Violation` (YA EXISTE, reutilizar directamente)
- `src/shared/constants/time-blocks.ts` — `DIAS_SEMANA`, `BLOQUES_HORARIOS`
- `src/shared/components/ui/button.tsx`, `input.tsx`, `label.tsx`, `select.tsx`, `dialog.tsx`
- `src/shared/hooks/use-auth.ts`
- `src/shared/lib/supabase/server.ts`, `client.ts`
- `src/modules/horarios/domain/entities/horario.entity.ts` — tipos `Asignacion`, `AsignacionTipo`
- Módulos `docentes`, `cursos`, `aulas` vía barrel — para poblar los selects del diálogo

## Constantes nuevas
Ninguna necesaria.

## Orden de implementación
1. **DTO Zod** (`update-asignacion.dto.ts`) — Define validación antes del use case
2. **Extensión repository interface** — Agregar `updateAsignacion` + `findAsignacionById`
3. **Extensión Supabase repo** — Implementar los nuevos métodos
4. **Use case** (`update-asignacion.use-case.ts`) — Lógica de validación de conflictos usando constraint-validator existente
5. **Server Action** (`update-asignacion.action.ts`) — Auth + Zod + use case
6. **Diálogo de edición** (`asignacion-edit-dialog.tsx`) — UI del modal con validación en tiempo real
7. **Modificar HorarioGrid** — Hacer celdas interactivas, abrir diálogo al click
8. **Modificar HorariosContent** — Conectar refresh post-edición

## Riesgos / dudas
- **Auditoría (RN-025):** El plan contempla el campo `motivo` en el DTO. Pero el módulo `auditoria` aún no está implementado. ¿Guardamos el motivo en la tabla de asignaciones (campo nuevo) o lo dejamos para cuando auditoria esté listo? → **Propuesta:** guardar `motivo` como campo opcional en asignaciones por ahora; cuando auditoria esté listo, se conecta.
- **Carga de opciones en el diálogo:** Los selects de docente/aula necesitan cargar datos de otros módulos. Se usarán los name maps que `HorariosContent` ya carga y se pasarán al diálogo como props (sin queries adicionales). Para los IDs completos de docentes/aulas activos, se hará una carga lazy al abrir el diálogo.
- **Tipo de sesión (tipo_sesion):** La BD usa `Teórica`/`Práctica`, pero la entidad usa `teorico`/`practico`. Esto ya está mapeado en el repo existente — verificar que el update mantenga la consistencia.
- **Solo en estado "Generación":** Las modificaciones manuales solo deberían permitirse mientras el período esté en "Generación" (antes de aprobar). Período "Aprobado" o "Publicado" tiene flujo diferente (HU-023). El botón de editar se deshabilitará si el estado no es "Generación".

## Checklist de verificación post-implementación
- [ ] TypeScript compila sin errores (`npx tsc --noEmit`)
- [ ] Todas las capas respetan dependencia unidireccional
- [ ] Server Actions verifican autenticación y rol (solo director)
- [ ] Validación Zod en el input del update
- [ ] Los 4 estados manejados (loading, error, empty, success) en el diálogo
- [ ] Sin `any`, `ts-ignore`, `as any`
- [ ] Imports cross-module solo vía barrel `index.ts`
- [ ] UI en español, código en inglés
- [ ] Constraint validator existente reutilizado (no duplicado)
- [ ] Conflictos se muestran visualmente antes de guardar
- [ ] Campo motivo obligatorio en el formulario
