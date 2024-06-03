<script>
   import * as Dialog from "$lib/components/ui/dialog";
   import Button from "$lib/components/ui/button/button.svelte";
   import hljs from 'highlight.js/lib/core';
   import hljs_theme from 'highlight.js/styles/tokyo-night-dark.min.css';
   import json from 'highlight.js/lib/languages/json';
   import Clipboard from "$lib/components/Clipboard.svelte";

   export let isPanelOpen;
   export let isPayloadRunning;
   export let toast;
   export let socket;

   let outputCodeEl;
   let output = JSON.stringify({}, null ,3);

   socket.on('output', (details) => {
      output = JSON.stringify(details.flows_output, null ,3);
      console.log('OUTPUT', output);
   })

   hljs.registerLanguage('json', json);

   $: clipboardContent = output;

   $: {
      if (isPanelOpen && !outputCodeEl?.dataset?.highlighted && outputCodeEl) {
         hljs.highlightElement(outputCodeEl);
      }
   }
</script>

<Dialog.Root bind:open={isPanelOpen}>
   <Dialog.Content class="max-w-[60rem]">
      <Dialog.Header class="h-min">
         <Dialog.Title class="text-xl">Output</Dialog.Title>
         <Dialog.Description class="text-base">The payload output.</Dialog.Description>
      </Dialog.Header>
      {#key isPayloadRunning}
         <pre class="h-[50vh] rounded-lg overflow-x-auto w-[57rem] font-code p-5 mt-2" bind:this={outputCodeEl}>{output}</pre>
      {/key}

      <div class="flex flex-row-reverse gap-x-2">
         <Clipboard let:copyToClipboard bind:clipboardContent={clipboardContent} {toast}>
            <Button variant="default" on:click={copyToClipboard}>
               Copy output
            </Button>
         </Clipboard>
      </div>
   </Dialog.Content>
</Dialog.Root>