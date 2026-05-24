# STRUCTURE.md — Guía de Estructura del Proyecto

## Principio fundamental: Módulo-First

Cada módulo es **independiente**. Si tú trabajas en `docentes/` y tu compañero en `cursos/`, nunca van a tocar los mismos archivos ni generar conflictos en Git.

```
❌ MALO: Layer-First (todos trabajan en las mismas carpetas)

src/
├── domain/
│   ├── entities/
│   │   ├── docente.ts      ← Persona A toca esto
│   │   ├── curso.ts        ← Persona B toca esto (misma carpeta = conflicto)
│   └── repositories/
│       ├── docente.repo.ts  ← Persona A también necesita esto
│       ├── curso.repo.ts    ← Persona B también (conflicto de merge)


✅ BUENO: Module-First (cada persona en su carpeta)

src/modules/
├── docentes/              ← Persona A trabaja SOLO aquí
│   ├── domain/
│   ├── application/
│   └── ...
├── cursos/                ← Persona B trabaja SOLO aquí
│   ├── domain/
│   ├── application/
│   └── ...
```

---

## Estructura completa

```
horarios-unt/
│
├── .claude/
│   └── commands/                    # Comandos de Claude Code
│       ├── verificar.md
│       ├── implementar.md
│       ├── revisar.md
│       ├── test.md
│       ├── estado.md
│       └── corregir.md
│
├── CLAUDE.md                        # Memoria del proyecto para Claude Code
├── PLANNING.md                      # Documento maestro (requerimientos, reglas, algoritmo)
├── STRUCTURE.md                     # Este archivo
│
├── src/
│   │
│   ├── shared/                      # 🔵 COMPARTIDO — lo que usan TODOS los módulos
│   │   ├── components/
│   │   │   ├── ui/                  # Shadcn/UI (botones, inputs, modals, etc.)
│   │   │   └── layout/             # Layout principal, sidebar, header, navbar
│   │   ├── hooks/                   # Hooks reutilizables (useAuth, useDebounce, etc.)
│   │   ├── lib/                     # Utilidades (supabase client, cn(), helpers)
│   │   ├── types/                   # Tipos globales (roles, estados, enums compartidos)
│   │   └── constants/              # Constantes (bloques horarios, días, límites)
│   │
│   ├── modules/                     # 🟢 MÓDULOS — cada uno es independiente
│   │   │
│   │   ├── auth/                    # ────────────────────────────────────
│   │   │   ├── domain/
│   │   │   │   ├── entities/        # User (entidad de dominio)
│   │   │   │   └── repositories/    # IAuthRepository (interfaz)
│   │   │   ├── application/
│   │   │   │   ├── use-cases/       # LoginUseCase, LogoutUseCase, etc.
│   │   │   │   └── dtos/            # LoginDTO, esquemas Zod
│   │   │   ├── infrastructure/      # SupabaseAuthRepository (implementación)
│   │   │   ├── presentation/
│   │   │   │   ├── components/      # LoginForm, RecoverPasswordForm
│   │   │   │   └── actions/         # Server Actions: login.action.ts
│   │   │   └── index.ts             # Barrel: exporta solo lo público del módulo
│   │   │
│   │   ├── periodos/                # ────────────────────────────────────
│   │   │   ├── domain/
│   │   │   │   ├── entities/        # Periodo (con máquina de estados)
│   │   │   │   └── repositories/    # IPeriodoRepository
│   │   │   ├── application/
│   │   │   │   ├── use-cases/       # CrearPeriodoUseCase, CambiarEstadoUseCase
│   │   │   │   └── dtos/            # CreatePeriodoDTO, esquemas Zod
│   │   │   ├── infrastructure/      # SupabasePeriodoRepository
│   │   │   ├── presentation/
│   │   │   │   ├── components/      # PeriodoForm, PeriodoStatusBadge, PeriodoTable
│   │   │   │   └── actions/         # Server Actions
│   │   │   └── index.ts
│   │   │
│   │   ├── docentes/                # ────────────────────────────────────
│   │   │   ├── domain/
│   │   │   │   ├── entities/        # Docente (con cálculo de antigüedad)
│   │   │   │   └── repositories/    # IDocenteRepository
│   │   │   ├── application/
│   │   │   │   ├── use-cases/       # CrearDocenteUseCase, EditarDocenteUseCase, etc.
│   │   │   │   └── dtos/            # CreateDocenteDTO, UpdateDocenteDTO
│   │   │   ├── infrastructure/      # SupabaseDocenteRepository
│   │   │   ├── presentation/
│   │   │   │   ├── components/      # DocenteForm, DocenteTable, DocenteCard
│   │   │   │   └── actions/         # Server Actions
│   │   │   └── index.ts
│   │   │
│   │   ├── cursos/                  # ────────────────────────────────────
│   │   │   ├── domain/
│   │   │   │   ├── entities/        # Curso, Grupo
│   │   │   │   └── repositories/    # ICursoRepository
│   │   │   ├── application/
│   │   │   │   ├── use-cases/       # CrearCursoUseCase, AsociarPeriodoUseCase
│   │   │   │   └── dtos/
│   │   │   ├── infrastructure/      # SupabaseCursoRepository
│   │   │   ├── presentation/
│   │   │   │   ├── components/      # CursoForm, CursoTable
│   │   │   │   └── actions/
│   │   │   └── index.ts
│   │   │
│   │   ├── aulas/                   # ────────────────────────────────────
│   │   │   ├── domain/
│   │   │   │   ├── entities/        # Aula (con restricciones por bloque)
│   │   │   │   └── repositories/    # IAulaRepository
│   │   │   ├── application/
│   │   │   │   ├── use-cases/
│   │   │   │   └── dtos/
│   │   │   ├── infrastructure/      # SupabaseAulaRepository
│   │   │   ├── presentation/
│   │   │   │   ├── components/      # AulaForm, AulaTable, AulaOcupacionGrid
│   │   │   │   └── actions/
│   │   │   └── index.ts
│   │   │
│   │   ├── disponibilidad/          # ────────────────────────────────────
│   │   │   ├── domain/
│   │   │   │   ├── entities/        # Disponibilidad (grilla semanal)
│   │   │   │   └── repositories/    # IDisponibilidadRepository
│   │   │   ├── application/
│   │   │   │   ├── use-cases/       # RegistrarDisponibilidadUseCase
│   │   │   │   └── dtos/
│   │   │   ├── infrastructure/      # SupabaseDisponibilidadRepository
│   │   │   ├── presentation/
│   │   │   │   ├── components/      # DisponibilidadGrid (la grilla interactiva)
│   │   │   │   └── actions/
│   │   │   └── index.ts
│   │   │
│   │   ├── horarios/                # ──────────────────────────────────── (módulo central)
│   │   │   ├── domain/
│   │   │   │   ├── entities/        # Horario, Asignacion, Conflicto
│   │   │   │   ├── repositories/    # IHorarioRepository, IAsignacionRepository
│   │   │   │   └── services/       # ScheduleGeneratorService, ConflictValidatorService
│   │   │   │                        # ScoringService (sistema de puntuación)
│   │   │   ├── application/
│   │   │   │   ├── use-cases/       # GenerarHorarioUseCase, ModificarAsignacionUseCase
│   │   │   │   │                    # AprobarHorarioUseCase, PublicarHorarioUseCase
│   │   │   │   └── dtos/
│   │   │   ├── infrastructure/      # SupabaseHorarioRepository
│   │   │   ├── presentation/
│   │   │   │   ├── components/      # HorarioGrid, AsignacionCard, ConflictoAlert
│   │   │   │   └── actions/
│   │   │   └── index.ts
│   │   │
│   │   ├── reportes/                # ────────────────────────────────────
│   │   │   ├── domain/
│   │   │   │   └── services/        # ReportGeneratorService
│   │   │   ├── application/
│   │   │   │   └── use-cases/       # GenerarPDFHorarioUseCase, GenerarExcelCargaUseCase
│   │   │   ├── infrastructure/
│   │   │   │   ├── pdf/             # Generadores PDF con PDF-lib
│   │   │   │   └── excel/           # Generadores Excel con ExcelJS
│   │   │   ├── presentation/
│   │   │   │   ├── components/      # ReporteSelector, DescargarButton
│   │   │   │   └── actions/
│   │   │   └── index.ts
│   │   │
│   │   ├── dashboard/               # ────────────────────────────────────
│   │   │   ├── application/
│   │   │   │   ├── use-cases/       # ObtenerKPIsUseCase
│   │   │   │   └── dtos/            # DashboardDTO
│   │   │   ├── infrastructure/      # Queries Supabase para indicadores
│   │   │   ├── presentation/
│   │   │   │   ├── components/      # DashboardLayout
│   │   │   │   └── widgets/         # StatCard, CargaDocenteChart, OcupacionChart
│   │   │   └── index.ts
│   │   │
│   │   ├── auditoria/               # ────────────────────────────────────
│   │   │   ├── domain/
│   │   │   │   ├── entities/        # AuditLog
│   │   │   │   └── repositories/    # IAuditoriaRepository
│   │   │   ├── application/
│   │   │   │   ├── use-cases/       # RegistrarAccionUseCase, ConsultarLogsUseCase
│   │   │   │   └── dtos/
│   │   │   ├── infrastructure/      # SupabaseAuditoriaRepository
│   │   │   ├── presentation/
│   │   │   │   ├── components/      # AuditoriaTable, AuditoriaFilters
│   │   │   │   └── actions/
│   │   │   └── index.ts
│   │   │
│   │   └── notificaciones/          # ────────────────────────────────────
│   │       ├── domain/
│   │       │   ├── entities/        # Notificacion
│   │       │   └── repositories/    # INotificacionRepository
│   │       ├── application/
│   │       │   └── use-cases/       # EnviarNotificacionUseCase
│   │       ├── infrastructure/      # SupabaseNotificacionRepository
│   │       ├── presentation/
│   │       │   └── components/      # NotificacionBell, NotificacionList
│   │       └── index.ts
│   │
│   └── app/                         # 🔴 NEXT.JS APP ROUTER — solo ruteo
│       ├── (auth)/                  # Grupo de rutas públicas
│       │   ├── login/
│       │   │   └── page.tsx         # Importa LoginForm de modules/auth
│       │   ├── recuperar/
│       │   │   └── page.tsx
│       │   └── layout.tsx           # Layout sin sidebar
│       │
│       ├── (dashboard)/             # Grupo de rutas protegidas
│       │   ├── director/
│       │   │   ├── page.tsx         # Dashboard director
│       │   │   ├── periodos/
│       │   │   │   └── page.tsx     # Importa componentes de modules/periodos
│       │   │   ├── docentes/
│       │   │   │   └── page.tsx     # Importa componentes de modules/docentes
│       │   │   ├── cursos/
│       │   │   │   └── page.tsx
│       │   │   ├── aulas/
│       │   │   │   └── page.tsx
│       │   │   ├── horarios/
│       │   │   │   └── page.tsx
│       │   │   ├── reportes/
│       │   │   │   └── page.tsx
│       │   │   └── auditoria/
│       │   │       └── page.tsx
│       │   │
│       │   ├── secretaria/
│       │   │   ├── page.tsx
│       │   │   ├── docentes/
│       │   │   │   └── page.tsx
│       │   │   ├── cursos/
│       │   │   │   └── page.tsx
│       │   │   ├── aulas/
│       │   │   │   └── page.tsx
│       │   │   └── reportes/
│       │   │       └── page.tsx
│       │   │
│       │   ├── docente/
│       │   │   ├── page.tsx
│       │   │   ├── disponibilidad/
│       │   │   │   └── page.tsx
│       │   │   └── horario/
│       │   │       └── page.tsx
│       │   │
│       │   └── layout.tsx           # Layout con sidebar + verificación de rol
│       │
│       ├── api/
│       │   └── reportes/
│       │       └── route.ts         # Endpoint para descarga de PDF/Excel
│       │
│       ├── layout.tsx               # Root layout
│       ├── page.tsx                 # Redirect a login o dashboard
│       └── middleware.ts            # Verificación JWT + redirección por rol
│
├── public/
│   └── images/
│       └── logo-unt.png             # Logo institucional para reportes y header
│
├── package.json
├── tsconfig.json
├── tailwind.config.ts
├── next.config.ts
└── .env.local                       # Variables de entorno (NUNCA subir a Git)
```

