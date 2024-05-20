<script>
   import { io } from 'socket.io-client';
   import Button from '$lib/components/ui/button/button.svelte';
   
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
               "target": "https://tabler.io/icons"
            },
            {
               "command": "eval_expression",
               "enabled": true,
               "expression": "x(`//h1`).innerText"
            },
            {
               "command": "eval_expression",
               "enabled": true,
               "expression": "x(`//h1`).innerText.split('')"
            },
            {
               "command": "eval_expression",
               "enabled": true,
               "expression": "x(`//h1`).innerText.split('').length"
            },
            {
               "command": "eval_expression",
               "enabled": true,
               "expression": "(() => ({ name: 'Henry' }))()"
            },
            {
               "command": "eval_expression",
               "enabled": true,
               "expression": "{ name: 'Henry' }"
            },
            {
               "command": "click",
               "enabled": true,
               "target": "(//sa[@href=\"https://github.com/tabler/tabler-icons\"])[1]"
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

   socket.on('operation_message', (details) => {
      for (let [message_type, message] of Object.entries(details)) {
         console.log(`[${ message_type.toUpperCase() }] ${ message }`);
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