import { Operation } from "../Operation.js";

export class EvalExpression extends Operation {
    static async exec({ expression }) {
        try {
            this.emitMessage('info', `Evaluating expression: ${ expression }`);
            const expressionOutput = await this.page.evaluate(expression);

            if (expressionOutput) {
                // if (typeof expressionOutput === 'object') {
                //     const hasWarning = Object.keys(expressionOutput).some(v => v.match(/warning/gi));
                //     const hasError = Object.keys(expressionOutput).some(v => v.match(/error/gi));

                //     if (hasWarning) {
                //         this.emitMessage('error', `[EVAL EXECPTION]: ${ expressionOutput.error }`);
                //     } 
                    
                //     if (hasError) {
                //         this.emitMessage('warning', `[EVAL WARNING]: ${ expressionOutput.warning }`);
                //     }
                // }

                this.emitMessage('info', `Expression result: ${ JSON.stringify(expressionOutput).substring(0, 100) }`);
                return this.handleOutput(expressionOutput);
            }
        
            // if (expressionOutput) {
            //     for (let [key, value] of Object.entries(expressionOutput)) {
            //         const exposed = key.match(/@expose:/g);
            //         const query = key.match(/@query:/g);
        
            //         key = removeKeyFlags(key);
        
            //         if (exposed) {
            //             if (query) {
            //                 const fb = await this.curr_page.evaluate('_$fb');
            //                 fillUndefinedQueryMembers(key, fb);
            //                 eval(`fb.${key} = value`);
            //                 await this.curr_page.evaluate((fb) => {_$fb = fb}, fb);
            //             } else {
            //                 await this.curr_page.evaluate((result) => {_$fb = { ..._$fb, ...(result)}}, { [key]: value });
            //             }
                        
            //             await this.curr_page.evaluate(`console.log("[FLOW BUILDER] Exposed key: ${ key }")`);
            //         }
            //     }
                
            //     console.log('_$fb:', await this.curr_page.evaluate('_$fb'));
            //     // if (flags.exposed) {
            //         // Filters out the _expose_key
            //         // const filteredObject = Object.fromEntries(
            //         //     Object.entries(structuredClone(expressionOutput)).filter(([ key, value ]) => key !== '_expose_key' && { [key]: value })
            //         // );
        
            //         // Adding the _expose_key object, exposes the expressionOutput to the browser to be used with eval_expression;
            //         // if (!await this.curr_page.evaluate(`try { ${ expressionOutput?._expose_key } } catch (err) { false }`)) {
            //         // }
            //         // await this.curr_page.evaluate(`_$fb = { ..._$fb, ...(${ JSON.stringify(filteredObject)}) }`);
            //         // await this.curr_page.evaluate(`console.log("[FB_SYS] Exposed key: ${expressionOutput}")`);
            //     // }
        
            //     if (expressionOutput?.error) {
            //         this.logger.logEvent("operation_log", {
            //             message: `[EVAL EXECPTION]: ${ expressionOutput.error }`,
            //             status_message: "error"
            //         })
        
            //         return expressionOutput;
            //     } else if (expressionOutput?.warning) {
            //         this.logger.logEvent("operation_log", {
            //             message: `[EVAL WARNING]: ${ expressionOutput.warning }`,
            //             status_message: "warning"
            //         })
        
            //         return expressionOutput;
            //     } 
        
            //     let logMessage;
                
            //     if (typeof expressionOutput === 'object') {
            //         logMessage = JSON.stringify(expressionOutput);
            //     } else if (['string', 'number', 'boolean'].includes(typeof expressionOutput)) { 
            //         logMessage = expressionOutput.toString();
            //         expressionOutput = { [`AUTO_${ Math.random().toString().slice(3, 12) }`]: expressionOutput }
            //     } 
        
            //     this.logger.logEvent("operation_log", {
            //         message: `Expression result: ${ logMessage.toString().slice(0, 100) }`,
            //         status_message: "info"
            //     })
        
            //     console.log('[EVAL EXPRESSION] Result: ', expressionOutput);
            //     return expressionOutput;
            // }
        } catch (error) {
           this.emitMessage('error', `An error occurred when evaluating expression ${ expression }`);
           console.error(error);
        }
    }
}