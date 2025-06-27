// // getContextConSesionValida.ts
// import { BrowserContext, chromium, Page } from "playwright";
// // import fs from "fs";
// import { hacerLogin } from "./hacerLogin";

// const sessionPath = 'session.json';

// interface GetContextParams {
//     mail: string;
//     password: string;
// }
// export async function getContextConSesionValida({ mail, password }: GetContextParams) {
//     const browser = await chromium.launch({ headless: false });
//     let context: BrowserContext;
//     let page: Page;

//     let sessionExists = false;
//     try {
//         await import('fs/promises').then(fs => fs.access(sessionPath)).then(() => sessionExists = true).catch(() => sessionExists = false);
//     } catch {
//         sessionExists = false;
//     }
//     if (sessionExists) {
//         context = await browser.newContext({ storageState: sessionPath });
//         page = await context.newPage();
//         await page.goto("https://aereos.sudameria.com/search", {
//             waitUntil: "networkidle"
//         });
//         const storageUser = await page.evaluate(() => {
//             try {
//                 const data = localStorage.getItem('user');
//                 if (!data) return null;
//                 const parsed = JSON.parse(data);
//                 return {
//                     logueado: parsed.IsUserSuccessfullyLogedIn,
//                     token: parsed.AccessToken,
//                     mail: parsed.Email
//                 };
//             } catch {
//                 return null;
//             }
//         });

//         const estaLogueado = storageUser?.logueado && !!storageUser?.token;
//         console.log("🔍 Estado de sesión:", estaLogueado, "| Mail detectado:", storageUser?.mail);
//         await page.waitForURL("**", { timeout: 10000 });

//         // let estaLogueado = page.url().includes('/search');
//         console.log(page.url(), " url")
//         console.log("esta logueado ??? ", estaLogueado)
//         // estaLogueado = false;
//         if (estaLogueado) {
//             // const mailGuardado = await obtenerMailDesdePagina(page);
//             // console.log("mail ", mail, " mail storage ", mailGuardado)
//             // if (mailGuardado == mail) {
//             console.log("📦 Sesión válida y mail coincide");
//             return { browser, context, page, estaLogueado };
//             // } else {
//             //     console.log(`⚠️ Mail en sesión (${mailGuardado}) no coincide con formulario (${mail}), haciendo relogin`);
//             //     await page.close();
//             //     await context.close();
//             // }
//         } else {
//             await page.close();
//             await context.close();
//             context = await browser.newContext();
//             page = await context.newPage();
//             await hacerLogin(page, mail, password);

//             return { browser, context, page, estaLogueado: true };

//         }
//     }
//     // // No hay sesión válida o falló validación previa
//     // context = await browser.newContext();
//     // page = await context.newPage();
//     // await hacerLogin(page, mail, password); // ⚠️ TE FALTA AWAIT ACÁ
//     // return { browser, context, page, estaLogueado: true };
//     // // No hay sesión válida o mail no coincide, hago login desde cero


// }



// // async function obtenerMailDesdePagina(page: Page): Promise<string | null> {
// //     // Ejemplo: buscar un elemento visible que contenga el mail, cambiar selector según web
// //     try {
// //         // Ejemplo si hay un texto que muestra el mail en alguna parte, ej:
// //         // <span id="user-email">mail@ejemplo.com</span>
// //         const elemento = page.locator('//*[@id="app"]/div[1]/div[1]/div[2]/div[2]');
// //         console.log(elemento, " elemento")
// //         return elemento ? await elemento.textContent() : null;

// //     } catch {
// //         return null;
// //     }
// // }
// // //b-mtopt1trny  b-mtopt1trny  <div b-mtopt1trny="">franco@melincue.tur.ar</div>   //*[@id="app"]/div[1]/div[1]/div[2]/div[2] //*[@id="app"]/div[1]/div[1]/div[2]/div[2]


// getContextConSesionValida.ts
import { BrowserContext, chromium, Page } from "playwright";
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

    let sessionExists = false;
    try {
        const fs = await import('fs/promises');
        await fs.access(sessionPath);
        sessionExists = true;
    } catch {
        sessionExists = false;
    }
    if (sessionExists) {
        context = await browser.newContext({ storageState: sessionPath });
        page = await context.newPage();

        await page.goto("https://aereos.sudameria.com/search", {
            waitUntil: "networkidle"
        });

        const storageUser = await page.evaluate(() => {
            try {
                const data = localStorage.getItem('user');
                if (!data) return null;
                const parsed = JSON.parse(data);
                return {
                    logueado: parsed.IsUserSuccessfullyLogedIn,
                    token: parsed.AccessToken,
                    mail: parsed.Email
                };
            } catch {
                return null;
            }
        });

        const estaLogueado = storageUser?.logueado && !!storageUser?.token;
        console.log("🔍 Estado de sesión:", estaLogueado, "| Mail detectado:", storageUser?.mail);

        if (estaLogueado) {
            console.log("📦 Sesión válida restaurada desde archivo.");
            return { browser, context, page, estaLogueado };
        } else {
            console.log("🔁 Sesión inválida. Rehaciendo login...");
            await page.close();
            await context.close();
        }
    }
    console.log("📦 No hay sesión válida, iniciando login desde cero... ACAAAAAAAAAAAAAAAAAAAA", mail, password);
    // No hay sesión válida, login desde cero
    context = await browser.newContext();
    page = await context.newPage();
    await hacerLogin(page, mail, password);

    return { browser, context, page, estaLogueado: true };
}
