<script>
   import { onMount, setContext } from 'svelte';
   import { writable } from 'svelte/store';
   import { env } from "$env/dynamic/public"
   import { toast } from 'svelte-sonner';
   import { ServerHandler } from '$lib/ServerHandler';
   import { LOGGER, TAGS } from "$lib/LogStore";
   import * as Card from '$lib/components/ui/card';
   import AlertStopExecution from '$lib/components/compose/AlertStopExecution.svelte';
   import FlowDropdown from '$lib/components/v2/FlowDropdown.svelte';
   import FlowOperation from '$lib/components/v2/FlowOperation.svelte';
   import Ihi from '$lib/components/v2/Ihi.svelte';
   import PayloadLogsPanel from '$lib/components/compose/PayloadLogsPanel.svelte';
   import PayloadOutputPanel from '$lib/components/v2/PayloadOutputPanel.svelte';
   import {
      Draggy,
      DraggyItem,
      DraggyPlaceholder,
      DraggyVoid
   } from '$lib/components/draggy/index.js';
   import EditPayloadPanel from '$lib/components/v2/EditPayloadPanel.svelte';
   import AddOperationsPanel from '$lib/components/v2/AddOperationsPanel.svelte';
   import AddFlowPanel from '$lib/components/v2/AddFlowPanel.svelte';
   import { Skeleton } from '$lib/components/ui/skeleton';
   import Navbar from '$lib/components/v2/Navbar.svelte';
   import PresetsBrowserPanel from '$lib/components/v2/PresetsBrowser/PresetsBrowserPanel.svelte';
   import GenSchema from '$lib/modules/GenSchema.svelte';
   import { io } from 'socket.io-client';

   let isPayloadRunning = false;
   
   let isStopExecutionPanelOpen = false;
   let isLogsPanelOpen = false;
   let isOutputPanelOpen = false;
   let isEditPayloadPanelOpen = false;
   let isAddFlowPanelOpen = false;
   let isAddOperationPanelOpen = false;
   let isPresetsBrowserPanelOpen = false;
   let isGenSchemaPanelOpen = false;

   let footerMessage = writable('');
   let footerFixedMessage = writable('');
   let footerLoading = writable(false);
   let responseTextareaEl;
   let activeFlow;
   let draggyRoot;
   let hasLoadFinished = false;
   
   const PORT = 8080;
   const socket = io(`ws://localhost:${ PORT }`);

   const DEFAULT_PAYLOAD = {
      "env": {
         "_$fb": {
            "pages": {
               "main_page": "main_page"
            }
         }
      },
      "flows": {
         "main_flow": []
      },
      "config": {
         "ws_endpoint": "",
         "close_browser_on_finish": false,
         "close_browser_on_cancel_request": false,
         "headless": false
      }
   };
   let PAYLOAD = DEFAULT_PAYLOAD;

   ServerHandler.logger = LOGGER;
   ServerHandler.logger_tags = TAGS;

   function setFooterMessage (message, { loading, fixed } = { loading: null, fixed: false }) {
      if (loading != null) {
         $footerLoading = loading;
      }

      if (fixed) {
         $footerFixedMessage = `[${ new Date().toLocaleTimeString() }]: ${ message }`;
         $footerMessage = $footerFixedMessage;
      } else {
         $footerMessage = message;
      }
   }

   async function runCombinedPayload() {
      if (PAYLOAD.flows.main_flow.length === 0) {
         toast.error('The Main Flow cannot be empty.');
         return;
      }

      const sendPayloadPromise = new Promise(async (resolve, reject) => {
         isPayloadRunning = true;
         setFooterMessage('Executing payload...', { loading: true, fixed: true });

         // const fetchError = await ServerHandler.sendFlowPayload(PAYLOAD);
         
         // if (fetchError) { 
         //    console.log("ERROR", fetchError);
         //    isPayloadRunning = false;
         //    setFooterMessage('Payload failed to execute.', { fixed: true });
         //    reject(fetchError);
         // }
         
         isPayloadRunning = false;
         resolve();
      })

      toast.promise(sendPayloadPromise, {
         loading: 'Executando carga...',
         success: () => {
            isPayloadRunning = false;
            setFooterMessage('Payload executed.', { loading: false, fixed: true });
            return 'Carga executada'
         },
         error: 'Ocorreu um erro. Cheque os logs.'
      });
   }

   setContext('footerMessage', $footerMessage);
   setContext('footerFixedMessage', $footerFixedMessage);
   setContext('footerLoading', $footerLoading);

   function copyResponsePayloadToClipboard () {
      if (navigator.clipboard && window.isSecureContext) {
         window.navigator.clipboard.writeText(JSON.stringify(JSON.parse(ServerHandler.responsePayload), null ,3));
      } else {
         console.warn(`Context is not secure (${ window.isSecureContext }). Using select and copy.`);
         responseTextareaEl.select();
         document.execCommand('copy');
      }
      
      toast.success('Saída copiada para a Área de Transferência!');
   }

   async function stopPayloadRequest () {
      await ServerHandler.closeBrowser();
      // isPayloadRunning = false;
   }

   function openAddOperationPanel ({ detail }) {
      activeFlow = detail.flowID;
      isAddOperationPanelOpen = true;
   }

   function addOperation ({ detail }) {
      draggyRoot.addItem(activeFlow, detail.operation);
   }

   function addFlow ({ detail }) {
      draggyRoot.addList(detail.flowName);
   }

   function deleteFlow ({ detail }) {
      draggyRoot.deleteList(detail.flowID);
   }

   function savePayloadToLS () {
      localStorage.setItem('tempPayload', JSON.stringify(PAYLOAD));
      toast.success('Temp payload saved to Local Storage.');
   }

   function loadPayloadFromLS () {
      try {
         const LSPayload = JSON.parse(localStorage.getItem('tempPayload'));
         PAYLOAD = LSPayload;
         draggyRoot.setList(LSPayload.flows);
         console.log('Payload loaded from the Local Storage.');
         toast.info('Payload loaded from the Local Storage.');
      } catch (err) {
         toast.error('Failed to load the payload from the Local Storage.');
         console.log('Failed to load the payload from the Local Storage.');
         loadDefaultPayload();
         console.error(err);
      }
      hasLoadFinished = true;
   }

   function loadDefaultPayload () {
      PAYLOAD = DEFAULT_PAYLOAD;
      draggyRoot.setList(DEFAULT_PAYLOAD.flows);
      console.log('New blank payload loaded');
      toast.info('New blank payload loaded');
   }

   function loadBlankPayload () {
      loadDefaultPayload();
   }

   function loadPayloadPreset ({ detail }) {
      const presetPayload = JSON.parse(detail.preset.payload);
      PAYLOAD = presetPayload;
      draggyRoot.setList(presetPayload.flows);
      console.log(`Preset "${ detail.preset.name }" loaded`);
      toast.info(`Preset "${ detail.preset.name }" loaded`);
   }

   function saveEditedPayload ({ detail }) {
      draggyRoot.setList(detail.payload.flows);
      PAYLOAD = detail.payload;
   }

   /** [WEB SOCKET START] **/
   // Custom method for emitting and logging a payload
   socket._emit = (event, details) => {
      socket.emit(event, details);

      for (let [msgType, msg] of Object.entries(details)) {
         console.log(`[${ msgType.toUpperCase() }] ${ msg }`);
      }
   }
   
   socket.on("disconnect", () => {
      console.log('[WS] Disconnected');
   });

   socket.on('output', (data) => {
      console.log('[OUTPUT]', data);
   })

   function executeFlows () {
      if (PAYLOAD.flows.main_flow.length === 0) {
         toast.error('The Main Flow cannot be empty.');
         return;
      }

      const sendPayloadPromise = new Promise(async (resolve, reject) => {
         isPayloadRunning = true;
         setFooterMessage('Executing payload...', { loading: true, fixed: true });

         socket.connect();
         console.log(`[WS] Connected at ${ socket.id }`);
         socket.emit('exec_flows', { payload: PAYLOAD  });

         socket.on('main_flow_end', () => {
            isPayloadRunning = false;
            resolve();
         });
      })

      toast.promise(sendPayloadPromise, {
         loading: 'Executando carga...',
         success: () => {
            isPayloadRunning = false;
            setFooterMessage('Payload executed.', { loading: false, fixed: true });
            return 'Carga executada'
         },
         error: 'Ocorreu um erro. Cheque os logs.'
      });
   }
   /** [WEB SOCKET END] **/

   onMount(() => {
      // console.log('LS PAYLOAD', localStorage.getItem('tempPayload'), PAYLOAD);
      loadPayloadFromLS();

      Array.from(document.querySelectorAll('[data-footer-message]')).forEach(el => {
         el.addEventListener('mouseenter', () => {
            setFooterMessage(el.dataset.footerMessage);
         })

         el.addEventListener('mouseleave', () => {
            setFooterMessage($footerFixedMessage || '');
         })
      })

      document.addEventListener('keypress', (evt) => {
         if (evt.code === 'KeyI' && evt.ctrlKey) {
            const selectedElement = document.activeElement;
            const [ selStart, selEnd ] = [selectedElement.selectionStart, selectedElement.selectionEnd];

            selectedElement.value = [
               selectedElement.value.slice(0, selStart),
               'Ihi',
               selectedElement.value.slice(selEnd)
            ].join('');
         }
      })
   })
