import { Operation } from "../Operation.js";

export class CloseBrowser extends Operation {
   static async exec() {
      try {
         this.emitMessage('info', `Closing browser...`);
         await this.browser.close();
      } catch (error) {
         this.emitMessage('error', `Unable to close browser.`);
         console.error(error);
      }
   }
}