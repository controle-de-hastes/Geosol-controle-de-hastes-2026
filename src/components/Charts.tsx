import { useState, useMemo } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { ComputedOrder } from '../types';
import { ChevronLeft } from 'lucide-react';

interface ChartsProps {
  data: ComputedOrder[];
}

export function Charts({ data }: ChartsProps) {
  const [selectedClient, setSelectedClient] = useState<string | null>(null);

  // Filter and aggregate data based on drill-down state
  const { aggregatedData, chartTitle, currentDataKey } = useMemo(() => {
    if (selectedClient) {
      // Aggregate by Sonda for the specific client
      const filtered = data.filter(d => 
        d.cliente === selectedClient && 
        !d.categoria.toLowerCase().startsWith('revestimento') &&
        d.tag?.toUpperCase() !== 'REVESTIMENTOS' &&
        d.sonda?.toUpperCase() !== 'REVESTIMENTOS'
      );
      const aggregated = filtered.reduce((acc, order) => {
        const label = order.tag && order.tag !== order.sonda 
          ? `${order.tag} - ${order.sonda}`
          : (order.tag || order.sonda || 'Não Informada');
          
        const existing = acc.find((item) => item.label === label);
        if (existing) {
          existing.solicitado += order.qtdSolicitada;
          existing.atendido += order.qtdAtendida;
        } else {
          acc.push({
            label,
            solicitado: order.qtdSolicitada,
            atendido: order.qtdAtendida,
          });
        }
        return acc;
      }, [] as { label: string; solicitado: number; atendido: number }[]);

      return {
        aggregatedData: aggregated,
        chartTitle: `Desempenho por Sonda: ${selectedClient}`,
        currentDataKey: 'label'
      };
    } else {
      // Aggregate by Cliente
      const aggregated = data.reduce((acc, order) => {
        const existing = acc.find((item) => item.label === order.cliente);
        if (existing) {
          existing.solicitado += order.qtdSolicitada;
          existing.atendido += order.qtdAtendida;
        } else {
          acc.push({
            label: order.cliente,
            solicitado: order.qtdSolicitada,
            atendido: order.qtdAtendida,
          });
        }
        return acc;
      }, [] as { label: string; solicitado: number; atendido: number }[]);

      return {
        aggregatedData: aggregated,
        chartTitle: 'Desempenho de Atendimento por Cliente',
        currentDataKey: 'label'
      };
    }
  }, [data, selectedClient]);

  const handleBarClick = (state: any) => {
    if (!selectedClient && state && state.activeLabel) {
      setSelectedClient(state.activeLabel);
    }
  };

  return (
    <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-xl border border-slate-200 dark:border-slate-700/50 mb-6 transition-all duration-300">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-bold text-slate-800 dark:text-white flex items-center gap-2">
          {selectedClient && (
            <button 
              onClick={() => setSelectedClient(null)}
              className="p-1.5 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg text-slate-400 hover:text-blue-500 transition-colors"
              title="Voltar para Clientes"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
          )}
          {chartTitle}
        </h3>
        {!selectedClient && (
          <span className="text-[10px] items-center uppercase tracking-widest font-bold text-slate-400 bg-slate-100 dark:bg-slate-700/50 px-2.5 py-1 rounded-full">
            Clique na barra para detalhar
          </span>
        )}
      </div>

      <div className="h-[400px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={aggregatedData}
            margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
            onClick={handleBarClick}
            style={{ cursor: !selectedClient ? 'pointer' : 'default' }}
          >
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="currentColor" className="text-slate-200 dark:text-slate-700" />
            <XAxis 
              dataKey="label" 
              axisLine={false} 
              tickLine={false} 
              interval={0}
              angle={-45}
              textAnchor="end"
              height={80}
              tick={{ fill: 'currentColor', fontSize: 10, fontWeight: 500 }} 
              className="text-slate-500 dark:text-slate-400"
            />
            <YAxis 
              axisLine={false} 
              tickLine={false} 
              tick={{ fill: 'currentColor', fontSize: 11, fontWeight: 500 }} 
              className="text-slate-500 dark:text-slate-400"
            />
            <Tooltip
              cursor={{ fill: 'currentColor', opacity: 0.05 }}
              contentStyle={{ 
                borderRadius: '12px', 
                border: 'none', 
                boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)',
                backgroundColor: 'rgb(30, 41, 59)',
                color: '#fff',
                fontSize: '12px'
              }}
              itemStyle={{ color: '#fff' }}
            />
            <Legend 
              iconType="circle" 
              wrapperStyle={{ fontSize: '11px', paddingTop: '20px', fontWeight: 600 }} 
              className="dark:text-slate-300"
            />
            <Bar 
              dataKey="solicitado" 
              name="Qtd Solicitada" 
              fill="#94A3B8" 
              radius={[6, 6, 0, 0]} 
              barSize={aggregatedData.length > 5 ? 24 : 36}
              className="opacity-80 hover:opacity-100 transition-opacity"
            />
            <Bar 
              dataKey="atendido" 
              name="Qtd Atendida" 
              fill="#3B82F6" 
              radius={[6, 6, 0, 0]} 
              barSize={aggregatedData.length > 5 ? 24 : 36}
              className="hover:opacity-100 transition-opacity"
            />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
