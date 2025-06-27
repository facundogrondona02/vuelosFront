import { test } from '@playwright/test';
import { scrapingVuelos } from './funciones/scraping';




test.use({ storageState: 'storage/estadoSesion.json' });

 
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
  maxDuracionVuelta: '25:00',
  carryon: false, // o true según lo que necesites
  bodega: false   // o true según lo que necesites
};

test('scraping vuelos', async ({ page }) => {
 
  test.setTimeout(0);

 await scrapingVuelos(sampleFlightData)

  await page.pause();
});

