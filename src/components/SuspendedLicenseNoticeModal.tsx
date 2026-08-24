import React from 'react';
import { X, ShieldAlert, Phone, Mail, MessageCircle, ExternalLink, HelpCircle } from 'lucide-react';
import { getAdminContactInfo } from '../utils/authStorage';

interface SuspendedLicenseNoticeModalProps {
  isOpen: boolean;
  onClose: () => void;
  customError?: string;
  isSuspended?: boolean;
}

export const SuspendedLicenseNoticeModal: React.FC<SuspendedLicenseNoticeModalProps> = ({
  isOpen,
  onClose,
  customError,
  isSuspended = false
}) => {
  if (!isOpen) return null;

  const admin = getAdminContactInfo();
  const cleanPhone = admin.phoneWhatsApp.replace(/\D/g, '');
  const waUrl = `https://wa.me/${cleanPhone.startsWith('52') ? cleanPhone : `52${cleanPhone}`}?text=${encodeURIComponent('Hola Fernando, me comunico respecto a la licencia de mi consultorio en CLINIC CARE TOY para renovación / reactivación.')}`;
  const mailUrl = `mailto:${admin.email}?subject=${encodeURIComponent('Solicitud de Renovación / Reactivación de Licencia - CLINIC CARE TOY')}&body=${encodeURIComponent('Hola Fernando,\n\nSolicito apoyo para la renovación o reactivación de licencia de mi consultorio.\n\nNombre de la clínica / médico:\nUsuario:\nTeléfono de contacto:')}`;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-slate-100 w-full max-w-md rounded-3xl p-6 shadow-2xl space-y-5">
        
        {/* Header Icon & Title */}
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-rose-100 dark:bg-rose-950/50 text-rose-600 dark:text-rose-400 border border-rose-200 dark:border-rose-800 flex items-center justify-center">
              <ShieldAlert className="w-7 h-7" />
            </div>
            <div>
              <h3 className="font-extrabold text-base sm:text-lg text-slate-800 dark:text-slate-100">
                {isSuspended ? 'Licencia Suspendida' : 'Renovación de Licencia'}
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Contacto con el Administrador del Sistema
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-lg"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Message Box */}
        <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 space-y-2 text-xs">
          {customError && (
            <p className="font-bold text-rose-600 dark:text-rose-400 pb-1 border-b border-slate-200 dark:border-slate-700">
              {customError}
            </p>
          )}
          <p className="text-slate-700 dark:text-slate-300 leading-relaxed">
            {admin.helpMessage}
          </p>
        </div>

        {/* Administrator Contact Details Card */}
        <div className="space-y-2.5">
          <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider block">
            Vías de Contacto Directo:
          </span>

          <div className="grid grid-cols-1 gap-2 text-xs">
            {/* WhatsApp */}
            <a
              href={waUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-between p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 font-bold hover:bg-emerald-100 dark:hover:bg-emerald-950/70 transition-all group"
            >
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-emerald-600 text-white flex items-center justify-center">
                  <MessageCircle className="w-4 h-4" />
                </div>
                <div>
                  <div className="text-xs">Enviar WhatsApp al Administrador</div>
                  <div className="text-[11px] font-mono text-emerald-700 dark:text-emerald-400 font-normal">
                    {admin.phoneWhatsApp}
                  </div>
                </div>
              </div>
              <ExternalLink className="w-4 h-4 opacity-70 group-hover:opacity-100" />
            </a>

            {/* Email */}
            <a
              href={mailUrl}
              className="flex items-center justify-between p-3 rounded-xl bg-sky-50 dark:bg-sky-950/40 text-sky-800 dark:text-sky-300 border border-sky-200 dark:border-sky-800 font-bold hover:bg-sky-100 dark:hover:bg-sky-950/70 transition-all group"
            >
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-sky-600 text-white flex items-center justify-center">
                  <Mail className="w-4 h-4" />
                </div>
                <div>
                  <div className="text-xs">Enviar Correo Electrónico</div>
                  <div className="text-[11px] font-mono text-sky-700 dark:text-sky-400 font-normal">
                    {admin.email}
                  </div>
                </div>
              </div>
              <ExternalLink className="w-4 h-4 opacity-70 group-hover:opacity-100" />
            </a>

            {/* Call */}
            <a
              href={`tel:${cleanPhone}`}
              className="flex items-center justify-between p-3 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 border border-slate-300 dark:border-slate-700 font-semibold hover:bg-slate-200 dark:hover:bg-slate-700 transition-all"
            >
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-slate-700 text-white flex items-center justify-center">
                  <Phone className="w-4 h-4" />
                </div>
                <div>
                  <div className="text-xs">Llamada Telefónica</div>
                  <div className="text-[11px] font-mono text-slate-600 dark:text-slate-400 font-normal">
                    {admin.phoneWhatsApp} ({admin.adminName})
                  </div>
                </div>
              </div>
            </a>
          </div>
        </div>

        {/* Close */}
        <div className="pt-2">
          <button
            type="button"
            onClick={onClose}
            className="w-full py-2.5 rounded-xl bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-300 dark:hover:bg-slate-700 font-bold text-xs transition-colors"
          >
            Entendido / Cerrar
          </button>
        </div>

      </div>
    </div>
  );
};
