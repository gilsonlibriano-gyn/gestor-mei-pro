
import React, { useMemo, useState } from 'react';
import { Transaction, TransactionType, Category, Product } from '../types';
import { FileText, Download, Printer, Info, CheckCircle2, Package, LayoutList, TrendingUp, DollarSign, Table as TableIcon, Calendar, Files, FileDown } from 'lucide-react';

interface Props {
  transactions: Transaction[];
  products: Product[];
}

const Reports: React.FC<Props> = ({ transactions, products }) => {
  const [activeSubTab, setActiveSubTab] = useState<'revenue' | 'stock' | 'complete'>('revenue');
  const currentYear = new Date().getFullYear();
  const months = [
    'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
    'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
  ];

  const reportData = useMemo(() => {
    return months.map((monthName, idx) => {
      const monthIdx = idx;
      const monthTransactions = transactions.filter(t => {
        const d = new Date(t.date);
        return d.getMonth() === monthIdx && d.getFullYear() === currentYear && t.type === TransactionType.SALE;
      });

      const commerce = monthTransactions
        .filter(t => t.category === Category.COMMERCE || t.category === Category.INDUSTRY)
        .reduce((acc, curr) => acc + curr.value, 0);

      const services = monthTransactions
        .filter(t => t.category === Category.SERVICE)
        .reduce((acc, curr) => acc + curr.value, 0);

      return {
        month: monthName,
        commerce,
        services,
        total: commerce + services
      };
    });
  }, [transactions, currentYear]);

  const revenueTotals = useMemo(() => {
    return reportData.reduce((acc, curr) => ({
      commerce: acc.commerce + curr.commerce,
      services: acc.services + curr.services,
      total: acc.total + curr.total
    }), { commerce: 0, services: 0, total: 0 });
  }, [reportData]);

  const stockData = useMemo(() => {
    return products.map(p => ({
      ...p,
      totalValue: p.stock * p.price
    }));
  }, [products]);

  const stockTotalValue = useMemo(() => {
    return stockData.reduce((acc, curr) => acc + curr.totalValue, 0);
  }, [stockData]);

  const handlePrint = () => {
    const originalTitle = document.title;
    const dateStr = new Date().toLocaleDateString('pt-BR').replace(/\//g, '-');
    const titles = {
      revenue: `Relatorio_Financeiro_MEI_${currentYear}`,
      stock: `Inventario_Estoque_MEI_${dateStr}`,
      complete: `Relatorio_Consolidado_MEI_${currentYear}`
    };
    
    document.title = titles[activeSubTab];
    
    // Pequeno atraso para garantir que o título da aba/documento seja atualizado 
    // e o layout de impressão processado corretamente
    setTimeout(() => {
      window.print();
      document.title = originalTitle;
    }, 300);
  };

  const handleExportExcel = () => {
    let headers: string[] = [];
    let rows: string[][] = [];
    let filename = '';
    const BOM = "\uFEFF";

    if (activeSubTab === 'revenue' || activeSubTab === 'complete') {
      headers = ['Mês', 'Comércio/Indústria (R$)', 'Serviços (R$)', 'Total (R$)'];
      rows = reportData.map(d => [
        d.month, 
        d.commerce.toFixed(2).replace('.', ','), 
        d.services.toFixed(2).replace('.', ','), 
        d.total.toFixed(2).replace('.', ',')
      ]);
      filename = `Relatorio_Financeiro_MEI_${currentYear}.csv`;
    } else {
      headers = ['Item', 'Tipo', 'Preço Unitário (R$)', 'Estoque Atual', 'Valor Total Patrimonial (R$)'];
      rows = stockData.map(p => [
        p.name, 
        p.type, 
        p.price.toFixed(2).replace('.', ','), 
        p.stock.toString(), 
        p.totalValue.toFixed(2).replace('.', ',')
      ]);
      filename = `Relatorio_Estoque_MEI_${currentYear}.csv`;
    }

    const csvContent = BOM + headers.join(";") + "\n" + rows.map(e => e.join(";")).join("\n");
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", filename);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const formatBRL = (val: number) => val.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });

  const RevenueSection = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-slate-50 p-6 rounded-2xl border border-slate-100">
           <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Indústria / Comércio</p>
           <p className="text-xl font-black text-slate-800">{formatBRL(revenueTotals.commerce)}</p>
        </div>
        <div className="bg-slate-50 p-6 rounded-2xl border border-slate-100">
           <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Serviços</p>
           <p className="text-xl font-black text-slate-800">{formatBRL(revenueTotals.services)}</p>
        </div>
        <div className="bg-blue-600 p-6 rounded-2xl shadow-lg">
           <p className="text-[10px] font-black text-blue-100 uppercase tracking-widest mb-1 print:text-white">Total Consolidado</p>
           <p className="text-xl font-black text-white">{formatBRL(revenueTotals.total)}</p>
        </div>
      </div>

      <div className="overflow-x-auto border border-slate-100 rounded-2xl print:border-none">
        <table className="w-full text-left">
          <thead className="bg-slate-50 border-b border-slate-100">
            <tr>
              <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Mês</th>
              <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Vendas</th>
              <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Serviços</th>
              <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Subtotal</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50">
            {reportData.map((d) => (
              <tr key={d.month}>
                <td className="px-6 py-4 font-bold text-slate-700 text-sm">{d.month}</td>
                <td className="px-6 py-4 text-xs text-slate-500">{formatBRL(d.commerce)}</td>
                <td className="px-6 py-4 text-xs text-slate-500">{formatBRL(d.services)}</td>
                <td className="px-6 py-4 text-xs font-black text-blue-600 text-right">{formatBRL(d.total)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );

  const StockSection = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-slate-50 p-6 rounded-2xl border border-slate-100">
           <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Produtos no Portfólio</p>
           <p className="text-xl font-black text-slate-800">{products.filter(p => p.type === 'Produto').length} Itens</p>
        </div>
        <div className="bg-indigo-600 p-6 rounded-2xl shadow-lg">
           <p className="text-[10px] font-black text-indigo-100 uppercase tracking-widest mb-1 print:text-white">Valor Total Investido</p>
           <p className="text-xl font-black text-white">{formatBRL(stockTotalValue)}</p>
        </div>
      </div>

      <div className="overflow-x-auto border border-slate-100 rounded-2xl print:border-none">
        <table className="w-full text-left">
          <thead className="bg-slate-50 border-b border-slate-100">
            <tr>
              <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Item</th>
              <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Estoque</th>
              <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Preço Unit.</th>
              <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Patrimônio</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50">
            {stockData.map((p) => (
              <tr key={p.id}>
                <td className="px-6 py-4">
                   <p className="font-bold text-slate-800 text-sm">{p.name}</p>
                   <p className="text-[9px] text-slate-400 font-bold uppercase tracking-tighter">{p.type}</p>
                </td>
                <td className="px-6 py-4">
                  <span className={`px-2 py-0.5 rounded-full text-[9px] font-black ${p.stock <= p.minStock ? 'bg-rose-100 text-rose-600' : 'bg-slate-100 text-slate-600'}`}>
                    {p.type === 'Produto' ? `${p.stock} UN` : 'Ilimitado'}
                  </span>
                </td>
                <td className="px-6 py-4 text-xs text-slate-500 text-right">{formatBRL(p.price)}</td>
                <td className="px-6 py-4 text-xs font-black text-indigo-600 text-right">{formatBRL(p.totalValue)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap p-1 bg-slate-200/50 rounded-xl w-fit glass no-print tabs-selector gap-1">
        <button onClick={() => setActiveSubTab('revenue')} className={`flex items-center gap-2 px-4 py-2 rounded-lg font-bold text-xs transition-all ${activeSubTab === 'revenue' ? 'bg-white text-blue-600 shadow' : 'text-slate-500'}`}><TrendingUp size={14} /> Faturamento</button>
        <button onClick={() => setActiveSubTab('stock')} className={`flex items-center gap-2 px-4 py-2 rounded-lg font-bold text-xs transition-all ${activeSubTab === 'stock' ? 'bg-white text-blue-600 shadow' : 'text-slate-500'}`}><Package size={14} /> Estoque</button>
        <button onClick={() => setActiveSubTab('complete')} className={`flex items-center gap-2 px-4 py-2 rounded-lg font-bold text-xs transition-all ${activeSubTab === 'complete' ? 'bg-white text-blue-600 shadow' : 'text-slate-500'}`}><Files size={14} /> Completo</button>
      </div>

      <div className="bg-white p-6 sm:p-10 rounded-[2rem] shadow-xl border border-slate-100 overflow-hidden relative report-print-container">
        <div className="absolute top-0 right-0 w-64 h-64 bg-blue-50 rounded-full blur-3xl -mr-32 -mt-32 opacity-30 no-print"></div>
        
        {/* Cabeçalho */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8 relative z-10 border-b border-slate-50 pb-8">
          <div className="flex items-center gap-4">
             <div className="h-14 w-14 rounded-xl bg-slate-900 text-white flex items-center justify-center shadow-lg shrink-0">
                <FileText size={28} />
             </div>
             <div>
                <h3 className="text-xl font-black text-slate-800 tracking-tight leading-tight">
                  {activeSubTab === 'revenue' ? 'Relatório de Faturamento' : 
                   activeSubTab === 'stock' ? 'Inventário de Estoque' : 'Relatório Gerencial'}
                </h3>
                <p className="text-slate-400 text-[10px] font-semibold uppercase tracking-widest mt-0.5">
                  Gerado em {new Date().toLocaleDateString('pt-BR')} • {currentYear}
                </p>
             </div>
          </div>
          <div className="flex flex-wrap gap-2 no-print">
             <button onClick={handlePrint} className="flex items-center gap-2 bg-emerald-600 text-white px-5 py-3 rounded-xl font-black hover:bg-emerald-700 transition-all text-[10px] uppercase tracking-wider shadow-lg shadow-emerald-100">
                <FileDown size={16} /> PDF / Baixar
             </button>
             <button onClick={handlePrint} className="flex items-center gap-2 bg-slate-100 text-slate-600 px-5 py-3 rounded-xl font-black hover:bg-slate-200 transition-all text-[10px] uppercase tracking-wider">
                <Printer size={16} /> Imprimir
             </button>
             <button onClick={handleExportExcel} className="flex items-center gap-2 bg-blue-600 text-white px-5 py-3 rounded-xl font-black hover:bg-blue-700 transition-all text-[10px] uppercase tracking-wider shadow-lg shadow-blue-100">
                <Download size={16} /> CSV
             </button>
          </div>
        </div>

        {/* Conteúdo */}
        <div className="relative z-10">
          {(activeSubTab === 'revenue' || activeSubTab === 'complete') && (
            <div className="mb-10">
               {activeSubTab === 'complete' && <p className="text-[10px] font-black text-blue-600 mb-4 tracking-[0.2em] uppercase">Parte I: Financeiro</p>}
               <RevenueSection />
            </div>
          )}

          {activeSubTab === 'complete' && (
            <div className="print-section-break border-t border-dashed border-slate-200 pt-10 mt-10 mb-10">
               <p className="text-[10px] font-black text-indigo-600 mb-4 tracking-[0.2em] uppercase">Parte II: Patrimônio</p>
               <StockSection />
            </div>
          )}

          {activeSubTab === 'stock' && <StockSection />}
        </div>

        {/* Rodapé */}
        <div className="mt-12 pt-6 border-t border-slate-50 flex flex-col sm:flex-row items-center justify-between gap-4">
           <div className="flex items-center gap-3">
              <CheckCircle2 size={16} className="text-emerald-500" />
              <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">
                Controle Interno MEI Pro • Válido para prestação de contas.
              </p>
           </div>
           <p className="text-[9px] text-slate-300 font-bold uppercase tracking-tighter no-print">Powered by Gemini AI</p>
        </div>
      </div>
    </div>
  );
};

export default Reports;
