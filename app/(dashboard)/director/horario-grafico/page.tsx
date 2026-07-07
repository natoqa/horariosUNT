import { Suspense } from 'react';
import { HorarioGraficoContent } from '@/modules/horarios';
import { Calendar } from 'lucide-react';

export default function DirectorHorarioGraficoPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Horario Gráfico</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Visualiza y edita horarios con arrastrar y soltar
          </p>
        </div>
        <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
          <Calendar className="w-5 h-5 text-primary" />
        </div>
      </div>
      <Suspense fallback={<div>Cargando...</div>}>
        <HorarioGraficoContent />
      </Suspense>
    </div>
  );
}
