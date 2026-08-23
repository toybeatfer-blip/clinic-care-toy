import React, { useState } from 'react';
import { Copy, Check } from 'lucide-react';
import { copyToClipboard } from '../utils/clipboard';

interface CopyButtonProps {
  text: string;
  label?: string;
  className?: string;
  size?: 'sm' | 'md' | 'lg';
  variant?: 'primary' | 'secondary' | 'ghost' | 'fabe' | 'almus';
  showFeedbackText?: boolean;
}

export const CopyButton: React.FC<CopyButtonProps> = ({
  text,
  label = 'Copiar',
  className = '',
  size = 'md',
  variant = 'secondary',
  showFeedbackText = false
}) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!text) return;
    const success = await copyToClipboard(text);
    if (success) {
      setCopied(true);
      setTimeout(() => setCopied(false), 2200);
    }
  };

  const sizeClasses = {
    sm: 'px-2 py-1 text-xs gap-1',
    md: 'px-3 py-1.5 text-xs font-medium gap-1.5',
    lg: 'px-4 py-2 text-sm font-semibold gap-2'
  };

  const variantClasses = {
    primary: 'bg-sky-600 hover:bg-sky-700 text-white shadow-sm border border-sky-500',
    secondary: 'bg-white hover:bg-slate-100 text-slate-700 border border-slate-300 dark:bg-slate-800 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-700',
    ghost: 'text-slate-500 hover:text-sky-600 hover:bg-sky-50 dark:hover:bg-slate-800 p-1 rounded',
    fabe: 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm border border-emerald-500',
    almus: 'bg-blue-600 hover:bg-blue-700 text-white shadow-sm border border-blue-500'
  };

  return (
    <button
      type="button"
      onClick={handleCopy}
      title={copied ? '¡Copiado al portapapeles!' : 'Copiar para pegar en SAC'}
      className={`inline-flex items-center justify-center rounded-md transition-all duration-150 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed ${sizeClasses[size]} ${variantClasses[variant]} ${className}`}
      disabled={!text}
    >
      {copied ? (
        <>
          <Check className="w-3.5 h-3.5 text-emerald-400 animate-in zoom-in" />
          <span className="text-emerald-400 font-bold">{showFeedbackText ? '¡Copiado!' : (label ? '¡Copiado!' : '')}</span>
        </>
      ) : (
        <>
          <Copy className="w-3.5 h-3.5 opacity-80" />
          {label && <span>{label}</span>}
        </>
      )}
    </button>
  );
};
