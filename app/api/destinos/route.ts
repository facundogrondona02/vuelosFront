import { promises as fs } from 'fs';
import path from 'path';
import { NextResponse } from 'next/server';

// Ruta donde vamos a guardar el archivo destinos.json
const filePath = path.join(process.cwd(), 'data', 'destinos.json');
const codigos = path.join(process.cwd(),'data', 'codigoIATA.json')

export async function POST(req: Request) {
  const nuevoDestino = await req.json();
  
  // Leemos el archivo actual
  let destinosActuales = [] ;
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
  if(existeCodigos){
        return NextResponse.json({ result: "Ya existe un codigo IATA con ese origenVuelta" }, { status: 400 });

  }
  // Agregamos el nuevo destino
  destinosActuales.push(nuevoDestino);
  const objetoparaIATA = {
    ciudad:nuevoDestino.ciudad,
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


// export async function PUT(req: Request){

// }



export async function GET() {
  const filePath = path.join(process.cwd(), 'data', 'destinos.json');

  try {
    const data = await fs.readFile(filePath, 'utf-8');
    const destinos = JSON.parse(data);
    return NextResponse.json(destinos);
  } catch (error) {
    console.log(error)
    return NextResponse.json([], { status: 200 });
  }
}
