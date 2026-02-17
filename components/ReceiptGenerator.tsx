
import React, { useState } from 'react';
import { Client, Config } from '../types';
import { Printer, FileText, User, DollarSign, Calendar, Hash, CheckCircle } from 'lucide-react';

interface Props {
  clients: Client[];
  config: Config;
}

const ReceiptGenerator: React.FC<Props> = ({ clients, config }) => {
  const [formData, setFormData] = useState({
    clientId: '',
    value: 0,
    serviceDescription: '',
    date: new Date().toISOString().split('T')[0],
    receiptNumber: Math.floor(1000 + Math.random() * 9000).toString()
  });

  const selectedClient = clients.find(c => c.id === formData.clientId);

  const handlePrint = () => {
    window.print();
  };

  const formatBRL = (val: number) => val.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });

  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      <div className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-slate-100 no-print">
        <div className="flex items-center gap-4 mb-8">
          <div className="h-14 w-14 rounded-2xl bg-blue-600 flex items-center justify-center text-white">
            <FileText size={28} />
          </div>
          <div>
            <h3 className="text-xl font-black text-slate-800 tracking-tight">Emissor de Recibos</h3>
            <p className="text-xs text-slate-400 font-bold uppercase tracking-widest mt-1">Gere comprovantes profissionais para seus clientes</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <div>
              <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Cliente</label>
              <select 
                className="w-full bg-slate-50 border border-slate-100 rounded-2xl p-4 text-sm font-bold outline-none focus:ring-4 focus:ring-blue-100"
                value={formData.clientId}
                onChange={e => setFormData({...formData, clientId: e.target.value})}
              >
                <option value="">Selecione um cliente...</option>
                {clients.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Descrição do Serviço/Venda</label>
              <textarea 
                className="w-full bg-slate-50 border border-slate-100 rounded-2xl p-4 text-sm font-bold outline-none focus:ring-4 focus:ring-blue-100 resize-none"
                rows={3}
                placeholder="Ex: Consultoria em Marketing Digital ref. ao mês de Outubro"
                value={formData.serviceDescription}
                onChange={e => setFormData({...formData, serviceDescription: e.target.value})}
              />
            </div>
          </div>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Valor (R$)</label>
                <input 
                  type="number"
                  className="w-full bg-slate-50 border border-slate-100 rounded-2xl p-4 text-sm font-black text-blue-600"
                  value={formData.value}
                  onChange={e => setFormData({...formData, value: parseFloat(e.target.value) || 0})}
                />
              </div>
              <div>
                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Nº Recibo</label>
                <input 
                  type="text"
                  className="w-full bg-slate-50 border border-slate-100 rounded-2xl p-4 text-sm font-mono font-bold"
                  value={formData.receiptNumber}
                  onChange={e => setFormData({...formData, receiptNumber: e.target.value})}
                />
              </div>
            </div>
            <div>
              <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Data de Emissão</label>
              <input 
                type="date"
                className="w-full bg-slate-50 border border-slate-100 rounded-2xl p-4 text-sm font-bold"
                value={formData.date}
                onChange={e => setFormData({...formData, date: e.target.value})}
              />
            </div>
            <button 
              onClick={handlePrint}
              disabled={!formData.clientId || !formData.value}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white p-4 rounded-2xl font-black text-xs uppercase tracking-widest flex items-center justify-center gap-2 shadow-xl shadow-blue-200 transition-all disabled:opacity-50 disabled:shadow-none"
            >
              <Printer size={18} /> Imprimir Recibo
            </button>
          </div>
        </div>
      </div>

      {/* PRÉ-VISUALIZAÇÃO / ÁREA DE IMPRESSÃO */}
      <div className="bg-white p-12 rounded-3xl shadow-sm border border-slate-100 max-w-2xl mx-auto print:shadow-none print:border-none print:p-0 print:m-0">
        <div className="border-4 border-slate-900 p-8 relative overflow-hidden">
           {/* Cabeçalho do Recibo */}
           <div className="flex justify-between items-start mb-8 border-b-2 border-slate-900 pb-6">
              <div>
                <h1 className="text-3xl font-black text-slate-900 uppercase tracking-tighter">RECIBO</h1>
                <p className="font-mono text-sm mt-1 font-bold">Nº {formData.receiptNumber}</p>
              </div>
              <div className="text-right">
                <p className="text-xl font-black text-slate-900 bg-slate-100 px-4 py-2 rounded-lg inline-block">
                  {formatBRL(formData.value)}
                </p>
              </div>
           </div>

           {/* Corpo do Recibo */}
           <div className="space-y-6 text-slate-800 leading-relaxed">
              <p className="text-lg">
                Recebi(emos) de <span className="font-black border-b border-slate-400 px-2">{selectedClient?.name || '___________________________'}</span>, 
                inscrito no CPF/CNPJ <span className="font-mono font-bold">{selectedClient?.taxId || '___.___.___/____-___'}</span>, 
                a importância de <span className="font-black underline italic">{formatBRL(formData.value)}</span>.
              </p>

              <p className="text-lg">
                Referente a: <span className="font-bold">{formData.serviceDescription || '____________________________________________________________________'}</span>
              </p>

              <p className="text-lg">
                Para maior clareza, firmo(amos) o presente recibo.
              </p>
           </div>

           {/* Data e Assinatura */}
           <div className="mt-16 flex flex-col items-center space-y-12">
              <p className="font-bold text-slate-700">
                Data: <span className="border-b border-slate-400 px-4">{new Date(formData.date).toLocaleDateString('pt-BR')}</span>
              </p>
              
              <div className="w-full max-w-xs text-center">
                 <div className="border-t-2 border-slate-900 pt-3">
                    <p className="font-black text-lg uppercase leading-none">{config.companyName || 'MEI - NOME DA EMPRESA'}</p>
                    <p className="text-sm font-mono mt-1">CNPJ: {config.taxId || '00.000.000/0001-00'}</p>
                 </div>
              </div>
           </div>

           <div className="absolute top-0 right-0 w-32 h-32 border-l border-b border-slate-100 -mr-16 -mt-16 rounded-full"></div>
        </div>
      </div>
    </div>
  );
};

export default ReceiptGenerator;
