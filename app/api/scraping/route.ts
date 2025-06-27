import { NextResponse } from "next/server";
import { scrapingVuelos } from "../../../funciones/scraping";
import { generarJsonDesdeMensaje } from "../../../IA/IAVuelo.js";
import { generarArrayMultibusqueda } from "../../../IA/IAMultibusqueda";
import { generarRespuesta } from "../../../IA/IAGeneracionRespuesta";
import { getContextConSesionValida } from "@/funciones/context";

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

  // const respuestas: VueloFinal[] = [];

  // const scrapingPromises =  objetoViaje.map(async (vuelo) =>
  //   { 
  //     vuelo = { ...vuelo, carryon: params.carryon, bodega: params.bodega }
  //     return await scrapingVuelos(vuelo)
  //   });
  // const scrapingResults = await Promise.all(scrapingPromises);
try {
  const respuestas: VueloFinal[] = [];

  // Verificás UNA SOLA VEZ si está logueado antes de entrar al for
  console.log("🔍 Verificando estado de sesión...",objetoViaje[0].mail, objetoViaje[0].password);
  const { estaLogueado } = await getContextConSesionValida({
    mail: objetoViaje[0].mail,
    password: objetoViaje[0].password,
  });

  console.log("Estado de sesión:", estaLogueado ? "Iniciada" : "No iniciada");
  if (!estaLogueado) {
    // ⏳ Mandar scraping cada 4 segundos, pero sin esperar que terminen
    const scrapingPromises = objetoViaje.map((vueloOriginal, i) => {
      return new Promise<VueloFinal>((resolve) => {
        setTimeout(async () => {
          const vuelo = { ...vueloOriginal, carryon: params.carryon, bodega: params.bodega };
          console.log(`🚀 Lanzando scraping ${i + 1}...`);
          const resultado = await scrapingVuelos(vuelo);
          if (resultado === undefined) {
            // You can handle this as you prefer: throw, skip, or provide a default
            throw new Error("scrapingVuelos returned undefined");
          }
          resolve(resultado);
        }, i * 10000); // cada 4 segundos
      });
    });

    const scrapingResults = await Promise.all(scrapingPromises);
    respuestas.push(...scrapingResults.filter((r): r is VueloFinal => r !== undefined));
  } else {
    // 🚀 Sesión ya iniciada → todos los scrapings en paralelo
    const scrapingPromises = objetoViaje.map(async (vuelo) => {
      vuelo = { ...vuelo, carryon: params.carryon, bodega: params.bodega };
      return await scrapingVuelos(vuelo);
    });

    const scrapingResults = await Promise.all(scrapingPromises);
    respuestas.push(...scrapingResults.filter((r): r is VueloFinal => r !== undefined));
  }

  // Filtrás los undefined o errores si es necesario
  // const respuesta =  scrapingResults.filter((r) => r !== undefined);

  // respuestas.push(...respuesta); 

  const jsonData = JSON.stringify(respuestas);
  const response = await generarRespuesta(jsonData)
  console.log(response, " respuestas")
  // return NextResponse.json({ result: response });
    return NextResponse.json({ ok: true, result: response,  status: 200 });

} catch (error) {
  console.error("❌ Error general inesperado:", error);
  return NextResponse.json({
    ok: false,
    result: "Ocurrió un error inesperado durante la ejecución del scraping.",
    detalle: error instanceof Error ? error.message : error
  },{status: 500});
}
}