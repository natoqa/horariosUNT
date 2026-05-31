import { CargaNoLectivaApprovalContent } from '@/modules/carga-no-lectiva';
import { FileText } from 'lucide-react';

export default function SecretariaCargaNoLectivaPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Aprobación de carga no lectiva</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Revisa y aprueba las declaraciones de carga no lectiva registradas por los docentes.
          </p>
        </div>
        <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
          <FileText className="w-5 h-5 text-primary" />
        </div>
      </div>
      <CargaNoLectivaApprovalContent role="secretaria" />
    </div>
  );
}
