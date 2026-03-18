import { useState, FormEvent, useEffect } from 'react';
import { X, Plus, Save } from 'lucide-react';
import { Order, Category, System, SondaHistorico } from '../types';
import { PRODUCTS, SONDAS } from '../constants';
import { extractRodLength } from '../lib/excelUtils';

interface NewOrderModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAdd: (order: Order) => void;
  onEdit?: (order: Order) => void;
  defaultCategory: Category | 'Geral';
  orderToEdit?: Order | null;
  data: Order[];
  sondaHistorico: SondaHistorico[];
}

export function NewOrderModal({ 
  isOpen, 
  onClose, 
  onAdd, 
  onEdit,
  defaultCategory, 
  orderToEdit,
  data,
  sondaHistorico
}: NewOrderModalProps) {
  const [formData, setFormData] = useState<Omit<Order, 'id' | 'qtdAtendida' | 'dataAtendimentoInicio' | 'dataAtendimentoFinal'>>({
    codigo: '',
    cc: '',
    cliente: '',
    sistema: 'Norte',
    sonda: '',
    produto: '',
    qtdSolicitada: 1,
    dataNecessidade: new Date().toISOString().split('T')[0],
    categoria: defaultCategory === 'Geral' ? 'Hastes Novas' : defaultCategory,
    profundidadeFuro: undefined,
    tag: '',
    modelo: '',
    descricao_sonda: '',
  });

  const [ultimoAtendimento, setUltimoAtendimento] = useState<string | null>(null);

  useEffect(() => {
    if (formData.tag && formData.tag.trim() && sondaHistorico) {
      const tagTrim = formData.tag.toLowerCase().trim();

      // Busca o registro mais recente no histórico de atendimento da sonda usando a TAG (Equipamento)
      const registros = sondaHistorico.filter(
        r => (r.sonda || '').toLowerCase().trim() === tagTrim
      );

      if (registros.length > 0) {
        const ultimaData = registros[0].data_atendimento;
        if (ultimaData) {
          const parts = ultimaData.split('-');
          if (parts.length === 3) {
            setUltimoAtendimento(`${parts[2]}/${parts[1]}/${parts[0]}`);
          } else {
            setUltimoAtendimento(ultimaData);
          }
        }
      } else {
        setUltimoAtendimento(null);
      }
    } else {
      setUltimoAtendimento(null);
    }
  }, [formData.tag, sondaHistorico]);

  useEffect(() => {
    if (orderToEdit) {
      setFormData({
        codigo: orderToEdit.codigo,
        cc: orderToEdit.cc,
        cliente: orderToEdit.cliente,
        sistema: orderToEdit.sistema,
        sonda: orderToEdit.sonda, // This stores the Tag/Equipamento code
        produto: orderToEdit.produto,
        qtdSolicitada: orderToEdit.qtdSolicitada,
        dataNecessidade: orderToEdit.dataNecessidade,
        categoria: orderToEdit.categoria,
        profundidadeFuro: orderToEdit.profundidadeFuro,
        tag: orderToEdit.tag || '',
        modelo: orderToEdit.modelo || '',
        descricao_sonda: orderToEdit.descricao_sonda || '',
      });
    } else {
      setFormData({
        codigo: '',
        cc: '',
        cliente: '',
        sistema: 'Norte',
        sonda: '',
        produto: '',
        qtdSolicitada: 1,
        dataNecessidade: new Date().toISOString().split('T')[0],
        categoria: defaultCategory === 'Geral' ? 'Hastes Novas' : defaultCategory,
        profundidadeFuro: undefined,
        tag: '',
        modelo: '',
        descricao_sonda: '',
      });
    }
  }, [orderToEdit, defaultCategory, isOpen]);

  if (!isOpen) return null;


  const calculateAndSetQtd = (depth: number | undefined, product: string) => {
    if (!depth || depth <= 0) return;
    
    const rodLength = extractRodLength(product);
    if (rodLength && rodLength > 0) {
      const calculatedQtd = Math.ceil(depth / rodLength);
      setFormData(prev => ({
        ...prev,
        qtdSolicitada: calculatedQtd
      }));
    }
  };

  const handleProductChange = (produtoName: string) => {
    const selectedProduct = PRODUCTS.find(p => p.produto === produtoName);
    if (selectedProduct) {
      setFormData(prev => {
        const newData = {
          ...prev,
          produto: selectedProduct.produto,
          codigo: selectedProduct.codigo,
          categoria: selectedProduct.categoria
        };

        // Auto-set Tag for Revestimentos if empty
        if (selectedProduct.categoria.startsWith('Revestimentos') && !newData.tag) {
          newData.tag = 'REVESTIMENTOS';
          newData.sonda = 'REVESTIMENTOS';
          newData.descricao_sonda = 'REVESTIMENTOS';
          newData.modelo = 'REVESTIMENTOS';
        }
        
        // Recalcula se profundidade já estiver preenchida
        if (newData.profundidadeFuro) {
          const rodLength = extractRodLength(produtoName);
          if (rodLength && rodLength > 0) {
            newData.qtdSolicitada = Math.ceil(newData.profundidadeFuro / rodLength);
          }
        }
        return newData;
      });
    } else {
      setFormData(prev => ({
        ...prev,
        produto: produtoName,
        codigo: '',
        categoria: defaultCategory === 'Geral' ? 'Haste Novas' : defaultCategory
      }));
    }
  };


  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    
    if (formData.qtdSolicitada <= 0) {
      alert('A quantidade solicitada deve ser maior que zero.');
      return;
    }

    if (orderToEdit && onEdit) {
      onEdit({
        ...orderToEdit,
        ...formData,
      });
    } else {
      const newOrder: Order = {
        ...formData,
        id: `ORD-${Math.floor(Math.random() * 10000)}`,
        qtdAtendida: 0,
        dataAtendimentoInicio: null,
        dataAtendimentoFinal: null,
      };
      onAdd(newOrder);
    }
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-3xl overflow-hidden animate-in fade-in zoom-in duration-200">
        <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between bg-slate-50">
          <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2">
            {orderToEdit ? (
              <>
                <Save className="w-5 h-5 text-blue-600" />
                Editar Pedido {orderToEdit.id}
              </>
            ) : (
              <>
                <Plus className="w-5 h-5 text-blue-600" />
                Novo Pedido de Haste
              </>
            )}
          </h3>
          <button onClick={onClose} className="p-2 hover:bg-slate-200 rounded-full transition-colors">
            <X className="w-5 h-5 text-slate-500" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div className="grid grid-cols-3 gap-4">
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-500 uppercase">Código</label>
              <input
                readOnly
                type="text"
                value={formData.codigo}
                className="w-full px-3 py-2 border border-slate-200 bg-slate-50 rounded-lg text-slate-500 outline-none cursor-not-allowed"
                placeholder="Auto-preenchido"
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-500 uppercase">Centro de Custo</label>
              <input
                required
                type="text"
                value={formData.cc}
                onChange={(e) => setFormData({ ...formData, cc: e.target.value })}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                placeholder="Ex: CC-101"
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-500 uppercase">Cliente</label>
              <input
                required
                type="text"
                value={formData.cliente}
                onChange={(e) => setFormData({ ...formData, cliente: e.target.value })}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                placeholder="Nome do cliente"
              />
            </div>
          </div>

          {/* SONDA FIELDS - MATCHING SPREADSHEETS (BIDIRECTIONAL) */}
          <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="space-y-1 md:col-span-2">
                <label className="text-xs font-bold text-blue-600 uppercase flex items-center gap-1">
                  Sonda (Descrição)
                </label>
                <input
                  required
                  list="descricao-list"
                  type="text"
                  value={formData.descricao_sonda}
                  onChange={(e) => {
                    const desc = e.target.value;
                    const selectedSonda = SONDAS.find(s => s.descricao === desc);
                    setFormData({
                      ...formData,
                      descricao_sonda: desc,
                      tag: selectedSonda ? selectedSonda.tag : formData.tag,
                      modelo: selectedSonda ? selectedSonda.modelo : formData.modelo,
                      sonda: selectedSonda ? selectedSonda.tag : formData.sonda
                    });
                  }}
                  className="w-full px-3 py-2 border border-blue-200 bg-white rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-sm font-medium"
                  placeholder="Selecione ou digite a descrição..."
                />
                <datalist id="descricao-list">
                  {SONDAS.map(s => (
                    <option key={`${s.tag}-${s.descricao}`} value={s.descricao}>
                      {s.tag} - {s.modelo}
                    </option>
                  ))}
                </datalist>
              </div>
              <div className="space-y-1">
                <label className="text-xs font-bold text-blue-600 uppercase">Equipamento (Tag)</label>
                <input
                  required
                  list="tag-list"
                  type="text"
                  value={formData.tag}
                  onChange={(e) => {
                    const tagValue = e.target.value.toUpperCase().trim();
                    const selectedSonda = SONDAS.find(s => s.tag.toUpperCase().trim() === tagValue);
                    setFormData({
                      ...formData,
                      tag: tagValue,
                      descricao_sonda: selectedSonda ? selectedSonda.descricao : formData.descricao_sonda,
                      modelo: selectedSonda ? selectedSonda.modelo : formData.modelo,
                      sonda: selectedSonda ? selectedSonda.tag : tagValue
                    });
                  }}
                  className="w-full px-3 py-2 border border-blue-200 bg-white rounded-lg focus:ring-2 focus:ring-blue-500 outline-none font-mono font-bold text-xs"
                  placeholder="Ex: SAA-928"
                />
                <datalist id="tag-list">
                  {SONDAS.map(s => (
                    <option key={s.tag} value={s.tag}>
                      {s.descricao}
                    </option>
                  ))}
                </datalist>
              </div>
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-500 uppercase">Modelo</label>
                <input
                  readOnly
                  type="text"
                  value={formData.modelo}
                  className="w-full px-3 py-2 border border-slate-200 bg-slate-100/50 rounded-lg text-slate-600 outline-none cursor-not-allowed text-xs font-bold"
                  placeholder="Auto"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-500 uppercase">Sistema</label>
                <select
                  value={formData.sistema}
                  onChange={(e) => setFormData({ ...formData, sistema: e.target.value as System })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none bg-white"
                >
                  <option value="Norte">Norte</option>
                  <option value="Sul">Sul</option>
                </select>
              </div>
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-500 uppercase">Último Atendimento</label>
                <div className={`w-full px-3 py-2 rounded-lg border h-[42px] flex items-center text-sm font-medium transition-all ${
                  ultimoAtendimento
                    ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
                    : 'bg-white border-slate-200 text-slate-400 italic font-normal'
                }`}>
                  {ultimoAtendimento ? (
                    <span className="flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-emerald-500 shrink-0"></span>
                      {ultimoAtendimento}
                    </span>
                  ) : (
                    formData.tag.trim() ? 'Sem histórico registrado' : 'Aguardando equipamento...'
                  )}
                </div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-1 md:col-span-2">
              <label className="text-xs font-bold text-slate-500 uppercase">Produto</label>
              <select
                required
                value={formData.produto}
                onChange={(e) => handleProductChange(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
              >
                <option value="">Selecione um produto...</option>
                {PRODUCTS.map((p) => (
                  <option key={p.codigo} value={p.produto}>
                    {p.produto}
                  </option>
                ))}
              </select>
            </div>
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-500 uppercase">Qtd Solicitada</label>
              <input
                required
                type="number"
                min="1"
                value={formData.qtdSolicitada}
                onChange={(e) => setFormData({ ...formData, qtdSolicitada: Number(e.target.value) })}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-500 uppercase">Data Necessidade</label>
              <input
                required
                type="date"
                value={formData.dataNecessidade}
                onChange={(e) => setFormData({ ...formData, dataNecessidade: e.target.value })}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-500 uppercase">Profundidade do Furo (m)</label>
              <input
                type="number"
                step="0.01"
                min="0"
                value={formData.profundidadeFuro || ''}
                onChange={(e) => {
                  const depth = e.target.value ? Number(e.target.value) : undefined;
                  setFormData(prev => ({ ...prev, profundidadeFuro: depth }));
                  if (depth && formData.produto) {
                    calculateAndSetQtd(depth, formData.produto);
                  }
                }}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none placeholder:text-slate-300"
                placeholder="Ex: 150"
              />
            </div>
          </div>

          <div className="pt-4 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-6 py-2 bg-blue-600 text-white text-sm font-bold rounded-lg hover:bg-blue-700 shadow-lg shadow-blue-200 transition-all active:scale-95"
            >
              {orderToEdit ? 'Salvar Alterações' : 'Adicionar Pedido'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
