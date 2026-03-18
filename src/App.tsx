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
import { HistoryDashboard } from './components/HistoryDashboard';
import { supabase } from './lib/supabase';
import { initialData } from './data';
import { Order, ComputedOrder, Category, System, HistoryEvent, ViewMode, HistorySubgroup } from './types';
import { Session } from '@supabase/supabase-js';
import { Profile, SondaHistorico } from './types';

export default function App() {
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [isLoadingAuth, setIsLoadingAuth] = useState(true);
  const [isOnline, setIsOnline] = useState(true);
  const [data, setData] = useState<Order[]>([]);
  const [history, setHistory] = useState<HistoryEvent[]>([]);
  const [sondaHistorico, setSondaHistorico] = useState<SondaHistorico[]>([]);
  const [activeCategory, setActiveCategory] = useState<Category | 'Geral'>('Geral');
  const [searchTerm, setSearchTerm] = useState('');
  const [systemFilter, setSystemFilter] = useState<System | 'Todos'>('Todos');
  const [statusFilter, setStatusFilter] = useState<'Todos' | 'PENDENTE' | 'ATENDIDO'>('Todos');
  const [sondaFilter, setSondaFilter] = useState<string>('Todos');
  const [clientFilter, setClientFilter] = useState<string>('Todos');
  const [typeFilter, setTypeFilter] = useState<'Todas' | 'Hastes' | 'Revestimento'>('Todas');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [isSettingsModalOpen, setIsSettingsModalOpen] = useState(false);
  const [orderToEdit, setOrderToEdit] = useState<Order | null>(null);
  const [viewMode, setViewMode] = useState<ViewMode>('management');
  const [activeHistorySubgroup, setActiveHistorySubgroup] = useState<HistorySubgroup>('sondas');
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
        categoria: o.categoria,
        profundidadeFuro: o.profundidade_furo,
        tag: o.tag,
        modelo: o.modelo,
        descricao_sonda: o.descricao_sonda,
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

  const fetchSondaHistorico = async () => {
    try {
      const { data: rows, error } = await supabase
        .from('sonda_historico')
        .select('*')
        .order('data_atendimento', { ascending: false });
      if (error) throw error;
      setSondaHistorico(rows as SondaHistorico[]);
    } catch (err) {
      console.error('Erro ao buscar histórico de sondas:', err);
    }
  };

  const recordSondaAtendimento = useCallback(async (order: Order) => {
    if (!order.sonda || !order.sonda.trim()) return;
    const today = new Date().toISOString().split('T')[0];
    const userName = profile?.full_name || profile?.email || 'Sistema';
    const entry = {
      sonda: order.sonda.trim(),
      data_atendimento: today,
      pedido_id: order.id,
      produto: order.produto,
      cc: order.cc,
      cliente: order.cliente,
      qtd_atendida: order.qtdAtendida,
      user_name: userName,
      descricao_sonda: order.descricao_sonda,
    };
    try {
      const { data: inserted, error } = await supabase.from('sonda_historico').insert([entry]).select();
      if (error) throw error;
      if (inserted) setSondaHistorico(prev => [inserted[0] as SondaHistorico, ...prev]);
    } catch (err) {
      console.error('Erro ao registrar histórico de sonda:', err);
    }
  }, [profile]);

  const addHistory = useCallback(async (description: string, type: HistoryEvent['type']) => {
    const userName = profile?.full_name || profile?.email || 'Sistema';
    const newEvent = {
        id: Math.random().toString(36).substr(2, 9),
        date: new Date().toISOString(),
        description,
        type,
        user_name: userName
    };

    try {
      const dbEvent = {
        id: newEvent.id,
        date: newEvent.date,
        description: newEvent.description,
        type: newEvent.type,
        user_name: newEvent.user_name
      };

      await supabase.from('history_events').insert([dbEvent]);
      setHistory(prev => [newEvent, ...prev]);
    } catch (err) {
      console.error('Erro ao salvar histórico no banco:', err);
      // Fallback local
      setHistory(prev => [newEvent, ...prev]);
    }
  }, [profile]);

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
        fetchSondaHistorico();
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
        fetchSondaHistorico();
      } else {
        setProfile(null);
        setIsLoadingAuth(false);
        setData([]);
        setHistory([]);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  // Monitor Connection & Realtime Sync
  useEffect(() => {
    // 1. Monitor Online/Offline status
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // 2. Realtime Subscription for 'orders' table
    const channel = supabase
      .channel('schema-db-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'orders',
        },
        (payload) => {
          console.log('Change received!', payload);

          const mapRow = (o: any): Order => ({
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
            categoria: o.categoria,
            profundidadeFuro: o.profundidade_furo,
            tag: o.tag,
            modelo: o.modelo,
            descricao_sonda: o.descricao_sonda,
          });

          if (payload.eventType === 'INSERT') {
            const newOrder = mapRow(payload.new);
            setData(prev => {
              if (prev.some(r => r.id === newOrder.id)) return prev;
              return [newOrder, ...prev];
            });
          } else if (payload.eventType === 'UPDATE') {
            const updated = mapRow(payload.new);
            setData(prev => prev.map(r => r.id === updated.id ? updated : r));
          } else if (payload.eventType === 'DELETE') {
            setData(prev => prev.filter(r => r.id !== payload.old.id));
          }
        }
      )
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'history_events',
        },
        () => {
          fetchHistory();
        }
      )
      .subscribe((status) => {
        if (status === 'SUBSCRIBED') {
          console.log('Realtime connected!');
        }
      });

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
      supabase.removeChannel(channel);
    };
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
      const matchesType = 
        typeFilter === 'Todas' ||
        (typeFilter === 'Hastes' && order.categoria.startsWith('Hastes')) ||
        (typeFilter === 'Revestimento' && order.categoria.startsWith('Revestimentos'));
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

      return matchesCategory && matchesType && matchesSystem && matchesStatus && matchesSonda && matchesClient && matchesSearch;
    });

    // Sort so PENDENTE is always at the top
    return filtered.sort((a, b) => {
      if (a.status === 'PENDENTE' && b.status === 'ATENDIDO') return -1;
      if (a.status === 'ATENDIDO' && b.status === 'PENDENTE') return 1;
      return 0;
    });
  }, [computedData, activeCategory, typeFilter, systemFilter, statusFilter, sondaFilter, clientFilter, searchTerm]);

  // Improved update function using ID
  const updateDataById = useCallback(async (id: string, columnId: string, value: unknown) => {
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
          dataNecessidade: 'data_necessidade',
          profundidadeFuro: 'profundidade_furo'
        };
        dbUpdates[mapping[columnId] || columnId] = value;
      }

      const { error } = await supabase.from('orders').update(dbUpdates).eq('id', id);
      if (error) throw error;

      const updatedRow = { ...row, ...updates };
      setData((old) =>
        old.map((r) => {
          if (r.id === id) return updatedRow;
          return r;
        })
      );

      // Se atualizou qtdAtendida, registrar no histórico de sonda
      if (columnId === 'qtdAtendida' && Number(value) > 0 && row.sonda && row.sonda.trim()) {
        await recordSondaAtendimento(updatedRow);
      }
      addHistory(`Pedido ${id} atualizado (${columnId}).`, 'UPDATE');
    } catch (err) {
      console.error('Erro ao atualizar no banco:', err);
    }
  }, [data, recordSondaAtendimento, addHistory]);

  const handleAddOrder = useCallback(async (newOrder: Order) => {
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
        categoria: newOrder.categoria,
        profundidade_furo: newOrder.profundidadeFuro,
        tag: newOrder.tag,
        modelo: newOrder.modelo,
        descricao_sonda: newOrder.descricao_sonda,
      };

      const { error } = await supabase.from('orders').insert([dbOrder]);
      if (error) throw error;

      setData((prev) => [newOrder, ...prev]);
      addHistory(`Novo pedido ${newOrder.id} criado para ${newOrder.cliente}.`, 'CREATE');
    } catch (err) {
      console.error('Erro ao criar pedido no banco:', err);
    }
  }, [addHistory]);

  const handleImportOrders = useCallback(async (newOrders: Order[]) => {
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
        categoria: o.categoria,
        profundidade_furo: o.profundidadeFuro,
        tag: o.tag,
        modelo: o.modelo,
        descricao_sonda: o.descricao_sonda,
      }));

      const { error } = await supabase.from('orders').insert(dbOrders);
      if (error) throw error;

      // Import attended items into history
      const historyRecords = newOrders
        .filter(o => o.qtdAtendida > 0)
        .map(o => ({
          sonda: o.sonda,
          descricao_sonda: o.descricao_sonda,
          pedido_id: o.id,
          produto: o.produto,
          cc: o.cc,
          cliente: o.cliente,
          qtd_atendida: o.qtdAtendida,
          data_atendimento: o.dataAtendimentoFinal || o.dataAtendimentoInicio || new Date().toISOString().split('T')[0],
          user_name: profile?.full_name || 'Sistema (Importação)'
        }));

      if (historyRecords.length > 0) {
        const { error: histError } = await supabase.from('sonda_historico').insert(historyRecords);
        if (histError) console.error('Erro ao importar historico:', histError);
        else fetchSondaHistorico();
      }

      setData((prev) => [...newOrders, ...prev]);
      addHistory(`${newOrders.length} pedidos importados via planilha.`, 'IMPORT');
    } catch (err: any) {
      console.error('Erro ao importar pedidos no banco:', err);
      alert(`Erro ao salvar pedidos: ${err.message || 'Erro desconhecido'}`);
      throw err; // Re-throw para o modal tratar se necessário
    }
  }, [profile, fetchSondaHistorico, addHistory]);

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
        categoria: o.categoria,
        profundidade_furo: o.profundidadeFuro
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

  const handleEditOrder = useCallback(async (updatedOrder: Order) => {
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
        categoria: updatedOrder.categoria,
        profundidade_furo: updatedOrder.profundidadeFuro,
        tag: updatedOrder.tag,
        modelo: updatedOrder.modelo,
        descricao_sonda: updatedOrder.descricao_sonda,
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
  }, [addHistory]);

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

  const handleClearHistory = async () => {
    if (!window.confirm('Tem certeza que deseja apagar todo o histórico de movimentação? Esta ação não pode ser desfeita.')) {
      return;
    }

    try {
      // Use empty UUID for uuid fields to avoid conversion errors
      const { error: histError } = await supabase.from('sonda_historico').delete().neq('id', '00000000-0000-0000-0000-000000000000');
      if (histError) throw histError;

      const { error: eventsError } = await supabase.from('history_events').delete().neq('id', 'placeholder');
      if (eventsError) throw eventsError;

      setSondaHistorico([]);
      setHistory([]);
      addHistory('Todo o histórico de movimentação foi apagado pelo usuário.', 'DELETE');
    } catch (err) {
      console.error('Erro ao limpar histórico:', err);
      alert('Houve um erro ao apagar o histórico no servidor. Verifique se você tem permissão.');
    }
  };

  const handleDeleteHistoryItem = async (id: string, type: 'event' | 'sonda') => {
    if (!window.confirm('Tem certeza que deseja excluir este registro?')) {
      return;
    }

    try {
      const table = type === 'event' ? 'history_events' : 'sonda_historico';
      const { error } = await supabase.from(table).delete().eq('id', id);
      if (error) throw error;

      if (type === 'event') {
        setHistory(prev => prev.filter(h => h.id !== id));
      } else {
        setSondaHistorico(prev => prev.filter(h => h.id !== id));
      }
    } catch (err) {
      console.error('Erro ao excluir item do histórico:', err);
      alert('Houve um erro ao apagar o registro no servidor.');
    }
  };

  const openEditModal = useCallback((order: Order) => {
    setOrderToEdit(order);
    setIsModalOpen(true);
  }, []);

  const closeOrderModal = useCallback(() => {
    setIsModalOpen(false);
    setOrderToEdit(null);
  }, []);

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
          isOnline={isOnline}
          viewMode={viewMode}
          setViewMode={setViewMode}
          activeHistorySubgroup={activeHistorySubgroup}
          setHistorySubgroup={setActiveHistorySubgroup}
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
          typeFilter={typeFilter}
          setTypeFilter={setTypeFilter}
        />
      </div>
      
      <div className="flex-1 flex flex-col overflow-hidden">
        <main className="flex-1 overflow-y-auto relative">
          <div className="relative z-10 flex flex-col p-4 sm:p-6 lg:p-8 min-h-full">
            <div className="max-w-[1600px] mx-auto w-full flex-1 flex flex-col space-y-6 lg:space-y-8">
              {viewMode === 'management' ? (
                <>
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
                        activeCategory={activeCategory}
                        typeFilter={typeFilter}
                      />
                    </div>
                  </div>
                </>
              ) : (
                <HistoryDashboard 
                  activeSubgroup={activeHistorySubgroup}
                  data={data}
                  history={history}
                  sondaHistorico={sondaHistorico}
                  onClearHistory={handleClearHistory}
                  onDeleteHistoryItem={handleDeleteHistoryItem}
                />
              )}
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
        data={data}
        sondaHistorico={sondaHistorico}
      />

      <ImportModal 
        isOpen={isImportModalOpen}
        onClose={() => setIsImportModalOpen(false)}
        onImport={handleImportOrders}
        data={data}
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
