import sys
import io
import json
import ollama
from collections import defaultdict # Para agrupar vuelos
import traceback # Importar traceback para imprimir la pila de llamadas

# Configurar la salida estándar para UTF-8
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

def formatear_vuelo(v, is_grouped=False):
    fechas_disponibles = ""
    if is_grouped and 'fechas_alternativas_ida' in v and 'fechas_alternativas_vuelta' in v:
        fechas_ida = ", ".join(v['fechas_alternativas_ida'])
        fechas_vuelta = ", ".join(v['fechas_alternativas_vuelta'])
        fechas_disponibles = f"\nFechas de salida disponibles: {fechas_ida}\nFechas de regreso disponibles: {fechas_vuelta}"
        
        # Para el texto principal, solo muestra la primera fecha del grupo o la fecha original
        # Asegurarse de que estas claves existan en el vuelo representativo
        fecha_salida_display = v.get('fechaSalidaIda', 'N/A')
        fecha_llegada_display = v.get('fechaLlegadaIda', 'N/A')
        fecha_salida_vuelta_display = v.get('fechaSalidaVuelta', 'N/A')
        fecha_llegada_vuelta_display = v.get('fechaLlegadaVuelta', 'N/A')

    else:
        # Formato normal para vuelos individuales
        fecha_salida_display = v.get('fechaSalidaIda', 'N/A')
        fecha_llegada_display = v.get('fechaLlegadaIda', 'N/A')
        fecha_salida_vuelta_display = v.get('fechaSalidaVuelta', 'N/A')
        fecha_llegada_vuelta_display = v.get('fechaLlegadaVuelta', 'N/A')

    # Asegurar que todas las claves accedidas en el f-string existan, usando .get() con un valor por defecto
    return f"""Cotización aérea a {v.get('ciudadDestinoIda', 'N/A')}.

✈️ Aéreo de {v.get('aerolinea', 'N/A')} con equipaje de mano de 10kg + bolso de mano.

Horarios:

ida:
Salida:  {v.get('aeropuertoIda', 'N/A')} {v.get('horarioSalidaIda', 'N/A')} | {fecha_salida_display}
Llegada: {v.get('aeropuertoDestinoIda', 'N/A')} {v.get('horarioSupongoLlegadaIda', 'N/A')} | {fecha_llegada_display}
(Duración: {v.get('horarioSupongoDuracionIda', 'N/A')}) || {v.get('escalasIda', 'N/A')}

vuelta:
Salida:  {v.get('aeropuertoVuelta', 'N/A')} {v.get('horarioSalidaVuelta', 'N/A')} | {fecha_salida_vuelta_display}
Llegada: {v.get('aeropuertoDestinoVuelta', 'N/A')} {v.get('horarioSupongoLlegadaVuelta', 'N/A')} | {fecha_llegada_vuelta_display}
(Duración: {v.get('horarioSupongoDuracionVuelta', 'N/A')}) || {v.get('escalasVuelta', 'N/A')}

💰 Precio final: {v.get('precioFinal', 'N/A')} USD{fechas_disponibles}
"""

