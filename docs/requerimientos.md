# Requerimientos del Sistema

> Secciones 5-7 del PLANNING original. Requerimientos funcionales, no funcionales y reglas de negocio.

---

## Requerimientos Funcionales (RF)

### Autenticación y Autorización
- **RF-001:** Login con correo institucional + contraseña via Supabase Auth
- **RF-002:** RBAC con 3 roles: Director, Secretaria, Docente
- **RF-003:** Redirección automática al dashboard según rol
- **RF-004:** Sesión expira tras 8h de inactividad
- **RF-005:** Cambio de contraseña por el usuario
- **RF-006:** Recuperación de contraseña por email
- **RF-007:** Protección de rutas por autenticación + rol

### Gestión de Docentes
- **RF-008:** CRUD con datos: nombres, apellidos, DNI, correo, teléfono, categoría, régimen, condición, fecha ingreso, carga máxima, estado
- **RF-009:** Validación unicidad DNI y correo
- **RF-010:** Edición de docente existente
- **RF-011:** Desactivación conservando historial
- **RF-012:** Cálculo automático de antigüedad
- **RF-013:** Listado paginado con búsqueda

### Gestión de Cursos
- **RF-014:** CRUD con: código, nombre, ciclo, tipo, horas teóricas/prácticas, créditos, grupos, laboratorio
- **RF-015:** Validación unicidad código
- **RF-016:** Edición de curso
- **RF-017:** Asociación curso ↔ período
- **RF-018:** Listado filtrable por ciclo, tipo, período

### Gestión de Aulas
- **RF-019:** CRUD con: código, nombre, ubicación, capacidad, tipo, equipamiento, estado
- **RF-020:** Validación unicidad código
- **RF-021:** Edición de aula
- **RF-022:** Restricciones de disponibilidad por bloque
- **RF-023:** Listado filtrable por tipo, capacidad, estado

### Disponibilidad Docente
- **RF-024:** Grilla semanal interactiva (L-S, 07:00-21:00)
- **RF-025:** Bloques: Disponible / No disponible / Preferido
- **RF-026:** Validación mínimo de horas según régimen
- **RF-027:** Modificación solo en estado "Recopilación"
- **RF-028:** Resumen de estado de registro para Director
- **RF-029:** Notificaciones de recordatorio 3 días antes del cierre

### Generación de Horarios
- **RF-030:** Generación automática a solicitud del Director
- **RF-031:** Validación pre-ejecución de datos completos
- **RF-032:** Respeta todas las reglas de negocio (sección RN)
- **RF-033:** Progreso en tiempo real
- **RF-034:** Resultado en grilla visual
- **RF-035:** Regeneración con parámetros diferentes
- **RF-036:** Modificación manual con validación en tiempo real
- **RF-037:** Resaltado visual de conflictos

### Aprobación y Publicación
- **RF-038:** Aprobación cambia estado a "Aprobado"
- **RF-039:** Impide aprobación con conflictos pendientes
- **RF-040:** Publicación cambia estado a "Publicado"
- **RF-041:** Notificación a docentes al publicar
- **RF-042:** Modificaciones post-publicación con motivo obligatorio

### Reportes
- **RF-043:** PDF con formato institucional (logo, encabezados)
- **RF-044:** Horario completo en PDF filtrable por ciclo/docente/aula
- **RF-045:** Reporte carga docente en PDF y Excel
- **RF-046:** Reporte ocupación de aulas en PDF y Excel
- **RF-047:** Horario en Excel con hojas por ciclo + resúmenes
- **RF-048:** Horario individual del docente en PDF

### Dashboard
- **RF-049:** Dashboard ejecutivo para Director (período, disponibilidad, carga, ocupación, alertas)
- **RF-050:** Dashboard operativo para Secretaria (completitud datos, pendientes)
- **RF-051:** Indicadores se actualizan al acceder

### Auditoría
- **RF-052:** Registro automático: fecha/hora, usuario, rol, módulo, acción, datos antes/después
- **RF-053:** Registros inmutables (no editar ni eliminar)
- **RF-054:** Filtrado por usuario, fecha, módulo, acción
- **RF-055:** Exportación a Excel

### Notificaciones
- **RF-056:** Notificaciones internas para: apertura registro, recordatorio cierre, publicación horario, modificación post-publicación
- **RF-057:** Indicador de no leídas en navbar
- **RF-058:** Historial de notificaciones

