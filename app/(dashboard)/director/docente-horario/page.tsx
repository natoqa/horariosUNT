import { Suspense } from 'react';
import { DocenteHorarioView } from '@/modules/horarios/presentation/components/docente-horario-view';

export default function DirectorDocenteHorarioPage() {
  return (
    <Suspense fallback={<div>Cargando...</div>}>
      <DocenteHorarioView />
    </Suspense>
  );
}
