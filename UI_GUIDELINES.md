# UI_GUIDELINES.md — Reglas de Interfaz para el Equipo

## Sistema de Horarios UNT — Guia de Estilo Visual

Estas reglas son OBLIGATORIAS para todo el equipo. Cualquier componente o pagina que no las respete sera rechazado en el PR review.

---

## 1. Paleta de Colores

Usamos variables CSS (NO colores hardcodeados). Siempre usar las clases de Tailwind que referencian las variables del sistema:

| Uso | Clase Tailwind | Descripcion |
|---|---|---|
| Fondo de pagina | `bg-background` | Gris azulado muy claro |
| Fondo de tarjetas | `bg-card` | Blanco |
| Texto principal | `text-foreground` | Casi negro |
| Texto secundario | `text-muted-foreground` | Gris medio |
| Bordes | `border-border` | Gris claro |
| Accion primaria | `bg-primary text-primary-foreground` | Azul-indigo oscuro |
| Secundario | `bg-secondary text-secondary-foreground` | Gris claro |
| Destructivo/Error | `text-destructive` o `bg-destructive/10` | Rojo |
| Exito | `text-emerald-700 bg-emerald-50` | Verde |
| Warning | `text-amber-700 bg-amber-50` | Amarillo |

**PROHIBIDO:**
- `bg-slate-50`, `bg-gray-100`, `text-gray-600` directos → usar `bg-muted`, `text-muted-foreground`
- Colores hex/rgb inline
- `bg-blue-600` para botones → usar `bg-primary`

---

## 2. Tipografia

- Font: Geist Sans (ya configurada globalmente)
- Titulos de pagina: `text-2xl font-bold tracking-tight`
- Subtitulos: `text-sm text-muted-foreground mt-1`
- Titulos de seccion (dentro de cards): `text-sm font-semibold`
- Labels de formulario: `text-xs font-medium text-muted-foreground`
- Texto de tabla header: `text-xs font-medium text-muted-foreground uppercase tracking-wide`
- Texto de tabla body: `text-sm` (normal), `font-medium text-foreground` (columna principal)

**PROHIBIDO:**
- `text-3xl` o mayor en titulos de pagina
- `font-bold` en subtitulos
- Usar `<h3>`, `<h4>` etc. sin clases — siempre con las clases definidas arriba

---

## 3. Layout de Paginas

Toda pagina dentro del dashboard sigue esta estructura:

```tsx
export default function MiModuloPage() {
  return (
    <div className="space-y-6">
      {/* Header de pagina */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Titulo</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Descripcion breve de la pagina
          </p>
        </div>
        {/* Icono opcional */}
        <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
          <MiIcono className="w-5 h-5 text-primary" />
        </div>
      </div>

      {/* Contenido */}
      <div className="rounded-xl border border-border bg-card p-6">
        {/* ... */}
      </div>
    </div>
  );
}
```

---

## 4. Tarjetas (Cards)

Usamos tarjetas como contenedores principales. NO usar el componente `<Card>` de shadcn para contenido de pagina — usar clases directas:

```tsx
{/* Tarjeta de contenido */}
<div className="rounded-xl border border-border bg-card p-6">
  <h2 className="text-sm font-semibold mb-4">Titulo de seccion</h2>
  {/* contenido */}
</div>

{/* Tarjeta de estadistica (KPI) */}
<div className="rounded-xl border border-border bg-card p-5">
  <div className="flex items-center justify-between mb-3">
    <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Label</p>
    <div className="w-8 h-8 rounded-lg flex items-center justify-center text-primary bg-primary/10">
      <Icono className="w-4 h-4" />
    </div>
  </div>
  <p className="text-2xl font-bold text-foreground">Valor</p>
  <p className="text-xs text-muted-foreground mt-1">Subtexto</p>
</div>
```

