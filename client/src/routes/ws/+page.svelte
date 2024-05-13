<script>
   import Button from '$lib/components/ui/button/button.svelte';
import { io } from 'socket.io-client';
   const PORT = 8080;
   const socket = io(`ws://localhost:${ PORT }`);
   const PAYLOAD = {
      "env": {
         "_$fb": {
            "pages": {
               "main_page": "main_page"
            }
         }
      },
      "flows": {
         "main_flow": [
            {
               "command": "goto",
               "enabled": true,
               "target": ""
            },
            {
               "command": "eval_expression",
               "enabled": true,
               "expression": "x('//a[@data-title=\"Copy webfont HTML\"]').innerText"
            }
         ]
      },
      "config": {
         "ws_endpoint": "",
         "close_browser_on_finish": false,
         "close_browser_on_cancel_request": false,
         "headless": false
      }
   }

   // Custom method for emitting and logging a payload
   socket._emit = (event, details) => {
      socket.emit(event, details);

      for (let [msgType, msg] of Object.entries(details)) {
         console.log(`[${ msgType.toUpperCase() }] ${ msg }`);
      }
   }

   socket.on('operation_log', (details) => {
      for (let [msgType, msg] of Object.entries(details)) {
         console.log(`[${ msgType.toUpperCase() }] ${ msg }`);
      }
   })

   socket.on('output', (data) => {
      console.log('[OUTPUT]', data);
   })
</script>

<div class="space-x-1">
   <Button on:click={() => socket.emit('exec_flows', { payload: PAYLOAD  })} class="text-base">
      <i class="ti ti-player-play mr-2"></i> Run
   </Button>

   <Button on:click={() => socket.emit('chat_message', { msg: 'Hello world!' })} variant="outline" class="text-base">
      <i class="ti ti-message mr-2"></i> Send message
   </Button>
</div>