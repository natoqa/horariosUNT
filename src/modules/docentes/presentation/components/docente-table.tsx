'use client';

import { useEffect, useState, useCallback, useImperativeHandle, forwardRef } from 'react';
import { Docente, calcularAntiguedad } from '../../domain/entities/docente.entity';
import { getDocentesAction } from '../actions/get-docentes.action';
import { toggleDocenteStatusAction } from '../actions/toggle-docente-status.action';
import { deleteDocenteAction } from '../actions/delete-docente.action';
import { DocenteStatusBadge } from './docente-status-badge';
import { DocenteEditDialog } from './docente-edit-dialog';
import { CATEGORIAS_DOCENTE } from '@/shared/constants/categories';
import { Input } from '@/shared/components/ui/input';
import { Users, Pencil, UserCheck, UserX, Search, Trash2 } from 'lucide-react';
import { useAuth } from '@/shared/hooks/use-auth';

export interface DocenteTableRef {
  refresh: () => void;
}

export const DocenteTable = forwardRef<DocenteTableRef>(function DocenteTable(_, ref) {
  const { user } = useAuth();
  const [docentes, setDocentes] = useState<Docente[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [filterCategoria, setFilterCategoria] = useState('');
  const [filterEstado, setFilterEstado] = useState('');
  const [editingDocente, setEditingDocente] = useState<Docente | null>(null);
  const [toggling, setToggling] = useState<string | null>(null);
  const [deleting, setDeleting] = useState<string | null>(null);

  const isDirector = user?.role === 'director';

  const loadDocentes = useCallback(async () => {
    setLoading(true);
    setError(null);
    const result = await getDocentesAction({
      search: search || undefined,
      categoria: filterCategoria || undefined,
      estado: filterEstado || undefined,
    });
    if (result.data) {
      setDocentes(result.data);
    } else {
      setError(result.message || 'Error al cargar docentes.');
    }
    setLoading(false);
  }, [search, filterCategoria, filterEstado]);

  useImperativeHandle(ref, () => ({ refresh: loadDocentes }));

  useEffect(() => {
    loadDocentes();
  }, [loadDocentes]);

  const handleToggleStatus = async (docente: Docente) => {
    const action = docente.estado === 'Activo' ? 'desactivar' : 'activar';
    if (!confirm(`¿Está seguro de ${action} a ${docente.nombres} ${docente.apellidos}?`)) {
      return;
    }
    setToggling(docente.id);
    const result = await toggleDocenteStatusAction(docente.id);
    if (result.success) {
      loadDocentes();
    } else {
      setError(result.message || 'Error al cambiar estado.');
    }
    setToggling(null);
  };

  const handleDelete = async (docente: Docente) => {
    if (!confirm(`¿Está seguro de eliminar a ${docente.nombres} ${docente.apellidos}? Esta acción no se puede deshacer.`)) {
      return;
    }
    setDeleting(docente.id);
    const result = await deleteDocenteAction(docente.id);
    if (result.success) {
      loadDocentes();
    } else {
      setError(result.message || 'Error al eliminar docente.');
    }
    setDeleting(null);
  };

  return (
    <>
      <div className="px-6 py-3 border-b border-border flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Buscar por nombre o apellido..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="h-9 pl-9"
          />
        </div>
        <select
          value={filterCategoria}
          onChange={(e) => setFilterCategoria(e.target.value)}
          className="h-9 rounded-md border border-input bg-background px-3 text-sm"
        >
          <option value="">Todas las categorías</option>
          {CATEGORIAS_DOCENTE.map((cat) => (
            <option key={cat} value={cat}>{cat}</option>
          ))}
        </select>
        <select
          value={filterEstado}
          onChange={(e) => setFilterEstado(e.target.value)}
          className="h-9 rounded-md border border-input bg-background px-3 text-sm"
        >
          <option value="">Todos los estados</option>
          <option value="Activo">Activo</option>
          <option value="Inactivo">Inactivo</option>
        </select>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-12">
          <div className="flex items-center gap-3 text-sm text-muted-foreground">
            <div className="w-4 h-4 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
            Cargando docentes...
          </div>
        </div>
      ) : error ? (
        <div className="flex items-center justify-center py-12">
          <div className="text-sm text-destructive bg-destructive/10 px-4 py-2 rounded-lg">
            {error}
          </div>
        </div>
      ) : docentes.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <div className="w-12 h-12 rounded-xl bg-muted flex items-center justify-center mb-3">
            <Users className="w-6 h-6 text-muted-foreground" />
          </div>
          <p className="text-sm font-medium text-foreground">Sin docentes registrados</p>
          <p className="text-xs text-muted-foreground mt-1">
            Registre el primer docente usando el formulario de arriba
          </p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-muted/30">
                <th className="h-10 px-6 text-left text-xs font-medium text-muted-foreground uppercase tracking-wide">Docente</th>
                <th className="h-10 px-6 text-left text-xs font-medium text-muted-foreground uppercase tracking-wide">DNI</th>
                <th className="h-10 px-6 text-left text-xs font-medium text-muted-foreground uppercase tracking-wide">Categoría</th>
                <th className="h-10 px-6 text-left text-xs font-medium text-muted-foreground uppercase tracking-wide">Régimen</th>
                <th className="h-10 px-6 text-left text-xs font-medium text-muted-foreground uppercase tracking-wide">Condición</th>
                <th className="h-10 px-6 text-left text-xs font-medium text-muted-foreground uppercase tracking-wide">Antigüedad</th>
                <th className="h-10 px-6 text-left text-xs font-medium text-muted-foreground uppercase tracking-wide">Carga Máx.</th>
                <th className="h-10 px-6 text-left text-xs font-medium text-muted-foreground uppercase tracking-wide">Estado</th>
                <th className="h-10 px-6 text-left text-xs font-medium text-muted-foreground uppercase tracking-wide">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {docentes.map((docente) => (
                <tr key={docente.id} className="border-b border-border last:border-0 hover:bg-muted/20 transition-colors">
                  <td className="px-6 py-3.5">
                    <div>
                      <p className="font-medium text-foreground">
                        {docente.apellidos}, {docente.nombres}
                      </p>
                      <p className="text-xs text-muted-foreground">{docente.correo}</p>
                    </div>
                  </td>
                  <td className="px-6 py-3.5 text-muted-foreground">{docente.dni}</td>
                  <td className="px-6 py-3.5 text-muted-foreground">{docente.categoria}</td>
                  <td className="px-6 py-3.5 text-muted-foreground">{docente.regimen}</td>
                  <td className="px-6 py-3.5 text-muted-foreground">{docente.condicion}</td>
                  <td className="px-6 py-3.5 text-muted-foreground">
                    {calcularAntiguedad(docente.fechaIngreso)} años
                  </td>
                  <td className="px-6 py-3.5 text-muted-foreground">{docente.cargaMaxima}h</td>
                  <td className="px-6 py-3.5">
                    <DocenteStatusBadge estado={docente.estado} />
                  </td>
                  <td className="px-6 py-3.5">
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => setEditingDocente(docente)}
                        className="p-1.5 rounded-md text-muted-foreground hover:text-primary hover:bg-primary/10 transition-colors"
                        title="Editar docente"
                      >
                        <Pencil className="w-4 h-4" />
                      </button>
                      {isDirector && (
                        <button
                          onClick={() => handleToggleStatus(docente)}
                          disabled={toggling === docente.id}
                          className={`p-1.5 rounded-md transition-colors disabled:opacity-50 ${
                            docente.estado === 'Activo'
                              ? 'text-muted-foreground hover:text-destructive hover:bg-destructive/10'
                              : 'text-muted-foreground hover:text-emerald-600 hover:bg-emerald-50'
                          }`}
                          title={docente.estado === 'Activo' ? 'Desactivar docente' : 'Activar docente'}
                        >
                          {docente.estado === 'Activo' ? (
                            <UserX className="w-4 h-4" />
                          ) : (
                            <UserCheck className="w-4 h-4" />
                          )}
                        </button>
                      )}
                      {isDirector && (
                        <button
                          onClick={() => handleDelete(docente)}
                          disabled={deleting === docente.id}
                          className="p-1.5 rounded-md text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors disabled:opacity-50"
                          title="Eliminar docente"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {editingDocente && (
        <DocenteEditDialog
          docente={editingDocente}
          onClose={() => setEditingDocente(null)}
          onSuccess={() => {
            setEditingDocente(null);
            loadDocentes();
          }}
        />
      )}
    </>
  );
});
