import { getContextConSesionValida } from './context';
import { hacerLogin } from './hacerLogin';
import recorroListaVuelos from './recorroListaVuelos';
import DuracionVueloIda from '../componentes/DuracionVueloIda';
import { ajustarSliderVueloVuelta } from '../componentes/DuracionVueloVuelta';
import HorarioSalidaIda from '../componentes/HorarioSalidaIda';
import HorarioSalidaVuelta from '../componentes/HorarioSalidaVuelta';

interface ScrapingVuelosParams {
  mail: string,
  password: string,
  origenIda: string,
  origenVuelta: string,
  departureDate: string,
  returnDate: string,
  adults: number,
  children: number,
  infants: number,
  stops: string,
  checkedBaggage: boolean,
  horarioIdaEntre: string,
  horarioIdaHasta: string,
  horarioVueltaEntre: string,
  horarioVueltaHasta: string,
  maxDuracionIda: string,
  maxDuracionVuelta: string,
  carryon: boolean,
  bodega: boolean
  // otros params que necesites
}

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



export async function scrapingVuelos(params: ScrapingVuelosParams): Promise<VueloFinal | undefined> {
  const {
    mail,
    password,
    origenIda,
    origenVuelta,
    departureDate,
    returnDate,
    adults,
    children,
    infants,
    stops,
    checkedBaggage,
    horarioIdaEntre,
    horarioIdaHasta,
    horarioVueltaEntre,
    horarioVueltaHasta,
    maxDuracionIda,
    maxDuracionVuelta,
    carryon,
    bodega
  } = params;

  // 1. Obtener contexto con sesión válida
  // Esta función interna revisa si existe sesión guardada y si está activa,
  // si no, hace login y guarda sesión automáticamente
  const { /*browser,*/ context, page, estaLogueado } = await getContextConSesionValida({ mail, password });

  try {
    if (!estaLogueado) {
      console.log("🔐 Sesión expirada o inválida. Rehaciendo login...");
      await hacerLogin(page, mail, password);
      // Guardar la sesión después de login
      await context.storageState({ path: 'session.json' });
      console.log("💾 Sesión guardada en session.json");
    } else {
      console.log("✅ Sesión válida encontrada, sin necesidad de login");
    }

    // Esperamos que cargue la página y los elementos
    await page.waitForLoadState('networkidle');

    // === ORIGEN Y DESTINO ===
    const origenInput = page.getByRole('textbox', { name: 'BUE' });
    if (await origenInput.isVisible()) {
      await origenInput.fill(origenIda);
      console.log("✔ Origen de salida llenado:", origenIda);
    }

    const destinoInput = page.getByRole('textbox', { name: 'MIA' });
    if (await destinoInput.isVisible()) {
      await destinoInput.dblclick();
      await destinoInput.fill(origenVuelta);
      console.log("✔ Destino de regreso llenado:", origenVuelta);
    }

    // === FECHAS ===
    const salidaInput = page.locator(`//input[@placeholder='24SEP']`);

    if (await salidaInput.isVisible()) {
      await salidaInput.fill(departureDate);
      console.log("✔ Fecha de salida completada:", departureDate);
    }
    await page.waitForTimeout(3000);
    console.log(returnDate, " retorno")
    const regresoInput = page.locator(`//input[@placeholder='10OCT']`);
    if (await regresoInput.isVisible()) {
      await regresoInput.fill("");
      await regresoInput.fill(returnDate);
      console.log("✔ Fecha de regreso completada:", returnDate);
    }
    //*[@id="frm"]/div[1]/div[4]/div //*[@id="frm"]/div[1]/div[4]/div/div[1]/div[1]/span[1]/input[1]    //*[@id="meRAIlqldU"]/span/button   meRAIlqldU
    //     // === PASAJEROS ===   
    const adultosInput = page.locator("//input[@placeholder='1' and contains(@class,'input search-input')]");
    const ninosInput = page.locator("//input[@placeholder='0' and contains(@class,'input search-input')]").nth(0);
    const infantesInput = page.locator("//input[@placeholder='0' and contains(@class,'input search-input')]").nth(1);

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
    await page.waitForTimeout(5000);

    await page.locator('//*[@id="content"]/div/div[1]/div/div[2]/div[1]/button').click();
    console.log("✔ Filtros abiertos");

    const dropdown = page.locator('div.rz-dropdown').filter({ hasText: 'Seleccionar' }).first();
    await dropdown.click();
    console.log("✔ Desplegable de escalas abierto");

    await page.getByRole('option').filter({ hasText: stops }).click();
    console.log("✔ Filtro de escalas aplicado:", stops);

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

    // === EQUIPAJE CARRYON ===
    if (carryon) {
      console.log("ESTaMOS EN CARRYON?")
      // await page.locator('div.rz-chkbox-box').nth(15).click();
      // await page.locator('div.rz-chkbox-box').nth(17).click();
      const filas = await page.locator('div.rz-display-flex').all();

      for (const fila of filas) {
        const label = fila.locator('label');

        const textoLabel = await label.textContent();
        if (textoLabel?.trim() === 'Con CarryOn') {
          // Ir al hermano: <div class="rz-chkbox-box"> dentro de <div class="rz-chkbox">
          const box = fila.locator('.rz-chkbox-box');
          await box.click();
        }
      }
    }

    // === EQUIPAJE DE BODEGA ===
    if (bodega) {
      const filas = await page.locator('div.rz-display-flex').all();

      for (const fila of filas) {
        const label = fila.locator('label');

        const textoLabel = await label.textContent();
        if (textoLabel?.trim() === 'Con equipaje en bodega') {
          // Ir al hermano: <div class="rz-chkbox-box"> dentro de <div class="rz-chkbox">
          const box = fila.locator('.rz-chkbox-box');
          await box.click();
        }
      }
    }


    // === APLICAR FILTROS ===
    await page.locator('//*[@id="app"]/div[3]/div[1]/div[2]/div[2]/button[3]').click();
    console.log("✔ Filtros aplicados");


    // === ESPERAR RESULTADOS ===
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(3000);

    const tablaCount = await page.locator('//*[@id="content"]/div/div[2]/table/tbody').count();
    const isVisible = await page.locator('//*[@id="content"]/div/div[2]/table/tbody').first().isVisible();

    if (tablaCount === 0 || !isVisible) {
      console.warn("⚠ No se encontraron resultados visibles.");
      return;
    }

    // === RECORRER LISTA DE VUELOS ===
    await page.waitForTimeout(3000);

  const res = await recorroListaVuelos(page);

  if (typeof res === "string") {
    if (res === "No hay ningun vuelo disponible con estas opciones") {
      console.warn("⚠ No hay ningún vuelo disponible con estas opciones.");
      return undefined;
    }
  } else {
    res.adults = adults;
    res.children = children;
    res.infants = infants;
  }

    console.log("✅ Búsqueda finalizada correctamente", res);
    // res.aeropuertoDestinoIda.split('\n')[0].trim()
    // res.aeropuertoDestinoVuelta.split('\n')[0].trim()
    return res;

  } catch (error) {
    console.error("❌ Error durante la búsqueda:", error);
  } finally {
    // Si querés, podés cerrar el navegador acá, o dejar abierto para debugging
    // await browser.close();
  }
}
