# Historias de Usuario — Fase 3: Disponibilidad y Horarios

> Módulos: `disponibilidad`, `horarios`
> Estado global: ✅ 5/5 DONE

---

## HU-005 — Registro de disponibilidad docente ✅ DONE
**Como** Docente
**Quiero** registrar mis bloques horarios disponibles para el próximo semestre
**Para** que el sistema considere mi disponibilidad al generar el horario

**Prioridad:** Alta
**Criterios de aceptación:**
- Veo una grilla semanal (lunes a sábado) con bloques de 1 hora desde las 07:00 hasta las 21:00.
- Puedo marcar cada bloque como "Disponible" o "No disponible" con un clic o toque.
- Puedo marcar bloques preferidos (horario de preferencia) con un color diferenciado.
- El sistema muestra un resumen con el total de horas disponibles y el mínimo requerido según mi régimen.
- No puedo guardar la disponibilidad si el total de horas disponibles es menor al mínimo requerido.
- Solo puedo registrar disponibilidad mientras el período esté en estado "Recopilación".
- Recibo una confirmación visual al guardar exitosamente.

**Notas técnicas:** La tabla `disponibilidad` ya existe en la BD con RLS configurado. Falta el módulo frontend completo (`src/modules/disponibilidad/`).

---

## HU-008 — Generación automática de horarios ✅ DONE
**Como** Director de Escuela
**Quiero** ejecutar la generación automática del horario
**Para** obtener una propuesta óptima de asignación de docentes, cursos y aulas

**Prioridad:** Alta
**Criterios de aceptación:**
- El botón de generación solo está habilitado cuando el período está en estado "Generación".
- Antes de ejecutar, el sistema verifica que todos los docentes hayan registrado su disponibilidad y que todos los cursos tengan la información completa.
- El sistema muestra una barra de progreso o indicador de estado durante la ejecución del algoritmo.
- Al finalizar, muestra el horario generado en formato de grilla visual.
- Muestra un resumen de la generación: cursos asignados, cursos sin asignar (si los hay), porcentaje de preferencias respetadas, distribución de carga docente.
- Puedo volver a ejecutar la generación con diferentes parámetros o después de realizar ajustes.

**Notas técnicas:** Las tablas `horarios` y `asignaciones` ya existen en la BD. Falta el módulo `src/modules/horarios/` con el algoritmo de 9 fases (ver `docs/algoritmo.md`).

---

## HU-009 — Modificación manual de horario ✅ DONE
**Como** Director de Escuela
**Quiero** modificar manualmente una asignación en el horario generado
**Para** ajustar casos excepcionales que el algoritmo no contempló

**Prioridad:** Alta
**Criterios de aceptación:**
- Puedo seleccionar un bloque horario y reasignar el docente, el aula o el horario.
- Al intentar guardar la modificación, el sistema valida en tiempo real si se genera algún conflicto.
- Si hay conflicto, el sistema muestra una descripción clara del conflicto y no permite guardar hasta que se resuelva.
- La modificación se registra en el módulo de auditoría con el motivo del cambio.

---

## HU-010 — Aprobación y publicación del horario ✅ DONE
**Como** Director de Escuela
**Quiero** aprobar y publicar el horario final
**Para** que los docentes y la comunidad académica puedan consultarlo

**Prioridad:** Alta
**Criterios de aceptación:**
- Solo puedo aprobar un horario que no tenga conflictos pendientes.
- Al aprobar, el estado del período cambia a "Aprobado".
- Al publicar, el estado cambia a "Publicado" y los docentes reciben una notificación.
- Una vez publicado, las modificaciones requieren un flujo especial de cambio post-publicación.

---

## HU-023 — Horario post-publicación con control de cambios ✅ DONE
**Como** Director de Escuela
**Quiero** realizar modificaciones al horario después de su publicación
**Para** atender situaciones imprevistas (licencias, renuncias, cambios de último momento)

**Prioridad:** Media
**Criterios de aceptación:**
- Las modificaciones post-publicación requieren un motivo obligatorio.
- Cada modificación se registra como un "cambio post-publicación" en la auditoría.
- Los docentes afectados reciben una notificación del cambio.
- Se mantiene el historial de la asignación original y la modificación.
