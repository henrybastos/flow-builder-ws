import { EnvParser } from "../EnvParser.js";
import { FlowHandler } from "../FlowHandler.js";
import { Operation } from "../Operation.js";

export class RunFlow extends Operation {
   /**
    * @description Runs a flow
    * @param {string} flow - The flow to execute.
    */
   static async exec({ flow } = { flow: 'main_flow' }) {
      try {
         let flowsOutput = {};

         this.emitMessage('flow', `Running flow ${ flow } ...`);

         for (let op of FlowHandler.payload.flows[flow]) {
            if (op.enabled) {
               const output = await FlowHandler.operations[op.command].exec(op);
               
               if (output) {
                  for (let envKey of Object.keys(output)) {
                     const envKeyFlags = EnvParser.parseFlags(envKey);
                     
                     if (!envKeyFlags.private) {
                        flowsOutput[envKeyFlags.raw] = output[envKey];
                     }
                  }
               }
            }
         }

         console.log('FLOWS OUTPUT', flowsOutput);
         return flowsOutput;
      } catch (error) {
         this.emitMessage('error', `Unable to run flow ${ flow }`);
         console.error(error);
      }
   }
}