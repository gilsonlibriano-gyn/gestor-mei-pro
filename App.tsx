
import React, { useState, useEffect, useCallback } from 'react';
import { 
  LayoutDashboard, Receipt, Users, Package, Target, Settings, FileText,
  TrendingUp, Sparkles, ChevronRight, Bell, CheckCircle, XCircle, AlertCircle,
  Crown, ArrowLeftRight, Smartphone, Key, Lock, LogOut, Menu, Eye, EyeOff, ShieldAlert,
  FileBadge
} from 'lucide-react';
import { db } from './services/db.ts';
import { Transaction, Client, Product, Goal, Config, DASPayment } from './types.ts';
import Dashboard from './components/Dashboard.tsx';
import TransactionsList from './components/TransactionsList.tsx';
import ClientsList from './components/ClientsList.tsx';
import ProductsList from './components/ProductsList.tsx';
import GoalsManager from './components/GoalsManager.tsx';
import ConfigPanel from './components/ConfigPanel.tsx';
import Reports from './components/Reports.tsx';
import CashFlow from './components/CashFlow.tsx';
import ReceiptGenerator from './components/ReceiptGenerator.tsx';
import { getSmartInsights } from './services/gemini.ts';

const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [clients, setClients] = useState<Client[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [goals, setGoals] = useState<Goal[]>([]);
  const [config, setConfig] = useState<Config | null>(null);
  const [dasPayments, setDasPayments] = useState<DASPayment[]>([]);
  const [notification, setNotification] = useState<{message: string, type: 'success' | 'error' | 'info'} | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  
  // Estados de Segurança
  const [isLocked, setIsLocked] = useState(true);
  const [pinInput, setPinInput] = useState('');
  const [privacyMode, setPrivacyMode] = useState(false);
  const [isActivated, setIsActivated] = useState(() => localStorage.getItem('mei_pro_active') === 'true');

  // Carregar configuração inicial
  useEffect(() => {
    const loadInitial = async () => {
      const cfg = await db.getConfig();
      setConfig(cfg);
      
      if (!cfg.security?.pinHash) {
        setIsLocked(false);
        loadAppData();
      }
    };
    loadInitial();
  }, []);

  const loadAppData = async () => {
    setTransactions(await db.getTransactions());
    setClients(await db.getClients());
    setProducts(await db.getProducts());
    setGoals(await db.getGoals());
    setDasPayments(await db.getDASPayments());
  };

  const handleUnlock = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const currentConfig = await db.getConfig();
    if (currentConfig.security?.pinHash === pinInput || !currentConfig.security?.pinHash) {
      const success = await db.unlock(pinInput || 'default_key');
      if (success) {
        setIsLocked(false);
        loadAppData();
        setPinInput('');
      } else {
        showNotification("Erro interno de criptografia.", "error");
      }
    } else {
      showNotification("PIN incorreto. Tente novamente.", "error");
      setPinInput('');
    }
  };

  useEffect(() => { if (config && !isLocked) db.saveConfig(config); }, [config, isLocked]);
  useEffect(() => { if (!isLocked) db.saveTransactions(transactions); }, [transactions, isLocked]);
  useEffect(() => { if (!isLocked) db.saveClients(clients); }, [clients, isLocked]);
  useEffect(() => { if (!isLocked) db.saveProducts(products); }, [products, isLocked]);
  useEffect(() => { if (!isLocked) db.saveGoals(goals); }, [goals, isLocked]);
  useEffect(() => { if (!isLocked) db.saveDASPayments(dasPayments); }, [dasPayments, isLocked]);

  const showNotification = (message: string, type: 'success' | 'error' | 'info' = 'success') => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 3000);
  };

  const menuItems = [
    { group: 'Principal', items: [
      { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
      { id: 'transactions', label: 'Lançamentos', icon: Receipt },
      { id: 'cashflow', label: 'Fluxo de Caixa', icon: ArrowLeftRight },
    ]},
    { group: 'Cadastros', items: [
      { id: 'clients', label: 'Clientes', icon: Users },
      { id: 'products', label: 'Estoque / Catálogo', icon: Package },
    ]},
    { group: 'Documentos', items: [
      { id: 'receipt', label: 'Emitir Recibo', icon: FileBadge },
      { id: 'reports', label: 'Relatórios & PDF', icon: FileText },
    ]},
    { group: 'Análise', items: [
      { id: 'goals', label: 'Metas', icon: Target },
    ]},
    { group: 'Sistema', items: [
      { id: 'config', label: 'Segurança & Config', icon: Settings },
    ]}
  ];

  if (isLocked) {
    return (
      <div className="h-screen bg-slate-950 flex items-center justify-center p-6 relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-blue-600/20 via-transparent to-transparent opacity-50"></div>
        <div className="w-full max-w-sm bg-white/5 backdrop-blur-2xl border border-white/10 p-10 rounded-[3rem] shadow-2xl relative z-10 text-center animate-in zoom-in-95 duration-500">
           <div className="h-20 w-20 bg-blue-600 rounded-3xl mx-auto flex items-center justify-center text-white mb-8 shadow-2xl shadow-blue-500/20">
              <Lock size={40} />
           </div>
           <h2 className="text-2xl font-black text-white mb-2 tracking-tight">Criptografia Ativa</h2>
           <p className="text-slate-400 text-xs font-bold uppercase tracking-widest mb-10">Insira seu PIN de Segurança</p>
           
           <form onSubmit={handleUnlock} className="space-y-6">
              <input 
                autoFocus
                type="password"
                inputMode="numeric"
                maxLength={6}
                placeholder="••••••"
                className="w-full bg-white/5 border border-white/10 rounded-2xl p-5 text-center text-3xl font-black text-white tracking-[1em] outline-none focus:ring-4 focus:ring-blue-500/30 transition-all placeholder:text-white/10"
                value={pinInput}
                onChange={e => setPinInput(e.target.value)}
              />
              <button className="w-full bg-blue-600 hover:bg-blue-500 text-white py-5 rounded-2xl font-black text-sm uppercase tracking-widest transition-all shadow-xl shadow-blue-600/20 active:scale-95">
                Desbloquear Acesso
              </button>
           </form>
        </div>
      </div>
    );
  }

  return (
    <div className={`flex h-screen bg-slate-50 overflow-hidden font-sans ${privacyMode ? 'privacy-active' : ''}`}>
      <style>{`
        .privacy-active .text-3xl, .privacy-active .text-2xl, .privacy-active .text-xl, .privacy-active td:last-child {
           filter: blur(8px);
           transition: filter 0.3s ease;
        }
        .privacy-active .text-3xl:hover, .privacy-active .text-2xl:hover {
           filter: blur(0);
        }
      `}</style>

      {notification && (
        <div className={`fixed top-4 left-1/2 -translate-x-1/2 z-[100] w-[90%] sm:w-auto flex items-center gap-3 px-6 py-4 rounded-2xl shadow-2xl animate-in fade-in slide-in-from-top-4 duration-300 ${
          notification.type === 'success' ? 'bg-emerald-600 text-white' : 
          notification.type === 'error' ? 'bg-rose-600 text-white' : 'bg-blue-600 text-white'
        }`}>
          <span className="font-bold text-sm">{notification.message}</span>
        </div>
      )}

      {sidebarOpen && <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-40 lg:hidden" onClick={() => setSidebarOpen(false)} />}

      <aside className={`fixed inset-y-0 left-0 z-50 w-72 bg-slate-900 text-white flex flex-col transition-transform duration-300 lg:static lg:translate-x-0 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="p-8">
          <div className="flex items-center justify-between mb-10">
            <div className="flex items-center gap-3">
              <div className="bg-blue-600 p-2.5 rounded-xl shadow-lg">
                <TrendingUp size={24} />
              </div>
              <h1 className="text-xl font-black tracking-tight">Gestor<span className="text-blue-500">MEI</span></h1>
            </div>
          </div>

          <nav className="space-y-8">
            {menuItems.map((group) => (
              <div key={group.group} className="space-y-2">
                <p className="px-4 text-[10px] font-black text-slate-500 uppercase tracking-[0.2em]">{group.group}</p>
                <div className="space-y-1">
                  {group.items.map((item) => (
                    <button
                      key={item.id}
                      onClick={() => { setActiveTab(item.id); setSidebarOpen(false); }}
                      className={`group w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all relative ${
                        activeTab === item.id ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/20' : 'text-slate-400 hover:bg-slate-800 hover:text-slate-200'
                      }`}
                    >
                      {activeTab === item.id && <div className="absolute left-0 w-1.5 h-6 bg-white rounded-r-full -ml-1" />}
                      <item.icon size={20} className={activeTab === item.id ? 'text-white' : 'text-slate-500 group-hover:text-blue-400 transition-colors'} />
                      <span className="font-bold text-sm">{item.label}</span>
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </nav>
        </div>

        <div className="mt-auto p-8 space-y-4 border-t border-slate-800/50">
          <button onClick={() => { db.lock(); setIsLocked(true); }} className="w-full flex items-center gap-3 px-4 py-3 text-slate-500 hover:text-rose-400 transition-all rounded-xl hover:bg-rose-400/10">
            <LogOut size={18} />
            <span className="font-bold text-sm">Bloquear Sessão</span>
          </button>
        </div>
      </aside>

      <main className="flex-1 flex flex-col min-w-0">
        <header className="h-20 bg-white border-b border-slate-200 flex items-center justify-between px-6 lg:px-10 shrink-0 z-10 no-print">
          <div className="flex items-center gap-4">
            <button onClick={() => setSidebarOpen(true)} className="lg:hidden p-3 text-slate-600 bg-slate-50 rounded-xl border border-slate-200"><Menu size={24} /></button>
            <div className="hidden sm:block">
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1">Área Ativa</p>
              <h2 className="text-xl font-black text-slate-800 tracking-tight">
                {menuItems.flatMap(g => g.items).find(m => m.id === activeTab)?.label}
              </h2>
            </div>
          </div>
          <div className="flex items-center gap-4">
             <button onClick={() => setPrivacyMode(!privacyMode)} className={`h-11 w-11 flex items-center justify-center rounded-xl transition-all ${privacyMode ? 'bg-indigo-600 text-white shadow-lg' : 'bg-slate-100 text-slate-400 hover:bg-slate-200'}`}>
               {privacyMode ? <EyeOff size={20} /> : <Eye size={20} />}
             </button>
             <div className="h-11 w-11 rounded-xl bg-slate-900 flex items-center justify-center text-white font-black">
               {config?.companyName?.charAt(0) || 'M'}
             </div>
          </div>
        </header>

        <div className="flex-1 overflow-y-auto p-4 lg:p-10 custom-scrollbar main-scroll-container">
          <div className="max-w-7xl mx-auto">
            {config && (
              activeTab === 'dashboard' ? <Dashboard transactions={transactions} config={config} goals={goals} dasPayments={dasPayments} setDasPayments={setDasPayments} /> :
              activeTab === 'transactions' ? <TransactionsList transactions={transactions} setTransactions={setTransactions} products={products} setProducts={setProducts} clients={clients} notify={showNotification} /> :
              activeTab === 'cashflow' ? <CashFlow transactions={transactions} /> :
              activeTab === 'clients' ? <ClientsList clients={clients} setClients={setClients} transactions={transactions} notify={showNotification} /> :
              activeTab === 'products' ? <ProductsList products={products} setProducts={setProducts} notify={showNotification} /> :
              activeTab === 'receipt' ? <ReceiptGenerator clients={clients} config={config} /> :
              activeTab === 'goals' ? <GoalsManager goals={goals} setGoals={setGoals} notify={showNotification} /> :
              activeTab === 'reports' ? <Reports transactions={transactions} products={products} /> :
              activeTab === 'config' ? <ConfigPanel config={config} setConfig={setConfig} notify={showNotification} isActivated={isActivated} onActivate={setIsActivated} /> :
              null
            )}
          </div>
        </div>
      </main>
    </div>
  );
};

export default App;
