import puppeteer from "puppeteer-extra";
import pluginStealth from 'puppeteer-extra-plugin-stealth';

export class Browser {
   static browser;
   static pages;
   static page;

   static async launch({ headless } = { headless: false }) {
      if (this.browser === undefined) {
         puppeteer.use(pluginStealth());

         this.browser = await puppeteer.launch({
            dumpio: true,
            headless,
            ...(process.env.PUPPETEER_EXECUTABLE_PATH && { executablePath: process.env.PUPPETEER_EXECUTABLE_PATH }),
            args: [
               `--window-size=${1366},${768}`,
               // '--disable-features=IsolateOrigins,site-per-process'
            ]
         });

         this.webSocketEndpoint = this.browser.wsEndpoint();
         
         this.page = Array.from(await this.browser.pages())[0];
         this.page.on('close', () => {
            this.browser.close();
            console.log('Browser closed');
         });

         console.log(`[BROWSER] New browser launched at ${this.webSocketEndpoint}`);
      }
   }

   static async connect(wsEnpoint) {
      console.log(`[BROWSER] Attempting to connect at ${wsEnpoint}...`);
      this.browser = await puppeteer.connect({ browserWSEndpoint: wsEnpoint });
      console.log(`[BROWSER] Browser connected at ${wsEnpoint}`);
   }

   static async newPage() {
      console.log(this.browser);
      if (this.browser === undefined) {
         console.error('[BROWSER] No browser instance found.');
         return;
      }

      this.page = await this.browser.newPage();

      // page.setViewport({ width: 1366, height: 720 });

      // // FIXME
      // page.on('dialog', async (dialog) => {
      //    // Required to reload the page on "Create Jivo PT" flow preset.
      //    if (page.url().match(/app.jivosite.com/gi)) { await dialog.accept() }
      // });

      // page.on('close', () => {
      //    console.log('Page is closed');
      // });

      // await page.setExtraHTTPHeaders({ 
      //    'user-agent': 'Mozilla/5.0 (Windows NT 10.0; WOW64) AppleWebKit/537.36 (KHTML, like Gecko)  Safari/537.36', 
      //    'accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8', 
      //    'accept-encoding': 'gzip, deflate, br', 
      //    'accept-language': 'pt-BR,en-US,en;q=0.9,en;q=0.8'
      // }); 
   }
}