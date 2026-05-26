'use client';

import { Users, BookOpen, Building2, TrendingUp, TrendingDown, CheckCircle2, AlertTriangle, Clock, FileText } from 'lucide-react';
import { useAuth } from '@/shared/hooks/use-auth';

/* ─── Sparkline SVGs ─── */
function SparklineUp() {
  return (
    <svg width="64" height="32" viewBox="0 0 64 32" fill="none" className="text-success shrink-0 hidden sm:block">
      <path d="M2 28 L12 22 L22 24 L32 16 L42 18 L52 8 L62 4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none" />
      <path d="M2 28 L12 22 L22 24 L32 16 L42 18 L52 8 L62 4 L62 32 L2 32 Z" fill="currentColor" opacity="0.1" />
    </svg>
  );
}
function SparklineFlat() {
  return (
    <svg width="64" height="32" viewBox="0 0 64 32" fill="none" className="text-chart-2 shrink-0 hidden sm:block">
      <path d="M2 20 L12 16 L22 18 L32 12 L42 14 L52 10 L62 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none" />
      <path d="M2 20 L12 16 L22 18 L32 12 L42 14 L52 10 L62 12 L62 32 L2 32 Z" fill="currentColor" opacity="0.08" />
    </svg>
  );
}

/* ─── Updates Feed ─── */
const updates = [
  { icon: CheckCircle2, color: 'text-success', title: 'Curso Registrado', time: '11:20 AM', desc: 'Cálculo I agregado al sistema' },
  { icon: Users, color: 'text-chart-2', title: 'Docente Actualizado', time: '11:15 AM', desc: 'Datos de María López actualizados' },
  { icon: AlertTriangle, color: 'text-warning', title: 'Aula sin Asignar', time: '11:00 AM', desc: 'Lab-301 pendiente de asignación' },
  { icon: FileText, color: 'text-chart-4', title: 'Reporte Generado', time: '10:45 AM', desc: 'Lista de cursos 2026-I' },
  { icon: Clock, color: 'text-primary', title: 'Tarea Pendiente', time: '10:30 AM', desc: 'Revisar grupos del ciclo V' },
];

/* ─── Table Data ─── */
const tareas = [
  { id: '#T-001', tarea: 'Registrar docentes faltantes', prioridad: 'Alta', estado: 'En Progreso', fecha: '2026-05-20', prioridadColor: 'bg-red-50 text-red-700', estadoColor: 'bg-blue-50 text-blue-700' },
  { id: '#T-002', tarea: 'Verificar aulas laboratorio', prioridad: 'Media', estado: 'Pendiente', fecha: '2026-05-21', prioridadColor: 'bg-amber-50 text-amber-700', estadoColor: 'bg-amber-50 text-amber-700' },
  { id: '#T-003', tarea: 'Actualizar plan de estudios', prioridad: 'Baja', estado: 'Completado', fecha: '2026-05-18', prioridadColor: 'bg-emerald-50 text-emerald-700', estadoColor: 'bg-emerald-50 text-emerald-700' },
  { id: '#T-004', tarea: 'Coordinar horarios ciclo X', prioridad: 'Alta', estado: 'En Progreso', fecha: '2026-05-22', prioridadColor: 'bg-red-50 text-red-700', estadoColor: 'bg-blue-50 text-blue-700' },
];

const statCardClass =
  'rounded-xl border border-border bg-white p-4 sm:p-5 shadow-sm transition-all duration-200 hover:shadow-md hover:border-border/80 hover:-translate-y-0.5';

const panelClass =
  'rounded-xl border border-border bg-white overflow-hidden shadow-sm transition-all duration-200 hover:shadow-md hover:border-border/80';