### Períodos Académicos
- **RF-059:** Crear períodos con nombre, fechas inicio/fin, fecha límite disponibilidad
- **RF-060:** Estados: Configuración → Recopilación → Generación → Aprobado → Publicado → Cerrado
- **RF-061:** Máximo 1 período no-Cerrado simultáneamente
- **RF-062:** Historial completo de períodos con horarios

---

## Requerimientos No Funcionales (RNF)

| RNF | Descripción clave |
|---|---|
| **RNF-001 Rendimiento** | Generación ≤30s (50 docentes, 60 cursos, 20 aulas). Páginas <2s. CRUD <500ms. Dashboard <3s. PDF <10s. |
| **RNF-002 Escalabilidad** | 100 usuarios concurrentes. BD escalable sin cambiar código. Modular para agregar escuelas. |
| **RNF-003 Seguridad** | HTTPS TLS 1.3. Hashing bcrypt/Argon2. JWT 1h + refresh. Validación cliente+servidor. RLS. URLs temporales. |
| **RNF-004 Usabilidad** | Shadcn/UI. Feedback visual inmediato. Validación inline en español. Drag & drop en grilla desktop. Tooltips. |
| **RNF-005 Disponibilidad** | 99.5% mensual (Vercel + Supabase). Zero-downtime deploys. Backups diarios 7 días. |
| **RNF-006 Mantenibilidad** | TypeScript strict. Tests ≥70% módulos críticos. JSDoc funciones públicas. Clean Architecture. Bajo acoplamiento. |
| **RNF-007 Accesibilidad** | WCAG 2.1 AA. Navegación teclado. Contrastes mínimos. Textos alternativos. |
| **RNF-008 Responsividad** | Desktop 1280px+. Tablet 768-1279px. Móvil 320-767px. Grilla adaptable. Formularios una columna en móvil. |

---

## Reglas de Negocio (RN)

### Restricciones de Docentes
- **RN-001:** No simultaneidad docente (restricción dura)
- **RN-002:** Carga máxima: DE=40h, TC=20h, TP=12h
- **RN-003:** Solo asignar en bloques con disponibilidad
- **RN-004:** Prioridad por categoría: Principal > Asociado > Auxiliar
- **RN-005:** Antigüedad desempata dentro de misma categoría
- **RN-006:** Nombrados priorizan sobre contratados
- **RN-007:** Inactivos excluidos de asignación
- **RN-008:** 30min mínimo entre asignaciones en edificios diferentes

### Restricciones de Aulas
- **RN-009:** No simultaneidad de aula (restricción dura)
- **RN-010:** Capacidad ≥ estudiantes esperados
- **RN-011:** Labs de cómputo solo para cursos prácticos
- **RN-012:** Aulas teóricas no para cursos con lab (salvo autorización Director)
- **RN-013:** Inactivas/Mantenimiento excluidas
- **RN-014:** Restricciones de uso compartido respetadas

### Restricciones de Cursos y Horarios
- **RN-015:** Cursos del mismo ciclo no se superponen (restricción dura)
- **RN-016:** Teórico/práctico en bloques no consecutivos (preferible días diferentes)
- **RN-017:** Rango horario: 07:00–21:00
- **RN-018:** Bloques de 1 hora (2h = 2 bloques consecutivos)
- **RN-019:** Máximo 6h consecutivas por ciclo/día
- **RN-020:** Práctica en bloque/día diferente a la teoría del mismo curso

### Restricciones del Período
- **RN-021:** Solo 1 período no-Cerrado activo
- **RN-022:** Transición secuencial estricta (excepción: Generación → Recopilación)
- **RN-023:** Fecha límite disponibilidad < fecha inicio período
- **RN-024:** No generar si falta disponibilidad (salvo autorización Director)

### Restricciones de Auditoría y Seguridad
- **RN-025:** Toda mutación se audita. Sin excepciones.
- **RN-026:** Registros de auditoría inmutables
- **RN-027:** Cambios post-publicación con motivo + notificación
- **RN-028:** Sin acceso fuera de permisos del rol (incluso por URL)

### Restricciones de Asignación
- **RN-029:** Prerequisitos no se superponen
- **RN-030:** Preferir mismo docente para teoría y práctica
- **RN-031:** Considerar afinidad docente-curso (restricción blanda)
- **RN-032:** No asignar práctico a lab sin software requerido
