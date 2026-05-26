# Workflows, Seguridad y Roadmap

> Secciones 13-18 del PLANNING original. Flujos de trabajo, seguridad, dashboard design, escalabilidad y roadmap.

---

## Workflows del Sistema

### Login
1. Usuario ingresa correo + contraseña → 2. Supabase Auth verifica → 3. JWT con rol → 4. Middleware redirige al dashboard del rol → 5. Auditoría registra login

### Generación de Horarios
1. Director accede módulo Horarios → 2. Período en estado "Generación" → 3. Resumen pre-generación → 4. Ejecutar → 5. Fases 1-8 con progreso → 6. Grilla visual + resumen estadístico → 7. Ajustes manuales o aprobación

### Aprobación y Publicación
1. Director revisa horario borrador → 2. Sin conflictos → 3. Aprobar (estado → "Aprobado") → 4. Publicar (estado → "Publicado") → 5. Notificación a docentes → 6. Auditoría

### Modificación Manual
1. Director selecciona bloque → 2. Modifica docente/aula/horario → 3. Validación en tiempo real (disponibilidad, carga, conflictos) → 4. Si conflicto: mostrar y bloquear. Si ok: guardar → 5. Post-publicación requiere motivo → 6. Auditoría + notificación

### Descarga PDF
1. Usuario selecciona tipo de reporte y filtros → 2. Servidor genera con PDF-lib (encabezado institucional, contenido, pie de página) → 3. Descarga inmediata → 4. Auditoría

---

## Estrategia de Seguridad (3 niveles)

| Nivel | Tecnología | Función |
|---|---|---|
| **1. Middleware Next.js** | JWT verification | Verifica autenticación + rol antes de procesar ruta |
| **2. Server Actions** | Role check interno | Cada acción verifica rol del usuario |
| **3. RLS Supabase** | PostgreSQL policies | Última línea de defensa a nivel de fila |

### Matriz de Permisos

| Recurso | Director | Secretaria | Docente |
|---|---|---|---|
| Docentes | CRUD | CR (sin eliminar) | — |
| Cursos | CRUD | CR | — |
| Aulas | CRUD | CR | — |
| Disponibilidad propia | — | — | CRU |
| Disponibilidad todos | Lectura | Lectura | — |
| Generación horarios | Ejecutar | — | — |
| Aprobación/Publicación | Ejecutar | — | — |
| Horario publicado | Lectura | Lectura | Lectura (propio) |
| Reportes | Generar/Descargar | Generar/Descargar | Descargar propio |
| Auditoría | Lectura completa | — | — |
| Períodos | CRUD | Lectura | Lectura |

---

## Diseño de Dashboard

### Director: tarjetas (período, disponibilidad%, cursos programados, ocupación aulas) + gráficos (carga docente, cursos/ciclo, ocupación/día) + alertas + últimas acciones
### Secretaria: tarjetas (docentes, cursos, aulas, pendientes) + tareas pendientes
### Docente: tarjetas (estado disponibilidad, carga, cursos) + grilla semanal personal

---

## Roadmap (20 semanas)

| Fase | Semanas | Contenido |
|---|---|---|
| 1. Planificación | 1-2 | PLANNING.md, MER, wireframes, config repo/Supabase/Vercel |
| 2. Diseño | 3-4 | UI alta fidelidad Figma, sistema de diseño, grilla, formularios |
| 3. Backend | 5-8 | Schema DB, RLS, domain+infra+use-cases, Server Actions, auth, auditoría, tests |
| 4. Frontend | 9-12 | Shadcn/UI, layout, auth screens, CRUD modules, grilla disponibilidad, horario, dashboard, notificaciones, auditoría vista, responsive |
| 5. Algoritmo | 13-15 | 9 fases del algoritmo, tests exhaustivos, tests rendimiento |
| 6. Reportes | 16-17 | PDF-lib, ExcelJS, formato institucional, filtros |
| 7. Pruebas | 18-19 | E2E, usabilidad, rendimiento, seguridad, accesibilidad |
| 8. Despliegue | 20 | Producción Vercel/Supabase, datos reales, capacitación, manual |
| 9. Mantenimiento | Continuo | Monitoreo, incidencias, actualizaciones, mejoras |

---

## Escalabilidad Futura
- Microservicios (Horarios, Reportes, Notificaciones independientes)
- Caché Next.js (Data Cache, Full Route Cache)
- Paginación servidor + virtualización TanStack Table
- Sistema de colas para operaciones costosas
- Notificaciones: interno → email → push → WhatsApp/Telegram
- IA: predicción disponibilidad, recomendación asignación, detección anomalías, algoritmos genéticos
- Integración APIs: SGA, SIGA, Portal Transparencia, SUNEDU
