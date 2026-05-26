---
description: Reglas de Supabase, RLS, auditoría y acceso a base de datos
paths:
  - "src/**/infrastructure/**"
  - "src/**/repositories/**"
  - "src/shared/lib/supabase*"
---

# Base de datos (Supabase)

- No SQL directo. Usar cliente tipado de Supabase.
- Toda tabla con RLS activado y políticas por rol.
- No modificar esquema de base de datos sin confirmación del usuario.
- Toda mutación registra entrada en auditoría. Sin excepciones (RN-025).
- Registros de auditoría son inmutables: solo INSERT, nunca UPDATE ni DELETE (RN-026).
