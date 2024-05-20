import { Browser } from "./Browser.js";
import { FlowHandler } from "./FlowHandler.js";

export class Operation extends Browser {
   /**
    * Emits a message to the client. The message could be an error, a warning or just an information about the operation.
    * @param {'error' | 'info' | 'warning'} message_type 
    * @param {string} message
    */
   static emitMessage (message_type, message) {
      FlowHandler.emitEvent('operation_message', { [message_type]: message });
   }

   static emitOutput (output) {
      FlowHandler.emitEvent('output', output);
   }

   static handleOutput (output) {
      if (typeof output === 'object' && !Array.isArray(output)) {
         return output;
      } else {
         return { data: output };
      }
   }

   static async getElements (target, timeout = 15000) {
      const element = await this.waitForElement({ target, timeout });
      
      if (element) {
         return await this.page.$$(`xpath/${ target }`);
      }
  }

   static async waitForElement ({ target, timeout = 15000 }) {
      return await this.page.waitForSelector(`xpath/${ target }`, { timeout });
   }
}