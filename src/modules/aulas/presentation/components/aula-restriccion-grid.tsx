'use client';

import { useState, useEffect } from 'react';
import { Aula } from '../../domain/entities/aula.entity';
import {
  getAulaRestriccionesAction,
  saveAulaRestriccionesAction,
} from '../actions/set-aula-restricciones.action';
import { DIAS_SEMANA, BLOQUES_HORARIOS, DiaSemana, BloqueHorario } from '@/shared/constants/time-blocks';
import { Button } from '@/shared/components/ui/button';
import { X, Loader2, Save, Calendar, Check, AlertCircle } from 'lucide-react';

interface AulaRestriccionGridProps {
  aula: Aula;
  onClose: () => void;
}

export function AulaRestriccionGrid({ aula, onClose }: AulaRestriccionGridProps) {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // Set of selected restrictions as a string: "Dia-Bloque"
  const [selectedKeys, setSelectedKeys] = useState<Set<string>>(new Set());

  // Cargar restricciones iniciales
  useEffect(() => {
    async function load() {
      setLoading(true);
      setError(null);
      const res = await getAulaRestriccionesAction(aula.id);
      if (res.data) {
        const keys = new Set<string>();
        res.data.forEach((r) => {
          keys.add(`${r.dia}||${r.bloque}`);
        });
        setSelectedKeys(keys);
      } else if (res.message) {
        setError(res.message);
      }
      setLoading(false);
    }
    load();
  }, [aula.id]);

  const toggleBlock = (dia: DiaSemana, bloque: BloqueHorario) => {
    const key = `${dia}||${bloque}`;
    const newKeys = new Set(selectedKeys);
    if (newKeys.has(key)) {
      newKeys.delete(key);
    } else {
      newKeys.add(key);
    }
    setSelectedKeys(newKeys);
    setSuccessMsg(null);
  };

  const handleSave = async () => {
    setSaving(true);
    setError(null);
    setSuccessMsg(null);

    // Convertir de "Set" a array estructurado
    const restricciones = Array.from(selectedKeys).map((key) => {
      const [dia, bloque] = key.split('||');
      return {
        dia: dia as DiaSemana,
        bloque: bloque as BloqueHorario,
        motivo: 'Inhabilitado por administración',
      };
    });

    const res = await saveAulaRestriccionesAction(aula.id, restricciones);

    if (res.success) {
      setSuccessMsg('Restricciones de aula guardadas exitosamente.');
      // Auto ocultar mensaje tras 3 segundos
      setTimeout(() => setSuccessMsg(null), 3000);
    } else {
      setError(res.message || 'Error al guardar restricciones.');
    }
    setSaving(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="fixed inset-0 bg-black/45 backdrop-blur-xs" onClick={onClose} />
      <div className="relative bg-card rounded-xl border border-border shadow-2xl w-full max-w-4xl mx-4 max-h-[90vh] flex flex-col overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-border">
          <div className="space-y-0.5">
            <h2 className="text-sm font-semibold flex items-center gap-2">
              <Calendar className="w-4 h-4 text-primary" />
              Restricciones Horarias del Aula
            </h2>
            <p className="text-[11px] text-muted-foreground">
              Aula: {aula.nombre} ({aula.codigo}) — Tipo: {aula.tipo}
            </p>
          </div>
          <button onClick={onClose} className="p-1 rounded-md hover:bg-muted transition-colors">
            <X className="w-4 h-4 text-muted-foreground" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto flex-1 space-y-4">
          <div className="p-4 bg-muted/40 border border-border rounded-xl text-xs space-y-2">
            <p className="font-semibold text-foreground">💡 ¿Cómo funciona?</p>
            <p className="text-muted-foreground leading-relaxed">
              Haz click sobre las celdas horarias para inhabilitarlas. Las celdas marcadas en{' '}
              <strong className="text-destructive font-bold">rojo oscuro</strong> representan bloques donde la universidad
              NO podrá programar clases en este espacio físico (ej. debido a mantenimiento, exclusividad de laboratorios externos, etc.).
            </p>
          </div>

          {loading ? (
            <div className="flex flex-col items-center justify-center py-20 space-y-2">
              <Loader2 className="w-6 h-6 text-primary animate-spin" />
              <p className="text-xs text-muted-foreground">Cargando restricciones de aula...</p>
            </div>
          ) : (
            <div className="border border-border rounded-xl overflow-hidden shadow-xs bg-card">
              <div className="overflow-x-auto">
                <table className="w-full text-[11px] border-collapse">
                  <thead>
                    <tr className="bg-muted/40 border-b border-border">
                      <th className="p-2 border-r border-border font-semibold text-muted-foreground w-28 text-center">
                        Horario
                      </th>
                      {DIAS_SEMANA.map((dia) => (
                        <th key={dia} className="p-2 border-r border-border font-bold text-foreground text-center">
                          {dia}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {BLOQUES_HORARIOS.map((bloque) => (
                      <tr key={bloque} className="hover:bg-muted/5 transition-colors">
                        <td className="p-2 border-r border-border font-semibold text-muted-foreground text-center bg-muted/10 font-mono">
                          {bloque}
                        </td>
                        {DIAS_SEMANA.map((dia) => {
                          const key = `${dia}||${bloque}`;
                          const isRestricted = selectedKeys.has(key);
                          return (
                            <td
                              key={dia}
                              onClick={() => toggleBlock(dia, bloque)}
                              className={`p-2 border-r border-border text-center cursor-pointer select-none transition-all duration-200 ${
                                isRestricted
                                  ? 'bg-destructive/15 hover:bg-destructive/20 border-destructive/20 text-destructive font-bold'
                                  : 'bg-card hover:bg-emerald-50/40 text-muted-foreground'
                              }`}
                            >
                              {isRestricted ? (
                                <span className="inline-flex items-center gap-1 text-[10px] text-destructive uppercase tracking-wide">
                                  <AlertCircle className="w-3 h-3" />
                                  Restringido
                                </span>
                              ) : (
                                <span className="text-[10px] text-muted-foreground/30 font-medium">Disponible</span>
                              )}
                            </td>
                          );
                        })}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {error && (
            <div className="rounded-md bg-destructive/10 border border-destructive/20 px-4 py-2.5">
              <p className="text-sm text-destructive">{error}</p>
            </div>
          )}

          {successMsg && (
            <div className="rounded-md bg-emerald-50 border border-emerald-200 px-4 py-2.5 flex items-center gap-2">
              <Check className="w-4 h-4 text-emerald-600" />
              <p className="text-sm text-emerald-700 font-medium">{successMsg}</p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-border bg-muted/10 flex justify-end gap-3">
          <Button type="button" variant="outline" size="sm" onClick={onClose}>
            Cancelar
          </Button>
          <Button type="button" disabled={saving || loading} size="sm" onClick={handleSave}>
            {saving ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin mr-1.5" />
                Guardando...
              </>
            ) : (
              <>
                <Save className="w-4 h-4 mr-1.5" />
                Guardar Restricciones
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}
