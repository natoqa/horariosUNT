Lee la documentación del proyecto y analiza lo que se va a implementar: $ARGUMENTS

## Pasos obligatorios

1. **Identifica el módulo** al que pertenece la tarea.

2. **Extrae los requerimientos** relacionados:
   - Requerimientos funcionales (RF-XXX) de `docs/requerimientos.md`
   - Reglas de negocio (RN-XXX) de `docs/requerimientos.md`
   - Historias de usuario (HU-XXX) de `docs/HU/`

3. **Revisa dependencias**:
   - ¿Qué módulos previos necesitan estar implementados?
   - ¿Están implementados? Verifica los archivos existentes en `src/`.
   - Si falta alguna dependencia, indícalo como bloqueante.

4. **Verifica el estado actual del proyecto**:
   - Lee los archivos existentes en `src/` para entender qué ya hay.
   - Identifica si hay código que se debe modificar vs crear desde cero.

5. **Genera el plan** con este formato exacto:

```
## Plan de implementación: [nombre del módulo/feature]

### Requerimientos cubiertos
- RF-XXX: [descripción]
- RN-XXX: [descripción]
- HU-XXX: [descripción]

### Dependencias
- [módulo] → [estado: ✅ implementado / ❌ falta]

### Archivos a crear
1. `ruta/archivo.ts` — [qué hace]

### Archivos a modificar
1. `ruta/archivo.ts` — [qué cambio]

### Orden de implementación
1. [paso 1] — [por qué primero]

### Validaciones necesarias
- [qué validar con Zod]

### Tests a escribir
- [qué testear]

### Riesgos o dudas
- [algo que no esté claro]
```

6. **NO escribas código.** Solo presenta el plan y espera mi aprobación.
