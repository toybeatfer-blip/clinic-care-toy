import React, { useState } from 'react';
import { Stethoscope, KeyRound, Building2, User, ShieldCheck, Lock, LogIn, UserPlus, AlertCircle, Sparkles, CheckCircle2, Phone, Mail, MapPin } from 'lucide-react';
import { authenticateUser, registerClinic } from '../utils/authStorage';
import { SessionUser } from '../types';

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

  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError('');
    setIsSubmitting(true);

    const result = authenticateUser(loginUser, loginPass);
    setIsSubmitting(false);

    if (result.success && result.session) {
      onLoginSuccess(result.session);
    } else {
      setLoginError(result.error || 'Credenciales no válidas.');
    }
  };

  const handleRegisterSubmit = (e: React.FormEvent) => {
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
      // Iniciar sesión automáticamente tras registro exitoso
      const auth = authenticateUser(regResult.clinic.username, regResult.clinic.passwordPlain);
      if (auth.success && auth.session) {
        setTimeout(() => {
          onLoginSuccess(auth.session!);
        }, 800);
      }
    } else {
      setRegError(regResult.error || 'Error al registrar el consultorio.');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-sky-950 to-slate-900 flex flex-col justify-center items-center p-4 sm:p-6 text-slate-100 selection:bg-sky-500 selection:text-white">
      
      {/* Brand Header */}
      <div className="text-center mb-6 max-w-md">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-tr from-sky-500 to-indigo-600 shadow-xl shadow-sky-500/20 mb-3 text-white">
          <Stethoscope className="w-9 h-9" />
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight bg-gradient-to-r from-sky-300 via-white to-indigo-200 bg-clip-text text-transparent">
          CLINIC CARE TOY
        </h1>
        <p className="text-xs sm:text-sm text-sky-200/80 mt-1">
          Plataforma de Consultorios Médicos Independientes & Copiloto SAC (NOM-004)
        </p>
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
            <div>
              <h2 className="text-lg font-bold text-slate-800 dark:text-slate-100">Acceso a Consultorio</h2>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Ingresa con las credenciales de tu consultorio o como Super Administrador.
              </p>
            </div>

            {loginError && (
              <div className="p-3.5 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 text-rose-800 dark:text-rose-200 text-xs flex items-start gap-2.5">
                <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                <div>
                  <strong className="block font-bold">Error de inicio de sesión:</strong>
                  {loginError}
                </div>
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
                  className="w-full text-sm px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/80 focus:bg-white dark:focus:bg-slate-900 focus:outline-none focus:ring-2 focus:ring-sky-500"
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
              className="w-full py-3 rounded-xl bg-gradient-to-r from-sky-600 to-indigo-600 hover:from-sky-700 hover:to-indigo-700 text-white font-bold text-sm shadow-lg shadow-sky-500/20 transition-all active:scale-[0.98] disabled:opacity-50 flex items-center justify-center gap-2"
            >
              <LogIn className="w-4 h-4" />
              <span>{isSubmitting ? 'Verificando...' : 'Iniciar Sesión'}</span>
            </button>

            <div className="pt-2 text-center text-xs text-slate-500 border-t border-slate-100 dark:border-slate-800">
              ¿No tienes cuenta? <button type="button" onClick={() => setActiveTab('register')} className="text-sky-600 hover:underline font-bold">Registra tu consultorio aquí</button>
            </div>
          </form>
        )}

        {/* TAB 2: REGISTER */}
        {activeTab === 'register' && (
          <form onSubmit={handleRegisterSubmit} className="p-6 sm:p-8 space-y-4 animate-in fade-in max-h-[75vh] overflow-y-auto">
            <div>
              <h2 className="text-lg font-bold text-slate-800 dark:text-slate-100">Registro de Nuevo Consultorio</h2>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Crea el espacio y la base de datos propia e independiente para tu consultorio.
              </p>
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
                <span>¡Consultorio registrado con éxito! Iniciando sesión...</span>
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
              className="w-full py-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm shadow-md transition-all active:scale-[0.98] flex items-center justify-center gap-2 mt-2"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>Registrar y Crear Base de Datos</span>
            </button>
          </form>
        )}
      </div>

      {/* Footer Info */}
      <p className="text-[11px] text-slate-400 mt-6 text-center">
        Sistema Administrador de Consultorios • NOM-004-SSA3-2012 • Seguridad Multi-Tenant
      </p>
    </div>
  );
};
