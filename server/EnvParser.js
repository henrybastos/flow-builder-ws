import { FlowHandler } from "./FlowHandler.js";

export class EnvParser {
   static parse (output) {
      let outputBuffer = {};

      for (let [o_key, o_value] of Object.entries(output)) {
         console.log('o_value', o_value, );
         
         for (let placeholder of o_value.match(/(?<={{)[^{}]+(?=}})/g) || []) {
            // console.log('[ENV PARSER]', placeholder, FlowHandler.payload.env[placeholder.trim()]);
            outputBuffer[o_key] = FlowHandler.payload.env[placeholder.trim()];
         }
      }

      return outputBuffer;
   }
}