import { DisponibilidadContent } from '@/modules/disponibilidad';
import { Clock } from 'lucide-react';

export default function DisponibilidadPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Mi Disponibilidad</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Registra tus bloques horarios disponibles para el semestre
          </p>
        </div>
        <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
          <Clock className="w-5 h-5 text-primary" />
        </div>
      </div>
      <DisponibilidadContent />
    </div>
  );
}
