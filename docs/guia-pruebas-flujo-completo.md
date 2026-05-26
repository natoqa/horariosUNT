# Guia de Pruebas — Flujo Completo del Sistema

> Sistema de Gestion y Generacion Automatica de Horarios Academicos
> Escuela Profesional de Ingenieria de Sistemas — UNT

---

## Roles del sistema

| Rol | Acceso |
|---|---|
| **Director** | Todo: periodos, docentes, cursos, aulas, disponibilidad, horarios, reportes |
| **Secretaria** | Docentes, cursos, aulas, horarios (solo vista), reportes |
| **Docente** | Disponibilidad (propia), horarios (propio), dashboard |

---

## Flujo completo paso a paso

### Fase 1 — Autenticacion

| # | Paso | Rol | Ruta | Que verificar |
|---|---|---|---|---|
| 1.1 | Iniciar sesion | Todos | `/login` | Email + contraseña validos → redirige al dashboard del rol |
| 1.2 | Login incorrecto | Todos | `/login` | Credenciales incorrectas → muestra mensaje de error |
| 1.3 | Acceso a ruta prohibida | Docente | `/director/periodos` | Redirige a `/docente` (no puede ver paginas de otro rol) |

---

### Fase 2 — Configuracion de datos maestros (Director)

> **Prerequisito:** Iniciar sesion como Director

#### 2.1 — Crear periodo academico

| # | Paso | Ruta | Que verificar |
|---|---|---|---|
| 2.1.1 | Ir a Periodos | `/director/periodos` | Se muestra la lista de periodos (o vacia si es la primera vez) |
| 2.1.2 | Crear periodo | Click "Crear periodo" | Formulario: nombre, fecha inicio, fecha fin, fecha limite disponibilidad |
| 2.1.3 | Guardar | Submit | Periodo creado con estado **Configuracion**. Aparece en la tabla |

#### 2.2 — Registrar docentes

| # | Paso | Ruta | Que verificar |
|---|---|---|---|
| 2.2.1 | Ir a Docentes | `/director/docentes` | Lista de docentes (o vacia) |
| 2.2.2 | Registrar docente | Formulario lateral | Nombres, apellidos, DNI, email, telefono, categoria, regimen, condicion, carga maxima |
| 2.2.3 | Guardar | Submit | Docente aparece en la tabla con estado Activo |
| 2.2.4 | Editar docente | Click icono lapiz | Modificar campos (DNI no editable) |
| 2.2.5 | Validar duplicados | Intentar DNI o email repetido | Muestra error de validacion |

**Registrar al menos 3-5 docentes con diferentes categorias y regimenes.**

#### 2.3 — Registrar cursos

| # | Paso | Ruta | Que verificar |
|---|---|---|---|
| 2.3.1 | Ir a Cursos | `/director/cursos` | Lista de cursos con filtros (ciclo, tipo, estado) |
| 2.3.2 | Registrar curso | Formulario lateral | Codigo, nombre, ciclo (I-X), tipo, horas teoricas/practicas, creditos, laboratorio |
| 2.3.3 | Guardar | Submit | Curso aparece en la tabla |
| 2.3.4 | Gestionar grupos | Click icono capas | Crear secciones (A, B, C) para el periodo activo con num. estudiantes |
| 2.3.5 | Filtrar cursos | Usar dropdowns | Filtrar por ciclo, tipo, estado funciona correctamente |

**Registrar cursos de varios ciclos. Crear grupos (secciones) para cada curso.**

#### 2.4 — Registrar aulas

| # | Paso | Ruta | Que verificar |
|---|---|---|---|
| 2.4.1 | Ir a Aulas | `/director/aulas` | Lista de aulas |
| 2.4.2 | Registrar aula | Formulario | Codigo, nombre, ubicacion, capacidad, tipo, equipamiento |
| 2.4.3 | Guardar | Submit | Aula aparece en la tabla con estado Activo |

**Registrar al menos 5-6 aulas de diferentes tipos (teorica, lab computo, etc.).**

---

### Fase 3 — Disponibilidad y generacion de horarios

#### 3.1 — Transicion del periodo a Recopilacion

| # | Paso | Rol | Ruta | Que verificar |
|---|---|---|---|---|
| 3.1.1 | Avanzar estado del periodo | Director | `/director/periodos` | Cambiar estado de Configuracion → **Recopilacion** |

#### 3.2 — Registro de disponibilidad

| # | Paso | Rol | Ruta | Que verificar |
|---|---|---|---|---|
| 3.2.1 | Ir a Disponibilidad | Docente | `/docente/disponibilidad` | Grilla semanal: Lunes a Sabado, 07:00 a 21:00 (84 bloques) |
| 3.2.2 | Marcar bloques disponibles | Docente | Click en bloques | Bloques cambian de color al marcarlos como disponible/no disponible |
| 3.2.3 | Guardar disponibilidad | Docente | Click guardar | Mensaje de confirmacion. Total horas >= minimo segun regimen |
| 3.2.4 | Verificar como director | Director | `/director/disponibilidad` | Ver % de docentes que han registrado disponibilidad |

**Repetir 3.2.1-3.2.3 para cada docente registrado.**

