import { Operation } from "../Operation.js";

class Goto extends Operation {
   static async exec(target) {
      try {
         this.socket.emit('operation_log', { info: `Going to ${target}...` });
         await this.page.goto(target, { waitUntil: 'networkidle0' });
         await this.injectAllFunctions();
      } catch (error) {
         this.socket.emit('operation_log', { error: 'Impossible to perform "goto" operation' });
         console.error(error);
      }
   }
}