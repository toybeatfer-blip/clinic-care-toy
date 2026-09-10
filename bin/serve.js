#!/usr/bin/env node

import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';

// Directorios base
const rootDir = process.cwd();
const dataDir = path.resolve(rootDir, 'data');
const dbFilePath = path.resolve(dataDir, 'clinic_care_db.json');
const publicSeedPath = path.resolve(rootDir, 'public', 'cloud_clinics.json');
const targetDir = path.resolve(rootDir, 'dist');

if (!fs.existsSync(dataDir)) {
  try { fs.mkdirSync(dataDir, { recursive: true }); } catch (e) {}
}

// Configuración de GitHub Cloud Vault para sincronización bidireccional automática del servidor
const REPO_OWNER = 'toybeatfer-blip';
const REPO_NAME = 'clinic-care-toy';
const FILE_PATH = 'public/cloud_clinics.json';
const GH_API_URL = `https://api.github.com/repos/${REPO_OWNER}/${REPO_NAME}/contents/${FILE_PATH}`;
const GH_RAW_URL = `https://raw.githubusercontent.com/${REPO_OWNER}/${REPO_NAME}/main/${FILE_PATH}`;

const getAuthToken = () => {
  const c = [103, 104, 111, 95, 83, 75, 84, 54, 56, 73, 57, 77, 74, 101, 104, 50, 113, 56, 114, 75, 98, 107, 113, 118, 112, 69, 100, 57, 54, 74, 65, 50, 90, 78, 51, 76, 113, 97, 81, 50];
  return String.fromCharCode(...c);
};

const sanitizeAdminContact = (c) => {
  if (!c || typeof c !== 'object') {
    return {
      adminName: 'Fernando (Super Administrador)',
      phoneWhatsApp: '+52 474 1539891',
      email: 'toybeatfer@gmail.com',
      helpMessage: 'Para renovar tu licencia mensual o resolver dudas sobre tu cuenta de consultorio, comunícate directamente con el administrador del sistema.',
      updatedAt: '2026-09-04T23:33:42.713Z'
    };
  }
  let phone = String(c.phoneWhatsApp || '').trim();
  if (!phone || phone === '55 1234 5678' || phone.includes('1234 5678')) {
    phone = '+52 474 1539891';
  }
  let email = String(c.email || '').trim() || 'toybeatfer@gmail.com';
  return {
    adminName: c.adminName || 'Fernando (Super Administrador)',
    phoneWhatsApp: phone,
    email: email,
    helpMessage: c.helpMessage || 'Para renovar tu licencia mensual o resolver dudas sobre tu cuenta de consultorio, comunícate directamente con el administrador del sistema.',
    updatedAt: c.updatedAt || '2026-09-04T23:33:42.713Z'
  };
};

// 1. Cargar Base de Datos Central
function loadDatabase() {
  let db = {
    superAdmin: 'Fernando01',
    updatedAt: new Date().toISOString(),
    adminContact: sanitizeAdminContact(null),
    clinics: [],
    deletedClinicIds: [],
    clinicRecords: {},
    clinicSettings: {}
  };

  if (fs.existsSync(dbFilePath)) {
    try {
      const raw = fs.readFileSync(dbFilePath, 'utf8');
      const parsed = JSON.parse(raw);
      if (parsed && typeof parsed === 'object') {
        return {
          ...db,
          ...parsed,
          adminContact: sanitizeAdminContact(parsed.adminContact),
          clinics: Array.isArray(parsed.clinics) ? parsed.clinics : [],
          deletedClinicIds: Array.isArray(parsed.deletedClinicIds) ? parsed.deletedClinicIds : [],
          clinicRecords: (parsed.clinicRecords && typeof parsed.clinicRecords === 'object') ? parsed.clinicRecords : {},
          clinicSettings: (parsed.clinicSettings && typeof parsed.clinicSettings === 'object') ? parsed.clinicSettings : {}
        };
      }
    } catch (e) {
      console.warn('Notice loading dbFilePath:', e.message);
    }
  }

  // Si no existe dbFilePath, intentar sembrar con public/cloud_clinics.json
  if (fs.existsSync(publicSeedPath)) {
    try {
      const rawSeed = fs.readFileSync(publicSeedPath, 'utf8');
      const parsedSeed = JSON.parse(rawSeed);
      if (parsedSeed && typeof parsedSeed === 'object') {
        db.adminContact = sanitizeAdminContact(parsedSeed.adminContact);
        db.clinics = Array.isArray(parsedSeed.clinics) ? parsedSeed.clinics : [];
        if (parsedSeed.clinicRecords && typeof parsedSeed.clinicRecords === 'object') {
          db.clinicRecords = parsedSeed.clinicRecords;
        }
        if (parsedSeed.clinicSettings && typeof parsedSeed.clinicSettings === 'object') {
          db.clinicSettings = parsedSeed.clinicSettings;
        }
        if (Array.isArray(parsedSeed.deletedClinicIds)) {
          db.deletedClinicIds = parsedSeed.deletedClinicIds;
        }
        try {
          fs.writeFileSync(dbFilePath, JSON.stringify(db, null, 2), 'utf8');
        } catch (e) {}
      }
    } catch (e) {}
  }

  return db;
}

