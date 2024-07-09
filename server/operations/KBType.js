import { Operation } from "../Operation.js";

export class KBType extends Operation {
   /**
    * Types in a value into an input or an element with the contenteditable attribute.
    * @param {{ value: string, attribute: 'value' | 'innerText' }} config 
    */
   static async exec ({ target, value, attribute = 'value' }) {
      try {
         this.emitMessage('info', `Typing ${ value } on element ${ target } ...`);
         // /** @type {Array<import('puppeteer').ElementHandle>} */
         // const [element] = await this.getElements(target);
         
         await this.page.evaluate((target, value, attribute) => {
            const input = x(target);

            if (input) {
               input.focus();
               input[attribute] = value;
               input.dispatchEvent(new Event('input', { bubbles: true }));
               input.dispatchEvent(new Event('change', { bubbles: true }));
            } else {
               console.log('No element found');
            }
         }, target, value, attribute)
      } catch (err) {
         console.error(err);
         this.emitMessage('error', `[FAILED] Typing ${ value } on element ${ target } ...`);
      }
   }
}
