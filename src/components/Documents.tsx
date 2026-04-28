import React, { useState } from 'react';
import { 
  Plus, 
  Search, 
  ExternalLink,
  FileText,
  Trash2,
  Filter,
  Users
} from 'lucide-react';
import { cn } from '../lib/utils.ts';

import { useFemicState } from '../hooks/useFemicState.ts';

interface DocumentsProps {
  theme: 'light' | 'dark';
  state: ReturnType<typeof useFemicState>;
}

export function Documents({ theme, state }: DocumentsProps) {
  const [selectedPatient, setSelectedPatient] = useState('Jane Doe');

  const documents = [
    { title: 'Ressonância Magnética - Lombar', category: 'Exame', date: '12/03/2026', url: 'https://drive.google.com/...' },
    { title: 'Laudo Ortopédico', category: 'Laudo', date: '15/03/2026', url: 'https://drive.google.com/...' },
    { title: 'Prescrição de Medicamentos', category: 'Receita', date: '20/03/2026', url: 'https://drive.google.com/...' },
  ];

  return (
    <div className="space-y-6 h-full flex flex-col animate-in fade-in slide-in-from-bottom-2 duration-500">
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
            <Users size={16} className="absolute right-3.5 top-3 text-slate-400 pointer-events-none" />
          </div>
          
          <button className="flex-1 sm:flex-none px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold shadow-lg shadow-blue-500/20 flex items-center justify-center gap-2 transition-all">
            <Plus size={18} /> Novo Documento
          </button>
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <div className="relative flex-1 sm:w-64 group">
            <input 
              type="text" 
              placeholder="Buscar documentos..." 
              className={cn(
                "w-full border-none rounded-xl py-2.5 pl-10 pr-4 text-sm focus:ring-2 focus:ring-blue-500 transition-all",
                theme === 'light' ? "bg-white shadow-sm" : "bg-slate-800 text-white"
              )}
            />
            <Search size={16} className="absolute left-3.5 top-3 text-slate-400 group-focus-within:text-blue-500 transition-colors" />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {documents.map((doc, i) => (
          <div key={i} className={cn(
            "p-5 rounded-2xl border flex flex-col group transition-all duration-300 hover:shadow-xl hover:-translate-y-1",
            theme === 'light' ? "bg-white border-slate-100 shadow-sm" : "bg-slate-900 border-slate-800 shadow-xl shadow-blue-900/10"
          )}>
            <div className="flex justify-between items-start mb-4">
              <div className={cn(
                "p-3 rounded-2xl",
                theme === 'light' ? "bg-blue-50 text-blue-600" : "bg-blue-900/20 text-blue-400"
              )}>
                <FileText size={24} />
              </div>
              <span className={cn(
                "text-[10px] font-black uppercase tracking-[0.2em] px-2 py-1 rounded-lg",
                theme === 'light' ? "bg-slate-100 text-slate-500" : "bg-slate-800 text-slate-400"
              )}>
                {doc.category}
              </span>
            </div>
            
            <h4 className={cn("font-bold text-sm leading-tight mb-2 pr-4", theme === 'light' ? "text-slate-800" : "text-slate-100")}>
              {doc.title}
            </h4>
            <p className="text-xs text-slate-400 font-medium mb-6">Adicionado em {doc.date}</p>
            
            <div className="mt-auto pt-4 border-t border-inherit flex items-center justify-between">
              <a 
                href={doc.url} 
                target="_blank" 
                rel="noreferrer"
                className="text-xs font-black text-blue-500 hover:text-blue-600 flex items-center gap-1.5 transition-colors uppercase tracking-widest"
              >
                Abrir Drive <ExternalLink size={12} />
              </a>
              <button className="text-slate-300 hover:text-red-500 transition-colors opacity-0 group-hover:opacity-100 translate-x-2 group-hover:translate-x-0">
                <Trash2 size={16} />
              </button>
            </div>
          </div>
        ))}
      </div>
      
      {documents.length === 0 && (
        <div className="flex-1 flex flex-col items-center justify-center text-slate-400">
          <FileText size={48} className="opacity-10 mb-4" />
          <p className="italic">Nenhum documento anexado para este paciente.</p>
        </div>
      )}
    </div>
  );
}
