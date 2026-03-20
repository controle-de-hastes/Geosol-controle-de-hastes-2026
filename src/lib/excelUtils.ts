import * as XLSX from 'xlsx';

export const TEMPLATE_HEADERS = [
  'Código',
  'Centro Custo',
  'Cliente',
  'Sistema',
  'Sonda',
  'Tag',
  'Modelo',
  'Produto',
  'Qtd Solicitada',
  'Qtd Atendida',
  'Data Necessidade',
  'Data Atend. Início',
  'Data Atend. Final',
  'Categoria'
];

export const CLIENTE_HEADERS = [
  'Nome',
  'Centro Custo'
];

/**
 * Extracts rod length from product description (e.g., "3,00m", "1.50m")
 */
export const extractRodLength = (description: string): number | null => {
  if (!description) return null;
  // Procura padrões como "3,00M", "1.50M", "3M", "3 MT", "1,50 MT"
  const match = description.match(/(\d+(?:[.,]\d+)?) ?(?:M|MT|METROS)\b/i);
  if (match) {
    return parseFloat(match[1].replace(',', '.'));
  }
  return null;
};

/**
 * Infers category from product description if not provided
 */
export const inferCategoryFromProduct = (product: string): string => {
  if (!product) return '';
  const p = product.toUpperCase();
  
  if (p.includes('REVESTIMENTO')) {
    if (p.includes('HW')) return 'Revestimentos HW';
    if (p.includes('NW')) return 'Revestimentos NW';
    return 'Revestimentos HW'; // Default for generic revestimento
  }
  
  if (p.includes('RECUPERADA')) return 'Hastes Recuperadas';
  if (p.includes('USADA')) return 'Hastes Usadas';
  if (p.includes('HASTE') || p.includes('HQ') || p.includes('NQ')) return 'Hastes Novas';
  
  return '';
};

export const downloadExcelTemplate = () => {
  const exampleRows = [
    ['PRD-001', '1020-00', 'CLIENTE EXEMPLO', 'Norte', 'SONDA 01', '2101', 'R-50', 'HASTE HQ 3M', '10', '2024-03-25', 'Hastes Novas'],
    ['PRD-002', '1020-00', 'CLIENTE EXEMPLO', 'Sul', 'SONDA 02', '2102', 'MACH-700', 'HASTE NQ USADA', '5', '2024-03-26', 'Hastes Usadas']
  ];

  const wsData = [TEMPLATE_HEADERS, ...exampleRows];
  const ws = XLSX.utils.aoa_to_sheet(wsData);
  ws['!cols'] = TEMPLATE_HEADERS.map((_, i) => ({ wch: i === 5 ? 30 : i === 2 ? 25 : 18 }));

  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, 'Modelo Importação');
  XLSX.writeFile(wb, 'modelo_importacao_pedidos.xlsx');
};

export const downloadClienteTemplate = () => {
  const exampleRows = [
    ['VALE - ITABIRA', '1020'],
    ['ANGLO AMERICAN', '1030'],
    ['GEOSOL SERVIÇOS', '2000']
  ];

  const wsData = [CLIENTE_HEADERS, ...exampleRows];
  const ws = XLSX.utils.aoa_to_sheet(wsData);
  ws['!cols'] = [{ wch: 30 }, { wch: 20 }];

  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, 'Modelo Clientes');
  XLSX.writeFile(wb, 'modelo_importacao_clientes.xlsx');
};

export interface ExportOrder {
  codigo: string;
  cc: string;
  cliente: string;
  sistema: string;
  sonda: string;
  produto: string;
  qtdSolicitada: number;
  qtdAtendida: number;
  dataNecessidade: string;
  dataAtendimentoInicio?: string;
  dataAtendimentoFinal?: string;
  categoria: string;
  profundidadeFuro?: number;
  tag?: string;
  modelo?: string;
}

export const exportOrdersToExcel = (orders: ExportOrder[], label?: string) => {
  const headers = [
    'Código',
    'Centro Custo',
    'Cliente',
    'Sistema',
    'Sonda',
    'Tag',
    'Modelo',
    'Produto',
    'Categoria',
    'Qtd Solicitada',
    'Qtd Atendida',
    'Qtd Pendente',
    'Data Necessidade',
    'Data Atend. Início',
    'Data Atend. Final',
    'Profund. do Furo (m)'
  ];

  const rows = orders.map(o => [
    o.codigo,
    o.cc,
    o.cliente,
    o.sistema,
    o.sonda,
    o.tag || '',
    o.modelo || '',
    o.produto,
    o.categoria,
    o.qtdSolicitada,
    o.qtdAtendida,
    Math.max(0, o.qtdSolicitada - o.qtdAtendida),
    o.dataNecessidade || '',
    o.dataAtendimentoInicio || '',
    o.dataAtendimentoFinal || '',
    o.profundidadeFuro || '-'
  ]);

  const wsData = [headers, ...rows];
  const ws = XLSX.utils.aoa_to_sheet(wsData);

  // Column widths
  ws['!cols'] = [
    { wch: 14 }, // Código
    { wch: 14 }, // Centro Custo
    { wch: 24 }, // Cliente
    { wch: 10 }, // Sistema
    { wch: 16 }, // Sonda
    { wch: 15 }, // Tag
    { wch: 25 }, // Modelo
    { wch: 30 }, // Produto
    { wch: 20 }, // Categoria
    { wch: 14 }, // Qtd Sol
    { wch: 14 }, // Qtd Atend
    { wch: 14 }, // Qtd Pend
    { wch: 18 }, // Data Nec
    { wch: 18 }, // Data Início
    { wch: 18 }, // Data Final
    { wch: 18 }, // Profundidade do Furo
  ];

  const wb = XLSX.utils.book_new();
  const sheetName = label ? label.substring(0, 31) : 'Pedidos';
  XLSX.utils.book_append_sheet(wb, ws, sheetName);

  const now = new Date();
  const dateStr = `${now.getFullYear()}-${String(now.getMonth()+1).padStart(2,'0')}-${String(now.getDate()).padStart(2,'0')}`;
  const fileName = `geosol_pedidos_${dateStr}.xlsx`;

  XLSX.writeFile(wb, fileName);
};
