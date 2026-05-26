# Historias de Usuario — Fase 4: Reportes y Vistas

> Módulos: `reportes`
> Estado global: ✅ 4/6 DONE — 2 pendientes

---

## HU-011 — Descarga de horario en PDF ✅ DONE
**Como** Director de Escuela
**Quiero** descargar el horario aprobado en formato PDF
**Para** distribuirlo por canales oficiales de la universidad

**Prioridad:** Alta
**Criterios de aceptación:**
- El PDF incluye el logo de la universidad, el nombre de la escuela, el período académico.
- El horario se presenta en formato de grilla semanal por ciclo.
- Incluye un encabezado con la información institucional y un pie de página con la fecha de generación.
- Puedo seleccionar si descargar el horario completo o filtrado por ciclo, docente o aula.

---

## HU-012 — Descarga de horario en Excel ✅ DONE
**Como** Secretaria Académica
**Quiero** descargar el horario en formato Excel
**Para** realizar análisis adicionales o compartirlo en formato editable

**Prioridad:** Media
**Criterios de aceptación:**
- El archivo Excel contiene hojas separadas: una por ciclo, una de resumen de carga docente, una de ocupación de aulas.
- Cada hoja tiene formato con encabezados, bordes y colores institucionales.
- Los datos son editables para uso externo.

---

## HU-013 — Consulta de horario publicado (Docente) ✅ DONE
**Como** Docente
**Quiero** consultar el horario publicado para el semestre actual
**Para** conocer mis asignaciones de cursos, horarios y aulas

**Prioridad:** Alta
**Criterios de aceptación:**
- Veo únicamente mis asignaciones en formato de grilla semanal.
- Cada bloque muestra: curso, aula, hora de inicio y fin.
- Puedo filtrar por día de la semana.
- Puedo descargar mi horario individual en PDF.

**Notas técnicas:** El dashboard del docente muestra una grilla decorativa con datos hardcoded. Falta conectar con datos reales del módulo de horarios.

---

## HU-019 — Reporte de carga docente ✅ DONE
**Como** Director de Escuela
**Quiero** generar un reporte de carga docente
**Para** verificar la distribución equitativa de horas y cursos

**Prioridad:** Media
**Criterios de aceptación:**
- El reporte muestra: nombre del docente, categoría, régimen, horas asignadas, horas máximas, porcentaje de carga, cursos asignados.
- Resalta visualmente a los docentes con carga por encima del 90% de su máximo.
- Resalta a los docentes sin ninguna asignación.
- Disponible en PDF y Excel.

---

## HU-020 — Visualización de horario por aula ✅ DONE
**Como** Director de Escuela
**Quiero** ver el horario de ocupación de cada aula
**Para** evaluar la eficiencia en el uso de los espacios físicos

**Prioridad:** Baja
**Criterios de aceptación:**
- Puedo seleccionar un aula y ver su grilla semanal de ocupación.
- Cada bloque muestra el curso asignado y el docente.
- Los bloques libres se muestran en color diferenciado.
- Puedo ver el porcentaje de ocupación semanal del aula.

---

## HU-024 — Visualización de horario por ciclo ⏳ PENDING
**Como** Director de Escuela
**Quiero** ver el horario filtrado por ciclo académico
**Para** verificar que no haya superposición de cursos del mismo ciclo

**Prioridad:** Alta
**Criterios de aceptación:**
- Puedo seleccionar un ciclo (I al X) y ver solo los cursos de ese ciclo en la grilla.
- El sistema resalta visualmente si hay cursos del mismo ciclo en el mismo bloque horario.
- Puedo alternar rápidamente entre ciclos.
