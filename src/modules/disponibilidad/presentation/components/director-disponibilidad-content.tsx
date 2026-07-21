'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import {
  Loader2,
  Clock,
  Users,
  CheckCircle2,
  AlertCircle,
  Eye,
  Search,
  UserCheck,
  UserX,
} from 'lucide-react';
import { Button } from '@/shared/components/ui/button';
import { Input } from '@/shared/components/ui/input';
import { Badge } from '@/shared/components/ui/badge';
import {
  Table,
  TableHeader,
  TableBody,
  TableHead,
  TableRow,
  TableCell,
} from '@/shared/components/ui/table';
import { Periodo } from '@/modules/periodos';
import {
  getDirectorResumenAction,
  DocenteResumen,
} from '../actions/get-director-resumen.action';
import { DocenteDisponibilidadModal } from './docente-disponibilidad-modal';

type ContentState = 'loading' | 'error' | 'empty' | 'success';

export function DirectorDisponibilidadContent() {
  const [state, setState] = useState<ContentState>('loading');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [periodo, setPeriodo] = useState<Periodo | null>(null);
  const [docentes, setDocentes] = useState<DocenteResumen[]>([]);
  const [searchQuery, setSearchQuery] = useState('');

  // Modal state
  const [selectedDocente, setSelectedDocente] = useState<DocenteResumen | null>(null);
  const [modalOpen, setModalOpen] = useState(false);

  const loadData = useCallback(async () => {
    setState('loading');
    setErrorMessage(null);

    const result = await getDirectorResumenAction();

    if (result.message && !result.periodo) {
      setState('empty');
      setErrorMessage(result.message);
      return;
    }

    if (result.periodo) {
      setPeriodo(result.periodo);
    }

    if (result.message) {
      setState('error');
      setErrorMessage(result.message);
      return;
    }

    setDocentes(result.docentes ?? []);
    setState('success');
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const filteredDocentes = useMemo(() => {
    if (!searchQuery.trim()) return docentes;
    const query = searchQuery.toLowerCase();
    return docentes.filter(
      (d) =>
        d.nombres.toLowerCase().includes(query) ||
        d.apellidos.toLowerCase().includes(query) ||
        d.correo.toLowerCase().includes(query),
    );
  }, [docentes, searchQuery]);

  const registrados = docentes.filter((d) => d.registrado).length;
  const pendientes = docentes.filter((d) => !d.registrado).length;
  const porcentaje = docentes.length > 0 ? Math.round((registrados / docentes.length) * 100) : 0;

  const handleViewDisponibilidad = (docente: DocenteResumen) => {
    setSelectedDocente(docente);
    setModalOpen(true);
  };

  const formatFecha = (fecha: string | null) => {
    if (!fecha) return '—';
    try {
      return new Date(fecha).toLocaleDateString('es-PE', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      });
    } catch {
      return '—';
    }
  };

  if (state === 'loading') {
    return (
      <div className="flex flex-col items-center justify-center py-20 space-y-2">
        <Loader2 className="w-6 h-6 text-primary animate-spin" />
        <p className="text-xs text-muted-foreground">Cargando resumen de disponibilidad...</p>
      </div>
    );
  }

  if (state === 'empty') {
    return (
      <div className="rounded-xl border border-border bg-card p-12 text-center space-y-3">
        <Clock className="w-10 h-10 text-muted-foreground mx-auto" />
        <p className="text-sm font-medium text-foreground">Sin período activo</p>
        <p className="text-xs text-muted-foreground">
          {errorMessage || 'No hay un período académico activo en este momento.'}
        </p>
      </div>
    );
  }

  if (state === 'error') {
    return (
      <div className="rounded-xl border border-destructive/20 bg-destructive/10 p-6 text-center space-y-2">
        <AlertCircle className="w-8 h-8 text-destructive mx-auto" />
        <p className="text-sm text-destructive font-medium">{errorMessage}</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Period Info */}
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-muted-foreground">
            Período: <span className="font-medium text-foreground">{periodo?.name}</span>
            {' — '}
            Estado: <span className="font-medium text-foreground">{periodo?.state}</span>
          </p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <div className="rounded-xl border border-border bg-card p-4 space-y-2">
          <div className="flex items-center gap-2 text-muted-foreground">
            <div className="w-8 h-8 rounded-lg bg-blue-500/10 flex items-center justify-center">
              <Users className="w-4 h-4 text-blue-600" />
            </div>
            <span className="text-xs font-medium">Total Docentes</span>
          </div>
          <p className="text-2xl font-bold text-foreground">{docentes.length}</p>
        </div>

        <div className="rounded-xl border border-border bg-card p-4 space-y-2">
          <div className="flex items-center gap-2 text-muted-foreground">
            <div className="w-8 h-8 rounded-lg bg-emerald-500/10 flex items-center justify-center">
              <UserCheck className="w-4 h-4 text-emerald-600" />
            </div>
            <span className="text-xs font-medium">Registrados</span>
          </div>
          <p className="text-2xl font-bold text-emerald-600">{registrados}</p>
        </div>

        <div className="rounded-xl border border-border bg-card p-4 space-y-2">
          <div className="flex items-center gap-2 text-muted-foreground">
            <div className="w-8 h-8 rounded-lg bg-red-500/10 flex items-center justify-center">
              <UserX className="w-4 h-4 text-red-500" />
            </div>
            <span className="text-xs font-medium">Pendientes</span>
          </div>
          <p className="text-2xl font-bold text-red-500">{pendientes}</p>
        </div>

        <div className="rounded-xl border border-border bg-card p-4 space-y-2">
          <div className="flex items-center gap-2 text-muted-foreground">
            <div className="w-8 h-8 rounded-lg bg-violet-500/10 flex items-center justify-center">
              <CheckCircle2 className="w-4 h-4 text-violet-600" />
            </div>
            <span className="text-xs font-medium">Avance</span>
          </div>
          <p className="text-2xl font-bold text-violet-600">{porcentaje}%</p>
          <div className="h-1.5 rounded-full bg-muted overflow-hidden">
            <div
              className="h-full rounded-full bg-violet-500 transition-all duration-500"
              style={{ width: `${porcentaje}%` }}
            />
          </div>
        </div>
      </div>

      {/* Search Bar */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input
          id="search-docentes"
          placeholder="Buscar docente por nombre, apellido o correo..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-9"
        />
      </div>

      {/* Docentes Table */}
      <div className="rounded-xl border border-border overflow-hidden bg-card">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/40">
              <TableHead>Docente</TableHead>
              <TableHead>DNI</TableHead>
              <TableHead>Teléfono</TableHead>
              <TableHead>Categoría</TableHead>
              <TableHead>Régimen</TableHead>
              <TableHead className="text-center">Estado</TableHead>
              <TableHead className="text-center">Bloques</TableHead>
              <TableHead>Fecha Registro</TableHead>
              <TableHead className="text-center w-16">Ver</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredDocentes.length === 0 ? (
              <TableRow>
                <TableCell colSpan={9} className="text-center py-8 text-muted-foreground">
                  {searchQuery
                    ? 'No se encontraron docentes con ese criterio de búsqueda.'
                    : 'No hay docentes activos registrados.'}
                </TableCell>
              </TableRow>
            ) : (
              filteredDocentes.map((docente) => (
                <TableRow key={docente.id}>
                  <TableCell>
                    <div>
                      <p className="font-medium text-foreground">
                        {docente.apellidos}, {docente.nombres}
                      </p>
                      <p className="text-xs text-muted-foreground">{docente.correo}</p>
                    </div>
                  </TableCell>
                  <TableCell>
                    <span className="text-sm font-mono">{docente.dni}</span>
                  </TableCell>
                  <TableCell>
                    <span className="text-sm">{docente.telefono || '—'}</span>
                  </TableCell>
                  <TableCell>
                    <span className="text-sm">{docente.categoria}</span>
                  </TableCell>
                  <TableCell>
                    <span className="text-sm">{docente.regimen}</span>
                  </TableCell>
                  <TableCell className="text-center">
                    {docente.registrado ? (
                      <Badge variant="default" className="bg-emerald-100 text-emerald-600 border-emerald-500/20 hover:bg-emerald-500/20">
                        <CheckCircle2 className="w-3 h-3 mr-1" />
                        Registrado
                      </Badge>
                    ) : (
                      <Badge variant="destructive">
                        <AlertCircle className="w-3 h-3 mr-1" />
                        Pendiente
                      </Badge>
                    )}
                  </TableCell>
                  <TableCell className="text-center">
                    <span className={`text-sm font-semibold ${docente.totalBloques > 0 ? 'text-foreground' : 'text-muted-foreground'}`}>
                      {docente.totalBloques > 0 ? `${docente.totalBloques}h` : '—'}
                    </span>
                  </TableCell>
                  <TableCell>
                    <span className="text-xs text-muted-foreground">
                      {formatFecha(docente.fechaRegistro)}
                    </span>
                  </TableCell>
                  <TableCell className="text-center">
                    <Button
                      variant="ghost"
                      size="icon-sm"
                      disabled={!docente.registrado}
                      onClick={() => handleViewDisponibilidad(docente)}
                      title={docente.registrado ? 'Ver disponibilidad' : 'Sin disponibilidad registrada'}
                    >
                      <Eye className={`w-4 h-4 ${docente.registrado ? 'text-primary' : 'text-muted-foreground/40'}`} />
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Disponibilidad Modal */}
      {periodo && (
        <DocenteDisponibilidadModal
          docente={selectedDocente}
          periodoId={periodo.id}
          open={modalOpen}
          onOpenChange={setModalOpen}
        />
      )}
    </div>
  );
}
