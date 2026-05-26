import { CursosContent } from '@/modules/cursos';
import { BookOpen } from 'lucide-react';

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
      <CursosContent />
    </div>
  );
}
