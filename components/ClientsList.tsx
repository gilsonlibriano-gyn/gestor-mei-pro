
import React, { useState } from 'react';
import { Client, Transaction, TransactionType } from '../types';
import { Plus, User, Mail, Phone, MapPin, Trash2, Search, FileText, X, ArrowUpCircle, ArrowDownCircle } from 'lucide-react';

interface Props {
  clients: Client[];
  setClients: React.Dispatch<React.SetStateAction<Client[]>>;
  transactions: Transaction[];
  notify: (msg: string, type?: 'success' | 'error' | 'info') => void;
}

const ClientsList: React.FC<Props> = ({ clients, setClients, transactions, notify }) => {
  const [showModal, setShowModal] = useState(false);
  const [showHistoryModal, setShowHistoryModal] = useState(false);
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [formData, setFormData] = useState<Partial<Client>>({});

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    const newClient: Client = {
      id: crypto.randomUUID(),
      name: formData.name || '',
      taxId: formData.taxId || '',
      phone: formData.phone || '',
      email: formData.email || '',
      address: formData.address || ''
    };
    setClients([...clients, newClient]);
    setShowModal(false);
    setFormData({});
    notify("Cliente cadastrado com sucesso!");
  };

  const removeClient = (id: string) => {
    if (confirm('Deseja excluir este cliente?')) {
      setClients(clients.filter(c => c.id !== id));
      notify("Cliente removido com sucesso!");
    }
  };

  const openHistory = (client: Client) => {
    setSelectedClient(client);
    setShowHistoryModal(true);
  };

  const filtered = clients.filter(c => 
    c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.taxId.includes(searchTerm)
  );

  const formatBRL = (val: number) => val.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });

  // Transações do cliente selecionado
  const clientTransactions = selectedClient 
    ? transactions.filter(t => t.clientId === selectedClient.id).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    : [];

  const totalIn = clientTransactions
    .filter(t => t.type === TransactionType.SALE)
    .reduce((acc, curr) => acc + curr.value, 0);

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 rounded-3xl shadow-sm border border-slate-100">
        <div className="relative flex-1">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
          <input 
            type="text" 
            placeholder="Buscar por nome ou CPF/CNPJ..."
            className="w-full pl-12 pr-4 py-3 bg-slate-50 border border-transparent rounded-2xl focus:bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-100 outline-none text-sm font-medium transition-all"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <button 
          onClick={() => setShowModal(true)}
          className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-2xl font-black flex items-center justify-center gap-2 transition-all shadow-xl shadow-blue-200 active:scale-95"
        >
          <Plus size={22} />
          CADASTRAR CLIENTE
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filtered.map(client => (
          <div key={client.id} className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100 hover:shadow-xl hover:shadow-slate-200/50 transition-all relative group flex flex-col">
            <button 
              onClick={() => removeClient(client.id)}
              className="absolute top-4 right-4 text-slate-300 hover:text-rose-600 p-2 rounded-xl transition-colors opacity-0 group-hover:opacity-100"
            >
              <Trash2 size={18} />
            </button>
            <div className="flex items-center gap-4 mb-6">
               <div className="h-14 w-14 rounded-2xl bg-blue-50 flex items-center justify-center text-blue-600 font-black text-xl">
                 {client.name.charAt(0)}
               </div>
               <div>
                 <h4 className="font-black text-slate-800 leading-tight tracking-tight">{client.name}</h4>
                 <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest mt-1 font-mono">{client.taxId}</p>
               </div>
            </div>
            
            <div className="space-y-3 flex-1">
               <div className="flex items-center gap-3 text-sm text-slate-600 font-medium">
                 <Mail size={16} className="text-slate-300" />
                 <span className="truncate">{client.email}</span>
               </div>
               <div className="flex items-center gap-3 text-sm text-slate-600 font-medium">
                 <Phone size={16} className="text-slate-300" />
                 {client.phone}
               </div>
               {client.address && (
                 <div className="flex items-start gap-3 text-sm text-slate-600 font-medium">
                   <MapPin size={16} className="text-slate-300 mt-1 shrink-0" />
                   <span className="line-clamp-2">{client.address}</span>
                 </div>
               )}
            </div>
            
            <div className="mt-8 pt-6 border-t border-slate-50 flex justify-between items-center">
               <button 
                 onClick={() => openHistory(client)}
                 className="text-xs font-black text-blue-600 flex items-center gap-2 hover:bg-blue-50 px-4 py-2 rounded-xl transition-all uppercase tracking-widest"
               >
                 <FileText size={16} /> Ver Histórico
               </button>
               <div className="text-right">
                 <p className="text-[9px] text-slate-400 font-black uppercase tracking-tighter">Total Gasto</p>
                 <p className="text-sm font-black text-slate-700">
                    {formatBRL(transactions.filter(t => t.clientId === client.id && t.type === TransactionType.SALE).reduce((acc, curr) => acc + curr.value, 0))}
                 </p>
               </div>
            </div>
          </div>
        ))}
        {filtered.length === 0 && (
          <div className="col-span-full py-24 text-center text-slate-400 bg-white rounded-[2.5rem] border-2 border-dashed border-slate-100 flex flex-col items-center justify-center">
            <User size={48} className="mb-4 opacity-10" />
            <p className="font-black uppercase tracking-widest">Nenhum cliente cadastrado.</p>
            <p className="text-xs mt-2">Clique no botão acima para começar seu catálogo.</p>
          </div>
        )}
      </div>

      {/* MODAL: NOVO CLIENTE */}
      {showModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-[32px] w-full max-w-md shadow-2xl animate-in zoom-in-95 duration-200 overflow-hidden">
            <div className="p-8 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
              <h3 className="text-2xl font-black text-slate-800 tracking-tight">Novo Cliente</h3>
              <button onClick={() => setShowModal(false)} className="h-10 w-10 flex items-center justify-center bg-white text-slate-400 hover:text-slate-600 rounded-full shadow-sm">
                <X size={20} />
              </button>
            </div>
            <form onSubmit={handleAdd} className="p-8 space-y-5">
              <div>
                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5">Nome Completo</label>
                <input 
                  type="text"
                  className="w-full bg-slate-50 border border-slate-200 rounded-2xl p-4 text-sm font-bold outline-none focus:ring-4 focus:ring-blue-100 transition-all"
                  onChange={e => setFormData({...formData, name: e.target.value})}
                  required
                />
              </div>
              <div>
                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5">CPF ou CNPJ</label>
                <input 
                  type="text"
                  className="w-full bg-slate-50 border border-slate-200 rounded-2xl p-4 text-sm font-mono font-bold outline-none focus:ring-4 focus:ring-blue-100 transition-all"
                  onChange={e => setFormData({...formData, taxId: e.target.value})}
                  required
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5">E-mail</label>
                  <input 
                    type="email"
                    className="w-full bg-slate-50 border border-slate-200 rounded-2xl p-4 text-sm font-bold outline-none focus:ring-4 focus:ring-blue-100 transition-all"
                    onChange={e => setFormData({...formData, email: e.target.value})}
                    required
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5">Telefone</label>
                  <input 
                    type="tel"
                    className="w-full bg-slate-50 border border-slate-200 rounded-2xl p-4 text-sm font-bold outline-none focus:ring-4 focus:ring-blue-100 transition-all"
                    onChange={e => setFormData({...formData, phone: e.target.value})}
                    required
                  />
                </div>
              </div>
              <div>
                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5">Endereço Comercial</label>
                <textarea 
                  rows={2}
                  className="w-full bg-slate-50 border border-slate-200 rounded-2xl p-4 text-sm font-bold outline-none focus:ring-4 focus:ring-blue-100 transition-all resize-none"
                  onChange={e => setFormData({...formData, address: e.target.value})}
                />
              </div>
              <div className="pt-4 flex gap-4">
                <button 
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="flex-1 bg-slate-100 text-slate-600 py-4 rounded-2xl font-black hover:bg-slate-200 transition-all uppercase tracking-widest text-xs"
                >
                  Cancelar
                </button>
                <button 
                  type="submit"
                  className="flex-1 bg-blue-600 text-white py-4 rounded-2xl font-black hover:bg-blue-700 transition-all shadow-xl shadow-blue-200 active:scale-95 uppercase tracking-widest text-xs"
                >
                  Confirmar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: HISTÓRICO DE TRANSAÇÕES */}
      {showHistoryModal && selectedClient && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-[32px] w-full max-w-3xl shadow-2xl animate-in slide-in-from-bottom-8 duration-300 overflow-hidden flex flex-col max-h-[90vh]">
            <div className="p-8 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
              <div className="flex items-center gap-4">
                <div className="h-12 w-12 rounded-2xl bg-blue-600 text-white flex items-center justify-center font-black">
                   {selectedClient.name.charAt(0)}
                </div>
                <div>
                  <h3 className="text-xl font-black text-slate-800 tracking-tight">Histórico: {selectedClient.name}</h3>
                  <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest mt-1">Extrato de todas as movimentações</p>
                </div>
              </div>
              <button onClick={() => setShowHistoryModal(false)} className="h-12 w-12 flex items-center justify-center bg-white text-slate-400 hover:text-slate-600 rounded-2xl shadow-sm transition-all hover:rotate-90">
                <X size={24} />
              </button>
            </div>
            
            <div className="p-8 overflow-y-auto custom-scrollbar space-y-8 flex-1">
              {/* Resumo Rápido do Cliente no Modal */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="bg-emerald-50 p-6 rounded-3xl border border-emerald-100 flex items-center gap-4">
                  <div className="h-12 w-12 rounded-2xl bg-emerald-100 text-emerald-600 flex items-center justify-center">
                    <ArrowUpCircle size={24} />
                  </div>
                  <div>
                    <p className="text-[9px] font-black text-emerald-600 uppercase tracking-widest mb-0.5">Total Pago</p>
                    <p className="text-xl font-black text-emerald-700 tracking-tighter">{formatBRL(totalIn)}</p>
                  </div>
                </div>
                <div className="bg-blue-50 p-6 rounded-3xl border border-blue-100 flex items-center gap-4">
                  <div className="h-12 w-12 rounded-2xl bg-blue-100 text-blue-600 flex items-center justify-center">
                    <FileText size={24} />
                  </div>
                  <div>
                    <p className="text-[9px] font-black text-blue-600 uppercase tracking-widest mb-0.5">Nº de Vendas</p>
                    <p className="text-xl font-black text-blue-700 tracking-tighter">{clientTransactions.filter(t => t.type === TransactionType.SALE).length} Operações</p>
                  </div>
                </div>
              </div>

              <div className="overflow-hidden border border-slate-100 rounded-3xl">
                <table className="w-full text-left">
                  <thead className="bg-slate-50 text-[10px] font-black text-slate-400 uppercase tracking-widest">
                    <tr>
                      <th className="px-6 py-4">Data</th>
                      <th className="px-6 py-4">Descrição</th>
                      <th className="px-6 py-4 text-right">Valor</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-50">
                    {clientTransactions.length > 0 ? (
                      clientTransactions.map(t => (
                        <tr key={t.id} className="hover:bg-slate-50 transition-colors">
                          <td className="px-6 py-4 text-sm font-bold text-slate-500">
                            {new Date(t.date).toLocaleDateString('pt-BR')}
                          </td>
                          <td className="px-6 py-4">
                             <p className="text-sm font-black text-slate-800">{t.description}</p>
                             <p className="text-[10px] text-slate-400 font-bold uppercase tracking-tighter">{t.category}</p>
                          </td>
                          <td className={`px-6 py-4 text-sm font-black text-right ${t.type === TransactionType.SALE ? 'text-emerald-600' : 'text-rose-600'}`}>
                             {t.type === TransactionType.SALE ? '+' : '-'} {formatBRL(t.value)}
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan={3} className="px-6 py-12 text-center text-slate-400 font-bold italic text-sm">
                          Nenhuma transação vinculada a este cliente.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
            
            <div className="p-8 bg-slate-50/50 border-t border-slate-100 flex justify-end">
              <button 
                onClick={() => setShowHistoryModal(false)}
                className="bg-slate-900 text-white px-10 py-4 rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl shadow-slate-200 active:scale-95"
              >
                Fechar Histórico
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ClientsList;
