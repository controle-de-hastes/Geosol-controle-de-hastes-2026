import { useState, useMemo } from 'react';
import { Order, HistoryEvent, SondaHistorico, HistorySubgroup } from '../types';
import { 
  BarChart, Users, Hash, MapPin, Calendar, 
  ArrowRight, Package, Search, Filter, X,
  TrendingUp, Activity, ClipboardList, Trash2
} from 'lucide-react';

interface HistoryDashboardProps {
  activeSubgroup: HistorySubgroup;
  data: Order[];
  history: HistoryEvent[];
  sondaHistorico: SondaHistorico[];
  onClearHistory: () => void;
  onDeleteHistoryItem: (id: string, type: 'event' | 'sonda') => void;
}

export function HistoryDashboard({ activeSubgroup, data, history, sondaHistorico, onClearHistory, onDeleteHistoryItem }: HistoryDashboardProps) {
  const [selectedFilter, setSelectedFilter] = useState<string | null>(null);
  const [localSearch, setLocalSearch] = useState('');

  // Reset filters when changing subgroups to avoid "mixing" data
  useMemo(() => {
    setSelectedFilter(null);
    setLocalSearch('');
  }, [activeSubgroup]);

  const getSubgroupTitle = () => {
    switch (activeSubgroup) {
      case 'sondas': return 'Movimentação de Sondas';
      case 'clientes': return 'Fluxo por Clientes';
      case 'cc': return 'Execução por Centro de Custo';
      case 'sistema': return 'Indicadores Regionalizados';
      case 'eventos': return 'Registro de Atividades';
      default: return 'Centro de Inteligência Histórica';
    }
  };

  const getSubgroupIcon = () => {
    switch (activeSubgroup) {
      case 'sondas': return <Activity className="w-5 h-5 text-blue-500" />;
      case 'clientes': return <Users className="w-5 h-5 text-emerald-500" />;
      case 'cc': return <Hash className="w-5 h-5 text-amber-500" />;
      case 'sistema': return <MapPin className="w-5 h-5 text-indigo-500" />;
      case 'eventos': return <ClipboardList className="w-5 h-5 text-purple-500" />;
      default: return <TrendingUp className="w-5 h-5 text-blue-600" />;
    }
  };

  // Aggregated data logic
  const aggregatedData = useMemo(() => {
    const records = sondaHistorico || [];
    const groups: Record<string, { total: number, lastDate: string, count: number, extra?: string }> = {};
    
    records.forEach(rec => {
      // Exclude REVESTIMENTOS from sonda-specific history
      if (rec.sonda === 'REVESTIMENTOS') return;
      let key = '';
      let extra = '';
      if (activeSubgroup === 'sondas') {
        key = rec.descricao_sonda || rec.sonda || 'Sem Descrição';
        extra = rec.sonda;
      }
      else if (activeSubgroup === 'clientes') key = rec.cliente || 'Sem Cliente';
      else if (activeSubgroup === 'cc') key = rec.cc || 'Sem CC';
      else if (activeSubgroup === 'sistema') {
        const originalOrder = data.find(o => o.id === rec.pedido_id);
        key = originalOrder?.sistema || 'Norte';
      }
      else if (activeSubgroup === 'eventos') {
        key = rec.user_name || 'Sistema';
      }

      if (!groups[key]) {
        groups[key] = { total: 0, lastDate: rec.data_atendimento, count: 0, extra };
      }
      
      groups[key].total += rec.qtd_atendida || 0;
      groups[key].count += 1;
      if (new Date(rec.data_atendimento) > new Date(groups[key].lastDate)) {
        groups[key].lastDate = rec.data_atendimento;
      }
    });

    if (activeSubgroup === 'eventos') {
      const eventGroups: Record<string, { total: number, lastDate: string, count: number, extra?: string }> = {};
      (history || []).forEach(ev => {
        const key = ev.user_name || 'Sistema';
        if (!eventGroups[key]) {
          eventGroups[key] = { total: 0, lastDate: ev.date, count: 0 };
        }
        eventGroups[key].count += 1;
        if (new Date(ev.date) > new Date(eventGroups[key].lastDate)) {
          eventGroups[key].lastDate = ev.date;
        }
      });
      return Object.entries(eventGroups).map(([name, stats]) => ({ name, ...stats, total: stats.count })).sort((a,b) => b.count - a.count);
    }

    return Object.entries(groups).map(([name, stats]) => ({
      name,
      ...stats
    })).sort((a, b) => b.total - a.total);
  }, [activeSubgroup, data, sondaHistorico]);

  // Max total for the mini-bars
  const maxTotal = useMemo(() => Math.max(...aggregatedData.map(d => d.total), 1), [aggregatedData]);

  // Filtered detailed list
  const filteredHistory = useMemo(() => {
    if (activeSubgroup === 'eventos') {
      return (history || []).filter(item => {
        if (selectedFilter && (item.user_name || 'Sistema') !== selectedFilter) return false;
        if (localSearch) {
          const searchLower = localSearch.toLowerCase();
          return item.description.toLowerCase().includes(searchLower) || (item.user_name || '').toLowerCase().includes(searchLower);
        }
        return true;
      });
    }

    return (sondaHistorico || []).filter(item => {
      // Filter by card selection
      if (selectedFilter) {
        if (activeSubgroup === 'sondas' && (item.descricao_sonda || item.sonda) !== selectedFilter) return false;
        if (activeSubgroup === 'clientes' && item.cliente !== selectedFilter) return false;
        if (activeSubgroup === 'cc' && item.cc !== selectedFilter) return false;
        if (activeSubgroup === 'sistema') {
          const order = data.find(o => o.id === item.pedido_id);
          if (order?.sistema !== selectedFilter) return false;
        }
      }

      // Filter by text search
      if (localSearch) {
        const searchLower = localSearch.toLowerCase();
        return (
          item.sonda?.toLowerCase().includes(searchLower) ||
          item.cliente?.toLowerCase().includes(searchLower) ||
          item.cc?.toLowerCase().includes(searchLower) ||
          item.produto?.toLowerCase().includes(searchLower) ||
          item.user_name?.toLowerCase().includes(searchLower)
        );
      }

      return true;
    });
  }, [selectedFilter, localSearch, sondaHistorico, history, activeSubgroup, data]);

  return (
    <div className="animate-in fade-in slide-in-from-bottom-6 duration-1000 flex flex-col space-y-12 pb-24">
      
      {/* Premium Header Section */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-8">
        <div className="flex items-center gap-6">
          <div className="relative">
            <div className="absolute -inset-1 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-3xl blur opacity-25 group-hover:opacity-100 transition duration-1000 group-hover:duration-200"></div>
            <div className="relative p-5 bg-slate-900 border border-slate-800 rounded-3xl flex items-center justify-center shadow-2xl">
              {getSubgroupIcon()}
            </div>
          </div>
          <div>
            <div className="flex items-center justify-between gap-4 mb-1.5">
              <span className="px-2 py-0.5 bg-blue-500/10 border border-blue-500/20 rounded-full text-[10px] font-black text-blue-400 uppercase tracking-widest">
                Inteligência Logística
              </span>
              <button 
                onClick={onClearHistory}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-red-500/10 text-red-500 border border-red-500/20 rounded-full text-[10px] font-black uppercase tracking-widest hover:bg-red-500 hover:text-white transition-all shadow-sm"
                title="Apagar todos os registros de movimentação e logs"
              >
                <X className="w-3 h-3" />
                Limpar Histórico
              </button>
            </div>
            <h2 className="text-5xl font-black text-white tracking-tight leading-tight">
              {getSubgroupTitle()}
            </h2>
            <p className="text-slate-400 font-medium text-base mt-1">
              Análise profunda de movimentação por <span className="text-blue-400 font-bold">{activeSubgroup}</span>
            </p>
          </div>
        </div>

        {/* Local Search UI */}
        <div className="relative group min-w-[320px] lg:min-w-[450px]">
          <div className="absolute inset-0 bg-blue-600/5 rounded-2xl blur-xl group-focus-within:bg-blue-600/10 transition-all"></div>
          <div className="relative flex items-center">
            <Search className="w-5 h-5 absolute left-5 text-slate-500 group-focus-within:text-blue-400 transition-colors" />
            <input 
              type="text" 
              placeholder={`Pesquisar nos registros de ${activeSubgroup}...`}
              value={localSearch}
              onChange={(e) => setLocalSearch(e.target.value)}
              className="w-full pl-14 pr-6 py-4.5 bg-slate-900/40 border border-slate-700/50 hover:border-slate-600/50 rounded-2xl text-white font-semibold placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500/50 transition-all backdrop-blur-xl text-lg"
            />
          </div>
        </div>
      </div>

      {/* Summary Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {aggregatedData.slice(0, 8).map((item) => {
          const isActive = selectedFilter === item.name;
          const percentage = (item.total / maxTotal) * 100;
          
          return (
            <button
              key={item.name}
              onClick={() => setSelectedFilter(isActive ? null : item.name)}
              className={`group relative flex flex-col h-full text-left transition-all duration-500 ease-out outline-none ${
                isActive ? 'scale-[1.02] z-10' : 'hover:scale-[1.01]'
              }`}
            >
              {/* Card Decoration */}
              <div className={`absolute inset-0 rounded-[2.5rem] transition-all duration-500 ${
                isActive 
                  ? 'bg-gradient-to-br from-blue-600 to-indigo-700 shadow-[0_20px_50px_rgba(37,99,235,0.3)]' 
                  : 'bg-white border border-slate-100 shadow-[0_8px_30px_rgb(0,0,0,0.04)] group-hover:shadow-[0_20px_40px_rgba(0,0,0,0.08)] group-hover:border-slate-200'
              }`} />

              <div className="relative p-8 flex flex-col h-full">
                <div className="flex justify-between items-start mb-8">
                  <div className="flex-1 min-w-0 pr-4">
                    <h3 className={`text-xl font-black truncate tracking-tight transition-colors duration-300 ${
                      isActive ? 'text-white' : 'text-slate-900'
                    }`}>
                      {item.name}
                    </h3>
                    <div className="flex items-center gap-2 mt-2">
                      <span className={`text-[10px] font-black uppercase tracking-widest transition-colors ${
                        isActive ? 'text-blue-200' : 'text-slate-400'
                      }`}>
                        {activeSubgroup}
                      </span>
                      {item.extra && (
                         <span className={`px-2 py-0.5 rounded text-[9px] font-black tracking-tighter transition-colors ${
                          isActive ? 'bg-white/20 text-white border-white/10' : 'bg-slate-50 text-slate-500 border-slate-100'
                        } border`}>
                          {item.extra}
                        </span>
                      )}
                    </div>
                  </div>
                  <div className={`p-3 rounded-2xl transition-all duration-500 ${
                    isActive 
                      ? 'bg-white/20 text-white rotate-12' 
                      : 'bg-slate-50 text-slate-400 group-hover:bg-blue-50 group-hover:text-blue-600 group-hover:-rotate-12'
                  }`}>
                    {isActive ? <Filter className="w-5 h-5" /> : <TrendingUp className="w-5 h-5" />}
                  </div>
                </div>

                <div className="mt-auto space-y-6">
                  <div>
                    <p className={`text-[10px] font-black uppercase tracking-[0.15em] mb-1.5 transition-colors ${
                      isActive ? 'text-blue-100/70' : 'text-slate-400'
                    }`}>
                      Volume Histórico
                    </p>
                    <div className={`flex items-baseline gap-2 transition-colors ${
                      isActive ? 'text-white' : 'text-slate-900'
                    }`}>
                      <span className="text-4xl font-black tracking-tighter">
                        {item.total.toLocaleString()}
                      </span>
                      <span className={`text-sm font-bold ${
                        isActive ? 'text-blue-100' : 'text-slate-400'
                      }`}>
                        hastes
                      </span>
                    </div>
                  </div>

                  {/* Intensity Indicator */}
                  <div className="space-y-2">
                    <div className="flex justify-between items-center pr-1">
                      <span className={`text-[10px] font-black uppercase tracking-widest ${
                        isActive ? 'text-white/80' : 'text-slate-400'
                      }`}>
                        Intensidade
                      </span>
                      <span className={`text-[10px] font-black ${
                        isActive ? 'text-white' : 'text-blue-600'
                      }`}>
                        {item.count} ENVIOS
                      </span>
                    </div>
                    <div className={`h-2.5 w-full rounded-full overflow-hidden transition-colors ${
                      isActive ? 'bg-white/20' : 'bg-slate-100'
                    }`}>
                      <div 
                        className={`h-full rounded-full transition-all duration-1000 ease-out shadow-sm ${
                          isActive ? 'bg-white' : 'bg-blue-600'
                        }`}
                        style={{ width: `${Math.max(percentage, 5)}%` }}
                      />
                    </div>
                  </div>
                </div>
              </div>
              {isActive && (
                <div className="absolute -top-2 -right-2 bg-blue-600 text-white p-1 rounded-full shadow-lg animate-in zoom-in">
                  <X className="w-3 h-3" />
                </div>
              )}
            </button>
          );
        })}
      </div>

      {/* Detailed Report Section */}
      <div className="bg-white/80 backdrop-blur-md border border-slate-200 rounded-[2.5rem] overflow-hidden shadow-[0_30px_60px_-15px_rgba(0,0,0,0.05)]">
        <div className="px-10 py-10 border-b border-slate-100 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex items-center gap-5">
            <div className="w-12 h-12 bg-slate-900 rounded-2xl flex items-center justify-center text-blue-400 shadow-xl shadow-blue-500/10 border border-slate-800">
              <ClipboardList className="w-6 h-6" />
            </div>
            <div>
              <h4 className="text-2xl font-black text-slate-800 tracking-tight">Registro de Movimentação</h4>
              <p className="text-sm text-slate-400 font-bold mt-0.5">Listagem cronológica e detalhada de atendimentos</p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            {selectedFilter && (
              <button 
                onClick={() => setSelectedFilter(null)}
                className="group flex items-center gap-3 px-5 py-2.5 bg-blue-600 text-white rounded-2xl text-xs font-black shadow-lg shadow-blue-500/20 hover:bg-blue-700 transition-all animate-in slide-in-from-right-4"
              >
                <span>Filtro: {selectedFilter}</span>
                <X className="w-4 h-4 group-hover:rotate-90 transition-transform" />
              </button>
            )}
            <div className="px-6 py-3 bg-slate-50 border border-slate-100 rounded-2xl text-slate-500 text-[10px] font-black tracking-[0.1em] shadow-inner">
              {filteredHistory.length} OCORRÊNCIAS ENCONTRADAS
            </div>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-slate-50/70">
                <th className="pl-10 pr-6 py-7 text-[10px] font-black text-slate-400 uppercase tracking-[0.25em] border-b border-slate-100">Período</th>
                <th className="px-6 py-7 text-[10px] font-black text-slate-400 uppercase tracking-[0.25em] border-b border-slate-100">{activeSubgroup === 'sondas' ? 'Sonda' : activeSubgroup === 'clientes' ? 'Cliente' : activeSubgroup === 'cc' ? 'Centro de Custo' : 'Sistema'}</th>
                <th className="px-6 py-7 text-[10px] font-black text-slate-400 uppercase tracking-[0.25em] border-b border-slate-100">{activeSubgroup === 'sondas' ? 'Cliente / Destino' : 'Sonda / Equipamento'}</th>
                <th className="px-6 py-7 text-[10px] font-black text-slate-400 uppercase tracking-[0.25em] border-b border-slate-100 text-center">Volume</th>
                <th className="pr-10 pl-6 py-7 text-[10px] font-black text-slate-400 uppercase tracking-[0.25em] border-b border-slate-100 text-center w-12"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {filteredHistory.length > 0 ? (
                filteredHistory.map((log) => {
                  if (activeSubgroup === 'eventos') {
                    const event = log as unknown as HistoryEvent;
                    return (
                      <tr key={event.id} className="hover:bg-slate-50/70 transition-colors group">
                        <td className="pl-10 pr-6 py-6">
                          <div className="flex items-center gap-3">
                            <Calendar className="w-4 h-4 text-slate-300 group-hover:text-blue-500 transition-colors" />
                            <span className="text-sm font-black text-slate-600">{new Date(event.date).toLocaleDateString()}</span>
                          </div>
                        </td>
                        <td className="px-6 py-6" colSpan={2}>
                          <div className="flex flex-col">
                            <span className="text-slate-900 font-bold text-base tracking-tight leading-snug group-hover:text-blue-600 transition-colors">{event.description}</span>
                            <div className="flex items-center gap-2 mt-1.5">
                               <span className={`text-[9px] font-black uppercase tracking-widest px-2.5 py-0.5 rounded-full border ${
                                 event.type === 'CREATE' ? 'bg-emerald-50 text-emerald-600 border-emerald-100' :
                                 event.type === 'UPDATE' ? 'bg-blue-50 text-blue-600 border-blue-100' :
                                 event.type === 'DELETE' ? 'bg-red-50 text-red-600 border-red-100' :
                                 'bg-amber-50 text-amber-600 border-amber-100'
                               }`}>{event.type}</span>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-6 text-center">
                          <span className="text-[10px] font-black text-slate-300 tracking-[0.2em] group-hover:text-slate-400 transition-colors uppercase">System Log</span>
                        </td>
                        <td className="pr-10 pl-6 py-6 text-center">
                          <button 
                            onClick={() => onDeleteHistoryItem(event.id, 'event')}
                            className="p-2 text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all opacity-0 group-hover:opacity-100"
                            title="Excluir este log"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </td>
                      </tr>
                    );
                  }

                  const mainLabel = activeSubgroup === 'sondas' 
                    ? (log.descricao_sonda || log.sonda)
                    : activeSubgroup === 'clientes' 
                    ? log.cliente 
                    : activeSubgroup === 'cc' 
                    ? log.cc 
                    : (data.find(o => o.id === log.pedido_id)?.sistema || 'Norte');

                  const subLabel1 = activeSubgroup === 'sondas' ? log.sonda : (log.descricao_sonda || log.sonda);
                  const secondaryMain = activeSubgroup === 'sondas' ? log.cliente : (log.descricao_sonda || log.sonda);
                  const secondarySub = activeSubgroup === 'sondas' ? `CC: ${log.cc}` : `Cliente: ${log.cliente}`;

                  return (
                    <tr key={log.id} className="hover:bg-slate-50/70 transition-colors group">
                      <td className="pl-10 pr-6 py-6">
                        <div className="flex items-center gap-3">
                          <Calendar className="w-4 h-4 text-slate-300 group-hover:text-blue-500 transition-colors" />
                          <span className="text-sm font-black text-slate-600">{new Date(log.data_atendimento).toLocaleDateString()}</span>
                        </div>
                      </td>
                      <td className="px-6 py-6">
                        <div className="flex flex-col max-w-[280px]">
                          <span className="text-slate-900 font-bold text-base tracking-tight leading-snug group-hover:text-blue-600 transition-colors truncate">{mainLabel}</span>
                          <div className="flex items-center gap-2 mt-1.5">
                             <span className="text-[10px] text-slate-400 font-black uppercase tracking-widest">{subLabel1}</span>
                             <span className="w-1 h-1 rounded-full bg-slate-200" />
                             <span className="text-[10px] text-slate-400 font-bold truncate">{log.produto}</span>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-6">
                        <div className="flex flex-col">
                          <span className="text-slate-700 font-black text-sm tracking-tight truncate max-w-[200px]">{secondaryMain || '-'}</span>
                          <span className="text-[10px] text-blue-500 font-black uppercase tracking-widest mt-1 bg-blue-50 px-2 py-0.5 rounded-full inline-block w-fit border border-blue-100">{secondarySub}</span>
                        </div>
                      </td>
                      <td className="px-6 py-6 text-center">
                        <div className="inline-flex flex-col items-center">
                          <span className="text-xl font-black text-slate-900 tracking-tighter">+{log.qtd_atendida}</span>
                          <span className="text-[9px] font-black text-emerald-500 uppercase tracking-widest -mt-1">Hastes</span>
                        </div>
                      </td>
                      <td className="pr-10 pl-6 py-6 text-center">
                        <button 
                          onClick={() => onDeleteHistoryItem(log.id, 'sonda')}
                          className="p-2 text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all opacity-0 group-hover:opacity-100"
                          title="Excluir este registro"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={5} className="py-40 text-center">
                    <div className="flex flex-col items-center justify-center space-y-6">
                      <div className="relative">
                        <div className="absolute inset-0 bg-blue-100 blur-2xl opacity-50 rounded-full animate-pulse"></div>
                        <div className="relative w-24 h-24 bg-white rounded-3xl flex items-center justify-center border-2 border-dashed border-slate-200 shadow-inner">
                          <Search className="w-10 h-10 text-slate-300" />
                        </div>
                      </div>
                      <div className="max-w-xs space-y-2">
                        <p className="text-slate-900 font-black text-2xl tracking-tight">Nenhum registro</p>
                        <p className="text-slate-400 font-medium text-sm leading-relaxed">Não encontramos movimentações para este filtro. Tente ampliar sua busca ou mudar o subgrupo.</p>
                      </div>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        
        {/* Footer info */}
        <div className="px-10 py-10 bg-slate-900 flex flex-col items-center justify-center space-y-4">
          <div className="flex items-center gap-3 opacity-30">
            <div className="h-[1px] w-20 bg-gradient-to-r from-transparent to-white"></div>
            <div className="w-2 h-2 bg-blue-500 rounded-full animate-ping"></div>
            <div className="h-[1px] w-20 bg-gradient-to-l from-transparent to-white"></div>
          </div>
          <p className="text-[10px] text-white font-black uppercase tracking-[0.5em] text-center opacity-40">
            Geosol Intelligent Systems • Logistics Monitor v2.0
          </p>
        </div>
      </div>
    </div>
  );
}
