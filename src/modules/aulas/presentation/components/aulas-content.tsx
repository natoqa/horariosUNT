'use client';

import { useRef } from 'react';
import { AulaForm } from './aula-form';
import { AulaTable, AulaTableRef } from './aula-table';
import { useAuth } from '@/shared/hooks/use-auth';

export function AulasContent() {
  const tableRef = useRef<AulaTableRef>(null);
  const { user } = useAuth();

  const isAllowed = user?.role === 'director' || user?.role === 'secretaria';

  return (
    <>
      {isAllowed && (
        <div className="rounded-xl border border-border bg-card p-6 shadow-sm">
          <h2 className="text-sm font-semibold mb-4 text-foreground">Registrar nueva aula o laboratorio</h2>
          <AulaForm onSuccess={() => tableRef.current?.refresh()} />
        </div>
      )}
      <div className="rounded-xl border border-border bg-card overflow-hidden shadow-xs">
        <div className="px-6 py-4 border-b border-border bg-card">
          <h2 className="text-sm font-semibold text-foreground">Aulas e infraestructura física registradas</h2>
        </div>
        <AulaTable ref={tableRef} />
      </div>
    </>
  );
}