def generar_respuesta(mensaje):
    try:
        if isinstance(mensaje, str):
            vuelos = json.loads(mensaje)
        else:
            print("Error: El mensaje recibido no es un string.")
            return
    except json.JSONDecodeError as e:
        print(f"Error: el mensaje no es un JSON válido. Detalles: {e}")
        print(f"Mensaje recibido (primeros 500 chars): {mensaje[:500]}...")
        return

    if not isinstance(vuelos, list) or not vuelos:
        print("Error: No se encontró una lista válida de vuelos o la lista está vacía.")
        return

    try: # Bloque try-except general para la lógica principal
        # --- INICIO DE LA LÓGICA DE PRE-PROCESAMIENTO Y AGRUPACIÓN ---
        # Limpiar y convertir precioFinal a float para ordenar
        for vuelo in vuelos:
            if 'precioFinal' in vuelo and isinstance(vuelo['precioFinal'], str):
                cleaned_price = vuelo['precioFinal'].replace('.', '').replace(',', '.')
                try:
                    vuelo['precioFinal'] = float(cleaned_price)
                except ValueError:
                    print(f"Advertencia: No se pudo convertir '{vuelo['precioFinal']}' a float. Asignando un valor alto para ordenamiento.")
                    vuelo['precioFinal'] = float('inf') 

        # Función auxiliar para convertir duración a minutos para un ordenamiento numérico
        def parse_duration_to_minutes(duration_str):
            if not duration_str:
                return float('inf')
            if 'h' in duration_str and 'm' in duration_str:
                try:
                    parts = duration_str.replace('h', '').replace('m', '').strip().split()
                    if len(parts) == 2:
                        return int(parts[0]) * 60 + int(parts[1])
                except ValueError:
                    pass
            if ':' in duration_str:
                try:
                    parts = duration_str.split(':')
                    if len(parts) == 2:
                        return int(parts[0]) * 60 + int(parts[1])
                except ValueError:
                    pass
            return float('inf')

        # Agrupar vuelos por sus características principales (ignorando las fechas por ahora)
        vuelos_agrupados = defaultdict(lambda: {
            'count': 0,
            'representative_vuelo': None,
            'fechas_alternativas_ida': set(),
            'fechas_alternativas_vuelta': set()
        })

        for vuelo in vuelos:
            # Crea una tupla con las características clave para identificar vuelos "idénticos"
            # Usar .get() para mayor robustez si alguna clave pudiera faltar
            key_tuple = (
                vuelo.get('ciudadDestinoIda'),
                vuelo.get('aerolinea'),
                vuelo.get('aeropuertoIda'),
                vuelo.get('horarioSalidaIda'),
                vuelo.get('aeropuertoDestinoIda'),
                vuelo.get('horarioSupongoLlegadaIda'),
                vuelo.get('horarioSupongoDuracionIda'),
                vuelo.get('escalasIda'),
                vuelo.get('aeropuertoVuelta'),
                vuelo.get('horarioSalidaVuelta'),
                vuelo.get('aeropuertoDestinoVuelta'),
                vuelo.get('horarioSupongoLlegadaVuelta'),
                vuelo.get('horarioSupongoDuracionVuelta'),
                vuelo.get('escalasVuelta'),
                vuelo.get('precioFinal') # El precio final es clave para la agrupación
            )
            
            group = vuelos_agrupados[key_tuple]
            group['count'] += 1
            if group['representative_vuelo'] is None:
                group['representative_vuelo'] = vuelo # El primer vuelo que cumple es el representante
            
            # Añade las fechas de este vuelo a las alternativas del grupo
            group['fechas_alternativas_ida'].add(vuelo.get('fechaSalidaIda'))
            group['fechas_alternativas_vuelta'].add(vuelo.get('fechaSalidaVuelta')) 

        # Convertir los grupos en una lista de "vuelos representativos"
        lista_vuelos_representativos = []
        for key, group_data in vuelos_agrupados.items():
            rep_vuelo = group_data['representative_vuelo']
            if rep_vuelo:
                # Crear una copia del vuelo representativo para no modificar el original en el defaultdict
                processed_rep_vuelo = rep_vuelo.copy() 
                if group_data['count'] > 1:
                    processed_rep_vuelo['fechas_alternativas_ida'] = sorted(list(group_data['fechas_alternativas_ida']))
                    processed_rep_vuelo['fechas_alternativas_vuelta'] = sorted(list(group_data['fechas_alternativas_vuelta']))
                    processed_rep_vuelo['is_grouped'] = True 
                    processed_rep_vuelo['num_grouped_options'] = group_data['count'] 
                else:
                    processed_rep_vuelo['is_grouped'] = False 
                    processed_rep_vuelo['num_grouped_options'] = 1
                lista_vuelos_representativos.append(processed_rep_vuelo)

        cantidad_representativos = len(lista_vuelos_representativos)
        vuelos_para_ollama = []

        if cantidad_representativos > 5:
            # Ordenar vuelos representativos: por precio, luego por duración total
            vuelos_ordenados = sorted(lista_vuelos_representativos, key=lambda x: (
                x.get('precioFinal', float('inf')),
                parse_duration_to_minutes(x.get('horarioSupongoDuracionIda', '')) +
                parse_duration_to_minutes(x.get('horarioSupongoDuracionVuelta', ''))
            ))
            vuelos_para_ollama = vuelos_ordenados[:5] # Selecciona solo los 5 mejores grupos/opciones
        else:
            vuelos_para_ollama = lista_vuelos_representativos # Si son 5 o menos grupos, usa todos

        # --- FIN DE LA LÓGICA DE PRE-PROCESAMIENTO Y AGRUPACIÓN ---

        # Formatear los vuelos seleccionados para Ollama
        vuelos_formateados_para_ollama = []
        for v in vuelos_para_ollama:
            vuelos_formateados_para_ollama.append(formatear_vuelo(v, v.get('is_grouped', False)))
        
        vuelos_formateados = "\n\n".join(vuelos_formateados_para_ollama)

        # El pasajero_vuelos_adults, children e infants se toman del primer vuelo de la lista ORIGINAL
        # Suponiendo que estos datos son consistentes en todos los vuelos
        pasajero_vuelos_adults = vuelos[0]['adults'] 
        pasajero_vuelos_children = vuelos[0]['children']
        pasajero_vuelos_infants = vuelos[0]['infants']

        texto_pasajeros = generar_texto_pasajeros(pasajero_vuelos_adults, pasajero_vuelos_children, pasajero_vuelos_infants)
        print(texto_pasajeros)
        # print(vuelos_formateados) # Descomentar para ver el input real que va a Ollama

        prompt = "" 
        if cantidad_representativos == 1:
            prompt = f"""
Este es el único vuelo disponible actualmente. Redacta un mensaje claro y directo para enviar al cliente por WhatsApp.

Requisitos:
- No compares con otros vuelos.
- No uses frases como "es la mejor opción" ni "comparando".
- No cierres con sugerencias.
- Usa un tono natural, humano y conciso.
- El mensaje debe ser listo para copiar y pegar al cliente.

{vuelos_formateados}
"""
        elif cantidad_representativos <= 5: 
            prompt = f"""
Estas son las opciones de vuelos disponibles. Redacta un único mensaje para enviar al cliente por WhatsApp.
Presenta las opciones de forma clara, listadas del 1 al {cantidad_representativos}.
Si alguna opción agrupa varias fechas con las mismas características (precio, escalas, duración, horarios de salida y llegada), indícalo claramente y muestra las fechas de salida disponibles para esa opción, sin repetir toda la información del vuelo.
Al final del mensaje, indica cuál de estas {cantidad_representativos} opciones es la que recomiendas y por qué, de manera muy breve y directa.

Requisitos:
- Compara las opciones considerando duración, precio y escalas.
- Recomienda la mejor opción, priorizando el precio y luego la duración total (ida + vuelta) y menos escalas.
- No expliques que estás recomendando, simplemente hazlo.
- No repitas información obvia ni detalles técnicos.
- No cierres con preguntas ni sugerencias.
- El mensaje debe ser directo y apto para cliente.

{vuelos_formateados}

Escribe una única respuesta como si fueras un asesor humano que ya analizó todo y ahora redacta el mensaje final.
""" 
        else: # Esto se ejecuta cuando hay más de 5 opciones representativas
            prompt = f"""
Aquí tienes una selección de las 5 mejores opciones de vuelos disponibles, filtradas por precio y duración. Por favor, redacta un mensaje conciso para enviar al cliente por WhatsApp.

Evalúa estas 5 opciones. Si alguna opción agrupa varias fechas con las mismas características (precio, escalas, duración, horarios de salida y llegada), indica que hay múltiples fechas disponibles para ese tipo de vuelo y muestra la lista de fechas de salida sin repetir los demás datos del vuelo.
Tu recomendación debe priorizar el precio y, si es igual, la menor duración total del vuelo (ida + vuelta) y menos escalas.

Presenta las 5 opciones de forma clara, listadas del 1 al 5. Luego, al final del mensaje, indica cuál de estas 5 opciones es la que recomiendas y por qué, de manera muy breve y directa.

Requisitos para el mensaje:
- Tono natural, humano y conciso.
- Listo para copiar y pegar, sin frases introductorias ni de cierre adicionales.
- No expliques tu proceso de análisis, solo la recomendación final.
- No uses frases como "es la mejor opción" ni "comparando" en la parte general, solo en la recomendación específica.
- No repitas detalles técnicos obvios.

{vuelos_formateados}

Recuerda: Tu respuesta final debe ser el mensaje directo al cliente, incluyendo las 5 opciones y tu recomendación.
""" 
        try:
            response = ollama.chat(
                model="llama3.2",
                messages=[{"role": "user", "content": prompt}],
                options={"temperature": 0}
            )
            print(response["message"]["content"])
        except Exception as e:
            print(f"Error al generar respuesta con Ollama: {e}")
            # Si quieres ver el traceback completo para errores de Ollama también:
            # traceback.print_exc()

    except Exception as e:
        print(f"Error inesperado durante el procesamiento de vuelos: {e}")
        traceback.print_exc() # Imprime el traceback completo para depuración

if __name__ == "__main__":
    try:
        mensaje = sys.stdin.read()
        generar_respuesta(mensaje)
    except Exception as e:
        print(f"Error al leer stdin o generar respuesta en main: {e}")
        sys.exit(1)
