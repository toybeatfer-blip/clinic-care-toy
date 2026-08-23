import React, { useState, useRef } from 'react';
import { X, UserCog, Building2, Image as ImageIcon, Palette, Check, Upload, Trash2, Stethoscope, HeartPulse, Cross, Hospital, ShieldCheck, Sparkles } from 'lucide-react';
import { DoctorSettings } from '../types';
import { FieldWithCopy } from './FieldWithCopy';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  settings: DoctorSettings;
  onSaveSettings: (updated: DoctorSettings) => void;
}

const COLOR_THEMES = [
  { id: 'sky', name: 'Azul SAC Clásico', class: 'bg-sky-600', textClass: 'text-sky-600', borderClass: 'border-sky-500', hex: '#0284c7' },
  { id: 'emerald', name: 'Verde FABE Institucional', class: 'bg-emerald-600', textClass: 'text-emerald-600', borderClass: 'border-emerald-500', hex: '#059669' },
  { id: 'blue', name: 'Azul ALMUS Farmacia', class: 'bg-blue-600', textClass: 'text-blue-600', borderClass: 'border-blue-500', hex: '#2563eb' },
  { id: 'indigo', name: 'Índigo Quirúrgico Pro', class: 'bg-indigo-600', textClass: 'text-indigo-600', borderClass: 'border-indigo-500', hex: '#4f46e5' },
  { id: 'purple', name: 'Morado Salud Integral', class: 'bg-purple-600', textClass: 'text-purple-600', borderClass: 'border-purple-500', hex: '#9333ea' },
  { id: 'teal', name: 'Turquesa Clínico', class: 'bg-teal-600', textClass: 'text-teal-600', borderClass: 'border-teal-500', hex: '#0d9488' },
  { id: 'rose', name: 'Carmesí Hospitalario', class: 'bg-rose-600', textClass: 'text-rose-600', borderClass: 'border-rose-500', hex: '#e11d48' },
];

