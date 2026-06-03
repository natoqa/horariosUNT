'use server';

import { createClient } from '@/shared/lib/supabase/server';
import { GenerateCargaNoLectivaPdfUseCase } from '../../application/use-cases/generate-carga-no-lectiva-pdf.use-case';
import { getActivePeriodoAction } from '@/modules/disponibilidad/presentation/actions/get-periodo-estado.action';
import { SupabaseCargaNoLectivaRepository } from '../../infrastructure/supabase-carga-no-lectiva.repository';

export async function generateCargaNoLectivaPdfAction(formData: FormData) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return { message: 'No autorizado. Debe iniciar sesión.' };
  }

  const periodoResult = await getActivePeriodoAction();
  if (periodoResult.message || !periodoResult.data) {
    return { message: periodoResult.message || 'No hay un período activo.' };
  }

  const { data: docenteData, error: docenteError } = await supabase
    .from('docentes')
    .select('id, nombres, apellidos')
    .eq('correo', user.email)
    .single();

  if (docenteError || !docenteData) {
    return { message: 'No se encontró un docente asociado a este usuario.' };
  }

  const repository = new SupabaseCargaNoLectivaRepository();
  const actividades = await repository.findActividadesByDocentePeriodo(docenteData.id, periodoResult.data.id);
  const carga = await repository.findCargaTotalByDocentePeriodo(docenteData.id, periodoResult.data.id);

  if (!carga) {
    return { message: 'No hay registro de carga no lectiva para generar el formato.' };
  }

  const useCase = new GenerateCargaNoLectivaPdfUseCase();
  const pdfBytes = await useCase.execute(
    `${docenteData.nombres} ${docenteData.apellidos}`.trim(),
    periodoResult.data.name,
    carga,
    actividades,
  );

  const pdfBase64 = Buffer.from(pdfBytes).toString('base64');
  const fileName = `declaracion-carga-no-lectiva-${periodoResult.data.name.replace(/\s+/g, '-')}.pdf`;

  return { pdfBase64, fileName };
}
