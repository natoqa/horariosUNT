Diagnostica y corrige el problema: $ARGUMENTS

## Proceso

1. **Reproduce el error:**
   - Error de compilación: `npx tsc --noEmit`
   - Error de test: `npx vitest run`
   - Error de runtime: lee logs o descripción del problema.

2. **Identifica la causa raíz:** tipos, lógica, dependencias o configuración.

3. **Propón la solución ANTES de aplicarla:**
```
## Diagnóstico

### Error
[descripción exacta]

### Causa
[por qué ocurre]

### Solución propuesta
- Archivo: `ruta/archivo.ts`
- Cambio: [qué modificar]
- Motivo: [por qué esto lo arregla]

¿Aplico la corrección?
```

4. **Si recibo confirmación, aplica la corrección:**
   - Cambio mínimo necesario. No refactorizar código que funciona.
   - Verificar: `npx tsc --noEmit` + `npx vitest run`.

5. **Si el error es de lógica de negocio**, verificar contra RN-XXX en `docs/requerimientos.md` antes de corregir.
