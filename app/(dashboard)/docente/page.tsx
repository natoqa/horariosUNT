'use client';

import { Clock, CalendarDays, BookOpen, TrendingUp, CheckCircle2, Bell, FileText } from 'lucide-react';
import { useAuth } from '@/shared/hooks/use-auth';
import { getDocenteDashboardStatsAction, DocenteDashboardStats } from './actions/get-dashboard-stats.action';
import { useEffect, useState } from 'react';

/* ─── Sparkline ─── */
function SparklineUp() {
  return (
    <svg width="64" height="32" viewBox="0 0 64 32" fill="none" className="text-success">
      <path d="M2 28 L12 22 L22 24 L32 16 L42 18 L52 8 L62 4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none" />
      <path d="M2 28 L12 22 L22 24 L32 16 L42 18 L52 8 L62 4 L62 32 L2 32 Z" fill="currentColor" opacity="0.1" />
    </svg>
  );
}

/* ─── Schedule Grid (decorative) ─── */
const dias = ['Lun', 'Mar', 'Mié', 'Jue', 'Vie'];
const bloques = ['07:00 - 08:30', '08:40 - 10:10', '10:20 - 11:50', '14:00 - 15:30', '15:40 - 17:10'];
const scheduleData: Record<string, Record<string, string>> = {};

const courseColors: Record<string, string> = {};

/* ─── Updates ─── */
const updates: any[] = [];

export default function DocenteDashboard() {
  const { user } = useAuth();
  const firstName = user?.fullName?.split(' ')[0] || user?.email?.split('@')[0] || 'Docente';

  const [stats, setStats] = useState<DocenteDashboardStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      try {
        const statsData = await getDocenteDashboardStatsAction();
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
            Resumen de tu actividad y horarios asignados.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <select className="h-9 px-3 rounded-lg border border-border bg-card text-sm text-foreground font-medium cursor-pointer hover:bg-muted/50 transition-colors">
            <option>Este semestre</option>
            <option>Semestre anterior</option>
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
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Card 1 - Sesiones */}
              <div className="rounded-xl border border-border bg-card p-5">
                <div className="flex items-center justify-between mb-1">
                  <p className="text-xs font-medium text-muted-foreground">Sesiones Asignadas</p>
                  <div className="w-7 h-7 rounded-lg flex items-center justify-center text-chart-2 bg-chart-2/10">
                    <Clock className="w-3.5 h-3.5" />
                  </div>
                </div>
                <p className="text-3xl font-bold text-foreground tracking-tight">{stats?.sesionesAsignadas || 0}</p>
                <div className="flex items-center justify-between mt-2">
                  <span className="flex items-center gap-1 text-xs font-medium text-success">
                    <TrendingUp className="w-3 h-3" />
                    Total
                  </span>
                  <SparklineUp />
                </div>
              </div>

              {/* Card 2 - Horario */}
              <div className="rounded-xl border border-border bg-card p-5">
                <div className="flex items-center justify-between mb-1">
                  <p className="text-xs font-medium text-muted-foreground">Mi Horario</p>
                  <div className="w-7 h-7 rounded-lg flex items-center justify-center text-primary bg-primary/10">
                    <CalendarDays className="w-3.5 h-3.5" />
                  </div>
                </div>
                <p className="text-3xl font-bold text-foreground tracking-tight">{stats?.sesionesAsignadas || 0}</p>
                <div className="flex items-center justify-between mt-2">
                  <span className="flex items-center gap-1 text-xs font-medium text-success">
                    <TrendingUp className="w-3 h-3" />
                    Sesiones semanales
                  </span>
                  <SparklineUp />
                </div>
              </div>
            </div>

        {/* Right: Updates */}
        <div className="rounded-xl border border-border bg-card overflow-hidden row-span-2">
          <div className="px-5 py-4 border-b border-border">
            <h2 className="text-sm font-semibold text-foreground">Notificaciones</h2>
          </div>
          {updates.length === 0 ? (
            <div className="px-5 py-8 text-center">
              <Bell className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
              <p className="text-sm text-muted-foreground">No hay notificaciones recientes</p>
            </div>
          ) : (
            <>
              <div className="flex gap-1 px-5 pt-3">
                <button className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-foreground text-white">Hoy</button>
                <button className="px-3 py-1.5 rounded-lg text-xs font-medium text-muted-foreground hover:bg-muted transition-colors">Ayer</button>
                <button className="px-3 py-1.5 rounded-lg text-xs font-medium text-muted-foreground hover:bg-muted transition-colors">Esta semana</button>
              </div>
              <p className="px-5 pt-3 text-xs text-muted-foreground font-medium">{updates.length} nuevas notificaciones</p>
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

        {/* Mi Horario Visual */}
        <div className="rounded-xl border border-border bg-card p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-semibold text-foreground">Mi Horario Semanal</h2>
            <div className="flex items-center gap-3">
              {Object.entries(courseColors).map(([name, cls]) => (
                <div key={name} className="flex items-center gap-1.5">
                  <div className={`w-2.5 h-2.5 rounded-sm ${cls.split(' ')[0]}`} />
                  <span className="text-[10px] text-muted-foreground font-medium">{name}</span>
                </div>
              ))}
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr>
                  <th className="h-8 px-3 text-left text-[10px] font-medium text-muted-foreground uppercase tracking-wide w-28">Bloque</th>
                  {dias.map(d => (
                    <th key={d} className="h-8 px-2 text-center text-[10px] font-medium text-muted-foreground uppercase tracking-wide">{d}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {bloques.map(bloque => (
                  <tr key={bloque} className="border-t border-border/50">
                    <td className="px-3 py-2 text-[11px] text-muted-foreground font-medium whitespace-nowrap">{bloque}</td>
                    {dias.map(dia => {
                      const curso = scheduleData[dia]?.[bloque];
                      return (
                        <td key={dia} className="px-1 py-1.5 text-center">
                          {curso ? (
                            <div className={`px-2 py-2 rounded-md text-[10px] font-semibold border ${courseColors[curso] || 'bg-muted text-foreground'}`}>
                              {curso}
                            </div>
                          ) : (
                            <div className="px-2 py-2 rounded-md text-[10px] text-muted-foreground/30">—</div>
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
      </div>

      {/* Mis Cursos */}
      <div className="rounded-xl border border-border bg-card overflow-hidden">
        <div className="px-6 py-4 border-b border-border">
          <h2 className="text-sm font-semibold text-foreground">Mis Cursos Asignados</h2>
        </div>
        <div className="overflow-x-auto">
          <div className="px-6 py-8 text-center">
            <BookOpen className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
            <p className="text-sm text-muted-foreground">No hay cursos asignados</p>
          </div>
        </div>
      </div>
        </>
      )}
    </div>
  );
}
