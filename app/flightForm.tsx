"use client";
import React, { useState } from "react";
import { Mensaje } from "./types/types";
// const defaultFormData: FlightFormData = {
//   mail: "",
//   password: "",
//   originDeparture: "",
//   originReturn: "",
//   departureDate: "",
//   returnDate: "",
//   adults: 1,
//   children: 0,
//   infants: 0,
//   currency: "USD",
//   stops: "directo",
//   checkedBaggage: false,
//   horarioIdaEntre: "",
//   horarioIdaHasta: "",
//   horarioVueltaEntre: "",
//   horarioVueltaHasta: "",
//   maxDuracionIda: "25:00",
//   maxDuracionVuelta: "25:00",
// };

const defaultMensaje: Mensaje = {
  mensaje: "",
  multibusqueda: false,
  carryon: true,
  bodega: false,
};
interface Props {
  onSubmit: (data: Mensaje) => void;
  loading?: boolean | null;
}

export function FlightForm({ onSubmit, loading }: Props) {
  const [formData, setFormData] = useState<Mensaje>(defaultMensaje);

  function handleChange(
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >
  ) {
    const target = e.target as
      | HTMLInputElement
      | HTMLSelectElement
      | HTMLTextAreaElement;
    const { name, value, type } = target;
    setFormData((prev: Mensaje) => ({
      ...prev,
      [name]:
        type === "checkbox"
          ? (target as HTMLInputElement).checked
          : type === "number"
          ? Number(value)
          : value,
    }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    console.log(formData);
    onSubmit(formData);
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="max-w-xl mx-auto p-6 bg-white rounded-lg shadow-md space-y-6"
    >
      <h2 className="text-2xl font-semibold text-center text-gray-800">
        Formulario de búsqueda de vuelo
      </h2>
      <label className="block">
        <span className="text-gray-700 font-medium">Mensaje cliente:</span>
        <textarea
          name="mensaje"
          value={formData.mensaje}
          onChange={handleChange}
          required
          className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2
                 shadow-sm placeholder-gray-400 focus:border-indigo-500 focus:ring
                 focus:ring-indigo-200 focus:ring-opacity-50"
          placeholder="Mensaje cliente"
        />
      </label>

      <div className="flex gap-x-9">
        <label className="block">
          <span className="text-gray-700 font-medium">Multi Busqueda:</span>
          <input
            name="multibusqueda"
            type="checkbox"
            onChange={handleChange}
            className=""
            placeholder="Mensaje cliente"
          />
        </label>
        <label className="block">
          <span className="text-gray-700 font-medium">Carry on:</span>
          <input
            name="carryon"
            type="checkbox"
            onChange={handleChange}
            checked={formData.carryon} // ✅ esto refleja el estado actual
            className=""
            placeholder="Mensaje cliente"
          />
        </label>
        <label className="block">
          <span className="text-gray-700 font-medium">Equipaje de bodega:</span>
          <input
            name="bodega"
            type="checkbox"
            onChange={handleChange}
            className=""
            placeholder="Mensaje cliente"
          />
        </label>
      </div>
      <button
        type="submit"
        disabled={loading ? true : false}
        className={`w-full  text-white font-semibold py-3 rounded-md
                transition-colors duration-300 ${
                  loading
                    ? "bg-gray-400 cursor-not-allowed"
                    : "bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50 cursor-pointer"
                } 
               `}
      >
        Buscar vuelos
      </button>
    </form>
  );
}
