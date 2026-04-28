import React from 'react';
import { 
  Users, 
  Calendar as CalendarIcon, 
  TrendingUp, 
  DollarSign,
  ArrowUpRight,
  ArrowDownRight,
  Clock,
  MoreVertical,
  CheckCircle2,
  XCircle,
  AlertCircle
} from 'lucide-react';
import { cn } from '../lib/utils.ts';
import { AppointmentStatus, Appointment } from '../types.ts';
import { useFemicState } from '../hooks/useFemicState.ts';

interface DashboardProps {
  theme: 'light' | 'dark';
  state: ReturnType<typeof useFemicState>;
}

export function Dashboard({ theme, state }: DashboardProps) {
  const today = new Date().toISOString().split('T')[0];
  
  const todayAppts = state.appointments.filter(a => a.appointment_date === today);
  const activePatients = state.patients.filter(p => !p.archived);
  
  const confirmedToday = todayAppts.filter(a => a.status === AppointmentStatus.CONFIRMADO).length;
  const completedToday = todayAppts.filter(a => a.status === AppointmentStatus.CONCLUIDO).length;
  
  const stats = [
    { label: 'Atendimentos Hoje', value: todayAppts.length.toString(), detail: `${completedToday} concluídos`, tendency: 'neutral', icon: CalendarIcon },
    { label: 'Pacientes Ativos', value: activePatients.length.toString(), detail: 'Base de dados', tendency: 'neutral', icon: Users },
    { label: 'Confirmados Hoje', value: confirmedToday.toString(), detail: 'WhatsApp OK', tendency: 'up', icon: CheckCircle2 },
  ];

  const upcomingAppts = [...state.appointments]
    .filter(a => a.appointment_date >= today && a.status !== AppointmentStatus.CANCELADO)
    .sort((a, b) => (a.appointment_date + a.start_time).localeCompare(b.appointment_date + b.start_time))
    .slice(0, 5);

  const getPatientName = (id: string) => state.patients.find(p => p.id === id)?.name || 'Paciente';
  const getServiceName = (id: string) => state.services.find(s => s.id === id)?.name || 'Consulta';

  const cardClasses = cn(
    "p-6 rounded-[32px] border transition-all duration-300 hover:shadow-2xl hover:-translate-y-1",
    theme === 'light' ? "bg-white border-slate-100 shadow-xl shadow-slate-200/50" : "bg-slate-900 border-slate-800 shadow-2xl shadow-black/40"
  );

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-2 duration-500">
      {/* KPI Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {stats.map((stat, i) => (
          <div key={i} className={cardClasses}>
            <div className="flex justify-between items-start mb-4">
              <div className={cn(
                "p-2.5 rounded-xl",
                theme === 'light' ? "bg-blue-50 text-blue-600" : "bg-blue-900/20 text-blue-400"
              )}>
                <stat.icon size={20} />
              </div>
              <span className={cn(
                "text-xs font-bold px-2 py-1 rounded-full",
                stat.tendency === 'up' ? "text-green-600 bg-green-50 dark:bg-green-900/20 dark:text-green-400" :
                stat.tendency === 'down' ? "text-red-600 bg-red-50 dark:bg-red-900/20 dark:text-red-400" :
                "text-blue-600 bg-blue-50 dark:bg-blue-900/20 dark:text-blue-400"
              )}>
                {stat.detail}
                {stat.tendency === 'up' && <ArrowUpRight size={12} className="inline ml-1" />}
                {stat.tendency === 'down' && <ArrowDownRight size={12} className="inline ml-1" />}
              </span>
            </div>
            <p className="text-slate-500 text-sm font-medium mb-1">{stat.label}</p>
            <h3 className={cn("text-3xl font-bold tracking-tight", theme === 'light' ? "text-slate-900" : "text-white")}>
              {stat.value}
            </h3>
          </div>
        ))}
      </div>

      <div className="grid lg:grid-cols-3 gap-8 items-start">
        {/* Appointments List */}
        <div className={cn("lg:col-span-2 rounded-2xl border overflow-hidden", theme === 'light' ? "bg-white border-slate-100 shadow-sm" : "bg-slate-900 border-slate-800 shadow-xl")}>
          <div className="px-6 py-5 border-b border-inherit flex justify-between items-center bg-white/50 backdrop-blur-sm">
            <h4 className={cn("font-bold text-lg", theme === 'light' ? "text-slate-800" : "text-white")}>Próximos Atendimentos</h4>
            <button className="text-blue-600 text-sm font-semibold hover:underline">Ver Agenda Completa</button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className={cn(
                "text-[11px] uppercase tracking-wider font-bold",
                theme === 'light' ? "bg-slate-50 text-slate-400" : "bg-slate-800/40 text-slate-500"
              )}>
                <tr>
                  <th className="px-6 py-4">Paciente</th>
                  <th className="px-6 py-4">Horário</th>
                  <th className="px-6 py-4">Procedimento</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4"></th>
                </tr>
              </thead>
              <tbody className={cn("divide-y", theme === 'light' ? "divide-slate-100" : "divide-slate-800")}>
                {upcomingAppts.map((appt, i) => (
                  <tr key={i} className={cn(
                    "group transition-colors",
                    theme === 'light' ? "hover:bg-slate-50/50" : "hover:bg-slate-800/30"
                  )}>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center font-bold text-xs uppercase">
                          {getPatientName(appt.patient_id).split(' ').map(n => n[0]).join('')}
                        </div>
                        <div>
                          <p className={cn("font-semibold text-sm", theme === 'light' ? "text-slate-800" : "text-slate-200")}>{getPatientName(appt.patient_id)}</p>
                          <p className="text-[10px] text-slate-400 font-mono tracking-tighter">{appt.appointment_date}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2 text-sm font-medium">
                        <Clock size={14} className="text-slate-400" />
                        {appt.start_time}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <p className="text-xs text-slate-500 font-medium italic">{getServiceName(appt.service_id)}</p>
                    </td>
                    <td className="px-6 py-4">
                      <span className={cn(
                        "px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wide",
                        appt.status === AppointmentStatus.CONCLUIDO ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400" :
                        appt.status === AppointmentStatus.CONFIRMADO ? "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400" :
                        appt.status === AppointmentStatus.CANCELADO ? "bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-400" :
                        "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400"
                      )}>
                        {appt.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button className="opacity-0 group-hover:opacity-100 p-1 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-all text-slate-400">
                        <MoreVertical size={16} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Activity & Highlights */}
        <div className="space-y-6">
          <div className="bg-gradient-to-br from-blue-600 to-blue-700 p-6 rounded-2xl text-white shadow-xl shadow-blue-500/20 relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16 blur-2xl group-hover:scale-110 transition-transform duration-500"></div>
            <p className="text-[10px] font-bold uppercase tracking-widest opacity-80 mb-2">Alerta de Plantão</p>
            <h5 className="text-xl font-bold leading-tight mb-4 group-hover:translate-x-1 transition-transform">Dra. Helena inicia em 15 minutos</h5>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>
              <span className="text-sm font-medium">Setor Ortopedia (B)</span>
            </div>
          </div>
          
          <div className={cn(
            "p-6 rounded-2xl border bg-white shadow-sm",
            theme === 'light' ? "border-slate-100" : "bg-slate-900 border-slate-800"
          )}>
            <h4 className={cn("font-bold text-slate-700 dark:text-slate-300 mb-4 text-sm flex items-center justify-between")}>
              Médicos Disponíveis
              <span className="w-2 h-2 bg-green-500 rounded-full"></span>
            </h4>
            <div className="space-y-4">
              {[
                { name: 'Dr. Lucas Mendes', specialty: 'Ortopedia • Sala 04', color: 'bg-indigo-100 text-indigo-600' },
                { name: 'Dra. Simone Silva', specialty: 'Pediatria • Sala 12', color: 'bg-pink-100 text-pink-600' },
                { name: 'Dr. André Martins', specialty: 'Neuro • Sala 08', color: 'bg-blue-100 text-blue-600' },
              ].map((doc, i) => (
                <div key={i} className="flex items-center gap-3">
                  <div className={cn("w-8 h-8 rounded-lg flex items-center justify-center font-bold text-[10px]", doc.color)}>
                    {doc.name.split(' ').slice(1).map(n => n[0]).join('')}
                  </div>
                  <div>
                    <p className={cn("text-xs font-bold", theme === 'light' ? "text-slate-800" : "text-slate-200")}>{doc.name}</p>
                    <p className="text-[10px] text-slate-500 uppercase font-bold tracking-tight">{doc.specialty}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
