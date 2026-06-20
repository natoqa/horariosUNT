import { PeriodoTable } from '@/modules/periodos';
import { CalendarDays } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/shared/components/ui/button';

export default function SecretariaPeriodosPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Periodos Academicos</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Gestiona los semestres y controla el flujo del proceso de horarios
          </p>
        </div>
        <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
          <CalendarDays className="w-5 h-5 text-primary" />
        </div>
      </div>
      <div className="rounded-xl border border-border bg-card overflow-hidden">
        <div className="px-6 py-4 border-b border-border flex items-center justify-between">
          <h2 className="text-sm font-semibold">Periodos registrados</h2>
          <Link href="/secretaria/periodos/crear">
            <Button size="sm">Crear Periodo</Button>
          </Link>
        </div>
        <PeriodoTable />
      </div>
    </div>
  );
}
