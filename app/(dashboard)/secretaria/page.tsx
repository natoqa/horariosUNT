'use client';

import { Users, BookOpen, Building2, TrendingUp, TrendingDown, CheckCircle2, AlertTriangle, Clock, FileText } from 'lucide-react';
import { useAuth } from '@/shared/hooks/use-auth';
import { getSecretariaDashboardStatsAction, SecretariaDashboardStats } from './actions/get-dashboard-stats.action';
import { useEffect, useState } from 'react';

/* ─── Sparkline SVGs ─── */
function SparklineUp() {
  return (
    <svg width="64" height="32" viewBox="0 0 64 32" fill="none" className="text-success">
      <path d="M2 28 L12 22 L22 24 L32 16 L42 18 L52 8 L62 4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none" />
      <path d="M2 28 L12 22 L22 24 L32 16 L42 18 L52 8 L62 4 L62 32 L2 32 Z" fill="currentColor" opacity="0.1" />
    </svg>
  );
}
function SparklineFlat() {
  return (
    <svg width="64" height="32" viewBox="0 0 64 32" fill="none" className="text-chart-2">
      <path d="M2 20 L12 16 L22 18 L32 12 L42 14 L52 10 L62 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none" />
      <path d="M2 20 L12 16 L22 18 L32 12 L42 14 L52 10 L62 12 L62 32 L2 32 Z" fill="currentColor" opacity="0.08" />
    </svg>
  );
}

/* ─── Updates Feed ─── */
const updates: any[] = [];

/* ─── Table Data ─── */
const tareas: any[] = [];

