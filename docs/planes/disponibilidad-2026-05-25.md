# Plan: Disponibilidad — HU-005

> Fecha: 2026-05-25
> HU: HU-005 (Registro de disponibilidad docente)
> Modulo destino: `src/modules/disponibilidad/`

## Resumen

Modulo completo para que los docentes registren su disponibilidad horaria semanal mediante una grilla interactiva (L-S, 07:00-21:00) con 3 estados por bloque (Disponible, No disponible, Preferido). Incluye validacion de horas minimas segun regimen y restriccion de acceso solo en estado "Recopilacion" del periodo.

## HU y criterios de aceptacion

- **HU-005** — Registro de disponibilidad docente (7 criterios de aceptacion en `docs/HU/fase-3-disponibilidad-horarios.md`)

## Requerimientos aplicables

- **RF-024** — Grilla semanal interactiva (L-S, 07:00-21:00)
- **RF-025** — 3 tipos de bloque: Disponible / No disponible / Preferido
- **RF-026** — Validacion minimo de horas segun regimen docente
- **RF-027** — Solo modificable en estado "Recopilacion" del periodo
- **RN-002** — Carga maxima: DE=40h, TC=20h, TP=12h
- **RN-003** — Solo asignar en bloques con disponibilidad
- **RN-025** — Toda mutacion se audita

## Archivos a crear

### domain/
- `src/modules/disponibilidad/domain/entities/disponibilidad.entity.ts` — Interface `Disponibilidad` (id, docenteId, periodoId, dia, bloque, estado) y type `DisponibilidadEstado`
- `src/modules/disponibilidad/domain/repositories/disponibilidad.repository.ts` — Interface `IDisponibilidadRepository` (findByDocenteAndPeriodo, saveBulk)

### application/
- `src/modules/disponibilidad/application/dtos/save-disponibilidad.dto.ts` — Schema Zod para el array de bloques (dia + bloque + estado). Validacion de minimo de horas
- `src/modules/disponibilidad/application/use-cases/get-disponibilidad.use-case.ts` — Obtener disponibilidad del docente para un periodo
- `src/modules/disponibilidad/application/use-cases/save-disponibilidad.use-case.ts` — Guardar disponibilidad completa (bulk upsert). Valida estado del periodo = "Recopilacion" y minimo de horas

### infrastructure/
- `src/modules/disponibilidad/infrastructure/supabase-disponibilidad.repository.ts` — Implementa IDisponibilidadRepository. Bulk upsert via Supabase (delete + insert en la misma operacion)

### presentation/
- `src/modules/disponibilidad/presentation/actions/get-disponibilidad.action.ts` — Server Action para obtener disponibilidad. Auth: rol `docente`
- `src/modules/disponibilidad/presentation/actions/save-disponibilidad.action.ts` — Server Action para guardar. Auth: rol `docente`. Valida periodo en "Recopilacion"
- `src/modules/disponibilidad/presentation/actions/get-periodo-estado.action.ts` — Server Action para obtener el periodo activo y su estado (necesario para la UI). Auth: cualquier rol
- `src/modules/disponibilidad/presentation/components/disponibilidad-grid.tsx` — Grilla semanal interactiva. 3 estados por celda con colores diferenciados. Click cicla entre estados
- `src/modules/disponibilidad/presentation/components/disponibilidad-summary.tsx` — Resumen: horas disponibles, horas preferidas, minimo requerido, barra de progreso
- `src/modules/disponibilidad/presentation/components/disponibilidad-content.tsx` — Componente contenedor. Maneja loading/error/empty/success. Orquesta grid + summary + save

### barrel
- `src/modules/disponibilidad/index.ts` — Exports publicos (DisponibilidadContent, entity type)

## Archivos a modificar

- `src/shared/components/layout/sidebar.tsx:101-105` — La ruta ya existe (`/${role}/disponibilidad`). NO requiere cambios.

## Reutilizacion (NO crear) — SECCION CRITICA

