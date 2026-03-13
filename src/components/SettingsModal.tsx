import React, { useState, useEffect } from 'react';
import { 
  X, Download, Trash2, AlertTriangle, Settings as SettingsIcon, 
  User, Palette, Bell, Database, Save, Check, Monitor, Moon, Sun, History,
  RefreshCcw, Shield, PlusCircle, Search, Pencil, Edit3, FileDown, Trash, Users
} from 'lucide-react';
import { Order, HistoryEvent, Profile } from '../types';
import { supabase } from '../lib/supabase';
import { createClient } from '@supabase/supabase-js';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  data: Order[];
  history: HistoryEvent[];
  onClearData: () => void;
  profile: Profile | null;
}

type TabId = 'perfil' | 'usuarios' | 'aparencia' | 'notificacoes' | 'dados' | 'historico';

export function SettingsModal({ isOpen, onClose, data, history, onClearData, profile }: SettingsModalProps) {
  const [activeTab, setActiveTab] = useState<TabId>('perfil');
  const [showConfirmClear, setShowConfirmClear] = useState(false);
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

  // State for inline user editing
  const [editingUserId, setEditingUserId] = useState<string | null>(null);
  const [editingUserName, setEditingUserName] = useState('');

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

  const [appearance, setAppearance] = useState({
    theme: 'light',
    density: 'standard'
  });

  const [notifications, setNotifications] = useState({
    emailAlerts: true,
    systemAlerts: true,
    weeklyReport: false
  });

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

  const handleClearData = () => {
    onClearData();
    setShowConfirmClear(false);
    onClose();
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
    { id: 'usuarios', label: 'Gerenciar Usuários', icon: Users, show: isAdmin },
    { id: 'aparencia', label: 'Aparência', icon: Palette, show: true },
    { id: 'notificacoes', label: 'Notificações', icon: Bell, show: true },
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
                      <input 
                        type="password" 
                        name="profile-new-password"
                        value={currentProfile.password}
                        onChange={(e) => setCurrentProfile({...currentProfile, password: e.target.value})}
                        className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                        placeholder="Deixe em branco para não alterar"
                        autoComplete="new-password"
                        data-lpignore="true"
                      />
                    </div>
                    <div className="grid gap-2">
                      <label className="text-sm font-medium text-slate-700">Nível de Acesso (Cargo)</label>
                      <div className="flex items-center gap-3 w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-500">
                        <Shield className={`w-4 h-4 ${isAdmin ? 'text-blue-600' : 'text-slate-400'}`} />
                        {currentProfile.role}
                      </div>
                      <p className="text-xs text-slate-400">O cargo só pode ser alterado por um administrador na aba "Gerenciar Usuários".</p>
                    </div>
                  </form>
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
                    <form onSubmit={handleCreateUser} className="space-y-4">
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
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-medium text-slate-700 mb-1">Senha (Mín. 6 chars)</label>
                          <input 
                            type="password"
                            required
                            minLength={6}
                            value={newUserPassword}
                            onChange={(e) => setNewUserPassword(e.target.value)}
                            className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                            placeholder="******"
                          />
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
                    <div className="border border-slate-200 rounded-xl overflow-hidden">
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
                                      className="p-1 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded transition-all md:opacity-0 md:group-hover:opacity-100"
                                      title="Editar Nome"
                                    >
                                      <Pencil className="w-3.5 h-3.5" />
                                    </button>
                                  </div>
                                )}
                              </td>
                              <td className="px-4 py-3">
                                <span className="text-slate-600">{user.email}</span>
                              </td>
                              <td className="px-4 py-3 text-center">
                                <div className="flex items-center justify-center gap-2">
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

              {/* APARÊNCIA */}
              {activeTab === 'aparencia' && (
                <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-300">
                  <div>
                    <h4 className="text-lg font-bold text-slate-800">Aparência</h4>
                    <p className="text-sm text-slate-500">Personalize como o GEOSOL é exibido no seu dispositivo.</p>
                  </div>

                  <div className="space-y-4">
                    <label className="text-sm font-medium text-slate-700">Tema do Sistema</label>
                    <div className="grid grid-cols-3 gap-4">
                      <button 
                        onClick={() => setAppearance({...appearance, theme: 'light'})}
                        className={`flex flex-col items-center gap-3 p-4 rounded-xl border-2 transition-all ${appearance.theme === 'light' ? 'border-blue-600 bg-blue-50/50' : 'border-slate-200 hover:border-slate-300'}`}
                      >
                        <Sun className={`w-6 h-6 ${appearance.theme === 'light' ? 'text-blue-600' : 'text-slate-400'}`} />
                        <span className="text-sm font-medium text-slate-700">Claro</span>
                      </button>
                      <button 
                        onClick={() => setAppearance({...appearance, theme: 'dark'})}
                        className={`flex flex-col items-center gap-3 p-4 rounded-xl border-2 transition-all ${appearance.theme === 'dark' ? 'border-blue-600 bg-blue-50/50' : 'border-slate-200 hover:border-slate-300'}`}
                      >
                        <Moon className={`w-6 h-6 ${appearance.theme === 'dark' ? 'text-blue-600' : 'text-slate-400'}`} />
                        <span className="text-sm font-medium text-slate-700">Escuro</span>
                      </button>
                      <button 
                        onClick={() => setAppearance({...appearance, theme: 'system'})}
                        className={`flex flex-col items-center gap-3 p-4 rounded-xl border-2 transition-all ${appearance.theme === 'system' ? 'border-blue-600 bg-blue-50/50' : 'border-slate-200 hover:border-slate-300'}`}
                      >
                        <Monitor className={`w-6 h-6 ${appearance.theme === 'system' ? 'text-blue-600' : 'text-slate-400'}`} />
                        <span className="text-sm font-medium text-slate-700">Sistema</span>
                      </button>
                    </div>
                  </div>

                  <div className="pt-6 border-t border-slate-100 space-y-4">
                    <label className="text-sm font-medium text-slate-700">Densidade da Tabela</label>
                    <div className="flex gap-4">
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input 
                          type="radio" 
                          name="density" 
                          checked={appearance.density === 'standard'}
                          onChange={() => setAppearance({...appearance, density: 'standard'})}
                          className="text-blue-600 focus:ring-blue-500"
                        />
                        <span className="text-sm text-slate-700">Padrão</span>
                      </label>
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input 
                          type="radio" 
                          name="density" 
                          checked={appearance.density === 'compact'}
                          onChange={() => setAppearance({...appearance, density: 'compact'})}
                          className="text-blue-600 focus:ring-blue-500"
                        />
                        <span className="text-sm text-slate-700">Compacta</span>
                      </label>
                    </div>
                  </div>
                </div>
              )}

              {/* NOTIFICAÇÕES */}
              {activeTab === 'notificacoes' && (
                <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-300">
                  <div>
                    <h4 className="text-lg font-bold text-slate-800">Notificações</h4>
                    <p className="text-sm text-slate-500">Escolha como e quando você deseja ser alertado.</p>
                  </div>

                  <div className="space-y-4">
                    <label className="flex items-start gap-3 p-4 border border-slate-200 rounded-xl cursor-pointer hover:bg-slate-50 transition-colors">
                      <div className="flex items-center h-5">
                        <input 
                          type="checkbox" 
                          checked={notifications.emailAlerts}
                          onChange={(e) => setNotifications({...notifications, emailAlerts: e.target.checked})}
                          className="w-4 h-4 text-blue-600 rounded border-slate-300 focus:ring-blue-500"
                        />
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-medium text-slate-800">Alertas por E-mail</p>
                        <p className="text-sm text-slate-500">Receba um e-mail quando um pedido urgente for criado.</p>
                      </div>
                    </label>

                    <label className="flex items-start gap-3 p-4 border border-slate-200 rounded-xl cursor-pointer hover:bg-slate-50 transition-colors">
                      <div className="flex items-center h-5">
                        <input 
                          type="checkbox" 
                          checked={notifications.systemAlerts}
                          onChange={(e) => setNotifications({...notifications, systemAlerts: e.target.checked})}
                          className="w-4 h-4 text-blue-600 rounded border-slate-300 focus:ring-blue-500"
                        />
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-medium text-slate-800">Notificações no Sistema</p>
                        <p className="text-sm text-slate-500">Exibir pop-ups de notificação dentro do aplicativo.</p>
                      </div>
                    </label>

                    <label className="flex items-start gap-3 p-4 border border-slate-200 rounded-xl cursor-pointer hover:bg-slate-50 transition-colors">
                      <div className="flex items-center h-5">
                        <input 
                          type="checkbox" 
                          checked={notifications.weeklyReport}
                          onChange={(e) => setNotifications({...notifications, weeklyReport: e.target.checked})}
                          className="w-4 h-4 text-blue-600 rounded border-slate-300 focus:ring-blue-500"
                        />
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-medium text-slate-800">Relatório Semanal</p>
                        <p className="text-sm text-slate-500">Receba um resumo semanal do status do inventário.</p>
                      </div>
                    </label>
                  </div>
                </div>
              )}

              {/* DADOS E BACKUP */}
              {activeTab === 'dados' && isAdmin && (
                <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-300">
                  <div>
                    <h4 className="text-lg font-bold text-slate-800">Dados e Backup</h4>
                    <p className="text-sm text-slate-500">Gerencie os dados armazenados no sistema.</p>
                  </div>

                  <div className="space-y-4">
                    <div className="p-4 border border-slate-200 rounded-xl">
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
                            <div>
                              <p className="text-sm font-medium text-slate-800">{event.description}</p>
                              <p className="text-xs text-slate-500 mt-0.5">
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
