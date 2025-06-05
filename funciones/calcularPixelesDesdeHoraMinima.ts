export default function calcularPixelesDesdeHoraMinima(
  horaMinima: string,
  horaDeseada: string,
  horaMaxima: string,
  anchoSlider: number
): number {
  const toMinutos = (hora: string) => {
    const [h, m] = hora.split(':').map(Number);
    return h * 60 + m;
  };
  console.log(`Convirtiendo horas a minutos:
    horaMinima='${horaMinima}',
    horaDeseada='${horaDeseada}',
    horaMaxima='${horaMaxima}',
    anchoSlider=${anchoSlider}`);

  const minMinutos = toMinutos(horaMinima);
  const deseadoMinutos = toMinutos(horaDeseada);
  const maxMinutos = toMinutos(horaMaxima);
  
  console.log(`Minutos convertidos:
    deseadoMinutos=${deseadoMinutos},
    minMinutos=${minMinutos},
    maxMinutos=${maxMinutos}`);

  const rangoTotal = maxMinutos - minMinutos;
  const deltaDeseado = deseadoMinutos - minMinutos;
  console.log(`Calculando minutos:
    deltaDeseado=${deltaDeseado},
    anchoSlider=${anchoSlider},
    rangoTotal=${rangoTotal}`);
  const posicionX = (deltaDeseado * anchoSlider) / rangoTotal;
  console.log(`Calculando pixeles desde hora minima:
    horaMinima='${horaMinima}', 
    horaDeseada='${horaDeseada}',
    pixelesDeseados=${posicionX},`)
  return posicionX;
}
