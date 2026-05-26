import { DocentesContent } from '@/modules/docentes';
import { Users } from 'lucide-react';

export default function DocentesPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Docentes</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Registra y gestiona la informacion de los docentes de la escuela
          </p>
        </div>
        <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
          <Users className="w-5 h-5 text-primary" />
        </div>
      </div>
      <DocentesContent />
    </div>
  );
}
