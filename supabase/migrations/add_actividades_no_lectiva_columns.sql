-- Agregar columnas faltantes a la tabla actividades_no_lectivas
-- Estas columnas permiten asignar horarios específicos (día y bloque) a las actividades no lectivas
-- para que aparezcan en el horario individual del docente

ALTER TABLE actividades_no_lectivas 
ADD COLUMN IF NOT EXISTS bloque text,
ADD COLUMN IF NOT EXISTS dia text;

-- Comentario sobre las columnas
COMMENT ON COLUMN actividades_no_lectivas.bloque IS 'Bloque horario de la actividad (ej: "07:00 - 08:00", "08:00 - 09:00")';
COMMENT ON COLUMN actividades_no_lectiva.dia IS 'Día de la semana de la actividad (ej: "Lunes", "Martes")';
