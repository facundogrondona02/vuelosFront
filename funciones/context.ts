// getContextConSesionValida.ts
import { BrowserContext, chromium, Page } from "playwright";
import fs from "fs";
import { hacerLogin } from "./hacerLogin";

const sessionPath = 'session.json';

interface GetContextParams {
    mail: string;
    password: string;
}
export async function getContextConSesionValida({ mail, password }: GetContextParams) {
    const browser = await chromium.launch({ headless: false });
    let context: BrowserContext;
    let page: Page;

    if (fs.existsSync(sessionPath)) {
        context = await browser.newContext({ storageState: sessionPath });
        page = await context.newPage();
        await page.goto("https://aereos.sudameria.com/search", {
            waitUntil: "networkidle"
        });

        await page.waitForURL("**", { timeout: 10000 });

        const estaLogueado = page.url().includes('/search');
        console.log(page.url(), " url")
        console.log("esta logueado ??? ", estaLogueado)
        if (estaLogueado) {
            const mailGuardado = await obtenerMailDesdePagina(page);
            console.log("mail ", mail, " mail storage ", mailGuardado)
            if (mailGuardado == mail) {
                console.log("📦 Sesión válida y mail coincide");
                return { browser, context, page, estaLogueado };
            } else {
                console.log(`⚠️ Mail en sesión (${mailGuardado}) no coincide con formulario (${mail}), haciendo relogin`);
                await page.close();
                await context.close();
            }
        } else {
            await page.close();
            await context.close();
        }
    }

    // No hay sesión válida o mail no coincide, hago login desde cero
    context = await browser.newContext();
    page = await context.newPage();
    await hacerLogin(page, mail, password);

    return { browser, context, page, estaLogueado: true };
}



async function obtenerMailDesdePagina(page: Page): Promise<string | null> {
    // Ejemplo: buscar un elemento visible que contenga el mail, cambiar selector según web
    try {
        // Ejemplo si hay un texto que muestra el mail en alguna parte, ej:
        // <span id="user-email">mail@ejemplo.com</span>
        const elemento = page.locator('//*[@id="app"]/div[1]/div[1]/div[2]/div[2]');
        console.log(elemento, " elemento")
        return elemento ? await elemento.textContent() : null;

    } catch {
        return null;
    }
}
//b-mtopt1trny  b-mtopt1trny  <div b-mtopt1trny="">franco@melincue.tur.ar</div>   //*[@id="app"]/div[1]/div[1]/div[2]/div[2] //*[@id="app"]/div[1]/div[1]/div[2]/div[2]