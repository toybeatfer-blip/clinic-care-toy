import React, { useState, useEffect } from 'react';
import { PrescriptionKit, PrescriptionItem } from '../types';
import { DEFAULT_PRESCRIPTION_KITS, getCustomKits, saveCustomKit, deleteCustomKit } from '../data/prescriptionKitsCatalog';
import {
  Package,
  X,
  Plus,
  Trash2,
  Check,
  BookmarkPlus,
  Sparkles,
  Pill,
  Search,
  Layers,
  ArrowRight
} from 'lucide-react';

interface PrescriptionKitsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onApplyKit: (kit: PrescriptionKit, mode: 'replace' | 'append') => void;
  currentPrescription: PrescriptionItem[];
  currentIndications?: string;
  clinicId?: string;
}

export const PrescriptionKitsModal: React.FC<PrescriptionKitsModalProps> = ({
  isOpen,
  onClose,
  onApplyKit,
  currentPrescription,
  currentIndications,
  clinicId
}) => {
  const [activeTab, setActiveTab] = useState<'catalog' | 'save_custom'>('catalog');
  const [selectedCategory, setSelectedCategory] = useState<string>('Todos');
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [customKits, setCustomKits] = useState<PrescriptionKit[]>([]);
  const [newKitName, setNewKitName] = useState<string>('');
  const [newKitCategory, setNewKitCategory] = useState<string>('General');
  const [newKitDescription, setNewKitDescription] = useState<string>('');
  const [saveSuccess, setSaveSuccess] = useState<boolean>(false);

  useEffect(() => {
    if (isOpen) {
      setCustomKits(getCustomKits(clinicId));
      setSaveSuccess(false);
    }
  }, [isOpen, clinicId]);

  if (!isOpen) return null;

  const allKits: (PrescriptionKit & { isCustom?: boolean })[] = [
    ...customKits.map(k => ({ ...k, isCustom: true })),
    ...DEFAULT_PRESCRIPTION_KITS
  ];

  const categories = ['Todos', ...Array.from(new Set(allKits.map(k => k.category)))];

  const filteredKits = allKits.filter(kit => {
    const matchesCat = selectedCategory === 'Todos' || kit.category === selectedCategory;
    const matchesSearch =
      kit.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (kit.description || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      kit.items.some(i => i.producto.toLowerCase().includes(searchTerm.toLowerCase()));
    return matchesCat && matchesSearch;
  });

  const handleSaveCurrentAsKit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newKitName.trim() || currentPrescription.length === 0) return;

    const newKit: PrescriptionKit = {
      id: `custom-kit-${Date.now()}`,
      name: newKitName.trim(),
      category: newKitCategory.trim() || 'General',
      description: newKitDescription.trim() || `Paquete con ${currentPrescription.length} medicamentos`,
      indications: currentIndications || '',
      items: currentPrescription
    };

    const updated = saveCustomKit(newKit, clinicId);
    setCustomKits(updated);
    setSaveSuccess(true);
    setNewKitName('');
    setNewKitDescription('');
    setTimeout(() => {
      setActiveTab('catalog');
      setSaveSuccess(false);
    }, 1200);
  };

  const handleDeleteCustomKit = (kitId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (confirm('¿Deseas eliminar este paquete personalizado?')) {
      const updated = deleteCustomKit(kitId, clinicId);
      setCustomKits(updated);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in">
      <div className="bg-white dark:bg-slate-900 w-full max-w-3xl rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-gradient-to-r from-teal-600 to-emerald-700 text-white">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-white/15 rounded-xl">
              <Package className="w-6 h-6 text-teal-200" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-bold">
                Paquetes y Kits de Tratamiento Frecuentes
              </h2>
              <p className="text-xs text-teal-100">
                Prescribe esquemas terapéuticos completos con dosis e indicaciones en 1 solo clic
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg hover:bg-white/20 text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Top Mode Tabs */}
        <div className="flex border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/40 p-2 gap-2">
          <button
            type="button"
            onClick={() => setActiveTab('catalog')}
            className={`flex-1 py-2 px-4 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-2 ${
              activeTab === 'catalog'
                ? 'bg-white dark:bg-slate-900 text-teal-700 dark:text-teal-400 shadow-sm border border-slate-200 dark:border-slate-700'
                : 'text-slate-600 dark:text-slate-300 hover:bg-white/50 dark:hover:bg-slate-800'
            }`}
          >
            <Sparkles className="w-4 h-4" />
            Catálogo de Paquetes ({allKits.length})
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('save_custom')}
            className={`flex-1 py-2 px-4 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-2 ${
              activeTab === 'save_custom'
                ? 'bg-white dark:bg-slate-900 text-teal-700 dark:text-teal-400 shadow-sm border border-slate-200 dark:border-slate-700'
                : 'text-slate-600 dark:text-slate-300 hover:bg-white/50 dark:hover:bg-slate-800'
            }`}
          >
            <BookmarkPlus className="w-4 h-4" />
            Guardar Receta Actual como Paquete ({currentPrescription.length} fármacos)
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-4 sm:p-5 overflow-y-auto flex-1 space-y-4">
          {activeTab === 'catalog' ? (
            <>
              {/* Filter bar */}
              <div className="flex flex-col sm:flex-row gap-2">
                <div className="relative flex-1">
                  <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                  <input
                    type="text"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder="Buscar paquete por nombre, fármaco o especialidad..."
                    className="w-full pl-9 pr-3 py-1.5 text-xs rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-teal-500"
                  />
                </div>
              </div>

              {/* Category pills */}
              <div className="flex flex-wrap gap-1.5 overflow-x-auto pb-1">
                {categories.map((cat) => (
                  <button
                    key={cat}
                    type="button"
                    onClick={() => setSelectedCategory(cat)}
                    className={`text-[11px] px-2.5 py-1 rounded-full font-semibold transition-all ${
                      selectedCategory === cat
                        ? 'bg-teal-600 text-white shadow-sm'
                        : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200'
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>

              {/* Kits Grid */}
              <div className="space-y-3">
                {filteredKits.map((kit) => (
                  <div
                    key={kit.id}
                    className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-800/40 hover:border-teal-400 dark:hover:border-teal-600 transition-all space-y-3"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <div className="flex items-center gap-2">
                          <h4 className="text-sm font-bold text-slate-900 dark:text-slate-100">
                            {kit.name}
                          </h4>
                          {kit.isCustom ? (
                            <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300 border border-amber-300 dark:border-amber-800">
                              ⭐ Mi Paquete Personalizado
                            </span>
                          ) : (
                            <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-teal-100 text-teal-800 dark:bg-teal-950 dark:text-teal-300 border border-teal-300 dark:border-teal-800">
                              {kit.category}
                            </span>
                          )}
                        </div>
                        {kit.description && (
                          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                            {kit.description}
                          </p>
                        )}
                      </div>

                      {/* Action buttons */}
                      <div className="flex items-center gap-1.5 shrink-0">
                        {kit.isCustom && (
                          <button
                            type="button"
                            onClick={(e) => handleDeleteCustomKit(kit.id, e)}
                            className="p-1.5 text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/50 rounded-lg transition-colors"
                            title="Eliminar paquete"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                        <button
                          type="button"
                          onClick={() => {
                            onApplyKit(kit, 'replace');
                            onClose();
                          }}
                          className="px-3 py-1.5 text-xs font-bold rounded-lg bg-teal-600 hover:bg-teal-700 text-white shadow-sm transition-all flex items-center gap-1"
                        >
                          <Check className="w-3.5 h-3.5" />
                          Aplicar Kit
                        </button>
                      </div>
                    </div>

                    {/* Drugs preview */}
                    <div className="space-y-1.5 pt-1 border-t border-slate-200/60 dark:border-slate-700/60">
                      {kit.items.map((item, idx) => (
                        <div
                          key={idx}
                          className="text-xs bg-white dark:bg-slate-900/80 p-2 rounded-lg border border-slate-200 dark:border-slate-800 flex items-center justify-between"
                        >
                          <div>
                            <span className="font-semibold text-slate-800 dark:text-slate-200">
                              {idx + 1}. {item.producto}
                            </span>
                            <span className="text-slate-500 ml-2">({item.dosis} - {item.periodicidad})</span>
                          </div>
                          <span className="text-[10px] text-slate-400 shrink-0 font-mono">
                            {item.via}
                          </span>
                        </div>
                      ))}
                    </div>

                    {kit.indications && (
                      <p className="text-[11px] text-slate-600 dark:text-slate-300 bg-teal-50/40 dark:bg-teal-950/20 p-2 rounded border border-teal-200/60 dark:border-teal-900/60 italic">
                        <strong>Indicaciones generales:</strong> {kit.indications}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            </>
          ) : (
            /* Save Custom Kit Form */
            <form onSubmit={handleSaveCurrentAsKit} className="space-y-4">
              <div className="p-4 rounded-xl bg-teal-50 dark:bg-teal-950/30 border border-teal-200 dark:border-teal-800 text-xs text-teal-900 dark:text-teal-200">
                <p className="font-bold">
                  Guarda la prescripción que tienes actualmente en pantalla como una plantilla reutilizable.
                </p>
                <p className="mt-1 text-slate-600 dark:text-slate-300">
                  Podrás aplicarla en cualquier paciente futuro con un solo clic.
                </p>
              </div>

              {currentPrescription.length === 0 ? (
                <div className="p-6 text-center text-slate-400 text-xs">
                  No hay medicamentos agregados en la receta actual para guardar. Agrega medicamentos en el Módulo 2 y vuelve aquí.
                </div>
              ) : (
                <>
                  <div className="space-y-3">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                        Nombre del Paquete / Kit <span className="text-rose-500">*</span>
                      </label>
                      <input
                        type="text"
                        required
                        value={newKitName}
                        onChange={(e) => setNewKitName(e.target.value)}
                        placeholder="Ej. Paquete Cólico Renal / Urolitiasis"
                        className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-teal-500 font-medium"
                      />
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                          Especialidad / Categoría
                        </label>
                        <input
                          type="text"
                          value={newKitCategory}
                          onChange={(e) => setNewKitCategory(e.target.value)}
                          placeholder="Ej. Urología, Pediatría, Traumatología..."
                          className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-teal-500"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                          Breve Descripción
                        </label>
                        <input
                          type="text"
                          value={newKitDescription}
                          onChange={(e) => setNewKitDescription(e.target.value)}
                          placeholder="Ej. Analgésico espasmolítico + AINE"
                          className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-teal-500"
                        />
                      </div>
                    </div>

                    {/* Preview of current items to be saved */}
                    <div>
                      <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                        Medicamentos que se guardarán ({currentPrescription.length}):
                      </label>
                      <div className="space-y-1.5 max-h-48 overflow-y-auto">
                        {currentPrescription.map((item, idx) => (
                          <div
                            key={idx}
                            className="p-2 text-xs bg-slate-50 dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 flex items-center justify-between"
                          >
                            <span className="font-semibold text-slate-800 dark:text-slate-200">
                              {idx + 1}. {item.producto}
                            </span>
                            <span className="text-slate-500 text-[11px]">{item.dosis}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  {saveSuccess && (
                    <div className="p-3 bg-emerald-50 text-emerald-800 rounded-lg text-xs font-bold flex items-center gap-2 border border-emerald-300">
                      <Check className="w-4 h-4" />
                      ¡Paquete personalizado guardado con éxito!
                    </div>
                  )}

                  <div className="flex justify-end gap-2 pt-2">
                    <button
                      type="button"
                      onClick={() => setActiveTab('catalog')}
                      className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
                    >
                      Cancelar
                    </button>
                    <button
                      type="submit"
                      disabled={saveSuccess}
                      className="px-5 py-2 text-xs font-bold bg-teal-600 hover:bg-teal-700 text-white rounded-lg shadow-sm transition-all flex items-center gap-2"
                    >
                      <BookmarkPlus className="w-4 h-4" />
                      Guardar Nuevo Paquete
                    </button>
                  </div>
                </>
              )}
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
