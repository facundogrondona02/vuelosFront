import cors from 'cors';
import express from 'express';
const app = express();
const port = 3040;

let data = {}; // Esto es interno al backend

app.use(cors());
app.use(express.json());

app.post('/api/captando', (req, res) => {
  try {
      data = { ...req.body, consumido: false };
    console.log('Datos recibidos en captando:', data);
    // si todo va bien
    res.status(200).json({ resultado: "Datos procesados y enviados al bot" });
  } catch (error) {
    console.error("Error en /api/captando:", error);
    res.status(500).json({ error: "Error al procesar datos" });
  }
});

app.get('/api/mensaje', (req, res) => {
  // Solo respondemos si hay mensaje nuevo y no fue consumido aún
  if (!data.resultadoStr || data.consumido) {
    return res.json({ mensaje: null });
  }

  console.log('Datos enviados:', data.resultadoStr);
  data.consumido = true;

  res.json({ mensaje: data.resultadoStr });
});

app.listen(port, () => {
  console.log(`API escuchando en http://localhost:${port}`);
});
