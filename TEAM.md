# TEAM.md — Distribución de Trabajo del Equipo

## Sistema de Horarios Académicos — Universidad Nacional de Trujillo
**Fecha:** 24 de mayo de 2026  
**Total de integrantes:** 6

---

## Resumen de asignaciones

| Integrante | Rol | Módulos asignados | Carpetas |
|---|---|---|---|
| **Renato** | Tech Lead | `shared/` + `auth` | `src/shared/`, `src/modules/auth/` |
| **Andy** | Backend Core | `periodos` + `auditoria` + `notificaciones` | `src/modules/periodos/`, `src/modules/auditoria/`, `src/modules/notificaciones/` |
| **Laiza** | Módulos Docentes | `docentes` + `disponibilidad` | `src/modules/docentes/`, `src/modules/disponibilidad/` |
| **Stefano** | Módulos Académicos | `cursos` + `aulas` | `src/modules/cursos/`, `src/modules/aulas/` |
| **David Guevara** | Algoritmo Central | `horarios` | `src/modules/horarios/` |
| **Andres** | Visualización | `reportes` + `dashboard` | `src/modules/reportes/`, `src/modules/dashboard/` |

---

## Justificación de la distribución

**¿Por qué esta repartición?**

- **Renato** lleva `shared/` y `auth` porque es el Tech Lead. Estos son los cimientos: todos los módulos dependen de los componentes compartidos y de la autenticación. Tiene que estar listo primero para no bloquear al equipo.

- **Andy** lleva `periodos` porque es el segundo módulo que debe estar listo (muchos módulos dependen del período activo). Después toma `auditoria` y `notificaciones`, que son módulos transversales que "escuchan" a los demás sin que nadie dependa de ellos.

- **Laiza** lleva `docentes` y `disponibilidad` porque están directamente relacionados: el docente es quien registra su disponibilidad. Ambos módulos comparten la misma entidad central y se desarrollan en secuencia natural.

- **Stefano** lleva `cursos` y `aulas` porque son módulos CRUD paralelos con estructura similar. Se pueden desarrollar simultáneamente y no dependen uno del otro.

- **David Guevara** lleva `horarios` porque es el módulo más complejo del sistema (el algoritmo de generación). Requiere dedicación exclusiva, muchos tests y comprensión profunda del PLANNING.md (secciones 11 y 12).

- **Andres** lleva `reportes` y `dashboard` porque son módulos de salida que consumen datos de los demás. Se implementan al final cuando ya hay datos disponibles para visualizar y exportar.

---

## Cronograma de dependencias

```
Semana 1-2:  Renato (shared + auth) + Andy (periodos)
             ↓ El resto del equipo NO puede empezar sin esto

Semana 3-4:  Laiza (docentes) + Stefano (cursos + aulas)
             ↓ Pueden trabajar en paralelo, sin conflictos

Semana 5-6:  Laiza (disponibilidad) + David (horarios - inicio)
             ↓ Disponibilidad necesita docentes listos

Semana 7-9:  David (horarios - algoritmo completo)
             ↓ El algoritmo es lo más complejo, necesita más tiempo

Semana 10-11: Andres (reportes + dashboard)
              ↓ Necesita datos de horarios para generar reportes

Semana 12:   Andy (auditoria + notificaciones)
             ↓ Se integran al final porque escuchan a todos los módulos

Semana 13+:  Todos → pruebas, correcciones, despliegue
```

### Diagrama visual

```
SEMANA:  1────2────3────4────5────6────7────8────9────10───11───12───13+

Renato:  ████████ shared + auth ██████  ── soporte y revisión de PRs ──────→
Andy:    ████████ periodos ████████████  ─────────────── auditoria + notif ─→
Laiza:   ··········████████ docentes ████████ disponibilidad ██████··········→
Stefano: ··········████████ cursos + aulas █████████████████████·············→
David:   ····················································████████████████ horarios (algoritmo) ██████→
Andres:  ············································································████████ reportes + dashboard ██→
```

---

## Instrucciones individuales

---

