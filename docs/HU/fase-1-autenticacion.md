# Historias de Usuario — Fase 1: Autenticación

> Módulo: `auth`
> Estado global: ✅ 3/3 READY

---

## HU-001 — Inicio de sesión ✅ READY
**Como** Director de Escuela
**Quiero** iniciar sesión con mi correo institucional y contraseña
**Para** acceder a las funcionalidades de gestión del sistema

**Prioridad:** Alta
**Criterios de aceptación:**
- El sistema valida las credenciales contra Supabase Auth.
- Si las credenciales son correctas, redirige al dashboard correspondiente al rol.
- Si las credenciales son incorrectas, muestra un mensaje de error claro sin revelar información sensible.
- La sesión expira automáticamente después de 8 horas de inactividad.
- Se registra el evento de inicio de sesión en el módulo de auditoría.

---

## HU-021 — Cambio de contraseña ✅ READY
**Como** cualquier usuario (Director, Secretaria, Docente)
**Quiero** cambiar mi contraseña
**Para** mantener la seguridad de mi cuenta

**Prioridad:** Baja
**Criterios de aceptación:**
- Debo ingresar mi contraseña actual antes de definir la nueva.
- La nueva contraseña debe cumplir requisitos mínimos: 8 caracteres, al menos una mayúscula, un número y un carácter especial.
- Al cambiar la contraseña, se cierra la sesión y debo iniciar sesión nuevamente.

---

## HU-025 — Recuperación de contraseña ✅ READY
**Como** cualquier usuario
**Quiero** recuperar mi contraseña si la olvidé
**Para** restablecer el acceso a mi cuenta sin contactar al administrador

**Prioridad:** Media
**Criterios de aceptación:**
- Puedo solicitar un enlace de recuperación ingresando mi correo institucional.
- Recibo un correo electrónico con un enlace válido por 30 minutos.
- El enlace me lleva a un formulario seguro para definir una nueva contraseña.
