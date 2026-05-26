import { AulasContent } from '@/modules/aulas';
import { Landmark } from 'lucide-react';

export default function AulasPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Infraestructura Física (Aulas y Laboratorios)</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Administra los espacios físicos de la escuela y define restricciones de horarios
          </p>
        </div>
        <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
          <Landmark className="w-5 h-5 text-primary" />
        </div>
      </div>
      <AulasContent />
    </div>
  );
}
