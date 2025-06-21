import sys
import json
import ollama
import json
import re
import os
from rapidfuzz import process, fuzz
# Convertir el dict a string JSON con indentación para legibilidad


# def fuxy_busqueda_fechas(mensaje_usuario, ejemplos_fechas):
#     frases = [ej["frase"] for ej in ejemplos_fechas]

#     mejor_coincidencia = process.extractOne(
#         mensaje_usuario,
#         frases,
#         scorer=fuzz.token_set_ratio
#     )

#     if not mejor_coincidencia:
#         return []

#     frase_mas_cercana, score, indice = mejor_coincidencia
#     if score < 60:
#         return []

#     ejemplo_seleccionado = ejemplos_fechas[indice]

#     return [{
#         "departureDate": ejemplo_seleccionado["departureDate"],
#         "returnDate": ejemplo_seleccionado["returnDate"]
#     }]

def generar_multi_busqueda(mensaje):
    with open('IA/ejemplos_multi.json', 'r', encoding='utf-8') as f:
        ejemplos_json = json.load(f)

    prompt = f"""
⚠️ SOS UNA IA EXPERTA EN INTERPRETACIÓN DE FECHAS DE VIAJE DESDE LENGUAJE NATURAL EN ESPAÑOL.  Me voy con mi mujer y dos hijos a cancun entre el 8 y 11  hasta el 25 noviembre 
NO SOS UN CHATBOT, NO RESPONDÉS CON TEXTO, NO PROGRAMÁS, NO ACLARÁS NADA. SOLO TRANSFORMÁS.

TU ÚNICA FUNCIÓN es transformar un mensaje de una persona en un ARRAY JSON válido y NO VACÍO que contenga fechas posibles de salida y regreso, en el siguiente formato ESTRICTO:

[
  {{"departureDate": "DDMMM", "returnDate": "DDMMM"}},
  ...
]

---

### LÓGICA FUNDAMENTAL QUE TENÉS QUE ENTENDER:

1️⃣ **Detectar todas las fechas de salida posibles** (departureDate) expresadas en el mensaje.  
   - Pueden ser días puntuales (ej: "el 4 de septiembre", "2 o 3 de agosto").  
   - Pueden ser rangos de días (ej: "entre el 10 y el 15 de julio").  
   - Pueden ser semanas o quincenas ("primera quincena de marzo", "segunda semana de mayo").  
   - Pueden ser expresiones genéricas de tiempo ("principios de agosto", "últimos días de enero").

2️⃣ **Detectar fechas de regreso posibles** (returnDate).

   Existen DOS ESCENARIOS POSIBLES:

   ▶️ CASO A: Fecha de regreso explícita
   - Si el mensaje menciona directamente una fecha de regreso, usando expresiones como:  
     "hasta el 25", "vuelvo el 10", "regreso el 3 de octubre", "vuelvo el domingo 24", etc.  
   - En ese caso, la fecha de regreso (returnDate) es FIJA y debe mantenerse igual en todos los objetos,  
     independientemente de cuántas fechas de salida haya.

   ✅ EJEMPLO:
   "puedo salir entre el 8 y el 11 de noviembre y vuelvo el 25"  
   → returnDate fijo: "25NOV"  
   → Resultado:
   [
     {{"departureDate": "08NOV", "returnDate": "25NOV"}},
     {{"departureDate": "09NOV", "returnDate": "25NOV"}},
     {{"departureDate": "10NOV", "returnDate": "25NOV"}},
     {{"departureDate": "11NOV", "returnDate": "25NOV"}}
   ]

   ⚠️ En este caso NO debe sumarse una duración ficticia. La fecha indicada prevalece.

   ▶️ CASO B: No hay fecha de regreso explícita, pero sí duración
   - Si el mensaje indica una duración (ej: "2 semanas", "10 días", "una semana y media") pero no una fecha exacta de vuelta,
     entonces el returnDate debe calcularse de forma dinámica y VARIABLE para cada fecha de salida.
   - Es decir, a cada departureDate se le suma la cantidad de días especificada para obtener un returnDate diferente por salida.

   ✅ EJEMPLO:
   "puedo salir entre el 15 y el 20 de septiembre y me quedo 2 semanas"  
   → Generar un returnDate para cada departureDate, sumando 14 días:
   [
     {{"departureDate": "15SEP", "returnDate": "29SEP"}},
     {{"departureDate": "16SEP", "returnDate": "30SEP"}},
     {{"departureDate": "17SEP", "returnDate": "01OCT"}},
     ...
   ]


3️⃣ **Si la suma de días para la fecha de regreso supera el límite del mes de salida, DEBÉS calcular correctamente la fecha que corresponde en el siguiente mes.**  
   - Por ejemplo, salir el 20SEP y quedarse 14 días → volver el 04OCT.  
   - Esta suma debe considerar la duración variable de cada mes y no generar fechas inválidas.

4️⃣ **Generar un objeto para cada combinación posible de salida y regreso** según lo que el mensaje sugiere o implica.  
   - Por ejemplo, si hay dos días de salida posibles y un rango de días de regreso, generá todas las combinaciones posibles.  
   - Siempre asegurate que las fechas sean válidas y no generes fechas fuera de calendario (ej: no 31FEB).

5️⃣ **Formato estricto y exacto**:  
   - Día con dos dígitos (01 a 31).  
   - Mes en inglés y en MAYÚSCULAS: JAN, FEB, MAR, APR, MAY, JUN, JUL, AUG, SEP, OCT, NOV, DEC.  
   - La respuesta debe ser SOLO el array JSON puro, sin texto, sin markdown, sin explicaciones, sin comillas extras ni caracteres adicionales.

6️⃣ **Nunca devolvés un array vacío.**  
   - Si no encontrás fechas claras, hacé un esfuerzo para interpretar el mensaje y generar al menos una opción plausible basada en duración o lógica.  
   - El objetivo es siempre devolver fechas válidas y consistentes.

7️⃣ **No inventar meses o fechas.**  
   - Si no se especifica mes o es ambiguo, NO adivinar.  
   - Solo procesar y devolver fechas que estén claras en el mensaje o que puedan inferirse razonablemente.

⚠️ CLAVE:  
Si el mensaje menciona explícitamente la fecha de regreso (ej: "hasta el 25", "vuelvo el 10 de agosto"),  
esa fecha debe usarse como valor fijo de `returnDate` en **todos** los objetos generados, sin excepción.

Solo cuando NO haya una fecha explícita, y haya una duración de estadía,  
el `returnDate` debe calcularse sumando los días correspondientes a cada `departureDate`.

NO mezclar lógicas ni hacer ambas a la vez. Detectá bien el caso y aplicá solo una:

✅ Si hay fecha explícita de vuelta → returnDate fijo para todas las fechas de salida.  
✅ Si NO hay fecha de regreso pero sí duración → returnDate se calcula por suma, individualmente.

Nunca uses los dos criterios al mismo tiempo.

---

### EJEMPLOS DETALLADOS:

Ejemplo 1:  
Mensaje: "quiero ir a miami 2 semanas y puedo salir el 4 o 5 de septiembre"  
Respuesta:  
[  
  {{"departureDate": "04SEP", "returnDate": "18SEP"}},  
  {{"departureDate": "05SEP", "returnDate": "19SEP"}}  
]

Ejemplo 2:  
Mensaje: "puedo salir entre el 10 y el 12 de julio y volver el 20"  
Respuesta:  
[  
  {{"departureDate": "10JUL", "returnDate": "20JUL"}},  
  {{"departureDate": "11JUL", "returnDate": "20JUL"}},  
  {{"departureDate": "12JUL", "returnDate": "20JUL"}}  
]

Ejemplo 3:  
Mensaje: "salgo la primera quincena de marzo y me quedo 10 días"  
Respuesta:  
[  
  {{"departureDate": "01MAR", "returnDate": "11MAR"}},  
  {{"departureDate": "02MAR", "returnDate": "12MAR"}},  
  ...  
  {{"departureDate": "15MAR", "returnDate": "25MAR"}}  
]

Ejemplo 4:  
Mensaje: "solo puedo salir el 15 de agosto"  
Respuesta:  
[  
  {{"departureDate": "15AUG", "returnDate": "22AUG"}}  
]

Ejemplo 5:  
Mensaje: "entre el 20 y el 22 de septiembre y quiero quedarme dos semanas"  
Respuesta:  
[  
  {{"departureDate": "20SEP", "returnDate": "04OCT"}},  
  {{"departureDate": "21SEP", "returnDate": "05OCT"}},  
  {{"departureDate": "22SEP", "returnDate": "06OCT"}}  
]

Ejemplo 6:  
Mensaje: "entre el 5 y el 8 de octubre o el 12, vuelvo el 20"  
Respuesta:  
[  
  {{"departureDate": "05OCT", "returnDate": "20OCT"}},  
  {{"departureDate": "06OCT", "returnDate": "20OCT"}},  
  {{"departureDate": "07OCT", "returnDate": "20OCT"}},  
  {{"departureDate": "08OCT", "returnDate": "20OCT"}},  
  {{"departureDate": "12OCT", "returnDate": "20OCT"}}  
]

Ejemplo 7:  
Mensaje: "me gustaría salir principios de noviembre y quedarme dos semanas"  
Respuesta:  
[  
  {{"departureDate": "01NOV", "returnDate": "15NOV"}},  
  {{"departureDate": "02NOV", "returnDate": "16NOV"}},  
  {{"departureDate": "03NOV", "returnDate": "17NOV"}},  
  {{"departureDate": "04NOV", "returnDate": "18NOV"}},  
  {{"departureDate": "05NOV", "returnDate": "19NOV"}}  
]

---

### NOTAS IMPORTANTES:  
- "una semana" = 7 días  
- "dos semanas" = 14 días  
- Si hay varias fechas de salida y un rango de regreso, generá la combinación completa.  
- Si la duración no está explícita y no hay fecha de regreso, asumí 7 días.  
- Si la fecha de regreso es anterior a la salida, descartá esa combinación.  
- No agregar texto extra, solo el array JSON válido con doble llave en los objetos.

---

### MENSAJE A PROCESAR:

"{mensaje}"

    """

    response = ollama.chat(
        model="llama3.2",
        messages=[{"role": "user", "content": prompt}],
        options={"temperature": 0}
    )
    content = response["message"]["content"]

    try:
        limpio = limpiar_json(content)  # asumí que limpia el string para obtener JSON válido
        fechas = json.loads(limpio)     # antes usabas json.loads(content) directamente, que fallaba
        if not fechas:
            raise ValueError("Array vacío")
    except Exception as e:
        print(f"Error parseando JSON: {e}")
        fechas = []  # devolver un array vacío o un fallback válido
    return fechas

