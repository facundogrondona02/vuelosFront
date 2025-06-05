import { Page } from 'playwright';

export async function hacerLogin(page: Page, mail: string, password: string): Promise<void> {
  console.log("🔐 Iniciando login con reintentos...");

  const maxRetries = 5;

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    console.log(`🔄 Intento de login #${attempt}`);
    await page.goto('https://aereos.sudameria.com/Login', { waitUntil: "domcontentloaded" });

    try {
      const usuarioInput = page.getByRole('textbox', { name: 'Usuario' });
      const contrasenaInput = page.getByRole('textbox', { name: 'Contraseña' });

      // Esperar hasta que ambos inputs estén visibles (hasta 5 segundos)
      await Promise.all([
        usuarioInput.waitFor({ state: 'visible', timeout: 5000 }),
        contrasenaInput.waitFor({ state: 'visible', timeout: 5000 }),
      ]);

      await usuarioInput.fill(mail);
      await contrasenaInput.fill(password);
      await page.getByRole('button', { name: 'Entrar' }).click();

      // Esperar que el login redirija fuera de la página /Login
      await page.waitForURL(url => !url.pathname.includes('/Login'), { timeout: 10000 });

      console.log("✅ Login exitoso");
      return;
    } catch (error) {
      if (error instanceof Error) {
        console.warn(`⚠️ Falló el intento #${attempt}. Recargando...`, error.message);
      } else {
        console.warn(`⚠️ Falló el intento #${attempt}. Recargando...`, error);
      }
      if (attempt < maxRetries) {
        await page.waitForTimeout(1000); // Espera breve antes de recargar
      } else {
        throw new Error("❌ No se pudo completar el login después de varios intentos.");
      }
    }
  }
}
