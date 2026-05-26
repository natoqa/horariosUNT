---
description: Analiza una o varias HU y emite un plan corto y accionable en docs/planes/
argument-hint: <HU-XXX o nombre de fase/módulo>
---

Tu trabajo es la **FASE 1 (Planificación)** del flujo de desarrollo. NO escribas código. Solo emite el plan markdown.

## Argumento del usuario

`$ARGUMENTS`

Si el argumento está vacío: lista las HU con estado `PENDING` o `READY` en `docs/HU/` y pregunta cuál planear.

## Pasos obligatorios

### 1. Identificar la(s) HU target

- Leer el archivo de fase correspondiente en `docs/HU/fase-*.md`.
- Identificar las HU específicas que se van a planificar.
- Si el usuario pide una fase completa, agrupar las HU por módulo y planificar por módulo (no por HU individual).

### 2. Validar que la HU está completa

- ¿Tiene criterios de aceptación claros?
- ¿Tiene notas técnicas si aplica (tablas existentes en BD, dependencias)?
- ¿El módulo del que depende ya está implementado? (ver tabla de dependencias en `02-module-architecture.md`).
- Si falta info crítica → preguntar al usuario antes de continuar.

### 3. Recorrer el código existente para detectar reutilización

Usar Glob + Read directos (NO subagent salvo que el módulo sea muy grande):

- `src/modules/{modulo}/` — ¿El módulo ya existe parcialmente?
- `src/shared/components/` — Componentes UI reutilizables.
- `src/shared/constants/` — Constantes existentes (ESTADOS_PERIODO, DIAS_SEMANA, BLOQUES_HORARIOS, etc.).
- `src/shared/hooks/` — Hooks reutilizables (use-auth, use-current-user, use-debounce).
- `src/shared/types/` — Tipos compartidos.
- `src/shared/lib/` — Utilidades y clientes Supabase.
- Módulos hermanos (ej. `docentes/` si vas a crear `disponibilidad/`) para copiar patrones.

### 4. Identificar roles con acceso y páginas por rol

- Consultar la **tabla de acceso módulo → roles** en `.claude/rules/04-app-router.md`.
- Identificar TODOS los roles que tienen acceso al módulo.
- Para cada rol con acceso, listar la página `app/(dashboard)/{rol}/{modulo}/page.tsx` que se debe crear.
- Si el módulo ya existe parcialmente, verificar que las páginas de TODOS los roles existan. Si faltan, incluirlas en "Archivos a crear".
- Las páginas pueden diferir en título y subtítulo según el rol (ej. docente ve "Mi Horario", director ve "Horarios").

### 5. Identificar dependencias cross-module

- Types de otros módulos necesarios (importar vía `index.ts` barrel).
- Permisos ya implementados en el módulo `auth`.
- Constantes compartidas que ya existen vs. las que hay que crear.

### 6. Consultar requerimientos y reglas de negocio

- Leer los RF y RN relevantes de `docs/requerimientos.md`.
- Cruzar con la HU para asegurar que el plan cubra todas las reglas.

### 7. Emitir el plan

Crear el archivo `docs/planes/{modulo}-{YYYY-MM-DD}.md` siguiendo la estructura de abajo.

## Estructura del plan

```markdown
# Plan: {Módulo} — {HU(s)}
> Fecha: {YYYY-MM-DD}
> HU: {lista de HUs cubiertas}
> Módulo destino: `src/modules/{modulo}/`

## Resumen
{1-2 oraciones sobre qué se va a construir}

## HU y criterios de aceptación
{Referencia a las HU — NO copiar todo, solo listar IDs y título}

## Requerimientos aplicables
{RF-XXX, RN-XXX relevantes — solo IDs y 1 línea de contexto}

## Archivos a crear
{Rutas exactas con descripción breve de cada archivo}

### domain/
- `src/modules/{modulo}/domain/entities/{entity}.entity.ts` — {descripción}
- `src/modules/{modulo}/domain/repositories/{entity}.repository.ts` — {descripción}

### application/
- `src/modules/{modulo}/application/dtos/{action}.dto.ts` — {descripción}
- `src/modules/{modulo}/application/use-cases/{action}.use-case.ts` — {descripción}

### infrastructure/
- `src/modules/{modulo}/infrastructure/supabase-{entity}.repository.ts` — {descripción}

### presentation/
- `src/modules/{modulo}/presentation/actions/{action}.action.ts` — {descripción}
- `src/modules/{modulo}/presentation/components/{component}.tsx` — {descripción}

### barrel
- `src/modules/{modulo}/index.ts` — Exports públicos

### Páginas por rol (app router)
{Una página por cada rol con acceso, según tabla en 04-app-router.md}
- `app/(dashboard)/director/{modulo}/page.tsx` — Título: "...", Subtítulo: "..."
- `app/(dashboard)/secretaria/{modulo}/page.tsx` — Título: "...", Subtítulo: "..."
- `app/(dashboard)/docente/{modulo}/page.tsx` — Título: "...", Subtítulo: "..."
{Solo incluir los roles que aplican. Titulo y subtitulo pueden variar por rol.}

## Archivos a modificar
{Ruta exacta y razón breve — ej. agregar ruta al sidebar, registrar en navegación}

## Reutilización (NO crear) — SECCIÓN CRÍTICA
{Lista de componentes, hooks, constantes, types que YA EXISTEN y se deben importar}
- `src/shared/components/ui/*` — Shadcn components
- `src/shared/constants/time-blocks.ts` — DIAS_SEMANA, BLOQUES_HORARIOS
- `src/shared/hooks/use-auth.ts` — Autenticación
- etc.

## Constantes nuevas (si aplica)
{Nuevas constantes que se deben crear en `src/shared/constants/` o en el módulo}

## Orden de implementación
{Orden estricto de creación de archivos: domain → application → infrastructure → presentation}
1. Entidad + repositorio interface (domain)
2. DTOs + use cases (application)
3. Repositorio Supabase (infrastructure)
4. Server Actions (presentation/actions)
5. Componentes UI (presentation/components)
6. Barrel exports (index.ts)
7. Integración con app (página, sidebar, navegación)

## Riesgos / dudas
{Cosas no obvias que puedan requerir decisión del usuario}

## Checklist de verificación post-implementación
- [ ] TypeScript compila sin errores (`npx tsc --noEmit`)
- [ ] Todas las capas respetan dependencia unidireccional
- [ ] Server Actions verifican autenticación y rol
- [ ] Validación Zod en todos los inputs
- [ ] Los 4 estados manejados (loading, error, empty, success)
- [ ] Sin `any`, `ts-ignore`, `as any`
- [ ] Imports cross-module solo vía barrel `index.ts`
- [ ] UI en español, código en inglés
- [ ] Constantes compartidas reutilizadas (no duplicadas)
- [ ] Páginas creadas para TODOS los roles con acceso (ver tabla en `04-app-router.md`)
```

## Lo que el plan NO debe contener

- Codigo de implementacion.
- Citas largas de las HU o requerimientos (solo referencias).
- Re-explicacion de las reglas (las reglas viven en `.claude/rules/`).
- Mas de ~150 lineas. Si crece demasiado, esta sobre-documentado.

## Al terminar

Avisar al usuario que el plan esta listo para revision, mostrarle la ruta del archivo, y esperar su confirmacion antes de cualquier implementacion. **NO ejecutar `/implementar` automaticamente.**
