Genera tests para: $ARGUMENTS

## Reglas

1. **Lee `docs/requerimientos.md`** para obtener las reglas de negocio (RN-XXX) y requerimientos (RF-XXX) que los tests deben validar.

2. **Lee el código existente** del módulo para entender qué funciones y casos de uso testear.

3. **Tipos de test según la capa:**
   - `domain/entities/` → Tests unitarios puros (sin mocks, sin BD).
   - `domain/services/` → Tests unitarios con mocks de repositorios.
   - `application/use-cases/` → Tests unitarios con mocks de repositorios y servicios.
   - `infrastructure/` → Tests de integración.

4. **Framework:** Vitest. Estructura:
```typescript
import { describe, it, expect, vi } from 'vitest'

describe('NombreDelModulo', () => {
  describe('caso de uso o función', () => {
    it('debe hacer X cuando Y', () => {
      // Arrange → Act → Assert
    })
  })
})
```

5. **Tests obligatorios para cada módulo:**
   - Caso exitoso (happy path).
   - Validaciones de Zod (inputs inválidos).
   - Reglas de negocio aplicables (cada RN-XXX relevante).
   - Permisos (roles no autorizados rechazados).
   - Casos de borde (listas vacías, valores límite, duplicados).

6. **Ubicación:** junto al archivo: `archivo.ts` → `archivo.test.ts`.

7. **Después de crear los tests, ejecútalos:** `npx vitest run`

8. **Muestra el resultado:**
```
## Tests generados: [módulo]

### Archivos creados
- `ruta/archivo.test.ts` — X tests

### Resultado
- Total: X tests
- ✅ Pasaron: X
- ❌ Fallaron: X [detalle]

### Cobertura de reglas de negocio
- RN-XXX: ✅ cubierta
```
