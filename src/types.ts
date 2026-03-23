export type System = 'Norte' | 'Sul';
export type Category = 'Hastes Novas' | 'Hastes Usadas' | 'Hastes Recuperadas' | 'Revestimentos HW' | 'Revestimentos NW' | 'Devolução de Hastes';
export type ItemType = 'Todas' | 'Hastes' | 'Revestimento';
export type ViewMode = 'management' | 'history';
export type HistorySubgroup = 'sondas' | 'clientes' | 'cc' | 'sistema' | 'eventos';

export interface Order {
  id: string;
  codigo: string; // Código do Produto/Pedido
  cc: string; // Centro de Custo
  cliente: string;
  sistema: System;
  sonda: string; // This will store the Equipamento code (Tag)
  produto: string;
  qtdSolicitada: number;
  qtdAtendida: number;
  dataNecessidade: string; // ISO date string
  dataAtendimentoInicio: string | null; // ISO date string or null
  dataAtendimentoFinal: string | null; // ISO date string or null
  categoria: Category;
  profundidadeFuro?: number;
  tipoPedido: 'Nova Mobilização' | 'Ressuprimento';
  tag?: string; // We'll keep this as a duplicate for now to avoid breaking changes, but prefer 'sonda' for the equipment code
  modelo?: string;
  descricao_sonda?: string;
}

export interface ComputedOrder extends Order {
  qtdPendente: number;
  status: 'PENDENTE' | 'ATENDIDO';
}

export interface HistoryEvent {
  id: string;
  date: string;
  description: string;
  user_name?: string | null;
  type: 'CREATE' | 'UPDATE' | 'DELETE' | 'IMPORT';
}

export interface Profile {
  id: string;
  email: string;
  full_name?: string | null;
  role: 'admin' | 'user';
  created_at?: string;
}

export interface SondaHistorico {
  id: string;
  sonda: string;
  data_atendimento: string;
  pedido_id?: string;
  produto?: string;
  cc?: string;
  cliente?: string;
  qtd_atendida?: number;
  user_name?: string;
  created_at?: string;
  descricao_sonda?: string;
}

export interface Cliente {
  id: string;
  nome: string;
  cc?: string;
  created_at?: string;
}
