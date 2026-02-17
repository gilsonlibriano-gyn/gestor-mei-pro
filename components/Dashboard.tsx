
import React, { useMemo } from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Transaction, Config, Goal, TransactionType, DASPayment } from '../types';
import { TrendingUp, TrendingDown, Wallet, Target, CheckCircle2, Clock, ShieldCheck, ArrowUpRight, Sparkles, Coins } from 'lucide-react';

interface Props {
  transactions: Transaction[];
  config: Config;
  goals: Goal[];
  dasPayments: DASPayment[];
  setDasPayments: React.Dispatch<React.SetStateAction<DASPayment[]>>;
}

const Card = ({ title, value, color, icon: Icon, bgColor, trend, subtitle }: any) => (
  <div className="group bg-white p-7 rounded-[2.5rem] shadow-sm border border-slate-100 flex flex-col gap-5 hover:shadow-2xl hover:shadow-slate-200/60 transition-all duration-500 relative overflow-hidden">
    <div className={`absolute -right-8 -top-8 w-32 h-32 rounded-full ${bgColor} opacity-0 group-hover:opacity-20 transition-opacity blur-3xl duration-700`}></div>
    <div className="flex items-center justify-between relative z-10">
      <div className={`h-14 w-14 rounded-2xl ${bgColor} flex items-center justify-center ${color} shadow-sm group-hover:scale-110 transition-transform duration-500`}>
        <Icon size={28} />
      </div>
      {trend !== undefined && trend !== null && !isNaN(trend) && Math.abs(trend) !== Infinity && (
        <div className={`flex items-center gap-1 text-[11px] font-black uppercase px-3 py-1.5 rounded-xl ${trend >= 0 ? 'bg-emerald-50 text-emerald-600' : 'bg-rose-50 text-rose-600'} shadow-sm`}>
          <ArrowUpRight size={12} className={trend < 0 ? 'rotate-90' : ''} />
          {Math.abs(trend).toFixed(1)}%
        </div>
      )}
    </div>
    <div className="relative z-10">
      <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.15em] mb-1.5">{title}</p>
      <p className={`text-3xl font-black ${color} tracking-tighter leading-none`}>{value}</p>
      {subtitle && <p className="text-[9px] text-slate-400 font-bold uppercase mt-2 tracking-wider">{subtitle}</p>}
    </div>
  </div>
);

