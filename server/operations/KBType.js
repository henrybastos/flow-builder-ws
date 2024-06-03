import { Operation } from "../Operation.js";

export class KBType extends Operation {
   /**
    * Types in a value into an input or an element with the contenteditable attribute.
    * @param {{ value: string, attribute: 'value' | 'innerText' }} config 
    */
   static async exec ({ value, attribute = 'value' }) {
      try {
         this.emitMessage('info', `Typing ${ value } on element ${ target } ...`);
         /** @type {Array<import('puppeteer').ElementHandle>} */
         const [element] = await this.getElements(target);

         element.focus();
         element[attribute] = value;
         element.dispatchEvent(new Event('input', { bubbles: true }));
         element.dispatchEvent(new Event('change', { bubbles: true }));
      } catch (err) {
         console.error(err);
         this.emitMessage('error', `[FAILED] Typing ${ value } on element ${ target } ...`);
      }
   }
}
