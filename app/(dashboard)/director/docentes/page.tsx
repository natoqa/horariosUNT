'use client';

import { useState } from 'react';
import { DocenteTable } from '@/modules/docentes';
import { Users, Download, Upload } from 'lucide-react';
import { Button } from '@/shared/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/shared/components/ui/dialog';
import { Input } from '@/shared/components/ui/input';
import { toast } from 'sonner';

export default function DocentesPage() {
  const [archivo, setArchivo] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);

  const handleDescargarPlantilla = async (formato: 'excel' | 'csv') => {
    try {
      const response = await fetch(`/api/docentes/plantilla?formato=${formato}`);
      if (!response.ok) throw new Error('Error al descargar plantilla');
      
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `plantilla_docentes.${formato === 'excel' ? 'xlsx' : 'csv'}`;
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

      const response = await fetch('/api/docentes/carga-masiva', {
        method: 'POST',
        body: formData,
      });

      const result = await response.json();

      if (result.success) {
        toast.success(`Se cargaron ${result.docentesCreados} de ${result.totalDocentes} docentes exitosamente`);
        if (result.errores && result.errores.length > 0) {
          console.error('Errores:', result.errores);
        }
        setDialogOpen(false);
        setArchivo(null);
        window.location.reload();
      } else {
        toast.error(result.error || 'Error al cargar docentes');
      }
    } catch (error) {
      console.error('Error al cargar docentes:', error);
      toast.error('Error al cargar docentes');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Docentes</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Visualiza y gestiona la información de los docentes de la escuela
          </p>
        </div>
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
            <Users className="w-5 h-5 text-primary" />
          </div>
          <div className="flex gap-2">
            <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
              <Button variant="outline" size="sm" className="h-8 text-xs" onClick={() => setDialogOpen(true)}>
                <Upload className="w-3 h-3 mr-1" />
                Carga Masiva
              </Button>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Carga Masiva de Docentes</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Archivo Excel o CSV</label>
                    <Input
                      type="file"
                      accept=".xlsx,.xls,.csv"
                      onChange={(e) => setArchivo(e.target.files?.[0] || null)}
                      className="h-9"
                    />
                    {archivo && (
                      <p className="text-xs text-muted-foreground">{archivo.name}</p>
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Descargue la plantilla, llénela con los datos de los docentes y cárguela aquí.
                  </p>
                  <div className="flex justify-end gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setDialogOpen(false)}
                      disabled={loading}
                    >
                      Cancelar
                    </Button>
                    <Button
                      size="sm"
                      onClick={handleCargaMasiva}
                      disabled={loading || !archivo}
                    >
                      {loading ? 'Cargando...' : 'Cargar Docentes'}
                    </Button>
                  </div>
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
        </div>
      </div>
      <div className="rounded-xl border border-border bg-card overflow-x-auto">
        <div className="px-6 py-4 border-b border-border">
          <h2 className="text-sm font-semibold">Docentes registrados</h2>
        </div>
        <DocenteTable />
      </div>
    </div>
  );
}
