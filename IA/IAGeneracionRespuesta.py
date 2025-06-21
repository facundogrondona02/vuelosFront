import sys
import io
import json
import ollama

sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8')

def generar_respuesta(mensaje):
    try:
        vuelos = json.loads(mensaje)
    except json.JSONDecodeError as e:
        print("Error: el mensaje no es un JSON válido.")
        print("Detalles:", e)
        return

    cantidad = len(vuelos)
    vuelos_texto = json.dumps(vuelos, ensure_ascii=False, indent=2)

    prompt = f"""
Recibiste una cotización con {cantidad} vuelo(s) en formato JSON. Tu tarea es generar un mensaje cálido y profesional para enviar por WhatsApp a un cliente interesado en viajar.

✈️ Datos de los vuelos:
{vuelos_texto}

---

🎯 Instrucciones:
- Si hay **1 solo vuelo**, mostralo con este formato (reemplazando los valores entre llaves):
---
Cotización aérea a {{ciudadDestinoIda}}.

✈️ Aéreo de {{aerolinea}} con equipaje de mano de 10kg + bolso de mano.

Horarios:
ida:
{{aeropuertoIda}} {{horarioSalidaIda}}
Llegada: {{aeropuertoDestinoIda}} {{horarioSupongoLlegadaIda}} (Duración: {{horarioSupongoDuracionIda}})
{{escalasIda}}
vuelta:
{{aeropuertoVuelta}} {{horarioSalidaVuelta}}
Llegada: {{aeropuertoDestinoVuelta}} {{horarioSupongoLlegadaVuelta}} (Duración: {{horarioSupongoDuracionVuelta}})
{{escalasVuelta}}

💰 Precio final: {{precioFinal}} USD
---

- Si hay **2 o más vuelos**, mostralos con ese mismo formato uno por uno, y al final hacé una breve comparación (precio, escalas u horarios).
- No inventes vuelos. Usá **solo** los datos recibidos.
- No repitas el destino si es el mismo en todos.
- No devuelvas el JSON. Solo el mensaje final para el cliente.
- Usá emojis si querés, con tono humano, claro y cálido.

📌 Devolvé solo el texto para el cliente, sin código ni estructuras técnicas.
"""

    response = ollama.chat(
        model="llama3.2",
        messages=[{"role": "user", "content": prompt}],
        options={"temperature": 0}
    )

    print(response["message"]["content"])


if __name__ == "__main__":
    try:
        mensaje = sys.stdin.read()
        generar_respuesta(mensaje)
    except Exception as e:
        print("Error al leer stdin o generar respuesta:", e)
        sys.exit(1)