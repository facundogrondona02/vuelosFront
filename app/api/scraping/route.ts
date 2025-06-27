import { NextResponse } from "next/server";
import { scrapingVuelos } from "../../../funciones/scraping";
import { generarJsonDesdeMensaje } from "../../../IA/IAVuelo.js";
import { generarArrayMultibusqueda } from "../../../IA/IAMultibusqueda";
import { generarRespuesta } from "../../../IA/IAGeneracionRespuesta";

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
export async function POST(req: Request) {
  const params = await req.json();
  const mensajeCliente = params.mensaje;
  const objetoViaje = [];
  console.log("Mensaje del cliente:", mensajeCliente);
  if (params.multibusqueda == false) {
    objetoViaje.push(await generarJsonDesdeMensaje(mensajeCliente))
    
  } else {
    const array = await generarArrayMultibusqueda(mensajeCliente);
    if (Array.isArray(array)) {
      objetoViaje.push(...array);
    } else {
      objetoViaje.push(array);
    }
  }

  const respuestas: VueloFinal[] = [];
  
  const scrapingPromises =  objetoViaje.map(async (vuelo) =>
    { 
      vuelo = { ...vuelo, carryon: params.carryon, bodega: params.bodega }
      return await scrapingVuelos(vuelo)
    });
  const scrapingResults = await Promise.all(scrapingPromises);

  // Filtrás los undefined o errores si es necesario
  const respuesta =  scrapingResults.filter((r) => r !== undefined);

  respuestas.push(...respuesta); 

  const jsonData = JSON.stringify(respuestas);
  const response = await generarRespuesta(jsonData)
  console.log(response, " respuestas")
  return NextResponse.json({ result: response });
}