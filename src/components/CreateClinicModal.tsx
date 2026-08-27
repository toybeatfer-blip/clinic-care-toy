import React, { useState } from 'react';
import { X, Building2, User, KeyRound, ShieldCheck, Phone, Mail, MapPin, Check, Sparkles } from 'lucide-react';
import { ClinicAccount } from '../types';
import { registerClinic } from '../utils/authStorage';

interface CreateClinicModalProps {
  isOpen: boolean;
  onClose: () => void;
  onClinicCreated: (newClinic: ClinicAccount) => void;
}

export const CreateClinicModal: React.FC<CreateClinicModalProps> = ({
  isOpen,
  onClose,
  onClinicCreated
}) => {
  const [clinicName, setClinicName] = useState('');
  const [sucursal, setSucursal] = useState('');
  const [doctorName, setDoctorName] = useState('');
  const [prefix, setPrefix] = useState<'Dr.' | 'Dra.' | 'Médico'>('Dr.');
  const [cedula, setCedula] = useState('');
  const [especialidad, setEspecialidad] = useState('Medicina General');
  const [universidad, setUniversidad] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [telefono, setTelefono] = useState('');
  const [correo, setCorreo] = useState('');
  const [direccion, setDireccion] = useState('');
  const [licenseMonths, setLicenseMonths] = useState<number>(1);
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!clinicName.trim() || !doctorName.trim() || !username.trim() || !password.trim() || !cedula.trim()) {
      setError('Completa todos los campos obligatorios (*).');
      return;
    }

    // Calcular vigencia según los meses seleccionados
    const expDate = new Date();
    expDate.setDate(expDate.getDate() + (licenseMonths * 30));
    const validUntilStr = expDate.toISOString().slice(0, 10);

    const result = registerClinic({
      clinicName: clinicName.trim(),
      sucursal: sucursal.trim(),
      doctorName: doctorName.trim(),
      prefix,
      cedulaGeneral: cedula.trim(),
      especialidad: especialidad.trim(),
      universidad: universidad.trim(),
      username: username.trim(),
      passwordPlain: password.trim(),
      telefono: telefono.trim(),
      correo: correo.trim(),
      direccion: direccion.trim(),
      primaryColor: 'sky',
      licenseStatus: 'active',
      licenseValidUntil: validUntilStr
    });

    if (result.success && result.clinic) {
      onClinicCreated(result.clinic);
      // Limpiar formulario y cerrar
      setClinicName('');
      setDoctorName('');
      setUsername('');
      setPassword('');
      setCedula('');
      setTelefono('');
      setCorreo('');
      setDireccion('');
      onClose();
    } else {
      setError(result.error || 'No se pudo crear el consultorio.');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in overflow-y-auto">
      <div className="bg-slate-900 border border-slate-700 w-full max-w-2xl rounded-3xl p-6 shadow-2xl space-y-4 text-slate-100 my-8">
        
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-sky-500/20 text-sky-400 border border-sky-500/30">
              <Building2 className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-base text-white">Registrar Nuevo Consultorio</h3>
              <p className="text-xs text-slate-400">Creación directa desde el Panel de Super Administrador</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white rounded-lg"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {error && (
          <div className="p-3 rounded-xl bg-rose-500/20 border border-rose-500/30 text-rose-300 text-xs font-semibold">
            {error}
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            <div className="space-y-1">
              <label className="font-semibold text-slate-300">Nombre de la Clínica / Consultorio *</label>
              <input
                type="text"
                required
                value={clinicName}
                onChange={(e) => setClinicName(e.target.value)}
                placeholder="Ej. Clínica Santa María"
                className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-white focus:outline-none focus:ring-2 focus:ring-sky-500"
              />
            </div>

            <div className="space-y-1">
              <label className="font-semibold text-slate-300">Sucursal / Identificador</label>
              <input
                type="text"
                value={sucursal}
                onChange={(e) => setSucursal(e.target.value)}
                placeholder="Ej. Sucursal Centro"
                className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-white focus:outline-none focus:ring-2 focus:ring-sky-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
            <div className="space-y-1">
              <label className="font-semibold text-slate-300">Prefijo *</label>
              <select
                value={prefix}
                onChange={(e) => setPrefix(e.target.value as any)}
                className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-white focus:outline-none focus:ring-2 focus:ring-sky-500"
              >
                <option value="Dr.">Dr.</option>
                <option value="Dra.">Dra.</option>
                <option value="Médico">Médico</option>
              </select>
            </div>

            <div className="space-y-1 sm:col-span-2">
              <label className="font-semibold text-slate-300">Nombre Completo del Médico *</label>
              <input
                type="text"
                required
                value={doctorName}
                onChange={(e) => setDoctorName(e.target.value)}
                placeholder="Ej. Juan Pérez López"
                className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-white focus:outline-none focus:ring-2 focus:ring-sky-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            <div className="space-y-1">
              <label className="font-semibold text-slate-300">Cédula Profesional *</label>
              <input
                type="text"
                required
                value={cedula}
                onChange={(e) => setCedula(e.target.value)}
                placeholder="Ej. 12345678"
                className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-white focus:outline-none focus:ring-2 focus:ring-sky-500 font-mono"
              />
            </div>

            <div className="space-y-1">
              <label className="font-semibold text-slate-300">Especialidad</label>
              <input
                type="text"
                value={especialidad}
                onChange={(e) => setEspecialidad(e.target.value)}
                placeholder="Ej. Medicina General"
                className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-white focus:outline-none focus:ring-2 focus:ring-sky-500"
              />
            </div>
          </div>

          <div className="p-3.5 rounded-2xl bg-sky-950/40 border border-sky-800/60 space-y-3">
            <div className="flex items-center gap-2 text-sky-400 font-bold">
              <KeyRound className="w-4 h-4" />
              <span>Credenciales de Acceso para el Consultorio</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              <div className="space-y-1">
                <label className="font-semibold text-slate-300">Usuario de Acceso *</label>
                <input
                  type="text"
                  required
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="Ej. consultorio_norte"
                  className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white focus:outline-none focus:ring-2 focus:ring-sky-500 font-mono"
                />
              </div>

              <div className="space-y-1">
                <label className="font-semibold text-slate-300">Contraseña *</label>
                <input
                  type="text"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Ej. Medico2026*"
                  className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white focus:outline-none focus:ring-2 focus:ring-sky-500 font-mono"
                />
              </div>
            </div>

            <div className="space-y-1 pt-1">
              <label className="font-semibold text-slate-300">Duración Inicial de la Licencia</label>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setLicenseMonths(1)}
                  className={`px-3 py-1.5 rounded-lg font-bold border transition-all ${
                    licenseMonths === 1 ? 'bg-sky-600 text-white border-sky-500' : 'bg-slate-800 text-slate-400 border-slate-700'
                  }`}
                >
                  1 Mes (30 días)
                </button>
                <button
                  type="button"
                  onClick={() => setLicenseMonths(3)}
                  className={`px-3 py-1.5 rounded-lg font-bold border transition-all ${
                    licenseMonths === 3 ? 'bg-sky-600 text-white border-sky-500' : 'bg-slate-800 text-slate-400 border-slate-700'
                  }`}
                >
                  3 Meses (90 días)
                </button>
                <button
                  type="button"
                  onClick={() => setLicenseMonths(12)}
                  className={`px-3 py-1.5 rounded-lg font-bold border transition-all ${
                    licenseMonths === 12 ? 'bg-sky-600 text-white border-sky-500' : 'bg-slate-800 text-slate-400 border-slate-700'
                  }`}
                >
                  1 Año (365 días)
                </button>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            <div className="space-y-1">
              <label className="font-semibold text-slate-300">Teléfono / WhatsApp</label>
              <input
                type="text"
                value={telefono}
                onChange={(e) => setTelefono(e.target.value)}
                placeholder="Ej. 55 9876 5432"
                className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-white focus:outline-none focus:ring-2 focus:ring-sky-500 font-mono"
              />
            </div>

            <div className="space-y-1">
              <label className="font-semibold text-slate-300">Correo Electrónico</label>
              <input
                type="email"
                value={correo}
                onChange={(e) => setCorreo(e.target.value)}
                placeholder="doctor@ejemplo.com"
                className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-white focus:outline-none focus:ring-2 focus:ring-sky-500 font-mono"
              />
            </div>
          </div>

          <div className="pt-3 border-t border-slate-800 flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-medium"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-xl bg-sky-600 hover:bg-sky-500 text-white font-bold shadow-lg shadow-sky-600/30 flex items-center gap-1.5 transition-all"
            >
              <Check className="w-4 h-4" />
              <span>Crear Consultorio</span>
            </button>
          </div>

        </form>
      </div>
    </div>
  );
};
