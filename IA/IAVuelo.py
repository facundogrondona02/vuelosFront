import json
import re
from fuzzywuzzy import process, fuzz

import sys
import json
import ollama
import re
from rapidfuzz import process, fuzz

MESES = {
    "enero": "JAN", "febrero": "FEB", "marzo": "MAR", "abril": "APR",
    "mayo": "MAY", "junio": "JUN", "julio": "JUL", "agosto": "AUG",
    "septiembre": "SEP", "octubre": "OCT", "noviembre": "NOV", "diciembre": "DEC"
}

def es_fecha_rango_concreto(frase):
    # Detecta frases tipo "del 10 al 20 de agosto"
    return bool(re.search(r"del?\s+\d{1,2}\s+(al|hasta)\s+\d{1,2}\s+de\s+\w+", frase.lower()))

def extraer_fechas_desde_frase(frase):
    """
    Detecta rangos del tipo 'del 10 al 20 de agosto' o fechas únicas 'el 3 de agosto' 
    en la frase y devuelve departureDate y returnDate en formato DDMMM.
    """
    frase = frase.lower()

    # 1) Rango explícito: "del 10 al 20 de agosto"
    rango_pattern = r"del (\d{1,2}) al (\d{1,2}) de (\w+)"
    match = re.search(rango_pattern, frase)
    if match:
        dia_ini, dia_fin, mes = match.groups()
        mes = mes.lower()
        if mes in MESES:
            departureDate = f"{int(dia_ini):02d}{MESES[mes]}"
            returnDate = f"{int(dia_fin):02d}{MESES[mes]}"
            return departureDate, returnDate, "rango"

    # 2) Fecha única: "el 3 de agosto"
    fecha_unica_pattern = r"el (\d{1,2}) de (\w+)"
    match = re.search(fecha_unica_pattern, frase)
    if match:
        dia, mes = match.groups()
        mes = mes.lower()
        if mes in MESES:
            departureDate = f"{int(dia):02d}{MESES[mes]}"
            dia_ret = int(dia) + 7  # Asumimos viaje de 7 días
            returnDate = f"{dia_ret:02d}{MESES[mes]}"
            return departureDate, returnDate, "fechaExacta"

    return None, None, None

def match_fecha_concreta(frase_fecha_ambigua, ejemplos_fechas, umbral=85):
    frases = [ej["frase"] for ej in ejemplos_fechas]
    match_score = process.extractOne(frase_fecha_ambigua, frases, scorer=fuzz.WRatio)
    if match_score:
       match, score, idx = match_score
    if score >= umbral:
        return ejemplos_fechas[idx]
    return None