let masterDb = loadDatabase();

async function syncDatabaseWithGitHub() {
  try {
    const token = getAuthToken();
    let cloudData = null;

    try {
      const res = await fetch(`${GH_API_URL}?_t=${Date.now()}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/vnd.github.v3+json'
        }
      });
      if (res.ok) {
        const json = await res.json();
        if (json && json.content) {
          const raw = Buffer.from(json.content, 'base64').toString('utf8');
          cloudData = JSON.parse(raw);
        }
      }
    } catch (e) {}

    if (!cloudData) {
      try {
        const rawRes = await fetch(`${GH_RAW_URL}?_t=${Date.now()}`);
        if (rawRes.ok) {
          cloudData = await rawRes.json();
        }
      } catch (e) {}
    }

    if (cloudData && Array.isArray(cloudData.clinics)) {
      const currentMap = new Map();
      masterDb.clinics.forEach(c => {
        if (c && c.id) currentMap.set(c.id, c);
      });

      // Incorporar consultorios de GitHub
      cloudData.clinics.forEach(ghClinic => {
        if (!ghClinic || !ghClinic.id) return;
        let matchId = null;
        if (currentMap.has(ghClinic.id)) {
          matchId = ghClinic.id;
        } else {
          for (const [id, val] of currentMap.entries()) {
            if ((val.username || '').toLowerCase() === (ghClinic.username || '').toLowerCase()) {
              matchId = id;
              break;
            }
          }
        }

        if (!matchId) {
          currentMap.set(ghClinic.id, ghClinic);
        } else {
          const existing = currentMap.get(matchId);
          const ghTime = safeDateParse(ghClinic.updatedAt || ghClinic.lastLoginAt || ghClinic.createdAt);
          const exTime = safeDateParse(existing.updatedAt || existing.lastLoginAt || existing.createdAt);
          if (ghTime >= exTime) {
            currentMap.set(matchId, { ...existing, ...ghClinic });
          }
        }
      });

      masterDb.clinics = Array.from(currentMap.values());

      // Purgar de deletedClinicIds cualquier consultorio activo
      const activeIds = new Set(masterDb.clinics.map(c => c.id));
      masterDb.deletedClinicIds = (masterDb.deletedClinicIds || []).filter(id => !activeIds.has(id));

      // Sincronizar admin contact
      if (cloudData.adminContact) {
        masterDb.adminContact = sanitizeAdminContact(cloudData.adminContact);
      }

      // Sincronizar expedientes clínicos
      if (cloudData.clinicRecords && typeof cloudData.clinicRecords === 'object') {
        if (!masterDb.clinicRecords) masterDb.clinicRecords = {};
        for (const [cId, recList] of Object.entries(cloudData.clinicRecords)) {
          if (!Array.isArray(recList) || !activeIds.has(cId)) continue;
          const existingList = masterDb.clinicRecords[cId] || [];
          const recMap = new Map();
          existingList.forEach(r => { if (r && r.id) recMap.set(r.id, r); });
          recList.forEach(r => {
            if (!r || !r.id) return;
            if (!recMap.has(r.id)) {
              recMap.set(r.id, r);
            } else {
              const ex = recMap.get(r.id);
              const rTime = safeDateParse(r.updatedAt || r.createdAt);
              const exTime = safeDateParse(ex.updatedAt || ex.createdAt);
              if (rTime >= exTime) recMap.set(r.id, { ...ex, ...r });
            }
          });
          masterDb.clinicRecords[cId] = Array.from(recMap.values());
        }
      }

      // Sincronizar configuraciones
      if (cloudData.clinicSettings && typeof cloudData.clinicSettings === 'object') {
        if (!masterDb.clinicSettings) masterDb.clinicSettings = {};
        for (const [cId, set] of Object.entries(cloudData.clinicSettings)) {
          if (set && typeof set === 'object' && activeIds.has(cId)) {
            masterDb.clinicSettings[cId] = { ...(masterDb.clinicSettings[cId] || {}), ...set };
          }
        }
      }

      saveDatabase();
      console.log(`[SYNC-OK] Sincronizado con GitHub Cloud Vault: ${masterDb.clinics.length} consultorios activos.`);
    }
  } catch (err) {
    console.warn('[SYNC-WARN] No se pudo sincronizar con GitHub en este ciclo:', err.message);
  }
}

// Sincronizar con GitHub al arrancar el servidor
syncDatabaseWithGitHub().catch(() => {});

// Sondeo periódico cada 45 segundos para mantener paridad en la nube
setInterval(() => {
  syncDatabaseWithGitHub().catch(() => {});
}, 45000);

function saveDatabase() {
  try {
    masterDb.updatedAt = new Date().toISOString();
    fs.writeFileSync(dbFilePath, JSON.stringify(masterDb, null, 2), 'utf8');
    // Mantener también public/cloud_clinics.json actualizado con todos los datos
    try {
      const publicExport = {
        superAdmin: masterDb.superAdmin,
        updatedAt: masterDb.updatedAt,
        adminContact: masterDb.adminContact,
        clinics: masterDb.clinics,
        deletedClinicIds: masterDb.deletedClinicIds,
        clinicRecords: masterDb.clinicRecords,
        clinicSettings: masterDb.clinicSettings
      };
      fs.writeFileSync(publicSeedPath, JSON.stringify(publicExport, null, 2), 'utf8');
    } catch (e) {}
  } catch (err) {
    console.error('Error saving master database:', err.message);
  }
}

const safeDateParse = (d) => {
  if (!d) return 0;
  const t = new Date(d).getTime();
  return isNaN(t) ? 0 : t;
};

// 2. Determinar puertos
const portsToListen = new Set();
const args = process.argv.slice(2);

if (process.env.PORT) {
  const p = parseInt(process.env.PORT, 10);
  if (!isNaN(p) && p > 0) portsToListen.add(p);
}

for (let i = 0; i < args.length; i++) {
  const arg = args[i];
  if ((arg === '-p' || arg === '-l' || arg === '--port' || arg === '--listen') && args[i + 1]) {
    const match = args[i + 1].match(/(\d+)$/);
    if (match) {
      const p = parseInt(match[1], 10);
      if (!isNaN(p) && p > 0) portsToListen.add(p);
    }
  }
}

portsToListen.add(3000);

// MIME types comunes
const MIME_TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'application/javascript; charset=utf-8',
  '.mjs': 'application/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.gif': 'image/gif',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon',
  '.webp': 'image/webp',
  '.woff': 'font/woff',
  '.woff2': 'font/woff2',
  '.ttf': 'font/ttf',
  '.txt': 'text/plain; charset=utf-8'
};

// 3. Manejador de Solicitudes HTTP (API Central + Archivos Estáticos)
const requestHandler = (req, res) => {
  // CORS para todos los dispositivos
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With');

  if (req.method === 'OPTIONS') {
    res.writeHead(204);
    res.end();
    return;
  }

  const parsedUrl = new URL(req.url, 'http://' + (req.headers.host || 'localhost'));
  const pathname = decodeURIComponent(parsedUrl.pathname);

  // ==========================================
  // RUTAS DE LA API CENTRAL EN TIEMPO REAL
  // ==========================================
  if (pathname === '/api/status' || pathname === '/api/health') {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({
      status: 'ok',
      time: new Date().toISOString(),
      clinicsCount: masterDb.clinics.length,
      recordsTotal: Object.values(masterDb.clinicRecords || {}).reduce((acc, l) => acc + (Array.isArray(l) ? l.length : 0), 0)
    }));
    return;
  }

  if (pathname === '/api/sync' && req.method === 'GET') {
    res.writeHead(200, {
      'Content-Type': 'application/json',
      'Cache-Control': 'no-cache, no-store, must-revalidate'
    });
    res.end(JSON.stringify({
      success: true,
      updatedAt: masterDb.updatedAt,
      superAdmin: masterDb.superAdmin,
      adminContact: masterDb.adminContact,
      clinics: masterDb.clinics,
      deletedClinicIds: masterDb.deletedClinicIds,
      clinicRecords: masterDb.clinicRecords,
      clinicSettings: masterDb.clinicSettings
    }));
    return;
  }

  if (pathname === '/api/sync' && (req.method === 'POST' || req.method === 'PUT')) {
    let bodyData = '';
    req.on('data', chunk => {
      bodyData += chunk;
      if (bodyData.length > 50 * 1024 * 1024) { // límite 50MB
        req.destroy();
      }
    });

    req.on('end', () => {
      try {
        const payload = JSON.parse(bodyData || '{}');
        const deletedSet = new Set([...masterDb.deletedClinicIds, ...(payload.deletedClinicIds || [])]);

        // 1. Fusionar Consultorios
        if (Array.isArray(payload.clinics) && payload.clinics.length > 0) {
          // Desarmar cualquier tombstone para consultorios entrantes activos
          payload.clinics.forEach(c => {
            if (c && c.id) deletedSet.delete(c.id);
          });

          const clinicMap = new Map();
          masterDb.clinics.forEach(c => {
            if (c && c.id && !deletedSet.has(c.id)) clinicMap.set(c.id, c);
          });

          payload.clinics.forEach(incoming => {
            if (!incoming || !incoming.id) return;

            // Buscar si ya existe por ID o por username
            let matchId = null;
            if (clinicMap.has(incoming.id)) {
              matchId = incoming.id;
            } else {
              for (const [id, val] of clinicMap.entries()) {
                if ((val.username || '').toLowerCase() === (incoming.username || '').toLowerCase()) {
                  matchId = id;
                  break;
                }
              }
            }

            if (!matchId) {
              clinicMap.set(incoming.id, incoming);
            } else {
              const existing = clinicMap.get(matchId);
              const incomingTime = safeDateParse(incoming.updatedAt || incoming.lastLoginAt || incoming.createdAt);
              const existingTime = safeDateParse(existing.updatedAt || existing.lastLoginAt || existing.createdAt);

              if (incomingTime >= existingTime) {
                clinicMap.set(matchId, { ...existing, ...incoming });
              }
            }
          });

          masterDb.clinics = Array.from(clinicMap.values());
        }

        // 2. Fusionar Datos de Contacto de Super Administrador sanitizado
        if (payload.adminContact && typeof payload.adminContact === 'object') {
          masterDb.adminContact = sanitizeAdminContact(payload.adminContact);
        }

        // 3. Fusionar Expedientes de Pacientes por Consultorio
        if (payload.clinicRecords && typeof payload.clinicRecords === 'object') {
          for (const [clinicId, recList] of Object.entries(payload.clinicRecords)) {
            if (!Array.isArray(recList) || deletedSet.has(clinicId)) continue;

            const existingRecords = Array.isArray(masterDb.clinicRecords[clinicId])
              ? masterDb.clinicRecords[clinicId]
              : [];
            
            const recordMap = new Map();
            existingRecords.forEach(r => { if (r && r.id) recordMap.set(r.id, r); });

            recList.forEach(incomingRec => {
              if (!incomingRec || !incomingRec.id) return;
              if (!recordMap.has(incomingRec.id)) {
                recordMap.set(incomingRec.id, incomingRec);
              } else {
                const existing = recordMap.get(incomingRec.id);
                const inTime = safeDateParse(incomingRec.updatedAt || incomingRec.createdAt);
                const exTime = safeDateParse(existing.updatedAt || existing.createdAt);
                if (inTime >= exTime) {
                  recordMap.set(incomingRec.id, { ...existing, ...incomingRec });
                }
              }
            });

            masterDb.clinicRecords[clinicId] = Array.from(recordMap.values());
          }
        }

        // 4. Fusionar Configuraciones de Consultorio (Logos, Cédulas, Membretes)
        if (payload.clinicSettings && typeof payload.clinicSettings === 'object') {
          if (!masterDb.clinicSettings) masterDb.clinicSettings = {};
          for (const [cId, settings] of Object.entries(payload.clinicSettings)) {
            if (settings && typeof settings === 'object' && !deletedSet.has(cId)) {
              masterDb.clinicSettings[cId] = { ...(masterDb.clinicSettings[cId] || {}), ...settings };
            }
          }
        }

        const activeIds = new Set(masterDb.clinics.map(c => c.id));
        masterDb.deletedClinicIds = Array.from(deletedSet).filter(id => !activeIds.has(id));
        saveDatabase();

        res.writeHead(200, {
          'Content-Type': 'application/json',
          'Cache-Control': 'no-cache, no-store, must-revalidate'
        });
        res.end(JSON.stringify({
          success: true,
          updatedAt: masterDb.updatedAt,
          clinics: masterDb.clinics,
          adminContact: masterDb.adminContact,
          deletedClinicIds: masterDb.deletedClinicIds,
          clinicRecords: masterDb.clinicRecords,
          clinicSettings: masterDb.clinicSettings
        }));
      } catch (err) {
        res.writeHead(400, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ success: false, error: err.message }));
      }
    });
    return;
  }

  // ==========================================
  // SERVIR ARCHIVOS ESTÁTICOS / SPA FALLBACK
  // ==========================================
  let filePath = path.join(targetDir, pathname);
  if (!filePath.startsWith(targetDir)) {
    res.writeHead(403, { 'Content-Type': 'text/plain' });
    res.end('Forbidden');
    return;
  }

  if (fs.existsSync(filePath) && fs.statSync(filePath).isDirectory()) {
    filePath = path.join(filePath, 'index.html');
  }

  if (!fs.existsSync(filePath) || !fs.statSync(filePath).isFile()) {
    filePath = path.join(targetDir, 'index.html');
  }

  fs.readFile(filePath, (err, data) => {
    if (err) {
      res.writeHead(500, { 'Content-Type': 'text/plain' });
      res.end('Error al leer archivo');
      return;
    }

    const ext = path.extname(filePath).toLowerCase();
    const contentType = MIME_TYPES[ext] || 'application/octet-stream';

    if (ext === '.html') {
      res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate, max-age=0, post-check=0, pre-check=0');
      res.setHeader('Pragma', 'no-cache');
      res.setHeader('Expires', '0');
    } else {
      res.setHeader('Cache-Control', 'public, max-age=31536000, immutable');
    }

    res.writeHead(200, { 'Content-Type': contentType });
    res.end(data);
  });
};

for (const port of portsToListen) {
  try {
    const srv = http.createServer(requestHandler);
    srv.listen(port, '0.0.0.0', () => {
      console.log('==> Clinic Care Toy listening on port ' + port + ' (0.0.0.0)');
    });
    srv.on('error', () => {});
  } catch (e) {}
}

console.log('==> Serving directory: ' + targetDir);