### 🟦 RENATO — Tech Lead (`shared/` + `auth`)

**Tu rol:** Eres el que pone los cimientos. Nadie puede avanzar hasta que `shared/` y `auth` estén listos. También eres el encargado de revisar los Pull Requests de todos.

**Tus carpetas (SOLO trabaja aquí):**
```
src/shared/
├── components/
│   ├── ui/              → Instalar Shadcn/UI: npx shadcn@latest init
│   └── layout/          → Sidebar, Header, MainLayout, RoleGuard
├── hooks/               → useAuth(), useCurrentUser(), useDebounce()
├── lib/                 → supabase.ts (cliente), cn() (classnames), utils
├── types/               → roles.ts, enums compartidos
└── constants/           → BLOQUES_HORARIOS, DIAS_SEMANA, CATEGORIAS

src/modules/auth/
├── domain/entities/     → User entity
├── domain/repositories/ → IAuthRepository (interfaz)
├── application/
│   ├── use-cases/       → LoginUseCase, LogoutUseCase, RecoverPasswordUseCase
│   └── dtos/            → loginSchema (Zod), recoverSchema (Zod)
├── infrastructure/      → SupabaseAuthRepository
├── presentation/
│   ├── components/      → LoginForm, RecoverForm, ChangePasswordForm
│   └── actions/         → login.action.ts, logout.action.ts
└── index.ts             → Exportar lo público

src/app/(auth)/          → Páginas   - **Prioridad 1**: Autenticación, RBAC y `proxy.ts` (Next.js 16 renombró middleware a proxy).     → Verificación JWT + redirección por rol
src/app/(dashboard)/layout.tsx → Layout protegido con sidebar
```

**Tareas concretas:**
1. Crear proyecto Next.js: `npx create-next-app@latest horarios-unt --yes`
2. Instalar dependencias: Shadcn/UI, Supabase, React Hook Form, Zod, TanStack Table
3. Configurar Supabase (crear proyecto, configurar Auth, crear archivo `.env.local`)
4. Crear el cliente Supabase en `shared/lib/supabase.ts`
5. Instalar componentes Shadcn/UI base: Button, Input, Card, Table, Dialog, Form, Toast
6. Crear el layout principal con sidebar y header
7. Implementar el middleware de autenticación
8. Implementar login, logout, recuperación de contraseña
9. Crear el componente RoleGuard que protege rutas por rol
10. Crear las constantes compartidas (bloques horarios, días, categorías)

**Requerimientos funcionales que cubres:** RF-001 a RF-007

**Lo que debes entregar primero (bloquea al equipo):**
- Cliente Supabase funcional
- Login funcional con JWT
- Middleware de protección de rutas
- Layout con sidebar navegable
- Componentes Shadcn/UI instalados

**Después de entregar auth:** Tu rol cambia a revisor de PRs. Revisa cada PR con el comando `/revisar` de Claude Code. Asegúrate de que respeten la arquitectura módulo-first.

---

### 🟩 ANDY — Backend Core (`periodos` + `auditoria` + `notificaciones`)

**Tu rol:** Construyes la infraestructura que da soporte a todo el sistema. Los períodos son el contexto temporal de todo (sin período activo, nada funciona). La auditoría y notificaciones son transversales.

**Tus carpetas (SOLO trabaja aquí):**
```
src/modules/periodos/
├── domain/entities/     → Periodo (con máquina de estados)
├── domain/repositories/ → IPeriodoRepository
├── application/
│   ├── use-cases/       → CrearPeriodoUseCase, CambiarEstadoUseCase, CerrarPeriodoUseCase
│   └── dtos/            → createPeriodoSchema, cambiarEstadoSchema
├── infrastructure/      → SupabasePeriodoRepository
├── presentation/
│   ├── components/      → PeriodoForm, PeriodoTable, PeriodoStatusBadge, PeriodoTimeline
│   └── actions/         → crear-periodo.action.ts, cambiar-estado.action.ts
└── index.ts

src/modules/auditoria/   → (implementar después de semana 10)
src/modules/notificaciones/ → (implementar después de semana 10)
```