**REGLAS:**
- Border radius: `rounded-xl` (siempre)
- Border: `border border-border`
- Padding contenido: `p-6`
- Padding KPI: `p-5`
- NO usar sombras (`shadow-*`) en tarjetas del dashboard

---

## 5. Tablas

Todas las tablas del sistema siguen este patron:

```tsx
{/* Contenedor con header */}
<div className="rounded-xl border border-border bg-card overflow-hidden">
  <div className="px-6 py-4 border-b border-border">
    <h2 className="text-sm font-semibold">Titulo de tabla</h2>
  </div>
  
  <div className="overflow-x-auto">
    <table className="w-full text-sm">
      <thead>
        <tr className="border-b border-border bg-muted/30">
          <th className="h-10 px-6 text-left text-xs font-medium text-muted-foreground uppercase tracking-wide">
            Columna
          </th>
        </tr>
      </thead>
      <tbody>
        <tr className="border-b border-border last:border-0 hover:bg-muted/20 transition-colors">
          <td className="px-6 py-3.5">Valor</td>
        </tr>
      </tbody>
    </table>
  </div>
</div>
```

**REGLAS:**
- Header de tabla: fondo `bg-muted/30`, texto uppercase xs
- Filas: hover con `hover:bg-muted/20 transition-colors`
- Ultima fila sin borde: `last:border-0`
- Padding horizontal: `px-6`
- Padding vertical filas: `py-3.5`

---

## 6. Formularios

```tsx
<div className="space-y-1.5">
  <Label className="text-xs font-medium text-muted-foreground">
    Nombre del Campo
  </Label>
  <Input className="h-10" placeholder="Placeholder..." />
  {error && <p className="text-xs text-destructive">{error}</p>}
</div>
```

**REGLAS:**
- Altura de inputs: `h-10` o `h-11` (en login)
- Labels: `text-xs font-medium text-muted-foreground`
- Errores: `text-xs text-destructive`
- Spacing entre campos: usar `grid gap-4` o `space-y-4`
- Inputs con icono: usar `relative` + icono `absolute left-3 top-1/2 -translate-y-1/2`

---

## 7. Botones

Usamos el componente `<Button>` de shadcn. Variantes:

| Variante | Uso |
|---|---|
| `default` | Accion principal (crear, guardar) |
| `secondary` | Acciones secundarias |
| `destructive` | Eliminar, cancelar procesos |
| `ghost` | Acciones terciarias, iconos |
| `outline` | Alternativa a secondary |

**REGLAS:**
- Tamano por defecto: `size="default"` para formularios, `size="sm"` para acciones en tablas
- Texto de boton: verbo en infinitivo ("Crear", "Guardar", "Eliminar")
- Loading state: cambiar texto ("Creando...", "Guardando...")
- Siempre `disabled={pending}` durante submit

---

## 8. Estados de Carga / Error / Vacio

Toda pagina o componente que carga datos DEBE manejar los 4 estados:

```tsx
// Loading
<div className="flex items-center justify-center py-12">
  <div className="flex items-center gap-3 text-sm text-muted-foreground">
    <div className="w-4 h-4 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
    Cargando...
  </div>
</div>

// Error
<div className="flex items-center justify-center py-12">
  <div className="text-sm text-destructive bg-destructive/10 px-4 py-2 rounded-lg">
    {errorMessage}
  </div>
</div>

// Empty
<div className="flex flex-col items-center justify-center py-12 text-center">
  <div className="w-12 h-12 rounded-xl bg-muted flex items-center justify-center mb-3">
    <Icono className="w-6 h-6 text-muted-foreground" />
  </div>
  <p className="text-sm font-medium text-foreground">Titulo vacio</p>
  <p className="text-xs text-muted-foreground mt-1">Instruccion de que hacer</p>
</div>

// Success (mensajes inline)
<div className="rounded-md bg-emerald-50 border border-emerald-200 px-4 py-2.5">
  <p className="text-sm text-emerald-700">{message}</p>
</div>
```

---

## 9. Badges de Estado

