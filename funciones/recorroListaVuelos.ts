import { Page } from 'playwright';

export default async function recorroListaVuelos(page: Page) {
    // Scroll hacia abajo 1000 píxeles
    await page.mouse.wheel(0, 1000);

    // Esperás un poco para que cargue lo que aparece tras el scroll

    const tablaBody = page.locator('//*[@id="content"]/div/div[2]/table/tbody');
    await tablaBody.waitFor({ state: 'attached' });

    await tablaBody.waitFor({ state: 'attached' });

    const totalBodies = await tablaBody.count();

    for (let i = 0; i < totalBodies; i++) {
        const isVisible = await tablaBody.nth(i).isVisible();
        console.log(`tbody ${i} visible?`, isVisible);
    }


    // Obtenemos solo las filas visibles
    const filasVisibles = page.locator('tr:visible');
    const cantidadFilas = await filasVisibles.count();



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

        try {
            // const equipajeMano = contenedor.locator('.baggage.hand').first();
            const equipajeCarrion = contenedor.locator('.baggage.carry-on').first();
            const equipajeBodega = contenedor.locator('.baggage.dispatch').first();

            // const tieneMano = (await equipajeMano.getAttribute('class'))?.includes('included') ?? false;
            const tieneCarrion = (await equipajeCarrion.getAttribute('class'))?.includes('included') ?? false;
            const tieneBodega = (await equipajeBodega.getAttribute('class'))?.includes('included') ?? false;



            if (tieneCarrion || tieneBodega) {
                const strongLocator = fila.locator('strong.priceNumb')
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

                const bloquesVuelo = await fila.locator('#flight-detail-information').all();
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

                    // Si querés asignarlo:
                    vueloFinal.fechaSalidaIda = fechaSalidaIda;
                    vueloFinal.fechaLlegadaIda = fechaLlegadaIda;
                    vueloFinal.fechaSalidaVuelta = fechaSalidaVuelta;
                    vueloFinal.fechaLlegadaVuelta = fechaLlegadaVuelta;
                }


                break;
            }
        } catch (error) {
            console.warn(`⚠️ Error en fila ${i}:`, error);
        }
    }





    return vueloFinal ? vueloFinal : 'No hay ningun vuelo disponible con estas opciones';
}
