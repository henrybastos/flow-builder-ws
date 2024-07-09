<script>
   import * as Command from "$lib/components/ui/command";
   import { onMount } from "svelte";
   let open = false;
   export let socket;
   export let toast;

   let ITEMS = [
      {
         heading: "Tools",
         items: [
            {
               icon: "toilet-paper",
               label: "flow_output - Get last output",
               description: 'Gets the output from the last flow executed.',
               dev: true,
               action: () => emitCommandEvent('dev_commands.output.get_last_output')
            },
            {
               icon: "hammer",
               label: "test - Custom command items",
               description: 'Injects custom command from the server into the CmdK.',
               dev: true,
               action: () => emitCommandEvent('dev_commands.test.custom_command_items')
            }
         ],
      },
   ];

   function outputGetLastOutput() {
      socket.on('dev_commands.output.set_last_output', (data) => {
         console.log(data);

         if (data?.__command_items) {
            // console.log(ITEMS.find(grp => grp.heading == 'From Server') == undefined && 'Can add');

            ITEMS = [
               ...ITEMS,
               {
                  heading: 'From Server',
                  items: [
                     ...data?.__command_items.map(_item => ({
                        ..._item,
                        action: () => emitCommandEvent(_item.event)
                     }))
                  ]
               }
            ]
         }
         console.log('New command items', ITEMS);
      })

      
   }

   function emitCommandEvent(event) {
      if (socket) {
         socket.emit(event);
         console.log(`[DEV_COMMANDS::EMIT_EVENT::${ event }]`);
         toast.info(`[DEV_COMMANDS::EMIT_EVENT::${ event }]`);
         open = false;
      } else {
         console.error('Socket undefined');
      }
   }

   onMount(() => {function handleKeydown(e) {
         if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
            e.preventDefault();
            open = !open;
         }
      }

      document.addEventListener("keydown", handleKeydown);
      return () => {
         document.removeEventListener("keydown", handleKeydown);
      };
   });
</script>

<Command.Dialog bind:open>
   <Command.Input placeholder="Type a command or search..." />
   <Command.List>
      <Command.Empty>No results found.</Command.Empty>

      {#each ITEMS as group}
         <Command.Group heading={group?.heading || ''}>
            {#each group.items as item}   
               <Command.Item class="cursor-pointer" onSelect={item.action}>
                  <i data-dev={item?.dev} class="ti ti-{ item?.icon || 'box' } data-[dev=true]:text-amber-500 ml-2 mr-3 text-blue-500" />
                  <div>
                     <span data-dev={item?.dev} class="data-[dev=true]:text-amber-400">{ item.label }</span>
                     {#if item?.description}
                        <p class="text-muted-foreground">{ item?.description }</p>
                     {/if}
                  </div>
               </Command.Item>
            {/each}
         </Command.Group>
      {/each}

      <Command.Separator />
   </Command.List>
</Command.Dialog>
