import { Page } from 'playwright';

export default async function recorroListaVuelos(page: Page) {
 // Scroll hacia abajo 1000 píxeles
await page.mouse.wheel(0, 1000);

// Esperás un poco para que cargue lo que aparece tras el scroll
await page.waitForTimeout(1000);

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

    for (let i = cantidadFilas - 1; i >= 0; i--) {
        const fila = filasVisibles.nth(i);
        const contenedor = fila.locator('.baggage-cont');

        try {
            // Intentamos capturar los distintos tipos de equipaje, con timeout corto
            const equipajeManoHandle = await contenedor.locator('.baggage.hand').elementHandle({ timeout: 2000 }).catch(() => null);
            const equipajeCarrionHandle = await contenedor.locator('.baggage.carry-on').elementHandle({ timeout: 2000 }).catch(() => null);
            const equipajeBodegaHandle = await contenedor.locator('.baggage.dispatch').elementHandle({ timeout: 2000 }).catch(() => null);

            const tieneMano = equipajeManoHandle
                ? (await equipajeManoHandle.getAttribute('class'))?.includes('included') ?? false
                : false;

            const tieneCarrion = equipajeCarrionHandle
                ? (await equipajeCarrionHandle.getAttribute('class'))?.includes('included') ?? false
                : false;

            const tieneBodega = equipajeBodegaHandle
                ? (await equipajeBodegaHandle.getAttribute('class'))?.includes('included') ?? false
                : false;

            // Si solo tiene equipaje de mano, la eliminamos
            if (tieneMano && !tieneCarrion && !tieneBodega) {
                const filaHandle = await fila.elementHandle();
                if (filaHandle) {
                    await page.evaluate((row) => row.remove(), filaHandle);
                }
            }
        } catch (error) {
            console.warn(`Error en fila ${i}:`, error);
        }
    }

    const precioHandle = await page
        .locator('//*[@id="content"]/div/div[2]/table/tbody/tr[1]/td/div/div[1]/div[3]/div[2]/div/div/strong')
        .elementHandle({ timeout: 2000 })
        .catch(() => null);

    const precioHandleText = await precioHandle?.textContent();
    console.log(`Precio del vuelo: ${precioHandleText ? precioHandleText.trim() : 'No disponible'}`);
    return precioHandleText ? precioHandleText.trim() : 'No hay ningun vuelo disponible con estas opciones';
}
