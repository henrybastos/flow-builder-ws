import { Operation } from "../Operation.js";

export class Goto extends Operation {
   /**
    * @description Navigates to a URL.
    * @param {string} url - The URL to go to.
    */
   static async exec(url) {
      try {
         this.emitMessage('info', `Going to ${ url }`);
         await this.page.goto(url, { waitUntil: 'networkidle0' });
         await this.injectAllFunctions();
      } catch (error) {
         this.emitMessage('error', 'Impossible to perform "goto" operation');
         console.error(error);
      }
   }
}