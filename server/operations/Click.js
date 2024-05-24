import { Operation } from "../Operation.js";

export class Click extends Operation {
   static async exec ({ target }) {
      try {
         this.emitMessage('info', `Clicking on element ${ target } ...`);
         /** @type {Array<import('puppeteer').ElementHandle>} */
         const [element] = await this.getElements(target);

         if (element) {
            await element.click();
         } else {
            this.emitMessage('error', `Element ${ target } not found.`);
         }
      } catch (err) {
         console.error(err);
         this.emitMessage('error', `[FAILED] Click on element ${ target }`);
      }
   }
}
