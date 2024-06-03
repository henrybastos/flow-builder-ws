import { Operation } from "../Operation.js";

export class WaitForDOM extends Operation {
   static async exec ({ timeout = 15000 }) {
      try {
         this.emitMessage('info', `Waiting for DOM (${ timeout / 1000 } secs) ...`);
         const checkDurationMsecs = 1000;
         const maxChecks = timeout / checkDurationMsecs;
         let lastHTMLSize = 0;
         let checkCounts = 1;
         let countStableSizeIterations = 0;
         const minStableSizeIterations = 3;

         while (checkCounts++ <= maxChecks) {
            let html = await this.page.content();
            let currentHTMLSize = html.length;

            let bodyHTMLSize = await this.page.evaluate(() => document.body.innerHTML.length);

            console.log('[DOM LOADING] Last: ', lastHTMLSize, ' Curr: ', currentHTMLSize, " Body HTML size: ", bodyHTMLSize);

            if (lastHTMLSize != 0 && currentHTMLSize == lastHTMLSize)
                  countStableSizeIterations++;
            else
                  countStableSizeIterations = 0; //reset the counter

            if (countStableSizeIterations >= minStableSizeIterations) {
                  console.log("[DOM LOADING] Page rendered fully..");
                  break;
            }

            lastHTMLSize = currentHTMLSize;
            await this.page.waitForTimeout(checkDurationMsecs);
         }
      } catch (err) {
         console.error(err);
         this.emitMessage('error', `[FAILED] Waiting for DOM`);
      }
   }
}
