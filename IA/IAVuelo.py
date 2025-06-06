import sys
import json
import ollama
import json
def generar_json_desde_mensaje(mensaje):
    with open('IA/ejemplos.json', 'r', encoding='utf-8') as f:
        template_json = json.load(f)

# Convertir el dict a string JSON con indentación para legibilidad
    template_str = json.dumps(template_json, indent=2, ensure_ascii=False)

    prompt = f"""
Sos una IA que recibe mensajes de clientes y devuelve un objeto JSON con los datos del vuelo.

Tu tarea es extraer parámetros de vuelo desde un mensaje en lenguaje natural en español y devolver un JSON con claves exactas en español, con esta estructura:

- mail: por ahora que el mail sea siempre  franco@melincue.tur.ar
- password: que sea siempre Francomase12!
- origenIda: código IATA del lugar de salida, que siempre sea "BUE"
- origenVuelta: código IATA del destino (ej: MIA, PUJ, MAD, etc.)
- departureDate: fecha estimada de salida en formato DDMMM (ej: 15AUG) o null si no se puede deducir
- returnDate: fecha estimada de regreso en formato DDMMM o null
- adults: cantidad de adultos (mayores de 12 años) o null
- children: cantidad de niños (3 a 11 años) o null
- infants: cantidad de bebés menores de 3 años o null
- currency: 'USD', 'ARS', 'EUR' o null. Por defecto 'USD' si no se indica otra moneda
- stops: 'Directo', '1 escala', '2 escalas', etc. o null
- checkedBaggage: true, false o null
- horarioIdaEntre: hora mínima para salida en formato HH:mm o null
- horarioIdaHasta: hora máxima para salida en formato HH:mm o null
- horarioVueltaEntre: hora mínima para regreso en formato HH:mm o null
# - horarioVueltaHasta: hora máxima para regreso en formato HH:mm o null
- maxDuracionIda: duración máxima del vuelo de ida en formato HH:mm o null
- maxDuracionVuelta: duración máxima del vuelo de vuelta en formato HH:mm o null

---


---
**Reglas y detalles importantes:**
1. lugar de salida (origenIda), siempre poner "BUE" (Buenos Aires) por defecto./* IMPORTANTE */
   -El origen siempre debe ser Buenos Aires, representado por el código IATA EZE o AEP según el aeropuerto. No uses ningún otro código como BCE o inventado.
2. El destino (`origenVuelta`) debe ser un código IATA válido extraído del mensaje./* IMPORTANTE */
3. Niños: entre 3 y 11 años inclusive. Bebés (infants): menores de 3 años.
4. Interpretar expresiones de tiempo como:/* IMPORTANTE */
   - "primera semana de octubre" → 01OCT al 07OCT
   - "segunda semana de julio" → 08JUL al 14JUL
   - "la primera de septiembre" → igual a primera semana
   - "la segunda de noviembre" → igual a segunda semana
   - "primera quincena de enero" → 01JAN al 15JAN
   - "segunda quincena de febrero" → 16FEB al 29FEB
   - "a fin de mes" → salida: 25, regreso: 30 del mismo mes
   - "mitad de septiembre" → salida: 10SEP, regreso: 20SEP
5. Si hay rangos de fechas, usar el primer día del rango como `departureDate` y el último como `returnDate`.
6. Si algún dato no se menciona, dejarlo como null.
7. Fechas en formato DDMMM (día con dos dígitos y mes en tres letras mayúsculas en inglés).
8. Para escalas:
   - "directo" → "Directo"
   - "una escala" o "1 escala" → "1 escala"
   - "dos escalas" o "2 escalas" → "2 escalas"
   - Si no se menciona → null
9. Equipaje:
   - "equipaje en bodega" o "con valija" → `checkedBaggage: true`
   - "solo equipaje de mano" → `checkedBaggage: false`
   - no se menciona → null
10. Nunca deben ser iguales `origenIda` y `origenVuelta` a menos que el mensaje sea claro al respecto.
11. Siempre `currency: "USD"`
12. Si el destino figura en la lista de configuraciones predefinidas, completar automáticamente:
    - `maxDuracionIda`
    - `maxDuracionVuelta`
    - `horarioIdaEntre`
    - `horarioIdaHasta`
    - `horarioVueltaEntre`
    - `horarioVueltaHasta`
    - `stops` (si no fue definido explícitamente)

---

**Ejemplos de salida esperada:**

Ejemplo 1:
Mensaje: "Quiero volar de Buenos Aires a Punta Cana la primera quincena de agosto. Somos 2 adultos, un niño de 5 años y un bebé de 1 año. Prefiero directo y con valija."

```json
{{
  "mail": franco@melincue.tur.ar
  "password": Francomase12!,
  "origenIda": "BUE",
  "origenVuelta": "PUJ",
  "departureDate": "01AUG",
  "returnDate": "15AUG",
  "adults": 2,
  "children": 1,
  "infants": 1,
  "currency": "USD",
  "stops": "Directo",
  "checkedBaggage": true,
  "horarioIdaEntre": "07:00",
  "horarioIdaHasta": "13:00",
  "horarioVueltaEntre": "15:00",
  "horarioVueltaHasta": "21:00",
  "maxDuracionIda": "19:00",
  "maxDuracionVuelta": "20:00"
}}
Ejemplo 2:
Mensaje: "Salgo de Córdoba a Madrid el 10 de septiembre, regreso el 20. Viajo solo adulto, sin equipaje."
Respuesta JSON:
{{
  "mail": franco@melincue.tur.ar,
  "password": Francomase12!,
  "origenIda": "BUE",
  "origenVuelta": "MAD",
  "departureDate": "10SEP",
  "returnDate": "20SEP",
  "adults": 1,
  "children": 0,
  "infants": 0,
  "currency": "USD",
  "stops": null,
  "checkedBaggage": false,
  "horarioIdaEntre": null,
  "horarioIdaHasta": null,
  "horarioVueltaEntre": null,
  "horarioVueltaHasta": null,
  "maxDuracionIda": null,
  "maxDuracionVuelta": null
}}

---


Si detectás que el mensaje del usuario menciona un destino específico (por ejemplo: Rio de Janeiro, Madrid, Cancún, etc.) —ya sea porque dice cosas como "quiero viajar a", "me quiero ir a", "nos vamos a", "viajo a", "vamos a", "quiero ir a", "me voy a", "planeo ir a", "destino", o frases similares— verificá si existe una configuración predefinida asociada a ese destino.

En caso de que exista, completá automáticamente los siguientes campos en el objeto de salida con los valores correspondientes a ese destino:
Si origenVuelta es Buenos Aires tomar los siguientes datos de la configuración de BUE
Si origenVuelta es Rio de Janeiro tomar los siguientes datos de la configuración de GIG
Si origenVuelta es São Paulo tomar los siguientes datos de la configuración de GRU
Si origenVuelta es Cordoba tomar los siguientes datos de la configuración de COR
Si origenVuelta es Madrid tomar los siguientes datos de la configuración de MAD
Si origenVuelta es Punta Cana tomar los siguientes datos de la configuración de PUJ
Si origenVuelta es Miami tomar los siguientes datos de la configuración de MIA
Si origenVuelta es Cancún tomar los siguientes datos de la configuración de CUN
Si origenVuelta es New York tomar los siguientes datos de la configuración de NYC
Si origenVuelta es Barcelona tomar los siguientes datos de la configuración de BCN
Si origenVuelta es Londres tomar los siguientes datos de la configuración de LON

Currency siempre es "USD"
- `maxDuracionIda`: duración máxima permitida para el vuelo de ida (formato HH:MM)
- `maxDuracionVuelta`: duración máxima permitida para el vuelo de vuelta (formato HH:MM)
- `horarioIdaEntre`: hora mínima de salida del vuelo de ida (formato HH:MM)
- `horarioIdaHasta`: hora máxima de salida del vuelo de ida (formato HH:MM)
- `horarioVueltaEntre`: hora mínima de salida del vuelo de vuelta (formato HH:MM)
- `horarioVueltaHasta`: hora máxima de salida del vuelo de vuelta (formato HH:MM)
- `stops`: cantidad máxima de escalas permitidas ("Directo", "1 escala", "2 escalas", etc.)

{{
"ciudades": {{
  "Buenos Aires": "BUE",
  "Rio de Janeiro": "GIG",
  "São Paulo": "GRU",
  "Cordoba": "COR",
  "Madrid": "MAD",
  "Punta Cana": "PUJ",
  "Miami": "MIA",
  "Cancún": "CUN",
  "New York": "NYC",
  "Barcelona": "BCN",
  "Londres": "LON"
}},
  "configuraciones": {{ //IMPORTANTEEEEE//
    "GIG": {{
      "maxDuracionIda": "26:00",
      "maxDuracionVuelta": "26:00",
      "horarioIdaEntre": "12:00",
      "horarioIdaHasta": "19:00",
      "horarioVueltaEntre": "17:00",
      "horarioVueltaHasta": "23:59",
      "stops": "1 escala"
    }},
    "MAD": {{
      "maxDuracionIda": "18:00",
      "maxDuracionVuelta": "19:00",
      "horarioIdaEntre": "13:00",
      "horarioIdaHasta": "18:00",
      "horarioVueltaEntre": "10:00",
      "horarioVueltaHasta": "22:00",
      "stops": "Directo"
    }},
    "CUN": {{
      "maxDuracionIda": "22:00",
      "maxDuracionVuelta": "23:00",
      "horarioIdaEntre": "06:00",
      "horarioIdaHasta": "12:00",
      "horarioVueltaEntre": "14:00",
      "horarioVueltaHasta": "20:00",
      "stops": "1 escala"
    }},
    "MIA":{{
      "maxDuracionIda": "25:00",
      "maxDuracionVuelta": "25:00",
      "horarioIdaEntre": "00:11",
      "horarioIdaHasta": "23:57",
      "horarioVueltaEntre": "00:30",
      "horarioVueltaHasta": "23:57",
      "stops": "1 escala"}}
    ,
    "BCN": {{
      "maxDuracionIda": "30:00",
      "maxDuracionVuelta": "40:00",
      "horarioIdaEntre": "07:00",
      "horarioIdaHasta": "23:00",
      "horarioVueltaEntre": "09:00",
      "horarioVueltaHasta": "23:00",
      "stops": "1 escala"
    }},
    "PUJ": {{
      "maxDuracionIda": "19:00",
      "maxDuracionVuelta": "20:00",
      "horarioIdaEntre": "07:00",
      "horarioIdaHasta": "13:00",
      "horarioVueltaEntre": "15:00",
      "horarioVueltaHasta": "21:00",
      "stops": "1 escala"
    }},
    "NYC": {{
      "maxDuracionIda": "14:00",
      "maxDuracionVuelta": "14:00",
      "horarioIdaEntre": "10:00",
      "horarioIdaHasta": "17:00",
      "horarioVueltaEntre": "13:00",
      "horarioVueltaHasta": "22:00",
      "stops": "Directo"
    }},
    "LON": {{
      "maxDuracionIda": "20:00",
      "maxDuracionVuelta": "20:00",
      "horarioIdaEntre": "18:00",
      "horarioIdaHasta": "23:59",
      "horarioVueltaEntre": "07:00",
      "horarioVueltaHasta": "15:00",
      "stops": "2 escalas"
    }}
  }}
}}


resultado esperado:
{{
  "mail": franco@melincue.tur.ar,
  "password": Francomase12!,
  "origenIda": "BUE",
  "origenVuelta": "MAD",
  "departureDate": "10SEP",
  "returnDate": "20SEP",
  "adults": 1,
  "children": 0,
  "infants": 0,
  "currency": "USD",
  "checkedBaggage": true,
  "maxDuracionIda": "18:00",
  "maxDuracionVuelta": "19:00",
  "horarioIdaEntre": "13:00",
  "horarioIdaHasta": "18:00",
  "horarioVueltaEntre": "10:00",
  "horarioVueltaHasta": "22:00",
  "stops": "Directo"
}}



---
Mensaje del cliente:
\"\"\"{mensaje}\"\"\"

Respondé SOLO con el objeto JSON, sin explicaciones ni texto adicional.
y al campo origenIda Siempre que tenga el valos "BUE"
"""

    response = ollama.chat(
        model="llama3.2",
        messages=[{"role": "user", "content": prompt}],
            options={
        "temperature": 0
    }
    )

    # Mostrar directamente la respuesta del modelo
    print(response["message"]["content"])

if __name__ == "__main__":
    if len(sys.argv) < 2:
        print("Error: falta el mensaje como argumento.")
        sys.exit(1)

    mensaje = sys.argv[1]
    generar_json_desde_mensaje(mensaje)
