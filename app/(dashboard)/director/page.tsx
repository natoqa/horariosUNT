'use client';

import { CalendarDays, Users, BookOpen, Building2, TrendingUp, TrendingDown, Clock, CheckCircle2, AlertTriangle, FileText, Play, CheckCircle, ChevronRight } from 'lucide-react';
import { useAuth } from '@/shared/hooks/use-auth';
import { getDashboardStatsAction, DashboardStats } from './actions/get-dashboard-stats.action';
import { getPeriodosAction, PeriodoDisplay } from './actions/get-periodos.action';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

/* ─── Sparkline SVGs ─── */
function SparklineUp() {
  return (
    <svg width="64" height="32" viewBox="0 0 64 32" fill="none" className="text-success">
      <path d="M2 28 L12 22 L22 24 L32 16 L42 18 L52 8 L62 4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none" />
      <path d="M2 28 L12 22 L22 24 L32 16 L42 18 L52 8 L62 4 L62 32 L2 32 Z" fill="currentColor" opacity="0.1" />
    </svg>
  );
}
function SparklineDown() {
  return (
    <svg width="64" height="32" viewBox="0 0 64 32" fill="none" className="text-destructive">
      <path d="M2 6 L12 10 L22 8 L32 16 L42 20 L52 18 L62 26" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none" />
      <path d="M2 6 L12 10 L22 8 L32 16 L42 20 L52 18 L62 26 L62 32 L2 32 Z" fill="currentColor" opacity="0.1" />
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

function getEstadoColor(estado: string): string {
  switch (estado) {
    case 'Configuración': return 'bg-blue-500/10 text-blue-600';
    case 'Recopilación': return 'bg-yellow-50 text-yellow-700';
    case 'Generación': return 'bg-purple-500/10 text-purple-600';
    case 'Aprobado': return 'bg-green-50 text-green-700';
    case 'Publicado': return 'bg-emerald-500/10 text-emerald-600';
    case 'Cerrado': return 'bg-gray-100 text-muted-foreground';
    default: return 'bg-gray-100 text-muted-foreground';
  }
}

export default function DirectorDashboard() {
  const { user } = useAuth();
  const router = useRouter();
  const firstName = user?.fullName?.split(' ')[0] || user?.email?.split('@')[0] || 'Director';

  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [periodos, setPeriodos] = useState<PeriodoDisplay[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      try {
        const [statsData, periodosData] = await Promise.all([
          getDashboardStatsAction(),
          getPeriodosAction(),
        ]);
        setStats(statsData);
        setPeriodos(periodosData);
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
      {/* Greeting + Quick Actions */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Hola, {firstName} 👋</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Centro de control ejecutivo.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <button onClick={() => router.push('/director/horarios')} className="h-10 px-4 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 transition-all flex items-center gap-2 shadow-sm shadow-primary/20 cursor-pointer">
            <Play className="w-4 h-4" /> Generar Horario
          </button>
          <button onClick={() => router.push('/director/periodos')} className="h-10 px-4 rounded-lg border border-border bg-card text-foreground text-sm font-medium hover:bg-muted transition-all flex items-center gap-2 shadow-sm cursor-pointer">
            <CheckCircle className="w-4 h-4 text-success" /> Aprobar Periodo
          </button>
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-12">
          <p className="text-sm text-muted-foreground">Cargando datos...</p>
        </div>
      ) : (
        <>
          {/* Top Row: Main Content Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-[1fr_340px] gap-6">
            
            {/* Left: Stat Cards */}
            <div className="flex flex-col gap-4">
              
              {/* Card 1 - Periodo Activo con Stepper */}
              <div className="rounded-xl border border-border bg-card p-5 lg:col-span-3 sm:col-span-3 flex flex-col sm:flex-row items-center gap-6 shadow-sm">
                 <div className="min-w-[200px] flex-shrink-0 w-full sm:w-auto text-center sm:text-left">
                    <div className="flex items-center justify-center sm:justify-start gap-2 mb-1">
                      <div className="w-8 h-8 rounded-lg flex items-center justify-center text-primary bg-primary/10">
                        <CalendarDays className="w-4 h-4" />
                      </div>
                      <p className="text-sm font-medium text-muted-foreground">Periodo Activo</p>
                    </div>
                    <p className="text-3xl font-bold text-foreground tracking-tight mt-2">
                      {stats?.periodoNombre || 'Sin periodo'}
                    </p>
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 mt-2 rounded-md text-xs font-medium bg-emerald-500/10 text-emerald-600">
                      <span className="w-1.5 h-1.5 rounded-full bg-current opacity-60" />
                      Activo
                    </span>
                 </div>
                 
                 {/* Stepper visual */}
                 <div className="flex-1 w-full border-t sm:border-t-0 sm:border-l border-border pt-6 sm:pt-0 sm:pl-8">
                    <div className="flex items-center justify-between w-full relative">
                      {/* Progress Line */}
                      <div className="absolute left-4 right-4 top-1/2 -translate-y-1/2 h-1 bg-muted rounded-full overflow-hidden">
                         <div className="h-full bg-primary transition-all duration-1000" style={{ width: '50%' }}></div>
                      </div>
                      {/* Step 1 */}
                      <div className="relative z-10 flex flex-col items-center gap-2">
                        <div className="w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold text-xs ring-4 ring-card">✓</div>
                        <span className="text-[10px] sm:text-xs font-medium text-foreground">Configuración</span>
                      </div>
                      {/* Step 2 */}
                      <div className="relative z-10 flex flex-col items-center gap-2">
                        <div className="w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold text-xs ring-4 ring-card">✓</div>
                        <span className="text-[10px] sm:text-xs font-medium text-foreground">Disponibilidad</span>
                      </div>
                      {/* Step 3 */}
                      <div className="relative z-10 flex flex-col items-center gap-2">
                        <div className="w-8 h-8 rounded-full bg-card border-2 border-primary text-primary flex items-center justify-center font-bold text-xs ring-4 ring-card shadow-sm shadow-primary/20">3</div>
                        <span className="text-[10px] sm:text-xs font-medium text-primary">Generación</span>
                      </div>
                      {/* Step 4 */}
                      <div className="relative z-10 flex flex-col items-center gap-2">
                        <div className="w-8 h-8 rounded-full bg-muted text-muted-foreground flex items-center justify-center font-bold text-xs ring-4 ring-card">4</div>
                        <span className="text-[10px] sm:text-xs font-medium text-muted-foreground">Publicado</span>
                      </div>
                    </div>
                 </div>
              </div>

              {/* Stat Cards 2 & 3 */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Docentes */}
                <div className="rounded-xl border border-border bg-card p-5 shadow-sm group hover:border-primary/30 transition-colors">
                  <div className="flex items-center justify-between mb-1">
                    <p className="text-xs font-medium text-muted-foreground">Docentes Activos</p>
                    <div className="w-8 h-8 rounded-lg flex items-center justify-center text-chart-3 bg-chart-3/10 group-hover:scale-110 transition-transform">
                      <Users className="w-4 h-4" />
                    </div>
                  </div>
                  <p className="text-3xl font-bold text-foreground tracking-tight">{stats?.docentesActivos || 0}</p>
                  <div className="flex items-center justify-between mt-2">
                    <span className="flex items-center gap-1 text-xs font-medium text-success">
                      <TrendingUp className="w-3 h-3" />
                      100% registros
                    </span>
                    <SparklineFlat />
                  </div>
                </div>

                {/* Cursos */}
                <div className="rounded-xl border border-border bg-card p-5 shadow-sm group hover:border-primary/30 transition-colors">
                  <div className="flex items-center justify-between mb-1">
                    <p className="text-xs font-medium text-muted-foreground">Cursos Registrados</p>
                    <div className="w-8 h-8 rounded-lg flex items-center justify-center text-chart-2 bg-chart-2/10 group-hover:scale-110 transition-transform">
                      <BookOpen className="w-4 h-4" />
                    </div>
                  </div>
                  <p className="text-3xl font-bold text-foreground tracking-tight">{stats?.cursosRegistrados || 0}</p>
                  <div className="flex items-center justify-between mt-2">
                    <span className="flex items-center gap-1 text-xs font-medium text-success">
                      <TrendingUp className="w-3 h-3" />
                      Total periodo
                    </span>
                    <SparklineUp />
                  </div>
                </div>
              </div>

            </div>

            {/* Right: Critical Alerts Panel */}
            <div className="rounded-xl border border-destructive/30 bg-destructive/[0.02] flex flex-col shadow-sm">
              <div className="px-5 py-4 border-b border-destructive/10 flex items-center justify-between bg-destructive/[0.03]">
                <h2 className="text-sm font-bold text-destructive flex items-center gap-2">
                   <AlertTriangle className="w-4.5 h-4.5" /> Estado de Salud
                </h2>
              </div>
              <div className="p-5 flex flex-col gap-3.5 flex-1">
                 {/* Alerta 1 */}
                 <div className="p-3.5 rounded-lg bg-card/80 border border-border shadow-sm flex items-start gap-3.5 hover:bg-card transition-colors cursor-pointer group">
                    <div className="mt-0.5 p-2 rounded-md bg-warning/10 text-warning group-hover:scale-110 transition-transform">
                       <Users className="w-4 h-4" />
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-foreground">3 docentes incompletos</p>
                      <p className="text-[11px] text-muted-foreground mt-0.5">Faltan horas lectivas por asignar en su carga.</p>
                    </div>
                 </div>
                 {/* Alerta 2 */}
                 <div className="p-3.5 rounded-lg bg-card/80 border border-border shadow-sm flex items-start gap-3.5 hover:bg-card transition-colors cursor-pointer group">
                    <div className="mt-0.5 p-2 rounded-md bg-destructive/10 text-destructive group-hover:scale-110 transition-transform">
                       <BookOpen className="w-4 h-4" />
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-foreground">2 cursos sin profesor</p>
                      <p className="text-[11px] text-muted-foreground mt-0.5">Sistemas Operativos, Inteligencia Artificial.</p>
                    </div>
                 </div>
                 {/* Alerta 3 */}
                 <div className="p-3.5 rounded-lg bg-card/80 border border-border shadow-sm flex items-start gap-3.5 hover:bg-card transition-colors cursor-pointer group">
                    <div className="mt-0.5 p-2 rounded-md bg-chart-3/10 text-chart-3 group-hover:scale-110 transition-transform">
                       <CalendarDays className="w-4 h-4" />
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-foreground">Disp. al 85%</p>
                      <p className="text-[11px] text-muted-foreground mt-0.5">Faltan 4 docentes por llenar su horario.</p>
                    </div>
                 </div>
              </div>
              <div className="p-4 border-t border-destructive/10 mt-auto bg-card/50 rounded-b-xl">
                 <button onClick={() => router.push('/director/horarios')} className="w-full h-9 rounded-md bg-card border border-border text-xs font-medium hover:bg-muted text-foreground transition-colors flex items-center justify-center gap-2 cursor-pointer shadow-sm">
                    Revisar todos los conflictos <ChevronRight className="w-3.5 h-3.5 opacity-50" />
                 </button>
              </div>
            </div>
          </div>

          {/* Table: Resumen de Periodos */}
          <div className="rounded-xl border border-border bg-card overflow-hidden shadow-sm">
            <div className="px-6 py-5 border-b border-border flex items-center justify-between">
              <h2 className="text-sm font-semibold text-foreground">Historial de Periodos</h2>
              <div className="flex items-center gap-2">
                <button className="h-8 px-3 rounded-md border border-border text-xs font-medium text-muted-foreground hover:bg-muted transition-colors flex items-center gap-1.5 cursor-pointer">
                  Filtrar
                </button>
              </div>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border bg-muted/30">
                    <th className="h-11 px-6 text-left text-xs font-medium text-muted-foreground uppercase tracking-wide">Periodo ID</th>
                    <th className="h-11 px-6 text-left text-xs font-medium text-muted-foreground uppercase tracking-wide">Nombre</th>
                    <th className="h-11 px-6 text-left text-xs font-medium text-muted-foreground uppercase tracking-wide">Estado</th>
                    <th className="h-11 px-6 text-left text-xs font-medium text-muted-foreground uppercase tracking-wide">Tipo</th>
                    <th className="h-11 px-6 text-left text-xs font-medium text-muted-foreground uppercase tracking-wide">Fecha Inicio</th>
                  </tr>
                </thead>
                <tbody>
                  {periodos.length > 0 ? (
                    periodos.map((p) => (
                      <tr key={p.id} className="border-b border-border last:border-0 hover:bg-muted/30 transition-colors group">
                        <td className="px-6 py-4">
                          <span className="font-medium text-foreground group-hover:text-primary transition-colors cursor-pointer">{p.id.slice(0, 8)}...</span>
                        </td>
                        <td className="px-6 py-4 text-muted-foreground">{p.name}</td>
                        <td className="px-6 py-4">
                          <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium ${getEstadoColor(p.state)}`}>
                            <span className="w-1.5 h-1.5 rounded-full bg-current opacity-60" />
                            {p.state}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-muted-foreground">{p.tipoCiclo}</td>
                        <td className="px-6 py-4 text-muted-foreground">{new Date(p.startDate).toLocaleDateString('es-PE')}</td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={5} className="px-6 py-12 text-center text-muted-foreground">
                        No hay periodos registrados
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
