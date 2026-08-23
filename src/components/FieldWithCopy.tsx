import React from 'react';
import { CopyButton } from './CopyButton';
import { AlertCircle, Sparkles, CheckCircle2 } from 'lucide-react';
import { cleanForbiddenAcronyms, FORBIDDEN_ACRONYMS } from '../utils/nom004Validator';

interface FieldWithCopyProps {
  label: string;
  value: string;
  onChange: (val: string) => void;
  placeholder?: string;
  type?: 'text' | 'textarea' | 'number';
  rows?: number;
  required?: boolean;
  helpText?: string;
  quickFillOptions?: string[];
  validateNom004?: boolean;
  className?: string;
}

export const FieldWithCopy: React.FC<FieldWithCopyProps> = ({
  label,
  value,
  onChange,
  placeholder,
  type = 'text',
  rows = 3,
  required = false,
  helpText,
  quickFillOptions,
  validateNom004 = true,
  className = ''
}) => {
  // Check if forbidden acronyms exist in this field
  const forbiddenFound = validateNom004
    ? FORBIDDEN_ACRONYMS.filter(r => r.regex.test(value))
    : [];

  const handleFixAcronyms = () => {
    const cleaned = cleanForbiddenAcronyms(value);
    onChange(cleaned);
  };

  return (
    <div className={`flex flex-col gap-1.5 ${className}`}>
      <div className="flex items-center justify-between">
        <label className="text-xs font-semibold text-slate-700 dark:text-slate-200 flex items-center gap-1.5">
          {label}
          {required && <span className="text-rose-500 font-bold">*</span>}
        </label>

        <div className="flex items-center gap-1.5">
          {forbiddenFound.length > 0 && (
            <button
              type="button"
              onClick={handleFixAcronyms}
              className="inline-flex items-center gap-1 px-1.5 py-0.5 text-[10px] font-medium bg-amber-100 text-amber-800 border border-amber-300 rounded hover:bg-amber-200 transition-colors"
              title="Corregir siglas no autorizadas según NOM-004"
            >
              <Sparkles className="w-3 h-3 text-amber-600" />
              <span>Corregir ({forbiddenFound.map(f => f.acronym).join(', ')})</span>
            </button>
          )}
          <CopyButton text={value} size="sm" variant="ghost" label="" showFeedbackText={false} />
        </div>
      </div>

      {type === 'textarea' ? (
        <textarea
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          rows={rows}
          className={`w-full text-xs sm:text-sm px-3 py-2 rounded-lg border bg-white dark:bg-slate-900 focus:outline-none focus:ring-2 transition-all ${
            forbiddenFound.length > 0
              ? 'border-amber-400 focus:ring-amber-400/30'
              : 'border-slate-300 dark:border-slate-700 focus:border-sky-500 focus:ring-sky-500/20'
          }`}
        />
      ) : (
        <input
          type={type}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className={`w-full text-xs sm:text-sm px-3 py-2 rounded-lg border bg-white dark:bg-slate-900 focus:outline-none focus:ring-2 transition-all ${
            forbiddenFound.length > 0
              ? 'border-amber-400 focus:ring-amber-400/30'
              : 'border-slate-300 dark:border-slate-700 focus:border-sky-500 focus:ring-sky-500/20'
          }`}
        />
      )}

      {/* Quick fill chips */}
      {quickFillOptions && quickFillOptions.length > 0 && (
        <div className="flex flex-wrap items-center gap-1.5 mt-0.5">
          <span className="text-[10px] text-slate-500 dark:text-slate-400 font-medium">Llenado rápido:</span>
          {quickFillOptions.map((opt, i) => (
            <button
              key={i}
              type="button"
              onClick={() => onChange(opt)}
              className={`text-[10px] px-2 py-0.5 rounded-full border transition-all ${
                value === opt
                  ? 'bg-sky-100 text-sky-800 border-sky-300 font-semibold dark:bg-sky-950 dark:text-sky-300'
                  : 'bg-slate-100 text-slate-600 border-slate-200 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700'
              }`}
            >
              {opt}
            </button>
          ))}
        </div>
      )}

      {/* Help text or Audit alert */}
      {forbiddenFound.length > 0 ? (
        <p className="text-[11px] text-amber-600 dark:text-amber-400 flex items-center gap-1">
          <AlertCircle className="w-3.5 h-3.5 shrink-0" />
          <span>Contiene siglas prohibidas por auditoría NOM-004. Presiona "Corregir".</span>
        </p>
      ) : helpText ? (
        <p className="text-[11px] text-slate-500 dark:text-slate-400">{helpText}</p>
      ) : null}
    </div>
  );
};