**Tareas concretas — Periodos:**
1. Crear la entidad Periodo con la máquina de estados: Configuración → Recopilación → Generación → Aprobado → Publicado → Cerrado
2. Implementar la validación de transiciones (no se puede saltar estados, solo Generación puede volver a Recopilación)
3. Validar que solo pueda existir UN período activo (no cerrado)
4. Crear el CRUD completo con Server Actions
5. Crear la tabla de períodos con filtros
6. Crear el badge visual de estado con colores

**Tareas concretas — Auditoría (después de semana 10):**
1. Crear la entidad AuditLog con: timestamp, user_id, rol, módulo, acción, datos_anteriores, datos_nuevos
2. Crear el servicio de registro que los demás módulos llamarán
3. La tabla de auditoría es INMUTABLE (solo INSERT, nunca UPDATE ni DELETE)
4. Crear la vista con filtros y exportación a Excel

**Tareas concretas — Notificaciones (después de semana 10):**
1. Crear la entidad Notificacion con: destinatario, tipo, mensaje, leída, fecha
2. Implementar el bell icon con contador de no leídas
3. Implementar los triggers: apertura de recopilación, recordatorio 3 días, publicación de horario

**Requerimientos funcionales que cubres:** RF-052 a RF-062

**Reglas de negocio que debes respetar:** RN-021, RN-022, RN-023, RN-025, RN-026, RN-027

**Dependencias:** Necesitas que Renato tenga listo `auth` y `shared/` antes de empezar.

**Lo que debes entregar primero (bloquea a otros):**
- CRUD de períodos funcional
- Máquina de estados validada
- Endpoint para obtener el período activo (otros módulos lo necesitan)

---

### 🟨 LAIZA — Módulos Docentes (`docentes` + `disponibilidad`)

**Tu rol:** Gestionas todo lo relacionado con los docentes: su información, categorías, antigüedad, y el sistema de registro de disponibilidad horaria.

**Tus carpetas (SOLO trabaja aquí):**
```
src/modules/docentes/
├── domain/entities/     → Docente (con cálculo automático de antigüedad)
├── domain/repositories/ → IDocenteRepository
├── application/
│   ├── use-cases/       → CrearDocenteUseCase, EditarDocenteUseCase, DesactivarDocenteUseCase
│   └── dtos/            → createDocenteSchema, updateDocenteSchema (Zod)
├── infrastructure/      → SupabaseDocenteRepository
├── presentation/
│   ├── components/      → DocenteForm, DocenteTable, DocenteCard, DocenteFilters
│   └── actions/         → crear-docente.action.ts, editar-docente.action.ts
└── index.ts

src/modules/disponibilidad/
├── domain/entities/     → Disponibilidad (grilla: docente × bloque → estado)
├── domain/repositories/ → IDisponibilidadRepository
├── application/
│   ├── use-cases/       → RegistrarDisponibilidadUseCase, ObtenerResumenUseCase
│   └── dtos/            → disponibilidadSchema
├── infrastructure/      → SupabaseDisponibilidadRepository
├── presentation/
│   ├── components/      → DisponibilidadGrid (grilla interactiva semanal)
│   │                      DisponibilidadResumen, DisponibilidadStatusBadge
│   └── actions/         → registrar-disponibilidad.action.ts
└── index.ts
```

**Tareas concretas — Docentes:**
1. Crear la entidad Docente con: nombres, apellidos, DNI, correo, teléfono, categoría (Principal/Asociado/Auxiliar), régimen (DE/TC/TP), condición (Nombrado/Contratado), fecha_ingreso, carga_maxima, estado (Activo/Inactivo)
2. Implementar el cálculo automático de antigüedad a partir de fecha_ingreso
3. Validar unicidad de DNI y correo
4. CRUD completo con Server Actions
5. Tabla paginada con búsqueda por nombre, filtros por categoría, régimen y estado
6. Formulario de registro/edición con validación Zod

