import React, { useState, useEffect, useRef } from 'react';
import {
  ShieldCheck,
  Building2,
  User,
  KeyRound,
  CheckCircle2,
  XCircle,
  Trash2,
  Edit3,
  Power,
  Download,
  Upload,
  Search,
  Users,
  LogOut,
  CalendarPlus,
  PhoneCall,
  UserCog,
  Clock,
  Calendar,
  AlertCircle,
  RefreshCw,
  Plus,
  Database,
  Eye
} from 'lucide-react';
import { ClinicAccount, AdminContactInfo } from '../types';
import {
  getAllClinics,
  setClinicLicense,
  deleteClinic,
  saveAllClinics,
  getClinicRecords,
  renewClinicLicense,
  getDaysRemaining,
  getAdminContactInfo,
  exportMasterDatabaseBackupJSON,
  importMasterDatabaseBackupJSON,
  deepScanAllClinics,
  initClinicDatabase,
  CLINICS_UPDATED_EVENT,
  ADMIN_CONTACT_EVENT
} from '../utils/authStorage';
import {
  pullClinicsFromCloud,
  pushClinicsToCloud,
  getLastCloudSyncTime
} from '../utils/cloudStorage';
import { AdminContactModal } from './AdminContactModal';
import { CreateClinicModal } from './CreateClinicModal';
import { Cloud, CloudLightning } from 'lucide-react';
import { CREATOR_LOGO_BASE64 } from '../constants/creatorBranding';

interface SuperAdminDashboardProps {
  onLogout: () => void;
  onImpersonateClinic?: (clinic: ClinicAccount) => void;
}

