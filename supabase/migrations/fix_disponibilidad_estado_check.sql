-- Actualizar constraint CHECK de disponibilidad para aceptar valores con mayúsculas
-- Ejecutar en: Supabase Dashboard > SQL Editor

ALTER TABLE public.disponibilidad 
DROP CONSTRAINT IF EXISTS disponibilidad_estado_check;

ALTER TABLE public.disponibilidad 
ADD CONSTRAINT disponibilidad_estado_check 
CHECK (estado IN ('Disponible', 'No disponible', 'Preferido'));
