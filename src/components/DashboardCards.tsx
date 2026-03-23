import { ComputedOrder } from '../types';
import { Package, MapPin, TrendingUp, AlertCircle, AlertTriangle, RotateCcw } from 'lucide-react';
import { ReactNode } from 'react';

interface DashboardCardsProps {
  data: ComputedOrder[];
  activeCategory: string;
}

export function DashboardCards({ data, activeCategory }: DashboardCardsProps) {
  const isReturn = activeCategory === 'Devolução de Hastes';
  // 1. Total de Hastes Pendentes (Geral)
  const totalPendentes = data.reduce((acc, order) => acc + order.qtdPendente, 0);

  // 2. Pendências por Sistema (Norte vs Sul)
  const pendentesNorte = data
    .filter((o) => o.sistema === 'Norte')
    .reduce((acc, o) => acc + o.qtdPendente, 0);
  const pendentesSul = data
    .filter((o) => o.sistema === 'Sul')
    .reduce((acc, o) => acc + o.qtdPendente, 0);

  // 3. Sondas com mais PEDIDOS (Volume de registros)
  const sondasVolume = data
    .filter(order => !order.categoria.startsWith('Revestimentos'))
    .reduce((acc, order) => {
      const sondaName = order.sonda || 'Não identificada';
      acc[sondaName] = (acc[sondaName] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
  const topSonda = Object.entries(sondasVolume)
    .sort((a, b) => b[1] - a[1])[0];

  // 3b. Sondas com mais PENDÊNCIA (Volume físico pendente) - específico para Devolução
  const pendingBySonda = data.reduce((acc, order) => {
    const s = order.tag || order.sonda || 'Não identificada';
    acc[s] = (acc[s] || 0) + order.qtdPendente;
    return acc;
  }, {} as Record<string, number>);
  
  const topPendingSonda = Object.entries(pendingBySonda)
    .sort((a, b) => b[1] - a[1])[0];

  // 3c. Contagem de pedidos com pendência real
  const pedidosPendentesCount = data.filter(o => o.qtdPendente > 0).length;

  // 4. Taxa de atendimento (%)
  const totalSolicitado = data.reduce((acc, order) => acc + order.qtdSolicitada, 0);
  const totalAtendido = data.reduce((acc, order) => acc + order.qtdAtendida, 0);
  const taxaAtendimento = totalSolicitado > 0 ? ((totalAtendido / totalSolicitado) * 100).toFixed(1) : '0.0';

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
      <Card
        title={isReturn ? "Retorno Pendente" : "Total Pendente"}
        value={totalPendentes.toLocaleString()}
        icon={<Package className="w-5 h-5 text-amber-600" />}
        subtitle={isReturn ? "Hastes aguardando devolução" : "Hastes aguardando envio"}
        color="border-amber-200 bg-amber-50 dark:border-amber-900/50 dark:bg-amber-950/20"
      />
      {!isReturn && (
        <Card
          title="Pendências por Sistema"
          value={
            <div className="flex flex-col gap-1.5 text-lg mt-1">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-blue-500 shrink-0 shadow-sm"></span>
                <span>{pendentesNorte.toLocaleString()} Norte</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-indigo-500 shrink-0 shadow-sm"></span>
                <span>{pendentesSul.toLocaleString()} Sul</span>
              </div>
            </div>
          }
          icon={<MapPin className="w-5 h-5 text-blue-600" />}
          subtitle="Distribuição regional"
          color="border-blue-200 bg-blue-50 dark:border-blue-900/50 dark:bg-blue-950/20"
        />
      )}
      <Card
        title={isReturn ? "Pedidos Pendentes" : "Top Sonda (Pedidos)"}
        value={isReturn ? pedidosPendentesCount.toLocaleString() : (topSonda ? topSonda[0] : '-')}
        icon={isReturn ? <RotateCcw className="w-5 h-5 text-indigo-600" /> : <TrendingUp className="w-5 h-5 text-indigo-600" />}
        subtitle={isReturn 
          ? "Pedidos aguardando retorno parcial/total"
          : (topSonda ? `${topSonda[1]} pedidos registrados` : 'Sem pedidos')
        }
        color="border-indigo-200 bg-indigo-50 dark:border-indigo-900/50 dark:bg-indigo-950/20"
      />
      <Card
        title={isReturn ? "Taxa de Devolução" : "Taxa de Atendimento"}
        value={`${taxaAtendimento}%`}
        icon={<AlertCircle className="w-5 h-5 text-emerald-600" />}
        subtitle={isReturn ? "Volume geral devolvido" : "Volume geral entregue"}
        color="border-emerald-200 bg-emerald-50 dark:border-emerald-900/50 dark:bg-emerald-950/20"
      />
    </div>
  );
}

function Card({ title, value, icon, subtitle, color }: { title: string; value: ReactNode; icon: ReactNode; subtitle: string; color: string }) {
  return (
    <div className={`p-4 rounded-xl border ${color} shadow-sm flex flex-col`}>
      <div className="flex items-center justify-between mb-2">
        <h3 className="text-sm font-medium text-slate-700 dark:text-slate-300">{title}</h3>
        <div className="p-2 bg-white dark:bg-slate-800 rounded-lg shadow-sm">{icon}</div>
      </div>
      <div className="text-2xl font-bold text-slate-900 dark:text-slate-100">{value}</div>
      <div className="text-xs text-slate-500 dark:text-slate-400 mt-1">{subtitle}</div>
    </div>
  );
}
