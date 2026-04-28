import React, { useState, useEffect } from 'react';
import { 
  X, 
  Calendar as CalendarIcon, 
  Clock, 
  User, 
  Settings2,
  Trash2,
  Save,
  RotateCcw
} from 'lucide-react';
import { cn } from '../lib/utils.ts';
import { useFemicState } from '../hooks/useFemicState.ts';
import { AppointmentStatus, ServiceMode, Appointment } from '../types.ts';
import { Modal } from './Modal.tsx';

interface AppointmentModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedDate?: string;
  selectedSlot?: string;
  editingAppointment?: Appointment | null;
  theme: 'light' | 'dark';
  state: ReturnType<typeof useFemicState>;
}

export function AppointmentModal({ 
  isOpen, 
  onClose, 
  selectedDate, 
  selectedSlot, 
  editingAppointment,
  theme,
  state 
}: AppointmentModalProps) {
  const [formData, setFormData] = useState({
    patient_id: '',
    service_id: '',
    status: AppointmentStatus.AGENDADO,
    appointment_date: '',
    start_time: '',
    end_time: '',
    price: 0,
    notes: ''
  });

  const [isRecurring, setIsRecurring] = useState(false);
  const [recCount, setRecCount] = useState(4);
  const [recDays, setRecDays] = useState<number[]>([]);
  const [recTimes, setRecTimes] = useState<Record<number, string>>({});

  useEffect(() => {
    if (editingAppointment) {
      setFormData({
        patient_id: editingAppointment.patient_id,
        service_id: editingAppointment.service_id,
        status: editingAppointment.status,
        appointment_date: editingAppointment.appointment_date,
        start_time: editingAppointment.start_time,
        end_time: editingAppointment.end_time,
        price: editingAppointment.service_price_at_time || 0,
        notes: editingAppointment.notes || ''
      });
      setIsRecurring(false);
    } else {
      setFormData({
        patient_id: '',
        service_id: '',
        status: AppointmentStatus.AGENDADO,
        appointment_date: selectedDate || new Date().toISOString().split('T')[0],
        start_time: selectedSlot || '08:00',
        end_time: '',
        price: 0,
        notes: ''
      });
    }
  }, [editingAppointment, selectedDate, selectedSlot, isOpen]);

  const onServiceChange = (serviceId: string) => {
    const service = state.services.find(s => s.id === serviceId);
    if (!service) return;

    const duration = service.duration_minutes || 45;
    const [h, m] = formData.start_time.split(':').map(Number);
    const totalMin = h * 60 + m + duration;
    const endTime = `${String(Math.floor(totalMin / 60)).padStart(2, '0')}:${String(totalMin % 60).padStart(2, '0')}`;

    setFormData(prev => ({
      ...prev,
      service_id: serviceId,
      end_time: endTime,
      price: service.price
    }));
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.patient_id || !formData.service_id) return;

    if (isRecurring && !editingAppointment) {
      await handleSaveRecurring();
    } else if (editingAppointment) {
       await state.updateAppointmentStatus(editingAppointment.id, formData.status);
       // Handle other updates via firebaseService directly if needed or add to state
    } else {
      await state.addAppointment({
        patient_id: formData.patient_id,
        service_id: formData.service_id,
        status: formData.status,
        appointment_date: formData.appointment_date,
        start_time: formData.start_time,
        end_time: formData.end_time,
        service_price_at_time: formData.price,
        notes: formData.notes
      });
    }
    onClose();
  };

  const handleSaveRecurring = async () => {
    if (recDays.length === 0) return;
    
    let created = 0;
    let date = new Date(formData.appointment_date + 'T00:00:00');
    let tries = 0;
    
    while (created < recCount && tries < 370) {
      const dow = date.getDay();
      if (recDays.includes(dow)) {
        const isoDate = date.toISOString().split('T')[0];
        const startTime = recTimes[dow] || formData.start_time;
        
        // Calculate end time for this recurrence
        const service = state.services.find(s => s.id === formData.service_id);
        const duration = service?.duration_minutes || 45;
        const [h, m] = startTime.split(':').map(Number);
        const totalMin = h * 60 + m + duration;
        const endTime = `${String(Math.floor(totalMin / 60)).padStart(2, '0')}:${String(totalMin % 60).padStart(2, '0')}`;

        await state.addAppointment({
          patient_id: formData.patient_id,
          service_id: formData.service_id,
          status: AppointmentStatus.AGENDADO,
          appointment_date: isoDate,
          start_time: startTime,
          end_time: endTime,
          service_price_at_time: formData.price,
          notes: formData.notes
        });
        created++;
      }
      date.setDate(date.getDate() + 1);
      tries++;
    }
  };

  const toggleDay = (day: number) => {
    setRecDays(prev => 
      prev.includes(day) ? prev.filter(d => d !== day) : [...prev, day]
    );
    if (!recTimes[day]) {
      setRecTimes(prev => ({ ...prev, [day]: formData.start_time }));
    }
  };

  return (
    <Modal 
      isOpen={isOpen} 
      onClose={onClose} 
      title={editingAppointment ? 'Editar Agendamento' : 'Novo Agendamento'}
      theme={theme}
      size="lg"
    >
      <form onSubmit={handleSave} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <div className="field">
              <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-1.5 block ml-1">Paciente</label>
              <div className="relative">
                <select
                  required
                  value={formData.patient_id}
                  onChange={(e) => setFormData(prev => ({ ...prev, patient_id: e.target.value }))}
                  className={cn(
                    "w-full appearance-none border-none rounded-xl py-3 px-10 text-sm font-bold shadow-inner focus:ring-2 focus:ring-blue-500",
                    theme === 'light' ? "bg-slate-100 text-slate-800" : "bg-slate-800 text-white"
                  )}
                >
                  <option value="">Selecione um paciente</option>
                  {state.patients.filter(p => !p.archived).map(p => (
                    <option key={p.id} value={p.id}>{p.name}</option>
                  ))}
                </select>
                <User size={16} className="absolute left-3.5 top-3.5 text-slate-400" />
              </div>
            </div>

            <div className="field">
              <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-1.5 block ml-1">Serviço</label>
              <div className="relative">
                <select
                  required
                  value={formData.service_id}
                  onChange={(e) => onServiceChange(e.target.value)}
                  className={cn(
                    "w-full appearance-none border-none rounded-xl py-3 px-10 text-sm font-bold shadow-inner focus:ring-2 focus:ring-blue-500",
                    theme === 'light' ? "bg-slate-100 text-slate-800" : "bg-slate-800 text-white"
                  )}
                >
                  <option value="">Selecione um serviço</option>
                  {state.services.filter(s => s.active).map(s => (
                    <option key={s.id} value={s.id}>{s.name} - {s.duration_minutes}min</option>
                  ))}
                </select>
                <Settings2 size={16} className="absolute left-3.5 top-3.5 text-slate-400" />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="field">
                <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-1.5 block ml-1">Status</label>
                <select
                  value={formData.status}
                  onChange={(e) => setFormData(prev => ({ ...prev, status: e.target.value as AppointmentStatus }))}
                  className={cn(
                    "w-full border-none rounded-xl py-3 px-4 text-sm font-bold shadow-inner focus:ring-2 focus:ring-blue-500",
                    theme === 'light' ? "bg-slate-100 text-slate-800" : "bg-slate-800 text-white"
                  )}
                >
                  <option value={AppointmentStatus.AGENDADO}>Agendado</option>
                  <option value={AppointmentStatus.CONFIRMADO}>Confirmado</option>
                  <option value={AppointmentStatus.CONCLUIDO}>Concluído</option>
                  <option value={AppointmentStatus.CANCELADO}>Cancelado</option>
                </select>
              </div>
              <div className="field">
                <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-1.5 block ml-1">Valor</label>
                <input
                  type="number"
                  value={formData.price}
                  onChange={(e) => setFormData(prev => ({ ...prev, price: Number(e.target.value) }))}
                  className={cn(
                    "w-full border-none rounded-xl py-3 px-4 text-sm font-bold shadow-inner focus:ring-2 focus:ring-blue-500",
                    theme === 'light' ? "bg-slate-100 text-slate-800" : "bg-slate-800 text-white"
                  )}
                />
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <div className="field">
              <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-1.5 block ml-1">Data</label>
              <div className="relative">
                <input
                  type="date"
                  required
                  value={formData.appointment_date}
                  onChange={(e) => setFormData(prev => ({ ...prev, appointment_date: e.target.value }))}
                  className={cn(
                    "w-full border-none rounded-xl py-3 px-10 text-sm font-bold shadow-inner focus:ring-2 focus:ring-blue-500",
                    theme === 'light' ? "bg-slate-100 text-slate-800" : "bg-slate-800 text-white"
                  )}
                />
                <CalendarIcon size={16} className="absolute left-3.5 top-3.5 text-slate-400" />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="field">
                <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-1.5 block ml-1">Início</label>
                <div className="relative">
                  <input
                    type="time"
                    required
                    value={formData.start_time}
                    onChange={(e) => {
                      const newStart = e.target.value;
                      setFormData(prev => ({ ...prev, start_time: newStart }));
                      // Trigger end time recalculation if service is selected
                      if (formData.service_id) onServiceChange(formData.service_id);
                    }}
                    className={cn(
                      "w-full border-none rounded-xl py-3 px-10 text-sm font-bold shadow-inner focus:ring-2 focus:ring-blue-500",
                      theme === 'light' ? "bg-slate-100 text-slate-800" : "bg-slate-800 text-white"
                    )}
                  />
                  <Clock size={16} className="absolute left-3.5 top-3.5 text-slate-400" />
                </div>
              </div>
              <div className="field">
                <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-1.5 block ml-1">Fim</label>
                <input
                  type="time"
                  readOnly
                  value={formData.end_time}
                  className={cn(
                    "w-full border-none rounded-xl py-3 px-4 text-sm font-bold shadow-inner opacity-60",
                    theme === 'light' ? "bg-slate-100 text-slate-500" : "bg-slate-800 text-slate-400"
                  )}
                />
              </div>
            </div>

            <div className="field">
              <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-1.5 block ml-1">Observações</label>
              <textarea
                value={formData.notes}
                onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
                rows={2}
                className={cn(
                  "w-full border-none rounded-xl py-3 px-4 text-sm font-bold shadow-inner focus:ring-2 focus:ring-blue-500 resize-none",
                  theme === 'light' ? "bg-slate-100 text-slate-800" : "bg-slate-800 text-white"
                )}
              />
            </div>
          </div>
        </div>

        {!editingAppointment && (
          <div className={cn(
            "p-6 rounded-[32px] border space-y-4 transition-all",
            isRecurring ? (theme === 'light' ? "bg-blue-50/50 border-blue-100 shadow-lg shadow-blue-100/20" : "bg-blue-900/10 border-blue-900/30") : (theme === 'light' ? "bg-slate-50/50 border-slate-100" : "bg-slate-800/40 border-slate-800")
          )}>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className={cn(
                  "w-10 h-10 rounded-2xl flex items-center justify-center",
                  isRecurring ? "bg-blue-500 text-white" : "bg-slate-200 text-slate-400 dark:bg-slate-800"
                )}>
                  <RotateCcw size={18} />
                </div>
                <div>
                  <h4 className={cn("text-sm font-black uppercase tracking-tight", theme === 'light' ? "text-slate-700" : "text-white")}>Repetir Atendimento</h4>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Criar múltiplas sessões automaticamente</p>
                </div>
              </div>
              <button 
                type="button"
                onClick={() => setIsRecurring(!isRecurring)}
                className={cn(
                  "px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all",
                  isRecurring ? "bg-blue-500 text-white shadow-xl shadow-blue-500/20" : "bg-slate-200 text-slate-500 dark:bg-slate-800"
                )}
              >
                {isRecurring ? 'Ativado' : 'Ativar'}
              </button>
            </div>

            {isRecurring && (
              <div className="animate-in slide-in-from-top-2 duration-300 space-y-6 pt-2">
                <div className="flex items-center gap-4">
                  <div className="flex-1">
                    <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-2 block">Total de Sessões</label>
                    <input 
                      type="number" 
                      min={1} 
                      value={recCount}
                      onChange={(e) => setRecCount(Number(e.target.value))}
                      className={cn(
                        "w-full border-none rounded-xl py-2.5 px-4 text-sm font-black shadow-inner focus:ring-2 focus:ring-blue-500",
                        theme === 'light' ? "bg-white text-slate-800" : "bg-slate-900 text-white"
                      )}
                    />
                  </div>
                  <p className="mt-6 text-[10px] font-bold text-slate-400 uppercase tracking-widest max-w-[200px]">
                    O sistema buscará os próximos dias disponíveis seguindo a regra abaixo.
                  </p>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-7 gap-2">
                  {['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'].map((day, i) => (
                    <div key={i} className="flex flex-col gap-2">
                      <button
                        type="button"
                        onClick={() => toggleDay(i)}
                        className={cn(
                          "py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all border",
                          recDays.includes(i) 
                            ? "bg-blue-500 border-blue-400 text-white shadow-lg shadow-blue-500/20" 
                            : theme === 'light' ? "bg-white border-slate-100 text-slate-400 hover:border-slate-200" : "bg-slate-900 border-slate-800 text-slate-600 hover:border-slate-700"
                        )}
                      >
                        {day}
                      </button>
                      {recDays.includes(i) && (
                        <input 
                          type="time" 
                          value={recTimes[i] || formData.start_time}
                          onChange={(e) => setRecTimes(prev => ({ ...prev, [i]: e.target.value }))}
                          className={cn(
                            "w-full border-none rounded-lg py-1.5 px-2 text-[10px] font-bold shadow-inner focus:ring-2 focus:ring-blue-500 text-center",
                            theme === 'light' ? "bg-white text-slate-700" : "bg-slate-900 text-white"
                          )}
                        />
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        <div className="flex gap-3">
          {editingAppointment && (
            <button 
              type="button"
              onClick={async () => {
                if (confirm('Remover este agendamento?')) {
                  await state.deleteAppointment(editingAppointment.id);
                  onClose();
                }
              }}
              className={cn(
                "p-4 rounded-2xl font-bold text-rose-500 transition-all border border-rose-100 hover:bg-rose-50",
                theme === 'dark' && "border-rose-900/30 hover:bg-rose-900/10"
              )}
            >
              <Trash2 size={20} />
            </button>
          )}
          <button 
            type="button"
            onClick={onClose}
            className={cn(
              "flex-1 py-4 rounded-2xl font-bold text-sm transition-all border",
              theme === 'light' ? "bg-white border-slate-200 text-slate-500" : "bg-slate-800 border-slate-700 text-slate-400"
            )}
          >
            Cancelar
          </button>
          <button 
            type="submit"
            className="flex-[2] py-4 bg-blue-600 text-white rounded-2xl font-bold text-sm shadow-xl shadow-blue-500/20 hover:bg-blue-700 transition-all flex items-center justify-center gap-2"
          >
            <Save size={18} /> {editingAppointment ? 'Salvar Alterações' : 'Confirmar Agendamento'}
          </button>
        </div>
      </form>
    </Modal>
  );
}
