import React, { useState } from 'react';
import {
  X,
  Search,
  Check,
  Plus,
  Dna,
  HeartPulse,
  Sparkles,
  Trash2,
  FolderOpen
} from 'lucide-react';
import {
  HEREDOFAMILIARES_CATALOG,
  PERSONALES_PATOLOGICOS_CATALOG
} from '../data/antecedentsCatalog';

interface AntecedentsSelectorModalProps {
  isOpen: boolean;
  onClose: () => void;
  target: 'heredofamiliares' | 'patologicos';
  currentValue: string;
  onApply: (updatedText: string) => void;
}

export const AntecedentsSelectorModal: React.FC<AntecedentsSelectorModalProps> = ({
  isOpen,
  onClose,
  target,
  currentValue,
  onApply
}) => {
  const [activeTab, setActiveTab] = useState<'heredofamiliares' | 'patologicos'>(target);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedItems, setSelectedItems] = useState<string[]>(() => {
    if (!currentValue || currentValue === 'Interrogados y negados' || currentValue === 'Sin antecedentes de importancia') {
      return [];
    }
    return currentValue.split(',').map(s => s.trim()).filter(Boolean);
  });
  const [customInput, setCustomInput] = useState('');

  // Sync state when opened with target or value
  React.useEffect(() => {
    setActiveTab(target);
    if (!currentValue || currentValue === 'Interrogados y negados' || currentValue === 'Sin antecedentes de importancia') {
      setSelectedItems([]);
    } else {
      setSelectedItems(currentValue.split(',').map(s => s.trim()).filter(Boolean));
    }
    setSearchTerm('');
    setCustomInput('');
  }, [isOpen, target, currentValue]);

  if (!isOpen) return null;

  const catalog = activeTab === 'heredofamiliares' ? HEREDOFAMILIARES_CATALOG : PERSONALES_PATOLOGICOS_CATALOG;

  const toggleItem = (item: string) => {
    if (item === 'Interrogados y negados' || item === 'Sin antecedentes de importancia' || item === 'Sin antecedentes heredofamiliares de importancia' || item === 'Sin antecedentes personales patológicos de importancia') {
      setSelectedItems([item]);
      return;
    }

    // Filter out "Negados" if selecting a positive item
    const cleanList = selectedItems.filter(i => 
      !i.toLowerCase().includes('negad') && 
      !i.toLowerCase().includes('sin antecedentes')
    );

    if (cleanList.includes(item)) {
      setSelectedItems(cleanList.filter(i => i !== item));
    } else {
      setSelectedItems([...cleanList, item]);
    }
  };

  const handleAddCustom = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const trimmed = customInput.trim();
    if (!trimmed) return;

    const cleanList = selectedItems.filter(i => 
      !i.toLowerCase().includes('negad') && 
      !i.toLowerCase().includes('sin antecedentes')
    );

    if (!cleanList.includes(trimmed)) {
      setSelectedItems([...cleanList, trimmed]);
    }
    setCustomInput('');
  };

  const handleApply = () => {
    let resultText = '';
    if (selectedItems.length === 0) {
      resultText = 'Interrogados y negados';
    } else {
      resultText = selectedItems.join(', ');
    }
    onApply(resultText);
    onClose();
  };

  const handleSetNegados = () => {
    setSelectedItems(['Interrogados y negados']);
  };

  const handleClearAll = () => {
    setSelectedItems([]);
  };

  // Filter items by search
  const filteredCatalog = catalog.map(cat => ({
    category: cat.category,
    items: cat.items.filter(item => 
      item.toLowerCase().includes(searchTerm.toLowerCase()) || 
      cat.category.toLowerCase().includes(searchTerm.toLowerCase())
    )
  })).filter(cat => cat.items.length > 0);

  const isHeredo = activeTab === 'heredofamiliares';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/70 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 w-full max-w-3xl max-h-[92vh] flex flex-col overflow-hidden text-slate-800 dark:text-slate-100">
        
        {/* Header */}
        <div className={`p-4 text-white flex items-center justify-between ${
          isHeredo ? 'bg-gradient-to-r from-purple-700 to-indigo-700' : 'bg-gradient-to-r from-teal-700 to-sky-700'
        }`}>
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-white/10 rounded-xl">
              {isHeredo ? <Dna className="w-5 h-5" /> : <HeartPulse className="w-5 h-5" />}
            </div>
            <div>
              <h2 className="text-base font-bold">
                {isHeredo ? 'Catálogo Extendido: Antecedentes Heredofamiliares' : 'Catálogo Extendido: Antecedentes Personales Patológicos'}
              </h2>
              <p className="text-xs text-white/80">
                Selecciona antecedentes por categoría o añade opciones personalizadas conforme a NOM-004
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg hover:bg-white/20 text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Selector */}
        <div className="flex border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/40 p-1.5 gap-1.5">
          <button
            type="button"
            onClick={() => setActiveTab('heredofamiliares')}
            className={`flex-1 py-2 px-3 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-2 ${
              activeTab === 'heredofamiliares'
                ? 'bg-purple-600 text-white shadow-sm'
                : 'text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-800'
            }`}
          >
            <Dna className="w-4 h-4" />
            <span>Heredofamiliares (AHF)</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('patologicos')}
            className={`flex-1 py-2 px-3 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-2 ${
              activeTab === 'patologicos'
                ? 'bg-teal-600 text-white shadow-sm'
                : 'text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-800'
            }`}
          >
            <HeartPulse className="w-4 h-4" />
            <span>Personales Patológicos (APP)</span>
          </button>
        </div>

        {/* Search & Custom Input Bar */}
        <div className="p-3 border-b border-slate-200 dark:border-slate-800 space-y-2.5 bg-slate-50/50 dark:bg-slate-900/50">
          <div className="flex flex-col sm:flex-row gap-2">
            {/* Search */}
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder={`Buscar en ${isHeredo ? 'heredofamiliares (cáncer, diabetes, asma, renal...)' : 'patológicos (has, dm2, cirugías, alergias, gastritis...)'}...`}
                className="w-full pl-9 pr-3 py-1.5 text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 focus:ring-2 focus:ring-sky-500 focus:outline-none"
              />
            </div>

            {/* Quick Actions */}
            <div className="flex items-center gap-1.5 shrink-0">
              <button
                type="button"
                onClick={handleSetNegados}
                className="px-2.5 py-1.5 text-xs font-semibold rounded-lg bg-slate-200 hover:bg-slate-300 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 transition-colors"
              >
                Interrogados y negados
              </button>

              {selectedItems.length > 0 && (
                <button
                  type="button"
                  onClick={handleClearAll}
                  className="p-1.5 text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/40 rounded-lg transition-colors"
                  title="Limpiar selección"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>

          {/* Add custom condition input */}
          <form onSubmit={handleAddCustom} className="flex gap-2">
            <input
              type="text"
              value={customInput}
              onChange={(e) => setCustomInput(e.target.value)}
              placeholder="¿No encuentras la opción? Escribe otro antecedente específico aquí..."
              className="flex-1 px-3 py-1.5 text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 focus:ring-2 focus:ring-sky-500 focus:outline-none"
            />
            <button
              type="submit"
              disabled={!customInput.trim()}
              className="px-3 py-1.5 bg-sky-600 hover:bg-sky-700 disabled:opacity-50 text-white text-xs font-bold rounded-xl flex items-center gap-1 transition-all shadow-sm"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Añadir</span>
            </button>
          </form>
        </div>

        {/* Body: Categories & Chips */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4 max-h-[46vh]">
          {filteredCatalog.length > 0 ? (
            filteredCatalog.map((cat, catIdx) => (
              <div key={catIdx} className="space-y-2">
                <div className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                  <FolderOpen className="w-3.5 h-3.5 text-sky-500" />
                  <span>{cat.category}</span>
                </div>

                <div className="flex flex-wrap gap-1.5">
                  {cat.items.map((item, itemIdx) => {
                    const isSelected = selectedItems.includes(item);
                    return (
                      <button
                        key={itemIdx}
                        type="button"
                        onClick={() => toggleItem(item)}
                        className={`text-xs px-2.5 py-1.5 rounded-lg border transition-all flex items-center gap-1.5 text-left ${
                          isSelected
                            ? isHeredo
                              ? 'bg-purple-600 text-white border-purple-600 font-bold shadow-sm'
                              : 'bg-teal-600 text-white border-teal-600 font-bold shadow-sm'
                            : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:border-sky-400 hover:bg-sky-50/50 dark:hover:bg-slate-700/50'
                        }`}
                      >
                        {isSelected ? (
                          <Check className="w-3.5 h-3.5 shrink-0" />
                        ) : (
                          <Plus className="w-3 h-3 text-slate-400 shrink-0" />
                        )}
                        <span>{item}</span>
                      </button>
                    );
                  })}
                </div>
              </div>
            ))
          ) : (
            <div className="p-8 text-center text-xs text-slate-400">
              No se encontraron opciones para "{searchTerm}". Puedes escribirla arriba y hacer clic en "Añadir".
            </div>
          )}
        </div>

        {/* Selected Items Live Preview & Footer */}
        <div className="p-3.5 border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 flex flex-col gap-2.5">
          <div>
            <div className="flex items-center justify-between text-[11px] font-bold text-slate-600 dark:text-slate-400 mb-1">
              <span className="flex items-center gap-1">
                <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                <span>Vista Previa del Texto a Insertar:</span>
              </span>
              <span>{selectedItems.length} seleccionado(s)</span>
            </div>
            
            <div className="p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs text-slate-800 dark:text-slate-200 min-h-[40px] max-h-20 overflow-y-auto leading-relaxed font-mono">
              {selectedItems.length > 0 ? selectedItems.join(', ') : <span className="text-slate-400 italic">Interrogados y negados</span>}
            </div>
          </div>

          <div className="flex items-center justify-end gap-2 pt-1">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold rounded-xl border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            >
              Cancelar
            </button>

            <button
              type="button"
              onClick={handleApply}
              className={`px-5 py-2 text-xs font-bold text-white rounded-xl shadow-md transition-all flex items-center gap-1.5 ${
                isHeredo
                  ? 'bg-purple-600 hover:bg-purple-700 shadow-purple-600/20'
                  : 'bg-teal-600 hover:bg-teal-700 shadow-teal-600/20'
              }`}
            >
              <Check className="w-4 h-4" />
              <span>Aplicar al Expediente</span>
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
