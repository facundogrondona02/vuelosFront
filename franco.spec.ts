import { test } from '@playwright/test';
// import fs from 'fs';
// import { ajustarSliderVueloVuelta } from './componentes/DuracionVueloVuelta';
// import DuracionVueloIda from './componentes/DuracionVueloIda';
// import HorarioSalidaIda from './componentes/HorarioSalidaIda';
// import HorarioSalidaVuelta from './componentes/HorarioSalidaVuelta';
// import recorroListaVuelos from './funciones/recorroListaVuelos';
// import { hacerLogin } from './funciones/hacerLogin';
import { scrapingVuelos } from './funciones/scraping';




test.use({ storageState: 'storage/estadoSesion.json' });

// test('POST /api/send-flight dispara scraping y responde 200', async ({ request }) => {
//   const response = await request.post('http://localhost:3030/api/send-flight', {
//     data: sampleFlightData
//   });
//   expect(response.ok()).toBeTruthy();
//   const body = await response.json();
//   expect(body.message).toBe('Bot ejecutado con éxito');
// });
// const sampleFlightData = {
//   mail: 'franco@melincue.tur.ar',
//   password: 'Francomase12!',
//   originDeparture: 'BUE',
//   originReturn: 'CAN',
//   departureDate: '10SEP',
//   returnDate: '28SEP',
//   adults: 3,
//   children: 2,
//   infants: 0,
//   currency: 'USD',
//   stops: '2 escala',
//   checkedBaggage: false,
//   horarioIdaEntre: '00:11',
//   horarioIdaHasta: '23:57',
//   horarioVueltaEntre: '00:30',
//   horarioVueltaHasta: '23:57',
//   maxDuracionIda: '40:00',
//   maxDuracionVuelta: '45:00'
// }
 
const sampleFlightData = {
  mail: 'franco@melincue.tur.ar',
  password: 'Francomase12!',
  origenIda: 'BUE',
  origenVuelta: 'MIA',
  departureDate: '10SEP',
  returnDate: '28SEP',
  adults: 3,
  children: 2,
  infants: 0,
  currency: 'USD',
  stops: '1 escala',
  checkedBaggage: false,
  horarioIdaEntre: '00:11',
  horarioIdaHasta: '23:57',
  horarioVueltaEntre: '00:30',
  horarioVueltaHasta: '23:57',
  maxDuracionIda: '25:00',
  maxDuracionVuelta: '25:00'
}
 

test('scraping vuelos', async ({ page }) => {
 

  test.setTimeout(0);

  // await page.goto('https://aereos.sudameria.com');
 await scrapingVuelos(sampleFlightData)
  // await hacerLogin(page,"franco@melincue.tur.ar","Francomase12!");

  // await page.getByRole('textbox', { name: 'BUE' }).fill('BUE');
  // await page.getByRole('textbox', { name: 'MIA' }).dblclick();
  // await page.getByRole('textbox', { name: 'MIA' }).fill('CUN');
  // await page.locator("//input[@placeholder='24SEP']").fill("13SEP");
  // await page.locator("//input[@placeholder='10OCT']").fill("27SEP");
  // await page.locator("//input[@placeholder='1' and contains(@class,'input search-input' )]").fill("2"); // Adultos
  // await page.locator("//input[@placeholder='0' and contains(@class,'input search-input' )]").nth(0).fill("0"); // Niños
  // await page.locator("//input[@placeholder='0' and contains(@class,'input search-input' )]").nth(1).fill("0"); // Infantes

  // await page.locator("//a[@title='Búsqueda avanzada (Ctrl+Shift+A)' and contains(@class,'link-btn' )]").click();
  // await page.locator("//*[@id='app']/div[3]/div[1]/div[2]/div[1]/div/div[4]/div").click();
  // await page.locator("div.input-cont[data-bind*='allowedAlternateCurrencyCodes'] select").selectOption('USD');
  // await page.locator('//*[@id="app"]/div[3]/div[1]/div[2]/div[2]/button[2]').click();

  // await page.waitForTimeout(4000);
  // await page.locator('#lnkSubmit').click();
  // console.log("Esperando resultados de vuelos...");


  // //Filtros del vuelo
  // await page.locator('//*[@id="content"]/div/div[1]/div/div[2]/div[1]/button').click(); // Abre filtros

  // // Seleccionar el filtro de "escalas"
  // const dropdown = page.locator('div.rz-dropdown').filter({ hasText: 'Seleccionar' }).first();
  // await dropdown.click();
  // await page.getByRole('option').filter({ hasText: '1 escala' }).click();

  // const equipajeSioNo =false
  // if (equipajeSioNo) {
  //   await page.locator('label[for="Baggage1"]').click(); // Selecciona "Con equipaje"
  // } 


  // await HorarioSalidaIda({
  //   page,
  //   inicioHoraIda: '12:42',
  //   finHoraIda: '20:33'
  // });

  // await HorarioSalidaVuelta({
  //   page,
  //   inicioHoraVuelta: '12:42',
  //   finHoraVuelta: '20:33'
  // });

  // await DuracionVueloIda({
  //   page,
  //   horaDeseada: '19:00',
  // });

  // await ajustarSliderVueloVuelta({
  //   page,
  //   horaDeseada: '22:00'
  // });


  // await page.locator('//*[@id="app"]/div[3]/div[1]/div[2]/div[2]/button[3]').click(); // Aplicar filtros
  // ///////////////////////////////////


  // await recorroListaVuelos(page)


  await page.pause();
});

