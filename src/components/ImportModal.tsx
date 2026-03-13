import { useState, useRef, ChangeEvent, DragEvent } from 'react';
import { X, Upload, Download, FileSpreadsheet, AlertCircle } from 'lucide-react';
import * as XLSX from 'xlsx';
import { Order, System, Category } from '../types';
import { downloadExcelTemplate } from '../lib/excelUtils';

interface ImportModalProps {
  isOpen: boolean;
  onClose: () => void;
  onImport: (orders: Order[]) => void;
}

export function ImportModal({ isOpen, onClose, onImport }: ImportModalProps) {
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
    reader.onload = (e) => {
      try {
        const data = new Uint8Array(e.target?.result as ArrayBuffer);
        const workbook = XLSX.read(data, { type: 'array', cellDates: true });
        
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
          const codigo = row['Código']?.toString().trim();
          const cc = row['Centro Custo']?.toString().trim();
          const cliente = row['Cliente']?.toString().trim();
          const sonda = row['Sonda']?.toString().trim();
          const produto = row['Produto']?.toString().trim();
          const qtdSolicitada = parseInt(row['Qtd Solicitada'], 10);
          
          // Normalize Sistema: accept Norte/Sul/norte/sul/NORTE/SUL
          const sistemaRaw = row['Sistema']?.toString().trim();
          const sistemaLower = sistemaRaw?.toLowerCase();
          let sistema: System;
          if (sistemaLower === 'norte') sistema = 'Norte';
          else if (sistemaLower === 'sul') sistema = 'Sul';
          else sistema = sistemaRaw as System;

          // Handle potentially different date formats in Excel
          let dataNecessidade = row['Data Necessidade'];
          if (dataNecessidade instanceof Date) {
            dataNecessidade = dataNecessidade.toISOString().split('T')[0];
          } else {
            dataNecessidade = dataNecessidade?.toString().trim();
          }

          // Normalize Categoria: case-insensitive match
          const categoriaRaw = row['Categoria']?.toString().trim();
          const validCategories = ['Hastes Novas', 'Hastes Usadas', 'Hastes Recuperadas', 'Revestimentos HW'];
          const categoriaMatch = validCategories.find(c => c.toLowerCase() === categoriaRaw?.toLowerCase());
          const categoria = (categoriaMatch || categoriaRaw) as Category;

          if (!codigo || !cc || !cliente || !sistema || !produto || isNaN(qtdSolicitada) || !dataNecessidade || !categoria) {
            throw new Error(`Linha ${index + 2}: Dados incompletos ou inválidos. (Verifique: Código, CC, Cliente, Sistema, Produto, Qtd, Data e Categoria)`);
          }

          if (sistema !== 'Norte' && sistema !== 'Sul') {
            throw new Error(`Linha ${index + 2}: Sistema inválido. Use 'Norte' ou 'Sul' (linha informou: '${sistemaRaw}').`);
          }

          if (!categoriaMatch) {
            throw new Error(`Linha ${index + 2}: Categoria inválida. Use '${validCategories.join("', '")}'.`);
          }

          return {
            id: `ORD-IMP-${Math.floor(Math.random() * 100000)}`,
            codigo,
            cc,
            cliente,
            sistema,
            sonda,
            produto,
            qtdSolicitada,
            qtdAtendida: 0,
            dataNecessidade,
            dataAtendimentoInicio: null,
            dataAtendimentoFinal: null,
            categoria,
          };
        });

        onImport(orders);
        onClose();
      } catch (err: any) {
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
