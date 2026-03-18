import { useState, useRef, ChangeEvent, DragEvent } from 'react';
import { X, Upload, Download, FileSpreadsheet, AlertCircle } from 'lucide-react';
import * as XLSX from 'xlsx';
import { Order, System, Category } from '../types';
import { downloadExcelTemplate, extractRodLength, inferCategoryFromProduct } from '../lib/excelUtils';
import { SONDAS } from '../constants';

interface ImportModalProps {
  isOpen: boolean;
  onClose: () => void;
  onImport: (orders: Order[]) => Promise<void>;
  data: Order[];
}

export function ImportModal({ isOpen, onClose, onImport, data }: ImportModalProps) {
  const [error, setError] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  const processFile = (file: File) => {
    setError(null);
    
    if (!file.name.endsWith('.xlsx')) {
      setError('Por favor, selecione um arquivo Excel (.xlsx) válido.');
      return;
    }

    const reader = new FileReader();
    reader.onload = async (e) => {
      try {
        const fileData = new Uint8Array(e.target?.result as ArrayBuffer);
        const workbook = XLSX.read(fileData, { type: 'array', cellDates: true });
        
        // Get first sheet
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        
        // Convert to JSON
        const jsonData: any[] = XLSX.utils.sheet_to_json(worksheet, { defval: '' });

        if (jsonData.length === 0) {
          setError('O arquivo está vazio ou não contém dados válidos.');
          return;
        }

        const orders: Order[] = jsonData.map((row: any, index) => {
          const codigo = row['Código']?.toString().trim() || `PED-IMP-${Math.floor(Math.random() * 1000)}`;
          const produto = row['Produto']?.toString().trim() || 'PRODUTO NÃO INFORMADO';
          const qtdSolicitada = Number(row['Qtd Solicitada']) || 0;
          const qtdAtendida = Number(row['Qtd Atendida']) || 0;
          
          // Normalize Sistema: accept Norte/Sul/norte/sul/NORTE/SUL
          const sistemaRaw = row['Sistema']?.toString().trim()?.toLowerCase();

          // Helper to parse dates from Excel/JSON
          const parseDate = (val: any) => {
            if (!val) return null;
            if (val instanceof Date) return val.toISOString().split('T')[0];
            const str = val.toString().trim();
            if (/^\d{4}-\d{2}-\d{2}$/.test(str)) return str;
            // Attempt to handle DD/MM/YYYY
            const parts = str.match(/^(\d{2})[/-](\d{2})[/-](\d{4})$/);
            if (parts) return `${parts[3]}-${parts[2]}-${parts[1]}`;
            return str;
          };

          let dataNecessidade = parseDate(row['Data Necessidade']);
          if (!dataNecessidade) {
            dataNecessidade = new Date().toISOString().split('T')[0];
          }
          const dataAtendimentoInicio = parseDate(row['Data Atend. Início']);
          const dataAtendimentoFinal = parseDate(row['Data Atend. Final']);

          // Normalize Categoria: case-insensitive match or infer from product
          const categoriaRaw = row['Categoria']?.toString().trim() || inferCategoryFromProduct(produto);
          const validCategories = ['Hastes Novas', 'Hastes Usadas', 'Hastes Recuperadas', 'Revestimentos HW', 'Revestimentos NW'];
          const categoriaMatch = validCategories.find(c => c.toLowerCase() === categoriaRaw?.toLowerCase());
          const categoria = (categoriaMatch || 'Hastes Novas') as Category;

          // Skip entirely empty rows
          const isEmptyRow = !row['Código'] && !row['Centro Custo'] && !row['Cliente'] && !row['Sistema'] && !row['Sonda'] && !row['Produto'] && !row['Qtd Solicitada'] && !row['Data Necessidade'] && !row['Categoria'];
          if (isEmptyRow) return null as any;

          const sondaRaw = (row['Sonda'] || row['Equipamento'] || row['Equip'] || '').toString().trim();
          const tagRaw = (row['Tag'] || row['TAG'] || row['Equipamento'] || '').toString().trim();
          
          const foundSonda = SONDAS.find(s => 
            (tagRaw && s.tag.toUpperCase() === tagRaw.toUpperCase()) || 
            (sondaRaw && s.descricao.toUpperCase() === sondaRaw.toUpperCase()) ||
            (sondaRaw && s.tag.toUpperCase() === sondaRaw.toUpperCase())
          );

          // O banco de dados e a interface esperam que "sonda" guarde a TAG 
          // (para cruzar com SONDAS e histórico corretamente).
          const tag = foundSonda?.tag || tagRaw || sondaRaw || (categoria.startsWith('Revestimentos') ? 'REVESTIMENTOS' : '');
          const sonda = tag;
          const modelo = foundSonda?.modelo || row['Modelo']?.toString().trim() || (categoria.startsWith('Revestimentos') ? 'REVESTIMENTOS' : '');
          const descricao_sonda = foundSonda?.descricao || (sondaRaw !== tag ? sondaRaw : '') || (categoria.startsWith('Revestimentos') ? 'REVESTIMENTOS' : '');

          // Look for the most recent data for this TAG to auto-fill missing fields
          // Se newData tem apenas a TAG preenchida, tentamos puxar CC, Cliente e Sistema da base.
          const recentOrder = data.find((o: Order) => o.tag === tag || o.sonda === tag);

          const cc = row['Centro Custo']?.toString().trim() || recentOrder?.cc || 'NÃO INF.';
          const cliente = row['Cliente']?.toString().trim() || recentOrder?.cliente || 'NÃO INFORMADO';
          
          let sistemaParsed = undefined;
          if (sistemaRaw === 'sul' || sistemaRaw === 'norte') {
             sistemaParsed = sistemaRaw === 'sul' ? 'Sul' : 'Norte';
          }
          const sistema = sistemaParsed || recentOrder?.sistema || 'Norte';

          return {
            id: `ORD-IMP-${Math.floor(Math.random() * 100000)}`,
            codigo,
            cc,
            cliente,
            sistema,
            sonda,
            tag,
            modelo,
            descricao_sonda,
            produto,
            qtdSolicitada,
            qtdAtendida,
            dataNecessidade,
            dataAtendimentoInicio,
            dataAtendimentoFinal,
            categoria,
            profundidadeFuro: Number(row['Profundidade'] || row['Profund.']) || (() => {
               const rodLength = extractRodLength(produto);
               return rodLength ? qtdSolicitada * rodLength : undefined;
            })(),
          };
        }).filter(order => order !== null);

        console.log(`Mapeados ${orders.length} pedidos. Iniciando importação...`);
        await onImport(orders);
        onClose();
      } catch (err: any) {
        console.error('Erro detalhado da importação:', err);
        setError(err.message || 'Erro ao processar o arquivo. Verifique se o formato está correto.');
      }
    };
    
    reader.onerror = () => {
      setError('Erro ao ler o arquivo.');
    };
    
    reader.readAsArrayBuffer(file);
  };

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      processFile(file);
    }
    // Reset input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleDragOver = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) {
      processFile(file);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg overflow-hidden animate-in fade-in zoom-in duration-200">
        <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between bg-slate-50">
          <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2">
            <FileSpreadsheet className="w-5 h-5 text-green-600" />
            Importar Pedidos em Massa
          </h3>
          <button onClick={onClose} className="p-2 hover:bg-slate-200 rounded-full transition-colors">
            <X className="w-5 h-5 text-slate-500" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          <div className="bg-blue-50 border border-blue-100 rounded-lg p-4 text-sm text-blue-800">
            <p className="font-medium mb-2">Como importar:</p>
            <ol className="list-decimal list-inside space-y-1 text-blue-700">
              <li>Baixe o modelo de planilha clicando no botão abaixo.</li>
              <li>Preencha os dados seguindo o formato das colunas.</li>
              <li>Mantenha o formato de arquivo Excel (.xlsx).</li>
              <li>Faça o upload do arquivo preenchido aqui.</li>
            </ol>
            <button 
              onClick={downloadExcelTemplate}
              className="mt-3 flex items-center gap-2 px-4 py-2 bg-white text-blue-700 border border-blue-200 rounded-md text-xs font-bold hover:bg-blue-100 transition-colors"
            >
              <Download className="w-4 h-4" />
              Baixar Modelo Excel
            </button>
          </div>

          <div 
            className={`border-2 border-dashed rounded-xl p-8 text-center transition-colors cursor-pointer ${
              isDragging ? 'border-blue-500 bg-blue-50' : 'border-slate-300 hover:border-slate-400 hover:bg-slate-50'
            }`}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
          >
            <input 
              type="file" 
              accept=".xlsx" 
              className="hidden" 
              ref={fileInputRef}
              onChange={handleFileChange}
            />
            <Upload className={`w-10 h-10 mx-auto mb-3 ${isDragging ? 'text-blue-500' : 'text-slate-400'}`} />
            <p className="text-sm font-medium text-slate-700">
              Clique para selecionar ou arraste o arquivo Excel aqui
            </p>
            <p className="text-xs text-slate-500 mt-1">
              Apenas arquivos .xlsx são suportados
            </p>
          </div>

          {error && (
            <div className="flex items-start gap-2 text-red-600 bg-red-50 p-3 rounded-lg text-sm">
              <AlertCircle className="w-5 h-5 shrink-0" />
              <p>{error}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
