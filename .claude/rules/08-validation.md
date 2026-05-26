---
description: Validación Zod en Server Actions y DTOs antes de base de datos
paths:
  - "src/**/dtos/**"
  - "src/**/actions/**"
---

# Validación con Zod

- Todo input se valida con Zod en el Server Action ANTES de cualquier operación de base de datos.
- Esquemas Zod en `application/dtos/` de cada módulo. Se reutilizan en cliente y servidor.
- Todo Server Action debe verificar autenticación y rol del usuario antes de procesar.
