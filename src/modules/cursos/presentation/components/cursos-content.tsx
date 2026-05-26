'use client';

import { useRef } from 'react';
import { CursoForm } from './curso-form';
import { CursoTable, CursoTableRef } from './curso-table';
import { useAuth } from '@/shared/hooks/use-auth';

export function CursosContent() {
  const tableRef = useRef<CursoTableRef>(null);
  const { user } = useAuth();

  const isAllowed = user?.role === 'director' || user?.role === 'secretaria';

  return (
    <>
      {isAllowed && (
        <div className="rounded-xl border border-border bg-card p-6 shadow-sm">
          <h2 className="text-sm font-semibold mb-4 text-foreground">Registrar nuevo curso</h2>
          <CursoForm onSuccess={() => tableRef.current?.refresh()} />
        </div>
      )}
      <div className="rounded-xl border border-border bg-card overflow-hidden shadow-xs">
        <div className="px-6 py-4 border-b border-border bg-card">
          <h2 className="text-sm font-semibold text-foreground">Cursos registrados en el plan de estudios</h2>
        </div>
        <CursoTable ref={tableRef} />
      </div>
    </>
  );
}
