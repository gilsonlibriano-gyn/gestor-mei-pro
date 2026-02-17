
import React, { useState } from 'react';
import { Goal } from '../types';
import { Target, Calendar, TrendingUp, Save } from 'lucide-react';

interface Props {
  goals: Goal[];
  setGoals: React.Dispatch<React.SetStateAction<Goal[]>>;
  // Added notify to Props
  notify: (msg: string, type?: 'success' | 'error' | 'info') => void;
}

const GoalsManager: React.FC<Props> = ({ goals, setGoals, notify }) => {
  const currentYear = new Date().getFullYear();
  const months = [
    'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
    'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
  ];

  const handleUpdateGoal = (monthIdx: number, value: number) => {
    const month = monthIdx + 1;
    const existing = goals.find(g => g.month === month && g.year === currentYear);
    
    if (existing) {
      setGoals(goals.map(g => g.id === existing.id ? { ...g, value } : g));
    } else {
      const newGoal: Goal = {
        id: crypto.randomUUID(),
        month,
        year: currentYear,
        value
      };
      setGoals([...goals, newGoal]);
    }
  };

  const getGoalValue = (monthIdx: number) => {
    return goals.find(g => g.month === monthIdx + 1 && g.year === currentYear)?.value || 0;
  };

  const handleSaveAll = () => {
    // In this app, state updates already trigger a sync to DB via useEffect in App.tsx
    // This button provides a explicit confirmation for the user.
    notify("Metas de faturamento salvas com sucesso!");
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="bg-gradient-to-r from-indigo-600 to-blue-600 p-8 rounded-3xl text-white shadow-xl">
         <div className="flex items-center gap-4 mb-4">
           <div className="h-12 w-12 rounded-2xl bg-white/20 flex items-center justify-center backdrop-blur-md">
             <Target size={24} />
           </div>
           <div>
             <h3 className="text-2xl font-bold">Planejamento de Metas {currentYear}</h3>
             <p className="text-indigo-100 opacity-80">Defina objetivos mensais para impulsionar seu crescimento.</p>
           </div>
         </div>
      </div>

      <div className="bg-white rounded-3xl shadow-sm border border-slate-100 p-6">
         <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {months.map((name, idx) => {
              const val = getGoalValue(idx);
              const isCurrentMonth = new Date().getMonth() === idx;
              return (
                <div key={name} className={`p-4 rounded-2xl border ${isCurrentMonth ? 'border-blue-200 bg-blue-50/30' : 'border-slate-100'}`}>
                   <div className="flex items-center justify-between mb-3">
                      <span className="text-sm font-bold text-slate-500 uppercase tracking-tight">{name}</span>
                      <Calendar size={14} className="text-slate-300" />
                   </div>
                   <div className="relative">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 font-bold text-sm">R$</span>
                      <input 
                        type="number" 
                        placeholder="0,00"
                        className="w-full pl-9 pr-4 py-3 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none font-bold text-slate-800"
                        value={val || ''}
                        onChange={(e) => handleUpdateGoal(idx, parseFloat(e.target.value) || 0)}
                      />
                   </div>
                   {val > 0 && (
                     <div className="mt-2 flex items-center gap-1 text-[10px] font-bold text-emerald-600 uppercase">
                        <TrendingUp size={10} /> Meta Ativa
                     </div>
                   )}
                </div>
              );
            })}
         </div>
         
         <div className="mt-8 flex justify-end">
            <button 
              onClick={handleSaveAll}
              className="flex items-center gap-2 bg-slate-900 text-white px-8 py-3 rounded-xl font-bold hover:bg-slate-800 transition-all shadow-lg"
            >
               <Save size={20} />
               Salvar Tudo
            </button>
         </div>
      </div>
    </div>
  );
};

export default GoalsManager;
