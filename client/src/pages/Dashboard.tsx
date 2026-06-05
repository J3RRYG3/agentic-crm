import { useState, useEffect } from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  PieChart,
  Pie,
  Cell,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import {
  DollarSign,
  TrendingUp,
  TicketCheck,
  Megaphone,
  Users,
  RefreshCw,
} from 'lucide-react';
import { dashboardApi } from '../services/api';
import type { DashboardMetrics } from '../types';

const TICKET_STATUS_COLORS: Record<string, string> = {
  Abierto: '#ef4444',
  'En Progreso': '#f59e0b',
  Resuelto: '#22c55e',
};

const STAGE_COLORS: Record<string, string> = {
  Prospecto: '#94a3b8',
  Calificado: '#60a5fa',
  Propuesta: '#a78bfa',
  Negociación: '#fb923c',
  Ganado: '#4ade80',
  Perdido: '#f87171',
};

interface KpiCardProps {
  title: string;
  value: string;
  subtitle: string;
  icon: React.ReactNode;
  color: string;
}

function KpiCard({ title, value, subtitle, icon, color }: KpiCardProps) {
  return (
    <div className="card p-5">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">{title}</p>
          <p className="mt-2 text-3xl font-bold text-gray-900">{value}</p>
          <p className="mt-1 text-sm text-gray-500">{subtitle}</p>
        </div>
        <div className={`p-3 rounded-xl ${color}`}>{icon}</div>
      </div>
    </div>
  );
}

