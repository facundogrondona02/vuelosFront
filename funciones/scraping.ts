// scraping.js
import { console } from "inspector";
import DuracionVueloIda from "../componentes/DuracionVueloIda";
import { ajustarSliderVueloVuelta } from "../componentes/DuracionVueloVuelta";
import HorarioSalidaIda from "../componentes/HorarioSalidaIda";
import HorarioSalidaVuelta from "../componentes/HorarioSalidaVuelta";
import { hacerLogin } from "./hacerLogin";
import recorroListaVuelos from "./recorroListaVuelos";


interface ScrapingVuelosParams {
  mail: string,
  password: string,
  originDeparture: string;
  originReturn: string;
  departureDate: string;
  returnDate: string;
  adults: number;
  children: number;
  infants: number;
  stops: string;
  checkedBaggage: boolean;
  horarioIdaEntre: string;
  horarioIdaHasta: string;
  horarioVueltaEntre: string;
  horarioVueltaHasta: string;
  maxDuracionIda: string;
  maxDuracionVuelta: string;
  // ... otros params que necesites
}

import { chromium, Page } from "playwright"; // Import the correct Page type from Playwright

export async function scrapingVuelos(
  // page: Page,
  params: ScrapingVuelosParams
): Promise<string | undefined> {
  const {
    mail,
    password,
    originDeparture,
    originReturn,
    departureDate,
    returnDate,
    adults,
    children,
    infants,
    checkedBaggage,
    horarioIdaEntre,
    horarioIdaHasta,
    horarioVueltaEntre,
    horarioVueltaHasta,
    maxDuracionIda,
    maxDuracionVuelta,
    // ... otros params que necesites
  } = params;
  const browser = await chromium.launch({ headless: false }); 

  // 2. Abrís una nueva pestaña (page)
  const page: Page = await browser.newPage();
  try {
  console.log("Iniciando scraping de vuelos con los siguientes parámetros:", params);
  await hacerLogin(page, mail, password);
  await page.waitForLoadState('networkidle');
    // === ORIGEN Y DESTINO ===
    const origenInput =  page.getByRole('textbox', { name: 'BUE' });
    if (await origenInput.isVisible()) {
      await origenInput.fill(originDeparture);
      console.log("✔ Origen de salida llenado:", originDeparture);
    }

    const destinoInput =  page.getByRole('textbox', { name: 'MIA' });
    if (await destinoInput.isVisible()) {
      await destinoInput.dblclick();
      await destinoInput.fill(originReturn);
      console.log("✔ Destino de regreso llenado:", originReturn);
    }
    // === FECHAS ===
    const salidaInput =  page.locator(`//input[@placeholder='24SEP']`);
    const regresoInput =  page.locator(`//input[@placeholder='10OCT']`);
    if (await salidaInput.isVisible()) {
      await salidaInput.fill(departureDate);
      console.log("✔ Fecha de salida completada:", departureDate);
    }
    if (await regresoInput.isVisible()) {
      await regresoInput.fill(returnDate);
      console.log("✔ Fecha de regreso completada:", returnDate);
    }

    // === PASAJEROS ===
    const adultosInput =  page.locator("//input[@placeholder='1' and contains(@class,'input search-input')]");
    const ninosInput =  page.locator("//input[@placeholder='0' and contains(@class,'input search-input')]").nth(0);
    const infantesInput =  page.locator("//input[@placeholder='0' and contains(@class,'input search-input')]").nth(1);
    console.log("adultos ",adults)
    await adultosInput.fill(String(adults));
    console.log("✔ Adultos:", adults);

    await ninosInput.fill(String(children));
    console.log("✔ Niños:", children);

    await infantesInput.fill(String(infants));
    console.log("✔ Infantes:", infants);

    // === BÚSQUEDA AVANZADA ===
    await page.locator("//a[@title='Búsqueda avanzada (Ctrl+Shift+A)' and contains(@class,'link-btn')]").click();
    console.log("✔ Se abrió la búsqueda avanzada");

    await page.locator("//*[@id='app']/div[3]/div[1]/div[2]/div[1]/div/div[4]/div").click();
    console.log("✔ Abierto menú de moneda");

    await page.locator("div.input-cont[data-bind*='allowedAlternateCurrencyCodes'] select").selectOption('USD');
    console.log("✔ Seleccionada moneda USD");

    await page.locator('//*[@id="app"]/div[3]/div[1]/div[2]/div[2]/button[2]').click();
    console.log("✔ Cerrada búsqueda avanzada");

    // === ENVIAR BÚSQUEDA ===
    await page.locator('#lnkSubmit').click();
    console.log("✔ Click en Buscar vuelos. Esperando resultados...");

    // === FILTROS DE ESCALAS ===
    await page.locator('//*[@id="content"]/div/div[1]/div/div[2]/div[1]/button').click();
    console.log("✔ Filtros abiertos");

    const dropdown = page.locator('div.rz-dropdown').filter({ hasText: 'Seleccionar' }).first();
    await dropdown.click();
    console.log("✔ Desplegable de escalas abierto");

    await page.getByRole('option').filter({ hasText: params.stops }).click();
    console.log("✔ Filtro de escalas aplicado:", params.stops);

    if (checkedBaggage) {
      await page.locator('label[for="Baggage0"]').click();
      console.log("✔ Filtro de equipaje aplicado");
    }

    // === HORARIOS SALIDA Y VUELTA ===
    await HorarioSalidaIda({ page, inicioHoraIda: horarioIdaEntre, finHoraIda: horarioIdaHasta });
    console.log(`✔ Horario de salida ida entre ${horarioIdaEntre} y ${horarioIdaHasta}`);

    await HorarioSalidaVuelta({ page, inicioHoraVuelta: horarioVueltaEntre, finHoraVuelta: horarioVueltaHasta });
    console.log(`✔ Horario de salida vuelta entre ${horarioVueltaEntre} y ${horarioVueltaHasta}`);

    // === DURACIÓN MAXIMA VUELOS ===
    console.log("⌛ Ajustando duración máxima de vuelo ida a:", maxDuracionIda);
    await DuracionVueloIda({ page, horaDeseada: maxDuracionIda });

    console.log("⌛ Ajustando duración máxima de vuelo vuelta a:", maxDuracionVuelta);
    await ajustarSliderVueloVuelta({ page, horaDeseada: maxDuracionVuelta });
    
    // === APLICAR FILTROS ===
    await page.locator('//*[@id="app"]/div[3]/div[1]/div[2]/div[2]/button[3]').click();
    console.log("✔ Filtros aplicados");

    // === VERIFICACIÓN DE RESULTADOS ===
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);

    const tablaCount = await page.locator('//*[@id="content"]/div/div[2]/table/tbody').count();
    const isVisible = await page.locator('//*[@id="content"]/div/div[2]/table/tbody').first().isVisible();

    console.log("✔ Cantidad de tbodys en la tabla de resultados:", tablaCount);
    console.log("✔ Primer tbody visible?:", isVisible);

    if (tablaCount === 0 || !isVisible) {
      console.warn("⚠ No se encontraron resultados visibles.");
      return;
    }

    // === RECORRER LISTA DE VUELOS ===
  const res =  await recorroListaVuelos(page);
    console.log("✅ Búsqueda finalizada correctamente");
    return res;
  } catch (error) {
    console.error("❌ Error durante la búsqueda:", error);
  }
}


  // Podés sacar el page.pause() si no querés pausar
