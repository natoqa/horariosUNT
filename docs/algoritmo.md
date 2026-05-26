# Algoritmo de Generación de Horarios

> Secciones 11-12 del PLANNING original. Diseño del algoritmo CSP y sistema de puntuación.

---

## Enfoque: Constraint Satisfaction Problem (CSP) con optimización por priorización

### 9 Fases del Algoritmo

#### Fase 1 — Validación de Información
Verificar que período esté en "Generación", todos los cursos tengan datos completos, todos los docentes activos tengan disponibilidad registrada, y exista al menos un aula compatible por curso. Si falla → reporte de errores y abortar.

#### Fase 2 — Filtrado de Disponibilidad
Construir matriz `Docente × Bloque → {disponible, preferido, no disponible}`. Cruzar con restricciones de aulas. Validar que cada docente tenga horas suficientes para su carga mínima.

#### Fase 3 — Clasificación de Restricciones
- **Duras (inviolables):** No simultaneidad docente/aula, no superposición mismo ciclo, capacidad aula, tipo aula compatible
- **Blandas (optimizables):** Preferencia horaria, distribución equitativa carga, separación teoría/práctica, mismo docente teoría+práctica

#### Fase 4 — Priorización Docente
Calcular puntaje de prioridad con fórmula ponderada (ver sección Puntuación). Ordenar docentes de mayor a menor puntaje. Los de mayor puntaje se atienden primero.

#### Fase 5 — Asignación de Cursos a Docentes
Cada grupo de cada curso = unidad de asignación independiente. Para cada unidad, determinar docentes elegibles. Asignar respetando afinidad, carga máxima y distribución equitativa. Intentar mismo docente para teoría y práctica.

#### Fase 6 — Asignación de Bloques y Aulas
Ordenar por restricción (más restringidos primero). Para cada unidad: obtener bloques disponibles del docente → filtrar conflictos de ciclo → filtrar aulas compatibles (tipo + capacidad) → priorizar bloques "Preferido" → seleccionar combinación óptima bloque-aula.

#### Fase 7 — Validación de Conflictos
Recorrer cada bloque verificando: no simultaneidad docente, no simultaneidad aula, no superposición ciclo, carga no excedida, restricciones aulas respetadas.

#### Fase 8 — Optimización
Mejoras locales (swaps) para: aumentar preferencias respetadas, mejorar distribución carga, separar teoría/práctica. Cada swap se valida contra restricciones duras. Repetir hasta convergencia o límite de iteraciones.

#### Fase 9 — Generación Final
Almacenar horario como "Borrador". Generar resumen estadístico. Presentar en grilla visual. Resaltar unidades no asignadas o conflictos para resolución manual.

---

## Sistema de Puntuación

### Fórmula
```
Puntaje = (C × 0.35) + (A × 0.25) + (D × 0.15) + (P × 0.15) + (L × 0.10)
```

### Variables

| Factor | Peso | Valores |
|---|---|---|
| **Categoría (C)** | 0.35 | Principal=100, Asociado=70, Auxiliar=40, Contratado=20 |
| **Antigüedad (A)** | 0.25 | 20+=100, 15-19=80, 10-14=60, 5-9=40, 1-4=20, <1=10 |
| **Disponibilidad (D)** | 0.15 | ≥80%=100, 60-79%=75, 40-59%=50, mínimo-39%=25 |
| **Preferencia (P)** | 0.15 | 100%=100, 75-99%=75, 50-74%=50, 25-49%=25, <25%=10 |
| **Carga actual (L)** | 0.10 | 0-25%=100, 26-50%=75, 51-75%=50, 76-90%=25, >90%=0 |

### Ejemplo
Dr. Juan Pérez: Principal(100), 18 años(80), 72% bloques(75), 85% preferidos(75), 35% carga(75)
```
Puntaje = (100×0.35) + (80×0.25) + (75×0.15) + (75×0.15) + (75×0.10) = 85.0
```

### Desempate
1. Mayor categoría → 2. Mayor antigüedad → 3. Mayor disponibilidad → 4. Orden alfabético apellido
