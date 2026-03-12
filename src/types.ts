export type System = 'Norte' | 'Sul';
export type Category = 'Hastes Novas' | 'Hastes Usadas' | 'Hastes Recuperadas' | 'Revestimentos HW';

export interface Order {
  id: string;
  codigo: string; // Código do Produto/Pedido
  cc: string; // Centro de Custo
  cliente: string;
  sistema: System;
  sonda: string;
  produto: string;
  qtdSolicitada: number;
  qtdAtendida: number;
  dataNecessidade: string; // ISO date string
  dataAtendimentoInicio: string | null; // ISO date string or null
  dataAtendimentoFinal: string | null; // ISO date string or null
  categoria: Category;
}

export interface ComputedOrder extends Order {
  qtdPendente: number;
  status: 'PENDENTE' | 'ATENDIDO';
}

export interface HistoryEvent {
  id: string;
  date: string;
  description: string;
  type: 'CREATE' | 'UPDATE' | 'DELETE' | 'IMPORT';
}
