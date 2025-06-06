import { NextResponse } from "next/server";
import { scrapingVuelos } from "../../../funciones/scraping";
import { generarJsonDesdeMensaje } from "../../../IA/IAVuelo.js";

export async function POST(req: Request) {
  const params = await req.json();

  const mensajeCliente = params.mensaje;

  // 1. Interpretar mensaje del cliente → JSON con datos de vuelo
  const objetoViaje = await generarJsonDesdeMensaje(mensajeCliente);

  // 2. Pasar ese JSON al bot de scraping
  const result = await scrapingVuelos(objetoViaje);

  return NextResponse.json({ result });
}
