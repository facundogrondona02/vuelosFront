import { Page } from "@playwright/test";


export async function hacerLogin(page: Page, mail: string, password: string): Promise<void> {
  console.log("🔐 Iniciando login...");

  await page.goto('https://aereos.sudameria.com/Login', { waitUntil: "domcontentloaded" });

  const usuarioInput = page.getByRole('textbox', { name: 'Usuario' });
  const contrasenaInput = page.getByRole('textbox', { name: 'Contraseña' });

  await Promise.all([
    usuarioInput.waitFor({ state: 'visible', timeout: 20000 }),
    contrasenaInput.waitFor({ state: 'visible', timeout: 20000 }),
  ]);

  await usuarioInput.fill(mail);
  await contrasenaInput.fill(password);
  await page.getByRole('button', { name: 'Entrar' }).click();

  // Esperar que redirija a /search confirmando login exitoso
  await page.waitForURL('**/search', { timeout: 10000 });

  // Guardar sesión
  await page.context().storageState({ path: 'session.json' });

  console.log("✅ Login exitoso y estado guardado");
}
