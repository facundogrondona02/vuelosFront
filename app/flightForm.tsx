"use client";
import React, { useState } from "react";
import {  Mensaje } from "./types/types";
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

const defaultMensaje : Mensaje  = {
  mensaje:"",
  multibusqueda:false
}
interface Props {
  onSubmit: (data: Mensaje) => void;
}

export function FlightForm({ onSubmit }: Props) {
  const [formData, setFormData] = useState<Mensaje>(defaultMensaje);

  function handleChange(
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) {
    const target = e.target as HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement;
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
      <button
        type="submit"
        className="w-full bg-indigo-600 text-white font-semibold py-3 rounded-md
               hover:bg-indigo-700 transition-colors duration-300"
      >
        Buscar vuelos
      </button>
    </form>
  );
}
