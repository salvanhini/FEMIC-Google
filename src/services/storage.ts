import { 
  Patient, 
  Service, 
  HealthInsurance, 
  Appointment, 
  SessionPackage, 
  Anamnese, 
  ClinicalEvolution, 
  PatientDocument,
  AppointmentStatus
} from '../types.ts';

const STORAGE_KEYS = {
  PATIENTS: 'femic_patients',
  SERVICES: 'femic_services',
  PAYERS: 'femic_payers',
  APPOINTMENTS: 'femic_appointments',
  PACKAGES: 'femic_packages',
  ANAMNESES: 'femic_anamneses',
  EVOLUTIONS: 'femic_evolutions',
  DOCUMENTS: 'femic_documents',
  CONFIG: 'femic_config',
};

class StorageService {
  private getItem<T>(key: string, defaultValue: T): T {
    try {
      const item = localStorage.getItem(key);
      return item ? JSON.parse(item) : defaultValue;
    } catch (e) {
      console.error(`Error reading ${key} from storage`, e);
      return defaultValue;
    }
  }

  private setItem<T>(key: string, value: T): void {
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch (e) {
      console.error(`Error writing ${key} to storage`, e);
    }
  }

  // Patients
  getPatients(): Patient[] {
    return this.getItem<Patient[]>(STORAGE_KEYS.PATIENTS, []);
  }

  savePatients(patients: Patient[]): void {
    this.setItem(STORAGE_KEYS.PATIENTS, patients);
  }

  // Appointments
  getAppointments(): Appointment[] {
    return this.getItem<Appointment[]>(STORAGE_KEYS.APPOINTMENTS, []);
  }

  saveAppointments(appointments: Appointment[]): void {
    this.setItem(STORAGE_KEYS.APPOINTMENTS, appointments);
  }

  // Services
  getServices(): Service[] {
    return this.getItem<Service[]>(STORAGE_KEYS.SERVICES, []);
  }

  saveServices(services: Service[]): void {
    this.setItem(STORAGE_KEYS.SERVICES, services);
  }

  // Packages
  getPackages(): SessionPackage[] {
    return this.getItem<SessionPackage[]>(STORAGE_KEYS.PACKAGES, []);
  }

  savePackages(pkgs: SessionPackage[]): void {
    this.setItem(STORAGE_KEYS.PACKAGES, pkgs);
  }

  // Anamneses
  getAnamneses(): Anamnese[] {
    return this.getItem<Anamnese[]>(STORAGE_KEYS.ANAMNESES, []);
  }

  saveAnamneses(anamneses: Anamnese[]): void {
    this.setItem(STORAGE_KEYS.ANAMNESES, anamneses);
  }

  // Evolutions
  getEvolutions(): ClinicalEvolution[] {
    return this.getItem<ClinicalEvolution[]>(STORAGE_KEYS.EVOLUTIONS, []);
  }

  saveEvolutions(evolutions: ClinicalEvolution[]): void {
    this.setItem(STORAGE_KEYS.EVOLUTIONS, evolutions);
  }

  // Documents
  getDocuments(): PatientDocument[] {
    return this.getItem<PatientDocument[]>(STORAGE_KEYS.DOCUMENTS, []);
  }

  saveDocuments(docs: PatientDocument[]): void {
    this.setItem(STORAGE_KEYS.DOCUMENTS, docs);
  }

  // Payers
  getPayers(): HealthInsurance[] {
    return this.getItem<HealthInsurance[]>(STORAGE_KEYS.PAYERS, []);
  }

  savePayers(payers: HealthInsurance[]): void {
    this.setItem(STORAGE_KEYS.PAYERS, payers);
  }
}

export const storage = new StorageService();
