import { Browser } from "./Browser.js";

export class Operation extends Browser {
   /** @type {import('./SocketHandler.js').SocketHandler} */
   static socketHandler;

   /**
    * Emits a message to the client. The message could be an error, a warning or just an information about the operation.
    * @param {'error' | 'info' | 'warning'} message_type 
    * @param {string} message
    */
   static emitMessage (message_type, message) {
      if (this.socketHandler) {
         this.socketHandler.emitEvent('operation_message', { [message_type]: message });
      }
   }

   static emitOutput (payload) {
      this.socketHandler.emitEvent('output', { data: payload });
   }
}