export const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  onClose,
  settings,
  onSaveSettings
}) => {
  const [activeTab, setActiveTab] = useState<'doctor' | 'clinic' | 'logo' | 'theme'>('doctor');
  const [formData, setFormData] = useState<DoctorSettings>(settings);
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  const updateField = <K extends keyof DoctorSettings>(key: K, value: DoctorSettings[K]) => {
    setFormData(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        alert('Por favor selecciona una imagen menor a 2MB');
        return;
      }
      const reader = new FileReader();
      reader.onload = (event) => {
        const base64 = event.target?.result as string;
        updateField('logoUrl', base64);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSave = () => {
    onSaveSettings(formData);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in">
      <div className="bg-white dark:bg-slate-900 w-full max-w-3xl rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden flex flex-col max-h-[92vh]">
        
        {/* Modal Header */}
        <div className="p-4 sm:p-5 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-gradient-to-r from-slate-800 via-slate-900 to-slate-950 text-white">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-white/10 rounded-xl">
              <UserCog className="w-6 h-6 text-sky-400" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-bold">Configuración de Identidad y Consultorio</h2>
              <p className="text-xs text-slate-300">
                Personaliza los datos del médico, dirección, logo institucional y paleta de colores
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-white/70 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 px-4 overflow-x-auto">
          <button
            type="button"
            onClick={() => setActiveTab('doctor')}
            className={`flex items-center gap-2 px-4 py-3 text-xs font-bold border-b-2 transition-all ${
              activeTab === 'doctor'
                ? 'border-sky-600 text-sky-600 dark:text-sky-400 bg-white dark:bg-slate-900'
                : 'border-transparent text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
            }`}
          >
            <UserCog className="w-4 h-4" />
            <span>Datos del Médico</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('clinic')}
            className={`flex items-center gap-2 px-4 py-3 text-xs font-bold border-b-2 transition-all ${
              activeTab === 'clinic'
                ? 'border-sky-600 text-sky-600 dark:text-sky-400 bg-white dark:bg-slate-900'
                : 'border-transparent text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
            }`}
          >
            <Building2 className="w-4 h-4" />
            <span>Dirección & Consultorio</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('logo')}
            className={`flex items-center gap-2 px-4 py-3 text-xs font-bold border-b-2 transition-all ${
              activeTab === 'logo'
                ? 'border-sky-600 text-sky-600 dark:text-sky-400 bg-white dark:bg-slate-900'
                : 'border-transparent text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
            }`}
          >
            <ImageIcon className="w-4 h-4" />
            <span>Logo Institucional</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('theme')}
            className={`flex items-center gap-2 px-4 py-3 text-xs font-bold border-b-2 transition-all ${
              activeTab === 'theme'
                ? 'border-sky-600 text-sky-600 dark:text-sky-400 bg-white dark:bg-slate-900'
                : 'border-transparent text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
            }`}
          >
            <Palette className="w-4 h-4" />
            <span>Colores y Tema</span>
          </button>
        </div>

        {/* Tab Contents */}
        <div className="p-5 sm:p-6 overflow-y-auto flex-1 space-y-4">
          
          {/* TAB 1: DATOS DEL MÉDICO */}
          {activeTab === 'doctor' && (
            <div className="space-y-4 animate-in fade-in">
              <div className="p-3 bg-sky-50 dark:bg-sky-950/40 rounded-xl border border-sky-200 dark:border-sky-800 text-xs text-sky-900 dark:text-sky-200 flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-sky-600 shrink-0" />
                <span>Estos datos aparecerán automáticamente en el membrete de impresión de recetas, notas médicas y consentimientos informados.</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-semibold text-slate-700 dark:text-slate-200">Prefijo</label>
                  <select
                    value={formData.prefix}
                    onChange={(e) => updateField('prefix', e.target.value as any)}
                    className="w-full text-xs sm:text-sm px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 focus:outline-none focus:ring-2 focus:ring-sky-500"
                  >
                    <option value="Dr.">Dr.</option>
                    <option value="Dra.">Dra.</option>
                    <option value="Médico">Médico</option>
                  </select>
                </div>

                <div className="sm:col-span-2">
                  <FieldWithCopy
                    label="Nombre Completo del Médico"
                    value={formData.doctorName}
                    onChange={(v) => updateField('doctorName', v)}
                    placeholder="Ej. Carlos Morales Hernández"
                    required
                  />
                </div>

                <FieldWithCopy
                  label="Cédula Profesional General"
                  value={formData.cedulaGeneral}
                  onChange={(v) => updateField('cedulaGeneral', v)}
                  placeholder="Ej. 12345678"
                  required
                />

                <FieldWithCopy
                  label="Cédula de Especialidad (Opcional)"
                  value={formData.cedulaEspecialidad || ''}
                  onChange={(v) => updateField('cedulaEspecialidad', v)}
                  placeholder="Ej. AEC-987654"
                />

                <FieldWithCopy
                  label="Especialidad / Área"
                  value={formData.especialidad}
                  onChange={(v) => updateField('especialidad', v)}
                  placeholder="Ej. Medicina General / Primer Contacto"
                  quickFillOptions={['Medicina General', 'Medicina Familiar', 'Urgencias Médicas', 'Pediatría']}
                />

                <div className="sm:col-span-3">
                  <FieldWithCopy
                    label="Institución / Universidad de Egreso"
                    value={formData.universidad}
                    onChange={(v) => updateField('universidad', v)}
                    placeholder="Ej. Facultad de Medicina, UNAM"
                    quickFillOptions={['Universidad Nacional Autónoma de México (UNAM)', 'Instituto Politécnico Nacional (IPN)', 'Universidad de Guadalajara (UDG)', 'Universidad Autónoma de Nuevo León (UANL)']}
                  />
                </div>

                <FieldWithCopy
                  label="Teléfono Móvil de Contacto"
                  value={formData.telefonoContacto}
                  onChange={(v) => updateField('telefonoContacto', v)}
                  placeholder="Ej. 55 1234 5678"
                />

                <div className="sm:col-span-2">
                  <FieldWithCopy
                    label="Correo Electrónico Profesional"
                    value={formData.correoContacto}
                    onChange={(v) => updateField('correoContacto', v)}
                    placeholder="dr.nombre@consultorio.med.mx"
                  />
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: DIRECCIÓN Y CONSULTORIO */}
          {activeTab === 'clinic' && (
            <div className="space-y-4 animate-in fade-in">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <FieldWithCopy
                  label="Nombre del Consultorio / Clínica"
                  value={formData.nombreClinica}
                  onChange={(v) => updateField('nombreClinica', v)}
                  placeholder="Ej. Consultorio Médico de Primer Contacto"
                  required
                />

                <FieldWithCopy
                  label="Sucursal / Identificador de Consultorio"
                  value={formData.sucursal}
                  onChange={(v) => updateField('sucursal', v)}
                  placeholder="Ej. Sucursal 1404 - Centro"
                />

                <div className="sm:col-span-2">
                  <FieldWithCopy
                    label="Dirección Completa del Consultorio"
                    value={formData.direccionClinica}
                    onChange={(v) => updateField('direccionClinica', v)}
                    placeholder="Ej. Av. Juárez #105, Col. Centro, CP 06000, Ciudad de México"
                    type="textarea"
                    rows={2}
                    required
                  />
                </div>

                <FieldWithCopy
                  label="Teléfono del Consultorio / Conmutador"
                  value={formData.telefonoClinica}
                  onChange={(v) => updateField('telefonoClinica', v)}
                  placeholder="Ej. 55 9876 5432"
                />
              </div>
            </div>
          )}

          {/* TAB 3: LOGO INSTITUCIONAL */}
          {activeTab === 'logo' && (
            <div className="space-y-4 animate-in fade-in">
              <p className="text-xs text-slate-600 dark:text-slate-300">
                Sube el logotipo de tu consultorio, clínica o farmacia institucional. Se mostrará en el encabezado del sistema y en la vista de recetas imprimibles.
              </p>

              <div className="flex flex-col sm:flex-row items-center gap-6 p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50">
                {/* Logo Preview */}
                <div className="w-28 h-28 rounded-2xl border-2 border-dashed border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 flex items-center justify-center overflow-hidden p-2 shadow-inner">
                  {formData.logoUrl ? (
                    <img src={formData.logoUrl} alt="Logo" className="max-w-full max-h-full object-contain" />
                  ) : (
                    <div className="text-center text-slate-400">
                      <ImageIcon className="w-8 h-8 mx-auto mb-1 opacity-50" />
                      <span className="text-[10px] block">Sin Logo</span>
                    </div>
                  )}
                </div>

                {/* Upload & Controls */}
                <div className="space-y-3 flex-1 text-center sm:text-left">
                  <input
                    type="file"
                    ref={fileInputRef}
                    accept="image/*"
                    onChange={handleFileUpload}
                    className="hidden"
                  />

                  <div className="flex flex-wrap items-center gap-2 justify-center sm:justify-start">
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-sky-600 hover:bg-sky-700 text-white text-xs font-semibold shadow-sm transition-all"
                    >
                      <Upload className="w-4 h-4" />
                      <span>Subir Imagen desde PC</span>
                    </button>

                    {formData.logoUrl && (
                      <button
                        type="button"
                        onClick={() => updateField('logoUrl', '')}
                        className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg bg-rose-50 hover:bg-rose-100 dark:bg-rose-950/40 text-rose-600 text-xs font-semibold border border-rose-200 dark:border-rose-800 transition-all"
                      >
                        <Trash2 className="w-4 h-4" />
                        <span>Quitar Logo</span>
                      </button>
                    )}
                  </div>

                  <p className="text-[11px] text-slate-500 dark:text-slate-400">
                    Formatos recomendados: PNG o SVG transparente, máx 2 MB.
                  </p>
                </div>
              </div>

              {/* URL Alternative */}
              <FieldWithCopy
                label="O ingresar URL directa de la imagen del Logo"
                value={formData.logoUrl.startsWith('data:') ? '' : formData.logoUrl}
                onChange={(v) => updateField('logoUrl', v)}
                placeholder="https://ejemplo.com/logo-clinica.png"
              />
            </div>
          )}

          {/* TAB 4: COLORES Y TEMA */}
          {activeTab === 'theme' && (
            <div className="space-y-4 animate-in fade-in">
              <p className="text-xs text-slate-600 dark:text-slate-300">
                Selecciona la paleta de color principal para la interfaz y acentos de las notas médicas:
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {COLOR_THEMES.map((theme) => {
                  const isSelected = formData.primaryColor === theme.id;
                  return (
                    <button
                      key={theme.id}
                      type="button"
                      onClick={() => updateField('primaryColor', theme.id as any)}
                      className={`p-3.5 rounded-xl border flex items-center justify-between text-left transition-all ${
                        isSelected
                          ? `border-2 ${theme.borderClass} bg-slate-50 dark:bg-slate-800/80 shadow-md`
                          : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:border-slate-300'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <span className={`w-6 h-6 rounded-full ${theme.class} shadow-sm shrink-0 flex items-center justify-center text-white`}>
                          {isSelected && <Check className="w-3.5 h-3.5" />}
                        </span>
                        <div>
                          <span className="font-bold text-xs text-slate-800 dark:text-slate-100 block">
                            {theme.name}
                          </span>
                          <span className="text-[10px] font-mono text-slate-500">
                            {theme.hex}
                          </span>
                        </div>
                      </div>

                      {isSelected && (
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
                          Activo
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="p-4 border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 flex items-center justify-between">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold rounded-lg bg-slate-200 hover:bg-slate-300 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 transition-colors"
          >
            Cancelar
          </button>

          <button
            type="button"
            onClick={handleSave}
            className="inline-flex items-center gap-2 px-5 py-2 text-xs font-bold rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white shadow-md transition-all active:scale-95"
          >
            <Check className="w-4 h-4" />
            <span>Guardar Configuración</span>
          </button>
        </div>
      </div>
    </div>
  );
};
