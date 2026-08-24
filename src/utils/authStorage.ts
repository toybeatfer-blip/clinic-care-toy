import { ClinicAccount, SessionUser, ClinicalRecord, DoctorSettings, LicenseStatus, AdminContactInfo } from '../types';

export const SUPERADMIN_USER = 'Fernando01';
export const SUPERADMIN_PASS = 'Bazzoka1313AS.';

const MASTER_CLINICS_KEY = 'clinic_care_clinics_master_v2';
const SESSION_KEY = 'clinic_care_session_v2';
const ADMIN_CONTACT_KEY = 'clinic_care_admin_contact_v2';
export const ADMIN_CONTACT_EVENT = 'clinic_care_admin_contact_updated_v2';

// 1. DATOS DE CONTACTO DEL ADMINISTRADOR
export function getAdminContactInfo(): AdminContactInfo {
  try {
    const raw = localStorage.getItem(ADMIN_CONTACT_KEY);
    if (raw) return JSON.parse(raw);
  } catch (e) {
    console.error('Error loading admin contact info', e);
  }
  return {
    adminName: 'Fernando (Super Administrador)',
    phoneWhatsApp: '55 1234 5678',
    email: 'toybeatfer@gmail.com',
    helpMessage: 'Para renovar tu licencia mensual o resolver dudas sobre tu cuenta de consultorio, comunícate directamente con el administrador del sistema.'
  };
}

export function saveAdminContactInfo(info: AdminContactInfo): void {
  try {
    localStorage.setItem(ADMIN_CONTACT_KEY, JSON.stringify(info));
    // Disparar evento para actualización en tiempo real en toda la aplicación
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent(ADMIN_CONTACT_EVENT, { detail: info }));
    }
  } catch (e) {
    console.error('Error saving admin contact info', e);
  }
}

// 2. GESTIÓN DE VENCIMIENTO Y DÍAS RESTANTES (1 MES DE DURACIÓN)
export function getDaysRemaining(validUntil: string): { days: number; isExpired: boolean; label: string } {
  if (!validUntil || validUntil === 'Indefinida') {
    return { days: 9999, isExpired: false, label: 'Licencia Permanente' };
  }

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const [year, month, day] = validUntil.split('-').map(Number);
  const expDate = new Date(year, month - 1, day, 23, 59, 59);

  const diffTime = expDate.getTime() - today.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

  if (diffDays <= 0) {
    return { days: diffDays, isExpired: true, label: `Vencida (${Math.abs(diffDays)} días)` };
  }

  return { days: diffDays, isExpired: false, label: `${diffDays} día${diffDays > 1 ? 's' : ''} restante${diffDays > 1 ? 's' : ''}` };
}

// 3. GESTIÓN DE SESIÓN
export function getCurrentSession(): SessionUser | null {
  try {
    const raw = localStorage.getItem(SESSION_KEY);
    if (!raw) return null;
    return JSON.parse(raw);
  } catch (e) {
    console.error('Error reading session', e);
    return null;
  }
}

export function saveSession(session: SessionUser): void {
  try {
    localStorage.setItem(SESSION_KEY, JSON.stringify(session));
  } catch (e) {
    console.error('Error saving session', e);
  }
}

export function clearSession(): void {
  try {
    localStorage.removeItem(SESSION_KEY);
  } catch (e) {
    console.error('Error clearing session', e);
  }
}

// 4. REGISTRO MAESTRO DE CONSULTORIOS (DURACIÓN DE 1 MES)
export function getAllClinics(): ClinicAccount[] {
  try {
    const raw = localStorage.getItem(MASTER_CLINICS_KEY);
    if (!raw) return [];
    const list: ClinicAccount[] = JSON.parse(raw);
    
    // Auto-evaluar vencimientos al listar
    return list.map(c => {
      const remaining = getDaysRemaining(c.licenseValidUntil);
      if (remaining.isExpired && c.licenseStatus === 'active') {
        return { ...c, licenseStatus: 'expired' };
      }
      return c;
    });
  } catch (e) {
    console.error('Error loading clinics', e);
    return [];
  }
}

export function saveAllClinics(clinics: ClinicAccount[]): void {
  try {
    localStorage.setItem(MASTER_CLINICS_KEY, JSON.stringify(clinics));
  } catch (e) {
    console.error('Error saving clinics', e);
  }
}

