import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { ComputedOrder } from '../types';

interface ChartsProps {
  data: ComputedOrder[];
}

export function Charts({ data }: ChartsProps) {
  // Aggregate data by Sonda
  const aggregatedData = data.reduce((acc, order) => {
    const existing = acc.find((item) => item.sonda === order.sonda);
    if (existing) {
      existing.solicitado += order.qtdSolicitada;
      existing.atendido += order.qtdAtendida;
    } else {
      acc.push({
        sonda: order.sonda,
        solicitado: order.qtdSolicitada,
        atendido: order.qtdAtendida,
      });
    }
    return acc;
  }, [] as { sonda: string; solicitado: number; atendido: number }[]);

  return (
    <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 mb-6">
      <h3 className="text-lg font-semibold text-slate-800 mb-4">Desempenho de Atendimento por Sonda</h3>
      <div className="h-72 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={aggregatedData}
            margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
          >
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
            <XAxis dataKey="sonda" axisLine={false} tickLine={false} tick={{ fill: '#64748B', fontSize: 12 }} />
            <YAxis axisLine={false} tickLine={false} tick={{ fill: '#64748B', fontSize: 12 }} />
            <Tooltip
              cursor={{ fill: '#F1F5F9' }}
              contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
            />
            <Legend iconType="circle" wrapperStyle={{ fontSize: '12px', paddingTop: '10px' }} />
            <Bar dataKey="solicitado" name="Qtd Solicitada" fill="#94A3B8" radius={[4, 4, 0, 0]} barSize={32} />
            <Bar dataKey="atendido" name="Qtd Atendida" fill="#3B82F6" radius={[4, 4, 0, 0]} barSize={32} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
