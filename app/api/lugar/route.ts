import { promises as fs } from 'fs';
import path from 'path';
import { NextResponse } from 'next/server';

// Ruta donde vamos a guardar el archivo destinos.json
const filePath = path.join(process.cwd(), 'data', 'destinos.json');
const codigos = path.join(process.cwd(), 'data', 'codigoIATA.json')

export async function POST(req: Request) {
  const nuevoDestino = await req.json();

  // Leemos el archivo actual
  let destinosActuales = [];
  let codigosIATASActuales = []

  try {
    const data = await fs.readFile(filePath, 'utf-8');
    destinosActuales = JSON.parse(data);
    const cods = await fs.readFile(codigos, 'utf-8')
    codigosIATASActuales = JSON.parse(cods);
  } catch (error) {
    console.log(error)

    // Si no existe el archivo, arrancamos vacío
    destinosActuales = [];
    codigosIATASActuales = [];
  }

  // Validamos si ya existe el origenVuelta
  const existe = destinosActuales.find((d: { origenVuelta: unknown; }) => d.origenVuelta === nuevoDestino.origenVuelta);
  const existeCodigos = codigosIATASActuales.find((d: { origenVuelta: unknown; }) => d.origenVuelta === nuevoDestino.origenVuelta);

  if (existe) {
    return NextResponse.json({ result: "Ya existe un destino con ese origenVuelta" }, { status: 400 });
  }
  if (existeCodigos) {
    return NextResponse.json({ result: "Ya existe un codigo IATA con ese origenVuelta" }, { status: 400 });

  }
  // Agregamos el nuevo destino
  destinosActuales.push(nuevoDestino);
  const objetoparaIATA = {
    ciudad: nuevoDestino.ciudad,
    codigoIATA: nuevoDestino.origenVuelta
  }
  codigosIATASActuales.push(objetoparaIATA)
  // Guardamos el nuevo archivo
  await fs.mkdir(path.dirname(filePath), { recursive: true });
  await fs.writeFile(filePath, JSON.stringify(destinosActuales, null, 2), 'utf-8');

  await fs.mkdir(path.dirname(codigos), { recursive: true });
  await fs.writeFile(codigos, JSON.stringify(codigosIATASActuales, null, 2), 'utf-8');

  return NextResponse.json({ result: "Destino agregado correctamente" });
}


interface DestinoActual {
  ciudad: string,
  origenVuelta: string,
  maxDuracionIda: string,
  maxDuracionVuelta: string,
  horarioIdaEntre: string,
  horarioIdaHasta: string,
  horarioVueltaEntre: string,
  horarioVueltaHasta: string,
  stops: string
}
interface codigoIATA {
  ciudad: string,
  codigoIATA: string
}

export async function PUT(req: Request): Promise<NextResponse> {
  const nuevoDestino: DestinoActual = await req.json();
  console.log("desde la api ", nuevoDestino)

  // Leemos el archivo actual
  let destinosActuales = [];
  let codigosIATASActuales = []

  try {
    const data = await fs.readFile(filePath, 'utf-8');
    destinosActuales = JSON.parse(data);
    console.log("destinos actuales ", destinosActuales)
    const cods = await fs.readFile(codigos, 'utf-8')
    codigosIATASActuales = JSON.parse(cods);
    console.log("codigos actuales ", codigosIATASActuales)

  } catch (error) {
    console.log(error)

    // Si no existe el archivo, arrancamos vacío
    destinosActuales = [];
    codigosIATASActuales = [];
  }
  const existe = destinosActuales.find((d: { ciudad: string; }) => d.ciudad === nuevoDestino.ciudad);
  const indexDestino = destinosActuales.findIndex(
    (d: DestinoActual) => d.ciudad === nuevoDestino.ciudad
  );
  console.log("Existe ? ", destinosActuales[0])

  const existeCodigos = codigosIATASActuales.find((d: { ciudad: string; }) => d.ciudad === nuevoDestino.ciudad);
  const indexIATA = codigosIATASActuales.findIndex(
    (d: codigoIATA) => d.ciudad === nuevoDestino.ciudad
  );

  if (!existe || !existeCodigos) {
    return NextResponse.json({ result: "No se encuentra esta ciudad" }, { status: 400 });
  }
  const objetoIATA = {
    ciudad: nuevoDestino.ciudad,
    codigoIATA: nuevoDestino.origenVuelta
  };
  console.log(objetoIATA)
  destinosActuales[indexDestino] = { ...nuevoDestino };
  codigosIATASActuales[indexIATA] = { ...objetoIATA };
  try {
    await fs.writeFile(filePath, JSON.stringify(destinosActuales, null, 2), 'utf-8');
    await fs.writeFile(codigos, JSON.stringify(codigosIATASActuales, null, 2), 'utf-8');
    return NextResponse.json({ result: "Destino actualizado correctamente" }, { status: 200 });
  } catch (error) {
    console.error("Error escribiendo archivo:", error);
    return NextResponse.json({ result: "Error al guardar los cambios" }, { status: 500 });
  }
}



