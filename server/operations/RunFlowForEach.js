import { EnvParser } from "../EnvParser.js";
import { FlowHandler } from "../FlowHandler.js";
import { Operation } from "../Operation.js";
import { fillGaps } from "../utils.js";

export class RunFlowForEach extends Operation {
   /**
    * @description Runs a flow
    * @param {string} flow - The flow to execute.
    */
   static async exec({ flow, env_scope }) {
      try {
         let flowsOutput = {};
         flowsOutput[env_scope] = [];
         // console.log('FlowHandler.output', );
         // flowsOutput[env_scope] = structuredClone(FlowHandler.globalPayload.env[env_scope]) || [];
         
         for (let [index, env] of Object.entries(FlowHandler.globalPayload.env[env_scope])) {
            FlowHandler.payload.env = env;
            flowsOutput[env_scope].push({});

            this.emitMessage('flow', `[RUNNING FLOW::${ flow }] (${ parseInt(index) + 1 }/${ FlowHandler.globalPayload.env[env_scope].length }) ...`);
   
            for (let op of FlowHandler.payload.flows[flow]) {
               if (op.enabled) {
                  const opOutput = await FlowHandler.operations[op.command].exec(op);
                  
                  if (opOutput) {
                     for (let envKey of Object.keys(opOutput)) {
                        const envKeyFlags = EnvParser.parseFlags(envKey);
                        if (!envKeyFlags.private) {
                           if (FlowHandler.output?.[env_scope]?.[index]) {
                              console.log('OLD OUTPUT', FlowHandler.output?.[env_scope]?.[index]);
                              flowsOutput[env_scope][index] = FlowHandler.output?.[env_scope]?.[index];
                           }
                           flowsOutput[env_scope][index][envKeyFlags.raw] = opOutput[envKey];
                        }
                     }
                  }
               }
            }
         }

         return flowsOutput;
      } catch (error) {
         this.emitMessage('error', `Unable to run flow ${ flow }`);
         console.error(error);
      }
   }
}