const Dashboard: React.FC<Props> = ({ transactions, config, goals, dasPayments, setDasPayments }) => {
  const currentMonth = new Date().getMonth();
  const currentYear = new Date().getFullYear();

  const stats = useMemo(() => {
    const now = new Date();
    const prevMonthDate = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    
    // Mês Atual
    const thisMonthTransactions = transactions.filter(t => {
      const d = new Date(t.date);
      return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
    });

    // Mês Anterior
    const prevMonthTransactions = transactions.filter(t => {
      const d = new Date(t.date);
      return d.getMonth() === prevMonthDate.getMonth() && d.getFullYear() === prevMonthDate.getFullYear();
    });

    // Cálculos de Mês Atual
    const monthlySales = thisMonthTransactions
      .filter(t => t.type === TransactionType.SALE)
      .reduce((acc, curr) => acc + curr.value, 0);

    const monthlyOut = thisMonthTransactions
      .filter(t => t.type !== TransactionType.SALE)
      .reduce((acc, curr) => acc + curr.value, 0);

    const prevMonthlySales = prevMonthTransactions
      .filter(t => t.type === TransactionType.SALE)
      .reduce((acc, curr) => acc + curr.value, 0);

    // Lucro do Mês Atual
    const monthlyProfit = monthlySales - monthlyOut;

    // SALDO EM CAIXA (HISTÓRICO ACUMULADO)
    // Soma tudo que já entrou e subtrai tudo que já saiu na história do app
    const totalHistoricalIn = transactions
      .filter(t => t.type === TransactionType.SALE)
      .reduce((acc, curr) => acc + curr.value, 0);
    
    const totalHistoricalOut = transactions
      .filter(t => t.type !== TransactionType.SALE)
      .reduce((acc, curr) => acc + curr.value, 0);

    const totalCashBalance = totalHistoricalIn - totalHistoricalOut;

    // Faturamento Acumulado no Ano Atual (para o teto MEI)
    const yearlySales = transactions
      .filter(t => t.type === TransactionType.SALE && new Date(t.date).getFullYear() === now.getFullYear())
      .reduce((acc, curr) => acc + curr.value, 0);

    const calculateTrend = (current: number, previous: number) => {
      if (previous === 0) return current > 0 ? 100 : 0;
      return ((current - previous) / previous) * 100;
    };

    return { 
      monthlySales, 
      monthlyProfit, 
      totalCashBalance, 
      yearlySales,
      salesTrend: calculateTrend(monthlySales, prevMonthlySales)
    };
  }, [transactions]);

  const meiLimitProgress = (stats.yearlySales / config.annualLimit) * 100;
  
  const chartData = useMemo(() => {
    const months = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];
    return months.map((m, i) => {
      const sales = transactions
        .filter(t => {
          const d = new Date(t.date);
          return d.getMonth() === i && d.getFullYear() === currentYear && t.type === TransactionType.SALE;
        })
        .reduce((acc, curr) => acc + curr.value, 0);
      return { name: m, vendas: sales };
    });
  }, [transactions, currentYear]);

  const currentGoal = goals.find(g => g.month === currentMonth + 1 && g.year === currentYear);
  const goalProgress = currentGoal ? (stats.monthlySales / currentGoal.value) * 100 : null;

  const toggleDASPayment = (month: number) => {
    const existing = dasPayments.find(p => p.month === month && p.year === currentYear);
    if (existing) {
      setDasPayments(dasPayments.map(p => p === existing ? { ...p, paid: !p.paid } : p));
    } else {
      setDasPayments([...dasPayments, { month, year: currentYear, paid: true, dueDate: `${currentYear}-${String(month).padStart(2, '0')}-20` }]);
    }
  };

  const formatBRL = (val: number) => val.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });

  return (
    <div className="space-y-10 animate-in fade-in slide-in-from-bottom-6 duration-1000">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-7">
        <Card 
          title="Saldo em Caixa" 
          value={formatBRL(stats.totalCashBalance)} 
          color="text-blue-700" 
          icon={Wallet} 
          bgColor="bg-blue-100/40" 
          subtitle="Montante Total Acumulado"
        />
        <Card 
          title="Entradas (Mês)" 
          value={formatBRL(stats.monthlySales)} 
          color="text-emerald-600" 
          icon={TrendingUp} 
          bgColor="bg-emerald-100/40" 
          trend={stats.salesTrend} 
        />
        <Card 
          title="Lucro Líquido (Mês)" 
          value={formatBRL(stats.monthlyProfit)} 
          color={stats.monthlyProfit >= 0 ? "text-emerald-600" : "text-rose-600"} 
          icon={Coins} 
          bgColor={stats.monthlyProfit >= 0 ? "bg-emerald-100/40" : "bg-rose-100/40"}
        />
        <Card 
          title="Faturamento Anual" 
          value={formatBRL(stats.yearlySales)} 
          color="text-slate-900" 
          icon={Sparkles} 
          bgColor="bg-slate-100" 
          subtitle={`Ciclo ${currentYear}`}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
        <div className="lg:col-span-2 bg-white p-10 rounded-[3rem] shadow-sm border border-slate-100 glass relative overflow-hidden">
          <div className="absolute top-0 right-0 w-80 h-80 bg-blue-50/40 rounded-full blur-[100px] -mr-40 -mt-40"></div>
          
          <div className="flex items-center justify-between mb-10 relative z-10">
            <div>
              <h3 className="text-2xl font-black text-slate-800 tracking-tight">Evolução de Vendas</h3>
              <p className="text-[10px] text-slate-400 font-black uppercase tracking-[0.2em] mt-2">Desempenho mensal em {currentYear}</p>
            </div>
          </div>
          
          <div className="h-[380px] w-full relative z-10">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData}>
                <defs>
                  <linearGradient id="colorSales" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.15}/>
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="6 6" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 11, fontWeight: 700}} dy={15} />
                <YAxis axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 11, fontWeight: 700}} />
                <Tooltip 
                  cursor={{stroke: '#3b82f6', strokeWidth: 2, strokeDasharray: '4 4'}}
                  contentStyle={{ borderRadius: '24px', border: 'none', boxShadow: '0 25px 50px -12px rgb(0 0 0 / 0.15)', padding: '20px' }}
                  itemStyle={{ fontWeight: 900, color: '#0f172a', fontSize: '15px' }}
                  labelStyle={{ marginBottom: '6px', color: '#64748b', fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.15em', fontWeight: 800 }}
                  formatter={(value: number) => [formatBRL(value), '']}
                />
                <Area type="monotone" dataKey="vendas" stroke="#3b82f6" strokeWidth={6} fillOpacity={1} fill="url(#colorSales)" dot={{ r: 6, fill: '#3b82f6', strokeWidth: 3, stroke: '#fff' }} activeDot={{ r: 10, strokeWidth: 0, fill: '#1e293b' }} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-slate-950 p-10 rounded-[3rem] shadow-2xl flex flex-col relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-full h-full bg-[radial-gradient(circle_at_top_right,_var(--tw-gradient-stops))] from-blue-600/10 via-transparent to-transparent opacity-50"></div>
          
          <div className="flex items-center justify-between mb-10 relative z-10">
            <div>
              <h3 className="text-2xl font-black text-white tracking-tight">Guias DAS</h3>
              <p className="text-[10px] text-slate-500 font-black uppercase tracking-[0.2em] mt-2">Calendário de Pagamentos</p>
            </div>
            <div className="h-12 w-12 rounded-2xl bg-white/5 flex items-center justify-center text-blue-400 backdrop-blur-md border border-white/10 group-hover:rotate-12 transition-transform duration-500">
              <ShieldCheck size={24} />
            </div>
          </div>
          
          <div className="space-y-4 flex-1 overflow-y-auto pr-2 custom-scrollbar relative z-10">
            {['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'].map((m, i) => {
              const monthNum = i + 1;
              const isPaid = dasPayments.find(p => p.month === monthNum && p.year === currentYear)?.paid;
              const isCurrent = currentMonth === i;
              
              return (
                <div 
                  key={m} 
                  onClick={() => toggleDASPayment(monthNum)}
                  className={`flex items-center justify-between p-5 rounded-[1.5rem] border cursor-pointer transition-all duration-500 ${
                    isPaid ? 'bg-emerald-500/10 border-emerald-500/20' : 
                    isCurrent ? 'bg-blue-600 border-blue-500 shadow-xl shadow-blue-500/30 active:scale-95' : 'bg-white/5 border-white/5 hover:border-white/20'
                  }`}
                >
                  <div className="flex items-center gap-4">
                    <div className={`h-10 w-10 rounded-xl flex items-center justify-center font-black text-xs uppercase ${isPaid ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/20' : isCurrent ? 'bg-white text-blue-600 shadow-lg' : 'bg-slate-800 text-slate-500'}`}>
                      {m}
                    </div>
                    <p className={`text-[10px] font-black uppercase tracking-widest ${isCurrent ? 'text-white/70' : 'text-slate-500'}`}>Dia 20</p>
                  </div>
                  {isPaid ? (
                    <div className="bg-emerald-500/20 p-1.5 rounded-full text-emerald-500">
                       <CheckCircle2 size={20} />
                    </div>
                  ) : (
                    <div className={`h-6 w-6 rounded-full border-2 ${isCurrent ? 'border-white/50' : 'border-slate-700'}`}></div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
        <div className="bg-white p-10 rounded-[3rem] shadow-sm border border-slate-100 group glass">
          <div className="flex items-center justify-between mb-10">
            <div>
              <h3 className="text-2xl font-black text-slate-800 tracking-tight">Limite MEI</h3>
              <p className="text-[10px] text-slate-400 font-black uppercase tracking-[0.2em] mt-2">Controle do Teto Anual</p>
            </div>
            <div className={`px-5 py-2.5 rounded-2xl text-[11px] font-black tracking-widest uppercase transition-all duration-500 ${meiLimitProgress > 90 ? 'bg-rose-100 text-rose-600 animate-pulse' : 'bg-blue-50 text-blue-600 shadow-sm'}`}>
               {meiLimitProgress.toFixed(1)}%
            </div>
          </div>
          
          <div className="space-y-10">
             <div className="relative h-5 bg-slate-100 rounded-full overflow-hidden shadow-inner">
                <div 
                  className={`h-full transition-all duration-[2000ms] ease-out relative rounded-full ${meiLimitProgress > 90 ? 'bg-gradient-to-r from-rose-500 to-rose-600' : 'bg-gradient-to-r from-blue-500 to-indigo-600 shadow-lg shadow-blue-500/30'}`} 
                  style={{ width: `${Math.min(meiLimitProgress, 100)}%` }}
                >
                   <div className="absolute top-0 right-0 bottom-0 w-16 bg-white/20 blur-md animate-pulse"></div>
                </div>
             </div>
             
             <div className="flex justify-between items-end">
                <div className="space-y-2">
                   <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest">Utilizado</p>
                   <p className="text-3xl font-black text-slate-900 tracking-tighter">{formatBRL(stats.yearlySales)}</p>
                </div>
                <div className="text-right space-y-2">
                   <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest">Disponível</p>
                   <p className={`text-3xl font-black tracking-tighter ${meiLimitProgress > 85 ? 'text-rose-600' : 'text-emerald-600'}`}>
                     {formatBRL(Math.max(config.annualLimit - stats.yearlySales, 0))}
                   </p>
                </div>
             </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-indigo-700 via-blue-700 to-blue-800 p-10 rounded-[3rem] shadow-2xl relative overflow-hidden group">
          <div className="absolute top-0 left-0 w-full h-full bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10"></div>
          <Target className="absolute -right-10 -bottom-10 text-white/10 w-64 h-64 rotate-12 group-hover:scale-110 transition-transform duration-700" />
          
          <div className="flex items-center justify-between mb-10 relative z-10">
            <h3 className="text-2xl font-black text-white tracking-tight">Meta do Mês</h3>
            <div className="h-12 w-12 rounded-2xl bg-white/10 flex items-center justify-center text-white backdrop-blur-xl border border-white/20 shadow-xl group-hover:rotate-12 transition-transform">
              <Target size={26} />
            </div>
          </div>
          
          {currentGoal ? (
            <div className="flex flex-col gap-10 relative z-10">
               <div className="flex items-center justify-between">
                  <div>
                     <p className="text-[10px] text-blue-100 font-black uppercase tracking-widest mb-2 opacity-80">Objetivo</p>
                     <p className="text-4xl font-black text-white tracking-tighter shadow-sm">{formatBRL(currentGoal.value)}</p>
                  </div>
                  <div className="bg-white p-5 rounded-[2rem] shadow-2xl">
                     <span className="text-3xl font-black text-blue-700 leading-none">{goalProgress?.toFixed(0)}%</span>
                  </div>
               </div>
               
               <div className="space-y-4">
                  <div className="h-4 bg-white/10 rounded-full overflow-hidden backdrop-blur-md shadow-inner">
                     <div 
                       className="h-full bg-white transition-all duration-[1500ms] shadow-[0_0_30px_rgba(255,255,255,0.6)] rounded-full" 
                       style={{ width: `${Math.min(goalProgress || 0, 100)}%` }}
                     />
                  </div>
                  <div className="flex items-center gap-2.5 text-blue-50 font-bold uppercase tracking-widest text-[10px]">
                    <Clock size={16} className="opacity-70" />
                    <span>
                       {goalProgress && goalProgress >= 100 
                         ? "Parabéns! Meta batida." 
                         : `Faltam ${formatBRL(Math.max(currentGoal.value - stats.monthlySales, 0))} para atingir o objetivo.`}
                    </span>
                  </div>
               </div>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-8 text-center relative z-10">
               <div className="h-20 w-20 rounded-[2rem] bg-white/10 flex items-center justify-center text-white/30 mb-5 backdrop-blur-xl border border-white/10">
                 <Target size={40} />
               </div>
               <p className="text-blue-50 font-bold text-lg mb-8">Nenhuma meta definida para este mês.</p>
               <button className="text-[11px] font-black text-indigo-700 bg-white px-10 py-4 rounded-2xl shadow-2xl hover:scale-105 transition-all uppercase tracking-widest active:scale-95">Definir Meta</button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