export function registerClinic(data: Omit<ClinicAccount, 'id' | 'createdAt' | 'lastLoginAt' | 'licenseStatus' | 'licenseValidUntil'>): { success: boolean; clinic?: ClinicAccount; error?: string } {
  const clinics = getAllClinics();
  const normalizedUser = data.username.trim().toLowerCase();

  if (normalizedUser === SUPERADMIN_USER.toLowerCase()) {
    return { success: false, error: 'El nombre de usuario no está disponible.' };
  }

  const existing = clinics.find(c => c.username.trim().toLowerCase() === normalizedUser);
  if (existing) {
    return { success: false, error: `El usuario "${data.username}" ya está registrado en otro consultorio.` };
  }

  // Duración inicial de exactamente 1 mes (30 días)
  const expDate = new Date();
  expDate.setDate(expDate.getDate() + 30);
  const validUntilStr = expDate.toISOString().slice(0, 10);

  const newClinic: ClinicAccount = {
    ...data,
    id: crypto.randomUUID ? crypto.randomUUID() : `clinic_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`,
    username: data.username.trim(),
    createdAt: new Date().toISOString(),
    lastLoginAt: new Date().toISOString(),
    licenseStatus: 'active',
    licenseValidUntil: validUntilStr
  };

  const updatedClinics = [newClinic, ...clinics];
  saveAllClinics(updatedClinics);

  // Inicializar base de datos del consultorio vacía y configuración
  initClinicDatabase(newClinic);

  return { success: true, clinic: newClinic };
}

export function updateClinic(clinicId: string, updates: Partial<ClinicAccount>): ClinicAccount[] {
  const clinics = getAllClinics();
  const next = clinics.map(c => {
    if (c.id === clinicId) {
      return { ...c, ...updates };
    }
    return c;
  });
  saveAllClinics(next);

  const currentSession = getCurrentSession();
  if (currentSession && currentSession.clinicId === clinicId) {
    const updatedAccount = next.find(c => c.id === clinicId);
    if (updatedAccount) {
      saveSession({
        ...currentSession,
        clinicAccount: updatedAccount
      });
    }
  }

  return next;
}

export function deleteClinic(clinicId: string): ClinicAccount[] {
  const clinics = getAllClinics();
  const filtered = clinics.filter(c => c.id !== clinicId);
  saveAllClinics(filtered);

  try {
    localStorage.removeItem(`clinic_care_records_clinic_${clinicId}_v2`);
    localStorage.removeItem(`clinic_care_settings_clinic_${clinicId}_v2`);
    localStorage.removeItem(`clinic_care_active_record_clinic_${clinicId}_v2`);
  } catch (e) {
    console.error('Error deleting clinic DB', e);
  }

  return filtered;
}

export function setClinicLicense(clinicId: string, status: LicenseStatus, validUntil?: string): ClinicAccount[] {
  return updateClinic(clinicId, {
    licenseStatus: status,
    ...(validUntil ? { licenseValidUntil: validUntil } : {})
  });
}

// Renovar licencia agregando días (por ejemplo 30 días para 1 mes más)
export function renewClinicLicense(clinicId: string, daysToAdd: number = 30): ClinicAccount[] {
  const clinics = getAllClinics();
  const target = clinics.find(c => c.id === clinicId);
  if (!target) return clinics;

  let baseDate = new Date();
  if (target.licenseValidUntil && target.licenseValidUntil !== 'Indefinida') {
    const currentExp = new Date(target.licenseValidUntil + 'T23:59:59');
    if (currentExp > baseDate) {
      baseDate = currentExp;
    }
  }

  baseDate.setDate(baseDate.getDate() + daysToAdd);
  const newValidUntil = baseDate.toISOString().slice(0, 10);

  return updateClinic(clinicId, {
    licenseStatus: 'active',
    licenseValidUntil: newValidUntil
  });
}

