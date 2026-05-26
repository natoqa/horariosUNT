'use client';

import { useRef } from 'react';
import { PeriodoForm } from './periodo-form';
import { PeriodoTable, PeriodoTableRef } from './periodo-table';

export function PeriodosContent() {
  const tableRef = useRef<PeriodoTableRef>(null);

  return (
    <>
      <div className="rounded-xl border border-border bg-card p-6">
        <h2 className="text-sm font-semibold mb-4">Crear nuevo periodo</h2>
        <PeriodoForm onSuccess={() => tableRef.current?.refresh()} />
      </div>
      <div className="rounded-xl border border-border bg-card overflow-hidden">
        <div className="px-6 py-4 border-b border-border">
          <h2 className="text-sm font-semibold">Periodos registrados</h2>
        </div>
        <PeriodoTable ref={tableRef} />
      </div>
    </>
  );
}
