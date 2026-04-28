import React, { useState } from 'react';
import { 
  LineChart as LineChartIcon, 
  TrendingUp, 
  TrendingDown, 
  Calendar, 
  Activity,
  ChevronDown,
  MoreVertical,
  Plus
} from 'lucide-react';
import { cn } from '../lib/utils.ts';

import { useFemicState } from '../hooks/useFemicState.ts';

interface AnalysisProps {
  theme: 'light' | 'dark';
  state: ReturnType<typeof useFemicState>;
}

export function Analysis({ theme, state }: AnalysisProps) {
  const [selectedPatient, setSelectedPatient] = useState('Jane Doe');

  const stats = [
    { label: 'Total de Sessões', value: '24', icon: Calendar },
    { label: 'Dor Inicial', value: '8/10', icon: Activity },
    { label: 'Dor Atual', value: '2/10', icon: LineChartIcon },
    { label: 'Variação', value: '↓ 75%', icon: TrendingDown, color: 'text-green-500' },
  ];

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-2 duration-500">
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-white/50 dark:bg-slate-900/50 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 backdrop-blur-md">
        <div className="flex items-center gap-3 w-full sm:w-auto">
          <div className="relative group w-full sm:w-64">
            <select 
              value={selectedPatient}
              onChange={(e) => setSelectedPatient(e.target.value)}
              className={cn(
                "w-full border-none rounded-xl py-2.5 pl-4 pr-10 text-sm font-bold focus:ring-2 focus:ring-blue-500 appearance-none transition-all",
                theme === 'light' ? "bg-white shadow-sm text-slate-800" : "bg-slate-800 text-white"
              )}
            >
              <option>Jane Doe</option>
              <option>Marcos Andrade</option>
              <option>Beatriz Costa</option>
            </select>
            <ChevronDown size={16} className="absolute right-3.5 top-3 text-slate-400 pointer-events-none" />
          </div>
          
          <button className="flex-1 sm:flex-none px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold shadow-lg shadow-blue-500/20 flex items-center justify-center gap-2 transition-all">
            <Plus size={18} /> Novo Registro
          </button>
        </div>

        <div className="flex items-center gap-4">
          <button className="text-sm font-bold text-blue-500 hover:underline">Ver Prontuário Completo</button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {stats.map((stat, i) => (
          <div key={i} className={cn(
            "p-5 rounded-2xl border bg-white shadow-sm",
            theme === 'light' ? "border-slate-100" : "bg-slate-900 border-slate-800"
          )}>
            <div className="flex items-center gap-3 mb-3">
              <div className="p-2 bg-blue-50 dark:bg-blue-900/20 text-blue-500 rounded-lg">
                <stat.icon size={18} />
              </div>
              <p className="text-slate-500 text-xs font-bold uppercase tracking-wider">{stat.label}</p>
            </div>
            <h3 className={cn("text-2xl font-black", stat.color || (theme === 'light' ? "text-slate-800" : "text-white"))}>
              {stat.value}
            </h3>
          </div>
        ))}
      </div>

      <div className={cn(
        "p-6 rounded-3xl border shadow-sm h-[400px] flex items-center justify-center",
        theme === 'light' ? "bg-white border-slate-100 text-slate-400" : "bg-slate-900 border-slate-800 text-slate-600"
      )}>
        <div className="text-center">
          <LineChartIcon size={64} className="mx-auto mb-4 opacity-10" />
          <p className="font-bold italic">Gráfico de Evolução (Dor vs Funcionalidade)</p>
          <p className="text-xs mt-2 uppercase tracking-widest font-black opacity-50">Visualização de tendência temporal</p>
        </div>
      </div>

      <div className={cn(
        "rounded-2xl border shadow-sm overflow-hidden",
        theme === 'light' ? "bg-white border-slate-100" : "bg-slate-900 border-slate-800"
      )}>
        <div className="px-6 py-4 border-b border-inherit flex justify-between items-center bg-slate-50/50 dark:bg-slate-800/50">
          <h4 className={cn("font-bold", theme === 'light' ? "text-slate-700" : "text-slate-200")}>Histórico de Evolução</h4>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="text-[10px] uppercase tracking-widest font-black text-slate-400 border-b border-inherit">
              <tr>
                <th className="px-6 py-4">Data</th>
                <th className="px-6 py-4">Dor</th>
                <th className="px-6 py-4">Func.</th>
                <th className="px-6 py-4">Satisfação</th>
                <th className="px-6 py-4">Sintomas</th>
                <th className="px-6 py-4">Observações</th>
                <th className="px-6 py-4"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-inherit">
              {[
                { date: '15/04/2026', pain: 2, func: 9, sat: 5, symptoms: 'Nenhum', obs: 'Paciente relata alta adesão aos exercícios domiciliares.' },
                { date: '12/04/2026', pain: 3, func: 8, sat: 4, symptoms: 'Leve rigidez', obs: 'Melhora progressiva da ADM.' },
                { date: '08/04/2026', pain: 5, func: 6, sat: 4, symptoms: 'Dor ao movimento', obs: 'Início do protocolo de fortalecimento.' },
              ].map((row, i) => (
                <tr key={i} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors">
                  <td className="px-6 py-4 text-xs font-bold text-slate-500">{row.date}</td>
                  <td className="px-6 py-4 font-black text-blue-500">{row.pain}/10</td>
                  <td className="px-6 py-4 font-black text-green-500">{row.func}/10</td>
                  <td className="px-6 py-4">{'⭐'.repeat(row.sat)}</td>
                  <td className="px-6 py-4 text-xs font-medium text-slate-400 italic">{row.symptoms}</td>
                  <td className="px-6 py-4 text-xs text-slate-500 max-w-xs truncate">{row.obs}</td>
                  <td className="px-6 py-4 text-right">
                    <button className="p-1.5 text-slate-300 hover:text-slate-600 dark:hover:text-slate-100 transition-colors">
                      <MoreVertical size={16} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
