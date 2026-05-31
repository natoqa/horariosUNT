-- =========================================================================
-- MIGRACIÓN COMPLETA: Módulo de Carga No Lectiva
-- Módulo: carga-no-lectiva
-- =========================================================================

-- 1. Crear Tabla cargas_no_lectivas
CREATE TABLE IF NOT EXISTS public.cargas_no_lectivas (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  docente_id UUID NOT NULL REFERENCES public.docentes(id) ON DELETE CASCADE,
  periodo_id UUID NOT NULL REFERENCES public.periodos(id) ON DELETE CASCADE,
  horas_lectivas_asignadas INTEGER NOT NULL DEFAULT 0,
  horas_lectivas_no_asignadas INTEGER NOT NULL DEFAULT 0,
  lectiva_declarada BOOLEAN NOT NULL DEFAULT false,
  declaracion_lectiva TEXT NOT NULL DEFAULT '',
  total_horas INTEGER NOT NULL DEFAULT 0,
  estado VARCHAR(20) NOT NULL DEFAULT 'Borrador' CHECK (estado IN ('Borrador', 'En revisión', 'Aprobado', 'Rechazado')),
  director_aprobado BOOLEAN NOT NULL DEFAULT false,
  secretaria_aprobado BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 2. Crear Tabla actividades_no_lectivas
CREATE TABLE IF NOT EXISTS public.actividades_no_lectivas (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  docente_id UUID NOT NULL REFERENCES public.docentes(id) ON DELETE CASCADE,
  periodo_id UUID NOT NULL REFERENCES public.periodos(id) ON DELETE CASCADE,
  tipo VARCHAR(120) NOT NULL CHECK (tipo IN (
    'Preparación y Evaluación',
    'Consejería y Tutoría',
    'Investigación',
    'Capacitación',
    'Actividades de Gobierno',
    'Actividades de Administración',
    'Asesoría de Tesis, Exámenes Profesionales y Experiencia Profesional',
    'Responsabilidad Social Universitaria',
    'Comités Técnicos y Comisiones'
  )),
  horas INTEGER NOT NULL DEFAULT 0,
  detalles TEXT NOT NULL DEFAULT '',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (docente_id, periodo_id, tipo)
);

-- 3. Crear Triggers para updated_at
CREATE OR REPLACE TRIGGER set_updated_at_cargas_no_lectivas
  BEFORE UPDATE ON public.cargas_no_lectivas
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

CREATE OR REPLACE TRIGGER set_updated_at_actividades_no_lectivas
  BEFORE UPDATE ON public.actividades_no_lectivas
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

-- 4. Habilitar Seguridad a Nivel de Fila (RLS)
ALTER TABLE public.cargas_no_lectivas ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.actividades_no_lectivas ENABLE ROW LEVEL SECURITY;

-- 5. Políticas de Seguridad para cargas_no_lectivas
CREATE POLICY "Director y secretaria pueden ver todas las cargas no lectivas"
  ON public.cargas_no_lectivas FOR SELECT
  USING (
    (auth.jwt() -> 'user_metadata' ->> 'role') IN ('director', 'secretaria')
  );

CREATE POLICY "Docente puede ver su propia carga no lectiva"
  ON public.cargas_no_lectivas FOR SELECT
  USING (
    docente_id = (
      SELECT id FROM public.docentes WHERE correo = auth.jwt() ->> 'email'
    )
  );

CREATE POLICY "Docente puede insertar su propia carga no lectiva"
  ON public.cargas_no_lectivas FOR INSERT
  WITH CHECK (
    (auth.jwt() -> 'user_metadata' ->> 'role') = 'docente'
    AND docente_id = (
      SELECT id FROM public.docentes WHERE correo = auth.jwt() ->> 'email'
    )
  );

CREATE POLICY "Docente puede actualizar su propia carga no lectiva si no está aprobada"
  ON public.cargas_no_lectivas FOR UPDATE
  USING (
    (auth.jwt() -> 'user_metadata' ->> 'role') = 'docente'
    AND docente_id = (
      SELECT id FROM public.docentes WHERE correo = auth.jwt() ->> 'email'
    )
    AND estado <> 'Aprobado'
  );

CREATE POLICY "Director y secretaria pueden aprobar cargas no lectivas"
  ON public.cargas_no_lectivas FOR UPDATE
  USING (
    (auth.jwt() -> 'user_metadata' ->> 'role') IN ('director', 'secretaria')
  );

CREATE POLICY "Director y secretaria pueden insertar cargas no lectivas"
  ON public.cargas_no_lectivas FOR INSERT
  WITH CHECK (
    (auth.jwt() -> 'user_metadata' ->> 'role') IN ('director', 'secretaria')
  );

-- 6. Políticas de Seguridad para actividades_no_lectivas
CREATE POLICY "Director y secretaria pueden ver todas las actividades no lectivas"
  ON public.actividades_no_lectivas FOR SELECT
  USING (
    (auth.jwt() -> 'user_metadata' ->> 'role') IN ('director', 'secretaria')
  );

CREATE POLICY "Docente puede ver sus propias actividades no lectivas"
  ON public.actividades_no_lectivas FOR SELECT
  USING (
    docente_id = (
      SELECT id FROM public.docentes WHERE correo = auth.jwt() ->> 'email'
    )
  );

CREATE POLICY "Docente puede insertar sus propias actividades no lectivas"
  ON public.actividades_no_lectivas FOR INSERT
  WITH CHECK (
    (auth.jwt() -> 'user_metadata' ->> 'role') = 'docente'
    AND docente_id = (
      SELECT id FROM public.docentes WHERE correo = auth.jwt() ->> 'email'
    )
  );

CREATE POLICY "Docente puede actualizar sus propias actividades no lectivas"
  ON public.actividades_no_lectivas FOR UPDATE
  USING (
    (auth.jwt() -> 'user_metadata' ->> 'role') = 'docente'
    AND docente_id = (
      SELECT id FROM public.docentes WHERE correo = auth.jwt() ->> 'email'
    )
  );

CREATE POLICY "Docente puede eliminar sus propias actividades no lectivas"
  ON public.actividades_no_lectivas FOR DELETE
  USING (
    (auth.jwt() -> 'user_metadata' ->> 'role') = 'docente'
    AND docente_id = (
      SELECT id FROM public.docentes WHERE correo = auth.jwt() ->> 'email'
    )
  );

CREATE POLICY "Director y secretaria pueden administrar actividades no lectivas"
  ON public.actividades_no_lectivas FOR UPDATE
  USING (
    (auth.jwt() -> 'user_metadata' ->> 'role') IN ('director', 'secretaria')
  );

CREATE POLICY "Director y secretaria pueden eliminar actividades no lectivas"
  ON public.actividades_no_lectivas FOR DELETE
  USING (
    (auth.jwt() -> 'user_metadata' ->> 'role') IN ('director', 'secretaria')
  );
