'use client';

import { CursoTable } from '@/modules/cursos';
import { BookOpen } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/shared/components/ui/button';

export default function CursosPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Cursos y Asignaturas</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Administra el plan de estudios, asignaturas y secciones (grupos) del período activo
          </p>
        </div>
        <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
          <BookOpen className="w-5 h-5 text-primary" />
        </div>
      </div>
      <div className="rounded-xl border border-border bg-card overflow-hidden">
        <div className="px-6 py-4 border-b border-border flex items-center justify-between">
          <h2 className="text-sm font-semibold">Cursos registrados en el plan de estudios</h2>
          <Link href="/secretaria/cursos/crear">
            <Button size="sm">Crear Curso</Button>
          </Link>
        </div>
        <CursoTable />
      </div>
    </div>
  );
}
