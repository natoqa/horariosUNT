---
description: Paleta de colores, tipografía, componentes UI, badges y estados visuales
paths:
  - "src/**/presentation/**"
  - "src/**/components/**"
  - "src/shared/components/**"
---

# UI Guidelines (obligatorias)

## Paleta de colores
Usar variables CSS de Tailwind: `bg-background`, `bg-card`, `text-foreground`, `text-muted-foreground`, `border-border`, `bg-primary`, `text-destructive`.
PROHIBIDO: colores hex/rgb inline o genéricos como `bg-blue-600` para botones primarios.

## Tipografía
- Títulos de página: `text-2xl font-bold tracking-tight`
- Subtítulos: `text-sm text-muted-foreground mt-1`

## Layout estándar de páginas
```tsx
<div className="space-y-6">
  <div className="flex items-center justify-between">...Header...</div>
  <div className="rounded-xl border border-border bg-card p-6">...Content...</div>
</div>
```

## Componentes
- **Tarjetas**: `rounded-xl border border-border p-6 bg-card`. NO usar sombras (`shadow-lg`).
- **Tablas**: Contenedor `rounded-xl border border-border overflow-hidden`. Header `bg-muted/30 text-xs uppercase text-muted-foreground tracking-wide`. Filas `hover:bg-muted/20`. Última fila `last:border-0`.
- **Formularios**: Inputs `h-10`. Labels `text-xs font-medium text-muted-foreground`. Errores `text-xs text-destructive`.
- **Botones**: `<Button>` de Shadcn (`default`, `secondary`, `destructive`, `ghost`, `outline`). Siempre `disabled={pending}` durante submit. Texto en infinitivo ("Crear", "Guardar").

## Badges de estado
```tsx
<span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium bg-{color}-50 text-{color}-700">
  <span className="w-1.5 h-1.5 rounded-full bg-{color}-500" />
  {estado}
</span>
```
Colores: Draft=gray, Proceso=blue, Warning=amber, Activo=emerald, Cerrado=slate.

## Iconos y espaciado
- Lucide React. Tamaños: `w-5 h-5` en headers, `w-4 h-4` en inputs/KPIs. No usar Heroicons.
- Espacios: `space-y-6` entre secciones. `grid gap-4` en formularios/KPIs.

## Estados requeridos (siempre manejar los 4)
1. **Loading**: Spinner `animate-spin` + texto "Cargando...".
2. **Error**: Caja `bg-destructive/10 text-destructive`.
3. **Empty**: Icono centrado + texto instructivo.
4. **Success**: Inline `bg-emerald-50 text-emerald-700`.