// 5. AUTENTICACIÓN
export function authenticateUser(usernameInput: string, passwordInput: string): { success: boolean; session?: SessionUser; error?: string; isLicenseBlocked?: boolean } {
  const user = usernameInput.trim();
  const pass = passwordInput.trim();

  // Super Admin Check
  if (user.toLowerCase() === SUPERADMIN_USER.toLowerCase() && pass === SUPERADMIN_PASS) {
    const session: SessionUser = {
      type: 'superadmin',
      username: SUPERADMIN_USER
    };
    saveSession(session);
    return { success: true, session };
  }

  // Clinic Check
  const clinics = getAllClinics();
  const found = clinics.find(c => c.username.toLowerCase() === user.toLowerCase());

  if (!found) {
    return { success: false, error: 'Usuario no encontrado. Verifica el usuario o regístrate.' };
  }

  if (found.passwordPlain !== pass) {
    return { success: false, error: 'Contraseña incorrecta para este consultorio.' };
  }

  // Verificar vencimiento de licencia (1 mes)
  const remaining = getDaysRemaining(found.licenseValidUntil);
  if (remaining.isExpired) {
    updateClinic(found.id, { licenseStatus: 'expired' });
    return {
      success: false,
      isLicenseBlocked: true,
      error: `La licencia mensual de este consultorio venció el ${found.licenseValidUntil}. Contacta al administrador para renovarla.`
    };
  }

  if (found.licenseStatus === 'suspended') {
    return {
      success: false,
      isLicenseBlocked: true,
      error: 'Acceso suspendido. La licencia de este consultorio se encuentra inactiva por disposición del administrador.'
    };
  }

  // Actualizar última fecha de inicio de sesión
  updateClinic(found.id, { lastLoginAt: new Date().toISOString() });

  const session: SessionUser = {
    type: 'clinic',
    clinicId: found.id,
    username: found.username,
    clinicAccount: found
  };
  saveSession(session);

  return { success: true, session };
}

// 6. BASES DE DATOS AISLADAS POR CONSULTORIO (TOTALMENTE EN BLANCO)
export function getBlankClinicalRecord(): ClinicalRecord {
  return {
    id: crypto.randomUUID ? crypto.randomUUID() : String(Date.now()),
    ticketFolio: '',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    activeModule: 'modulo1',
    identification: {
      nombres: '',
      apellidoPaterno: '',
      apellidoMaterno: '',
      fechaNacimiento: '',
      edad: '',
      sexo: 'Masculino',
      estadoNacimiento: '',
      nacionalidad: 'Mexicana',
      curp: '',
      rfc: '',
      codigoPostal: '',
      estado: '',
      municipio: '',
      localidad: '',
      colonia: '',
      calle: '',
      numeroExt: '',
      numeroInt: '',
      telefonoCelular: '',
      correoElectronico: '',
      antecedentesHeredofamiliares: '',
      antecedentesPersonalesPatologicos: '',
      farmacodependencias: '',
      tabaquismo: '',
      alcoholismo: '',
      alergias: '',
      inmunizaciones: ''
    },
    historyCheckup: {
      padecimientoActual: '',
      interrogatorioAparatos: '',
      vitalSigns: {
        temp: '',
        taSistolica: '',
        taDiastolica: '',
        taPediatricaBadge: '',
        fc: '',
        fr: '',
        satO2: '',
        peso: '',
        talla: '',
        imc: '',
        glucosa: ''
      },
      physicalExam: {
        habitusExterior: '',
        cabezaCuello: '',
        torax: '',
        abdomen: '',
        miembros: '',
        genitales: 'Diferido'
      },
      diagnosticoCie10: '',
      diagnosticoSecundario: '',
      pronostico: '',
      indicacionTerapeutica: '',
      prescripcion: []
    },
    evolutionNote: {
      diagnosticoSeguimiento: '',
      evolucionCuadroClinico: '',
      exploracionFisicaDirigida: '',
      diagnosticoActualizado: '',
      planTerapeutico: '',
      vitalSigns: {
        temp: '',
        taSistolica: '',
        taDiastolica: '',
        taPediatricaBadge: '',
        fc: '',
        fr: '',
        satO2: '',
        peso: '',
        talla: '',
        imc: '',
        glucosa: ''
      }
    },
    procedure: {
      procedimientoRealizado: '',
      tipoProcedimiento: 'Inyección Intramuscular',
      observacionesObligatorias: '',
      farmacoAdministrado: '',
      presentacionDosis: '',
      zonaAplicacion: '',
      leyendaTestigos: 'Se cuenta con firma de consentimiento informado por paciente y testigo'
    }
  };
}

