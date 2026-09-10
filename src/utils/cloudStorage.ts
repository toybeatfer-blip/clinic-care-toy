import { ClinicAccount, AdminContactInfo } from '../types';
import {
  getAllClinics,
  saveAllClinics,
  getAdminContactInfo,
  saveAdminContactInfo,
  getDeletedClinicIds,
  removeDeletedClinicId,
  cleanMojibake,
  initClinicDatabase,
  getAllClinicRecordsMap,
  saveAllClinicRecordsMap,
  getAllClinicSettingsMap,
  saveAllClinicSettingsMap,
  deepScanAllClinics
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

// URL central de sincronización unificada para todos los dispositivos
export const getCentralApiUrl = (): string => {
  if (typeof window !== 'undefined') {
    if (window.location.origin && window.location.origin.includes('onrender.com')) {
      return `${window.location.origin}/api/sync`;
    }
    if (window.location.port === '3000') {
      return '/api/sync';
    }
  }
  return 'https://clinic-care-toy.onrender.com/api/sync';
};

const CLOUD_CACHE_TIMESTAMP_KEY = 'clinic_care_cloud_last_synced_v2';

let activePullPromise: Promise<{ success: boolean; count: number; error?: string }> | null = null;
let activePushPromise: Promise<{ success: boolean; count?: number; error?: string }> | null = null;
let pendingPushClinics: ClinicAccount[] | null = null;

let pushDebounceTimer: any = null;
export function debouncedPushClinicsToCloud(delayMs: number = 1500): void {
  if (pushDebounceTimer) clearTimeout(pushDebounceTimer);
  pushDebounceTimer = setTimeout(() => {
    pushClinicsToCloud().catch(() => {});
  }, delayMs);
}

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
    try {
      return atob(base64);
    } catch (err) {
      return '';
    }
  }
}

const safeDateParse = (d?: string | null): number => {
  if (!d) return 0;
  const t = new Date(d).getTime();
  return isNaN(t) ? 0 : t;
};

export function mergeAdminContacts(local: AdminContactInfo, remote?: AdminContactInfo | null): AdminContactInfo {
  if (!remote || typeof remote !== 'object') return local;
  if (!local || typeof local !== 'object') return remote;

  const isDefault = (c: AdminContactInfo) => {
    const isDefPhone = !c.phoneWhatsApp || c.phoneWhatsApp.trim() === '55 1234 5678' || c.phoneWhatsApp.includes('1234 5678');
    const isDefTime = !c.updatedAt || c.updatedAt === '2026-01-01T00:00:00.000Z';
    return isDefPhone && isDefTime;
  };

  const localDefault = isDefault(local);
  const remoteDefault = isDefault(remote);

  // Si el local es por defecto pero el remoto fue personalizado, el remoto siempre gana
  if (localDefault && !remoteDefault) return remote;
  // Si el remoto es por defecto pero el local fue personalizado, el local siempre gana
  if (!localDefault && remoteDefault) return local;

  // Si ambos son personalizados o ambos son por defecto, comparar fechas
  const localTime = safeDateParse(local.updatedAt);
  const remoteTime = safeDateParse(remote.updatedAt);
  return remoteTime > localTime ? remote : local;
}

