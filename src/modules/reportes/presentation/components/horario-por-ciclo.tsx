'use client';

import { useState, useEffect, startTransition } from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/shared/components/ui/select';
import { Card } from '@/shared/components/ui/card';
import { Badge } from '@/shared/components/ui/badge';
import { AlertCircle, Clock, Users, MapPin } from 'lucide-react';
import { DIAS_SEMANA, BLOQUES_HORARIOS, type DiaSemana, type BloqueHorario } from '@/shared/constants/time-blocks';
import { getAsignacionesPorCicloAction } from '../actions/get-asignaciones-por-ciclo.action';
import { toast } from 'sonner';

interface Asignacion {
  id: string;
  curso_codigo: string;
  curso_nombre: string;
  ciclo: number;
  grupo: string;
  docente_nombre: string;
  aula_nombre: string;
  dia: DiaSemana;
  bloque: BloqueHorario;
  tipo: string;
}

const CICLOS = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10] as const;

export function HorarioPorCiclo() {
  const [selectedCiclo, setSelectedCiclo] = useState<number>(1);
  const [asignaciones, setAsignaciones] = useState<Asignacion[]>([]);
  const [loading, setLoading] = useState(true);
  const [conflictos, setConflictos] = useState<Set<string>>(new Set());

  const fetchAsignaciones = async (ciclo: number) => {
    setLoading(true);
    try {
      const result = await getAsignacionesPorCicloAction(ciclo);

      if (result.message) {
        toast.error(result.message);
        setAsignaciones([]);
        return;
      }

      if (!result.data) {
        setAsignaciones([]);
        return;
      }

      const formattedAsignaciones: Asignacion[] = result.data.map((a: any) => ({
        id: a.id,
        curso_codigo: a.curso_codigo,
        curso_nombre: a.curso_nombre,
        ciclo: a.ciclo,
        grupo: a.grupo,
        docente_nombre: a.docente_nombre,
        aula_nombre: a.aula_nombre,
        dia: a.dia,
        bloque: a.bloque,
        tipo: a.tipo,
      }));

      setAsignaciones(formattedAsignaciones);

      // Detectar conflictos (múltiples cursos del mismo ciclo en el mismo bloque)
      const conflictosSet = new Set<string>();
      const bloquesPorCiclo: Record<string, Asignacion[]> = {};

      formattedAsignaciones.forEach((asig) => {
        const key = `${asig.dia}-${asig.bloque}`;
        if (!bloquesPorCiclo[key]) {
          bloquesPorCiclo[key] = [];
        }
        bloquesPorCiclo[key].push(asig);
      });

      Object.entries(bloquesPorCiclo).forEach(([key, asigs]) => {
        if (asigs.length > 1) {
          conflictosSet.add(key);
        }
      });

      setConflictos(conflictosSet);
    } catch (error) {
      toast.error('Error al cargar el horario');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAsignaciones(selectedCiclo);
  }, [selectedCiclo]);

  const getAsignacionesForCell = (dia: DiaSemana, bloque: BloqueHorario) => {
    return asignaciones.filter((a) => a.dia === dia && a.bloque === bloque);
  };

  const getCellBackgroundColor = (dia: DiaSemana, bloque: BloqueHorario) => {
    const key = `${dia}-${bloque}`;
    const asigs = getAsignacionesForCell(dia, bloque);
    
    if (asigs.length === 0) return 'bg-muted/30';
    if (conflictos.has(key)) return 'bg-red-50 border-red-300';
    return 'bg-blue-50 border-blue-200';
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold">Horario por Ciclo</h2>
          <p className="text-sm text-muted-foreground">
            Visualiza el horario filtrado por ciclo académico
          </p>
        </div>
        <Select
          value={selectedCiclo.toString()}
          onValueChange={(val) => setSelectedCiclo(val ? parseInt(val) : 0)}
        >
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Seleccionar ciclo" />
          </SelectTrigger>
          <SelectContent>
            {CICLOS.map((ciclo) => (
              <SelectItem key={ciclo} value={ciclo.toString()}>
                Ciclo {ciclo}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {conflictos.size > 0 && (
        <Card className="p-4 bg-red-50 border-red-200">
          <div className="flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-red-600 mt-0.5" />
            <div>
              <p className="font-semibold text-red-900">Conflictos detectados</p>
              <p className="text-sm text-red-700">
                Se encontraron {conflictos.size} bloques con múltiples cursos del mismo ciclo.
                Revisa la grilla para identificar los conflictos.
              </p>
            </div>
          </div>
        </Card>
      )}

      {loading ? (
        <div className="flex items-center justify-center py-20 border border-border rounded-xl bg-card">
          <div className="flex items-center gap-3 text-sm text-muted-foreground">
            <div className="w-5 h-5 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
            Cargando horario del ciclo {selectedCiclo}...
          </div>
        </div>
      ) : asignaciones.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 border border-border rounded-xl bg-card text-center">
          <Clock className="w-12 h-12 text-muted-foreground mb-3" />
          <p className="text-sm font-medium text-foreground">
            Sin asignaciones para el ciclo {selectedCiclo}
          </p>
          <p className="text-xs text-muted-foreground mt-1">
            No hay cursos asignados para este ciclo en el período actual.
          </p>
        </div>
      ) : (
        <Card className="overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-muted/50">
                  <th className="h-12 px-4 text-left font-medium text-muted-foreground border-r border-border min-w-[120px]">
                    Bloque
                  </th>
                  {DIAS_SEMANA.map((dia) => (
                    <th
                      key={dia}
                      className="h-12 px-4 text-center font-medium text-muted-foreground border-r border-border min-w-[140px]"
                    >
                      {dia}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {BLOQUES_HORARIOS.map((bloque) => (
                  <tr key={bloque} className="border-t border-border">
                    <td className="h-24 px-4 font-medium text-xs text-muted-foreground border-r border-border">
                      {bloque}
                    </td>
                    {DIAS_SEMANA.map((dia) => {
                      const cellAsignaciones = getAsignacionesForCell(dia, bloque);
                      const bgColor = getCellBackgroundColor(dia, bloque);
                      const hasConflict = conflictos.has(`${dia}-${bloque}`);

                      return (
                        <td
                          key={`${dia}-${bloque}`}
                          className={`h-24 px-2 border-r border-border last:border-r-0 ${bgColor} ${
                            hasConflict ? 'border-2' : ''
                          }`}
                        >
                          {cellAsignaciones.length > 0 ? (
                            <div className="space-y-1">
                              {cellAsignaciones.map((asig) => (
                                <div
                                  key={asig.id}
                                  className={`p-2 rounded text-xs ${
                                    hasConflict
                                      ? 'bg-red-100 border border-red-300'
                                      : 'bg-white border border-border'
                                  }`}
                                >
                                  <div className="font-semibold text-foreground truncate">
                                    {asig.curso_codigo}
                                  </div>
                                  <div className="text-muted-foreground truncate">
                                    {asig.curso_nombre}
                                  </div>
                                  <div className="flex items-center gap-1 mt-1 text-muted-foreground">
                                    <Users className="w-3 h-3" />
                                    <span className="truncate">{asig.docente_nombre}</span>
                                  </div>
                                  <div className="flex items-center gap-1 text-muted-foreground">
                                    <MapPin className="w-3 h-3" />
                                    <span className="truncate">{asig.aula_nombre}</span>
                                  </div>
                                  <Badge variant="outline" className="text-[10px] mt-1">
                                    {asig.grupo}
                                  </Badge>
                                </div>
                              ))}
                            </div>
                          ) : (
                            <div className="h-full flex items-center justify-center text-muted-foreground/30">
                              -
                            </div>
                          )}
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}
    </div>
  );
}
