import React, { useState, useEffect } from 'react';
import { X, UserCog, Phone, Mail, MessageSquare, Check, ShieldCheck } from 'lucide-react';
import { AdminContactInfo } from '../types';
import { getAdminContactInfo, saveAdminContactInfo } from '../utils/authStorage';

interface AdminContactModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSaved?: (updated: AdminContactInfo) => void;
}

export const AdminContactModal: React.FC<AdminContactModalProps> = ({
  isOpen,
  onClose,
  onSaved
}) => {
  const [contactData, setContactData] = useState<AdminContactInfo>(getAdminContactInfo());
  const [isSaved, setIsSaved] = useState(false);

  // Cada vez que se abre el modal, cargar los datos más recientes
  useEffect(() => {
    if (isOpen) {
      setContactData(getAdminContactInfo());
      setIsSaved(false);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Guarda en localStorage y emite el evento global en tiempo real
    saveAdminContactInfo(contactData);
    if (onSaved) onSaved(contactData);
    setIsSaved(true);
    setTimeout(() => {
      setIsSaved(false);
      onClose();
    }, 1000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-in fade-in">
      <div className="bg-slate-900 border border-slate-700 w-full max-w-lg rounded-2xl p-6 shadow-2xl space-y-4 text-slate-100">
        
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-amber-500/20 text-amber-400 border border-amber-500/30">
              <UserCog className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-base text-white">Datos de Contacto del Administrador</h3>
              <p className="text-xs text-slate-400">Actualización automática e instantánea en todo el sistema</p>
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

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          
          <div className="space-y-1">
            <label className="font-semibold text-slate-300">Nombre del Administrador</label>
            <input
              type="text"
              required
              value={contactData.adminName}
              onChange={(e) => setContactData({ ...contactData, adminName: e.target.value })}
              placeholder="Ej. Fernando (Super Administrador)"
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-800 border border-slate-700 text-white focus:outline-none focus:ring-2 focus:ring-amber-500"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            <div className="space-y-1">
              <label className="font-semibold text-slate-300 flex items-center gap-1.5">
                <Phone className="w-3.5 h-3.5 text-emerald-400" />
                <span>Teléfono / WhatsApp</span>
              </label>
              <input
                type="text"
                required
                value={contactData.phoneWhatsApp}
                onChange={(e) => setContactData({ ...contactData, phoneWhatsApp: e.target.value })}
                placeholder="Ej. 55 1234 5678"
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-800 border border-slate-700 text-white focus:outline-none focus:ring-2 focus:ring-amber-500 font-mono"
              />
            </div>

            <div className="space-y-1">
              <label className="font-semibold text-slate-300 flex items-center gap-1.5">
                <Mail className="w-3.5 h-3.5 text-sky-400" />
                <span>Correo Electrónico</span>
              </label>
              <input
                type="email"
                required
                value={contactData.email}
                onChange={(e) => setContactData({ ...contactData, email: e.target.value })}
                placeholder="correo@ejemplo.com"
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-800 border border-slate-700 text-white focus:outline-none focus:ring-2 focus:ring-amber-500 font-mono"
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="font-semibold text-slate-300 flex items-center gap-1.5">
              <MessageSquare className="w-3.5 h-3.5 text-amber-400" />
              <span>Mensaje / Instrucciones para Reactivación</span>
            </label>
            <textarea
              rows={3}
              required
              value={contactData.helpMessage}
              onChange={(e) => setContactData({ ...contactData, helpMessage: e.target.value })}
              placeholder="Instrucciones que leerán los consultorios cuando su licencia venza o esté suspendida..."
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-800 border border-slate-700 text-white focus:outline-none focus:ring-2 focus:ring-amber-500"
            />
          </div>

          <div className="pt-3 border-t border-slate-800 flex items-center justify-between">
            <span className="text-[11px] text-slate-400">
              {isSaved && <span className="text-emerald-400 font-bold">¡Datos actualizados automáticamente en vivo!</span>}
            </span>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-medium"
              >
                Cancelar
              </button>
              <button
                type="submit"
                className="px-5 py-2 rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold shadow-lg shadow-amber-500/20 flex items-center gap-1.5 transition-all"
              >
                <Check className="w-4 h-4" />
                <span>Guardar y Aplicar</span>
              </button>
            </div>
          </div>

        </form>
      </div>
    </div>
  );
};
