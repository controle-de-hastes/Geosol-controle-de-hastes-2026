import { useState } from 'react';
import { 
  X, Download, Trash2, AlertTriangle, Settings as SettingsIcon, 
  User, Palette, Bell, Database, Save, Check, Monitor, Moon, Sun, History,
  PlusCircle, Edit3, FileDown, Trash
} from 'lucide-react';
import { Order, HistoryEvent } from '../types';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  data: Order[];
  history: HistoryEvent[];
  onClearData: () => void;
}

type TabId = 'perfil' | 'aparencia' | 'notificacoes' | 'dados' | 'historico';

export function SettingsModal({ isOpen, onClose, data, history, onClearData }: SettingsModalProps) {
  const [activeTab, setActiveTab] = useState<TabId>('perfil');
  const [showConfirmClear, setShowConfirmClear] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);

  // Mock states for settings
  const [profile, setProfile] = useState({
    name: 'Usuário Administrador',
    email: 'teste12032026@gmail.com',
    role: 'Coordenador de Logística'
  });

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

  const handleSave = () => {
    setIsSaving(true);
    // Simulate API call
    setTimeout(() => {
      setIsSaving(false);
      setSavedSuccess(true);
      setTimeout(() => setSavedSuccess(false), 2000);
    }, 600);
  };

  const tabs = [
    { id: 'perfil', label: 'Meu Perfil', icon: User },
    { id: 'aparencia', label: 'Aparência', icon: Palette },
    { id: 'notificacoes', label: 'Notificações', icon: Bell },
    { id: 'dados', label: 'Dados e Backup', icon: Database },
    { id: 'historico', label: 'Histórico de Movimentações', icon: History },
  ] as const;

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
            {tabs.map((tab) => {
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
                    <p className="text-sm text-slate-500">Gerencie suas informações pessoais e credenciais.</p>
                  </div>
                  
                  <div className="flex items-center gap-6 pb-6 border-b border-slate-100">
                    <div className="w-20 h-20 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-2xl font-bold">
                      {profile.name.charAt(0)}
                    </div>
                    <div>
                      <button className="px-4 py-2 bg-white border border-slate-300 rounded-lg text-sm font-medium text-slate-700 hover:bg-slate-50 transition-colors">
                        Alterar Foto
                      </button>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div className="grid gap-2">
                      <label className="text-sm font-medium text-slate-700">Nome Completo</label>
                      <input 
                        type="text" 
                        value={profile.name}
                        onChange={(e) => setProfile({...profile, name: e.target.value})}
                        className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                      />
                    </div>
                    <div className="grid gap-2">
                      <label className="text-sm font-medium text-slate-700">E-mail</label>
                      <input 
                        type="email" 
                        value={profile.email}
                        onChange={(e) => setProfile({...profile, email: e.target.value})}
                        className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                      />
                    </div>
                    <div className="grid gap-2">
                      <label className="text-sm font-medium text-slate-700">Cargo / Função</label>
                      <input 
                        type="text" 
                        value={profile.role}
                        onChange={(e) => setProfile({...profile, role: e.target.value})}
                        className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-500 cursor-not-allowed"
                        disabled
                      />
                      <p className="text-xs text-slate-400">O cargo só pode ser alterado por um administrador do sistema.</p>
                    </div>
                  </div>
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
              {activeTab === 'dados' && (
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
              {activeTab === 'historico' && (
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
        {activeTab !== 'dados' && activeTab !== 'historico' && (
          <div className="px-6 py-4 border-t border-slate-200 bg-slate-50 flex justify-end gap-3 shrink-0">
            <button 
              onClick={onClose}
              className="px-4 py-2 bg-white border border-slate-300 rounded-lg text-sm font-bold text-slate-700 hover:bg-slate-50 transition-colors"
            >
              Cancelar
            </button>
            <button 
              onClick={handleSave}
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
