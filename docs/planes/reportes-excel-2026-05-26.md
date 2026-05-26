# Plan: Reportes (Descarga Excel) — HU-012
> Fecha: 2026-05-26
> HU: HU-012 — Descarga de horario en Excel
> Módulo destino: `src/modules/reportes/`

## Resumen
Agregar al módulo reportes la descarga del horario en formato Excel usando ExcelJS. El archivo contiene una hoja por ciclo (grilla semanal), una hoja de resumen de carga docente y una hoja de ocupación de aulas. Accesible por director y secretaria.

## HU y criterios de aceptación
- **HU-012** — Descarga de horario en Excel

## Requerimientos aplicables
- **RF-047** — Horario en Excel con hojas por ciclo + resúmenes
- **RF-045** — Reporte carga docente (parte Excel: hoja de resumen dentro del workbook)
- **RF-046** — Reporte ocupación de aulas (parte Excel: hoja de resumen dentro del workbook)

## Archivos a crear

### application/
- `src/modules/reportes/application/dtos/generate-excel.dto.ts` — Schema Zod: periodoId UUID obligatorio
- `src/modules/reportes/application/use-cases/generate-horario-excel.use-case.ts` — Recibe asignaciones + name maps + config. Produce `Buffer` (Excel bytes) con ExcelJS. Crea: 1 hoja por ciclo con grilla semanal, hoja "Carga Docente" (docente, categoría, régimen, horas asignadas, máximo, %), hoja "Ocupación Aulas" (aula, bloques ocupados, total, % ocupación)

### presentation/
- `src/modules/reportes/presentation/actions/generate-excel.action.ts` — Server Action director+secretaria. Carga horario, asignaciones, datos enriquecidos, invoca use case, retorna Excel como base64

## Archivos a modificar
- `src/modules/reportes/presentation/components/reportes-content.tsx` — Agregar botón "Descargar Excel" junto al botón PDF. Sin filtro (Excel siempre descarga completo con todas las hojas)
- `src/modules/reportes/presentation/actions/generate-pdf.action.ts` — Cambiar verificación de rol de `!== 'director'` a `!== 'director' && !== 'secretaria'` (secretaria también debe poder descargar PDF)
- `src/modules/reportes/index.ts` — Exportar nueva action
- `.claude/rules/04-app-router.md` — Actualizar tabla de acceso: reportes ahora incluye secretaria
- `src/shared/components/layout/sidebar.tsx` — Actualizar roles de Reportes: agregar `'secretaria'`

### Páginas por rol (app router)
- `app/(dashboard)/secretaria/reportes/page.tsx` — Título: "Reportes", Subtítulo: "Genera y descarga reportes del periodo activo" (nueva — secretaria no tenía acceso antes)
- `app/(dashboard)/director/reportes/page.tsx` ✅ (ya existe)

## Reutilización (NO crear) — SECCIÓN CRÍTICA
- `src/modules/reportes/domain/entities/report-config.entity.ts` — ReportConfig, CICLOS
- `src/modules/reportes/presentation/components/reportes-content.tsx` — Se modifica, no se duplica
- `src/shared/components/ui/button.tsx` — Shadcn
- `src/shared/constants/time-blocks.ts` — DIAS_SEMANA, BLOQUES_HORARIOS
- `src/shared/hooks/use-auth.ts` — Verificación de rol
- `src/shared/lib/supabase/server.ts` — Cliente server-side
- Módulo `docentes` vía barrel — tipos Docente para enriquecer hoja de carga

## Constantes nuevas
Ninguna.

## Dependencias npm nuevas
- `exceljs` — Generación de Excel (definida en stack `00-core.md`)

## Orden de implementación
1. Instalar `exceljs` (`npm install exceljs`)
2. DTO generate-excel (application/dtos)
3. Use case generate-horario-excel (application) — construcción del workbook con ExcelJS
4. Server Action generate-excel (presentation/actions)
5. Modificar reportes-content.tsx — agregar botón Excel
6. Modificar generate-pdf.action.ts — permitir secretaria
7. Crear página secretaria/reportes
8. Actualizar sidebar (agregar secretaria a reportes)
9. Actualizar tabla de acceso en `04-app-router.md`
10. Actualizar barrel exports en index.ts

## Riesgos / dudas
1. **ExcelJS en server**: ExcelJS trabaja con `Buffer` en Node.js. Se usa en server action, sin problemas. El resultado se envía como base64 al cliente.
2. **Datos de docentes para hoja de carga**: Se necesitan campos categoría, régimen y cargaMaxima de la tabla docentes. Se consultan directamente desde Supabase en la action.

## Checklist de verificación post-implementación
- [ ] TypeScript compila sin errores (`npx tsc --noEmit`)
- [ ] Todas las capas respetan dependencia unidireccional
- [ ] Server Actions verifican autenticación y rol (director + secretaria)
- [ ] Validación Zod en todos los inputs
- [ ] Los 4 estados manejados (loading, error, empty, success)
- [ ] Sin `any`, `ts-ignore`, `as any`
- [ ] Imports cross-module solo vía barrel `index.ts`
- [ ] UI en español, código en inglés
- [ ] Constantes compartidas reutilizadas (no duplicadas)
- [ ] Páginas creadas para TODOS los roles con acceso (director + secretaria)
- [ ] Excel contiene hojas por ciclo + carga docente + ocupación aulas
- [ ] Cada hoja tiene encabezados, bordes y formato
- [ ] Sidebar actualizado con secretaria en reportes
- [ ] `exceljs` instalado como dependencia
