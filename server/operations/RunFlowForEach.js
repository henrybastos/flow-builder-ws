import { EnvParser } from "../EnvParser.js";
import { FlowHandler } from "../FlowHandler.js";
import { Operation } from "../Operation.js";

export class RunFlowForEach extends Operation {
   /**
    * @description Runs a flow
    * @param {string} flow - The flow to execute.
    */
   static async exec({ flow, env_scope }) {
      try {
         let flowsOutput = {};
         flowsOutput[env_scope] = structuredClone(FlowHandler.globalPayload.env[env_scope]) || [];
         
         for (let [index, env] of Object.entries(FlowHandler.globalPayload.env[env_scope])) {
            FlowHandler.payload.env = env;
            flowsOutput[env_scope][index] = structuredClone(FlowHandler.globalPayload.env[env_scope][index]) || {};

            this.emitMessage('flow', `Running flow ${ flow } (${ index + 1 }/${ FlowHandler.globalPayload.env[env_scope].length }) ...`);
   
            for (let op of FlowHandler.payload.flows[flow]) {
               if (op.enabled) {
                  const output = await FlowHandler.operations[op.command].exec(op);
                  
                  if (output) {
                     for (let envKey of Object.keys(output)) {
                        const envKeyFlags = EnvParser.parseFlags(envKey);
                        
                        if (!envKeyFlags.private) {
                           flowsOutput[env_scope][index][envKeyFlags.raw] = output[envKey];
                        }
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