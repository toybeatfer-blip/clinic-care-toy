import React, { useState, useEffect } from 'react';
import {
  Stethoscope,
  KeyRound,
  Building2,
  User,
  ShieldCheck,
  Lock,
  LogIn,
  UserPlus,
  AlertCircle,
  Sparkles,
  CheckCircle2,
  Phone,
  Mail,
  MapPin,
  HelpCircle,
  MessageCircle,
  Clock
} from 'lucide-react';
import { authenticateUser, registerClinic, getAdminContactInfo } from '../utils/authStorage';
import { pullClinicsFromCloud, pushClinicsToCloud } from '../utils/cloudStorage';
import { SessionUser } from '../types';
import { SuspendedLicenseNoticeModal } from './SuspendedLicenseNoticeModal';
import { CREATOR_LOGO_BASE64 } from '../constants/creatorBranding';

interface AuthScreenProps {
  onLoginSuccess: (session: SessionUser) => void;
}

export const AuthScreen: React.FC<AuthScreenProps> = ({ onLoginSuccess }) => {
  const [activeTab, setActiveTab] = useState<'login' | 'register'>('login');
  
  // Login State
  const [loginUser, setLoginUser] = useState('');
  const [loginPass, setLoginPass] = useState('');
  const [loginError, setLoginError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Register State
  const [regClinicName, setRegClinicName] = useState('');
  const [regSucursal, setRegSucursal] = useState('');
  const [regDoctorName, setRegDoctorName] = useState('');
  const [regPrefix, setRegPrefix] = useState<'Dr.' | 'Dra.' | 'Médico'>('Dr.');
  const [regCedula, setRegCedula] = useState('');
  const [regEspecialidad, setRegEspecialidad] = useState('Medicina General');
  const [regUniversidad, setRegUniversidad] = useState('');
  const [regUsername, setRegUsername] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [regTelefono, setRegTelefono] = useState('');
  const [regCorreo, setRegCorreo] = useState('');
  const [regDireccion, setRegDireccion] = useState('');
  const [regError, setRegError] = useState('');
  const [regSuccess, setRegSuccess] = useState(false);

  // Notice Modal for Suspended/Expired License
  const [isNoticeOpen, setIsNoticeOpen] = useState(false);
  const [noticeCustomError, setNoticeCustomError] = useState('');
  const [isSuspendedState, setIsSuspendedState] = useState(false);

  const [adminInfo, setAdminInfo] = useState(getAdminContactInfo());

  // Sincronización automática con la nube al abrir la pantalla y en tiempo real
  useEffect(() => {
    pullClinicsFromCloud().catch(() => {});

    const interval = setInterval(() => {
      pullClinicsFromCloud().catch(() => {});
    }, 4000);

    const handleUpdate = () => {
      setAdminInfo(getAdminContactInfo());
    };
    window.addEventListener('clinic_care_admin_contact_updated_v2', handleUpdate);
    window.addEventListener('storage', handleUpdate);
    return () => {
      clearInterval(interval);
      window.removeEventListener('clinic_care_admin_contact_updated_v2', handleUpdate);
      window.removeEventListener('storage', handleUpdate);
    };
  }, []);

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError('');
    setIsSubmitting(true);

    let result = authenticateUser(loginUser, loginPass);

    // Si no se encuentra localmente o no tuvo éxito inicial, jalar de la nube en tiempo real
    if (!result.success && !result.isLicenseBlocked) {
      try {
        await pullClinicsFromCloud();
        result = authenticateUser(loginUser, loginPass);
      } catch (err) {}
    }

    setIsSubmitting(false);

    if (result.success && result.session) {
      onLoginSuccess(result.session);
    } else {
      setLoginError(result.error || 'Credenciales no válidas.');
      if (result.isLicenseBlocked) {
        setNoticeCustomError(result.error || 'La licencia de este consultorio se encuentra suspendida o vencida.');
        setIsSuspendedState(true);
        setIsNoticeOpen(true);
      }
    }
  };

  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setRegError('');

    if (!regClinicName.trim() || !regDoctorName.trim() || !regUsername.trim() || !regPassword.trim() || !regCedula.trim()) {
      setRegError('Por favor completa todos los campos obligatorios (*).');
      return;
    }

    if (regPassword.length < 4) {
      setRegError('La contraseña debe tener al menos 4 caracteres.');
      return;
    }

    setIsSubmitting(true);

    const regResult = registerClinic({
      clinicName: regClinicName.trim(),
      sucursal: regSucursal.trim(),
      doctorName: regDoctorName.trim(),
      prefix: regPrefix,
      cedulaGeneral: regCedula.trim(),
      especialidad: regEspecialidad.trim(),
      universidad: regUniversidad.trim(),
      username: regUsername.trim(),
      passwordPlain: regPassword.trim(),
      telefono: regTelefono.trim(),
      correo: regCorreo.trim(),
      direccion: regDireccion.trim(),
      primaryColor: 'sky'
    });

    if (regResult.success && regResult.clinic) {
      setRegSuccess(true);
      
      // Sincronizar y blindar inmediatamente en la nube central de GitHub antes de redirigir
      try {
        await pushClinicsToCloud();
      } catch (err) {
        console.warn('Registro completado con respaldo local, subida diferida:', err);
      }

      const auth = authenticateUser(regResult.clinic.username, regResult.clinic.passwordPlain);
      if (auth.success && auth.session) {
        setTimeout(() => {
          setIsSubmitting(false);
          onLoginSuccess(auth.session!);
        }, 500);
      } else {
        setIsSubmitting(false);
      }
    } else {
      setIsSubmitting(false);
      setRegError(regResult.error || 'Error al registrar el consultorio.');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-sky-950 to-slate-900 flex flex-col justify-center items-center p-4 sm:p-6 text-slate-100 selection:bg-sky-500 selection:text-white">
      
      {/* Brand Header */}
      <div className="text-center mb-5 max-w-md flex flex-col items-center">
        <div className="relative inline-flex items-center justify-center w-24 h-24 rounded-3xl bg-white p-2 shadow-2xl shadow-sky-500/30 mb-3 border-2 border-white/30 backdrop-blur-sm">
          <img src={CREATOR_LOGO_BASE64} alt="Toy Logo Oficial" className="w-full h-full object-contain" />
          <div className="absolute -bottom-1 -right-1 bg-gradient-to-tr from-teal-500 to-sky-600 p-1.5 rounded-xl text-white shadow-md border-2 border-slate-900">
            <Stethoscope className="w-4 h-4" />
          </div>
        </div>
        <h1 className="text-2xl sm:text-3xl font-black tracking-tight bg-gradient-to-r from-sky-300 via-white to-indigo-200 bg-clip-text text-transparent">
          CLINIC CARE TOY
        </h1>
        <p className="text-xs sm:text-sm text-sky-200/80 mt-1">
          Plataforma de Consultorios Médicos Independientes & Copiloto SAC (NOM-004)
        </p>
        <div className="mt-2 inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-800/80 border border-slate-700/80 text-[11px] text-sky-300 font-semibold shadow-inner">
          <span>Creador & Autor Oficial: Toy</span>
        </div>
      </div>

      {/* Main Auth Card */}
      <div className="bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 w-full max-w-xl rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden">
        
        {/* Navigation Tabs */}
        <div className="grid grid-cols-2 border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950">
          <button
            type="button"
            onClick={() => { setActiveTab('login'); setLoginError(''); }}
            className={`py-3.5 px-4 text-xs sm:text-sm font-bold flex items-center justify-center gap-2 transition-all ${
              activeTab === 'login'
                ? 'bg-white dark:bg-slate-900 text-sky-600 dark:text-sky-400 border-b-2 border-sky-600 shadow-sm'
                : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-300'
            }`}
          >
            <LogIn className="w-4 h-4" />
            <span>Iniciar Sesión</span>
          </button>

          <button
            type="button"
            onClick={() => { setActiveTab('register'); setRegError(''); }}
            className={`py-3.5 px-4 text-xs sm:text-sm font-bold flex items-center justify-center gap-2 transition-all ${
              activeTab === 'register'
                ? 'bg-white dark:bg-slate-900 text-sky-600 dark:text-sky-400 border-b-2 border-sky-600 shadow-sm'
                : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-300'
            }`}
          >
            <UserPlus className="w-4 h-4" />
            <span>Registrar Consultorio</span>
          </button>
        </div>

        {/* TAB 1: LOGIN */}
        {activeTab === 'login' && (
          <form onSubmit={handleLoginSubmit} className="p-6 sm:p-8 space-y-5 animate-in fade-in">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-bold text-slate-800 dark:text-slate-100">Acceso a Consultorio</h2>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  Ingresa con tus credenciales o como Super Administrador.
                </p>
              </div>

              {/* Button to open Administrator Contact Info */}
              <button
                type="button"
                onClick={() => {
                  setNoticeCustomError('');
                  setIsNoticeOpen(true);
                }}
                className="text-[11px] px-2.5 py-1 rounded-lg bg-sky-50 dark:bg-sky-950/60 text-sky-700 dark:text-sky-300 border border-sky-200 dark:border-sky-800 font-semibold hover:bg-sky-100 transition-colors flex items-center gap-1"
                title="Ver datos de contacto del administrador para renovar licencia"
              >
                <HelpCircle className="w-3.5 h-3.5 text-sky-600" />
                <span>Soporte / Licencias</span>
              </button>
            </div>

            {loginError && (
              <div className="p-3.5 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 text-rose-800 dark:text-rose-200 text-xs flex items-start justify-between gap-2.5">
                <div className="flex items-start gap-2">
                  <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                  <div>
                    <strong className="block font-bold">Aviso de acceso:</strong>
                    {loginError}
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => {
                    setNoticeCustomError(loginError);
                    setIsNoticeOpen(true);
                  }}
                  className="px-2.5 py-1 rounded bg-rose-600 text-white font-bold text-[11px] shrink-0 hover:bg-rose-700 transition-colors shadow-sm"
                >
                  Contactar Admin
                </button>
              </div>
            )}

            <div className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                  <User className="w-3.5 h-3.5 text-sky-600" />
                  <span>Usuario del Consultorio / Administrador</span>
                </label>
                <input
                  type="text"
                  required
                  value={loginUser}
                  onChange={(e) => setLoginUser(e.target.value)}
                  placeholder="Ej. consultorio1404 ó Fernando01"
                  className="w-full text-sm px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/80 focus:bg-white dark:focus:bg-slate-900 focus:outline-none focus:ring-2 focus:ring-sky-500 font-mono"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                  <Lock className="w-3.5 h-3.5 text-sky-600" />
                  <span>Contraseña</span>
                </label>
                <input
                  type="password"
                  required
                  value={loginPass}
                  onChange={(e) => setLoginPass(e.target.value)}
                  placeholder="Ingresa tu contraseña"
                  className="w-full text-sm px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/80 focus:bg-white dark:focus:bg-slate-900 focus:outline-none focus:ring-2 focus:ring-sky-500"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isSubmitting || !loginUser || !loginPass}
              className="w-full py-3 rounded-xl bg-gradient-to-r from-teal-600 via-sky-600 to-indigo-600 hover:from-teal-700 hover:via-sky-700 hover:to-indigo-700 text-white font-bold text-sm shadow-lg shadow-sky-500/20 transition-all active:scale-[0.98] disabled:opacity-50 flex items-center justify-center gap-2"
            >
              <LogIn className="w-4 h-4" />
              <span>{isSubmitting ? 'Verificando...' : 'Iniciar Sesión'}</span>
            </button>

            <div className="pt-2 flex items-center justify-between text-xs text-slate-500 border-t border-slate-100 dark:border-slate-800">
              <div>
                ¿Nuevo consultorio? <button type="button" onClick={() => setActiveTab('register')} className="text-sky-600 hover:underline font-bold">Registrarse aquí</button>
              </div>

              <button
                type="button"
                onClick={() => setIsNoticeOpen(true)}
                className="text-slate-500 hover:text-sky-600 flex items-center gap-1 font-medium"
              >
                <MessageCircle className="w-3.5 h-3.5 text-emerald-500" />
                <span>WhatsApp Admin</span>
              </button>
            </div>
          </form>
        )}

        {/* TAB 2: REGISTER (1 MES DE VIGENCIA) */}
        {activeTab === 'register' && (
          <form onSubmit={handleRegisterSubmit} className="p-6 sm:p-8 space-y-4 animate-in fade-in max-h-[75vh] overflow-y-auto">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-bold text-slate-800 dark:text-slate-100">Registro de Nuevo Consultorio</h2>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  Crea tu espacio con base de datos en blanco y <strong>licencia inicial de 1 mes</strong>.
                </p>
              </div>

              <span className="text-[11px] font-bold px-2 py-1 rounded bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 flex items-center gap-1">
                <Clock className="w-3 h-3" />
                <span>1 Mes de Acceso</span>
              </span>
            </div>

            {regError && (
              <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 text-rose-800 dark:text-rose-200 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
                <span>{regError}</span>
              </div>
            )}

            {regSuccess && (
              <div className="p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-200 text-xs flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>¡Consultorio registrado con éxito! Licencia de 1 mes activada. Iniciando sesión...</span>
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 text-xs">
              <div className="sm:col-span-2 space-y-1">
                <label className="font-semibold text-slate-700 dark:text-slate-300">
                  Nombre del Consultorio / Clínica <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="Ej. Consultorio Médico San Ángel"
                  value={regClinicName}
                  onChange={(e) => setRegClinicName(e.target.value)}
                  className="w-full text-xs sm:text-sm px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-sky-500"
                />
              </div>

              <div className="space-y-1">
                <label className="font-semibold text-slate-700 dark:text-slate-300">Sucursal / Identificador</label>
                <input
                  type="text"
                  placeholder="Ej. Sucursal 1404"
                  value={regSucursal}
                  onChange={(e) => setRegSucursal(e.target.value)}
                  className="w-full text-xs sm:text-sm px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-sky-500"
                />
              </div>

              <div className="space-y-1">
                <label className="font-semibold text-slate-700 dark:text-slate-300">Prefijo</label>
                <select
                  value={regPrefix}
                  onChange={(e) => setRegPrefix(e.target.value as any)}
                  className="w-full text-xs sm:text-sm px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-sky-500"
                >
                  <option value="Dr.">Dr.</option>
                  <option value="Dra.">Dra.</option>
                  <option value="Médico">Médico</option>
                </select>
              </div>

              <div className="sm:col-span-2 space-y-1">
                <label className="font-semibold text-slate-700 dark:text-slate-300">
                  Nombre Completo del Médico <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="Ej. Roberto Sánchez García"
                  value={regDoctorName}
                  onChange={(e) => setRegDoctorName(e.target.value)}
                  className="w-full text-xs sm:text-sm px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-sky-500"
                />
              </div>

              <div className="space-y-1">
                <label className="font-semibold text-slate-700 dark:text-slate-300">
                  Cédula Profesional General <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="Ej. 87654321"
                  value={regCedula}
                  onChange={(e) => setRegCedula(e.target.value)}
                  className="w-full text-xs sm:text-sm px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-sky-500"
                />
              </div>

              <div className="space-y-1">
                <label className="font-semibold text-slate-700 dark:text-slate-300">Especialidad</label>
                <input
                  type="text"
                  placeholder="Ej. Medicina General"
                  value={regEspecialidad}
                  onChange={(e) => setRegEspecialidad(e.target.value)}
                  className="w-full text-xs sm:text-sm px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-sky-500"
                />
              </div>

              <div className="sm:col-span-2 space-y-1">
                <label className="font-semibold text-slate-700 dark:text-slate-300">Universidad de Egreso</label>
                <input
                  type="text"
                  placeholder="Ej. Facultad de Medicina, UNAM"
                  value={regUniversidad}
                  onChange={(e) => setRegUniversidad(e.target.value)}
                  className="w-full text-xs sm:text-sm px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-sky-500"
                />
              </div>

              <div className="space-y-1">
                <label className="font-semibold text-slate-700 dark:text-slate-300">
                  Usuario para Inicio de Sesión <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="Ej. dr_roberto"
                  value={regUsername}
                  onChange={(e) => setRegUsername(e.target.value.toLowerCase().replace(/\s+/g, ''))}
                  className="w-full text-xs sm:text-sm px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-sky-500 font-mono"
                />
              </div>

              <div className="space-y-1">
                <label className="font-semibold text-slate-700 dark:text-slate-300">
                  Contraseña <span className="text-rose-500">*</span>
                </label>
                <input
                  type="password"
                  required
                  placeholder="Mínimo 4 caracteres"
                  value={regPassword}
                  onChange={(e) => setRegPassword(e.target.value)}
                  className="w-full text-xs sm:text-sm px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-sky-500"
                />
              </div>

              <div className="space-y-1">
                <label className="font-semibold text-slate-700 dark:text-slate-300">Teléfono</label>
                <input
                  type="text"
                  placeholder="10 dígitos"
                  value={regTelefono}
                  onChange={(e) => setRegTelefono(e.target.value)}
                  className="w-full text-xs sm:text-sm px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-sky-500"
                />
              </div>

              <div className="space-y-1">
                <label className="font-semibold text-slate-700 dark:text-slate-300">Correo Electrónico</label>
                <input
                  type="email"
                  placeholder="correo@ejemplo.com"
                  value={regCorreo}
                  onChange={(e) => setRegCorreo(e.target.value)}
                  className="w-full text-xs sm:text-sm px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-sky-500"
                />
              </div>

              <div className="sm:col-span-2 space-y-1">
                <label className="font-semibold text-slate-700 dark:text-slate-300">Dirección del Consultorio</label>
                <input
                  type="text"
                  placeholder="Calle, No., Colonia, CP y Ciudad"
                  value={regDireccion}
                  onChange={(e) => setRegDireccion(e.target.value)}
                  className="w-full text-xs sm:text-sm px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-sky-500"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 disabled:opacity-60 text-white font-bold text-sm shadow-md transition-all active:scale-[0.98] flex items-center justify-center gap-2 mt-2"
            >
              {isSubmitting ? (
                <>
                  <Clock className="w-4 h-4 animate-spin" />
                  <span>Blindando y Sincronizando en la Nube...</span>
                </>
              ) : (
                <>
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Registrar Consultorio (Licencia de 1 Mes)</span>
                </>
              )}
            </button>
          </form>
        )}
      </div>

      {/* Notice Modal */}
      <SuspendedLicenseNoticeModal
        isOpen={isNoticeOpen}
        onClose={() => setIsNoticeOpen(false)}
        customError={noticeCustomError}
        isSuspended={isSuspendedState}
      />

      {/* Footer Info con Sello del Creador */}
      <footer className="mt-6 flex flex-col items-center gap-1.5 text-center">
        <div className="flex items-center gap-2 text-slate-400 text-xs">
          <div className="w-5 h-5 rounded-md bg-white p-0.5 border border-slate-700 flex items-center justify-center shrink-0">
            <img src={CREATOR_LOGO_BASE64} alt="Toy" className="w-full h-full object-contain" />
          </div>
          <span className="font-bold text-slate-300">Clinic Care Toy</span>
          <span>•</span>
          <span className="text-sky-400 font-semibold">Desarrollado y Blindado por Toy</span>
        </div>
        <p className="text-[10px] text-slate-500">
          Norma Oficial Mexicana NOM-004-SSA3-2012 • Todos los derechos reservados
        </p>
      </footer>
    </div>
  );
};
