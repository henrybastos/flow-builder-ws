import { Operation } from "../Operation.js";

export class WaitSeconds extends Operation {
   /**
    * @description Wait X amount of milisseconds.
    * @param {string} time - The amount of time to wait for.
    */
   static async exec({ time }) {
      try {
         this.emitMessage('info', `Waiting ${ time } milisseconds...`);
         await new Promise(res => setTimeout(res, time));
      } catch (error) {
         this.emitMessage('error', `Unable to wait ${ target } milisseconds.`);
         console.error(error);
      }
   }
}