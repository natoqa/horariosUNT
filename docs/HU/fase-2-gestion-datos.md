# Historias de Usuario — Fase 2: Gestión de Datos Maestros

> Módulos: `periodos`, `docentes`, `cursos`, `aulas`
> Estado global: ✅ 9/9 READY

---

## HU-002 — Creación de período académico ✅ READY
**Como** Director de Escuela
**Quiero** crear un nuevo período académico (semestre)
**Para** configurar el contexto temporal sobre el cual se generará el horario

**Prioridad:** Alta
**Criterios de aceptación:**
- Puedo definir nombre (ej. "2026-I"), fecha de inicio, fecha de fin.
- Puedo definir la fecha límite para el registro de disponibilidad docente.
- No puede existir más de un período en estado "Activo" simultáneamente.
- El sistema valida que las fechas sean coherentes (inicio < fin, límite < inicio).
- El período se crea en estado "Configuración" y puede avanzar por los estados: Configuración → Recopilación → Generación → Aprobado → Publicado → Cerrado.

---

## HU-003 — Registro de docente ✅ READY
**Como** Secretaria Académica
**Quiero** registrar un nuevo docente en el sistema
**Para** que esté disponible para la asignación de cursos

**Prioridad:** Alta
**Criterios de aceptación:**
- Puedo ingresar: nombres, apellidos, DNI, correo institucional, teléfono.
- Puedo seleccionar: categoría (Principal, Asociado, Auxiliar), régimen (Dedicación Exclusiva, Tiempo Completo, Tiempo Parcial), condición (Nombrado, Contratado).
- Puedo registrar la fecha de ingreso a la universidad para el cálculo de antigüedad.
- Puedo definir la carga horaria máxima permitida según su régimen.
- El sistema valida que el DNI y correo no estén duplicados.
- El docente se crea en estado "Activo".

---

## HU-004 — Edición de docente ✅ READY
**Como** Secretaria Académica
**Quiero** editar la información de un docente existente
**Para** mantener actualizados los datos de categoría, régimen o contacto

**Prioridad:** Alta
**Criterios de aceptación:**
- Puedo modificar cualquier campo del docente excepto el DNI.
- Los cambios se registran en el módulo de auditoría con los valores anteriores y nuevos.
- Si el docente tiene asignaciones en un período activo, el sistema advierte sobre el impacto del cambio.

---

## HU-017 — Desactivación de docente ✅ READY
**Como** Director de Escuela
**Quiero** desactivar un docente que ya no pertenece a la escuela
**Para** que no aparezca en las opciones de asignación de futuros períodos

**Prioridad:** Baja
**Criterios de aceptación:**
- El docente pasa a estado "Inactivo" pero sus registros históricos se conservan.
- No se elimina ningún dato del sistema.
- El docente inactivo no aparece en los listados de asignación ni en la recopilación de disponibilidad.

---

## HU-006 — Gestión de cursos ✅ READY
**Como** Director de Escuela
**Quiero** registrar los cursos del plan de estudios en el sistema
**Para** que estén disponibles para la generación del horario

**Prioridad:** Alta
**Criterios de aceptación:**
- Puedo registrar: código del curso, nombre, ciclo (I al X), tipo (Teórico, Práctico, Teórico-Práctico).
- Puedo definir: horas teóricas semanales, horas prácticas semanales, número de créditos.
- Puedo definir: número de grupos (secciones) cuando el curso tiene más de un grupo.
- Puedo indicar si el curso requiere laboratorio y qué tipo de laboratorio.
- El sistema valida que el código del curso no esté duplicado.

---

## HU-022 — Gestión de múltiples grupos por curso ✅ READY
**Como** Director de Escuela
**Quiero** definir múltiples grupos (secciones) para un mismo curso
**Para** que el algoritmo genere asignaciones independientes por grupo

**Prioridad:** Alta
**Criterios de aceptación:**
- Puedo definir el número de grupos para un curso (ej. Grupo A y Grupo B).
- Cada grupo requiere su propia asignación de docente, aula y horario.
- Los grupos del mismo curso no pueden estar en el mismo bloque horario (los estudiantes eligen un grupo).
- El algoritmo trata cada grupo como una unidad de asignación independiente.

---

## HU-007 — Gestión de aulas ✅ READY
**Como** Secretaria Académica
**Quiero** registrar las aulas y laboratorios disponibles
**Para** que el sistema pueda asignarlas en la generación del horario

**Prioridad:** Alta
**Criterios de aceptación:**
- Puedo registrar: código del aula, nombre descriptivo, ubicación (pabellón, piso), capacidad máxima.
- Puedo seleccionar el tipo: Aula Teórica, Laboratorio de Cómputo, Laboratorio Especializado, Auditorio.
- Puedo indicar el equipamiento disponible: proyector, computadoras, pizarra inteligente, software instalado.
- Puedo definir si el aula tiene restricciones de uso (por ejemplo, uso exclusivo de otra escuela en ciertos bloques).
- Puedo activar o desactivar un aula temporalmente (por mantenimiento, por ejemplo).

---

## HU-018 — Restricción de aula por bloque ✅ READY
**Como** Secretaria Académica
**Quiero** definir restricciones de uso de un aula en bloques específicos
**Para** respetar acuerdos de uso compartido con otras escuelas

**Prioridad:** Baja
**Criterios de aceptación:**
- Puedo seleccionar un aula y marcar bloques horarios como "No disponible" para la escuela.
- Puedo agregar un motivo de la restricción (ej. "Uso de Escuela de Informática").
- El algoritmo de generación respeta estas restricciones.
