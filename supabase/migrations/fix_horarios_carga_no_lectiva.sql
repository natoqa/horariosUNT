-- Migraciones para corregir horarios y carga no lectiva
-- Fecha: 2026-06-13

-- 1. Agregar columnas bloque y dia a actividades_no_lectivas
ALTER TABLE actividades_no_lectivas 
ADD COLUMN IF NOT EXISTS bloque text,
ADD COLUMN IF NOT EXISTS dia text;

-- Comentarios sobre las columnas
COMMENT ON COLUMN actividades_no_lectivas.bloque IS 'Bloque horario de la actividad (ej: "07:00 - 08:00", "08:00 - 09:00")';
COMMENT ON COLUMN actividades_no_lectiva.dia IS 'Día de la semana de la actividad (ej: "Lunes", "Martes")';

-- 2. Corregir política RLS de horarios para usar mayúsculas
DROP POLICY IF EXISTS "Todos pueden ver horarios publicados, director y secretaria ven" ON horarios;

CREATE POLICY "Todos pueden ver horarios publicados, director y secretaria ven"
ON horarios FOR SELECT
TO public
USING (
  (estado = 'Publicado') OR 
  ((auth.jwt() -> 'user_metadata'::text) ->> 'role'::text) = ANY (ARRAY['director'::text, 'secretaria'::text])
);

-- 3. Corregir política RLS de asignaciones para usar mayúsculas
DROP POLICY IF EXISTS "Todos pueden ver asignaciones de horarios publicados" ON asignaciones;

CREATE POLICY "Todos pueden ver asignaciones de horarios publicados"
ON asignaciones FOR SELECT
TO public
USING (
  (horario_id IN ( SELECT horarios.id FROM horarios WHERE horarios.estado = 'Publicado')) OR 
  ((auth.jwt() -> 'user_metadata'::text) ->> 'role'::text) = ANY (ARRAY['director'::text, 'secretaria'::text])
);
