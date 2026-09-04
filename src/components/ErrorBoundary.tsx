import React, { Component, ErrorInfo, ReactNode } from 'react';
import { Stethoscope, RotateCcw, AlertTriangle, Trash2 } from 'lucide-react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Uncaught error:', error, errorInfo);
  }

  private handleResetSession = () => {
    try {
      localStorage.removeItem('clinic_care_session_v2');
    } catch (e) {}
    this.setState({ hasError: false, error: undefined });
    window.location.reload();
  };

  private handleCleanReset = () => {
    try {
      // Limpia la sesión activa y registros corruptos pero preserva consultorios
      const clinics = localStorage.getItem('clinic_care_clinics_master_v2');
      localStorage.clear();
      if (clinics) {
        localStorage.setItem('clinic_care_clinics_master_v2', clinics);
      }
    } catch (e) {}
    this.setState({ hasError: false, error: undefined });
    window.location.reload();
  };

  public render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col items-center justify-center p-6 text-center selection:bg-sky-500 selection:text-white">
          <div className="bg-slate-900 border border-slate-800 max-w-md w-full p-8 rounded-3xl shadow-2xl space-y-5">
            <div className="w-16 h-16 rounded-2xl bg-amber-500/10 text-amber-400 border border-amber-500/20 flex items-center justify-center mx-auto shadow-lg shadow-amber-500/10">
              <AlertTriangle className="w-8 h-8" />
            </div>

            <div>
              <h2 className="text-xl font-black text-white">Recuperación de Acceso</h2>
              <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                El sistema detectó una sesión previa con formato antiguo. Haz clic abajo para ingresar a la pantalla de inicio de sesión de forma segura.
              </p>
            </div>

            {this.state.error && (
              <details className="text-left bg-slate-950 p-3 rounded-xl border border-slate-800 text-[11px] text-slate-400">
                <summary className="cursor-pointer text-slate-300 font-bold">Detalles técnicos del aviso</summary>
                <p className="font-mono mt-1 text-rose-400 break-words">{this.state.error.toString()}</p>
              </details>
            )}

            <div className="space-y-2 pt-2">
              <button
                onClick={this.handleResetSession}
                className="w-full py-3 rounded-xl bg-sky-600 hover:bg-sky-700 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-lg shadow-sky-600/20 transition-all active:scale-95"
              >
                <RotateCcw className="w-4 h-4" />
                <span>Ingresar al Sistema (Inicio de Sesión)</span>
              </button>

              <button
                onClick={this.handleCleanReset}
                className="w-full py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-slate-200 text-[11px] font-medium transition-all"
              >
                Restablecer Sesión y Caché Local
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