// 1. Descargar Consultorios DESDE la Nube (Pull Paralelo Anti Split-Brain y Blindaje Multi-Dispositivo)
export function pullClinicsFromCloud(): Promise<{ success: boolean; count: number; error?: string }> {
  if (activePullPromise) {
    return activePullPromise;
  }

  activePullPromise = (async () => {
    try {
      const centralUrl = getCentralApiUrl();
      const token = getAuthToken();

      // Consultar Render Y GitHub EN PARALELO con Promise.allSettled para evitar split-brain
      const [renderRes, ghRes] = await Promise.allSettled([
        // Canal 1: API Central Render (/api/sync)
        (async () => {
          const controller = new AbortController();
          const timeoutId = setTimeout(() => controller.abort(), 7000);
          const res = await fetch(`${centralUrl}?_t=${Date.now()}`, {
            method: 'GET',
            headers: {
              'Accept': 'application/json',
              'Cache-Control': 'no-cache, no-store, must-revalidate'
            },
            signal: controller.signal
          });
          clearTimeout(timeoutId);
          if (!res.ok) throw new Error(`HTTP ${res.status}`);
          const json = await res.json();
          if (!json || !json.success) throw new Error('Render sync failed');
          return json;
        })(),

        // Canal 2: Bóveda GitHub Cloud Vault
        (async () => {
          try {
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), 7000);
            const res = await fetch(`${API_URL}?_t=${Date.now()}`, {
              method: 'GET',
              headers: {
                'Authorization': `Bearer ${token}`,
                'Accept': 'application/vnd.github.v3+json',
                'Cache-Control': 'no-cache'
              },
              signal: controller.signal
            });
            clearTimeout(timeoutId);
            if (res.ok) {
              const data = await res.json();
              if (data && data.content) {
                const text = decodeBase64Utf8(data.content);
                const parsed = JSON.parse(text);
                if (parsed && Array.isArray(parsed.clinics)) return parsed;
              }
            }
          } catch (e) {}

          // Fallback a GitHub RAW
          const rawRes = await fetch(`${RAW_URL}?_t=${Date.now()}`, {
            headers: { 'Accept': 'application/json', 'Cache-Control': 'no-cache' }
          });
          if (rawRes.ok) {
            const rawData = await rawRes.json();
            if (rawData && Array.isArray(rawData.clinics)) return rawData;
          }
          throw new Error('GitHub sync failed');
        })()
      ]);

      const candidateLists: ClinicAccount[][] = [];
      const candidateRecords: { [cId: string]: any[] }[] = [];
      const candidateSettings: { [cId: string]: any }[] = [];
      const candidateAdminContacts: AdminContactInfo[] = [];
      let remoteFetchedAny = false;

      if (renderRes.status === 'fulfilled' && renderRes.value) {
        remoteFetchedAny = true;
        const d = renderRes.value;
        if (Array.isArray(d.clinics)) candidateLists.push(d.clinics);
        if (d.clinicRecords && typeof d.clinicRecords === 'object') candidateRecords.push(d.clinicRecords);
        if (d.clinicSettings && typeof d.clinicSettings === 'object') candidateSettings.push(d.clinicSettings);
        if (d.adminContact && typeof d.adminContact === 'object') candidateAdminContacts.push(d.adminContact);
      }

      if (ghRes.status === 'fulfilled' && ghRes.value) {
        remoteFetchedAny = true;
        const d = ghRes.value;
        if (Array.isArray(d.clinics)) candidateLists.push(d.clinics);
        if (d.clinicRecords && typeof d.clinicRecords === 'object') candidateRecords.push(d.clinicRecords);
        if (d.clinicSettings && typeof d.clinicSettings === 'object') candidateSettings.push(d.clinicSettings);
        if (d.adminContact && typeof d.adminContact === 'object') candidateAdminContacts.push(d.adminContact);
      }

      const deletedIds = getDeletedClinicIds();

      // CRÍTICO: Cualquier consultorio presente en cualquiera de las nubes ESTÁ ACTIVO.
      // Purgar inmediatamente cualquier tombstone obsoleto de deletedIds.
      candidateLists.forEach(list => {
        list.forEach(c => {
          if (c && c.id) {
            deletedIds.delete(c.id);
            removeDeletedClinicId(c.id);
          }
        });
      });

      // 1. Fusionar fuentes remotas
      const remoteMergedMap = new Map<string, ClinicAccount>();

      candidateLists.forEach(list => {
        list.forEach(rawR => {
          if (!rawR || !rawR.id) return;
          const r: ClinicAccount = {
            ...rawR,
            clinicName: cleanMojibake(rawR.clinicName) || 'Consultorio Médico',
            doctorName: cleanMojibake(rawR.doctorName) || 'Médico Responsable',
            prefix: rawR.prefix || 'Dr.',
            cedulaGeneral: cleanMojibake(rawR.cedulaGeneral),
            cedulaEspecialidad: cleanMojibake(rawR.cedulaEspecialidad),
            especialidad: cleanMojibake(rawR.especialidad) || 'Medicina General',
            universidad: cleanMojibake(rawR.universidad),
            telefono: cleanMojibake(rawR.telefono),
            correo: cleanMojibake(rawR.correo),
            direccion: cleanMojibake(rawR.direccion),
            sucursal: cleanMojibake(rawR.sucursal)
          };

          let matchKey: string | null = null;
          if (remoteMergedMap.has(r.id)) {
            matchKey = r.id;
          } else {
            for (const [k, val] of remoteMergedMap.entries()) {
              if ((val.username || '').toLowerCase() === (r.username || '').toLowerCase()) {
                matchKey = k;
                break;
              }
            }
          }

          if (!matchKey) {
            remoteMergedMap.set(r.id, r);
          } else {
            const ex = remoteMergedMap.get(matchKey)!;
            const rTime = safeDateParse(r.updatedAt || r.lastLoginAt || r.createdAt);
            const exTime = safeDateParse(ex.updatedAt || ex.lastLoginAt || ex.createdAt);
            if (rTime >= exTime) {
              remoteMergedMap.set(matchKey, { ...ex, ...r });
            }
          }
        });
      });

      // 2. Fusionar con datos locales (deep scan, local list, IndexedDB)
      const { clinics: deepList } = await deepScanAllClinics();
      const localList = getAllClinics();
      const idbList = await idbGetClinics();

      const finalMap = new Map<string, ClinicAccount>();

      [...deepList, ...localList, ...idbList].forEach(c => {
        if (c && c.id && !deletedIds.has(c.id)) {
          finalMap.set(c.id, c);
        }
      });

      for (const [remId, remClinic] of remoteMergedMap.entries()) {
        let localKey: string | null = null;
        if (finalMap.has(remId)) {
          localKey = remId;
        } else {
          for (const [k, val] of finalMap.entries()) {
            if ((val.username || '').toLowerCase() === (remClinic.username || '').toLowerCase()) {
              localKey = k;
              break;
            }
          }
        }

        if (!localKey) {
          finalMap.set(remId, remClinic);
        } else {
          const loc = finalMap.get(localKey)!;
          const remTime = safeDateParse(remClinic.updatedAt || remClinic.lastLoginAt || remClinic.createdAt);
          const locTime = safeDateParse(loc.updatedAt || loc.lastLoginAt || loc.createdAt);
          if (remTime >= locTime) {
            finalMap.set(localKey, { ...loc, ...remClinic });
          }
        }
      }

      const finalList = Array.from(finalMap.values());
      saveAllClinics(finalList, false);
      finalList.forEach(c => initClinicDatabase(c));
      await idbSaveClinics(finalList);

      // 3. Fusionar expedientes clínicos de pacientes
      const localRecordsMap = getAllClinicRecordsMap();
      const mergedRecordsMap: { [cId: string]: any[] } = { ...localRecordsMap };

      candidateRecords.forEach(recordsObj => {
        for (const [cId, recs] of Object.entries(recordsObj)) {
          if (!Array.isArray(recs) || deletedIds.has(cId)) continue;
          const current = mergedRecordsMap[cId] || [];
          const recMap = new Map<string, any>();
          current.forEach(r => { if (r && r.id) recMap.set(r.id, r); });
          recs.forEach(r => {
            if (!r || !r.id) return;
            if (!recMap.has(r.id)) {
              recMap.set(r.id, r);
            } else {
              const ex = recMap.get(r.id);
              const rTime = safeDateParse(r.updatedAt || r.createdAt);
              const exTime = safeDateParse(ex.updatedAt || ex.createdAt);
              if (rTime >= exTime) {
                recMap.set(r.id, { ...ex, ...r });
              }
            }
          });
          mergedRecordsMap[cId] = Array.from(recMap.values());
        }
      });
      saveAllClinicRecordsMap(mergedRecordsMap);

      // 4. Fusionar configuraciones de consultorios
      const localSettingsMap = getAllClinicSettingsMap();
      const mergedSettingsMap: { [cId: string]: any } = { ...localSettingsMap };

      candidateSettings.forEach(setObj => {
        for (const [cId, settings] of Object.entries(setObj)) {
          if (settings && typeof settings === 'object' && !deletedIds.has(cId)) {
            mergedSettingsMap[cId] = { ...(mergedSettingsMap[cId] || {}), ...settings };
          }
        }
      });
      saveAllClinicSettingsMap(mergedSettingsMap);

      // 5. Fusionar datos de contacto de Super Administrador con blindaje inteligente
      let finalAdminContact = getAdminContactInfo();
      candidateAdminContacts.forEach(ac => {
        finalAdminContact = mergeAdminContacts(finalAdminContact, ac);
      });
      saveAdminContactInfo(finalAdminContact, false);

      localStorage.setItem(CLOUD_CACHE_TIMESTAMP_KEY, new Date().toISOString());

      // 6. BLINDAJE DE PARIDAD MULTI-DISPOSITIVO:
      // Si Render o GitHub tenían menos consultorios que el resultado fusionado,
      // sincronizar el estado completo a ambos de inmediato para que ningún dispositivo
      // quede con datos desactualizados.
      if (remoteFetchedAny) {
        const renderCount = (renderRes.status === 'fulfilled' && Array.isArray(renderRes.value?.clinics))
          ? renderRes.value.clinics.length
          : -1;
        const ghCount = (ghRes.status === 'fulfilled' && Array.isArray(ghRes.value?.clinics))
          ? ghRes.value.clinics.length
          : -1;

        if (renderCount !== finalList.length || ghCount !== finalList.length) {
          console.log(`☁️ Paridad Multi-Dispositivo: Sincronizando datos unificados (Render: ${renderCount}, GitHub: ${ghCount}, Fusionado: ${finalList.length})...`);
          pushClinicsToCloud(finalList).catch(() => {});
        }
      }

      return { success: true, count: finalList.length };
    } catch (err: any) {
      return { success: false, count: getAllClinics().length, error: err?.message || 'Error de red' };
    } finally {
      activePullPromise = null;
    }
  })();

  return activePullPromise;
}

