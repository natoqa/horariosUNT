# 📘 Manual de Instalación

## Sistema Inteligente de Gestión y Generación Automática de Horarios Académicos
**Escuela Profesional de Ingeniería de Sistemas — UNT**

---

## Índice

1. [Descripción del Proyecto](#1--descripción-del-proyecto)
2. [Requisitos Previos](#2--requisitos-previos)
3. [Clonar el Repositorio](#3--clonar-el-repositorio)
4. [Instalar Dependencias](#4--instalar-dependencias)
5. [Configurar Supabase (Backend)](#5--configurar-supabase-backend)
6. [Configurar Variables de Entorno](#6--configurar-variables-de-entorno)
7. [Inicializar la Base de Datos](#7--inicializar-la-base-de-datos)
8. [Crear Usuarios de Prueba (Seed)](#8--crear-usuarios-de-prueba-seed)
9. [Ejecutar el Proyecto](#9--ejecutar-el-proyecto)
10. [Credenciales de Acceso](#10--credenciales-de-acceso)
11. [Estructura del Proyecto](#11--estructura-del-proyecto)
12. [Stack Tecnológico](#12--stack-tecnológico)
13. [Solución de Problemas](#13--solución-de-problemas)

---

## 1 — Descripción del Proyecto

Este sistema permite gestionar de forma automatizada los horarios académicos de la Escuela Profesional de Ingeniería de Sistemas de la UNT. Incluye:

- **Gestión de períodos académicos** (ciclos, fechas, estados)
- **Registro de docentes, cursos y aulas**
- **Registro de disponibilidad horaria** por docente
- **Generación automática de horarios** mediante algoritmo CSP de 9 fases
- **Reportes** en PDF y Excel (carga docente, ocupación de aulas, horario por ciclo)
- **Dashboard ejecutivo** por rol (Director, Secretaria, Docente)
- **Sistema de notificaciones y auditoría**
- **Chat con IA** (Mistral AI) para consultas sobre el sistema

### Roles del sistema

| Rol | Acceso |
|---|---|
| **Director** | Acceso total: períodos, docentes, cursos, aulas, horarios, reportes, auditoría |
| **Secretaria** | Docentes, cursos, aulas, horarios (vista), reportes |
| **Docente** | Disponibilidad propia, horario propio, dashboard |

---

## 2 — Requisitos Previos

Antes de comenzar, asegúrate de tener instalado lo siguiente:

| Herramienta | Versión mínima | Verificar con |
|---|---|---|
| **Node.js** | v18.17.0 o superior (recomendado v20+) | `node --version` |
| **npm** | v9.0.0 o superior | `npm --version` |
| **Git** | Cualquier versión reciente | `git --version` |
| **Navegador web** | Chrome, Firefox, Edge (actualizado) | — |

> [!TIP]
> Si no tienes Node.js instalado, descárgalo desde [https://nodejs.org](https://nodejs.org). La versión LTS es la recomendada.

### Cuenta requerida

- **Supabase**: Necesitas una cuenta gratuita en [https://supabase.com](https://supabase.com) para la base de datos y autenticación.
- **Mistral AI** *(opcional)*: Si deseas usar el chat con IA, necesitas una API Key de [https://console.mistral.ai](https://console.mistral.ai).

---

## 3 — Clonar el Repositorio

```bash
git clone https://github.com/<tu-organizacion>/horarios_unt.git
cd horarios_unt
```

> [!NOTE]
> Reemplaza `<tu-organizacion>` con la URL real del repositorio. Si ya lo tienes descargado, simplemente navega a la carpeta del proyecto.

---

## 4 — Instalar Dependencias

Desde la raíz del proyecto, ejecuta:

```bash
npm install
```

Esto instalará todas las dependencias listadas en `package.json`. El proceso puede tardar unos minutos.

> [!WARNING]
> Si ves errores de permisos en Windows, intenta ejecutar la terminal como Administrador. En Linux/Mac, usa `sudo npm install` solo si es necesario.

---

## 5 — Configurar Supabase (Backend)

### 5.1 — Crear un proyecto en Supabase

1. Ve a [https://supabase.com](https://supabase.com) e inicia sesión.
2. Haz clic en **"New Project"**.
3. Completa:
   - **Name**: `horarios-unt` (o el nombre que prefieras)
   - **Database Password**: Genera una contraseña segura (guárdala)
   - **Region**: Selecciona la más cercana (ej: `South America (São Paulo)`)
4. Haz clic en **"Create new project"** y espera a que se configure (~2 minutos).

### 5.2 — Obtener las credenciales

Una vez creado el proyecto, ve a **Settings → API** y copia los siguientes valores:

| Campo | Dónde encontrarlo |
|---|---|
| `Project URL` | Settings → API → Project URL |
| `anon public` key | Settings → API → Project API Keys → `anon` `public` |
| `service_role` key | Settings → API → Project API Keys → `service_role` `secret` |

> [!CAUTION]
> La **service_role key** tiene acceso completo a la base de datos. **Nunca la compartas ni la subas a un repositorio público.** Solo se usa del lado del servidor.

---

## 6 — Configurar Variables de Entorno

### 6.1 — Crear el archivo `.env.local`

En la raíz del proyecto, crea un archivo llamado `.env.local` (o copia el ejemplo proporcionado):

```bash
cp .env.local.example .env.local
```

### 6.2 — Editar `.env.local`

Abre el archivo y reemplaza los valores con tus credenciales de Supabase:

```env
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=https://TU-PROYECTO.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=tu-anon-key-aqui
SUPABASE_SERVICE_ROLE_KEY=tu-service-role-key-aqui

# Mistral AI Configuration (opcional - solo para chat con IA)
MISTRAL_API_KEY=tu-mistral-api-key-aqui
```

> [!IMPORTANT]
> - Las variables que empiezan con `NEXT_PUBLIC_` son expuestas al navegador, por eso solo llevan la clave pública (`anon`).
> - `SUPABASE_SERVICE_ROLE_KEY` es **privada** y solo se usa en Server Actions.
> - `MISTRAL_API_KEY` es **opcional**. Sin ella, el módulo de chat no funcionará pero el resto del sistema sí.

---

## 7 — Inicializar la Base de Datos

Debes ejecutar los scripts SQL en el **SQL Editor** de Supabase para crear las tablas, funciones, triggers y políticas de seguridad (RLS).

### 7.1 — Script principal (`init.sql`)

1. Ve al **Dashboard de Supabase** de tu proyecto.
2. En el menú lateral, selecciona **SQL Editor**.
3. Haz clic en **"New query"**.
4. Copia y pega **todo** el contenido de `supabase/init.sql`.
5. Haz clic en **"Run"**.

> [!IMPORTANT]
> Este script crea **todas** las tablas necesarias del sistema:
> `docentes`, `cursos`, `planes_estudio`, `periodos`, `grupos`, `aulas`, `aula_restricciones`, `disponibilidad`, `horarios`, `asignaciones`, `cargas_no_lectivas`, `actividades_no_lectivas`, `auditoria`, `notificaciones`

### 7.2 — Migraciones adicionales

Después del script principal, ejecuta las migraciones en **este orden exacto** (una por una en el SQL Editor):

| # | Archivo | Descripción |
|---|---|---|
| 1 | `supabase/migrations/add_escuela_column.sql` | Agrega columna de escuela |
| 2 | `supabase/migrations/add_carga_no_lectiva.sql` | Tablas para carga no lectiva |
| 3 | `supabase/migrations/add_planes_estudio.sql` | Tablas para planes de estudio |
| 4 | `supabase/migrations/fix_disponibilidad_estado_check.sql` | Fix en check de disponibilidad |
| 5 | `supabase/migrations/fix_horarios_estado_check.sql` | Fix en check de horarios |
| 6 | `supabase/migrations/fix_policies_case_sensitivity.sql` | Fix de mayúsculas/minúsculas en policies |
| 7 | `supabase/migrations/fix_horarios_carga_no_lectiva.sql` | Fix de horarios y carga no lectiva |

> [!TIP]
> Si alguna migración falla por un objeto que ya existe (ej: `relation already exists`), es porque el `init.sql` ya lo incluye. Puedes ignorar ese error específico y continuar con la siguiente.

### 7.3 — Verificar la base de datos

En Supabase Dashboard → **Table Editor**, verifica que existan las siguientes tablas:

```
✅ docentes
✅ cursos
✅ planes_estudio
✅ periodos
✅ grupos
✅ aulas
✅ aula_restricciones
✅ disponibilidad
✅ horarios
✅ asignaciones
✅ cargas_no_lectivas
✅ actividades_no_lectivas
✅ auditoria
✅ notificaciones
```

---

## 8 — Crear Usuarios de Prueba (Seed)

El proyecto incluye un script para crear 3 usuarios de prueba con sus respectivos roles.

### 8.1 — Ejecutar el seed

Desde la raíz del proyecto, ejecuta:

```bash
npx tsx scripts/seed-users.ts
```

> [!NOTE]
> Este comando usa `tsx` para ejecutar TypeScript directamente. Se instala automáticamente con `npx` si no lo tienes.

### 8.2 — Salida esperada

Si todo sale bien, verás algo como:

```
✅ director@unitru.edu.pe creado (director)
✅ secretaria@unitru.edu.pe creado (secretaria)
✅ docente@unitru.edu.pe creado (docente)
```

Si los usuarios ya existen:

```
⚠ director@unitru.edu.pe ya existe — actualizando metadata...
  ✅ director@unitru.edu.pe metadata actualizada
```

### 8.3 — Datos de prueba adicionales (opcional)

En la carpeta `scripts/` hay scripts SQL adicionales para cargar datos de prueba:

| Archivo | Contenido |
|---|---|
| `scripts/seed-grupos.sql` | Grupos/secciones de cursos |
| `scripts/seed-disponibilidad.sql` | Disponibilidad horaria de docentes |

Para cargarlos, copia su contenido en el **SQL Editor** de Supabase y ejecútalos.

> [!WARNING]
> Los seeds de datos adicionales requieren que existan los registros base (docentes, cursos, períodos). Ejecútalos **después** de haber creado esos registros, ya sea desde el sistema o desde sus respectivos SQL.

---

## 9 — Ejecutar el Proyecto

### 9.1 — Modo desarrollo

```bash
npm run dev
```

La aplicación estará disponible en:

```
http://localhost:3000
```

> [!TIP]
> Next.js compilará las páginas bajo demanda. La primera carga puede tardar unos segundos mientras se compila.

### 9.2 — Modo producción (opcional)

Para compilar y servir la versión optimizada:

```bash
npm run build
npm run start
```

### 9.3 — Lint

Para verificar el código con ESLint:

```bash
npm run lint
```

---

## 10 — Credenciales de Acceso

Una vez el proyecto esté corriendo, accede a `http://localhost:3000` y usa las siguientes credenciales:

| Rol | Email | Contraseña |
|---|---|---|
| **Director** | `director@unitru.edu.pe` | `Director123!` |
| **Secretaria** | `secretaria@unitru.edu.pe` | `Secretaria123!` |
| **Docente** | `docente@unitru.edu.pe` | `Docente123!` |

### Flujo recomendado para primera prueba

```
1. Iniciar sesión como Director
2. Crear un período académico          → /director/periodos
3. Registrar docentes (3-5)            → /director/docentes
4. Registrar cursos + grupos           → /director/cursos
5. Registrar aulas (5-6)              → /director/aulas
6. Avanzar período a "Recopilación"
7. Iniciar sesión como Docente
8.   Registrar disponibilidad          → /docente/disponibilidad
9. Volver como Director
10. Avanzar período a "Generación"
11. Generar horario automático          → /director/horarios
12. Aprobar y publicar horario
13. Verificar reportes (PDF/Excel)      → /director/reportes
14. Iniciar sesión como Docente → ver horario publicado
```

---

## 11 — Estructura del Proyecto

```
horarios_unt/
├── app/                          # Rutas de la aplicación (Next.js App Router)
│   ├── (auth)/                   # Rutas de autenticación
│   │   ├── login/                #   Inicio de sesión
│   │   ├── recuperar/            #   Recuperar contraseña
│   │   └── cambiar-password/     #   Cambiar contraseña
│   ├── (dashboard)/              # Rutas protegidas por rol
│   │   ├── director/             #   Panel del Director (15 módulos)
│   │   ├── secretaria/           #   Panel de la Secretaria (14 módulos)
│   │   └── docente/              #   Panel del Docente (8 módulos)
│   ├── api/                      # API Routes
│   │   ├── chat/                 #   Chat con IA (Mistral)
│   │   ├── docentes/             #   Carga masiva de docentes
│   │   └── planes-estudio/       #   Plantilla de planes de estudio
│   ├── globals.css               # Estilos globales (Tailwind CSS v4)
│   ├── layout.tsx                # Layout raíz
│   └── page.tsx                  # Página raíz (redirige al login)
│
├── src/                          # Código fuente modular
│   ├── modules/                  # Módulos de dominio (Clean Architecture)
│   │   ├── auth/                 #   Autenticación y sesiones
│   │   ├── auditoria/            #   Registro de auditoría
│   │   ├── aulas/                #   Gestión de aulas
│   │   ├── carga-no-lectiva/     #   Carga no lectiva docente
│   │   ├── cursos/               #   Gestión de cursos
│   │   ├── dashboard/            #   Dashboard por rol
│   │   ├── disponibilidad/       #   Disponibilidad horaria
│   │   ├── docentes/             #   Gestión de docentes
│   │   ├── horarios/             #   Generación de horarios (CSP)
│   │   ├── notificaciones/       #   Sistema de notificaciones
│   │   ├── periodos/             #   Gestión de períodos
│   │   ├── planes-estudio/       #   Planes de estudio
│   │   └── reportes/             #   Generación de reportes PDF/Excel
│   └── shared/                   # Componentes y utilidades compartidas
│       ├── components/           #   Componentes UI (shadcn/ui)
│       ├── hooks/                #   Custom hooks
│       └── lib/                  #   Utilidades (Supabase client, etc.)
│
├── supabase/                     # Configuración de base de datos
│   ├── init.sql                  #   Script de inicialización completo
│   └── migrations/               #   Migraciones incrementales (7 archivos)
│
├── scripts/                      # Scripts de utilidad
│   ├── seed-users.ts             #   Crear usuarios de prueba
│   ├── seed-grupos.sql           #   Datos de prueba: grupos
│   └── seed-disponibilidad.sql   #   Datos de prueba: disponibilidad
│
├── docs/                         # Documentación del proyecto
│   ├── HU/                       #   Historias de usuario (5 fases)
│   ├── contexto.md               #   Contexto del proyecto
│   ├── requerimientos.md         #   Requerimientos funcionales/no funcionales
│   ├── algoritmo.md              #   Algoritmo CSP de generación
│   └── guia-pruebas-flujo-completo.md  # Guía de pruebas paso a paso
│
├── proxy.ts                      # Middleware de autenticación y rutas
├── package.json                  # Dependencias y scripts
├── tsconfig.json                 # Configuración TypeScript
├── vitest.config.ts              # Configuración de tests
├── eslint.config.mjs             # Configuración ESLint
├── postcss.config.mjs            # PostCSS (Tailwind CSS)
├── components.json               # Configuración de shadcn/ui
└── .env.local.example            # Plantilla de variables de entorno
```

### Arquitectura de cada módulo

Cada módulo en `src/modules/` sigue una **Arquitectura Limpia** con la siguiente estructura:

```
modulo/
├── application/          # Casos de uso y DTOs
│   ├── dtos/             #   Data Transfer Objects (validación con Zod)
│   └── use-cases/        #   Lógica de negocio
├── domain/               # Entidades y contratos
│   ├── entities/         #   Tipos/interfaces del dominio
│   └── repositories/     #   Interfaces de repositorio
├── infrastructure/       # Implementaciones concretas
│   └── supabase-*.ts     #   Repositorios Supabase
└── presentation/         # Capa de presentación
    ├── actions/           #   Server Actions (Next.js)
    └── components/        #   Componentes React
```

---

## 12 — Stack Tecnológico

| Categoría | Tecnología | Versión |
|---|---|---|
| **Framework** | Next.js (App Router) | 16.2.6 |
| **Lenguaje** | TypeScript | 5.x |
| **UI Library** | React | 19.2.4 |
| **Estilos** | Tailwind CSS | 4.x |
| **Componentes** | shadcn/ui (base-nova) | 4.8.0 |
| **Íconos** | Lucide React | 1.16.0 |
| **Backend/DB** | Supabase (PostgreSQL) | — |
| **Autenticación** | Supabase Auth + SSR | 0.10.3 |
| **Formularios** | React Hook Form + Zod | 7.76.1 / 4.4.3 |
| **Reportes PDF** | pdf-lib | 1.17.1 |
| **Reportes Excel** | ExcelJS + xlsx | 4.4.0 / 0.18.5 |
| **Chat IA** | Vercel AI SDK + Mistral | 6.x / 3.x |
| **Tema** | next-themes | 0.4.6 |
| **Toasts** | Sonner | 2.0.7 |
| **Testing** | Vitest | 4.1.7 |
| **Linting** | ESLint + eslint-config-next | 9.x |

---

## 13 — Solución de Problemas

### ❌ `npm install` falla con errores de permisos

```bash
# Windows: Ejecutar PowerShell como Administrador
# Linux/Mac:
sudo npm install
```

### ❌ Error: `NEXT_PUBLIC_SUPABASE_URL is not defined`

Verifica que el archivo `.env.local` exista en la raíz del proyecto y que contenga las variables correctas. Reinicia el servidor de desarrollo después de crear o modificar `.env.local`.

```bash
# Detener el servidor (Ctrl+C) y reiniciar
npm run dev
```

### ❌ Error al ejecutar `seed-users.ts`: `Falta SUPABASE_SERVICE_ROLE_KEY`

Asegúrate de que `SUPABASE_SERVICE_ROLE_KEY` está definida en `.env.local` y es la key de tipo `service_role` (no la `anon`).

### ❌ Las tablas no se crean correctamente

- Verifica que ejecutaste `init.sql` **completo** (sin cortar).
- Ejecuta las migraciones en el **orden indicado** en la sección 7.2.
- Si una tabla ya existe, el error `relation already exists` es seguro ignorar.

### ❌ Login dice "Invalid login credentials"

- Verifica que ejecutaste el script `seed-users.ts` exitosamente.
- Asegúrate de usar las credenciales exactas de la sección 10.
- Verifica que tu `NEXT_PUBLIC_SUPABASE_URL` apunta al proyecto correcto.

### ❌ El chat con IA no responde

- Verifica que `MISTRAL_API_KEY` está configurada en `.env.local`.
- La API Key se obtiene desde [https://console.mistral.ai](https://console.mistral.ai).
- Esta funcionalidad es **opcional** y no afecta al resto del sistema.

### ❌ Puerto 3000 ya está en uso

```bash
# Usar un puerto diferente
npx next dev -p 3001
```

### ❌ Error de compilación con TypeScript

```bash
# Limpiar caché y recompilar
rm -rf .next
npm run dev
```

En Windows:
```powershell
Remove-Item -Recurse -Force .next
npm run dev
```

---

> [!NOTE]
> Para una guía detallada de pruebas funcionales paso a paso, consulta el archivo `docs/guia-pruebas-flujo-completo.md` incluido en el proyecto.
