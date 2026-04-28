import React, { useState } from 'react';
import { 
  Plus, 
  Trash2, 
  Ticket, 
  Users, 
  Calendar, 
  Percent,
  Search,
  Filter,
  CheckCircle2
} from 'lucide-react';
import { cn } from '../lib/utils.ts';
import { useFemicState } from '../hooks/useFemicState.ts';
import { supabaseService } from '../services/supabaseService.ts';

interface PackagesProps {
  theme: 'light' | 'dark';
  state: ReturnType<typeof useFemicState>;
}

export function Packages({ theme, state }: PackagesProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [newPackage, setNewPackage] = useState({
    patient_id: '',
    service_id: '',
    total_sessions: 10,
    remaining_sessions: 10
  });

  const handleAddPackage = async () => {
    if (!newPackage.patient_id || !newPackage.service_id) return;
    await supabaseService.create('packages', {
      ...newPackage,
      active: true,
      created_at: new Date().toISOString()
    });
    setNewPackage({
      patient_id: '',
      service_id: '',
      total_sessions: 10,
      remaining_sessions: 10
    });
  };

  const deletePackage = async (id: string) => {
    if (confirm('Remover este pacote?')) {
      await supabaseService.delete('packages', id);
    }
  };

  const filteredPackages = state.packages.filter(pkg => {
    const patientName = state.patients.find(p => p.id === pkg.patient_id)?.name || '';
    const serviceName = state.services.find(s => s.id === pkg.service_id)?.name || '';
    return patientName.toLowerCase().includes(searchTerm.toLowerCase()) || 
           serviceName.toLowerCase().includes(searchTerm.toLowerCase());
  });

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-500">
      <div className={cn(
        "p-6 rounded-[32px] border flex flex-col md:flex-row items-center justify-between gap-6",
        theme === 'light' ? "bg-white border-slate-100 shadow-xl shadow-slate-200/50" : "bg-slate-900 border-slate-800 shadow-xl shadow-black/40"
      )}>
        <div>
          <h2 className={cn("text-2xl font-black tracking-tight", theme === 'light' ? "text-slate-800" : "text-white")}>
            Pacotes de Sessões
          </h2>
          <p className="text-sm font-bold text-slate-400 uppercase tracking-widest mt-1">Gestão de créditos e uso</p>
        </div>

        <div className="relative w-full md:w-64">
           <input 
             type="text" 
             placeholder="Buscar pacote..." 
             value={searchTerm}
             onChange={(e) => setSearchTerm(e.target.value)}
             className={cn(
               "w-full pl-10 pr-4 py-2.5 rounded-2xl font-bold border-none ring-1 outline-none focus:ring-2 focus:ring-blue-500 transition-all",
               theme === 'light' ? "bg-slate-50 ring-slate-200 text-slate-700" : "bg-slate-800 ring-slate-700 text-white"
             )}
           />
           <Search size={16} className="absolute left-3.5 top-3.5 text-slate-400" />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1">
          <div className={cn(
            "p-6 rounded-[32px] border space-y-6 sticky top-6",
            theme === 'light' ? "bg-white border-slate-100 shadow-sm" : "bg-slate-900 border-slate-800 shadow-lg shadow-black/20"
          )}>
            <h3 className="text-xs font-black uppercase tracking-widest text-slate-400">Novo Pacote</h3>
            <div className="space-y-4">
               <div className="field">
                 <label className="text-[10px] font-bold uppercase tracking-widest text-slate-500 mb-1.5 block">Paciente</label>
                 <select 
                   value={newPackage.patient_id}
                   onChange={(e) => setNewPackage(prev => ({ ...prev, patient_id: e.target.value }))}
                   className={cn(
                     "w-full px-4 py-2.5 rounded-xl font-bold border-none ring-1 focus:ring-2 focus:ring-blue-500 transition-all appearance-none",
                     theme === 'light' ? "bg-slate-50 ring-slate-200" : "bg-slate-900 ring-slate-700 text-white"
                   )}
                 >
                   <option value="">Selecione...</option>
                   {state.patients.filter(p => !p.archived).map(p => (
                     <option key={p.id} value={p.id}>{p.name}</option>
                   ))}
                 </select>
               </div>
               <div className="field">
                 <label className="text-[10px] font-bold uppercase tracking-widest text-slate-500 mb-1.5 block">Serviço</label>
                 <select 
                   value={newPackage.service_id}
                   onChange={(e) => setNewPackage(prev => ({ ...prev, service_id: e.target.value }))}
                   className={cn(
                     "w-full px-4 py-2.5 rounded-xl font-bold border-none ring-1 focus:ring-2 focus:ring-blue-500 transition-all appearance-none",
                     theme === 'light' ? "bg-slate-50 ring-slate-200" : "bg-slate-900 ring-slate-700 text-white"
                   )}
                 >
                   <option value="">Selecione...</option>
                   {state.services.filter(s => s.active).map(s => (
                     <option key={s.id} value={s.id}>{s.name}</option>
                   ))}
                 </select>
               </div>
               <div className="grid grid-cols-2 gap-4">
                 <div className="field">
                   <label className="text-[10px] font-bold uppercase tracking-widest text-slate-500 mb-1.5 block">Total Sessões</label>
                   <input 
                     type="number"
                     value={newPackage.total_sessions}
                     onChange={(e) => {
                       const val = Number(e.target.value);
                       setNewPackage(prev => ({ ...prev, total_sessions: val, remaining_sessions: val }));
                     }}
                     className={cn(
                       "w-full px-4 py-2.5 rounded-xl font-bold border-none ring-1 focus:ring-2 focus:ring-blue-500 transition-all",
                       theme === 'light' ? "bg-slate-50 ring-slate-200" : "bg-slate-900 ring-slate-700 text-white"
                     )}
                   />
                 </div>
                 <div className="field">
                   <label className="text-[10px] font-bold uppercase tracking-widest text-slate-500 mb-1.5 block">Saldo Inicial</label>
                   <input 
                     type="number"
                     value={newPackage.remaining_sessions}
                     onChange={(e) => setNewPackage(prev => ({ ...prev, remaining_sessions: Number(e.target.value) }))}
                     className={cn(
                       "w-full px-4 py-2.5 rounded-xl font-bold border-none ring-1 focus:ring-2 focus:ring-blue-500 transition-all",
                       theme === 'light' ? "bg-slate-50 ring-slate-200" : "bg-slate-900 ring-slate-700 text-white"
                     )}
                   />
                 </div>
               </div>
               <button 
                 onClick={handleAddPackage}
                 className="w-full py-4 bg-blue-600 hover:bg-blue-700 text-white rounded-2xl font-black uppercase text-xs tracking-widest shadow-xl shadow-blue-500/20 transition-all mt-2"
               >
                 Adicionar Pacote
               </button>
            </div>
          </div>
        </div>

        <div className="lg:col-span-2">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredPackages.map(pkg => {
              const patient = state.patients.find(p => p.id === pkg.patient_id);
              const service = state.services.find(s => s.id === pkg.service_id);
              const used = pkg.total_sessions - pkg.remaining_sessions;
              const percent = (used / pkg.total_sessions) * 100;
              
              return (
                <div key={pkg.id} className={cn(
                  "p-6 rounded-[32px] border space-y-4 group",
                  theme === 'light' ? "bg-white border-slate-100 shadow-sm" : "bg-slate-900 border-slate-800 shadow-lg shadow-black/20"
                )}>
                  <div className="flex items-start justify-between gap-4">
                     <div>
                        <h4 className={cn("font-bold text-base leading-tight", theme === 'light' ? "text-slate-800" : "text-white")}>
                          {patient?.name || 'Paciente não encontrado'}
                        </h4>
                        <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mt-1">
                          {service?.name || 'Serviço excluído'}
                        </p>
                     </div>
                     <button onClick={() => deletePackage(pkg.id)} className="text-slate-300 hover:text-rose-500 transition-colors">
                        <Trash2 size={16} />
                     </button>
                  </div>

                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between text-[10px] font-black uppercase tracking-widest">
                       <span className="text-slate-400">Uso do Pacote</span>
                       <span className={cn(pkg.remaining_sessions <= 2 ? "text-rose-500 animate-pulse" : "text-blue-500")}>
                         {used} / {pkg.total_sessions} sessões
                       </span>
                    </div>
                    <div className={cn(
                      "h-2 w-full rounded-full overflow-hidden shrink-0",
                      theme === 'light' ? "bg-slate-100" : "bg-slate-800"
                    )}>
                       <div 
                         className={cn(
                           "h-full rounded-full transition-all duration-1000",
                           pkg.remaining_sessions <= 2 ? "bg-rose-500" : "bg-blue-500"
                         )}
                         style={{ width: `${percent}%` }}
                       />
                    </div>
                  </div>

                  <div className="flex items-center gap-2 pt-2 border-t border-slate-100 dark:border-slate-800">
                    <div className={cn(
                       "flex-1 px-3 py-2 rounded-xl text-center",
                       theme === 'light' ? "bg-slate-50" : "bg-slate-800/40"
                    )}>
                       <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Restantes</p>
                       <p className={cn("text-lg font-black", pkg.remaining_sessions <= 2 ? "text-rose-600" : "text-slate-700 dark:text-slate-300")}>
                         {pkg.remaining_sessions}
                       </p>
                    </div>
                    <button className={cn(
                      "p-3 rounded-xl transition-all",
                      theme === 'light' ? "bg-blue-50 text-blue-600 hover:bg-blue-100" : "bg-blue-900/20 text-blue-400"
                    )}>
                      <Plus size={18} />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>

          {filteredPackages.length === 0 && (
            <div className="py-20 text-center text-slate-400">
              <Ticket size={48} className="mx-auto opacity-10 mb-4" />
              <p className="italic">Nenhum pacote encontrado.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
