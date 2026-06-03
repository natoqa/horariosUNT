'use client';

import { AulaTable } from '@/modules/aulas';
import { Landmark } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/shared/components/ui/button';

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
      <div className="rounded-xl border border-border bg-card overflow-hidden">
        <div className="px-6 py-4 border-b border-border flex items-center justify-between">
          <h2 className="text-sm font-semibold">Aulas e infraestructura física registradas</h2>
          <Link href="/secretaria/aulas/crear">
            <Button size="sm">Crear Aula</Button>
          </Link>
        </div>
        <AulaTable />
      </div>
    </div>
  );
}
