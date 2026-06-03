-- =============================================
-- SCRIPT COMPLETO DE INICIALIZACIÓN DE BASE DE DATOS
-- Sistema de Horarios Académicos UNT
-- Ejecutar en: Supabase Dashboard > SQL Editor
-- IMPORTANTE: Ejecutar TODO de una sola vez
-- =============================================

-- Función auxiliar para updated_at (necesaria para todos los triggers)
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- =============================================
-- TABLA: docentes
-- Módulo: docentes (Laiza)
-- =============================================
CREATE TABLE public.docentes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nombres TEXT NOT NULL,
  apellidos TEXT NOT NULL,
  dni VARCHAR(8) NOT NULL UNIQUE,
  correo TEXT NOT NULL UNIQUE,
  telefono VARCHAR(15),
  categoria VARCHAR(20) NOT NULL CHECK (categoria IN ('Principal', 'Asociado', 'Auxiliar')),
  regimen VARCHAR(25) NOT NULL CHECK (regimen IN ('Dedicación Exclusiva', 'Tiempo Completo', 'Tiempo Parcial')),
  condicion VARCHAR(15) NOT NULL CHECK (condicion IN ('Nombrado', 'Contratado')),
  escuela VARCHAR(50) NOT NULL CHECK (escuela IN ('Ingeniería de Sistemas', 'Ingeniería Industrial', 'Contabilidad', 'Economía', 'Física', 'Matemática', 'Psicología', 'Filosofía', 'Estadística', 'Informática', 'Ingeniería Mecánica', 'Ingeniería Civil', 'Otra')),
  fecha_ingreso DATE NOT NULL,
  carga_maxima INTEGER NOT NULL DEFAULT 40,
  estado VARCHAR(10) NOT NULL DEFAULT 'Activo' CHECK (estado IN ('Activo', 'Inactivo')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TRIGGER set_updated_at_docentes
  BEFORE UPDATE ON public.docentes
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

ALTER TABLE public.docentes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Director y secretaria pueden ver todos los docentes"
  ON public.docentes FOR SELECT
  USING (
    (auth.jwt() -> 'user_metadata' ->> 'role') IN ('director', 'secretaria')
  );

CREATE POLICY "Docente puede ver su propio registro"
  ON public.docentes FOR SELECT
  USING (
    correo = auth.jwt() ->> 'email'
  );

CREATE POLICY "Director y secretaria pueden insertar docentes"
  ON public.docentes FOR INSERT
  WITH CHECK (
    (auth.jwt() -> 'user_metadata' ->> 'role') IN ('director', 'secretaria')
  );

CREATE POLICY "Director y secretaria pueden editar docentes"
  ON public.docentes FOR UPDATE
  USING (
    (auth.jwt() -> 'user_metadata' ->> 'role') IN ('director', 'secretaria')
  );

CREATE POLICY "Director puede eliminar docentes"
  ON public.docentes FOR DELETE
  USING (
    (auth.jwt() -> 'user_metadata' ->> 'role') = 'director'
  );

-- =============================================
-- TABLA: cargas_no_lectivas
-- Módulo: carga no lectiva
-- =============================================
CREATE TABLE public.cargas_no_lectivas (
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

CREATE TRIGGER set_updated_at_cargas_no_lectivas
  BEFORE UPDATE ON public.cargas_no_lectivas
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

ALTER TABLE public.cargas_no_lectivas ENABLE ROW LEVEL SECURITY;

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

-- =============================================
-- TABLA: actividades_no_lectivas
-- Módulo: carga no lectiva
-- =============================================
CREATE TABLE public.actividades_no_lectivas (
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

CREATE TRIGGER set_updated_at_actividades_no_lectivas
  BEFORE UPDATE ON public.actividades_no_lectivas
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

ALTER TABLE public.actividades_no_lectivas ENABLE ROW LEVEL SECURITY;

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

CREATE POLICY "Director y secretaria pueden administrar actividades no lectivas"
  ON public.actividades_no_lectivas FOR UPDATE
  USING (
    (auth.jwt() -> 'user_metadata' ->> 'role') IN ('director', 'secretaria')
  );

-- =============================================
-- TABLA: cursos
-- Módulo: cursos (Stefano)
-- =============================================
CREATE TABLE public.cursos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  codigo VARCHAR(10) NOT NULL UNIQUE,
  nombre TEXT NOT NULL,
  ciclo VARCHAR(4) NOT NULL CHECK (ciclo IN ('I', 'II', 'III', 'IV', 'V', 'VI', 'VII', 'VIII', 'IX', 'X')),
  tipo VARCHAR(20) NOT NULL CHECK (tipo IN ('Teórico', 'Práctico', 'Teórico-Práctico')),
  horas_teoricas INTEGER NOT NULL DEFAULT 0,
  horas_practicas INTEGER NOT NULL DEFAULT 0,
  creditos INTEGER NOT NULL DEFAULT 0,
  requiere_laboratorio BOOLEAN NOT NULL DEFAULT false,
  tipo_laboratorio VARCHAR(30),
  estado VARCHAR(10) NOT NULL DEFAULT 'Activo' CHECK (estado IN ('Activo', 'Inactivo')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TRIGGER set_updated_at_cursos
  BEFORE UPDATE ON public.cursos
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

ALTER TABLE public.cursos ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Todos los autenticados pueden ver cursos"
  ON public.cursos FOR SELECT
  USING (auth.role() = 'authenticated');

CREATE POLICY "Director y secretaria pueden insertar cursos"
  ON public.cursos FOR INSERT
  WITH CHECK (
    (auth.jwt() -> 'user_metadata' ->> 'role') IN ('director', 'secretaria')
  );

CREATE POLICY "Director y secretaria pueden editar cursos"
  ON public.cursos FOR UPDATE
  USING (
    (auth.jwt() -> 'user_metadata' ->> 'role') IN ('director', 'secretaria')
  );

CREATE POLICY "Director puede eliminar cursos"
  ON public.cursos FOR DELETE
  USING (
    (auth.jwt() -> 'user_metadata' ->> 'role') = 'director'
  );

-- =============================================
-- TABLA: periodos
-- Módulo: periodos (Andy)
-- =============================================
CREATE TABLE public.periodos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  tipo_ciclo VARCHAR(10) NOT NULL CHECK (tipo_ciclo IN ('Impar', 'Par')),
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  availability_deadline DATE NOT NULL,
  state VARCHAR(20) NOT NULL DEFAULT 'Configuración' CHECK (state IN ('Configuración', 'Recopilación', 'Generación', 'Aprobado', 'Publicado', 'Cerrado')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TRIGGER set_updated_at_periodos
  BEFORE UPDATE ON public.periodos
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

ALTER TABLE public.periodos ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Todos los autenticados pueden ver periodos"
  ON public.periodos FOR SELECT
  USING (auth.role() = 'authenticated');

CREATE POLICY "Director puede gestionar periodos"
  ON public.periodos FOR INSERT
  WITH CHECK (
    (auth.jwt() -> 'user_metadata' ->> 'role') = 'director'
  );

CREATE POLICY "Director puede editar periodos"
  ON public.periodos FOR UPDATE
  USING (
    (auth.jwt() -> 'user_metadata' ->> 'role') = 'director'
  );

CREATE POLICY "Director puede eliminar periodos"
  ON public.periodos FOR DELETE
  USING (
    (auth.jwt() -> 'user_metadata' ->> 'role') = 'director'
  );

-- =============================================
-- TABLA: grupos (secciones de un curso por período)
-- =============================================
CREATE TABLE public.grupos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  curso_id UUID NOT NULL REFERENCES public.cursos(id) ON DELETE CASCADE,
  periodo_id UUID NOT NULL REFERENCES public.periodos(id) ON DELETE CASCADE,
  docente_id UUID REFERENCES public.docentes(id) ON DELETE SET NULL,
  nombre VARCHAR(5) NOT NULL DEFAULT 'A',
  num_estudiantes INTEGER NOT NULL DEFAULT 30,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(curso_id, periodo_id, nombre)
);

CREATE TRIGGER set_updated_at_grupos
  BEFORE UPDATE ON public.grupos
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

ALTER TABLE public.grupos ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Todos los autenticados pueden ver grupos"
  ON public.grupos FOR SELECT
  USING (auth.role() = 'authenticated');

CREATE POLICY "Director y secretaria pueden gestionar grupos"
  ON public.grupos FOR INSERT
  WITH CHECK (
    (auth.jwt() -> 'user_metadata' ->> 'role') IN ('director', 'secretaria')
  );

CREATE POLICY "Director y secretaria pueden editar grupos"
  ON public.grupos FOR UPDATE
  USING (
    (auth.jwt() -> 'user_metadata' ->> 'role') IN ('director', 'secretaria')
  );

CREATE POLICY "Director y secretaria pueden eliminar grupos"
  ON public.grupos FOR DELETE
  USING (
    (auth.jwt() -> 'user_metadata' ->> 'role') IN ('director', 'secretaria')
  );

-- =============================================
-- TABLA: aulas
-- Módulo: aulas (Stefano)
-- =============================================
CREATE TABLE public.aulas (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  codigo VARCHAR(10) NOT NULL UNIQUE,
  nombre TEXT NOT NULL,
  pabellon VARCHAR(50),
  piso INTEGER,
  capacidad INTEGER NOT NULL DEFAULT 30,
  tipo VARCHAR(30) NOT NULL CHECK (tipo IN ('Aula Teórica', 'Laboratorio de Cómputo', 'Laboratorio Especializado', 'Auditorio')),
  equipamiento TEXT[],
  estado VARCHAR(15) NOT NULL DEFAULT 'Activa' CHECK (estado IN ('Activa', 'Inactiva', 'Mantenimiento')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TRIGGER set_updated_at_aulas
  BEFORE UPDATE ON public.aulas
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

ALTER TABLE public.aulas ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Todos los autenticados pueden ver aulas"
  ON public.aulas FOR SELECT
  USING (auth.role() = 'authenticated');

CREATE POLICY "Director y secretaria pueden insertar aulas"
  ON public.aulas FOR INSERT
  WITH CHECK (
    (auth.jwt() -> 'user_metadata' ->> 'role') IN ('director', 'secretaria')
  );

CREATE POLICY "Director y secretaria pueden editar aulas"
  ON public.aulas FOR UPDATE
  USING (
    (auth.jwt() -> 'user_metadata' ->> 'role') IN ('director', 'secretaria')
  );

CREATE POLICY "Director puede eliminar aulas"
  ON public.aulas FOR DELETE
  USING (
    (auth.jwt() -> 'user_metadata' ->> 'role') = 'director'
  );

-- =============================================
-- TABLA: aula_restricciones (bloques no disponibles por aula)
-- =============================================
CREATE TABLE public.aula_restricciones (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  aula_id UUID NOT NULL REFERENCES public.aulas(id) ON DELETE CASCADE,
  dia VARCHAR(10) NOT NULL CHECK (dia IN ('Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado')),
  bloque VARCHAR(15) NOT NULL,
  motivo TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(aula_id, dia, bloque)
);

ALTER TABLE public.aula_restricciones ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Todos los autenticados pueden ver restricciones"
  ON public.aula_restricciones FOR SELECT
  USING (auth.role() = 'authenticated');

CREATE POLICY "Director y secretaria pueden gestionar restricciones"
  ON public.aula_restricciones FOR INSERT
  WITH CHECK (
    (auth.jwt() -> 'user_metadata' ->> 'role') IN ('director', 'secretaria')
  );

CREATE POLICY "Director y secretaria pueden eliminar restricciones"
  ON public.aula_restricciones FOR DELETE
  USING (
    (auth.jwt() -> 'user_metadata' ->> 'role') IN ('director', 'secretaria')
  );

-- =============================================
-- TABLA: disponibilidad
-- Módulo: disponibilidad (Laiza)
-- =============================================
CREATE TABLE public.disponibilidad (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  docente_id UUID NOT NULL REFERENCES public.docentes(id) ON DELETE CASCADE,
  periodo_id UUID NOT NULL REFERENCES public.periodos(id) ON DELETE CASCADE,
  dia VARCHAR(10) NOT NULL CHECK (dia IN ('Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado')),
  bloque VARCHAR(15) NOT NULL,
  estado VARCHAR(15) NOT NULL DEFAULT 'Disponible' CHECK (estado IN ('Disponible', 'No disponible', 'Preferido')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(docente_id, periodo_id, dia, bloque)
);

CREATE TRIGGER set_updated_at_disponibilidad
  BEFORE UPDATE ON public.disponibilidad
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

ALTER TABLE public.disponibilidad ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Director puede ver toda la disponibilidad"
  ON public.disponibilidad FOR SELECT
  USING (
    (auth.jwt() -> 'user_metadata' ->> 'role') = 'director'
  );

CREATE POLICY "Docente puede ver su propia disponibilidad"
  ON public.disponibilidad FOR SELECT
  USING (
    docente_id IN (
      SELECT id FROM public.docentes WHERE correo = auth.jwt() ->> 'email'
    )
  );

CREATE POLICY "Docente puede insertar su disponibilidad"
  ON public.disponibilidad FOR INSERT
  WITH CHECK (
    docente_id IN (
      SELECT id FROM public.docentes WHERE correo = auth.jwt() ->> 'email'
    )
  );

CREATE POLICY "Docente puede actualizar su disponibilidad"
  ON public.disponibilidad FOR UPDATE
  USING (
    docente_id IN (
      SELECT id FROM public.docentes WHERE correo = auth.jwt() ->> 'email'
    )
  );

CREATE POLICY "Docente puede eliminar su disponibilidad"
  ON public.disponibilidad FOR DELETE
  USING (
    docente_id IN (
      SELECT id FROM public.docentes WHERE correo = auth.jwt() ->> 'email'
    )
  );

-- =============================================
-- TABLA: horarios
-- Módulo: horarios (David)
-- =============================================
CREATE TABLE public.horarios (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  periodo_id UUID NOT NULL REFERENCES public.periodos(id) ON DELETE CASCADE,
  estado VARCHAR(15) NOT NULL DEFAULT 'Borrador' CHECK (estado IN ('Borrador', 'Aprobado', 'Publicado')),
  generado_por UUID REFERENCES auth.users(id),
  fecha_generacion TIMESTAMPTZ,
  resumen JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TRIGGER set_updated_at_horarios
  BEFORE UPDATE ON public.horarios
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

ALTER TABLE public.horarios ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Todos pueden ver horarios publicados, director y secretaria ven todos"
  ON public.horarios FOR SELECT
  USING (
    estado = 'publicado' OR
    (auth.jwt() -> 'user_metadata' ->> 'role') IN ('director', 'secretaria')
  );

CREATE POLICY "Director puede gestionar horarios"
  ON public.horarios FOR INSERT
  WITH CHECK (
    (auth.jwt() -> 'user_metadata' ->> 'role') = 'director'
  );

CREATE POLICY "Director puede actualizar horarios"
  ON public.horarios FOR UPDATE
  USING (
    (auth.jwt() -> 'user_metadata' ->> 'role') = 'director'
  );

-- =============================================
-- TABLA: asignaciones (cada bloque asignado del horario)
-- =============================================
CREATE TABLE public.asignaciones (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  horario_id UUID NOT NULL REFERENCES public.horarios(id) ON DELETE CASCADE,
  grupo_id UUID NOT NULL REFERENCES public.grupos(id) ON DELETE CASCADE,
  docente_id UUID NOT NULL REFERENCES public.docentes(id),
  aula_id UUID NOT NULL REFERENCES public.aulas(id),
  dia VARCHAR(10) NOT NULL CHECK (dia IN ('Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado')),
  bloque VARCHAR(15) NOT NULL,
  tipo VARCHAR(10) NOT NULL DEFAULT 'teorico' CHECK (tipo IN ('teorico', 'practico')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(horario_id, aula_id, dia, bloque),
  UNIQUE(horario_id, docente_id, dia, bloque)
);

CREATE TRIGGER set_updated_at_asignaciones
  BEFORE UPDATE ON public.asignaciones
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

ALTER TABLE public.asignaciones ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Todos pueden ver asignaciones de horarios publicados"
  ON public.asignaciones FOR SELECT
  USING (
    horario_id IN (SELECT id FROM public.horarios WHERE estado = 'publicado')
    OR (auth.jwt() -> 'user_metadata' ->> 'role') IN ('director', 'secretaria')
  );

CREATE POLICY "Director puede gestionar asignaciones"
  ON public.asignaciones FOR INSERT
  WITH CHECK (
    (auth.jwt() -> 'user_metadata' ->> 'role') = 'director'
  );

CREATE POLICY "Director puede actualizar asignaciones"
  ON public.asignaciones FOR UPDATE
  USING (
    (auth.jwt() -> 'user_metadata' ->> 'role') = 'director'
  );

CREATE POLICY "Director puede eliminar asignaciones"
  ON public.asignaciones FOR DELETE
  USING (
    (auth.jwt() -> 'user_metadata' ->> 'role') = 'director'
  );

-- =============================================
-- TABLA: auditoria
-- Módulo: auditoria (Andy)
-- =============================================
CREATE TABLE public.auditoria (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id),
  user_email TEXT NOT NULL,
  user_role VARCHAR(15) NOT NULL,
  modulo VARCHAR(30) NOT NULL,
  accion VARCHAR(20) NOT NULL,
  entidad_id UUID,
  datos_anteriores JSONB,
  datos_nuevos JSONB,
  descripcion TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.auditoria ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Solo director puede ver auditoria"
  ON public.auditoria FOR SELECT
  USING (
    (auth.jwt() -> 'user_metadata' ->> 'role') = 'director'
  );

CREATE POLICY "Cualquier autenticado puede insertar auditoria"
  ON public.auditoria FOR INSERT
  WITH CHECK (auth.role() = 'authenticated');

-- =============================================
-- TABLA: notificaciones
-- Módulo: notificaciones (Andy)
-- =============================================
CREATE TABLE public.notificaciones (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  destinatario_id UUID NOT NULL REFERENCES auth.users(id),
  tipo VARCHAR(30) NOT NULL,
  titulo TEXT NOT NULL,
  mensaje TEXT NOT NULL,
  leida BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.notificaciones ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Usuario puede ver sus notificaciones"
  ON public.notificaciones FOR SELECT
  USING (destinatario_id = auth.uid());

CREATE POLICY "Sistema puede insertar notificaciones"
  ON public.notificaciones FOR INSERT
  WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Usuario puede marcar como leida"
  ON public.notificaciones FOR UPDATE
  USING (destinatario_id = auth.uid())
  WITH CHECK (destinatario_id = auth.uid());
