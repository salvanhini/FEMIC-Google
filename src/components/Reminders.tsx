import React, { useState } from 'react';
import { 
  MessageSquare, 
  Clock, 
  CheckCircle2, 
  Plus, 
  RefreshCw, 
  Calendar as CalendarIcon,
  Search,
  Filter,
  Send,
  User,
  Trash2
} from 'lucide-react';
import { cn } from '../lib/utils.ts';
import { useFemicState } from '../hooks/useFemicState.ts';
import { AppointmentStatus, Appointment } from '../types.ts';
import { firebaseService } from '../services/firebaseService.ts';

interface RemindersProps {
  theme: 'light' | 'dark';
  state: ReturnType<typeof useFemicState>;
}

export function Reminders({ theme, state }: RemindersProps) {
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [reminderType, setReminderType] = useState<'appointment' | 'form'>('appointment');

  const appointments = state.appointments
    .filter(a => a.appointment_date === selectedDate)
    .filter(a => reminderType === 'form' ? a.status === AppointmentStatus.CONCLUIDO : [AppointmentStatus.AGENDADO, AppointmentStatus.CONFIRMADO].includes(a.status))
    .sort((a, b) => a.start_time.localeCompare(b.start_time));

  const getPatient = (id: string) => state.patients.find(p => p.id === id);

  const sendWhatsApp = async (appt: Appointment) => {
    const patient = getPatient(appt.patient_id);
    if (!patient || !patient.whatsapp) return;

    const phone = '55' + patient.whatsapp.replace(/\D/g, '');
    let msg = '';

    if (reminderType === 'appointment') {
      msg = `Olá ${patient.name}, passando para confirmar seu atendimento amanhã às ${appt.start_time}. Por favor, confirme ou avise se precisar remarcar.`;
    } else {
      msg = `Olá ${patient.name}, sua sessão foi concluída! Pode preencher nosso formulário de evolução? Link: bit.ly/femic-evolucao`;
    }

    window.open(`https://wa.me/${phone}?text=${encodeURIComponent(msg)}`, '_blank');
    
    // Mark as sent
    if (reminderType === 'appointment') {
       await firebaseService.update('appointments', appt.id, { 
          package_consumed: appt.package_consumed, // keep existing
          appointment_reminder_sent: true 
       });
    } else {
       await firebaseService.update('appointments', appt.id, { 
          package_consumed: appt.package_consumed,
          form_reminder_sent: true 
       });
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-500">
      <div className={cn(
        "p-6 rounded-[32px] border flex flex-col sm:flex-row items-center justify-between gap-6",
        theme === 'light' ? "bg-white border-slate-100 shadow-xl shadow-slate-200/50" : "bg-slate-900 border-slate-800 shadow-2xl shadow-black/40"
      )}>
        <div className="flex items-center gap-4">
           <div className="w-12 h-12 bg-emerald-500 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-emerald-500/30">
              <MessageSquare size={24} />
           </div>
           <div>
              <h2 className={cn("text-2xl font-black tracking-tight", theme === 'light' ? "text-slate-800" : "text-white")}>
                Fila de WhatsApp
              </h2>
              <p className="text-sm font-bold text-slate-400 uppercase tracking-widest mt-1">Lembretes e Pós-Atendimento</p>
           </div>
        </div>

        <div className="flex bg-slate-100 dark:bg-slate-800 p-1.5 rounded-2xl shadow-inner shrink-0 border border-slate-200 dark:border-slate-700">
          <button
            onClick={() => setReminderType('appointment')}
            className={cn(
              "px-6 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all",
              reminderType === 'appointment' ? "bg-white dark:bg-slate-700 text-emerald-600 dark:text-emerald-400 shadow-xl" : "text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
            )}
          >
            Lembrete Sessão
          </button>
          <button
            onClick={() => setReminderType('form')}
            className={cn(
              "px-6 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all",
              reminderType === 'form' ? "bg-white dark:bg-slate-700 text-emerald-600 dark:text-emerald-400 shadow-xl" : "text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
            )}
          >
            Feedback
          </button>
        </div>
      </div>

      <div className="card p-6 flex flex-col sm:flex-row items-center justify-between gap-4 bg-white/50 dark:bg-white/5 backdrop-blur-xl border-dashed border-2">
        <div className="flex items-center gap-4">
          <Clock size={20} className="text-blue-500" />
          <p className="text-sm font-bold text-slate-500">
            {appointments.length} lembretes identificados para a data selecionada
          </p>
        </div>
        <div className="flex items-center gap-3">
          <input 
            type="date" 
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            className={cn(
              "px-4 py-2 rounded-xl font-black border-none ring-1 outline-none",
              theme === 'light' ? "bg-white ring-slate-100 shadow-sm" : "bg-slate-800 ring-slate-700 text-white"
            )}
          />
          <button className="flex-1 sm:flex-none px-6 py-3 bg-emerald-600 dark:bg-emerald-500 text-white rounded-2xl font-black text-[10px] uppercase tracking-widest shadow-xl shadow-emerald-500/20 hover:scale-[1.02] active:scale-95 transition-all">
            Enviar Todos
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {appointments.map(appt => {
           const patient = getPatient(appt.patient_id);
           if (!patient) return null;
           
           return (
             <div key={appt.id} className={cn(
               "p-6 rounded-[32px] border space-y-4 group relative overflow-hidden",
               theme === 'light' ? "bg-white border-slate-100 shadow-sm" : "bg-slate-900 border-slate-800"
             )}>
                <div className="flex items-center gap-4">
                   <div className={cn(
                     "w-12 h-12 rounded-2xl flex items-center justify-center font-black transition-all",
                     theme === 'light' ? "bg-blue-50 text-blue-500 shadow-inner" : "bg-blue-900/20 text-blue-400"
                   )}>
                      <CalendarIcon size={20} />
                   </div>
                   <div>
                      <h4 className={cn("font-bold text-base leading-tight", theme === 'light' ? "text-slate-800" : "text-white")}>
                        {patient.name}
                      </h4>
                      <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mt-1 flex items-center gap-1.5">
                        <Clock size={10} /> {appt.start_time} · {patient.whatsapp || 'Sem Whats'}
                      </p>
                   </div>
                </div>

                <div className="pt-2 flex items-center gap-2">
                   <button 
                     onClick={() => sendWhatsApp(appt)}
                     className="flex-1 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-2xl font-black text-[10px] uppercase tracking-widest shadow-xl shadow-blue-500/20 flex items-center justify-center gap-2 transition-all"
                   >
                     <Send size={12} /> Enviar WhatsApp
                   </button>
                   <button className="p-3 bg-slate-100 dark:bg-slate-800 text-slate-400 rounded-2xl hover:text-rose-500 transition-all">
                      <Trash2 size={16} />
                   </button>
                </div>

                <div className="absolute -right-4 -bottom-4 w-20 h-20 bg-blue-500/5 rounded-full group-hover:scale-150 transition-transform duration-700" />
             </div>
           );
        })}
      </div>

      {appointments.length === 0 && (
         <div className="py-20 text-center text-slate-400 italic">
            <RefreshCw size={48} className="mx-auto opacity-10 mb-4" />
            <p>Nenhum compromisso encontrado para lembrete nesta data.</p>
         </div>
      )}
    </div>
  );
}