export default function Dashboard() {
  const [metrics, setMetrics] = useState<DashboardMetrics | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await dashboardApi.getMetrics();
      setMetrics(data);
    } catch {
      setError('Error al cargar las métricas. Asegúrate de que el servidor está corriendo.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void load();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <div className="w-10 h-10 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
          <p className="text-gray-500 text-sm">Cargando métricas...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center max-w-sm">
          <p className="text-red-600 font-medium mb-3">{error}</p>
          <button className="btn-primary" onClick={() => void load()}>
            <RefreshCw size={15} /> Reintentar
          </button>
        </div>
      </div>
    );
  }

  if (!metrics) return null;

  const totalTickets = metrics.openTickets + metrics.inProgressTickets + metrics.resolvedTickets;

  const ticketPieData = metrics.ticketsByStatus.map((item) => ({
    name: item.status,
    value: item.count,
  }));

  const pipelineBarData = metrics.pipelineByStage.map((item) => ({
    stage: item.stage,
    valor: item.totalValue,
    cantidad: item.count,
  }));

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-sm text-gray-500 mt-0.5">Métricas consolidadas en tiempo real</p>
        </div>
        <button className="btn-secondary" onClick={() => void load()}>
          <RefreshCw size={15} />
          Actualizar
        </button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-5 gap-4">
        <KpiCard
          title="Valor Pipeline"
          value={`$${metrics.totalPipelineValue.toLocaleString('es-ES')}`}
          subtitle={`${metrics.totalOpportunities} oportunidades activas`}
          icon={<DollarSign size={22} className="text-blue-600" />}
          color="bg-blue-50"
        />
        <KpiCard
          title="Tasa Conversión"
          value={`${metrics.conversionRate}%`}
          subtitle={`${metrics.wonOpportunities} de ${metrics.totalOpportunities} ganadas`}
          icon={<TrendingUp size={22} className="text-green-600" />}
          color="bg-green-50"
        />
        <KpiCard
          title="Tickets Abiertos"
          value={String(metrics.openTickets)}
          subtitle={`${metrics.inProgressTickets} en progreso · ${metrics.resolvedTickets} resueltos`}
          icon={<TicketCheck size={22} className="text-orange-600" />}
          color="bg-orange-50"
        />
        <KpiCard
          title="Campañas Enviadas"
          value={String(metrics.sentCampaigns)}
          subtitle="Campañas ejecutadas con éxito"
          icon={<Megaphone size={22} className="text-purple-600" />}
          color="bg-purple-50"
        />
        <KpiCard
          title="Total Contactos"
          value={String(metrics.totalContacts)}
          subtitle="Contactos en la base de datos"
          icon={<Users size={22} className="text-indigo-600" />}
          color="bg-indigo-50"
        />
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* Pipeline Bar Chart */}
        <div className="card p-5 xl:col-span-2">
          <h2 className="text-base font-semibold text-gray-900 mb-4">
            Valor del Pipeline por Etapa
          </h2>
          {pipelineBarData.length === 0 ? (
            <div className="flex items-center justify-center h-48 text-gray-400 text-sm">
              Sin datos de pipeline
            </div>
          ) : (
            <ResponsiveContainer width="100%" height={260}>
              <BarChart data={pipelineBarData} margin={{ top: 5, right: 10, left: 10, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis
                  dataKey="stage"
                  tick={{ fontSize: 11, fill: '#6b7280' }}
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis
                  tick={{ fontSize: 11, fill: '#6b7280' }}
                  axisLine={false}
                  tickLine={false}
                  tickFormatter={(v: number) => `$${(v / 1000).toFixed(0)}k`}
                />
                <Tooltip
                  formatter={(value: number) => [`$${value.toLocaleString('es-ES')}`, 'Valor']}
                  contentStyle={{
                    borderRadius: '8px',
                    border: '1px solid #e5e7eb',
                    fontSize: '12px',
                  }}
                />
                <Bar dataKey="valor" radius={[4, 4, 0, 0]}>
                  {pipelineBarData.map((entry) => (
                    <Cell
                      key={entry.stage}
                      fill={STAGE_COLORS[entry.stage] ?? '#94a3b8'}
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>

        {/* Tickets Pie Chart */}
        <div className="card p-5">
          <h2 className="text-base font-semibold text-gray-900 mb-4">
            Estado de Tickets
          </h2>
          {totalTickets === 0 ? (
            <div className="flex items-center justify-center h-48 text-gray-400 text-sm">
              Sin tickets registrados
            </div>
          ) : (
            <>
              <ResponsiveContainer width="100%" height={200}>
                <PieChart>
                  <Pie
                    data={ticketPieData}
                    cx="50%"
                    cy="50%"
                    innerRadius={55}
                    outerRadius={85}
                    paddingAngle={3}
                    dataKey="value"
                  >
                    {ticketPieData.map((entry) => (
                      <Cell
                        key={entry.name}
                        fill={TICKET_STATUS_COLORS[entry.name] ?? '#94a3b8'}
                      />
                    ))}
                  </Pie>
                  <Tooltip
                    formatter={(value: number) => [value, 'Tickets']}
                    contentStyle={{
                      borderRadius: '8px',
                      border: '1px solid #e5e7eb',
                      fontSize: '12px',
                    }}
                  />
                  <Legend
                    iconType="circle"
                    iconSize={8}
                    formatter={(value: string) => (
                      <span style={{ fontSize: '11px', color: '#374151' }}>{value}</span>
                    )}
                  />
                </PieChart>
              </ResponsiveContainer>
              <div className="mt-3 space-y-2">
                {metrics.ticketsByStatus.map((item) => (
                  <div key={item.status} className="flex items-center justify-between text-sm">
                    <span className="text-gray-600">{item.status}</span>
                    <div className="flex items-center gap-2">
                      <div
                        className="w-2 h-2 rounded-full"
                        style={{
                          backgroundColor: TICKET_STATUS_COLORS[item.status] ?? '#94a3b8',
                        }}
                      />
                      <span className="font-semibold text-gray-900">{item.count}</span>
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      </div>

      {/* Ticket Priority */}
      {metrics.ticketsByPriority.length > 0 && (
        <div className="card p-5">
          <h2 className="text-base font-semibold text-gray-900 mb-4">Tickets por Prioridad</h2>
          <div className="flex gap-6">
            {metrics.ticketsByPriority.map((item) => {
              const pct = totalTickets > 0 ? Math.round((item.count / totalTickets) * 100) : 0;
              const colors: Record<string, string> = {
                Alta: 'bg-red-500',
                Media: 'bg-yellow-500',
                Baja: 'bg-green-500',
              };
              return (
                <div key={item.priority} className="flex-1">
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-gray-600">{item.priority}</span>
                    <span className="font-medium text-gray-900">
                      {item.count} ({pct}%)
                    </span>
                  </div>
                  <div className="h-2 bg-gray-100 rounded-full">
                    <div
                      className={`h-2 rounded-full ${colors[item.priority] ?? 'bg-gray-400'}`}
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
