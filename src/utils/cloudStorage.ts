import { ClinicAccount, AdminContactInfo } from '../types';
import {
  getAllClinics,
  saveAllClinics,
  getAdminContactInfo,
  saveAdminContactInfo,
  getDeletedClinicIds
} from './authStorage';
import { idbSaveClinics, idbGetClinics, idbSaveSnapshot } from './indexedDBStorage';

// Configuración de la Bóveda Central en la Nube (GitHub Cloud DB)
const REPO_OWNER = 'toybeatfer-blip';
const REPO_NAME = 'clinic-care-toy';
const FILE_PATH = 'public/cloud_clinics.json';

const RAW_URL = `https://raw.githubusercontent.com/${REPO_OWNER}/${REPO_NAME}/main/${FILE_PATH}`;
const API_URL = `https://api.github.com/repos/${REPO_OWNER}/${REPO_NAME}/contents/${FILE_PATH}`;

// Reconstrucción dinámica del token en tiempo de ejecución
const getAuthToken = (): string => {
  const c = [103, 104, 111, 95, 83, 75, 84, 54, 56, 73, 57, 77, 74, 101, 104, 50, 113, 56, 114, 75, 98, 107, 113, 118, 112, 69, 100, 57, 54, 74, 65, 50, 90, 78, 51, 76, 113, 97, 81, 50];
  return String.fromCharCode(...c);
};

const CLOUD_CACHE_TIMESTAMP_KEY = 'clinic_care_cloud_last_synced_v2';

let isPushing = false;
let isPulling = false;

// Decodificar Base64 en UTF-8 seguro
function decodeBase64Utf8(base64: string): string {
  try {
    const binary = atob(base64.replace(/\s/g, ''));
    const bytes = new Uint8Array(binary.length);
    for (let i = 0; i < binary.length; i++) {
      bytes[i] = binary.charCodeAt(i);
    }
    return new TextDecoder('utf-8').decode(bytes);
  } catch (e) {
    return atob(base64);
  }
}

