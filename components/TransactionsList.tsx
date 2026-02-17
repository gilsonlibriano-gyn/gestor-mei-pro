
import React, { useState, useEffect } from 'react';
import { Transaction, TransactionType, Category, Product, Client } from '../types';
import { Plus, Trash2, Search, Filter, Calendar, Tag, CreditCard, ChevronDown, CheckCircle, Receipt, Package, ShoppingBag, Percent } from 'lucide-react';

interface Props {
  transactions: Transaction[];
  setTransactions: React.Dispatch<React.SetStateAction<Transaction[]>>;
  products: Product[];
  setProducts: React.Dispatch<React.SetStateAction<Product[]>>;
  clients: Client[];
  notify: (msg: string, type?: any) => void;
}

const TransactionsList: React.FC<Props> = ({ transactions, setTransactions, products, setProducts, clients, notify }) => {
  const [showModal, setShowModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [formData, setFormData] = useState<Partial<Transaction>>({
    type: TransactionType.SALE,
    date: new Date().toISOString().split('T')[0],
    value: 0,
    description: '',
    category: Category.COMMERCE,
    hasInvoice: false,
    quantity: 1,
    productId: '',
    discount: 0
  });

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    const newTransaction: Transaction = {
      id: crypto.randomUUID(),
      ...formData as Transaction
    };

    if (newTransaction.productId) {
      setProducts(prev => prev.map(p => {
        if (p.id === newTransaction.productId && p.controlStock) {
          const qty = Number(newTransaction.quantity) || 1;
          return {
            ...p,
            stock: newTransaction.type === TransactionType.SALE ? p.stock - qty : p.stock + qty
          };
        }
        return p;
      }));
    }

    setTransactions([newTransaction, ...transactions]);
    setShowModal(false);
    notify(`Lançamento de ${newTransaction.type} registrado!`);
    
    resetForm();
  };

  const resetForm = () => {
    setFormData({
      type: TransactionType.SALE,
      date: new Date().toISOString().split('T')[0],
      value: 0,
      description: '',
      category: Category.COMMERCE,
      hasInvoice: false,
      quantity: 1,
      productId: '',
      discount: 0
    });
  };

  const removeTransaction = (id: string) => {
    if (confirm('Deseja excluir este lançamento?')) {
      setTransactions(transactions.filter(t => t.id !== id));
      notify("Lançamento excluído.");
    }
  };

  // Função para lidar com a seleção de produto e auto-preencher
  const handleProductSelect = (productId: string) => {
    const prod = products.find(p => p.id === productId);
    if (prod) {
      const defaultQty = 1;
      const discount = formData.discount || 0;
      setFormData({
        ...formData,
        productId: prod.id,
        description: prod.name,
        value: (prod.price * defaultQty) - discount,
        quantity: defaultQty,
        category: prod.category,
        type: TransactionType.SALE
      });
      notify(`${prod.name} selecionado. Dados preenchidos!`, "info");
    } else {
      setFormData({ ...formData, productId: '', description: '', value: 0 });
    }
  };

  // Atualiza o valor total quando a quantidade muda
  const handleQuantityChange = (qty: number) => {
    const prod = products.find(p => p.id === formData.productId);
    const discount = formData.discount || 0;
    const newValue = prod ? (prod.price * qty) - discount : formData.value;
    setFormData({ ...formData, quantity: qty, value: newValue });
  };

  // Atualiza o valor total quando o desconto muda
  const handleDiscountChange = (discount: number) => {
    const prod = products.find(p => p.id === formData.productId);
    const qty = formData.quantity || 1;
    const subtotal = prod ? (prod.price * qty) : (Number(formData.value) + (Number(formData.discount) || 0));
    setFormData({ ...formData, discount, value: subtotal - discount });
  };

  const filtered = transactions.filter(t => 
    t.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
    t.category.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const formatBRL = (val: number) => val.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 rounded-3xl shadow-sm border border-slate-100">
        <div className="relative flex-1">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
          <input 
            type="text" 
            placeholder="Buscar por descrição ou categoria..."
            className="w-full pl-12 pr-4 py-3 bg-slate-50 border border-transparent rounded-2xl focus:bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-100 outline-none text-sm font-medium transition-all"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <button 
          onClick={() => { resetForm(); setShowModal(true); }}
          className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-2xl font-black flex items-center justify-center gap-2 transition-all shadow-xl shadow-blue-200 active:scale-95"
        >
          <Plus size={22} />
          NOVO LANÇAMENTO
        </button>
      </div>

      <div className="bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-slate-50 border-b border-slate-100">
              <tr>
                <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Data</th>
                <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Tipo</th>
                <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Descrição</th>
                <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Categoria</th>
                <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Valor</th>
                <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {filtered.map(t => (
                <tr key={t.id} className="hover:bg-slate-50/50 transition-colors group">
                  <td className="px-8 py-5 text-sm text-slate-600 font-bold">
                    {new Date(t.date).toLocaleDateString('pt-BR')}
                  </td>
                  <td className="px-8 py-5">
                    <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider ${
                      t.type === TransactionType.SALE ? 'bg-emerald-100 text-emerald-700' : 
                      t.type === TransactionType.PURCHASE ? 'bg-blue-100 text-blue-700' : 'bg-rose-100 text-rose-700'
                    }`}>
                      {t.type}
                    </span>
                  </td>
                  <td className="px-8 py-5 text-sm font-black text-slate-800">
                    {t.description}
                    {t.discount ? (
                      <span className="ml-2 inline-flex items-center text-[9px] bg-rose-50 text-rose-500 px-1.5 py-0.5 rounded-md font-black uppercase">
                        Desconto: {formatBRL(t.discount)}
                      </span>
                    ) : null}
                  </td>
                  <td className="px-8 py-5">
                    <span className="flex items-center gap-1.5 text-xs text-slate-500 font-bold">
                      <Tag size={14} className="text-slate-300" />
                      {t.category}
                    </span>
                  </td>
                  <td className={`px-8 py-5 text-sm font-black ${t.type === TransactionType.SALE ? 'text-emerald-600' : 'text-rose-600'}`}>
                    {t.type === TransactionType.SALE ? '+' : '-'} {formatBRL(t.value)}
                  </td>
                  <td className="px-8 py-5 text-right">
                    <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                       <button 
                         onClick={() => removeTransaction(t.id)}
                         className="p-2.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-all"
                       >
                         <Trash2 size={18} />
                       </button>
                    </div>
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-8 py-20 text-center">
                    <div className="flex flex-col items-center justify-center text-slate-400">
                      <Receipt size={48} className="mb-4 opacity-20" />
                      <p className="font-bold">Nenhum lançamento registrado.</p>
                      <p className="text-xs">Comece adicionando sua primeira venda ou despesa.</p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-[32px] w-full max-w-xl shadow-2xl animate-in zoom-in-95 duration-300 overflow-hidden max-h-[90vh] overflow-y-auto">
            <div className="p-8 border-b border-slate-100 flex items-center justify-between bg-slate-50/50 sticky top-0 z-10">
              <div>
                <h3 className="text-2xl font-black text-slate-800 tracking-tight">Novo Lançamento</h3>
                <p className="text-xs text-slate-400 font-bold uppercase tracking-widest mt-1">Selecione um produto para agilizar</p>
              </div>
              <button onClick={() => setShowModal(false)} className="h-10 w-10 flex items-center justify-center bg-white text-slate-400 hover:text-slate-600 rounded-full shadow-sm font-bold text-xl">×</button>
            </div>
            <form onSubmit={handleAdd} className="p-8 space-y-6">
              
              {/* SELETOR DE PRODUTO - O "AGILIZADOR" */}
              <div className="bg-blue-50/50 p-6 rounded-3xl border border-blue-100">
                <label className="block text-[10px] font-black text-blue-600 uppercase tracking-widest mb-3 flex items-center gap-2">
                  <Package size={14} /> Selecionar do Catálogo (Opcional)
                </label>
                <select 
                  className="w-full bg-white border border-blue-200 rounded-2xl p-4 text-sm font-bold outline-none focus:ring-4 focus:ring-blue-100 transition-all cursor-pointer"
                  value={formData.productId}
                  onChange={e => handleProductSelect(e.target.value)}
                >
                  <option value="">-- Selecionar Produto ou Serviço --</option>
                  <optgroup label="Produtos">
                    {products.filter(p => p.type === 'Produto').map(p => (
                      <option key={p.id} value={p.id}>{p.name} ({formatBRL(p.price)}) {p.controlStock ? `| Est: ${p.stock}` : ''}</option>
                    ))}
                  </optgroup>
                  <optgroup label="Serviços">
                    {products.filter(p => p.type === 'Serviço').map(p => (
                      <option key={p.id} value={p.id}>{p.name} ({formatBRL(p.price)})</option>
                    ))}
                  </optgroup>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-6">
                <div>
                  <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Tipo de Operação</label>
                  <select 
                    className="w-full bg-slate-50 border border-slate-200 rounded-2xl p-4 text-sm font-bold outline-none focus:ring-4 focus:ring-blue-100"
                    value={formData.type}
                    onChange={e => setFormData({...formData, type: e.target.value as TransactionType})}
                  >
                    <option value={TransactionType.SALE}>Venda (Entrada)</option>
                    <option value={TransactionType.PURCHASE}>Compra (Saída)</option>
                    <option value={TransactionType.EXPENSE}>Despesa (Geral)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Data</label>
                  <input 
                    type="date"
                    className="w-full bg-slate-50 border border-slate-200 rounded-2xl p-4 text-sm font-bold outline-none focus:ring-4 focus:ring-blue-100"
                    value={formData.date}
                    onChange={e => setFormData({...formData, date: e.target.value})}
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Descrição / Detalhes</label>
                <input 
                  type="text"
                  placeholder="Ex: Consultoria em TI / Venda de Bolo"
                  className="w-full bg-slate-50 border border-slate-200 rounded-2xl p-4 text-sm font-bold outline-none focus:ring-4 focus:ring-blue-100"
                  value={formData.description}
                  onChange={e => setFormData({...formData, description: e.target.value})}
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-6">
                <div>
                  <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Categoria</label>
                  <select 
                    className="w-full bg-slate-50 border border-slate-200 rounded-2xl p-4 text-sm font-bold outline-none focus:ring-4 focus:ring-blue-100"
                    value={formData.category}
                    onChange={e => setFormData({...formData, category: e.target.value as Category})}
                  >
                    {Object.values(Category).map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
                <div>
                   <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Quantidade</label>
                   <input 
                     type="number"
                     min="1"
                     className="w-full bg-slate-50 border border-slate-200 rounded-2xl p-4 text-sm font-bold outline-none focus:ring-4 focus:ring-blue-100"
                     value={formData.quantity}
                     onChange={e => handleQuantityChange(parseInt(e.target.value) || 1)}
                     required
                   />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-6">
                <div>
                  <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Desconto (R$)</label>
                  <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 font-bold text-rose-400">R$</span>
                    <input 
                      type="number"
                      step="0.01"
                      min="0"
                      className="w-full bg-rose-50 border border-rose-100 rounded-2xl p-4 pl-10 text-sm font-bold outline-none focus:ring-4 focus:ring-rose-100 text-rose-600 transition-all"
                      value={formData.discount}
                      onChange={e => handleDiscountChange(parseFloat(e.target.value) || 0)}
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Valor Total Final</label>
                  <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 font-bold text-slate-400">R$</span>
                    <input 
                      type="number"
                      step="0.01"
                      className="w-full bg-slate-50 border border-slate-200 rounded-2xl p-4 pl-10 text-lg font-black outline-none focus:ring-4 focus:ring-blue-100 text-blue-600"
                      value={formData.value}
                      onChange={e => setFormData({...formData, value: parseFloat(e.target.value) || 0})}
                      required
                    />
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Vincular Cliente (Opcional)</label>
                <select 
                  className="w-full bg-slate-50 border border-slate-200 rounded-2xl p-4 text-sm font-bold outline-none focus:ring-4 focus:ring-blue-100"
                  value={formData.clientId}
                  onChange={e => setFormData({...formData, clientId: e.target.value})}
                >
                  <option value="">Venda para Cliente não Identificado</option>
                  {clients.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
              </div>

              <div className="p-6 bg-slate-50 rounded-3xl border border-slate-100 flex items-center justify-between">
                 <div className="flex items-center gap-3">
                    <div className={`h-10 w-10 rounded-xl flex items-center justify-center ${formData.hasInvoice ? 'bg-emerald-100 text-emerald-600' : 'bg-slate-200 text-slate-400'}`}>
                       <CheckCircle size={20} />
                    </div>
                    <div>
                       <p className="text-sm font-black text-slate-700">Nota Fiscal Emitida?</p>
                       <p className="text-[10px] text-slate-400 font-bold uppercase">Ajuda no DASN-SIMEI</p>
                    </div>
                 </div>
                 <input 
                   type="checkbox" 
                   className="h-6 w-6 rounded-lg border-slate-300 text-blue-600 focus:ring-blue-500"
                   checked={formData.hasInvoice}
                   onChange={e => setFormData({...formData, hasInvoice: e.target.checked})}
                 />
              </div>

              <div className="pt-4 flex gap-4">
                <button 
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="flex-1 bg-slate-100 text-slate-600 py-4 rounded-2xl font-black hover:bg-slate-200 transition-colors"
                >
                  CANCELAR
                </button>
                <button 
                  type="submit"
                  className="flex-1 bg-blue-600 text-white py-4 rounded-2xl font-black hover:bg-blue-700 transition-all shadow-xl shadow-blue-200 active:scale-95"
                >
                  REGISTRAR AGORA
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default TransactionsList;
