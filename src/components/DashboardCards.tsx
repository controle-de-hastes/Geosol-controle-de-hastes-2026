import { ComputedOrder } from '../types';
import { Package, MapPin, TrendingUp, AlertCircle } from 'lucide-react';
import { ReactNode } from 'react';

interface DashboardCardsProps {
  data: ComputedOrder[];
}

export function DashboardCards({ data }: DashboardCardsProps) {
  // 1. Total de Hastes Pendentes (Geral)
  const totalPendentes = data.reduce((acc, order) => acc + order.qtdPendente, 0);

  // 2. Pendências por Sistema (Norte vs Sul)
  const pendentesNorte = data
    .filter((o) => o.sistema === 'Norte')
    .reduce((acc, o) => acc + o.qtdPendente, 0);
  const pendentesSul = data
    .filter((o) => o.sistema === 'Sul')
    .reduce((acc, o) => acc + o.qtdPendente, 0);

  // 3. Sondas com maior volume de pedidos
  const sondasVolume = data.reduce((acc, order) => {
    acc[order.sonda] = (acc[order.sonda] || 0) + order.qtdSolicitada;
    return acc;
  }, {} as Record<string, number>);
  const topSonda = Object.entries(sondasVolume).sort((a, b) => b[1] - a[1])[0];

  // 4. Taxa de atendimento (%)
  const totalSolicitado = data.reduce((acc, order) => acc + order.qtdSolicitada, 0);
  const totalAtendido = data.reduce((acc, order) => acc + order.qtdAtendida, 0);
  const taxaAtendimento = totalSolicitado > 0 ? ((totalAtendido / totalSolicitado) * 100).toFixed(1) : '0.0';

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
      <Card
        title="Total Pendente"
        value={totalPendentes.toLocaleString()}
        icon={<Package className="w-5 h-5 text-amber-600" />}
        subtitle="Hastes aguardando envio"
        color="border-amber-200 bg-amber-50"
      />
      <Card
        title="Pendências por Sistema"
        value={`${pendentesNorte} N / ${pendentesSul} S`}
        icon={<MapPin className="w-5 h-5 text-blue-600" />}
        subtitle="Distribuição regional"
        color="border-blue-200 bg-blue-50"
      />
      <Card
        title="Top Sonda (Volume)"
        value={topSonda ? topSonda[0] : '-'}
        icon={<TrendingUp className="w-5 h-5 text-indigo-600" />}
        subtitle={topSonda ? `${topSonda[1]} hastes solicitadas` : ''}
        color="border-indigo-200 bg-indigo-50"
      />
      <Card
        title="Taxa de Atendimento"
        value={`${taxaAtendimento}%`}
        icon={<AlertCircle className="w-5 h-5 text-emerald-600" />}
        subtitle="Volume geral entregue"
        color="border-emerald-200 bg-emerald-50"
      />
    </div>
  );
}

function Card({ title, value, icon, subtitle, color }: { title: string; value: string | number; icon: ReactNode; subtitle: string; color: string }) {
  return (
    <div className={`p-4 rounded-xl border ${color} shadow-sm flex flex-col`}>
      <div className="flex items-center justify-between mb-2">
        <h3 className="text-sm font-medium text-slate-700">{title}</h3>
        <div className="p-2 bg-white rounded-lg shadow-sm">{icon}</div>
      </div>
      <div className="text-2xl font-bold text-slate-900">{value}</div>
      <div className="text-xs text-slate-500 mt-1">{subtitle}</div>
    </div>
  );
}