| Recurso existente | Ruta | Uso |
|---|---|---|
| DIAS_SEMANA, BLOQUES_HORARIOS, DiaSemana, BloqueHorario | `src/shared/constants/time-blocks.ts` | Ejes de la grilla |
| ESTADOS_PERIODO, EstadoPeriodo | `src/shared/constants/period-states.ts` | Validar estado "Recopilacion" |
| REGIMENES_DOCENTE, RegimenDocente | `src/shared/constants/categories.ts` | Calcular minimo de horas |
| getCargaMaximaDefault() | `src/modules/docentes/index.ts` | Obtener carga maxima por regimen |
| Docente (type) | `src/modules/docentes/index.ts` | Referenciar regimen del docente |
| Periodo (type) | `src/modules/periodos/index.ts` | Verificar estado del periodo |
| createClient (server) | `src/shared/lib/supabase/server.ts` | Server Actions |
| createClient (client) | `src/shared/lib/supabase/client.ts` | NO usar directamente en componentes |
| useAuth | `src/shared/hooks/use-auth.ts` | Obtener usuario autenticado en cliente |
| Button, Card, etc. | `src/shared/components/ui/*` | Componentes Shadcn UI |
| **Patron grilla** | `src/modules/aulas/presentation/components/aula-restriccion-grid.tsx` | Referencia de patron: tabla con DIAS_SEMANA x BLOQUES_HORARIOS, toggle por celda, loading/saving/success |

## Constantes nuevas

- `src/modules/disponibilidad/domain/entities/disponibilidad.entity.ts` — `DISPONIBILIDAD_ESTADOS` array const (`'disponible' | 'no_disponible' | 'preferido'`) y labels en espanol para la UI. Se define en la entidad del modulo, NO en shared (es especifico de este modulo).

## Orden de implementacion

1. Entity + repository interface (domain)
2. DTO Zod + use cases (application)
3. Repositorio Supabase (infrastructure)
4. Server Actions (presentation/actions) — get-periodo-estado, get-disponibilidad, save-disponibilidad
5. Componentes UI — disponibilidad-summary, disponibilidad-grid, disponibilidad-content
6. Barrel exports (index.ts)
7. Pagina app (si existe la ruta en app router; si no, indicar al usuario)

## Riesgos / dudas

1. **Tabla `disponibilidad` en BD**: la HU dice que existe con RLS. No tenemos el schema exacto de columnas. El plan asume columnas: `id`, `docente_id`, `periodo_id`, `dia`, `bloque`, `estado`, `created_at`, `updated_at`. Si difiere, ajustar en infraestructura.
2. **Pagina app router**: no hay archivos en `src/app/` visibles actualmente. Hay que confirmar si la pagina `/docente/disponibilidad/page.tsx` ya existe o si se debe crear.
3. **Vista del Director (RF-028)**: la HU-005 es solo la vista del docente. El resumen de estado para el Director (cuantos docentes registraron, cuantos faltan) es un feature separado que podria ir en el dashboard. NO se incluye en este plan.

## Checklist de verificacion post-implementacion

- [ ] TypeScript compila sin errores (`npx tsc --noEmit`)
- [ ] Todas las capas respetan dependencia unidireccional (domain <- application <- infrastructure <- presentation)
- [ ] Server Actions verifican autenticacion y rol (`docente`)
- [ ] Server Action de save valida estado del periodo = "Recopilacion"
- [ ] Validacion Zod: array de bloques + minimo de horas segun regimen
- [ ] Los 4 estados manejados en DisponibilidadContent (loading, error, empty, success)
- [ ] Sin `any`, `ts-ignore`, `as any`
- [ ] Imports cross-module solo via barrel `index.ts` (docentes, periodos)
- [ ] UI en espanol, codigo en ingles
- [ ] Constantes DIAS_SEMANA, BLOQUES_HORARIOS reutilizadas de shared
- [ ] getCargaMaximaDefault reutilizado de docentes barrel
- [ ] Patron de grilla consistente con aula-restriccion-grid.tsx
- [ ] Click en celda cicla entre 3 estados con colores diferenciados
- [ ] Resumen muestra horas disponibles vs minimo requerido
- [ ] Boton guardar deshabilitado si horas < minimo
- [ ] Confirmacion visual al guardar exitosamente
