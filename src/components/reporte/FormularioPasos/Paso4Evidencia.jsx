import { useState } from "react";
import { Upload, X } from "lucide-react";

export default function Paso4Evidencia({ evidencias, onEvidenciasChange }) {
  const [uploading, setUploading] = useState(false);

  const handleFileChange = (e) => {
    const files = Array.from(e.target.files);

    if (evidencias.length + files.length > 3) {
      alert("Máximo 3 fotos permitidas");
      return;
    }

    setUploading(true);

    setTimeout(() => {
      const nuevasEvidencias = files.map((file) => ({
        url: URL.createObjectURL(file),
        file: file,
      }));
      onEvidenciasChange([...evidencias, ...nuevasEvidencias]);
      setUploading(false);
      e.target.value = "";
    }, 1500);
  };

  const removeEvidencia = (index) => {
    onEvidenciasChange(evidencias.filter((_, i) => i !== index));
  };

  return (
    <div className="space-y-4">
      <p className="text-sm font-semibold text-gray-700">
        Adjunta hasta 3 fotos como evidencia (Opcional)
      </p>

      {evidencias.length < 3 && (
        <label
          className={`flex flex-col items-center justify-center border-2 border-dashed rounded-xl p-8 cursor-pointer transition-colors ${
            uploading
              ? "border-red-300 bg-red-50"
              : "border-gray-300 hover:border-red-400 hover:bg-slate-50"
          }`}
        >
          {uploading ? (
            <div className="flex flex-col items-center gap-2 text-red-600">
              <div className="animate-spin w-8 h-8 border-4 border-red-600 border-t-transparent rounded-full" />
              <span className="text-sm font-semibold">Procesando...</span>
            </div>
          ) : (
            <div className="flex flex-col items-center gap-2 text-slate-500">
              <Upload className="w-8 h-8 text-slate-400" />
              <span className="text-sm font-medium">
                Toca para tomar foto o seleccionar
              </span>
              <span className="text-xs text-slate-400">
                JPG, PNG, WEBP (máx. 10MB)
              </span>
            </div>
          )}
          <input
            type="file"
            accept="image/*"
            multiple
            className="hidden"
            onChange={handleFileChange}
            disabled={uploading}
            capture="environment"
          />
        </label>
      )}

      {evidencias.length > 0 && (
        <div className="grid grid-cols-3 gap-4 mt-4">
          {evidencias.map((ev, i) => (
            <div key={i} className="relative group">
              <img
                src={ev.url}
                alt={`Evidencia ${i + 1}`}
                className="w-full h-24 object-cover rounded-lg border border-gray-200 shadow-sm"
              />
              <button
                type="button"
                onClick={() => removeEvidencia(i)}
                className="absolute -top-2 -right-2 w-6 h-6 bg-slate-900 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity shadow-md hover:bg-red-600"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
