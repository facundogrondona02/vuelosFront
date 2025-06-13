import sys
import json
import ollama
import json
import re
def generar_json_desde_mensaje(mensaje):
    with open('IA/ejemplos.json', 'r', encoding='utf-8') as f:
        template_json = json.load(f)

# Convertir el dict a string JSON con indentación para legibilidad
    template_str = json.dumps(template_json, indent=2, ensure_ascii=False)

    prompt = f"""
Sos una IA que recibe mensajes de clientes y devuelve un objeto  con los datos del vuelo.

Tu tarea es:
- Interpretar pasajeros
- Detectar fechas
- Detectar el destino y devolver el código IATA correspondiente.

Respondé SOLO con el objeto JSON puro (sin texto adicional, sin explicaciones).

{template_str}

- origenVuelta: código IATA del destino (ej: MIA, PUJ, MAD, etc.)
- departureDate: fecha estimada de salida en formato DDMMM (ej: 15AUG) o null si no se puede deducir
- returnDate: fecha estimada de regreso en formato DDMMM o null
- adults: cantidad de adultos (mayores de 12 años) o null
- children: cantidad de niños (3 a 11 años) o null
- infants: cantidad de bebés menores de 3 años o null

---


---
**Reglas y detalles importantes:**
2. El destino (`origenVuelta`) debe ser un código IATA válido extraído del mensaje.⚠ IMPORTANTE:
3. Niños: entre 3 y 11 años inclusive. Bebés (infants): menores de 3 años.
4. Interpretar expresiones de tiempo como:⚠ IMPORTANTE:
   - "primera semana de octubre" → 01OCT al 07OCT
   - "segunda semana de julio" → 08JUL al 14JUL
   - "la primera de septiembre" → igual a primera semana
   - "la segunda de noviembre" → igual a segunda semana
   - "primera quincena de enero" → 01JAN al 15JAN
   - "segunda quincena de febrero" → 16FEB al 29FEB
   - "a fin de mes" → salida: 25, regreso: 30 del mismo mes
   - "mitad de septiembre" → salida: 10SEP, regreso: 20SEP
   La salida de los datos "departureDate": "",
  "returnDate": "", tiene que ser DIAMES por ejemplo 1 de octubre 01OCT, 2 de marzo 02MAR, 23 de agosto 23AUG
5. Si hay rangos de fechas, usar el primer día del rango como `departureDate` y el último como `returnDate`.
7. Fechas en formato DDMMM (día con dos dígitos y mes en tres letras mayúsculas en inglés).

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

Convertí expresiones de tiempo como las siguientes en fechas específicas con formato `DDMMM` (por ejemplo, 01NOV, 07NOV). Usá siempre el rango más probable y asumí que el usuario habla del año actual.
en departureDate: DDMMM de la ida y en returnDate: DDMMM de la vuelta
Ejemplos:
- "la primera semana de noviembre" → departureDate: '01NOV', returnDate: '07NOV'
- "los primeros días de enero" → departureDate: '01JAN', returnDate: '05JAN'
- "últimos días de febrero" → departureDate: '25FEB', returnDate: '29FEB'
- "a mitad de mes" → departureDate: '14MAR', returnDate: '20MAR'
- "principios de octubre" → departureDate: '01OCT', returnDate: '07OCT'
- "la segunda quincena de diciembre" → departureDate: '16DEC', returnDate: '31DEC'
- "me quiero ir el finde largo del 25 de mayo" → departureDate: '24MAY', returnDate: '27MAY'


---

ejemplo de resultado, llenar con los datos obtenidos:
{{
  "origenVuelta": "IATA", 
  "departureDate": "DDMMM",
  "returnDate": "DDMMM",
  "adults": 0,
  "children": 0,
  "infants": 0,
}}
no te confundas los nombres de los atributos, tene mucho cuidado

---
Mensaje del cliente:
\"\"\"{mensaje}\"\"\"

"""

    response = ollama.chat(
        model="llama3.2",
        messages=[{"role": "user", "content": prompt}],
            options={
        "temperature": 0
    }
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

    # **Acá retornás el JSON para usarlo afuera**
    return resultado_json


def completar_objetos_finales(vuelo):
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
    res_final =completar_objetos_finales(res)
    print(json.dumps(res_final, indent=2, ensure_ascii=False))
