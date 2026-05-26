# Plan: Reportes (Descarga PDF) — HU-011
> Fecha: 2026-05-26
> HU: HU-011 — Descarga de horario en PDF
> Módulo destino: `src/modules/reportes/`

## Resumen
Crear el módulo `reportes` con la funcionalidad de generación de PDF del horario aprobado/publicado. El director puede descargar el horario completo o filtrado por ciclo, docente o aula. El PDF incluye formato institucional (logo UNT, encabezados, pie de página con fecha).

## HU y criterios de aceptación
- **HU-011** — Descarga de horario en PDF

## Requerimientos aplicables
- **RF-043** — PDF con formato institucional (logo, encabezados)
- **RF-044** — Horario completo en PDF filtrable por ciclo/docente/aula
- **RNF-001** — Generación de PDF < 10s

## Archivos a crear

### domain/
- `src/modules/reportes/domain/entities/report-config.entity.ts` — Interface ReportConfig (tipo de filtro, filterId, periodoId), tipos de filtro (`all`, `ciclo`, `docente`, `aula`)

### application/
- `src/modules/reportes/application/dtos/generate-pdf.dto.ts` — Schema Zod: periodoId UUID, filterType enum, filterId UUID opcional (requerido si filterType !== 'all')
- `src/modules/reportes/application/use-cases/generate-horario-pdf.use-case.ts` — Recibe asignaciones + name maps + config, produce un `Uint8Array` (PDF bytes) usando pdf-lib. Construye grilla semanal con header institucional, filtrada según config

### presentation/
- `src/modules/reportes/presentation/actions/generate-pdf.action.ts` — Server Action director-only. Carga horario y asignaciones del período, carga datos de filtro (docentes, cursos, aulas), invoca use case, retorna PDF como base64
- `src/modules/reportes/presentation/components/reportes-content.tsx` — Componente principal: selector de período (solo aprobado/publicado), selector de filtro (completo, por ciclo, por docente, por aula), botón "Descargar PDF", estados loading/error/empty/success
- `src/modules/reportes/presentation/components/pdf-filter-panel.tsx` — Panel de selección de filtro: radio buttons para tipo + select dinámico para el valor del filtro (carga ciclos, docentes o aulas según selección)

### barrel
- `src/modules/reportes/index.ts` — Exports públicos

### Páginas por rol (app router)
- `app/(dashboard)/director/reportes/page.tsx` — Título: "Reportes", Subtítulo: "Genera y descarga reportes del período activo"

## Archivos a modificar
Ninguno. El sidebar ya tiene la entrada de Reportes para director con href dinámico `/${role}/reportes`.

## Reutilización (NO crear) — SECCIÓN CRÍTICA
- `src/shared/components/ui/button.tsx`, `label.tsx` — Shadcn
- `src/shared/constants/time-blocks.ts` — DIAS_SEMANA, BLOQUES_HORARIOS
- `src/shared/constants/period-states.ts` — ESTADOS_PERIODO
- `src/shared/hooks/use-auth.ts` — Verificación de rol
- `src/shared/lib/supabase/server.ts` — Cliente server-side
- `src/shared/lib/supabase/client.ts` — Cliente client-side (para cargar opciones de filtro)
- `src/modules/horarios/index.ts` — Types `Horario`, `Asignacion`, `HorarioEstado`, `GenerationSummary`
- `src/modules/horarios/presentation/actions/get-horario.action.ts` — Para obtener horario y asignaciones (exportado vía barrel? verificar)

## Constantes nuevas
- `src/modules/reportes/domain/entities/report-config.entity.ts` — `REPORT_FILTER_TYPES` ('all', 'ciclo', 'docente', 'aula'), `CICLOS` array (I a X)

## Dependencias npm nuevas
- `pdf-lib` — Generación de PDF (definida en stack `00-core.md`)

## Orden de implementación
1. Instalar `pdf-lib` (`npm install pdf-lib`)
2. Entidad ReportConfig (domain)
3. DTO generate-pdf (application/dtos)
4. Use case generate-horario-pdf (application) — construcción del PDF con pdf-lib
5. Server Action generate-pdf (presentation/actions)
6. Componentes: pdf-filter-panel + reportes-content (presentation/components)
7. Barrel exports (index.ts)
8. Página `app/(dashboard)/director/reportes/page.tsx`

## Riesgos / dudas
1. **Logo UNT**: El PDF debe incluir el logo institucional (RF-043). Se necesita un archivo de imagen (PNG) del logo en `public/logo-unt.png` o similar. Si no existe, se deja un placeholder con texto "UNT" y se pide al usuario que agregue el logo. **Pregunta**: ¿Existe ya el logo o lo proporcionarás?
2. **Fuentes en pdf-lib**: pdf-lib soporta fuentes estándar (Helvetica, etc.) por defecto. Para caracteres especiales (tildes en español), se necesita embeber una fuente custom. Se usará Helvetica que soporta Latin-1 (suficiente para español).
3. **Tamaño del PDF**: Con 14 bloques x 6 días, la grilla es densa. Se usará orientación landscape y fuente pequeña para que quepa. Si el filtro es por ciclo, la grilla es más ligera.
4. **Exportar `getHorarioAction` desde barrel**: Actualmente no está exportado desde `src/modules/horarios/index.ts`. La action de reportes hará la consulta directamente a Supabase para mayor flexibilidad con filtros.

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
- [ ] PDF incluye header institucional y pie de página
- [ ] Filtro por ciclo/docente/aula funcional
- [ ] PDF generado en < 10s
- [ ] `pdf-lib` instalado como dependencia
