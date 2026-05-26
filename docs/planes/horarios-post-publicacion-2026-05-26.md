# Plan: Horarios (Post-publicación) — HU-023
> Fecha: 2026-05-26
> HU: HU-023 — Horario post-publicación con control de cambios
> Módulo destino: `src/modules/horarios/`

## Resumen
Habilitar la modificación de asignaciones cuando el horario está en estado "publicado". Cada cambio requiere motivo obligatorio, se registra en auditoría con datos antes/después, y se marca visualmente como cambio post-publicación. Reutiliza el diálogo de edición existente (`AsignacionEditDialog`) y la action `updateAsignacionAction`, extendiéndolos para manejar el contexto post-publicación.

## HU y criterios de aceptación
- **HU-023** — Horario post-publicación con control de cambios

## Requerimientos aplicables
- **RF-042** — Modificaciones post-publicación con motivo obligatorio
- **RN-025** — Toda mutación se audita
- **RN-027** — Cambios post-publicación con motivo + notificación
- **RF-056** — Notificación por modificación post-publicación (stub: módulo notificaciones no existe)

## Archivos a crear

### application/
- `src/modules/horarios/application/use-cases/post-publish-update.use-case.ts` — Orquesta: valida que horario esté publicado, delega validación de conflictos al UpdateAsignacionUseCase existente, luego registra en auditoría vía RegistrarAuditoriaUseCase (datos anteriores, nuevos, motivo)

### presentation/
- `src/modules/horarios/presentation/actions/post-publish-update.action.ts` — Server Action director-only. Similar a `update-asignacion.action.ts` pero adicionalmente: valida que horario esté en estado 'publicado', registra auditoría con motivo y datos before/after

## Archivos a modificar

- `src/modules/horarios/presentation/components/horarios-content.tsx` — Cambiar `editable` para también ser true cuando `horario.estado === 'publicado'` y `user.role === 'director'`. Pasar prop `isPostPublish` al diálogo para distinguir el contexto
- `src/modules/horarios/presentation/components/asignacion-edit-dialog.tsx` — Agregar prop opcional `isPostPublish: boolean`. Cuando es true: mostrar banner de advertencia "Cambio post-publicación", la action que invoca es `postPublishUpdateAction` en lugar de `updateAsignacionAction`, y el motivo muestra hint explícito sobre el registro en auditoría
- `src/modules/horarios/index.ts` — Exportar `postPublishUpdateAction`

## Reutilización (NO crear) — SECCIÓN CRÍTICA
- `src/modules/horarios/presentation/components/asignacion-edit-dialog.tsx` — Se modifica, no se duplica
- `src/modules/horarios/application/use-cases/update-asignacion.use-case.ts` — Reutilizar para validación de conflictos
- `src/modules/horarios/application/dtos/update-asignacion.dto.ts` — Mismo schema (ya incluye motivo obligatorio)
- `src/modules/horarios/domain/services/constraint-validator.service.ts` — validateHardConstraints, validateMaxConsecutiveHours
- `src/modules/auditoria/index.ts` — `RegistrarAuditoriaUseCase`, `SupabaseAuditoriaRepository`
- `src/shared/components/ui/button.tsx`, `src/shared/components/ui/label.tsx`
- `src/shared/hooks/use-auth.ts`
- `src/shared/constants/time-blocks.ts` — DIAS_SEMANA, BLOQUES_HORARIOS

## Constantes nuevas
Ninguna.

## Páginas por rol (app router)
No se crean páginas nuevas. Las 3 páginas de horarios ya existen:
- `app/(dashboard)/director/horarios/page.tsx` ✅
- `app/(dashboard)/secretaria/horarios/page.tsx` ✅
- `app/(dashboard)/docente/horarios/page.tsx` ✅

La funcionalidad se muestra condicionalmente solo para director dentro de los componentes existentes.

## Orden de implementación
1. Use case post-publish-update (application) — delega a UpdateAsignacionUseCase + registra auditoría
2. Server Action post-publish-update (presentation/actions) — director-only, carga contexto, invoca use case
3. Modificar asignacion-edit-dialog.tsx — prop `isPostPublish`, banner advertencia, switch de action
4. Modificar horarios-content.tsx — editable en publicado para director, pasar `isPostPublish`
5. Actualizar barrel exports en index.ts

## Riesgos / dudas
1. **Notificaciones (RF-056/RN-027)**: El módulo de notificaciones no existe. Se deja un TODO en el use case para enviar notificación al docente afectado cuando el módulo esté implementado.
2. **Historial de cambios**: La HU dice "se mantiene el historial de la asignación original y la modificación". El registro de auditoría con `datosAnteriores` y `datosNuevos` cumple este criterio. No se necesita tabla adicional.

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
- [ ] Edición post-publicación solo visible para director
- [ ] Motivo obligatorio (min 5 caracteres)
- [ ] Cada cambio registrado en auditoría con datos before/after y motivo
- [ ] Banner visual de advertencia "Cambio post-publicación" en el diálogo
- [ ] Validación de conflictos idéntica a la edición normal
