-- Migración para agregar gestión de planes de estudio
-- Fecha: 2026-06-18

-- 1. Verificar si la tabla planes_estudio existe y crearla si no
DO $$
BEGIN
  IF NOT EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'planes_estudio') THEN
    CREATE TABLE planes_estudio (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      nombre TEXT NOT NULL,
      anio INTEGER NOT NULL,
      pdf_url TEXT,
      estado TEXT NOT NULL DEFAULT 'Activo' CHECK (estado IN ('Activo', 'Inactivo')),
      fecha_publicacion DATE,
      created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
      updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
    );
    
    -- Crear trigger para updated_at
    CREATE TRIGGER set_updated_at_planes_estudio
      BEFORE UPDATE ON planes_estudio
      FOR EACH ROW
      EXECUTE FUNCTION public.handle_updated_at();
  END IF;
END $$;

-- 2. Agregar columnas faltantes si la tabla ya existe
DO $$
BEGIN
  -- Agregar columna anio si no existe
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'planes_estudio' AND column_name = 'anio'
  ) THEN
    ALTER TABLE planes_estudio ADD COLUMN anio INTEGER NOT NULL DEFAULT 2024;
  END IF;
  
  -- Agregar columna pdf_url si no existe
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'planes_estudio' AND column_name = 'pdf_url'
  ) THEN
    ALTER TABLE planes_estudio ADD COLUMN pdf_url TEXT;
  END IF;
  
  -- Agregar columna estado si no existe
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'planes_estudio' AND column_name = 'estado'
  ) THEN
    ALTER TABLE planes_estudio ADD COLUMN estado TEXT NOT NULL DEFAULT 'Activo' CHECK (estado IN ('Activo', 'Inactivo'));
  END IF;
  
  -- Agregar columna fecha_publicacion si no existe
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'planes_estudio' AND column_name = 'fecha_publicacion'
  ) THEN
    ALTER TABLE planes_estudio ADD COLUMN fecha_publicacion DATE;
  END IF;
  
  -- Agregar columna created_at si no existe
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'planes_estudio' AND column_name = 'created_at'
  ) THEN
    ALTER TABLE planes_estudio ADD COLUMN created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();
  END IF;
  
  -- Agregar columna updated_at si no existe
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'planes_estudio' AND column_name = 'updated_at'
  ) THEN
    ALTER TABLE planes_estudio ADD COLUMN updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();
  END IF;
END $$;

-- Comentarios
COMMENT ON TABLE planes_estudio IS 'Planes de estudio de la escuela (ej: 2018, 2022)';
COMMENT ON COLUMN planes_estudio.nombre IS 'Nombre del plan de estudios (ej: "Plan de Estudios 2018")';
COMMENT ON COLUMN planes_estudio.anio IS 'Año del plan de estudios';
COMMENT ON COLUMN planes_estudio.pdf_url IS 'URL del PDF del plan de estudios';
COMMENT ON COLUMN planes_estudio.estado IS 'Estado del plan (Activo/Inactivo)';
COMMENT ON COLUMN planes_estudio.fecha_publicacion IS 'Fecha de publicación del plan';

-- 3. Agregar columna plan_estudio_id a cursos con cascade delete
-- Primero eliminar la foreign key existente si no tiene cascade
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.table_constraints 
    WHERE constraint_name = 'cursos_plan_estudio_id_fkey' 
    AND table_name = 'cursos'
  ) THEN
    ALTER TABLE cursos DROP CONSTRAINT cursos_plan_estudio_id_fkey;
  END IF;
END $$;

-- Agregar la columna si no existe
ALTER TABLE cursos 
ADD COLUMN IF NOT EXISTS plan_estudio_id UUID;

-- Crear la foreign key con cascade delete
ALTER TABLE cursos 
ADD CONSTRAINT cursos_plan_estudio_id_fkey 
FOREIGN KEY (plan_estudio_id) REFERENCES planes_estudio(id) ON DELETE CASCADE;

COMMENT ON COLUMN cursos.plan_estudio_id IS 'ID del plan de estudios al que pertenece el curso';

-- 4. Crear índice para búsquedas
CREATE INDEX IF NOT EXISTS idx_planes_estudio_anio ON planes_estudio(anio);
CREATE INDEX IF NOT EXISTS idx_cursos_plan_estudio ON cursos(plan_estudio_id);

-- 5. Políticas RLS para planes_estudio
ALTER TABLE planes_estudio ENABLE ROW LEVEL SECURITY;

-- Política para que todos puedan ver planes activos
DROP POLICY IF EXISTS "Todos pueden ver planes activos" ON planes_estudio;
CREATE POLICY "Todos pueden ver planes activos"
ON planes_estudio FOR SELECT
TO public
USING (estado = 'Activo');

-- Política para que director y secretaria puedan ver todos los planes
DROP POLICY IF EXISTS "Director y secretaria pueden ver todos los planes" ON planes_estudio;
CREATE POLICY "Director y secretaria pueden ver todos los planes"
ON planes_estudio FOR SELECT
TO public
USING (
  ((auth.jwt() -> 'user_metadata'::text) ->> 'role'::text) = ANY (ARRAY['director'::text, 'secretaria'::text])
);

-- Política para que director pueda insertar planes
DROP POLICY IF EXISTS "Director puede insertar planes" ON planes_estudio;
CREATE POLICY "Director puede insertar planes"
ON planes_estudio FOR INSERT
TO public
WITH CHECK (
  ((auth.jwt() -> 'user_metadata'::text) ->> 'role'::text) = 'director'::text
);

-- Política para que director pueda actualizar planes
DROP POLICY IF EXISTS "Director puede actualizar planes" ON planes_estudio;
CREATE POLICY "Director puede actualizar planes"
ON planes_estudio FOR UPDATE
TO public
USING (
  ((auth.jwt() -> 'user_metadata'::text) ->> 'role'::text) = 'director'::text
)
WITH CHECK (
  ((auth.jwt() -> 'user_metadata'::text) ->> 'role'::text) = 'director'::text
);

-- Política para que director y secretaria puedan eliminar planes
DROP POLICY IF EXISTS "Director y secretaria pueden eliminar planes" ON planes_estudio;
CREATE POLICY "Director y secretaria pueden eliminar planes"
ON planes_estudio FOR DELETE
TO public
USING (
  ((auth.jwt() -> 'user_metadata'::text) ->> 'role'::text) = ANY (ARRAY['director'::text, 'secretaria'::text])
);

-- 6. Actualizar cursos existentes para asignarlos a un plan por defecto
-- Esto se hará después de crear el primer plan de estudios manualmente
