import { Operation } from "../Operation.js";

export class Click extends Operation {
   static async exec ({ target }) {
      /** @type {Array<import('puppeteer').ElementHandle>} */
      const [element] = await this.getElements(target);

      if (element) {
         try {
            await element.click();
         } catch (err) {
            console.error(err);
            this.emitMessage('error', `Unable to click on element ${ target }`);
         }
      } else {
         this.emitMessage('error', `Element ${ target } not found.`);
      }
   }
}
