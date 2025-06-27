import { Page } from 'playwright';

export default async function recorroListaVuelos(page: Page) {
    // Scroll hacia abajo 1000 píxeles
    await page.mouse.wheel(0, 1000);

    // Esperás un poco para que cargue lo que aparece tras el scroll

    console.log("Esperando que se cargue el contenido de la tabla...");
    const tablaBody = page.locator('//*[@id="content"]/div/div[2]/table/tbody');
    await tablaBody.waitFor({ state: 'attached' });
    console.log("¿El tbody está visible?", await tablaBody.isVisible());

    await tablaBody.waitFor({ state: 'attached' });
    console.log("tbody encontrado (aunque esté oculto).");

    const totalBodies = await tablaBody.count();
    console.log("Cantidad de <tbody>:", totalBodies);

    for (let i = 0; i < totalBodies; i++) {
        const isVisible = await tablaBody.nth(i).isVisible();
        console.log(`tbody ${i} visible?`, isVisible);
    }


    // Obtenemos solo las filas visibles
    const filasVisibles = page.locator('tr:visible');
    const cantidadFilas = await filasVisibles.count();

    console.log("Cantidad total de <tr>:", filasVisibles);
    console.log(`Cantidad de filas visibles: ${cantidadFilas}`);

    // let precioFinal = ""

    const vueloFinal = {
        precioFinal: "",
        aeropuertoIda: "",
        horarioSalidaIda: "",
        ciudadOrigenIda: "",
        horarioSupongoDuracionIda: "",
        escalasIda: "",
        horarioSupongoLlegadaIda: "",
        aeropuertoDestinoIda: "",
        ciudadDestinoIda: "",
        aeropuertoVuelta: "",
        horarioSalidaVuelta: "",
        ciudadOrigenVuelta: "",
        horarioSupongoDuracionVuelta: "",
        escalasVuelta: "",
        horarioSupongoLlegadaVuelta: "",
        aeropuertoDestinoVuelta: "",
        ciudadDestinoVuelta: "",
        aerolinea: "",
        fechaSalidaIda: "",
        fechaLlegadaIda: "",
        fechaSalidaVuelta: "",
        fechaLlegadaVuelta: "",
        adults: 0,
        children: 0,
        infants: 0
    }

    for (let i = 0; i < cantidadFilas; i++) {
        const fila = filasVisibles.nth(i);
        const contenedor = fila.locator('.baggage-cont');
        console.log(`🔍 Revisando fila ${i}`);

        try {
            const equipajeMano = contenedor.locator('.baggage.hand').first();
            const equipajeCarrion = contenedor.locator('.baggage.carry-on').first();
            const equipajeBodega = contenedor.locator('.baggage.dispatch').first();

            const tieneMano = (await equipajeMano.getAttribute('class'))?.includes('included') ?? false;
            const tieneCarrion = (await equipajeCarrion.getAttribute('class'))?.includes('included') ?? false;
            const tieneBodega = (await equipajeBodega.getAttribute('class'))?.includes('included') ?? false;


            console.log("🧳 Mano:", tieneMano, " | Carrion:", tieneCarrion, " | Bodega:", tieneBodega);

            if (tieneCarrion || tieneBodega) {
                const strongLocator = fila.locator('strong.priceNumb')
                console.log("strong locator ", strongLocator)
                vueloFinal.precioFinal = (await strongLocator.textContent()) ?? "";
                vueloFinal.aeropuertoIda = (await fila.locator('//*[@id="showDetail"]/div[1]/div[2]/div[1]/div[1]/span[1]').textContent()) ?? "";
                vueloFinal.horarioSalidaIda = (await fila.locator('//*[@id="showDetail"]/div[1]/div[2]/div[1]/div[1]/span[2]/strong').textContent()) ?? "";
                vueloFinal.ciudadOrigenIda = (await fila.locator('//*[@id="showDetail"]/div[1]/div[2]/div[1]/div[2]/span').textContent()) ?? "";
                vueloFinal.horarioSupongoDuracionIda = (await fila.locator('//*[@id="showDetail"]/div[1]/div[2]/div[2]/span[1]').textContent()) ?? "";
                vueloFinal.escalasIda = (await fila.locator('//*[@id="showDetail"]/div[1]/div[2]/div[2]/span[2]').textContent()) ?? "";
                vueloFinal.horarioSupongoLlegadaIda = (await fila.locator('//*[@id="showDetail"]/div[1]/div[2]/div[3]/div[1]/span[1]/strong').textContent()) ?? "";

                const nodoCityLocator = fila.locator('//*[@id="showDetail"]/div[1]/div[2]/div[3]/div[1]/span[2]');
                const handle = await nodoCityLocator.elementHandle();
                const mad = await handle?.evaluate(el => el.childNodes[0]?.nodeValue?.trim() ?? "");
                vueloFinal.aeropuertoDestinoIda = mad ?? "";
                vueloFinal.ciudadDestinoIda = (await fila.locator('//*[@id="showDetail"]/div[1]/div[2]/div[3]/div[2]/span').textContent()) ?? "";

                vueloFinal.aeropuertoVuelta = (await fila.locator('//*[@id="showDetail"]/div[3]/div[2]/div[1]/div[1]/span[1]').textContent()) ?? "";
                vueloFinal.horarioSalidaVuelta = (await fila.locator('//*[@id="showDetail"]/div[3]/div[2]/div[1]/div[1]/span[2]').textContent()) ?? "";
                vueloFinal.ciudadOrigenVuelta = (await fila.locator('//*[@id="showDetail"]/div[3]/div[2]/div[1]/div[2]/span').textContent()) ?? "";
                vueloFinal.horarioSupongoDuracionVuelta = (await fila.locator('//*[@id="showDetail"]/div[3]/div[2]/div[2]/span[1]').textContent()) ?? "";
                vueloFinal.escalasVuelta = (await fila.locator('//*[@id="showDetail"]/div[3]/div[2]/div[2]/span[2]').textContent()) ?? "";
                vueloFinal.horarioSupongoLlegadaVuelta = (await fila.locator('//*[@id="showDetail"]/div[3]/div[2]/div[3]/div[1]/span[1]/strong').textContent()) ?? "";
                // vueloFinal.aeropuertoDestinoVuelta = (await fila.locator('//*[@id="showDetail"]/div[3]/div[2]/div[3]/div[1]/span[2]').textContent()) ?? "";

                const nodoCityLocatorVuelta = fila.locator('//*[@id="showDetail"]/div[3]/div[2]/div[3]/div[1]/span[2]');
                const handleVuelta = await nodoCityLocatorVuelta.elementHandle();
                const madVuelta = await handleVuelta?.evaluate(el => el.childNodes[0]?.nodeValue?.trim() ?? "");
                vueloFinal.aeropuertoDestinoVuelta = madVuelta ?? "";


                vueloFinal.ciudadDestinoVuelta = (await fila.locator('//*[@id="showDetail"]/div[3]/div[2]/div[3]/div[2]/span').textContent()) ?? "";

                vueloFinal.aerolinea = (await fila.locator('//*[@id="showDetail"]/div[3]/div[1]/img').getAttribute('title')) ?? "";
                await fila.locator('text=Ver Detalle').click();

                // // Esperar que aparezca la info expandida
                await page.waitForTimeout(4000)

                // // Extraer fechas
                // vueloFinal.fechaSalidaIda = await fila.locator('xpath=//*[@id="flight-detail-information"]/div/div[2]/div[1]/div[2]/div[1]/p[1]/strong').first().textContent() ?? "";
                // vueloFinal.fechaLlegadaIda = await fila.locator('//*[@id="flight-detail-information"]/div/div[2]/div/div[2]/div[3]/p[1]/strong').first().textContent() ?? "";

                // const contenedor = fila.locator('div.row-leg-box');

                // // dentro de ese contenedor, agarrás el primer strong que esté dentro de un `p.leg-departure-date`
                // const strongFecha = contenedor.locator('p.leg-departure-date >> strong').first();

                // const textoFecha = await strongFecha.textContent();
                // vueloFinal.fechaSalidaVuelta = textoFecha ?? ""

                // vueloFinal.fechaLlegadaVuelta = await fila.locator('//*[@id="flight-detail-information"]/div/div[3]/div/div[2]/div[3]/p[1]/strong').first().textContent() ?? "";
                const bloquesVuelo = await fila.locator('#flight-detail-information').all();
                // const visible = await fila.locator('#flight-detail-information').isVisible();
                // Verificamos que haya al menos dos bloques (ida y vuelta)
                if (bloquesVuelo.length >= 2 ) {
                    // 👉 Primer bloque: IDA
                    const ida = bloquesVuelo[0];
                    const fechasIda = ida.locator('p.leg-departure-date >> strong');
                    const fechaSalidaIda = await fechasIda.first().textContent() ?? "";
                    const fechaLlegadaIda = await fechasIda.last().textContent() ?? "";

                    // 👉 Segundo bloque: VUELTA
                    const vuelta = bloquesVuelo[1];
                    const fechasVuelta = vuelta.locator('p.leg-departure-date >> strong');
                    const fechaSalidaVuelta = await fechasVuelta.first().textContent() ?? "";
                    const fechaLlegadaVuelta = await fechasVuelta.last().textContent() ?? "";

                    console.log({ fechaSalidaIda, fechaLlegadaIda, fechaSalidaVuelta, fechaLlegadaVuelta });

                    // Si querés asignarlo:
                    vueloFinal.fechaSalidaIda = fechaSalidaIda;
                    vueloFinal.fechaLlegadaIda = fechaLlegadaIda;
                    vueloFinal.fechaSalidaVuelta = fechaSalidaVuelta;
                    vueloFinal.fechaLlegadaVuelta = fechaLlegadaVuelta;
                }






                console.log("horario salida ida ", vueloFinal)


                break;
            }
        } catch (error) {
            console.warn(`⚠️ Error en fila ${i}:`, error);
        }
    }


    const precioHandle = await page
        .locator('//*[@id="content"]/div/div[2]/table/tbody/tr[1]/td/div/div[1]/div[3]/div[2]/div/div/strong')
        .elementHandle({ timeout: 2000 })
        .catch(() => null);

    const precioHandleText = await precioHandle?.textContent();
    console.log(`Precio del vuelo: ${precioHandleText ? precioHandleText.trim() : 'No disponible'}`);


    return vueloFinal ? vueloFinal : 'No hay ningun vuelo disponible con estas opciones';
}
