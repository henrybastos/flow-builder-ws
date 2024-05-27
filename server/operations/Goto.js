import { Operation } from "../Operation.js";

export class Goto extends Operation {
   /**
    * @description Navigates to a URL.
    * @param {string} url - The URL to go to.
    */
   static async exec({ target }) {
      try {
         this.emitMessage('info', `Going to ${ target } ...`);
         await this.page.goto(target, { waitUntil: 'networkidle0' });
         await this.injectAllFunctions();
      } catch (error) {
         this.emitMessage('error', `Unable to navigate to URL ${ target }`);
         console.error(error);
      }
   }
}