"use client";
import React, { useState } from "react";
import { FlightForm } from "./flightForm";
import { Mensaje, FormData } from "./types/types";
import { MostrarDestinos } from "./mostrarDestinos";

export default function Home() {
  const [mensaje, setMensaje] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [verForm, setVerForm] = useState<boolean>(false);

  async function handleFlightFormSubmit(data: Mensaje) {
    setLoading(true);
    console.log(data, " data desde page");
    fetch("/api/scraping", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    })
      .then((res) => res.json()) // 👈 acá faltaba el return implícito
      .then((data) => {
        console.log(data.ok, " data desde page y ", data.status);
        // Podés manejar diferentes respuestas del backend:
        if (data.ok) {
          setMensaje(data.result || "Scraping exitoso, pero no se devolvió mensaje.");
          setLoading(false);
        } else {
          setMensaje("El scraping falló: " + data.mensaje);
          setLoading(false);
        }
      })
      .catch((error) => {
        console.error("Error al enviar el formulario:", error);
        setMensaje("Ocurrió un error al enviar el formulario.");
        setLoading(false);
      });

    // const { result, ok } = await res.json();
    // console.log("Respuesta del servidor:", ok);

    // setMensaje(ok || "No se pudo obtener el costo del vuelo.");
  }

  async function guardarDestino(data: FormData) {
    console.log("DESDE EL HOME", data);
    const res = await fetch("/api/lugar", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    const { result } = await res.json();
    // Acá después haces el fetch al backend si querés guardar
    console.log("desde api? ", result);
  }

  return (
    <main style={{ padding: "2rem" }}>
      <h1>Bienvenido a Vuelo Frontend</h1>

      {verForm ? (
        <div>
          <button
            onClick={() => setVerForm(false)}
            className="font-semibold py-2 px-4 rounded text-white transition  bg-blue-600 hover:bg-blue-700 cursor-pointer"
          >
            Mensaje cliente
          </button>
          <MostrarDestinos crearDestino={guardarDestino} />
        </div>
      ) : (
        <div>
          <button
            onClick={() => setVerForm(true)}
            className="font-semibold py-2 px-4 rounded text-white transition  bg-blue-600 hover:bg-blue-700 cursor-pointer"
          >
            Destinos
          </button>
          <FlightForm onSubmit={handleFlightFormSubmit} loading={loading} />
          {loading ? (
            <p className="text-center mt-4">Esperando respuesta del bot...</p>
          ) : (
            mensaje && (
              <div className="flex justify-center mt-8">
                <div className="max-w-2xl bg-white shadow-md rounded p-6">
                  <h2 className="text-2xl font-semibold mb-4 text-center">
                    ✈️ Detalles del vuelo
                  </h2>
                  <pre className="whitespace-pre-wrap">
                    {typeof mensaje === "string"
                      ? mensaje
                      : JSON.stringify(mensaje)}
                  </pre>
                </div>
              </div>
            )
          )}
        </div>
      )}
    </main>
  );
}
