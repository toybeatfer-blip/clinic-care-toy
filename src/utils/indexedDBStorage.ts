import { ClinicAccount, ClinicalRecord, DoctorSettings } from '../types';

const DB_NAME = 'ClinicCareToyDB_v2';
const DB_VERSION = 1;

let dbPromise: Promise<IDBDatabase> | null = null;

export function getIDB(): Promise<IDBDatabase> {
  if (typeof window === 'undefined' || !window.indexedDB) {
    return Promise.reject(new Error('IndexedDB no está disponible en este entorno.'));
  }

  if (dbPromise) return dbPromise;

  dbPromise = new Promise((resolve, reject) => {
    try {
      const request = indexedDB.open(DB_NAME, DB_VERSION);

      request.onupgradeneeded = (event: IDBVersionChangeEvent) => {
        const db = (event.target as IDBOpenDBRequest).result;
        if (!db.objectStoreNames.contains('clinics')) {
          db.createObjectStore('clinics', { keyPath: 'id' });
        }
        if (!db.objectStoreNames.contains('records')) {
          const recordStore = db.createObjectStore('records', { keyPath: 'id' });
          recordStore.createIndex('clinicId', 'clinicId', { unique: false });
        }
        if (!db.objectStoreNames.contains('settings')) {
          db.createObjectStore('settings', { keyPath: 'clinicId' });
        }
        if (!db.objectStoreNames.contains('vault_snapshots')) {
          db.createObjectStore('vault_snapshots', { keyPath: 'timestamp' });
        }
      };

      request.onsuccess = () => {
        resolve(request.result);
      };

      request.onerror = () => {
        reject(request.error);
      };
    } catch (e) {
      reject(e);
    }
  });

  return dbPromise;
}

// Solicitar al navegador que proteja el almacenamiento contra eliminación automática
export async function requestPersistentStorage(): Promise<boolean> {
  try {
    if (typeof navigator !== 'undefined' && navigator.storage && navigator.storage.persist) {
      const isPersisted = await navigator.storage.persist();
      console.log('🛡️ Almacenamiento persistente blindado:', isPersisted ? 'ACTIVADO' : 'ESTÁNDAR');
      return isPersisted;
    }
  } catch (e) {
    console.warn('No se pudo solicitar persistencia de almacenamiento:', e);
  }
  return false;
}

// 1. Guardar y Obtener Clínicas en IndexedDB
export async function idbSaveClinics(clinics: ClinicAccount[]): Promise<void> {
  try {
    const db = await getIDB();
    const tx = db.transaction('clinics', 'readwrite');
    const store = tx.objectStore('clinics');
    
    // Limpiar y resincronizar
    await new Promise<void>((resolve, reject) => {
      const clearReq = store.clear();
      clearReq.onsuccess = () => resolve();
      clearReq.onerror = () => reject(clearReq.error);
    });

    for (const c of clinics) {
      store.put(c);
    }

    return new Promise((resolve, reject) => {
      tx.oncomplete = () => resolve();
      tx.onerror = () => reject(tx.error);
    });
  } catch (e) {
    console.error('Error guardando clínicas en IndexedDB:', e);
  }
}

export async function idbGetClinics(): Promise<ClinicAccount[]> {
  try {
    const db = await getIDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction('clinics', 'readonly');
      const store = tx.objectStore('clinics');
      const req = store.getAll();
      req.onsuccess = () => resolve(req.result || []);
      req.onerror = () => reject(req.error);
    });
  } catch (e) {
    return [];
  }
}

// 2. Guardar y Obtener Expedientes por Consultorio en IndexedDB
export async function idbSaveClinicRecords(clinicId: string, records: ClinicalRecord[]): Promise<void> {
  try {
    const db = await getIDB();
    const tx = db.transaction('records', 'readwrite');
    const store = tx.objectStore('records');

    for (const r of records) {
      store.put({ ...r, clinicId });
    }

    return new Promise((resolve, reject) => {
      tx.oncomplete = () => resolve();
      tx.onerror = () => reject(tx.error);
    });
  } catch (e) {
    console.error('Error guardando expedientes en IndexedDB:', e);
  }
}

export async function idbGetClinicRecords(clinicId: string): Promise<ClinicalRecord[]> {
  try {
    const db = await getIDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction('records', 'readonly');
      const store = tx.objectStore('records');
      const index = store.index('clinicId');
      const req = index.getAll(clinicId);
      req.onsuccess = () => resolve(req.result || []);
      req.onerror = () => reject(req.error);
    });
  } catch (e) {
    return [];
  }
}

// 3. Guardar y Obtener Configuración de Consultorio en IndexedDB
export async function idbSaveClinicSettings(clinicId: string, settings: DoctorSettings): Promise<void> {
  try {
    const db = await getIDB();
    const tx = db.transaction('settings', 'readwrite');
    const store = tx.objectStore('settings');
    store.put({ ...settings, clinicId });
    return new Promise((resolve, reject) => {
      tx.oncomplete = () => resolve();
      tx.onerror = () => reject(tx.error);
    });
  } catch (e) {
    console.error('Error guardando settings en IndexedDB:', e);
  }
}

export async function idbGetClinicSettings(clinicId: string): Promise<DoctorSettings | null> {
  try {
    const db = await getIDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction('settings', 'readonly');
      const store = tx.objectStore('settings');
      const req = store.get(clinicId);
      req.onsuccess = () => resolve(req.result || null);
      req.onerror = () => reject(req.error);
    });
  } catch (e) {
    return null;
  }
}

// 4. Guardar Snapshot de Respaldo Maestro en Bóveda
export async function idbSaveSnapshot(payload: { clinics: ClinicAccount[]; adminContact: any }): Promise<void> {
  try {
    const db = await getIDB();
    const tx = db.transaction('vault_snapshots', 'readwrite');
    const store = tx.objectStore('vault_snapshots');
    store.put({
      timestamp: new Date().toISOString(),
      data: payload
    });
  } catch (e) {}
}

export async function idbGetLatestSnapshot(): Promise<any | null> {
  try {
    const db = await getIDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction('vault_snapshots', 'readonly');
      const store = tx.objectStore('vault_snapshots');
      const req = store.getAll();
      req.onsuccess = () => {
        const results = req.result || [];
        if (results.length === 0) resolve(null);
        results.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
        resolve(results[0]?.data || null);
      };
      req.onerror = () => reject(req.error);
    });
  } catch (e) {
    return null;
  }
}
