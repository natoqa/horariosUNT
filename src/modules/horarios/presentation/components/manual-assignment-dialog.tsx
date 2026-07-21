'use client';

import { useState, useEffect } from 'react';
import { X, AlertTriangle, CheckCircle2, Star, Crown, Medal, Loader2, Plus, Search } from 'lucide-react';
import { Button } from '@/shared/components/ui/button';
import { Label } from '@/shared/components/ui/label';
import { DIAS_SEMANA, BLOQUES_HORARIOS } from '@/shared/constants/time-blocks';
import { getRankedOptionsAction, RankedDocente, CompatibleAula, RankedOptionsResult } from '../actions/get-ranked-options.action';
import { createManualAsignacionAction } from '../actions/create-manual-asignacion.action';
import { Violation } from '../../domain/services/constraint-validator.service';

interface ManualAssignmentDialogProps {
  horarioId: string;
  periodoId: string;
  grupos: { id: string; cursoId: string; nombre: string; cursoNombre: string; ciclo: string }[];
  preSelectedDia?: string;
  preSelectedBloque?: string;
  onClose: () => void;
  onSuccess: () => void;
}

type Step = 'grupo' | 'docente' | 'bloque' | 'aula' | 'confirm';

export function ManualAssignmentDialog({
  horarioId,
  periodoId,
  grupos,
  preSelectedDia,
  preSelectedBloque,
  onClose,
  onSuccess,
}: ManualAssignmentDialogProps) {
  const [step, setStep] = useState<Step>('grupo');
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  // Selections
  const [selectedGrupoId, setSelectedGrupoId] = useState('');
  const [selectedTipo, setSelectedTipo] = useState<'teorico' | 'practico'>('teorico');
  const [selectedDocenteId, setSelectedDocenteId] = useState('');
  const [selectedDia, setSelectedDia] = useState(preSelectedDia ?? '');
  const [selectedBloque, setSelectedBloque] = useState(preSelectedBloque ?? '');
  const [selectedAulaId, setSelectedAulaId] = useState('');

  // Data from server
  const [rankedData, setRankedData] = useState<RankedOptionsResult | null>(null);
  const [searchDocente, setSearchDocente] = useState('');

  // Result
  const [violations, setViolations] = useState<Violation[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  // Load ranked options when grupo is selected
  useEffect(() => {
    if (!selectedGrupoId) return;

    async function loadOptions() {
      setLoading(true);
      const result = await getRankedOptionsAction(periodoId, selectedGrupoId, horarioId);
      setRankedData(result);
      setLoading(false);
    }
    loadOptions();
  }, [selectedGrupoId, periodoId, horarioId]);

  const selectedDocente = rankedData?.docentes?.find((d) => d.id === selectedDocenteId);
  const selectedGrupo = grupos.find((g) => g.id === selectedGrupoId);

  // Filter docente bloques for selected dia (if pre-selected)
  const availableBloques = selectedDocente?.bloques ?? [];

  // Filter aulas that are available on the selected dia+bloque
  const availableAulas = rankedData?.aulas ?? [];

  const filteredDocentes = (rankedData?.docentes ?? []).filter((d) =>
    searchDocente === '' || d.nombre.toLowerCase().includes(searchDocente.toLowerCase()),
  );

  const handleSelectGrupo = (grupoId: string) => {
    setSelectedGrupoId(grupoId);
    setSelectedDocenteId('');
    setSelectedDia(preSelectedDia ?? '');
    setSelectedBloque(preSelectedBloque ?? '');
    setSelectedAulaId('');
    setStep('docente');
  };

  const handleSelectDocente = (docenteId: string) => {
    setSelectedDocenteId(docenteId);
    if (preSelectedDia && preSelectedBloque) {
      setStep('aula');
    } else {
      setStep('bloque');
    }
  };

  const handleSelectBloque = (dia: string, bloque: string) => {
    setSelectedDia(dia);
    setSelectedBloque(bloque);
    setStep('aula');
  };

  const handleSelectAula = (aulaId: string) => {
    setSelectedAulaId(aulaId);
    setStep('confirm');
  };

  const handleSubmit = async () => {
    setSaving(true);
    setViolations([]);
    setError(null);

    const result = await createManualAsignacionAction({
      horarioId,
      grupoId: selectedGrupoId,
      docenteId: selectedDocenteId,
      aulaId: selectedAulaId,
      dia: selectedDia,
      bloque: selectedBloque,
      tipo: selectedTipo,
    });

    if (result.success) {
      setSuccess(true);
      setTimeout(() => onSuccess(), 600);
    } else if (result.violations && result.violations.length > 0) {
      setViolations(result.violations);
    } else {
      setError(result.message || 'Error al crear asignación.');
    }
    setSaving(false);
  };

  const getCategoriaIcon = (categoria: string) => {
    switch (categoria) {
      case 'Principal': return <Crown className="w-3.5 h-3.5 text-amber-500" />;
      case 'Asociado': return <Medal className="w-3.5 h-3.5 text-slate-400" />;
      default: return <Star className="w-3.5 h-3.5 text-orange-400" />;
    }
  };

  const getCategoriaColor = (categoria: string) => {
    switch (categoria) {
      case 'Principal': return 'bg-amber-500/10 text-amber-600 border-amber-500/20';
      case 'Asociado': return 'bg-slate-500/10 text-slate-600 border-slate-500/20';
      default: return 'bg-orange-500/10 text-orange-600 border-orange-500/20';
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="fixed inset-0 bg-black/40" onClick={onClose} />
      <div className="relative bg-card rounded-xl border border-border shadow-lg w-full max-w-2xl mx-4 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-border sticky top-0 bg-card z-10">
          <div>
            <h2 className="text-sm font-semibold">Nueva Asignación Manual</h2>
            <div className="flex items-center gap-2 mt-1">
              {['grupo', 'docente', 'bloque', 'aula', 'confirm'].map((s, i) => (
                <div key={s} className="flex items-center gap-1">
                  <div className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold ${
                    step === s ? 'bg-primary text-primary-foreground' :
                    ['grupo', 'docente', 'bloque', 'aula', 'confirm'].indexOf(step) > i
                      ? 'bg-emerald-500 text-white' : 'bg-muted text-muted-foreground'
                  }`}>
                    {i + 1}
                  </div>
                  {i < 4 && <div className="w-4 h-px bg-border" />}
                </div>
              ))}
            </div>
          </div>
          <button onClick={onClose} className="p-1 rounded-md hover:bg-muted transition-colors">
            <X className="w-4 h-4 text-muted-foreground" />
          </button>
        </div>

        <div className="p-6 space-y-4">
          {loading && (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="w-5 h-5 text-primary animate-spin mr-2" />
              <span className="text-sm text-muted-foreground">Cargando opciones rankeadas...</span>
            </div>
          )}

          {/* Step 1: Select Grupo */}
          {step === 'grupo' && !loading && (
            <div className="space-y-3">
              <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                Paso 1: Seleccione el grupo/sección
              </Label>
              <div className="grid grid-cols-1 gap-2">
                {/* Tipo selector */}
                <div className="flex gap-2 mb-2">
                  <button
                    onClick={() => setSelectedTipo('teorico')}
                    className={`px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${
                      selectedTipo === 'teorico'
                        ? 'bg-primary text-primary-foreground'
                        : 'bg-muted text-muted-foreground hover:bg-muted/80'
                    }`}
                  >
                    Teórico
                  </button>
                  <button
                    onClick={() => setSelectedTipo('practico')}
                    className={`px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${
                      selectedTipo === 'practico'
                        ? 'bg-primary text-primary-foreground'
                        : 'bg-muted text-muted-foreground hover:bg-muted/80'
                    }`}
                  >
                    Práctico
                  </button>
                </div>
                {grupos.map((g) => (
                  <button
                    key={g.id}
                    onClick={() => handleSelectGrupo(g.id)}
                    className="flex items-center justify-between rounded-lg border border-border bg-background p-3 text-left hover:border-primary hover:bg-primary/5 transition-all"
                  >
                    <div>
                      <p className="text-sm font-medium">{g.cursoNombre}</p>
                      <p className="text-xs text-muted-foreground">
                        {g.nombre} · Ciclo {g.ciclo}
                      </p>
                    </div>
                    <Plus className="w-4 h-4 text-muted-foreground" />
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Step 2: Select Docente (RANKED) */}
          {step === 'docente' && !loading && rankedData && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                  Paso 2: Seleccione docente (ordenados por rango)
                </Label>
                <button onClick={() => setStep('grupo')} className="text-xs text-primary hover:underline">
                  ← Cambiar grupo
                </button>
              </div>

              {rankedData.grupoInfo && (
                <div className="rounded-md bg-muted/50 border border-border px-3 py-2 text-xs">
                  <span className="font-medium">{rankedData.grupoInfo.cursoNombre}</span>
                  {' · '}{rankedData.grupoInfo.grupoNombre}
                  {' · '}{rankedData.grupoInfo.numEstudiantes} estudiantes
                  {' · Ciclo '}{rankedData.grupoInfo.ciclo}
                </div>
              )}

              {/* Search */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
                <input
                  type="text"
                  placeholder="Buscar docente..."
                  value={searchDocente}
                  onChange={(e) => setSearchDocente(e.target.value)}
                  className="w-full rounded-md border border-input bg-background pl-9 pr-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                />
              </div>

              <div className="space-y-2 max-h-[400px] overflow-y-auto pr-1">
                {filteredDocentes.map((d, index) => (
                  <button
                    key={d.id}
                    onClick={() => handleSelectDocente(d.id)}
                    className={`w-full flex items-center gap-3 rounded-lg border p-3 text-left transition-all hover:shadow-md ${
                      d.isPreAssigned
                        ? 'border-primary/40 bg-primary/5 hover:border-primary'
                        : 'border-border bg-background hover:border-primary hover:bg-primary/5'
                    }`}
                  >
                    {/* Rank number */}
                    <div className="w-7 h-7 rounded-full bg-muted flex items-center justify-center flex-shrink-0">
                      <span className="text-[11px] font-bold text-muted-foreground">
                        {index + 1}
                      </span>
                    </div>

                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <p className="text-sm font-medium truncate">{d.nombre}</p>
                        {d.isPreAssigned && (
                          <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-medium bg-primary/10 text-primary border border-primary/20">
                            Pre-asignado
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-2 mt-1">
                        <span className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-medium border ${getCategoriaColor(d.categoria)}`}>
                          {getCategoriaIcon(d.categoria)}
                          {d.categoria}
                        </span>
                        <span className="text-[10px] text-muted-foreground">
                          {d.condicion} · {d.antiguedad} años
                        </span>
                      </div>
                    </div>

                    {/* Score + slots */}
                    <div className="text-right flex-shrink-0">
                      <p className="text-sm font-bold text-primary">{d.score}</p>
                      <p className="text-[10px] text-muted-foreground">
                        {d.bloques.filter((b) => b.estado === 'preferido').length} pref ·{' '}
                        {d.bloques.length} disp
                      </p>
                    </div>
                  </button>
                ))}

                {filteredDocentes.length === 0 && (
                  <div className="text-center py-8 text-sm text-muted-foreground">
                    No se encontraron docentes disponibles.
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Step 3: Select Dia + Bloque */}
          {step === 'bloque' && !loading && selectedDocente && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                  Paso 3: Seleccione día y bloque horario
                </Label>
                <button onClick={() => setStep('docente')} className="text-xs text-primary hover:underline">
                  ← Cambiar docente
                </button>
              </div>

              <div className="rounded-md bg-muted/50 border border-border px-3 py-2 text-xs">
                <span className="font-medium">{selectedDocente.nombre}</span>
                {' · '}{selectedDocente.categoria}{' · Score: '}{selectedDocente.score}
              </div>

              {/* Mini grid */}
              <div className="rounded-xl border border-border overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-[10px] border-collapse">
                    <thead>
                      <tr className="bg-muted/40 border-b border-border">
                        <th className="p-1.5 border-r border-border font-semibold text-muted-foreground" style={{ width: 70 }}>Hora</th>
                        {DIAS_SEMANA.map((dia) => (
                          <th key={dia} className="p-1.5 border-r border-border font-bold text-foreground text-center last:border-r-0">
                            {dia.substring(0, 3)}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {BLOQUES_HORARIOS.map((bloque) => (
                        <tr key={bloque} className="border-b border-border last:border-b-0">
                          <td className="p-1 border-r border-border font-mono text-muted-foreground text-center bg-muted/10">
                            {bloque.split(' - ')[0]}
                          </td>
                          {DIAS_SEMANA.map((dia) => {
                            const slot = availableBloques.find((b) => b.dia === dia && b.bloque === bloque);
                            const isSelected = selectedDia === dia && selectedBloque === bloque;

                            if (!slot) {
                              return (
                                <td key={dia} className="p-0.5 border-r border-border last:border-r-0">
                                  <div className="h-6 rounded bg-muted/30" />
                                </td>
                              );
                            }

                            return (
                              <td key={dia} className="p-0.5 border-r border-border last:border-r-0">
                                <button
                                  onClick={() => handleSelectBloque(dia, bloque)}
                                  className={`w-full h-6 rounded text-[9px] font-medium transition-all ${
                                    isSelected
                                      ? 'bg-primary text-primary-foreground ring-2 ring-primary'
                                      : slot.estado === 'preferido'
                                        ? 'bg-emerald-500/20 text-emerald-600 hover:bg-emerald-500/30 border border-emerald-500/30'
                                        : 'bg-blue-500/10 text-blue-600 hover:bg-blue-500/20 border border-blue-500/20'
                                  }`}
                                >
                                  {slot.estado === 'preferido' ? '★' : '○'}
                                </button>
                              </td>
                            );
                          })}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              <div className="flex items-center gap-4 text-[10px] text-muted-foreground">
                <span className="flex items-center gap-1">
                  <div className="w-3 h-3 rounded bg-emerald-500/20 border border-emerald-500/30" /> Preferido
                </span>
                <span className="flex items-center gap-1">
                  <div className="w-3 h-3 rounded bg-blue-500/10 border border-blue-500/20" /> Disponible
                </span>
                <span className="flex items-center gap-1">
                  <div className="w-3 h-3 rounded bg-muted/30" /> No disponible / Ocupado
                </span>
              </div>
            </div>
          )}

          {/* Step 4: Select Aula */}
          {step === 'aula' && !loading && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                  Paso 4: Seleccione aula
                </Label>
                <button onClick={() => setStep('bloque')} className="text-xs text-primary hover:underline">
                  ← Cambiar bloque
                </button>
              </div>

              <div className="rounded-md bg-muted/50 border border-border px-3 py-2 text-xs space-y-0.5">
                <p><span className="font-medium">Curso:</span> {selectedGrupo?.cursoNombre} ({selectedGrupo?.nombre})</p>
                <p><span className="font-medium">Docente:</span> {selectedDocente?.nombre}</p>
                <p><span className="font-medium">Horario:</span> {selectedDia} {selectedBloque}</p>
              </div>

              <div className="space-y-2 max-h-[300px] overflow-y-auto">
                {availableAulas.map((a) => (
                  <button
                    key={a.id}
                    onClick={() => handleSelectAula(a.id)}
                    className={`w-full flex items-center justify-between rounded-lg border p-3 text-left transition-all hover:border-primary hover:bg-primary/5 ${
                      selectedAulaId === a.id ? 'border-primary bg-primary/5' : 'border-border bg-background'
                    }`}
                  >
                    <div>
                      <p className="text-sm font-medium">{a.codigo} - {a.nombre}</p>
                      <p className="text-xs text-muted-foreground">
                        {a.tipo} · Capacidad: {a.capacidad}
                        {a.pabellon && ` · Pabellón ${a.pabellon}`}
                      </p>
                    </div>
                    <span className="text-xs font-medium text-muted-foreground">
                      Cap. {a.capacidad}
                    </span>
                  </button>
                ))}

                {availableAulas.length === 0 && (
                  <div className="text-center py-8 text-sm text-muted-foreground">
                    No hay aulas compatibles disponibles.
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Step 5: Confirm */}
          {step === 'confirm' && !loading && (
            <div className="space-y-4">
              <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                Confirmar asignación
              </Label>

              <div className="rounded-lg border border-border bg-muted/30 p-4 space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Curso:</span>
                  <span className="font-medium">{selectedGrupo?.cursoNombre} ({selectedGrupo?.nombre})</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Tipo:</span>
                  <span className="font-medium">{selectedTipo === 'teorico' ? 'Teórico' : 'Práctico'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Docente:</span>
                  <span className="font-medium">{selectedDocente?.nombre}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Horario:</span>
                  <span className="font-medium">{selectedDia} {selectedBloque}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Aula:</span>
                  <span className="font-medium">
                    {availableAulas.find((a) => a.id === selectedAulaId)?.codigo} -{' '}
                    {availableAulas.find((a) => a.id === selectedAulaId)?.nombre}
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* Violations */}
          {violations.length > 0 && (
            <div className="rounded-md bg-destructive/10 border border-destructive/20 px-4 py-3 space-y-2">
              <div className="flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-destructive flex-shrink-0" />
                <p className="text-sm font-medium text-destructive">Conflictos detectados</p>
              </div>
              <ul className="space-y-1">
                {violations.map((v, i) => (
                  <li key={i} className="text-xs text-destructive">
                    <span className="font-medium">[{v.rule}]</span> {v.message}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {error && (
            <div className="rounded-md bg-destructive/10 border border-destructive/20 px-4 py-2.5">
              <p className="text-sm text-destructive">{error}</p>
            </div>
          )}

          {success && (
            <div className="rounded-md bg-emerald-500/10 border border-emerald-500/20 px-4 py-2.5 flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <p className="text-sm text-emerald-600">Asignación creada exitosamente</p>
            </div>
          )}

          {/* Footer */}
          {step === 'confirm' && (
            <div className="flex justify-end gap-3 pt-2">
              <Button type="button" variant="outline" size="sm" onClick={onClose}>
                Cancelar
              </Button>
              <Button
                size="sm"
                disabled={saving || success}
                onClick={handleSubmit}
              >
                {saving ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-1.5 animate-spin" />
                    Asignando...
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="w-4 h-4 mr-1.5" />
                    Confirmar Asignación
                  </>
                )}
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
