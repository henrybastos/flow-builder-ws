import { EnvParser } from "../EnvParser.js";
import { FlowHandler } from "../FlowHandler.js";
import { Operation } from "../Operation.js";

export class RunFlow extends Operation {
   static flowsOutput = {};
   static deprecatedOperationsDictionary = {
      'wait_for_dom_render': 'wait_for_dom'
   }

   /**
    * @description Runs a flow
    * @param {string} flow - The flow to execute.
    */
   static async exec({ flow, env_scope } = { flow: 'main_flow', env_scope: null }) {
      try {
         if(env_scope) {
            this.flowsOutput[env_scope] = [];

            console.log('\t\tTEST', env_scope, Object.entries(FlowHandler.globalPayload.env[env_scope]));

            for (let [index, env] of Object.entries(FlowHandler.globalPayload.env[env_scope])) {
               FlowHandler.payload.env = env;
               this.flowsOutput[env_scope].push({});
               
               this.emitMessage('flow', `[RUNNING FLOW::${ flow }] (${ parseInt(index) + 1 }/${ FlowHandler.globalPayload.env[env_scope].length }) ...`);
               await this.exec_operation(flow, env_scope, index);
            }
         } else {
            this.emitMessage('flow', `[RUNNING FLOW::${ flow }] ...`);
            await this.exec_operation(flow);
         }

         return this.flowsOutput;
      } catch (error) {
         this.emitMessage('error', `Unable to run flow ${ flow }`);
         console.error(error);
      }
   }

   static async exec_operation(flow, env_scope, index) {
      for (let op of FlowHandler.payload.flows[flow]) {
         op = EnvParser.parsePlaceholders(op);

         if (op.enabled) {
            const operationName = this.deprecatedOperationsDictionary?.[op.command] || op.command;
            const operation = FlowHandler.operations[operationName];
            
            if (!operation?.exec) {
               this.emitMessage('error', `Unknow operation: ${ operationName }`);
               continue;
            }

            const opOutput = await operation.exec(op);
            
            if (opOutput) {
               process.stdout.write('[RUN_FLOW:OUTPUT]');
               console.dir(opOutput, { depth: null });

               for (let envKey of Object.keys(opOutput)) {
                  const envKeyFlags = EnvParser.parseFlags(envKey);
                  
                  if (!envKeyFlags.private) {
                     if (env_scope) {
                        // RUN FLOW FOR EACH
                        if (FlowHandler.output?.[env_scope]?.[index]) {
                           this.flowsOutput[env_scope][index] = FlowHandler.output?.[env_scope]?.[index];
                        }
                        this.flowsOutput[env_scope][index][envKeyFlags.raw] = opOutput[envKey];
                     } else {
                        // RUN FLOW
                        this.flowsOutput[envKeyFlags.raw] = opOutput[envKey];
                     }
                  }
               }
            }
         }
      }
   }
}