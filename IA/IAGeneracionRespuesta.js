import { spawn } from "child_process";

export async function generarRespuesta(mensaje) {
  return new Promise((resolve, reject) => {
    const process = spawn("python", ["./IA/IAGeneracionRespuesta.py"]);

    let result = "";
    process.stdout.on("data", (data) => {
      result += data.toString();
    });

    process.stderr.on("data", (data) => {
      console.error("Error en Python:", data.toString());
    });

    process.on("close", (code) => {
      if (code === 0) {
        try {
          // const json = JSON.parse(result); // Intentás parsear si esperás un JSON
          // resolve(json);
          resolve(result.trim()); // ✅ Ya que es texto plano (mensaje para WhatsApp)
        } catch (e) {
          console.warn("No se pudo parsear JSON, se devuelve texto plano.", e);
          resolve(result.trim()); // En caso de que no sea JSON válido
        }
      } else {
        reject("El script de Python falló");
      }
    });
    console.log("Mensaje que se envía a Python:", JSON.stringify(mensaje, null, 2));
    process.stdin.write(mensaje); // 🔥 Ya está en formato string válido
    process.stdin.end();
  });
}