---

## Reglas de dependencia entre módulos

```
REGLA DE ORO: Un módulo SOLO puede importar de:
  1. Su propia carpeta (modules/docentes/ importa de modules/docentes/)
  2. shared/ (todos pueden usar shared/)
  3. El index.ts de OTRO módulo (nunca archivos internos de otro módulo)

PROHIBIDO:
  modules/horarios/domain/services/generator.ts
    → import { Docente } from '../../docentes/domain/entities/docente'  ❌ NUNCA

CORRECTO:
  modules/horarios/domain/services/generator.ts
    → import { Docente } from '@/modules/docentes'  ✅ (usa el barrel index.ts)
```

### Diagrama de dependencias

```
shared/ ←── todos los módulos pueden usar shared

auth ←── periodos, docentes, cursos, aulas (necesitan saber quién está logueado)
periodos ←── disponibilidad, horarios (necesitan saber el período activo)
docentes ←── disponibilidad, horarios (necesitan datos del docente)
cursos ←── horarios (necesitan datos de cursos)
aulas ←── horarios (necesitan datos de aulas)
disponibilidad ←── horarios (necesitan la disponibilidad)

horarios ←── reportes, dashboard (necesitan el horario generado)
auditoria ←── NADIE importa auditoría (auditoría ESCUCHA a los demás)
notificaciones ←── NADIE importa notificaciones (igual que auditoría)
```