Para cualquier entidad con estados, seguir este patron:

```tsx
<span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium bg-{color}-50 text-{color}-700">
  <span className="w-1.5 h-1.5 rounded-full bg-{color}-500" />
  {estado}
</span>
```

Colores por contexto:
- Configuracion/Draft: `gray`
- En proceso: `blue`
- Pendiente/Warning: `amber`
- Aprobado/Activo: `emerald`
- Especial/Publicado: `violet`
- Cerrado/Inactivo: `slate`

---

## 10. Espaciado

- Entre secciones de pagina: `space-y-6`
- Dentro de cards: `space-y-4`
- Grid de KPIs: `grid gap-4 sm:grid-cols-2 lg:grid-cols-4`
- Formularios grid: `grid grid-cols-1 md:grid-cols-3 gap-4`

---

## 11. Iconos

- Libreria: Lucide React (ya instalada)
- Tamano en sidebar: `w-[18px] h-[18px]`
- Tamano en KPI cards: `w-4 h-4`
- Tamano en page headers: `w-5 h-5`
- Tamano en inputs: `w-4 h-4`
- Color: hereda de `text-*` del padre

**PROHIBIDO:**
- Heroicons, Font Awesome u otras librerias
- SVGs inline (excepto en layouts compartidos)

---

## 12. Sidebar y Navegacion

La sidebar ya esta implementada. Si necesitas agregar un item de menu:

1. Editar `src/shared/components/layout/sidebar.tsx`
2. Agregar el item al array `menuItems` con la estructura:
```tsx
{
  title: 'Mi Modulo',
  href: '/{role}/mi-modulo',
  icon: MiIcono,  // De lucide-react
  roles: ['director', 'secretaria'],  // Roles que ven este item
}
```

**NO** crear tu propia navegacion lateral o breadcrumbs.

---

## 13. Responsive

- El sidebar es fijo (desktop-only por ahora)
- Usar `grid-cols-1 md:grid-cols-2 lg:grid-cols-4` para grids adaptables
- Las tablas usan `overflow-x-auto` para scroll horizontal en mobile
- NO usar breakpoints custom

---

## 14. Lo que NO hacer

- NO usar `className="dark:..."` — no soportamos dark mode aun
- NO instalar librerias de UI adicionales sin autorizacion de Renato
- NO crear archivos CSS por modulo — todo va via Tailwind classes
- NO usar `style={{}}` inline
- NO poner logica de negocio en componentes de presentacion
- NO crear componentes compartidos en tu modulo — pedirlos a Renato en `shared/`
- NO usar colores de Tailwind directos para elementos de UI principal (usar variables del tema)
- NO usar `shadow-lg`, `shadow-xl` — maximo `shadow-sm` y solo en popovers/dropdowns

---

## Ejemplo completo de pagina

```tsx
// app/(dashboard)/director/mi-modulo/page.tsx
import { MiModuloTable } from '@/modules/mi-modulo';
import { BookOpen } from 'lucide-react';

export default function MiModuloPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Mi Modulo</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Descripcion corta de lo que hace esta pagina
          </p>
        </div>
        <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
          <BookOpen className="w-5 h-5 text-primary" />
        </div>
      </div>

      <div className="rounded-xl border border-border bg-card overflow-hidden">
        <div className="px-6 py-4 border-b border-border">
          <h2 className="text-sm font-semibold">Lista de items</h2>
        </div>
        <MiModuloTable />
      </div>
    </div>
  );
}
```

---

## Referencia rapida de archivos

| Archivo | Que tiene |
|---|---|
| `app/globals.css` | Variables del tema (NO editar sin autorizacion) |
| `src/shared/components/ui/` | Componentes base de shadcn |
| `src/shared/components/layout/` | Sidebar, Header, MainLayout |
| `src/shared/lib/utils.ts` | Funcion `cn()` para classnames |

---

**Ultima actualizacion:** 25 de mayo de 2026
