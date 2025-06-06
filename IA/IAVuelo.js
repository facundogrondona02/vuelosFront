// funciones/generarJson.ts
export async function generarJsonDesdeMensaje(mensaje) {
  const prompt = `
Sos una IA que recibe mensajes de clientes y devuelve un objeto JSON con los datos del vuelo.

El objeto JSON debe tener esta estructura:

{
  "originDeparture": "BUE",
  "originReturn": "PUJ",
  "departureDate": "15AUG",
  "returnDate": "30AUG",
  "adults": 2,
  "children": 1,
  "infants": 0,
  "currency": "USD",
  "stops": null,
  "checkedBaggage": null,
  "horarioIdaEntre": null,
  "horarioIdaHasta": null,
  "horarioVueltaEntre": null,
  "horarioVueltaHasta": null,
  "maxDuracionIda": null,
  "maxDuracionVuelta": null
}

Si no encontrás un dato en el mensaje, ponelo como **null**, no inventes.

Mensaje del cliente:
"""${mensaje}"""

Respondé solo con el objeto JSON.
  `;

  // Acá lo podés conectar con el modelo que quieras. Ejemplo usando Groq (llama3.5) o OpenAI:
  const res = await fetch("https://api.groq.com/openai/v1/chat/completions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${process.env.GROQ_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: "llama3-8b-8192",
      messages: [{ role: "user", content: prompt }],
      temperature: 0.3,
    }),
  });

  const json = await res.json();
  const respuesta = json.choices?.[0]?.message?.content;
  console.log("respuesta IA: ", respuesta)
  return JSON.parse(respuesta); // convierte texto → objeto
}
