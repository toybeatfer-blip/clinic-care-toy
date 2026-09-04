import React, { useState } from 'react';
import { X, Search, Trash2, FolderOpen, Download, Upload, Clock, User, Calendar, FileText, Check } from 'lucide-react';
import { ClinicalRecord } from '../types';

interface SavedRecordsDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  savedRecords: ClinicalRecord[];
  onSelectRecord: (record: ClinicalRecord) => void;
  onRefreshRecords: (records: ClinicalRecord[]) => void;
}

export const SavedRecordsDrawer: React.FC<SavedRecordsDrawerProps> = ({
  isOpen,
  onClose,
  savedRecords,
  onSelectRecord,
  onRefreshRecords
}) => {
  const [searchTerm, setSearchTerm] = useState('');

  if (!isOpen) return null;

  const filtered = savedRecords.filter(r => {
    const name = `${r.identification.nombres} ${r.identification.apellidoPaterno} ${r.identification.apellidoMaterno}`.toLowerCase();
    const dx = (r.historyCheckup?.diagnosticoCie10 || '').toLowerCase();
    const folio = (r.ticketFolio || '').toLowerCase();
    const s = searchTerm.toLowerCase();
    return name.includes(s) || dx.includes(s) || folio.includes(s);
  });

  const handleDelete = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (window.confirm('¿Seguro que deseas eliminar este registro de paciente?')) {
      const next = savedRecords.filter(r => r.id !== id);
      onRefreshRecords(next);
    }
  };

  const handleExportJSON = () => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(savedRecords, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", `consultas_consultorio_${new Date().toISOString().slice(0,10)}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  const handleImportJSON = (e: React.ChangeEvent<HTMLInputElement>) => {
    const fileReader = new FileReader();
    if (e.target.files && e.target.files[0]) {
      fileReader.readAsText(e.target.files[0], "UTF-8");
      fileReader.onload = (event) => {
        try {
          const parsed = JSON.parse(event.target?.result as string);
          if (Array.isArray(parsed)) {
            onRefreshRecords(parsed);
            alert('¡Expedientes importados con éxito a este consultorio!');
          }
        } catch (err) {
          alert('Error al leer el archivo JSON');
        }
      };
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-slate-900/50 backdrop-blur-sm animate-in fade-in">
      <div className="w-full max-w-md bg-white dark:bg-slate-900 h-full shadow-2xl flex flex-col border-l border-slate-200 dark:border-slate-800">
        {/* Drawer Header */}
        <div className="p-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-slate-50 dark:bg-slate-950">
          <div className="flex items-center gap-2">
            <FolderOpen className="w-5 h-5 text-sky-600" />
            <h2 className="text-sm font-bold text-slate-800 dark:text-slate-100">
              Historial de Pacientes del Consultorio
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-lg"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Search & Actions */}
        <div className="p-3 border-b border-slate-200 dark:border-slate-800 space-y-2.5">
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder="Buscar por paciente, diagnóstico o ticket..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 text-xs rounded-lg border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-sky-500"
            />
          </div>

          <div className="flex items-center justify-between text-xs">
            <button
              type="button"
              onClick={handleExportJSON}
              className="inline-flex items-center gap-1 text-sky-600 hover:underline font-semibold"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Exportar Respaldo</span>
            </button>

            <label className="inline-flex items-center gap-1 text-slate-600 hover:underline cursor-pointer font-semibold">
              <Upload className="w-3.5 h-3.5" />
              <span>Importar JSON</span>
              <input type="file" accept=".json" onChange={handleImportJSON} className="hidden" />
            </label>
          </div>
        </div>

        {/* Records List */}
        <div className="flex-1 overflow-y-auto p-3 space-y-2">
          {filtered.length > 0 ? (
            filtered.map((record) => {
              const fullName = `${record.identification.nombres || 'Paciente sin nombre'} ${record.identification.apellidoPaterno || ''}`.trim();
              const dateStr = new Date(record.updatedAt || record.createdAt).toLocaleDateString('es-MX', {
                month: 'short',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
              });

              return (
                <div
                  key={record.id}
                  onClick={() => {
                    onSelectRecord(record);
                    onClose();
                  }}
                  className="p-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-800/60 hover:border-sky-500 hover:shadow-sm cursor-pointer transition-all group"
                >
                  <div className="flex items-center justify-between mb-1">
                    <div className="flex items-center gap-1.5 text-xs font-bold text-slate-800 dark:text-slate-100">
                      <User className="w-3.5 h-3.5 text-sky-600" />
                      <span>{fullName}</span>
                      {record.identification.edad && (
                        <span className="text-[10px] text-slate-400 font-normal">
                          ({record.identification.edad} a)
                        </span>
                      )}
                    </div>
                    <button
                      type="button"
                      onClick={(e) => handleDelete(record.id, e)}
                      className="opacity-0 group-hover:opacity-100 p-1 text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/40 rounded transition-all"
                      title="Eliminar"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  <p className="text-[11px] font-medium text-sky-700 dark:text-sky-400 truncate mb-1">
                    {record.historyCheckup?.diagnosticoCie10 || 'Sin diagnóstico registrado'}
                  </p>

                  <div className="flex items-center justify-between text-[10px] text-slate-400 pt-1 border-t border-slate-100 dark:border-slate-800">
                    <span className="flex items-center gap-1 font-mono">
                      <Clock className="w-3 h-3" />
                      {dateStr}
                    </span>
                    {record.ticketFolio && (
                      <span className="font-mono bg-slate-100 dark:bg-slate-700 px-1.5 py-0.5 rounded text-slate-600 dark:text-slate-300">
                        Ticket: {record.ticketFolio}
                      </span>
                    )}
                  </div>
                </div>
              );
            })
          ) : (
            <div className="p-8 text-center text-xs text-slate-400">
              No hay pacientes guardados en este consultorio.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