export function initClinicDatabase(clinic: ClinicAccount): void {
  const recordsKey = `clinic_care_records_clinic_${clinic.id}_v2`;
  const settingsKey = `clinic_care_settings_clinic_${clinic.id}_v2`;

  if (!localStorage.getItem(recordsKey)) {
    localStorage.setItem(recordsKey, JSON.stringify([]));
  }

  const doctorSettings: DoctorSettings = {
    doctorName: clinic.doctorName,
    prefix: clinic.prefix,
    cedulaGeneral: clinic.cedulaGeneral,
    cedulaEspecialidad: clinic.cedulaEspecialidad || '',
    especialidad: clinic.especialidad,
    universidad: clinic.universidad,
    telefonoContacto: clinic.telefono,
    correoContacto: clinic.correo,
    nombreClinica: clinic.clinicName,
    sucursal: clinic.sucursal,
    direccionClinica: clinic.direccion,
    telefonoClinica: clinic.telefono,
    logoUrl: clinic.logoUrl || '',
    primaryColor: clinic.primaryColor || 'sky'
  };

  localStorage.setItem(settingsKey, JSON.stringify(doctorSettings));
}

// 7. OPERACIONES DE BASE DE DATOS DEL CONSULTORIO ACTIVO
export function getClinicRecords(clinicId: string): ClinicalRecord[] {
  try {
    const raw = localStorage.getItem(`clinic_care_records_clinic_${clinicId}_v2`);
    if (!raw) return [];
    return JSON.parse(raw);
  } catch (e) {
    console.error('Error loading clinic records', e);
    return [];
  }
}

export function saveClinicRecord(clinicId: string, record: ClinicalRecord): ClinicalRecord[] {
  try {
    const records = getClinicRecords(clinicId);
    const existingIndex = records.findIndex(r => r.id === record.id);
    const updated = { ...record, updatedAt: new Date().toISOString() };

    let nextList: ClinicalRecord[];
    if (existingIndex >= 0) {
      nextList = [...records];
      nextList[existingIndex] = updated;
    } else {
      nextList = [updated, ...records];
    }

    localStorage.setItem(`clinic_care_records_clinic_${clinicId}_v2`, JSON.stringify(nextList));
    localStorage.setItem(`clinic_care_active_record_clinic_${clinicId}_v2`, JSON.stringify(updated));
    return nextList;
  } catch (e) {
    console.error('Error saving clinic record', e);
    return [];
  }
}

export function deleteClinicRecord(clinicId: string, recordId: string): ClinicalRecord[] {
  try {
    const records = getClinicRecords(clinicId);
    const filtered = records.filter(r => r.id !== recordId);
    localStorage.setItem(`clinic_care_records_clinic_${clinicId}_v2`, JSON.stringify(filtered));
    return filtered;
  } catch (e) {
    console.error('Error deleting record', e);
    return [];
  }
}

export function getClinicSettings(clinicId: string): DoctorSettings {
  try {
    const raw = localStorage.getItem(`clinic_care_settings_clinic_${clinicId}_v2`);
    if (raw) return JSON.parse(raw);
  } catch (e) {
    console.error('Error reading clinic settings', e);
  }
  return {
    doctorName: '',
    prefix: 'Dr.',
    cedulaGeneral: '',
    cedulaEspecialidad: '',
    especialidad: 'Medicina General',
    universidad: '',
    telefonoContacto: '',
    correoContacto: '',
    nombreClinica: '',
    sucursal: '',
    direccionClinica: '',
    telefonoClinica: '',
    logoUrl: '',
    primaryColor: 'sky'
  };
}

export function saveClinicSettings(clinicId: string, settings: DoctorSettings): void {
  try {
    localStorage.setItem(`clinic_care_settings_clinic_${clinicId}_v2`, JSON.stringify(settings));
    updateClinic(clinicId, {
      clinicName: settings.nombreClinica,
      doctorName: settings.doctorName,
      prefix: settings.prefix,
      cedulaGeneral: settings.cedulaGeneral,
      cedulaEspecialidad: settings.cedulaEspecialidad,
      especialidad: settings.especialidad,
      universidad: settings.universidad,
      telefono: settings.telefonoContacto,
      correo: settings.correoContacto,
      direccion: settings.direccionClinica,
      sucursal: settings.sucursal,
      logoUrl: settings.logoUrl,
      primaryColor: settings.primaryColor
    });
  } catch (e) {
    console.error('Error saving clinic settings', e);
  }
}

export function getActiveClinicRecord(clinicId: string): ClinicalRecord {
  try {
    const raw = localStorage.getItem(`clinic_care_active_record_clinic_${clinicId}_v2`);
    if (raw) return JSON.parse(raw);
  } catch (e) {
    console.error('Error reading active record', e);
  }
  return getBlankClinicalRecord();
}
