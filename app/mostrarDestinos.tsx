import { useEffect, useState } from "react";
import { DestinoForm } from "./destinoForm";
import { Destinos } from "./destinos";

type Destino = {
  ciudad: string;
  origenVuelta: string;
  maxDuracionIda: string;
  maxDuracionVuelta: string;
  horarioIdaEntre: string;
  horarioIdaHasta: string;
  horarioVueltaEntre: string;
  horarioVueltaHasta: string;
  stops: string;
};

interface MostrarDestinosProps {
  crearDestino: (destino: Destino) => void;
}

export function MostrarDestinos({ crearDestino  }: MostrarDestinosProps) {
  const [destinos, setDestinos] = useState<Destino[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [vista, setVista] = useState("ver");

  async function fetchData() {
    try {
      const res = await fetch("/api/lugar", { method: "GET" });
      console.log("resss 0", res)
      if (!res.ok) {
        throw new Error("Error al obtener los destinos");
      }
      console.log("RESSS ", await res.clone().text())
      const data = await res.json();
      console.log("Data parseada:", data);

      setDestinos(data);
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("Error desconocido");
      }
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchData();
  }, []);

  if (loading) {
    return <div className="text-center text-lg">Cargando destinos...</div>;
  }

  if (error) {
    return <div className="text-center text-red-500">Error: {error}</div>;
  }

  const verCrearDestino = () => {
    setVista("crear");
  };

  const verDestino = () => {
    setVista("ver");
    fetchData();
  };

  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold mb-4">Destinos disponibles:</h2>

      <div className="mb-4 flex gap-4">
        <button
          disabled={vista === "ver"}
          onClick={verDestino}
          className={`font-semibold py-2 px-4 rounded text-white transition cursor-pointer
    ${
      vista === "ver"
        ? "bg-gray-400 cursor-not-allowed"
        : "bg-blue-600 hover:bg-blue-700 cursor-pointer"
    }`}
        >
          Ver Destinos
        </button>
        <button
          disabled={vista === "crear"}
          onClick={verCrearDestino}
          className={`font-semibold py-2 px-4 rounded text-white transition cursor-pointer
    ${
      vista === "crear"
        ? "bg-gray-400 cursor-not-allowed"
        : "bg-blue-600 hover:bg-blue-700 cursor-pointer"
    }`}
        >
          Crear Destino
        </button>
      </div>
      {vista === "crear" ? (
        <DestinoForm onSubmit={crearDestino} />
      ) : (
        <Destinos destinos={destinos} onSubmit={fetchData} />
      )}
    </div>
  );
}
