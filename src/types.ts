export enum AppointmentStatus {
  AGENDADO = 'agendado',
  CONFIRMADO = 'confirmado',
  CONCLUIDO = 'concluido',
  CANCELADO = 'cancelado',
}

export enum ServiceMode {
  GRUPO = 'grupo',
  INDIVIDUAL = 'individual',
}

export interface Patient {
  id: string;
  name: string;
  pathology?: string;
  whatsapp: string;
  archived: boolean;
  archived_at?: string;
  created_at: string;
}

export interface Service {
  id: string;
  name: string;
  health_insurance_id?: string | null;
  price: number;
  duration_minutes: number;
  appointment_mode: ServiceMode;
  max_patients: number;
  active: boolean;
}

export interface HealthInsurance {
  id: string;
  name: string;
  active: boolean;
}

export interface Appointment {
  id: string;
  patient_id: string;
  service_id: string;
  appointment_date: string;
  start_time: string;
  end_time: string;
  status: AppointmentStatus;
  notes?: string;
  service_price_at_time?: number;
  package_consumed?: boolean;
  session_package_id?: string | null;
  created_at: string;
}

export interface ScheduleSettings {
  id?: string;
  start_time: string;
  end_time: string;
  working_days: string;
  working_periods: string;
  max_patients_per_slot: number;
  slot_interval_minutes: number;
}

export interface SessionPackage {
  id: string;
  patient_id: string;
  service_id: string;
  total_sessions: number;
  remaining_sessions: number;
  active: boolean;
  created_at: string;
}

export interface Anamnese {
  id: string;
  patient_id: string;
  chief_complaint?: string;
  history?: string;
  diagnosis?: string;
  limitations?: string;
  comorbidities?: string;
  medications?: string;
  goals?: string;
  obs?: string;
  created_at: string;
  updated_at: string;
}

export interface ClinicalEvolution {
  id: string;
  patient_id: string;
  date: string;
  conduct?: string;
  guidance?: string;
  created_at: string;
}

export interface PatientDocument {
  id: string;
  patient_id: string;
  title: string;
  category?: string;
  drive_url: string;
  obs?: string;
  created_at: string;
}
