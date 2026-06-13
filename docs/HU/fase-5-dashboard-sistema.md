# Historias de Usuario — Fase 5: Dashboard, Auditoría y Notificaciones

> Módulos: `dashboard`, `auditoria`, `notificaciones`
> Estado global: ✅ 3/3 DONE

---

## HU-014 — Dashboard ejecutivo ✅ DONE
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

**Notas técnicas:** Implementado en `src/modules/dashboard/` con dashboards para Director, Secretaria y Docente conectados a datos reales de Supabase.

---

## HU-015 — Registro de auditoría ✅ DONE
**Como** Director de Escuela
**Quiero** consultar el registro de auditoría
**Para** verificar qué acciones se realizaron, quién las realizó y cuándo

**Prioridad:** Media
**Criterios de aceptación:**
- Puedo filtrar por usuario, fecha, módulo y tipo de acción.
- Cada registro muestra: fecha/hora, usuario, acción, módulo, detalle (valores antes y después).
- Los registros no pueden ser editados ni eliminados.
- Puedo exportar el registro de auditoría a Excel.

**Notas técnicas:** Módulo completo en `src/modules/auditoria/` con exportación a Excel implementada en `export-auditoria-excel.action.ts`.

---

## HU-016 — Notificaciones del sistema ✅ DONE
**Como** Docente
**Quiero** recibir notificaciones cuando se abra el registro de disponibilidad o se publique el horario
**Para** estar al tanto de los plazos y la información relevante

**Prioridad:** Media
**Criterios de aceptación:**
- Recibo una notificación interna (dentro del sistema) cuando se abre el período de registro de disponibilidad.
- Recibo una notificación cuando faltan 3 días para el cierre del registro y aún no he registrado mi disponibilidad.
- Recibo una notificación cuando el horario es publicado.
- Puedo ver el historial de mis notificaciones.

**Notas técnicas:** Módulo completo en `src/modules/notificaciones/` con infrastructure, presentation (campana, lista, contenido) y actions para crear, obtener y marcar como leídas.
