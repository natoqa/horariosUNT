import { PlanesEstudioContent } from '@/modules/planes-estudio/presentation/components/planes-estudio-content';

export default function SecretariaPlanesEstudioPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Planes de Estudio</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Gestión de planes de estudio (2018, 2022, etc.)
        </p>
      </div>
      <PlanesEstudioContent />
    </div>
  );
}
