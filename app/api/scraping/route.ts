import { NextResponse } from "next/server";
import { scrapingVuelos } from "../../../funciones/scraping";

export async function POST(req: Request) {
  const params = await req.json();
  const result = await scrapingVuelos(params);
  return NextResponse.json({ result });
}