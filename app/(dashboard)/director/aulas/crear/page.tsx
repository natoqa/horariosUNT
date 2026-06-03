'use client';

import { AulaForm } from '@/modules/aulas';
import { Landmark, ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/shared/components/ui/button';
import { useRouter } from 'next/navigation';

export default function CrearAulaPage() {
  const router = useRouter();

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/director/aulas">
          <Button variant="ghost" size="icon">
            <ArrowLeft className="w-4 h-4" />
          </Button>
        </Link>
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
            <Landmark className="w-5 h-5 text-primary" />
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Crear Aula</h1>
            <p className="text-sm text-muted-foreground mt-1">
              Registra un nuevo aula o laboratorio en la infraestructura física
            </p>
          </div>
        </div>
      </div>
      <div className="rounded-xl border border-border bg-card p-6">
        <AulaForm onSuccess={() => router.push('/director/aulas')} />
      </div>
    </div>
  );
}
