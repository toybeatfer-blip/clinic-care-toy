import { ClinicAccount, AdminContactInfo } from '../types';
import {
  getAllClinics,
  saveAllClinics,
  getAdminContactInfo,
  saveAdminContactInfo,
  CLINICS_UPDATED_EVENT,
  ADMIN_CONTACT_EVENT
} from './authStorage';

// Identificador único de bóveda en la nube para CLINIC CARE TOY
const PANTRY_ID = 'b7f3d1e9-6a2c-4915-8d5f-cliniccaretoy99';
const BASE_URL = `https://getpantry.cloud/apiv1/pantry/${PANTRY_ID}/basket`;

const CLOUD_CACHE_TIMESTAMP_KEY = 'clinic_care_cloud_last_synced_v2';

export interface CloudSyncStatus {
  isSyncing: boolean;
  lastSyncedAt: string | null;
  error: string | null;
  isOnline: boolean;
}

// 1. Sincronizar Consultorios DESDE la Nube (Pull)
export async function pullClinicsFromCloud(): Promise<{ success: boolean; count: number; error?: string }> {
  try {
    const res = await fetch(`${BASE_URL}/clinics_master`, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' }
    });

    if (res.status === 404) {
      // El basket aún no existe en la nube, subir el actual
      await pushClinicsToCloud(getAllClinics());
      return { success: true, count: getAllClinics().length };
    }

    if (!res.ok) {
      return { success: false, count: 0, error: `Error ${res.status} al conectar con la nube.` };
    }

    const data = await res.json();
    const remoteList: ClinicAccount[] = Array.isArray(data?.clinics) ? data.clinics : (Array.isArray(data) ? data : []);

    if (remoteList.length > 0) {
      // Fusionar inteligentemente con los consultorios locales
      const localList = getAllClinics();
      const mergedMap = new Map<string, ClinicAccount>();

      // Primero cargar locales
      localList.forEach(c => mergedMap.set(c.id, c));

      // Luego fusionar remotos (actualizando si es más reciente o nuevo)
      remoteList.forEach(r => {
        if (!mergedMap.has(r.id)) {
          mergedMap.set(r.id, r);
        } else {
          const local = mergedMap.get(r.id)!;
          const remoteTime = new Date(r.lastLoginAt || r.createdAt || 0).getTime();
          const localTime = new Date(local.lastLoginAt || local.createdAt || 0).getTime();
          if (remoteTime >= localTime) {
            mergedMap.set(r.id, { ...local, ...r });
          }
        }
      });

      const finalList = Array.from(mergedMap.values());
      saveAllClinics(finalList);

      // Sincronizar también datos de contacto de Fernando si vienen en la nube
      if (data?.adminContact && typeof data.adminContact === 'object') {
        saveAdminContactInfo(data.adminContact);
      }

      localStorage.setItem(CLOUD_CACHE_TIMESTAMP_KEY, new Date().toISOString());
      return { success: true, count: finalList.length };
    }

    return { success: true, count: getAllClinics().length };
  } catch (err: any) {
    console.warn('Advertencia al sincronizar con la nube:', err);
    return { success: false, count: 0, error: err?.message || 'Sin conexión' };
  }
}

// 2. Subir Consultorios A la Nube (Push)
export async function pushClinicsToCloud(clinicsToUpload?: ClinicAccount[]): Promise<{ success: boolean; error?: string }> {
  try {
    const list = clinicsToUpload || getAllClinics();
    const adminContact = getAdminContactInfo();

    const payload = {
      updatedAt: new Date().toISOString(),
      superAdmin: 'Fernando01',
      adminContact,
      clinics: list
    };

    const res = await fetch(`${BASE_URL}/clinics_master`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });

    if (res.ok) {
      localStorage.setItem(CLOUD_CACHE_TIMESTAMP_KEY, new Date().toISOString());
      return { success: true };
    } else {
      return { success: false, error: `Error ${res.status} al guardar en la nube.` };
    }
  } catch (err: any) {
    console.warn('Error al subir a la nube:', err);
    return { success: false, error: err?.message || 'Error de red' };
  }
}

// 3. Obtener Última Fecha de Sincronización
export function getLastCloudSyncTime(): string | null {
  try {
    return localStorage.getItem(CLOUD_CACHE_TIMESTAMP_KEY);
  } catch (e) {
    return null;
  }
}
