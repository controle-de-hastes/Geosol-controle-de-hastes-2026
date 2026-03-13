import * as XLSX from 'xlsx';

export const TEMPLATE_HEADERS = [
  'Código',
  'Centro Custo',
  'Cliente',
  'Sistema',
  'Sonda',
  'Produto',
  'Qtd Solicitada',
  'Data Necessidade',
  'Categoria'
];

export const downloadExcelTemplate = () => {
  const exampleRows = [
    ['PRD-001', '1020-00', 'CLIENTE EXEMPLO', 'Norte', 'SONDA-01', 'HASTE HQ 3M', '10', '2024-03-25', 'Hastes Novas'],
    ['PRD-002', '1020-00', 'CLIENTE EXEMPLO', 'Sul', 'SONDA-02', 'HASTE NQ USADA', '5', '2024-03-26', 'Hastes Usadas']
  ];

  const wsData = [TEMPLATE_HEADERS, ...exampleRows];
  const ws = XLSX.utils.aoa_to_sheet(wsData);
  ws['!cols'] = TEMPLATE_HEADERS.map((_, i) => ({ wch: i === 5 ? 30 : i === 2 ? 25 : 18 }));

  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, 'Modelo Importação');
  XLSX.writeFile(wb, 'modelo_importacao_pedidos.xlsx');
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
}

export const exportOrdersToExcel = (orders: ExportOrder[], label?: string) => {
  const headers = [
    'Código',
    'Centro Custo',
    'Cliente',
    'Sistema',
    'Sonda',
    'Produto',
    'Categoria',
    'Qtd Solicitada',
    'Qtd Atendida',
    'Qtd Pendente',
    'Data Necessidade',
    'Data Atend. Início',
    'Data Atend. Final',
  ];

  const rows = orders.map(o => [
    o.codigo,
    o.cc,
    o.cliente,
    o.sistema,
    o.sonda,
    o.produto,
    o.categoria,
    o.qtdSolicitada,
    o.qtdAtendida,
    Math.max(0, o.qtdSolicitada - o.qtdAtendida),
    o.dataNecessidade || '',
    o.dataAtendimentoInicio || '',
    o.dataAtendimentoFinal || '',
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
    { wch: 30 }, // Produto
    { wch: 20 }, // Categoria
    { wch: 14 }, // Qtd Sol
    { wch: 14 }, // Qtd Atend
    { wch: 14 }, // Qtd Pend
    { wch: 18 }, // Data Nec
    { wch: 18 }, // Data Início
    { wch: 18 }, // Data Final
  ];

  const wb = XLSX.utils.book_new();
  const sheetName = label ? label.substring(0, 31) : 'Pedidos';
  XLSX.utils.book_append_sheet(wb, ws, sheetName);

  const now = new Date();
  const dateStr = `${now.getFullYear()}-${String(now.getMonth()+1).padStart(2,'0')}-${String(now.getDate()).padStart(2,'0')}`;
  const fileName = `geosol_pedidos_${dateStr}.xlsx`;

  XLSX.writeFile(wb, fileName);
};
