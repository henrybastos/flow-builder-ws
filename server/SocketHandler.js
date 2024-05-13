import { Browser } from "./Browser.js";
import { Operation } from "./Operation.js";

export class SocketHandler {
   constructor (socket) {
      /** @type {import('socket.io').Socket} */
      this.socket = socket;
   }

   /**
    * Emits an event to the client side with a payload.
    * @param {'output' | 'operation_log'} event 
    * @param {any} details 
    */
   emitEvent (event, details) {
      this.socket.emit(event, { data: details });

      for (let [msgType, msg] of Object.entries(details)) {
         console.log(`[SOCKET::${ msgType.toUpperCase() }] ${ msg }`);
      }
   }

   onChatMessage ({ msg }) {
      console.log('[SOCKET::chat_message]', msg);
   }

   async execFlows ({ payload }) {
      // console.log(payload);

      for (let operations of payload.flows.main_flow) {
         console.log(operations);
      }

      // await Browser.launch();
      // await Operation.goto('https://tabler.io/icons/icon/player-play');
      // const iconWebFont = await Operation.eval(`x('//a[@data-title="Copy webfont HTML"]').innerText`);
      
      // this.emitEvent('output', {
      //    icon_web_font: iconWebFont
      // });
   }

   async runFlow ({ payload, env }) {
      console.log(payload, env);
   }
}