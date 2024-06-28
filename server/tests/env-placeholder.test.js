import test from 'ava';
import io from 'socket.io-client';

const PORT = 8080;
const socket = io(`ws://localhost:${ PORT }`);

test('env-placeholder-01', t => {
   const payload = {
      "env": {
         "_$fb": {
            "pages": {
               "main_page": "main_page"
            }
         },
         "best_game": "Rocket League",
         "users": [
            {
               "test": "Valheim",
               "favorite_game": "{{ test }}",
               "name": "Henry Bastos"
            },
            {
               "favorite_game": "Koikatsu",
               "name": "Heitor"
            }
         ]
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
               "command": "run_flow_for_each",
               "enabled": true,
               "flow": "user_flow",
               "env_scope": "users"
            }
         ],
         "user_flow": [
            {
               "command": "eval_expression",
               "enabled": false,
               "expression": "env({ '{{ @kebab:name }}-caption': 'My name is {{ name }} and my favorite game is {{ favorite_game }}!' })"
            },
            {
               "command": "eval_expression",
               "enabled": false,
               "expression": "env({ '{{ @exposed:@global:@snake:best_game }}_caption': 'My name is {{ name }} and everybody likes {{ @global:best_game }}!' })"
            },
            {
               "command": "eval_expression",
               "enabled": true,
               "expression": "env({ '@exposed:rapper': 'Drake', menace: 'Kendrick Lamar' })"
            }
         ]
      },
      "config": {
         "ws_endpoint": "",
         "close_browser_on_finish": true,
         "close_browser_on_cancel_request": false,
         "headless": false
      }
   };

   return new Promise((resolve, reject) => {
      socket.on('operation_message', (details) => {
         for (let [message_type, message] of Object.entries(details)) {
            console.log(`[${ message_type.toUpperCase() }] ${ message }`);
         }
      });
      
      socket.on("disconnect", () => {
         console.log('[WS] Disconnected');
      });
   
      socket.on('output', (data) => {
         // console.dir(('[OUTPUT]', data), { depth: null });
         process.stdout.write("[OUTPUT] "); console.dir(data, { depth: null })
         resolve(data);
      })

      socket.emit('exec_flows', { payload });
   }).then(data => {
      // t.deepEqual(data, { flows_output: { data: '5325 pixel-perfect icons for web design' } });
      t.pass();
      socket.close();
   })
})