import { useState, useRef, useEffect } from 'react';
import { Filter } from 'lucide-react';
import { System } from '../types';

interface FilterBarProps {
  systemFilter: System | 'Todos';
  setSystemFilter: (sys: System | 'Todos') => void;
  statusFilter: 'Todos' | 'PENDENTE' | 'ATENDIDO';
  setStatusFilter: (status: 'Todos' | 'PENDENTE' | 'ATENDIDO') => void;
  sondaFilter: string;
  setSondaFilter: (sonda: string) => void;
  availableSondas: string[];
}

export function FilterBar({
  systemFilter,
  setSystemFilter,
  statusFilter,
  setStatusFilter,
  sondaFilter,
  setSondaFilter,
  availableSondas,
}: FilterBarProps) {
  const [isFiltersOpen, setIsFiltersOpen] = useState(false);
  const filtersRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (filtersRef.current && !filtersRef.current.contains(event.target as Node)) {
        setIsFiltersOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const activeFiltersCount = (systemFilter !== 'Todos' ? 1 : 0) + (statusFilter !== 'Todos' ? 1 : 0) + (sondaFilter !== 'Todos' ? 1 : 0);

  return (
    <div className="flex items-center justify-end px-6 pt-4 pb-2 sticky top-0 z-10 pointer-events-none">
      <div className="flex items-center gap-3 pointer-events-auto">
        {/* Filters Dropdown */}
        <div className="relative" ref={filtersRef}>
          <button 
            onClick={() => setIsFiltersOpen(!isFiltersOpen)} 
            className="flex items-center gap-2 px-4 py-2 bg-slate-800/80 border border-slate-700 rounded-lg text-sm font-bold text-slate-300 hover:bg-slate-700 hover:text-white transition-colors shadow-sm relative backdrop-blur-sm"
          >
            <Filter className="w-4 h-4" />
            Filtros
            {activeFiltersCount > 0 && (
              <span className="absolute -top-1 -right-1 w-4 h-4 bg-blue-600 text-white text-[10px] flex items-center justify-center rounded-full font-bold">
                {activeFiltersCount}
              </span>
            )}
          </button>
          
          {isFiltersOpen && (
            <div className="absolute right-0 mt-2 w-64 bg-white border border-slate-200 rounded-xl shadow-lg p-4 z-20 flex flex-col gap-4 animate-in fade-in slide-in-from-top-2">
              <div className="flex items-center justify-between mb-1">
                <h4 className="text-sm font-bold text-slate-800">Filtros da Tabela</h4>
                {activeFiltersCount > 0 && (
                  <button 
                    onClick={() => { setSystemFilter('Todos'); setStatusFilter('Todos'); setSondaFilter('Todos'); }}
                    className="text-xs text-blue-600 hover:text-blue-800 font-medium"
                  >
                    Limpar
                  </button>
                )}
              </div>
              
              <div>
                <label className="block text-xs font-semibold text-slate-500 mb-1.5">Sistema</label>
                <select 
                  value={systemFilter} 
                  onChange={e => setSystemFilter(e.target.value as any)} 
                  className="w-full text-sm border-slate-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="Todos">Todos os Sistemas</option>
                  <option value="Norte">Norte</option>
                  <option value="Sul">Sul</option>
                </select>
              </div>
              
              <div>
                <label className="block text-xs font-semibold text-slate-500 mb-1.5">Status</label>
                <select 
                  value={statusFilter} 
                  onChange={e => setStatusFilter(e.target.value as any)} 
                  className="w-full text-sm border-slate-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="Todos">Todos os Status</option>
                  <option value="PENDENTE">Pendente</option>
                  <option value="ATENDIDO">Atendido</option>
                </select>
              </div>
              
              <div>
                <label className="block text-xs font-semibold text-slate-500 mb-1.5">Sonda</label>
                <select 
                  value={sondaFilter} 
                  onChange={e => setSondaFilter(e.target.value)} 
                  className="w-full text-sm border-slate-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="Todos">Todas as Sondas</option>
                  {availableSondas.map(s => (
                    <option key={s} value={s}>{s}</option>
                  ))}
                </select>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
