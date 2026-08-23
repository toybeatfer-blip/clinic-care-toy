import React, { useState } from 'react';
import { X, KeyRound, Clock, Ticket, ShieldAlert, Copy, Check, Sparkles, BookOpen } from 'lucide-react';
import { SAC_OPERATIONAL_GUIDES, generateWindowsPassword } from '../data/sacQuickGuides';
import { copyToClipboard } from '../utils/clipboard';

interface OperationalGuideModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const OperationalGuideModal: React.FC<OperationalGuideModalProps> = ({ isOpen, onClose }) => {
  const [activeTab, setActiveTab] = useState<string>('passwords');
  const [employeeNum, setEmployeeNum] = useState<string>('');
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  if (!isOpen) return null;

  const generatedWinPass = generateWindowsPassword(employeeNum);

  const handleCopy = async (key: string, text: string) => {
    const ok = await copyToClipboard(text);
    if (ok) {
      setCopiedKey(key);
      setTimeout(() => setCopiedKey(null), 2000);
    }
  };

  const getTabIcon = (id: string) => {
    switch (id) {
      case 'passwords': return <KeyRound className="w-4 h-4" />;
      case 'attendance': return <Clock className="w-4 h-4" />;
      case 'ticket-management': return <Ticket className="w-4 h-4" />;
      default: return <ShieldAlert className="w-4 h-4" />;
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in">
      <div className="bg-white dark:bg-slate-900 w-full max-w-3xl rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden flex flex-col max-h-[90vh]">
        {/* Modal Header */}
        <div className="p-4 sm:p-5 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-gradient-to-r from-sky-700 via-sky-800 to-slate-900 text-white">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-white/10 rounded-xl">
              <BookOpen className="w-6 h-6 text-sky-300" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-bold">Manual Operativo del SAC & Soporte</h2>
              <p className="text-xs text-sky-200">Guía rápida de acceso, contraseñas, biométrico ADS y gestión de tickets</p>
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
        <div className="flex border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 px-3 overflow-x-auto">
          {SAC_OPERATIONAL_GUIDES.map(guide => (
            <button
              key={guide.id}
              onClick={() => setActiveTab(guide.id)}
              className={`flex items-center gap-2 px-4 py-3 text-xs font-semibold border-b-2 whitespace-nowrap transition-all ${
                activeTab === guide.id
                  ? 'border-sky-600 text-sky-600 dark:text-sky-400 bg-white dark:bg-slate-900'
                  : 'border-transparent text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
              }`}
            >
              {getTabIcon(guide.id)}
              <span>{guide.title}</span>
            </button>
          ))}
        </div>

        {/* Tab Content Area */}
        <div className="p-5 overflow-y-auto space-y-5 flex-1">
          {/* Quick Helper Widget if on Passwords tab */}
          {activeTab === 'passwords' && (
            <div className="p-4 bg-sky-50 dark:bg-sky-950/40 rounded-xl border border-sky-200 dark:border-sky-800 space-y-3">
              <div className="flex items-center gap-2 text-sky-900 dark:text-sky-200 font-bold text-sm">
                <Sparkles className="w-4 h-4 text-sky-600 dark:text-sky-400" />
                <span>Generador Instantáneo de Contraseña de Windows de Consultorio</span>
              </div>
              <p className="text-xs text-sky-800 dark:text-sky-300">
                Ingresa tu número de empleado o el identificador del consultorio para calcular la contraseña de inicio de sesión de Windows:
              </p>
              <div className="flex flex-col sm:flex-row items-center gap-3">
                <input
                  type="text"
                  placeholder="Ej. 140468"
                  value={employeeNum}
                  onChange={(e) => setEmployeeNum(e.target.value)}
                  className="w-full sm:w-48 text-sm px-3 py-2 rounded-lg border border-sky-300 dark:border-sky-700 bg-white dark:bg-slate-900 focus:outline-none focus:ring-2 focus:ring-sky-500 font-mono"
                />
                {generatedWinPass ? (
                  <div className="flex items-center gap-2 bg-white dark:bg-slate-900 px-3 py-2 rounded-lg border border-sky-300 dark:border-sky-700">
                    <span className="text-xs text-slate-500">Contraseña:</span>
                    <span className="font-mono font-bold text-sky-700 dark:text-sky-300 text-sm">
                      {generatedWinPass}
                    </span>
                    <button
                      onClick={() => handleCopy('winpass', generatedWinPass)}
                      className="p-1 text-slate-500 hover:text-sky-600 rounded"
                    >
                      {copiedKey === 'winpass' ? <Check className="w-4 h-4 text-emerald-500" /> : <Copy className="w-4 h-4" />}
                    </button>
                  </div>
                ) : (
                  <span className="text-xs text-slate-500 italic">Mínimo 6 dígitos requeridos</span>
                )}
              </div>

              {/* SAC Universal Default Passwords */}
              <div className="pt-2 border-t border-sky-200 dark:border-sky-800/60 flex flex-wrap items-center gap-3">
                <span className="text-xs font-semibold text-sky-900 dark:text-sky-200">
                  Contraseñas SAC Iniciales Universales:
                </span>
                {['Umeb123#', 'Umeb123$'].map(pass => (
                  <button
                    key={pass}
                    onClick={() => handleCopy(pass, pass)}
                    className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded bg-white dark:bg-slate-900 border border-sky-300 dark:border-sky-700 text-xs font-mono font-bold text-slate-700 dark:text-slate-200 hover:border-sky-500"
                  >
                    <span>{pass}</span>
                    {copiedKey === pass ? <Check className="w-3 h-3 text-emerald-500" /> : <Copy className="w-3 h-3 text-slate-400" />}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Guide Steps */}
          {SAC_OPERATIONAL_GUIDES.filter(g => g.id === activeTab).map(guide => (
            <div key={guide.id} className="space-y-4">
              <div>
                <h3 className="text-base font-bold text-slate-800 dark:text-slate-100">{guide.title}</h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">{guide.summary}</p>
              </div>

              <div className="space-y-2.5">
                {guide.steps.map((step, idx) => (
                  <div key={idx} className="flex items-start gap-3 p-3 rounded-lg bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-800">
                    <span className="flex items-center justify-center w-5 h-5 rounded-full bg-sky-100 dark:bg-sky-900 text-sky-700 dark:text-sky-300 text-xs font-bold shrink-0">
                      {idx + 1}
                    </span>
                    <p className="text-xs sm:text-sm text-slate-700 dark:text-slate-200 leading-relaxed">
                      {step}
                    </p>
                  </div>
                ))}
              </div>

              {guide.alert && (
                <div className="p-3.5 rounded-lg bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-800 flex items-start gap-3 text-rose-900 dark:text-rose-200">
                  <ShieldAlert className="w-5 h-5 text-rose-600 dark:text-rose-400 shrink-0 mt-0.5" />
                  <div className="text-xs leading-relaxed">
                    <strong className="block font-bold mb-0.5">Alerta Operativa:</strong>
                    {guide.alert}
                  </div>
                </div>
              )}

              {guide.tips && guide.tips.length > 0 && (
                <div className="p-3.5 rounded-lg bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800 space-y-1">
                  <span className="text-xs font-bold text-emerald-800 dark:text-emerald-300 flex items-center gap-1.5">
                    💡 Recomendaciones de Turno:
                  </span>
                  <ul className="list-disc list-inside text-xs text-emerald-900 dark:text-emerald-200 space-y-0.5 pl-1">
                    {guide.tips.map((tip, i) => (
                      <li key={i}>{tip}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Modal Footer */}
        <div className="p-4 border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold rounded-lg bg-slate-200 hover:bg-slate-300 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 transition-colors"
          >
            Cerrar Manual
          </button>
        </div>
      </div>
    </div>
  );
};
