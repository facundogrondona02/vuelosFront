"use client";
import React, { useState } from "react";
import { FlightForm } from "./flightForm";
import { FlightFormData } from "./types/types";
import Conex from "./conexion/conex";

export default function Home() {
  const [mensaje, setMensaje] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(false);

  async function handleFlightFormSubmit(data: FlightFormData) {
    console.log("Datos recibidos del formulario:", data);
    setMensaje(null);
    setLoading(true);

    try {
      await Conex(data);
      await new Promise((resolve) => setTimeout(resolve, 1500)); // Esperar que el backend guarde la nueva respuesta
      const resultado = await esperarRespuestaBot(
        "http://localhost:3040/api/mensaje",
        "mensaje"
      );

  if (resultado) {
    setMensaje(resultado);
  } else {
    setMensaje("No se recibió una respuesta válida.");
  }
    } catch (error) {
      console.error("Error esperando respuesta:", error);
      setMensaje("No se recibió respuesta del bot a tiempo.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main style={{ padding: "2rem" }}>
      <h1>Bienvenido a Vuelo Frontend</h1>
      <FlightForm onSubmit={handleFlightFormSubmit} />

      {loading && (
        <p className="text-center mt-4">Esperando respuesta del bot...</p>
      )}

      {mensaje && (
        <div className="text-center mt-4">
          <strong>Costo del vuelo:</strong> {mensaje}
        </div>
      )}
    </main>
  );
}

// Polling: pregunta cada 3s hasta que venga el dato o se agoten los intentos
async function esperarRespuestaBot(
  url: string,
  prop: string,
  intentosMaximos = 40,
  intervaloMs = 3000
): Promise<string> {
  for (let i = 0; i < intentosMaximos; i++) {
    const res = await fetch(url);
    const data = await res.json();

    if (data?.[prop] && typeof data[prop] === "string") {
      return data[prop];
    }

    console.log(`Intento ${i + 1}: sin respuesta aún`);
    await new Promise((resolve) => setTimeout(resolve, intervaloMs));
  }

  throw new Error("No se recibió respuesta dentro del tiempo esperado.");
}
