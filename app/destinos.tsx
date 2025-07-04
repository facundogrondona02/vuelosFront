import { useState } from "react";

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

type DestinosProps = {
  destinos: Destino[];
  onSubmit: () => Promise<void>;
};

export function Destinos({ destinos, onSubmit }: DestinosProps) {
  const [modificar, setModificar] = useState(false);
  const [ciudad, setCiudad] = useState("");
  const [datosNuevos, setDatosNuevos] = useState<Destino | null>(null);

  const actualizar = (ciudad: string) => {
    setModificar(true);
    setCiudad(ciudad);
    const ciudadEncontrada = destinos.find((d) => d.ciudad === ciudad);

    if (ciudadEncontrada) {
      setDatosNuevos(ciudadEncontrada);
      console.log(datosNuevos);
    }
  };

  const onChange = (
    e: React.ChangeEvent<HTMLInputElement>,
    campo: keyof Destino
  ) => {
    setDatosNuevos((prev) => {
      if (!prev) return prev;
      return {
        ...prev,
        [campo]: e.target.value,
      };
    });
    // console.log(datosNuevos)
  };

  const modificacionFinal = async () => {
    const res = await fetch("/api/lugar", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(datosNuevos),
    });
    console.log(res);
    onSubmit();
    setModificar(false);
    setCiudad("");
  };
  const eliminarFinal = async () => {
    const res = await fetch("/api/lugar", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(ciudad),
    });
    console.log(res);
    onSubmit();
    setModificar(false);
    setCiudad("");
  };
  return (
    <div className="relative">
      {modificar && (
        <div className="absolute -top-10 right-4 flex space-x-4 z-10">
          <button
            onClick={() => {
              setModificar(false);
              setCiudad("");
            }}
            className="bg-gray-500 text-white px-3 py-1 rounded hover:bg-gray-600 transition"
          >
            Salir
          </button>
          <button
            onClick={modificacionFinal}
            className="bg-blue-500 text-white px-3 py-1 rounded hover:bg-blue-600 transition"
          >
            Modificar
          </button>
          <button
            onClick={eliminarFinal}
            className="bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600 transition"
          >
            Eliminar
          </button>
        </div>
      )}
      <div className="overflow-x-auto shadow rounded-lg">
        <table className="min-w-full bg-white border border-gray-200 rounded-lg">
          <thead className="bg-gray-100">
            <tr>
              <th className="py-3 px-4 text-left">Ciudad</th>
              <th className="py-3 px-4 text-left">Origen Vuelta</th>
              <th className="py-3 px-4 text-left">Max Duración Ida</th>
              <th className="py-3 px-4 text-left">Max Duración Vuelta</th>
              <th className="py-3 px-4 text-left">Horario Ida Entre</th>
              <th className="py-3 px-4 text-left">Horario Ida Hasta</th>
              <th className="py-3 px-4 text-left">Horario Vuelta Entre</th>
              <th className="py-3 px-4 text-left">Horario Vuelta Hasta</th>
              <th className="py-3 px-4 text-left">Escalas</th>
            </tr>
          </thead>
          <tbody>
            {destinos.map((destino, index) => (
              <tr
                key={index}
                className="border-t border-gray-200 hover:bg-gray-50 transition"
              >
                <td
                  className={`cursor-pointer py-2 px-4  ${
                    modificar && ciudad === destino.ciudad ? "bg-gray-400" : ""
                  }`}
                >
                  <button
                    className={`cursor-pointer `}
                    onClick={() => actualizar(destino.ciudad)}
                  >
                    {destino.ciudad}
                  </button>
                </td>

                {modificar && destino.ciudad === ciudad ? (
                  <>
                    <td className="px-4">
                      <input
                        type="text"
                        onChange={(e) => onChange(e, "origenVuelta")}
                        defaultValue={destino.origenVuelta}
                        className="border border-gray-500 m-auto text-left w-16 shadow-blue-400 rounded-md px-2 py-1 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-blue-400 transition duration-150"
                      />
                    </td>
                    <td className="px-4">
                      <input
                        type="text"
                        onChange={(e) => onChange(e, "maxDuracionIda")}
                        defaultValue={destino.maxDuracionIda}
                        className="border border-gray-500 m-auto w-16 shadow-blue-400 rounded-md px-2 py-1 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-blue-400 transition duration-150"
                      />
                    </td>
                    <td className="px-4">
                      <input
                        type="text"
                        onChange={(e) => onChange(e, "maxDuracionVuelta")}
                        defaultValue={destino.maxDuracionVuelta}
                        className="border border-gray-500 m-auto w-16 shadow-blue-400 rounded-md px-2 py-1 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-blue-400 transition duration-150"
                      />
                    </td>
                    <td className="px-4">
                      <input
                        type="text"
                        onChange={(e) => onChange(e, "horarioIdaEntre")}
                        defaultValue={destino.horarioIdaEntre}
                        className="border border-gray-500 m-auto w-16 shadow-blue-400 rounded-md px-2 py-1 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-blue-400 transition duration-150"
                      />
                    </td>
                    <td className="px-4">
                      <input
                        type="text"
                        onChange={(e) => onChange(e, "horarioIdaHasta")}
                        defaultValue={destino.horarioIdaHasta}
                        className="border border-gray-500 m-auto w-16 shadow-blue-400 rounded-md px-2 py-1 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-blue-400 transition duration-150"
                      />
                    </td>
                    <td className="px-4">
                      <input
                        type="text"
                        onChange={(e) => onChange(e, "horarioVueltaEntre")}
                        defaultValue={destino.horarioVueltaEntre}
                        className="border border-gray-500 m-auto w-16 shadow-blue-400 rounded-md px-2 py-1 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-blue-400 transition duration-150"
                      />
                    </td>
                    <td className="px-4">
                      <input
                        type="text"
                        onChange={(e) => onChange(e, "horarioVueltaHasta")}
                        defaultValue={destino.horarioVueltaHasta}
                        className="border border-gray-500 m-auto w-16 shadow-blue-400 rounded-md px-2 py-1 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-blue-400 transition duration-150"
                      />
                    </td>
                    <td className="px-4">
                      <input
                        type="text"
                        onChange={(e) => onChange(e, "stops")}
                        defaultValue={destino.stops}
                        className="border border-gray-500 m-auto w-7/12 shadow-blue-400 rounded-md px-2 py-1 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-blue-400 transition duration-150"
                      />
                    </td>
                  </>
                ) : (
                  <>
                    <td className="py-2 px-4">{destino.origenVuelta}</td>
                    <td className="py-2 px-4">{destino.maxDuracionIda}</td>
                    <td className="py-2 px-4">{destino.maxDuracionVuelta}</td>
                    <td className="py-2 px-4">{destino.horarioIdaEntre}</td>
                    <td className="py-2 px-4">{destino.horarioIdaHasta}</td>
                    <td className="py-2 px-4">{destino.horarioVueltaEntre}</td>
                    <td className="py-2 px-4">{destino.horarioVueltaHasta}</td>
                    <td className="py-2 px-4">{destino.stops}</td>
                  </>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
