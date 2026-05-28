import { DocentesCreateContent } from '@/modules/docentes';
import { UserPlus } from 'lucide-react';

export default function CrearDocentePage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Crear Docente</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Registra la información de un nuevo docente de la escuela
          </p>
        </div>
        <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
          <UserPlus className="w-5 h-5 text-primary" />
        </div>
      </div>
      <DocentesCreateContent />
    </div>
  );
}
