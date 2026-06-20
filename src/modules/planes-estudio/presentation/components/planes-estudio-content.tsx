'use client';

import { useRef, useState } from 'react';
import { PlanEstudioForm } from './plan-estudio-form';
import { PlanEstudioTable, PlanEstudioTableRef } from './plan-estudio-table';
import { useAuth } from '@/shared/hooks/use-auth';
import { Button } from '@/shared/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/shared/components/ui/dialog';
import { Input } from '@/shared/components/ui/input';
import { Download, Plus } from 'lucide-react';
import { toast } from 'sonner';

export function PlanesEstudioContent() {
  const tableRef = useRef<PlanEstudioTableRef>(null);
  const { user } = useAuth();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [archivo, setArchivo] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);

  const isAllowed = user?.role === 'director' || user?.role === 'secretaria';

  const handleDescargarPlantilla = async (formato: 'excel' | 'csv') => {
    try {
      const response = await fetch(`/api/planes-estudio/plantilla?formato=${formato}`);
      if (!response.ok) throw new Error('Error al descargar plantilla');
      
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `plantilla_cursos.${formato === 'excel' ? 'xlsx' : 'csv'}`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      console.error('Error al descargar plantilla:', error);
      alert('Error al descargar plantilla');
    }
  };

  const handleCargaMasiva = async () => {
    if (!archivo) {
      toast.error('Por favor seleccione un archivo');
      return;
    }

    setLoading(true);
    try {
      const formData = new FormData();
      formData.append('archivo', archivo);

      const response = await fetch('/api/planes-estudio/carga-masiva', {
        method: 'POST',
        body: formData,
      });

      const result = await response.json();

      if (result.success) {
        toast.success(`Se cargaron ${result.cursosCreados} cursos exitosamente`);
        setDialogOpen(false);
        setArchivo(null);
        tableRef.current?.refresh();
      } else {
        toast.error(result.error || 'Error al cargar cursos');
      }
    } catch (error) {
      console.error('Error al cargar cursos:', error);
      toast.error('Error al cargar cursos');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <div className="rounded-xl border border-border bg-card overflow-hidden shadow-xs">
        <div className="px-6 py-4 border-b border-border bg-card flex items-center justify-between">
          <h2 className="text-sm font-semibold text-foreground">Planes de estudio registrados</h2>
          {isAllowed && (
            <div className="flex gap-2">
              <Button variant="outline" size="sm" className="h-8 text-xs" onClick={() => setDialogOpen(true)}>
                <Plus className="w-3 h-3 mr-1" />
                Registrar Plan
              </Button>
              <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Registrar Plan de Estudio</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4">
                    <PlanEstudioForm onSuccess={() => {
                      setDialogOpen(false);
                      tableRef.current?.refresh();
                    }} />
                  </div>
                </DialogContent>
              </Dialog>
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleDescargarPlantilla('excel')}
                className="h-8 text-xs"
              >
                <Download className="w-3 h-3 mr-1" />
                Plantilla Excel
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleDescargarPlantilla('csv')}
                className="h-8 text-xs"
              >
                <Download className="w-3 h-3 mr-1" />
                Plantilla CSV
              </Button>
            </div>
          )}
        </div>
        <PlanEstudioTable ref={tableRef} />
      </div>
    </>
  );
}