def generar_json_desde_mensaje(mensaje):
    ejemplos_fechas = json.load(open("IA/ejemplos.json", encoding="utf-8"))
    lista_ejemplos = ejemplos_fechas["ejemplos"]

    prompt = f"""
Sos una IA que recibe mensajes de clientes y devuelve un objeto  con los datos del vuelo.

Tu tarea es:
- Interpretar pasajeros
- Detectar fechas anbiguas y pasarlas a concretas
- Detectar el destino y devolver el lugar donde entendes que va a ir

Respondé SOLO con el objeto JSON puro (sin texto adicional, sin explicaciones).

- origenVuelta: lugar de destino, puede ser un ciudad o pais
- fraseFecha: pasar de la fecha ambigua a una concreta
- adults: cantidad de adultos (mayores de 12 años) 
- children: cantidad de niños (3 a 11 años) 
- infants: cantidad de bebés menores de 3 años 

--- 
**Reglas y detalles importantes:**
2. El destino (`origenVuelta`) debe ser un lugar valido⚠ IMPORTANTE:
3. Niños: entre 3 y 11 años inclusive. Bebés (infants): menores de 3 años.

--- 
=======================
1. Interpretación de pasajeros
=======================

- Considerá que la persona que escribe el mensaje viaja (1 adulto), salvo que diga lo contrario.
- Palabras como "mi esposa", "mi marido", "mi pareja", "mi amigo", "mi hermano", etc. = 1 adulto.
- Si menciona “mi hijo”, “mis hijos”, “los nenes”, “mi bebé”, etc., deducí si son niños (2 a 11 años) o infantes (menores de 2 años).
- Inferí la cantidad de personas aunque no se especifique con números exactos, usando sentido común.

**Ejemplos de interpretación**:

| Mensaje del cliente                                | adultos | niños  | infantes |
|----------------------------------------------------|---------|--------|----------|
| “Viajo con mi mujer y mis dos hijos”               | 2       | 2      | 0        |
| “Somos 4: dos adultos y dos chicos”                | 2       | 2      | 0        |
| “Yo, mi señora y mis tres hijos”                   | 2       | 3      | 0        |
| “Vamos mi marido, yo y los nenes (son 3)”          | 2       | 3      | 0        |
| “Somos 2 y un bebé”                                | 2       | 0      | 1        |
| “Mi esposa, mi hija de 4 y el bebé de meses”       | 2       | 1      | 1        |
| “Voy solo”                                         | 1       | 0      | 0        |
| "quiero viajar solo a punta cana solo"             | 1       | 0      | 0        |
---
=======================
2. Interpretación de fechas
=======================

Tu tarea es interpretar mensajes con fechas de viaje y devolver un JSON con los datos.

Devuelve un único objeto JSON, con estos campos:
- origenVuelta: destino interpretado
- fraseFecha: frase clara que resume la fecha o rango de fechas de salida y regreso, por ejemplo "segunda quincena de agosto" o "del 15 al 20 de agosto"
- tipoFecha: uno de ["semana", "quincena", "rango", "fechaExacta"]
- adults, children, infants: números de pasajeros.

Ejemplos:

Mensaje: "Quiero viajar la segunda quincena de agosto"
Respuesta JSON:
{{
  "origenVuelta": "MAD",
  "fraseFecha": "segunda quincena de agosto",
  "adults": 1,
  "children": 0,
  "infants": 0
}}

Mensaje: "Viajo del 15 al 20 de agosto"
Respuesta JSON:
{{
  "origenVuelta": "MAD",
  "fraseFecha": "del 15 al 20 de agosto",
  "adults": 1,
  "children": 0,
  "infants": 0
}}
---
=======================
3. Interpretacion codigo IATA
=======================

Tenes que interpretar el lugar donde quiere ir el cliente segun el mensaje, puede ser madrid, Cancun, o lo que sea tenes que ver el destino y rempazarlo en 'origenVuelta' del objeto final


=======================
🔁 Revisión final de fechas ANTES de generar el objeto JSON
=======================⚠️ No modifiques el JSON anterior ni generes uno nuevo. Solo revisá internamente que `departureDate` y `returnDate` cumplan estas reglas antes de mostrar el resultado.
✅ Interpretación de “quincenas”:

✅ Si ya lo hiciste bien, respondé con ese mismo objeto.  
❌ Si hay algún error en esas fechas, corregilo internamente antes de mostrar el resultado final.

⚠️ Respondé solamente con UN único objeto JSON. No expliques nada, no devuelvas más de un JSON.
ejemplo de resultado, llenar con los datos obtenidos:
{{
  "origenVuelta": "", 
  "fraseFecha": "",
  "adults": 0,
  "children": 0,
  "infants": 0,
}}
no te confundas los nombres de los atributos, tene mucho cuidado
Cuando termines de armar el objeto revisa nuevamente las fechas hasta que estes seguro de la respuesta
Tenes que revisar las fechas y segui los ejemplos que estan en la seecion 
todos los campos del objeto que tenes que retonar tienen que tener un valor si o si, si no encontraste un valor para alguno tenes que volver a buscar hasta que esten todos completados correctamente
No tenes que inventar fechas, segui el paso a paso de las instrucciones.
Cada campo a completar tiene un instructivo preciso de lo que se pide, seguilo al 100% siempre
Siempre devolve un solo json, nunca retornes 2, SIEMPRE RETORNA 1 SOLO JSON
ultima quincena o última quincena es lo mismo que segunda quincena, usa la misma informacion que te da segunda informacion

⚠️ Respondé solamente con UN único objeto JSON. No expliques nada, no devuelvas más de un JSON.

-------------------

---
Mensaje del cliente:
\"\"\"{mensaje}\"\"\"

    """

    response = ollama.chat(
        model="llama3.2",
        messages=[{"role": "user", "content": prompt}],
        options={"temperature": 0}
    )
    respuesta_texto = response["message"]["content"].strip()

    json_match = re.search(r"\{.*\}", respuesta_texto, re.DOTALL)
    if json_match:
        json_str = json_match.group(0)
        try:
            resultado_json = json.loads(json_str)
        except json.JSONDecodeError as e:
            print("Error al parsear el JSON extraído:")
            print(json_str)
            raise e
    else:
        print("No se encontró un JSON válido dentro de la respuesta:")
        print(respuesta_texto)
        raise ValueError("No se pudo extraer un JSON válido de la respuesta de la IA.")

    frase = resultado_json.get("fraseFecha", "")

    # 1) Si es fecha concreta → extraerla directamente
    if es_fecha_rango_concreto(frase):
        dep, ret, tipo = extraer_fechas_desde_frase(frase)
        if dep and ret:
            resultado_json["departureDate"] = dep
            resultado_json["returnDate"] = ret
            resultado_json["tipoFecha"] = tipo
        else:
            resultado_json["departureDate"] = ""
            resultado_json["returnDate"] = ""
            resultado_json["tipoFecha"] = ""
    else:
        # 2) Buscar en ejemplos de semanas/quincenas
        match_fecha = match_fecha_concreta(frase, lista_ejemplos)
        if match_fecha:
            resultado_json["departureDate"] = match_fecha["departureDate"]
            resultado_json["returnDate"] = match_fecha["returnDate"]
            resultado_json["tipoFecha"] = match_fecha.get("tipoFecha", "semana/quincena")
        else:
            resultado_json["departureDate"] = ""
            resultado_json["returnDate"] = ""
            resultado_json["tipoFecha"] = ""

    return resultado_json




