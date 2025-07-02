import { NextResponse } from "next/server";
import { scrapingVuelos } from "../../../funciones/scraping";
import { generarJsonDesdeMensaje } from "../../../IA/IAVuelo.js";
import { generarArrayMultibusqueda } from "../../../IA/IAMultibusqueda";
import { generarRespuesta } from "../../../IA/IAGeneracionRespuesta";
import { getContextConSesionValida } from "@/funciones/context";
import { Browser, BrowserContext } from "playwright";

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
  adults: number;
  children: number;
  infants: number;
};// tu-ruta-api/route.ts
// ... tus imports

export async function POST(req: Request) {
  const params = await req.json();
  const mensajeCliente = params.mensaje;
  const objetoViaje = [];

  console.log("Mensaje del cliente:", mensajeCliente);

  if (params.multibusqueda == false) {
    objetoViaje.push(await generarJsonDesdeMensaje(mensajeCliente));
  } else {
    const array = await generarArrayMultibusqueda(mensajeCliente);
    if (Array.isArray(array)) {
      objetoViaje.push(...array);
    } else {
      objetoViaje.push(array);
    }
  }
  let browser: Browser | undefined; // Declara el navegador fuera del try para cerrarlo en finally
  let context: BrowserContext | undefined;

  try {
    // Obtén el contexto una sola vez, que ya viene con la sesión válida
    const result = await getContextConSesionValida({
      mail: objetoViaje[0].mail, // Asume que el mail y password están en el primer objeto de viaje
      password: objetoViaje[0].password,
    });
    browser = result.browser;
    context = result.context;

    const respuestas: VueloFinal[] = [];

    // Ahora, todos los scrapings pueden usar el mismo contexto logueado
    // Y se ejecutarán en paralelo gracias a Promise.all
    const scrapingPromises = objetoViaje.map((vueloOriginal) => {
      const vuelo = {
        ...vueloOriginal,
        carryon: params.carryon,
        bodega: params.bodega,
        context, // Pasa el contexto ya logueado
      };
      // console.log("Vuelo a scrapear:", vuelo); // Esto puede generar mucho output, úsalo para debug
      return scrapingVuelos(vuelo);
    });

    const scrapingResults = await Promise.all(scrapingPromises);
    respuestas.push(...scrapingResults.filter((r): r is VueloFinal => r !== undefined));

    const jsonData = JSON.stringify(respuestas);
    // console.log("OBJETO VIAJE", objetoViaje); // Comenta si genera mucho output
    // console.log(respuestas, " OBJETO RESPUESTA"); // Comenta si genera mucho output
    const response = await generarRespuesta(jsonData);

    return NextResponse.json({ ok: true, result: response, status: 200 });

  } catch (error) {
    console.error("❌ Error general inesperado en la ruta POST:", error);
    return NextResponse.json({
      ok: false,
      result: "Ocurrió un error inesperado durante la ejecución del scraping.",
      detalle: error instanceof Error ? error.message : String(error) // Asegurarse de que el error sea string
    }, { status: 500 });
  } finally {
    if (browser) {
      console.log("Cerrando el navegador.");
      await browser.close(); // Cierra el navegador al finalizar todas las operaciones
    }
  }
}