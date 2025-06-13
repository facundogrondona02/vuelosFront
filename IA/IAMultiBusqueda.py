import sys
import json
import ollama
import json
import re

# Convertir el dict a string JSON con indentación para legibilidad
def generar_multi_busqueda(mensaje):
    with open('IA/ejemplos.json', 'r', encoding='utf-8') as f:
        template_json = json.load(f)

    # Convertir el dict a string JSON con indentación para legibilidad
    template_str = json.dumps(template_json, indent=2, ensure_ascii=False)

    prompt = f"""
Sos un procesador de fechas de viajes. No sos programador, no sos explicador, no das sugerencias, no devolvés strings ni JSON ni texto. Solo devolvé un array de objetos JavaScript puros, sin comillas extras ni texto ni código.
🚨 SOLO devolvés un JSON válido, estrictamente así:

[
  {{"departureDate": "05AUG", "returnDate": "19AUG"}},
  {{"departureDate": "06AUG", "returnDate": "20AUG"}}
]

Solo objetos así, separados por coma y salto de línea. Nada más ni menos.

REGLAS (en orden de prioridad):

1️⃣ DÍAS PUNTUALES  
Si el cliente menciona días específicos separados por “o” o “y” (ejemplo: “salir el 2 o el 3 de agosto”), generá objetos solo para esos días exactos.

2️⃣ RANGOS EXPLÍCITOS  
Si el cliente indica “puedo salir entre X y Y de MES”, generá un objeto para cada día de X a Y inclusive.

3️⃣ DURACIÓN DE ESTADÍA  
Si el cliente indica “Z días” de duración, sumale esos días a cada departureDate para calcular returnDate.

4️⃣ QUINCENAS  
“primera quincena de MES” → días 01 al 15  
“segunda quincena de MES” → días 16 al último día

5️⃣ SEMANAS  
“primera semana” → días 01–07  
“segunda semana” → días 08–14  
“tercera semana” → días 15–21  
“cuarta semana” → días 22–último

6️⃣ PRIMEROS/ÚLTIMOS DÍAS  
“los primeros N días” → 01…N  
“principios de MES” → 01–05  
“primeros días” → 01–05  
“últimos días de MES” → 25–último

7️⃣ VALIDACIONES  
Meses en inglés MAYÚSCULAS (JAN, FEB, MAR, APR, MAY, JUN, JUL, AUG, SEP, OCT, NOV, DEC).  
Días con dos dígitos (01, 02, 03, …).  
No sumar días fuera de rango.  
Si no hay datos válidos, devolver un array vacío: []

MENSAJE DEL CLIENTE: {mensaje}

"""

    response = ollama.chat(
        model="llama3.2",
        messages=[{"role": "user", "content": prompt}],
        options={
            "temperature": 0
        }
    )
    content = response["message"]["content"]

    try:
        limpio = limpiar_json(content)
        fechas = json.loads(limpio)
    except Exception as e:
        print("Error al parsear fechas:", e)
        fechas = []

    return fechas

def generar_todo_lo_demas(mensaje):
       
    prompt2= f"""
Sos una IA que recibe mensajes en español y debe devolver solo un único objeto JSON con las siguientes claves exactas:

- origenVuelta: código IATA del destino detectado en el mensaje (ej: MIA, PUJ, MAD, etc.)
- adults: cantidad de adultos (mayores de 12 años)
- children: cantidad de niños (3 a 11 años)
- infants: cantidad de bebés menores de 3 años

Reglas:

- La persona que escribe viaja (1 adulto) salvo que se indique otra cosa.
- Frases como "mi esposa", "mi marido", "mi pareja", "mi amigo", etc., suman 1 adulto cada una.
- Menciones de “mi hijo”, “mis hijos”, “los nenes”, “mi bebé” indican niños o infantes según contexto.
- Inferí cantidades aunque no haya números exactos, con sentido común.
- Si no detectás ciudad destino o pasajeros, usar valores por defecto (1 adulto y origenVuelta vacío).
- Completar todos los campos obligatorios, ningún campo vacío o nulo.

Para determinar el origenVuelta:

- Buscá en el mensaje palabras o frases que indiquen la ciudad de destino (por ejemplo: "quiero viajar a Madrid", "me gustaría ir a Punta Cana", "vamos a Cancún", etc).
- Cuando detectes una de estas ciudades, asigná el código IATA correspondiente según la siguiente tabla:

| Ciudad         | Código IATA |
|----------------|-------------|
| Río de Janeiro | GIG         |
| São Paulo      | GRU         |
| Madrid         | MAD         |
| Cancún         | CUN         |
| Punta Cana     | PUJ         |

Solo devolver un único objeto JSON, sin texto adicional ni explicaciones.

MENSAJE DEL CLIENTE:
{mensaje}

  
"""

    respuesta = ollama.chat(
        model="llama3.2",
        messages=[{"role": "user", "content": prompt2}],
        options={
            "temperature": 0
        }
    )

    content = respuesta["message"]["content"]
    try:
       limpio = limpiar_json(content)
       params = json.loads(limpio)
    except Exception as e:
        print("Error al parsear parámetros:", e)
        params = {}

    return params

