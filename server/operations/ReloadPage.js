import { Operation } from "../Operation.js";

export class ReloadPage extends Operation {
   static async exec () {
      try {
         await this.curr_page.reload({ waitUntil: ['networkidle0', "domcontentloaded"] });
      } catch (err) {
         console.error(err);
         this.emitMessage('error', `Unable to reload the page`);
      }
   }
}
