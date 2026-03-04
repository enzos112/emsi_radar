export default function SelectField({ label, options = [], ...props }) {
  return (
    <div className="flex flex-col mb-4">
      {label && (
        <label className="mb-1 text-sm font-semibold text-gray-700">
          {label}
        </label>
      )}
      <select
        {...props}
        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-700 focus:border-transparent transition-all bg-white"
      >
        <option value="" disabled hidden>
          Selecciona una opción
        </option>
        {options.map((opt, i) => (
          <option key={i} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
    </div>
  );
}
