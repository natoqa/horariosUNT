# Convenciones de código

- Código en inglés. UI (labels, mensajes, placeholders) en español.
- Archivos: kebab-case. Componentes React: PascalCase.
- Cero `any`. Usar `unknown` y validar.
- Manejar siempre 4 estados en carga de datos: loading, error, empty, success.
- Tests junto al archivo: `archivo.ts` → `archivo.test.ts`. Framework: Vitest.
- Cada use-case y domain service debe tener test unitario.
