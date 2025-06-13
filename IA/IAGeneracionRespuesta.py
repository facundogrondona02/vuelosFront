import sys
import io
import json
import ollama

# Forzar salida estándar en UTF-8
sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8')

def generar_respuesta(mensaje):
    prompt = f"""
Vas a recibir un array que puede tener uno o más objetos, cada uno con información detallada sobre vuelos. Tu tarea es generar un mensaje cálido y profesional para enviarle a un cliente por WhatsApp o chat.

**IMPORTANTE:**
- NO devuelvas JSON ni estructuras de objetos.
- SOLO devolveme un mensaje en lenguaje natural.
- El mensaje debe tener buena redacción, con signos y emojis si querés, para hacerlo más humano.
- NO hagas preguntas, NO cierres el mensaje con "¿Querés avanzar con esta opción?", "¿Querés que te muestre más?" ni similares. **Solo informá**.

**Si hay un solo vuelo:**
- Explicá todos los datos del vuelo de forma clara:
  - Aerolínea
  - Ciudad y aeropuerto de salida
  - Horario y duración estimada de ida y de vuelta
  - Escalas (detallá si es directo o con conexión, y por dónde)
  - Precio final

**Si hay más de un vuelo:**
- Mostrá todas las opciones con claridad.
- Hacé una breve comparación entre ellas.
- Recomendá la mejor opción, preferentemente la más económica si vale la pena, o explicá por qué otra sería mejor (por duración, escalas, etc.).
- **NO cierres con preguntas ni llamadas a la acción.**

**Formato de cada vuelo** (los datos te van a llegar en este formato):



Mensaje del cliente:
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
