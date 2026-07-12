'use client';

import { useState, useEffect } from 'react';
import { Docente } from '../../domain/entities/docente.entity';
import { Button } from '@/shared/components/ui/button';
import { X, Calendar, BookOpen, Clock, Mail, Phone, Info, Users } from 'lucide-react';
import { getDocenteDetailsAction, GrupoAsignado } from '../actions/get-docente-details.action';
import { Disponibilidad } from '@/modules/disponibilidad/domain/entities/disponibilidad.entity';
import { Periodo } from '@/modules/periodos/domain/entities/periodo.entity';
import { DisponibilidadGrid, makeKey } from '@/modules/disponibilidad/presentation/components/disponibilidad-grid';
import { DiaSemana, BloqueHorario } from '@/shared/constants/time-blocks';

interface DocenteDetailsDialogProps {
  docente: Docente;
  onClose: () => void;
}

export function DocenteDetailsDialog({ docente, onClose }: DocenteDetailsDialogProps) {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [disponibilidad, setDisponibilidad] = useState<Disponibilidad[]>([]);
  const [periodo, setPeriodo] = useState<Periodo | null>(null);
  const [asignaciones, setAsignaciones] = useState<GrupoAsignado[]>([]);

  useEffect(() => {
    const fetchDetails = async () => {
      setLoading(true);
      const result = await getDocenteDetailsAction(docente.id);
      if (result.message && !result.disponibilidad && !result.asignaciones) {
        setError(result.message);
      } else {
        setDisponibilidad(result.disponibilidad ?? []);
        if (result.periodo) setPeriodo(result.periodo);
        setAsignaciones(result.asignaciones ?? []);
      }
      setLoading(false);
    };

    fetchDetails();
  }, [docente.id]);

  // Convert availability array to Map for the Grid
  const gridState = new Map(
    disponibilidad.map((d) => [makeKey(d.dia, d.bloque), d.estado])
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-0">
      <div className="fixed inset-0 bg-black/40" onClick={onClose} />
      <div className="relative bg-card rounded-xl border border-border shadow-lg w-full max-w-4xl max-h-[90vh] overflow-y-auto flex flex-col">
        <div className="flex items-center justify-between px-6 py-4 border-b border-border sticky top-0 bg-card z-10">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-lg">
              {docente.nombres[0]}{docente.apellidos[0]}
            </div>
            <div>
              <h2 className="text-lg font-bold">{docente.apellidos}, {docente.nombres}</h2>
              <p className="text-xs text-muted-foreground">DNI: {docente.dni} • {docente.escuela}</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 rounded-full hover:bg-muted transition-colors">
            <X className="w-5 h-5 text-muted-foreground" />
          </button>
        </div>

        <div className="p-6 space-y-8 flex-1">
          {/* Información Personal y Académica */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <h3 className="text-sm font-semibold flex items-center gap-2 text-foreground">
                <Info className="w-4 h-4 text-primary" />
                Información de Contacto
              </h3>
              <div className="bg-muted/30 rounded-lg p-4 space-y-3 text-sm border border-border">
                <div className="flex items-center gap-3 text-muted-foreground">
                  <Mail className="w-4 h-4" />
                  <span className="text-foreground">{docente.correo}</span>
                </div>
                <div className="flex items-center gap-3 text-muted-foreground">
                  <Phone className="w-4 h-4" />
                  <span className="text-foreground">{docente.telefono || 'No registrado'}</span>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <h3 className="text-sm font-semibold flex items-center gap-2 text-foreground">
                <BookOpen className="w-4 h-4 text-primary" />
                Información Académica
              </h3>
              <div className="bg-muted/30 rounded-lg p-4 grid grid-cols-2 gap-y-3 gap-x-4 text-sm border border-border">
                <div>
                  <p className="text-xs text-muted-foreground">Categoría</p>
                  <p className="font-medium text-foreground">{docente.categoria}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Régimen</p>
                  <p className="font-medium text-foreground">{docente.regimen}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Condición</p>
                  <p className="font-medium text-foreground">{docente.condicion}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Carga Máxima</p>
                  <p className="font-medium text-foreground">{docente.cargaMaxima} hrs</p>
                </div>
              </div>
            </div>
          </div>

          {/* Cursos y grupos asignados */}
          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <h3 className="text-sm font-semibold flex items-center gap-2 text-foreground">
                <Users className="w-4 h-4 text-primary" />
                Cursos y Grupos Asignados
              </h3>
              {periodo && (
                <span className="text-xs text-muted-foreground">
                  Periodo: {periodo.name}
                </span>
              )}
            </div>

            {loading ? (
              <div className="h-32 flex flex-col items-center justify-center gap-3 border border-border rounded-xl bg-muted/20">
                <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                <p className="text-xs text-muted-foreground font-medium">Cargando asignaciones...</p>
              </div>
            ) : asignaciones.length === 0 ? (
              <div className="rounded-xl border border-dashed border-border bg-muted/20 p-8 text-center flex flex-col items-center justify-center">
                <BookOpen className="w-8 h-8 text-muted-foreground/50 mb-3" />
                <p className="text-sm text-muted-foreground font-medium">
                  El docente no tiene cursos ni grupos asignados en el periodo activo.
                </p>
              </div>
            ) : (
              <div className="border border-border rounded-xl overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-border bg-muted/30">
                        <th className="h-10 px-4 text-left text-xs font-medium text-muted-foreground uppercase tracking-wide">Código</th>
                        <th className="h-10 px-4 text-left text-xs font-medium text-muted-foreground uppercase tracking-wide">Curso</th>
                        <th className="h-10 px-4 text-left text-xs font-medium text-muted-foreground uppercase tracking-wide">Ciclo</th>
                        <th className="h-10 px-4 text-left text-xs font-medium text-muted-foreground uppercase tracking-wide">Grupo</th>
                        <th className="h-10 px-4 text-left text-xs font-medium text-muted-foreground uppercase tracking-wide">Tipo</th>
                        <th className="h-10 px-4 text-left text-xs font-medium text-muted-foreground uppercase tracking-wide">Horas</th>
                        <th className="h-10 px-4 text-left text-xs font-medium text-muted-foreground uppercase tracking-wide">Estudiantes</th>
                      </tr>
                    </thead>
                    <tbody>
                      {asignaciones.map((asignacion) => (
                        <tr key={asignacion.id} className="border-b border-border last:border-0 hover:bg-muted/20 transition-colors">
                          <td className="px-4 py-3 font-medium text-foreground">{asignacion.curso.codigo}</td>
                          <td className="px-4 py-3 text-foreground">{asignacion.curso.nombre}</td>
                          <td className="px-4 py-3">
                            <span className="inline-flex items-center px-2 py-0.5 rounded-md text-xs font-medium bg-primary/10 text-primary">
                              {asignacion.curso.ciclo}
                            </span>
                          </td>
                          <td className="px-4 py-3 font-medium text-foreground">Grupo {asignacion.nombreGrupo}</td>
                          <td className="px-4 py-3 text-muted-foreground">{asignacion.curso.tipo}</td>
                          <td className="px-4 py-3 text-muted-foreground">
                            {asignacion.curso.horasTeoricas}T / {asignacion.curso.horasPracticas}P
                          </td>
                          <td className="px-4 py-3 text-muted-foreground">{asignacion.numEstudiantes}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>

          {/* Disponibilidad Horaria */}
          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <h3 className="text-sm font-semibold flex items-center gap-2 text-foreground">
                <Calendar className="w-4 h-4 text-primary" />
                Disponibilidad Horaria
              </h3>
              {periodo && (
                <span className="text-xs bg-primary/10 text-primary px-2.5 py-1 rounded-md font-medium">
                  Periodo Activo: {periodo.name}
                </span>
              )}
            </div>
            
            {loading ? (
              <div className="h-64 flex flex-col items-center justify-center gap-3 border border-border rounded-xl bg-muted/20">
                <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                <p className="text-xs text-muted-foreground font-medium">Cargando disponibilidad...</p>
              </div>
            ) : error ? (
              <div className="rounded-xl border border-dashed border-border bg-muted/20 p-8 text-center flex flex-col items-center justify-center">
                <Clock className="w-8 h-8 text-muted-foreground/50 mb-3" />
                <p className="text-sm text-muted-foreground font-medium">{error}</p>
              </div>
            ) : disponibilidad.length === 0 ? (
              <div className="rounded-xl border border-dashed border-border bg-muted/20 p-8 text-center flex flex-col items-center justify-center">
                <Calendar className="w-8 h-8 text-muted-foreground/50 mb-3" />
                <p className="text-sm text-muted-foreground font-medium">El docente aún no ha registrado su disponibilidad para el periodo activo.</p>
              </div>
            ) : (
              <div className="border border-border rounded-xl overflow-hidden shadow-sm">
                <DisponibilidadGrid 
                  gridState={gridState as Map<string, any>} 
                  onToggle={() => {}} 
                  disabled={true} 
                />
              </div>
            )}
          </div>
        </div>

        <div className="p-4 border-t border-border bg-muted/10 flex justify-end">
          <Button variant="outline" onClick={onClose} className="px-6">
            Cerrar
          </Button>
        </div>
      </div>
    </div>
  );
}
