-- Actualizar constraint CHECK de horarios para aceptar valores con mayúsculas
-- Ejecutar en: Supabase Dashboard > SQL Editor

ALTER TABLE public.horarios 
DROP CONSTRAINT IF EXISTS horarios_estado_check;

ALTER TABLE public.horarios 
ADD CONSTRAINT horarios_estado_check 
CHECK (estado IN ('Borrador', 'Aprobado', 'Publicado'));
