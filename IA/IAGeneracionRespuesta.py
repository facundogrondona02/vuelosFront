import sys
import io
import json
import ollama

# Forzar salida estándar en UTF-8
sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8')

def generar_respuesta(mensaje):
    prompt = f"""
Vas a recibir un array de uno o más vuelos de ida y vuelta, en formato JSON. Cada objeto representa un vuelo completo con información como horarios, aeropuertos, escalas, duración, aerolínea y precio.

🎯 Tu tarea es generar un mensaje cálido, profesional y listo para enviar por WhatsApp o chat, con los siguientes criterios:

---

🛫 **SI HAY SOLO UN VUELO:**

Mostralo exactamente con este formato (reemplazando los valores entre llaves con los datos del JSON):

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

📌 Asegurate de reemplazar todas las {{llaves}} por los valores reales del vuelo.

---

🧠 **SI HAY VARIOS VUELOS:**

1. Mostralos uno por uno usando el formato anterior.
2. Al final, redactá una comparación clara y profesional entre las opciones.
3. Recomendá una opción, justificando por qué (por ejemplo: menor precio, menos escalas, menor duración o mejor horario).
4. No repitas el nombre del destino en cada uno si es el mismo.
5. No devuelvas el JSON ni menciones estructuras técnicas.

---

💡 Tono: cálido, humano, claro. Podés usar emojis para darle cercanía. No hagas preguntas de cierre (como “¿Querés avanzar?”). Simplemente entregá la información con claridad y calidez.

📩 Al final, entregá solo el mensaje para el cliente, con los datos ya reemplazados.

Aquí está el mensaje del cliente para que trabajes:

\"\"\"{mensaje}\"\"\"
"""

    response = ollama.chat(
        model="llama3.2",
        messages=[{"role": "user", "content": prompt}],
        options={"temperature": 0}
    )

    print(response["message"]["content"])

if __name__ == "__main__":
    if len(sys.argv) < 2:
        print("Error: falta el mensaje como argumento.")
        sys.exit(1)

    mensaje = sys.argv[1]
    generar_respuesta(mensaje)
