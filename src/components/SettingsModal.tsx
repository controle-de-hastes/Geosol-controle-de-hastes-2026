import React, { useState, useEffect } from 'react';
import { 
  X, Download, Trash2, AlertTriangle, Settings as SettingsIcon, 
  User, Palette, Bell, Database, Save, Check, Monitor, Moon, Sun, History,
  RefreshCcw, Shield, PlusCircle, Search, Pencil, Edit3, FileDown, Trash, Users,
  Eye, EyeOff, Briefcase, FileSpreadsheet, Upload, UserPlus, Plus, Key
} from 'lucide-react';
import { Order, HistoryEvent, Profile, Cliente } from '../types';
import { supabase } from '../lib/supabase';
import { createClient } from '@supabase/supabase-js';
import * as XLSX from 'xlsx';
import { downloadClienteTemplate } from '../lib/excelUtils';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  data: Order[];
  history: HistoryEvent[];
  onClearData: () => void;
  onRestoreData?: (data: Order[]) => void;
  profile: Profile | null;
  theme: 'light' | 'dark' | 'system';
  onThemeChange: (theme: 'light' | 'dark' | 'system') => void;
  density: 'standard' | 'compact';
  onDensityChange: (density: 'standard' | 'compact') => void;
  onSyncWithCloud?: () => Promise<void>;
  clientes: Cliente[];
  onRefreshClientes: () => Promise<void>;
}

type TabId = 'perfil' | 'usuarios' | 'dados' | 'historico' | 'clientes';

