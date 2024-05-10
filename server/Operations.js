import { Browser } from "./Browser.js";

export class Operations {
   static socket = null;

   static setSocket (socket) {
      this.socket = socket;
   }

   static async goto (target) {
      try {
         this.socket._emit('operation_log', { info: `Going to ${ target }...` });
         await Browser.page.goto(target, { waitUntil: 'networkidle0' });
      } catch (error) {
         this.socket._emit('operation_log', { error: 'Impossible to perform "goto" operation' });
         console.error(error);
      }
   }

   static async eval (expression) {
      let expressionResult = await Browser.page.evaluate(expression);

      if (expressionResult) {
         this.socket._emit('payload', expressionResult);
      }
   }
}