**Tareas concretas — Disponibilidad (después de docentes):**
1. Crear la grilla interactiva semanal: lunes a sábado, 07:00 a 21:00
2. Cada celda tiene 3 estados: Disponible (verde), No disponible (gris), Preferido (azul)
3. Click o toque alterna el estado de la celda
4. Validar que el total de horas disponibles >= mínimo según régimen (DE: 40h, TC: 20h, TP: 12h)
5. Solo permitir registro si el período está en estado "Recopilación"
6. Mostrar resumen: "18 horas disponibles de 20 mínimas"
7. Vista para el Director: tabla resumen de quién registró y quién falta

**Requerimientos funcionales que cubres:** RF-008 a RF-013, RF-024 a RF-029

**Reglas de negocio que debes respetar:** RN-002, RN-003, RN-004, RN-005, RN-006, RN-007

**Dependencias:** Necesitas `auth` (Renato) y `periodos` (Andy) antes de empezar.

**Lo que debes entregar (David lo necesita para el algoritmo):**
- Lista de docentes activos con su categoría, antigüedad y carga máxima
- Disponibilidad de cada docente para el período activo
- Exportar desde `index.ts`: tipo Docente, tipo Disponibilidad, IDocenteRepository

---

### 🟧 STEFANO — Módulos Académicos (`cursos` + `aulas`)

**Tu rol:** Gestionas los cursos del plan de estudios y los espacios físicos (aulas y laboratorios). Estos son los "recursos" que el algoritmo de David asignará.

**Tus carpetas (SOLO trabaja aquí):**
```
src/modules/cursos/
├── domain/entities/     → Curso, Grupo
├── domain/repositories/ → ICursoRepository
├── application/
│   ├── use-cases/       → CrearCursoUseCase, EditarCursoUseCase, AsociarPeriodoUseCase
│   └── dtos/            → createCursoSchema, updateCursoSchema
├── infrastructure/      → SupabaseCursoRepository
├── presentation/
│   ├── components/      → CursoForm, CursoTable, GrupoManager, CursoFilters
│   └── actions/         → crear-curso.action.ts, asociar-periodo.action.ts
└── index.ts

src/modules/aulas/
├── domain/entities/     → Aula (con restricciones por bloque)
├── domain/repositories/ → IAulaRepository
├── application/
│   ├── use-cases/       → CrearAulaUseCase, EditarAulaUseCase, DefinirRestriccionUseCase
│   └── dtos/            → createAulaSchema, restriccionSchema
├── infrastructure/      → SupabaseAulaRepository
├── presentation/
│   ├── components/      → AulaForm, AulaTable, AulaRestriccionGrid, AulaOcupacionView
│   └── actions/         → crear-aula.action.ts, definir-restriccion.action.ts
└── index.ts
```

**Tareas concretas — Cursos:**
1. Crear la entidad Curso con: código, nombre, ciclo (I–X), tipo (Teórico/Práctico/Teórico-Práctico), horas_teoricas, horas_practicas, créditos, requiere_laboratorio, tipo_laboratorio
2. Crear la entidad Grupo: un curso puede tener múltiples grupos (secciones A, B, C...)
3. Validar unicidad del código del curso
4. Implementar la asociación de cursos a un período académico
5. CRUD completo con Server Actions
6. Tabla filtrable por ciclo, tipo y período
7. Componente GrupoManager para agregar/quitar grupos a un curso

**Tareas concretas — Aulas:**
1. Crear la entidad Aula con: código, nombre, ubicación (pabellón, piso), capacidad, tipo (Aula Teórica/Lab Cómputo/Lab Especializado/Auditorio), equipamiento, estado (Activa/Inactiva/Mantenimiento)
2. Validar unicidad del código de aula
3. Implementar la grilla de restricciones: poder marcar bloques como "No disponible" con motivo
4. CRUD completo con Server Actions
5. Tabla filtrable por tipo, capacidad y estado
6. Vista de ocupación: grilla semanal mostrando qué curso tiene asignado cada bloque

**Requerimientos funcionales que cubres:** RF-014 a RF-023

