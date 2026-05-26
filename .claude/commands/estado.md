Analiza el estado actual del proyecto comparándolo con PLANNING.md.

## Proceso

1. **Lee PLANNING.md** para ver el progreso esperado.

2. **Escanea el código fuente** en `src/` para determinar qué existe.

3. **Genera el reporte:**

```
## Estado del proyecto — [fecha]

### Módulos
| # | Módulo | Estado | Archivos | Tests | Notas |
|---|--------|--------|----------|-------|-------|
| 1 | auth | ✅ Completo / 🔨 En progreso / ❌ Pendiente | X/Y | X/Y | ... |
| 2 | periodos | ... | ... | ... | ... |
| ... | ... | ... | ... | ... | ... |

### Requerimientos funcionales cubiertos
- Implementados: X/62
- Pendientes: [lista de RF-XXX pendientes más prioritarios]

### Deuda técnica
- [problemas detectados]

### Próximo paso recomendado
- [qué implementar según el roadmap]
```

4. **Verifica la salud del proyecto:**
   - Ejecuta `npx tsc --noEmit` y reporta errores.
   - Ejecuta `npx vitest run` si hay tests.
   - Verifica `npm run build`.
