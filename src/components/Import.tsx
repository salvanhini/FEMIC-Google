import React, { useState } from 'react';
import { 
  Upload, 
  RefreshCw, 
  Link as LinkIcon, 
  CheckCircle2,
  AlertCircle,
  FileSpreadsheet,
  ChevronRight,
  Clipboard,
  ExternalLink
} from 'lucide-react';
import { cn } from '../lib/utils.ts';

import { useFemicState } from '../hooks/useFemicState.ts';

interface ImportProps {
  theme: 'light' | 'dark';
  state: ReturnType<typeof useFemicState>;
}

export function Import({ theme, state }: ImportProps) {
  const [syncStatus, setSyncStatus] = useState<'idle' | 'loading' | 'success'>('idle');

  const handleSync = () => {
    setSyncStatus('loading');
    setTimeout(() => setSyncStatus('success'), 2000);
  };

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-2 duration-500">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Cloud Sync */}
        <div className={cn(
          "p-8 rounded-3xl border flex flex-col justify-between group",
          theme === 'light' ? "bg-white border-slate-100 shadow-sm" : "bg-slate-900 border-slate-800 shadow-xl"
        )}>
          <div>
            <div className="flex items-center gap-4 mb-6">
              <div className="p-3 bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 rounded-2xl">
                <RefreshCw size={24} className={cn(syncStatus === 'loading' && "animate-spin")} />
              </div>
              <div>
                <h4 className={cn("font-black text-lg", theme === 'light' ? "text-slate-800" : "text-white")}>Sincronização Nuvem</h4>
                <p className="text-xs text-slate-500 font-bold uppercase tracking-widest">Conexão direta Supabase/Firebase</p>
              </div>
            </div>
            
            <p className="text-sm text-slate-500 mb-8 leading-relaxed">
              Importe automaticamente as respostas recebidas através do formulário público. O sistema reconhece o paciente pelo WhatsApp ou nome e vincula à sessão.
            </p>

            <div className={cn(
              "p-4 rounded-2xl mb-8 flex items-center justify-between",
              theme === 'light' ? "bg-slate-50" : "bg-slate-800/50"
            )}>
              <div className="flex items-center gap-3">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                <span className="text-xs font-black uppercase text-slate-400">Status da Conexão: OK</span>
              </div>
              <p className="text-[10px] font-bold text-slate-400">ÚLTIMA SINC.: HÁ 10 MIN</p>
            </div>
          </div>

          <button 
            onClick={handleSync}
            disabled={syncStatus === 'loading'}
            className={cn(
              "w-full py-4 rounded-2xl font-black uppercase tracking-widest text-xs flex items-center justify-center gap-2 transition-all",
              syncStatus === 'success' 
                ? "bg-green-500 text-white shadow-lg shadow-green-500/20" 
                : "bg-blue-600 text-white shadow-lg shadow-blue-500/20 hover:bg-blue-700"
            )}
          >
            {syncStatus === 'loading' ? 'Sincronizando...' : syncStatus === 'success' ? (
              <><CheckCircle2 size={18} /> Sincronizado</>
            ) : (
              <><RefreshCw size={18} /> Sincronizar Agora</>
            )}
          </button>
        </div>

        {/* CSV Import */}
        <div className={cn(
          "p-8 rounded-3xl border border-dashed border-slate-300 dark:border-slate-700 bg-transparent flex flex-col items-center justify-center text-center group cursor-pointer hover:border-blue-500 dark:hover:border-blue-400 hover:bg-blue-50/5 dark:hover:bg-blue-900/5 transition-all",
          theme === 'light' ? "border-slate-300" : "border-slate-700"
        )}>
          <div className="w-20 h-20 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
            <Upload size={32} className="text-slate-400 group-hover:text-blue-500" />
          </div>
          <h4 className={cn("font-black text-xl mb-2", theme === 'light' ? "text-slate-700" : "text-slate-200")}>
            Importar Arquivo CSV
          </h4>
          <p className="text-xs text-slate-400 font-bold uppercase tracking-widest mb-6">Arraste ou selecione o arquivo do Google Forms</p>
          <div className="flex gap-2">
             <span className="px-3 py-1 bg-slate-100 dark:bg-slate-800 rounded-full text-[10px] font-black text-slate-500 uppercase tracking-widest">UTF-8</span>
             <span className="px-3 py-1 bg-slate-100 dark:bg-slate-800 rounded-full text-[10px] font-black text-slate-500 uppercase tracking-widest">Delimitador: Vírgula</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* Form Link Section */}
        <div className={cn(
          "md:col-span-2 p-8 rounded-3xl border",
          theme === 'light' ? "bg-white border-slate-100 shadow-sm" : "bg-slate-900 border-slate-800 shadow-xl"
        )}>
          <div className="flex items-center gap-4 mb-6">
            <div className="p-3 bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600 dark:text-indigo-400 rounded-2xl">
              <LinkIcon size={24} />
            </div>
            <div>
              <h4 className={cn("font-black text-lg", theme === 'light' ? "text-slate-800" : "text-white")}>Link do Formulário</h4>
              <p className="text-xs text-slate-500 font-bold uppercase tracking-widest">Compartilhe com seus pacientes</p>
            </div>
          </div>

          <div className="flex gap-3">
             <input 
               type="text" 
               readOnly
               value="https://forms.gle/vS7pA2mX8j..."
               className={cn(
                 "flex-1 border-none rounded-2xl py-4 px-6 text-sm font-bold shadow-inner focus:ring-0",
                 theme === 'light' ? "bg-slate-100 text-slate-500 text-center" : "bg-slate-800 text-slate-400 text-center"
               )}
             />
             <button className="px-6 py-4 bg-slate-900 dark:bg-blue-600 text-white rounded-2xl font-black uppercase text-[10px] tracking-[0.2em] shadow-lg flex items-center gap-2 hover:scale-105 active:scale-95 transition-all">
               <Clipboard size={16} /> Copiar
             </button>
             <button className="px-4 py-4 bg-green-500 text-white rounded-2xl font-black shadow-lg hover:scale-105 active:scale-95 transition-all">
               <ExternalLink size={18} />
             </button>
          </div>
        </div>

        {/* Info card */}
        <div className={cn(
          "p-8 rounded-3xl border flex flex-col items-center justify-center text-center",
          theme === 'light' ? "bg-blue-50/50 border-blue-100" : "bg-blue-900/10 border-blue-900/50"
        )}>
          <AlertCircle size={32} className="text-blue-500 mb-4" />
          <h5 className="font-bold text-sm text-blue-600 uppercase tracking-widest mb-2">Atenção ao Mapeamento</h5>
          <p className="text-xs text-blue-600/80 leading-relaxed font-bold italic">
            "Certifique-se que o formulário contenha os campos: Nome do Paciente, WhatsApp e Nível de Dor (0-10) para uma importação perfeita."
          </p>
        </div>
      </div>

      <div className={cn(
        "rounded-3xl border shadow-sm overflow-hidden",
        theme === 'light' ? "bg-white border-slate-100" : "bg-slate-900 border-slate-800"
      )}>
        <div className="px-8 py-5 border-b border-inherit flex items-center justify-between">
          <div className="flex items-center gap-3">
             <FileSpreadsheet size={20} className="text-slate-400" />
             <h4 className={cn("font-bold", theme === 'light' ? "text-slate-700" : "text-slate-200")}>Log de Sincronização Recente</h4>
          </div>
          <span className="text-[10px] font-black uppercase tracking-widest text-slate-400 px-3 py-1 bg-slate-50 dark:bg-slate-800 rounded-full">Exibindo últimas 5 atividades</span>
        </div>
        <div className="divide-y divide-inherit">
          {[
            { patient: 'Jane Doe', date: 'Hoje às 14:20', type: 'cloud', status: 'success' },
            { patient: 'Marcos Andrade', date: 'Hoje às 14:20', type: 'cloud', status: 'success' },
            { patient: 'Desconhecido', date: 'Hoje às 11:15', type: 'csv', status: 'warning', msg: 'WhatsApp não reconhecido' },
            { patient: 'Beatriz Costa', date: 'Ontem às 18:30', type: 'csv', status: 'success' },
          ].map((log, i) => (
            <div key={i} className="px-8 py-4 flex items-center justify-between group hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors">
              <div className="flex items-center gap-4">
                <div className={cn(
                  "w-2 h-2 rounded-full",
                  log.status === 'success' ? "bg-green-500" : "bg-amber-500"
                )}></div>
                <div>
                   <p className={cn("font-bold text-sm", theme === 'light' ? "text-slate-800" : "text-slate-200")}>{log.patient}</p>
                   <p className="text-[10px] text-slate-500 font-medium">{log.date} • via {log.type.toUpperCase()}</p>
                </div>
              </div>
              <div className="flex items-center gap-3 text-slate-400">
                {log.msg && <span className="text-[10px] font-bold uppercase tracking-widest text-amber-600 bg-amber-50 px-2 py-0.5 rounded-lg">{log.msg}</span>}
                <ChevronRight size={16} className="opacity-0 group-hover:opacity-100 transition-opacity" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
