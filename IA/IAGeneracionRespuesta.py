# import sys
# import io
# import json
# import ollama

# sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8')

# def generar_respuesta(mensaje):
#     try:
#         vuelos = json.loads(mensaje)
#     except json.JSONDecodeError as e:
#         print("Error: el mensaje no es un JSON válido.")
#         print("Detalles:", e)
#         return

#     cantidad = len(vuelos)
#     vuelos_texto = json.dumps(vuelos, ensure_ascii=False, indent=2)
#     print("cantidad de vuelos ",cantidad)
#     print("vuelos ",vuelos)
#     prompt = f"""
# Recibiste una lista de vuelos en formato JSON. Tu única tarea es generar un mensaje cálido y claro en español para enviar a un cliente por WhatsApp.

# ✈️ Estos son los vuelos disponibles:
# {vuelos}

# 🎯 INSTRUCCIONES CLARAS:
# - NO inventes vuelos.
# - NO omitas vuelos. Si hay 5, mostrá los 5.
# - NO repitas vuelos. Solo una vez cada uno.
# - Mostrá todos los vuelos con el mismo formato.
# - Al final, hacé una pequeña comparación entre ellos (precio, duración o escalas).
# - No muestres el JSON ni ningún texto técnico.
# - Cada vuelo tiene sus datos propios, no utilices de otros, fijate bien de no tomar datos de otros vuelos para remplazar a uno.

# Tenes que reemplazar los datos de cada vuelo que nos dan en el siguiente mensaje, no uses datos viejos para cada nuevos formateo de mensaje
# Cada armado de mensaje tiene usar los datos propios
# ---
# Cotización aérea a {{ciudadDestinoIda}}.

# ✈️ Aéreo de {{aerolinea}} con equipaje de mano de 10kg + bolso de mano.

# Horarios:
# ida:
# {{aeropuertoIda}} {{horarioSalidaIda}}
# Llegada: {{aeropuertoDestinoIda}} {{horarioSupongoLlegadaIda}} (Duración: {{horarioSupongoDuracionIda}})
# {{escalasIda}}

# vuelta:
# {{aeropuertoVuelta}} {{horarioSalidaVuelta}}
# Llegada: {{aeropuertoDestinoVuelta}} {{horarioSupongoLlegadaVuelta}} (Duración: {{horarioSupongoDuracionVuelta}})
# {{escalasVuelta}}

# 💰 Precio final: {{precioFinal}} USD
# """

#     response = ollama.chat(
#         model="llama3.2",
#         messages=[{"role": "user", "content": prompt}],
#         options={"temperature": 0}
#     )

#     print(response["message"]["content"])


# if __name__ == "__main__":
#     try:
#         mensaje = sys.stdin.read()
#         generar_respuesta(mensaje)
#     except Exception as e:
#         print("Error al leer stdin o generar respuesta:", e)
#         sys.exit(1)


import sys
import io
import json
import ollama

sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8')

def formatear_vuelo(v):
    return f"""Cotización aérea a {v['ciudadDestinoIda']}.

✈️ Aéreo de {v['aerolinea']} con equipaje de mano de 10kg + bolso de mano.

Horarios:
ida:
{v['aeropuertoIda']} {v['horarioSalidaIda']}
Llegada: {v['aeropuertoDestinoIda']} {v['horarioSupongoLlegadaIda']} (Duración: {v['horarioSupongoDuracionIda']})
{v['escalasIda']}

vuelta:
{v['aeropuertoVuelta']} {v['horarioSalidaVuelta']}
Llegada: {v['aeropuertoDestinoVuelta']} {v['horarioSupongoLlegadaVuelta']} (Duración: {v['horarioSupongoDuracionVuelta']})
{v['escalasVuelta']}

💰 Precio final: {v['precioFinal']} USD
"""

def generar_respuesta(mensaje):
    try:
        # Aseguramos que el mensaje tenga comillas dobles
        if isinstance(mensaje, str):
            vuelos = json.loads(mensaje)
        else:
            print("Error: El mensaje recibido no es un string.")
            return
    except json.JSONDecodeError as e:
        print("Error: el mensaje no es un JSON válido.")
        print("Detalles:", e)
        return

    if not isinstance(vuelos, list) or not vuelos:
        print("Error: No se encontró una lista válida de vuelos.")
        return

    cantidad = len(vuelos)

    vuelos_formateados = "\n\n".join(formatear_vuelo(v) for v in vuelos)
    prompt = ""

    if cantidad == 1:
        prompt = f"""
Este es el único vuelo disponible actualmente. Redactá un mensaje claro y directo para enviar al cliente por WhatsApp.

Requisitos:
- No compares con otros vuelos.
- No uses frases como "es la mejor opción" ni "comparando".
- No digas que es el único vuelo, simplemente presentalo.
- No cierres con sugerencias.
- Usá un tono natural, humano y conciso.
- El mensaje debe ser listo para copiar y pegar al cliente.

{vuelos_formateados}
"""
    else:
        print("vuelos formateados: ",vuelos_formateados)
        prompt = f"""
Estas son las opciones de vuelos disponibles. Redactá un único mensaje para enviar al cliente por WhatsApp.

Requisitos:
- Compará las opciones considerando duración y precio.
- No expliques que estás recomendando, simplemente hacelo.
- No digas “te recomiendo” ni “creo que”.
- No repitas información obvia ni detalles técnicos.
- No cierres con preguntas ni sugerencias.
- El mensaje debe ser directo y apto para cliente.

{vuelos_formateados}

Escribí una única respuesta como si fueras un asesor humano que ya analizó todo y ahora redacta el mensaje final.
"""

    try:
        response = ollama.chat(
            model="llama3.2",
            messages=[{"role": "user", "content": prompt}],
            options={"temperature": 0}
        )
        print(response["message"]["content"])
    except Exception as e:
        print("Error al generar respuesta con Ollama:", e)

if __name__ == "__main__":
    try:
        mensaje = sys.stdin.read()
        generar_respuesta(mensaje)
    except Exception as e:
        print("Error al leer stdin o generar respuesta:", e)
        sys.exit(1)

