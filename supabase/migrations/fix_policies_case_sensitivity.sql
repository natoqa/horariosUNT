-- =============================================
-- MIGRATION: Fix SQL Policies Case Sensitivity
-- =============================================

-- Fix horarios policy to use correct case for estado values
DROP POLICY IF EXISTS "Todos pueden ver horarios publicados, director y secretaria ven todos" ON public.horarios;

CREATE POLICY "Todos pueden ver horarios publicados, director y secretaria ven todos"
  ON public.horarios FOR SELECT
  USING (
    estado = 'Publicado' OR
    (auth.jwt() -> 'user_metadata' ->> 'role') IN ('director', 'secretaria')
  );

-- Add secretaria to periodos policies
DROP POLICY IF EXISTS "Director puede gestionar periodos" ON public.periodos;
DROP POLICY IF EXISTS "Director puede editar periodos" ON public.periodos;
DROP POLICY IF EXISTS "Director puede eliminar periodos" ON public.periodos;

CREATE POLICY "Director y secretaria pueden gestionar periodos"
  ON public.periodos FOR INSERT
  WITH CHECK (
    (auth.jwt() -> 'user_metadata' ->> 'role') IN ('director', 'secretaria')
  );

CREATE POLICY "Director y secretaria pueden editar periodos"
  ON public.periodos FOR UPDATE
  USING (
    (auth.jwt() -> 'user_metadata' ->> 'role') IN ('director', 'secretaria')
  );

CREATE POLICY "Director puede eliminar periodos"
  ON public.periodos FOR DELETE
  USING (
    (auth.jwt() -> 'user_metadata' ->> 'role') = 'director'
  );

-- Add secretaria to disponibilidad read policy (director can see all availability)
DROP POLICY IF EXISTS "Director puede ver toda la disponibilidad" ON public.disponibilidad;

CREATE POLICY "Director y secretaria pueden ver toda la disponibilidad"
  ON public.disponibilidad FOR SELECT
  USING (
    (auth.jwt() -> 'user_metadata' ->> 'role') IN ('director', 'secretaria')
  );
