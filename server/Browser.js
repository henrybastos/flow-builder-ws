import puppeteer from "puppeteer-extra";
import pluginStealth from 'puppeteer-extra-plugin-stealth';
import { FlowHandler } from "./FlowHandler.js";

export class Browser {
   /** @type {import('puppeteer').Browser} */
   static browser;
   /** @type {import('puppeteer').Page} */
   static page;
   /** @type {Array<import('puppeteer').Page>} */
   static pages;
   static isBrowserOpen = false;

   static async launch({ headless } = { headless: false }) {
      try {
         console.log('[BROWSER] Launching browser...');

         if (!this.isBrowserOpen) {
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
               this.isBrowserOpen = false;
               console.log('[BROWSER] Browser closed');
            });
   
            this.page.setViewport({ width: 1366, height: 720 });
      
            await this.page.setExtraHTTPHeaders({ 
               'user-agent': 'Mozilla/5.0 (Windows NT 10.0; WOW64) AppleWebKit/537.36 (KHTML, like Gecko)  Safari/537.36', 
               'accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8', 
               'accept-encoding': 'gzip, deflate, br', 
               'accept-language': 'pt-BR,en-US,en;q=0.9,en;q=0.8'
            });

            await this.injectAllFunctions();

            this.isBrowserOpen = true;
            console.log(`[BROWSER] New browser launched at ${ this.webSocketEndpoint }`);
         }
      } catch (err) {
         console.error(err);
         console.warn('[BROWSER] Closing browser...');
         this.browser.close();
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
   }

   static async getElements (target) {
      const element = await this.waitForElement({ target });
      
      if (element) {
         return await this.page.$$(`xpath/${ target }`);
      }
   }

   static async waitForElement ({ target, timeout = 15000 }) {
      try {
         FlowHandler.emitEvent('operation_message', { info: `Waiting for selector: ${ target } ...` });
         return await this.page.waitForSelector(`xpath/${ target }`, { timeout });
      } catch (err) {
         FlowHandler.emitEvent('operation_message', { error: `[FAILED] Wait for selector: ${ target }` });
      }
   }

   static async injectAllFunctions () {
      await this.injectFunctionX();
      await this.injectFunctionXXX();
      await this.injectFunctionEnv();
      await this.injectFunctionAsyncEval();
   }

   static async injectFunctionX () {
      console.log('[BROWSER] Injecting function x...');
      await this.page.evaluate(() => x = (xpath) => document.evaluate(xpath, document, null, XPathResult.FIRST_ORDERED_NODE_TYPE, null).singleNodeValue)
   }

   static async injectFunctionXXX () {
      console.log('[BROWSER] Injecting function xxx...');
      await this.page.evaluate(() => xxx = (path, root) => {
         const nodesSnapshot = document.evaluate(path, root || document, null, XPathResult.ORDERED_NODE_SNAPSHOT_TYPE, null);
         let elements = [];
         for (let i = 0; i < nodesSnapshot.snapshotLength; i++) {
             elements.push(nodesSnapshot.snapshotItem(i));
         }
         return elements;
     })
   }

   static async injectFunctionEnv () {
      console.log('[BROWSER] Injecting function env...');
      await this.page.evaluate(() => env = (obj) => obj)
   }
   
   static async injectFunctionAsyncEval () {
      console.log('[BROWSER] Injecting function async eval...');
      await this.page.evaluate(() => async_eval = async (cb, options) => {
         let attempt = 0;
         let evalReturnValue = 'No response from async_eval Promise.';
         console.log(cb, options);

         options.maxAttempts = options?.maxAttempts || 15;
         options.interval = options?.interval || 1000;
     
         if (cb) {
             evalReturnValue = await new Promise((resolve) => {
                 const timeInterval = setInterval(() => {
                     attempt++;
                     console.log(`Attempt ${attempt} of ${options.maxAttempts}`);
     
                     const cbResolve = (value) => {
                         clearInterval(timeInterval);
                         resolve(value);
                     }
     
                     try {
                         const cbError = cb(cbResolve);
     
                         if (attempt >= options.maxAttempts) {
                             clearInterval(timeInterval);
                             if (cbError) { 
                                 resolve(cbError); 
                             } else {
                                 resolve(options?.exception || { '@private:warning': `Max attempts reached: ${options.maxAttempts}` });
                             }
                         }
                     } catch (err) {
                         resolve({ error: err });
                         clearInterval(timeInterval);
                     }
                 }, options.interval)
             });
         } else {
             evalReturnValue = 'No callback function found to execute on the async_eval function.'
         }
     
         console.log('[ASYNC EVAL RESULT]', evalReturnValue);
         return evalReturnValue;
     })
   }
}