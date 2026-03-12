import { Category } from './types';

export interface Product {
  codigo: string;
  produto: string;
  categoria: Category;
}

export const PRODUCTS: Product[] = [
  { codigo: '290200029', produto: 'HASTE HQ 1,50M - RECUPERADA', categoria: 'Hastes Recuperadas' },
  { codigo: '290200028', produto: 'HASTE HQ 2,92M RECUPERADA', categoria: 'Hastes Recuperadas' },
  { codigo: '290200001', produto: 'HASTE HQ 3,00M NOVA', categoria: 'Hastes Novas' },
  { codigo: '290200018', produto: 'HASTE HRQ 3,00 MT', categoria: 'Hastes Novas' },
  { codigo: '280200028', produto: 'HASTE NQ 1,50M - NOVA', categoria: 'Hastes Novas' },
  { codigo: '280200021', produto: 'HASTE NQ 1,50M - RECUPERADA', categoria: 'Hastes Recuperadas' },
  { codigo: '280200027', produto: 'HASTE NQ 2,92M RECUPERADA', categoria: 'Hastes Recuperadas' },
  { codigo: '280200004', produto: 'HASTE NQ 3,00M NOVA', categoria: 'Hastes Novas' },
  { codigo: '330200014', produto: 'HASTE PQ 1,50M', categoria: 'Hastes Novas' },
  { codigo: '330200026', produto: 'HASTE PQ 2,80M RECUPERADA', categoria: 'Hastes Recuperadas' },
  { codigo: '330200010', produto: 'HASTE PQ 3,00M', categoria: 'Hastes Novas' },
  { codigo: '300200017', produto: 'HASTE BQ 3,00M', categoria: 'Hastes Novas' },
  { codigo: '290100009', produto: 'REVESTIMENTO HW  3,00M NOVO', categoria: 'Revestimentos HW' },
  { codigo: '290100001', produto: 'REVESTIMENTO HW 0,00M-0,74M', categoria: 'Revestimentos HW' },
  { codigo: '290100003', produto: 'REVESTIMENTO HW 1,25M-1,74M', categoria: 'Revestimentos HW' },
  { codigo: '290100004', produto: 'REVESTIMENTO HW 2,25M-3,00M RECUPERADO', categoria: 'Revestimentos HW' },
  { codigo: '280100009', produto: 'REVESTIMENTO NW 2,25M - 3,00M RECUPERADO', categoria: 'Revestimentos HW' },
  { codigo: '280100004', produto: 'REVESTIMENTO NW 3,00M -NOVO', categoria: 'Revestimentos HW' },
  { codigo: '280200015', produto: 'HASTE NQ 3,00M (USADA)', categoria: 'Hastes Usadas' },
  { codigo: '290200016', produto: 'HASTE HQ 3,00M (USADA)', categoria: 'Hastes Usadas' },
];