**Reglas de negocio que debes respetar:** RN-009 a RN-014, RN-015, RN-032

**Dependencias:** Necesitas `auth` (Renato) y `periodos` (Andy) antes de empezar.

**Lo que debes entregar (David lo necesita para el algoritmo):**
- Lista de cursos del período activo con sus grupos
- Lista de aulas activas con su tipo, capacidad y restricciones
- Exportar desde `index.ts`: tipo Curso, tipo Grupo, tipo Aula, ICursoRepository, IAulaRepository

---

### 🟥 DAVID GUEVARA — Algoritmo Central (`horarios`)

**Tu rol:** Eres el responsable del corazón del sistema: el algoritmo de generación automática de horarios. Es el módulo más complejo y requiere comprensión profunda del PLANNING.md, especialmente las secciones 11 (Algoritmo) y 12 (Sistema de puntuación).

**Tus carpetas (SOLO trabaja aquí):**
```
src/modules/horarios/
├── domain/
│   ├── entities/        → Horario, Asignacion, Conflicto, PuntajeDocente
│   ├── repositories/    → IHorarioRepository, IAsignacionRepository
│   └── services/        → ★ AQUÍ VA LO MÁS IMPORTANTE ★
│       ├── schedule-generator.service.ts    → Algoritmo principal (9 fases)
│       ├── conflict-validator.service.ts    → Validación de conflictos
│       ├── scoring.service.ts               → Sistema de puntuación docente
│       └── optimizer.service.ts             → Optimización (swaps)
├── application/
│   ├── use-cases/
│   │   ├── generar-horario.use-case.ts      → Orquesta las 9 fases
│   │   ├── modificar-asignacion.use-case.ts → Cambio manual con validación
│   │   ├── aprobar-horario.use-case.ts
│   │   └── publicar-horario.use-case.ts
│   └── dtos/
├── infrastructure/      → SupabaseHorarioRepository
├── presentation/
│   ├── components/
│   │   ├── HorarioGrid.tsx          → Grilla visual del horario completo
│   │   ├── AsignacionCard.tsx       → Detalle de una asignación
│   │   ├── ConflictoAlert.tsx       → Alerta de conflicto
│   │   ├── GeneracionProgress.tsx   → Barra de progreso de las 9 fases
│   │   └── HorarioFilters.tsx       → Filtros: por ciclo, docente, aula
│   └── actions/
└── index.ts
```

**LECTURA OBLIGATORIA antes de codear:**
- PLANNING.md — Sección 11: Diseño de la lógica del algoritmo (9 fases)
- PLANNING.md — Sección 12: Sistema de puntuación
- PLANNING.md — Sección 7: Reglas de negocio (TODAS las RN)

**Tareas concretas:**

**Fase 1 — Sistema de puntuación (scoring.service.ts):**
```
Puntaje = (Categoría × 0.35) + (Antigüedad × 0.25) + (Disponibilidad × 0.15) 
        + (Preferencia × 0.15) + (Carga × 0.10)
```

**Fase 2 — Validador de conflictos (conflict-validator.service.ts):**
- Docente en dos cursos al mismo tiempo → BLOQUEANTE
- Aula en dos cursos al mismo tiempo → BLOQUEANTE
- Dos cursos del mismo ciclo al mismo tiempo → BLOQUEANTE
- Capacidad de aula insuficiente → BLOQUEANTE
- Tipo de aula incompatible → BLOQUEANTE

**Fase 3 — Generador principal (schedule-generator.service.ts):**
Implementar las 9 fases del algoritmo:
1. Validación de información
2. Filtrado de disponibilidad
3. Validación de restricciones
4. Priorización docente (usa scoring.service)
5. Asignación de cursos a docentes
6. Asignación de bloques y aulas
7. Validación de conflictos (usa conflict-validator.service)
8. Optimización (swaps que mejoran sin romper)
9. Generación final

**Fase 4 — Componentes de visualización:**
- Grilla visual del horario (la más compleja de la UI)
- Panel de modificación manual con validación en tiempo real

**Requerimientos funcionales que cubres:** RF-030 a RF-042

