import { ClinicAccount, SessionUser, ClinicalRecord, DoctorSettings, LicenseStatus, AdminContactInfo } from '../types';
import { pushClinicsToCloud } from './cloudStorage';
import {
  idbSaveClinics,
  idbGetClinics,
  idbSaveClinicRecords,
  idbGetClinicRecords,
  idbSaveClinicSettings,
  idbGetClinicSettings,
  idbSaveSnapshot,
  requestPersistentStorage
} from './indexedDBStorage';

// Activar persistencia protegida del navegador al iniciar
if (typeof window !== 'undefined') {
  requestPersistentStorage().catch(() => {});
}

export const SUPERADMIN_USER = 'Fernando01';
export const SUPERADMIN_PASS = 'Bazzoka1313AS.';

// Claves de Blindaje Maestro Multi-Capa
const MASTER_CLINICS_KEY = 'clinic_care_clinics_master_v2';
const VAULT_BACKUP_KEY = 'clinic_care_vault_master_backup_v2';
const SESSION_KEY = 'clinic_care_session_v2';
const ADMIN_CONTACT_KEY = 'clinic_care_admin_contact_v2';
const DELETED_CLINICS_KEY = 'clinic_care_deleted_ids_v2';

export const ADMIN_CONTACT_EVENT = 'clinic_care_admin_contact_updated_v2';
export const CLINICS_UPDATED_EVENT = 'clinic_care_clinics_updated_v2';

// Limpieza automática y robusta de caracteres corruptos o doblemente codificados en UTF-8
export function cleanMojibake(str?: string | null): string {
  if (!str || typeof str !== 'string') return '';
  let cleaned = str;
  try {
    if (/[\u00C0-\u00FF]/.test(cleaned)) {
      cleaned = decodeURIComponent(escape(cleaned));
    }
  } catch (e) {}

  return cleaned
    .replace(/Ã¡/g, 'á')
    .replace(/Ã©/g, 'é')
    .replace(/Ã­/g, 'í')
    .replace(/Ã³/g, 'ó')
    .replace(/Ãº/g, 'ú')
    .replace(/Ã±/g, 'ñ')
    .replace(/Ã/g, 'Á')
    .replace(/Ã‰/g, 'É')
    .replace(/Ã/g, 'Í')
    .replace(/Ã“/g, 'Ó')
    .replace(/Ãš/g, 'Ú')
    .replace(/Ã‘/g, 'Ñ')
    .replace(/Cl[ǟ\u01DF\uFFFD]+nica/gi, 'Clínica')
    .replace(/M[ǟ\u01DF\uFFFD]+dica/gi, 'Médica')
    .replace(/Beltr[ǟ\u01DF\uFFFD]+n/gi, 'Beltrán')
    .replace(/M[ǟ\u01DF\uFFFD]+xico/gi, 'México')
    .replace(/comun[ǟ\u01DF\uFFFD]+cate/gi, 'comunícate')
    .trim();
}

// Semilla de consultorios pre-configurados para evitar que la aplicación quede vacía
export const SEED_DEFAULT_CLINICS: ClinicAccount[] = [
  {
    id: 'clinic_seed_central_01',
    clinicName: 'Clínica Médica Familiar y Especialidades',
    username: 'consultorio1',
    passwordPlain: '1234',
    doctorName: 'Fernando Beltrán',
    prefix: 'Dr.',
    cedulaGeneral: '12345678',
    cedulaEspecialidad: 'ESP-987654',
    especialidad: 'Medicina General y Familiar',
    universidad: 'UNAM / Facultad de Medicina',
    telefono: '55 1234 5678',
    correo: 'toybeatfer@gmail.com',
    direccion: 'Av. Insurgentes Sur 1234, Ciudad de México',
    sucursal: 'Matriz Principal',
    logoUrl: '',
    primaryColor: 'sky',
    createdAt: '2026-01-01T00:00:00.000Z',
    updatedAt: '2026-01-01T00:00:00.000Z',
    lastLoginAt: '2026-01-01T00:00:00.000Z',
    licenseStatus: 'active',
    licenseValidUntil: 'Indefinida'
  }
];

export function generateUUID(): string {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    try {
      return crypto.randomUUID();
    } catch (e) {}
  }
  return 'clinic_' + Date.now().toString(36) + '_' + Math.random().toString(36).substring(2, 9);
}

// 0. GESTIÓN DE CONSULTORIOS ELIMINADOS (TOMBSTONES)
export function getDeletedClinicIds(): Set<string> {
  try {
    const raw = localStorage.getItem(DELETED_CLINICS_KEY);
    if (raw) {
      const arr = JSON.parse(raw);
      if (Array.isArray(arr)) {
        return new Set(arr);
      }
    }
  } catch (e) {}
  return new Set();
}

export function addDeletedClinicId(id: string): void {
  try {
    const set = getDeletedClinicIds();
    set.add(id);
    localStorage.setItem(DELETED_CLINICS_KEY, JSON.stringify(Array.from(set)));
  } catch (e) {}
}

