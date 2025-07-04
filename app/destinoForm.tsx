import { useState } from "react";
import { FormData } from "./types/types";

type Props = {
  onSubmit: (data: FormData) => void;
};

export function DestinoForm({ onSubmit }: Props) {
  const [formData, setFormData] = useState({
    ciudad: "",
    origenVuelta: "",
    maxDuracionIda: "",
    maxDuracionVuelta: "",
    horarioIdaEntre: "",
    horarioIdaHasta: "",
    horarioVueltaEntre: "",
    horarioVueltaHasta: "",
    stops: "",
  });
  const horarioCampos: (keyof FormData)[] = [
    "maxDuracionIda",
    "maxDuracionVuelta",
    "horarioIdaEntre",
    "horarioIdaHasta",
    "horarioVueltaEntre",
    "horarioVueltaHasta",
  ];
  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    console.log(name);
    setFormData({
      ...formData,
      [name]: name === "origenVuelta" ? value.toUpperCase() : value, // Así siempre guarda en mayúscula (útil para IATA y horas)
    });
  };

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    console.log("Formulario enviado:", formData);
    setFormData({
      ciudad: "",
      origenVuelta: "",
      maxDuracionIda: "",
      maxDuracionVuelta: "",
      horarioIdaEntre: "",
      horarioIdaHasta: "",
      horarioVueltaEntre: "",
      horarioVueltaHasta: "",
      stops: "",
    });
    onSubmit(formData);
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="max-w-xl mx-auto p-6 bg-white rounded-lg shadow-md space-y-6"
    >
      <h2 className="text-2xl font-semibold text-center text-gray-800">
        Formulario agregar destino
      </h2>

      {/* Ciudad */}
      <label className="block">
        <span className="text-gray-700 font-medium">Ciudad:</span>
        <input
          name="ciudad"
          value={formData.ciudad}
          onChange={handleChange}
          required
          placeholder="Ej: Madrid"
          className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm placeholder-gray-400 focus:border-indigo-500 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
        />
      </label>

      {/* Origen Vuelta (IATA) */}
      <label className="block">
        <span className="text-gray-700 font-medium">Origen Vuelta (IATA):</span>
        <input
          name="origenVuelta"
          value={formData.origenVuelta}
          onChange={handleChange}
          required
          pattern="[A-Z]{3}"
          placeholder="Ej: MAD"
          className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm placeholder-gray-400 focus:border-indigo-500 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
        />
      </label>

      {/* Los campos horarios */}
      {horarioCampos.map((campo) => (
        <label className="block" key={campo}>
          <span className="text-gray-700 font-medium">{campo} (HH:MM):</span>
          <input
            name={campo}
            value={formData[campo]}
            onChange={handleChange}
            required
            pattern="^([0-9]{1,2}):([0-5][0-9])$"
            placeholder="Ej: 14:30"
            className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm placeholder-gray-400 focus:border-indigo-500 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
          />
        </label>
      ))}

      {/* Stops */}
      <label className="block">
        <span className="text-gray-700 font-medium">Stops:</span>
        <select
          name="stops"
          defaultValue={formData.stops}
          onChange={handleChange}
          required
          className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-indigo-500 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
        >
          <option value="">Seleccionar</option>
          <option value="Directo">Directo</option>
          <option value="1 escala">1 escala</option>
          <option value="2 escalas">2 escalas</option>
        </select>
      </label>

      <button
        type="submit"
        className="w-full bg-indigo-600 text-white font-semibold py-3 rounded-md hover:bg-indigo-700 transition-colors duration-300"
      >
        Guardar destino
      </button>
    </form>
  );
}
