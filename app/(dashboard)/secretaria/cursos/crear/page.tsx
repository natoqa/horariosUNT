'use client';

import { CursoForm } from '@/modules/cursos';
import { BookOpen, ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/shared/components/ui/button';
import { useRouter } from 'next/navigation';

export default function CrearCursoPage() {
  const router = useRouter();

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/secretaria/cursos">
          <Button variant="ghost" size="icon">
            <ArrowLeft className="w-4 h-4" />
          </Button>
        </Link>
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
            <BookOpen className="w-5 h-5 text-primary" />
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Crear Curso</h1>
            <p className="text-sm text-muted-foreground mt-1">
              Registra un nuevo curso o asignatura en el plan de estudios
            </p>
          </div>
        </div>
      </div>
      <div className="rounded-xl border border-border bg-card p-6">
        <CursoForm onSuccess={() => router.push('/secretaria/cursos')} />
      </div>
    </div>
  );
}
