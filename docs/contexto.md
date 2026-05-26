# Contexto del Proyecto

> Secciones 1-3 del PLANNING original. Información de referencia sobre el problema, justificación y actores del sistema.

---

## 1. Descripción General

Sistema web inteligente para la gestión y generación automática de horarios académicos de la Escuela Profesional de Ingeniería de Sistemas de la UNT, Trujillo, Perú.

Automatiza la creación de horarios semestrales reemplazando el proceso manual (hojas de cálculo, coordinaciones informales). Mediante un algoritmo de asignación inteligente, considera disponibilidad docente, capacidad de aulas, restricciones de simultaneidad, prioridades por categoría/antigüedad y restricciones del plan de estudios.

## 2. Problema Actual

- Generación manual toma 2–4 semanas (80–120 horas-persona/semestre)
- Conflictos se detectan tardíamente (docente en 2 cursos, aula doble-reservada)
- Modificaciones posteriores causan efecto cascada
- No hay registro histórico estructurado
- Carga docente distribuida inequitativamente
- No se respeta prioridad por categoría/antigüedad

## 3. Objetivos

- **OE-01:** Autenticación con RBAC (Director, Secretaria, Docente)
- **OE-02:** Gestión de docentes (datos, categoría, régimen, antigüedad, carga)
- **OE-03:** Gestión de cursos vinculados al plan de estudios
- **OE-04:** Gestión de aulas/laboratorios (capacidad, equipamiento, tipo)
- **OE-05:** Registro de disponibilidad docente
- **OE-06:** Algoritmo de generación automática de horarios
- **OE-07:** Reportes en PDF y Excel
- **OE-08:** Dashboard ejecutivo con KPIs
- **OE-09:** Módulo de auditoría
- **OE-10:** Gestión de períodos académicos

## 4. Alcance

**Dentro del alcance:** Docentes, cursos, aulas, disponibilidad, generación automática, modificación manual, reportes PDF/Excel, dashboard, auditoría, notificaciones, períodos académicos.

**Fuera del alcance:** Matrícula de estudiantes, gestión de notas, integración con planillas/RRHH, otras escuelas (v1), app móvil nativa, integración SGA/SIGA (v1), posgrado.

## 5. Actores del Sistema

### Director de Escuela
- Acceso total (lectura/escritura en todos los módulos)
- Ejecuta generación de horarios, aprueba, publica
- Accede a dashboard ejecutivo y auditoría completa

### Secretaria Académica
- Lectura/escritura en docentes, cursos, aulas (sin eliminar)
- Lectura de disponibilidad y horarios
- Genera reportes, accede a dashboard operativo
- **Sin** permiso para generar horarios, aprobar ni auditoría avanzada

### Docente
- Registra/modifica su propia disponibilidad
- Consulta horario publicado y su carga asignada
- **Sin** acceso a datos de otros docentes, gestión de cursos/aulas, dashboard ni auditoría
