# Plan: Reportes (Ocupacion Aulas) — HU-020
> Fecha: 2026-05-26
> HU: HU-020 — Visualizacion de horario por aula
> Modulo destino: `src/modules/reportes/`

## Resumen
Agregar al modulo reportes una tercera tab "Ocupacion Aulas" con selector de aula, grilla semanal mostrando curso+docente en bloques ocupados, bloques libres en color diferenciado y porcentaje de ocupacion. Incluye descarga en PDF dedicado. El Excel ya tiene la hoja "Ocupacion Aulas".

## HU y criterios de aceptacion
- **HU-020** — Visualizacion de horario por aula

## Requerimientos aplicables
- **RF-046** — Reporte ocupacion de aulas en PDF y Excel
- **RN-028** — Sin acceso fuera de permisos del rol

## Archivos a crear

### application/
- `src/modules/reportes/application/use-cases/generate-ocupacion-aulas-pdf.use-case.ts` — PDF con pdf-lib. A4 landscape. Encabezado institucional, nombre del aula seleccionada, grilla semanal (dias x bloques), bloques ocupados con curso+docente, bloques libres sombreados, porcentaje de ocupacion en el encabezado

### presentation/
- `src/modules/reportes/presentation/actions/get-ocupacion-aula.action.ts` — Server Action director+secretaria. Recibe periodoId + aulaId (opcional, si no viene retorna resumen de todas). Carga asignaciones filtradas por aula, name maps (cursos, docentes). Retorna grilla de datos + porcentaje de ocupacion
- `src/modules/reportes/presentation/actions/generate-ocupacion-aulas-pdf.action.ts` — Server Action director+secretaria. Genera PDF de un aula especifica, retorna base64 + fileName
- `src/modules/reportes/presentation/components/ocupacion-aulas-report.tsx` — Componente con: selector de aula (dropdown), KPIs (total aulas, promedio ocupacion), grilla semanal del aula seleccionada (bloques ocupados muestran curso+docente, libres en bg-muted/20), badge con % ocupacion. Botones PDF y Excel

## Archivos a modificar
- `src/modules/reportes/presentation/components/reportes-content.tsx` — Agregar tercera tab "Ocupacion Aulas" al array de tabs. Renderizar `OcupacionAulasReport` cuando activa
- `src/modules/reportes/index.ts` — Exportar nuevas actions

## Reutilizacion (NO crear) — SECCION CRITICA
- `pdf-lib` (npm) — Ya instalado
- `src/shared/constants/time-blocks.ts` — DIAS_SEMANA, BLOQUES_HORARIOS, DiaSemana, BloqueHorario
- `src/shared/hooks/use-auth.ts` — Autenticacion
- `src/shared/lib/supabase/server.ts` — Cliente server-side
- `src/shared/components/ui/button.tsx` — Shadcn Button
- `src/modules/reportes/application/dtos/get-carga-docente.dto.ts` — Reutilizar schema (periodoId UUID). No crear DTO nuevo
- `src/modules/reportes/presentation/actions/generate-excel.action.ts` — Reutilizar para boton "Descargar Excel" (ya tiene hoja Ocupacion Aulas)
- Patron de `carga-docente-report.tsx` — Misma estructura: estado idle → load → tabla + descargas

## Constantes nuevas
Ninguna.

## Dependencias npm nuevas
Ninguna.

## Paginas por rol
| Rol | Pagina | Estado |
|---|---|---|
| director | `app/(dashboard)/director/reportes/page.tsx` | Ya existe |
| secretaria | `app/(dashboard)/secretaria/reportes/page.tsx` | Ya existe |

## Orden de implementacion
1. Use case generate-ocupacion-aulas-pdf (application)
2. Server Action get-ocupacion-aula (presentation/actions)
3. Server Action generate-ocupacion-aulas-pdf (presentation/actions)
4. Componente OcupacionAulasReport (presentation/components)
5. Modificar reportes-content.tsx — Tab "Ocupacion Aulas"
6. Actualizar barrel exports en index.ts

## Riesgos / dudas
1. **Grilla semanal por aula**: La grilla es 6 dias x 14 bloques = 84 celdas. Cada celda muestra curso+docente o esta vacia (libre). En la UI se puede hacer responsive con overflow-x-auto.
2. **Vista "todas las aulas" vs "aula individual"**: La HU dice "seleccionar un aula y ver su grilla". Se muestra primero un resumen con % ocupacion de todas las aulas, y al seleccionar una se muestra la grilla. No se crea una grilla por cada aula simultaneamente.
3. **PDF**: Se genera para el aula seleccionada (no para todas). Si el usuario quiere todas, el Excel ya tiene el resumen.

## Checklist de verificacion post-implementacion
- [ ] TypeScript compila sin errores (`npx tsc --noEmit`)
- [ ] Todas las capas respetan dependencia unidireccional
- [ ] Server Actions verifican autenticacion y rol (director + secretaria)
- [ ] Validacion Zod en todos los inputs
- [ ] Los 4 estados manejados (loading, error, empty, success)
- [ ] Sin `any`, `ts-ignore`, `as any`
- [ ] Imports cross-module solo via barrel `index.ts`
- [ ] UI en espanol, codigo en ingles
- [ ] Constantes compartidas reutilizadas (no duplicadas)
- [ ] Selector de aula funcional con lista de aulas del periodo
- [ ] Grilla semanal muestra curso+docente en bloques ocupados
- [ ] Bloques libres en color diferenciado
- [ ] Porcentaje de ocupacion visible
- [ ] Tab "Ocupacion Aulas" integrada en reportes-content