---

## ¿Qué va en cada capa dentro de un módulo?

### `domain/entities/`
Clases o tipos TypeScript puros. Sin imports de React, Next.js ni Supabase.
```typescript
// modules/docentes/domain/entities/docente.entity.ts
export interface Docente {
  id: string
  nombres: string
  apellidos: string
  dni: string
  categoria: 'principal' | 'asociado' | 'auxiliar'
  // ...
}
```

### `domain/repositories/`
Solo la INTERFAZ (el contrato). No la implementación.
```typescript
// modules/docentes/domain/repositories/docente.repository.ts
export interface IDocenteRepository {
  findById(id: string): Promise<Docente | null>
  findAll(): Promise<Docente[]>
  save(docente: Docente): Promise<Docente>
  // ...
}
```

### `domain/services/`
Lógica de negocio compleja. Solo en módulos que lo necesiten (horarios, reportes).

### `application/use-cases/`
Orquesta entidades + repositorios para cumplir un caso de uso.
```typescript
// modules/docentes/application/use-cases/crear-docente.use-case.ts
export class CrearDocenteUseCase {
  constructor(private repo: IDocenteRepository) {}
  async execute(dto: CreateDocenteDTO): Promise<Docente> { ... }
}
```

### `application/dtos/`
Esquemas Zod para validar entrada y salida.
```typescript
// modules/docentes/application/dtos/create-docente.dto.ts
export const createDocenteSchema = z.object({
  nombres: z.string().min(2),
  apellidos: z.string().min(2),
  dni: z.string().length(8),
  // ...
})
export type CreateDocenteDTO = z.infer<typeof createDocenteSchema>
```