// 1. DATOS DE CONTACTO DEL ADMINISTRADOR
export function getAdminContactInfo(): AdminContactInfo {
  try {
    const raw = localStorage.getItem(ADMIN_CONTACT_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (parsed && typeof parsed === 'object') {
        return {
          adminName: cleanMojibake(parsed.adminName) || 'Fernando (Super Administrador)',
          phoneWhatsApp: cleanMojibake(parsed.phoneWhatsApp) || '55 1234 5678',
          email: cleanMojibake(parsed.email) || 'toybeatfer@gmail.com',
          helpMessage: cleanMojibake(parsed.helpMessage) || 'Para renovar tu licencia mensual o resolver dudas sobre tu cuenta de consultorio, comunícate directamente con el administrador del sistema.',
          updatedAt: parsed.updatedAt || '2026-01-01T00:00:00.000Z'
        };
      }
    }
  } catch (e) {
    console.error('Error loading admin contact info', e);
  }
  return {
    adminName: 'Fernando (Super Administrador)',
    phoneWhatsApp: '55 1234 5678',
    email: 'toybeatfer@gmail.com',
    helpMessage: 'Para renovar tu licencia mensual o resolver dudas sobre tu cuenta de consultorio, comunícate directamente con el administrador del sistema.',
    updatedAt: '2026-01-01T00:00:00.000Z'
  };
}

export function saveAdminContactInfo(info: AdminContactInfo, syncToCloud: boolean = true): void {
  try {
    const freshInfo: AdminContactInfo = {
      ...info,
      updatedAt: info.updatedAt || new Date().toISOString()
    };
    localStorage.setItem(ADMIN_CONTACT_KEY, JSON.stringify(freshInfo));
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent(ADMIN_CONTACT_EVENT, { detail: freshInfo }));
    }
    if (syncToCloud) {
      setTimeout(() => pushClinicsToCloud().catch(() => {}), 50);
    }
  } catch (e) {
    console.error('Error saving admin contact info', e);
  }
}

// 2. GESTIÓN DE VENCIMIENTO Y DÍAS RESTANTES (1 MES DE DURACIÓN)
export function getDaysRemaining(validUntil?: string | null): { days: number; isExpired: boolean; label: string } {
  if (!validUntil || validUntil === 'Indefinida' || typeof validUntil !== 'string') {
    return { days: 9999, isExpired: false, label: 'Licencia Permanente' };
  }

  try {
    const parts = validUntil.split('-');
    if (parts.length !== 3) {
      return { days: 9999, isExpired: false, label: 'Licencia Activa' };
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const [year, month, day] = parts.map(Number);
    if (isNaN(year) || isNaN(month) || isNaN(day)) {
      return { days: 9999, isExpired: false, label: 'Licencia Activa' };
    }

    const expDate = new Date(year, month - 1, day, 23, 59, 59);
    const diffTime = expDate.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays <= 0) {
      return { days: diffDays, isExpired: true, label: `Vencida (${Math.abs(diffDays)} días)` };
    }

    return { days: diffDays, isExpired: false, label: `${diffDays} día${diffDays > 1 ? 's' : ''} restante${diffDays > 1 ? 's' : ''}` };
  } catch (err) {
    return { days: 9999, isExpired: false, label: 'Licencia Activa' };
  }
}

