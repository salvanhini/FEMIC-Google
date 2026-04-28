import { useState, useEffect } from 'react';
import { firebaseService, testConnection } from '../services/firebaseService.ts';
import { auth } from '../lib/firebase.ts';
import { onAuthStateChanged, User } from 'firebase/auth';
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
    testConnection();
    const unsubscribeAuth = onAuthStateChanged(auth, (u) => {
      setUser(u);
      if (!u) {
        setPatients([]);
        setAppointments([]);
        setIsLoading(false);
      }
    });
    return () => unsubscribeAuth();
  }, []);

  useEffect(() => {
    if (!user) return;

    setIsLoading(true);

    const unsubPatients = firebaseService.subscribe<Patient>('patients', setPatients);
    const unsubAppointments = firebaseService.subscribe<Appointment>('appointments', setAppointments);
    const unsubServices = firebaseService.subscribe<Service>('services', setServices);
    const unsubPayers = firebaseService.subscribe<HealthInsurance>('payers', setPayers);
    const unsubAnamneses = firebaseService.subscribe<Anamnese>('anamneses', setAnamneses);
    const unsubPackages = firebaseService.subscribe<SessionPackage>('packages', setPackages);
    const unsubSettings = firebaseService.subscribe<ScheduleSettings>('settings', (s) => setSettings(s[0] || null));

    setIsLoading(false);

    return () => {
      unsubPatients();
      unsubAppointments();
      unsubServices();
      unsubPayers();
      unsubAnamneses();
      unsubPackages();
      unsubSettings();
    };
  }, [user]);

  // Wrapper functions for mutations
  const addPatient = (patient: Omit<Patient, 'id' | 'userId'>) => firebaseService.create('patients', patient);
  const updatePatient = (id: string, data: Partial<Patient>) => firebaseService.update('patients', id, data);
  const deletePatient = (id: string) => firebaseService.delete('patients', id);

  const addAppointment = (appt: Omit<Appointment, 'id' | 'userId' | 'created_at'>) => firebaseService.create('appointments', appt);
  const deleteAppointment = (id: string) => firebaseService.delete('appointments', id);

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
        await firebaseService.update('packages', pkg.id, {
          remaining_sessions: pkg.remaining_sessions - 1
        });
        await firebaseService.update('appointments', appt.id, {
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
          await firebaseService.update('packages', pkg.id, {
            remaining_sessions: pkg.remaining_sessions + 1
          });
        }
      }
      await firebaseService.update('appointments', appt.id, {
        status: newStatus,
        package_consumed: false,
        session_package_id: null
      });
      return;
    }

    // Standard update
    await firebaseService.update('appointments', appt.id, { status: newStatus });
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
