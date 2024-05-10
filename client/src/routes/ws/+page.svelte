<script>
   import Button from '$lib/components/ui/button/button.svelte';
import { io } from 'socket.io-client';
   const PORT = 8080;
   const socket = io(`ws://localhost:${ PORT }`);

   // Custom method for emitting and logging a payload
   socket._emit = (event, details) => {
      socket.emit(event, details);

      for (let [msgType, msg] of Object.entries(details)) {
         console.log(`[${ msgType.toUpperCase() }] ${ msg }`);
      }
   }

   socket.on('chat_message', (msg) => {
      console.log('[chat_message]', msg);
      socket._emit('chat_message', { msg: 'From client' });
   })

   socket.on('operation_log', (details) => {
      for (let [msgType, msg] of Object.entries(details)) {
         console.log(`[${ msgType.toUpperCase() }] ${ msg }`);
      }
   })

   socket.on('payload', (details) => {
      console.log('[PAYLOAD]', details);
   })
</script>

<Button on:click={() => socket.emit('run_flow')} class="text-base">
   <i class="ti ti-player-play mr-2"></i>
   Run
</Button>