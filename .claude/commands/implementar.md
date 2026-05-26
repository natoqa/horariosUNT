Implementa el plan que acabamos de aprobar. Sigue estas reglas estrictamente:

## Proceso

1. **Relee CLAUDE.md** para recordar la arquitectura y las reglas del proyecto.

2. **Sigue el orden del plan aprobado.** No te saltes pasos ni agregues funcionalidad que no esté en el plan.

3. **Por cada archivo que crees o modifiques:**
   - Verifica que compile: ejecuta `npx tsc --noEmit` después de crear archivos TypeScript.
   - Verifica que respete la arquitectura Clean Architecture definida en CLAUDE.md.
   - Verifica que los imports sean correctos y no creen dependencias circulares.
   - Domain NO importa de infrastructure ni de app.
   - Application solo importa de domain.
   - Infrastructure importa de domain y application.

4. **Validaciones:**
   - Todo esquema Zod debe estar en `src/application/dtos/`.
   - Todo Server Action debe validar el input con Zod antes de cualquier operación.
   - Todo Server Action debe verificar la autenticación y el rol del usuario.

5. **Después de implementar todo:**
   - Ejecuta `npx tsc --noEmit` para verificar que no hay errores de tipos.
   - Ejecuta los tests si existen: `npm test` o `npx vitest run`.
   - Muestra un resumen con este formato:

```
## Resumen de implementación

### Archivos creados
- `ruta/archivo.ts` ✅

### Archivos modificados
- `ruta/archivo.ts` ✅

### Verificación
- TypeScript: ✅ sin errores / ❌ [errores]
- Tests: ✅ pasaron / ❌ [fallos] / ⏭️ no hay tests aún

### Próximos pasos
- [qué sigue según PLANNING.md]
```

## Reglas de seguridad

- Si encuentras algo ambiguo que no está en el plan ni en PLANNING.md, NO lo implementes. Pregúntame.
- Si necesitas instalar una dependencia nueva que no está en CLAUDE.md, pregúntame primero.
- No modifiques archivos que no estén en el plan sin avisarme.
