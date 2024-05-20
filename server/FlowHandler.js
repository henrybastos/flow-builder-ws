import { Browser } from "./Browser.js";
import { Click } from "./operations/Click.js";
import { EvalExpression } from "./operations/EvalExpression.js";
import { Goto } from "./operations/Goto.js";

export class FlowHandler {
   static setSocket (socket) {
      this.socket = socket;
   }

   static operations = {
      goto: Goto,
      eval_expression: EvalExpression,
      click: Click
   };

   /**
    * Emits an event to the client side.
    * @param {'output' | 'operation_message'} event 
    * @param {any} [details] 
    */
   static emitEvent (event, details) {
      this.socket.emit(event, details);

      for (let [msgType, msg] of Object.entries(details)) {
         console.log(`[SOCKET::${ msgType.toUpperCase() }] ${ msg }`);
      }
   }

   static async runFlow ({ payload, env }) {
      console.log(payload, env);
   }

   static async execFlows ({ payload }) {
      let flowsOutput = [];
      await Browser.launch();

      for (let op of payload.flows.main_flow) {
         const output = await this.operations[op.command].exec(op);
         flowsOutput.push(output);
      }
      
      this.emitEvent('output', { flows_output: flowsOutput });
   }
}