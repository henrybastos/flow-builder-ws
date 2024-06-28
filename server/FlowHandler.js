import { Browser } from "./Browser.js";
import { Click } from "./operations/Click.js";
import { CloseBrowser } from "./operations/CloseBrowser.js";
import { EvalExpression } from "./operations/EvalExpression.js";
import { Goto } from "./operations/Goto.js";
import { RunFlow } from "./operations/RunFlow.js";
import { RunFlowForEach } from "./operations/RunFlowForEach.js";
import { WaitForDOM } from "./operations/WaitForDOM.js";

export class FlowHandler {
   static output;
   static payload;
   static globalPayload;
   static config = {
      persistentData: false
   };

   static setSocket (socket) {
      this.socket = socket;
   }

   static setEnv(payload) {
      // this.emitEvent('operation_message', { info: 'Setting global env...' })
      for (let [o_key, o_value] of Object.entries(payload)) {
         this.payload.env[o_key] = o_value;
      }
   }

   static operations = {
      goto: Goto,
      eval_expression: EvalExpression,
      click: Click,
      run_flow: RunFlow,
      run_flow_for_each: RunFlowForEach,
      wait_for_dom: WaitForDOM,
      close_browser: CloseBrowser
   };

   /**
    * Emits an event to the client side.
    * @param {'output' | 'operation_message' | 'signal'} event 
    * @param {any} [details] 
    */
   static emitEvent (event, details) {
      this.socket.emit(event, details);
      
      if (details) {   
         for (let [msgType, msg] of Object.entries(details)) {
            console.log(`[SOCKET::${ msgType.toUpperCase() }] ${ msg }`);
         }
      }
   }

   static async execFlows ({ payload }) {
      this.payload = structuredClone(payload);
      console.log(this.payload);

      this.globalPayload = structuredClone(payload);
      await Browser.launch();

      this.emitEvent('main_flow_start', { flow: 'Executing Main Flow...' });
      
      if (this.config.persistentData) {
         this.output = {
            ...this.output,
            ...(await this.operations.run_flow.exec())
         };
      } else {
         this.output = await this.operations.run_flow.exec();
      }

      this.emitEvent('output', { flows_output: this.output });
      this.emitEvent('operation_message', { flow: 'Processing done!' });
      
      if (this.payload.config.close_browser_on_finish) {
         await this.operations.close_browser.exec();
      }

      this.emitEvent('main_flow_end');
   }
}