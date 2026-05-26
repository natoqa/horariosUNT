# Plan: Horarios (Aprobación y Publicación) — HU-010
> Fecha: 2026-05-26
> HU: HU-010 — Aprobación y publicación del horario
> Módulo destino: `src/modules/horarios/`

## Resumen
Agregar al módulo horarios la capacidad de aprobar y publicar un horario generado. El director puede aprobar (solo si no hay conflictos) y publicar (cambia el estado del período). Se incluye validación de conflictos previo a la aprobación y panel de acciones en la UI.

## HU y criterios de aceptación
- **HU-010** — Aprobación y publicación del horario

## Requerimientos aplicables
- **RF-038** — Aprobación cambia estado a "Aprobado"
- **RF-039** — Impide aprobación con conflictos pendientes
- **RF-040** — Publicación cambia estado a "Publicado"
- **RF-041** — Notificación a docentes al publicar (se deja stub, módulo notificaciones no existe aún)
- **RN-022** — Transición secuencial estricta de estados del período
- **RN-025** — Toda mutación se audita (se deja stub, módulo auditoría no existe aún)

## Archivos a crear

### application/
- `src/modules/horarios/application/dtos/approve-horario.dto.ts` — Schema Zod: horarioId UUID obligatorio
- `src/modules/horarios/application/use-cases/approve-horario.use-case.ts` — Valida que el horario esté en estado 'borrador', ejecuta validación de conflictos sobre todas las asignaciones, si hay conflictos rechaza la aprobación. Cambia estado del horario a 'aprobado' y del período a 'Aprobado'
- `src/modules/horarios/application/use-cases/publish-horario.use-case.ts` — Valida que el horario esté en estado 'aprobado'. Cambia estado del horario a 'publicado' y del período a 'Publicado'

### presentation/
- `src/modules/horarios/presentation/actions/approve-horario.action.ts` — Server Action director-only. Invoca approve use case
- `src/modules/horarios/presentation/actions/publish-horario.action.ts` — Server Action director-only. Invoca publish use case
- `src/modules/horarios/presentation/components/horario-approval-panel.tsx` — Panel con: estado actual del horario, botón Aprobar (visible en estado 'borrador' + período 'Generación'), botón Publicar (visible en estado 'aprobado' + período 'Aprobado'), confirmación antes de cada acción, muestra conflictos si los hay al intentar aprobar

## Archivos a modificar

- `src/modules/horarios/domain/repositories/horario.repository.ts` — Agregar método `updateEstado(id: string, estado: HorarioEstado): Promise<Horario>`
- `src/modules/horarios/infrastructure/supabase-horario.repository.ts` — Implementar `updateEstado`
- `src/modules/horarios/presentation/components/horarios-content.tsx` — Integrar `HorarioApprovalPanel` en el estado 'result', pasar horarioId y estado actual
- `src/modules/horarios/index.ts` — Exportar nuevos types si es necesario
- `src/modules/periodos/presentation/actions/change-state.action.ts` — Agregar revalidación de rutas de horarios (`/director/horarios`, `/secretaria/horarios`, `/docente/horarios`) al cambiar estado

## Reutilización (NO crear) — SECCIÓN CRÍTICA
- `src/shared/components/ui/button.tsx` — Botones Shadcn
- `src/shared/components/ui/alert-dialog.tsx` — Diálogo de confirmación (verificar si existe, si no usar confirm() nativo)
- `src/shared/hooks/use-auth.ts` — Para verificar rol y mostrar/ocultar botones
- `src/shared/constants/period-states.ts` — ESTADOS_PERIODO
- `src/modules/horarios/domain/entities/horario.entity.ts` — HORARIO_ESTADOS, HorarioEstado, HORARIO_ESTADO_LABELS
- `src/modules/horarios/domain/services/constraint-validator.service.ts` — validateHardConstraints, validateMaxConsecutiveHours para verificar conflictos antes de aprobar
- `src/modules/periodos/application/use-cases/change-periodo-state.use-case.ts` — Reutilizar para cambiar estado del período (ya valida transiciones)
- `src/modules/periodos/domain/entities/periodo.entity.ts` — canTransitionTo, getNextStates
- `src/modules/periodos/infrastructure/supabase-periodo.repository.ts` — Repositorio existente

## Constantes nuevas
Ninguna. Se reutilizan `HORARIO_ESTADOS` y `ESTADOS_PERIODO` existentes.

## Páginas por rol (app router)
No se crean páginas nuevas. Las 3 páginas de horarios ya existen:
- `app/(dashboard)/director/horarios/page.tsx` ✅
- `app/(dashboard)/secretaria/horarios/page.tsx` ✅
- `app/(dashboard)/docente/horarios/page.tsx` ✅

El panel de aprobación se muestra condicionalmente solo para rol director dentro de `horarios-content.tsx`.

## Orden de implementación
1. DTO approve-horario (application/dtos)
2. Método `updateEstado` en repositorio interface + implementación Supabase (domain + infrastructure)
3. Use case approve-horario (application)
4. Use case publish-horario (application)
5. Server Action approve-horario (presentation/actions)
6. Server Action publish-horario (presentation/actions)
7. Componente HorarioApprovalPanel (presentation/components)
8. Integración en horarios-content.tsx
9. Actualizar barrel exports en index.ts

## Riesgos / dudas
1. **Validación de conflictos para aprobar**: El `constraint-validator` necesita `PartialAssignment` con campos enriquecidos (ciclo, aulaCapacidad, etc.). La action de aprobación deberá cargar estos datos del mismo modo que `update-asignacion.action.ts`. ¿O se acepta que si el horario fue generado por el algoritmo, los conflictos ya están validados y solo las ediciones manuales podrían introducir conflictos? Decisión: validar siempre para garantizar RF-039.
2. **Notificaciones (RF-041)**: El módulo de notificaciones no existe. Se dejará un stub/comentario en el publish use case indicando dónde insertar la notificación cuando el módulo esté listo.
3. **Auditoría (RN-025)**: El módulo de auditoría no existe. La mutación queda sin auditoría hasta que se implemente.

## Checklist de verificación post-implementación
- [ ] TypeScript compila sin errores (`npx tsc --noEmit`)
- [ ] Todas las capas respetan dependencia unidireccional
- [ ] Server Actions verifican autenticación y rol (director-only)
- [ ] Validación Zod en todos los inputs
- [ ] Los 4 estados manejados (loading, error, empty, success)
- [ ] Sin `any`, `ts-ignore`, `as any`
- [ ] Imports cross-module solo vía barrel `index.ts`
- [ ] UI en español, código en inglés
- [ ] Constantes compartidas reutilizadas (no duplicadas)
- [ ] Páginas creadas para TODOS los roles con acceso (ver tabla en `04-app-router.md`)
- [ ] Botón Aprobar solo visible para director y solo cuando horario está en 'borrador'
- [ ] Botón Publicar solo visible para director y solo cuando horario está en 'aprobado'
- [ ] Aprobación rechazada si hay conflictos (RF-039)
- [ ] Estado del período cambia junto con el estado del horario
