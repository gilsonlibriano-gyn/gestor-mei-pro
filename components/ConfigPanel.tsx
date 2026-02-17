
import React, { useState } from 'react';
import { Config } from '../types';
import { Building2, Smartphone, Shield, Download, Trash2, Box, Copy, Check, Terminal } from 'lucide-react';
import { db } from '../services/db';

interface Props {
  config: Config;
  setConfig: React.Dispatch<React.SetStateAction<Config>>;
  notify: (msg: string, type?: any) => void;
  isActivated: boolean;
  onActivate: (active: boolean) => void;
}

const ConfigPanel: React.FC<Props> = ({ config, setConfig, notify }) => {
  const [newPin, setNewPin] = useState('');
  const [copied, setCopied] = useState(false);

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
    notify("Comando copiado!", "info");
  };

  const handleSetPin = () => {
    if (newPin.length < 4) {
      notify("O PIN deve ter no mínimo 4 dígitos.", "error");
      return;
    }
    const updatedConfig = {
      ...config,
      security: { ...config.security, pinHash: newPin, useEncryption: true, lockOnEntry: true }
    };
    setConfig(updatedConfig);
    db.saveConfig(updatedConfig);
    setNewPin('');
    notify("PIN de segurança configurado!", "success");
  };

  const handleExport = async () => {
    const data = await db.exportAllData();
    const blob = new Blob([data], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `backup_mei_${new Date().toISOString().split('T')[0]}.json`;
    link.click();
    notify("Backup exportado!");
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-32">
      {/* SEÇÃO APK / MOBILE */}
      <section className="bg-slate-900 rounded-[3rem] shadow-2xl overflow-hidden border border-white/5">
        <div className="p-8 bg-gradient-to-br from-blue-600 to-indigo-700">
           <div className="flex items-center gap-4 mb-2">
              <div className="h-12 w-12 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center text-white">
                <Smartphone size={24} />
              </div>
              <h3 className="text-xl font-black text-white uppercase tracking-tight">Gerador de Aplicativo (APK)</h3>
           </div>
           <p className="text-blue-100 text-xs font-bold opacity-80 uppercase tracking-widest">Transforme este sistema em um App Android nativo</p>
        </div>
        
        <div className="p-8 space-y-6">
           <div className="bg-black/30 rounded-3xl p-6 border border-white/5 space-y-4">
              <p className="text-sm text-slate-300 font-medium">Abra o terminal do VS Code e execute estes 3 comandos em ordem:</p>
              
              <div className="space-y-3">
                 {[
                   { cmd: "npm install -g @bubblewrap/cli", label: "1. Instalar Ferramenta" },
                   { cmd: "bubblewrap init --manifest=manifest.json", label: "2. Iniciar Projeto APK" },
                   { cmd: "bubblewrap build", label: "3. Gerar Arquivo .apk" }
                 ].map((step, i) => (
                   <div key={i} className="group relative">
                      <div className="flex items-center justify-between bg-slate-950 p-4 rounded-xl border border-white/5 group-hover:border-blue-500/50 transition-all">
                         <div className="flex flex-col">
                            <span className="text-[10px] font-black text-blue-400 uppercase mb-1">{step.label}</span>
                            <code className="text-xs font-mono text-slate-200">{step.cmd}</code>
                         </div>
                         <button 
                           onClick={() => copyToClipboard(step.cmd)}
                           className="p-3 bg-white/5 hover:bg-blue-600 rounded-lg text-slate-400 hover:text-white transition-all"
                         >
                           <Copy size={16} />
                         </button>
                      </div>
                   </div>
                 ))}
              </div>
           </div>

           <div className="flex items-center gap-3 p-4 bg-blue-500/10 rounded-2xl border border-blue-500/20 text-blue-400">
              <Terminal size={20} />
              <p className="text-[10px] font-black uppercase tracking-widest leading-relaxed">
                Dica: Se o comando 'npm' ainda falhar, reinicie o VS Code. O arquivo APK aparecerá na sua pasta atual após o passo 3.
              </p>
           </div>
        </div>
      </section>

      {/* SEGURANÇA */}
      <section className="bg-white p-10 rounded-[3rem] shadow-sm border border-slate-100">
        <div className="flex items-center gap-4 mb-8">
           <div className="h-12 w-12 rounded-2xl bg-slate-900 text-white flex items-center justify-center shadow-lg"><Shield size={24} /></div>
           <h3 className="text-xl font-black text-slate-800 tracking-tight uppercase">Cofre de Segurança</h3>
        </div>
        
        {!config.security?.pinHash ? (
          <div className="flex flex-col sm:flex-row gap-4">
            <input 
              type="password" 
              placeholder="Criar PIN de Acesso (Ex: 1234)"
              className="flex-1 bg-slate-50 border border-slate-100 rounded-2xl p-5 text-sm font-bold outline-none focus:ring-4 focus:ring-blue-100"
              value={newPin}
              onChange={e => setNewPin(e.target.value.replace(/\D/g, ''))}
              maxLength={6}
            />
            <button onClick={handleSetPin} className="bg-blue-600 text-white px-10 py-5 rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl shadow-blue-200 hover:scale-105 transition-all">
              ATIVAR PROTEÇÃO
            </button>
          </div>
        ) : (
          <div className="flex items-center justify-between bg-emerald-500/10 p-6 rounded-3xl border border-emerald-500/20">
             <div className="flex items-center gap-3 text-emerald-600">
                <Check size={24} className="font-bold" />
                <span className="font-black text-xs uppercase tracking-widest">Seus dados estão criptografados</span>
             </div>
             <button onClick={() => { if(confirm("Remover proteção?")) setConfig({...config, security: undefined}); }} className="text-slate-400 hover:text-rose-600"><Trash2 size={20} /></button>
          </div>
        )}
      </section>

      {/* DADOS DA EMPRESA */}
      <section className="bg-white p-10 rounded-[3rem] shadow-sm border border-slate-100">
        <div className="flex items-center gap-4 mb-8">
           <div className="h-12 w-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center"><Building2 size={24} /></div>
           <h3 className="text-xl font-black text-slate-800 tracking-tight uppercase">Minha Empresa</h3>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
           <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Nome Fantasia</label>
              <input 
                type="text" 
                className="w-full bg-slate-50 border border-slate-100 rounded-2xl p-5 text-sm font-bold"
                value={config.companyName}
                onChange={e => setConfig({ ...config, companyName: e.target.value })}
              />
           </div>
           <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">CNPJ</label>
              <input 
                type="text" 
                className="w-full bg-slate-50 border border-slate-100 rounded-2xl p-5 text-sm font-mono font-bold"
                value={config.taxId}
                onChange={e => setConfig({ ...config, taxId: e.target.value })}
              />
           </div>
        </div>
      </section>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
         <button onClick={handleExport} className="bg-white p-8 rounded-[2.5rem] border border-slate-100 flex flex-col items-center gap-4 group hover:border-blue-500 transition-all">
            <Download className="text-slate-300 group-hover:text-blue-500 group-hover:scale-110 transition-all" size={32} />
            <span className="text-[10px] font-black uppercase text-slate-500 tracking-widest">Exportar Backup</span>
         </button>
         <button onClick={() => { db.saveConfig(config); notify("Alterações salvas!"); }} className="bg-blue-600 text-white p-8 rounded-[2.5rem] flex flex-col items-center justify-center gap-2 shadow-2xl shadow-blue-200 active:scale-95 transition-all">
            <span className="text-lg font-black uppercase tracking-[0.2em]">SALVAR TUDO</span>
            <span className="text-[10px] opacity-70 font-bold uppercase">Sincronizar com banco de dados</span>
         </button>
      </div>
    </div>
  );
};

export default ConfigPanel;
