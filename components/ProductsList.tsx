
import React, { useState } from 'react';
import { Product, Category } from '../types';
import { Plus, Package, Tag, AlertCircle, ShoppingBag, Edit3, Trash2, Search, CheckCircle, X } from 'lucide-react';

interface Props {
  products: Product[];
  setProducts: React.Dispatch<React.SetStateAction<Product[]>>;
  notify: (msg: string, type?: 'success' | 'error' | 'info') => void;
}

const ProductsList: React.FC<Props> = ({ products, setProducts, notify }) => {
  const [showModal, setShowModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState<Partial<Product>>({
    type: 'Produto',
    controlStock: true,
    category: Category.COMMERCE,
    stock: 0,
    minStock: 5,
    price: 0,
    name: '',
    description: ''
  });

  const handleOpenAdd = () => {
    setEditingId(null);
    setFormData({ 
      type: 'Produto', 
      controlStock: true, 
      category: Category.COMMERCE, 
      stock: 0, 
      minStock: 5,
      price: 0,
      name: '',
      description: ''
    });
    setShowModal(true);
  };

  const handleOpenEdit = (product: Product) => {
    setEditingId(product.id);
    setFormData({ ...product });
    setShowModal(true);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validação extra de segurança para inteiros positivos
    const validatedStock = Math.max(0, Math.floor(Number(formData.stock) || 0));
    const validatedMinStock = Math.max(0, Math.floor(Number(formData.minStock) || 0));

    const productData: Product = {
      id: editingId || crypto.randomUUID(),
      name: formData.name || '',
      description: formData.description || '',
      type: formData.type as 'Produto' | 'Serviço',
      price: Number(formData.price) || 0,
      stock: validatedStock,
      minStock: validatedMinStock,
      controlStock: formData.controlStock || false,
      category: formData.category as Category
    };

    if (editingId) {
      setProducts(prev => prev.map(p => p.id === editingId ? productData : p));
      notify("Produto atualizado com sucesso!");
    } else {
      setProducts(prev => [...prev, productData]);
      notify("Novo item adicionado ao catálogo!");
    }
    
    setShowModal(false);
  };

  const removeProduct = (id: string) => {
    if (confirm('Deseja excluir este item do catálogo?')) {
      setProducts(products.filter(p => p.id !== id));
      notify("Item removido do catálogo.");
    }
  };

  const filtered = products.filter(p => 
    p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.category.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const formatBRL = (val: number) => val.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 bg-white p-8 rounded-[2.5rem] shadow-sm border border-slate-100 glass">
        <div className="relative flex-1">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
          <input 
            type="text" 
            placeholder="Buscar por nome ou categoria..."
            className="w-full pl-12 pr-4 py-4 bg-slate-50 border-none rounded-2xl focus:ring-4 focus:ring-blue-100 outline-none text-sm font-bold transition-all"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <button 
          onClick={handleOpenAdd}
          className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-4 rounded-2xl font-black flex items-center justify-center gap-2 transition-all shadow-xl shadow-blue-200 active:scale-95"
        >
          <Plus size={22} />
          ADICIONAR ITEM
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {filtered.map(product => {
          const isLowStock = product.controlStock && product.stock <= product.minStock;
          return (
            <div key={product.id} className="group bg-white rounded-[2.5rem] shadow-sm border border-slate-100 overflow-hidden hover:shadow-2xl hover:shadow-slate-200/50 transition-all duration-500 relative flex flex-col">
               <div className="p-8 flex-1">
                 <div className="flex justify-between items-start mb-6">
                    <div className={`h-14 w-14 rounded-2xl flex items-center justify-center transition-transform group-hover:scale-110 duration-500 ${product.type === 'Produto' ? 'bg-blue-50 text-blue-600' : 'bg-indigo-50 text-indigo-600'}`}>
                       {product.type === 'Produto' ? <Package size={28} /> : <ShoppingBag size={28} />}
                    </div>
                    <div className="flex items-center gap-2">
                       <button 
                        onClick={() => handleOpenEdit(product)}
                        className="p-3 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition-all"
                       >
                        <Edit3 size={18} />
                       </button>
                       <button 
                        onClick={() => removeProduct(product.id)} 
                        className="p-3 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-all"
                       >
                        <Trash2 size={18} />
                       </button>
                    </div>
                 </div>
                 
                 <h4 className="font-black text-slate-800 text-xl tracking-tight leading-tight mb-1">{product.name}</h4>
                 <div className="flex items-center gap-2 mb-4">
                    <span className="text-[10px] text-slate-400 font-black uppercase tracking-widest">{product.category}</span>
                    <span className="h-1 w-1 rounded-full bg-slate-200"></span>
                    <span className="text-[10px] text-blue-500 font-black uppercase tracking-widest">{product.type}</span>
                 </div>
                 <p className="text-sm text-slate-500 leading-relaxed line-clamp-2 min-h-[40px]">{product.description || 'Sem descrição definida.'}</p>
                 
                 <div className="mt-8 pt-6 border-t border-slate-50 flex items-center justify-between">
                    <div>
                       <p className="text-[10px] text-slate-400 uppercase font-black tracking-widest mb-1">Preço Sugerido</p>
                       <p className="text-2xl font-black text-slate-900 tracking-tighter">{formatBRL(product.price)}</p>
                    </div>
                    {product.controlStock && product.type === 'Produto' && (
                      <div className="text-right">
                         <p className="text-[10px] text-slate-400 uppercase font-black tracking-widest mb-1">Estoque</p>
                         <p className={`text-2xl font-black tracking-tighter ${isLowStock ? 'text-rose-600' : 'text-slate-900'}`}>{product.stock}</p>
                      </div>
                    )}
                 </div>
               </div>
               
               {product.controlStock && product.type === 'Produto' && isLowStock && (
                 <div className="bg-gradient-to-r from-rose-500 to-rose-600 px-8 py-3.5 flex items-center justify-between text-white text-[10px] font-black uppercase tracking-widest animate-pulse">
                    <div className="flex items-center gap-2">
                      <AlertCircle size={16} />
                      <span>Estoque Crítico</span>
                    </div>
                    <span>Mín: {product.minStock} UN</span>
                 </div>
               )}
            </div>
          );
        })}
        {filtered.length === 0 && (
          <div className="col-span-full py-24 text-center bg-white rounded-[3rem] border-2 border-dashed border-slate-100 flex flex-col items-center justify-center">
            <div className="h-20 w-20 rounded-full bg-slate-50 flex items-center justify-center text-slate-200 mb-6">
              <Package size={48} />
            </div>
            <p className="font-black text-slate-400 uppercase tracking-widest">Nenhum item encontrado.</p>
            <p className="text-xs text-slate-300 mt-2">Tente ajustar sua busca ou cadastre um novo item.</p>
          </div>
        )}
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-[2.5rem] w-full max-w-xl shadow-2xl animate-in zoom-in-95 duration-300 overflow-hidden max-h-[90vh] flex flex-col">
            <div className="p-10 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
              <div>
                <h3 className="text-3xl font-black text-slate-800 tracking-tight">{editingId ? 'Editar Item' : 'Novo Item'}</h3>
                <p className="text-xs text-slate-400 font-bold uppercase tracking-widest mt-1">Configure os detalhes do seu catálogo</p>
              </div>
              <button onClick={() => setShowModal(false)} className="h-12 w-12 flex items-center justify-center bg-white text-slate-400 hover:text-slate-600 rounded-2xl shadow-sm transition-all hover:rotate-90">
                <X size={24} />
              </button>
            </div>
            
            <form onSubmit={handleSave} className="p-10 space-y-8 overflow-y-auto custom-scrollbar">
              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Tipo de Oferta</label>
                  <select 
                    className="w-full bg-slate-50 border border-slate-100 rounded-2xl p-4 text-sm font-bold outline-none focus:ring-4 focus:ring-blue-100 transition-all"
                    value={formData.type}
                    onChange={e => setFormData({...formData, type: e.target.value as any})}
                  >
                    <option value="Produto">Produto Físico</option>
                    <option value="Serviço">Prestação de Serviço</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Categoria Fiscal</label>
                  <select 
                    className="w-full bg-slate-50 border border-slate-100 rounded-2xl p-4 text-sm font-bold outline-none focus:ring-4 focus:ring-blue-100 transition-all"
                    value={formData.category}
                    onChange={e => setFormData({...formData, category: e.target.value as Category})}
                  >
                    {Object.values(Category).map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Nome do Item</label>
                <input 
                  type="text"
                  placeholder="Ex: Consultoria Técnica ou Camiseta Algodão"
                  className="w-full bg-slate-50 border border-slate-100 rounded-2xl p-4 text-sm font-bold outline-none focus:ring-4 focus:ring-blue-100 transition-all"
                  value={formData.name}
                  onChange={e => setFormData({...formData, name: e.target.value})}
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Preço Sugerido (R$)</label>
                  <input 
                    type="number"
                    step="0.01"
                    min="0"
                    className="w-full bg-slate-50 border border-slate-100 rounded-2xl p-4 text-sm font-black text-blue-600 outline-none focus:ring-4 focus:ring-blue-100 transition-all"
                    value={formData.price}
                    onChange={e => setFormData({...formData, price: parseFloat(e.target.value) || 0})}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Monitorar Estoque?</label>
                  <div 
                    onClick={() => setFormData({...formData, controlStock: !formData.controlStock})}
                    className={`flex items-center gap-3 p-4 rounded-2xl border cursor-pointer transition-all ${formData.controlStock ? 'bg-blue-50 border-blue-100 text-blue-600' : 'bg-slate-50 border-slate-100 text-slate-400'}`}
                  >
                    {formData.controlStock ? <CheckCircle size={20} /> : <div className="h-5 w-5 rounded-full border-2 border-slate-200"></div>}
                    <span className="text-sm font-bold">{formData.controlStock ? 'Ativado' : 'Desativado'}</span>
                  </div>
                </div>
              </div>

              {formData.controlStock && formData.type === 'Produto' && (
                <div className="grid grid-cols-2 gap-6 p-6 bg-slate-50 rounded-[2rem] border border-slate-100 animate-in fade-in slide-in-from-top-4">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Qtd Atual em Estoque</label>
                    <input 
                      type="number"
                      min="0"
                      step="1"
                      className="w-full bg-white border border-slate-100 rounded-xl p-4 text-sm font-bold outline-none focus:ring-4 focus:ring-blue-100 transition-all"
                      value={formData.stock}
                      onChange={e => setFormData({...formData, stock: Math.max(0, Math.floor(parseInt(e.target.value) || 0))})}
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Limite para Alerta</label>
                    <input 
                      type="number"
                      min="0"
                      step="1"
                      className="w-full bg-white border border-slate-100 rounded-xl p-4 text-sm font-bold outline-none focus:ring-4 focus:ring-blue-100 transition-all"
                      value={formData.minStock}
                      onChange={e => setFormData({...formData, minStock: Math.max(0, Math.floor(parseInt(e.target.value) || 0))})}
                    />
                  </div>
                  <p className="col-span-2 text-[10px] text-slate-400 font-bold uppercase tracking-tight text-center mt-2">
                    O sistema avisará quando o estoque for menor ou igual a {formData.minStock} unidades.
                  </p>
                </div>
              )}

              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Descrição / Observações</label>
                <textarea 
                  rows={3}
                  className="w-full bg-slate-50 border border-slate-100 rounded-2xl p-4 text-sm font-bold outline-none focus:ring-4 focus:ring-blue-100 transition-all resize-none"
                  value={formData.description}
                  onChange={e => setFormData({...formData, description: e.target.value})}
                  placeholder="Informações adicionais para controle interno..."
                />
              </div>

              <div className="pt-6 flex gap-4">
                <button 
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="flex-1 bg-slate-100 text-slate-600 py-4 rounded-2xl font-black hover:bg-slate-200 transition-all active:scale-95 uppercase tracking-widest text-xs"
                >
                  Descartar
                </button>
                <button 
                  type="submit"
                  className="flex-1 bg-blue-600 text-white py-4 rounded-2xl font-black hover:bg-blue-700 transition-all shadow-xl shadow-blue-200 active:scale-95 uppercase tracking-widest text-xs"
                >
                  {editingId ? 'Salvar Alterações' : 'Confirmar Cadastro'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProductsList;
