---
description: Seguridad 3 niveles, RBAC, JWT y matriz de permisos por rol
paths:
  - "src/modules/auth/**"
  - "src/app/**/proxy.*"
  - "src/app/**/layout.*"
---

# Seguridad (3 niveles)

| Nivel | Tecnología | Función |
|---|---|---|
| 1. proxy.ts Next.js | JWT verification | Autenticación + rol antes de procesar ruta |
| 2. Server Actions | Role check interno | Cada acción verifica rol del usuario |
| 3. RLS Supabase | PostgreSQL policies | Última defensa a nivel de fila |

## Autenticación
- JWT con refresh token en cookie HttpOnly, Secure, SameSite=Lax.
- Sesión expira tras 8h de inactividad.

## Roles y permisos
Roles: `director`, `secretaria`, `docente`.

| Recurso | Director | Secretaria | Docente |
|---|---|---|---|
| Docentes | CRUD | CR (sin eliminar) | — |
| Cursos | CRUD | CR | — |
| Aulas | CRUD | CR | — |
| Disponibilidad propia | — | — | CRU |
| Generación horarios | Ejecutar | — | — |
| Aprobación/Publicación | Ejecutar | — | — |
| Reportes | Generar/Descargar | Generar/Descargar | Propio |
| Auditoría | Lectura completa | — | — |
| Períodos | CRUD | Lectura | Lectura |

Referencia completa: `docs/workflows-seguridad-roadmap.md`