export default function SecretariaDashboard() {
  const { user } = useAuth();
  const firstName = user?.fullName?.split(' ')[0] || user?.email?.split('@')[0] || 'Secretaria';

  const [stats, setStats] = useState<SecretariaDashboardStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      try {
        const statsData = await getSecretariaDashboardStatsAction();
        setStats(statsData);
      } catch (error) {
        console.error('Error loading dashboard data:', error);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  return (
    <div className="space-y-6">
      {/* Greeting */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Hola, {firstName} 👋</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Panel operativo de la Secretaría Académica.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <select className="h-9 px-3 rounded-lg border border-border bg-white text-sm text-foreground font-medium cursor-pointer hover:bg-muted/50 transition-colors">
            <option>Último mes</option>
            <option>Última semana</option>
            <option>Hoy</option>
          </select>
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-12">
          <p className="text-sm text-muted-foreground">Cargando datos...</p>
        </div>
      ) : (
        <>
          {/* Top: Stat Cards + Updates */}
          <div className="grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-6">
            {/* Left: Stat Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {/* Card 1 - Docentes */}
              <div className="rounded-xl border border-border bg-white p-5">
                <div className="flex items-center justify-between mb-1">
                  <p className="text-xs font-medium text-muted-foreground">Docentes</p>
                  <div className="w-7 h-7 rounded-lg flex items-center justify-center text-chart-3 bg-chart-3/10">
                    <Users className="w-3.5 h-3.5" />
                  </div>
                </div>
                <p className="text-3xl font-bold text-foreground tracking-tight">{stats?.docentesActivos || 0}</p>
                <div className="flex items-center justify-between mt-2">
                  <span className="flex items-center gap-1 text-xs font-medium text-success">
                    <TrendingUp className="w-3 h-3" />
                    Total
                  </span>
                  <SparklineUp />
                </div>
              </div>

              {/* Card 2 - Cursos */}
              <div className="rounded-xl border border-border bg-white p-5">
                <div className="flex items-center justify-between mb-1">
                  <p className="text-xs font-medium text-muted-foreground">Cursos</p>
                  <div className="w-7 h-7 rounded-lg flex items-center justify-center text-chart-2 bg-chart-2/10">
                    <BookOpen className="w-3.5 h-3.5" />
                  </div>
                </div>
                <p className="text-3xl font-bold text-foreground tracking-tight">{stats?.cursosRegistrados || 0}</p>
                <div className="flex items-center justify-between mt-2">
                  <span className="flex items-center gap-1 text-xs font-medium text-success">
                    <TrendingUp className="w-3 h-3" />
                    Total
                  </span>
                  <SparklineFlat />
                </div>
              </div>

              {/* Card 3 - Aulas */}
              <div className="rounded-xl border border-border bg-white p-5">
                <div className="flex items-center justify-between mb-1">
                  <p className="text-xs font-medium text-muted-foreground">Aulas Disponibles</p>
                  <div className="w-7 h-7 rounded-lg flex items-center justify-center text-chart-4 bg-chart-4/10">
                    <Building2 className="w-3.5 h-3.5" />
                  </div>
                </div>
                <p className="text-3xl font-bold text-foreground tracking-tight">{stats?.aulasDisponibles || 0}</p>
                <div className="flex items-center justify-between mt-2">
                  <span className="flex items-center gap-1 text-xs font-medium text-success">
                    <TrendingUp className="w-3 h-3" />
                    Total
                  </span>
                  <SparklineUp />
                </div>
              </div>
            </div>

        {/* Right: Updates */}
        <div className="rounded-xl border border-border bg-white overflow-hidden row-span-2">
          <div className="px-5 py-4 border-b border-border">
            <h2 className="text-sm font-semibold text-foreground">Últimas Actualizaciones</h2>
          </div>
          {updates.length === 0 ? (
            <div className="px-5 py-8 text-center">
              <Clock className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
              <p className="text-sm text-muted-foreground">No hay actualizaciones recientes</p>
            </div>
          ) : (
            <>
              <div className="flex gap-1 px-5 pt-3">
                <button className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-foreground text-white">Hoy</button>
                <button className="px-3 py-1.5 rounded-lg text-xs font-medium text-muted-foreground hover:bg-muted transition-colors">Ayer</button>
                <button className="px-3 py-1.5 rounded-lg text-xs font-medium text-muted-foreground hover:bg-muted transition-colors">Esta semana</button>
              </div>
              <p className="px-5 pt-3 text-xs text-muted-foreground font-medium">{updates.length} nuevas actividades hoy</p>
              <div className="px-5 pt-2 pb-4 space-y-1">
                {updates.map((u, i) => {
                  const Icon = u.icon;
                  return (
                    <div key={i} className="flex items-start gap-3 p-2.5 rounded-lg hover:bg-muted/40 transition-colors cursor-default">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 bg-muted ${u.color}`}>
                        <Icon className="w-4 h-4" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <p className="text-xs font-semibold text-foreground">{u.title}</p>
                          <span className="text-[10px] text-muted-foreground ml-2 flex-shrink-0">{u.time}</span>
                        </div>
                        <p className="text-[11px] text-muted-foreground mt-0.5 truncate">{u.desc}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </>
          )}
        </div>

        {/* Estado del Sistema */}
        <div className="rounded-xl border border-border bg-white p-6">
          <h2 className="text-sm font-semibold text-foreground mb-4">Estado del Sistema</h2>
          <div className="grid grid-cols-3 gap-4">
            <div className="text-center p-4 rounded-lg bg-muted/30">
              <p className="text-2xl font-bold text-foreground">-</p>
              <p className="text-xs text-muted-foreground mt-1">Datos completos</p>
            </div>
            <div className="text-center p-4 rounded-lg bg-muted/30">
              <p className="text-2xl font-bold text-foreground">-</p>
              <p className="text-xs text-muted-foreground mt-1">Tareas pendientes</p>
            </div>
            <div className="text-center p-4 rounded-lg bg-muted/30">
              <p className="text-2xl font-bold text-foreground">-</p>
              <p className="text-xs text-muted-foreground mt-1">Registros hoy</p>
            </div>
          </div>
        </div>
      </div>

      {/* Table: Tareas Pendientes */}
      <div className="rounded-xl border border-border bg-white overflow-hidden">
        <div className="px-6 py-4 border-b border-border flex items-center justify-between">
          <h2 className="text-sm font-semibold text-foreground">Tareas Pendientes</h2>
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-2 h-8 px-3 rounded-lg border border-border bg-white">
              <svg className="w-3.5 h-3.5 text-muted-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
              <span className="text-xs text-muted-foreground">Tarea</span>
            </div>
            <button className="h-8 px-3 rounded-lg border border-border text-xs font-medium text-muted-foreground hover:bg-muted transition-colors flex items-center gap-1.5">
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" /></svg>
              Filtrar
            </button>
          </div>
        </div>
        <div className="overflow-x-auto">
          {tareas.length === 0 ? (
            <div className="px-6 py-8 text-center">
              <FileText className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
              <p className="text-sm text-muted-foreground">No hay tareas pendientes</p>
            </div>
          ) : (
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border bg-muted/30">
                  <th className="h-10 px-6 text-left text-xs font-medium text-muted-foreground uppercase tracking-wide">ID</th>
                  <th className="h-10 px-6 text-left text-xs font-medium text-muted-foreground uppercase tracking-wide">Tarea</th>
                  <th className="h-10 px-6 text-left text-xs font-medium text-muted-foreground uppercase tracking-wide">Prioridad</th>
                  <th className="h-10 px-6 text-left text-xs font-medium text-muted-foreground uppercase tracking-wide">Estado</th>
                  <th className="h-10 px-6 text-left text-xs font-medium text-muted-foreground uppercase tracking-wide">Fecha</th>
                </tr>
              </thead>
              <tbody>
                {tareas.map((t) => (
                  <tr key={t.id} className="border-b border-border last:border-0 hover:bg-muted/20 transition-colors">
                    <td className="px-6 py-3.5 font-medium text-foreground">{t.id}</td>
                    <td className="px-6 py-3.5 text-muted-foreground">{t.tarea}</td>
                    <td className="px-6 py-3.5">
                      <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium ${t.prioridadColor}`}>
                        <span className="w-1.5 h-1.5 rounded-full bg-current opacity-60" />
                        {t.prioridad}
                      </span>
                    </td>
                    <td className="px-6 py-3.5">
                      <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium ${t.estadoColor}`}>
                        {t.estado}
                      </span>
                    </td>
                    <td className="px-6 py-3.5 text-muted-foreground">{t.fecha}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
        </>
      )}
    </div>
  );
}
