import React, { useState, useMemo } from 'react';
import { 
  ChevronLeft, 
  ChevronRight, 
  Calendar as CalendarIcon,
  Clock,
  Plus,
  Users,
  Search,
  Filter,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Clock3
} from 'lucide-react';
import { cn } from '../lib/utils.ts';
import { useFemicState } from '../hooks/useFemicState.ts';
import { Appointment, AppointmentStatus } from '../types.ts';

interface AgendaProps {
  theme: 'light' | 'dark';
  state: ReturnType<typeof useFemicState>;
  onAddClick: (date?: string, slot?: string) => void;
  onEditClick: (appt: Appointment) => void;
}

// Time Utils
const timeToMin = (t: string) => {
  const [h, m] = t.split(':').map(Number);
  return h * 60 + (m || 0);
};

const minToTime = (n: number) => {
  return String(Math.floor(n / 60)).padStart(2, '0') + ':' + String(n % 60).padStart(2, '0');
};

const addMinutes = (t: string, m: number) => {
  return minToTime(timeToMin(t) + m);
};

export function Agenda({ theme, state, onAddClick, onEditClick }: AgendaProps) {
  const [view, setView] = useState<'week' | 'month'>('week');
  const [currentDate, setCurrentDate] = useState(new Date());

  const settings = state.settings || {
    start_time: '08:00',
    end_time: '20:00',
    working_days: '1,2,3,4,5,6',
    slot_interval_minutes: 30,
    max_patients_per_slot: 4,
    working_periods: '08:00-12:00,16:00-20:00'
  };

  const startOfWeek = useMemo(() => {
    const d = new Date(currentDate);
    const day = d.getDay();
    const diff = d.getDate() - day + (day === 0 ? -6 : 1);
    d.setDate(diff);
    d.setHours(0, 0, 0, 0);
    return d;
  }, [currentDate]);

  const days = useMemo(() => {
    return Array.from({ length: 7 }, (_, i) => {
      const d = new Date(startOfWeek);
      d.setDate(startOfWeek.getDate() + i);
      return {
        name: d.toLocaleDateString('pt-BR', { weekday: 'short' }).slice(0, 3),
        date: d.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' }),
        dateFull: d.toLocaleDateString('pt-BR', { day: '2-digit', month: 'long', year: 'numeric' }),
        isToday: d.toDateString() === new Date().toDateString(),
        rawDate: d,
        iso: d.toISOString().split('T')[0]
      };
    });
  }, [startOfWeek]);

  const pxPerMin = 1.5; // Constants for layout
  const startMin = timeToMin(settings.start_time) - (timeToMin(settings.start_time) % 60); // Round down to hour
  const endMin = Math.ceil(timeToMin(settings.end_time) / 60) * 60; // Round up to hour
  const totalMin = endMin - startMin;
  const bodyHeight = totalMin * pxPerMin;

  const hourMarks = useMemo(() => {
    const marks = [];
    for (let m = startMin; m <= endMin; m += 60) {
      marks.push(m);
    }
    return marks;
  }, [startMin, endMin]);

  const getAppointmentsForDay = (dateIso: string) => {
    return state.appointments.filter(a => a.appointment_date === dateIso);
  };

  const getPatientName = (id: string) => {
    return state.patients.find(p => p.id === id)?.name || 'Paciente';
  };

  const getStatusIcon = (status: AppointmentStatus) => {
    switch (status) {
      case AppointmentStatus.CONCLUIDO: return <CheckCircle2 size={12} />;
      case AppointmentStatus.CANCELADO: return <XCircle size={12} />;
      case AppointmentStatus.CONFIRMADO: return <AlertCircle size={12} />;
      default: return <Clock size={12} />;
    }
  };

  const getStatusColor = (status: AppointmentStatus) => {
    switch (status) {
      case AppointmentStatus.CONCLUIDO: return theme === 'light' ? 'bg-emerald-500/90' : 'bg-emerald-600/90';
      case AppointmentStatus.CANCELADO: return theme === 'light' ? 'bg-rose-500/90' : 'bg-rose-600/90';
      case AppointmentStatus.CONFIRMADO: return theme === 'light' ? 'bg-blue-500/90' : 'bg-blue-600/90';
      default: return theme === 'light' ? 'bg-amber-500/90' : 'bg-amber-600/90';
    }
  };

  // Layout logic for overlapping appointments
  const calculateLayout = (dayAppointments: Appointment[]) => {
    if (dayAppointments.length === 0) return [];

    const items = dayAppointments.map(a => {
      let st = timeToMin(a.start_time);
      let en = timeToMin(a.end_time);
      // Clamp to bounds
      st = Math.max(startMin, Math.min(endMin, st));
      en = Math.max(startMin, Math.min(endMin, en));
      if (en <= st) en = Math.min(endMin, st + 15);
      return { a, start: st, end: en, col: 0, cols: 1 };
    }).sort((x, y) => (x.start - y.start) || (x.end - y.end));

    const groups: any[][] = [];
    items.forEach(it => {
      let g = groups.find(gr => gr.some(o => it.start < o.end && o.start < it.end));
      if (!g) {
        g = [];
        groups.push(g);
      }
      g.push(it);
    });

    groups.forEach(group => {
      group.sort((x, y) => (x.start - y.start) || (x.end - y.end));
      const colEnds: number[] = [];
      group.forEach(it => {
        let col = colEnds.findIndex(end => end <= it.start);
        if (col < 0) {
          col = colEnds.length;
          colEnds.push(it.end);
        } else {
          colEnds[col] = it.end;
        }
        it.col = col;
      });
      const totalCols = Math.max(1, colEnds.length);
      group.forEach(it => it.cols = totalCols);
    });

    return items;
  };

  const renderWeek = () => (
    <div className="flex-1 flex flex-col overflow-hidden">
      {/* Header Row */}
      <div className="flex border-b border-inherit bg-slate-50/50 dark:bg-slate-900/50 backdrop-blur-sm z-10">
        <div className="w-20 shrink-0 border-r border-inherit flex flex-col items-center justify-center p-2">
          <div className="w-8 h-8 rounded-full bg-blue-500/10 flex items-center justify-center">
            <Clock3 size={14} className="text-blue-500" />
          </div>
        </div>
        {days.map((day, i) => (
          <div key={i} className={cn(
            "flex-1 py-4 text-center border-r border-inherit last:border-r-0 relative transition-all",
            day.isToday && (theme === 'light' ? "bg-blue-100/30" : "bg-blue-500/10")
          )}>
            {day.isToday && <div className="absolute top-0 inset-x-0 h-1 bg-blue-500 shadow-sm" />}
            <p className={cn(
              "text-[10px] font-black uppercase tracking-widest",
              day.isToday ? "text-blue-600" : "text-slate-400"
            )}>{day.name}</p>
            <p className={cn(
              "text-xl font-black mt-1",
              day.isToday ? "text-blue-600" : (theme === 'light' ? "text-slate-800" : "text-white")
            )}>{day.date.split('/')[0]}</p>
          </div>
        ))}
      </div>

      {/* Grid Body */}
      <div className="flex-1 overflow-y-auto scrollbar-thin scrollbar-thumb-slate-200 dark:scrollbar-thumb-slate-800 bg-grid-slate-100/[0.05]">
        <div className="relative flex" style={{ height: bodyHeight }}>
          {/* Time Axis */}
          <div className="w-20 shrink-0 border-r border-inherit bg-slate-50/20 dark:bg-slate-900/10 relative">
            {hourMarks.map((m, i) => (
              <div 
                key={i} 
                className="absolute right-2 px-2 py-1 text-[10px] font-black text-slate-400 flex items-center gap-1 opacity-60"
                style={{ top: (m - startMin) * pxPerMin }}
              >
                {minToTime(m)}
              </div>
            ))}
          </div>

          {/* Day Columns */}
          <div className="flex-1 flex overflow-hidden">
            {days.map((day, i) => {
              const dayAppointments = getAppointmentsForDay(day.iso);
              const layout = calculateLayout(dayAppointments);
              
              return (
                <div 
                  key={i} 
                  onClick={() => onAddClick(day.iso)}
                  className={cn(
                    "flex-1 border-r border-inherit last:border-r-0 relative pointer-events-auto transition-colors cursor-pointer group/col",
                    day.isToday ? (theme === 'light' ? "bg-blue-50/10" : "bg-white/[0.01]") : "bg-transparent hover:bg-slate-50/5 dark:hover:bg-white/[0.01]"
                  )}
                >
                  {/* Grid Lines */}
                  {hourMarks.map((m, j) => (
                    <React.Fragment key={j}>
                      <div 
                        onClick={(e) => {
                          e.stopPropagation();
                          onAddClick(day.iso, minToTime(m));
                        }}
                        className="absolute inset-x-0 border-b border-slate-100 dark:border-slate-800/40 pointer-events-auto hover:bg-blue-500/5 transition-colors"
                        style={{ top: (m - startMin) * pxPerMin, height: 60 }}
                      />
                      {/* Half hour line */}
                      <div 
                        className="absolute inset-x-0 border-b border-slate-100/50 dark:border-slate-800/20 pointer-events-none"
                        style={{ top: (m - startMin + 30) * pxPerMin }}
                      />
                    </React.Fragment>
                  ))}
                  
                  {/* Current Time Indicator for Today */}
                  {day.isToday && (
                    <div 
                      className="absolute inset-x-0 z-10 flex items-center pointer-events-none"
                      style={{ 
                        top: (timeToMin(new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })) - startMin) * pxPerMin 
                      }}
                    >
                      <div className="w-1.5 h-1.5 rounded-full bg-rose-500 -ml-[5px] ring-4 ring-rose-500/20" />
                      <div className="flex-1 h-px bg-rose-500 shadow-[0_0_8px_rgba(244,63,94,0.4)]" />
                    </div>
                  )}

                  {/* Appointments */}
                  {layout.map(({ a, start, end, col, cols }) => {
                    const top = (start - startMin) * pxPerMin;
                    const height = (end - start) * pxPerMin - 2;
                    const left = `calc(${(col * 100) / cols}% + 4px)`;
                    const width = `calc(${100 / cols}% - 8px)`;
                    const statusColor = getStatusColor(a.status);

                    return (
                      <div 
                        key={a.id}
                        onClick={(e) => {
                          e.stopPropagation();
                          onEditClick(a);
                        }}
                        className={cn(
                          "absolute p-2 rounded-2xl border border-white/20 shadow-lg text-white backdrop-blur-md animate-in zoom-in-95 duration-300 group cursor-pointer overflow-hidden flex flex-col transition-all hover:scale-[1.02] hover:z-20",
                          statusColor
                        )}
                        style={{ top, height, left, width }}
                        title={`${a.start_time} - ${getPatientName(a.patient_id)}`}
                      >
                         <div className="flex items-center justify-between gap-1 mb-1">
                            <span className="text-[9px] font-black opacity-80 tracking-tighter truncate">{a.start_time} - {a.end_time}</span>
                            <span className="shrink-0 scale-75 opacity-80">{getStatusIcon(a.status)}</span>
                         </div>
                         <p className="text-[10px] sm:text-xs font-black truncate leading-tight mb-0.5">{getPatientName(a.patient_id)}</p>
                         <div className="mt-auto flex items-center justify-between gap-1 opacity-60 text-[8px] font-black uppercase tracking-tighter">
                            <p className="truncate">Sessão {a.package_consumed ? 'Pacote' : 'Avulsa'}</p>
                         </div>
                      </div>
                    );
                  })}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );

  const renderMonth = () => {
    const y = currentDate.getFullYear();
    const m = currentDate.getMonth();
    const firstDay = new Date(y, m, 1).getDay();
    const daysInMonth = new Date(y, m + 1, 0).getDate();
    
    // Convert firstDay (0=Sun) to start on Mon (0=Mon)
    const offset = firstDay === 0 ? 6 : firstDay - 1;
    
    return (
      <div className="flex-1 flex flex-col overflow-hidden">
        <div className="grid grid-cols-7 border-b border-inherit">
          {['Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb', 'Dom'].map(d => (
            <div key={d} className="py-3 text-center text-[10px] font-black text-slate-400 uppercase tracking-widest bg-slate-50/50 dark:bg-slate-900/50">
              {d}
            </div>
          ))}
        </div>
        <div className="flex-1 overflow-y-auto">
          <div className="grid grid-cols-7 min-h-full">
            {Array.from({ length: offset }).map((_, i) => (
              <div key={`empty-${i}`} className="border-r border-b border-inherit bg-slate-50/20 dark:bg-slate-900/20 opacity-50"></div>
            ))}
            {Array.from({ length: daysInMonth }).map((_, i) => {
              const day = i + 1;
              const dateStr = `${y}-${String(m + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
              const dayAppointments = getAppointmentsForDay(dateStr);
              const isToday = dateStr === new Date().toISOString().split('T')[0];
              
              return (
                <div key={day} 
                  onClick={() => onAddClick(dateStr)}
                  className={cn(
                  "border-r border-b border-inherit p-2 min-h-[120px] transition-colors group relative cursor-pointer",
                  isToday ? theme === 'light' ? "bg-blue-50/30" : "bg-blue-900/10" : "hover:bg-slate-50/50 dark:hover:bg-slate-800/30"
                )}>
                  <div className="flex items-center justify-between mb-2">
                    <span className={cn(
                      "w-7 h-7 rounded-full flex items-center justify-center text-xs font-black",
                      isToday ? "bg-blue-500 text-white shadow-md shadow-blue-500/20" : "text-slate-400"
                    )}>
                      {day}
                    </span>
                    {dayAppointments.length > 0 && (
                      <span className="text-[10px] font-bold text-blue-500 bg-blue-50 dark:bg-blue-900/40 px-1.5 py-0.5 rounded-full">
                        {dayAppointments.length} at.
                      </span>
                    )}
                  </div>
                  
                  <div className="space-y-1">
                    {dayAppointments.slice(0, 3).map(a => (
                      <div 
                        key={a.id} 
                        onClick={(e) => {
                          e.stopPropagation();
                          onEditClick(a);
                        }}
                        className={cn(
                          "px-2 py-1 rounded-md text-[10px] font-bold truncate flex items-center gap-1.5 border-l-4",
                          theme === 'light' ? "bg-white shadow-sm border-blue-400" : "bg-slate-800 border-blue-500"
                        )}
                      >
                         <span className="shrink-0">{getStatusIcon(a.status)}</span>
                         <span className="truncate">{getPatientName(a.patient_id)}</span>
                      </div>
                    ))}
                    {dayAppointments.length > 3 && (
                      <p className="text-[10px] font-bold text-slate-400 text-center">+ {dayAppointments.length - 3} outros</p>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="h-full flex flex-col space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-500">
      <div className="flex flex-col md:flex-row items-center justify-between gap-6 pb-2">
        <div className="flex flex-col sm:flex-row items-center gap-4 w-full md:w-auto">
          <div className="flex bg-slate-100 dark:bg-slate-800 p-1 rounded-2xl shadow-inner border border-slate-200 dark:border-slate-700">
            <button 
              onClick={() => setView('week')}
              className={cn(
                "px-6 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all",
                view === 'week' 
                  ? "bg-white dark:bg-slate-700 text-blue-600 shadow-xl"
                  : "text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
              )}
            >
              Semana
            </button>
            <button 
              onClick={() => setView('month')}
              className={cn(
                "px-6 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all",
                view === 'month' 
                  ? "bg-white dark:bg-slate-700 text-blue-600 shadow-xl"
                  : "text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
              )}
            >
              Mês
            </button>
          </div>

          <div className="flex items-center gap-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-1 shadow-sm">
            <button 
              onClick={() => {
                const d = new Date(currentDate);
                if (view === 'month') d.setMonth(d.getMonth() - 1);
                else d.setDate(d.getDate() - 7);
                setCurrentDate(d);
              }}
              className="p-2 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-400 transition-colors"
            >
              <ChevronLeft size={20} />
            </button>
            <h3 className={cn("text-sm font-black min-w-44 text-center uppercase tracking-widest", theme === 'light' ? "text-slate-700" : "text-slate-200")}>
              {currentDate.toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' })}
            </h3>
            <button 
              onClick={() => {
                const d = new Date(currentDate);
                if (view === 'month') d.setMonth(d.getMonth() + 1);
                else d.setDate(d.getDate() + 7);
                setCurrentDate(d);
              }}
              className="p-2 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-400 transition-colors"
            >
              <ChevronRight size={20} />
            </button>
          </div>
        </div>

        <div className="flex items-center gap-3 w-full md:w-auto">
           <button className={cn(
            "p-3 rounded-2xl border transition-all hover:scale-105 active:scale-95",
            theme === 'light' ? "bg-white border-slate-200 text-slate-600 hover:bg-slate-50 shadow-sm" : "bg-slate-800 border-slate-800 text-slate-400 hover:bg-slate-700"
          )}>
            <Filter size={20} />
          </button>
          <button 
            onClick={() => onAddClick()}
            className="flex-1 sm:flex-none px-6 py-3.5 bg-gradient-to-br from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white rounded-2xl font-black text-[10px] uppercase tracking-[0.2em] shadow-xl shadow-blue-500/30 flex items-center justify-center gap-2 transition-all hover:scale-[1.02] active:scale-95"
          >
            <Plus size={18} /> Novo Agendamento
          </button>
        </div>
      </div>

      <div className={cn(
        "flex-1 rounded-[48px] shadow-2xl border overflow-hidden flex flex-col",
        theme === 'light' ? "bg-white border-slate-100 shadow-slate-200/60" : "bg-slate-900 border-slate-800 shadow-black/60"
      )}>
        {view === 'week' ? renderWeek() : renderMonth()}
      </div>
    </div>
  );
}
