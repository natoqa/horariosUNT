# Plan: Reportes (Carga Docente) — HU-019
> Fecha: 2026-05-26
> HU: HU-019 — Reporte de carga docente
> Modulo destino: `src/modules/reportes/`

## Resumen
Agregar al modulo reportes una vista visual de carga docente (tabla con resaltado) y su descarga en PDF dedicado. Actualizar la hoja "Carga Docente" del Excel existente para incluir la columna "Cursos Asignados". La pagina de reportes se organiza con tabs: Horarios | Carga Docente.

## HU y criterios de aceptacion
- **HU-019** — Reporte de carga docente

## Requerimientos aplicables
- **RF-045** — Reporte carga docente en PDF y Excel
- **RN-028** — Sin acceso fuera de permisos del rol

## Archivos a crear

### application/
- `src/modules/reportes/application/dtos/get-carga-docente.dto.ts` — Schema Zod: periodoId UUID obligatorio
- `src/modules/reportes/application/use-cases/generate-carga-docente-pdf.use-case.ts` — PDF con pdf-lib. A4 landscape. Encabezado institucional (UNT, escuela, periodo). Tabla: docente, categoria, regimen, horas asignadas, horas maximas, % carga, cursos asignados. Filas rojas >=90%, filas amarillas sin asignacion. Pie de pagina con fecha

### presentation/
- `src/modules/reportes/presentation/actions/get-carga-docente.action.ts` — Server Action director+secretaria. Carga periodo, horario, asignaciones, docentes (con categoria/regimen/cargaMaxima), grupos+cursos. Retorna array de objetos `CargaDocenteRow` para renderizar la tabla visual
- `src/modules/reportes/presentation/actions/generate-carga-docente-pdf.action.ts` — Server Action director+secretaria. Carga mismos datos, invoca use case PDF, retorna base64 + fileName
- `src/modules/reportes/presentation/components/carga-docente-report.tsx` — Componente con tabla visual: columnas (Docente, Categoria, Regimen, Horas Asig., Horas Max., % Carga, Cursos). Fila bg-red-50 si >=90%, bg-amber-50 si 0 horas. Botones "Descargar PDF" y "Descargar Excel" (Excel reutiliza la action existente)

## Archivos a modificar
- `src/modules/reportes/presentation/components/reportes-content.tsx` — Agregar navegacion por tabs: "Horarios" (contenido actual) y "Carga Docente" (nuevo componente). Extraer el contenido actual de horarios a un bloque condicional
- `src/modules/reportes/application/use-cases/generate-horario-excel.use-case.ts` — Agregar columna "Cursos Asignados" a la hoja Carga Docente. Requiere recibir mapa docenteId -> cursos[] y ampliar ExcelDocenteInfo o ExcelNameMaps
- `src/modules/reportes/index.ts` — Exportar nuevas actions

## Reutilizacion (NO crear) — SECCION CRITICA
- `pdf-lib` (npm) — Ya instalado
- `src/shared/constants/categories.ts` — CATEGORIAS_DOCENTE, REGIMENES_DOCENTE
- `src/shared/constants/time-blocks.ts` — DIAS_SEMANA, BLOQUES_HORARIOS
- `src/shared/hooks/use-auth.ts` — Autenticacion
- `src/shared/lib/supabase/server.ts` — Cliente server-side
- `src/shared/components/ui/button.tsx` — Shadcn Button
- `src/modules/reportes/presentation/actions/generate-excel.action.ts` — Reutilizar para "Descargar Excel" en carga docente (ya tiene la hoja)
- `src/modules/reportes/domain/entities/report-config.entity.ts` — CICLOS
- Patron de carga de datos de `generate-excel.action.ts` — Misma logica para cargar docentes + asignaciones + cursos

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
1. DTO get-carga-docente (application/dtos)
2. Use case generate-carga-docente-pdf (application) — PDF con pdf-lib
3. Server Action get-carga-docente (presentation/actions) — Datos para tabla visual
4. Server Action generate-carga-docente-pdf (presentation/actions)
5. Componente CargaDocenteReport (presentation/components) — Tabla visual + descargas
6. Modificar reportes-content.tsx — Tabs "Horarios" y "Carga Docente"
7. Modificar generate-horario-excel.use-case.ts — Agregar columna "Cursos Asignados"
8. Actualizar barrel exports en index.ts

## Riesgos / dudas
1. **Columna "Cursos Asignados" en tabla visual y PDF**: Se muestra como lista separada por comas (ej. "Calculo I (A), Algebra (B)"). Si un docente tiene muchos cursos, el texto puede ser largo — truncar en la tabla visual, wrap en PDF y Excel.
2. **Excel**: El boton "Descargar Excel" en la tab Carga Docente reutiliza la action `generateExcelAction` existente (que genera el workbook completo con todas las hojas). No se crea un Excel separado solo para carga docente.

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
- [ ] Tabla visual resalta >=90% en rojo y 0 horas en amarillo
- [ ] PDF incluye encabezado institucional y tabla completa
- [ ] Hoja Excel "Carga Docente" tiene columna "Cursos Asignados"
- [ ] Tabs funcionales en reportes-content (Horarios | Carga Docente)
