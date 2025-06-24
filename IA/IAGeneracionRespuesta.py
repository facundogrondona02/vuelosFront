import sys
import io
import json
import ollama

sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8')
def generar_texto_pasajeros(adults, children, infants):
    partes = []

    if adults == 1:
        partes.append("1 adulto")
    else:
        partes.append(f"{adults} adultos")

    if children == 1:
        partes.append("1 menor")
    elif children > 1:
        partes.append(f"{children} menores")

    if infants == 1:
        partes.append("1 infante")
    elif infants > 1:
        partes.append(f"{infants} infantes")

    return "Cotización de viaje para " + " y ".join(partes) + "."
def formatear_vuelo(v):
    return f"""Cotización aérea a {v['ciudadDestinoIda']}.

✈️ Aéreo de {v['aerolinea']} con equipaje de mano de 10kg + bolso de mano.

Horarios:

ida:
Salida:  {v['aeropuertoIda']} {v['horarioSalidaIda']} | {v['fechaSalidaIda']} 
Llegada: {v['aeropuertoDestinoIda']} {v['horarioSupongoLlegadaIda']} | {v['fechaLlegadaIda']} 
(Duración: {v['horarioSupongoDuracionIda']}) || {v['escalasIda']}

vuelta:
Salida:  {v['aeropuertoVuelta']} {v['horarioSalidaVuelta']} | {v['fechaSalidaVuelta']} 
Llegada: {v['aeropuertoDestinoVuelta']} {v['horarioSupongoLlegadaVuelta']} | {v['fechaLlegadaVuelta']}
(Duración: {v['horarioSupongoDuracionVuelta']}) || {v['escalasVuelta']}

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
    pasajero_vuelos_adults = vuelos[0]['adults']
    pasajero_vuelos_children = vuelos[0]['children']
    pasajero_vuelos_infants = vuelos[0]['infants']

    texto_pasajeros = generar_texto_pasajeros(pasajero_vuelos_adults, pasajero_vuelos_children, pasajero_vuelos_infants)
    print(texto_pasajeros)
    prompt = "" 
    print(vuelos_formateados)
    
    if cantidad == 1:
        prompt = f"""
Este es el único vuelo disponible actualmente. Redactá un mensaje claro y directo para enviar al cliente por WhatsApp.

Requisitos:
- No compares con otros vuelos.
- No uses frases como "es la mejor opción" ni "comparando".
- No cierres con sugerencias.
- Usá un tono natural, humano y conciso.
- El mensaje debe ser listo para copiar y pegar al cliente.

{vuelos_formateados}
"""
    else:
        prompt = f"""
Estas son las opciones de vuelos disponibles. Redactá un único mensaje para enviar al cliente por WhatsApp.

Requisitos:
- Compará las opciones considerando duración y precio escalas y da la mejor opcion teniendo en cuenta que por lo general el precio es lo mas importante y tambien la duracion del vuelo.
- No expliques que estás recomendando, simplemente hacelo.
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