// 3. GESTIÓN DE SESIÓN
export function getCurrentSession(): SessionUser | null {
  try {
    const raw = localStorage.getItem(SESSION_KEY);
    if (!raw) return null;
    const session = JSON.parse(raw);
    if (session && typeof session === 'object' && session.type) {
      return session;
    }
    return null;
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

// 4. REGISTRO MAESTRO DE CONSULTORIOS CON BLINDAJE MULTI-CAPA
export function getAllClinics(): ClinicAccount[] {
  try {
    const deletedIds = getDeletedClinicIds();
    const clinicsMap = new Map<string, ClinicAccount>();

    // Capa 1: Cargar de la Clave Principal Actual v2
    const raw = localStorage.getItem(MASTER_CLINICS_KEY);
    if (raw) {
      try {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed)) {
          parsed.forEach((c: any) => {
            if (c && c.id && !deletedIds.has(c.id)) {
              clinicsMap.set(c.id, c);
            }
          });
        }
      } catch (e) {}
    }

    // Capa 2: Cargar de la Bóveda de Respaldo Local (Vault Mirror)
    const rawVault = localStorage.getItem(VAULT_BACKUP_KEY);
    if (rawVault) {
      try {
        const parsedVault = JSON.parse(rawVault);
        if (Array.isArray(parsedVault)) {
          parsedVault.forEach((c: any) => {
            if (c && c.id && !deletedIds.has(c.id) && !clinicsMap.has(c.id)) {
              clinicsMap.set(c.id, c);
            }
          });
        }
      } catch (e) {}
    }

    // Capa 3: Cargar de Claves Históricas (v1, v0, etc.)
    const legacyKeys = ['clinic_care_clinics_master_v1', 'clinic_care_clinics_master', 'clinics_master_v1'];
    legacyKeys.forEach(k => {
      const leg = localStorage.getItem(k);
      if (leg) {
        try {
          const parsed = JSON.parse(leg);
          if (Array.isArray(parsed)) {
            parsed.forEach((c: any) => {
              if (c && c.id && !deletedIds.has(c.id) && !clinicsMap.has(c.id)) {
                clinicsMap.set(c.id, c);
              }
            });
          }
        } catch (e) {}
      }
    });

    // Capa 4: Escanear todas las configuraciones de consultorio individuales en localStorage
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (!key) continue;

      if (key.startsWith('clinic_care_settings_clinic_') || key.startsWith('clinic_care_records_clinic_')) {
        const cId = key.replace('clinic_care_settings_clinic_', '').replace('clinic_care_records_clinic_', '').replace('_v2', '');
        if (cId && !deletedIds.has(cId) && !clinicsMap.has(cId)) {
          try {
            const settingsKey = `clinic_care_settings_clinic_${cId}_v2`;
            const settingsRaw = localStorage.getItem(settingsKey) || localStorage.getItem(`clinic_care_settings_clinic_${cId}`);
            let s: any = {};
            if (settingsRaw) {
              s = JSON.parse(settingsRaw);
            }

            const recovered: ClinicAccount = {
              id: cId,
              clinicName: s.nombreClinica || `Consultorio ${cId.substring(0, 8)}`,
              username: s.username || `consultorio_${cId.substring(0, 6)}`,
              passwordPlain: s.passwordPlain || '1234',
              doctorName: s.doctorName || 'Médico Responsable',
              prefix: s.prefix || 'Dr.',
              cedulaGeneral: s.cedulaGeneral || '',
              cedulaEspecialidad: s.cedulaEspecialidad || '',
              especialidad: s.especialidad || 'Medicina General',
              universidad: s.universidad || '',
              telefono: s.telefonoContacto || '',
              correo: s.correoContacto || '',
              direccion: s.direccionClinica || '',
              sucursal: s.sucursal || '',
              logoUrl: s.logoUrl || '',
              primaryColor: s.primaryColor || 'sky',
              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString(),
              lastLoginAt: new Date().toISOString(),
              licenseStatus: 'active',
              licenseValidUntil: 'Indefinida'
            };
            clinicsMap.set(cId, recovered);
          } catch (e) {}
        }
      }
    }

    // Capa 5: Si está completamente vacío, inicializar con las clínicas semilla por defecto
    if (clinicsMap.size === 0) {
      SEED_DEFAULT_CLINICS.forEach(seed => {
        if (!deletedIds.has(seed.id)) {
          clinicsMap.set(seed.id, seed);
          initClinicDatabase(seed);
        }
      });
      const initialList = Array.from(clinicsMap.values());
      localStorage.setItem(MASTER_CLINICS_KEY, JSON.stringify(initialList));
      localStorage.setItem(VAULT_BACKUP_KEY, JSON.stringify(initialList));
      idbSaveClinics(initialList).catch(() => {});
    }

    const list = Array.from(clinicsMap.values());
    
    return list.map((c: any) => {
      const remaining = getDaysRemaining(c.licenseValidUntil);
      const isExpired = remaining.isExpired;

      let docName = cleanMojibake(c.doctorName);
      let cName = cleanMojibake(c.clinicName);
      let prefix = c.prefix || 'Dr.';
      let esp = cleanMojibake(c.especialidad) || 'Medicina General';
      let cedGen = cleanMojibake(c.cedulaGeneral);
      let cedEsp = cleanMojibake(c.cedulaEspecialidad);
      let uni = cleanMojibake(c.universidad);
      let tel = cleanMojibake(c.telefono);
      let mail = cleanMojibake(c.correo);
      let dir = cleanMojibake(c.direccion);
      let suc = cleanMojibake(c.sucursal);

      // Si falta doctorName, clinicName o cedula, intentar recuperarlos de settings individuales
      if ((!docName || !cName || !cedGen) && c.id) {
        try {
          const sRaw = localStorage.getItem(`clinic_care_settings_clinic_${c.id}_v2`) || localStorage.getItem(`clinic_care_settings_clinic_${c.id}`);
          if (sRaw) {
            const s = JSON.parse(sRaw);
            if (!docName && s.doctorName) docName = cleanMojibake(s.doctorName);
            if (!cName && s.nombreClinica) cName = cleanMojibake(s.nombreClinica);
            if (!cedGen && s.cedulaGeneral) cedGen = cleanMojibake(s.cedulaGeneral);
            if (!cedEsp && s.cedulaEspecialidad) cedEsp = cleanMojibake(s.cedulaEspecialidad);
            if ((!esp || esp === 'Medicina General') && s.especialidad) esp = cleanMojibake(s.especialidad);
            if (!uni && s.universidad) uni = cleanMojibake(s.universidad);
            if (!tel && (s.telefonoContacto || s.telefonoClinica)) tel = cleanMojibake(s.telefonoContacto || s.telefonoClinica);
            if (!mail && s.correoContacto) mail = cleanMojibake(s.correoContacto);
            if (!dir && s.direccionClinica) dir = cleanMojibake(s.direccionClinica);
            if (!suc && s.sucursal) suc = cleanMojibake(s.sucursal);
          }
        } catch (e) {}
      }

      return {
        id: c.id || generateUUID(),
        clinicName: cName || 'Consultorio Médico',
        username: (c.username || '').trim(),
        passwordPlain: (c.passwordPlain || '').trim(),
        doctorName: docName || 'Médico Responsable',
        prefix,
        cedulaGeneral: cedGen,
        cedulaEspecialidad: cedEsp,
        especialidad: esp,
        universidad: uni,
        telefono: tel,
        correo: mail,
        direccion: dir,
        sucursal: suc,
        logoUrl: c.logoUrl || '',
        primaryColor: c.primaryColor || 'sky',
        createdAt: c.createdAt || new Date().toISOString(),
        updatedAt: c.updatedAt || c.createdAt || new Date().toISOString(),
        lastLoginAt: c.lastLoginAt || new Date().toISOString(),
        licenseStatus: (isExpired && c.licenseStatus === 'active') ? 'expired' : (c.licenseStatus || 'active'),
        licenseValidUntil: c.licenseValidUntil || 'Indefinida'
      };
    });
  } catch (e) {
    console.error('Error loading clinics', e);
    return SEED_DEFAULT_CLINICS;
  }
}

