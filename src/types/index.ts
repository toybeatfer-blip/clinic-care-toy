export type Gender = 'Masculino' | 'Femenino' | 'Otro';

export interface IdentificationData {
  nombres: string;
  apellidoPaterno: string;
  apellidoMaterno: string;
  fechaNacimiento: string;
  edad: string;
  sexo: Gender;
  estadoNacimiento: string;
  nacionalidad: string;
  curp: string;
  rfc: string;
  // Domicilio
  codigoPostal: string;
  estado: string;
  municipio: string;
  localidad: string;
  colonia: string;
  calle: string;
  numeroExt: string;
  numeroInt: string;
  // Contacto
  telefonoCelular: string;
  correoElectronico: string;
  // Antecedentes
  antecedentesHeredofamiliares: string;
  antecedentesPersonalesPatologicos: string;
  farmacodependencias: string;
  tabaquismo: string;
  alcoholismo: string;
  alergias: string;
  inmunizaciones: 'Completas' | 'Incompletas' | string;
}

export interface VitalSigns {
  temp: string;
  taSistolica: string;
  taDiastolica: string;
  taPediatricaBadge: string;
  fc: string;
  fr: string;
  satO2: string; // % saturación de oxígeno
  peso: string;
  talla: string;
  imc: string;
  glucosa?: string;
}

export interface PhysicalExam {
  habitusExterior: string;
  cabezaCuello: string;
  torax: string;
  abdomen: string;
  miembros: string;
  genitales: string;
}

export interface PrescriptionItem {
  id: string;
  producto: string;
  marcaInstitucional?: 'ALMUS' | 'GENÉRICO' | 'PATENTE' | 'OTRO';
  cantidad: string;
  via: 'Oral' | 'Intramuscular' | 'Intravenosa' | 'Tópica' | 'Oftálmica' | 'Ótica' | 'Nasal' | 'Sublingual' | 'Inhalatoria' | 'Rectal';
  dosis: string;
  periodicidad: string;
  indicacionesAdicionales?: string;
}

export interface HistoryCheckupData {
  padecimientoActual: string;
  interrogatorioAparatos: string;
  vitalSigns: VitalSigns;
  physicalExam: PhysicalExam;
  diagnosticoCie10: string;
  diagnosticoSecundario?: string;
  pronostico: string;
  indicacionTerapeutica: string;
  prescripcion: PrescriptionItem[];
}

export interface EvolutionNoteData {
  diagnosticoSeguimiento: string;
  evolucionCuadroClinico: string;
  exploracionFisicaDirigida: string;
  diagnosticoActualizado: string;
  planTerapeutico: string;
  vitalSigns: VitalSigns;
}

export interface ProcedureData {
  procedimientoRealizado: string;
  tipoProcedimiento: 'Inyección Intramuscular' | 'Curación / Lavado' | 'Retiro de Puntos' | 'Somatometría / Glucosa' | 'Otro';
  observacionesObligatorias: string;
  farmacoAdministrado?: string;
  presentacionDosis?: string;
  zonaAplicacion?: string;
  cifrasNumericas?: string;
  leyendaTestigos: string;
}

export interface ClinicalRecord {
  id: string;
  ticketFolio?: string;
  createdAt: string;
  updatedAt: string;
  identification: IdentificationData;
  historyCheckup: HistoryCheckupData;
  evolutionNote: EvolutionNoteData;
  procedure: ProcedureData;
  activeModule: 'modulo1' | 'modulo2' | 'modulo3' | 'modulo4';
}

export interface DoctorSettings {
  doctorName: string;
  prefix: 'Dr.' | 'Dra.' | 'Médico';
  cedulaGeneral: string;
  cedulaEspecialidad?: string;
  especialidad: string;
  universidad: string;
  telefonoContacto: string;
  correoContacto: string;
  nombreClinica: string;
  sucursal: string;
  direccionClinica: string;
  telefonoClinica: string;
  logoUrl: string;
  primaryColor: 'sky' | 'emerald' | 'blue' | 'indigo' | 'purple' | 'teal' | 'rose';
}

export type LicenseStatus = 'active' | 'suspended' | 'expired';

export interface ClinicAccount {
  id: string;
  clinicName: string;
  username: string;
  passwordPlain: string;
  doctorName: string;
  prefix: 'Dr.' | 'Dra.' | 'Médico';
  cedulaGeneral: string;
  cedulaEspecialidad?: string;
  especialidad: string;
  universidad: string;
  telefono: string;
  correo: string;
  direccion: string;
  sucursal: string;
  logoUrl?: string;
  primaryColor: 'sky' | 'emerald' | 'blue' | 'indigo' | 'purple' | 'teal' | 'rose';
  createdAt: string;
  lastLoginAt: string;
  licenseStatus: LicenseStatus;
  licenseValidUntil: string; // Fecha YYYY-MM-DD
  notes?: string;
}

export interface AdminContactInfo {
  adminName: string;
  phoneWhatsApp: string;
  email: string;
  helpMessage: string;
}

export interface SessionUser {
  type: 'superadmin' | 'clinic';
  clinicId?: string;
  username: string;
  clinicAccount?: ClinicAccount;
}

export interface Cie10Item {
  code: string;
  name: string;
  category: string;
  frequent?: boolean;
}

export interface InstitutionalMed {
  name: string;
  substance: string;
  brand: 'ALMUS' | 'GENÉRICO' | 'PATENTE';
  presentation: string;
  category: string;
  isControlledWeight?: boolean;
  defaultDose?: string;
}
