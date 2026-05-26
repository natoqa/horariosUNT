---
description: Algoritmo CSP de 9 fases, scoring docente y restricciones de horarios
paths:
  - "src/modules/horarios/**"
---

# Algoritmo de horarios (CSP)

9 fases: Validación → Filtrado disponibilidad → Clasificación restricciones → Priorización docente → Asignación cursos-docentes → Asignación bloques-aulas → Validación conflictos → Optimización (swaps) → Generación final.

## Scoring docente
```
Puntaje = (Categoría × 0.35) + (Antigüedad × 0.25) + (Disponibilidad × 0.15) + (Preferencia × 0.15) + (Carga × 0.10)
```
Categoría: Principal=100, Asociado=70, Auxiliar=40, Contratado=20.
Antigüedad: 20+=100, 15-19=80, 10-14=60, 5-9=40, 1-4=20, <1=10.

## Restricciones duras (inviolables)
- No simultaneidad docente (RN-001)
- No simultaneidad aula (RN-009)
- Cursos mismo ciclo no se superponen (RN-015)
- Capacidad aula ≥ estudiantes (RN-010)
- Tipo aula compatible (RN-011, RN-012)

## Restricciones blandas (optimizables)
- Preferencia horaria docente
- Distribución equitativa de carga
- Separación teoría/práctica en días diferentes (RN-016, RN-020)
- Mismo docente para teoría y práctica (RN-030)

Especificación completa: `docs/algoritmo.md` y `docs/requerimientos.md` (RN-001 a RN-032).