export function saveAllClinics(clinics: ClinicAccount[], syncToCloud: boolean = true): void {
  try {
    const deletedIds = getDeletedClinicIds();
    const cleanList = clinics.filter(c => !deletedIds.has(c.id));
    
    // Guardar en almacenamiento principal y en bóveda redundante
    localStorage.setItem(MASTER_CLINICS_KEY, JSON.stringify(cleanList));
    localStorage.setItem(VAULT_BACKUP_KEY, JSON.stringify(cleanList));
    
    // Guardar en IndexedDB
    idbSaveClinics(cleanList).catch(() => {});

    // Crear snapshot de respaldo rotativo
    try {
      const snapshotKey = `clinic_care_snapshot_${Date.now()}`;
      localStorage.setItem(snapshotKey, JSON.stringify(cleanList));
      // Mantener máximo 5 snapshots para no saturar memoria
      const allSnapshotKeys: string[] = [];
      for (let i = 0; i < localStorage.length; i++) {
        const k = localStorage.key(i);
        if (k && k.startsWith('clinic_care_snapshot_')) {
          allSnapshotKeys.push(k);
        }
      }
      if (allSnapshotKeys.length > 5) {
        allSnapshotKeys.sort();
        while (allSnapshotKeys.length > 5) {
          const oldKey = allSnapshotKeys.shift();
          if (oldKey) localStorage.removeItem(oldKey);
        }
      }
    } catch (e) {}

    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent(CLINICS_UPDATED_EVENT, { detail: cleanList }));
    }

    if (syncToCloud) {
      pushClinicsToCloud(cleanList).catch(() => {});
    }
  } catch (e) {
    console.error('Error saving clinics', e);
  }
}

export function registerClinic(data: Omit<ClinicAccount, 'id' | 'createdAt' | 'lastLoginAt' | 'licenseStatus' | 'licenseValidUntil'> & { licenseValidUntil?: string; licenseStatus?: LicenseStatus }): { success: boolean; clinic?: ClinicAccount; error?: string } {
  const clinics = getAllClinics();
  const normalizedUser = (data.username || '').trim().toLowerCase();

  if (!normalizedUser) {
    return { success: false, error: 'Ingresa un nombre de usuario válido.' };
  }

  if (normalizedUser === SUPERADMIN_USER.toLowerCase()) {
    return { success: false, error: 'El nombre de usuario no está disponible.' };
  }

  const existing = clinics.find(c => (c.username || '').trim().toLowerCase() === normalizedUser);
  if (existing) {
    return { success: false, error: `El usuario "${data.username}" ya está registrado en otro consultorio.` };
  }

  let validUntilStr = data.licenseValidUntil;
  if (!validUntilStr || validUntilStr === '1_month') {
    const expDate = new Date();
    expDate.setDate(expDate.getDate() + 30);
    validUntilStr = expDate.toISOString().slice(0, 10);
  }

  const nowStr = new Date().toISOString();
  const newClinic: ClinicAccount = {
    ...data,
    id: generateUUID(),
    username: data.username.trim(),
    createdAt: nowStr,
    updatedAt: nowStr,
    lastLoginAt: nowStr,
    licenseStatus: data.licenseStatus || 'active',
    licenseValidUntil: validUntilStr
  };

  const updatedClinics = [newClinic, ...clinics];
  saveAllClinics(updatedClinics, true);
  initClinicDatabase(newClinic);

  return { success: true, clinic: newClinic };
}

export function updateClinic(clinicId: string, updates: Partial<ClinicAccount>): ClinicAccount[] {
  const clinics = getAllClinics();
  const nowStr = new Date().toISOString();
  const next = clinics.map(c => {
    if (c.id === clinicId) {
      return { ...c, ...updates, updatedAt: nowStr };
    }
    return c;
  });
  saveAllClinics(next, true);

  const updatedAccount = next.find(c => c.id === clinicId);
  if (updatedAccount) {
    initClinicDatabase(updatedAccount);
  }

  const currentSession = getCurrentSession();
  if (currentSession && currentSession.clinicId === clinicId && updatedAccount) {
    saveSession({
      ...currentSession,
      clinicAccount: updatedAccount
    });
  }

  return next;
}

