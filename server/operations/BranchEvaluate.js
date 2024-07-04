import { Operation } from "../Operation.js";
import { FlowHandler } from "../FlowHandler.js";

export class BranchEvaluate extends Operation {
   static async exec ({ expression, success_flow, error_flow }) {
      try {
         this.emitMessage('info', `Evaluating ${ expression } ...`);
         const result = await this.page.evaluate(expression);
         
         if (!result || result?.error || result?.warning) { 
            console.log('RESULT FLOW', error_flow);
            FlowHandler.operations.run_flow.exec({ flow: error_flow });
         } else {
            console.log('RESULT FLOW', success_flow);
            FlowHandler.operations.run_flow.exec({ flow: success_flow });
         }
      } catch (err) {
         console.error(err);
         this.emitMessage('error', `[FAILED] Failed to evaluate expression ${ expression }`);
      }
   }
}