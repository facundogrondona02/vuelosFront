"use client";
import React, { useState } from "react";
import { FlightForm } from "./flightForm";
import { FlightFormData } from "./types/types";
// import { scrapingVuelos } from "@/funciones/scraping";
// import Conex from "./conexion/conex";

export default function Home() {
  const [mensaje, setMensaje] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(false);

// en tu componente React (frontend)
async function handleFlightFormSubmit(data: FlightFormData) {
  setLoading(true);
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

      {loading  ? (
        <p className="text-center mt-4">Esperando respuesta del bot...</p>
      ) :
      
        mensaje && (
        <div className="text-center mt-4">
          <strong>Costo del vuelo:</strong> {mensaje}
        </div>
      )}

 
    </main>
  );
}
