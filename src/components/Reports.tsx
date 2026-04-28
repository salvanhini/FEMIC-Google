import React, { useState } from 'react';
import { 
  FileDown, 
  Printer, 
  Eye, 
  ChevronDown,
  Layout,
  FileBarChart,
  Users
} from 'lucide-react';
import { cn } from '../lib/utils.ts';

import { useFemicState } from '../hooks/useFemicState.ts';

interface ReportsProps {
  theme: 'light' | 'dark';
  state: ReturnType<typeof useFemicState>;
}

export function Reports({ theme, state }: ReportsProps) {
  const [selectedPatient, setSelectedPatient] = useState('Jane Doe');
  const [reportType, setReportType] = useState('complete');

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-2 duration-500">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className={cn(
          "p-6 rounded-3xl border bg-white shadow-sm flex flex-col justify-between",
          theme === 'light' ? "border-slate-100" : "bg-slate-900 border-slate-800"
        )}>
          <div className="space-y-6">
            <div className="field">
              <label className="text-xs font-bold uppercase tracking-widest text-slate-400 mb-2 block">Selecionar Paciente</label>
              <div className="relative">
                <select 
                  value={selectedPatient}
                  onChange={(e) => setSelectedPatient(e.target.value)}
                  className={cn(
                    "w-full border rounded-xl py-3 pl-4 pr-10 text-sm font-bold focus:ring-2 focus:ring-blue-500 appearance-none transition-all",
                    theme === 'light' ? "bg-slate-50 border-slate-200 text-slate-800" : "bg-slate-800 border-slate-700 text-white"
                  )}
                >
                  <option>Jane Doe</option>
                  <option>Marcos Andrade</option>
                  <option>Beatriz Costa</option>
                </select>
                <Users size={16} className="absolute right-3.5 top-3.5 text-slate-400 pointer-events-none" />
              </div>
            </div>

            <div className="field">
              <label className="text-xs font-bold uppercase tracking-widest text-slate-400 mb-2 block">Tipo de Relatório</label>
              <div className="grid grid-cols-2 gap-3">
                {[
                  { id: 'complete', label: 'Completo', icon: FileBarChart, desc: 'Histórico total' },
                  { id: 'summary', label: 'Resumo', icon: Layout, desc: 'Indicadores chave' },
                ].map((type) => (
                  <button
                    key={type.id}
                    onClick={() => setReportType(type.id)}
                    className={cn(
                      "p-4 rounded-2xl border text-left transition-all",
                      reportType === type.id 
                        ? "bg-blue-600 border-blue-600 text-white shadow-lg shadow-blue-500/20" 
                        : theme === 'light' 
                          ? "bg-slate-50 border-slate-100 text-slate-600 hover:border-slate-300" 
                          : "bg-slate-800 border-slate-700 text-slate-400 hover:border-slate-600"
                    )}
                  >
                    <type.icon size={20} className={cn("mb-2", reportType === type.id ? "text-white" : "text-blue-500")} />
                    <p className="font-bold text-sm leading-none">{type.label}</p>
                    <p className={cn("text-[10px] mt-1 opacity-70", reportType === type.id ? "text-white" : "text-slate-500")}>{type.desc}</p>
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="mt-8 flex gap-3">
            <button className="flex-1 px-5 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold shadow-lg shadow-blue-500/20 flex items-center justify-center gap-2 transition-all">
              <FileDown size={18} /> Baixar PDF
            </button>
            <button className={cn(
              "px-5 py-3 rounded-xl font-bold border flex items-center justify-center gap-2 transition-all",
              theme === 'light' ? "bg-white border-slate-200 text-slate-700 hover:bg-slate-50" : "bg-slate-800 border-slate-700 text-slate-300 hover:bg-slate-700"
            )}>
              <Printer size={18} /> Imprimir
            </button>
          </div>
        </div>

        <div className={cn(
          "p-6 rounded-3xl border bg-white shadow-sm flex flex-col items-center justify-center text-center",
          theme === 'light' ? "bg-slate-50/50 border-slate-100" : "bg-slate-900 border-slate-800"
        )}>
           <Eye size={48} className="text-slate-300 mb-4 opacity-50" />
           <h4 className={cn("font-black uppercase tracking-tighter text-lg leading-tight", theme === 'light' ? "text-slate-400" : "text-slate-600")}>
             Preview em Tempo Real
           </h4>
           <p className="text-xs text-slate-500 font-medium mt-2 max-w-[200px]">
             O relatório com layout premium será gerado aqui assim que os dados forem processados.
           </p>
        </div>
      </div>

      <div className={cn(
        "rounded-3xl border shadow-xl overflow-hidden min-h-[600px] flex flex-col",
        theme === 'light' ? "bg-white border-slate-100" : "bg-slate-900 border-slate-800"
      )}>
        {/* Mock Report Preview */}
        <div className="p-12 space-y-8 flex-1">
          <div className="flex justify-between items-start border-b pb-8">
            <div className="flex items-center gap-4">
               <div className="w-16 h-16 bg-blue-600 rounded-2xl flex items-center justify-center text-white font-black text-2xl">F</div>
               <div>
                 <h1 className="text-3xl font-black tracking-tighter text-slate-800 flex items-center gap-2">
                   FEMIC <span className="text-blue-600">PRO</span>
                 </h1>
                 <p className="text-sm font-bold uppercase tracking-widest text-slate-400">Relatório Clínico de Evolução</p>
               </div>
            </div>
            <div className="text-right">
              <p className="text-xs font-bold text-slate-500">GERADO EM</p>
              <p className="text-sm font-black text-slate-800">{new Date().toLocaleDateString('pt-BR')}</p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-12">
            <div className="space-y-4">
              <section>
                <h5 className="text-[10px] font-black uppercase tracking-[0.2em] text-blue-600 mb-2">Paciente</h5>
                <p className="text-2xl font-black text-slate-800">{selectedPatient}</p>
                <p className="text-sm font-medium text-slate-500">ID: #4059 • (11) 98877-6655</p>
              </section>
              <section>
                <h5 className="text-[10px] font-black uppercase tracking-[0.2em] text-blue-600 mb-2">Patologia</h5>
                <p className="text-lg font-bold text-slate-800">Cervicalgia Mecânica</p>
              </section>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200">
                <p className="text-[10px] font-black text-slate-400 uppercase mb-1">Dor Inicial</p>
                <p className="text-2xl font-black text-slate-800">8/10</p>
              </div>
              <div className="p-4 bg-blue-50 rounded-2xl border border-blue-100">
                <p className="text-[10px] font-black text-blue-400 uppercase mb-1">Dor Atual</p>
                <p className="text-2xl font-black text-blue-600">2/10</p>
              </div>
              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200">
                <p className="text-[10px] font-black text-slate-400 uppercase mb-1">Sessões</p>
                <p className="text-2xl font-black text-slate-800">24</p>
              </div>
              <div className="p-4 bg-green-50 rounded-2xl border border-green-100">
                <p className="text-[10px] font-black text-green-400 uppercase mb-1">Melhora</p>
                <p className="text-2xl font-black text-green-600">75%</p>
              </div>
            </div>
          </div>

          <section className="space-y-4 border-t pt-8">
            <h5 className="text-[10px] font-black uppercase tracking-[0.2em] text-blue-600">Resumo Clínico Executivo</h5>
            <div className="bg-slate-50 p-6 rounded-2xl border-l-[6px] border-blue-600 italic text-slate-600 leading-relaxed underline underline-offset-8 decoration-slate-200">
              "Paciente apresenta excelente evolução clínica, com redução significativa do quadro álgico e ganho de amplitude de movimento funcional. A adesão ao protocolo de exercícios domiciliares foi determinante para o resultado observado no último período de 24 sessões."
            </div>
          </section>

          <section className="pt-12 text-center text-[10px] font-bold text-slate-300 uppercase tracking-widest border-t">
            Relatório gerado automaticamente pelo sistema FEMIC • faturamento@femic.com.br
          </section>
        </div>
      </div>
    </div>
  );
}