</script>

<svelte:head>
   <title>Flow Builder</title>
</svelte:head>

{#if env?.PUBLIC_ENABLE_MJ}
   <Ihi />
{/if}

<Navbar 
   bind:isPresetsBrowserPanelOpen 
   bind:isStopExecutionPanelOpen 
   bind:isLogsPanelOpen 
   bind:isOutputPanelOpen 
   bind:isEditPayloadPanelOpen 
   bind:isAddFlowPanelOpen
   bind:isPayloadRunning 
   bind:isGenSchemaPanelOpen 
   runCombinedPayload={executeFlows} {savePayloadToLS} {loadBlankPayload}
/>

<AlertStopExecution bind:isPanelOpen={isStopExecutionPanelOpen} stopAction={stopPayloadRequest} />
<PayloadOutputPanel {socket} {toast} bind:isPanelOpen={isOutputPanelOpen} bind:isPayloadRunning />
<PayloadLogsPanel {socket} {toast} bind:isPanelOpen={isLogsPanelOpen} bind:isPayloadRunning />
<EditPayloadPanel bind:payload={PAYLOAD} bind:isPanelOpen={isEditPayloadPanelOpen} on:updatepayload={saveEditedPayload} />
<AddOperationsPanel bind:isPanelOpen={isAddOperationPanelOpen} on:newoperation={addOperation} bind:flowID={activeFlow} bind:flow={PAYLOAD.flows}/>
<AddFlowPanel bind:isPanelOpen={isAddFlowPanelOpen} on:addflow={addFlow} />
<PresetsBrowserPanel {toast} bind:payload={PAYLOAD} on:loadpreset={loadPayloadPreset} bind:isPanelOpen={isPresetsBrowserPanelOpen} />
<GenSchema bind:isPanelOpen={isGenSchemaPanelOpen} {toast} bind:payload={PAYLOAD} />

<main class="flex flex-col w-screen overflow-hidden items-center">
   {#if PAYLOAD} 
      <Draggy class="flex flex-row mt-11 p-6 justify-center" let:list bind:list={PAYLOAD.flows} bind:this={draggyRoot}>
            <Card.Root class="w-[60rem] h-min">
               <Card.Header class="flex flex-row justify-between items-center">
                  <Card.Title class="text-3xl">Flow Builder</Card.Title>
               </Card.Header>

               <Card.Content class="flex flex-col w-full space-y-6 justify-center">
                  {#each list as flow (flow.context_id)}
                     <Card.Root class="w-full h-min">
                        <Card.Header class="flex flex-row justify-between items-center border-b-2 border-b-blue-500">
                           <Card.Title class="text-2xl capitalize text-blue-500">{ flow.context_id.replaceAll('_', ' ') }</Card.Title>
                           <FlowDropdown 
                              on:addoperation={openAddOperationPanel} 
                              on:deleteflow={deleteFlow}
                              bind:flow={PAYLOAD.flows[flow.context_id]} 
                              bind:flowID={flow.context_id} 
                           />
                        </Card.Header>
                        
                        <Card.Content class="p-0 divide-y divide-neutral-800 border-y border-neutral-800">
                           {#if hasLoadFinished}
                              {#each flow.list as operation (operation.id)}
                                 <DraggyItem item={operation}>
                                    <FlowOperation flows={PAYLOAD.flows} {operation} />
                                 </DraggyItem>
                              {:else}
                                 <DraggyVoid class="text-neutral-600" contextID={flow.context_id}>
                                    <div class="m-4 p-4 border-2 border-neutral-800 border-dashed rounded-lg">
                                       <h6>No operations</h6>
                                    </div>
                                 </DraggyVoid>
                              {/each}
                           {:else}
                              <Skeleton class="h-[15rem] m-6 rounded-xl" />
                           {/if}
                        </Card.Content>
                        
                        <Card.Footer class="p-3">
                           <p class="text-neutral-600 w-full text-center">{ flow.list.length } operations</p>
                        </Card.Footer>
                     </Card.Root>
                  {/each}
               </Card.Content>
            </Card.Root>

            <DraggyPlaceholder offset={{ x: -25 }}>
                  <div class="flex flex-row p-3 w-[30rem] border-2 border-neutral-700 rounded-lg">
                     <i data-draggy-grab class="ti ti-grip-vertical mr-3 cursor-grab"></i>
                     <h6>Operation</h6>
                  </div>
            </DraggyPlaceholder>
      </Draggy>
   {/if}

   <footer class="inline-flex items-center fixed w-full bottom-0 bg-neutral-900 h-8 p-1">
      {#if $footerLoading}
         <i class="ti ti-loader-2 text-sm text-center w-fit h-fit flex mx-2 animate-spin text-neutral-500"></i>
      {/if}

      <p class="text-sm font-code w-full text-neutral-400">
         { $footerMessage }
      </p>
   </footer>
</main>