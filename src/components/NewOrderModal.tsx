import { useState, FormEvent, useEffect } from 'react';
import { X, Plus, Save } from 'lucide-react';
import { Order, Category, System } from '../types';
import { PRODUCTS } from '../constants';

interface NewOrderModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAdd: (order: Order) => void;
  onEdit?: (order: Order) => void;
  defaultCategory: Category | 'Geral';
  orderToEdit?: Order | null;
}

export function NewOrderModal({ 
  isOpen, 
  onClose, 
  onAdd, 
  onEdit,
  defaultCategory, 
  orderToEdit 
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
  });

  useEffect(() => {
    if (orderToEdit) {
      setFormData({
        codigo: orderToEdit.codigo,
        cc: orderToEdit.cc,
        cliente: orderToEdit.cliente,
        sistema: orderToEdit.sistema,
        sonda: orderToEdit.sonda,
        produto: orderToEdit.produto,
        qtdSolicitada: orderToEdit.qtdSolicitada,
        dataNecessidade: orderToEdit.dataNecessidade,
        categoria: orderToEdit.categoria,
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
      });
    }
  }, [orderToEdit, defaultCategory, isOpen]);

  if (!isOpen) return null;

  const handleProductChange = (produtoName: string) => {
    const selectedProduct = PRODUCTS.find(p => p.produto === produtoName);
    if (selectedProduct) {
      setFormData({
        ...formData,
        produto: selectedProduct.produto,
        codigo: selectedProduct.codigo,
        categoria: selectedProduct.categoria
      });
    } else {
      setFormData({
        ...formData,
        produto: produtoName,
        codigo: '',
        categoria: defaultCategory === 'Geral' ? 'Hastes Novas' : defaultCategory
      });
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
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-2xl overflow-hidden animate-in fade-in zoom-in duration-200">
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

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-500 uppercase">Sistema</label>
              <select
                value={formData.sistema}
                onChange={(e) => setFormData({ ...formData, sistema: e.target.value as System })}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
              >
                <option value="Norte">Norte</option>
                <option value="Sul">Sul</option>
              </select>
            </div>
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-500 uppercase">Sonda</label>
              <input
                required
                type="text"
                value={formData.sonda}
                onChange={(e) => setFormData({ ...formData, sonda: e.target.value })}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                placeholder="Ex: Sonda Alpha 1"
              />
            </div>
          </div>

          <div className="space-y-1">
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

          <div className="grid grid-cols-2 gap-4">
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
