# Historias de Usuario — Fase 5: Dashboard, Auditoría y Notificaciones

> Módulos: `dashboard`, `auditoria`, `notificaciones`
> Estado global: ✅ 1/3 READY — 2 pendientes

---

## HU-014 — Dashboard ejecutivo ✅ READY
**Como** Director de Escuela
**Quiero** visualizar un dashboard con indicadores clave del proceso
**Para** tomar decisiones informadas sobre la gestión académica

**Prioridad:** Media
**Criterios de aceptación:**
- Muestra el estado actual del período académico activo.
- Muestra el porcentaje de docentes que han registrado su disponibilidad.
- Muestra la distribución de carga docente (promedio, máximo, mínimo).
- Muestra la tasa de ocupación de aulas.
- Muestra alertas de conflictos o pendientes.

**Notas técnicas:** Los dashboards de Director, Secretaria y Docente tienen UI completa pero con datos decorativos/hardcoded. Para datos reales, depende de los módulos de disponibilidad y horarios.

---

## HU-015 — Registro de auditoría ⏳ PENDING
**Como** Director de Escuela
**Quiero** consultar el registro de auditoría
**Para** verificar qué acciones se realizaron, quién las realizó y cuándo

**Prioridad:** Media
**Criterios de aceptación:**
- Puedo filtrar por usuario, fecha, módulo y tipo de acción.
- Cada registro muestra: fecha/hora, usuario, acción, módulo, detalle (valores antes y después).
- Los registros no pueden ser editados ni eliminados.
- Puedo exportar el registro de auditoría a Excel.

**Notas técnicas:** La tabla `auditoria` ya existe en la BD con RLS (solo director puede leer). Falta el módulo frontend `src/modules/auditoria/` con tabla, filtros y exportación.

---

## HU-016 — Notificaciones del sistema ⏳ PENDING
**Como** Docente
**Quiero** recibir notificaciones cuando se abra el registro de disponibilidad o se publique el horario
**Para** estar al tanto de los plazos y la información relevante

**Prioridad:** Media
**Criterios de aceptación:**
- Recibo una notificación interna (dentro del sistema) cuando se abre el período de registro de disponibilidad.
- Recibo una notificación cuando faltan 3 días para el cierre del registro y aún no he registrado mi disponibilidad.
- Recibo una notificación cuando el horario es publicado.
- Puedo ver el historial de mis notificaciones.

**Notas técnicas:** La tabla `notificaciones` ya existe en la BD con RLS. Falta el módulo frontend `src/modules/notificaciones/` con campana, lista de notificaciones y servicio de creación.
