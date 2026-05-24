# CLAUDE.md — Sistema de Horarios Académicos UNT

## Proyecto
Sistema Inteligente de Gestión y Generación Automática de Horarios Académicos
Escuela Profesional de Ingeniería de Sistemas — Universidad Nacional de Trujillo

## Documentos de referencia
- `PLANNING.md` → Requerimientos (RF-001 a RF-062), reglas de negocio (RN-001 a RN-032), historias de usuario, algoritmo de generación. **Leer antes de implementar cualquier módulo.**
- `STRUCTURE.md` → Arquitectura de carpetas, reglas de dependencia, qué va en cada capa.

## Stack (versiones exactas — no cambiar)
- Next.js 16.2.6 (App Router, Server Components, Server Actions)
- TypeScript strict mode
- Tailwind CSS 4.3.0
- Shadcn/UI CLI v4 (Radix UI)
- React Hook Form + Zod
- TanStack Table
- Supabase (PostgreSQL, Auth, RLS)
- PDF-lib + ExcelJS (reportes)
- Despliegue: Vercel + Supabase Cloud

## Arquitectura: Clean Architecture + Module-First

```
src/
├── shared/              # Componentes UI, hooks, utils compartidos
├── modules/             # Cada módulo es independiente
│   ├── auth/
│   ├── periodos/
│   ├── docentes/
│   ├── cursos/
│   ├── aulas/
│   ├── disponibilidad/
│   ├── horarios/        # Módulo central (algoritmo)
│   ├── reportes/
│   ├── dashboard/
│   ├── auditoria/
│   └── notificaciones/
└── app/                 # Solo ruteo Next.js, sin lógica
```

Cada módulo tiene: `domain/ → application/ → infrastructure/ → presentation/`

## Reglas obligatorias

### Independencia de módulos
- Un módulo SOLO importa de: sí mismo, `shared/`, o el `index.ts` de otro módulo. Motivo: evitar acoplamiento y conflictos de merge en equipo.
- NUNCA importar archivos internos de otro módulo. Usar el barrel `index.ts`. Motivo: si el módulo cambia internamente, no rompe a los demás.
- `domain/` NO importa de `infrastructure/`, `presentation/` ni de Next.js/Supabase/React.

### Next.js
- Server Components por defecto. `'use client'` solo con interactividad. Motivo: menos JS al navegador.
- Server Actions para mutaciones. No crear endpoints REST para CRUD. Motivo: menos boilerplate.
- Las páginas en `app/` son delgadas: solo importan componentes de `modules/`. Sin lógica de negocio.

### Validación
- Todo input se valida con Zod en el Server Action ANTES de la base de datos.
- Esquemas Zod en `application/dtos/` de cada módulo. Se reutilizan en cliente y servidor.

### Base de datos
- No SQL directo. Usar cliente tipado de Supabase.
- Toda tabla con RLS activado y políticas por rol.
- No modificar esquema sin confirmación.

### Seguridad
- Tres niveles: middleware Next.js → Server Action → RLS Supabase.
- JWT con refresh token en cookie HttpOnly, Secure, SameSite=Lax.
- Roles: director, secretaria, docente.

### Auditoría
- Toda mutación registra entrada en auditoría. Sin excepciones.

### Código
- Código en inglés. UI en español.
- Archivos: kebab-case. Componentes: PascalCase.
- Manejar siempre: loading, error, empty, success.
- Cero `any`. Usar `unknown` y validar.

### Tests
- Cada use-case y domain service debe tener test unitario.
- Tests junto al archivo: `archivo.ts` → `archivo.test.ts`

## Orden de implementación
1. auth → 2. periodos → 3. docentes → 4. cursos → 5. aulas
6. disponibilidad → 7. horarios → 8. reportes → 9. dashboard → 10. auditoria