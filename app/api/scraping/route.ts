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
  console.log(params)
  const mensajeCliente = params.mensaje;
  console.log(mensajeCliente, " mensaje cliente")
  const objetoViaje = [];
  if (params.multibusqueda == false) {
    console.log("Entramos aca?")
    objetoViaje.push(await generarJsonDesdeMensaje(mensajeCliente))
    console.log("este es el obj ",objetoViaje)

  } else {
    console.log("antes de multi",)
    const array = await generarArrayMultibusqueda(mensajeCliente);
    console.log("array con respuestas ", array)
    if (Array.isArray(array)) {
      console.log("entro aca??")
      objetoViaje.push(...array);
      console.log("aca esta la posta ",array)
    } else {
      console.log("o entro aca??")
      objetoViaje.push(array);
    }
  }
  // 1. Interpretar mensaje del cliente → JSON con datos de vuelo
  console.log("objeto viaj", objetoViaje)
  // 2. Pasar ese JSON al bot de scraping
  const respuestas: VueloFinal[] = [];
  for (const vuelo of objetoViaje) {
    const respuesta = await scrapingVuelos(vuelo);
    console.log("Despues del scraping")
    if (respuesta !== undefined) {
      respuestas.push(respuesta);
    }
  }

  console.log(respuestas, " respuestas pre")
  const jsonData = JSON.stringify(respuestas);
  const response = await generarRespuesta(jsonData)
  console.log(response, " respuestas")
  return NextResponse.json({ result: response });
}