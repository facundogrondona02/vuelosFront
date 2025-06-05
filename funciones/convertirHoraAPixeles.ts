export default function convertirHoraAPixeles(hora: string, anchoSlider: number): number {
  const [h, m] = hora.split(':').map(Number);
  const minutos = h * 60 + m; // Ej: "16:23" → 983 minutos
  const totalMinutos = 24 * 60; // 1440

  return (minutos / totalMinutos) * anchoSlider;
}