### `infrastructure/`
Implementación concreta con Supabase.
```typescript
// modules/docentes/infrastructure/supabase-docente.repository.ts
export class SupabaseDocenteRepository implements IDocenteRepository {
  constructor(private supabase: SupabaseClient) {}
  async findById(id: string) { ... }
}
```

### `presentation/components/`
Componentes React del módulo. Pueden ser Server o Client Components.

### `presentation/actions/`
Server Actions de Next.js. Punto de entrada desde la UI.

### `index.ts`
Barrel file. Exporta SOLO lo que otros módulos pueden usar.
```typescript
// modules/docentes/index.ts
export type { Docente } from './domain/entities/docente.entity'
export type { IDocenteRepository } from './domain/repositories/docente.repository'
export { DocenteTable } from './presentation/components/docente-table'
// NO exportar infraestructura ni use-cases internos
```

---

## ¿Qué va en `app/`? (Next.js App Router)

Las páginas en `app/` son **delgadas**. Solo importan y renderizan componentes de los módulos. Nunca contienen lógica de negocio.

```typescript
// src/app/(dashboard)/director/docentes/page.tsx
import { DocenteTable } from '@/modules/docentes'

export default function DocentesPage() {
  return (
    <div>
      <h1>Gestión de Docentes</h1>
      <DocenteTable />
    </div>
  )
}
```

---

## Asignación de trabajo en equipo

| Persona | Módulos asignados | Carpeta |
|---------|-------------------|---------|
| Dev A | auth, periodos | `src/modules/auth/`, `src/modules/periodos/` |
| Dev B | docentes, disponibilidad | `src/modules/docentes/`, `src/modules/disponibilidad/` |
| Dev C | cursos, aulas | `src/modules/cursos/`, `src/modules/aulas/` |
| Dev D | horarios (algoritmo) | `src/modules/horarios/` |
| Dev E | reportes, dashboard | `src/modules/reportes/`, `src/modules/dashboard/` |
| Todos | shared/ (con PR review) | `src/shared/` |

Cada dev trabaja en su carpeta → cero conflictos de merge.
