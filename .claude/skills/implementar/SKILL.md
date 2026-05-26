---
description: Ejecuta el plan generado por /planificar paso a paso, sin re-planificar
argument-hint: <ruta-del-plan o nombre de modulo>
---

Tu trabajo es ejecutar la **FASE 2 (Implementacion)** siguiendo el plan al pie de la letra. Aplica todas las reglas de `.claude/rules/` relevantes.

## Argumento del usuario

`$ARGUMENTS`

Resolucion del argumento:
- Si es ruta a un archivo en `docs/planes/` → ese es el plan.
- Si es nombre de modulo (ej: "disponibilidad") → buscar el plan mas reciente en `docs/planes/{modulo}-*.md`. Si hay varios, preguntar cual.
- Si esta vacio → listar planes disponibles en `docs/planes/` y preguntar.

## Pasos obligatorios

### 1. Leer el plan completo

Leer el archivo de plan ANTES de tocar codigo. Entender:
- Que archivos crear y en que orden.
- Que archivos modificar.
- Que reutilizar (seccion critica).
- Que constantes nuevas crear.

### 2. Leer las HU referenciadas

Abrir el archivo de fase en `docs/HU/` y leer las HU listadas en el plan para tener los criterios de aceptacion frescos.

### 3. Leer un modulo hermano como referencia de patron

Antes de escribir codigo, leer al menos 1 archivo de cada capa de un modulo ya implementado (ej. `docentes/` o `periodos/`) para replicar el patron exacto:
- Entity, Repository interface, DTO, Use case, Supabase repository, Server Action, Component principal.

### 4. Ejecutar en orden estricto

Seguir el orden del plan (siempre domain → application → infrastructure → presentation):

1. **domain/entities/** — Entidades TypeScript puras. Sin dependencias de framework.
2. **domain/repositories/** — Interface del repositorio.
3. **application/dtos/** — Schemas Zod para validacion.
4. **application/use-cases/** — Logica de negocio. Solo importa de domain.
5. **infrastructure/** — Repositorio Supabase. Implementa la interface.
6. **presentation/actions/** — Server Actions. Verifican auth + rol + validan con Zod.
7. **presentation/components/** — Componentes React. Manejan 4 estados.
8. **index.ts** — Barrel exports publicos del modulo.
9. **Integracion** — Pagina en app/, sidebar, navegacion.

### 5. Aplicar reglas continuamente

Reglas que SIEMPRE aplican durante implementacion:
- `00-core.md` — Stack, documentacion de referencia.
- `01-code-conventions.md` — Ingles en codigo, espanol en UI, kebab-case archivos, PascalCase componentes, cero `any`, 4 estados.
- `02-module-architecture.md` — Clean Architecture, independencia de modulos, dependencias via barrel.
- `03-ui-guidelines.md` — Paleta, tipografia, layout, badges, iconos, estados.
- `04-app-router.md` — Paginas delgadas, Server Components por defecto, `use client` solo si interactividad.
- `05-security.md` — 3 niveles de seguridad, RBAC, permisos por rol.
- `06-database.md` — Supabase tipado, RLS, auditoria en mutaciones.
- `08-validation.md` — Zod en Server Actions, DTOs reutilizables.

Reglas condicionales:
- `07-algorithm.md` — Solo si se toca `src/modules/horarios/`.

### 6. Verificacion continua

Despues de crear cada capa, verificar que TypeScript compila:
```
npx tsc --noEmit
```
Corregir errores ANTES de avanzar a la siguiente capa.

### 7. Checklist final

Recorrer el checklist del plan + estos checks core antes de declarar listo:
- [ ] TypeScript compila sin errores
- [ ] Todas las capas respetan dependencia unidireccional
- [ ] Server Actions verifican auth y rol
- [ ] Validacion Zod en todos los inputs
- [ ] 4 estados manejados (loading, error, empty, success)
- [ ] Sin `any`, `ts-ignore`, `as any`
- [ ] Imports cross-module solo via barrel `index.ts`
- [ ] UI en espanol, codigo en ingles
- [ ] Constantes compartidas reutilizadas (no duplicadas)
- [ ] Componentes Shadcn reutilizados (no creados desde cero)

## Reglas duras durante la implementacion

- NO inventar campos, permisos ni tablas de BD. Si algo no esta en la HU o el plan, preguntar.
- NO crear componentes que ya existen en `src/shared/components/`.
- NO usar `any`, `ts-ignore`, `as any`.
- NO escribir UI antes de types/dto/use-case/action.
- NO hardcodear strings en JSX que correspondan a constantes.
- NO dejar `.catch()` silencioso.
- NO declarar listo sin verificar el checklist.

## Al terminar

Reportar al usuario:
- Lista de archivos creados/modificados (con file:line para los mas importantes).
- Estado del checklist (todo verde o que quedo pendiente).
- Si hubo decisiones o cambios respecto al plan, mencionarlos para que el usuario los apruebe.
