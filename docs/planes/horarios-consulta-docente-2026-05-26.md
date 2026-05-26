# Plan: Horarios (Consulta Docente) — HU-013
> Fecha: 2026-05-26
> HU: HU-013 — Consulta de horario publicado (Docente)
> Módulo destino: `src/modules/horarios/` (archivos nuevos dentro del módulo existente)

## Resumen
Crear la vista de consulta de horario para docentes: grilla semanal filtrada a sus asignaciones, filtro por día de la semana y descarga de horario individual en PDF. Reemplaza la vista actual del docente (que muestra el panel completo de generación) por una vista de solo lectura.

## HU y criterios de aceptación
- **HU-013** — Consulta de horario publicado (Docente)

## Requerimientos aplicables
- **RF-048** — Horario individual del docente en PDF
- **RN-028** — Sin acceso fuera de permisos del rol

## Archivos a crear

### application/
- `src/modules/horarios/application/dtos/get-docente-horario.dto.ts` — Schema Zod: periodoId UUID obligatorio
- `src/modules/horarios/application/use-cases/generate-docente-pdf.use-case.ts` — Genera PDF individual del docente con pdf-lib. A4 landscape, encabezado institucional (UNT, escuela, período, nombre docente), grilla semanal con solo sus asignaciones (curso, aula, bloque), pie de página con fecha de generación

### presentation/
- `src/modules/horarios/presentation/actions/get-docente-horario.action.ts` — Server Action (rol docente). Usa `user.id` como docente_id (mismo patrón que disponibilidad). Carga período publicado/aprobado, horario más reciente, asignaciones filtradas por docente_id, name maps (cursos, aulas, grupos)
- `src/modules/horarios/presentation/actions/generate-docente-pdf.action.ts` — Server Action (rol docente). Carga asignaciones del docente, invoca use case PDF, retorna base64 + fileName
- `src/modules/horarios/presentation/components/docente-horario-view.tsx` — Componente principal. Selector de período (Aprobado/Publicado/Cerrado), grilla semanal (reutiliza patrón de HorarioGrid pero sin edición ni filtro ciclo), filtro por día (botones Lun-Sáb + "Todos"), botón "Descargar PDF". Maneja 4 estados

## Archivos a modificar
- `app/(dashboard)/docente/horarios/page.tsx` — Usar `DocenteHorarioView` en vez de `HorariosContent`
- `src/modules/horarios/index.ts` — Exportar `DocenteHorarioView`

## Reutilización (NO crear) — SECCIÓN CRÍTICA
- `src/shared/constants/time-blocks.ts` — DIAS_SEMANA, BLOQUES_HORARIOS
- `src/shared/hooks/use-auth.ts` — Autenticación y rol
- `src/shared/lib/supabase/server.ts` — Cliente server-side
- `src/shared/lib/supabase/client.ts` — Cliente client-side (para cargar períodos)
- `src/shared/components/ui/button.tsx` — Shadcn Button
- `src/modules/horarios/domain/entities/horario.entity.ts` — Asignacion, ASIGNACION_TIPO_LABELS
- `pdf-lib` (npm) — Generación de PDF (ya instalado para reportes)
- Patrón visual de `horario-grid.tsx` — Reutilizar estructura de la tabla/grilla, colores por ciclo
- Patrón de carga de name maps de `horarios-content.tsx` — Misma lógica de cargar docentes/cursos/aulas/grupos

## Constantes nuevas
Ninguna.

## Dependencias npm nuevas
Ninguna (pdf-lib ya está instalado).

## Páginas por rol
| Rol | Página | Estado |
|---|---|---|
| docente | `app/(dashboard)/docente/horarios/page.tsx` | ✅ Existe — se modifica |

## Orden de implementación
1. DTO get-docente-horario (application/dtos)
2. Use case generate-docente-pdf (application) — PDF individual con pdf-lib
3. Server Action get-docente-horario (presentation/actions)
4. Server Action generate-docente-pdf (presentation/actions)
5. Componente DocenteHorarioView (presentation/components)
6. Modificar página docente/horarios — cambiar a DocenteHorarioView
7. Actualizar barrel exports en index.ts

## Riesgos / dudas
1. **Resolución docente_id**: El módulo `disponibilidad` usa `user.id` (UUID de auth) directamente como `docente_id` en sus queries. Se sigue el mismo patrón para filtrar asignaciones por `docente_id = user.id`. Si los IDs de la tabla `docentes` no coinciden con los UUIDs de auth, esto fallaría. Verificar en BD.
2. **Vista actual del docente**: El docente actualmente ve `HorariosContent` (panel completo con generación, aprobación, edición). Se reemplaza por `DocenteHorarioView` que es solo lectura. `HorariosContent` sigue disponible para director y secretaria.
3. **Período sin horario publicado**: Si el docente no tiene asignaciones (o el horario no está publicado), mostrar estado empty apropiado.

## Checklist de verificación post-implementación
- [ ] TypeScript compila sin errores (`npx tsc --noEmit`)
- [ ] Todas las capas respetan dependencia unidireccional
- [ ] Server Actions verifican autenticación y rol (docente)
- [ ] Validación Zod en todos los inputs
- [ ] Los 4 estados manejados (loading, error, empty, success)
- [ ] Sin `any`, `ts-ignore`, `as any`
- [ ] Imports cross-module solo vía barrel `index.ts`
- [ ] UI en español, código en inglés
- [ ] Constantes compartidas reutilizadas (no duplicadas)
- [ ] Grilla semanal muestra solo asignaciones del docente logueado
- [ ] Filtro por día funcional (Lun-Sáb + Todos)
- [ ] Descarga de PDF individual genera archivo correcto
- [ ] PDF incluye encabezado institucional y nombre del docente
- [ ] Página docente/horarios usa el nuevo componente