def obtener_codigo_iata(destino_obj, ruta_json="data/codigoIATA.json"):
    if not isinstance(destino_obj, dict):
        return destino_obj

    destino_usuario = destino_obj.get("origenVuelta", "").lower().strip()
    if not destino_usuario:
        return destino_obj

    try:
        with open(ruta_json, "r", encoding="utf-8") as f:
            destinos_data = json.load(f)
    except Exception as e:
        print(f"Error cargando {ruta_json}: {e}")
        return destino_obj

    # Armamos la lista de nombres de ciudades en minúsculas
    ciudades = [d["ciudad"].lower().strip() for d in destinos_data]

    mejor_coincidencia = process.extractOne(
        destino_usuario,
        ciudades,
        scorer=fuzz.WRatio
    )

    if mejor_coincidencia:
        ciudad_match, score, _ = mejor_coincidencia
        if score >= 70:
            # Buscamos el código IATA correspondiente
            for d in destinos_data:
                if d["ciudad"].lower().strip() == ciudad_match:
                    destino_obj["origenVuelta"] = d["codigoIATA"]
                    break
        else:
            print(f"No hubo coincidencia confiable para '{destino_usuario}' (score={score})")
    else:
        print(f"No se encontró ninguna coincidencia para '{destino_usuario}'")

    return destino_obj




def cargar_destinos():
    ruta_archivo = r'C:\Users\facun\FrancoMonolitico\vuelos-front\data\destinos.json'
    with open(ruta_archivo, 'r') as f:
        destinos = json.load(f)
    # Devolvemos un diccionario con clave origenVuelta para buscar fácil después
    return { destino["origenVuelta"]: destino for destino in destinos }


def completar_objetos_finales(vuelo):
    # Tabla de datos por ciudad
    tabla_destinos = cargar_destinos()
    origen = vuelo.get("origenVuelta", "")
    datos_destino = tabla_destinos.get(origen, {...})

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


    return vuelo_completo 






if __name__ == "__main__":
    if len(sys.argv) < 2:
        print("Error: falta el mensaje como argumento.")
        sys.exit(1)

    mensaje = sys.argv[1]
    res = generar_json_desde_mensaje(mensaje)
    destino_final = obtener_codigo_iata(res)
    res_final =completar_objetos_finales(destino_final)
    print(json.dumps(res_final, indent=2, ensure_ascii=False))
