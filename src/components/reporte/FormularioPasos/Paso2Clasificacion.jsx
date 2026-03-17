import InputField from "../../ui/InputField";
import SelectField from "../../ui/SelectField";

export default function Paso2Clasificacion({ formData, onChange, tipos = [] }) {
  // Transformamos los tipos de la BD al formato del SelectField
  const opcionesTipos = tipos.map((t) => ({ value: t.id, label: t.nombre }));

  return (
    <div className="space-y-4">
      <SelectField
        label="Tipo de comportamiento"
        required
        options={opcionesTipos}
        value={formData.tipoComportamiento || ""}
        onChange={(e) => onChange("tipoComportamiento", e.target.value)}
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
