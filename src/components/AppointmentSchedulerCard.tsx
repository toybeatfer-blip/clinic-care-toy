import React from 'react';
import { AppointmentInfo, DoctorSettings, IdentificationData } from '../types';
import {
  Calendar,
  Clock,
  Send,
  MessageSquare,
  Sparkles,
  Phone,
  CheckCircle2
} from 'lucide-react';

interface AppointmentSchedulerCardProps {
  appointment?: AppointmentInfo;
  onChange: (updated: AppointmentInfo) => void;
  patientInfo: IdentificationData;
  doctorSettings?: DoctorSettings;
}

export const AppointmentSchedulerCard: React.FC<AppointmentSchedulerCardProps> = ({
  appointment = {},
  onChange,
  patientInfo,
  doctorSettings
}) => {
  const updateField = (field: keyof AppointmentInfo, val: string) => {
    onChange({
      ...appointment,
      [field]: val
    });
  };

  const patientName = `${patientInfo.nombres || 'Paciente'} ${patientInfo.apellidoPaterno || ''}`.trim();
  const phone = (patientInfo.telefonoCelular || '').replace(/\D/g, '');

  const buildWhatsAppReminderText = (): string => {
    const docName = `${doctorSettings?.prefix || 'Dr.'} ${doctorSettings?.doctorName || 'Médico Tratante'}`;
    const clinic = doctorSettings?.nombreClinica || 'Consultorio Médico';
    const address = doctorSettings?.direccionClinica ? `📍 Dirección: ${doctorSettings.direccionClinica}` : '';
    
    let dateStr = appointment.nextDate || 'próxima fecha';
    if (appointment.nextDate) {
      try {
        const d = new Date(appointment.nextDate + 'T' + (appointment.nextTime || '12:00:00'));
        dateStr = d.toLocaleDateString('es-MX', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
      } catch (e) {}
    }

    const timeStr = appointment.nextTime ? ` a las ${appointment.nextTime} hrs` : '';

    return `Hola *${patientName}* 👋, le enviamos un cordial recordatorio de su *Cita de Seguimiento Médico* 🩺:\n\n` +
      `👨‍⚕️ *Médico:* ${docName} (${doctorSettings?.especialidad || 'Consulta Médica'})\n` +
      `🏥 *Clínica:* ${clinic}\n` +
      `📅 *Fecha:* ${dateStr}${timeStr}\n` +
      (appointment.notes ? `📝 *Recomendación:* ${appointment.notes}\n` : '') +
      (address ? `${address}\n` : '') +
      `\nFavor de confirmar su asistencia respondiendo a este mensaje. ¡Le deseamos excelente día! ✨`;
  };

  const handleSendWhatsApp = () => {
    const text = encodeURIComponent(buildWhatsAppReminderText());
    let url = `https://wa.me/?text=${text}`;
    if (phone.length >= 10) {
      const cleanPhone = phone.length === 10 ? `52${phone}` : phone;
      url = `https://wa.me/${cleanPhone}?text=${text}`;
    }
    window.open(url, '_blank');
  };

  return (
    <div className="p-4 sm:p-5 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 border-b border-slate-100 dark:border-slate-800 pb-2.5">
        <div className="flex items-center gap-2">
          <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
            <Calendar className="w-4 h-4" />
          </div>
          <div>
            <h4 className="text-xs sm:text-sm font-bold uppercase tracking-wider text-emerald-800 dark:text-emerald-300">
              Próxima Cita de Control y Recordatorio por WhatsApp
            </h4>
            <p className="text-[11px] text-slate-500 dark:text-slate-400">
              Programa la revaloración del paciente y envíale un recordatorio formal a su celular
            </p>
          </div>
        </div>

        {appointment.nextDate && (
          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 flex items-center gap-1 border border-emerald-300 dark:border-emerald-800 self-start sm:self-auto">
            <CheckCircle2 className="w-3 h-3" />
            Cita Agendada
          </span>
        )}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div>
          <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
            Fecha de Próxima Cita:
          </label>
          <input
            type="date"
            value={appointment.nextDate || ''}
            onChange={(e) => updateField('nextDate', e.target.value)}
            className="w-full px-3 py-1.5 text-xs rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 font-mono font-bold text-emerald-700 dark:text-emerald-400 focus:ring-2 focus:ring-emerald-500"
          />
        </div>

        <div>
          <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
            Hora Estimada:
          </label>
          <input
            type="time"
            value={appointment.nextTime || ''}
            onChange={(e) => updateField('nextTime', e.target.value)}
            className="w-full px-3 py-1.5 text-xs rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 font-mono focus:ring-2 focus:ring-emerald-500"
          />
        </div>

        <div>
          <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
            Indicación para la cita (opcional):
          </label>
          <input
            type="text"
            value={appointment.notes || ''}
            onChange={(e) => updateField('notes', e.target.value)}
            placeholder="Ej. Acudir en ayuno de 8 hrs / Traer RX"
            className="w-full px-3 py-1.5 text-xs rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800"
          />
        </div>
      </div>

      {/* WhatsApp Action Bar */}
      <div className="p-3 rounded-xl bg-emerald-50/70 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-900/60 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-2 text-xs text-emerald-900 dark:text-emerald-200">
          <MessageSquare className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>
            {patientInfo.telefonoCelular ? (
              <>Teléfono del paciente: <strong>{patientInfo.telefonoCelular}</strong></>
            ) : (
              <span className="text-slate-500">(Sin teléfono registrado en Módulo 1)</span>
            )}
          </span>
        </div>

        <button
          type="button"
          onClick={handleSendWhatsApp}
          className="px-4 py-2 text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg shadow-sm transition-all flex items-center justify-center gap-2 self-stretch sm:self-auto"
        >
          <Send className="w-3.5 h-3.5" />
          Enviar Recordatorio por WhatsApp
        </button>
      </div>
    </div>
  );
};
