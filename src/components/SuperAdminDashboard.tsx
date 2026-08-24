import React, { useState } from 'react';
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
  Search,
  Users,
  LogOut,
  CalendarPlus,
  PhoneCall,
  UserCog,
  Clock,
  Calendar,
  AlertCircle
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
  getAdminContactInfo
} from '../utils/authStorage';
import { AdminContactModal } from './AdminContactModal';

interface SuperAdminDashboardProps {
  onLogout: () => void;
}

export const SuperAdminDashboard: React.FC<SuperAdminDashboardProps> = ({ onLogout }) => {
  const [clinics, setClinics] = useState<ClinicAccount[]>(getAllClinics());
  const [searchTerm, setSearchTerm] = useState('');
  const [editingClinic, setEditingClinic] = useState<ClinicAccount | null>(null);
  const [showPasswordMap, setShowPasswordMap] = useState<{ [id: string]: boolean }>({});
  const [isContactModalOpen, setIsContactModalOpen] = useState(false);
  const [adminContact, setAdminContact] = useState<AdminContactInfo>(getAdminContactInfo());

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
    const all = getAllClinics();
    const updated = all.map(c => c.id === editingClinic.id ? editingClinic : c);
    saveAllClinics(updated);
    setClinics(updated);
    setEditingClinic(null);
  };

  const handleExportMasterBackup = () => {
    const all = getAllClinics();
    const masterData = {
      exportedAt: new Date().toISOString(),
      superAdmin: 'Fernando01',
      adminContact,
      totalClinics: all.length,
      clinics: all.map(c => ({
        ...c,
        patients: getClinicRecords(c.id)
      }))
    };

    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(masterData, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", `master_respaldo_consultorios_${new Date().toISOString().slice(0,10)}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  const filteredClinics = clinics.filter(c => {
    const query = searchTerm.toLowerCase();
    return (
      c.clinicName.toLowerCase().includes(query) ||
      c.doctorName.toLowerCase().includes(query) ||
      c.username.toLowerCase().includes(query) ||
      c.cedulaGeneral.toLowerCase().includes(query)
    );
  });

  const totalPatients = clinics.reduce((acc, c) => acc + getClinicRecords(c.id).length, 0);
  const activeCount = clinics.filter(c => c.licenseStatus === 'active').length;
  const suspendedCount = clinics.filter(c => c.licenseStatus !== 'active').length;

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 font-sans flex flex-col selection:bg-sky-500 selection:text-white">
      
      {/* Super Admin Top Header */}
      <header className="bg-slate-950 border-b border-slate-800 sticky top-0 z-30 shadow-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3.5 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-amber-500 to-rose-600 flex items-center justify-center text-white shadow-md shadow-rose-500/20">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="font-black text-base sm:text-lg tracking-tight text-white">
                  Panel de Super Administrador
                </h1>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30">
                  Fernando01
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Licencias mensuales (1 mes por defecto) y datos de contacto para reactivaciones
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
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
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold shadow-lg shadow-rose-600/30 transition-all active:scale-95"
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
            Editar datos de contacto &rarr;
          </button>
        </div>

        {/* KPI Stats Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div className="p-4 rounded-2xl bg-slate-800/80 border border-slate-700/80 space-y-1">
            <span className="text-xs text-slate-400 font-medium flex items-center gap-1.5">
              <Building2 className="w-4 h-4 text-sky-400" />
              <span>Total Consultorios</span>
            </span>
            <div className="text-2xl sm:text-3xl font-black text-white">{clinics.length}</div>
          </div>

          <div className="p-4 rounded-2xl bg-slate-800/80 border border-slate-700/80 space-y-1">
            <span className="text-xs text-slate-400 font-medium flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              <span>Licencias Activas</span>
            </span>
            <div className="text-2xl sm:text-3xl font-black text-emerald-400">{activeCount}</div>
          </div>

          <div className="p-4 rounded-2xl bg-slate-800/80 border border-slate-700/80 space-y-1">
            <span className="text-xs text-slate-400 font-medium flex items-center gap-1.5">
              <XCircle className="w-4 h-4 text-rose-400" />
              <span>Suspendidas / Vencidas</span>
            </span>
            <div className="text-2xl sm:text-3xl font-black text-rose-400">{suspendedCount}</div>
          </div>

          <div className="p-4 rounded-2xl bg-slate-800/80 border border-slate-700/80 space-y-1">
            <span className="text-xs text-slate-400 font-medium flex items-center gap-1.5">
              <Users className="w-4 h-4 text-indigo-400" />
              <span>Pacientes Registrados</span>
            </span>
            <div className="text-2xl sm:text-3xl font-black text-indigo-400">{totalPatients}</div>
          </div>
        </div>

        {/* Search & Actions Bar */}
        <div className="bg-slate-800/90 p-4 rounded-2xl border border-slate-700 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="relative w-full sm:w-80">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
            <input
              type="text"
              placeholder="Buscar por consultorio, médico, usuario o cédula..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-slate-600 bg-slate-900 text-slate-100 focus:outline-none focus:ring-2 focus:ring-sky-500"
            />
          </div>

          <div className="text-xs text-slate-400 font-medium">
            Mostrando {filteredClinics.length} de {clinics.length} consultorios (Licencias con ciclo de 1 mes)
          </div>
        </div>

        {/* Clinics Table List */}
        <div className="bg-slate-800/90 rounded-2xl border border-slate-700 overflow-hidden shadow-xl">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs divide-y divide-slate-700">
              <thead className="bg-slate-950/80 text-slate-400 uppercase font-semibold text-[10px] tracking-wider">
                <tr>
                  <th className="py-3 px-4">Consultorio / Médico</th>
                  <th className="py-3 px-4">Usuario & Contraseña</th>
                  <th className="py-3 px-4">Pacientes</th>
                  <th className="py-3 px-4">Vigencia Mensual (1 Mes)</th>
                  <th className="py-3 px-4">Estado</th>
                  <th className="py-3 px-4 text-right">Acciones de Licencia & Control</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-700/60 font-medium">
                {filteredClinics.length > 0 ? (
                  filteredClinics.map((clinic) => {
                    const patientCount = getClinicRecords(clinic.id).length;
                    const isShowingPass = showPasswordMap[clinic.id];
                    const remaining = getDaysRemaining(clinic.licenseValidUntil);
                    const isSuspended = clinic.licenseStatus !== 'active' || remaining.isExpired;

                    return (
                      <tr key={clinic.id} className="hover:bg-slate-700/40 transition-colors">
                        <td className="py-3.5 px-4">
                          <div className="font-bold text-white text-sm">{clinic.clinicName}</div>
                          <div className="text-sky-300 text-xs">
                            {clinic.prefix} {clinic.doctorName} {clinic.sucursal && `• ${clinic.sucursal}`}
                          </div>
                          <div className="text-[10px] text-slate-400 mt-0.5">
                            Cédula: {clinic.cedulaGeneral} • {clinic.direccion || 'Sin dirección'}
                          </div>
                        </td>

                        <td className="py-3.5 px-4">
                          <div className="font-mono text-slate-200 font-bold">{clinic.username}</div>
                          <div className="flex items-center gap-1.5 mt-0.5">
                            <span className="font-mono text-[11px] text-slate-400">
                              {isShowingPass ? clinic.passwordPlain : '••••••••'}
                            </span>
                            <button
                              type="button"
                              onClick={() => toggleShowPassword(clinic.id)}
                              className="text-[10px] text-sky-400 hover:underline"
                            >
                              {isShowingPass ? 'Ocultar' : 'Ver'}
                            </button>
                          </div>
                        </td>

                        <td className="py-3.5 px-4">
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-slate-900 border border-slate-700 text-slate-300 font-mono font-bold">
                            <Users className="w-3 h-3 text-sky-400" />
                            <span>{patientCount}</span>
                          </span>
                        </td>

                        {/* 1 Month Validity and Countdown */}
                        <td className="py-3.5 px-4">
                          <div className="font-mono text-xs text-slate-200 font-bold">
                            {clinic.licenseValidUntil || 'No asignada'}
                          </div>
                          <div className="mt-1">
                            <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold ${
                              remaining.isExpired
                                ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                                : (remaining.days <= 5
                                  ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                                  : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30')
                            }`}>
                              <Clock className="w-3 h-3" />
                              <span>{remaining.label}</span>
                            </span>
                          </div>
                        </td>

                        <td className="py-3.5 px-4">
                          <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold ${
                            !isSuspended
                              ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                              : 'bg-rose-500/20 text-rose-300 border border-rose-500/40'
                          }`}>
                            {!isSuspended ? <CheckCircle2 className="w-3 h-3" /> : <XCircle className="w-3 h-3" />}
                            <span>{!isSuspended ? 'Vigente' : (clinic.licenseStatus === 'suspended' ? 'Suspendida' : 'Vencida')}</span>
                          </span>
                        </td>

                        <td className="py-3.5 px-4 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            
                            {/* +1 Mes Renewal Button */}
                            <button
                              type="button"
                              onClick={() => handleRenew1Month(clinic)}
                              className="px-2.5 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center gap-1 shadow-sm transition-all active:scale-95"
                              title="Extender la vigencia 1 mes adicional (+30 días)"
                            >
                              <CalendarPlus className="w-3.5 h-3.5" />
                              <span>+1 Mes</span>
                            </button>

                            {/* Toggle Suspend/Activate */}
                            <button
                              type="button"
                              onClick={() => handleToggleLicense(clinic)}
                              className={`p-1.5 rounded-lg border transition-all text-xs font-semibold ${
                                !isSuspended
                                  ? 'bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border-amber-500/40'
                                  : 'bg-sky-500/20 hover:bg-sky-500/30 text-sky-300 border-sky-500/40'
                              }`}
                              title={!isSuspended ? 'Suspender / Desactivar licencia' : 'Activar licencia'}
                            >
                              <Power className="w-3.5 h-3.5" />
                            </button>

                            {/* Edit Clinic */}
                            <button
                              type="button"
                              onClick={() => setEditingClinic({ ...clinic })}
                              className="p-1.5 rounded-lg bg-slate-700 hover:bg-slate-600 text-slate-200 border border-slate-600"
                              title="Editar datos y fecha de vigencia exacta"
                            >
                              <Edit3 className="w-3.5 h-3.5" />
                            </button>

                            {/* Delete Clinic */}
                            <button
                              type="button"
                              onClick={() => handleDeleteClinic(clinic)}
                              className="p-1.5 rounded-lg bg-rose-500/20 hover:bg-rose-500/30 text-rose-300 border border-rose-500/40"
                              title="Eliminar consultorio"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                ) : (
                  <tr>
                    <td colSpan={6} className="py-8 text-center text-slate-400">
                      No se encontraron consultorios registrados.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </main>

      {/* Admin Contact Edit Modal */}
      <AdminContactModal
        isOpen={isContactModalOpen}
        onClose={() => setIsContactModalOpen(false)}
        onSaved={(updated) => setAdminContact(updated)}
      />

      {/* Edit Clinic Modal */}
      {editingClinic && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-in fade-in">
          <div className="bg-slate-900 border border-slate-700 w-full max-w-lg rounded-2xl p-6 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="font-bold text-base text-white flex items-center gap-2">
                <Edit3 className="w-4 h-4 text-sky-400" />
                <span>Editar Consultorio & Licencia</span>
              </h3>
              <button onClick={() => setEditingClinic(null)} className="text-slate-400 hover:text-white">
                <XCircle className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveEdit} className="space-y-3.5 text-xs">
              <div className="space-y-1">
                <label className="font-semibold text-slate-300">Nombre del Consultorio</label>
                <input
                  type="text"
                  required
                  value={editingClinic.clinicName}
                  onChange={(e) => setEditingClinic({ ...editingClinic, clinicName: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg bg-slate-800 border border-slate-700 text-white focus:outline-none focus:ring-2 focus:ring-sky-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="font-semibold text-slate-300">Médico Responsable</label>
                  <input
                    type="text"
                    required
                    value={editingClinic.doctorName}
                    onChange={(e) => setEditingClinic({ ...editingClinic, doctorName: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg bg-slate-800 border border-slate-700 text-white focus:outline-none focus:ring-2 focus:ring-sky-500"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-semibold text-slate-300">Cédula Profesional</label>
                  <input
                    type="text"
                    required
                    value={editingClinic.cedulaGeneral}
                    onChange={(e) => setEditingClinic({ ...editingClinic, cedulaGeneral: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg bg-slate-800 border border-slate-700 text-white focus:outline-none focus:ring-2 focus:ring-sky-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="font-semibold text-slate-300">Usuario de Acceso</label>
                  <input
                    type="text"
                    required
                    value={editingClinic.username}
                    onChange={(e) => setEditingClinic({ ...editingClinic, username: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg bg-slate-800 border border-slate-700 text-white font-mono focus:outline-none focus:ring-2 focus:ring-sky-500"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-semibold text-slate-300">Contraseña</label>
                  <input
                    type="text"
                    required
                    value={editingClinic.passwordPlain}
                    onChange={(e) => setEditingClinic({ ...editingClinic, passwordPlain: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg bg-slate-800 border border-slate-700 text-white font-mono focus:outline-none focus:ring-2 focus:ring-sky-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="font-semibold text-slate-300">Estatus de Licencia</label>
                  <select
                    value={editingClinic.licenseStatus}
                    onChange={(e) => setEditingClinic({ ...editingClinic, licenseStatus: e.target.value as any })}
                    className="w-full px-3 py-2 rounded-lg bg-slate-800 border border-slate-700 text-white focus:outline-none focus:ring-2 focus:ring-sky-500"
                  >
                    <option value="active">Activa (Vigente)</option>
                    <option value="suspended">Suspendida (Desactivada)</option>
                    <option value="expired">Vencida</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="font-semibold text-slate-300">Fecha de Vencimiento (YYYY-MM-DD)</label>
                  <input
                    type="date"
                    required
                    value={editingClinic.licenseValidUntil}
                    onChange={(e) => setEditingClinic({ ...editingClinic, licenseValidUntil: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg bg-slate-800 border border-slate-700 text-white focus:outline-none focus:ring-2 focus:ring-sky-500 font-mono"
                  />
                </div>
              </div>

              {/* Quick 1 month / 3 months shortcuts */}
              <div className="flex items-center gap-2 pt-1">
                <span className="text-[11px] text-slate-400">Atajos de vigencia:</span>
                <button
                  type="button"
                  onClick={() => {
                    const d = new Date();
                    d.setDate(d.getDate() + 30);
                    setEditingClinic({ ...editingClinic, licenseValidUntil: d.toISOString().slice(0,10), licenseStatus: 'active' });
                  }}
                  className="px-2 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 text-[11px]"
                >
                  1 Mes (+30d)
                </button>
                <button
                  type="button"
                  onClick={() => {
                    const d = new Date();
                    d.setDate(d.getDate() + 90);
                    setEditingClinic({ ...editingClinic, licenseValidUntil: d.toISOString().slice(0,10), licenseStatus: 'active' });
                  }}
                  className="px-2 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 text-[11px]"
                >
                  3 Meses (+90d)
                </button>
                <button
                  type="button"
                  onClick={() => {
                    const d = new Date();
                    d.setFullYear(d.getFullYear() + 1);
                    setEditingClinic({ ...editingClinic, licenseValidUntil: d.toISOString().slice(0,10), licenseStatus: 'active' });
                  }}
                  className="px-2 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 text-[11px]"
                >
                  1 Año
                </button>
              </div>

              <div className="pt-3 border-t border-slate-800 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setEditingClinic(null)}
                  className="px-4 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-lg bg-sky-600 hover:bg-sky-700 text-white font-bold"
                >
                  Guardar Cambios
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
