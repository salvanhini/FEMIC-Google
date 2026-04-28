import React, { useState } from 'react';
import { 
  Download, 
  UploadCloud, 
  Database, 
  History, 
  Trash2,
  ShieldCheck,
  AlertTriangle,
  Info
} from 'lucide-react';
import { cn } from '../lib/utils.ts';

import { useFemicState } from '../hooks/useFemicState.ts';

interface BackupProps {
  theme: 'light' | 'dark';
  state: ReturnType<typeof useFemicState>;
}

export function Backup({ theme, state }: BackupProps) {
  const [isCleaning, setIsCleaning] = useState(false);

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-2 duration-500">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Export JSON */}
        <div className={cn(
          "p-8 rounded-3xl border flex flex-col justify-between group",
          theme === 'light' ? "bg-white border-slate-100 shadow-sm" : "bg-slate-900 border-slate-800 shadow-xl"
        )}>
          <div>
            <div className="flex items-center gap-4 mb-6">
              <div className="p-3 bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 rounded-2xl">
                <Download size={24} />
              </div>
              <div>
                <h4 className={cn("font-black text-lg", theme === 'light' ? "text-slate-800" : "text-white")}>Exportar JSON</h4>
                <p className="text-xs text-slate-500 font-bold uppercase tracking-widest">Backup local completo</p>
              </div>
            </div>
            
            <p className="text-sm text-slate-500 mb-8 leading-relaxed">
              Baixe um arquivo contendo todos os dados clínicos: pacientes, sessões, anamneses, evoluções técnicas e documentos. Recomendado ao final de cada dia.
            </p>
          </div>

          <button className="w-full py-4 bg-blue-600 text-white rounded-2xl font-black uppercase tracking-widest text-xs shadow-lg shadow-blue-500/20 hover:bg-blue-700 transition-all flex items-center justify-center gap-2">
            <Download size={18} /> Baixar Backup .json
          </button>
        </div>

        {/* Restore Section */}
        <div className={cn(
          "p-8 rounded-3xl border flex flex-col justify-between group",
          theme === 'light' ? "bg-slate-50 border-slate-200" : "bg-slate-900/40 border-slate-800"
        )}>
          <div>
            <div className="flex items-center gap-4 mb-6">
              <div className="p-3 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 rounded-2xl">
                <History size={24} />
              </div>
              <div>
                <h4 className={cn("font-black text-lg", theme === 'light' ? "text-slate-800" : "text-white")}>Restaurar Dados</h4>
                <p className="text-xs text-slate-500 font-bold uppercase tracking-widest">Importar arquivo de backup</p>
              </div>
            </div>
            
            <p className="text-sm text-slate-500 mb-8 leading-relaxed italic">
              "Atenção: restaurar um backup substituirá todos os dados atuais do sistema. Esta ação não pode ser desfeita."
            </p>
          </div>

          <div className="relative">
            <input 
              type="file" 
              className="absolute inset-0 opacity-0 cursor-pointer z-10"
              accept=".json"
            />
            <button className={cn(
              "w-full py-4 rounded-2xl font-black uppercase tracking-widest text-xs flex items-center justify-center gap-2 border-2 border-dashed transition-all",
              theme === 'light' ? "border-slate-300 text-slate-400 bg-white" : "border-slate-700 text-slate-500 bg-slate-900"
            )}>
              <UploadCloud size={18} /> Selecionar Arquivo
            </button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* Supabase Config */}
        <div className={cn(
          "md:col-span-2 p-8 rounded-3xl border flex flex-col justify-between relative overflow-hidden",
          theme === 'light' ? "bg-white border-slate-100" : "bg-slate-900 border-slate-800 shadow-2xl"
        )}>
          <div className="absolute top-0 right-0 p-8 opacity-5">
            <Database size={120} />
          </div>

          <div>
             <div className="flex items-center gap-4 mb-8">
                <div className="p-3 bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600 dark:text-indigo-400 rounded-2xl">
                  <Database size={24} />
                </div>
                <div>
                  <h4 className={cn("font-black text-lg text-slate-800 dark:text-white")}>Sincronização na Nuvem</h4>
                  <p className="text-xs text-slate-500 font-bold uppercase tracking-widest">Configuração do Banco de Dados</p>
                </div>
             </div>

             <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-8">
               <div className="space-y-4">
                 <div className="field">
                   <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1.5 block ml-1">URL do Projeto</label>
                   <input 
                     type="text" 
                     placeholder="https://xxxx.supabase.co"
                     className={cn(
                       "w-full border-none rounded-xl py-3 px-4 text-xs font-bold shadow-inner focus:ring-2 focus:ring-blue-500",
                       theme === 'light' ? "bg-slate-100 text-slate-800" : "bg-slate-800 text-white"
                     )}
                   />
                 </div>
                 <div className="field">
                   <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1.5 block ml-1">Chave Anon Key</label>
                   <input 
                     type="password" 
                     placeholder="••••••••••••••••"
                     className={cn(
                       "w-full border-none rounded-xl py-3 px-4 text-xs font-bold shadow-inner focus:ring-2 focus:ring-blue-500",
                       theme === 'light' ? "bg-slate-100 text-slate-800" : "bg-slate-800 text-white"
                     )}
                   />
                 </div>
               </div>

               <div className={cn(
                 "p-6 rounded-2xl border flex flex-col justify-center",
                 theme === 'light' ? "bg-slate-50/50 border-slate-100" : "bg-slate-800/40 border-slate-700"
               )}>
                 <div className="flex items-center gap-2 mb-2">
                   <ShieldCheck size={16} className="text-green-500" />
                   <span className="text-[10px] font-black uppercase text-green-600 tracking-widest">Segurança de Dados</span>
                 </div>
                 <p className="text-[11px] text-slate-500 leading-relaxed">
                   Seus dados são criptografados de ponta-a-ponta. A FEMIC recomenda fortemente a automação da sincronização em nuvem.
                 </p>
               </div>
             </div>
          </div>

          <div className="flex gap-3">
             <button className="flex-1 py-4 bg-slate-900 dark:bg-blue-600 text-white rounded-2xl font-black uppercase text-[10px] tracking-[0.2em] shadow-lg hover:scale-[1.02] active:scale-[0.98] transition-all">
               Salvar Configurações
             </button>
             <button className={cn(
               "px-6 py-4 rounded-2xl font-black uppercase text-[10px] tracking-[0.2em] border-2 border-inherit transition-all",
               theme === 'light' ? "bg-white border-slate-200 text-slate-500" : "bg-slate-800 border-slate-700 text-slate-400"
             )}>
               Testar Conexão
             </button>
          </div>
        </div>

        {/* Danger Zone */}
        <div className={cn(
          "p-8 rounded-3xl border border-red-100 dark:border-red-900/30 bg-red-50/20 flex flex-col justify-between text-center",
          theme === 'light' ? "" : "bg-red-950/5"
        )}>
          <div className="flex flex-col items-center">
            <AlertTriangle size={32} className="text-red-500 mb-4" />
            <h5 className="font-bold text-sm text-red-600 uppercase tracking-widest mb-2">Zona de Perigo</h5>
            <p className="text-xs text-red-500/80 leading-relaxed font-medium mb-8">
              Remova permanentemente todos os registros locais do navegador. Use apenas em caso de migração total.
            </p>
          </div>
          
          <button 
            onClick={() => setIsCleaning(true)}
            className="w-full py-4 bg-red-100 dark:bg-red-950/30 text-red-600 rounded-2xl font-black uppercase tracking-widest text-[10px] border border-red-200 dark:border-red-900/50 hover:bg-red-600 hover:text-white transition-all shadow-sm"
          >
            {isCleaning ? 'Confirmar Limpeza?' : 'Limpar Todos os Dados'}
          </button>
        </div>
      </div>

      <div className={cn(
        "p-6 rounded-2xl border flex items-start gap-4",
        theme === 'light' ? "bg-blue-50 border-blue-100" : "bg-blue-900/20 border-blue-900/40"
      )}>
        <div className="p-2 bg-blue-500 rounded-lg text-white">
          <Info size={16} />
        </div>
        <div className="space-y-1">
          <p className={cn("text-xs font-bold uppercase tracking-wider text-blue-800 dark:text-blue-300")}>Nota sobre o Armazenamento</p>
          <p className={cn("text-[11px] leading-relaxed text-blue-600 dark:text-blue-400 font-medium")}>
            Atualmente os dados clínicos estão salvos no <strong>LocalStorage</strong> deste navegador. Ao limpar o cache ou trocar de computador sem um backup em nuvem, você perderá todo o histórico. Faça exportações JSON regulares.
          </p>
        </div>
      </div>
    </div>
  );
}