#### 3.3 — Generacion del horario

| # | Paso | Rol | Ruta | Que verificar |
|---|---|---|---|---|
| 3.3.1 | Avanzar periodo a Generacion | Director | `/director/periodos` | Estado cambia a **Generacion** |
| 3.3.2 | Generar horario | Director | `/director/horarios` | Click "Generar". Barra de progreso del algoritmo (9 fases) |
| 3.3.3 | Ver resultados | Director | `/director/horarios` | Resumen: cursos asignados, no asignados, % preferencias respetadas |
| 3.3.4 | Ajustar manualmente | Director | `/director/horarios` | Seleccionar un bloque, cambiar docente/aula. Verificar que detecta conflictos |

#### 3.4 — Aprobacion y publicacion

| # | Paso | Rol | Ruta | Que verificar |
|---|---|---|---|---|
| 3.4.1 | Aprobar horario | Director | `/director/horarios` | Estado del periodo → **Aprobado**. Horario se bloquea para re-generacion |
| 3.4.2 | Publicar horario | Director | `/director/horarios` | Estado → **Publicado**. Horario visible para docentes |

---

### Fase 4 — Reportes y vistas

#### 4.1 — Reportes (Director / Secretaria)

| # | Paso | Ruta | Que verificar |
|---|---|---|---|
| 4.1.1 | Ir a Reportes | `/{rol}/reportes` | Se muestra selector de periodo y 3 tabs: Horarios, Carga Docente, Ocupacion Aulas |
| 4.1.2 | Tab Horarios — PDF | Click "Descargar PDF" | Se descarga PDF con grilla semanal por ciclo, encabezado institucional |
| 4.1.3 | Tab Horarios — Excel | Click "Descargar Excel" | Se descarga Excel con hojas: por ciclo, carga docente, ocupacion aulas |
| 4.1.4 | Tab Carga Docente | Click tab | Tabla con: docente, categoria, regimen, horas asignadas/maximas, % carga, cursos |
| 4.1.5 | Verificar resaltado | Visual | Docentes ≥90% en rojo, sin asignacion en ambar |
| 4.1.6 | Carga Docente — PDF | Click "Descargar PDF" | PDF con tabla de carga docente |
| 4.1.7 | Tab Ocupacion Aulas | Click tab | KPIs (total aulas, promedio ocupacion, aulas ≥80%) + tabla resumen |
| 4.1.8 | Ver grilla de un aula | Click "Ver grilla" en un aula | Grilla semanal 6 dias x 14 bloques. Ocupados en azul con curso+docente, libres en gris |
| 4.1.9 | Ocupacion Aulas — PDF | Click "Descargar PDF" (en vista de grilla) | PDF del aula seleccionada con grilla y % ocupacion |
| 4.1.10 | Volver al resumen | Click "Volver" | Regresa a la tabla resumen de todas las aulas |

#### 4.2 — Vista del docente

| # | Paso | Rol | Ruta | Que verificar |
|---|---|---|---|---|
| 4.2.1 | Ver horario publicado | Docente | `/docente/horarios` | Grilla semanal solo con cursos del docente logueado |
| 4.2.2 | Descargar PDF personal | Docente | Click "Descargar PDF" | PDF con horario individual |

---

### Fase 5 — Dashboard

| # | Paso | Rol | Ruta | Que verificar |
|---|---|---|---|---|
| 5.1 | Dashboard Director | Director | `/director` | Saludo, tarjetas KPI, actividades recientes, resumen de periodos |
| 5.2 | Dashboard Secretaria | Secretaria | `/secretaria` | Saludo, tarjetas KPI, estado del sistema, tareas pendientes |
| 5.3 | Dashboard Docente | Docente | `/docente` | Saludo, estado disponibilidad, grilla de horario, cursos asignados |

> **Nota:** Los dashboards actualmente muestran datos decorativos (hardcoded). Verificar que la estructura visual carga correctamente.

---

## Pruebas de seguridad rapidas

| # | Prueba | Que verificar |
|---|---|---|
| S1 | Docente intenta acceder a `/director/periodos` | Redirige a `/docente` |
| S2 | Secretaria intenta acceder a `/director/periodos` | Redirige a `/secretaria` |
| S3 | Usuario no logueado accede a `/director` | Redirige a `/login` |
| S4 | Docente intenta llamar action de crear curso | Retorna "No tiene permisos" |

---

## Resumen del orden recomendado

```
1. Login como Director
2. Crear periodo academico (estado: Configuracion)
3. Registrar docentes (3-5)
4. Registrar cursos (8-10) + crear grupos/secciones
5. Registrar aulas (5-6)
6. Avanzar periodo a Recopilacion
7. Login como Docente (por cada docente)
8.   Registrar disponibilidad horaria
9. Login como Director
10. Avanzar periodo a Generacion
11. Generar horario automatico
12. Revisar y ajustar manualmente si es necesario
13. Aprobar horario
14. Publicar horario
15. Verificar reportes (PDF, Excel, Carga Docente, Ocupacion Aulas)
16. Login como Docente → verificar horario publicado
17. Login como Secretaria → verificar acceso a reportes y datos
```
