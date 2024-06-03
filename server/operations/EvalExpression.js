import { Operation } from "../Operation.js";

export class EvalExpression extends Operation {
    static async exec({ expression }) {
        try {
            this.emitMessage('info', `Evaluating expression: ${ expression }`);
            const expressionOutput = await this.page.evaluate(expression);

            if (expressionOutput) {
                this.emitMessage('info', `Expression result: ${ JSON.stringify(expressionOutput).substring(0, 100) }`);
                return await this.handleOutput(expressionOutput);
            }
        } catch (error) {
           this.emitMessage('error', `An error occurred when evaluating expression ${ expression }`);
           console.error(error);
        }
    }
}