def fusionar_resultados(fechas, parametros):
    resultado_semifinal = []
    if not fechas or not parametros:
        return resultado_semifinal  # retorna vacío si falló algo antes

    if not isinstance(parametros, list):
        parametros = [parametros]

    for fecha in fechas:
        for param in parametros:
            combinado = param.copy()
            combinado['departureDate'] = fecha['departureDate']
            combinado['returnDate'] = fecha['returnDate']
            resultado_semifinal.append(combinado)

    return resultado_semifinal

def completar_objetos_finales(lista_vuelos):
    # Tabla de datos por ciudad
    tabla_destinos = {
        "GIG": {
            "maxDuracionIda": "12:00",
            "maxDuracionVuelta": "15:00",
            "horarioIdaEntre": "06:00",
            "horarioIdaHasta": "10:00",
            "horarioVueltaEntre": "13:00",
            "horarioVueltaHasta": "21:00",
            "stops": "Directo"
        },
        "GRU": {
            "maxDuracionIda": "12:00",
            "maxDuracionVuelta": "15:00",
            "horarioIdaEntre": "06:00",
            "horarioIdaHasta": "10:00",
            "horarioVueltaEntre": "13:00",
            "horarioVueltaHasta": "21:00",
            "stops": "1 escala"
        },
        "MAD": {
            "maxDuracionIda": "20:00",
            "maxDuracionVuelta": "22:00",
            "horarioIdaEntre": "13:00",
            "horarioIdaHasta": "18:00",
            "horarioVueltaEntre": "13:00",
            "horarioVueltaHasta": "22:00",
            "stops": "2 escalas"
        },
        "CUN": {
            "maxDuracionIda": "24:00",
            "maxDuracionVuelta": "25:00",
            "horarioIdaEntre": "06:00",
            "horarioIdaHasta": "23:00",
            "horarioVueltaEntre": "09:00",
            "horarioVueltaHasta": "22:00",
            "stops": "1 escala"
        },
        "PUJ": {
            "maxDuracionIda": "25:00",
            "maxDuracionVuelta": "22:00",
            "horarioIdaEntre": "06:00",
            "horarioIdaHasta": "23:00",
            "horarioVueltaEntre": "08:00",
            "horarioVueltaHasta": "22:00",
            "stops": "Directo"
        }
    }

    resultado_final = []

    for vuelo in lista_vuelos:
        origen = vuelo.get("origenVuelta", "")

        datos_destino = tabla_destinos.get(origen, {
            "maxDuracionIda": "",
            "maxDuracionVuelta": "",
            "horarioIdaEntre": "",
            "horarioIdaHasta": "",
            "horarioVueltaEntre": "",
            "horarioVueltaHasta": "",
            "stops": ""
        })

        vuelo_completo = {
            "mail": "franco@melincue.tur.ar",
            "password": "Francomase12!",
            "origenIda": "BUE",
            "origenVuelta": origen,
            "departureDate": vuelo.get("departureDate", ""),
            "returnDate": vuelo.get("returnDate", ""),
            "adults": vuelo.get("adults", 0),
            "children": vuelo.get("children", 0),
            "infants": vuelo.get("infants", 0),
            "currency": "USD",
            "checkedBaggage": False,
            "maxDuracionIda": datos_destino["maxDuracionIda"],
            "maxDuracionVuelta": datos_destino["maxDuracionVuelta"],
            "horarioIdaEntre": datos_destino["horarioIdaEntre"],
            "horarioIdaHasta": datos_destino["horarioIdaHasta"],
            "horarioVueltaEntre": datos_destino["horarioVueltaEntre"],
            "horarioVueltaHasta": datos_destino["horarioVueltaHasta"],
            "stops": datos_destino["stops"]
        }

        resultado_final.append(vuelo_completo)

    return resultado_final 


def limpiar_json(content):
    """
    Limpia el contenido de Ollama para dejar solo el JSON puro.
    """
    # Si viene envuelto en ```json ... ```
    content = re.sub(r"```json", "", content, flags=re.IGNORECASE)
    content = content.replace("```", "")
    
    # Sacar espacios y saltos innecesarios
    content = content.strip()
    
    return content



if __name__ == "__main__":
    if len(sys.argv) < 2:
        print("Error: falta el mensaje como argumento.")
        sys.exit(1)

    mensaje = sys.argv[1]
    fechas = generar_multi_busqueda(mensaje)
    parametros = generar_todo_lo_demas(mensaje)
    resultado = fusionar_resultados(fechas, parametros)
    resultadoFinal = completar_objetos_finales(resultado)
    print(json.dumps(resultadoFinal, indent=2, ensure_ascii=False))