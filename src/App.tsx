import { useState, useMemo, useEffect, useCallback } from 'react';
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
  const [data, setData] = useState<Order[]>([]);
  const [history, setHistory] = useState<HistoryEvent[]>([]);
  const [activeCategory, setActiveCategory] = useState<Category | 'Geral'>('Geral');
  const [searchTerm, setSearchTerm] = useState('');
  const [systemFilter, setSystemFilter] = useState<System | 'Todos'>('Todos');
  const [statusFilter, setStatusFilter] = useState<'Todos' | 'PENDENTE' | 'ATENDIDO'>('Todos');
  const [sondaFilter, setSondaFilter] = useState<string>('Todos');
  const [clientFilter, setClientFilter] = useState<string>('Todos');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [isSettingsModalOpen, setIsSettingsModalOpen] = useState(false);
  const [orderToEdit, setOrderToEdit] = useState<Order | null>(null);
  const [theme, setTheme] = useState<'light' | 'dark' | 'system'>(() => {
    return (localStorage.getItem('geosol_theme') as 'light' | 'dark' | 'system') || 'light';
  });
  const [density, setDensity] = useState<'standard' | 'compact'>(() => {
    return (localStorage.getItem('geosol_density') as 'standard' | 'compact') || 'standard';
  });

  // Apply theme to <html> element
  const applyTheme = useCallback((selectedTheme: 'light' | 'dark' | 'system') => {
    const root = document.documentElement;
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    const isDark = selectedTheme === 'dark' || (selectedTheme === 'system' && prefersDark);
    root.setAttribute('data-theme', isDark ? 'dark' : 'light');
    if (isDark) {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
  }, []);

  useEffect(() => {
    applyTheme(theme);
    localStorage.setItem('geosol_theme', theme);
  }, [theme, applyTheme]);

  useEffect(() => {
    localStorage.setItem('geosol_density', density);
  }, [density]);

  // Listen to system theme changes when theme === 'system'
  useEffect(() => {
    if (theme !== 'system') return;
    const mq = window.matchMedia('(prefers-color-scheme: dark)');
    const handler = () => applyTheme('system');
    mq.addEventListener('change', handler);
    return () => mq.removeEventListener('change', handler);
  }, [theme, applyTheme]);

  const fetchOrders = async () => {
    try {
      const { data: dbOrders, error } = await supabase
        .from('orders')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      
      const mappedOrders: Order[] = (dbOrders || []).map(o => ({
        id: o.id,
        codigo: o.codigo,
        cc: o.cc,
        cliente: o.cliente,
        sistema: o.sistema,
        sonda: o.sonda,
        produto: o.produto,
        qtdSolicitada: o.qtd_solicitada,
        qtdAtendida: o.qtd_atendida,
        dataNecessidade: o.data_necessidade,
        dataAtendimentoInicio: o.data_atendimento_inicio,
        dataAtendimentoFinal: o.data_atendimento_final,
        categoria: o.categoria
      }));

      setData(mappedOrders);
    } catch (err) {
      console.error('Erro ao buscar pedidos:', err);
    }
  };

  const fetchHistory = async () => {
    try {
      const { data: dbEvents, error } = await supabase
        .from('history_events')
        .select('*')
        .order('date', { ascending: false });

      if (error) throw error;
      setHistory(dbEvents as HistoryEvent[]);
    } catch (err) {
      console.error('Erro ao buscar histórico:', err);
    }
  };

  const addHistory = async (description: string, type: HistoryEvent['type']) => {
    const newEvent = {
        id: Math.random().toString(36).substr(2, 9),
        date: new Date().toISOString(),
        description,
        type
    };

    try {
      await supabase.from('history_events').insert([newEvent]);
      setHistory(prev => [newEvent, ...prev]);
    } catch (err) {
      console.error('Erro ao salvar histórico no banco:', err);
      // Fallback local
      setHistory(prev => [newEvent, ...prev]);
    }
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
        fetchOrders();
        fetchHistory();
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
        fetchOrders();
        fetchHistory();
      } else {
        setProfile(null);
        setIsLoadingAuth(false);
        setData([]);
        setHistory([]);
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

  const availableClients = useMemo(() => {
    const clients = new Set(data.map(d => d.cliente));
    return Array.from(clients).sort();
  }, [data]);

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
      const matchesClient = clientFilter === 'Todos' || order.cliente === clientFilter;
      const searchLower = searchTerm.toLowerCase();
      const matchesSearch =
        order.cc.toLowerCase().includes(searchLower) ||
        order.cliente.toLowerCase().includes(searchLower) ||
        order.sonda.toLowerCase().includes(searchLower) ||
        order.produto.toLowerCase().includes(searchLower);

      return matchesCategory && matchesSystem && matchesStatus && matchesSonda && matchesClient && matchesSearch;
    });

    // Sort so PENDENTE is always at the top
    return filtered.sort((a, b) => {
      if (a.status === 'PENDENTE' && b.status === 'ATENDIDO') return -1;
      if (a.status === 'ATENDIDO' && b.status === 'PENDENTE') return 1;
      return 0;
    });
  }, [computedData, activeCategory, systemFilter, statusFilter, sondaFilter, clientFilter, searchTerm]);

  // Improved update function using ID
  const updateDataById = async (id: string, columnId: string, value: unknown) => {
    const today = new Date().toISOString().split('T')[0];
    const updates: any = { [columnId]: value };

    // Find current row to handle auto-fill logic
    const row = data.find(r => r.id === id);
    if (!row) return;

    if (columnId === 'qtdAtendida' && Number(value) > 0 && !row.dataAtendimentoInicio) {
        updates.dataAtendimentoInicio = today;
    }
    if (columnId === 'qtdAtendida' && Number(value) >= row.qtdSolicitada && !row.dataAtendimentoFinal) {
        updates.dataAtendimentoFinal = today;
    }

    try {
      // Map back to DB field names
      const dbUpdates: any = {};
      if (columnId === 'qtdSolicitada') dbUpdates.qtd_solicitada = value;
      else if (columnId === 'qtdAtendida') {
        dbUpdates.qtd_atendida = value;
        if (updates.dataAtendimentoInicio) dbUpdates.data_atendimento_inicio = updates.dataAtendimentoInicio;
        if (updates.dataAtendimentoFinal) dbUpdates.data_atendimento_final = updates.dataAtendimentoFinal;
      }
      else {
        // Map common camelCase to snake_case for standard fields if needed
        const mapping: Record<string, string> = {
          dataNecessidade: 'data_necessidade'
        };
        dbUpdates[mapping[columnId] || columnId] = value;
      }

      const { error } = await supabase.from('orders').update(dbUpdates).eq('id', id);
      if (error) throw error;

      setData((old) =>
        old.map((r) => {
          if (r.id === id) return { ...r, ...updates };
          return r;
        })
      );
      addHistory(`Pedido ${id} atualizado (${columnId}).`, 'UPDATE');
    } catch (err) {
      console.error('Erro ao atualizar no banco:', err);
    }
  };

  const handleAddOrder = async (newOrder: Order) => {
    try {
      const dbOrder = {
        id: newOrder.id,
        codigo: newOrder.codigo,
        cc: newOrder.cc,
        cliente: newOrder.cliente,
        sistema: newOrder.sistema,
        sonda: newOrder.sonda,
        produto: newOrder.produto,
        qtd_solicitada: newOrder.qtdSolicitada,
        qtd_atendida: newOrder.qtdAtendida,
        data_necessidade: newOrder.dataNecessidade,
        data_atendimento_inicio: newOrder.dataAtendimentoInicio,
        data_atendimento_final: newOrder.dataAtendimentoFinal,
        categoria: newOrder.categoria
      };

      const { error } = await supabase.from('orders').insert([dbOrder]);
      if (error) throw error;

      setData((prev) => [newOrder, ...prev]);
      addHistory(`Novo pedido ${newOrder.id} criado para ${newOrder.cliente}.`, 'CREATE');
    } catch (err) {
      console.error('Erro ao criar pedido no banco:', err);
    }
  };

  const handleImportOrders = async (newOrders: Order[]) => {
    try {
      const dbOrders = newOrders.map(o => ({
        id: o.id,
        codigo: o.codigo,
        cc: o.cc,
        cliente: o.cliente,
        sistema: o.sistema,
        sonda: o.sonda,
        produto: o.produto,
        qtd_solicitada: o.qtdSolicitada,
        qtd_atendida: o.qtdAtendida,
        data_necessidade: o.dataNecessidade,
        data_atendimento_inicio: o.dataAtendimentoInicio,
        data_atendimento_final: o.dataAtendimentoFinal,
        categoria: o.categoria
      }));

      const { error } = await supabase.from('orders').insert(dbOrders);
      if (error) throw error;

      setData((prev) => [...newOrders, ...prev]);
      addHistory(`${newOrders.length} pedidos importados via planilha.`, 'IMPORT');
    } catch (err) {
      console.error('Erro ao importar pedidos no banco:', err);
    }
  };

  const handleSyncWithCloud = async () => {
    try {
      const dbOrders = initialData.map(o => ({
        id: o.id,
        codigo: o.codigo,
        cc: o.cc,
        cliente: o.cliente,
        sistema: o.sistema,
        sonda: o.sonda,
        produto: o.produto,
        qtd_solicitada: o.qtdSolicitada,
        qtd_atendida: o.qtdAtendida,
        data_necessidade: o.dataNecessidade,
        data_atendimento_inicio: o.dataAtendimentoInicio,
        data_atendimento_final: o.dataAtendimentoFinal,
        categoria: o.categoria
      }));

      const { error } = await supabase.from('orders').upsert(dbOrders);
      if (error) throw error;
      
      await fetchOrders();
      addHistory('Dados iniciais sincronizados com a nuvem', 'IMPORT');
    } catch (err) {
      console.error('Erro ao sincronizar com nuvem:', err);
      throw err;
    }
  };

  const handleEditOrder = async (updatedOrder: Order) => {
    try {
      const dbOrder = {
        codigo: updatedOrder.codigo,
        cc: updatedOrder.cc,
        cliente: updatedOrder.cliente,
        sistema: updatedOrder.sistema,
        sonda: updatedOrder.sonda,
        produto: updatedOrder.produto,
        qtd_solicitada: updatedOrder.qtdSolicitada,
        qtd_atendida: updatedOrder.qtdAtendida,
        data_necessidade: updatedOrder.dataNecessidade,
        data_atendimento_inicio: updatedOrder.dataAtendimentoInicio,
        data_atendimento_final: updatedOrder.dataAtendimentoFinal,
        categoria: updatedOrder.categoria
      };

      const { error } = await supabase.from('orders').update(dbOrder).eq('id', updatedOrder.id);
      if (error) throw error;

      setData((prev) =>
        prev.map((order) => (order.id === updatedOrder.id ? updatedOrder : order))
      );
      addHistory(`Pedido ${updatedOrder.id} editado.`, 'UPDATE');
      setOrderToEdit(null);
    } catch (err) {
      console.error('Erro ao editar pedido no banco:', err);
    }
  };

  const handleClearAllData = async () => {
    try {
      // DELETE ALL requires a filter in Supabase client for safety, neq('id', '0') is common
      const { error: ordersError } = await supabase.from('orders').delete().neq('id', 'placeholder');
      if (ordersError) throw ordersError;

      const { error: historyError } = await supabase.from('history_events').delete().neq('id', 'placeholder');
      if (historyError) throw historyError;

      setData([]);
      setHistory([]);
      addHistory('Todos os dados foram apagados permanentemente do sistema.', 'DELETE');
    } catch (err) {
      console.error('Erro ao limpar banco de dados:', err);
      alert('Houve um erro ao apagar os dados no servidor.');
    }
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
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent flex rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!session) {
    return <Auth />;
  }

  return (
    <div className="flex flex-col h-screen bg-gradient-to-b from-slate-900 via-slate-700 to-white font-sans text-slate-900 overflow-hidden">
      <div className="shrink-0">
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
          exportData={filteredData}
        />
        <FilterBar
          systemFilter={systemFilter}
          setSystemFilter={setSystemFilter}
          statusFilter={statusFilter}
          setStatusFilter={setStatusFilter}
          sondaFilter={sondaFilter}
          setSondaFilter={setSondaFilter}
          availableSondas={availableSondas}
          clientFilter={clientFilter}
          setClientFilter={setClientFilter}
          availableClients={availableClients}
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
                <p className="text-sm text-slate-400 mt-1">
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
                    density={density}
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
        onClearData={handleClearAllData}
        onRestoreData={() => fetchOrders()}
        theme={theme}
        onThemeChange={setTheme}
        density={density}
        onDensityChange={setDensity}
        onSyncWithCloud={handleSyncWithCloud}
      />
    </div>
  );
}