export function SettingsModal({ 
  isOpen, onClose, data, history, onClearData, onRestoreData, profile, 
  theme, onThemeChange, density, onDensityChange, onSyncWithCloud,
  clientes, onRefreshClientes
}: SettingsModalProps) {
  const [activeTab, setActiveTab] = useState<TabId>('perfil');
  const [showConfirmClear, setShowConfirmClear] = useState(false);
  const [showProfilePassword, setShowProfilePassword] = useState(false);
  const [showNewUserPassword, setShowNewUserPassword] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);
  const [saveError, setSaveError] = useState('');
  const [usersList, setUsersList] = useState<Profile[]>([]);
  const [isLoadingUsers, setIsLoadingUsers] = useState(false);

  // State for new user
  const [newUserEmail, setNewUserEmail] = useState('');
  const [newUserPassword, setNewUserPassword] = useState('');
  const [newUserName, setNewUserName] = useState('');
  const [newUserRole, setNewUserRole] = useState<'admin' | 'user'>('user');
  const [isCreatingUser, setIsCreatingUser] = useState(false);
  const [createUserError, setCreateUserError] = useState('');
  const [createUserSuccess, setCreateUserSuccess] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncSuccess, setSyncSuccess] = useState(false);

  // State for inline user editing
  const [editingUserId, setEditingUserId] = useState<string | null>(null);
  const [editingUserName, setEditingUserName] = useState('');
  const [isDeletingUserId, setIsDeletingUserId] = useState<string | null>(null);
  const [isResettingPasswordId, setIsResettingPasswordId] = useState<string | null>(null);

  // State for clientes
  const [newClienteName, setNewClienteName] = useState('');
  const [newClienteCC, setNewClienteCC] = useState('');
  const [isCreatingCliente, setIsCreatingCliente] = useState(false);
  const [isDeletingClienteId, setIsDeletingClienteId] = useState<string | null>(null);
  const [isImportingClientes, setIsImportingClientes] = useState(false);
  const isLoadingClientes = false; // Podemos adicionar suporte a loading global depois se necessário


  const isAdmin = profile?.role === 'admin';

  // State for current profile form
  const [currentProfile, setCurrentProfile] = useState({
    name: profile?.full_name || profile?.email?.split('@')[0] || 'Usuário',
    email: profile?.email || '',
    password: '',
    role: profile?.role === 'admin' ? 'Administrador' : 'Usuário Padrão'
  });

  useEffect(() => {
    if (profile) {
      setCurrentProfile({
        name: profile.full_name || profile.email.split('@')[0],
        email: profile.email,
        password: '',
        role: profile.role === 'admin' ? 'Administrador' : 'Usuário Padrão'
      });
    }
  }, [profile]);

  useEffect(() => {
    if (activeTab === 'usuarios' && isAdmin) {
      fetchUsers();
    } else if (activeTab === 'clientes') {
      onRefreshClientes();
    }
  }, [activeTab, isAdmin]);

  const fetchUsers = async () => {
    setIsLoadingUsers(true);
    const { data: profilesData, error } = await supabase
      .from('profiles')
      .select('*')
      .order('created_at', { ascending: true });
    
    if (!error && profilesData) {
      setUsersList(profilesData as Profile[]);
    }
    setIsLoadingUsers(false);
  };

  const updateUserRole = async (userId: string, newRole: 'admin' | 'user') => {
    const { error } = await supabase
      .from('profiles')
      .update({ role: newRole })
      .eq('id', userId);
      
    if (!error) {
      fetchUsers(); // Refresh the list
    } else {
      alert('Erro ao atualizar permissão do usuário.');
    }
  };

  const saveEditedUserName = async (userId: string) => {
    const { error } = await supabase
      .from('profiles')
      .update({ full_name: editingUserName })
      .eq('id', userId);
      
    if (!error) {
      fetchUsers();
    } else {
      alert('Erro ao atualizar o nome do usuário.');
    }
    setEditingUserId(null);
  };

  const handleDeleteUser = async (userId: string) => {
    try {
      if (userId === profile?.id) {
        alert('Você não pode se excluir.');
        return;
      }

      setIsDeletingUserId(userId);
      // deleting from profiles table
      const { error } = await supabase
        .from('profiles')
        .delete()
        .eq('id', userId);

      if (error) throw error;
      
      setUsersList(prev => prev.filter(u => u.id !== userId));
      alert('Perfil de usuário excluído com sucesso.');
    } catch (err: any) {
      console.error('Erro ao excluir usuário:', err);
      alert('Erro ao excluir perfil de usuário: ' + (err.message || 'Erro desconhecido'));
    } finally {
      setIsDeletingUserId(null);
    }
  };
  
  const handleResetPassword = async (userId: string, userEmail: string) => {
    if (!confirm(`Tem certeza que deseja resetar a senha de ${userEmail} para "geosol"?`)) {
      return;
    }
    
    setIsResettingPasswordId(userId);
    try {
      const { data, error } = await supabase.functions.invoke('reset-user-password', {
        body: { userId }
      });
      
      if (error) {
        // Log error with more details if it's a function error
        console.error('Erro detalhado na Edge Function:', error);
        throw error;
      }
      
      alert(`Senha de ${userEmail} foi resetada para "geosol" com sucesso!`);
    } catch (err: any) {
      console.error('Erro ao resetar senha:', err);
      let errorMsg = err.message || 'Erro desconhecido. Verifique se as Edge Functions estão ativas.';
      if (err.context && typeof err.context.json === 'function') {
        try {
          const body = await err.context.json();
          if (body.error) errorMsg = body.error;
        } catch (e) {}
      }
      alert('Erro ao resetar senha: ' + errorMsg);
    } finally {
      setIsResettingPasswordId(userId === isResettingPasswordId ? null : isResettingPasswordId);
      // Wait, let's just use:
      setIsResettingPasswordId(null);
    }
  };

  const handleCreateCliente = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newClienteName.trim()) return;

    setIsCreatingCliente(true);
    const { error } = await supabase
      .from('clientes')
      .insert([{ 
        nome: newClienteName.trim().toUpperCase(), 
        cc: newClienteCC.trim().toUpperCase() 
      }]);

    if (!error) {
      await onRefreshClientes();
      setNewClienteName('');
      setNewClienteCC('');
    } else {
      alert('Erro ao criar cliente.');
    }
    setIsCreatingCliente(false);
  };

  const handleImportClientesFromExcel = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsImportingClientes(true);
    const reader = new FileReader();
    reader.onload = async (event) => {
      try {
        const data = new Uint8Array(event.target?.result as ArrayBuffer);
        const workbook = XLSX.read(data, { type: 'array' });
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        const jsonData: any[] = XLSX.utils.sheet_to_json(worksheet);

        if (jsonData.length === 0) {
          alert('O arquivo está vazio.');
          return;
        }

        const clientesToImport = jsonData.map(row => ({
          nome: (row['Nome'] || row['Cliente'] || '').toString().trim().toUpperCase(),
          cc: (row['Centro Custo'] || row['CC'] || '').toString().trim().toUpperCase()
        })).filter(c => c.nome);

        if (clientesToImport.length > 0) {
          const { error } = await supabase.from('clientes').insert(clientesToImport);
          if (error) throw error;
          await onRefreshClientes();
          alert(`${clientesToImport.length} clientes importados com sucesso!`);
        }
      } catch (err: any) {
        console.error('Erro ao importar clientes:', err);
        alert('Erro ao processar arquivo: ' + (err.message || 'Erro desconhecido'));
      } finally {
        setIsImportingClientes(false);
        if (e.target) e.target.value = '';
      }
    };
    reader.readAsArrayBuffer(file);
  };

  const handleDeleteCliente = async (clienteId: string) => {
    if (!confirm('Tem certeza que deseja excluir este cliente?')) return;
    
    setIsDeletingClienteId(clienteId);
    const { error } = await supabase
      .from('clientes')
      .delete()
      .eq('id', clienteId);

    if (!error) {
      await onRefreshClientes();
    } else {
      alert('Erro ao excluir cliente.');
    }
    setIsDeletingClienteId(null);
  };

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsCreatingUser(true);
    setCreateUserError('');
    setCreateUserSuccess(false);

    try {
      const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
      const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

      if (!supabaseUrl || !supabaseAnonKey) {
        throw new Error('Configuração do Supabase ausente.');
      }

      // Create a temporary client that doesn't persist the session
      const tempSupabase = createClient(supabaseUrl, supabaseAnonKey, {
        auth: {
          persistSession: false,
          autoRefreshToken: false,
          detectSessionInUrl: false
        }
      });

      const { data, error } = await tempSupabase.auth.signUp({
        email: newUserEmail,
        password: newUserPassword,
      });

      if (error) throw error;
      
      if (data.user) {
        // Update the profile role right after creation using the admin's regular client
        const { error: roleError } = await supabase
          .from('profiles')
          .update({ 
            role: newUserRole,
            full_name: newUserName || newUserEmail.split('@')[0]
          })
          .eq('id', data.user.id);
        
        if (roleError) {
          console.error("Erro ao definir permissão e nome inicial:", roleError);
        }

        setCreateUserSuccess(true);
        setNewUserEmail('');
        setNewUserPassword('');
        setNewUserName('');
        setNewUserRole('user');
        
        // Refresh the list
        fetchUsers();
        setTimeout(() => setCreateUserSuccess(false), 3000);
      }
    } catch (error: any) {
      setCreateUserError(error.message || 'Erro ao criar usuário');
    } finally {
      setIsCreatingUser(false);
    }
  };

  if (!isOpen) return null;

  const handleExportJson = () => {
    const dataStr = JSON.stringify(data, null, 2);
    const blob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `geosol_backup_${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const handleSyncToCloud = async () => {
    if (!onSyncWithCloud) return;
    setIsSyncing(true);
    setSaveError('');
    try {
      await onSyncWithCloud();
      setSyncSuccess(true);
      setTimeout(() => setSyncSuccess(false), 3000);
    } catch (err: any) {
      setSaveError(err.message || 'Erro ao sincronizar dados.');
    } finally {
      setIsSyncing(false);
    }
  };

  const handleClearData = () => {
    onClearData();
    setShowConfirmClear(false);
    onClose();
  };

  const handleRestoreJson = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (e) => {
      try {
        const content = e.target?.result as string;
        const restoredData: Order[] = JSON.parse(content);

        // Validation: Expecting an array of orders
        if (!Array.isArray(restoredData)) {
          throw new Error('O arquivo de backup é inválido.');
        }

        setIsSaving(true);
        setSaveError('');

        // Prepare data for Supabase
        const dbOrders = restoredData.map(o => ({
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

        // Upsert data to Supabase
        const { error } = await supabase.from('orders').upsert(dbOrders);
        
        if (error) throw error;

        if (onRestoreData) {
          onRestoreData(restoredData);
        }

        setSavedSuccess(true);
        setTimeout(() => setSavedSuccess(false), 3000);
        alert('Backup restaurado com sucesso!');
        onClose();
      } catch (err: any) {
        console.error('Erro ao restaurar backup:', err);
        setSaveError(err.message || 'Erro ao processar o arquivo de backup.');
      } finally {
        setIsSaving(false);
      }
    };
    reader.readAsText(file);
    
    // Reset file input
    event.target.value = '';
  };

  const handleSaveProfile = async () => {
    setIsSaving(true);
    setSaveError('');
    setSavedSuccess(false);

    try {
      let isNameUpdated = false;
      let isAuthUpdated = false;

      // 1. Update name in profiles table first so it doesn't get blocked by auth errors
      if (profile?.id && currentProfile.name !== profile?.full_name) {
        const { error: dbError } = await supabase
          .from('profiles')
          .update({ full_name: currentProfile.name })
          .eq('id', profile.id);

        if (dbError) throw dbError;
        isNameUpdated = true;
      }

      // 2. Update auth (email/password) if changed
      const authUpdates: { email?: string, password?: string } = {};
      
      if (currentProfile.email !== profile?.email) {
        authUpdates.email = currentProfile.email;
      }
      
      if (currentProfile.password && currentProfile.password.trim() !== '') {
        if (currentProfile.password.length < 6) {
          throw new Error('A nova senha deve ter pelo menos 6 caracteres.');
        }
        authUpdates.password = currentProfile.password;
      }

      if (Object.keys(authUpdates).length > 0) {
        const { error } = await supabase.auth.updateUser(authUpdates);
        
        // If the error is about the password being the same, and we only changed the name, we can ignore it
        // But since we use autoComplete="new-password", this shouldn't happen unless they typed the old one.
        if (error) {
          // If we successfully updated the name, we shouldn't throw away that fact. 
          // We will throw the error to inform them, but the name is already saved.
          throw error;
        }
        
        if (authUpdates.email) {
          alert('Foi enviado um e-mail de confirmação para o novo e antigo endereço de e-mail. Para segurança, os e-mails só serão alterados após a verificação em ambos.');
        }
        isAuthUpdated = true;
      }

      // If we didn't update anything, just show success directly
      setSavedSuccess(true);
      setCurrentProfile(prev => ({ ...prev, password: '' })); // Clear password field
      setTimeout(() => setSavedSuccess(false), 3000);
      
    } catch (error: any) {
      // Supabase specific translation for same password error
      if (error.message && error.message.includes('different from the old password')) {
        setSaveError('A nova senha não pode ser igual à senha atual.');
      } else {
        setSaveError(error.message || 'Erro ao atualizar o perfil.');
      }
    } finally {
      setIsSaving(false);
    }
  };

  const allTabs = [
    { id: 'perfil', label: 'Meu Perfil', icon: User, show: true },
    { id: 'clientes', label: 'Controle de Clientes', icon: Briefcase, show: isAdmin },
    { id: 'usuarios', label: 'Gerenciar Usuários', icon: Users, show: isAdmin },
    { id: 'dados', label: 'Dados e Backup', icon: Database, show: isAdmin },
    { id: 'historico', label: 'Histórico', icon: History, show: isAdmin },
  ] as const;

  const visibleTabs = allTabs.filter(tab => tab.show);

  const getHistoryIcon = (type: HistoryEvent['type']) => {
    switch (type) {
      case 'CREATE': return <PlusCircle className="w-4 h-4 text-emerald-500" />;
      case 'UPDATE': return <Edit3 className="w-4 h-4 text-blue-500" />;
      case 'DELETE': return <Trash className="w-4 h-4 text-red-500" />;
      case 'IMPORT': return <FileDown className="w-4 h-4 text-purple-500" />;
      default: return <History className="w-4 h-4 text-slate-500" />;
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-4xl h-[600px] flex flex-col overflow-hidden animate-in fade-in zoom-in duration-200">
        
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between bg-white shrink-0">
          <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2">
            <SettingsIcon className="w-5 h-5 text-slate-600" />
            Configurações do Sistema
          </h3>
          <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-full transition-colors">
            <X className="w-5 h-5 text-slate-500" />
          </button>
        </div>

        {/* Body */}
        <div className="flex flex-1 overflow-hidden">
          {/* Sidebar */}
          <div className="w-64 bg-slate-50 border-r border-slate-200 p-4 space-y-1 overflow-y-auto shrink-0">
            {visibleTabs.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as TabId)}
                  className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                    isActive 
                      ? 'bg-blue-50 text-blue-700' 
                      : 'text-slate-600 hover:bg-slate-200/50 hover:text-slate-900'
                  }`}
                >
                  <Icon className={`w-4 h-4 ${isActive ? 'text-blue-600' : 'text-slate-400'}`} />
                  {tab.label}
                </button>
              );
            })}
          </div>

          {/* Content Area */}
          <div className="flex-1 overflow-y-auto p-8 bg-white">
            <div className="max-w-2xl">
              
              {/* PERFIL */}
              {activeTab === 'perfil' && (
                <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-300">
                  <div>
                    <h4 className="text-lg font-bold text-slate-800">Meu Perfil</h4>
                    <p className="text-sm text-slate-500">Informações da sua conta.</p>
                  </div>
                  
                  <div className="flex items-center gap-6 pb-6 border-b border-slate-100">
                    <div className="w-20 h-20 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-2xl font-bold uppercase">
                      {currentProfile.name.charAt(0)}
                    </div>
                  </div>

                  <form className="space-y-4" autoComplete="off">
                    {saveError && (
                      <div className="p-3 bg-red-100 text-red-600 rounded-lg text-sm border border-red-200">
                        {saveError}
                      </div>
                    )}
                    <div className="grid gap-2">
                      <label className="text-sm font-medium text-slate-700">Nome Completo</label>
                      <input 
                        type="text" 
                        name="profile-name"
                        value={currentProfile.name}
                        onChange={(e) => setCurrentProfile({...currentProfile, name: e.target.value})}
                        className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                        autoComplete="off"
                        data-lpignore="true"
                      />
                    </div>
                    <div className="grid gap-2">
                      <label className="text-sm font-medium text-slate-700">Identificação / E-mail</label>
                      <input 
                        type="email" 
                        name="profile-email"
                        value={currentProfile.email}
                        onChange={(e) => setCurrentProfile({...currentProfile, email: e.target.value})}
                        className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                        autoComplete="off"
                        data-lpignore="true"
                      />
                      <p className="text-xs text-slate-400">Ao alterar o e-mail, uma confirmação será enviada.</p>
                    </div>
                    <div className="grid gap-2">
                      <label className="text-sm font-medium text-slate-700">Nova Senha</label>
                      <div className="relative">
                        <input 
                          type={showProfilePassword ? 'text' : 'password'}
                          name="profile-new-password"
                          value={currentProfile.password}
                          onChange={(e) => setCurrentProfile({...currentProfile, password: e.target.value})}
                          className="w-full px-3 py-2 pr-10 bg-white border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                          placeholder="Deixe em branco para não alterar"
                          autoComplete="new-password"
                          data-lpignore="true"
                        />
                        <button
                          type="button"
                          onClick={() => setShowProfilePassword(!showProfilePassword)}
                          className="absolute right-2.5 top-1/2 -translate-y-1/2 p-1 text-slate-400 hover:text-slate-600 transition-colors rounded"
                          tabIndex={-1}
                        >
                          {showProfilePassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                      </div>
                    </div>
                    <div className="pt-6 mt-6 border-t border-slate-100 space-y-4">
                      <h5 className="text-sm font-bold text-slate-800">Aparência</h5>
                      
                      <div className="grid grid-cols-2 gap-6">
                        <div className="space-y-2">
                          <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Tema</label>
                          <div className="flex bg-slate-100 p-1 rounded-xl">
                            <button
                              type="button"
                              onClick={() => onThemeChange('light')}
                              className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-lg text-xs font-bold transition-all ${
                                theme === 'light' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'
                              }`}
                            >
                              <Sun className="w-3.5 h-3.5" /> Claro
                            </button>
                            <button
                              type="button"
                              onClick={() => onThemeChange('dark')}
                              className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-lg text-xs font-bold transition-all ${
                                theme === 'dark' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'
                              }`}
                            >
                              <Moon className="w-3.5 h-3.5" /> Escuro
                            </button>
                          </div>
                        </div>

                        <div className="space-y-2">
                          <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Visualização</label>
                          <div className="flex bg-slate-100 p-1 rounded-xl">
                            <button
                              type="button"
                              onClick={() => onDensityChange('standard')}
                              className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-lg text-xs font-bold transition-all ${
                                density === 'standard' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'
                              }`}
                            >
                              Padrão
                            </button>
                            <button
                              type="button"
                              onClick={() => onDensityChange('compact')}
                              className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-lg text-xs font-bold transition-all ${
                                density === 'compact' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'
                              }`}
                            >
                              Compacto
                            </button>
                          </div>
                        </div>
                      </div>

                      <div className="grid gap-2 pt-4">
                        <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Nível de Acesso</label>
                        <div className="flex items-center gap-3 w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-500">
                          <Shield className={`w-4 h-4 ${isAdmin ? 'text-blue-600' : 'text-slate-400'}`} />
                          {currentProfile.role}
                        </div>
                      </div>
                    </div>
                  </form>
                </div>
              )}

              {/* CONTROLE DE CLIENTES */}
              {activeTab === 'clientes' && isAdmin && (
                <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-300">
                  <div>
                    <h4 className="text-lg font-bold text-slate-800">Controle de Clientes</h4>
                    <p className="text-sm text-slate-500">Cadastre e gerencie a lista de clientes do sistema.</p>
                  </div>

                  {/* Formulário Novo Cliente */}
                  <div className="bg-slate-50 rounded-2xl p-6 border border-slate-200 shadow-sm">
                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
                      <div className="space-y-1">
                        <h5 className="text-sm font-bold text-slate-800 flex items-center gap-2">
                          <UserPlus className="w-4 h-4 text-blue-600" />
                          Adicionar Novo Cliente
                        </h5>
                        <p className="text-xs text-slate-500 font-medium">Cadastre um cliente individualmente ou importe uma lista.</p>
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        <button
                          onClick={downloadClienteTemplate}
                          type="button"
                          className="flex items-center gap-1.5 px-3 py-1.5 bg-white border border-slate-300 rounded-lg text-xs font-bold text-slate-600 hover:bg-slate-50 transition-all hover:shadow-sm"
                        >
                          <Download className="w-3.5 h-3.5" />
                          Modelo Excel
                        </button>
                        <label className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-600 border border-emerald-700 rounded-lg text-xs font-bold text-white hover:bg-emerald-700 transition-all cursor-pointer shadow-sm hover:shadow-md">
                          <Upload className="w-3.5 h-3.5" />
                          {isImportingClientes ? 'Importando...' : 'Importar Excel'}
                          <input 
                            type="file" 
                            accept=".xlsx" 
                            className="hidden" 
                            onChange={handleImportClientesFromExcel}
                            disabled={isImportingClientes}
                          />
                        </label>
                      </div>
                    </div>

                    <form onSubmit={handleCreateCliente} className="flex flex-col md:flex-row gap-3">
                      <div className="flex-[3]">
                        <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider ml-1 mb-1 block">Nome do Cliente</label>
                        <input 
                          type="text" 
                          required
                          value={newClienteName}
                          onChange={(e) => setNewClienteName(e.target.value)}
                          className="w-full px-4 py-2.5 bg-white border border-slate-300 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all placeholder:text-slate-400"
                          placeholder="Ex: VALE - ITABIRA"
                        />
                      </div>
                      <div className="flex-1">
                        <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider ml-1 mb-1 block">C. Custo</label>
                        <input 
                          type="text" 
                          value={newClienteCC}
                          onChange={(e) => setNewClienteCC(e.target.value)}
                          className="w-full px-4 py-2.5 bg-white border border-slate-300 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all placeholder:text-slate-400 font-mono"
                          placeholder="Ex: 1020"
                        />
                      </div>
                      <div className="flex items-end flex-none">
                        <button
                          type="submit"
                          disabled={isCreatingCliente || !newClienteName.trim()}
                          className="h-[42px] px-5 bg-blue-600 text-white font-bold rounded-xl text-sm hover:bg-blue-700 transition-all shadow-lg shadow-blue-200 disabled:opacity-50 disabled:shadow-none flex items-center gap-2 active:scale-95"
                        >
                          {isCreatingCliente ? (
                            <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                          ) : (
                            <>
                              <Plus className="w-4 h-4" />
                              <span className="hidden sm:inline">Cadastrar</span>
                            </>
                          )}
                        </button>
                      </div>
                    </form>
                  </div>

                  {/* Lista de Clientes */}
                  <div className="border border-slate-200 rounded-xl overflow-hidden">
                    <div className="bg-slate-50 px-4 py-3 border-b border-slate-200">
                      <h5 className="text-xs font-bold text-slate-500 uppercase tracking-wider">Clientes Cadastrados</h5>
                    </div>
                    
                    {isLoadingClientes ? (
                      <div className="py-12 text-center text-slate-500 text-sm flex flex-col items-center gap-3">
                        <div className="w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
                        Carregando...
                      </div>
                    ) : clientes.length === 0 ? (
                      <div className="py-12 text-center text-slate-500 text-sm italic">
                        Nenhum cliente cadastrado.
                      </div>
                    ) : (
                      <div className="divide-y divide-slate-100 max-h-[300px] overflow-y-auto">
                        {clientes.map(cliente => (
                          <div key={cliente.id} className="px-4 py-3 flex items-center justify-between hover:bg-slate-50 transition-colors group">
                            <div className="flex flex-col">
                              <span className="text-sm font-bold text-slate-700">{cliente.nome}</span>
                              {cliente.cc && (
                                <span className="text-[10px] font-bold text-blue-500 uppercase tracking-tight">CC: {cliente.cc}</span>
                              )}
                            </div>
                            <button
                              onClick={() => handleDeleteCliente(cliente.id)}
                              disabled={isDeletingClienteId === cliente.id}
                              className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all opacity-0 group-hover:opacity-100 disabled:opacity-50"
                              title="Excluir Cliente"
                            >
                              {isDeletingClienteId === cliente.id ? (
                                <div className="w-4 h-4 border-2 border-red-500 border-t-transparent rounded-full animate-spin" />
                              ) : (
                                <Trash2 className="w-4 h-4" />
                              )}
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* GERENCIAR USUÁRIOS */}
              {activeTab === 'usuarios' && isAdmin && (
                <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-300">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="text-lg font-bold text-slate-800">Gerenciar Usuários</h4>
                      <p className="text-sm text-slate-500">Adicione novos usuários ou altere as permissões existentes.</p>
                    </div>
                  </div>

                  {/* Formulário Criar Usuário */}
                  <div className="bg-slate-50 rounded-xl p-5 border border-slate-200">
                    <h5 className="text-sm font-bold text-slate-800 mb-4">Adicionar Novo Usuário</h5>
                    <form onSubmit={handleCreateUser} className="space-y-4" autoComplete="off">
                      {/* Hidden dummy fields to prevent browser autofill */}
                      <input type="text" name="prevent_autofill" id="prevent_autofill" autoComplete="off" style={{ display: 'none' }} tabIndex={-1} />
                      <input type="password" name="prevent_autofill_pass" id="prevent_autofill_pass" autoComplete="off" style={{ display: 'none' }} tabIndex={-1} />
                      {createUserError && (
                        <div className="p-3 bg-red-100 text-red-600 rounded-lg text-sm border border-red-200">
                          {createUserError}
                        </div>
                      )}
                      {createUserSuccess && (
                        <div className="p-3 bg-emerald-100 text-emerald-700 rounded-lg text-sm border border-emerald-200 flex items-center gap-2">
                          <Check className="w-4 h-4" /> Usuário criado com sucesso!
                        </div>
                      )}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-xs font-medium text-slate-700 mb-1">Nome Completo</label>
                          <input 
                            type="text" 
                            required
                            value={newUserName}
                            onChange={(e) => setNewUserName(e.target.value)}
                            className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                            placeholder="Nome do Usuário"
                            autoComplete="off"
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-medium text-slate-700 mb-1">E-mail</label>
                          <input 
                            type="email" 
                            required
                            value={newUserEmail}
                            onChange={(e) => setNewUserEmail(e.target.value)}
                            className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                            placeholder="email@exemplo.com"
                            autoComplete="off"
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-medium text-slate-700 mb-1">Senha (Mín. 6 chars)</label>
                          <div className="relative">
                            <input 
                              type={showNewUserPassword ? 'text' : 'password'}
                              required
                              minLength={6}
                              value={newUserPassword}
                              onChange={(e) => setNewUserPassword(e.target.value)}
                              className="w-full px-3 py-2 pr-10 bg-white border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                              placeholder="******"
                              autoComplete="new-password"
                            />
                            <button
                              type="button"
                              onClick={() => setShowNewUserPassword(!showNewUserPassword)}
                              className="absolute right-2.5 top-1/2 -translate-y-1/2 p-1 text-slate-400 hover:text-slate-600 transition-colors rounded"
                              tabIndex={-1}
                            >
                              {showNewUserPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                            </button>
                          </div>
                        </div>
                        <div>
                          <label className="block text-xs font-medium text-slate-700 mb-1">Permissão Inicial</label>
                          <select
                            value={newUserRole}
                            onChange={(e) => setNewUserRole(e.target.value as 'admin' | 'user')}
                            className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                          >
                            <option value="user">Usuário Padrão</option>
                            <option value="admin">Administrador</option>
                          </select>
                        </div>
                      </div>
                      <div className="flex justify-end">
                        <button
                          type="submit"
                          disabled={isCreatingUser}
                          className="px-4 py-2 bg-blue-600 text-white font-medium rounded-lg text-sm hover:bg-blue-700 transition-colors disabled:opacity-50 flex items-center gap-2"
                        >
                          {isCreatingUser ? (
                            <><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Criando...</>
                          ) : (
                            <><PlusCircle className="w-4 h-4" /> Criar Usuário</>
                          )}
                        </button>
                      </div>
                    </form>
                  </div>

                  {isLoadingUsers ? (
                    <div className="py-8 text-center text-slate-500 text-sm flex items-center justify-center gap-2">
                      <div className="w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
                      Carregando usuários...
                    </div>
                  ) : (
                    <div className="border border-slate-200 rounded-xl overflow-x-auto">
                      <table className="w-full text-left text-sm whitespace-nowrap">
                        <thead className="bg-slate-50 border-b border-slate-200 text-slate-500">
                          <tr>
                            <th className="px-4 py-3 font-medium">Nome</th>
                            <th className="px-4 py-3 font-medium">E-mail</th>
                            <th className="px-4 py-3 font-medium text-center">Ações / Permissão</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                          {usersList.map(user => (
                            <tr key={user.id} className="hover:bg-slate-50/50">
                              <td className="px-4 py-3">
                                {editingUserId === user.id ? (
                                  <div className="flex items-center gap-2">
                                    <input 
                                      type="text" 
                                      value={editingUserName}
                                      onChange={(e) => setEditingUserName(e.target.value)}
                                      className="px-2 py-1 bg-white border border-blue-400 rounded text-sm focus:ring-2 focus:ring-blue-500 outline-none w-full max-w-[200px]"
                                      autoFocus
                                      onKeyDown={(e) => {
                                        if (e.key === 'Enter') saveEditedUserName(user.id);
                                        if (e.key === 'Escape') setEditingUserId(null);
                                      }}
                                    />
                                    <button 
                                      onClick={() => saveEditedUserName(user.id)}
                                      className="p-1.5 text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors"
                                      title="Salvar Nome"
                                    >
                                      <Check className="w-4 h-4" />
                                    </button>
                                    <button 
                                      onClick={() => setEditingUserId(null)}
                                      className="p-1.5 text-slate-400 hover:bg-slate-100 rounded-lg transition-colors"
                                      title="Cancelar"
                                    >
                                      <X className="w-4 h-4" />
                                    </button>
                                  </div>
                                ) : (
                                  <div className="flex items-center gap-2 group">
                                    <span className="font-medium text-slate-800">{user.full_name || '-'}</span>
                                    <button 
                                      onClick={() => {
                                        setEditingUserId(user.id);
                                        setEditingUserName(user.full_name || '');
                                      }}
                                      className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all"
                                      title="Editar Nome"
                                    >
                                      <Pencil className="w-4 h-4" />
                                    </button>
                                    <button 
                                      onClick={() => {
                                        if (confirm(`Tem certeza que deseja excluir o perfil de ${user.full_name || user.email}?`)) {
                                          handleDeleteUser(user.id);
                                        }
                                      }}
                                      disabled={user.id === profile?.id || isDeletingUserId === user.id}
                                      className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all disabled:opacity-30 disabled:cursor-not-allowed"
                                      title="Excluir Usuário"
                                    >
                                      {isDeletingUserId === user.id ? (
                                        <div className="w-4 h-4 border-2 border-red-500 border-t-transparent rounded-full animate-spin" />
                                      ) : (
                                        <Trash2 className="w-4 h-4" />
                                      )}
                                    </button>
                                  </div>
                                )}
                              </td>
                              <td className="px-4 py-3">
                                <span className="text-slate-600">{user.email}</span>
                              </td>
                              <td className="px-4 py-3 text-center">
                                <div className="flex items-center justify-center gap-2">
                                  <button
                                    onClick={() => handleResetPassword(user.id, user.email)}
                                    disabled={user.id === profile?.id || isResettingPasswordId === user.id}
                                    className="p-1.5 text-slate-400 hover:text-amber-600 hover:bg-amber-50 rounded-lg transition-all disabled:opacity-30 disabled:cursor-not-allowed"
                                    title="Resetar Senha para 'geosol'"
                                  >
                                    {isResettingPasswordId === user.id ? (
                                      <div className="w-4 h-4 border-2 border-amber-500 border-t-transparent rounded-full animate-spin" />
                                    ) : (
                                      <Key className="w-4 h-4" />
                                    )}
                                  </button>
                                  <select
                                    value={user.role}
                                    onChange={(e) => updateUserRole(user.id, e.target.value as 'admin' | 'user')}
                                    disabled={user.id === profile?.id}
                                    className="px-2 py-1.5 bg-white border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none disabled:bg-slate-50 disabled:text-slate-400 disabled:cursor-not-allowed"
                                  >
                                    <option value="admin">Administrador</option>
                                    <option value="user">Usuário Padrão</option>
                                  </select>
                                  {user.id === profile?.id && (
                                    <span className="text-xs text-slate-400 font-medium whitespace-nowrap">(Você)</span>
                                  )}
                                </div>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              )}



              {activeTab === 'dados' && isAdmin && (
                <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-300">
                  <div>
                    <h4 className="text-lg font-bold text-slate-800">Dados e Backup</h4>
                    <p className="text-sm text-slate-500">Gerencie os dados armazenados no sistema.</p>
                  </div>

                  <div className="space-y-4">
                    <div className="p-4 border border-slate-200 rounded-xl space-y-6">
                      <div>
                        <h5 className="text-sm font-bold text-slate-800 mb-1">Exportar Backup</h5>
                        <p className="text-sm text-slate-500 mb-4">
                          Baixe todos os pedidos e registros atuais para um arquivo JSON. Útil para migração ou segurança.
                        </p>
                        <button
                          onClick={handleExportJson}
                          className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-300 rounded-lg text-sm font-bold text-slate-700 hover:bg-slate-50 transition-colors"
                        >
                          <Download className="w-4 h-4" />
                          Exportar Dados (JSON)
                        </button>
                      </div>

                      <div className="pt-6 border-t border-slate-100">
                        <h5 className="text-sm font-bold text-slate-800 mb-1">Restaurar Backup</h5>
                        <p className="text-sm text-slate-500 mb-4">
                          Importe dados de um arquivo de backup (.json) previamente exportado. Isso substituirá ou adicionará registros existentes.
                        </p>
                        <div className="relative">
                          <input
                            type="file"
                            accept=".json"
                            onChange={handleRestoreJson}
                            id="restore-backup"
                            className="hidden"
                          />
                          <button
                            onClick={() => document.getElementById('restore-backup')?.click()}
                            disabled={isSaving}
                            className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-300 rounded-lg text-sm font-bold text-slate-700 hover:bg-slate-50 transition-colors disabled:opacity-50"
                          >
                            <RefreshCcw className={`w-4 h-4 ${isSaving ? 'animate-spin' : ''}`} />
                            {isSaving ? 'Restaurando...' : 'Restaurar Backup (JSON)'}
                          </button>
                        </div>
                        {saveError && activeTab === 'dados' && (
                          <p className="mt-2 text-xs text-red-600 font-medium">{saveError}</p>
                        )}
                      </div>
                    </div>
                    {/* Cloud Sync Section - Only for Admins */}
                    {isAdmin && (
                      <div className="bg-blue-600/5 dark:bg-blue-600/10 border border-blue-200 dark:border-blue-900/50 rounded-2xl p-6 mb-6 space-y-4">
                        <div className="flex items-center gap-3">
                          <div className="p-2.5 bg-blue-600 rounded-xl">
                            <RefreshCcw className="w-5 h-5 text-white" />
                          </div>
                          <div>
                            <h5 className="font-bold text-slate-900 dark:text-white">Sincronizar com Nuvem</h5>
                            <p className="text-xs text-slate-500 dark:text-slate-400">Envia os registros iniciais para o Supabase para que fiquem visíveis para todos.</p>
                          </div>
                        </div>
                        
                        <button
                          onClick={handleSyncToCloud}
                          disabled={isSyncing}
                          className={`w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl font-bold transition-all shadow-md ${
                            syncSuccess 
                            ? 'bg-emerald-600 text-white' 
                            : 'bg-blue-600 text-white hover:bg-blue-700 active:scale-[0.98]'
                          } disabled:opacity-50 disabled:cursor-not-allowed`}
                        >
                          {isSyncing ? (
                            <>
                              <RefreshCcw className="w-5 h-5 animate-spin" />
                              <span>Sincronizando...</span>
                            </>
                          ) : syncSuccess ? (
                            <>
                              <Check className="w-5 h-5" />
                              <span>Sincronizado na Nuvem!</span>
                            </>
                          ) : (
                            <>
                              <RefreshCcw className="w-5 h-5" />
                              <span>Enviar Dados para Nuvem</span>
                            </>
                          )}
                        </button>
                        
                        {saveError && activeTab === 'dados' && (
                          <div className="p-3 bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-900/50 rounded-xl flex items-center gap-2 text-red-600 dark:text-red-400 text-xs">
                            <AlertTriangle className="w-4 h-4 flex-shrink-0" />
                            <p>{saveError}</p>
                          </div>
                        )}
                      </div>
                    )}

                    {isAdmin && (
                      <div className="p-4 border border-red-200 bg-red-50/50 rounded-xl">
                        <h5 className="text-sm font-bold text-red-700 flex items-center gap-2 mb-1">
                          <AlertTriangle className="w-4 h-4" />
                          Zona de Perigo
                        </h5>
                        <p className="text-sm text-red-600/80 mb-4">
                          Atenção: Esta ação irá apagar permanentemente todos os registros do sistema. Certifique-se de ter um backup.
                        </p>
                        
                        {!showConfirmClear ? (
                          <button
                            onClick={() => setShowConfirmClear(true)}
                            className="flex items-center gap-2 px-4 py-2 bg-white border border-red-200 text-red-600 rounded-lg text-sm font-bold hover:bg-red-50 transition-colors"
                          >
                            <Trash2 className="w-4 h-4" />
                            Limpar Todos os Dados
                          </button>
                        ) : (
                          <div className="bg-white border border-red-200 rounded-lg p-4 space-y-3">
                            <p className="text-sm font-bold text-red-800">
                              Tem certeza absoluta? Esta ação não pode ser desfeita.
                            </p>
                            <div className="flex gap-2">
                              <button
                                 onClick={() => setShowConfirmClear(false)}
                                className="px-4 py-2 bg-white border border-slate-300 rounded-lg text-sm font-bold text-slate-700 hover:bg-slate-50 transition-colors"
                              >
                                Cancelar
                              </button>
                              <button
                                onClick={handleClearData}
                                className="px-4 py-2 bg-red-600 text-white rounded-lg text-sm font-bold hover:bg-red-700 transition-colors"
                              >
                                Sim, Apagar Tudo
                              </button>
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* HISTÓRICO DE MOVIMENTAÇÕES */}
              {activeTab === 'historico' && isAdmin && (
                <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-300">
                  <div>
                    <h4 className="text-lg font-bold text-slate-800">Histórico de Movimentações</h4>
                    <p className="text-sm text-slate-500">Acompanhe todas as alterações realizadas no inventário.</p>
                  </div>

                  <div className="space-y-4">
                    {history.length === 0 ? (
                      <div className="text-center py-8 text-slate-500 text-sm">
                        Nenhuma movimentação registrada ainda.
                      </div>
                    ) : (
                      <div className="relative border-l-2 border-slate-200 ml-3 space-y-6 pb-4">
                        {history.map((event) => (
                          <div key={event.id} className="relative pl-6">
                            <div className="absolute -left-[9px] top-1 bg-white rounded-full p-0.5 border border-slate-200 shadow-sm">
                              {getHistoryIcon(event.type)}
                            </div>
                            <div className="flex flex-col gap-1">
                              <div className="flex items-center gap-2">
                                <p className="text-sm font-bold text-slate-800">{event.description}</p>
                                {event.user_name && (
                                  <span className="text-[10px] px-1.5 py-0.5 bg-slate-100 text-slate-500 rounded font-bold uppercase tracking-wider">
                                    {event.user_name}
                                  </span>
                                )}
                              </div>
                              <p className="text-xs text-slate-400 mt-0.5">
                                {new Date(event.date).toLocaleString('pt-BR')}
                              </p>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              )}

            </div>
          </div>
        </div>

        {/* Footer Actions (Only show save button for tabs that need it) */}
        {activeTab !== 'dados' && activeTab !== 'historico' && activeTab !== 'usuarios' && (
          <div className="px-6 py-4 border-t border-slate-200 bg-slate-50 flex justify-end gap-3 shrink-0">
            <button 
              onClick={onClose}
              className="px-4 py-2 bg-white border border-slate-300 rounded-lg text-sm font-bold text-slate-700 hover:bg-slate-50 transition-colors"
            >
              Cancelar
            </button>
            <button 
              onClick={activeTab === 'perfil' ? handleSaveProfile : () => {}}
              disabled={isSaving || savedSuccess}
              className={`flex items-center gap-2 px-6 py-2 rounded-lg text-sm font-bold text-white transition-all ${
                savedSuccess 
                  ? 'bg-emerald-500 hover:bg-emerald-600' 
                  : 'bg-blue-600 hover:bg-blue-700'
              }`}
            >
              {isSaving ? (
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : savedSuccess ? (
                <>
                  <Check className="w-4 h-4" />
                  Salvo!
                </>
              ) : (
                <>
                  <Save className="w-4 h-4" />
                  Salvar Alterações
                </>
              )}
            </button>
          </div>
        )}

      </div>
    </div>
  );
}
