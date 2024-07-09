import { Operation } from "../Operation.js";

export class WaitForNavigation extends Operation {
   /**
    * @description Waits for the navigation to complete.
    */
   static async exec() {
      try {
         this.emitMessage('info', `Waiting for navigation...`);
         await this.page.waitForNavigation({ waitUntil: "networkidle0" });
      } catch (error) {
         this.emitMessage('error', `Unable to wait for navigation.`);
         console.error(error);
      }
   }
}