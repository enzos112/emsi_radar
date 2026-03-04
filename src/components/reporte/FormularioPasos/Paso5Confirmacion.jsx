import React from "react";

const Paso5Confirmacion = ({ formData, evidencias }) => {
  return (
    <div className="p-4">
      <h2 className="text-2xl font-bold mb-4 text-slate-800">
        Revisión Final del Reporte
      </h2>
      <div className="space-y-6 border border-slate-200 p-6 rounded-xl bg-slate-50 mb-6">
        <div>
          <h3 className="font-bold text-slate-700 border-b pb-2 mb-3">
            Información General
          </h3>
          <p>
            <span className="font-semibold text-slate-600">Fecha:</span>{" "}
            {formData.fechaOcurrido || "No especificada"}
          </p>
          <p>
            <span className="font-semibold text-slate-600">Área:</span>{" "}
            {formData.area || "No especificada"}
          </p>
          <p>
            <span className="font-semibold text-slate-600">Turno:</span>{" "}
            {formData.turno || "No especificado"}
          </p>
        </div>
        <div>
          <h3 className="font-bold text-slate-700 border-b pb-2 mb-3">
            Detalles
          </h3>
          <p>
            <span className="font-semibold text-slate-600">Tipo:</span>{" "}
            {formData.tipoComportamiento || "No especificado"}
          </p>
          <p>
            <span className="font-semibold text-slate-600">Descripción:</span>{" "}
            {formData.descripcion || "Sin descripción"}
          </p>
        </div>
        <div>
          <h3 className="font-bold text-slate-700 border-b pb-2 mb-3">
            Evidencia (Paso 4)
          </h3>
          <p
            className={
              evidencias.length > 0
                ? "text-green-600 font-medium"
                : "text-slate-500 italic"
            }
          >
            {evidencias.length > 0
              ? `✓ ${evidencias.length} imagen(es) adjunta(s).`
              : "No se adjuntaron imágenes."}
          </p>
        </div>
      </div>
    </div>
  );
};

export default Paso5Confirmacion;
