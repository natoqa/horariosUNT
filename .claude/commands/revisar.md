Revisa el código del módulo o archivo indicado: $ARGUMENTS

## Checklist de revisión

### 1. Arquitectura
- [ ] ¿Respeta Clean Architecture? (domain sin dependencias externas, application solo importa domain)
- [ ] ¿Los Server Actions están en archivos separados con `'use server'`?
- [ ] ¿Los componentes son Server Components por defecto? ¿`'use client'` solo donde es necesario?
- [ ] ¿Se usa el patrón Repository? (interfaz en domain, implementación en infrastructure)

### 2. Seguridad
- [ ] ¿Todo Server Action valida input con Zod?
- [ ] ¿Todo Server Action verifica autenticación y rol?
- [ ] ¿Las rutas están protegidas por proxy.ts?
- [ ] ¿La tabla tiene RLS activado en Supabase?

### 3. Reglas de negocio
- Lee las reglas de negocio (RN-XXX) en `docs/requerimientos.md`.
- [ ] ¿Se respetan todas las reglas aplicables a este módulo?

### 4. Calidad de código
- [ ] ¿No hay `any` en TypeScript?
- [ ] ¿Se manejan los estados: loading, error, empty, success?
- [ ] ¿Nombres descriptivos en inglés? ¿UI en español?
- [ ] ¿Manejo de errores adecuado?

### 5. Auditoría
- [ ] ¿Toda mutación registra una entrada en auditoría?

## Output

```
## Revisión: [módulo/archivo]

### ✅ Correcto
- [qué está bien]

### ⚠️ Advertencias
- [qué se podría mejorar] → [sugerencia]

### ❌ Problemas
- [qué está mal] → [cómo arreglarlo]

### Veredicto: APROBADO / NECESITA CAMBIOS
```