**Reglas de negocio que debes respetar:** RN-001 a RN-020, RN-024, RN-029, RN-030, RN-031

**Dependencias:** Necesitas los `index.ts` de: `docentes` (Laiza), `cursos` (Stefano), `aulas` (Stefano), `disponibilidad` (Laiza), `periodos` (Andy)

**Tests OBLIGATORIOS (este módulo necesita la mayor cobertura):**
- Test: un docente NO puede estar en dos cursos simultáneamente
- Test: un aula NO puede estar asignada dos veces
- Test: dos cursos del mismo ciclo NO pueden coincidir
- Test: la carga docente NO excede el máximo
- Test: el scoring calcula correctamente la prioridad
- Test: el algoritmo funciona con datos mínimos (1 docente, 1 curso, 1 aula)
- Test: el algoritmo reporta conflictos irresolubles correctamente
- Test: la optimización no viola restricciones duras

**Consejo:** Empieza por `scoring.service.ts` y `conflict-validator.service.ts` con sus tests. Son funciones puras sin dependencias externas, ideales para desarrollar y testear en aislamiento mientras esperas que Laiza y Stefano terminen sus módulos.

---

### 🟪 ANDRES — Visualización (`reportes` + `dashboard`)

**Tu rol:** Eres el encargado de que toda la información del sistema sea visible, descargable y comprensible. Los reportes PDF/Excel son los entregables formales, y el dashboard es el centro de control del Director.

**Tus carpetas (SOLO trabaja aquí):**
```
src/modules/reportes/
├── domain/services/     → ReportGeneratorService
├── application/
│   └── use-cases/       → GenerarPDFHorarioUseCase, GenerarExcelCargaUseCase
│                          GenerarPDFDocenteUseCase, GenerarExcelOcupacionUseCase
├── infrastructure/
│   ├── pdf/             → Generadores con PDF-lib
│   │   ├── horario-completo.pdf.ts
│   │   ├── horario-por-ciclo.pdf.ts
│   │   ├── horario-por-docente.pdf.ts
│   │   └── carga-docente.pdf.ts
│   └── excel/           → Generadores con ExcelJS
│       ├── horario.excel.ts
│       ├── carga-docente.excel.ts
│       └── ocupacion-aulas.excel.ts
├── presentation/
│   ├── components/      → ReporteSelector, DescargarButton, ReportePreview
│   └── actions/         → generar-pdf.action.ts, generar-excel.action.ts
└── index.ts

src/modules/dashboard/
├── application/
│   ├── use-cases/       → ObtenerKPIsDirectorUseCase, ObtenerKPIsSecretariaUseCase
│   └── dtos/            → DashboardDirectorDTO, DashboardSecretariaDTO
├── infrastructure/      → Queries Supabase para indicadores
├── presentation/
│   ├── components/      → DashboardDirector, DashboardSecretaria, DashboardDocente
│   └── widgets/
│       ├── StatCard.tsx              → Tarjeta de indicador
│       ├── CargaDocenteChart.tsx     → Gráfico de barras de carga
│       ├── OcupacionChart.tsx        → Gráfico de ocupación por día
│       ├── CursosPorCicloChart.tsx   → Gráfico de barras por ciclo
│       ├── AlertasPendientes.tsx     → Lista de alertas
│       └── UltimasAcciones.tsx       → Últimos registros de auditoría
└── index.ts

src/app/api/reportes/route.ts → Endpoint de descarga de PDF/Excel
```

**Tareas concretas — Reportes:**
1. Instalar PDF-lib y ExcelJS
2. Crear el template PDF institucional: logo UNT, encabezado "Escuela Profesional de Ingeniería de Sistemas", período, pie de página con fecha y número de página
3. Generar PDF de horario completo (grilla semanal)
4. Generar PDF de horario filtrado por ciclo, docente o aula
5. Generar PDF de carga docente (tabla con porcentajes)
6. Generar Excel con hojas por ciclo + hoja de resumen de carga + hoja de ocupación
7. Crear el Route Handler en `app/api/reportes/` para la descarga