export const SuperAdminDashboard: React.FC<SuperAdminDashboardProps> = ({ onLogout, onImpersonateClinic }) => {
  const [clinics, setClinics] = useState<ClinicAccount[]>(() => getAllClinics());
  const [searchTerm, setSearchTerm] = useState('');
  const [editingClinic, setEditingClinic] = useState<ClinicAccount | null>(null);
  const [showPasswordMap, setShowPasswordMap] = useState<{ [id: string]: boolean }>({});
  const [isContactModalOpen, setIsContactModalOpen] = useState(false);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [adminContact, setAdminContact] = useState<AdminContactInfo>(() => getAdminContactInfo());
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [lastSyncTime, setLastSyncTime] = useState<string | null>(() => getLastCloudSyncTime());
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Función para recargar la lista de consultorios desde la nube y almacenamiento local
  const refreshClinics = async () => {
    setIsRefreshing(true);
    try {
      await pullClinicsFromCloud();
    } catch (e) {}
    const latest = getAllClinics();
    setClinics(latest);
    setAdminContact(getAdminContactInfo());
    setLastSyncTime(getLastCloudSyncTime());
    setTimeout(() => setIsRefreshing(false), 300);
  };

  // Función de escaneo profundo y recuperación de consultorios previos
  const handleDeepScan = async () => {
    setIsRefreshing(true);
    try {
      await pullClinicsFromCloud();
    } catch (e) {}
    const { recoveredCount, clinics: rec } = await deepScanAllClinics();
    setClinics(rec);
    const pushResult = await pushClinicsToCloud(rec);
    setLastSyncTime(getLastCloudSyncTime());
    setIsRefreshing(false);
    if (pushResult.success) {
      alert(`✅ Escaneo y recuperación completada:\n\nSe detectaron ${rec.length} consultorios y médicos registrados y se blindaron con éxito en la nube.`);
    } else {
      alert(`ℹ️ Se recuperaron ${rec.length} consultorios en la memoria local blindada.`);
    }
  };

  // Sincronización automática con la nube al entrar y en tiempo real
  useEffect(() => {
    // 1. Sincronizar inmediatamente al entrar
    refreshClinics();

    // 2. Intervalo de actualización en la nube ultra-rápido cada 4 segundos (100% automático)
    const syncInterval = setInterval(() => {
      pullClinicsFromCloud().then(res => {
        if (res.success) {
          setClinics(getAllClinics());
          setLastSyncTime(getLastCloudSyncTime());
        }
      }).catch(() => {});
    }, 4000);

    const handleUpdate = () => {
      setClinics(getAllClinics());
    };

    const handleContactUpdate = (e: any) => {
      if (e?.detail) setAdminContact(e.detail);
      else setAdminContact(getAdminContactInfo());
    };

    window.addEventListener(CLINICS_UPDATED_EVENT, handleUpdate);
    window.addEventListener(ADMIN_CONTACT_EVENT, handleContactUpdate);
    window.addEventListener('storage', handleUpdate);
    window.addEventListener('focus', refreshClinics);

    return () => {
      clearInterval(syncInterval);
      window.removeEventListener(CLINICS_UPDATED_EVENT, handleUpdate);
      window.removeEventListener(ADMIN_CONTACT_EVENT, handleContactUpdate);
      window.removeEventListener('storage', handleUpdate);
      window.removeEventListener('focus', refreshClinics);
    };
  }, []);

  const toggleShowPassword = (id: string) => {
    setShowPasswordMap(prev => ({
      ...prev,
      [id]: !prev[id]
    }));
  };

  const handleToggleLicense = (clinic: ClinicAccount) => {
    const newStatus = clinic.licenseStatus === 'active' ? 'suspended' : 'active';
    const updated = setClinicLicense(clinic.id, newStatus);
    setClinics(updated);
  };

  const handleRenew1Month = (clinic: ClinicAccount) => {
    const updated = renewClinicLicense(clinic.id, 30);
    setClinics(updated);
  };

  const handleDeleteClinic = (clinic: ClinicAccount) => {
    if (window.confirm(`¿Estás SEGURO de eliminar definitivamente el consultorio "${clinic.clinicName}" del médico ${clinic.doctorName}? Esta acción borrará permanentemente su base de datos de pacientes.`)) {
      const updated = deleteClinic(clinic.id);
      setClinics(updated);
    }
  };

  const handleSaveEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingClinic) return;
    const nowStr = new Date().toISOString();
    const freshClinic = { ...editingClinic, updatedAt: nowStr };
    const all = getAllClinics();
    const updated = all.map(c => c.id === editingClinic.id ? freshClinic : c);
    saveAllClinics(updated, true);
    initClinicDatabase(freshClinic);
    setClinics(updated);
    setEditingClinic(null);
  };

  const handleExportMasterBackup = () => {
    const jsonStr = exportMasterDatabaseBackupJSON();
    const blob = new Blob([jsonStr], { type: 'application/json;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', url);
    downloadAnchor.setAttribute('download', `RESPALDO_BLINDADO_CLINIC_CARE_TOY_${new Date().toISOString().slice(0, 10)}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
    URL.revokeObjectURL(url);
  };

  const handleImportBackup = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const content = event.target?.result as string;
        const res = importMasterDatabaseBackupJSON(content);
        if (res.success) {
          refreshClinics();
          alert(`✅ Respaldo restaurado y blindado con éxito:\n\nSe sincronizaron ${res.importedCount} consultorios y sus historiales.`);
        } else {
          alert(`❌ Error al importar respaldo: ${res.error}`);
        }
      } catch (err: any) {
        alert(`❌ Error al leer el archivo de respaldo: ${err.message}`);
      }
    };
    reader.readAsText(file);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const filteredClinics = clinics.filter(c => {
    const query = (searchTerm || '').toLowerCase();
    return (
      (c.clinicName || '').toLowerCase().includes(query) ||
      (c.doctorName || '').toLowerCase().includes(query) ||
      (c.username || '').toLowerCase().includes(query) ||
      (c.cedulaGeneral || '').toLowerCase().includes(query)
    );
  });

  const totalPatients = clinics.reduce((acc, c) => acc + getClinicRecords(c.id).length, 0);
  const activeCount = clinics.filter(c => c.licenseStatus === 'active').length;
  const suspendedCount = clinics.filter(c => c.licenseStatus !== 'active').length;

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 font-sans flex flex-col selection:bg-sky-500 selection:text-white">
      
      {/* Hidden file input for backup importing */}
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleImportBackup}
        accept=".json"
        className="hidden"
      />

      {/* Super Admin Top Header */}
      <header className="bg-slate-950 border-b border-slate-800 sticky top-0 z-30 shadow-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3.5 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div className="flex items-center gap-3">
            {/* Sello Oficial del Creador: TOY */}
            <div className="w-12 h-12 rounded-2xl bg-white p-1 border-2 border-amber-500/40 shadow-lg shadow-amber-500/10 flex items-center justify-center overflow-hidden shrink-0" title="Sello Oficial del Creador - TOY">
              <img src={CREATOR_LOGO_BASE64} alt="Toy Creador" className="w-full h-full object-contain" />
            </div>

            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-amber-500 to-rose-600 flex items-center justify-center text-white shadow-md shadow-rose-500/20 shrink-0">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="font-black text-base sm:text-lg tracking-tight text-white">
                  Panel de Super Administrador
                </h1>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30">
                  Fernando01 (Creador)
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Clinic Care Toy • Control maestro de consultorios, licencias y base de datos
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {/* Cloud Sync Status Indicator */}
            <button
              type="button"
              onClick={refreshClinics}
              className={`inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold transition-all border ${
                isRefreshing
                  ? 'bg-sky-500/20 text-sky-300 border-sky-500/40 animate-pulse'
                  : 'bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-300 border-emerald-500/30'
              }`}
              title="Sincronización multi-dispositivo en la nube activa. Haz clic para sincronizar ahora."
            >
              <Cloud className={`w-4 h-4 ${isRefreshing ? 'animate-bounce text-sky-400' : 'text-emerald-400'}`} />
              <span>{isRefreshing ? 'Sincronizando Nube...' : 'Nube Conectada'}</span>
            </button>

            {/* Refresh Button */}
            <button
              type="button"
              onClick={refreshClinics}
              className={`p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 transition-all ${
                isRefreshing ? 'animate-spin text-sky-400' : ''
              }`}
              title="Actualizar / Refrescar lista de consultorios en vivo"
            >
              <RefreshCw className="w-4 h-4" />
            </button>

            {/* Create Clinic Button */}
            <button
              type="button"
              onClick={() => setIsCreateModalOpen(true)}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-sky-600 hover:bg-sky-500 text-white text-xs font-bold transition-all shadow-md shadow-sky-600/20"
            >
              <Plus className="w-4 h-4" />
              <span>+ Nuevo Consultorio</span>
            </button>

            {/* Button to configure Administrator Contact Information */}
            <button
              type="button"
              onClick={() => setIsContactModalOpen(true)}
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 border border-amber-500/30 text-xs font-bold transition-all shadow-sm"
              title="Configurar mis datos de contacto (WhatsApp / Tel / Correo) para consultorios suspendidos"
            >
              <UserCog className="w-3.5 h-3.5 text-amber-400" />
              <span>Mis Datos de Contacto</span>
            </button>

            {/* Deep Scan Historical Clinics */}
            <button
              type="button"
              onClick={handleDeepScan}
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-purple-600/20 hover:bg-purple-600/30 text-purple-300 border border-purple-500/40 text-xs font-bold transition-all shadow-sm"
              title="Escanear y recuperar automáticamente todas las clínicas y consultorios creados antes de los cambios y subirlos a la nube"
            >
              <Database className="w-3.5 h-3.5 text-purple-400" />
              <span>Recuperar Previos</span>
            </button>

            {/* Import Backup */}
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="hidden md:inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-bold transition-colors shadow-sm"
              title="Importar y sincronizar consultorios desde un archivo JSON"
            >
              <Upload className="w-3.5 h-3.5" />
              <span>Importar JSON</span>
            </button>

            {/* Export Backup */}
            <button
              type="button"
              onClick={handleExportMasterBackup}
              className="hidden md:inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-bold transition-colors shadow-sm"
              title="Descargar respaldo maestro completo de todos los consultorios"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Respaldo JSON</span>
            </button>

            {/* Red Logout Button */}
            <button
              type="button"
              onClick={onLogout}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold shadow-lg shadow-rose-600/30 transition-all active:scale-95"
            >
              <LogOut className="w-4 h-4" />
              <span>Cerrar Sesión</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6 flex-1">
        
        {/* Admin Contact Info Summary Banner */}
        <div className="bg-gradient-to-r from-slate-950 via-slate-900 to-slate-950 p-4 rounded-2xl border border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/20">
              <PhoneCall className="w-5 h-5" />
            </div>
            <div>
              <span className="text-xs text-slate-400 block font-medium">Tus datos activos de contacto para consultorios:</span>
              <span className="text-sm font-bold text-white">
                {adminContact.adminName} • WhatsApp: <strong className="text-emerald-400 font-mono">{adminContact.phoneWhatsApp}</strong> • Correo: <strong className="text-sky-400 font-mono">{adminContact.email}</strong>
              </span>
            </div>
          </div>

          <button
            type="button"
            onClick={() => setIsContactModalOpen(true)}
            className="text-xs font-bold text-amber-400 hover:underline shrink-0"
          >
            Editar datos de contacto →
          </button>
        </div>

        {/* Top KPI Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-slate-800/80 border border-slate-700/80 p-5 rounded-2xl flex items-center justify-between">
            <div>
              <span className="text-xs text-slate-400 font-medium">Consultorios Registrados</span>
              <div className="text-2xl font-black text-white mt-1">{clinics.length}</div>
            </div>
            <div className="p-3 rounded-xl bg-sky-500/10 text-sky-400 border border-sky-500/20">
              <Building2 className="w-6 h-6" />
            </div>
          </div>

          <div className="bg-slate-800/80 border border-slate-700/80 p-5 rounded-2xl flex items-center justify-between">
            <div>
              <span className="text-xs text-slate-400 font-medium">Licencias Activas</span>
              <div className="text-2xl font-black text-emerald-400 mt-1">{activeCount}</div>
            </div>
            <div className="p-3 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              <CheckCircle2 className="w-6 h-6" />
            </div>
          </div>

          <div className="bg-slate-800/80 border border-slate-700/80 p-5 rounded-2xl flex items-center justify-between">
            <div>
              <span className="text-xs text-slate-400 font-medium">Suspendidas / Vencidas</span>
              <div className="text-2xl font-black text-rose-400 mt-1">{suspendedCount}</div>
            </div>
            <div className="p-3 rounded-xl bg-rose-500/10 text-rose-400 border border-rose-500/20">
              <XCircle className="w-6 h-6" />
            </div>
          </div>

          <div className="bg-slate-800/80 border border-slate-700/80 p-5 rounded-2xl flex items-center justify-between">
            <div>
              <span className="text-xs text-slate-400 font-medium">Pacientes en Sistema</span>
              <div className="text-2xl font-black text-purple-400 mt-1">{totalPatients}</div>
            </div>
            <div className="p-3 rounded-xl bg-purple-500/10 text-purple-400 border border-purple-500/20">
              <Users className="w-6 h-6" />
            </div>
          </div>
        </div>

        {/* Table & Controls Section */}
        <div className="bg-slate-800/80 border border-slate-700/80 rounded-2xl p-5 space-y-4 shadow-xl">
          
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div className="flex items-center gap-2">
              <h2 className="font-bold text-base text-white">Directorio de Consultorios</h2>
              <span className="text-xs px-2 py-0.5 rounded-full bg-slate-700 text-slate-300 font-mono font-bold">
                {filteredClinics.length} de {clinics.length}
              </span>
            </div>

            {/* Search Input */}
            <div className="relative w-full sm:w-80">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Buscar clínica, médico, usuario, cédula..."
                className="w-full pl-9 pr-3.5 py-2 rounded-xl bg-slate-900 border border-slate-700 text-xs text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-sky-500"
              />
            </div>
          </div>

          {/* Clinics Table */}
          <div className="overflow-x-auto rounded-xl border border-slate-700/60">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-950 text-slate-400 uppercase tracking-wider font-semibold border-b border-slate-700">
                <tr>
                  <th className="py-3 px-4">Consultorio / Médico</th>
                  <th className="py-3 px-4">Usuario / Cédula</th>
                  <th className="py-3 px-4">Contraseña</th>
                  <th className="py-3 px-4">Pacientes</th>
                  <th className="py-3 px-4">Vigencia (1 Mes)</th>
                  <th className="py-3 px-4">Estado Licencia</th>
                  <th className="py-3 px-4 text-right">Acciones de Control</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-700/60 bg-slate-900/40">
                {filteredClinics.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="py-12 text-center text-slate-400 space-y-3">
                      <div className="w-12 h-12 rounded-2xl bg-slate-800 text-slate-400 flex items-center justify-center mx-auto">
                        <Building2 className="w-6 h-6" />
                      </div>
                      <p className="text-sm font-semibold text-slate-300">
                        {clinics.length === 0
                          ? 'No hay consultorios registrados aún.'
                          : 'No se encontraron consultorios con esa búsqueda.'}
                      </p>
                      {clinics.length === 0 && (
                        <button
                          type="button"
                          onClick={() => setIsCreateModalOpen(true)}
                          className="px-4 py-2 rounded-xl bg-sky-600 hover:bg-sky-500 text-white font-bold text-xs inline-flex items-center gap-1.5 shadow-md shadow-sky-600/20"
                        >
                          <Plus className="w-4 h-4" />
                          <span>Registrar Primer Consultorio</span>
                        </button>
                      )}
                    </td>
                  </tr>
                ) : (
                  filteredClinics.map((c) => {
                    const recordCount = getClinicRecords(c.id).length;
                    const isVisible = showPasswordMap[c.id];
                    const remaining = getDaysRemaining(c.licenseValidUntil);

                    return (
                      <tr key={c.id} className="hover:bg-slate-800/50 transition-colors">
                        {/* Clinic & Doctor Name */}
                        <td className="py-3.5 px-4">
                          <div className="font-bold text-white text-sm">{c.clinicName}</div>
                          <div className="text-slate-400 text-[11px] flex items-center gap-1.5 mt-0.5">
                            <span className="text-sky-400 font-semibold">{c.prefix} {c.doctorName || 'Médico Responsable'}</span>
                            {c.especialidad && <span className="text-teal-400 font-medium">• {c.especialidad}</span>}
                            {c.sucursal && <span>• {c.sucursal}</span>}
                          </div>
                          {c.telefono && (
                            <div className="text-[10px] text-slate-400 font-mono mt-0.5">
                              📞 {c.telefono} {c.correo ? `• ✉️ ${c.correo}` : ''}
                            </div>
                          )}
                          {c.direccion && (
                            <div className="text-[10px] text-slate-500 truncate max-w-xs mt-0.5">
                              📍 {c.direccion}
                            </div>
                          )}
                        </td>

                        {/* Username & Cedula */}
                        <td className="py-3.5 px-4 font-mono">
                          <div className="text-sky-300 font-bold bg-slate-950 px-2 py-0.5 rounded inline-block border border-slate-800">
                            {c.username}
                          </div>
                          <div className="text-[10px] text-slate-400 mt-1">
                            Céd: {c.cedulaGeneral || 'Sin cédula'}
                          </div>
                          {c.cedulaEspecialidad && (
                            <div className="text-[10px] text-teal-400 mt-0.5">
                              Esp: {c.cedulaEspecialidad}
                            </div>
                          )}
                        </td>

                        {/* Plain Password */}
                        <td className="py-3.5 px-4 font-mono">
                          <div className="flex items-center gap-2">
                            <span className="text-slate-300 bg-slate-950 px-2 py-1 rounded border border-slate-800 font-bold">
                              {isVisible ? c.passwordPlain : '••••••••'}
                            </span>
                            <button
                              type="button"
                              onClick={() => toggleShowPassword(c.id)}
                              className="text-[10px] text-slate-400 hover:text-white underline font-sans"
                            >
                              {isVisible ? 'Ocultar' : 'Ver'}
                            </button>
                          </div>
                        </td>

                        {/* Patients Count */}
                        <td className="py-3.5 px-4">
                          <span className="font-mono font-bold text-slate-200 bg-slate-800 px-2 py-1 rounded-lg border border-slate-700">
                            {recordCount} pacientes
                          </span>
                        </td>

                        {/* License Validity (1 Month Countdown) */}
                        <td className="py-3.5 px-4">
                          <div className="space-y-1">
                            <div className="flex items-center gap-1.5">
                              <span className="font-mono text-slate-300 text-[11px] font-bold">
                                {c.licenseValidUntil}
                              </span>
                            </div>
                            <div>
                              <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full inline-block ${
                                remaining.isExpired
                                  ? 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
                                  : remaining.days <= 7
                                    ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                                    : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                              }`}>
                                {remaining.label}
                              </span>
                            </div>
                          </div>
                        </td>

                        {/* Status */}
                        <td className="py-3.5 px-4">
                          {c.licenseStatus === 'active' && !remaining.isExpired ? (
                            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                              <CheckCircle2 className="w-3.5 h-3.5" />
                              <span>Activa</span>
                            </span>
                          ) : remaining.isExpired ? (
                            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold bg-amber-500/10 text-amber-400 border border-amber-500/20">
                              <Clock className="w-3.5 h-3.5" />
                              <span>Vencida</span>
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold bg-rose-500/10 text-rose-400 border border-rose-500/20">
                              <XCircle className="w-3.5 h-3.5" />
                              <span>Suspendida</span>
                            </span>
                          )}
                        </td>

                        {/* Actions */}
                        <td className="py-3.5 px-4 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            
                            {/* Ver / Acceder al Consultorio */}
                            {onImpersonateClinic && (
                              <button
                                type="button"
                                onClick={() => onImpersonateClinic(c)}
                                className="px-2 py-1.5 rounded-lg bg-sky-600/20 hover:bg-sky-600/30 text-sky-300 border border-sky-500/40 text-[11px] font-bold transition-all flex items-center gap-1 shadow-sm"
                                title="Ingresar directamente y ver el consultorio, recetas y pacientes como lo ve el médico"
                              >
                                <Eye className="w-3.5 h-3.5 text-sky-400" />
                                <span>Ver</span>
                              </button>
                            )}

                            {/* Quick +1 Month Button */}
                            <button
                              type="button"
                              onClick={() => handleRenew1Month(c)}
                              className="px-2.5 py-1.5 rounded-lg bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-300 border border-emerald-500/40 text-[11px] font-bold transition-all flex items-center gap-1 shadow-sm"
                              title="Extender la vigencia 1 mes adicional (+30 días)"
                            >
                              <CalendarPlus className="w-3.5 h-3.5 text-emerald-400" />
                              <span>+1 Mes</span>
                            </button>

                            {/* Toggle Suspend / Activate */}
                            <button
                              type="button"
                              onClick={() => handleToggleLicense(c)}
                              className={`p-1.5 rounded-lg border transition-all ${
                                c.licenseStatus === 'active'
                                  ? 'bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border-rose-500/30'
                                  : 'bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border-emerald-500/30'
                              }`}
                              title={c.licenseStatus === 'active' ? 'Suspender acceso a este consultorio' : 'Reactivar licencia'}
                            >
                              <Power className="w-4 h-4" />
                            </button>

                            {/* Edit */}
                            <button
                              type="button"
                              onClick={() => setEditingClinic(c)}
                              className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 transition-colors"
                              title="Editar datos, contraseña o vigencia"
                            >
                              <Edit3 className="w-4 h-4" />
                            </button>

                            {/* Delete */}
                            <button
                              type="button"
                              onClick={() => handleDeleteClinic(c)}
                              className="p-1.5 rounded-lg bg-rose-600/20 hover:bg-rose-600 text-rose-300 hover:text-white border border-rose-500/30 transition-all"
                              title="Eliminar consultorio permanentemente"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>

                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>

        </div>

      </main>

      {/* Edit Clinic Modal */}
      {editingClinic && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in">
          <div className="bg-slate-900 border border-slate-700 w-full max-w-lg rounded-2xl p-6 shadow-2xl space-y-4 text-slate-100 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="font-bold text-base text-white">Editar Consultorio: {editingClinic.clinicName}</h3>
              <button
                type="button"
                onClick={() => setEditingClinic(null)}
                className="p-1.5 text-slate-400 hover:text-white rounded-lg"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveEdit} className="space-y-3 text-xs">
              <div className="grid grid-cols-3 gap-3">
                <div className="col-span-2 space-y-1">
                  <label className="font-semibold text-slate-300">Nombre de la Clínica / Consultorio</label>
                  <input
                    type="text"
                    required
                    value={editingClinic.clinicName}
                    onChange={(e) => setEditingClinic({ ...editingClinic, clinicName: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-white focus:outline-none focus:ring-2 focus:ring-sky-500"
                  />
                </div>
                <div className="space-y-1">
                  <label className="font-semibold text-slate-300">Sucursal</label>
                  <input
                    type="text"
                    value={editingClinic.sucursal || ''}
                    onChange={(e) => setEditingClinic({ ...editingClinic, sucursal: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-white focus:outline-none focus:ring-2 focus:ring-sky-500"
                    placeholder="Matriz..."
                  />
                </div>
              </div>

              <div className="grid grid-cols-4 gap-3">
                <div className="space-y-1">
                  <label className="font-semibold text-slate-300">Prefijo</label>
                  <select
                    value={editingClinic.prefix || 'Dr.'}
                    onChange={(e) => setEditingClinic({ ...editingClinic, prefix: e.target.value as any })}
                    className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-white focus:outline-none focus:ring-2 focus:ring-sky-500"
                  >
                    <option value="Dr.">Dr.</option>
                    <option value="Dra.">Dra.</option>
                    <option value="Médico">Médico</option>
                  </select>
                </div>

                <div className="col-span-3 space-y-1">
                  <label className="font-semibold text-slate-300">Médico Responsable</label>
                  <input
                    type="text"
                    required
                    value={editingClinic.doctorName}
                    onChange={(e) => setEditingClinic({ ...editingClinic, doctorName: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-white focus:outline-none focus:ring-2 focus:ring-sky-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="font-semibold text-slate-300">Cédula General</label>
                  <input
                    type="text"
                    required
                    value={editingClinic.cedulaGeneral}
                    onChange={(e) => setEditingClinic({ ...editingClinic, cedulaGeneral: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-white focus:outline-none focus:ring-2 focus:ring-sky-500 font-mono"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-semibold text-slate-300">Cédula Especialidad (opcional)</label>
                  <input
                    type="text"
                    value={editingClinic.cedulaEspecialidad || ''}
                    onChange={(e) => setEditingClinic({ ...editingClinic, cedulaEspecialidad: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-white focus:outline-none focus:ring-2 focus:ring-sky-500 font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="font-semibold text-slate-300">Especialidad</label>
                  <input
                    type="text"
                    value={editingClinic.especialidad || 'Medicina General'}
                    onChange={(e) => setEditingClinic({ ...editingClinic, especialidad: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-white focus:outline-none focus:ring-2 focus:ring-sky-500"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-semibold text-slate-300">Teléfono</label>
                  <input
                    type="text"
                    value={editingClinic.telefono || ''}
                    onChange={(e) => setEditingClinic({ ...editingClinic, telefono: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-white focus:outline-none focus:ring-2 focus:ring-sky-500 font-mono"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="font-semibold text-slate-300">Dirección de Consulta</label>
                <input
                  type="text"
                  value={editingClinic.direccion || ''}
                  onChange={(e) => setEditingClinic({ ...editingClinic, direccion: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-white focus:outline-none focus:ring-2 focus:ring-sky-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="font-semibold text-slate-300">Usuario de Acceso</label>
                  <input
                    type="text"
                    required
                    value={editingClinic.username}
                    onChange={(e) => setEditingClinic({ ...editingClinic, username: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-white focus:outline-none focus:ring-2 focus:ring-sky-500 font-mono"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-semibold text-slate-300">Contraseña</label>
                  <input
                    type="text"
                    required
                    value={editingClinic.passwordPlain}
                    onChange={(e) => setEditingClinic({ ...editingClinic, passwordPlain: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-white focus:outline-none focus:ring-2 focus:ring-sky-500 font-mono"
                  />
                </div>
              </div>

              {/* License Expiration Control */}
              <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
                <div className="flex items-center justify-between">
                  <label className="font-semibold text-slate-300 flex items-center gap-1.5">
                    <Calendar className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Fecha de Vencimiento de Licencia</span>
                  </label>
                  <span className="text-[10px] text-slate-400 font-mono">
                    {getDaysRemaining(editingClinic.licenseValidUntil).label}
                  </span>
                </div>

                <input
                  type="date"
                  value={editingClinic.licenseValidUntil === 'Indefinida' ? '' : editingClinic.licenseValidUntil}
                  onChange={(e) => setEditingClinic({ ...editingClinic, licenseValidUntil: e.target.value || 'Indefinida' })}
                  className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-white focus:outline-none focus:ring-2 focus:ring-emerald-500 font-mono"
                />

                {/* Quick Add Days Shortcuts */}
                <div className="flex items-center gap-2 pt-1">
                  <span className="text-[10px] text-slate-400">Atajos rápidos:</span>
                  <button
                    type="button"
                    onClick={() => {
                      const d = new Date();
                      d.setDate(d.getDate() + 30);
                      setEditingClinic({ ...editingClinic, licenseValidUntil: d.toISOString().slice(0, 10), licenseStatus: 'active' });
                    }}
                    className="px-2 py-1 rounded bg-slate-800 hover:bg-slate-700 text-[10px] font-bold text-emerald-300 border border-slate-700"
                  >
                    1 Mes (+30d)
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      const d = new Date();
                      d.setDate(d.getDate() + 90);
                      setEditingClinic({ ...editingClinic, licenseValidUntil: d.toISOString().slice(0, 10), licenseStatus: 'active' });
                    }}
                    className="px-2 py-1 rounded bg-slate-800 hover:bg-slate-700 text-[10px] font-bold text-sky-300 border border-slate-700"
                  >
                    3 Meses (+90d)
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      const d = new Date();
                      d.setDate(d.getDate() + 365);
                      setEditingClinic({ ...editingClinic, licenseValidUntil: d.toISOString().slice(0, 10), licenseStatus: 'active' });
                    }}
                    className="px-2 py-1 rounded bg-slate-800 hover:bg-slate-700 text-[10px] font-bold text-amber-300 border border-slate-700"
                  >
                    1 Año
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="font-semibold text-slate-300">Estado de Licencia</label>
                  <select
                    value={editingClinic.licenseStatus}
                    onChange={(e) => setEditingClinic({ ...editingClinic, licenseStatus: e.target.value as any })}
                    className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-white focus:outline-none focus:ring-2 focus:ring-sky-500"
                  >
                    <option value="active">Activa (Vigente)</option>
                    <option value="suspended">Suspendida (Bloqueada)</option>
                    <option value="expired">Vencida</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="font-semibold text-slate-300">Teléfono / WhatsApp</label>
                  <input
                    type="text"
                    value={editingClinic.telefono}
                    onChange={(e) => setEditingClinic({ ...editingClinic, telefono: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-white focus:outline-none focus:ring-2 focus:ring-sky-500 font-mono"
                  />
                </div>
              </div>

              <div className="pt-3 border-t border-slate-800 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setEditingClinic(null)}
                  className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-medium"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-sky-600 hover:bg-sky-700 text-white font-bold shadow-lg shadow-sky-600/30"
                >
                  Guardar Cambios
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Administrator Contact Info Settings Modal */}
      <AdminContactModal
        isOpen={isContactModalOpen}
        onClose={() => setIsContactModalOpen(false)}
        onSaved={(updated) => setAdminContact(updated)}
      />

      {/* Direct Create Clinic Modal for Super Admin */}
      <CreateClinicModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onClinicCreated={(newClinic) => {
          refreshClinics();
        }}
      />

    </div>
  );
};
