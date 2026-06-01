import { DocenteTable } from '@/modules/docentes';
import { Users } from 'lucide-react';

export default function DocentesPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Docentes</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Visualiza y gestiona la información de los docentes de la escuela
          </p>
        </div>
        <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
          <Users className="w-5 h-5 text-primary" />
        </div>
      </div>
      <div className="rounded-xl border border-border bg-card overflow-x-auto">
        <div className="px-6 py-4 border-b border-border">
          <h2 className="text-sm font-semibold">Docentes registrados</h2>
        </div>
        <DocenteTable />
      </div>
    </div>
  );
}
