import { HorariosContent } from '@/modules/horarios';
import { CalendarDays } from 'lucide-react';

export default function HorariosPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Horarios</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Genera, revisa y gestiona los horarios del periodo activo
          </p>
        </div>
        <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
          <CalendarDays className="w-5 h-5 text-primary" />
        </div>
      </div>
      <HorariosContent />
    </div>
  );
}