def generar_todo_lo_demas(mensaje):
       
    prompt2= f"""
Sos una IA que recibe mensajes en español y debe devolver solo un único objeto JSON con las siguientes claves exactas:

- origenVuelta: lugar de destino, puede ser un ciudad o pais
- adults: cantidad de adultos (mayores de 12 años)
- children: cantidad de niños (3 a 11 años)
- infants: cantidad de bebés menores de 3 años

Reglas:

- La persona que escribe viaja (1 adulto) salvo que se indique otra cosa.
- Frases como "mi esposa", "mi marido", "mi pareja", "mi amigo","mi mujer", etc., suman 1 adulto cada una.
- Menciones de “mi hijo”, “mis hijos”, “los nenes”, “mi bebé” indican niños o infantes según contexto.
- Inferí cantidades aunque no haya números exactos, con sentido común.
- Si no detectás ciudad destino o pasajeros, usar valores por defecto (1 adulto y origenVuelta vacío).
- Completar todos los campos obligatorios, ningún campo vacío o nulo.

Para determinar el origenVuelta:
Tenes que interpretar el lugar donde quiere ir el cliente segun el mensaje, puede ser madrid, Cancun, o lo que sea tenes que ver el destino y rempazarlo en 'origenVuelta' del objeto final

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



def obtener_codigos_iata_lista(destinos, ruta_json="data/codigoIATA.json"):
    if not isinstance(destinos, list):
        print("Error: Se esperaba una lista de objetos destino.")
        return destinos

    try:
        with open(ruta_json, "r", encoding="utf-8") as f:
            destinos_data = json.load(f)
    except Exception as e:
        print(f"Error cargando {ruta_json}: {e}")
        return destinos

    ciudades = [d["ciudad"].lower().strip() for d in destinos_data]

    for destino_obj in destinos:
        if not isinstance(destino_obj, dict):
            continue

        destino_usuario = destino_obj.get("origenVuelta", "").lower().strip()
        if not destino_usuario:
            continue

        mejor_coincidencia = process.extractOne(
            destino_usuario,
            ciudades,
            scorer=fuzz.WRatio
        )

        if mejor_coincidencia:
            ciudad_match, score, _ = mejor_coincidencia
            if score >= 70:
                for d in destinos_data:
                    if d["ciudad"].lower().strip() == ciudad_match:
                        destino_obj["origenVuelta"] = d["codigoIATA"]
                        break
            else:
                print(f"No coincidencia confiable para '{destino_usuario}' (score={score})")
        else:
            print(f"No se encontró ninguna coincidencia para '{destino_usuario}'")

    return destinos


def cargar_destinos():
    ruta_archivo = r'C:\Users\facun\FrancoMonolitico\vuelos-front\data\destinos.json'
    with open(ruta_archivo, 'r') as f:
        destinos = json.load(f)
    # Devolvemos un diccionario con clave origenVuelta para buscar fácil después
    return { destino["origenVuelta"]: destino for destino in destinos }

def completar_objetos_finales(lista_vuelos):
    # Acá ya no va hardcodeado, lo cargamos dinámicamente
    tabla_destinos = cargar_destinos()

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
            "maxDuracionIda": datos_destino.get("maxDuracionIda", ""),
            "maxDuracionVuelta": datos_destino.get("maxDuracionVuelta", ""),
            "horarioIdaEntre": datos_destino.get("horarioIdaEntre", ""),
            "horarioIdaHasta": datos_destino.get("horarioIdaHasta", ""),
            "horarioVueltaEntre": datos_destino.get("horarioVueltaEntre", ""),
            "horarioVueltaHasta": datos_destino.get("horarioVueltaHasta", ""),
            "stops": datos_destino.get("stops", "")
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
    destinoFinal =obtener_codigos_iata_lista(resultado)
    resultadoFinal = completar_objetos_finales(destinoFinal)
    print(json.dumps(resultadoFinal, indent=2, ensure_ascii=False))