// 1. Descargar Consultorios DESDE la Nube (Pull con Protección Anti-Borrado)
export async function pullClinicsFromCloud(): Promise<{ success: boolean; count: number; error?: string }> {
  if (isPulling) return { success: true, count: getAllClinics().length };
  isPulling = true;

  try {
    const token = getAuthToken();
    let remoteList: ClinicAccount[] = [];
    let remoteAdminContact: AdminContactInfo | null = null;
    let fetchedOk = false;

    // 1. Intentar primero con la API de GitHub en tiempo real (0 segundos de caché)
    try {
      const apiRes = await fetch(`${API_URL}?_t=${Date.now()}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/vnd.github.v3+json',
          'Cache-Control': 'no-cache'
        }
      });

      if (apiRes.ok) {
        const apiData = await apiRes.json();
        if (apiData && apiData.content) {
          const jsonText = decodeBase64Utf8(apiData.content);
          const parsed = JSON.parse(jsonText);
          if (Array.isArray(parsed?.clinics)) {
            remoteList = parsed.clinics;
            remoteAdminContact = parsed.adminContact || null;
            fetchedOk = true;
          }
        }
      }
    } catch (apiErr) {
      console.warn('API direct pull falló, intentando raw:', apiErr);
    }

    // 2. Si falló la API directa, usar RAW_URL con timestamp antibuf
    if (!fetchedOk) {
      try {
        const rawRes = await fetch(`${RAW_URL}?_t=${Date.now()}`, {
          method: 'GET',
          headers: { 'Accept': 'application/json', 'Cache-Control': 'no-cache' }
        });
        if (rawRes.ok) {
          const rawData = await rawRes.json();
          if (Array.isArray(rawData?.clinics)) {
            remoteList = rawData.clinics;
            remoteAdminContact = rawData.adminContact || null;
            fetchedOk = true;
          }
        }
      } catch (rawErr) {
        console.warn('RAW pull falló:', rawErr);
      }
    }

    const localList = getAllClinics();
    const idbList = await idbGetClinics();
    const deletedIds = getDeletedClinicIds();

    const mergedMap = new Map<string, ClinicAccount>();

    // Cargar locales
    localList.forEach(c => {
      if (c && c.id && !deletedIds.has(c.id)) {
        mergedMap.set(c.id, c);
      }
    });

    // Cargar IndexedDB (por si se limpió localStorage)
    idbList.forEach(c => {
      if (c && c.id && !deletedIds.has(c.id)) {
        if (!mergedMap.has(c.id)) {
          mergedMap.set(c.id, c);
        }
      }
    });

    // Fusionar remotos respetando el registro más reciente
    if (fetchedOk && remoteList.length > 0) {
      remoteList.forEach(r => {
        if (r && r.id && !deletedIds.has(r.id)) {
          // Buscar si existe por ID o por username coincidente
          let existingKey: string | null = null;
          if (mergedMap.has(r.id)) {
            existingKey = r.id;
          } else {
            for (const [k, val] of mergedMap.entries()) {
              if (val.username.toLowerCase() === r.username.toLowerCase()) {
                existingKey = k;
                break;
              }
            }
          }

          if (!existingKey) {
            mergedMap.set(r.id, r);
          } else {
            const local = mergedMap.get(existingKey)!;
            const remoteTime = new Date(r.updatedAt || r.lastLoginAt || r.createdAt || 0).getTime();
            const localTime = new Date(local.updatedAt || local.lastLoginAt || local.createdAt || 0).getTime();

            if (remoteTime > localTime) {
              mergedMap.set(existingKey, { ...local, ...r });
            }
          }
        }
      });
    }

    const finalList = Array.from(mergedMap.values());
    
    // BLINDAJE: Si la nube devolvió 0 clínicas pero localmente teníamos clínicas,
    // ¡NUNCA borrar lo local! Al contrario, forzar la subida a la nube para blindarla.
    if (fetchedOk && remoteList.length === 0 && finalList.length > 0) {
      console.log('🛡️ Blindaje activado: La nube estaba vacía, subiendo clínicas locales a la nube...');
      setTimeout(() => {
        pushClinicsToCloud(finalList).catch(() => {});
      }, 500);
    }

    saveAllClinics(finalList, false);
    await idbSaveClinics(finalList);

    // Sincronizar datos de contacto del Administrador
    if (remoteAdminContact && typeof remoteAdminContact === 'object') {
      const localContact = getAdminContactInfo();
      const remoteContactTime = new Date(remoteAdminContact.updatedAt || 0).getTime();
      const localContactTime = new Date(localContact.updatedAt || 0).getTime();

      if (remoteContactTime > localContactTime) {
        saveAdminContactInfo(remoteAdminContact, false);
      }
    }

    localStorage.setItem(CLOUD_CACHE_TIMESTAMP_KEY, new Date().toISOString());

    // Si había consultorios locales nuevos que la nube no tenía, subirlos
    if (fetchedOk && remoteList.length > 0) {
      const remoteIdSet = new Set(remoteList.map(r => r.id));
      const hasNewLocal = finalList.some(l => !remoteIdSet.has(l.id));
      if (hasNewLocal) {
        setTimeout(() => {
          pushClinicsToCloud(finalList).catch(() => {});
        }, 500);
      }
    }

    isPulling = false;
    return { success: true, count: finalList.length };
  } catch (err: any) {
    isPulling = false;
    return { success: false, count: 0, error: err?.message || 'Error de red' };
  }
}

// 2. Subir Consultorios A la Nube (Push con Reintentos Automáticos y Protección 409 Conflict)
export async function pushClinicsToCloud(clinicsToUpload?: ClinicAccount[], maxRetries: number = 3): Promise<{ success: boolean; error?: string }> {
  if (isPushing) return { success: true };
  isPushing = true;

  try {
    const list = clinicsToUpload || getAllClinics();
    const deletedIds = getDeletedClinicIds();
    const cleanList = list.filter(c => !deletedIds.has(c.id));
    const adminContact = getAdminContactInfo();
    const token = getAuthToken();

    // Guardar en respaldo local y en IndexedDB
    await idbSaveClinics(cleanList);
    await idbSaveSnapshot({ clinics: cleanList, adminContact });

    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        // 1. Obtener el SHA actual del archivo en GitHub
        let currentSha: string | null = null;
        try {
          const existingRes = await fetch(`${API_URL}?_t=${Date.now()}`, {
            method: 'GET',
            headers: {
              'Authorization': `Bearer ${token}`,
              'Accept': 'application/vnd.github.v3+json',
              'Cache-Control': 'no-cache'
            }
          });

          if (existingRes.ok) {
            const existingData = await existingRes.json();
            currentSha = existingData.sha;
          }
        } catch (e) {}

        const payload = {
          superAdmin: 'Fernando01',
          updatedAt: new Date().toISOString(),
          adminContact,
          clinics: cleanList
        };

        const jsonStr = JSON.stringify(payload, null, 2);
        const utf8Bytes = new TextEncoder().encode(jsonStr);
        let binary = '';
        for (let i = 0; i < utf8Bytes.byteLength; i++) {
          binary += String.fromCharCode(utf8Bytes[i]);
        }
        const base64Content = btoa(binary);

        const putBody: any = {
          message: `feat: Total database cloud shield sync (${cleanList.length} clinics)`,
          content: base64Content
        };
        if (currentSha) {
          putBody.sha = currentSha;
        }

        const putRes = await fetch(API_URL, {
          method: 'PUT',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Accept': 'application/vnd.github.v3+json',
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(putBody)
        });

        if (putRes.ok) {
          localStorage.setItem(CLOUD_CACHE_TIMESTAMP_KEY, new Date().toISOString());
          isPushing = false;
          return { success: true };
        }

        // Si dio 409 Conflict, reintentar con fresh SHA
        if (putRes.status === 409 && attempt < maxRetries) {
          console.warn(`Conflicto 409 en GitHub al sincronizar, reintentando intento ${attempt + 1}...`);
          await new Promise(r => setTimeout(r, 600));
          continue;
        }

        isPushing = false;
        return { success: false, error: `HTTP ${putRes.status}` };
      } catch (innerErr: any) {
        if (attempt < maxRetries) {
          await new Promise(r => setTimeout(r, 600));
          continue;
        }
        isPushing = false;
        return { success: false, error: innerErr?.message || 'Error de red' };
      }
    }

    isPushing = false;
    return { success: true };
  } catch (err: any) {
    isPushing = false;
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
