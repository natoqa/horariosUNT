# PLANNING.md — Documento Maestro del Proyecto

## Sistema Inteligente de Gestión y Generación Automática de Horarios Académicos

### Escuela Profesional de Ingeniería de Sistemas — Universidad Nacional de Trujillo (UNT)

**Versión:** 1.0.0  
**Fecha:** 24 de mayo de 2026  
**Tipo de documento:** Planificación técnica, funcional y arquitectónica  
**Estado:** En planificación  
**Clasificación:** Documento interno — uso exclusivo del equipo de desarrollo

---

## Tabla de Contenidos

1. [Introducción del Proyecto](#1-introducción-del-proyecto)
2. [Análisis del Problema Actual](#2-análisis-del-problema-actual)
3. [Actores del Sistema](#3-actores-del-sistema)
4. [Historias de Usuario](#4-historias-de-usuario)
5. [Requerimientos Funcionales](#5-requerimientos-funcionales)
6. [Requerimientos No Funcionales](#6-requerimientos-no-funcionales)
7. [Reglas de Negocio](#7-reglas-de-negocio)
8. [Arquitectura General del Sistema](#8-arquitectura-general-del-sistema)
9. [Stack Tecnológico](#9-stack-tecnológico)
10. [Estructura de Módulos](#10-estructura-de-módulos)
11. [Diseño de la Lógica del Algoritmo de Horarios](#11-diseño-de-la-lógica-del-algoritmo-de-horarios)
12. [Sistema de Puntuación del Algoritmo](#12-sistema-de-puntuación-del-algoritmo)
13. [Workflows del Sistema](#13-workflows-del-sistema)
14. [Diseño de Dashboard](#14-diseño-de-dashboard)
15. [Estrategia de Seguridad](#15-estrategia-de-seguridad)
16. [Estrategia de Escalabilidad Futura](#16-estrategia-de-escalabilidad-futura)
17. [Roadmap del Desarrollo](#17-roadmap-del-desarrollo)
18. [Conclusión](#18-conclusión)

---

# 1. Introducción del Proyecto

## 1.1 Descripción General

El presente proyecto consiste en el diseño, desarrollo e implementación de un sistema web inteligente para la gestión y generación automática de horarios académicos de la Escuela Profesional de Ingeniería de Sistemas de la Universidad Nacional de Trujillo (UNT), ubicada en la ciudad de Trujillo, región La Libertad, Perú.

El sistema automatizará el proceso completo de creación de horarios semestrales, reemplazando el procedimiento manual actual que involucra hojas de cálculo, coordinaciones informales y múltiples iteraciones de corrección. Mediante un algoritmo de asignación inteligente, el sistema considerará la disponibilidad docente, la capacidad de aulas, las restricciones de simultaneidad, las prioridades por categoría y antigüedad del docente, y las restricciones propias del plan de estudios vigente.

El producto final será una aplicación web accesible desde cualquier navegador moderno, con roles diferenciados para el Director de Escuela, la Secretaria Académica y los Docentes, permitiendo un flujo de trabajo colaborativo, auditable y transparente.

## 1.2 Problema Actual

En la actualidad, la elaboración de horarios académicos en la Escuela Profesional de Ingeniería de Sistemas se realiza de forma predominantemente manual. El Director de Escuela, con apoyo de la Secretaria Académica, construye la grilla horaria semestre a semestre utilizando hojas de cálculo (Microsoft Excel o Google Sheets), correo electrónico y reuniones presenciales con los docentes.

Este proceso presenta los siguientes problemas críticos:

- La generación de un horario completo toma entre dos y cuatro semanas de trabajo intenso antes del inicio de cada semestre.
- Los conflictos de horario (un docente asignado a dos cursos al mismo tiempo, un aula reservada para dos grupos simultáneamente) se detectan tardíamente, a menudo cuando el semestre ya ha comenzado.
- Las modificaciones posteriores desencadenan un efecto cascada que obliga a rehacer porciones significativas del horario.
- No existe un registro histórico estructurado de las asignaciones de semestres anteriores, lo que impide la toma de decisiones basada en datos.
- La carga académica de los docentes se distribuye de forma desigual, generando malestar y reclamos recurrentes.
- No se respeta de forma sistemática la prioridad por categoría ni por antigüedad del docente al momento de asignar horarios y cursos.

## 1.3 Justificación

La automatización de la generación de horarios académicos se justifica por los siguientes motivos:

**Justificación operativa:** El tiempo invertido en el proceso manual excede las 80 horas-persona por semestre. Un sistema automatizado reduciría este tiempo a menos de 4 horas, incluyendo la revisión y aprobación del horario generado.

**Justificación académica:** Un horario libre de conflictos y con distribución equitativa de la carga docente mejora directamente la calidad del servicio educativo, reduciendo los incidentes de clases superpuestas, aulas inadecuadas y docentes sobrecargados.

**Justificación normativa:** La Universidad Nacional de Trujillo, como institución pública, está sujeta a las disposiciones de la SUNEDU y al Estatuto Universitario, que exigen transparencia y trazabilidad en los procesos administrativos académicos. El sistema proporcionará un registro auditable de cada decisión de asignación.

**Justificación tecnológica:** La Escuela Profesional de Ingeniería de Sistemas, por su naturaleza formativa, debe liderar la adopción de soluciones tecnológicas dentro de la universidad, sirviendo como caso de éxito replicable para otras escuelas profesionales.

## 1.4 Objetivos Generales

- Desarrollar un sistema web inteligente que automatice la generación, gestión y publicación de horarios académicos para la Escuela Profesional de Ingeniería de Sistemas de la UNT, eliminando los conflictos de asignación y reduciendo el tiempo del proceso en un 95%.

## 1.5 Objetivos Específicos

- OE-01: Implementar un módulo de autenticación con control de acceso basado en roles (RBAC) que permita al Director de Escuela, la Secretaria Académica y los Docentes acceder únicamente a las funcionalidades autorizadas para su perfil.
- OE-02: Desarrollar un módulo de gestión de docentes que centralice la información personal, categoría, régimen, antigüedad, carga máxima permitida y estado de cada docente adscrito a la escuela.
- OE-03: Crear un módulo de gestión de cursos vinculado al plan de estudios vigente, que registre el ciclo, tipo (teórico, práctico, teórico-práctico), horas semanales, prerrequisitos y grupo(s) asociados.
- OE-04: Implementar un módulo de gestión de aulas y laboratorios que registre la capacidad, equipamiento, ubicación y tipo de cada espacio disponible.
- OE-05: Diseñar e implementar un módulo de registro de disponibilidad docente que permita a cada profesor indicar sus bloques horarios disponibles para el semestre correspondiente.
- OE-06: Desarrollar el algoritmo de generación automática de horarios que considere todas las restricciones, prioridades y preferencias, produciendo un horario óptimo libre de conflictos.
- OE-07: Implementar un módulo de reportes que genere documentos PDF y archivos Excel con los horarios generados, estadísticas de carga docente y reportes de auditoría.
- OE-08: Crear un dashboard ejecutivo con indicadores clave (KPIs) que permita al Director de Escuela monitorear en tiempo real el estado del proceso de generación de horarios.
- OE-09: Implementar un módulo de auditoría que registre cada acción realizada en el sistema, incluyendo el usuario, la fecha/hora, la acción ejecutada y los datos modificados.
- OE-10: Desarrollar un módulo de gestión de períodos académicos que permita configurar los semestres, definir fechas de inicio y fin, y controlar el estado del proceso de generación para cada período.

## 1.6 Alcance

### Dentro del alcance

- Gestión de docentes de la Escuela de Ingeniería de Sistemas (nombrados y contratados).
- Gestión de cursos del plan de estudios vigente de Ingeniería de Sistemas.
- Gestión de aulas y laboratorios asignados a la escuela.
- Registro de disponibilidad horaria de cada docente por semestre.
- Generación automática de horarios con validación de restricciones.
- Modificación manual de horarios generados con validación en tiempo real.
- Generación de reportes en PDF y Excel.
- Dashboard de indicadores para el Director de Escuela.
- Sistema de auditoría de acciones.
- Notificaciones internas del sistema.
- Gestión de períodos académicos.

### Fuera del alcance

- Matrícula de estudiantes.
- Gestión de notas o actas.
- Integración con el sistema de planillas o recursos humanos de la UNT.
- Gestión de horarios de otras escuelas profesionales (versión inicial).
- Aplicación móvil nativa (el sistema será responsive y accesible desde navegador móvil).
- Integración con sistemas de terceros (SGA, SIGA) en la primera versión.
- Generación de horarios para programas de posgrado.

## 1.7 Beneficios

- **Reducción de tiempo:** De 2–4 semanas a menos de 1 día para la generación completa del horario semestral.
- **Eliminación de conflictos:** El algoritmo garantiza que no existan asignaciones simultáneas de docentes o aulas.
- **Distribución equitativa:** La carga académica se distribuye respetando las normas de la universidad y las prioridades docentes.
- **Transparencia:** Cada asignación queda registrada con su justificación, permitiendo la auditoría completa del proceso.
- **Trazabilidad histórica:** El sistema conserva el historial de horarios de semestres anteriores para análisis y mejora continua.
- **Reducción de errores humanos:** La validación automática en cada etapa del proceso elimina los errores de transcripción y cálculo.
- **Agilidad en modificaciones:** Los cambios posteriores se validan en tiempo real contra todas las restricciones, mostrando inmediatamente los conflictos potenciales.
- **Accesibilidad:** Docentes, secretaria y director acceden al sistema desde cualquier dispositivo con navegador web.

---

# 2. Análisis del Problema Actual

## 2.1 Proceso Actual de Creación de Horarios

El flujo de trabajo vigente para la elaboración del horario semestral en la Escuela Profesional de Ingeniería de Sistemas sigue, de forma aproximada, la siguiente secuencia:

**Paso 1 — Recopilación de disponibilidad:** El Director de Escuela envía un correo electrónico o mensaje de WhatsApp a cada docente solicitando sus bloques horarios disponibles para el nuevo semestre. Los docentes responden en formatos heterogéneos: algunos envían una tabla en Word, otros un mensaje de texto libre, otros una imagen de una tabla manuscrita. No hay un formato estandarizado.

**Paso 2 — Consolidación manual:** La Secretaria Académica recibe las respuestas y las traslada a una hoja de cálculo maestra. Este proceso toma entre 3 y 5 días hábiles, dependiendo de la velocidad de respuesta de los docentes. Los docentes que no responden a tiempo son contactados individualmente por teléfono.

**Paso 3 — Armado del horario:** El Director de Escuela construye el horario curso por curso, asignando docentes y aulas en la hoja de cálculo. Cada asignación requiere verificar manualmente que el docente esté disponible en ese bloque, que el aula no esté ocupada y que no exceda la carga máxima permitida. Este proceso toma entre 5 y 10 días hábiles.

**Paso 4 — Revisión y corrección:** El borrador del horario se comparte con los docentes para observaciones. Se reciben correcciones que obligan a rehacer porciones del horario. Este ciclo de corrección se repite entre 2 y 4 veces.

**Paso 5 — Aprobación y publicación:** El Director de Escuela aprueba la versión final, se genera un documento PDF y se publica en la vitrina de la escuela y se envía por correo electrónico.

## 2.2 Problemas Existentes

### 2.2.1 Conflictos de Horarios

Los conflictos más frecuentes son:

- Un docente asignado a dos cursos distintos en el mismo bloque horario. Esto se detecta generalmente cuando el semestre ya ha iniciado y el docente reporta que no puede estar en dos aulas simultáneamente.
- Un aula o laboratorio asignado a dos grupos distintos en el mismo bloque. Esto genera que un grupo llegue al aula y la encuentre ocupada, debiendo buscar un espacio alternativo de emergencia.
- Un docente asignado a cursos en edificios distantes con bloques horarios consecutivos sin tiempo de traslado.

### 2.2.2 Trabajo Manual Excesivo

El proceso completo de generación del horario semestral consume aproximadamente 80 a 120 horas-persona por semestre, distribuidas entre el Director de Escuela y la Secretaria Académica. Este tiempo se invierte en tareas repetitivas y de baja complejidad intelectual que podrían ser automatizadas completamente.

### 2.2.3 Errores Humanos

Los errores más comunes incluyen:

- Transcripción incorrecta de la disponibilidad docente (confundir "disponible" con "no disponible" en un bloque específico).
- Cálculo incorrecto de la carga horaria acumulada de un docente.
- Asignación de un aula cuya capacidad es insuficiente para el número de estudiantes matriculados.
- Asignación de un curso práctico a un aula teórica sin el equipamiento necesario.
- Omisión involuntaria de un curso o grupo en el horario final.

### 2.2.4 Dificultad de Modificaciones

Cada modificación en el horario (por ejemplo, un docente que solicita cambio de horario después de la publicación) requiere:

- Verificar manualmente que el nuevo bloque propuesto esté libre para el docente.
- Verificar que el aula asignada esté disponible en el nuevo bloque.
- Verificar que no se genere un conflicto con otros cursos del mismo ciclo.
- Actualizar la hoja de cálculo maestra.
- Regenerar el documento PDF.
- Notificar a todos los afectados.

Este proceso puede tomar entre 2 y 4 horas por cada modificación individual.

### 2.2.5 Mala Distribución de Carga Académica

Sin un sistema que controle la carga horaria acumulada, algunos docentes quedan con una carga excesiva mientras otros tienen una carga muy por debajo del límite permitido. Esta distribución desigual genera reclamos y afecta la percepción de equidad en la escuela.

### 2.2.6 Mala Asignación de Aulas

Las aulas y laboratorios se asignan sin considerar sistemáticamente:

- La capacidad del aula versus el número de estudiantes esperados.
- El tipo de curso (teórico vs. práctico) versus el tipo de espacio (aula vs. laboratorio).
- La disponibilidad de equipamiento específico (proyector, computadoras, software especializado).
- La ubicación del aula en relación con las demás asignaciones del docente.

### 2.2.7 Pérdida de Tiempo

El proceso manual no solo consume tiempo del Director y la Secretaria, sino que también afecta a los docentes, quienes deben responder consultas, revisar borradores, reportar conflictos y esperar la versión final del horario. Se estima que cada docente invierte entre 3 y 5 horas por semestre en actividades relacionadas con la coordinación del horario.

### 2.2.8 Ausencia de Datos Históricos Estructurados

No existe un repositorio centralizado de los horarios de semestres anteriores en un formato que permita análisis cuantitativo. La información se conserva en archivos dispersos (PDFs, hojas de cálculo con diferentes nombres y formatos) sin una estructura común, lo que impide:

- Analizar patrones de asignación.
- Identificar docentes con sobrecarga recurrente.
- Evaluar el uso eficiente de los espacios físicos.
- Tomar decisiones basadas en evidencia para la planificación de nuevos semestres.

---

# 3. Actores del Sistema

## 3.1 Director de Escuela

### Perfil

El Director de la Escuela Profesional de Ingeniería de Sistemas es un docente ordinario de la universidad que ejerce el cargo de dirección por un período determinado según el Estatuto Universitario de la UNT. Es la máxima autoridad administrativa y académica de la escuela y es el responsable final de la aprobación del horario semestral.

### Permisos

- Acceso total al sistema (lectura y escritura en todos los módulos).
- Creación, edición y eliminación de períodos académicos.
- Gestión completa de docentes (registrar, editar, desactivar).
- Gestión completa de cursos (crear, editar, asignar a período).
- Gestión completa de aulas y laboratorios.
- Ejecución del algoritmo de generación automática de horarios.
- Modificación manual de horarios generados.
- Aprobación y publicación de horarios.
- Acceso al dashboard ejecutivo con todos los indicadores.
- Generación y descarga de todos los reportes (PDF, Excel).
- Acceso completo a los registros de auditoría.
- Gestión de configuraciones del sistema.

### Responsabilidades

- Definir y configurar cada período académico (semestre) con sus fechas y parámetros.
- Verificar que todos los cursos del plan de estudios estén registrados y actualizados.
- Revisar y aprobar la disponibilidad docente antes de ejecutar la generación.
- Ejecutar el algoritmo de generación de horarios y revisar el resultado.
- Resolver manualmente los conflictos que el algoritmo no pueda resolver automáticamente.
- Aprobar y publicar el horario final.
- Atender solicitudes de modificación posteriores a la publicación.

### Casos de Uso Principales

- CU-DIR-01: Iniciar sesión con credenciales institucionales.
- CU-DIR-02: Crear un nuevo período académico y configurar sus parámetros.
- CU-DIR-03: Registrar un nuevo docente en el sistema.
- CU-DIR-04: Registrar un nuevo curso asociado al plan de estudios.
- CU-DIR-05: Registrar una nueva aula o laboratorio.
- CU-DIR-06: Revisar la disponibilidad registrada por los docentes.
- CU-DIR-07: Ejecutar la generación automática de horarios.
- CU-DIR-08: Revisar el horario generado e identificar posibles ajustes.
- CU-DIR-09: Modificar manualmente una asignación con validación en tiempo real.
- CU-DIR-10: Aprobar y publicar el horario final.
- CU-DIR-11: Generar y descargar reportes en PDF y Excel.
- CU-DIR-12: Consultar el dashboard ejecutivo.
- CU-DIR-13: Revisar el registro de auditoría.
- CU-DIR-14: Cerrar un período académico.

## 3.2 Secretaria Académica

### Perfil

La Secretaria Académica es el personal administrativo de apoyo directo al Director de Escuela. Participa activamente en la recopilación de información, la carga de datos al sistema y la generación de documentos. No tiene autoridad para aprobar o publicar horarios, pero es responsable de la integridad de los datos ingresados.

### Permisos

- Acceso de lectura y escritura al módulo de docentes (registrar, editar, pero no eliminar).
- Acceso de lectura y escritura al módulo de cursos (registrar, editar).
- Acceso de lectura y escritura al módulo de aulas (registrar, editar).
- Acceso de lectura a la disponibilidad docente.
- Acceso de lectura a los horarios generados.
- Generación y descarga de reportes (PDF, Excel).
- Acceso de lectura al dashboard (indicadores operativos).
- Sin acceso al módulo de auditoría avanzada (solo puede ver sus propias acciones).
- Sin permiso para ejecutar la generación automática de horarios.
- Sin permiso para aprobar o publicar horarios.

### Responsabilidades

- Registrar y actualizar la información de docentes en el sistema.
- Registrar y actualizar los cursos del plan de estudios vigente.
- Registrar y actualizar las aulas y laboratorios disponibles.
- Verificar que la información ingresada sea correcta y esté completa.
- Generar los reportes solicitados por el Director.
- Dar soporte a los docentes en el uso del sistema (consultas básicas).

### Casos de Uso Principales

- CU-SEC-01: Iniciar sesión con credenciales asignadas.
- CU-SEC-02: Registrar un nuevo docente con toda su información.
- CU-SEC-03: Actualizar la información de un docente existente.
- CU-SEC-04: Registrar un nuevo curso del plan de estudios.
- CU-SEC-05: Actualizar la información de un curso existente.
- CU-SEC-06: Registrar una nueva aula o laboratorio.
- CU-SEC-07: Actualizar la información de un aula existente.
- CU-SEC-08: Consultar la disponibilidad registrada por los docentes.
- CU-SEC-09: Consultar el horario generado para un período específico.
- CU-SEC-10: Generar y descargar reportes en PDF y Excel.
- CU-SEC-11: Consultar el dashboard operativo.

## 3.3 Docente

### Perfil

Los docentes de la Escuela Profesional de Ingeniería de Sistemas son los usuarios finales que interactúan con el sistema principalmente para registrar su disponibilidad horaria y consultar el horario aprobado. Los docentes pueden ser nombrados (ordinarios) o contratados, y pertenecen a una categoría académica (Principal, Asociado, Auxiliar) con un régimen de dedicación (exclusiva, tiempo completo, tiempo parcial).

### Permisos

- Acceso exclusivo para registrar y modificar su propia disponibilidad horaria.
- Acceso de solo lectura al horario publicado.
- Acceso de solo lectura a su propia carga académica asignada.
- Sin acceso a los datos de otros docentes.
- Sin acceso al módulo de gestión de cursos, aulas o períodos.
- Sin acceso al dashboard ni a los reportes generales.
- Sin acceso al módulo de auditoría.

### Responsabilidades

- Registrar su disponibilidad horaria de forma completa y veraz antes de la fecha límite establecida por el Director.
- Revisar el horario publicado y reportar cualquier inconsistencia.
- Respetar el horario asignado una vez publicado y aprobado.

### Casos de Uso Principales

- CU-DOC-01: Iniciar sesión con credenciales asignadas.
- CU-DOC-02: Registrar su disponibilidad horaria para el período activo.
- CU-DOC-03: Modificar su disponibilidad dentro del plazo permitido.
- CU-DOC-04: Consultar el horario publicado.
- CU-DOC-05: Consultar su carga académica asignada.
- CU-DOC-06: Recibir notificaciones del sistema (apertura de registro, publicación de horario).

---

# 4. Historias de Usuario

## HU-001 — Inicio de sesión
**Como** Director de Escuela  
**Quiero** iniciar sesión con mi correo institucional y contraseña  
**Para** acceder a las funcionalidades de gestión del sistema  

**Prioridad:** Alta  
**Criterios de aceptación:**
- El sistema valida las credenciales contra Supabase Auth.
- Si las credenciales son correctas, redirige al dashboard correspondiente al rol.
- Si las credenciales son incorrectas, muestra un mensaje de error claro sin revelar información sensible.
- La sesión expira automáticamente después de 8 horas de inactividad.
- Se registra el evento de inicio de sesión en el módulo de auditoría.

## HU-002 — Creación de período académico
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

## HU-003 — Registro de docente
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

## HU-004 — Edición de docente
**Como** Secretaria Académica  
**Quiero** editar la información de un docente existente  
**Para** mantener actualizados los datos de categoría, régimen o contacto  

**Prioridad:** Alta  
**Criterios de aceptación:**
- Puedo modificar cualquier campo del docente excepto el DNI.
- Los cambios se registran en el módulo de auditoría con los valores anteriores y nuevos.
- Si el docente tiene asignaciones en un período activo, el sistema advierte sobre el impacto del cambio.

## HU-005 — Registro de disponibilidad docente
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

## HU-006 — Gestión de cursos
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

## HU-007 — Gestión de aulas
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

## HU-008 — Generación automática de horarios
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

## HU-009 — Modificación manual de horario
**Como** Director de Escuela  
**Quiero** modificar manualmente una asignación en el horario generado  
**Para** ajustar casos excepcionales que el algoritmo no contempló  

**Prioridad:** Alta  
**Criterios de aceptación:**
- Puedo seleccionar un bloque horario y reasignar el docente, el aula o el horario.
- Al intentar guardar la modificación, el sistema valida en tiempo real si se genera algún conflicto.
- Si hay conflicto, el sistema muestra una descripción clara del conflicto y no permite guardar hasta que se resuelva.
- La modificación se registra en el módulo de auditoría con el motivo del cambio.

## HU-010 — Aprobación y publicación del horario
**Como** Director de Escuela  
**Quiero** aprobar y publicar el horario final  
**Para** que los docentes y la comunidad académica puedan consultarlo  

**Prioridad:** Alta  
**Criterios de aceptación:**
- Solo puedo aprobar un horario que no tenga conflictos pendientes.
- Al aprobar, el estado del período cambia a "Aprobado".
- Al publicar, el estado cambia a "Publicado" y los docentes reciben una notificación.
- Una vez publicado, las modificaciones requieren un flujo especial de cambio post-publicación.

## HU-011 — Descarga de horario en PDF
**Como** Director de Escuela  
**Quiero** descargar el horario aprobado en formato PDF  
**Para** distribuirlo por canales oficiales de la universidad  

**Prioridad:** Alta  
**Criterios de aceptación:**
- El PDF incluye el logo de la universidad, el nombre de la escuela, el período académico.
- El horario se presenta en formato de grilla semanal por ciclo.
- Incluye un encabezado con la información institucional y un pie de página con la fecha de generación.
- Puedo seleccionar si descargar el horario completo o filtrado por ciclo, docente o aula.

## HU-012 — Descarga de horario en Excel
**Como** Secretaria Académica  
**Quiero** descargar el horario en formato Excel  
**Para** realizar análisis adicionales o compartirlo en formato editable  

**Prioridad:** Media  
**Criterios de aceptación:**
- El archivo Excel contiene hojas separadas: una por ciclo, una de resumen de carga docente, una de ocupación de aulas.
- Cada hoja tiene formato con encabezados, bordes y colores institucionales.
- Los datos son editables para uso externo.

## HU-013 — Consulta de horario publicado (Docente)
**Como** Docente  
**Quiero** consultar el horario publicado para el semestre actual  
**Para** conocer mis asignaciones de cursos, horarios y aulas  

**Prioridad:** Alta  
**Criterios de aceptación:**
- Veo únicamente mis asignaciones en formato de grilla semanal.
- Cada bloque muestra: curso, aula, hora de inicio y fin.
- Puedo filtrar por día de la semana.
- Puedo descargar mi horario individual en PDF.

## HU-014 — Dashboard ejecutivo
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

## HU-015 — Registro de auditoría
**Como** Director de Escuela  
**Quiero** consultar el registro de auditoría  
**Para** verificar qué acciones se realizaron, quién las realizó y cuándo  

**Prioridad:** Media  
**Criterios de aceptación:**
- Puedo filtrar por usuario, fecha, módulo y tipo de acción.
- Cada registro muestra: fecha/hora, usuario, acción, módulo, detalle (valores antes y después).
- Los registros no pueden ser editados ni eliminados.
- Puedo exportar el registro de auditoría a Excel.

## HU-016 — Notificaciones del sistema
**Como** Docente  
**Quiero** recibir notificaciones cuando se abra el registro de disponibilidad o se publique el horario  
**Para** estar al tanto de los plazos y la información relevante  

**Prioridad:** Media  
**Criterios de aceptación:**
- Recibo una notificación interna (dentro del sistema) cuando se abre el período de registro de disponibilidad.
- Recibo una notificación cuando faltan 3 días para el cierre del registro y aún no he registrado mi disponibilidad.
- Recibo una notificación cuando el horario es publicado.
- Puedo ver el historial de mis notificaciones.

## HU-017 — Desactivación de docente
**Como** Director de Escuela  
**Quiero** desactivar un docente que ya no pertenece a la escuela  
**Para** que no aparezca en las opciones de asignación de futuros períodos  

**Prioridad:** Baja  
**Criterios de aceptación:**
- El docente pasa a estado "Inactivo" pero sus registros históricos se conservan.
- No se elimina ningún dato del sistema.
- El docente inactivo no aparece en los listados de asignación ni en la recopilación de disponibilidad.

## HU-018 — Restricción de aula por bloque
**Como** Secretaria Académica  
**Quiero** definir restricciones de uso de un aula en bloques específicos  
**Para** respetar acuerdos de uso compartido con otras escuelas  

**Prioridad:** Baja  
**Criterios de aceptación:**
- Puedo seleccionar un aula y marcar bloques horarios como "No disponible" para la escuela.
- Puedo agregar un motivo de la restricción (ej. "Uso de Escuela de Informática").
- El algoritmo de generación respeta estas restricciones.

## HU-019 — Reporte de carga docente
**Como** Director de Escuela  
**Quiero** generar un reporte de carga docente  
**Para** verificar la distribución equitativa de horas y cursos  

**Prioridad:** Media  
**Criterios de aceptación:**
- El reporte muestra: nombre del docente, categoría, régimen, horas asignadas, horas máximas, porcentaje de carga, cursos asignados.
- Resalta visualmente a los docentes con carga por encima del 90% de su máximo.
- Resalta a los docentes sin ninguna asignación.
- Disponible en PDF y Excel.

## HU-020 — Visualización de horario por aula
**Como** Director de Escuela  
**Quiero** ver el horario de ocupación de cada aula  
**Para** evaluar la eficiencia en el uso de los espacios físicos  

**Prioridad:** Baja  
**Criterios de aceptación:**
- Puedo seleccionar un aula y ver su grilla semanal de ocupación.
- Cada bloque muestra el curso asignado y el docente.
- Los bloques libres se muestran en color diferenciado.
- Puedo ver el porcentaje de ocupación semanal del aula.

## HU-021 — Cambio de contraseña
**Como** cualquier usuario (Director, Secretaria, Docente)  
**Quiero** cambiar mi contraseña  
**Para** mantener la seguridad de mi cuenta  

**Prioridad:** Baja  
**Criterios de aceptación:**
- Debo ingresar mi contraseña actual antes de definir la nueva.
- La nueva contraseña debe cumplir requisitos mínimos: 8 caracteres, al menos una mayúscula, un número y un carácter especial.
- Al cambiar la contraseña, se cierra la sesión y debo iniciar sesión nuevamente.

## HU-022 — Gestión de múltiples grupos por curso
**Como** Director de Escuela  
**Quiero** definir múltiples grupos (secciones) para un mismo curso  
**Para** que el algoritmo genere asignaciones independientes por grupo  

**Prioridad:** Alta  
**Criterios de aceptación:**
- Puedo definir el número de grupos para un curso (ej. Grupo A y Grupo B).
- Cada grupo requiere su propia asignación de docente, aula y horario.
- Los grupos del mismo curso no pueden estar en el mismo bloque horario (los estudiantes eligen un grupo).
- El algoritmo trata cada grupo como una unidad de asignación independiente.

## HU-023 — Horario post-publicación con control de cambios
**Como** Director de Escuela  
**Quiero** realizar modificaciones al horario después de su publicación  
**Para** atender situaciones imprevistas (licencias, renuncias, cambios de último momento)  

**Prioridad:** Media  
**Criterios de aceptación:**
- Las modificaciones post-publicación requieren un motivo obligatorio.
- Cada modificación se registra como un "cambio post-publicación" en la auditoría.
- Los docentes afectados reciben una notificación del cambio.
- Se mantiene el historial de la asignación original y la modificación.

## HU-024 — Visualización de horario por ciclo
**Como** Director de Escuela  
**Quiero** ver el horario filtrado por ciclo académico  
**Para** verificar que no haya superposición de cursos del mismo ciclo  

**Prioridad:** Alta  
**Criterios de aceptación:**
- Puedo seleccionar un ciclo (I al X) y ver solo los cursos de ese ciclo en la grilla.
- El sistema resalta visualmente si hay cursos del mismo ciclo en el mismo bloque horario.
- Puedo alternar rápidamente entre ciclos.

## HU-025 — Recuperación de contraseña
**Como** cualquier usuario  
**Quiero** recuperar mi contraseña si la olvidé  
**Para** restablecer el acceso a mi cuenta sin contactar al administrador  

**Prioridad:** Media  
**Criterios de aceptación:**
- Puedo solicitar un enlace de recuperación ingresando mi correo institucional.
- Recibo un correo electrónico con un enlace válido por 30 minutos.
- El enlace me lleva a un formulario seguro para definir una nueva contraseña.

---

# 5. Requerimientos Funcionales

## Autenticación y Autorización

**RF-001:** El sistema debe permitir el inicio de sesión mediante correo electrónico institucional y contraseña, autenticado contra Supabase Auth.

**RF-002:** El sistema debe implementar control de acceso basado en roles (RBAC) con tres roles: Director, Secretaria, Docente.

**RF-003:** El sistema debe redirigir automáticamente al usuario a su dashboard correspondiente según su rol después del inicio de sesión.

**RF-004:** El sistema debe cerrar automáticamente la sesión después de 8 horas de inactividad.

**RF-005:** El sistema debe permitir el cambio de contraseña por parte del usuario.

**RF-006:** El sistema debe permitir la recuperación de contraseña mediante correo electrónico.

**RF-007:** El sistema debe proteger todas las rutas verificando que el usuario esté autenticado y tenga el rol adecuado.

## Gestión de Docentes

**RF-008:** El sistema debe permitir registrar docentes con los siguientes datos: nombres, apellidos, DNI, correo institucional, teléfono, categoría (Principal, Asociado, Auxiliar), régimen (Dedicación Exclusiva, Tiempo Completo, Tiempo Parcial), condición (Nombrado, Contratado), fecha de ingreso, carga horaria máxima, estado (Activo, Inactivo).

**RF-009:** El sistema debe validar la unicidad del DNI y correo electrónico al registrar un docente.

**RF-010:** El sistema debe permitir editar la información de un docente existente.

**RF-011:** El sistema debe permitir desactivar un docente, conservando su historial.

**RF-012:** El sistema debe calcular automáticamente la antigüedad del docente a partir de su fecha de ingreso.

**RF-013:** El sistema debe mostrar un listado paginado de docentes con búsqueda por nombre, categoría y estado.

## Gestión de Cursos

**RF-014:** El sistema debe permitir registrar cursos con: código, nombre, ciclo (I–X), tipo (Teórico, Práctico, Teórico-Práctico), horas teóricas, horas prácticas, créditos, número de grupos, requiere laboratorio (sí/no), tipo de laboratorio requerido.

**RF-015:** El sistema debe validar la unicidad del código del curso.

**RF-016:** El sistema debe permitir editar la información de un curso existente.

**RF-017:** El sistema debe permitir asociar cursos a un período académico específico.

**RF-018:** El sistema debe mostrar un listado de cursos filtrable por ciclo, tipo y período.

## Gestión de Aulas

**RF-019:** El sistema debe permitir registrar aulas con: código, nombre, ubicación (pabellón, piso), capacidad, tipo (Aula Teórica, Laboratorio de Cómputo, Laboratorio Especializado, Auditorio), equipamiento disponible, estado (Activa, Inactiva, Mantenimiento).

**RF-020:** El sistema debe validar la unicidad del código de aula.

**RF-021:** El sistema debe permitir editar la información de un aula.

**RF-022:** El sistema debe permitir definir restricciones de disponibilidad por bloque horario para cada aula.

**RF-023:** El sistema debe mostrar un listado de aulas filtrable por tipo, capacidad y estado.

## Disponibilidad Docente

**RF-024:** El sistema debe mostrar una grilla semanal interactiva (lunes a sábado, 07:00 a 21:00) para que el docente registre su disponibilidad.

**RF-025:** El sistema debe permitir marcar cada bloque como "Disponible", "No disponible" o "Preferido".

**RF-026:** El sistema debe validar que el total de horas disponibles sea igual o mayor al mínimo requerido según el régimen del docente.

**RF-027:** El sistema debe permitir al docente modificar su disponibilidad solo mientras el período esté en estado "Recopilación".

**RF-028:** El sistema debe mostrar al Director un resumen del estado de registro de disponibilidad de todos los docentes.

**RF-029:** El sistema debe enviar notificaciones de recordatorio a los docentes que no hayan registrado su disponibilidad 3 días antes del cierre.

## Generación de Horarios

**RF-030:** El sistema debe ejecutar el algoritmo de generación automática de horarios cuando el Director lo solicite.

**RF-031:** El sistema debe validar, antes de la ejecución, que todos los datos necesarios estén completos (disponibilidad, cursos, aulas).

**RF-032:** El algoritmo debe respetar todas las reglas de negocio definidas en la sección 7.

**RF-033:** El sistema debe mostrar el progreso de la generación en tiempo real.

**RF-034:** El sistema debe presentar el resultado de la generación en formato de grilla visual.

**RF-035:** El sistema debe permitir la regeneración del horario con los mismos o diferentes parámetros.

**RF-036:** El sistema debe permitir la modificación manual de asignaciones individuales con validación en tiempo real.

**RF-037:** El sistema debe resaltar visualmente los conflictos detectados durante la modificación manual.

## Aprobación y Publicación

**RF-038:** El sistema debe permitir al Director aprobar el horario, cambiando el estado del período a "Aprobado".

**RF-039:** El sistema debe impedir la aprobación si existen conflictos no resueltos.

**RF-040:** El sistema debe permitir al Director publicar el horario aprobado, cambiando el estado a "Publicado".

**RF-041:** El sistema debe notificar a todos los docentes cuando el horario sea publicado.

**RF-042:** El sistema debe permitir modificaciones post-publicación con registro de motivo obligatorio.

## Reportes

**RF-043:** El sistema debe generar reportes en PDF con formato institucional (logo, encabezados, pie de página).

**RF-044:** El sistema debe generar el horario completo en PDF, filtrable por ciclo, docente o aula.

**RF-045:** El sistema debe generar reportes de carga docente en PDF y Excel.

**RF-046:** El sistema debe generar reportes de ocupación de aulas en PDF y Excel.

**RF-047:** El sistema debe generar el horario en formato Excel con hojas separadas por ciclo y resúmenes.

**RF-048:** El sistema debe permitir al docente descargar su horario individual en PDF.

## Dashboard

**RF-049:** El sistema debe mostrar un dashboard ejecutivo para el Director con: estado del período activo, progreso de registro de disponibilidad, estadísticas de carga docente, tasa de ocupación de aulas, alertas y pendientes.

**RF-050:** El sistema debe mostrar un dashboard operativo para la Secretaria con: indicadores de completitud de datos, pendientes de registro.

**RF-051:** Los indicadores del dashboard deben actualizarse automáticamente al acceder a la página.

## Auditoría

**RF-052:** El sistema debe registrar automáticamente cada acción en el módulo de auditoría con: fecha/hora, usuario, rol, módulo, tipo de acción (crear, editar, eliminar, generar, aprobar, publicar), detalle de los datos modificados (valores anteriores y nuevos).

**RF-053:** Los registros de auditoría no deben poder ser editados ni eliminados.

**RF-054:** El sistema debe permitir al Director filtrar los registros de auditoría por usuario, fecha, módulo y tipo de acción.

**RF-055:** El sistema debe permitir exportar el registro de auditoría a Excel.

## Notificaciones

**RF-056:** El sistema debe enviar notificaciones internas (dentro del sistema) para los eventos: apertura de registro de disponibilidad, recordatorio de cierre de registro, publicación de horario, modificación post-publicación.

**RF-057:** El sistema debe mostrar un indicador de notificaciones no leídas en la barra de navegación.

**RF-058:** El sistema debe mostrar un historial de notificaciones del usuario.

## Períodos Académicos

**RF-059:** El sistema debe permitir crear períodos académicos con: nombre, fecha de inicio, fecha de fin, fecha límite de registro de disponibilidad.

**RF-060:** El sistema debe gestionar los estados del período: Configuración → Recopilación → Generación → Aprobado → Publicado → Cerrado.

**RF-061:** No debe existir más de un período en estado diferente a "Cerrado" simultáneamente (excepto transiciones).

**RF-062:** El sistema debe mantener un historial completo de todos los períodos con sus horarios generados.

---

# 6. Requerimientos No Funcionales

## RNF-001 — Rendimiento

- La generación del horario para una escuela de hasta 50 docentes, 60 cursos y 20 aulas debe completarse en un tiempo máximo de 30 segundos.
- Las páginas del sistema deben cargar en menos de 2 segundos con una conexión estándar de internet.
- Las operaciones CRUD deben responder en menos de 500 milisegundos.
- El dashboard debe renderizar todos sus indicadores en menos de 3 segundos.
- La generación de reportes PDF no debe exceder los 10 segundos.

## RNF-002 — Escalabilidad

- El sistema debe soportar hasta 100 usuarios concurrentes sin degradación perceptible del rendimiento.
- La arquitectura debe permitir escalar la base de datos sin modificar el código de la aplicación.
- El diseño modular debe permitir agregar nuevas escuelas profesionales sin reestructurar el sistema base.

## RNF-003 — Seguridad

- Todas las comunicaciones deben realizarse sobre HTTPS (TLS 1.3).
- Las contraseñas deben almacenarse con hashing seguro (bcrypt o Argon2, según la implementación de Supabase Auth).
- Los tokens JWT deben tener una expiración máxima de 1 hora con refresh tokens.
- Todas las entradas de usuario deben ser validadas tanto en el cliente como en el servidor.
- Las consultas a la base de datos deben realizarse mediante consultas parametrizadas para prevenir inyección SQL.
- El sistema debe implementar Row Level Security (RLS) en Supabase para garantizar el aislamiento de datos por rol.
- Los archivos de reportes generados deben tener URLs temporales con expiración.

## RNF-004 — Usabilidad

- La interfaz debe seguir las guías de Material Design adaptadas con el sistema de componentes de Shadcn/UI.
- El sistema debe proporcionar feedback visual inmediato para cada acción del usuario (indicadores de carga, mensajes de éxito/error, confirmaciones).
- Los formularios deben mostrar mensajes de validación inline claros y en idioma español.
- La grilla de horarios debe permitir interacción mediante clic y arrastre (drag & drop) en la versión desktop.
- El sistema debe incluir tooltips y textos de ayuda contextual en las secciones más complejas.

## RNF-005 — Disponibilidad

- El sistema debe tener una disponibilidad mínima del 99.5% mensual, considerando las garantías de uptime de Vercel y Supabase.
- Las actualizaciones del sistema deben realizarse con zero-downtime deployment mediante Vercel.
- En caso de falla de la base de datos, Supabase proporciona backups automáticos diarios con retención de 7 días (plan Pro).

## RNF-006 — Mantenibilidad

- El código debe seguir las convenciones de TypeScript estricto (strict mode habilitado).
- La cobertura de tests unitarios debe ser al menos del 70% en los módulos críticos (algoritmo de generación, validaciones de negocio).
- El código debe estar documentado con JSDoc en las funciones públicas de los servicios.
- La estructura del proyecto debe seguir Clean Architecture con separación clara de capas.
- Cada módulo debe ser independiente y con bajo acoplamiento.

## RNF-007 — Accesibilidad

- El sistema debe cumplir al menos el nivel AA de las pautas WCAG 2.1.
- Todos los elementos interactivos deben ser accesibles mediante navegación por teclado.
- Los contrastes de color deben cumplir las ratios mínimas de accesibilidad.
- Las imágenes y elementos gráficos deben incluir textos alternativos descriptivos.

## RNF-008 — Responsividad

- El sistema debe ser completamente funcional en los siguientes dispositivos y resoluciones: desktop (1280px+), tablet (768px–1279px), móvil (320px–767px).
- La grilla de horarios debe adaptarse a pantallas pequeñas mediante una vista de lista o scroll horizontal controlado.
- Los formularios deben adaptarse a una sola columna en dispositivos móviles.

---

# 7. Reglas de Negocio

## Restricciones de Docentes

**RN-001:** Un docente no puede estar asignado a dos cursos en el mismo bloque horario. Esta regla es inviolable y el algoritmo la trata como restricción dura.

**RN-002:** Un docente no puede exceder su carga horaria máxima definida según su régimen: Dedicación Exclusiva (40 horas semanales lectivas máximo), Tiempo Completo (20 horas semanales lectivas máximo), Tiempo Parcial (12 horas semanales lectivas máximo).

**RN-003:** Un docente solo puede ser asignado a bloques horarios en los que haya registrado disponibilidad ("Disponible" o "Preferido").

**RN-004:** Los docentes con categoría superior tienen prioridad en la asignación de horarios preferidos. El orden de prioridad es: Principal > Asociado > Auxiliar.

**RN-005:** Los docentes con mayor antigüedad en la universidad tienen prioridad sobre los de menor antigüedad dentro de la misma categoría.

**RN-006:** Los docentes nombrados tienen prioridad sobre los docentes contratados para la asignación de horarios preferidos.

**RN-007:** Un docente en estado "Inactivo" no puede ser asignado a ningún curso ni aparecer en las opciones de asignación.

**RN-008:** Un docente debe tener un mínimo de 30 minutos entre asignaciones en edificios diferentes para permitir el traslado.

## Restricciones de Aulas

**RN-009:** Un aula no puede ser asignada a dos cursos en el mismo bloque horario. Esta regla es inviolable.

**RN-010:** La capacidad del aula asignada debe ser igual o mayor al número de estudiantes esperados en el grupo asignado.

**RN-011:** Los laboratorios de cómputo solo pueden asignarse a cursos de tipo "Práctico" o a la parte práctica de cursos "Teórico-Práctico".

**RN-012:** Las aulas teóricas no deben asignarse a cursos que requieren laboratorio, salvo que no haya laboratorio disponible y el Director lo autorice expresamente.

**RN-013:** Un aula en estado "Inactiva" o "Mantenimiento" no puede ser asignada.

**RN-014:** Las restricciones de disponibilidad definidas por bloque para un aula (uso compartido con otras escuelas) deben ser respetadas por el algoritmo.

## Restricciones de Cursos y Horarios

**RN-015:** Dos cursos del mismo ciclo no deben estar programados en el mismo bloque horario, ya que los estudiantes de ese ciclo deben poder asistir a ambos.

**RN-016:** Los cursos con componente teórico y práctico deben tener sus sesiones en bloques no consecutivos (preferiblemente en días diferentes) para permitir la preparación del estudiante.

**RN-017:** Ningún curso puede programarse antes de las 07:00 ni después de las 21:00.

**RN-018:** Los bloques horarios son de 1 hora. Un curso de 2 horas ocupa 2 bloques consecutivos. Un curso de 3 horas ocupa 3 bloques consecutivos.

**RN-019:** Se debe evitar programar más de 6 horas consecutivas de clase para un mismo ciclo en un día.

**RN-020:** La parte práctica de un curso debe programarse en un bloque diferente (y preferiblemente un día diferente) a la parte teórica del mismo curso.

## Restricciones del Período Académico

**RN-021:** Solo puede existir un período académico en estado diferente a "Cerrado".

**RN-022:** La transición de estados del período es estrictamente secuencial: Configuración → Recopilación → Generación → Aprobado → Publicado → Cerrado. No se permite retroceder, excepto de "Generación" a "Recopilación" si el Director decide reabrir el registro de disponibilidad.

**RN-023:** La fecha límite de registro de disponibilidad debe ser anterior a la fecha de inicio del período académico.

**RN-024:** No se puede ejecutar la generación del horario si algún docente activo no ha registrado su disponibilidad, salvo que el Director lo autorice explícitamente.

## Restricciones de Auditoría y Seguridad

**RN-025:** Toda acción que modifique datos en el sistema debe quedar registrada en el módulo de auditoría. No existen excepciones.

**RN-026:** Los registros de auditoría son inmutables. No pueden ser editados, modificados ni eliminados por ningún usuario, incluyendo al Director.

**RN-027:** Las modificaciones al horario después de su publicación deben incluir obligatoriamente un motivo escrito y generan una notificación automática a los docentes afectados.

**RN-028:** Un usuario no puede acceder a funcionalidades fuera de los permisos definidos para su rol, incluso manipulando directamente las URLs del sistema.

## Restricciones de Asignación

**RN-029:** Si un curso tiene prerequisitos, el horario del curso prerequisito (en el ciclo inferior) no debe superponerse con el curso que depende de él, considerando que algunos estudiantes pueden estar cursando ambos.

**RN-030:** Un docente que dicta la parte teórica de un curso debe ser preferentemente el mismo que dicta la parte práctica, salvo que el Director disponga lo contrario.

**RN-031:** La asignación de cursos a docentes debe considerar la afinidad del docente con el curso (campo de especialización). Esta es una restricción blanda: se intenta respetar pero no es obligatoria.

**RN-032:** No se puede asignar un curso práctico que requiere software específico a un laboratorio que no tiene dicho software instalado.

---

# 8. Arquitectura General del Sistema

## 8.1 Arquitectura Propuesta: Clean Architecture

El sistema adoptará la Clean Architecture (Arquitectura Limpia) propuesta por Robert C. Martin, adaptada al contexto de una aplicación full-stack con Next.js. Esta decisión arquitectónica se fundamenta en los siguientes principios:

**Independencia de frameworks:** La lógica de negocio (reglas de asignación, algoritmo de generación, validaciones) no depende de Next.js, Supabase ni ninguna librería específica. Si en el futuro se decide migrar a otro framework o base de datos, la lógica central permanece intacta.

**Testabilidad:** Las capas internas (entidades y casos de uso) pueden ser probadas de forma aislada sin necesidad de levantar servidores, bases de datos ni interfaces de usuario.

**Independencia de la base de datos:** Las entidades de dominio no conocen los detalles de Supabase PostgreSQL. La comunicación con la base de datos se realiza exclusivamente a través del patrón Repository, cuya implementación concreta puede ser reemplazada sin afectar las capas superiores.

### Capas de la Arquitectura

**Capa 1 — Entidades (Domain Entities):**
Contiene los objetos de dominio del negocio: Docente, Curso, Aula, Horario, Período, Disponibilidad, Asignación. Estas entidades encapsulan las reglas de negocio más fundamentales y no tienen dependencia alguna de frameworks o librerías externas. Son objetos TypeScript puros con sus propiedades y métodos de validación interna.

**Capa 2 — Casos de Uso (Use Cases / Application Services):**
Contiene la lógica de aplicación: GenerarHorarioUseCase, AsignarDocenteUseCase, ValidarConflictosUseCase, RegistrarDisponibilidadUseCase. Cada caso de uso orquesta las entidades y los repositorios para cumplir un objetivo funcional específico. Los casos de uso definen interfaces (puertos) que las capas externas deben implementar.

**Capa 3 — Adaptadores de Interfaz (Interface Adapters):**
Incluye los controladores (Server Actions, API Routes), los presentadores (transformación de datos para la UI) y las implementaciones concretas de los repositorios (SupabaseDocenteRepository, SupabaseCursoRepository, etc.). También incluye los DTOs (Data Transfer Objects) para la comunicación entre capas.

**Capa 4 — Frameworks y Drivers (Infrastructure):**
Contiene la configuración concreta de Next.js, Supabase Client, librerías de generación de PDF/Excel, y la interfaz de usuario (componentes React). Esta capa solo se comunica con la Capa 3 y nunca accede directamente a la Capa 1 o 2.

## 8.2 Separación por Módulos

El sistema se organiza en módulos funcionales autocontenidos. Cada módulo agrupa todas las capas de la arquitectura relevantes a un dominio funcional específico. Esta organización facilita:

- La asignación de trabajo a equipos independientes.
- La modificación de un módulo sin afectar a otros.
- La comprensión del sistema por parte de nuevos desarrolladores.

## 8.3 Patrón Repository

Cada entidad de dominio tiene un repositorio asociado que define la interfaz de acceso a datos. La interfaz se define en la capa de dominio (como un puerto) y la implementación concreta (Supabase) se define en la capa de infraestructura.

Ejemplo conceptual:

- `IDocenteRepository` (interfaz en dominio): define métodos como `findById`, `findAll`, `save`, `update`, `deactivate`.
- `SupabaseDocenteRepository` (implementación en infraestructura): implementa la interfaz utilizando el cliente Supabase.

Beneficios: permite cambiar la base de datos sin modificar los casos de uso, facilita la creación de mocks para tests unitarios, centraliza el acceso a datos evitando consultas dispersas.

## 8.4 Patrón Service

Los servicios encapsulan la lógica de negocio compleja que no pertenece a una sola entidad. Por ejemplo:

- `ScheduleGeneratorService`: contiene el algoritmo de generación de horarios.
- `ConflictValidationService`: contiene la lógica de detección de conflictos.
- `ScoringService`: contiene la lógica de puntuación de prioridad docente.

Los servicios son inyectados en los casos de uso y no tienen dependencia directa de la infraestructura.

## 8.5 Patrón DTO (Data Transfer Object)

Los DTOs son objetos simples que transportan datos entre las capas del sistema sin exponer las entidades de dominio. Se utilizan en dos direcciones:

- **Input DTOs:** Reciben los datos del formulario o la API, validados con Zod, y los transforman en los parámetros esperados por el caso de uso.
- **Output DTOs:** Transforman las entidades de dominio en la estructura que la UI necesita para renderizar, omitiendo campos internos o sensibles.

Beneficios: desacopla la estructura de la base de datos de la estructura de la API y la UI, permite evolucionar la base de datos sin romper la interfaz de usuario, facilita la validación de datos de entrada de forma declarativa con Zod.

---

# 9. Stack Tecnológico

## 9.1 Frontend

| Tecnología | Versión | Justificación |
|---|---|---|
| **Next.js** | 16.2.6 | Framework React full-stack de última generación. Next.js 16 ofrece Server Components por defecto, Server Actions para mutaciones sin APIs REST manuales, Turbopack para compilación ultrarrápida (~400% más rápido el dev startup respecto a versiones anteriores), App Router con layouts anidados, y rendering optimizado (~50% más rápido). La versión 16.2.6 es la estable más reciente (mayo 2026) con todos los parches de seguridad aplicados. |
| **TypeScript** | 5.x (última estable) | Tipado estático obligatorio en todo el proyecto. Reduce errores en tiempo de desarrollo, mejora la experiencia del IDE con autocompletado y refactorización, y sirve como documentación viva del código. El strict mode se habilitará para máxima seguridad de tipos. |
| **Tailwind CSS** | 4.3.0 | Framework CSS utility-first en su versión 4.3 (mayo 2026). La v4 introdujo una reescritura completa del motor con mejoras masivas de rendimiento, configuración CSS-first sin `tailwind.config.js`, soporte nativo para variables CSS, y recompilación 3.8x más rápida. La v4.3 agrega estilizado de scrollbar nativo, utilidades de propiedades lógicas expandidas, y mejor soporte de `@variant`. |
| **Shadcn/UI** | CLI v4 (abril 2026) | Sistema de componentes accesibles construidos sobre Radix UI y Tailwind CSS. A diferencia de librerías como Material UI o Ant Design, Shadcn no es una dependencia: los componentes se copian al proyecto y son completamente personalizables. El CLI v4 incluye soporte para presets de diseño, integración con agentes IA, templates para múltiples frameworks, y un paquete unificado `radix-ui`. |
| **React Hook Form** | Última estable | Librería de formularios con rendimiento optimizado (renderización mínima). Se integra nativamente con Zod para validación de esquemas, maneja formularios complejos (grilla de disponibilidad, formularios multi-paso) sin re-renderizar todo el componente. |
| **Zod** | Última estable | Librería de validación de esquemas TypeScript-first. Define los esquemas de validación una sola vez y los utiliza tanto en el cliente (formularios) como en el servidor (Server Actions). Genera tipos TypeScript automáticamente a partir del esquema, garantizando consistencia entre validación y tipado. |
| **TanStack Table** | Última estable | Librería headless para tablas de datos complejas. Proporciona paginación, ordenamiento, filtrado, selección y virtualización sin imponer estilos, lo que permite integración perfecta con Shadcn/UI y Tailwind CSS. Ideal para los listados de docentes, cursos, aulas y registros de auditoría. |

## 9.2 Backend

| Tecnología | Versión | Justificación |
|---|---|---|
| **Next.js Server Actions** | 16.2.6 | Las Server Actions de Next.js permiten definir funciones del servidor directamente en el código del componente o en archivos separados con la directiva `'use server'`. Eliminan la necesidad de crear endpoints REST manuales para operaciones CRUD, simplificando la arquitectura y reduciendo el código boilerplate. |
| **Next.js API Routes** | 16.2.6 | Para operaciones que requieren endpoints HTTP explícitos (webhooks, integraciones futuras, generación de reportes bajo demanda), se utilizarán Route Handlers del App Router. |
| **TypeScript** | 5.x | El mismo lenguaje en frontend y backend elimina la fricción de contexto, permite compartir tipos y esquemas de validación, y simplifica el onboarding de nuevos desarrolladores. |

## 9.3 Base de Datos

| Tecnología | Versión | Justificación |
|---|---|---|
| **Supabase PostgreSQL** | Última estable (plataforma gestionada) | Supabase ofrece PostgreSQL completamente gestionado con extensiones, backups automáticos, y la librería `supabase-js` para acceso tipado desde TypeScript. PostgreSQL es la base de datos relacional más avanzada de código abierto, ideal para los datos altamente relacionales del sistema (docentes ↔ cursos ↔ aulas ↔ horarios). Supabase proporciona Row Level Security (RLS) nativo para control de acceso a nivel de fila y Realtime subscriptions para actualizaciones en tiempo real del dashboard. El nuevo paquete `@supabase/server` (mayo 2026) simplifica la configuración del servidor y el manejo de auth. |

## 9.4 Autenticación

| Tecnología | Justificación |
|---|---|
| **Supabase Auth** | Sistema de autenticación integrado con PostgreSQL. Maneja registro, login, recuperación de contraseña, sesiones y refresh tokens sin infraestructura adicional. Compatible con JWT y proveedores OAuth. |
| **JWT (JSON Web Tokens)** | Estándar de la industria para sesiones stateless. Supabase Auth genera tokens JWT firmados que contienen el rol del usuario y los claims necesarios para el control de acceso. |
| **RBAC (Role-Based Access Control)** | Se implementará mediante claims personalizados en el JWT y políticas RLS en Supabase. Cada rol (Director, Secretaria, Docente) tendrá permisos explícitos definidos tanto en el middleware de Next.js como en las políticas de la base de datos. |

## 9.5 Reportes

| Tecnología | Justificación |
|---|---|
| **PDF-lib** | Librería JavaScript para creación de PDFs programáticos. Permite generar documentos con diseño preciso (posicionamiento de elementos, fuentes embebidas, imágenes, tablas) directamente en el servidor de Next.js sin dependencias binarias externas. Ideal para el formato institucional que requiere los reportes del sistema. |
| **ExcelJS** | Librería JavaScript para creación de archivos Excel (.xlsx) con soporte completo para hojas múltiples, formato condicional, fórmulas, gráficos básicos y estilos. Permite generar los reportes de carga docente y ocupación de aulas con formato profesional. |

## 9.6 Despliegue

| Plataforma | Justificación |
|---|---|
| **Vercel** | Plataforma de despliegue oficial de Next.js. Ofrece zero-downtime deployments, edge functions para latencia mínima en Latinoamérica, preview deployments para revisión de cambios, analytics integrados, y escalado automático. La integración nativa con Next.js 16 garantiza soporte de primera clase para todas las características del framework. |
| **Supabase (Cloud)** | Plataforma gestionada para PostgreSQL, autenticación y storage. Elimina la necesidad de administrar servidores de base de datos, proporciona backups automáticos, monitoreo, y una consola de administración visual. Los servidores están disponibles en regiones de Sudamérica para minimizar la latencia. |

---

# 10. Estructura de Módulos

## 10.1 Módulo de Autenticación (`auth`)

**Responsabilidades:**
- Gestionar el inicio de sesión, cierre de sesión y persistencia de la sesión del usuario.
- Implementar la verificación de tokens JWT en cada petición protegida.
- Gestionar la recuperación y cambio de contraseña.
- Proporcionar el middleware de autenticación que protege todas las rutas del sistema.
- Exponer el contexto de usuario autenticado (datos del usuario, rol, permisos) al resto de los módulos.

**Interacciones:** Todos los módulos dependen de este módulo para la verificación de identidad y permisos.

## 10.2 Módulo de Docentes (`docentes`)

**Responsabilidades:**
- Gestionar el CRUD completo de la entidad Docente.
- Validar la integridad de los datos del docente (unicidad de DNI, correo, coherencia de categoría/régimen).
- Calcular la antigüedad del docente a partir de la fecha de ingreso.
- Proporcionar el listado de docentes activos para la asignación de cursos.
- Gestionar la activación/desactivación de docentes.

**Interacciones:** Consumido por los módulos de Disponibilidad, Horarios y Reportes.

## 10.3 Módulo de Cursos (`cursos`)

**Responsabilidades:**
- Gestionar el CRUD de la entidad Curso.
- Gestionar la asociación de cursos con períodos académicos.
- Gestionar la definición de grupos (secciones) por curso.
- Validar la coherencia del tipo de curso con los requerimientos de aula (teórico/práctico).
- Proporcionar el listado de cursos activos para el período vigente.

**Interacciones:** Consumido por los módulos de Horarios y Reportes.

## 10.4 Módulo de Aulas (`aulas`)

**Responsabilidades:**
- Gestionar el CRUD de la entidad Aula.
- Gestionar las restricciones de disponibilidad por bloque horario.
- Gestionar el equipamiento y tipo de cada aula.
- Proporcionar el listado de aulas disponibles para la asignación.

**Interacciones:** Consumido por los módulos de Horarios y Reportes.

## 10.5 Módulo de Horarios (`horarios`)

**Responsabilidades:**
- Contener el algoritmo de generación automática de horarios.
- Gestionar la asignación de docentes, cursos y aulas a bloques horarios.
- Validar conflictos en tiempo real durante la modificación manual.
- Gestionar los estados del horario (borrador, aprobado, publicado).
- Proporcionar las vistas de horario por ciclo, docente, aula y vista general.

**Interacciones:** Este es el módulo central. Consume los módulos de Docentes, Cursos, Aulas y Disponibilidad. Es consumido por los módulos de Reportes y Dashboard.

## 10.6 Módulo de Disponibilidad Docente (`disponibilidad`)

**Responsabilidades:**
- Gestionar el registro de disponibilidad horaria de cada docente.
- Validar que el docente cumpla con el mínimo de horas disponibles según su régimen.
- Proporcionar la grilla interactiva de registro.
- Controlar que el registro solo sea posible durante el estado "Recopilación" del período.
- Proporcionar un resumen del estado de registro para el dashboard.

**Interacciones:** Consumido por el módulo de Horarios.

## 10.7 Módulo de Reportes (`reportes`)

**Responsabilidades:**
- Generar documentos PDF con formato institucional.
- Generar archivos Excel con datos tabulados y formateados.
- Proporcionar diferentes tipos de reporte: horario completo, horario por ciclo, horario por docente, horario por aula, carga docente, ocupación de aulas.
- Gestionar la descarga de archivos generados.

**Interacciones:** Consume los módulos de Horarios, Docentes, Cursos y Aulas.

## 10.8 Módulo de Auditoría (`auditoria`)

**Responsabilidades:**
- Registrar automáticamente cada acción del sistema con todos los metadatos requeridos.
- Proporcionar la consulta y filtrado de registros de auditoría.
- Garantizar la inmutabilidad de los registros.
- Permitir la exportación de registros a Excel.

**Interacciones:** Todos los módulos alimentan este módulo. Solo el Director puede consultarlo.

## 10.9 Módulo de Dashboard (`dashboard`)

**Responsabilidades:**
- Consolidar los indicadores clave del sistema en una vista ejecutiva.
- Proporcionar tarjetas de resumen, gráficos de distribución y alertas.
- Diferenciar el dashboard del Director (ejecutivo, completo) del de la Secretaria (operativo, limitado).
- Actualizar los datos al acceder a la página.

**Interacciones:** Consume los módulos de Horarios, Docentes, Disponibilidad, Cursos y Aulas.

## 10.10 Módulo de Períodos Académicos (`periodos`)

**Responsabilidades:**
- Gestionar el CRUD de períodos académicos.
- Controlar la máquina de estados del período (Configuración → Recopilación → ... → Cerrado).
- Validar las transiciones de estado permitidas.
- Proporcionar el contexto de período activo al resto de módulos.

**Interacciones:** Todos los módulos que dependen de un contexto temporal consumen este módulo.

---

# 11. Diseño de la Lógica del Algoritmo de Horarios

El algoritmo de generación automática de horarios es el componente central del sistema. Su diseño se basa en un enfoque de resolución de restricciones (Constraint Satisfaction Problem — CSP) con optimización por priorización. A continuación se describe cada fase del algoritmo de forma detallada.

## Fase 1 — Validación de Información

**Objetivo:** Garantizar que todos los datos necesarios estén completos y sean coherentes antes de iniciar la generación.

**Proceso:**
1. Verificar que el período esté en estado "Generación".
2. Obtener la lista de todos los cursos asociados al período activo.
3. Verificar que cada curso tenga definidos: horas, tipo, ciclo, número de grupos.
4. Obtener la lista de todos los docentes activos.
5. Verificar que cada docente activo haya registrado su disponibilidad.
6. Obtener la lista de todas las aulas activas.
7. Verificar que haya al menos un aula compatible (por tipo y capacidad) para cada curso.
8. Si alguna validación falla, se genera un reporte de errores detallado y se aborta la generación.

**Salida:** Datos validados y estructurados listos para el procesamiento.

## Fase 2 — Filtrado de Disponibilidad Docente

**Objetivo:** Construir la matriz de disponibilidad que el algoritmo utilizará para las asignaciones.

**Proceso:**
1. Para cada docente, obtener sus bloques marcados como "Disponible" y "Preferido".
2. Cruzar la disponibilidad del docente con las restricciones de aulas (si un bloque no tiene ningún aula disponible, eliminarlo de la disponibilidad efectiva).
3. Calcular las horas efectivas disponibles de cada docente.
4. Verificar que cada docente tenga suficientes horas disponibles para cubrir su carga mínima.
5. Construir la matriz final: Docente × Bloque Horario → {disponible, preferido, no disponible}.

**Salida:** Matriz de disponibilidad docente filtrada y validada.

## Fase 3 — Validación de Restricciones

**Objetivo:** Identificar y clasificar todas las restricciones que el algoritmo debe respetar.

**Proceso:**
1. Clasificar las restricciones en dos categorías:
   - **Restricciones duras** (inviolables): no simultaneidad de docente, no simultaneidad de aula, no superposición de cursos del mismo ciclo, capacidad de aula, tipo de aula compatible.
   - **Restricciones blandas** (deseables pero negociables): preferencia horaria del docente, distribución equitativa de carga, separación de teoría y práctica en días diferentes, mismo docente para teoría y práctica.
2. Asignar un peso a cada restricción blanda para la optimización posterior.
3. Construir la lista de restricciones activas para el período.

**Salida:** Catálogo de restricciones clasificadas y ponderadas.

## Fase 4 — Priorización Docente

**Objetivo:** Calcular el puntaje de prioridad de cada docente para determinar el orden de asignación.

**Proceso:**
1. Para cada docente, calcular el puntaje de prioridad según el sistema de puntuación descrito en la sección 12.
2. Ordenar a los docentes de mayor a menor puntaje.
3. Los docentes con mayor puntaje serán atendidos primero en la asignación de sus horarios preferidos.

**Salida:** Lista ordenada de docentes por prioridad.

## Fase 5 — Asignación de Cursos a Docentes

**Objetivo:** Determinar qué docente dictará cada curso (o grupo de curso).

**Proceso:**
1. Generar la lista de "unidades de asignación": cada grupo de cada curso es una unidad independiente.
2. Para cada unidad de asignación, determinar los docentes elegibles (activos, con disponibilidad suficiente, con carga disponible, con afinidad si está definida).
3. Siguiendo el orden de prioridad de docentes, asignar las unidades respetando:
   - La preferencia de afinidad del docente (restricción blanda).
   - La carga horaria acumulada (no exceder el máximo).
   - La distribución equitativa de carga entre docentes de la misma categoría.
4. Si un curso tiene parte teórica y práctica, intentar asignar ambas al mismo docente (restricción blanda).
5. Si queda alguna unidad sin docente asignable, reportarla como conflicto para resolución manual.

**Salida:** Mapa de asignación Curso-Grupo → Docente.

## Fase 6 — Asignación de Bloques Horarios y Aulas

**Objetivo:** Determinar en qué bloque horario y en qué aula se dictará cada curso asignado.

**Proceso:**
1. Ordenar las unidades de asignación por restricción (las más restringidas primero: cursos que requieren laboratorio específico, cursos con pocos bloques compatibles).
2. Para cada unidad de asignación:
   a. Obtener los bloques disponibles del docente asignado.
   b. Filtrar los bloques que no generen conflicto con el mismo ciclo.
   c. Filtrar las aulas disponibles en esos bloques (tipo compatible, capacidad suficiente).
   d. Priorizar los bloques marcados como "Preferido" por el docente.
   e. Seleccionar la combinación bloque-aula que maximice la puntuación de optimización.
   f. Registrar la asignación y actualizar las matrices de disponibilidad.
3. Si una unidad no puede ser asignada sin violar restricciones duras, reportarla como conflicto.

**Salida:** Horario completo con asignaciones: Curso-Grupo → Docente → Bloque → Aula.

## Fase 7 — Validación de Conflictos

**Objetivo:** Verificar exhaustivamente que el horario generado no contenga ningún conflicto.

**Proceso:**
1. Recorrer cada bloque horario y verificar:
   - Ningún docente aparece en dos asignaciones simultáneas.
   - Ningún aula aparece en dos asignaciones simultáneas.
   - Ningún ciclo tiene dos cursos en el mismo bloque.
2. Verificar que la carga horaria de cada docente no exceda su máximo.
3. Verificar que las restricciones de aulas (uso compartido) se hayan respetado.
4. Generar un reporte de conflictos (si los hay) o confirmar que el horario está libre de conflictos.

**Salida:** Reporte de validación: sin conflictos o lista detallada de conflictos detectados.

## Fase 8 — Optimización

**Objetivo:** Mejorar la calidad del horario generado optimizando las restricciones blandas.

**Proceso:**
1. Calcular el puntaje global del horario como la suma ponderada de todas las restricciones blandas satisfechas.
2. Intentar mejoras locales (swaps) intercambiando asignaciones entre bloques para:
   - Aumentar el porcentaje de preferencias horarias respetadas.
   - Mejorar la distribución de carga docente.
   - Separar mejor las sesiones teóricas y prácticas.
3. Para cada swap propuesto, verificar que no viole ninguna restricción dura.
4. Aceptar el swap si mejora el puntaje global.
5. Repetir hasta que no se encuentren mejoras significativas o se alcance un límite de iteraciones.

**Salida:** Horario optimizado con puntaje global mejorado.

## Fase 9 — Generación Final

**Objetivo:** Producir el resultado final del algoritmo.

**Proceso:**
1. Almacenar el horario generado en la base de datos con estado "Borrador".
2. Generar el resumen estadístico: porcentaje de preferencias respetadas, distribución de carga, tasa de ocupación de aulas, unidades no asignadas.
3. Presentar el horario en la interfaz del Director en formato de grilla visual.
4. Resaltar las unidades no asignadas o los conflictos que requieren resolución manual.

**Salida:** Horario borrador almacenado y presentado para revisión.

---

# 12. Sistema de Puntuación del Algoritmo

## 12.1 Variables de Puntuación

El sistema de puntuación determina la prioridad con la que cada docente es atendido durante la generación del horario. Las variables consideradas son:

### Categoría Docente (C)

| Categoría | Valor |
|---|---|
| Principal | 100 |
| Asociado | 70 |
| Auxiliar | 40 |
| Contratado (Auxiliar) | 20 |

### Antigüedad (A)

La antigüedad se mide en años completos desde la fecha de ingreso a la universidad.

| Rango de Antigüedad | Valor |
|---|---|
| 20+ años | 100 |
| 15–19 años | 80 |
| 10–14 años | 60 |
| 5–9 años | 40 |
| 1–4 años | 20 |
| Menos de 1 año | 10 |

### Disponibilidad (D)

Mide la flexibilidad del docente en función de la cantidad de bloques disponibles registrados.

| Porcentaje de bloques disponibles | Valor |
|---|---|
| 80% o más de los bloques posibles | 100 |
| 60%–79% | 75 |
| 40%–59% | 50 |
| Mínimo requerido–39% | 25 |

### Horario Preferido (P)

Mide la proporción de la asignación que coincide con los bloques marcados como "Preferido" por el docente. Este valor se calcula durante la asignación, no antes.

| Coincidencia con preferencias | Valor |
|---|---|
| 100% de las horas asignadas en bloques preferidos | 100 |
| 75%–99% | 75 |
| 50%–74% | 50 |
| 25%–49% | 25 |
| Menos del 25% | 10 |

### Carga Académica Actual (L)

Mide el porcentaje de carga ya asignada respecto al máximo del docente. Docentes con menos carga asignada reciben mayor puntaje (para favorecer la distribución equitativa).

| Porcentaje de carga utilizada | Valor |
|---|---|
| 0%–25% | 100 |
| 26%–50% | 75 |
| 51%–75% | 50 |
| 76%–90% | 25 |
| Más del 90% | 0 (no asignar más) |

## 12.2 Fórmula de Puntuación

El puntaje total de prioridad de un docente se calcula con la siguiente fórmula ponderada:

```
Puntaje = (C × 0.35) + (A × 0.25) + (D × 0.15) + (P × 0.15) + (L × 0.10)
```

### Distribución de pesos

| Factor | Peso | Justificación |
|---|---|---|
| Categoría (C) | 0.35 | Es el criterio de mayor peso porque la categoría docente es un reconocimiento institucional formal de la trayectoria, productividad y méritos académicos del docente. Las normas de la UNT otorgan preferencia explícita a las categorías superiores. |
| Antigüedad (A) | 0.25 | La antigüedad es el segundo criterio porque refleja la permanencia y compromiso del docente con la institución. Las normas universitarias peruanas otorgan derechos adicionales por antigüedad. |
| Disponibilidad (D) | 0.15 | Docentes con mayor flexibilidad horaria facilitan la generación de horarios sin conflictos, por lo que se les otorga un puntaje mayor para incentivar la disponibilidad amplia. |
| Preferencia horaria (P) | 0.15 | Respetar las preferencias horarias de los docentes contribuye a la satisfacción laboral y al cumplimiento efectivo de las clases. |
| Carga actual (L) | 0.10 | Este factor balancea la distribución de la carga, penalizando a docentes ya sobrecargados y favoreciendo a los que aún tienen capacidad. |

### Ejemplo de cálculo

Docente: Dr. Juan Pérez
- Categoría: Principal → C = 100
- Antigüedad: 18 años → A = 80
- Disponibilidad: 72% de bloques → D = 75
- Preferencia: 85% en preferidos → P = 75
- Carga actual: 35% → L = 75

```
Puntaje = (100 × 0.35) + (80 × 0.25) + (75 × 0.15) + (75 × 0.15) + (75 × 0.10)
Puntaje = 35 + 20 + 11.25 + 11.25 + 7.5
Puntaje = 85.0
```

## 12.3 Reglas de Desempate

Cuando dos o más docentes tienen el mismo puntaje total, se aplica el siguiente criterio de desempate en orden:

1. Mayor categoría docente.
2. Mayor antigüedad.
3. Mayor disponibilidad horaria.
4. Orden alfabético por apellido (último recurso).

---

# 13. Workflows del Sistema

## 13.1 Workflow de Login

```
1. El usuario accede a la URL del sistema.
2. El sistema muestra la pantalla de inicio de sesión.
3. El usuario ingresa su correo institucional y contraseña.
4. El sistema envía las credenciales a Supabase Auth.
5. Supabase Auth verifica las credenciales.
   5a. Si son incorrectas → muestra mensaje de error y permite reintentar.
   5b. Si son correctas → Supabase Auth emite un JWT con el rol del usuario.
6. El middleware de Next.js lee el JWT y determina el rol.
7. El sistema redirige al dashboard correspondiente:
   - Director → /dashboard/director
   - Secretaria → /dashboard/secretaria
   - Docente → /dashboard/docente
8. Se registra el evento de login en el módulo de auditoría.
```

## 13.2 Workflow de Generación de Horarios

```
1. El Director accede al módulo de Horarios.
2. Selecciona el período académico activo (debe estar en estado "Generación").
3. El sistema muestra un resumen pre-generación:
   - Total de cursos a programar.
   - Total de docentes activos.
   - Total de aulas disponibles.
   - Porcentaje de disponibilidad registrada.
   - Alertas de datos faltantes.
4. El Director revisa el resumen y presiona "Generar Horario".
5. El sistema ejecuta la Fase 1 (Validación de Información).
   5a. Si falla → muestra errores detallados y detiene el proceso.
6. El sistema ejecuta las Fases 2 a 8 secuencialmente, mostrando progreso.
7. Al finalizar, el sistema presenta:
   - Grilla visual del horario generado.
   - Resumen estadístico (preferencias respetadas, carga docente, ocupación).
   - Lista de conflictos o asignaciones pendientes (si los hay).
8. El Director revisa el resultado.
   8a. Si necesita ajustes → procede al Workflow de Modificación.
   8b. Si es satisfactorio → procede al Workflow de Aprobación.
9. Se registra la generación en el módulo de auditoría.
```

## 13.3 Workflow de Asignación de Aulas

```
1. Durante la Fase 6 del algoritmo, para cada unidad de asignación:
2. Se obtiene el tipo de curso (Teórico, Práctico, Teórico-Práctico).
3. Se filtran las aulas por tipo compatible:
   - Teórico → Aula Teórica o Auditorio.
   - Práctico → Laboratorio de Cómputo o Laboratorio Especializado.
4. Se filtran las aulas por capacidad >= estudiantes esperados.
5. Se filtran las aulas por disponibilidad en el bloque horario seleccionado.
6. Se filtran las aulas según restricciones de uso compartido.
7. Se verifica el equipamiento requerido por el curso.
8. De las aulas restantes, se selecciona la de menor capacidad que cumpla (para optimizar el uso del espacio más grande para cursos que lo necesiten más).
9. Se registra la asignación aula-bloque-curso.
```

## 13.4 Workflow de Aprobación

```
1. El Director accede al horario generado (estado "Borrador").
2. El sistema verifica que no existan conflictos pendientes.
   2a. Si hay conflictos → no se habilita el botón de aprobación. Se muestran los conflictos.
3. El Director presiona "Aprobar Horario".
4. El sistema solicita confirmación.
5. El Director confirma.
6. El estado del período cambia a "Aprobado".
7. Se registra la aprobación en auditoría.
8. El Director puede ahora presionar "Publicar".
9. Al publicar:
   - El estado cambia a "Publicado".
   - Se envían notificaciones a todos los docentes.
   - El horario se hace visible para los docentes en su portal.
10. Se registra la publicación en auditoría.
```

## 13.5 Workflow de Descarga PDF

```
1. El usuario (Director o Secretaria) accede al módulo de Reportes.
2. Selecciona el tipo de reporte: Horario Completo, Por Ciclo, Por Docente, Por Aula, Carga Docente, Ocupación.
3. Selecciona los filtros aplicables (ciclo, docente, aula, período).
4. Presiona "Generar PDF".
5. El sistema invoca el servicio de generación de reportes en el servidor.
6. El servicio utiliza PDF-lib para construir el documento con:
   - Encabezado institucional (logo UNT, nombre de la escuela, período).
   - Contenido tabular del horario o reporte.
   - Pie de página (fecha de generación, número de página).
7. El PDF generado se ofrece para descarga inmediata.
8. Se registra la generación del reporte en auditoría.
```

## 13.6 Workflow de Modificación Manual

```
1. El Director accede al horario generado en la vista de grilla.
2. Selecciona un bloque horario con una asignación existente.
3. El sistema muestra un panel lateral con los detalles de la asignación: curso, docente, aula.
4. El Director modifica uno o más campos (docente, aula, bloque horario).
5. En tiempo real, el sistema evalúa:
   - ¿El nuevo docente está disponible en ese bloque?
   - ¿El nuevo docente no excede su carga máxima?
   - ¿El aula está libre en ese bloque?
   - ¿No se genera conflicto con otro curso del mismo ciclo?
6. Si hay conflicto → se muestra la descripción del conflicto en rojo. No se permite guardar.
7. Si no hay conflicto → se habilita el botón "Guardar cambio".
8. El Director guarda. Si es post-publicación, debe ingresar un motivo obligatorio.
9. Se registra la modificación en auditoría con valores anteriores y nuevos.
10. Si es post-publicación, se notifica al docente afectado.
```

## 13.7 Workflow de Auditoría

```
1. El Director accede al módulo de Auditoría.
2. El sistema muestra un listado cronológico de todas las acciones registradas.
3. El Director aplica filtros: usuario, rango de fechas, módulo, tipo de acción.
4. El sistema actualiza la tabla con los resultados filtrados.
5. El Director puede expandir un registro para ver el detalle completo (valores anteriores/nuevos).
6. El Director puede exportar los registros filtrados a Excel.
7. Los registros son de solo lectura, sin opción de edición o eliminación.
```

---

# 14. Diseño de Dashboard

## 14.1 Dashboard del Director de Escuela

### Tarjetas de resumen (fila superior)

**Tarjeta 1 — Estado del Período:**
Muestra el nombre del período activo (ej. "2026-I") y su estado actual con un badge de color: Configuración (gris), Recopilación (azul), Generación (amarillo), Aprobado (verde), Publicado (verde oscuro), Cerrado (rojo).

**Tarjeta 2 — Disponibilidad Docente:**
Muestra el porcentaje de docentes que han registrado su disponibilidad. Ejemplo: "18/25 docentes (72%)". Incluye una barra de progreso. Color verde si >80%, amarillo si 50-80%, rojo si <50%.

**Tarjeta 3 — Cursos Programados:**
Muestra el total de cursos (unidades de asignación) programados versus el total a programar. Ejemplo: "45/48 cursos asignados". Incluye el porcentaje.

**Tarjeta 4 — Ocupación de Aulas:**
Muestra la tasa promedio de ocupación de las aulas durante la semana. Ejemplo: "68% de ocupación". Color verde si <70%, amarillo si 70-85%, rojo si >85%.

### Gráficos (fila central)

**Gráfico 1 — Distribución de Carga Docente:**
Gráfico de barras horizontales mostrando la carga asignada de cada docente como porcentaje de su carga máxima. Ordenado de mayor a menor carga. Barras coloreadas: verde (0-60%), amarillo (60-80%), rojo (>80%).

**Gráfico 2 — Cursos por Ciclo:**
Gráfico de barras verticales mostrando la cantidad de cursos programados por ciclo (I a X).

**Gráfico 3 — Ocupación por Día de la Semana:**
Gráfico de líneas mostrando el porcentaje de ocupación de aulas por cada día (lunes a sábado), permitiendo identificar días con alta o baja ocupación.

### Tablas e indicadores (fila inferior)

**Tabla 1 — Alertas y Pendientes:**
Lista de alertas activas: docentes sin disponibilidad registrada, cursos sin docente asignable, aulas con restricciones próximas a vencer, conflictos no resueltos.

**Tabla 2 — Últimas acciones del sistema:**
Los 10 registros más recientes del módulo de auditoría, mostrando fecha, usuario y acción.

### KPIs

- Tiempo promedio de generación del horario.
- Porcentaje de preferencias horarias respetadas.
- Porcentaje de carga docente promedio vs. máximo permitido.
- Número de modificaciones post-publicación en el período actual vs. anterior.
- Número de conflictos resueltos automáticamente vs. manualmente.

## 14.2 Dashboard de la Secretaria Académica

### Tarjetas de resumen

- Total de docentes activos registrados.
- Total de cursos registrados para el período.
- Total de aulas activas.
- Pendientes de registro (datos incompletos).

### Tabla principal

Listado de tareas pendientes: docentes sin información completa, cursos sin asociar al período, aulas sin actualizar.

## 14.3 Dashboard del Docente

### Tarjetas de resumen

- Estado de mi disponibilidad: "Registrada" / "Pendiente".
- Mi carga asignada: "12/20 horas".
- Cursos asignados: lista simple.

### Vista rápida

Mi horario semanal en formato de grilla compacta (solo mis asignaciones).

---

# 15. Estrategia de Seguridad

## 15.1 Autenticación

La autenticación se delega a Supabase Auth, que proporciona:

- Registro y login con correo electrónico y contraseña.
- Hashing de contraseñas con bcrypt (12 salt rounds) en el servidor de Supabase.
- Generación de pares de tokens: Access Token (JWT, corta vida) y Refresh Token (larga vida).
- Flujo de recuperación de contraseña con enlace temporal por email.
- Rate limiting configurable para prevenir ataques de fuerza bruta.

## 15.2 Autorización

La autorización se implementa en tres niveles:

**Nivel 1 — Middleware de Next.js:** Antes de que cualquier ruta se procese, el middleware verifica: que exista un JWT válido (no expirado, firmado correctamente), que el rol del usuario en el JWT tenga acceso a la ruta solicitada, que la sesión no haya sido revocada.

**Nivel 2 — Server Actions / API Routes:** Cada Server Action verifica internamente el rol del usuario antes de ejecutar la operación. Esto previene el acceso no autorizado incluso si el middleware es eludido.

**Nivel 3 — Row Level Security (RLS) en Supabase:** Políticas de RLS definidas en PostgreSQL que garantizan que un usuario solo pueda acceder a los datos que le corresponden. Por ejemplo, un docente solo puede leer y escribir su propia disponibilidad. Aunque el frontend y los Server Actions fallen en validar, la base de datos actúa como última línea de defensa.

## 15.3 Protección de Rutas

Las rutas del sistema se organizan bajo grupos de layout en Next.js con verificación de rol:

- `/dashboard/director/*` → Solo accesible por el rol "Director".
- `/dashboard/secretaria/*` → Solo accesible por el rol "Secretaria".
- `/dashboard/docente/*` → Solo accesible por el rol "Docente".
- `/auth/*` → Rutas públicas (login, recuperación de contraseña).
- Cualquier otra ruta → Redirige a login si no hay sesión, o al dashboard correspondiente si hay sesión.

## 15.4 JWT

Los tokens JWT emitidos por Supabase Auth contienen:

- `sub`: ID del usuario.
- `role`: Rol del usuario (director, secretaria, docente).
- `email`: Correo electrónico del usuario.
- `exp`: Fecha de expiración (1 hora para access tokens).
- `iat`: Fecha de emisión.

El refresh token se almacena en una cookie HttpOnly, Secure, SameSite=Lax, lo que previene el acceso desde JavaScript del lado del cliente y protege contra ataques XSS.

## 15.5 Encriptación

- Todas las comunicaciones entre el navegador y el servidor se realizan sobre HTTPS (TLS 1.3), garantizado por Vercel.
- Las comunicaciones entre el servidor de Next.js y Supabase se realizan mediante conexiones SSL.
- Las contraseñas nunca se almacenan en texto plano; Supabase utiliza bcrypt con salt.
- Los archivos de reportes generados se almacenan con URLs firmadas que expiran después de 1 hora.

## 15.6 Roles y Permisos (Matriz)

| Recurso | Director | Secretaria | Docente |
|---|---|---|---|
| Dashboard ejecutivo | ✅ Lectura | ❌ | ❌ |
| Dashboard operativo | ✅ Lectura | ✅ Lectura | ❌ |
| Dashboard docente | ❌ | ❌ | ✅ Lectura |
| Docentes | ✅ CRUD | ✅ CR (sin eliminar) | ❌ |
| Cursos | ✅ CRUD | ✅ CR | ❌ |
| Aulas | ✅ CRUD | ✅ CR | ❌ |
| Disponibilidad propia | ❌ | ❌ | ✅ CRU |
| Disponibilidad (todos) | ✅ Lectura | ✅ Lectura | ❌ |
| Generación horarios | ✅ Ejecutar | ❌ | ❌ |
| Modificación horarios | ✅ Ejecutar | ❌ | ❌ |
| Aprobación/Publicación | ✅ Ejecutar | ❌ | ❌ |
| Horario publicado | ✅ Lectura | ✅ Lectura | ✅ Lectura (propio) |
| Reportes | ✅ Generar/Descargar | ✅ Generar/Descargar | ✅ Descargar propio |
| Auditoría | ✅ Lectura completa | ❌ | ❌ |
| Períodos | ✅ CRUD | ✅ Lectura | ✅ Lectura |
| Configuración sistema | ✅ CRU | ❌ | ❌ |

## 15.7 Validaciones

- Toda entrada de usuario se valida con Zod tanto en el cliente (formularios) como en el servidor (Server Actions).
- Las consultas a la base de datos utilizan el cliente tipado de Supabase, que genera consultas parametrizadas, previniendo inyección SQL.
- Los archivos subidos (si los hay en futuras versiones) se validan por tipo MIME, extensión y tamaño antes de ser procesados.
- Los parámetros de URL y query strings se validan y sanitizan antes de ser utilizados.

## 15.8 Logs de Seguridad

- Cada intento de login (exitoso y fallido) se registra con IP, user agent y timestamp.
- Los accesos denegados por rol se registran en el módulo de auditoría.
- Los errores de validación del JWT (token expirado, token inválido, token manipulado) se registran.
- Los registros de seguridad están disponibles para el Director en el módulo de auditoría con filtro por tipo "Seguridad".

---

# 16. Estrategia de Escalabilidad Futura

## 16.1 Evolución a Microservicios

En una futura versión, si el sistema se extiende a múltiples escuelas profesionales de la UNT, se evaluará la migración a una arquitectura de microservicios:

- **Servicio de Horarios:** Contiene el algoritmo de generación y la lógica de asignación. Se independiza para poder ejecutarse en infraestructura con mayor capacidad de cómputo.
- **Servicio de Autenticación:** Se mantiene en Supabase Auth como servicio centralizado para todas las escuelas.
- **Servicio de Reportes:** Se independiza para manejar la generación de reportes de forma asíncrona, evitando bloquear la aplicación principal.
- **Servicio de Notificaciones:** Se independiza para manejar múltiples canales (email, push, SMS).

## 16.2 Implementación de Caché

- Implementar cache a nivel de consultas frecuentes con las capacidades de cache de Next.js 16 (Data Cache, Full Route Cache).
- Cachear los listados de docentes, cursos y aulas que cambian infrecuentemente.
- Cachear el horario publicado (inmutable hasta el próximo período).
- Invalidar el cache selectivamente cuando se realizan modificaciones.

## 16.3 Optimización de Rendimiento

- Implementar paginación del lado del servidor para todos los listados.
- Utilizar virtualización de tablas con TanStack Table para listas largas.
- Optimizar las consultas a PostgreSQL con índices apropiados.
- Implementar loading states y skeleton screens para mejorar la percepción de rendimiento.

## 16.4 Sistema de Colas

Para operaciones costosas (generación de horarios, generación de reportes masivos), implementar un sistema de colas utilizando las capacidades de Supabase Edge Functions o Vercel Functions con ejecución en background:

- La generación del horario se encola y se procesa de forma asíncrona.
- El usuario recibe una notificación cuando el proceso finaliza.
- Se permite reanudar la aplicación sin esperar la finalización.

## 16.5 Evolución de Notificaciones

- Fase inicial: Notificaciones internas dentro del sistema (base de datos + polling o Supabase Realtime).
- Fase futura 1: Integración con servicio de correo electrónico (Resend, SendGrid) para notificaciones por email.
- Fase futura 2: Notificaciones push en el navegador con Service Workers.
- Fase futura 3: Integración con bots de mensajería (WhatsApp Business API, Telegram) para notificaciones urgentes.

## 16.6 Inteligencia Artificial Futura

- **Predicción de disponibilidad:** Utilizar datos históricos de disponibilidad docente para predecir la disponibilidad del próximo semestre y pre-llenar la grilla.
- **Recomendación de asignación:** Analizar patrones de asignación exitosos en semestres anteriores para sugerir asignaciones óptimas.
- **Detección de anomalías:** Identificar patrones inusuales en la carga docente o el uso de aulas que puedan indicar problemas.
- **Optimización con modelos avanzados:** Explorar algoritmos de optimización metaheurísticos (algoritmos genéticos, recocido simulado) para mejorar la calidad del horario generado.

## 16.7 Integración con APIs Universitarias

- **SGA (Sistema de Gestión Académica):** Integración para obtener automáticamente el plan de estudios, la lista de docentes y el número de estudiantes matriculados.
- **SIGA (Sistema Integrado de Gestión Administrativa):** Integración para verificar la disponibilidad de aulas a nivel institucional (no solo de la escuela).
- **Portal de Transparencia:** Publicación automática de los horarios aprobados en el portal institucional.
- **Módulo de interoperabilidad SUNEDU:** Reporte automatizado de indicadores académicos.

---

# 17. Roadmap del Desarrollo

## Fase 1 — Planificación (Semana 1–2)

**Tareas:**
- Finalización y aprobación del documento PLANNING.md.
- Definición detallada del modelo de datos (entidades, atributos, relaciones).
- Diseño de los wireframes de todas las pantallas del sistema.
- Configuración del repositorio de código y ramificación (Git).
- Configuración del proyecto en Supabase (base de datos, autenticación).
- Configuración del proyecto en Vercel.
- Definición de las convenciones de código y guía de estilo.

**Entregables:**
- PLANNING.md aprobado.
- Modelo entidad-relación (MER) documentado.
- Wireframes de las pantallas principales.
- Repositorio configurado con estructura base.
- Proyecto de Supabase y Vercel creados.

## Fase 2 — Diseño (Semana 3–4)

**Tareas:**
- Diseño de la interfaz de usuario (UI) de alta fidelidad en Figma.
- Definición del sistema de diseño: paleta de colores, tipografía, iconografía, espaciado.
- Diseño de la grilla de horarios (desktop y móvil).
- Diseño de los formularios de registro (docentes, cursos, aulas, disponibilidad).
- Diseño del dashboard ejecutivo con sus tarjetas, gráficos y tablas.
- Diseño del layout de los reportes PDF.
- Revisión y aprobación del diseño.

**Entregables:**
- Prototipo interactivo en Figma.
- Guía de estilo del sistema.
- Diseño aprobado de todas las pantallas.

## Fase 3 — Backend (Semana 5–8)

**Tareas:**
- Creación del esquema de base de datos en Supabase (tablas, relaciones, índices).
- Configuración de Row Level Security (RLS) con políticas por rol.
- Implementación de la capa de dominio: entidades, interfaces de repositorio.
- Implementación de la capa de infraestructura: repositorios Supabase.
- Implementación de los casos de uso para cada módulo.
- Implementación de los Server Actions para CRUD de docentes, cursos, aulas, períodos.
- Implementación del sistema de autenticación con Supabase Auth.
- Implementación del middleware de autorización.
- Implementación del módulo de auditoría.
- Tests unitarios de la capa de dominio y los casos de uso.

**Entregables:**
- Base de datos configurada con todas las tablas y políticas RLS.
- Server Actions funcionales para todos los módulos CRUD.
- Autenticación y autorización implementadas.
- Módulo de auditoría funcional.
- Suite de tests unitarios con cobertura >70%.

## Fase 4 — Frontend (Semana 9–12)

**Tareas:**
- Configuración de Shadcn/UI con el sistema de diseño definido.
- Implementación del layout principal (sidebar, header, navegación).
- Implementación de las pantallas de autenticación (login, recuperación, cambio de contraseña).
- Implementación de los módulos CRUD: formularios de docentes, cursos, aulas, períodos.
- Implementación de las tablas de datos con TanStack Table.
- Implementación de la grilla interactiva de disponibilidad docente.
- Implementación de la vista de grilla del horario.
- Implementación del dashboard con tarjetas, gráficos e indicadores.
- Implementación del módulo de notificaciones.
- Implementación de la vista de auditoría.
- Adaptación responsive para tablet y móvil.

**Entregables:**
- Todas las pantallas implementadas y conectadas al backend.
- Sistema de navegación y layout completo.
- Dashboard funcional con datos en tiempo real.
- Interfaz responsive verificada en múltiples dispositivos.

## Fase 5 — Algoritmo de Generación (Semana 13–15)

**Tareas:**
- Implementación de la Fase 1 (Validación de información).
- Implementación de la Fase 2 (Filtrado de disponibilidad).
- Implementación de la Fase 3 (Validación de restricciones).
- Implementación de la Fase 4 (Priorización docente — sistema de puntuación).
- Implementación de la Fase 5 (Asignación de cursos a docentes).
- Implementación de la Fase 6 (Asignación de bloques y aulas).
- Implementación de la Fase 7 (Validación de conflictos).
- Implementación de la Fase 8 (Optimización).
- Implementación de la Fase 9 (Generación final).
- Tests unitarios exhaustivos del algoritmo con múltiples escenarios.
- Tests de rendimiento con datos realistas.

**Entregables:**
- Algoritmo de generación completamente funcional.
- Suite de tests con escenarios de borde y estrés.
- Documentación del algoritmo con ejemplos de ejecución.

## Fase 6 — Reportes (Semana 16–17)

**Tareas:**
- Implementación de la generación de PDF con PDF-lib (horario completo, por ciclo, por docente, por aula).
- Implementación de la generación de Excel con ExcelJS (carga docente, ocupación de aulas, horario).
- Diseño del formato institucional del PDF (logo, encabezados, pie de página).
- Implementación de las opciones de filtrado para los reportes.
- Tests de generación con datos reales.

**Entregables:**
- Reportes PDF generados con formato institucional.
- Reportes Excel generados con formato profesional.
- Funcionalidad de descarga verificada.

## Fase 7 — Pruebas (Semana 18–19)

**Tareas:**
- Tests de integración end-to-end (E2E) de los flujos principales.
- Tests de usabilidad con usuarios representativos (Director, Secretaria, Docente).
- Tests de rendimiento bajo carga simulada.
- Tests de seguridad (autenticación, autorización, inyección, XSS).
- Corrección de bugs detectados.
- Revisión final de la accesibilidad (WCAG 2.1 AA).

**Entregables:**
- Informe de resultados de pruebas.
- Lista de bugs corregidos.
- Certificación de calidad del sistema.

## Fase 8 — Despliegue (Semana 20)

**Tareas:**
- Configuración del entorno de producción en Vercel.
- Configuración del proyecto de producción en Supabase.
- Migración de datos de prueba a datos reales (carga inicial de docentes, cursos, aulas).
- Despliegue del sistema en producción.
- Verificación post-despliegue.
- Capacitación del Director de Escuela y la Secretaria Académica.
- Elaboración del manual de usuario.

**Entregables:**
- Sistema desplegado y accesible en producción.
- Manual de usuario entregado.
- Usuarios capacitados.
- Documentación de despliegue.

## Fase 9 — Mantenimiento (Continuo)

**Tareas:**
- Monitoreo del rendimiento y disponibilidad.
- Atención de incidencias y bugs reportados por los usuarios.
- Actualizaciones de seguridad de dependencias.
- Mejoras incrementales basadas en feedback de los usuarios.
- Preparación del sistema para cada nuevo semestre.

**Entregables:**
- Informes periódicos de estado del sistema.
- Actualizaciones desplegadas.
- Backlog de mejoras priorizado.

---

# 18. Conclusión

El presente documento PLANNING.md constituye la guía maestra para el desarrollo del **Sistema Inteligente de Gestión y Generación Automática de Horarios Académicos** de la Escuela Profesional de Ingeniería de Sistemas de la Universidad Nacional de Trujillo.

El sistema propuesto aborda un problema real y documentado: la generación manual de horarios académicos consume más de 80 horas-persona por semestre, genera conflictos recurrentes, distribuye la carga docente de forma desigual y carece de trazabilidad. La solución automatizada, basada en un algoritmo de resolución de restricciones con priorización docente, reducirá este proceso a menos de 4 horas incluyendo la revisión y aprobación.

La arquitectura seleccionada (Clean Architecture con Next.js 16.2.6 como framework full-stack, Supabase PostgreSQL como base de datos gestionada, y Tailwind CSS 4.3.0 con Shadcn/UI CLI v4 para la interfaz) garantiza un sistema moderno, mantenible y escalable. La separación por módulos funcionales, el uso de patrones de diseño (Repository, Service, DTO) y la validación con Zod en todas las capas aseguran la calidad técnica del producto.

El algoritmo de generación de horarios, diseñado en 9 fases con un sistema de puntuación ponderado (Categoría 35%, Antigüedad 25%, Disponibilidad 15%, Preferencia 15%, Carga 10%), respeta tanto las restricciones duras (inviolables) como las restricciones blandas (optimizables), produciendo horarios libres de conflictos con la máxima satisfacción posible de las preferencias docentes.

La estrategia de seguridad en tres niveles (middleware, Server Actions, RLS) protege el sistema de accesos no autorizados, mientras que el módulo de auditoría inmutable garantiza la trazabilidad completa de cada acción realizada.

El roadmap de 20 semanas distribuido en 9 fases proporciona un camino claro y realista hacia la entrega de un producto funcional, probado y desplegado en producción.

Este documento será la referencia permanente durante todo el ciclo de vida del proyecto. Cualquier decisión técnica, funcional o arquitectónica debe ser validada contra lo aquí definido, y toda desviación debe ser documentada y justificada.

---

**Elaborado por:** Equipo de Arquitectura de Software  
**Fecha:** 24 de mayo de 2026  
**Estado:** Aprobado para inicio de desarrollo  
**Próximo paso:** Fase 1 — Planificación detallada y configuración del entorno
