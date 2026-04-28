import { useState, useEffect } from 'react';
import { supabaseService } from '../services/supabaseService.ts';
import { supabase } from '../lib/supabase.ts';
import { User } from '@supabase/supabase-js';
import { 
  Patient, 
  Appointment, 
  Service, 
  HealthInsurance, 
  SessionPackage, 
  Anamnese, 
  ClinicalEvolution, 
  PatientDocument,
  ScheduleSettings,
  AppointmentStatus
} from '../types.ts';

export function useFemicState() {
  const [patients, setPatients] = useState<Patient[]>([]);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [services, setServices] = useState<Service[]>([]);
  const [payers, setPayers] = useState<HealthInsurance[]>([]);
  const [packages, setPackages] = useState<SessionPackage[]>([]);
  const [anamneses, setAnamneses] = useState<Anamnese[]>([]);
  const [evolutions, setEvolutions] = useState<ClinicalEvolution[]>([]);
  const [documents, setDocuments] = useState<PatientDocument[]>([]);
  const [settings, setSettings] = useState<ScheduleSettings | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      setIsLoading(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
      if (!session?.user) {
        setPatients([]);
        setAppointments([]);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  useEffect(() => {
    if (!user) return;

    setIsLoading(true);

    const unsubPatients = supabaseService.subscribe<Patient>('patients', setPatients);
    const unsubAppointments = supabaseService.subscribe<Appointment>('appointments', setAppointments);
    const unsubServices = supabaseService.subscribe<Service>('services', setServices);
    const unsubPayers = supabaseService.subscribe<HealthInsurance>('payers', setPayers);
    const unsubAnamneses = supabaseService.subscribe<Anamnese>('anamneses', setAnamneses);
    const unsubPackages = supabaseService.subscribe<SessionPackage>('packages', setPackages);
    const unsubSettings = supabaseService.subscribe<ScheduleSettings>('settings', (s) => setSettings(s[0] || null));
    const unsubEvolutions = supabaseService.subscribe<ClinicalEvolution>('evolutions', setEvolutions);
    const unsubDocuments = supabaseService.subscribe<PatientDocument>('documents', setDocuments);

    setIsLoading(false);

    return () => {
      unsubPatients();
      unsubAppointments();
      unsubServices();
      unsubPayers();
      unsubAnamneses();
      unsubPackages();
      unsubSettings();
      unsubEvolutions();
      unsubDocuments();
    };
  }, [user]);

  // Wrapper functions for mutations
  const addPatient = (patient: Omit<Patient, 'id' | 'userId'>) => supabaseService.create('patients', patient);
  const updatePatient = (id: string, data: Partial<Patient>) => supabaseService.update('patients', id, data);
  const deletePatient = (id: string) => supabaseService.delete('patients', id);

  const addAppointment = (appt: Omit<Appointment, 'id' | 'userId' | 'created_at'>) => supabaseService.create('appointments', appt);
  const deleteAppointment = (id: string) => supabaseService.delete('appointments', id);

  const findPackage = (patientId: string, serviceId: string) => {
    return packages.find(p => p.patient_id === patientId && p.service_id === serviceId && p.active);
  };

  const updateAppointmentStatus = async (appointmentId: string, newStatus: AppointmentStatus) => {
    const appt = appointments.find(a => a.id === appointmentId);
    if (!appt) return;

    const oldStatus = appt.status;
    if (oldStatus === newStatus) return;

    // Logic for Concluido (Consume package)
    if (newStatus === AppointmentStatus.CONCLUIDO && !appt.package_consumed) {
      const pkg = findPackage(appt.patient_id, appt.service_id);
      if (pkg && pkg.remaining_sessions > 0) {
        await supabaseService.update('packages', pkg.id, {
          remaining_sessions: pkg.remaining_sessions - 1
        });
        await supabaseService.update('appointments', appt.id, {
          status: newStatus,
          package_consumed: true,
          session_package_id: pkg.id
        });
        return;
      }
    }

    // Logic for Reverting Concluido (Refund package)
    if (oldStatus === AppointmentStatus.CONCLUIDO && appt.package_consumed && newStatus !== AppointmentStatus.CONCLUIDO) {
      const pkgId = appt.session_package_id;
      if (pkgId) {
        const pkg = packages.find(p => p.id === pkgId);
        if (pkg) {
          await supabaseService.update('packages', pkg.id, {
            remaining_sessions: pkg.remaining_sessions + 1
          });
        }
      }
      await supabaseService.update('appointments', appt.id, {
        status: newStatus,
        package_consumed: false,
        session_package_id: null
      });
      return;
    }

    // Standard update
    await supabaseService.update('appointments', appt.id, { status: newStatus });
  };

  return {
    patients, setPatients,
    appointments, setAppointments,
    services, setServices,
    payers, setPayers,
    packages, setPackages,
    anamneses, setAnamneses,
    evolutions, setEvolutions,
    documents, setDocuments,
    settings, setSettings,
    isLoading,
    user,
    // Helper mutations
    addPatient,
    updatePatient,
    deletePatient,
    addAppointment,
    deleteAppointment,
    updateAppointmentStatus
  };
}
