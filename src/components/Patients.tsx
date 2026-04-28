import React, { useState } from 'react';
import { 
  Plus, 
  Search, 
  MoreHorizontal, 
  Filter, 
  Layers,
  Phone,
  History,
  Edit2,
  Trash2
} from 'lucide-react';
import { cn } from '../lib/utils.ts';
import { useFemicState } from '../hooks/useFemicState.ts';
import { Patient } from '../types.ts';

interface PatientsProps {
  theme: 'light' | 'dark';
  state: ReturnType<typeof useFemicState>;
  onAddClick: () => void;
  onEditClick: (patient: Patient) => void;
}

export function Patients({ theme, state, onAddClick, onEditClick }: PatientsProps) {
  const [filter, setFilter] = useState<'all' | 'active' | 'archived'>('all');
  const [searchQuery, setSearchQuery] = useState('');

  const filteredPatients = state.patients.filter(p => {
    // Status filter
    if (filter === 'active' && p.archived) return false;
    if (filter === 'archived' && !p.archived) return false;

    // Search query
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      return p.name.toLowerCase().includes(query) || 
             p.pathology?.toLowerCase().includes(query) ||
             p.whatsapp.includes(query);
    }
    
    return true;
  });

  const handleDelete = async (id: string) => {
    if (window.confirm('Excluir permanentemente este paciente e todo seu histórico?')) {
      await state.deletePatient(id);
    }
  };

  return (
    <div className="space-y-6 h-full flex flex-col animate-in fade-in slide-in-from-bottom-2 duration-500">
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-white/50 dark:bg-slate-900/50 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 backdrop-blur-md">
        <div className="flex items-center gap-3 w-full sm:w-auto">
          <button 
            onClick={onAddClick}
            className="flex-1 sm:flex-none px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold shadow-lg shadow-blue-500/20 flex items-center justify-center gap-2 transition-all hover:scale-[1.02] active:scale-[0.98]"
          >
            <Plus size={18} /> Novo Paciente
          </button>
          
          <div className="flex bg-slate-100 dark:bg-slate-800 p-1 rounded-xl">
            {(['Ativos', 'Arquivados', 'Todos'] as const).map((label) => {
              const id = label === 'Ativos' ? 'active' : label === 'Arquivados' ? 'archived' : 'all';
              const active = filter === id;
              return (
                <button
                  key={id}
                  onClick={() => setFilter(id)}
                  className={cn(
                    "px-4 py-1.5 rounded-lg text-xs font-bold transition-all",
                    active 
                      ? theme === 'light' ? "bg-white text-slate-800 shadow-sm" : "bg-slate-700 text-white shadow-lg"
                      : "text-slate-500 hover:text-slate-700 dark:hover:text-slate-300"
                  )}
                >
                  {label}
                </button>
              );
            })}
          </div>
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <div className="relative flex-1 sm:w-64 group">
            <input 
              type="text" 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Pesquisar por nome ou patologia..." 
              className={cn(
                "w-full border-none rounded-xl py-2.5 pl-10 pr-4 text-sm focus:ring-2 focus:ring-blue-500 transition-all",
                theme === 'light' ? "bg-white shadow-sm" : "bg-slate-800 text-white"
              )}
            />
            <Search size={16} className="absolute left-3.5 top-3 text-slate-400 group-focus-within:text-blue-500 transition-colors" />
          </div>
          <button className={cn(
            "p-2.5 rounded-xl border transition-colors",
            theme === 'light' ? "bg-white border-slate-200 text-slate-600 hover:bg-slate-50" : "bg-slate-800 border-slate-700 text-slate-400 hover:bg-slate-700"
          )}>
            <Filter size={18} />
          </button>
        </div>
      </div>

      <div className={cn(
        "flex-1 rounded-3xl shadow-sm border overflow-hidden flex flex-col",
        theme === 'light' ? "bg-white border-slate-200" : "bg-slate-900 border-slate-800 text-white"
      )}>
        <div className="overflow-x-auto h-full scrollbar-thin scrollbar-thumb-slate-200 dark:scrollbar-thumb-slate-800">
          <table className="w-full text-left border-collapse">
            <thead className={cn(
              "sticky top-0 z-10 text-[10px] uppercase font-bold tracking-widest",
              theme === 'light' ? "bg-slate-50/80 backdrop-blur-md text-slate-400" : "bg-slate-800/80 backdrop-blur-md text-slate-500"
            )}>
              <tr>
                <th className="px-6 py-4">Paciente</th>
                <th className="px-6 py-4">Patologia Principal</th>
                <th className="px-6 py-4">Contato / WhatsApp</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4 text-right">Ações</th>
              </tr>
            </thead>
            <tbody className={cn("divide-y", theme === 'light' ? "divide-slate-100" : "divide-slate-800")}>
              {filteredPatients.map((p, i) => (
                <tr key={p.id} className={cn(
                  "group transition-colors",
                  theme === 'light' ? "hover:bg-slate-50/50" : "hover:bg-slate-800/30"
                )}>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className={cn(
                        "w-10 h-10 rounded-full flex items-center justify-center font-bold text-xs shadow-inner",
                        theme === 'light' ? "bg-blue-50 text-blue-600" : "bg-blue-900/30 text-blue-400"
                      )}>
                        {p.name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()}
                      </div>
                      <div>
                        <p className={cn("font-bold text-sm leading-none mb-1", theme === 'light' ? "text-slate-800" : "text-slate-100")}>{p.name}</p>
                        <p className="text-[10px] text-slate-400 font-mono tracking-tighter">ID: {p.id.slice(0, 8)}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-sm font-medium text-slate-600 dark:text-slate-400">{p.pathology || 'Não informada'}</span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2 text-sm font-mono text-slate-500">
                      <Phone size={14} className="opacity-50" />
                      {p.whatsapp}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className={cn(
                      "px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wide",
                      !p.archived ? "bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-400" : "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-500"
                    )}>
                      {!p.archived ? 'Ativo' : 'Arquivado'}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                       <button 
                        onClick={() => onEditClick(p)}
                        className={cn(
                         "p-2 rounded-lg transition-all",
                         theme === 'light' ? "hover:bg-blue-50 text-blue-600" : "hover:bg-blue-900/30 text-blue-400"
                       )} title="Editar">
                        <Edit2 size={16} />
                      </button>
                      <button 
                        onClick={() => handleDelete(p.id)}
                        className={cn(
                        "p-2 rounded-lg transition-all",
                        theme === 'light' ? "hover:bg-red-50 text-red-600" : "hover:bg-red-900/30 text-red-400"
                      )} title="Excluir">
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {filteredPatients.length === 0 && (
            <div className="flex-1 flex flex-col items-center justify-center py-20 text-slate-400">
               <Layers size={48} className="opacity-10 mb-4" />
               <p className="text-sm italic">Nenhum paciente encontrado.</p>
            </div>
          )}
        </div>
        <div className={cn(
          "px-6 py-3 border-t text-[10px] font-bold text-slate-400 uppercase tracking-widest flex items-center justify-between",
          theme === 'light' ? "bg-slate-50 border-slate-100" : "bg-slate-900/50 border-slate-800"
        )}>
          <span>Total de {filteredPatients.length} pacientes</span>
        </div>
      </div>
    </div>
  );
}
