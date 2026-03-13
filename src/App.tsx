import { useState, useMemo, useEffect } from 'react';
import { TopBar } from './components/TopBar';
import { FilterBar } from './components/FilterBar';
import { DashboardCards } from './components/DashboardCards';
import { DataTable } from './components/DataTable';
import { Charts } from './components/Charts';
import { NewOrderModal } from './components/NewOrderModal';
import { ImportModal } from './components/ImportModal';
import { SettingsModal } from './components/SettingsModal';
import { Auth } from './components/Auth';
import { supabase } from './lib/supabase';
import { initialData } from './data';
import { Order, ComputedOrder, Category, System, HistoryEvent } from './types';
import { Session } from '@supabase/supabase-js';
import { Profile } from './types';

export default function App() {
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [isLoadingAuth, setIsLoadingAuth] = useState(true);
  const [data, setData] = useState<Order[]>(initialData);
  const [history, setHistory] = useState<HistoryEvent[]>([
    {
      id: '1',
      date: new Date().toISOString(),
      description: 'Sistema inicializado com dados padrão.',
      type: 'IMPORT'
    }
  ]);
  const [activeCategory, setActiveCategory] = useState<Category | 'Geral'>('Geral');
  const [searchTerm, setSearchTerm] = useState('');
  const [systemFilter, setSystemFilter] = useState<System | 'Todos'>('Todos');
  const [statusFilter, setStatusFilter] = useState<'Todos' | 'PENDENTE' | 'ATENDIDO'>('Todos');
  const [sondaFilter, setSondaFilter] = useState<string>('Todos');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [isSettingsModalOpen, setIsSettingsModalOpen] = useState(false);
  const [orderToEdit, setOrderToEdit] = useState<Order | null>(null);

  const addHistory = (description: string, type: HistoryEvent['type']) => {
    setHistory(prev => [{
      id: Math.random().toString(36).substr(2, 9),
      date: new Date().toISOString(),
      description,
      type
    }, ...prev]);
  };

  const loadProfile = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();
        
      if (error) {
        console.error('Error loading profile:', error);
      } else if (data) {
        setProfile(data as Profile);
      }
    } catch (err) {
      console.error('Unexpected error loading profile:', err);
    }
  };

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      if (session?.user) {
        loadProfile(session.user.id);
      } else {
        setIsLoadingAuth(false);
      }
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      if (session?.user) {
        loadProfile(session.user.id).finally(() => setIsLoadingAuth(false));
      } else {
        setProfile(null);
        setIsLoadingAuth(false);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  // Compute derived fields (qtdPendente, status)
  const computedData: ComputedOrder[] = useMemo(() => {
    return data.map((order) => {
      const qtdPendente = Math.max(0, order.qtdSolicitada - order.qtdAtendida);
      const status = order.qtdAtendida < order.qtdSolicitada ? 'PENDENTE' : 'ATENDIDO';
      return { ...order, qtdPendente, status };
    });
  }, [data]);

  // Extract available sondas for the filter dropdown
  const availableSondas = useMemo(() => {
    const sondas = new Set(data.map(d => d.sonda));
    return Array.from(sondas).sort();
  }, [data]);

  // Filter data based on sidebar, search, and system filter
  const filteredData = useMemo(() => {
    const filtered = computedData.filter((order) => {
      const matchesCategory = activeCategory === 'Geral' || order.categoria === activeCategory;
      const matchesSystem = systemFilter === 'Todos' || order.sistema === systemFilter;
      const matchesStatus = statusFilter === 'Todos' || order.status === statusFilter;
      const matchesSonda = sondaFilter === 'Todos' || order.sonda === sondaFilter;
      const searchLower = searchTerm.toLowerCase();
      const matchesSearch =
        order.cc.toLowerCase().includes(searchLower) ||
        order.cliente.toLowerCase().includes(searchLower) ||
        order.sonda.toLowerCase().includes(searchLower) ||
        order.produto.toLowerCase().includes(searchLower);

      return matchesCategory && matchesSystem && matchesStatus && matchesSonda && matchesSearch;
    });

    // Sort so PENDENTE is always at the top
    return filtered.sort((a, b) => {
      if (a.status === 'PENDENTE' && b.status === 'ATENDIDO') return -1;
      if (a.status === 'ATENDIDO' && b.status === 'PENDENTE') return 1;
      return 0;
    });
  }, [computedData, activeCategory, systemFilter, statusFilter, sondaFilter, searchTerm]);

  // Improved update function using ID
  const updateDataById = (id: string, columnId: string, value: unknown) => {
    setData((old) =>
      old.map((row) => {
        if (row.id === id) {
          const updatedRow = {
            ...row,
            [columnId]: value,
          };

          const today = new Date().toISOString().split('T')[0];

          // Auto-fill dataAtendimentoInicio if qtdAtendida starts and date is empty
          if (columnId === 'qtdAtendida' && Number(value) > 0 && !row.dataAtendimentoInicio) {
            updatedRow.dataAtendimentoInicio = today;
          }

          // Auto-fill dataAtendimentoFinal if qtdAtendida reaches qtdSolicitada and date is empty
          if (columnId === 'qtdAtendida' && Number(value) >= row.qtdSolicitada && !row.dataAtendimentoFinal) {
            updatedRow.dataAtendimentoFinal = today;
          }

          return updatedRow;
        }
        return row;
      })
    );
    addHistory(`Pedido ${id} atualizado (${columnId}).`, 'UPDATE');
  };

  const handleAddOrder = (newOrder: Order) => {
    setData((prev) => [newOrder, ...prev]);
    addHistory(`Novo pedido ${newOrder.id} criado para ${newOrder.cliente}.`, 'CREATE');
  };

  const handleImportOrders = (newOrders: Order[]) => {
    setData((prev) => [...newOrders, ...prev]);
    addHistory(`${newOrders.length} pedidos importados via planilha.`, 'IMPORT');
  };

  const handleEditOrder = (updatedOrder: Order) => {
    setData((prev) =>
      prev.map((order) => (order.id === updatedOrder.id ? updatedOrder : order))
    );
    addHistory(`Pedido ${updatedOrder.id} editado.`, 'UPDATE');
    setOrderToEdit(null);
  };

  const openEditModal = (order: Order) => {
    setOrderToEdit(order);
    setIsModalOpen(true);
  };

  const closeOrderModal = () => {
    setIsModalOpen(false);
    setOrderToEdit(null);
  };

  if (isLoadingAuth) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent flex rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!session) {
    return <Auth />;
  }

  return (
    <div className="flex flex-col h-screen bg-gradient-to-b from-slate-900 via-slate-800 to-slate-50 bg-fixed font-sans text-slate-900 overflow-hidden">
      <div className="bg-transparent shrink-0">
        <TopBar 
          activeCategory={activeCategory} 
          setActiveCategory={setActiveCategory} 
          onOpenSettings={() => setIsSettingsModalOpen(true)}
          searchTerm={searchTerm}
          setSearchTerm={setSearchTerm}
          onNewOrder={() => {
            setOrderToEdit(null);
            setIsModalOpen(true);
          }}
          onImportClick={() => setIsImportModalOpen(true)}
          profile={profile}
        />
        <FilterBar
          systemFilter={systemFilter}
          setSystemFilter={setSystemFilter}
          statusFilter={statusFilter}
          setStatusFilter={setStatusFilter}
          sondaFilter={sondaFilter}
          setSondaFilter={setSondaFilter}
          availableSondas={availableSondas}
        />
      </div>
      
      <div className="flex-1 flex flex-col overflow-hidden">
        <main className="flex-1 overflow-y-auto relative">
          <div className="relative z-10 flex flex-col p-4 sm:p-6 lg:p-8 min-h-full">
            <div className="max-w-[1600px] mx-auto w-full flex-1 flex flex-col space-y-6 lg:space-y-8">
              <div className="shrink-0">
                <h2 className="text-2xl font-bold text-white tracking-tight">
                  {activeCategory === 'Geral' ? 'Visão Geral do Inventário' : activeCategory}
                </h2>
                <p className="text-sm text-slate-300 mt-1">
                  Gerencie o fluxo logístico e o atendimento de pedidos de hastes.
                </p>
              </div>

              <div className="shrink-0">
                <DashboardCards data={filteredData} />
              </div>
              
              {activeCategory === 'Geral' && (
                <div className="shrink-0">
                  <Charts data={filteredData} />
                </div>
              )}

              <div className="flex-1 flex flex-col min-h-[600px]">
                <div className="flex items-center justify-between mb-4 shrink-0 px-1">
                  <h3 className="text-xl font-bold text-white">Tabela de Gestão</h3>
                  <span className="text-sm text-slate-200 bg-slate-800/40 border border-slate-700/50 px-3 py-1.5 rounded-lg font-semibold backdrop-blur-sm">
                    {filteredData.length} registros
                  </span>
                </div>
                <div className="flex-1 overflow-hidden flex flex-col shadow-2xl shadow-slate-900/20 rounded-2xl">
                  <DataTable 
                    data={filteredData} 
                    updateDataById={updateDataById} 
                    onEdit={openEditModal}
                  />
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>

      <NewOrderModal
        isOpen={isModalOpen}
        onClose={closeOrderModal}
        onAdd={handleAddOrder}
        onEdit={handleEditOrder}
        defaultCategory={activeCategory}
        orderToEdit={orderToEdit}
      />

      <ImportModal 
        isOpen={isImportModalOpen}
        onClose={() => setIsImportModalOpen(false)}
        onImport={handleImportOrders}
      />

      <SettingsModal
        isOpen={isSettingsModalOpen}
        onClose={() => setIsSettingsModalOpen(false)}
        data={data}
        history={history}
        profile={profile}
        onClearData={() => {
          setData([]);
          addHistory('Todos os dados foram apagados.', 'DELETE');
        }}
      />
    </div>
  );
}
