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
  temp: string; // ej. 36.5
  taSistolica: string; // ej. 120
  taDiastolica: string; // ej. 80
  taPediatricaBadge: string; // 'PEDIÁTRICO' | 'INFANTE' | 'MENOR' | ''
  fc: string; // ej. 75
  fr: string; // ej. 18
  satO2: string; // ej. 98 (% saturación de oxígeno)
  peso: string; // ej. 70.5
  talla: string; // ej. 1.70 (metros con punto decimal)
  imc: string; // calculado
  glucosa?: string;
}

export interface PhysicalExam {
  habitusExterior: string;
  cabezaCuello: string;
  torax: string;
  abdomen: string;
  miembros: string;
  genitales: string; // "Diferido" o "No explorado"
}

export interface PrescriptionItem {
  id: string;
  producto: string;
  marcaInstitucional?: 'ALMUS' | 'GENÉRICO' | 'PATENTE' | 'OTRO';
  cantidad: string; // ej. 1 caja, 2 piezas
  via: 'Oral' | 'Intramuscular' | 'Intravenosa' | 'Tópica' | 'Oftálmica' | 'Ótica' | 'Nasal' | 'Sublingual' | 'Inhalatoria' | 'Rectal';
  dosis: string; // ej. 500 mg cada 8 horas
  periodicidad: string; // ej. Tomar 1 tableta cada 8 horas por 7 días
  indicacionesAdicionales?: string;
}

export interface HistoryCheckupData {
  padecimientoActual: string;
  interrogatorioAparatos: string; // debe terminar con "...resto del interrogatorio negado."
  vitalSigns: VitalSigns;
  physicalExam: PhysicalExam;
  diagnosticoCie10: string; // ej. "J00X - Rinofaringitis aguda [resfriado común]"
  diagnosticoSecundario?: string;
  pronostico: string; // "Favorable para la vida y función" | "Reservado a evolución"
  indicacionTerapeutica: string; // higiénico dietéticas, alarma, cita abierta/revaloración
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
  leyendaTestigos: string; // "Se cuenta con firma de consentimiento informado por paciente y testigo" | "No se cuenta con un segundo testigo"
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
  // Consultorio / Clinica
  nombreClinica: string;
  sucursal: string;
  direccionClinica: string;
  telefonoClinica: string;
  // Logo
  logoUrl: string; // base64 or URL
  // Theme
  primaryColor: 'sky' | 'emerald' | 'blue' | 'indigo' | 'purple' | 'teal' | 'rose';
}

export type LicenseStatus = 'active' | 'suspended' | 'expired';

export interface ClinicAccount {
  id: string;
  clinicName: string;
  username: string; // único
  passwordPlain: string; // clave del consultorio
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
  licenseValidUntil: string; // "Indefinida" o fecha YYYY-MM-DD
  notes?: string;
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
  isControlledWeight?: boolean; // Requiere IMC > 25
  defaultDose?: string;
}
