import React, { useState } from 'react';
import { 
  Plus, 
  Trash2, 
  Clock, 
  Settings2, 
  Users, 
  DollarSign, 
  ArrowRight,
  ShieldOff,
  Activity
} from 'lucide-react';
import { cn } from '../lib/utils.ts';
import { useFemicState } from '../hooks/useFemicState.ts';
import { ServiceMode, HealthInsurance, Service } from '../types.ts';
import { firebaseService } from '../services/firebaseService.ts';

interface SettingsProps {
  theme: 'light' | 'dark';
  state: ReturnType<typeof useFemicState>;
}

export function Settings({ theme, state }: SettingsProps) {
  const [activeTab, setActiveTab] = useState<'working' | 'payers' | 'services'>('working');

  // New Payer State
  const [newPayerName, setNewPayerName] = useState('');

  // New Service State
  const [newService, setNewService] = useState({
    name: '',
    health_insurance_id: '',
    price: 0,
    duration_minutes: 45,
    appointment_mode: ServiceMode.GRUPO,
    max_patients: 4
  });

  const handleAddPayer = async () => {
    if (!newPayerName) return;
    await firebaseService.create('payers', { name: newPayerName, active: true });
    setNewPayerName('');
  };

  const handleAddService = async () => {
    if (!newService.name) return;
    await firebaseService.create('services', { ...newService, active: true });
    setNewService({
      name: '',
      health_insurance_id: '',
      price: 0,
      duration_minutes: 45,
      appointment_mode: ServiceMode.GRUPO,
      max_patients: 4
    });
  };

  const deletePayer = async (id: string) => {
    if (confirm('Excluir este pagador?')) {
      await firebaseService.delete('payers', id);
    }
  };

  const deleteService = async (id: string) => {
    if (confirm('Excluir este serviço?')) {
      await firebaseService.delete('services', id);
    }
  };

  const updateWorkingHours = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const data = Object.fromEntries(formData.entries());
    
    const settings = {
        start_time: data.start_time as string,
        end_time: data.end_time as string,
        working_periods: data.working_periods as string,
        slot_interval_minutes: Number(data.slot_interval_minutes),
        max_patients_per_slot: Number(data.max_patients_per_slot),
        working_days: '1,2,3,4,5,6' // Simplified for now
    };

    if (state.settings?.id) {
       await firebaseService.update('settings', state.settings.id, settings);
    } else {
       await firebaseService.create('settings', settings);
    }
    alert('Configurações salvas!');
  };

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-500">
      <div className={cn(
        "p-6 rounded-[32px] border flex flex-col md:flex-row items-center justify-between gap-6",
        theme === 'light' ? "bg-white border-slate-100 shadow-xl shadow-slate-200/50" : "bg-slate-900 border-slate-800 shadow-xl shadow-black/40"
      )}>
        <div>
          <h2 className={cn("text-2xl font-black tracking-tight", theme === 'light' ? "text-slate-800" : "text-white")}>
            Configurações do Sistema
          </h2>
          <p className="text-sm font-bold text-slate-400 uppercase tracking-widest mt-1">Personalize sua clínica</p>
        </div>

        <div className="flex bg-slate-100 dark:bg-slate-800 p-1 rounded-2xl overflow-hidden shrink-0">
          {[
            { id: 'working', label: 'Expediente', icon: Clock },
            { id: 'payers', label: 'Pagadores', icon: DollarSign },
            { id: 'services', label: 'Serviços', icon: Activity },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={cn(
                "flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-black uppercase tracking-wider transition-all",
                activeTab === tab.id 
                  ? "bg-white dark:bg-slate-700 text-blue-600 dark:text-blue-400 shadow-lg"
                  : "text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
              )}
            >
              <tab.icon size={14} />
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      <div className={cn(
        "p-8 rounded-[40px] border shadow-sm",
        theme === 'light' ? "bg-white border-slate-200" : "bg-slate-900 border-slate-800"
      )}>
        {activeTab === 'working' && (
          <form onSubmit={updateWorkingHours} className="max-w-2xl space-y-8">
             <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="field">
                  <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-2 block">Horário de Início</label>
                  <input 
                    name="start_time"
                    type="time" 
                    defaultValue={state.settings?.start_time || '08:00'}
                    className={cn(
                        "w-full px-4 py-3 rounded-2xl font-bold border-none ring-1 outline-none focus:ring-2 focus:ring-blue-500 transition-all",
                        theme === 'light' ? "bg-slate-50 ring-slate-200" : "bg-slate-800 ring-slate-700 text-white"
                    )}
                  />
                </div>
                <div className="field">
                  <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-2 block">Horário de Término</label>
                  <input 
                    name="end_time"
                    type="time" 
                    defaultValue={state.settings?.end_time || '18:00'}
                    className={cn(
                        "w-full px-4 py-3 rounded-2xl font-bold border-none ring-1 outline-none focus:ring-2 focus:ring-blue-500 transition-all",
                        theme === 'light' ? "bg-slate-50 ring-slate-200" : "bg-slate-800 ring-slate-700 text-white"
                    )}
                  />
                </div>
             </div>

             <div className="field">
                <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-2 block">Intervalo da Grade (minutos)</label>
                <select 
                    name="slot_interval_minutes"
                    defaultValue={state.settings?.slot_interval_minutes || 30}
                    className={cn(
                        "w-full px-4 py-3 rounded-2xl font-bold border-none ring-1 outline-none focus:ring-2 focus:ring-blue-500 transition-all appearance-none",
                        theme === 'light' ? "bg-slate-50 ring-slate-200" : "bg-slate-800 ring-slate-700 text-white"
                    )}
                >
                    <option value={15}>15 minutos</option>
                    <option value={30}>30 minutos</option>
                    <option value={45}>45 minutos</option>
                    <option value={60}>60 minutos</option>
                </select>
             </div>

             <div className="field">
                <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-2 block">Capacidade por Horário (Padrão)</label>
                <input 
                    name="max_patients_per_slot"
                    type="number" 
                    defaultValue={state.settings?.max_patients_per_slot || 4}
                    className={cn(
                        "w-full px-4 py-3 rounded-2xl font-bold border-none ring-1 outline-none focus:ring-2 focus:ring-blue-500 transition-all",
                        theme === 'light' ? "bg-slate-50 ring-slate-200" : "bg-slate-800 ring-slate-700 text-white"
                    )}
                />
             </div>

             <div className="pt-4">
                <button type="submit" className="px-8 py-4 bg-blue-600 hover:bg-blue-700 text-white rounded-2xl font-black uppercase text-xs tracking-widest shadow-xl shadow-blue-500/30 transition-all">
                  Salvar Configurações
                </button>
             </div>
          </form>
        )}

        {activeTab === 'payers' && (
          <div className="space-y-8">
            <div className="flex gap-3">
              <input 
                value={newPayerName}
                onChange={(e) => setNewPayerName(e.target.value)}
                placeholder="Ex: Unimed, Particular, Bradesco..."
                className={cn(
                    "flex-1 px-4 py-3 rounded-2xl font-bold border-none ring-1 outline-none focus:ring-2 focus:ring-blue-500 transition-all",
                    theme === 'light' ? "bg-slate-50 ring-slate-200" : "bg-slate-800 ring-slate-700 text-white"
                )}
              />
              <button 
                onClick={handleAddPayer}
                className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-2xl font-black text-[10px] uppercase tracking-widest transition-all shadow-xl shadow-blue-500/20"
              >
                Adicionar
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
              {state.payers.map(payer => (
                <div key={payer.id} className={cn(
                  "p-4 rounded-3xl border flex items-center justify-between group",
                  theme === 'light' ? "bg-white border-slate-100" : "bg-slate-800 border-slate-700"
                )}>
                  <span className="font-bold">{payer.name}</span>
                  <button onClick={() => deletePayer(payer.id)} className="text-slate-400 hover:text-rose-500 transition-colors">
                    <Trash2 size={16} />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'services' && (
          <div className="space-y-8">
             <div className={cn(
               "p-6 rounded-[32px] border space-y-6",
               theme === 'light' ? "bg-slate-50 border-slate-100 shadow-inner" : "bg-slate-800/40 border-slate-700"
             )}>
                <h4 className="text-xs font-black uppercase tracking-widest text-slate-400">Novo Serviço</h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                   <div className="field">
                    <label className="text-[10px] font-bold uppercase tracking-widest text-slate-500 mb-1.5 block">Nome do Serviço</label>
                    <input 
                      value={newService.name}
                      onChange={(e) => setNewService(prev => ({ ...prev, name: e.target.value }))}
                      placeholder="Ex: Fisioterapia Convencional"
                      className={cn(
                          "w-full px-4 py-2.5 rounded-xl font-bold border-none ring-1 focus:ring-2 focus:ring-blue-500 transition-all",
                          theme === 'light' ? "bg-white ring-slate-200" : "bg-slate-900 ring-slate-700 text-white"
                      )}
                    />
                   </div>
                   <div className="field">
                    <label className="text-[10px] font-bold uppercase tracking-widest text-slate-500 mb-1.5 block">Pagador</label>
                    <select 
                      value={newService.health_insurance_id}
                      onChange={(e) => setNewService(prev => ({ ...prev, health_insurance_id: e.target.value }))}
                      className={cn(
                          "w-full px-4 py-2.5 rounded-xl font-bold border-none ring-1 focus:ring-2 focus:ring-blue-500 transition-all",
                          theme === 'light' ? "bg-white ring-slate-200" : "bg-slate-900 ring-slate-700 text-white"
                      )}
                    >
                      <option value="">Selecione...</option>
                      {state.payers.map(p => (
                        <option key={p.id} value={p.id}>{p.name}</option>
                      ))}
                    </select>
                   </div>
                   <div className="field">
                    <label className="text-[10px] font-bold uppercase tracking-widest text-slate-500 mb-1.5 block">Preço (R$)</label>
                    <input 
                      type="number"
                      value={newService.price}
                      onChange={(e) => setNewService(prev => ({ ...prev, price: Number(e.target.value) }))}
                      className={cn(
                          "w-full px-4 py-2.5 rounded-xl font-bold border-none ring-1 focus:ring-2 focus:ring-blue-500 transition-all",
                          theme === 'light' ? "bg-white ring-slate-200" : "bg-slate-900 ring-slate-700 text-white"
                      )}
                    />
                   </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                   <div className="field">
                    <label className="text-[10px] font-bold uppercase tracking-widest text-slate-500 mb-1.5 block">Duração (min)</label>
                    <input 
                      type="number"
                      value={newService.duration_minutes}
                      onChange={(e) => setNewService(prev => ({ ...prev, duration_minutes: Number(e.target.value) }))}
                      className={cn(
                          "w-full px-4 py-2.5 rounded-xl font-bold border-none ring-1 focus:ring-2 focus:ring-blue-500 transition-all",
                          theme === 'light' ? "bg-white ring-slate-200" : "bg-slate-900 ring-slate-700 text-white"
                      )}
                    />
                   </div>
                   <div className="field">
                    <label className="text-[10px] font-bold uppercase tracking-widest text-slate-500 mb-1.5 block">Modo</label>
                    <select 
                      value={newService.appointment_mode}
                      onChange={(e) => setNewService(prev => ({ ...prev, appointment_mode: e.target.value as ServiceMode }))}
                      className={cn(
                          "w-full px-4 py-2.5 rounded-xl font-bold border-none ring-1 focus:ring-2 focus:ring-blue-500 transition-all",
                          theme === 'light' ? "bg-white ring-slate-200" : "bg-slate-900 ring-slate-700 text-white"
                      )}
                    >
                      <option value={ServiceMode.GRUPO}>Em Grupo</option>
                      <option value={ServiceMode.INDIVIDUAL}>Individual</option>
                    </select>
                   </div>
                   <div className="field">
                    <label className="text-[10px] font-bold uppercase tracking-widest text-slate-500 mb-1.5 block">Máx. Alunos</label>
                    <input 
                      type="number"
                      value={newService.max_patients}
                      onChange={(e) => setNewService(prev => ({ ...prev, max_patients: Number(e.target.value) }))}
                      disabled={newService.appointment_mode === ServiceMode.INDIVIDUAL}
                      className={cn(
                          "w-full px-4 py-2.5 rounded-xl font-bold border-none ring-1 focus:ring-2 focus:ring-blue-500 transition-all disabled:opacity-50",
                          theme === 'light' ? "bg-white ring-slate-200" : "bg-slate-900 ring-slate-700 text-white"
                      )}
                    />
                   </div>
                </div>
                <button 
                  onClick={handleAddService}
                  className="w-full py-4 bg-blue-600 hover:bg-blue-700 text-white rounded-2xl font-black uppercase text-[10px] tracking-widest shadow-xl shadow-blue-500/20 transition-all"
                >
                  Adicionar Serviço
                </button>
             </div>

             <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {state.services.map(service => (
                  <div key={service.id} className={cn(
                    "p-6 rounded-[32px] border flex flex-col gap-4",
                    theme === 'light' ? "bg-white border-slate-100 shadow-sm" : "bg-slate-800 border-slate-700"
                  )}>
                    <div className="flex items-center justify-between">
                      <div>
                        <h5 className="font-bold text-lg">{service.name}</h5>
                        <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">
                          {state.payers.find(p => p.id === service.health_insurance_id)?.name || 'Particular'}
                        </p>
                      </div>
                      <button onClick={() => deleteService(service.id)} className="text-slate-400 hover:text-rose-500 transition-colors">
                        <Trash2 size={18} />
                      </button>
                    </div>
                    <div className="flex items-center gap-6">
                       <div className="flex items-center gap-2">
                          <Clock size={14} className="text-blue-500" />
                          <span className="text-xs font-bold">{service.duration_minutes} min</span>
                       </div>
                       <div className="flex items-center gap-2">
                          <DollarSign size={14} className="text-emerald-500" />
                          <span className="text-xs font-bold">R$ {service.price.toLocaleString('pt-BR')}</span>
                       </div>
                       <div className="flex items-center gap-2">
                          <Users size={14} className="text-indigo-500" />
                          <span className="text-xs font-bold">{service.appointment_mode === ServiceMode.INDIVIDUAL ? 'Individual' : `Máx. ${service.max_patients}`}</span>
                       </div>
                    </div>
                  </div>
                ))}
             </div>
          </div>
        )}
      </div>
    </div>
  );
}
