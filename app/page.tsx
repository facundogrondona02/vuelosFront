"use client";
import React, { useState } from "react";
import { FlightForm } from "./flightForm";
import {  Mensaje } from "./types/types";
// import { scrapingVuelos } from "@/funciones/scraping";
// import Conex from "./conexion/conex";

type VueloFinal = {
  precioFinal: string;
  aeropuertoIda: string;
  horarioSalidaIda: string;
  ciudadOrigenIda: string;
  horarioSupongoDuracionIda: string;
  escalasIda: string;
  horarioSupongoLlegadaIda: string;
  aeropuertoDestinoIda: string;
  ciudadDestinoIda: string;
  aeropuertoVuelta: string;
  horarioSalidaVuelta: string;
  ciudadOrigenVuelta: string;
  horarioSupongoDuracionVuelta: string;
  escalasVuelta: string;
  horarioSupongoLlegadaVuelta: string;
  aeropuertoDestinoVuelta: string;
  ciudadDestinoVuelta: string;
  aerolinea: string;
};

export default function Home() {
  const [mensaje, setMensaje] = useState<VueloFinal | null>(null);
  const [loading, setLoading] = useState<boolean>(false);

  // en tu componente React (frontend)
  async function handleFlightFormSubmit(data: Mensaje) {
    setLoading(true);
    console.log(data, " data desde page")
    const res = await fetch("/api/scraping", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    const { result } = await res.json();
    setMensaje(result || "No se pudo obtener el costo del vuelo.");
    setLoading(false);
  }

  return (
    <main style={{ padding: "2rem" }}>
      <h1>Bienvenido a Vuelo Frontend</h1>
      <FlightForm onSubmit={handleFlightFormSubmit} />

      {loading ? (
        <p className="text-center mt-4">Esperando respuesta del bot...</p>
      ) : (
        mensaje && (
          <div className="text-center mt-4">
            <h2>✈️ Detalles del vuelo</h2>
            {Object.entries(mensaje).map(([clave, valor]) => (
              <p key={clave}>
                <strong>{clave}:</strong> {valor || "No disponible"}
              </p>
            ))}
          </div>
        )
      )}
    </main>
  );
}
