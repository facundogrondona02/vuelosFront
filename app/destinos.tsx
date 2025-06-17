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
};

export function Destinos({ destinos }: DestinosProps){

    return(
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
                  <td className="py-2 px-4">{destino.ciudad}</td>
                  <td className="py-2 px-4">{destino.origenVuelta}</td>
                  <td className="py-2 px-4">{destino.maxDuracionIda}</td>
                  <td className="py-2 px-4">{destino.maxDuracionVuelta}</td>
                  <td className="py-2 px-4">{destino.horarioIdaEntre}</td>
                  <td className="py-2 px-4">{destino.horarioIdaHasta}</td>
                  <td className="py-2 px-4">{destino.horarioVueltaEntre}</td>
                  <td className="py-2 px-4">{destino.horarioVueltaHasta}</td>
                  <td className="py-2 px-4">{destino.stops}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
    )
}