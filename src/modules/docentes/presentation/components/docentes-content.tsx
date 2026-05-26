'use client';

import { useRef } from 'react';
import { DocenteForm } from './docente-form';
import { DocenteTable, DocenteTableRef } from './docente-table';

export function DocentesContent() {
  const tableRef = useRef<DocenteTableRef>(null);

  return (
    <>
      <div className="rounded-xl border border-border bg-card p-6">
        <h2 className="text-sm font-semibold mb-4">Registrar nuevo docente</h2>
        <DocenteForm onSuccess={() => tableRef.current?.refresh()} />
      </div>
      <div className="rounded-xl border border-border bg-card overflow-hidden">
        <div className="px-6 py-4 border-b border-border">
          <h2 className="text-sm font-semibold">Docentes registrados</h2>
        </div>
        <DocenteTable ref={tableRef} />
      </div>
    </>
  );
}