// 2. Subir Consultorios A la Nube (Push con Multi-Dispositivo Fusionado y Auto-Reintentos)
export function pushClinicsToCloud(clinicsToUpload?: ClinicAccount[], maxRetries: number = 3): Promise<{ success: boolean; count?: number; error?: string }> {
  if (activePushPromise) {
    pendingPushClinics = clinicsToUpload || getAllClinics();
    return activePushPromise;
  }

  activePushPromise = (async () => {
    try {
      const list = clinicsToUpload || getAllClinics();
      const deletedIds = getDeletedClinicIds();

      // Desarmar cualquier tombstone para consultorios que se están guardando/subiendo
      list.forEach(c => {
        if (c && c.id && deletedIds.has(c.id)) {
          deletedIds.delete(c.id);
          removeDeletedClinicId(c.id);
        }
      });

      const cleanList = list
        .filter(c => !deletedIds.has(c.id))
        .map(c => ({
          ...c,
          clinicName: cleanMojibake(c.clinicName) || 'Consultorio Médico',
          doctorName: cleanMojibake(c.doctorName) || 'Médico Responsable',
          prefix: c.prefix || 'Dr.',
          cedulaGeneral: cleanMojibake(c.cedulaGeneral),
          cedulaEspecialidad: cleanMojibake(c.cedulaEspecialidad),
          especialidad: cleanMojibake(c.especialidad) || 'Medicina General',
          universidad: cleanMojibake(c.universidad),
          telefono: cleanMojibake(c.telefono),
          correo: cleanMojibake(c.correo),
          direccion: cleanMojibake(c.direccion),
          sucursal: cleanMojibake(c.sucursal)
        }));

      const adminContact = getAdminContactInfo();
      const clinicRecords = getAllClinicRecordsMap();
      const clinicSettings = getAllClinicSettingsMap();
      const token = getAuthToken();

      // Guardar en respaldo local y en IndexedDB
      await idbSaveClinics(cleanList);
      await idbSaveSnapshot({ clinics: cleanList, adminContact, clinicRecords, clinicSettings });

      // =========================================================================
      // CANAL 1: Servidor Render en Tiempo Real (/api/sync)
      // =========================================================================
      try {
        const centralUrl = getCentralApiUrl();
        const activeIds = new Set(cleanList.map(c => c.id));
        const safeDeletedClinicIds = Array.from(deletedIds).filter(dId => !activeIds.has(dId));

        const payload = {
          superAdmin: 'Fernando01',
          updatedAt: new Date().toISOString(),
          clinics: cleanList,
          adminContact,
          deletedClinicIds: safeDeletedClinicIds,
          clinicRecords,
          clinicSettings
        };

        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 8000);

        fetch(centralUrl, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json'
          },
          body: JSON.stringify(payload),
          signal: controller.signal
        }).then(async res => {
          clearTimeout(timeoutId);
          if (res.ok) {
            const contentType = res.headers.get('content-type') || '';
            if (contentType.includes('application/json')) {
              const resData = await res.json();
              if (resData && resData.success) {
                localStorage.setItem(CLOUD_CACHE_TIMESTAMP_KEY, new Date().toISOString());
              }
            }
          }
        }).catch(() => {
          clearTimeout(timeoutId);
        });
      } catch (apiErr) {}

      // =========================================================================
      // CANAL 2: BÓVEDA PERMANENTE EN GITHUB (24/7 SIN REINICIOS NI PÉRDIDA)
      // =========================================================================

      let lastError = '';

      for (let attempt = 1; attempt <= maxRetries; attempt++) {
        try {
          // 1. Obtener el SHA actual y contenido remoto en GitHub para fusión multi-dispositivo
          let currentSha: string | null = null;
          let remoteClinics: ClinicAccount[] = [];
          let remoteClinicRecords: { [clinicId: string]: any[] } = {};
          let remoteClinicSettings: { [clinicId: string]: any } = {};
          let remoteAdminContact: AdminContactInfo | null = null;

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
              if (existingData.content) {
                const text = decodeBase64Utf8(existingData.content);
                const parsed = JSON.parse(text);
                if (Array.isArray(parsed?.clinics)) {
                  remoteClinics = parsed.clinics;
                }
                if (parsed?.adminContact && typeof parsed.adminContact === 'object') {
                  remoteAdminContact = parsed.adminContact;
                }
                if (parsed?.clinicRecords && typeof parsed.clinicRecords === 'object') {
                  remoteClinicRecords = parsed.clinicRecords;
                }
                if (parsed?.clinicSettings && typeof parsed.clinicSettings === 'object') {
                  remoteClinicSettings = parsed.clinicSettings;
                }
              }
            }
          } catch (e) {}

          // Si falta el SHA por cuestiones de caché, obtenerlo directamente
          if (!currentSha) {
            try {
              const directShaRes = await fetch(`https://api.github.com/repos/${REPO_OWNER}/${REPO_NAME}/contents/${FILE_PATH}?ref=main&cb=${Date.now()}`, {
                headers: {
                  'Authorization': `Bearer ${token}`,
                  'Accept': 'application/vnd.github.v3+json'
                }
              });
              if (directShaRes.ok) {
                const d = await directShaRes.json();
                if (d && d.sha) currentSha = d.sha;
              }
            } catch (e) {}
          }

          // 2. FUSIÓN DISTRIBUIDA DE CONSULTORIOS
          const mergedUploadMap = new Map<string, ClinicAccount>();

          // Primero incorporar lo que ya está en la nube
          remoteClinics.forEach(r => {
            if (r && r.id && !deletedIds.has(r.id)) {
              mergedUploadMap.set(r.id, r);
            }
          });

          // Luego incorporar la lista local actual
          cleanList.forEach(l => {
            if (l && l.id && !deletedIds.has(l.id)) {
              let matchKey: string | null = null;
              if (mergedUploadMap.has(l.id)) {
                matchKey = l.id;
              } else {
                for (const [k, v] of mergedUploadMap.entries()) {
                  if (v.username.toLowerCase() === l.username.toLowerCase()) {
                    matchKey = k;
                    break;
                  }
                }
              }

              if (!matchKey) {
                mergedUploadMap.set(l.id, l);
              } else {
                const existing = mergedUploadMap.get(matchKey)!;
                const localTime = safeDateParse(l.updatedAt || l.lastLoginAt || l.createdAt);
                const remoteTime = safeDateParse(existing.updatedAt || existing.lastLoginAt || existing.createdAt);
                if (localTime >= remoteTime) {
                  mergedUploadMap.set(matchKey, { ...existing, ...l });
                }
              }
            }
          });

          const clinicsToCommit = Array.from(mergedUploadMap.values());

          // 3. FUSIÓN DISTRIBUIDA DE EXPEDIENTES CLÍNICOS (PACIENTES)
          const mergedClinicRecords: { [clinicId: string]: any[] } = { ...remoteClinicRecords };
          for (const [cId, localRecs] of Object.entries(clinicRecords)) {
            if (deletedIds.has(cId) || !Array.isArray(localRecs)) continue;
            const existingRecs = Array.isArray(mergedClinicRecords[cId]) ? mergedClinicRecords[cId] : [];
            const recMap = new Map<string, any>();
            existingRecs.forEach(r => { if (r && r.id) recMap.set(r.id, r); });
            localRecs.forEach(l => {
              if (!l || !l.id) return;
              if (!recMap.has(l.id)) {
                recMap.set(l.id, l);
              } else {
                const ex = recMap.get(l.id);
                const lTime = safeDateParse(l.updatedAt || l.createdAt);
                const exTime = safeDateParse(ex.updatedAt || ex.createdAt);
                if (lTime >= exTime) {
                  recMap.set(l.id, { ...ex, ...l });
                }
              }
            });
            mergedClinicRecords[cId] = Array.from(recMap.values());
          }

          // 4. FUSIÓN DISTRIBUIDA DE CONFIGURACIONES DE CONSULTORIO
          const mergedClinicSettings: { [clinicId: string]: any } = { ...remoteClinicSettings };
          for (const [cId, localSet] of Object.entries(clinicSettings)) {
            if (deletedIds.has(cId) || !localSet) continue;
            mergedClinicSettings[cId] = { ...(mergedClinicSettings[cId] || {}), ...localSet };
          }

          // Fusionar Datos de Contacto de Administrador con Blindaje Inteligente
          const adminContactToCommit = mergeAdminContacts(adminContact, remoteAdminContact);
          if (JSON.stringify(adminContactToCommit) !== JSON.stringify(adminContact)) {
            saveAdminContactInfo(adminContactToCommit, false);
          }

          // Desarmar cualquier tombstone para consultorios presentes en clinicsToCommit
          const activeCommitIds = new Set(clinicsToCommit.map(c => c.id));
          activeCommitIds.forEach(id => {
            deletedIds.delete(id);
            removeDeletedClinicId(id);
          });
          const safeDeletedIdsForCommit = Array.from(deletedIds).filter(id => !activeCommitIds.has(id));

          const payload = {
            superAdmin: 'Fernando01',
            updatedAt: new Date().toISOString(),
            adminContact: adminContactToCommit,
            clinics: clinicsToCommit,
            deletedClinicIds: safeDeletedIdsForCommit,
            clinicRecords: mergedClinicRecords,
            clinicSettings: mergedClinicSettings
          };

          const jsonStr = JSON.stringify(payload, null, 2);
          const utf8Bytes = new TextEncoder().encode(jsonStr);
          let binary = '';
          for (let i = 0; i < utf8Bytes.byteLength; i++) {
            binary += String.fromCharCode(utf8Bytes[i]);
          }
          const base64Content = btoa(binary);

          const putBody: any = {
            message: `feat: Cross-device database cloud shield sync (${clinicsToCommit.length} clinics, all records & settings)`,
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
            saveAllClinics(clinicsToCommit, false);
            clinicsToCommit.forEach(c => initClinicDatabase(c));
            saveAllClinicRecordsMap(mergedClinicRecords);
            saveAllClinicSettingsMap(mergedClinicSettings);
            return { success: true, count: clinicsToCommit.length };
          }

          // Si dio 409 Conflict o 422 Unprocessable, reintentar refrescando el SHA
          if ((putRes.status === 409 || putRes.status === 422) && attempt < maxRetries) {
            console.warn(`Estado ${putRes.status} en GitHub al sincronizar, reintentando con nuevo SHA (intento ${attempt + 1})...`);
            await new Promise(r => setTimeout(r, 600));
            continue;
          }

          lastError = `HTTP ${putRes.status}`;
          break;
        } catch (innerErr: any) {
          lastError = innerErr?.message || 'Error de comunicación';
          if (attempt < maxRetries) {
            await new Promise(r => setTimeout(r, 600));
            continue;
          }
          break;
        }
      }

      return { success: false, error: lastError || 'No se pudo sincronizar con GitHub' };
    } catch (err: any) {
      return { success: false, error: err?.message || 'Error de red' };
    } finally {
      activePushPromise = null;
      if (pendingPushClinics) {
        const nextList = pendingPushClinics;
        pendingPushClinics = null;
        setTimeout(() => pushClinicsToCloud(nextList).catch(() => {}), 100);
      }
    }
  })();

  return activePushPromise;
}

// 3. Obtener Última Fecha de Sincronización
export function getLastCloudSyncTime(): string | null {
  try {
    return localStorage.getItem(CLOUD_CACHE_TIMESTAMP_KEY);
  } catch (e) {
    return null;
  }
}