**Tareas concretas — Dashboard:**
1. Dashboard del Director: tarjetas (estado período, % disponibilidad registrada, cursos programados, ocupación de aulas) + gráficos (carga docente, cursos por ciclo, ocupación por día) + tabla de alertas + últimas acciones
2. Dashboard de la Secretaria: tarjetas (total docentes, cursos, aulas) + pendientes
3. Dashboard del Docente: estado de disponibilidad, carga asignada, horario semanal compacto
4. Usar Recharts o Chart.js para los gráficos (preguntar a Renato cuál instalar)

**Requerimientos funcionales que cubres:** RF-043 a RF-051

**Dependencias:** Necesitas datos de `horarios` (David), `docentes` (Laiza), `cursos` (Stefano), `aulas` (Stefano). Puedes empezar los componentes del dashboard con datos de prueba (mock) mientras esperas.

**Consejo:** Empieza por los widgets del dashboard con datos hardcodeados. Así cuando David termine el módulo de horarios, solo tienes que conectar los datos reales.

---

## Reglas del equipo

### 1. Cada uno trabaja SOLO en sus carpetas
Si necesitas algo de otro módulo, lo importas desde su `index.ts`. **NUNCA** editas archivos dentro de la carpeta de otro compañero. Si necesitas que alguien exporte algo nuevo, le escribes y él actualiza su `index.ts`.

### 2. Rama por módulo
```bash
# Cada uno trabaja en su rama
git checkout -b feature/auth          # Renato
git checkout -b feature/periodos      # Andy
git checkout -b feature/docentes      # Laiza
git checkout -b feature/cursos        # Stefano
git checkout -b feature/horarios      # David
git checkout -b feature/reportes      # Andres
```

Cuando termines un módulo, haces Pull Request a `develop`. Renato lo revisa y lo mergea.

### 3. No tocar shared/ sin avisar
La carpeta `shared/` es de todos, pero solo Renato la modifica directamente. Si necesitas un nuevo componente compartido, hook o constante, pídelo a Renato y él lo agrega. Esto evita conflictos.

### 4. Cada módulo exporta desde index.ts
Antes de que otro compañero pueda usar tu módulo, debes crear el `index.ts` que exporta lo público:

```typescript
// src/modules/docentes/index.ts
export type { Docente } from './domain/entities/docente.entity'
export type { IDocenteRepository } from './domain/repositories/docente.repository'
export { DocenteTable } from './presentation/components/docente-table'
// Solo lo que otros necesitan. No exportar infraestructura.
```

### 5. Comunicación de bloqueos
Si estás bloqueado porque un compañero aún no terminó su módulo, avisas en el grupo inmediatamente. Mientras tanto, trabaja con datos mock (de prueba).

### 6. Tests antes de PR
No hagas Pull Request sin haber corrido:
```bash
npx tsc --noEmit        # Sin errores de tipos
npx vitest run          # Tests pasan
```

---

## Documentos de referencia para TODOS

| Documento | Qué contiene | Cuándo leerlo |
|---|---|---|
| **PLANNING.md** | Requerimientos, reglas de negocio, algoritmo, historias de usuario | Antes de empezar cualquier módulo |
| **STRUCTURE.md** | Arquitectura de carpetas, reglas de dependencia, qué va en cada capa | Cuando tengas duda de dónde poner un archivo |
| **CLAUDE.md** | Reglas para Claude Code (si lo usan) | Al inicio del proyecto |
| **TEAM.md** | Este documento. Quién hace qué | Cuando tengas duda de quién es responsable |

---

## Contacto ante dudas

| Tipo de duda | Preguntarle a |
|---|---|
| Arquitectura, estructura, shared/ | Renato |
| Base de datos, Supabase, tablas | Renato |
| Períodos, estados, auditoría | Andy |
| Docentes, disponibilidad | Laiza |
| Cursos, aulas, grupos | Stefano |
| Algoritmo, horarios, conflictos | David |
| Reportes PDF/Excel, dashboard | Andres |
