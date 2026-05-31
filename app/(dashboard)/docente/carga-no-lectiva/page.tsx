import { CargaNoLectivaContent } from '@/modules/carga-no-lectiva';
import { FileText } from 'lucide-react';

export default function DocenteCargaNoLectivaPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Carga no lectiva</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Registra todas tus actividades no lectivas y envía el total para aprobación.
          </p>
        </div>
        <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
          <FileText className="w-5 h-5 text-primary" />
        </div>
      </div>
      <CargaNoLectivaContent />
    </div>
  );
}