export default function SecretariaDashboard() {
  const { user } = useAuth();
  const firstName = user?.fullName?.split(' ')[0] || user?.email?.split('@')[0] || 'Secretaria';

  return (
    <div className="space-y-5 sm:space-y-6 lg:space-y-8 max-w-[1600px]">
      {/* Greeting */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0">
          <h1 className="text-xl sm:text-2xl lg:text-3xl font-semibold tracking-tight text-foreground">
            Hola, {firstName} 👋
          </h1>
          <p className="text-sm sm:text-base text-muted-foreground mt-1.5 leading-relaxed">
            Panel operativo de la Secretaría Académica.
          </p>
        </div>
        <div className="flex shrink-0 w-full sm:w-auto">
          <select className="h-10 w-full sm:w-auto min-w-[10rem] px-3 rounded-lg border border-border bg-white text-sm text-foreground font-medium cursor-pointer hover:bg-muted/50 transition-colors focus:outline-none focus:ring-2 focus:ring-primary/20">
            <option>Último mes</option>
            <option>Última semana</option>
            <option>Hoy</option>
          </select>
        </div>
      </div>

      {/* Top: Stat Cards + Updates */}
      <div className="grid grid-cols-1 xl:grid-cols-[1fr_min(20rem,100%)] gap-5 sm:gap-6">
        {/* Stat Cards — 1 col móvil, 2 tablet, 3-4 desktop */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-4">
          {/* Card 1 - Docentes */}
          <div className={statCardClass}>
            <div className="flex items-center justify-between gap-2 mb-2">
              <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Docentes</p>
              <div className="w-8 h-8 rounded-lg flex items-center justify-center text-chart-3 bg-chart-3/10 shrink-0">
                <Users className="w-4 h-4" />
              </div>
            </div>
            <p className="text-2xl sm:text-3xl font-bold text-foreground tracking-tight">48</p>
            <div className="flex items-end justify-between gap-2 mt-3">
              <span className="flex items-center gap-1 text-xs font-medium text-success leading-snug">
                <TrendingUp className="w-3.5 h-3.5 shrink-0" />
                +5 esta semana
              </span>
              <SparklineUp />
            </div>
          </div>

          {/* Card 2 - Cursos */}
          <div className={statCardClass}>
            <div className="flex items-center justify-between gap-2 mb-2">
              <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Cursos</p>
              <div className="w-8 h-8 rounded-lg flex items-center justify-center text-chart-2 bg-chart-2/10 shrink-0">
                <BookOpen className="w-4 h-4" />
              </div>
            </div>
            <p className="text-2xl sm:text-3xl font-bold text-foreground tracking-tight">32</p>
            <div className="flex items-end justify-between gap-2 mt-3">
              <span className="flex items-center gap-1 text-xs font-medium text-success leading-snug">
                <TrendingUp className="w-3.5 h-3.5 shrink-0" />
                +2% vs periodo anterior
              </span>
              <SparklineFlat />
            </div>
          </div>

          {/* Card 3 - Aulas */}
          <div className={statCardClass}>
            <div className="flex items-center justify-between gap-2 mb-2">
              <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                Aulas Disponibles
              </p>
              <div className="w-8 h-8 rounded-lg flex items-center justify-center text-chart-4 bg-chart-4/10 shrink-0">
                <Building2 className="w-4 h-4" />
              </div>
            </div>
            <p className="text-2xl sm:text-3xl font-bold text-foreground tracking-tight">18</p>
            <div className="flex items-end justify-between gap-2 mt-3">
              <span className="flex items-center gap-1 text-xs font-medium text-destructive leading-snug">
                <TrendingDown className="w-3.5 h-3.5 shrink-0" />
                -1 vs sem. anterior
              </span>
              <SparklineUp />
            </div>
          </div>
        </div>

        {/* Updates */}
        <div className={`${panelClass} xl:row-span-2`}>
          <div className="px-4 sm:px-5 py-3.5 sm:py-4 border-b border-border">
            <h2 className="text-sm sm:text-base font-semibold text-foreground">Últimas Actualizaciones</h2>
          </div>
          <div className="flex flex-wrap gap-1.5 px-4 sm:px-5 pt-3">
            <button className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-foreground text-white">Hoy</button>
            <button className="px-3 py-1.5 rounded-lg text-xs font-medium text-muted-foreground hover:bg-muted transition-colors">
              Ayer
            </button>
            <button className="px-3 py-1.5 rounded-lg text-xs font-medium text-muted-foreground hover:bg-muted transition-colors">
              Esta semana
            </button>
          </div>
          <p className="px-4 sm:px-5 pt-3 text-xs text-muted-foreground font-medium">
            {updates.length} nuevas actividades hoy
          </p>
          <div className="px-4 sm:px-5 pt-2 pb-4 space-y-0.5 max-h-[min(28rem,50vh)] overflow-y-auto">
            {updates.map((u, i) => {
              const Icon = u.icon;
              return (
                <div
                  key={i}
                  className="flex items-start gap-3 p-2.5 rounded-lg hover:bg-muted/40 transition-colors cursor-default"
                >
                  <div
                    className={`w-9 h-9 rounded-full flex items-center justify-center shrink-0 bg-muted ${u.color}`}
                  >
                    <Icon className="w-4 h-4" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <p className="text-xs font-semibold text-foreground leading-tight">{u.title}</p>
                      <span className="text-[10px] text-muted-foreground shrink-0 tabular-nums">{u.time}</span>
                    </div>
                    <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2">{u.desc}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Estado del Sistema */}
        <div className={`${panelClass} p-4 sm:p-5 lg:p-6 xl:col-span-1`}>
          <h2 className="text-sm sm:text-base font-semibold text-foreground mb-4 sm:mb-5">
            Estado del Sistema
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
            <div className="text-center p-4 rounded-lg bg-muted/30 transition-colors hover:bg-muted/50">
              <p className="text-xl sm:text-2xl font-bold text-foreground">92%</p>
              <p className="text-xs text-muted-foreground mt-1">Datos completos</p>
            </div>
            <div className="text-center p-4 rounded-lg bg-muted/30 transition-colors hover:bg-muted/50">
              <p className="text-xl sm:text-2xl font-bold text-foreground">3</p>
              <p className="text-xs text-muted-foreground mt-1">Tareas pendientes</p>
            </div>
            <div className="text-center p-4 rounded-lg bg-muted/30 transition-colors hover:bg-muted/50">
              <p className="text-xl sm:text-2xl font-bold text-foreground">12</p>
              <p className="text-xs text-muted-foreground mt-1">Registros hoy</p>
            </div>
          </div>
        </div>
      </div>

      {/* Table: Tareas Pendientes */}
      <div className={panelClass}>
        <div className="px-4 sm:px-6 py-3.5 sm:py-4 border-b border-border flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <h2 className="text-sm sm:text-base font-semibold text-foreground">Tareas Pendientes</h2>
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 w-full sm:w-auto">
            <div className="flex items-center gap-2 h-9 px-3 rounded-lg border border-border bg-white flex-1 sm:flex-initial">
              <svg className="w-3.5 h-3.5 text-muted-foreground shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <span className="text-xs text-muted-foreground">Tarea</span>
            </div>
            <button className="h-9 px-3 rounded-lg border border-border text-xs font-medium text-muted-foreground hover:bg-muted transition-colors flex items-center justify-center gap-1.5">
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
              </svg>
              Filtrar
            </button>
          </div>
        </div>

        {/* Móvil: cards */}
        <div className="md:hidden divide-y divide-border">
          {tareas.map((t) => (
            <div key={t.id} className="p-4 space-y-3 hover:bg-muted/20 transition-colors">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="font-semibold text-foreground">{t.id}</p>
                  <p className="text-sm text-muted-foreground mt-0.5">{t.tarea}</p>
                </div>
                <span
                  className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md text-xs font-medium shrink-0 ${t.prioridadColor}`}
                >
                  <span className="w-1.5 h-1.5 rounded-full bg-current opacity-60" />
                  {t.prioridad}
                </span>
              </div>
              <dl className="grid grid-cols-2 gap-x-4 gap-y-2 text-xs">
                <div>
                  <dt className="text-muted-foreground font-medium">Estado</dt>
                  <dd className="mt-0.5">
                    <span
                      className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md text-xs font-medium ${t.estadoColor}`}
                    >
                      {t.estado}
                    </span>
                  </dd>
                </div>
                <div>
                  <dt className="text-muted-foreground font-medium">Fecha</dt>
                  <dd className="mt-0.5 text-foreground tabular-nums">{t.fecha}</dd>
                </div>
              </dl>
            </div>
          ))}
        </div>

        {/* Desktop: tabla con scroll horizontal */}
        <div className="hidden md:block overflow-x-auto overscroll-x-contain">
          <table className="w-full min-w-[36rem] text-sm">
            <thead>
              <tr className="border-b border-border bg-muted/30">
                <th className="h-11 px-4 lg:px-6 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                  ID
                </th>
                <th className="h-11 px-4 lg:px-6 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                  Tarea
                </th>
                <th className="h-11 px-4 lg:px-6 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                  Prioridad
                </th>
                <th className="h-11 px-4 lg:px-6 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                  Estado
                </th>
                <th className="h-11 px-4 lg:px-6 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                  Fecha
                </th>
              </tr>
            </thead>
            <tbody>
              {tareas.map((t) => (
                <tr
                  key={t.id}
                  className="border-b border-border last:border-0 hover:bg-muted/20 transition-colors"
                >
                  <td className="px-4 lg:px-6 py-3.5 font-medium text-foreground">{t.id}</td>
                  <td className="px-4 lg:px-6 py-3.5 text-muted-foreground">{t.tarea}</td>
                  <td className="px-4 lg:px-6 py-3.5">
                    <span
                      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium ${t.prioridadColor}`}
                    >
                      <span className="w-1.5 h-1.5 rounded-full bg-current opacity-60" />
                      {t.prioridad}
                    </span>
                  </td>
                  <td className="px-4 lg:px-6 py-3.5">
                    <span
                      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium ${t.estadoColor}`}
                    >
                      {t.estado}
                    </span>
                  </td>
                  <td className="px-4 lg:px-6 py-3.5 text-muted-foreground tabular-nums">{t.fecha}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="md:hidden px-4 py-2 text-[10px] text-muted-foreground text-center border-t border-border/50">
          Vista en tarjetas optimizada para móvil
        </p>
      </div>
    </div>
  );
}