export async function GET() {
  console.log("HIKAAA")
  try {
    const data = await fs.readFile(filePath, 'utf-8');
    const destinos = JSON.parse(data);
    return NextResponse.json(destinos);
  } catch (error) {
    console.log("Este error? ", error)
    return NextResponse.json([], { status: 200 });
  }
}


export async function DELETE(req: Request): Promise<NextResponse> {
  const ciudadEliminar: string = await req.json();
  console.log("desde la api ", ciudadEliminar)

  // Leemos el archivo actual
  let destinosActuales = [];
  let codigosIATASActuales = []
  
  let destinosActualesFinales = []
  let codigosIATASActualesFinales = []

  try {
    const data = await fs.readFile(filePath, 'utf-8');
    destinosActuales = JSON.parse(data);
    destinosActualesFinales = JSON.parse(data)
    console.log("destinos actuales ", destinosActuales)
    const cods = await fs.readFile(codigos, 'utf-8')
    codigosIATASActuales = JSON.parse(cods);
    codigosIATASActualesFinales = JSON.parse(cods)
    console.log("codigos actuales ", codigosIATASActuales)

  } catch (error) {
    console.log(error)

    // Si no existe el archivo, arrancamos vacío
    destinosActuales = [];
    codigosIATASActuales = [];
  }
  // const existe = destinosActuales.find((d: { ciudad: string; }) => d.ciudad === ciudadEliminar);
   destinosActuales = destinosActuales.filter((d: { ciudad: string; }) => d.ciudad !== ciudadEliminar);
  console.log(destinosActuales, "Todos menos ", ciudadEliminar)

  // const indexDestino = destinosActuales.findIndex(
  //   (d: DestinoActual) => d.ciudad === ciudadEliminar
  // );
  // console.log("Existe ? ", destinosActuales[0])

  // const existeCodigos = codigosIATASActuales.find((d: { ciudad: string; }) => d.ciudad === ciudadEliminar);
  codigosIATASActuales = codigosIATASActuales.filter((d: { ciudad: string; }) => d.ciudad !== ciudadEliminar);
  console.log(codigosIATASActuales, "Todos menos ", ciudadEliminar)
  // const indexIATA = codigosIATASActuales.findIndex(
  //   (d: codigoIATA) => d.ciudad === ciudadEliminar
  // );

  if (codigosIATASActuales === codigosIATASActualesFinales || destinosActualesFinales === destinosActuales) {
    return NextResponse.json({ result: "No se encuentra esta ciudad" }, { status: 400 });
  }

  // destinosActuales[indexDestino] = { ...nuevoDestino };
  // codigosIATASActuales[indexIATA] = { ...objetoIATA };
  try {
    await fs.writeFile(filePath, JSON.stringify(destinosActuales, null, 2), 'utf-8');
    await fs.writeFile(codigos, JSON.stringify(codigosIATASActuales, null, 2), 'utf-8');
    return NextResponse.json({ result: "Destino actualizado correctamente" }, { status: 200 });
  } catch (error) {
    console.error("Error escribiendo archivo:", error);
    return NextResponse.json({ result: "Error al guardar los cambios" }, { status: 500 });
  }
}