export function deleteClinic(clinicId: string): ClinicAccount[] {
  addDeletedClinicId(clinicId);
  const clinics = getAllClinics();
  const filtered = clinics.filter(c => c.id !== clinicId);
  saveAllClinics(filtered, true);

  try {
    localStorage.removeItem(`clinic_care_records_clinic_${clinicId}_v2`);
    localStorage.removeItem(`clinic_care_settings_clinic_${clinicId}_v2`);
    localStorage.removeItem(`clinic_care_active_record_clinic_${clinicId}_v2`);
    localStorage.removeItem(`clinic_care_backup_records_${clinicId}_v2`);
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

export function renewClinicLicense(clinicId: string, daysToAdd: number = 30): ClinicAccount[] {
  const clinics = getAllClinics();
  const target = clinics.find(c => c.id === clinicId);
  if (!target) return clinics;

  let baseDate = new Date();
  if (target.licenseValidUntil && target.licenseValidUntil !== 'Indefinida') {
    try {
      const currentExp = new Date(target.licenseValidUntil + 'T23:59:59');
      if (!isNaN(currentExp.getTime()) && currentExp > baseDate) {
        baseDate = currentExp;
      }
    } catch (e) {}
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
  const user = (usernameInput || '').trim();
  const pass = (passwordInput || '').trim();

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
  const found = clinics.find(c => (c.username || '').toLowerCase() === user.toLowerCase());

  if (!found) {
    return { success: false, error: 'Usuario no encontrado. Verifica tus credenciales o contacta al Super Administrador.' };
  }

  if (found.passwordPlain !== pass) {
    return { success: false, error: 'Contraseña incorrecta para este consultorio.' };
  }

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

// 6. BASES DE DATOS AISLADAS POR CONSULTORIO
export function getBlankClinicalRecord(): ClinicalRecord {
  return {
    id: generateUUID(),
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
      estudiosDiagnostico: {
        laboratorios: '',
        rayosX: '',
        ultrasonido: '',
        tomografiaTac: '',
        otrosEstudios: '',
        interpretacionHallazgos: ''
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
      estudiosDiagnostico: {
        laboratorios: '',
        rayosX: '',
        ultrasonido: '',
        tomografiaTac: '',
        otrosEstudios: '',
        interpretacionHallazgos: ''
      },
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
    },
    clinicalImages: [],
    appointmentInfo: {
      nextDate: '',
      nextTime: '',
      notes: ''
    }
  };
}

export function deepMergeBlank(rawRecord: any): ClinicalRecord {
  const blank = getBlankClinicalRecord();
  if (!rawRecord || typeof rawRecord !== 'object') return blank;

  return {
    ...blank,
    ...rawRecord,
    identification: {
      ...blank.identification,
      ...(rawRecord.identification || {})
    },
    historyCheckup: {
      ...blank.historyCheckup,
      ...(rawRecord.historyCheckup || {}),
      vitalSigns: {
        ...blank.historyCheckup.vitalSigns,
        ...(rawRecord.historyCheckup?.vitalSigns || {})
      },
      physicalExam: {
        ...blank.historyCheckup.physicalExam,
        ...(rawRecord.historyCheckup?.physicalExam || {})
      },
      estudiosDiagnostico: {
        ...blank.historyCheckup.estudiosDiagnostico,
        ...(rawRecord.historyCheckup?.estudiosDiagnostico || {})
      },
      prescripcion: Array.isArray(rawRecord.historyCheckup?.prescripcion)
        ? rawRecord.historyCheckup.prescripcion
        : []
    },
    evolutionNote: {
      ...blank.evolutionNote,
      ...(rawRecord.evolutionNote || {}),
      vitalSigns: {
        ...blank.evolutionNote.vitalSigns,
        ...(rawRecord.evolutionNote?.vitalSigns || {})
      },
      estudiosDiagnostico: {
        ...blank.evolutionNote.estudiosDiagnostico,
        ...(rawRecord.evolutionNote?.estudiosDiagnostico || {})
      }
    },
    procedure: {
      ...blank.procedure,
      ...(rawRecord.procedure || {})
    },
    clinicalImages: Array.isArray(rawRecord.clinicalImages) ? rawRecord.clinicalImages : [],
    appointmentInfo: {
      ...blank.appointmentInfo,
      ...(rawRecord.appointmentInfo || {})
    }
  };
}

export function initClinicDatabase(clinic: ClinicAccount): void {
  const recordsKey = `clinic_care_records_clinic_${clinic.id}_v2`;
  const settingsKey = `clinic_care_settings_clinic_${clinic.id}_v2`;
  const backupKey = `clinic_care_backup_records_${clinic.id}_v2`;

  if (!localStorage.getItem(recordsKey)) {
    localStorage.setItem(recordsKey, JSON.stringify([]));
  }
  if (!localStorage.getItem(backupKey)) {
    localStorage.setItem(backupKey, JSON.stringify([]));
  }

  const doctorSettings: DoctorSettings = {
    doctorName: cleanMojibake(clinic.doctorName) || 'Médico Responsable',
    prefix: clinic.prefix || 'Dr.',
    cedulaGeneral: cleanMojibake(clinic.cedulaGeneral) || '',
    cedulaEspecialidad: cleanMojibake(clinic.cedulaEspecialidad) || '',
    especialidad: cleanMojibake(clinic.especialidad) || 'Medicina General',
    universidad: cleanMojibake(clinic.universidad) || '',
    telefonoContacto: cleanMojibake(clinic.telefono) || '',
    correoContacto: cleanMojibake(clinic.correo) || '',
    nombreClinica: cleanMojibake(clinic.clinicName) || 'Consultorio Médico',
    sucursal: cleanMojibake(clinic.sucursal) || '',
    direccionClinica: cleanMojibake(clinic.direccion) || '',
    telefonoClinica: cleanMojibake(clinic.telefono) || '',
    logoUrl: clinic.logoUrl || '',
    primaryColor: clinic.primaryColor || 'sky'
  };

  localStorage.setItem(settingsKey, JSON.stringify(doctorSettings));
  idbSaveClinicSettings(clinic.id, doctorSettings).catch(() => {});
}

// 7. OPERACIONES DE BASE DE DATOS DEL CONSULTORIO ACTIVO (CON BLINDAJE REDUNDANTE)
export function getClinicRecords(clinicId: string): ClinicalRecord[] {
  try {
    let raw = localStorage.getItem(`clinic_care_records_clinic_${clinicId}_v2`);
    if (!raw) {
      raw = localStorage.getItem(`clinic_care_backup_records_${clinicId}_v2`) || localStorage.getItem(`clinic_care_records_clinic_${clinicId}`);
    }
    if (!raw) return [];
    const list = JSON.parse(raw);
    if (!Array.isArray(list)) return [];
    return list.map(item => deepMergeBlank(item));
  } catch (e) {
    console.error('Error loading clinic records', e);
    return [];
  }
}

export function saveClinicRecord(clinicId: string, record: ClinicalRecord): ClinicalRecord[] {
  try {
    const records = getClinicRecords(clinicId);
    const safeRecord = deepMergeBlank(record);
    const existingIndex = records.findIndex(r => r.id === safeRecord.id);
    const updated = { ...safeRecord, updatedAt: new Date().toISOString() };

    let nextList: ClinicalRecord[];
    if (existingIndex >= 0) {
      nextList = [...records];
      nextList[existingIndex] = updated;
    } else {
      nextList = [updated, ...records];
    }

    localStorage.setItem(`clinic_care_records_clinic_${clinicId}_v2`, JSON.stringify(nextList));
    localStorage.setItem(`clinic_care_backup_records_${clinicId}_v2`, JSON.stringify(nextList));
    localStorage.setItem(`clinic_care_active_record_clinic_${clinicId}_v2`, JSON.stringify(updated));

    // Guardar en IndexedDB en segundo plano
    idbSaveClinicRecords(clinicId, nextList).catch(() => {});

    // Sincronizar en segundo plano con la nube en tiempo real
    setTimeout(() => pushClinicsToCloud().catch(() => {}), 80);

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
    localStorage.setItem(`clinic_care_backup_records_${clinicId}_v2`, JSON.stringify(filtered));
    idbSaveClinicRecords(clinicId, filtered).catch(() => {});

    setTimeout(() => pushClinicsToCloud().catch(() => {}), 80);

    return filtered;
  } catch (e) {
    console.error('Error deleting record', e);
    return [];
  }
}

export function getAllClinicRecordsMap(): { [clinicId: string]: ClinicalRecord[] } {
  try {
    const map: { [clinicId: string]: ClinicalRecord[] } = {};
    const clinics = getAllClinics();
    clinics.forEach(c => {
      if (c && c.id) {
        const recs = getClinicRecords(c.id);
        if (recs && recs.length > 0) {
          map[c.id] = recs;
        }
      }
    });
    return map;
  } catch (e) {
    return {};
  }
}

export function saveAllClinicRecordsMap(remoteMap: { [clinicId: string]: ClinicalRecord[] }): void {
  if (!remoteMap || typeof remoteMap !== 'object') return;
  try {
    for (const [clinicId, remoteList] of Object.entries(remoteMap)) {
      if (!Array.isArray(remoteList) || remoteList.length === 0) continue;
      const localList = getClinicRecords(clinicId);
      const mergedMap = new Map<string, ClinicalRecord>();
      localList.forEach(r => { if (r && r.id) mergedMap.set(r.id, r); });

      remoteList.forEach(rawR => {
        const r = deepMergeBlank(rawR);
        if (!r || !r.id) return;
        if (!mergedMap.has(r.id)) {
          mergedMap.set(r.id, r);
        } else {
          const local = mergedMap.get(r.id)!;
          const remoteTime = (r.updatedAt ? new Date(r.updatedAt).getTime() : 0);
          const localTime = (local.updatedAt ? new Date(local.updatedAt).getTime() : 0);
          if (remoteTime >= localTime) {
            mergedMap.set(r.id, r);
          }
        }
      });

      const finalList = Array.from(mergedMap.values());
      localStorage.setItem(`clinic_care_records_clinic_${clinicId}_v2`, JSON.stringify(finalList));
      localStorage.setItem(`clinic_care_backup_records_${clinicId}_v2`, JSON.stringify(finalList));
      idbSaveClinicRecords(clinicId, finalList).catch(() => {});
    }
  } catch (e) {
    console.error('Error saving remote clinic records map:', e);
  }
}

export function getClinicSettings(clinicId: string): DoctorSettings {
  if (!clinicId) {
    return {
      doctorName: '',
      prefix: 'Dr.',
      cedulaGeneral: '',
      cedulaEspecialidad: '',
      especialidad: 'Medicina General',
      universidad: '',
      telefonoContacto: '',
      correoContacto: '',
      nombreClinica: 'Consultorio Médico',
      sucursal: '',
      direccionClinica: '',
      telefonoClinica: '',
      logoUrl: '',
      primaryColor: 'sky'
    };
  }

  // Cross-check con el directorio maestro de consultorios
  const allClinics = getAllClinics();
  const clinic = allClinics.find(c => c.id === clinicId);

  let parsed: any = null;
  try {
    const raw = localStorage.getItem(`clinic_care_settings_clinic_${clinicId}_v2`) || localStorage.getItem(`clinic_care_settings_clinic_${clinicId}`);
    if (raw) {
      parsed = JSON.parse(raw);
    }
  } catch (e) {
    console.error('Error reading clinic settings', e);
  }

  const resolved: DoctorSettings = {
    doctorName: cleanMojibake(parsed?.doctorName) || cleanMojibake(clinic?.doctorName) || 'Médico Responsable',
    prefix: parsed?.prefix || clinic?.prefix || 'Dr.',
    cedulaGeneral: cleanMojibake(parsed?.cedulaGeneral) || cleanMojibake(clinic?.cedulaGeneral) || '',
    cedulaEspecialidad: cleanMojibake(parsed?.cedulaEspecialidad) || cleanMojibake(clinic?.cedulaEspecialidad) || '',
    especialidad: cleanMojibake(parsed?.especialidad) || cleanMojibake(clinic?.especialidad) || 'Medicina General',
    universidad: cleanMojibake(parsed?.universidad) || cleanMojibake(clinic?.universidad) || '',
    telefonoContacto: cleanMojibake(parsed?.telefonoContacto) || cleanMojibake(clinic?.telefono) || '',
    correoContacto: cleanMojibake(parsed?.correoContacto) || cleanMojibake(clinic?.correo) || '',
    nombreClinica: cleanMojibake(parsed?.nombreClinica) || cleanMojibake(clinic?.clinicName) || 'Consultorio Médico',
    sucursal: cleanMojibake(parsed?.sucursal) || cleanMojibake(clinic?.sucursal) || '',
    direccionClinica: cleanMojibake(parsed?.direccionClinica) || cleanMojibake(clinic?.direccion) || '',
    telefonoClinica: cleanMojibake(parsed?.telefonoClinica) || cleanMojibake(clinic?.telefono) || '',
    logoUrl: parsed?.logoUrl || clinic?.logoUrl || '',
    primaryColor: parsed?.primaryColor || clinic?.primaryColor || 'sky'
  };

  // Si no existía o estaba incompleta la configuración local, persistirla
  try {
    if (!parsed || !parsed.doctorName || !parsed.nombreClinica) {
      localStorage.setItem(`clinic_care_settings_clinic_${clinicId}_v2`, JSON.stringify(resolved));
      idbSaveClinicSettings(clinicId, resolved).catch(() => {});
    }
  } catch (e) {}

  return resolved;
}

export function saveClinicSettings(clinicId: string, settings: DoctorSettings): void {
  try {
    localStorage.setItem(`clinic_care_settings_clinic_${clinicId}_v2`, JSON.stringify(settings));
    idbSaveClinicSettings(clinicId, settings).catch(() => {});
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
    if (raw) {
      const parsed = JSON.parse(raw);
      return deepMergeBlank(parsed);
    }
  } catch (e) {
    console.error('Error reading active record', e);
  }
  return getBlankClinicalRecord();
}

// 8. BÓVEDA DE RESPALDO TOTAL (EXPORTAR E IMPORTAR BASE DE DATOS COMPLETA)
export function exportMasterDatabaseBackupJSON(): string {
  const clinics = getAllClinics();
  const adminContact = getAdminContactInfo();
  const allClinicData: { [clinicId: string]: { settings: DoctorSettings; records: ClinicalRecord[] } } = {};

  clinics.forEach(c => {
    allClinicData[c.id] = {
      settings: getClinicSettings(c.id),
      records: getClinicRecords(c.id)
    };
  });

  const payload = {
    system: 'CLINIC_CARE_TOY',
    backupVersion: '2.0',
    exportedAt: new Date().toISOString(),
    superAdmin: 'Fernando01',
    adminContact,
    clinics,
    allClinicData
  };

  return JSON.stringify(payload, null, 2);
}

export function importMasterDatabaseBackupJSON(jsonStr: string): { success: boolean; importedCount: number; error?: string } {
  try {
    const parsed = JSON.parse(jsonStr);
    if (!parsed || !Array.isArray(parsed.clinics)) {
      return { success: false, importedCount: 0, error: 'El archivo no tiene la estructura de respaldo válida.' };
    }

    const importedClinics: ClinicAccount[] = parsed.clinics;
    saveAllClinics(importedClinics, true);

    if (parsed.adminContact && typeof parsed.adminContact === 'object') {
      saveAdminContactInfo(parsed.adminContact, true);
    }

    if (parsed.allClinicData && typeof parsed.allClinicData === 'object') {
      Object.keys(parsed.allClinicData).forEach(cId => {
        const item = parsed.allClinicData[cId];
        if (item.settings) {
          saveClinicSettings(cId, item.settings);
        }
        if (Array.isArray(item.records)) {
          localStorage.setItem(`clinic_care_records_clinic_${cId}_v2`, JSON.stringify(item.records));
          localStorage.setItem(`clinic_care_backup_records_${cId}_v2`, JSON.stringify(item.records));
          idbSaveClinicRecords(cId, item.records).catch(() => {});
        }
      });
    }

    return { success: true, importedCount: importedClinics.length };
  } catch (e: any) {
    return { success: false, importedCount: 0, error: e?.message || 'Error al procesar el archivo JSON.' };
  }
}

// 9. ESCANEO PROFUNDO Y RECUPERACIÓN MULTI-CAPA DE CONSULTORIOS Y MÉDICOS
export async function deepScanAllClinics(): Promise<{ recoveredCount: number; clinics: ClinicAccount[] }> {
  const deletedIds = getDeletedClinicIds();
  const clinicsMap = new Map<string, ClinicAccount>();

  // 1. Cargar desde la memoria actual
  getAllClinics().forEach(c => {
    if (c && c.id && !deletedIds.has(c.id)) {
      clinicsMap.set(c.id, c);
    }
  });

  // 2. Cargar desde IndexedDB
  try {
    const idbList = await idbGetClinics();
    idbList.forEach(c => {
      if (c && c.id && !deletedIds.has(c.id) && !clinicsMap.has(c.id)) {
        clinicsMap.set(c.id, c);
      }
    });
  } catch (e) {}

  // 3. Cargar desde todas las claves de snapshots y respaldos
  try {
    for (let i = 0; i < localStorage.length; i++) {
      const k = localStorage.key(i);
      if (k && (k.startsWith('clinic_care_snapshot_') || k.includes('vault') || k.includes('backup') || k.includes('master'))) {
        try {
          const raw = localStorage.getItem(k);
          if (raw) {
            const parsed = JSON.parse(raw);
            const list = Array.isArray(parsed) ? parsed : (Array.isArray(parsed?.clinics) ? parsed.clinics : []);
            list.forEach((c: any) => {
              if (c && c.id && !deletedIds.has(c.id)) {
                if (!clinicsMap.has(c.id)) {
                  clinicsMap.set(c.id, c);
                }
              }
            });
          }
        } catch (e) {}
      }
    }
  } catch (e) {}

  // 4. Cargar desde claves de configuración individuales
  try {
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (!key) continue;
      if (key.startsWith('clinic_care_settings_clinic_') || key.startsWith('clinic_care_records_clinic_')) {
        const cId = key.replace('clinic_care_settings_clinic_', '').replace('clinic_care_records_clinic_', '').replace('_v2', '');
        if (cId && !deletedIds.has(cId) && !clinicsMap.has(cId)) {
          try {
            const settingsRaw = localStorage.getItem(`clinic_care_settings_clinic_${cId}_v2`) || localStorage.getItem(`clinic_care_settings_clinic_${cId}`);
            let s: any = {};
            if (settingsRaw) s = JSON.parse(settingsRaw);
            const rec: ClinicAccount = {
              id: cId,
              clinicName: cleanMojibake(s.nombreClinica) || `Consultorio ${cId.substring(0, 8)}`,
              username: (s.username || `consultorio_${cId.substring(0, 6)}`).trim(),
              passwordPlain: (s.passwordPlain || '1234').trim(),
              doctorName: cleanMojibake(s.doctorName) || 'Médico Responsable',
              prefix: s.prefix || 'Dr.',
              cedulaGeneral: cleanMojibake(s.cedulaGeneral),
              cedulaEspecialidad: cleanMojibake(s.cedulaEspecialidad),
              especialidad: cleanMojibake(s.especialidad) || 'Medicina General',
              universidad: cleanMojibake(s.universidad),
              telefono: cleanMojibake(s.telefonoContacto || s.telefonoClinica),
              correo: cleanMojibake(s.correoContacto),
              direccion: cleanMojibake(s.direccionClinica),
              sucursal: cleanMojibake(s.sucursal),
              logoUrl: s.logoUrl || '',
              primaryColor: s.primaryColor || 'sky',
              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString(),
              lastLoginAt: new Date().toISOString(),
              licenseStatus: 'active',
              licenseValidUntil: 'Indefinida'
            };
            clinicsMap.set(cId, rec);
          } catch (e) {}
        }
      }
    }
  } catch (e) {}

  const finalList = Array.from(clinicsMap.values());
  saveAllClinics(finalList, false);
  finalList.forEach(c => initClinicDatabase(c));
  await idbSaveClinics(finalList);

  return { recoveredCount: finalList.length, clinics: finalList };
}
