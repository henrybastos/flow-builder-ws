import { FlowHandler } from "./FlowHandler.js";

export class EnvParser {
   static env;

   static parsePlaceholders (output) {
      let outputBuffer = {};

      for (let [o_key, o_value] of Object.entries(output)) {
         outputBuffer[this.parseString(o_key)] = this.parseString(o_value);
         console.log(`[ENV PARSER::STRING] ${outputBuffer[o_key]}`);
         FlowHandler.setEnv({ [this.removePrefixes(o_key)]: outputBuffer[o_key] });
      }
      
      return outputBuffer;
   }

   static parseString (str) {
      if (str.match(/(?<={{)[^{}]+(?=}})/g)) {
         str = str.replace(/{{([^{}]+)}}/g, (_, cgs) => {
            const { raw, global, kebab, snake } = this.parseFlags(cgs);
            
            this.pickEnv(global ? 'global' : 'scoped');

            if (kebab) { return this.parseSlug(this.env[raw], '-') }
            if (snake) { return this.parseSlug(this.env[raw], '_') }
            return this.env[raw];
         });

         return this.parseString(str);
      } else {
         return str;
      }
   }

   static parseFlags (key) {
      if (key) {
         return {
            kebab: key.match(/@kebab/g) && true || false,
            snake: key.match(/@snake/g) && true || false,
            global: key.match(/@global/g) && true || false,
            private: key.match(/@private/g) && true || false,
            exposed: key.match(/@exposed/g) && true || false,
            raw: this.removePrefixes(key)
         }
      } else {
         return { error: '[ENV PARSER::EMPTY OUTPUT] No output given.' }
      }
   }

   static removePrefixes(key) {
      return key.split(':').splice(-1)[0].trim();
   }

   /**
    * Sets the Environment used in the strings interpolations.
    * @param {'global' | 'scoped'} type 
    */
   static pickEnv(type) {
      switch (type) {
         case 'global':
            this.env = FlowHandler.globalPayload.env;
            // console.log('PICK GLOBAL ENV', this.env);
            break;
         case 'scoped':
            this.env = FlowHandler.payload.env;
            // console.log('PICK SCOPED ENV', this.env);
            break;
      }
   }

   static parseSlug(str, separator) {
      return str.match(/[\w]+/g).join(separator).toLowerCase();
   }
}