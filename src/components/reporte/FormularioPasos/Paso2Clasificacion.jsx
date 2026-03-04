import InputField from "../../ui/InputField";
import SelectField from "../../ui/SelectField";

const tiposComportamiento = [
  { value: "COMPORTAMIENTO_INSEGURO", label: "Comportamiento inseguro" },
  { value: "CONDICION_INSEGURA", label: "Condición insegura" },
  { value: "CUASI_ACCIDENTE", label: "Cuasi accidente" },
  { value: "ACCIDENTE", label: "Accidente" },
  { value: "RECONOCIMIENTO", label: "Reconocimiento" },
];

export default function Paso2Clasificacion({ formData, onChange }) {
  return (
    <div className="space-y-4">
      <SelectField
        label="Tipo de comportamiento"
        required
        options={tiposComportamiento}
        value={formData.tipoComportamiento || ""}
        onChange={(e) => onChange("tipoComportamiento", e.target.value)}
      />

      <InputField
        label="Área donde ocurrió"
        required
        placeholder="Ej: Almacén, Producción, SS.HH..."
        value={formData.area || ""}
        onChange={(e) => onChange("area", e.target.value)}
      />

      <InputField
        label="Lugar específico (Opcional)"
        placeholder="Ej: Pasillo 3, cerca de la máquina #5"
        value={formData.lugarEspecifico || ""}
        onChange={(e) => onChange("lugarEspecifico", e.target.value)}
      />
    </div>
  );
}
