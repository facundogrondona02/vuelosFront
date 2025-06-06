"use client";
import React, { useState } from "react";
import { FlightFormData } from "./types/types";
const defaultFormData: FlightFormData = {
  mail: "",
  password: "",
  originDeparture: "",
  originReturn: "",
  departureDate: "",
  returnDate: "",
  adults: 1,
  children: 0,
  infants: 0,
  currency: "USD",
  stops: "directo",
  checkedBaggage: false,
  horarioIdaEntre: "",
  horarioIdaHasta: "",
  horarioVueltaEntre: "",
  horarioVueltaHasta: "",
  maxDuracionIda: "25:00",
  maxDuracionVuelta: "25:00",
};

interface Props {
  onSubmit: (data: FlightFormData) => void;
}

export function FlightForm({ onSubmit }: Props) {
  const [formData, setFormData] = useState<FlightFormData>(defaultFormData);

  function handleChange(
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) {
    const target = e.target as HTMLInputElement | HTMLSelectElement;
    const { name, value, type } = target;
    setFormData((prev: FlightFormData) => ({
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
    if (formData.adults + formData.children < 1) {
      alert("Debe haber al menos una persona (adulto o niño).");
      return;
    }
    console.log("Datos enviados:", formData);
    onSubmit(formData);
    setFormData(defaultFormData); // Reset form after submission
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="max-w-xl mx-auto p-6 bg-white rounded-lg shadow-md space-y-6"
    >
      <h2 className="text-2xl font-semibold text-center text-gray-800">
        Formulario de búsqueda de vuelo
      </h2>

      {/* <label className="block">
        <span className="text-gray-700 font-medium">Mail:</span>
        <input
          type="email"
          name="mail"
          value={formData.mail}
          onChange={handleChange}
          required
          className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2
                 shadow-sm placeholder-gray-400 focus:border-indigo-500 focus:ring
                 focus:ring-indigo-200 focus:ring-opacity-50"
          placeholder="tu@email.com"
        />
      </label>

      <label className="block">
        <span className="text-gray-700 font-medium">Contraseña:</span>
        <input
          type="password"
          name="password"
          value={formData.password}
          onChange={handleChange}
          required
          className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2
                 shadow-sm placeholder-gray-400 focus:border-indigo-500 focus:ring
                 focus:ring-indigo-200 focus:ring-opacity-50"
          placeholder="********"
        />
      </label>

      <label className="block">
        <span className="text-gray-700 font-medium">
          Origen de Salida (ej: Buenos Aires = BUE):
        </span>
        <input
          type="text"
          name="originDeparture"
          value={formData.originDeparture}
          onChange={handleChange}
          required
          className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2
                 shadow-sm placeholder-gray-400 focus:border-indigo-500 focus:ring
                 focus:ring-indigo-200 focus:ring-opacity-50"
          placeholder="BUE"
        />
      </label>

      <label className="block">
        <span className="text-gray-700 font-medium">Origen de Vuelta:</span>
        <input
          type="text"
          name="originReturn"
          value={formData.originReturn}
          onChange={handleChange}
          required
          className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2
                 shadow-sm placeholder-gray-400 focus:border-indigo-500 focus:ring
                 focus:ring-indigo-200 focus:ring-opacity-50"
          placeholder="BUE"
        />
      </label>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
        <label className="block">
          <span className="text-gray-700 font-medium">
            Fecha de Ida (ej: 13SEP):
          </span>
          <input
            type="text"
            name="departureDate"
            value={formData.departureDate}
            onChange={handleChange}
            required
            className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2
                   shadow-sm placeholder-gray-400 focus:border-indigo-500 focus:ring
                   focus:ring-indigo-200 focus:ring-opacity-50"
            placeholder="13SEP"
          />
        </label>

        <label className="block">
          <span className="text-gray-700 font-medium">Fecha de Vuelta:</span>
          <input
            type="text"
            name="returnDate"
            value={formData.returnDate}
            onChange={handleChange}
            required
            className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2
                   shadow-sm placeholder-gray-400 focus:border-indigo-500 focus:ring
                   focus:ring-indigo-200 focus:ring-opacity-50"
            placeholder="20SEP"
          />
        </label>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        <label className="block">
          <span className="text-gray-700 font-medium">
            Cantidad de Adultos:
          </span>
          <input
            type="number"
            name="adults"
            min={0}
            value={formData.adults}
            onChange={handleChange}
            required
            className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2
                   shadow-sm focus:border-indigo-500 focus:ring focus:ring-indigo-200
                   focus:ring-opacity-50"
          />
        </label>

        <label className="block">
          <span className="text-gray-700 font-medium">Cantidad de Niños:</span>
          <input
            type="number"
            name="children"
            min={0}
            value={formData.children}
            onChange={handleChange}
            className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2
                   shadow-sm focus:border-indigo-500 focus:ring focus:ring-indigo-200
                   focus:ring-opacity-50"
          />
        </label>

        <label className="block">
          <span className="text-gray-700 font-medium">
            Cantidad de Infantes:
          </span>
          <input
            type="number"
            name="infants"
            min={0}
            value={formData.infants}
            onChange={handleChange}
            className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2
                   shadow-sm focus:border-indigo-500 focus:ring focus:ring-indigo-200
                   focus:ring-opacity-50"
          />
        </label>
      </div>

      <label className="block">
        <span className="text-gray-700 font-medium">Tipo de moneda:</span>
        <select
          name="currency"
          value={formData.currency}
          onChange={handleChange}
          required
          className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2
                 shadow-sm focus:border-indigo-500 focus:ring focus:ring-indigo-200
                 focus:ring-opacity-50"
        >
          <option value="USD">USD</option>
          <option value="ARS">ARS</option>
          <option value="EUR">EUR</option>
        </select>
      </label>

      <label className="block">
        <span className="text-gray-700 font-medium">Cantidad de escalas:</span>
        <select
          name="stops"
          value={formData.stops}
          onChange={handleChange}
          required
          className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2
                 shadow-sm focus:border-indigo-500 focus:ring focus:ring-indigo-200
                 focus:ring-opacity-50"
        >
          <option value="directo">Directo</option>
          <option value="1 escala">1 escala</option>
          <option value="2 escalas">2 escalas</option>
        </select>
      </label>

      <label className="inline-flex items-center space-x-2">
        <input
          type="checkbox"
          name="checkedBaggage"
          checked={formData.checkedBaggage}
          onChange={handleChange}
          className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
        />
        <span className="text-gray-700 font-medium">Equipaje bodega</span>
      </label>

      <div className=" gap-6">
        <p className="col-span-3 text-center font-semibold text-gray-700">
          Horario de salida entre xx:xxhs y xx:xxhs
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-2">
          <label className="block">
            <span className="text-gray-700 font-medium">
              Horario ida (00:00 a 23:59):
            </span>
            <input
              type="time"
              name="horarioIdaEntre"
              value={formData.horarioIdaEntre}
              onChange={handleChange}
              required
              className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2
                 shadow-sm focus:border-indigo-500 focus:ring focus:ring-indigo-200
                 focus:ring-opacity-50"
            />
          </label>

          <label className="block">
            <span className="text-gray-700 font-medium">
              Horario ida (00:00 a 23:59):
            </span>
            <input
              type="time"
              name="horarioIdaHasta"
              value={formData.horarioIdaHasta}
              onChange={handleChange}
              required
              className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2
                 shadow-sm focus:border-indigo-500 focus:ring focus:ring-indigo-200
                 focus:ring-opacity-50"
            />
          </label>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
        <label className="block">
          <span className="text-gray-700 font-medium">
            Horario de vuelta (00:00 a 23:59):
          </span>
          <input
            type="time"
            name="horarioVueltaEntre"
            value={formData.horarioVueltaEntre}
            onChange={handleChange}
            required
            className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2
                   shadow-sm focus:border-indigo-500 focus:ring focus:ring-indigo-200
                   focus:ring-opacity-50"
          />
        </label>

        <label className="block">
          <span className="text-gray-700 font-medium">
            Horario de vuelta (00:00 a 23:59):
          </span>
          <input
            type="time"
            name="horarioVueltaHasta"
            value={formData.horarioVueltaHasta}
            onChange={handleChange}
            required
            className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2
                   shadow-sm focus:border-indigo-500 focus:ring focus:ring-indigo-200
                   focus:ring-opacity-50"
          />
        </label>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
        <label className="block">
          <span className="text-gray-700 font-medium">
            Horario máximo de duración ida (horas):
          </span>
          <input
            type="text"
            name="maxDuracionIda"
            min={1}
            value={formData.maxDuracionIda}
            onChange={handleChange}
            required
            className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2
                   shadow-sm focus:border-indigo-500 focus:ring focus:ring-indigo-200
                   focus:ring-opacity-50"
          />
        </label>

        <label className="block">
          <span className="text-gray-700 font-medium">
            Horario máximo de duración vuelta (horas):
          </span>
          <input
            type="text"
            name="maxDuracionVuelta"
            min={1}
            value={formData.maxDuracionVuelta}
            onChange={handleChange}
            required
            className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2
                   shadow-sm focus:border-indigo-500 focus:ring focus:ring-indigo-200
                   focus:ring-opacity-50"
          />
        </label>
      </div> */}

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
