# Sistema de Horarios Académicos — UNT

> Sistema Inteligente de Gestión y Generación Automática de Horarios Académicos  
> Escuela Profesional de Ingeniería de Sistemas — Universidad Nacional de Trujillo

Sistema web que automatiza la creación de horarios semestrales, reemplazando el proceso manual (hojas de cálculo, coordinaciones informales). Mediante un algoritmo de asignación inteligente, considera disponibilidad docente, capacidad de aulas, restricciones de simultaneidad, prioridades por categoría/antigüedad y restricciones del plan de estudios.

## Stack Tecnológico

| Categoría | Tecnología |
|---|---|
| **Framework** | Next.js 16 (App Router + Server Actions) |
| **Frontend** | React 19 · TypeScript · TailwindCSS 4 · Shadcn/UI |
| **Backend** | Supabase (Auth + PostgreSQL + RLS) |
| **Validación** | Zod 4 · React Hook Form |
| **Reportes** | PDF-lib · ExcelJS |
| **Testing** | Vitest |

## Prerequisitos

- **Node.js** ≥ 20
- **npm** ≥ 10
- Cuenta en [Supabase](https://supabase.com/) (proyecto creado)

## Instalación

```bash
# 1. Clonar el repositorio
git clone <url-del-repositorio>
cd horarios_unt

# 2. Instalar dependencias
npm install

# 3. Configurar variables de entorno
cp .env.local.example .env.local
# Editar .env.local con los datos de tu proyecto Supabase

# 4. Crear las tablas en Supabase
# Ejecutar el contenido de supabase/init.sql en Supabase Dashboard > SQL Editor

# 5. Iniciar servidor de desarrollo
npm run dev
```

Abrir [http://localhost:3000](http://localhost:3000) en el navegador.

## Scripts disponibles

```bash
npm run dev       # Servidor de desarrollo
npm run build     # Build de producción
npm run start     # Servidor de producción
npm run lint      # Linter (ESLint)
npx vitest run    # Ejecutar tests
npx tsc --noEmit  # Verificar tipos
```

## Arquitectura

El proyecto sigue **Clean Architecture** con diseño módulo-first:

```
src/
├── modules/              # Módulos del dominio
│   ├── auth/             # Autenticación y RBAC
│   ├── periodos/         # Períodos académicos (máquina de estados)
│   ├── docentes/         # Gestión de docentes
│   ├── cursos/           # Cursos y grupos/secciones
│   ├── aulas/            # Aulas y restricciones
│   ├── disponibilidad/   # Grilla de disponibilidad docente
│   ├── horarios/         # ★ Algoritmo de generación (CSP)
│   ├── reportes/         # Generación PDF/Excel
│   ├── dashboard/        # KPIs por rol
│   ├── auditoria/        # Registro inmutable de acciones
│   ├── notificaciones/   # Sistema de notificaciones
│   ├── planes-estudio/   # Planes de estudio
│   └── carga-no-lectiva/ # Carga no lectiva docente
└── shared/               # Código compartido
    ├── components/       # UI (Shadcn/UI) + Layout
    ├── hooks/            # useAuth, useCurrentUser, etc.
    ├── lib/              # Supabase client, utils
    ├── types/            # Tipos compartidos
    └── constants/        # Bloques horarios, categorías, etc.
```

Cada módulo sigue la estructura de capas:
```
modulo/
├── domain/          # Entidades, interfaces de repositorio, servicios de dominio
├── application/     # Casos de uso, DTOs (Zod)
├── infrastructure/  # Implementación Supabase
├── presentation/    # Componentes React, Server Actions
└── index.ts         # API pública del módulo
```

## Roles del Sistema

| Rol | Permisos |
|---|---|
| **Director** | Acceso total. Genera, aprueba y publica horarios. Dashboard ejecutivo. Auditoría. |
| **Secretaria** | CRUD docentes/cursos/aulas (sin eliminar). Reportes. Dashboard operativo. |
| **Docente** | Registra disponibilidad. Consulta su horario y carga asignada. |

## Documentación

| Documento | Contenido |
|---|---|
| [PLANNING.md](PLANNING.md) | Índice de progreso del proyecto |
| [TEAM.md](TEAM.md) | Distribución de trabajo del equipo |
| [docs/contexto.md](docs/contexto.md) | Problema, objetivos, actores |
| [docs/requerimientos.md](docs/requerimientos.md) | RF-001 a RF-062, RNF, RN-001 a RN-032 |
| [docs/algoritmo.md](docs/algoritmo.md) | Algoritmo CSP y sistema de puntuación |
| [MANUAL_INSTALACION.md](MANUAL_INSTALACION.md) | Guía detallada de instalación |

## Equipo

Proyecto desarrollado por 6 integrantes. Ver [TEAM.md](TEAM.md) para la distribución completa.
