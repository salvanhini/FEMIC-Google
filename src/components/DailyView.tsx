import React, { useState } from 'react';
import { 
  Plus, 
  RefreshCw, 
  MessageSquare, 
  Edit2, 
  CheckCircle2, 
  XCircle,
  Clock,
  AlertCircle
} from 'lucide-react';
import { cn } from '../lib/utils.ts';
import { useFemicState } from '../hooks/useFemicState.ts';
import { AppointmentStatus } from '../types.ts';

interface DailyViewProps {
  theme: 'light' | 'dark';
  state: ReturnType<typeof useFemicState>;
  onEditClick: (appt: any) => void;
}

export function DailyView({ theme, state, onEditClick }: DailyViewProps) {
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);

  const appointments = state.appointments
    .filter(a => a.appointment_date === selectedDate)
    .sort((a, b) => a.start_time.localeCompare(b.start_time));

  const getPatient = (id: string) => state.patients.find(p => p.id === id);
  const getService = (id: string) => state.services.find(s => s.id === id);

  const stats = {
    agendado: appointments.filter(a => a.status === AppointmentStatus.AGENDADO).length,
    confirmado: appointments.filter(a => a.status === AppointmentStatus.CONFIRMADO).length,
    concluido: appointments.filter(a => a.status === AppointmentStatus.CONCLUIDO).length,
    cancelado: appointments.filter(a => a.status === AppointmentStatus.CANCELADO).length,
    total: appointments.length
  };

  const handleStatusChange = async (id: string, status: AppointmentStatus) => {
    await state.updateAppointmentStatus(id, status);
  };

  const sendWhatsApp = (apptId: string) => {
    const appt = state.appointments.find(a => a.id === apptId);
    if (!appt) return;
    const patient = getPatient(appt.patient_id);
    if (!patient || !patient.whatsapp) return;

    const phone = '55' + patient.whatsapp.replace(/\D/g, '');
    const msg = `Olá ${patient.name}, confirmamos seu atendimento hoje às ${appt.start_time}.`;
    window.open(`https://wa.me/${phone}?text=${encodeURIComponent(msg)}`, '_blank');
  };

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-500">
      <div className={cn(
        "p-6 rounded-[32px] border flex flex-col sm:flex-row items-center justify-between gap-6",
        theme === 'light' ? "bg-white border-slate-100 shadow-xl shadow-slate-200/50" : "bg-slate-900 border-slate-800 shadow-2xl shadow-black/40"
      )}>
        <div className="flex items-center gap-4">
           <div className="w-12 h-12 bg-blue-600 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-blue-500/30">
              <Clock size={24} />
           </div>
           <div>
              <h2 className={cn("text-2xl font-black tracking-tight", theme === 'light' ? "text-slate-800" : "text-white")}>
                Dia Operacional
              </h2>
              <p className="text-sm font-bold text-slate-400 uppercase tracking-widest mt-1">Gestão rápida de atendimentos</p>
           </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 bg-slate-100 dark:bg-slate-800/50 p-1 rounded-2xl border border-slate-200 dark:border-slate-700">
            <input 
              type="date" 
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className={cn(
                "px-4 py-2 rounded-xl font-black text-xs uppercase tracking-widest bg-transparent outline-none",
                theme === 'light' ? "text-slate-700" : "text-white"
              )}
            />
            <button 
              onClick={() => setSelectedDate(new Date().toISOString().split('T')[0])}
              className={cn(
                "px-4 py-2 rounded-xl font-black text-[10px] uppercase tracking-widest transition-all",
                theme === 'light' ? "bg-white text-blue-600 shadow-sm" : "bg-slate-700 text-blue-400 shadow-lg"
              )}
            >
              Hoje
            </button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        {[
          { label: 'Agendados', value: stats.agendado, icon: Clock, color: 'text-amber-500', bg: 'bg-amber-500/10' },
          { label: 'Confirmados', value: stats.confirmado, icon: AlertCircle, color: 'text-blue-500', bg: 'bg-blue-500/10' },
          { label: 'Concluídos', value: stats.concluido, icon: CheckCircle2, color: 'text-emerald-500', bg: 'bg-emerald-500/10' },
          { label: 'Cancelados', value: stats.cancelado, icon: XCircle, color: 'text-rose-500', bg: 'bg-rose-500/10' },
          { label: 'Total', value: stats.total, icon: RefreshCw, color: 'text-slate-500', bg: 'bg-slate-500/10' },
        ].map((stat, i) => (
          <div key={i} className={cn(
            "p-4 rounded-3xl border flex flex-col gap-2",
            theme === 'light' ? "bg-white border-slate-100" : "bg-slate-900 border-slate-800"
          )}>
            <div className={cn("w-8 h-8 rounded-xl flex items-center justify-center", stat.bg, stat.color)}>
              <stat.icon size={16} />
            </div>
            <div>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{stat.label}</p>
              <p className={cn("text-xl font-black", theme === 'light' ? "text-slate-800" : "text-white")}>{stat.value}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="space-y-3">
        {appointments.length > 0 ? appointments.map((a) => {
          const patient = getPatient(a.patient_id);
          const service = getService(a.service_id);
          
          return (
            <div 
              key={a.id}
              className={cn(
                "p-5 rounded-[32px] border transition-all hover:scale-[1.01] hover:shadow-xl group relative overflow-hidden",
                theme === 'light' ? "bg-white border-slate-100 shadow-sm" : "bg-slate-900 border-slate-800 shadow-2xl shadow-black/20"
              )}
            >
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="flex items-center gap-5">
                  <div className={cn(
                    "w-14 h-14 rounded-2xl flex flex-col items-center justify-center font-black text-xs shadow-inner shrink-0",
                    theme === 'light' ? "bg-blue-50 text-blue-600" : "bg-blue-500/10 text-blue-400"
                  )}>
                    <span className="text-sm">{a.start_time.split(':')[0]}</span>
                    <span className="opacity-40 -mt-1 text-[10px]">{a.start_time.split(':')[1]}</span>
                  </div>
                  <div>
                    <h4 className={cn("font-black text-lg tracking-tight leading-tight", theme === 'light' ? "text-slate-800" : "text-white")}>
                      {patient?.name || 'Paciente não encontrado'}
                    </h4>
                    <p className="text-[11px] font-black text-slate-400 uppercase tracking-[0.15em] mt-1 flex items-center gap-2">
                      <span className="text-blue-500">{service?.name || 'Serviço'}</span>
                      <span className="opacity-30">|</span>
                      <span>{a.start_time} - {a.end_time}</span>
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div className="flex items-center bg-slate-100 dark:bg-slate-800/80 p-1 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-inner">
                    {[
                      { status: AppointmentStatus.AGENDADO, label: 'Ag' },
                      { status: AppointmentStatus.CONFIRMADO, label: 'Cf' },
                      { status: AppointmentStatus.CONCLUIDO, label: 'Ok' },
                      { status: AppointmentStatus.CANCELADO, label: 'X' },
                    ].map((btn) => (
                      <button
                        key={btn.status}
                        onClick={() => handleStatusChange(a.id, btn.status)}
                        className={cn(
                          "w-12 h-9 rounded-xl text-[10px] font-black uppercase transition-all",
                          a.status === btn.status
                            ? "bg-blue-600 text-white shadow-lg shadow-blue-500/30 scale-105"
                            : "text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                        )}
                      >
                        {btn.label}
                      </button>
                    ))}
                  </div>

                  <div className="flex items-center gap-2">
                    <button 
                      onClick={() => sendWhatsApp(a.id)}
                      className={cn(
                        "p-3 rounded-2xl transition-all hover:scale-105 active:scale-95 group/btn",
                        theme === 'light' ? "bg-emerald-50 text-emerald-600 hover:bg-emerald-600 hover:text-white" : "bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500 hover:text-white"
                      )}
                    >
                      <MessageSquare size={20} className="group-hover/btn:rotate-12 transition-transform" />
                    </button>
                    <button 
                      onClick={() => onEditClick(a)}
                      className={cn(
                      "p-3 rounded-2xl transition-all hover:scale-105 active:scale-95",
                      theme === 'light' ? "bg-slate-50 text-slate-600 hover:bg-slate-900 hover:text-white" : "bg-slate-800 text-slate-400 hover:bg-white hover:text-slate-900"
                    )}>
                      <Edit2 size={20} />
                    </button>
                  </div>
                </div>
              </div>
              {/* Background accent */}
              <div className="absolute top-0 right-0 w-24 h-24 bg-blue-500/5 rounded-full -mr-12 -mt-12 group-hover:scale-150 transition-transform duration-1000 blur-2xl" />
            </div>
          );
        }) : (
          <div className="py-20 text-center text-slate-400">
            <Clock size={48} className="mx-auto opacity-10 mb-4" />
            <p className="italic">Nenhum atendimento para esta data.</p>
          </div>
        )}
      </div>
    </div>
  );
}
