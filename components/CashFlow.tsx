
import React, { useState, useMemo } from 'react';
import { Transaction, TransactionType, Category } from '../types';
import { 
  ArrowUpCircle, 
  ArrowDownCircle, 
  Wallet, 
  Search, 
  Filter, 
  Calendar, 
  Tag, 
  ChevronRight, 
  Download,
  FilterX
} from 'lucide-react';

interface Props {
  transactions: Transaction[];
}

const CashFlow: React.FC<Props> = ({ transactions }) => {
  const [startDate, setStartDate] = useState<string>(() => {
    const d = new Date();
    d.setDate(1); // Primeiro dia do mês atual
    return d.toISOString().split('T')[0];
  });
  
  const [endDate, setEndDate] = useState<string>(() => {
    return new Date().toISOString().split('T')[0];
  });

  const [filterCategory, setFilterCategory] = useState<string>('all');
  const [filterType, setFilterType] = useState<string>('all');

  const filteredTransactions = useMemo(() => {
    return transactions.filter(t => {
      const tDate = new Date(t.date).toISOString().split('T')[0];
      const matchDate = tDate >= startDate && tDate <= endDate;
      const matchCategory = filterCategory === 'all' || t.category === filterCategory;
      const matchType = filterType === 'all' || t.type === filterType;
      return matchDate && matchCategory && matchType;
    }).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }, [transactions, startDate, endDate, filterCategory, filterType]);

  const stats = useMemo(() => {
    return filteredTransactions.reduce((acc, curr) => {
      if (curr.type === TransactionType.SALE) {
        acc.totalIn += curr.value;
      } else {
        acc.totalOut += curr.value;
      }
      return acc;
    }, { totalIn: 0, totalOut: 0 });
  }, [filteredTransactions]);

  const balance = stats.totalIn - stats.totalOut;

  const formatBRL = (val: number) => val.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });

  const resetFilters = () => {
    const d = new Date();
    d.setDate(1);
    setStartDate(d.toISOString().split('T')[0]);
    setEndDate(new Date().toISOString().split('T')[0]);
    setFilterCategory('all');
    setFilterType('all');
  };

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      {/* Header com Filtros */}
      <div className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-slate-100 glass">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <div className="h-14 w-14 rounded-2xl bg-blue-600 flex items-center justify-center text-white shadow-lg shadow-blue-200">
              <Filter size={24} />
            </div>
            <div>
              <h3 className="text-xl font-black text-slate-800 tracking-tight">Filtros de Período</h3>
              <p className="text-xs text-slate-400 font-bold uppercase tracking-widest mt-1">Refine sua análise financeira</p>
            </div>
          </div>
          
          <div className="flex flex-wrap items-center gap-4">
            <div className="flex items-center gap-2 bg-slate-50 p-2 rounded-2xl border border-slate-100">
              <Calendar size={16} className="text-slate-400 ml-2" />
              <input 
                type="date" 
                className="bg-transparent text-sm font-bold text-slate-700 outline-none p-1"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
              />
              <span className="text-slate-300 font-bold">até</span>
              <input 
                type="date" 
                className="bg-transparent text-sm font-bold text-slate-700 outline-none p-1"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
              />
            </div>

            <select 
              className="bg-slate-50 border border-slate-100 p-3.5 rounded-2xl text-sm font-bold text-slate-700 outline-none focus:ring-4 focus:ring-blue-100 transition-all"
              value={filterCategory}
              onChange={(e) => setFilterCategory(e.target.value)}
            >
              <option value="all">Todas Categorias</option>
              {Object.values(Category).map(c => <option key={c} value={c}>{c}</option>)}
            </select>

            <select 
              className="bg-slate-50 border border-slate-100 p-3.5 rounded-2xl text-sm font-bold text-slate-700 outline-none focus:ring-4 focus:ring-blue-100 transition-all"
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
            >
              <option value="all">Todos Tipos</option>
              {Object.values(TransactionType).map(t => <option key={t} value={t}>{t}</option>)}
            </select>

            <button 
              onClick={resetFilters}
              className="p-3.5 rounded-2xl bg-slate-100 text-slate-500 hover:bg-slate-200 transition-all shadow-sm"
              title="Limpar Filtros"
            >
              <FilterX size={20} />
            </button>
          </div>
        </div>
      </div>

      {/* Resumo do Período */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-slate-100 group">
          <div className="flex items-center gap-4 mb-4">
            <div className="h-12 w-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center group-hover:scale-110 transition-transform">
              <ArrowUpCircle size={28} />
            </div>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Entradas no Período</p>
          </div>
          <p className="text-3xl font-black text-emerald-600 tracking-tighter">{formatBRL(stats.totalIn)}</p>
        </div>

        <div className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-slate-100 group">
          <div className="flex items-center gap-4 mb-4">
            <div className="h-12 w-12 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center group-hover:scale-110 transition-transform">
              <ArrowDownCircle size={28} />
            </div>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Saídas no Período</p>
          </div>
          <p className="text-3xl font-black text-rose-600 tracking-tighter">{formatBRL(stats.totalOut)}</p>
        </div>

        <div className={`p-8 rounded-[2.5rem] shadow-xl transition-all ${balance >= 0 ? 'bg-blue-600 shadow-blue-200' : 'bg-rose-600 shadow-rose-200'}`}>
          <div className="flex items-center gap-4 mb-4">
            <div className="h-12 w-12 rounded-2xl bg-white/20 text-white flex items-center justify-center backdrop-blur-md">
              <Wallet size={28} />
            </div>
            <p className="text-[10px] font-black text-white/70 uppercase tracking-widest">Saldo do Período</p>
          </div>
          <p className="text-3xl font-black text-white tracking-tighter">{formatBRL(balance)}</p>
        </div>
      </div>

      {/* Tabela de Lançamentos do Fluxo */}
      <div className="bg-white rounded-[2.5rem] shadow-sm border border-slate-100 overflow-hidden">
        <div className="p-8 border-b border-slate-50 flex items-center justify-between">
          <h4 className="text-lg font-black text-slate-800 tracking-tight">Movimentações Detalhadas</h4>
          <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">{filteredTransactions.length} registros encontrados</span>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-slate-50/50">
              <tr>
                <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Data</th>
                <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Tipo</th>
                <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Descrição</th>
                <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Categoria</th>
                <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Valor</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {filteredTransactions.map(t => (
                <tr key={t.id} className="hover:bg-slate-50/30 transition-colors group">
                  <td className="px-8 py-5">
                    <div className="flex items-center gap-3">
                      <div className="h-2 w-2 rounded-full bg-slate-300"></div>
                      <span className="text-sm font-bold text-slate-600">{new Date(t.date).toLocaleDateString('pt-BR')}</span>
                    </div>
                  </td>
                  <td className="px-8 py-5">
                    <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider ${
                      t.type === TransactionType.SALE ? 'bg-emerald-50 text-emerald-600' : 
                      t.type === TransactionType.PURCHASE ? 'bg-blue-50 text-blue-600' : 'bg-rose-50 text-rose-600'
                    }`}>
                      {t.type}
                    </span>
                  </td>
                  <td className="px-8 py-5 text-sm font-black text-slate-800">{t.description}</td>
                  <td className="px-8 py-5">
                    <span className="flex items-center gap-1.5 text-xs text-slate-400 font-bold uppercase tracking-tighter">
                      <Tag size={12} className="text-slate-300" />
                      {t.category}
                    </span>
                  </td>
                  <td className={`px-8 py-5 text-sm font-black text-right ${t.type === TransactionType.SALE ? 'text-emerald-600' : 'text-rose-600'}`}>
                    {t.type === TransactionType.SALE ? '+' : '-'} {formatBRL(t.value)}
                  </td>
                </tr>
              ))}
              {filteredTransactions.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-8 py-20 text-center">
                    <div className="flex flex-col items-center justify-center text-slate-300">
                      <Search size={48} className="mb-4 opacity-20" />
                      <p className="font-bold">Nenhuma movimentação para este filtro.</p>
                      <p className="text-xs">Tente ajustar as datas ou categorias.</p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default CashFlow;
