import { Browser } from "./Browser.js";
import { EnvParser } from "./EnvParser.js";
import { FlowHandler } from "./FlowHandler.js";

export class Operation extends Browser {
   /**
    * Emits a message to the client. The message could be an error, a warning or just an information about the operation.
    * @param {'error' | 'info' | 'warning' | 'flow'} message_type 
    * @param {string} message
    */
   static emitMessage (message_type, message) {
      FlowHandler.emitEvent('operation_message', { [message_type]: message });
   }

   static async handleOutput (output) {
      for (let [key, value] of Object.entries(output)) {
         const { raw, exposed } = EnvParser.parseFlags(key);

         if (exposed) {
            console.log(`[OPERATION] Exposing key: ${ raw }`);
            
            await this.page.evaluate((_key, _value) => {
               try {
                  return __fb = { ...__fb, [_key]: _value }
               } catch (err) {
                  console.warn('[FB] Declaring and defining __fb ...');
                  return __fb = { [_key]: _value }
               };
            }, raw, value);
         }
      }

      if (Array.isArray(output)) {
         return EnvParser.parsePlaceholders({ 
            [`data_${Math.random().toString().substring(2, 8)}`]: output, 
            _metadata: {
               length: Object.keys(output).length
            } 
         });
      } else {
         return EnvParser.parsePlaceholders(output);
      }
   }
}