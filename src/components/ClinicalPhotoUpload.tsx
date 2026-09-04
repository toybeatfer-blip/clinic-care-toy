import React, { useState, useRef } from 'react';
import { ClinicalImage } from '../types';
import {
  Camera,
  Upload,
  Trash2,
  Eye,
  X,
  Image as ImageIcon,
  Plus,
  Tag,
  Check
} from 'lucide-react';

interface ClinicalPhotoUploadProps {
  images?: ClinicalImage[];
  onChange: (updatedImages: ClinicalImage[]) => void;
  title?: string;
}

export const ClinicalPhotoUpload: React.FC<ClinicalPhotoUploadProps> = ({
  images = [],
  onChange,
  title = 'Foto-Documentación Clínica y Archivos de Imagen'
}) => {
  const [selectedPreview, setSelectedPreview] = useState<ClinicalImage | null>(null);
  const [newLabel, setNewLabel] = useState<string>('');
  const [newCategory, setNewCategory] = useState<'rx' | 'usg' | 'tac' | 'laboratorio' | 'herida' | 'otro'>('herida');
  const [isCompressing, setIsCompressing] = useState<boolean>(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const compressAndConvertImage = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (readerEvent) => {
        const image = new Image();
        image.onload = () => {
          const maxDim = 1000;
          let width = image.width;
          let height = image.height;

          if (width > height) {
            if (width > maxDim) {
              height = Math.round((height * maxDim) / width);
              width = maxDim;
            }
          } else {
            if (height > maxDim) {
              width = Math.round((width * maxDim) / height);
              height = maxDim;
            }
          }

          const canvas = document.createElement('canvas');
          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext('2d');
          if (ctx) {
            ctx.drawImage(image, 0, 0, width, height);
            // Compress to JPEG with 0.72 quality (~80-150KB)
            const dataUrl = canvas.toDataURL('image/jpeg', 0.72);
            resolve(dataUrl);
          } else {
            resolve(readerEvent.target?.result as string);
          }
        };
        image.onerror = reject;
        image.src = readerEvent.target?.result as string;
      };
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setIsCompressing(true);
    try {
      const newItems: ClinicalImage[] = [];
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        const compressedBase64 = await compressAndConvertImage(file);
        const item: ClinicalImage = {
          id: `img-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
          url: compressedBase64,
          label: newLabel.trim() || file.name.replace(/\.[^/.]+$/, ''),
          date: new Date().toLocaleDateString('es-MX', { year: 'numeric', month: 'short', day: 'numeric' }),
          category: newCategory
        };
        newItems.push(item);
      }

      onChange([...images, ...newItems]);
      setNewLabel('');
    } catch (err) {
      console.error('Error compressing clinical photo', err);
      alert('Hubo un error al procesar la imagen.');
    } finally {
      setIsCompressing(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleDeleteImage = (imgId: string) => {
    if (confirm('¿Deseas eliminar esta fotografía del expediente?')) {
      onChange(images.filter((img) => img.id !== imgId));
      if (selectedPreview?.id === imgId) setSelectedPreview(null);
    }
  };

  const getCategoryBadge = (cat?: string) => {
    switch (cat) {
      case 'herida':
        return <span className="px-2 py-0.5 rounded bg-rose-100 text-rose-700 dark:bg-rose-950 dark:text-rose-300 text-[10px] font-bold">Herida / Lesión</span>;
      case 'rx':
        return <span className="px-2 py-0.5 rounded bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-300 text-[10px] font-bold">Rayos X</span>;
      case 'usg':
        return <span className="px-2 py-0.5 rounded bg-teal-100 text-teal-700 dark:bg-teal-950 dark:text-teal-300 text-[10px] font-bold">Ultrasonido</span>;
      case 'tac':
        return <span className="px-2 py-0.5 rounded bg-purple-100 text-purple-700 dark:bg-purple-950 dark:text-purple-300 text-[10px] font-bold">TAC</span>;
      case 'laboratorio':
        return <span className="px-2 py-0.5 rounded bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-300 text-[10px] font-bold">Laboratorio</span>;
      default:
        return <span className="px-2 py-0.5 rounded bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300 text-[10px] font-bold">Estudio</span>;
    }
  };

  return (
    <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800 space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 border-b border-slate-200/60 dark:border-slate-700/60 pb-2.5">
        <div className="flex items-center gap-2">
          <Camera className="w-4 h-4 text-sky-600 dark:text-sky-400" />
          <h4 className="text-xs sm:text-sm font-bold uppercase tracking-wider text-slate-800 dark:text-slate-200">
            {title} ({images.length})
          </h4>
        </div>
        <span className="text-[11px] text-slate-400">
          Compresión automática integrada
        </span>
      </div>

      {/* Upload Controls Bar */}
      <div className="grid grid-cols-1 sm:grid-cols-12 gap-2.5 items-center">
        <div className="sm:col-span-4">
          <input
            type="text"
            value={newLabel}
            onChange={(e) => setNewLabel(e.target.value)}
            placeholder="Descripción (ej. Herida post-op, RX Tórax)..."
            className="w-full px-3 py-1.5 text-xs rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 focus:ring-2 focus:ring-sky-500"
          />
        </div>

        <div className="sm:col-span-3">
          <select
            value={newCategory}
            onChange={(e) => setNewCategory(e.target.value as any)}
            className="w-full px-3 py-1.5 text-xs rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 font-medium"
          >
            <option value="herida">🩹 Herida / Lesión / Dérmico</option>
            <option value="rx">🩻 Rayos X (RX)</option>
            <option value="usg">🩺 Ultrasonido (USG)</option>
            <option value="tac">🧠 Tomografía (TAC)</option>
            <option value="laboratorio">🔬 Reporte Laboratorio</option>
            <option value="otro">📋 Otro Estudio</option>
          </select>
        </div>

        <div className="sm:col-span-5 flex gap-2">
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            capture="environment"
            multiple
            onChange={handleFileChange}
            className="hidden"
            id="clinical-file-input"
          />
          <label
            htmlFor="clinical-file-input"
            className={`flex-1 py-1.5 px-3 text-xs font-bold rounded-lg border border-sky-600 bg-sky-50 dark:bg-sky-950/40 text-sky-700 dark:text-sky-300 hover:bg-sky-100 flex items-center justify-center gap-1.5 cursor-pointer shadow-sm transition-all ${
              isCompressing ? 'opacity-50 pointer-events-none' : ''
            }`}
          >
            {isCompressing ? (
              <span>Optimizando foto...</span>
            ) : (
              <>
                <Camera className="w-3.5 h-3.5" />
                <span>Tomar / Subir Foto</span>
              </>
            )}
          </label>
        </div>
      </div>

      {/* Image Gallery Thumbnails */}
      {images.length > 0 ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 pt-2">
          {images.map((img) => (
            <div
              key={img.id}
              className="relative group rounded-xl overflow-hidden border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 shadow-sm"
            >
              <div
                onClick={() => setSelectedPreview(img)}
                className="cursor-pointer aspect-video bg-slate-100 dark:bg-slate-800 overflow-hidden flex items-center justify-center relative"
              >
                <img
                  src={img.url}
                  alt={img.label}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
                />
                <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white">
                  <Eye className="w-5 h-5" />
                </div>
              </div>

              <div className="p-2 space-y-1">
                <div className="flex items-center justify-between">
                  {getCategoryBadge(img.category)}
                  <button
                    type="button"
                    onClick={() => handleDeleteImage(img.id)}
                    className="text-slate-400 hover:text-rose-500 transition-colors p-1"
                    title="Eliminar foto"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
                <p className="text-xs font-semibold text-slate-800 dark:text-slate-200 truncate" title={img.label}>
                  {img.label}
                </p>
                <span className="text-[10px] text-slate-400 block">{img.date}</span>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="p-4 text-center border-2 border-dashed border-slate-200 dark:border-slate-700/60 rounded-xl text-xs text-slate-400">
          Sin fotografías o estudios visuales adjuntos en este expediente.
        </div>
      )}

      {/* Fullscreen Image Preview Modal */}
      {selectedPreview && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in">
          <div className="relative max-w-4xl w-full bg-slate-900 rounded-2xl overflow-hidden shadow-2xl border border-slate-700 flex flex-col max-h-[90vh]">
            <div className="p-4 bg-slate-950 text-white flex items-center justify-between border-b border-slate-800">
              <div className="flex items-center gap-2">
                {getCategoryBadge(selectedPreview.category)}
                <h3 className="font-bold text-sm">{selectedPreview.label}</h3>
                <span className="text-xs text-slate-400">({selectedPreview.date})</span>
              </div>
              <button
                type="button"
                onClick={() => setSelectedPreview(null)}
                className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="flex-1 overflow-auto p-4 flex items-center justify-center bg-black/50">
              <img
                src={selectedPreview.url}
                alt={selectedPreview.label}
                className="max-h-[70vh] w-auto max-w-full object-contain rounded-lg shadow-lg"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
