import { useState, useRef, useEffect, ReactNode } from 'react';
import { Category, Profile, ViewMode, HistorySubgroup } from '../types';
import { Layers, BarChart3, Settings, Search, Plus, Upload, Download, ChevronDown, X, User, LogOut, Shield, FileSpreadsheet } from 'lucide-react';
import logoImg from '../assets/logo.png';
import { supabase } from '../lib/supabase';
import { downloadExcelTemplate, exportOrdersToExcel } from '../lib/excelUtils';
import type { ExportOrder } from '../lib/excelUtils';

interface TopBarProps {
  activeCategory: Category | 'Geral';
  setActiveCategory: (cat: Category | 'Geral') => void;
  onOpenSettings: () => void;
  searchTerm: string;
  setSearchTerm: (term: string) => void;
  onNewOrder: () => void;
  onImportClick: () => void;
  profile: Profile | null;
  exportData?: ExportOrder[];
  isOnline: boolean;
  viewMode: ViewMode;
  setViewMode: (mode: ViewMode) => void;
  activeHistorySubgroup: HistorySubgroup;
  setHistorySubgroup: (sub: HistorySubgroup) => void;
}

export function TopBar({ 
  activeCategory, 
  setActiveCategory, 
  onOpenSettings,
  searchTerm,
  setSearchTerm,
  onNewOrder,
  onImportClick,
  profile,
  exportData,
  isOnline,
  viewMode,
  setViewMode,
  activeHistorySubgroup,
  setHistorySubgroup,
}: TopBarProps) {
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isActionsOpen, setIsActionsOpen] = useState(false);
  const [isHastesOpen, setIsHastesOpen] = useState(false);
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  
  const actionsRef = useRef<HTMLDivElement>(null);
  const hastesRef = useRef<HTMLDivElement>(null);
  const historyRef = useRef<HTMLDivElement>(null);
  const profileRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (actionsRef.current && !actionsRef.current.contains(event.target as Node)) {
        setIsActionsOpen(false);
      }
      if (hastesRef.current && !hastesRef.current.contains(event.target as Node)) {
        setIsHastesOpen(false);
      }
      if (historyRef.current && !historyRef.current.contains(event.target as Node)) {
        setIsHistoryOpen(false);
      }
      if (profileRef.current && !profileRef.current.contains(event.target as Node)) {
        setIsProfileOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const hastesCategories: { id: Category; label: string }[] = [
    { id: 'Hastes Novas', label: 'Hastes Novas' },
    { id: 'Hastes Usadas', label: 'Hastes Usadas' },
    { id: 'Hastes Recuperadas', label: 'Hastes Recuperadas' },
    { id: 'Revestimentos HW', label: 'Revestimentos HW' },
    { id: 'Revestimentos NW', label: 'Revestimentos NW' },
  ];

  const isHastesActive = hastesCategories.some(cat => cat.id === activeCategory);
  const isAdmin = profile?.role === 'admin';

  return (
    <header className="relative w-full h-16 bg-transparent text-slate-300 flex items-center justify-between px-6 z-50 shrink-0">
      {/* Logo Section */}
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 flex items-center justify-center">
          <img src={logoImg} alt="GEOSOL" className="w-full h-full object-contain drop-shadow-md" />
        </div>
        <div>
          <h1 className="text-lg font-bold text-white leading-tight">GEOSOL</h1>
          <p className="text-[10px] text-slate-400 uppercase tracking-wider font-semibold leading-tight">
            Controle de Hastes
          </p>
        </div>
      </div>

      {/* Navigation Section */}
      <nav className="flex items-center gap-2 mx-4 flex-1">
        <button
          onClick={() => {
            setViewMode('management');
            setActiveCategory('Geral');
            setIsHastesOpen(false);
          }}
          className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors whitespace-nowrap ${
            viewMode === 'management' && activeCategory === 'Geral'
              ? 'bg-blue-600/10 text-blue-400'
              : 'hover:bg-slate-800 hover:text-white text-slate-400'
          }`}
        >
          <BarChart3 className="w-4 h-4 shrink-0" />
          <span>Visão Geral</span>
        </button>

        {/* Hastes Dropdown */}
        <div className="relative" ref={hastesRef}>
          <button
            onClick={() => {
              setViewMode('management');
              setIsHastesOpen(!isHastesOpen);
            }}
            className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors whitespace-nowrap ${
              viewMode === 'management' && isHastesActive
                ? 'bg-blue-600/10 text-blue-400'
                : 'hover:bg-slate-800 hover:text-white text-slate-400'
            }`}
          >
            <Layers className="w-4 h-4 shrink-0" />
            <span>Hastes & Revestimentos</span>
            <ChevronDown className={`w-3.5 h-3.5 transition-transform ${isHastesOpen ? 'rotate-180' : ''}`} />
          </button>

          {isHastesOpen && (
            <div className="absolute left-0 mt-2 w-56 bg-slate-800 border border-slate-700 rounded-xl shadow-xl py-1.5 z-50 animate-in fade-in slide-in-from-top-2">
              {hastesCategories.map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => {
                    setActiveCategory(cat.id);
                    setIsHastesOpen(false);
                  }}
                  className={`w-full text-left px-4 py-2.5 text-sm font-medium transition-colors ${
                    activeCategory === cat.id
                      ? 'bg-blue-600/20 text-blue-400'
                      : 'text-slate-300 hover:bg-slate-700 hover:text-white'
                  }`}
                >
                  {cat.label}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Histórico Dropdown */}
        <div className="relative" ref={historyRef}>
          <button
            onClick={() => setIsHistoryOpen(!isHistoryOpen)}
            className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors whitespace-nowrap ${
              viewMode === 'history'
                ? 'bg-blue-600/10 text-blue-400'
                : 'hover:bg-slate-800 hover:text-white text-slate-400'
            }`}
          >
            <BarChart3 className="w-4 h-4 shrink-0" />
            <span>Histórico</span>
            <ChevronDown className={`w-3.5 h-3.5 transition-transform ${isHistoryOpen ? 'rotate-180' : ''}`} />
          </button>

          {isHistoryOpen && (
            <div className="absolute left-0 mt-2 w-56 bg-slate-800 border border-slate-700 rounded-xl shadow-xl py-1.5 z-50 animate-in fade-in slide-in-from-top-2">
              <button
                onClick={() => {
                  setViewMode('history');
                  setHistorySubgroup('sondas');
                  setIsHistoryOpen(false);
                }}
                className={`w-full text-left px-4 py-2.5 text-sm font-medium transition-colors ${
                  viewMode === 'history' && activeHistorySubgroup === 'sondas'
                    ? 'bg-blue-600/20 text-blue-400'
                    : 'text-slate-300 hover:bg-slate-700 hover:text-white'
                }`}
              >
                Sondas
              </button>
              <button
                onClick={() => {
                  setViewMode('history');
                  setHistorySubgroup('clientes');
                  setIsHistoryOpen(false);
                }}
                className={`w-full text-left px-4 py-2.5 text-sm font-medium transition-colors ${
                  viewMode === 'history' && activeHistorySubgroup === 'clientes'
                    ? 'bg-blue-600/20 text-blue-400'
                    : 'text-slate-300 hover:bg-slate-700 hover:text-white'
                }`}
              >
                Clientes
              </button>
              <button
                onClick={() => {
                  setViewMode('history');
                  setHistorySubgroup('cc');
                  setIsHistoryOpen(false);
                }}
                className={`w-full text-left px-4 py-2.5 text-sm font-medium transition-colors ${
                  viewMode === 'history' && activeHistorySubgroup === 'cc'
                    ? 'bg-blue-600/20 text-blue-400'
                    : 'text-slate-300 hover:bg-slate-700 hover:text-white'
                }`}
              >
                Centro de Custo
              </button>
              <button
                onClick={() => {
                  setViewMode('history');
                  setHistorySubgroup('sistema');
                  setIsHistoryOpen(false);
                }}
                className={`w-full text-left px-4 py-2.5 text-sm font-medium transition-colors ${
                  viewMode === 'history' && activeHistorySubgroup === 'sistema'
                    ? 'bg-blue-600/20 text-blue-400'
                    : 'text-slate-300 hover:bg-slate-700 hover:text-white'
                }`}
              >
                Sistema
              </button>
              <button
                onClick={() => {
                  setViewMode('history');
                  setHistorySubgroup('eventos');
                  setIsHistoryOpen(false);
                }}
                className={`w-full text-left px-4 py-2.5 text-sm font-medium transition-colors ${
                  viewMode === 'history' && activeHistorySubgroup === 'eventos'
                    ? 'bg-blue-600/20 text-blue-400'
                    : 'text-slate-300 hover:bg-slate-700 hover:text-white'
                }`}
              >
                Log de Eventos
              </button>
            </div>
          )}
        </div>
      </nav>

      {/* Right Actions Section */}
      <div className="flex items-center gap-3">
        {/* Search */}
        {isSearchOpen ? (
          <div className="relative flex items-center w-64 animate-in fade-in slide-in-from-right-4">
            <Search className="w-4 h-4 absolute left-3 text-slate-400" />
            <input
              type="text"
              autoFocus
              placeholder="Buscar..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-8 py-1.5 bg-slate-800 border border-slate-700 rounded-lg text-sm text-white placeholder-slate-400 focus:bg-slate-900 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
            />
            <button 
              onClick={() => { setIsSearchOpen(false); setSearchTerm(''); }} 
              className="absolute right-2.5 text-slate-400 hover:text-white"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        ) : (
          <button 
            onClick={() => setIsSearchOpen(true)} 
            className="p-2 text-slate-400 hover:bg-slate-800 hover:text-white rounded-lg transition-colors flex items-center justify-center"
            title="Pesquisar"
          >
            <Search className="w-5 h-5" />
          </button>
        )}

        {/* Novo Dropdown */}
        <div className="relative" ref={actionsRef}>
          <button 
            onClick={() => setIsActionsOpen(!isActionsOpen)} 
            className="flex items-center gap-2 px-3 py-1.5 bg-blue-600 text-white rounded-lg text-sm font-bold hover:bg-blue-700 transition-all shadow-md active:scale-95"
          >
            Novo
            <ChevronDown className={`w-4 h-4 transition-transform ${isActionsOpen ? 'rotate-180' : ''}`} />
          </button>
          
          {isActionsOpen && (
            <div className="absolute right-0 mt-2 w-48 bg-slate-800 border border-slate-700 rounded-xl shadow-xl py-1.5 z-50 animate-in fade-in slide-in-from-top-2">
              <button 
                onClick={() => { onNewOrder(); setIsActionsOpen(false); }} 
                className="w-full text-left px-4 py-2 text-sm font-medium text-slate-300 hover:bg-slate-700 hover:text-white flex items-center gap-2 transition-colors"
              >
                <Plus className="w-4 h-4" /> Novo Pedido
              </button>
              <button 
                onClick={() => { onImportClick(); setIsActionsOpen(false); }} 
                className="w-full text-left px-4 py-2 text-sm font-medium text-slate-300 hover:bg-slate-700 hover:text-white flex items-center gap-2 transition-colors"
              >
                <Upload className="w-4 h-4" /> Importar Planilha
              </button>
              <div className="h-px bg-slate-700 my-1"></div>
              <button 
                onClick={() => { downloadExcelTemplate(); setIsActionsOpen(false); }} 
                className="w-full text-left px-4 py-2 text-sm font-medium text-slate-300 hover:bg-slate-700 hover:text-white flex items-center gap-2 transition-colors"
                title="Baixar planilha modelo para preenchimento"
              >
                <FileSpreadsheet className="w-4 h-4 text-emerald-400" /> Baixar Modelo Excel
              </button>
              <button 
                onClick={() => { 
                  if (exportData && exportData.length > 0) {
                    exportOrdersToExcel(exportData, activeCategory === 'Geral' ? 'Todos Pedidos' : activeCategory);
                  }
                  setIsActionsOpen(false); 
                }} 
                className={`w-full text-left px-4 py-2 text-sm font-medium flex items-center gap-2 transition-colors ${
                  exportData && exportData.length > 0
                    ? 'text-emerald-400 hover:bg-slate-700 hover:text-emerald-300'
                    : 'text-slate-500 cursor-not-allowed opacity-50'
                }`}
                disabled={!exportData || exportData.length === 0}
                title={exportData && exportData.length > 0 ? `Exportar ${exportData.length} registros para Excel` : 'Sem dados para exportar'}
              >
                <Download className="w-4 h-4" /> Exportar Excel ({exportData?.length ?? 0})
              </button>
            </div>
          )}
        </div>

        <div className="h-6 w-px bg-slate-700 mx-1" />

        {/* Profile Dropdown */}
        <div className="relative" ref={profileRef}>
          <button 
            onClick={() => setIsProfileOpen(!isProfileOpen)}
            className="flex items-center justify-center w-9 h-9 rounded-full bg-slate-800 border border-slate-700 text-slate-300 hover:text-white hover:border-slate-500 transition-all overflow-hidden"
            title="Perfil e Configurações"
          >
            <img 
              src={`https://api.dicebear.com/7.x/initials/svg?seed=${profile?.full_name || profile?.email || 'User'}&backgroundColor=1e293b`}
              alt="Perfil" 
              className="w-full h-full object-cover"
            />
          </button>
          
          {isProfileOpen && (
            <div className="absolute right-0 mt-2 w-56 bg-slate-800 border border-slate-700 rounded-xl shadow-xl py-1.5 z-50 animate-in fade-in slide-in-from-top-2">
              <div className="px-4 py-3 border-b border-slate-700 mb-1">
                <div className="flex items-center gap-2">
                  <p className="text-sm font-bold text-white capitalize">{profile?.full_name || (isAdmin ? 'Administrador' : 'Usuário Padrão')}</p>
                  <div 
                    className={`w-2.5 h-2.5 rounded-full border border-slate-900 shadow-sm transition-all duration-500 ${
                      isOnline ? 'bg-emerald-500 animate-pulse' : 'bg-red-500'
                    }`}
                    title={isOnline ? 'Banco Online' : 'Banco Offline'}
                  />
                </div>
                <p className="text-xs text-slate-400 truncate" title={profile?.email}>{profile?.email || 'Carregando...'}</p>
              </div>
              
              <button 
                onClick={() => { onOpenSettings(); setIsProfileOpen(false); }} 
                className="w-full text-left px-4 py-2 text-sm font-medium text-slate-300 hover:bg-slate-700 hover:text-white flex items-center gap-2 transition-colors"
              >
                <Settings className="w-4 h-4" /> Configurações
              </button>
              <div className="h-px bg-slate-700 my-1"></div>
              
              <button 
                onClick={async () => { 
                  setIsProfileOpen(false); 
                  await supabase.auth.signOut();
                }} 
                className="w-full text-left px-4 py-2 text-sm font-medium text-red-400 hover:bg-slate-700 hover:text-red-300 flex items-center gap-2 transition-colors"
              >
                <LogOut className="w-4 h-4" /> Sair
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
