-- Agregar columna escuela a la tabla docentes
-- Ejecutar en: Supabase Dashboard > SQL Editor

ALTER TABLE public.docentes 
ADD COLUMN escuela VARCHAR(50) NOT NULL DEFAULT 'Ingeniería de Sistemas';

-- Agregar constraint CHECK para validar los valores
ALTER TABLE public.docentes 
DROP CONSTRAINT IF EXISTS docentes_escuela_check;

ALTER TABLE public.docentes 
ADD CONSTRAINT docentes_escuela_check 
CHECK (escuela IN ('Ingeniería de Sistemas', 'Ingeniería Industrial', 'Contabilidad', 'Economía', 'Física', 'Matemática', 'Psicología', 'Filosofía', 'Estadística', 'Informática', 'Ingeniería Mecánica', 'Ingeniería Civil', 'Otra'));
