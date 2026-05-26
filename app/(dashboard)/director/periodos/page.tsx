import { PeriodoForm, PeriodoTable } from '@/modules/periodos';

export default function PeriodosPage() {
  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold tracking-tight">
        Períodos Académicos
      </h1>
      <PeriodoForm />
      <PeriodoTable />
    </div>
  );
}
